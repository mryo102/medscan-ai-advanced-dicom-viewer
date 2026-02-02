
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

const envPath = path.resolve(process.cwd(), '.env.local');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

const url = envConfig.VITE_SUPABASE_URL;
const key = envConfig.VITE_SUPABASE_ANON_KEY;

async function listTables() {
    console.log(`Checking project: ${url}`);
    try {
        const response = await axios.get(`${url}/rest/v1/`, {
            headers: {
                'apikey': key,
                'Authorization': `Bearer ${key}`
            }
        });

        const tables = Object.keys(response.data.definitions || {});
        console.log("Found Tables in OpenAPI spec:");
        tables.forEach(t => console.log(` - ${t}`));

        if (tables.length === 0) {
            console.log("⚠️ No tables found in the 'public' schema of this project.");
        }
    } catch (err) {
        console.error("❌ API Error:", err.message);
    }
}

listTables();
