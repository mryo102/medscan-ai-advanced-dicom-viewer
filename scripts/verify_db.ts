
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Manually load .env.local because dotenv doesn't do it automatically for .local files by default usually,
// or we can just parse it.
const envPath = path.resolve(process.cwd(), '.env.local');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

const supabaseUrl = envConfig.VITE_SUPABASE_URL;
const supabaseKey = envConfig.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing credentials in .env.local");
    process.exit(1);
}

console.log(`Connecting to Supabase at: ${supabaseUrl}`);
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    // Try to select from the 'scans' table
    console.log("Checking 'scans' table...");
    const { data, error } = await supabase.from('scans').select('*').limit(1);

    if (error) {
        if (error.code === '42P01') { // undefined_table
            console.log("❌ Table 'scans' does NOT exist.");
        } else {
            console.log("❌ Error accessing 'scans':", error.message);
        }
    } else {
        console.log("✅ Table 'scans' exists.");
    }

    // Verify connection by just getting server time (if possible via rpc) or just basic health check
    // Since we don't have a simple health check without tables, we assume connection is OK if we got a 42P01 (Postgres error)
    // because that means we talked to the DB and it said "table missing".
}

check();
