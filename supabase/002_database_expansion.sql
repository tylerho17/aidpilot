-- AidPilot database expansion (v0.3 foundation)
--
-- HOW TO RUN THIS FILE:
-- 1. Open your Supabase project dashboard at https://supabase.com/dashboard
-- 2. Go to SQL Editor
-- 3. Click "New query"
-- 4. Paste this entire file
-- 5. Click "Run"
--
-- This migration is additive and safe to run on an existing AidPilot project.
-- It does not modify or drop existing v0.2 tables or data.
-- You can rerun this file safely: policies are dropped before recreate,
-- and tables/columns/indexes use IF NOT EXISTS checks.

-- ---------------------------------------------------------------------------
-- schools
-- Reference data for school-level financial aid metadata.
-- Used for future school-specific workflows. Not a partnership claim.
-- ---------------------------------------------------------------------------
create table if not exists public.schools (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null,
  state text,
  system text,
  school_type text,
  website_url text,
  financial_aid_url text,
  aid_portal_url text,
  priority_deadline date,
  verification_notes text
);

comment on table public.schools is
  'School-level financial aid metadata for future school-specific AidPilot workflows.';

create index if not exists schools_name_idx on public.schools (name);
create index if not exists schools_state_idx on public.schools (state);

alter table public.schools enable row level security;

drop policy if exists "Authenticated users can read schools" on public.schools;

create policy "Authenticated users can read schools"
  on public.schools
  for select
  to authenticated
  using (true);

-- Seed placeholder public school records (not a partnership or endorsement).
insert into public.schools (name, state, system, school_type, website_url, financial_aid_url, verification_notes)
select
  'UC Irvine',
  'CA',
  'University of California',
  'public university',
  'https://www.uci.edu',
  'https://www.ofas.uci.edu',
  'Placeholder reference record. AidPilot is not partnered with this school. Verify URLs and deadlines from official sources.'
where not exists (select 1 from public.schools where name = 'UC Irvine');

insert into public.schools (name, state, system, school_type, website_url, financial_aid_url, verification_notes)
select
  'UCLA',
  'CA',
  'University of California',
  'public university',
  'https://www.ucla.edu',
  'https://financialaid.ucla.edu',
  'Placeholder reference record. AidPilot is not partnered with this school. Verify URLs and deadlines from official sources.'
where not exists (select 1 from public.schools where name = 'UCLA');

insert into public.schools (name, state, system, school_type, website_url, financial_aid_url, verification_notes)
select
  'UC Berkeley',
  'CA',
  'University of California',
  'public university',
  'https://www.berkeley.edu',
  'https://financialaid.berkeley.edu',
  'Placeholder reference record. AidPilot is not partnered with this school. Verify URLs and deadlines from official sources.'
where not exists (select 1 from public.schools where name = 'UC Berkeley');

insert into public.schools (name, state, system, school_type, website_url, financial_aid_url, verification_notes)
select
  'Cal State Long Beach',
  'CA',
  'California State University',
  'public university',
  'https://www.csulb.edu',
  'https://www.csulb.edu/student-financial-services',
  'Placeholder reference record. AidPilot is not partnered with this school. Verify URLs and deadlines from official sources.'
where not exists (select 1 from public.schools where name = 'Cal State Long Beach');

insert into public.schools (name, state, system, school_type, website_url, financial_aid_url, verification_notes)
select
  'Santa Monica College',
  'CA',
  'California Community Colleges',
  'community college',
  'https://www.smc.edu',
  'https://www.smc.edu/financial-aid',
  'Placeholder reference record. AidPilot is not partnered with this school. Verify URLs and deadlines from official sources.'
where not exists (select 1 from public.schools where name = 'Santa Monica College');

-- ---------------------------------------------------------------------------
-- deadlines
-- User-specific aid deadlines, separate from checklist tasks.
-- ---------------------------------------------------------------------------
create table if not exists public.deadlines (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  user_id uuid not null references auth.users (id) on delete cascade,
  school_id uuid references public.schools (id) on delete set null,
  title text not null,
  description text,
  deadline_date date not null,
  category text,
  priority text,
  status text not null default 'upcoming',
  source_type text,
  source_name text,
  action_url text
);

comment on table public.deadlines is
  'User-specific financial aid deadlines tracked separately from aid_tasks.';

create index if not exists deadlines_user_id_idx on public.deadlines (user_id);
create index if not exists deadlines_deadline_date_idx on public.deadlines (deadline_date);
create index if not exists deadlines_user_deadline_idx on public.deadlines (user_id, deadline_date);

