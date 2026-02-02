-- Create a bucket for storing medical scans
insert into storage.buckets (id, name, public)
values ('dicom-scans', 'dicom-scans', true);

-- Policy to allow anyone to read valid DICOM files (Adjust in production for privacy)
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'dicom-scans' );

-- Policy to allow authenticated uploads (Allowing public for demo simplicity if needed, but best practice is authenticated)
-- For this demo, we will allow public uploads to simplify the "no-login" experience if desired, otherwise restrict to authenticated.
create policy "Public Upload"
on storage.objects for insert
with check ( bucket_id = 'dicom-scans' );

-- Create the scans table
create table public.scans (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  file_path text not null,
  patient_name text,
  patient_id text,
  modality text,
  study_date text, -- Keeping as text to match DICOM format mostly, or cast to date usually
  institution text
);

-- Enable RLS (Row Level Security)
alter table public.scans enable row level security;

-- Create policies for scans
create policy "Public Select Scans"
on public.scans for select
using ( true );

create policy "Public Insert Scans"
on public.scans for insert
with check ( true );

-- Create the analyses table
create table public.analyses (
  id uuid default gen_random_uuid() primary key,
  scan_id uuid references public.scans(id) on delete cascade,
  created_at timestamptz default now(),
  summary text,
  findings jsonb, -- Array of strings
  anatomical_region text,
  confidence float4
);

-- Enable RLS
alter table public.analyses enable row level security;

-- Create policies for analyses
create policy "Public Select Analyses"
on public.analyses for select
using ( true );

create policy "Public Insert Analyses"
on public.analyses for insert
with check ( true );
