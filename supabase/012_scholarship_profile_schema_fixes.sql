-- AidPilot P1: scholarship profile and match schema fixes
-- Safe to rerun. Run after 011_profile_enrichment.sql.

-- ---------------------------------------------------------------------------
-- student_profiles: persisted scholarship preferences
-- ---------------------------------------------------------------------------
alter table public.student_profiles
  add column if not exists scholarship_preferences jsonb;

update public.student_profiles
set scholarship_preferences = '{}'::jsonb
where scholarship_preferences is null;

alter table public.student_profiles
  alter column scholarship_preferences set default '{}'::jsonb,
  alter column scholarship_preferences set not null;

comment on column public.student_profiles.scholarship_preferences is
  'Structured scholarship matching preferences collected during onboarding and settings.';

-- ---------------------------------------------------------------------------
-- scholarship_matches: Phase 5 engine links to scholarship_sources
-- ---------------------------------------------------------------------------
do $$
declare
  fk_name text;
begin
  for fk_name in
    select c.conname
    from pg_constraint c
    join pg_attribute a
      on a.attrelid = c.conrelid
      and a.attnum = any(c.conkey)
    where c.conrelid = 'public.scholarship_matches'::regclass
      and c.contype = 'f'
      and a.attname = 'scholarship_id'
  loop
    execute format('alter table public.scholarship_matches drop constraint %I', fk_name);
  end loop;
end $$;

update public.scholarship_matches m
set scholarship_id = null
where scholarship_id is not null
  and not exists (
    select 1
    from public.scholarship_sources s
    where s.id = m.scholarship_id
  );

alter table public.scholarship_matches
  add constraint scholarship_matches_scholarship_source_id_fkey
  foreign key (scholarship_id)
  references public.scholarship_sources (id)
  on delete set null;

comment on column public.scholarship_matches.scholarship_id is
  'Optional link to the scholarship_sources row used by the Phase 5 matching engine.';

notify pgrst, 'reload schema';
