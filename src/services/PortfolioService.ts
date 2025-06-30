import { Request, Response } from "express";
import logger from "../utils/logger";
import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();
class PortfolioService {
  constructor() {}

  async getAllPortfolios() {
    try {
      const transactions = await prisma.transaction.findMany({
        include: {
          user: true,
          CryptoPrice: true,
        },
      });

      const userPortfolioMap = new Map<
        number,
        {
          user: {
            id: number;
            email: string;
            name?: string | null;
          };
          holdings: Map<
            number,
            {
              crypto: {
                id: number;
                symbol: string;
                name: string;
                iconUrl?: string | null;
              };
              totalQuantity: number;
              totalCost: number;
            }
          >;
        }
      >();

      for (const tx of transactions) {
        const multiplier = tx.type === "BUY" ? 1 : -1;

        if (!userPortfolioMap.has(tx.user_id)) {
          userPortfolioMap.set(tx.user_id, {
            user: {
              id: tx.user.id,
              email: tx.user.email,
              name: tx.user.name,
            },
            holdings: new Map(),
          });
        }

        const userEntry = userPortfolioMap.get(tx.user_id)!;

        if (!userEntry.holdings.has(tx.crypto_id)) {
          userEntry.holdings.set(tx.crypto_id, {
            crypto: {
              id: tx.CryptoPrice.id,
              symbol: tx.CryptoPrice.symbol,
              name: tx.CryptoPrice.name,
              iconUrl: tx.CryptoPrice.image,
            },
            totalQuantity: 0,
            totalCost: 0,
          });
        }

        const holding = userEntry.holdings.get(tx.crypto_id)!;
        holding.totalQuantity += tx.quantity * multiplier;

        if (tx.type === "BUY") {
          holding.totalCost += tx.quantity * tx.price_per_unit;
        }
      }

      // Flatten the map into a serializable array
      const portfolios = Array.from(userPortfolioMap.values()).map((entry) => {
        const holdings = Array.from(entry.holdings.values())
          .filter((h) => h.totalQuantity > 0)
          .map((h) => ({
            ...h.crypto,
            quantityHeld: h.totalQuantity,
            averageBuyPrice: h.totalCost / h.totalQuantity,
            totalPrice: h.totalCost,
          }));

        return {
          ...entry.user,
          holdings,
        };
      });

      return portfolios;
    } catch (e: any) {
      logger.error(`Error fetching portfolios: ${e.message}`);
      return [];
    }
  }

  async getUserPortfolio(req: Request, res: Response) {
    const { user_id } = req.params;

    try {
      const userPortfolio = await prisma.transaction.groupBy({
        by: ["crypto_id"],
        where: { user_id: Number(user_id) },
        _sum: {
          quantity: true,
        },
        _avg: {
          price_per_unit: true,
        },
      });

      return userPortfolio;
    } catch (e: any) {
      logger.error(`Error fetching user ${user_id}'s portfolio: ${e.message}`);
    }
  }

  //   async getUserPortfolioInsights(user_id: string) {
  //     const { data, error } = await SupabaseClient.from(
  //       "gochapaa_users_portfolios_insights"
  //     )
  //       .select("*")
  //       .eq("user_id", user_id);

  //     if (error) {
  //       Logger.error(
  //         `Error fetching user ${user_id}'s portfolio insights: ${error.message}`
  //       );
  //     }

  //     return data;
  //   }

  //   async deleteCoinFromUserPortfolio(portfolioId: string, coinName: string) {
  //     try {
  //       Logger.info(`Deleting coin ${coinName} from portfolio ${portfolioId}...`);

  //       const { data, error } = await SupabaseClient.from(
  //         "gochapaa_users_portfolio_coins"
  //       )
  //         .delete()
  //         .eq("portfolio_id", portfolioId)
  //         .eq("coin", coinName);

  //       if (error) {
  //         Logger.error(`Error deleting coin from portfolio: ${error.message}`);
  //       }

  //       //after deleting the coin from the portfolio, update the portfolio insights
  //       Logger.info(`Updating portfolio ${portfolioId}'s insights...`);
  //       const result = await this.updatePortfolioInsights(portfolioId);

  //       if (result.length === 0) {
  //         Logger.info(`Error updating portfolio ${portfolioId}'s insights...`);
  //       }

  //       return result;
  //     } catch (error: any) {
  //       Logger.error(`Error deleting coin from portfolio: ${error.message}`);
  //       return null;
  //     }
  //   }

  //   async updatePortfolioInsights(portfolioId: string) {
  //     // Fetch all coins in the portfolio
  //     const { data: portfolioCoins, error } = await SupabaseClient.from(
  //       "gochapaa_users_portfolio_coins"
  //     )
  //       .select("quantity, purchase_price, coin")
  //       .eq("portfolio_id", portfolioId);

