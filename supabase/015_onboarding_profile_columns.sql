-- AidPilot: one-shot onboarding profile column parity for deployed databases
-- Safe to rerun. Run after schema.sql and 002 (schools table). Includes 013 + 014 logic.

alter table public.student_profiles add column if not exists school_id uuid references public.schools (id) on delete set null;
alter table public.student_profiles add column if not exists majors text[] default '{}'::text[];
alter table public.student_profiles add column if not exists interests text[] default '{}'::text[];
alter table public.student_profiles add column if not exists first_generation boolean;
alter table public.student_profiles add column if not exists transfer_student boolean;
alter table public.student_profiles add column if not exists pell_grant_eligible boolean;
alter table public.student_profiles add column if not exists cal_grant_eligible boolean;
alter table public.student_profiles add column if not exists gpa numeric(3, 2);
alter table public.student_profiles add column if not exists essay_preference text default 'any';
alter table public.student_profiles add column if not exists scholarship_preferences jsonb default '{}'::jsonb;

update public.student_profiles set majors = '{}'::text[] where majors is null;
update public.student_profiles set interests = '{}'::text[] where interests is null;
update public.student_profiles set essay_preference = 'any' where essay_preference is null;
update public.student_profiles set scholarship_preferences = '{}'::jsonb where scholarship_preferences is null;

-- Migrate legacy column names if present
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'student_profiles' and column_name = 'first_gen'
  ) then
    execute $sql$
      update public.student_profiles
      set first_generation = coalesce(first_generation, first_gen)
      where first_gen is not null
    $sql$;
    alter table public.student_profiles drop column if exists first_gen;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'student_profiles' and column_name = 'pell_eligible'
  ) then
    execute $sql$
      update public.student_profiles
      set pell_grant_eligible = coalesce(pell_grant_eligible, pell_eligible)
      where pell_eligible is not null
    $sql$;
    alter table public.student_profiles drop column if exists pell_eligible;
  end if;
end $$;

create index if not exists student_profiles_school_id_idx on public.student_profiles (school_id);

comment on column public.student_profiles.first_generation is 'First-generation college student (scholarship matching)';
comment on column public.student_profiles.pell_grant_eligible is 'Pell Grant eligibility flag (scholarship matching)';
comment on column public.student_profiles.cal_grant_eligible is 'Cal Grant eligibility flag (California students)';
comment on column public.student_profiles.scholarship_preferences is 'JSON preferences from onboarding/settings for scholarship matching';

notify pgrst, 'reload schema';
