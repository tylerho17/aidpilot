-- AidPilot: FAFSA intake responses + plan task metadata on aid_tasks
-- Safe to rerun.

-- ---------------------------------------------------------------------------
-- fafsa_intake_responses
-- ---------------------------------------------------------------------------
create table if not exists public.fafsa_intake_responses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  user_id uuid not null references auth.users (id) on delete cascade,
  aid_year text not null,
  student_situation text not null,
  state text not null,
  schools text not null,
  fafsa_progress text not null,
  has_studentaid_account text not null,
  needs_parent_info text not null,
  parent_has_account text,
  has_tax_info_access text not null,
  received_aid_offer text not null,
  verification_requested text not null,
  plan_generated_at timestamptz,
  constraint fafsa_intake_responses_user_id_key unique (user_id)
);

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

-- ---------------------------------------------------------------------------
-- aid_tasks: FAFSA plan metadata
-- ---------------------------------------------------------------------------
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
