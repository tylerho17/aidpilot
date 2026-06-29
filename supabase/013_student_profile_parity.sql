-- AidPilot: student_profiles column parity for onboarding + optional matching fields
-- Safe to rerun. Run if 011 was not applied or PostgREST schema cache is stale.

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

create index if not exists student_profiles_school_id_idx on public.student_profiles (school_id);

comment on column public.student_profiles.first_generation is 'First-generation college student (scholarship matching)';
comment on column public.student_profiles.pell_grant_eligible is 'Pell Grant eligibility flag (scholarship matching)';
comment on column public.student_profiles.cal_grant_eligible is 'Cal Grant eligibility flag (California students)';
comment on column public.student_profiles.scholarship_preferences is 'JSON preferences from onboarding/settings for scholarship matching';

notify pgrst, 'reload schema';
