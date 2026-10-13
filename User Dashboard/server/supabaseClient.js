const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY;

let supabase = null;

if (supabaseUrl && supabaseKey && supabaseUrl !== 'https://your-project.supabase.co') {
    try {
        supabase = createClient(supabaseUrl, supabaseKey, {
            auth: {
                persistSession: false
            }
        });
        console.log('⚡ Connected to Supabase Cloud Database:', supabaseUrl);
    } catch (err) {
        console.error('❌ Failed to initialize Supabase client:', err.message);
        supabase = null;
    }
} else {
    console.log('ℹ️  Supabase credentials not configured or using placeholders. Falling back to local SQLite.');
}

const isSupabaseConfigured = () => {
    return supabase !== null;
};

module.exports = {
    supabase,
    isSupabaseConfigured
};
