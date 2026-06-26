-- AidPilot P1: enrich student_profiles for scholarship matching
-- Safe to rerun. Run after schools table exists.

alter table public.student_profiles add column if not exists school_id uuid references public.schools (id) on delete set null;
alter table public.student_profiles add column if not exists majors text[] default '{}'::text[];
alter table public.student_profiles add column if not exists interests text[] default '{}'::text[];
alter table public.student_profiles add column if not exists first_gen boolean;
alter table public.student_profiles add column if not exists transfer_student boolean;
alter table public.student_profiles add column if not exists pell_eligible boolean;
alter table public.student_profiles add column if not exists cal_grant_eligible boolean;
alter table public.student_profiles add column if not exists gpa numeric(3, 2);
alter table public.student_profiles add column if not exists essay_preference text default 'any';

update public.student_profiles set majors = '{}'::text[] where majors is null;
update public.student_profiles set interests = '{}'::text[] where interests is null;
update public.student_profiles set essay_preference = 'any' where essay_preference is null;

create index if not exists student_profiles_school_id_idx on public.student_profiles (school_id);

comment on column public.student_profiles.majors is 'Student majors used for scholarship matching';
comment on column public.student_profiles.interests is 'Academic and extracurricular interests for scholarship matching';
comment on column public.student_profiles.essay_preference is 'any, prefer_no_essay, or okay_with_essay';

notify pgrst, 'reload schema';