  //     if (error) {
  //       Logger.error(
  //         `Error fetching portfolio ${portfolioId}'s coins: ${error.message}`
  //       );
  //     }

  //     // Fetch current prices of cryptocurrencies
  //     const cryptoNames = portfolioCoins.map((t: PortfolioCoinModel) => t.coin);
  //     const { data: cryptos } = await SupabaseClient.from(
  //       "gochapaa_cryptocurrency_prices"
  //     )
  //       .select("name, current_price")
  //       .in("name", cryptoNames);

  //     // Calculate total value
  //     Logger.info(`Calculating portfolio ${portfolioId}'s total value...`);
  //     const totalValue = portfolioCoins.reduce(
  //       (sum: number, transaction: TransactionModel) => {
  //         const crypto = cryptos.find((c: any) => c.name === transaction.coin);
  //         return sum + transaction.quantity * (crypto?.current_price || 0);
  //       },
  //       0
  //     );

  //     // Update the portfolio table
  //     Logger.info(`Updating portfolio ${portfolioId}'s total value...`);
  //     const { data, error: updateError } = await SupabaseClient.from(
  //       "gochapaa_users_portfolios_insights"
  //     )
  //       .update({ total_value: totalValue })
  //       .eq("id", portfolioId)
  //       .select();

  //     if (updateError) {
  //       Logger.error(
  //         `Error updating portfolio total value: ${updateError.message}`
  //       );
  //     }

  //     await this.calculateGrowth24h(portfolioId);

  //     return data;
  //   }

  //   async calculateGrowth24h(portfolioId: string) {
  //     // Fetch portfolio transactions from the last 24 hours
  //     const { data: transactions, error } = await SupabaseClient.from(
  //       "gochapaa_users_portfolio_coins"
  //     )
  //       .select("quantity, purchase_price, coin, created_at")
  //       .eq("portfolio_id", portfolioId)
  //       .gte(
  //         "created_at",
  //         new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  //       );

  //     if (error) {
  //       Logger.error(`Error fetching portfolio coins: ${error.message}`);
  //     }

  //     // Fetch current prices
  //     const cryptoNames = transactions.map((t: any) => t.coin);
  //     const { data: cryptos } = await SupabaseClient.from(
  //       "gochapaa_cryptocurrency_prices"
  //     )
  //       .select("name, current_price")
  //       .in("name", cryptoNames);

  //     // Calculate growth
  //     const growth = transactions.reduce(
  //       (sum: number, transaction: PortfolioCoinModel) => {
  //         const crypto = cryptos.find((c: any) => c.name === transaction.coin);
  //         const currentValue =
  //           transaction.quantity * (crypto?.current_price || 0);
  //         const purchaseValue = transaction.quantity * transaction.purchase_price;
  //         return sum + (currentValue - purchaseValue);
  //       },
  //       0
  //     );

  //     // Update the portfolio table
  //     const { error: updateError } = await SupabaseClient.from(
  //       "gochapaa_users_portfolios_insights"
  //     )
  //       .update({ growth_24h: growth })
  //       .eq("id", portfolioId);

  //     if (updateError) {
  //       Logger.error(`Error updating portfolio growth: ${updateError.message}`);
  //     }

  //     return growth;
  //   }

  //   async updatePortfolioCoinDetails(
  //     transaction: Omit<TransactionModel, "id, created_at">
  //   ) {
  //     //CHECK IF THE COIN IS ALREADY IN THE PORTFOLIO
  //     //IF THE COIN IS IN THE PORTFOLIO, UPDATE THE TOTAL QUANTITY AND THE PURCHASE PRICE
  //     const { data: portfolioCoin, error } = await SupabaseClient.from(
  //       "gochapaa_users_portfolio_coins"
  //     )
  //       .select()
  //       .eq("portfolio_id", transaction.portfolio_id)
  //       .eq("coin", transaction.coin);

  //     if (error) {
  //       Logger.error(`Error fetching portfolio coins: ${error.message}`);
  //     }

  //     if (portfolioCoin.length === 0) {
  //       const data = await this.createPortfolioEntry(transaction);
  //       Logger.info(`Portfolio coin created: ${JSON.stringify(data)}`);
  //     }

  //     const { data, error: updateError } = await SupabaseClient.from(
  //       "gochapaa_users_portfolio_coins"
  //     )
  //       .update({
  //         quantity: portfolioCoin.quantity + transaction.quantity,
  //         purchase_price: transaction.purchase_price,
  //       })
  //       .eq("portfolio_id", transaction.portfolio_id)
  //       .eq("coin", transaction.coin)
  //       .select();

