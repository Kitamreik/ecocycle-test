const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with URL and API key from .env
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

module.exports = { supabase };