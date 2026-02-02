
import { Client } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

const envPath = path.resolve(process.cwd(), '.env.local');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

const projectRef = "uagnfhtuhxiftvvheijw";
const password = "VUutQMIwKsqUbFk6";
const poolerHost = "aws-0-ap-northeast-1.pooler.supabase.com";

async function attempt(host, port, db) {
    console.log(`--- Attempting ${host}:${port} (db: ${db}) ---`);
    const client = new Client({
        user: `postgres.${projectRef}`,
        password,
        host,
        port,
        database: db,
        ssl: { rejectUnauthorized: false }
    });
    try {
        await client.connect();
        console.log(`✅ SUCCESS on ${host}:${port}!`);
        await client.query("CREATE TABLE IF NOT EXISTS public.ai_verified_table (id serial primary key, message text);");
        console.log("✅ TABLE CREATED!");
        await client.end();
        return true;
    } catch (err) {
        console.log(`❌ FAILED: ${err.message}`);
        return false;
    }
}

async function run() {
    // 1. Try pooler 6543 (Transaction)
    await attempt(poolerHost, 6543, "postgres");

    // 2. Try pooler 5432 (Session)
    await attempt(poolerHost, 5432, "postgres");

    // 3. Try projectRef as database name
    await attempt(poolerHost, 6543, projectRef);
}

run();
