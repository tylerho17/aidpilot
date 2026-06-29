-- AidPilot 019: FAFSA save path parity (schools text[], required_info text[], missing intake columns)
-- Safe to rerun. Run if /fafsa/readiness still fails on submit.

-- ---------------------------------------------------------------------------
-- fafsa_intake_responses: ensure wizard columns exist as text
-- ---------------------------------------------------------------------------
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

-- schools: prefer text[] for multi-school wizard input (comma-separated in UI)
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'fafsa_intake_responses'
      and column_name = 'schools'
      and data_type = 'text'
  ) then
    alter table public.fafsa_intake_responses
      alter column schools type text[]
      using case
        when schools is null or schools = '' then array['Not set yet']::text[]
        else string_to_array(schools, ',')
      end;
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'fafsa_intake_responses'
      and column_name = 'schools'
  ) then
    alter table public.fafsa_intake_responses add column schools text[] not null default array['Not set yet']::text[];
  end if;
end $$;

-- Convert boolean wizard answers to text
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

update public.fafsa_intake_responses set fafsa_progress = 'not_started' where fafsa_progress is null;
update public.fafsa_intake_responses set has_school_portal_access = 'not_sure' where has_school_portal_access is null;

-- ---------------------------------------------------------------------------
-- aid_tasks: required_info as text[] for plan metadata
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'aid_tasks'
      and column_name = 'required_info'
  ) then
    alter table public.aid_tasks add column required_info text[];
  elsif exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'aid_tasks'
      and column_name = 'required_info'
      and data_type = 'text'
  ) then
    alter table public.aid_tasks
      alter column required_info type text[]
      using case
        when required_info is null or required_info = '' then '{}'::text[]
        else array[required_info]
      end;
  end if;
end $$;

create unique index if not exists fafsa_intake_responses_user_id_key
  on public.fafsa_intake_responses (user_id);

create unique index if not exists aid_tasks_user_plan_key_idx
  on public.aid_tasks (user_id, plan_key)
  where plan_key is not null;

notify pgrst, 'reload schema';
