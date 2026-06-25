-- AidPilot Phase 3 completion migration
--
-- HOW TO RUN THIS FILE:
-- 1. Open your Supabase project dashboard at https://supabase.com/dashboard
-- 2. Go to SQL Editor
-- 3. Click "New query"
-- 4. Paste this entire file
-- 5. Click "Run"
--
-- Safe to rerun. Uses IF NOT EXISTS and DROP POLICY IF EXISTS.

-- ---------------------------------------------------------------------------
-- waitlist
-- ---------------------------------------------------------------------------
create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  email text not null unique,
  first_name text,
  student_type text,
  state text,
  biggest_pain text
);

comment on table public.waitlist is
  'Landing page waitlist signups. Public insert only.';

create index if not exists waitlist_email_idx on public.waitlist (email);

alter table public.waitlist enable row level security;

drop policy if exists "Anyone can join waitlist" on public.waitlist;

create policy "Anyone can join waitlist"
  on public.waitlist
  for insert
  to anon, authenticated
  with check (true);

-- ---------------------------------------------------------------------------
-- aid_letters
-- ---------------------------------------------------------------------------
create table if not exists public.aid_letters (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  user_id uuid not null references auth.users (id) on delete cascade,
  school_name text,
  aid_year text,
  grants_amount integer,
  scholarships_amount integer,
  loans_amount integer,
  work_study_amount integer,
  estimated_net_cost integer,
  status text not null default 'draft',
  notes text
);

comment on table public.aid_letters is
  'User aid offer breakdown for the aid letter decoder. Placeholder data only in Phase 3.';

create index if not exists aid_letters_user_id_idx on public.aid_letters (user_id);

alter table public.aid_letters enable row level security;

drop policy if exists "Users can select own aid letters" on public.aid_letters;
drop policy if exists "Users can insert own aid letters" on public.aid_letters;
drop policy if exists "Users can update own aid letters" on public.aid_letters;
drop policy if exists "Users can delete own aid letters" on public.aid_letters;

create policy "Users can select own aid letters"
  on public.aid_letters for select using (auth.uid() = user_id);

create policy "Users can insert own aid letters"
  on public.aid_letters for insert with check (auth.uid() = user_id);

create policy "Users can update own aid letters"
  on public.aid_letters for update using (auth.uid() = user_id);

create policy "Users can delete own aid letters"
  on public.aid_letters for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- appeal_drafts
-- ---------------------------------------------------------------------------
create table if not exists public.appeal_drafts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  user_id uuid not null references auth.users (id) on delete cascade,
  aid_letter_id uuid references public.aid_letters (id) on delete set null,
  reason text,
  draft_body text,
  status text not null default 'draft'
);

comment on table public.appeal_drafts is
  'Draft financial aid appeal letters. Not built in the app UI yet.';

create index if not exists appeal_drafts_user_id_idx on public.appeal_drafts (user_id);
create index if not exists appeal_drafts_aid_letter_id_idx on public.appeal_drafts (aid_letter_id);

alter table public.appeal_drafts enable row level security;

drop policy if exists "Users can select own appeal drafts" on public.appeal_drafts;
drop policy if exists "Users can insert own appeal drafts" on public.appeal_drafts;
drop policy if exists "Users can update own appeal drafts" on public.appeal_drafts;
drop policy if exists "Users can delete own appeal drafts" on public.appeal_drafts;

create policy "Users can select own appeal drafts"
  on public.appeal_drafts for select using (auth.uid() = user_id);

create policy "Users can insert own appeal drafts"
  on public.appeal_drafts for insert with check (auth.uid() = user_id);

create policy "Users can update own appeal drafts"
  on public.appeal_drafts for update using (auth.uid() = user_id);

create policy "Users can delete own appeal drafts"
  on public.appeal_drafts for delete using (auth.uid() = user_id);
