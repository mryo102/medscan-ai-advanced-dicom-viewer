
import { Client } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load env
const envPath = path.resolve(process.cwd(), '.env.local');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

// Construct Direct Connection URL
// Format: postgres://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
const projectRef = "uagnfhtuhxiftvvheijw";
const password = "VUutQMIwKsqUbFk6";
const host = `db.${projectRef}.supabase.co`;
const dbUrl = `postgres://postgres:${password}@${host}:5432/postgres`;

console.log(`Attempting direct connection to: ${host}`);

const client = new Client({
    connectionString: dbUrl,
    ssl: {
        rejectUnauthorized: false
    }
});

async function run() {
    try {
        console.log("Connecting to Database (Direct)...");
        await client.connect();
        console.log("Connected. Creating table 'hello_antigravity'...");

        await client.query(`
      CREATE TABLE IF NOT EXISTS public.hello_antigravity (
        id SERIAL PRIMARY KEY,
        message TEXT DEFAULT 'Hello from Antigravity!',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      INSERT INTO public.hello_antigravity (message) VALUES ('Success! Table created via Direct Connection.');
    `);

        console.log("✅ Success! Table created.");

        const res = await client.query('SELECT * FROM public.hello_antigravity ORDER BY created_at DESC LIMIT 1');
        console.log("Result:", res.rows[0]);

    } catch (err) {
        console.error("❌ Database Error:", err.message);
    } finally {
        await client.end();
    }
}

run();