  //     if (updateError) {
  //       Logger.error(
  //         `Error updating portfolio ${transaction.portfolio_id}'s coin details: ${updateError.messafge}`
  //       );
  //     }

  //     return data;
  //   }

  //   async getPortfolioDetails(portfolioId: string) {
  //     //first check if the portfolio exists
  //     const { data: portfolio, error: portfolioError } =
  //       await SupabaseClient.from("gochapaa_users_portfolios_insights")
  //         .select("*")
  //         .eq("id", portfolioId);

  //     if (portfolioError) {
  //       Logger.error(
  //         `Error fetching portfolio ${portfolioId}'s details: ${portfolio}`
  //       );
  //     }

  //     if (portfolio.length === 0) {
  //       Logger.error(`Portfolio ${portfolioId} does not exist`);
  //       return null;
  //     }

  //     //fetch the portfolio's coins
  //     const { data: portfolioCoins, error } = await SupabaseClient.from(
  //       "gochapaa_users_portfolio_coins"
  //     )
  //       .select("*")
  //       .eq("portfolio_id", portfolioId);

  //     if (error) {
  //       Logger.error(
  //         `Error fetching portfolio ${portfolioId}'s coins: ${error.message}`
  //       );
  //     }

  //     //fetch the portfolio's insights
  //     const { data: portfolioInsights, error: insightsError } =
  //       await SupabaseClient.from("gochapaa_users_portfolios_insights")
  //         .select("total_value, growth_24h, created_at, updated_at")
  //         .eq("id", portfolioId);

  //     const portfolioData = {
  //       coins: portfolioCoins,
  //       insights: portfolioInsights[0],
  //       timestamp: new Date(),
  //     };

  //     return portfolioData;
  //   }

  //   async updateCoinInPortfolio(portfolioId: string, updateBody: any) {
  //     const { coin, quantity, purchase_price } = updateBody;

  //     //CHECK IF THE COIN IS ALREADY IN THE PORTFOLIO
  //     //IF THE COIN IS IN THE PORTFOLIO, UPDATE THE TOTAL QUANTITY AND THE PURCHASE PRICE
  //     //ELSE, SAVE THE NEW COIN TO THE DATABASE
  //     const { data: portfolioCoin, error } = await SupabaseClient.from(
  //       "gochapaa_users_portfolio_coins"
  //     )
  //       .select()
  //       .eq("portfolio_id", portfolioId)
  //       .eq("coin", coin);

  //     if (error) {
  //       Logger.error(`Error fetching portfolio coins: ${error.message}`);
  //     }

  //     if (portfolioCoin.length > 0) {
  //       const updatedPortfolioCoinQuantity = portfolioCoin.quantity + quantity;

  //       const { data, error: updateError } = await SupabaseClient.from(
  //         "gochapaa_users_portfolio_coins"
  //       )
  //         .update({
  //           quantity: updatedPortfolioCoinQuantity,
  //           purchase_price: purchase_price,
  //         })
  //         .eq("portfolio_id", portfolioId)
  //         .eq("coin", coin)
  //         .select();

  //       if (updateError) {
  //         Logger.error(
  //           `Error updating portfolio ${portfolioId}'s coin details: ${updateError.message}`
  //         );
  //       }

  //       //after the transaction is saved successfully
  //       const portfolioData: PortfolioModel = await this.updatePortfolioInsights(
  //         portfolioId
  //       );

  //       Logger.info(
  //         `Updated portfolio ${portfolioId}'s details: ${JSON.stringify(
  //           portfolioCoin
  //         )}`
  //       );

  //       return portfolioData;
  //     } else {
  //       const transactionData = {
  //         portfolio_id: portfolioId,
  //         coin: coin,
  //         quantity: quantity,
  //         purchase_price: purchase_price,
  //       };

  //       const { data, error } = await SupabaseClient.from(
  //         "gochapaa_users_portfolio_coins"
  //       )
  //         .insert(transactionData)
  //         .select();

  //       if (error) {
  //         Logger.error(
  //           `Error while saving transaction details: ${JSON.stringify(
  //             transactionData
  //           )} :  ${error.message}`
  //         );
  //       }

  //       //after saving the portfolio coin, update the portfolio insight table
  //       const updatedPortfolioInsightDetails = await this.updatePortfolioInsights(
  //         portfolioId
  //       );

  //       Logger.info(
  //         `Updated portfolio ${portfolioId}'s insights: ${JSON.stringify(
  //           updatedPortfolioInsightDetails
  //         )}`
  //       );
  //       return data;
  //     }
  //   }
}

export default PortfolioService;
