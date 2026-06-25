-- AidPilot feedback table (v0.3)
--
-- HOW TO RUN THIS FILE:
-- 1. Open your Supabase project dashboard at https://supabase.com/dashboard
-- 2. Go to SQL Editor
-- 3. Click "New query"
-- 4. Paste this entire file
-- 5. Click "Run"
--
-- This table stores in-app product feedback from students.
-- It is for product improvement, not a support ticket system.

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid references auth.users (id) on delete set null,
  page text,
  rating text,
  message text not null,
  email text,
  status text not null default 'new'
);

comment on table public.feedback is
  'In-app product feedback from authenticated students. Not a support ticket system.';

create index if not exists feedback_user_id_idx on public.feedback (user_id);
create index if not exists feedback_status_idx on public.feedback (status);

alter table public.feedback enable row level security;

drop policy if exists "Authenticated users can insert feedback" on public.feedback;
drop policy if exists "Users can select own feedback" on public.feedback;

create policy "Authenticated users can insert feedback"
  on public.feedback
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "Users can select own feedback"
  on public.feedback
  for select
  using (auth.uid() = user_id);
