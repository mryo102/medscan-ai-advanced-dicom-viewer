
import { Client } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Force ignore SSL check for this script
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

const projectRef = "uagnfhtuhxiftvvheijw";
const password = "VUutQMIwKsqUbFk6";
const host = "aws-0-ap-northeast-1.pooler.supabase.com";

const connectionString = `postgres://postgres.${projectRef}:${password}@${host}:6543/postgres?options=project%3D${projectRef}`;

const client = new Client({
    connectionString,
});

async function test() {
    console.log(`Connecting to ${host} with project options...`);
    try {
        await client.connect();
        console.log("✅ CONNECTED!");

        console.log("Creating 'antigravity_check' table...");
        await client.query(`
      CREATE TABLE IF NOT EXISTS public.antigravity_check (
        id serial primary key,
        msg text,
        created_at timestamptz default now()
      );
      INSERT INTO public.antigravity_check (msg) VALUES ('Created at ' || now());
    `);

        console.log("✅ TABLE CREATED SUCCESSFULLY!");

        const res = await client.query("SELECT * FROM public.antigravity_check LIMIT 1");
        console.log("Check record:", res.rows[0]);

    } catch (err) {
        console.log("❌ FAILED:", err.message);
    } finally {
        try { await client.end(); } catch (e) { /* ignore */ }
    }
}

test();
