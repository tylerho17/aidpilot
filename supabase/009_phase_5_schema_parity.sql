-- AidPilot Phase 5 schema parity (P0 hardening)
-- Safe to rerun. Run after 007_phase_5_scholarship_engine.sql and 008_seed_phase_5_scholarships.sql

-- ---------------------------------------------------------------------------
-- scholarship_matches: ensure action / metadata columns exist
-- ---------------------------------------------------------------------------
alter table public.scholarship_matches add column if not exists essay_angle text;
alter table public.scholarship_matches add column if not exists effort_level text;
alter table public.scholarship_matches add column if not exists recommended_action text;
alter table public.scholarship_matches add column if not exists ignored boolean default false;
alter table public.scholarship_matches add column if not exists applied boolean default false;
alter table public.scholarship_matches add column if not exists saved_at timestamptz;
alter table public.scholarship_matches add column if not exists applied_at timestamptz;
alter table public.scholarship_matches add column if not exists ignored_at timestamptz;

update public.scholarship_matches set ignored = false where ignored is null;
update public.scholarship_matches set applied = false where applied is null;

alter table public.scholarship_matches alter column ignored set default false;
alter table public.scholarship_matches alter column applied set default false;
alter table public.scholarship_matches alter column ignored set not null;
alter table public.scholarship_matches alter column applied set not null;

-- ---------------------------------------------------------------------------
-- scholarship_matches: query indexes
-- ---------------------------------------------------------------------------
create index if not exists scholarship_matches_user_status_idx
  on public.scholarship_matches (user_id, status);

create index if not exists scholarship_matches_user_flags_idx
  on public.scholarship_matches (user_id, ignored, applied, is_saved);

-- ---------------------------------------------------------------------------
-- feedback table + RLS (fresh environments)
-- ---------------------------------------------------------------------------
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
  to authenticated
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Admin RPC (database allowlist is source of truth)
-- ---------------------------------------------------------------------------
create or replace function public.is_current_user_scholarship_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_allowlist
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

grant execute on function public.is_current_user_scholarship_admin() to authenticated;

-- ---------------------------------------------------------------------------
-- Reload PostgREST schema cache
-- ---------------------------------------------------------------------------
notify pgrst, 'reload schema';