alter table public.deadlines enable row level security;

drop policy if exists "Users can select own deadlines" on public.deadlines;
drop policy if exists "Users can insert own deadlines" on public.deadlines;
drop policy if exists "Users can update own deadlines" on public.deadlines;
drop policy if exists "Users can delete own deadlines" on public.deadlines;

create policy "Users can select own deadlines"
  on public.deadlines
  for select
  using (auth.uid() = user_id);

create policy "Users can insert own deadlines"
  on public.deadlines
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update own deadlines"
  on public.deadlines
  for update
  using (auth.uid() = user_id);

create policy "Users can delete own deadlines"
  on public.deadlines
  for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- scholarships
-- Canonical scholarship opportunities (catalog), not user-specific matches.
-- ---------------------------------------------------------------------------
create table if not exists public.scholarships (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  source_name text,
  name text not null,
  amount_min integer,
  amount_max integer,
  deadline date,
  opens_at date,
  category text,
  eligibility_summary text,
  student_type text,
  state text,
  school_id uuid references public.schools (id) on delete set null,
  major text,
  gpa_requirement text,
  financial_need_required boolean default false,
  essay_required boolean default false,
  recommendation_required boolean default false,
  citizenship_requirement text,
  application_url text,
  source_url text,
  last_checked_at date,
  verification_status text not null default 'needs verification',
  is_sweepstakes boolean not null default false,
  is_renewable boolean not null default false
);

comment on table public.scholarships is
  'Canonical scholarship catalog sourced from trusted references. Not user-specific matches.';

create index if not exists scholarships_deadline_idx on public.scholarships (deadline);
create index if not exists scholarships_category_idx on public.scholarships (category);
create index if not exists scholarships_state_idx on public.scholarships (state);
create index if not exists scholarships_verification_status_idx on public.scholarships (verification_status);

alter table public.scholarships enable row level security;

drop policy if exists "Authenticated users can read scholarships" on public.scholarships;

create policy "Authenticated users can read scholarships"
  on public.scholarships
  for select
  to authenticated
  using (true);

-- No scholarship catalog seed rows in this migration.
-- Add verified opportunities only after checking official source pages.

-- ---------------------------------------------------------------------------
-- weekly_reports
-- Weekly AidPilot check-in summaries per user.
-- ---------------------------------------------------------------------------
create table if not exists public.weekly_reports (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  user_id uuid not null references auth.users (id) on delete cascade,
  report_week_start date not null,
  aid_status text not null,
  summary text,
  tasks_due_count integer default 0,
  missing_documents_count integer default 0,
  scholarship_count integer default 0,
  potential_scholarship_amount integer default 0,
  top_task_ids uuid[] default '{}',
  top_scholarship_match_ids uuid[] default '{}',
  recommendations jsonb default '[]'::jsonb,
  unique (user_id, report_week_start)
);

comment on table public.weekly_reports is
  'Stored weekly AidPilot check-in summaries for each user.';

create index if not exists weekly_reports_user_id_idx on public.weekly_reports (user_id);
create index if not exists weekly_reports_week_idx on public.weekly_reports (report_week_start);

alter table public.weekly_reports enable row level security;

drop policy if exists "Users can select own weekly reports" on public.weekly_reports;
drop policy if exists "Users can insert own weekly reports" on public.weekly_reports;
drop policy if exists "Users can update own weekly reports" on public.weekly_reports;
drop policy if exists "Users can delete own weekly reports" on public.weekly_reports;

create policy "Users can select own weekly reports"
  on public.weekly_reports
  for select
  using (auth.uid() = user_id);

create policy "Users can insert own weekly reports"
  on public.weekly_reports
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update own weekly reports"
  on public.weekly_reports
  for update
  using (auth.uid() = user_id);

create policy "Users can delete own weekly reports"
  on public.weekly_reports
  for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- scholarship_matches expansion
-- Link user matches to canonical scholarships catalog when available.
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'scholarship_matches'
      and column_name = 'scholarship_id'
  ) then
    alter table public.scholarship_matches
      add column scholarship_id uuid references public.scholarships (id) on delete set null;
  end if;
end $$;

comment on column public.scholarship_matches.scholarship_id is
  'Optional link to canonical scholarships catalog row.';

create index if not exists scholarship_matches_user_id_idx on public.scholarship_matches (user_id);
create index if not exists scholarship_matches_scholarship_id_idx on public.scholarship_matches (scholarship_id);
