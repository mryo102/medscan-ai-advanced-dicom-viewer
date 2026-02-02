-- =================================================================
-- IMPORTANT: Run this script in the Supabase SQL Editor
-- Link: https://supabase.com/dashboard/project/_/sql/new
-- =================================================================

-- 1. Create Storage Bucket for Scans
insert into storage.buckets (id, name, public)
values ('dicom-scans', 'dicom-scans', true)
on conflict (id) do nothing;

create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'dicom-scans' );

create policy "Public Upload"
on storage.objects for insert
with check ( bucket_id = 'dicom-scans' );

-- 2. Create 'scans' Table
create table if not exists public.scans (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  file_path text not null,
  patient_name text,
  patient_id text,
  modality text,
  study_date text,
  institution text
);

alter table public.scans enable row level security;

create policy "Public Select Scans" on public.scans for select using ( true );
create policy "Public Insert Scans" on public.scans for insert with check ( true );

-- 3. Create 'analyses' Table
create table if not exists public.analyses (
  id uuid default gen_random_uuid() primary key,
  scan_id uuid references public.scans(id) on delete cascade,
  created_at timestamptz default now(),
  summary text,
  findings jsonb,
  anatomical_region text,
  confidence float4
);

alter table public.analyses enable row level security;

create policy "Public Select Analyses" on public.analyses for select using ( true );
create policy "Public Insert Analyses" on public.analyses for insert with check ( true );

-- 4. Create a Test Verification Table (Requested by User)
create table if not exists public.connection_check (
  id serial primary key,
  message text,
  created_at timestamptz default now()
);

insert into public.connection_check (message) values ('Connection Successful!');

-- =================================================================
-- END OF SCRIPT
-- =================================================================
