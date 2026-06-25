-- AidPilot Phase 4: MVP intelligence layer
-- Safe to rerun. Uses IF NOT EXISTS and DROP POLICY IF EXISTS.

-- ---------------------------------------------------------------------------
-- aid_letters: add cost_of_attendance for gap calculation
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'aid_letters'
      and column_name = 'cost_of_attendance'
  ) then
    alter table public.aid_letters add column cost_of_attendance integer;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- aid_recommendations
-- ---------------------------------------------------------------------------
create table if not exists public.aid_recommendations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  description text,
  category text,
  priority text not null default 'medium',
  status text not null default 'active',
  source text,
  related_table text,
  related_id uuid,
  due_date date,
  confidence integer not null default 80
);

create index if not exists aid_recommendations_user_id_idx on public.aid_recommendations (user_id);
create index if not exists aid_recommendations_user_title_idx on public.aid_recommendations (user_id, title);

alter table public.aid_recommendations enable row level security;

drop policy if exists "Users can select own aid recommendations" on public.aid_recommendations;
drop policy if exists "Users can insert own aid recommendations" on public.aid_recommendations;
drop policy if exists "Users can update own aid recommendations" on public.aid_recommendations;
drop policy if exists "Users can delete own aid recommendations" on public.aid_recommendations;

create policy "Users can select own aid recommendations"
  on public.aid_recommendations for select using (auth.uid() = user_id);

create policy "Users can insert own aid recommendations"
  on public.aid_recommendations for insert with check (auth.uid() = user_id);

create policy "Users can update own aid recommendations"
  on public.aid_recommendations for update using (auth.uid() = user_id);

create policy "Users can delete own aid recommendations"
  on public.aid_recommendations for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- fafsa_workflow_steps (public read)
-- ---------------------------------------------------------------------------
create table if not exists public.fafsa_workflow_steps (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  step_order integer not null,
  title text not null,
  description text,
  category text,
  applies_to text not null default 'all',
  default_priority text not null default 'medium',
  source_url text
);

create unique index if not exists fafsa_workflow_steps_order_idx on public.fafsa_workflow_steps (step_order);
create unique index if not exists fafsa_workflow_steps_title_idx on public.fafsa_workflow_steps (title);

alter table public.fafsa_workflow_steps enable row level security;

drop policy if exists "Anyone can read fafsa workflow steps" on public.fafsa_workflow_steps;

create policy "Anyone can read fafsa workflow steps"
  on public.fafsa_workflow_steps for select
  to anon, authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- user_fafsa_steps
-- ---------------------------------------------------------------------------
create table if not exists public.user_fafsa_steps (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  user_id uuid not null references auth.users (id) on delete cascade,
  workflow_step_id uuid not null references public.fafsa_workflow_steps (id) on delete cascade,
  status text not null default 'not_started',
  notes text
);

create unique index if not exists user_fafsa_steps_user_step_idx on public.user_fafsa_steps (user_id, workflow_step_id);
create index if not exists user_fafsa_steps_user_id_idx on public.user_fafsa_steps (user_id);

alter table public.user_fafsa_steps enable row level security;

drop policy if exists "Users can select own fafsa steps" on public.user_fafsa_steps;
drop policy if exists "Users can insert own fafsa steps" on public.user_fafsa_steps;
drop policy if exists "Users can update own fafsa steps" on public.user_fafsa_steps;
drop policy if exists "Users can delete own fafsa steps" on public.user_fafsa_steps;

create policy "Users can select own fafsa steps"
  on public.user_fafsa_steps for select using (auth.uid() = user_id);

create policy "Users can insert own fafsa steps"
  on public.user_fafsa_steps for insert with check (auth.uid() = user_id);

create policy "Users can update own fafsa steps"
  on public.user_fafsa_steps for update using (auth.uid() = user_id);

create policy "Users can delete own fafsa steps"
  on public.user_fafsa_steps for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- scholarship_sources (public read)
-- ---------------------------------------------------------------------------
create table if not exists public.scholarship_sources (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  provider text,
  amount integer,
  deadline date,
  url text,
  eligible_states text[],
  education_levels text[],
  student_types text[],
  major_keywords text[],
  tags text[],
  need_based boolean not null default false,
  merit_based boolean not null default false,
  essay_required boolean not null default false,
  min_gpa numeric,
  source text,
  active boolean not null default true
);

create index if not exists scholarship_sources_active_idx on public.scholarship_sources (active);
create unique index if not exists scholarship_sources_name_idx on public.scholarship_sources (name);

alter table public.scholarship_sources enable row level security;

drop policy if exists "Anyone can read scholarship sources" on public.scholarship_sources;

create policy "Anyone can read scholarship sources"
  on public.scholarship_sources for select
  to anon, authenticated
  using (active = true);
