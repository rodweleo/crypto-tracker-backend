const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;

// Check if environment variables are set
if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase URL or Key in environment variables');
}

// Ensure supabase is declared only once
const supabaseClient = createClient(supabaseUrl, supabaseKey);

module.exports = supabaseClient;
