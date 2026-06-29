-- AidPilot: one-shot scholarship schema parity for deployed databases
-- Safe to rerun. Run if /scholarships shows a schema-out-of-date warning.
-- Combines scholarship changes from 007_phase_5_scholarship_engine.sql and
-- 009_phase_5_schema_parity.sql (scholarship sections only).

-- ---------------------------------------------------------------------------
-- Admin allowlist + RPC (scholarship admin access)
-- ---------------------------------------------------------------------------
create table if not exists public.admin_allowlist (
  email text primary key
);

create or replace function public.is_scholarship_admin()
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
-- scholarship_sources: Phase 5 columns
-- ---------------------------------------------------------------------------
alter table public.scholarship_sources add column if not exists updated_at timestamptz default now();
alter table public.scholarship_sources add column if not exists eligibility text;
alter table public.scholarship_sources add column if not exists interest_tags text[];
alter table public.scholarship_sources add column if not exists effort_level text default 'medium';
alter table public.scholarship_sources add column if not exists application_url text;
alter table public.scholarship_sources add column if not exists source_url text;
alter table public.scholarship_sources add column if not exists verified_date date;

update public.scholarship_sources
set
  application_url = coalesce(application_url, url),
  source_url = coalesce(source_url, url),
  updated_at = coalesce(updated_at, created_at)
where url is not null;

-- ---------------------------------------------------------------------------
-- scholarship_matches: Phase 5 columns
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
-- scholarship_sources RLS (admin write, public read active only)
-- ---------------------------------------------------------------------------
drop policy if exists "Anyone can read scholarship sources" on public.scholarship_sources;
drop policy if exists "Anyone can read active scholarship sources" on public.scholarship_sources;
drop policy if exists "Admins can read all scholarship sources" on public.scholarship_sources;
drop policy if exists "Admins can insert scholarship sources" on public.scholarship_sources;
drop policy if exists "Admins can update scholarship sources" on public.scholarship_sources;
drop policy if exists "Admins can delete scholarship sources" on public.scholarship_sources;

create policy "Anyone can read active scholarship sources"
  on public.scholarship_sources for select
  to anon, authenticated
  using (active = true);

create policy "Admins can read all scholarship sources"
  on public.scholarship_sources for select
  to authenticated
  using (public.is_scholarship_admin());

create policy "Admins can insert scholarship sources"
  on public.scholarship_sources for insert
  to authenticated
  with check (public.is_scholarship_admin());

create policy "Admins can update scholarship sources"
  on public.scholarship_sources for update
  to authenticated
  using (public.is_scholarship_admin())
  with check (public.is_scholarship_admin());

create policy "Admins can delete scholarship sources"
  on public.scholarship_sources for delete
  to authenticated
  using (public.is_scholarship_admin());

-- ---------------------------------------------------------------------------
-- admin_allowlist RLS
-- ---------------------------------------------------------------------------
alter table public.admin_allowlist enable row level security;

drop policy if exists "Admins can read allowlist" on public.admin_allowlist;
drop policy if exists "Admins can manage allowlist" on public.admin_allowlist;

create policy "Admins can read allowlist"
  on public.admin_allowlist for select
  to authenticated
  using (public.is_scholarship_admin());

create policy "Admins can manage allowlist"
  on public.admin_allowlist for all
  to authenticated
  using (public.is_scholarship_admin())
  with check (public.is_scholarship_admin());

notify pgrst, 'reload schema';
