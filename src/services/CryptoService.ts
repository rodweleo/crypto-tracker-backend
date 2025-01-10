
import { Coin } from "../models/CoinModel";
import cache from "../utils/nodeCache";

const axios = require('axios');
const SupabaseClient = require("../utils/supabaseClient")
const Logger = require('../utils/logger')

// Cache for 5 minutes

async function fetchAndStoreCryptoPrices() {

    const url = "https://api.coingecko.com/api/v3/coins/markets";
    const cacheKey = "LIVE_CRYPTO_PRICES";

    // Check if data exists in cache
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
        console.log('Serving live crypto prices data from cache...');
        return cachedData;
    }

    Logger.info("Fetching crypto prices from " + url + "...")

    const response = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
        params: { vs_currency: 'usd', order: 'market_cap_desc', per_page: 10, page: 1 }
    });

    const prices = response.data;


    for (const crypto of prices) {

        const coinDetails = {
            name: crypto.name,
            image: crypto.image,
            symbol: crypto.symbol,
            current_price: crypto.current_price,
            timestamp: crypto.last_updated
        };

        Logger.info("Saving coin details to database: " + JSON.stringify(coinDetails));

        const { data, error } = await SupabaseClient
            .from('gochapaa_cryptocurrency_prices')
            .upsert(coinDetails);

        if(data === null){

            Logger.info(coinDetails.name + " details saved successfully!")

        }

        if(error){
            Logger.error("Error saving coin information: " + error.message)
        }
    }

    const { data } = await SupabaseClient.from("gochapaa_cryptocurrency_prices").select("*");

    // Store in cache
    cache.set(cacheKey, data);


    return data as Coin[];
}


async function fetchStoredLiveCryptoPrices(){

    Logger.info("Retrieving stored coin prices...")

    const cacheKey = "LIVE_CRYPTO_PRICES";

    // Check if data exists in cache
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
        Logger.info('Serving live crypto prices data from cache...');
        return cachedData;
    }

    const { data, error } = await SupabaseClient.from("gochapaa_cryptocurrency_prices").select("*");

    if(error){

        Logger.error("Error fetching stored live cryptocurrency coin prices: " + error.message)
        return []

    }


    if(data.length === 0 ){

        //try fetching the data from the coin gecko api
        const results = await fetchAndStoreCryptoPrices();

        return results;

    }

    return data as Coin[]
}

module.exports = { fetchAndStoreCryptoPrices, fetchStoredLiveCryptoPrices };
