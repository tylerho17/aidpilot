-- Phase 6: Scholarship Match Tracker (scholarships catalog + user_scholarship_matches)

create table if not exists public.scholarships (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  provider text,
  description text,
  amount_min numeric,
  amount_max numeric,
  deadline date,
  eligibility_summary text,
  application_url text,
  scholarship_type text not null default 'general',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint scholarships_scholarship_type_check
    check (scholarship_type in (
      'general', 'need_based', 'merit_based', 'local', 'major_specific',
      'identity_based', 'first_gen', 'transfer', 'school_specific'
    ))
);

create unique index if not exists scholarships_name_idx on public.scholarships (name);
create index if not exists scholarships_active_idx on public.scholarships (is_active);

create table if not exists public.user_scholarship_matches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  scholarship_id uuid references public.scholarships (id) on delete set null,
  custom_name text,
  custom_provider text,
  custom_amount numeric,
  custom_deadline date,
  custom_application_url text,
  match_reason text,
  fit_score numeric,
  status text not null default 'saved',
  priority text not null default 'medium',
  notes text,
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_scholarship_matches_status_check
    check (status in ('saved', 'researching', 'applying', 'submitted', 'won', 'rejected', 'skipped')),
  constraint user_scholarship_matches_priority_check
    check (priority in ('low', 'medium', 'high', 'urgent'))
);

create index if not exists user_scholarship_matches_user_id_idx on public.user_scholarship_matches (user_id);
create index if not exists user_scholarship_matches_scholarship_id_idx on public.user_scholarship_matches (scholarship_id);
create index if not exists user_scholarship_matches_user_status_idx on public.user_scholarship_matches (user_id, status);

alter table public.scholarships enable row level security;
alter table public.user_scholarship_matches enable row level security;

drop policy if exists "Authenticated users can read active scholarships" on public.scholarships;
drop policy if exists "Admins can manage scholarships" on public.scholarships;

create policy "Authenticated users can read active scholarships"
  on public.scholarships
  for select
  to authenticated
  using (is_active = true);

create policy "Admins can manage scholarships"
  on public.scholarships
  for all
  to authenticated
  using (public.is_scholarship_admin())
  with check (public.is_scholarship_admin());

drop policy if exists "Users can select their own scholarship matches" on public.user_scholarship_matches;
drop policy if exists "Users can insert their own scholarship matches" on public.user_scholarship_matches;
drop policy if exists "Users can update their own scholarship matches" on public.user_scholarship_matches;
drop policy if exists "Users can delete their own scholarship matches" on public.user_scholarship_matches;

create policy "Users can select their own scholarship matches"
  on public.user_scholarship_matches
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their own scholarship matches"
  on public.user_scholarship_matches
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own scholarship matches"
  on public.user_scholarship_matches
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own scholarship matches"
  on public.user_scholarship_matches
  for delete
  using (auth.uid() = user_id);
