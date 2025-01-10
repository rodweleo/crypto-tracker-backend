import { User } from "../models/UserModel";

const SupabaseClient = require("../utils/supabaseClient")
const Logger = require('../utils/logger')
// Create a user
async function createUser(userData: Omit<User, "id, created_at">) {

    Logger.info("Saving a new user with details: " + JSON.stringify(userData))

    const { data, error } = await SupabaseClient.from('gochapaa_users')
        .insert([userData])
        .select();

    if (error) {
        Logger.error("Error creating the user: " + error.message)
    }

    const savedUserDetails: User = data[0];

    //after the user is created, create the user's portfolio
    const { data: portfolioData, error: portfolioError } = await SupabaseClient.from('gochapaa_users_portfolio_insights')
        .insert([{ user_id: savedUserDetails.id }])
        .select();

    if (portfolioError) {
        Logger.error("Error creating the user's portfolio: " + portfolioError.message)
    }

    return savedUserDetails;
}

// Get all users
async function getUsers() {
    const { data, error } = await SupabaseClient.from('gochapaa_users').select('*');

    if (error) {
        Logger.error("Error getting users: " + error.message)
    };

    if (data === null) {
        return [];
    }

    return data
}

const getUserByEmail = async (email: string) => {
    const { data, error } = await SupabaseClient.from('gochapaa_users')
        .select('*')
        .eq('email', email).single();

    if (error) {
        Logger.error("Error getting user by email: " + error.message)
        return null
    }

    //from the user information, fetch the portfolio information
    //attach the portfolio id to the response
    const { data: portfolioData, error: portfolioError } = await SupabaseClient.from('gochapaa_users_portfolios_insights')
        .select('*')
        .eq('user_id', data.id).single();

    if (portfolioError) {
        Logger.error("Error getting user's portfolio by email: " + portfolioError.message)
        return null
    }

    return { ...data, portfolioId: portfolioData.id };
};

module.exports = {
    createUser,
    getUsers,
    getUserByEmail
};
