
import { Client } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load env
const envPath = path.resolve(process.cwd(), '.env.local');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

// The user might have provided the full URL already, or just the password.
// If the URL has special characters in the password part, pg-client might fail if not encoded.
const connectionString = envConfig.SUPABASE_DB_URL;

if (!connectionString) {
  console.error("❌ Error: SUPABASE_DB_URL is missing in .env.local");
  process.exit(1);
}

const client = new Client({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

const sql = `
-- 1. Create 'scans' Table
CREATE TABLE IF NOT EXISTS public.scans (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  file_path text NOT NULL,
  patient_name text,
  patient_id text,
  modality text,
  study_date text,
  institution text
);

ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Select Scans" ON public.scans;
DROP POLICY IF EXISTS "Public Insert Scans" ON public.scans;

CREATE POLICY "Public Select Scans" ON public.scans FOR SELECT USING ( true );
CREATE POLICY "Public Insert Scans" ON public.scans FOR INSERT WITH CHECK ( true );

-- 2. Create 'analyses' Table
CREATE TABLE IF NOT EXISTS public.analyses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  scan_id uuid REFERENCES public.scans(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  summary text,
  findings jsonb,
  anatomical_region text,
  confidence float4
);

ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Select Analyses" ON public.analyses;
DROP POLICY IF EXISTS "Public Insert Analyses" ON public.analyses;

CREATE POLICY "Public Select Analyses" ON public.analyses FOR SELECT USING ( true );
CREATE POLICY "Public Insert Analyses" ON public.analyses FOR INSERT WITH CHECK ( true );

-- 3. Create a Test Verification Table
CREATE TABLE IF NOT EXISTS public.connection_check (
  id serial PRIMARY KEY,
  message text,
  created_at timestamptz DEFAULT now()
);

INSERT INTO public.connection_check (message) VALUES ('Setup successful via Postgres URI with SSL');
`;

async function run() {
  try {
    console.log("Connecting to Database (with SSL)...");
    await client.connect();
    console.log("Connected. Executing SQL Schema...");

    await client.query(sql);

    console.log("✅ Schema applied successfully!");
  } catch (err) {
    console.error("❌ Database Error:", err);
    if (err.message.includes('Tenant or user not found')) {
      console.log("💡 Suggestion: Please check if the Project ID in the URL is correct and if the password in the URL is correctly URL-encoded.");
    }
  } finally {
    await client.end();
  }
}

run();
