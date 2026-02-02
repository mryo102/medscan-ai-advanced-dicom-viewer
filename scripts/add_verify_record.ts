
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

const envPath = path.resolve(process.cwd(), '.env.local');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

const supabaseUrl = envConfig.VITE_SUPABASE_URL;
const serviceRoleKey = envConfig.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function addRecord() {
    console.log("📝 Adding verification record...");
    const { data, error } = await supabase
        .from('connection_check')
        .insert({ message: 'Success! Confirmed by Antigravity AI agent.' })
        .select();

    if (error) {
        console.error("❌ Error adding record:", error.message);
    } else {
        console.log("✅ Record added successfully:", data);
    }
}

addRecord();
