import { User } from "../models/UserModel";

const SupabaseClient = require("../utils/supabaseClient")
const Logger = require('../utils/logger')
// Create a user
async function createUser(userData: User) {

    Logger.info("Saving a new user with details: " + JSON.stringify(userData))

    const { data, error } = await SupabaseClient.from('gochapaa_users').insert([userData]);

    if (error){
        Logger.error("Error creating the user: " + error.message)
    }

    return data;
}

// Get all users
async function getUsers() {
    const { data, error } = await SupabaseClient.from('gochapaa_users').select('*');

    if (error) {
        Logger.error("Error getting users: " + error.message)
    };

    if(data === null){
        return [];
    }

    return data
}

const getUserByEmail = async (email: string) => {
    const { data, error } = await SupabaseClient.from('gochapaa_users').select('*').eq('email', email).single();

    if (error) {
        Logger.error("Error getting user by email: " + error.message)
    }
    
    return data as User;
};

module.exports = {
    createUser,
    getUsers,
    getUserByEmail
};
