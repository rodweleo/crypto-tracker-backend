

import { TransactionModel } from "../models/TransactionModel";
const SupabaseClient = require("../utils/supabaseClient")
const Logger = require('../utils/logger')

async function addTransaction (transaction: Omit<TransactionModel, 'id' | 'created_at'>){
    //save the user's transaction
    Logger.info(`Saving the user's crypto transaction...: ${JSON.stringify(transaction)}`)
    const { data, error } = await SupabaseClient
        .from('gochapaa_users_transactions')
        .insert(transaction)
        .select();

    if (error) {
        Logger.error(`Error adding transaction: ${error.message}`);
    }

    Logger.info(`Transaction for portfolio ${transaction.portfolio_id} saved successfully: ${JSON.stringify(data)}`)

    return data;
};


module.exports = { 
    addTransaction
};
