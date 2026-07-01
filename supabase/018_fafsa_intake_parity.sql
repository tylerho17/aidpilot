-- AidPilot 018: FAFSA intake column parity for deployed + dev databases
-- Safe to rerun. Run if /fafsa/readiness fails on final submit.
--
-- Fixes:
-- - Missing student_situation, state, fafsa_progress on production tables
-- - Boolean yes/no columns converted to text (yes, no, not_sure, not_applicable)
-- - Aligns production column names with the app save path

-- ---------------------------------------------------------------------------
-- fafsa_intake_responses (create if missing)
-- ---------------------------------------------------------------------------
create table if not exists public.fafsa_intake_responses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  user_id uuid not null references auth.users (id) on delete cascade,
  aid_year text not null,
  schools text not null,
  plan_generated_at timestamptz,
  constraint fafsa_intake_responses_user_id_key unique (user_id)
);

-- Production / app column names (all text for wizard answers)
alter table public.fafsa_intake_responses add column if not exists student_situation text;
alter table public.fafsa_intake_responses add column if not exists state text;
alter table public.fafsa_intake_responses add column if not exists fafsa_progress text default 'not_started';
alter table public.fafsa_intake_responses add column if not exists has_student_aid_account text;
alter table public.fafsa_intake_responses add column if not exists contributor_required text;
alter table public.fafsa_intake_responses add column if not exists parent_has_student_aid_account text;
alter table public.fafsa_intake_responses add column if not exists has_tax_info text;
alter table public.fafsa_intake_responses add column if not exists has_school_portal_access text;
alter table public.fafsa_intake_responses add column if not exists has_aid_offer text;
alter table public.fafsa_intake_responses add column if not exists has_verification_request text;

-- Legacy 012 column names (dev environments) - kept for backfill only
alter table public.fafsa_intake_responses add column if not exists has_studentaid_account text;
alter table public.fafsa_intake_responses add column if not exists needs_parent_info text;
alter table public.fafsa_intake_responses add column if not exists parent_has_account text;
alter table public.fafsa_intake_responses add column if not exists has_tax_info_access text;
alter table public.fafsa_intake_responses add column if not exists received_aid_offer text;
alter table public.fafsa_intake_responses add column if not exists verification_requested text;

-- Convert boolean wizard-answer columns to text where needed
do $$
declare
  col text;
begin
  foreach col in array array[
    'contributor_required',
    'has_student_aid_account',
    'parent_has_student_aid_account',
    'has_tax_info',
    'has_school_portal_access',
    'has_aid_offer',
    'has_verification_request'
  ] loop
    if exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'fafsa_intake_responses'
        and column_name = col
        and data_type = 'boolean'
    ) then
      execute format(
        'alter table public.fafsa_intake_responses alter column %I type text using case when %I is true then ''yes'' when %I is false then ''no'' else ''not_sure'' end',
        col, col, col
      );
    end if;
  end loop;
end $$;

-- Backfill production columns from legacy 012 names when present
update public.fafsa_intake_responses
set has_student_aid_account = coalesce(has_student_aid_account, has_studentaid_account)
where has_student_aid_account is null and has_studentaid_account is not null;

update public.fafsa_intake_responses
set contributor_required = coalesce(contributor_required, needs_parent_info)
where contributor_required is null and needs_parent_info is not null;

update public.fafsa_intake_responses
set parent_has_student_aid_account = coalesce(parent_has_student_aid_account, parent_has_account)
where parent_has_student_aid_account is null and parent_has_account is not null;

update public.fafsa_intake_responses
set has_tax_info = coalesce(has_tax_info, has_tax_info_access)
where has_tax_info is null and has_tax_info_access is not null;

update public.fafsa_intake_responses
set has_aid_offer = coalesce(has_aid_offer, received_aid_offer)
where has_aid_offer is null and received_aid_offer is not null;

update public.fafsa_intake_responses
set has_verification_request = coalesce(has_verification_request, verification_requested)
where has_verification_request is null and verification_requested is not null;

update public.fafsa_intake_responses set fafsa_progress = 'not_started' where fafsa_progress is null;
update public.fafsa_intake_responses set has_school_portal_access = 'not_sure' where has_school_portal_access is null;

-- Drop legacy 012 alias columns after backfill (canonical names only)
alter table public.fafsa_intake_responses drop column if exists has_studentaid_account;
alter table public.fafsa_intake_responses drop column if exists needs_parent_info;
alter table public.fafsa_intake_responses drop column if exists parent_has_account;
alter table public.fafsa_intake_responses drop column if exists has_tax_info_access;
alter table public.fafsa_intake_responses drop column if exists received_aid_offer;
alter table public.fafsa_intake_responses drop column if exists verification_requested;

create index if not exists fafsa_intake_responses_user_id_idx on public.fafsa_intake_responses (user_id);

alter table public.fafsa_intake_responses enable row level security;

drop policy if exists "Users can select own fafsa intake" on public.fafsa_intake_responses;
drop policy if exists "Users can insert own fafsa intake" on public.fafsa_intake_responses;
drop policy if exists "Users can update own fafsa intake" on public.fafsa_intake_responses;
drop policy if exists "Users can delete own fafsa intake" on public.fafsa_intake_responses;

create policy "Users can select own fafsa intake"
  on public.fafsa_intake_responses for select using (auth.uid() = user_id);
create policy "Users can insert own fafsa intake"
  on public.fafsa_intake_responses for insert with check (auth.uid() = user_id);
create policy "Users can update own fafsa intake"
  on public.fafsa_intake_responses for update using (auth.uid() = user_id);
create policy "Users can delete own fafsa intake"
  on public.fafsa_intake_responses for delete using (auth.uid() = user_id);

-- aid_tasks FAFSA plan metadata (idempotent from 012)
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'aid_tasks' and column_name = 'task_source'
  ) then
    alter table public.aid_tasks add column task_source text;
  end if;
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'aid_tasks' and column_name = 'stage'
  ) then
    alter table public.aid_tasks add column stage text;
  end if;
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'aid_tasks' and column_name = 'step_order'
  ) then
    alter table public.aid_tasks add column step_order integer;
  end if;
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'aid_tasks' and column_name = 'why_it_matters'
  ) then
    alter table public.aid_tasks add column why_it_matters text;
  end if;
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'aid_tasks' and column_name = 'instructions'
  ) then
    alter table public.aid_tasks add column instructions text;
  end if;
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'aid_tasks' and column_name = 'required_info'
  ) then
    alter table public.aid_tasks add column required_info text;
  end if;
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'aid_tasks' and column_name = 'blocking_reason'
  ) then
    alter table public.aid_tasks add column blocking_reason text;
  end if;
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'aid_tasks' and column_name = 'action_url'
  ) then
    alter table public.aid_tasks add column action_url text;
  end if;
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'aid_tasks' and column_name = 'plan_key'
  ) then
    alter table public.aid_tasks add column plan_key text;
  end if;
end $$;

create unique index if not exists aid_tasks_user_plan_key_idx
  on public.aid_tasks (user_id, plan_key)
  where plan_key is not null;

create index if not exists aid_tasks_user_task_source_idx
  on public.aid_tasks (user_id, task_source);

notify pgrst, 'reload schema';
