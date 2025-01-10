
import { PortfolioModel } from './../models/PortfolioModel';
import { Request, Response } from "express";
import { PortfolioCoinModel } from "../models/PortfolioCoinModel";
const SupabaseClient = require("../utils/supabaseClient")
const Logger = require('../utils/logger')
import { TransactionModel } from "../models/TransactionModel";
const TransactionService = require("./TransactionService")

async function createPortfolioEntry(req: Request | TransactionModel) {

    let portfolio_id, name, quantity, purchase_price;
    if ('body' in req) {
        ({ portfolio_id, name, quantity, purchase_price } = req.body);
    } else {
        name = req.coin;

        ({ portfolio_id, quantity, purchase_price } = req);
    }

    if (quantity <= 0) {
        Logger.error("Quantity must be positive: ")
        return null;
    }
    if (quantity <= 0 || purchase_price <= 0) {
        Logger.error("Purchase price must be positive: ")
        return null;
    }

    //create the transaction for the above portfolio
    const transactionData: Omit<TransactionModel, 'id' | 'created_at'> = {
        portfolio_id: portfolio_id,
        coin: name,
        quantity: quantity,
        purchase_price: purchase_price
    }

    try {

        const data = await TransactionService.addTransaction(transactionData);

        if (data !== null) {

            //CHECK IF THE COIN IS ALREADY IN THE PORTFOLIO
            //IF THE COIN IS IN THE PORTFOLIO, UPDATE THE TOTAL QUANTITY AND THE PURCHASE PRICE
            //ELSE, SAVE THE NEW COIN TO THE DATABASE
            const { data: portfolioCoin, error } = await SupabaseClient
                .from('gochapaa_users_portfolio_coins')
                .select()
                .eq('portfolio_id', transactionData.portfolio_id)
                .eq('coin', transactionData.coin)

            if (error) {
                Logger.error(`Error fetching portfolio coins: ${error.message}`)
            }

            if (portfolioCoin.length > 0) {

                const updatedPortfolioCoinQuantity = portfolioCoin.quantity + transactionData.quantity;

                const { data, error: updateError } = await SupabaseClient
                    .from('gochapaa_users_portfolio_coins')
                    .update({
                        quantity: updatedPortfolioCoinQuantity,
                        purchase_price: transactionData.purchase_price
                    })
                    .eq('portfolio_id', transactionData.portfolio_id)
                    .eq('coin', transactionData.coin)
                    .select()

                if (updateError) {
                    Logger.error(`Error updating portfolio ${transactionData.portfolio_id}'s coin details: ${updateError.messafge}`)
                }

                //after the transaction is saved successfully
                const portfolioData: PortfolioModel = await updatePortfolioInsights(transactionData.portfolio_id);

                Logger.info(`Updated portfolio ${transactionData.portfolio_id}'s details: ${JSON.stringify(portfolioCoin)}`)

                return portfolioData

            } else {

                const { data, error } = await SupabaseClient
                    .from('gochapaa_users_portfolio_coins')
                    .insert(transactionData)
                    .select();

                if (error) {
                    Logger.error(`Error while saving transaction details: ${JSON.stringify(transactionData)} :  ${error.message}`)
                }

                //after saving the portfolio coin, update the portfolio insight table
                const updatedPortfolioInsightDetails = await updatePortfolioInsights(transactionData.portfolio_id);

                Logger.info(`Updated portfolio ${transactionData.portfolio_id}'s insights: ${JSON.stringify(updatedPortfolioInsightDetails)}`)
                return data;
            }
        }

        return data;

    } catch (error: any) {
        Logger.error(`Error creating portfolio ${portfolio_id}'s data: ${error.message}`)
        return []
    }


}

async function getAllPortfolios() {

    const { data, error } = await SupabaseClient
        .from('gochapaa_users_portfolios')
        .select('*')

    if (error) {

        Logger.error(`Error fetching portfolios: ${error.message}`)

    };

    return data;
}
async function getUserPortfolio(req: Request, res: Response) {
    const { user_id } = req.params;

    const { data, error } = await SupabaseClient
        .from('gochapaa_users_portfolios')
        .select('*')
        .eq('user_id', user_id);

    if (error) {

        Logger.error(`Error fetching user ${user_id}'s portfolio: ${error.message}`)

    };

    return data;
}

async function getUserPortfolioInsights(user_id: string) {

    const { data, error } = await SupabaseClient
        .from('gochapaa_users_portfolios_insights')
        .select('*')
        .eq('user_id', user_id);

    if (error) {
        Logger.error(`Error fetching user ${user_id}'s portfolio insights: ${error.message}`)
    };

    return data;
}

