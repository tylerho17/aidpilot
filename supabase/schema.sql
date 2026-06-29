create extension if not exists "pgcrypto";
-- AidPilot v0.2 database schema
--
-- HOW TO RUN THIS FILE:
-- 1. Open your Supabase project dashboard at https://supabase.com/dashboard
-- 2. Go to SQL Editor
-- 3. Click "New query"
-- 4. Paste this entire file
-- 5. Click "Run"
--
-- This creates student profile, aid task, document, and scholarship tables
-- with row level security so each user can only access their own data.

-- ---------------------------------------------------------------------------
-- student_profiles
-- ---------------------------------------------------------------------------
create table if not exists public.student_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  first_name text,
  email text,
  school text,
  year text,
  state text,
  student_type text,
  fafsa_status text,
  aid_types text[] default '{}',
  main_goals text[] default '{}',
  is_onboarded boolean not null default false
);

alter table public.student_profiles enable row level security;

create policy "Users can select own profile"
  on public.student_profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.student_profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.student_profiles for update
  using (auth.uid() = id);

create policy "Users can delete own profile"
  on public.student_profiles for delete
  using (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- aid_tasks
-- ---------------------------------------------------------------------------
create table if not exists public.aid_tasks (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  description text,
  status text not null,
  due_date date,
  category text,
  priority text
);

create index if not exists aid_tasks_user_id_idx on public.aid_tasks (user_id);

alter table public.aid_tasks enable row level security;

create policy "Users can select own aid tasks"
  on public.aid_tasks for select
  using (auth.uid() = user_id);

create policy "Users can insert own aid tasks"
  on public.aid_tasks for insert
  with check (auth.uid() = user_id);

create policy "Users can update own aid tasks"
  on public.aid_tasks for update
  using (auth.uid() = user_id);

create policy "Users can delete own aid tasks"
  on public.aid_tasks for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- document_items
-- ---------------------------------------------------------------------------
create table if not exists public.document_items (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  status text not null,
  source text,
  due_date date,
  note text
);

create index if not exists document_items_user_id_idx on public.document_items (user_id);

alter table public.document_items enable row level security;

create policy "Users can select own documents"
  on public.document_items for select
  using (auth.uid() = user_id);

create policy "Users can insert own documents"
  on public.document_items for insert
  with check (auth.uid() = user_id);

create policy "Users can update own documents"
  on public.document_items for update
  using (auth.uid() = user_id);

create policy "Users can delete own documents"
  on public.document_items for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- scholarship_matches
-- ---------------------------------------------------------------------------
create table if not exists public.scholarship_matches (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  amount integer,
  match_percent integer,
  deadline date,
  category text,
  why_it_fits text,
  status text not null default 'new',
  is_saved boolean not null default false,
  is_started boolean not null default false
);

create index if not exists scholarship_matches_user_id_idx on public.scholarship_matches (user_id);

alter table public.scholarship_matches enable row level security;

create policy "Users can select own scholarships"
  on public.scholarship_matches for select
  using (auth.uid() = user_id);

create policy "Users can insert own scholarships"
  on public.scholarship_matches for insert
  with check (auth.uid() = user_id);

create policy "Users can update own scholarships"
  on public.scholarship_matches for update
  using (auth.uid() = user_id);

create policy "Users can delete own scholarships"
  on public.scholarship_matches for delete
  using (auth.uid() = user_id);
