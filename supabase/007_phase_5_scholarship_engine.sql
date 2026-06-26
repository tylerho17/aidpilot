-- AidPilot Phase 5: Scholarship Engine v1
-- Safe to rerun. Uses IF NOT EXISTS and DROP POLICY IF EXISTS.

-- ---------------------------------------------------------------------------
-- Admin allowlist (source of truth for scholarship admin access)
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

-- ---------------------------------------------------------------------------
-- scholarship_sources upgrades
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
-- scholarship_matches upgrades
-- ---------------------------------------------------------------------------
alter table public.scholarship_matches add column if not exists essay_angle text;
alter table public.scholarship_matches add column if not exists effort_level text;
alter table public.scholarship_matches add column if not exists recommended_action text;
alter table public.scholarship_matches add column if not exists ignored boolean not null default false;
alter table public.scholarship_matches add column if not exists applied boolean not null default false;
alter table public.scholarship_matches add column if not exists saved_at timestamptz;
alter table public.scholarship_matches add column if not exists applied_at timestamptz;
alter table public.scholarship_matches add column if not exists ignored_at timestamptz;

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
-- admin_allowlist RLS (admins manage list; users cannot read)
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