async function deleteCoinFromUserPortfolio(portfolioId: string, coinName: string) {

    try {

        Logger.info(`Deleting coin ${coinName} from portfolio ${portfolioId}...`)

        const { data, error } = await SupabaseClient
            .from('gochapaa_users_portfolio_coins')
            .delete().eq('portfolio_id', portfolioId).eq('coin', coinName);

        if (error) {
            Logger.error(`Error deleting coin from portfolio: ${error.message}`)
        }

        //after deleting the coin from the portfolio, update the portfolio insights
        Logger.info(`Updating portfolio ${portfolioId}'s insights...`)
        const result = await updatePortfolioInsights(portfolioId);

        if (result.length === 0) {
            Logger.info(`Error updating portfolio ${portfolioId}'s insights...`)
        }

        return result
    } catch (error: any) {
        Logger.error(`Error deleting coin from portfolio: ${error.message}`)
        return null
    }
}

async function updatePortfolioInsights(portfolioId: string) {

    // Fetch all coins in the portfolio
    const { data: portfolioCoins, error } = await SupabaseClient
        .from('gochapaa_users_portfolio_coins')
        .select('quantity, purchase_price, coin')
        .eq('portfolio_id', portfolioId);

    if (error) {
        Logger.error(`Error fetching portfolio ${portfolioId}'s coins: ${error.message}`)
    }

    // Fetch current prices of cryptocurrencies
    const cryptoNames = portfolioCoins.map((t: PortfolioCoinModel) => t.coin);
    const { data: cryptos } = await SupabaseClient
        .from('gochapaa_cryptocurrency_prices')
        .select('name, current_price')
        .in('name', cryptoNames);

    // Calculate total value
    Logger.info(`Calculating portfolio ${portfolioId}'s total value...`)
    const totalValue = portfolioCoins.reduce((sum: number, transaction: TransactionModel) => {
        const crypto = cryptos.find((c: any) => c.name === transaction.coin);
        return sum + transaction.quantity * (crypto?.current_price || 0);
    }, 0);


    // Update the portfolio table
    Logger.info(`Updating portfolio ${portfolioId}'s total value...`)
    const { data, error: updateError } = await SupabaseClient
        .from('gochapaa_users_portfolios_insights')
        .update({ total_value: totalValue })
        .eq('id', portfolioId).select();

    if (updateError) {
        Logger.error(`Error updating portfolio total value: ${updateError.message}`)
    }

    await calculateGrowth24h(portfolioId);

    return data;
};

async function calculateGrowth24h(portfolioId: string) {
    // Fetch portfolio transactions from the last 24 hours
    const { data: transactions, error } = await SupabaseClient
        .from('gochapaa_users_portfolio_coins')
        .select('quantity, purchase_price, coin, created_at')
        .eq('portfolio_id', portfolioId)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    if (error) {
        Logger.error(`Error fetching portfolio coins: ${error.message}`)
    }

    // Fetch current prices
    const cryptoNames = transactions.map((t: any) => t.coin);
    const { data: cryptos } = await SupabaseClient
        .from('gochapaa_cryptocurrency_prices')
        .select('name, current_price')
        .in('name', cryptoNames);

    // Calculate growth
    const growth = transactions.reduce((sum: number, transaction: PortfolioCoinModel) => {
        const crypto = cryptos.find((c: any) => c.name === transaction.coin);
        const currentValue = transaction.quantity * (crypto?.current_price || 0);
        const purchaseValue = transaction.quantity * transaction.purchase_price;
        return sum + (currentValue - purchaseValue);
    }, 0);

    // Update the portfolio table
    const { error: updateError } = await SupabaseClient
        .from('gochapaa_users_portfolios_insights')
        .update({ growth_24h: growth })
        .eq('id', portfolioId);

    if (updateError) {
        Logger.error(`Error updating portfolio growth: ${updateError.message}`)
    }

    return growth;
};

async function updatePortfolioCoinDetails(transaction: Omit<TransactionModel, "id, created_at">) {

    //CHECK IF THE COIN IS ALREADY IN THE PORTFOLIO
    //IF THE COIN IS IN THE PORTFOLIO, UPDATE THE TOTAL QUANTITY AND THE PURCHASE PRICE
    const { data: portfolioCoin, error } = await SupabaseClient
        .from('gochapaa_users_portfolio_coins')
        .select()
        .eq('portfolio_id', transaction.portfolio_id)
        .eq('coin', transaction.coin);

    if (error) {
        Logger.error(`Error fetching portfolio coins: ${error.message}`)
    }

    if (portfolioCoin.length === 0) {
        const data = await createPortfolioEntry(transaction);
        Logger.info(`Portfolio coin created: ${JSON.stringify(data)}`)
    }


    const { data, error: updateError } = await SupabaseClient
        .from('gochapaa_users_portfolio_coins')
        .update({
            quantity: (portfolioCoin.quantity + transaction.quantity),
            purchase_price: transaction.purchase_price
        })
        .eq('portfolio_id', transaction.portfolio_id)
        .eq('coin', transaction.coin)
        .select();

    if (updateError) {
        Logger.error(`Error updating portfolio ${transaction.portfolio_id}'s coin details: ${updateError.messafge}`)
    }

    return data

}

