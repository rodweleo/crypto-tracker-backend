import { Coin } from "../models/CoinModel";
import cache from "../utils/nodeCache";
import axios from "axios";
import logger from "../utils/logger";
import RedisService from "./RedisService";
import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();
const redisService = new RedisService();
const CACHE_KEY = "LIVE_CRYPTO_PRICES";
const TTL_SECONDS = 300;

// Cache for 5 minutes
class CryptoService {
  constructor() {
    // cache.setDefaultExpirationTime(300); // 5 minutes
  }

  /**
   * Fetches live cryptocurrency prices from CoinGecko and stores them in the database.
   * If the data is already cached, it returns the cached data.
   * @returns {Promise<Coin[]>} - An array of Coin objects with live prices.
   */
  async fetchAndStoreCryptoPrices(): Promise<Coin[]> {
    // Check Redis cache
    const redis = await redisService.connect();
    if (!redis) {
      logger.error("Failed to connect to Redis");
    }
    const cached = await redis.get(CACHE_KEY);
    if (cached) {
      logger.info("Serving crypto prices from Redis cache...");
      return JSON.parse(cached);
    }

    const url = "https://api.coingecko.com/api/v3/coins/markets";
    logger.info("Fetching crypto prices from " + url);

    const { data: prices } = await axios.get(url, {
      params: {
        vs_currency: "usd",
        order: "market_cap_desc",
        per_page: 10,
        page: 1,
      },
    });

    const result: any[] = [];

    for (const crypto of prices) {
      const coinDetails = {
        name: crypto.name,
        image: crypto.image,
        symbol: crypto.symbol,
        current_price: crypto.current_price,
        timestamp: new Date(crypto.last_updated),
      };

      try {
        // First, try to find the coin by symbol to get its id
        const existingCoin = await prisma.cryptoPrice.findFirst({
          where: { symbol: coinDetails.symbol },
        });

        const saved = await prisma.cryptoPrice.upsert({
          where: { id: existingCoin?.id ?? 0 }, // 0 will never match, so it will create if not found
          update: {
            current_price: coinDetails.current_price,
            timestamp: coinDetails.timestamp,
          },
          create: coinDetails,
        });

        logger.info(`Saved: ${saved.name}`);
        result.push(saved);
      } catch (error: any) {
        logger.error(`Failed to save ${coinDetails.name}: ${error.message}`);
      }
    }

    await redis.set(CACHE_KEY, JSON.stringify(result), { EX: TTL_SECONDS });

    return result;
  }

  async fetchStoredLiveCryptoPrices() {
    logger.info("Retrieving stored coin prices...");

    const cacheKey = "LIVE_CRYPTO_PRICES";

    // Check if data exists in cache
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      logger.info("Serving live crypto prices data from cache...");
      return cachedData;
    }

    try {
      const data = await this.fetchAndStoreCryptoPrices();

      return data;
    } catch (error: any) {
      logger.error(
        "Error fetching stored live cryptocurrency coin prices: " +
          error.message
      );
      return [];
    }
  }

  async buyCrypto(req: any) {
    const { user_id, coin_id, quantity, purchase_price } = req.body;

    if (quantity <= 0 || purchase_price <= 0) {
      logger.error("Quantity and purchase price must be positive");
      return null;
    }

    try {
      // Create a new transaction
      const transaction = await prisma.transaction.create({
        data: {
          user_id: user_id,
          crypto_id: coin_id,
          type: "BUY",
          quantity,
          price_per_unit: purchase_price,
        },
      });

      logger.info(
        `Transaction created successfully: ${JSON.stringify(transaction)}`
      );
      return transaction;
    } catch (error: any) {
      logger.error(`Error buying crypto: ${error.message}`);
      return null;
    }
  }
}

export default CryptoService;
