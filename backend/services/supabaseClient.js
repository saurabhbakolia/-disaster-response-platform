const { createClient } = require('@supabase/supabase-js');

// The .env variables are loaded in the main index.js file,
// so they are available in process.env here.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// --- NEW DIAGNOSTIC LOGGING ---
console.log('--- Supabase Client Initialization ---');
console.log('Attempting to initialize Supabase client.');
console.log('SUPABASE_URL loaded:', supabaseUrl);
// Mask the key for security, but confirm it exists.
console.log('SUPABASE_KEY loaded (first 5 chars):', supabaseKey ? `${supabaseKey.substring(0, 5)}...` : 'NOT FOUND');
console.log('------------------------------------');
// --- END DIAGNOSTIC LOGGING ---

if (!supabaseUrl || !supabaseKey) {
    console.error('CRITICAL ERROR: SUPABASE_URL or SUPABASE_KEY is not defined in your .env file.');
    console.error('Please ensure the .env file exists in the /backend directory and contains the correct Supabase credentials.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