async function getPortfolioDetails(portfolioId: string) {

    //first check if the portfolio exists
    const { data: portfolio, error: portfolioError } = await SupabaseClient
        .from('gochapaa_users_portfolios_insights')
        .select('*')
        .eq('id', portfolioId);

    if (portfolioError) {
        Logger.error(`Error fetching portfolio ${portfolioId}'s details: ${portfolio}`)
    }

    if (portfolio.length === 0) {
        Logger.error(`Portfolio ${portfolioId} does not exist`)
        return null;
    }


    //fetch the portfolio's coins
    const { data: portfolioCoins, error } = await SupabaseClient
        .from('gochapaa_users_portfolio_coins')
        .select('*')
        .eq('portfolio_id', portfolioId);

    if (error) {
        Logger.error(`Error fetching portfolio ${portfolioId}'s coins: ${error.message}`)
    }

    //fetch the portfolio's insights
    const { data: portfolioInsights, error: insightsError } = await SupabaseClient
        .from('gochapaa_users_portfolios_insights')
        .select('total_value, growth_24h, created_at, updated_at')
        .eq('id', portfolioId);

    const portfolioData = {
        coins: portfolioCoins,
        insights: portfolioInsights[0],
        timestamp: new Date()
    }

    return portfolioData;
}

async function updateCoinInPortfolio(portfolioId: string, updateBody: any) {

    const { coin, quantity, purchase_price } = updateBody;

    //CHECK IF THE COIN IS ALREADY IN THE PORTFOLIO
    //IF THE COIN IS IN THE PORTFOLIO, UPDATE THE TOTAL QUANTITY AND THE PURCHASE PRICE
    //ELSE, SAVE THE NEW COIN TO THE DATABASE
    const { data: portfolioCoin, error } = await SupabaseClient
        .from('gochapaa_users_portfolio_coins')
        .select()
        .eq('portfolio_id', portfolioId)
        .eq('coin', coin)

    if (error) {
        Logger.error(`Error fetching portfolio coins: ${error.message}`)
    }

    if (portfolioCoin.length > 0) {

        const updatedPortfolioCoinQuantity = portfolioCoin.quantity + quantity;

        const { data, error: updateError } = await SupabaseClient
            .from('gochapaa_users_portfolio_coins')
            .update({
                quantity: updatedPortfolioCoinQuantity,
                purchase_price: purchase_price
            })
            .eq('portfolio_id', portfolioId)
            .eq('coin', coin)
            .select()

        if (updateError) {
            Logger.error(`Error updating portfolio ${portfolioId}'s coin details: ${updateError.message}`)
        }

        //after the transaction is saved successfully
        const portfolioData: PortfolioModel = await updatePortfolioInsights(portfolioId);

        Logger.info(`Updated portfolio ${portfolioId}'s details: ${JSON.stringify(portfolioCoin)}`)

        return portfolioData

    } else {

        const transactionData = {
            portfolio_id: portfolioId,
            coin: coin,
            quantity: quantity,
            purchase_price: purchase_price
        }

        const { data, error } = await SupabaseClient
            .from('gochapaa_users_portfolio_coins')
            .insert(transactionData)
            .select();

        if (error) {
            Logger.error(`Error while saving transaction details: ${JSON.stringify(transactionData)} :  ${error.message}`)
        }

        //after saving the portfolio coin, update the portfolio insight table
        const updatedPortfolioInsightDetails = await updatePortfolioInsights(portfolioId);

        Logger.info(`Updated portfolio ${portfolioId}'s insights: ${JSON.stringify(updatedPortfolioInsightDetails)}`)
        return data;
    }

}

module.exports = {
    createPortfolioEntry,
    getAllPortfolios,
    getUserPortfolio,
    getUserPortfolioInsights,
    updatePortfolioInsights,
    calculateGrowth24h,
    updatePortfolioCoinDetails,
    deleteCoinFromUserPortfolio,
    getPortfolioDetails,
    updateCoinInPortfolio
};
