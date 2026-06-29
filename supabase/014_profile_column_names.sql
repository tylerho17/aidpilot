-- AidPilot: rename profile columns to canonical scholarship field names
-- Safe to rerun. Migrates first_gen -> first_generation, pell_eligible -> pell_grant_eligible.

alter table public.student_profiles add column if not exists first_generation boolean;
alter table public.student_profiles add column if not exists pell_grant_eligible boolean;

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

comment on column public.student_profiles.first_generation is 'First-generation college student (scholarship matching)';
comment on column public.student_profiles.pell_grant_eligible is 'Pell Grant eligibility flag (scholarship matching)';

notify pgrst, 'reload schema';
