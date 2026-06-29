-- Phase 5: multi-school aid offer decoder (extends aid_letters when present, adds user_aid_offers).

create table if not exists public.user_aid_offers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  school_name text not null,
  offer_status text not null default 'draft',
  academic_year text,
  cost_of_attendance numeric not null default 0,
  tuition_and_fees numeric not null default 0,
  housing_and_food numeric not null default 0,
  books_and_supplies numeric not null default 0,
  transportation numeric not null default 0,
  personal_expenses numeric not null default 0,
  grants_and_scholarships numeric not null default 0,
  work_study numeric not null default 0,
  federal_student_loans numeric not null default 0,
  parent_plus_loans numeric not null default 0,
  private_loans numeric not null default 0,
  other_aid numeric not null default 0,
  renewal_notes text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_aid_offers_offer_status_check
    check (offer_status in ('draft', 'estimated', 'official', 'reviewed'))
);

create index if not exists user_aid_offers_user_id_idx on public.user_aid_offers (user_id);

alter table public.user_aid_offers enable row level security;

drop policy if exists "Users can select own aid offers" on public.user_aid_offers;
drop policy if exists "Users can insert own aid offers" on public.user_aid_offers;
drop policy if exists "Users can update own aid offers" on public.user_aid_offers;
drop policy if exists "Users can delete own aid offers" on public.user_aid_offers;

create policy "Users can select own aid offers"
  on public.user_aid_offers for select using (auth.uid() = user_id);

create policy "Users can insert own aid offers"
  on public.user_aid_offers for insert with check (auth.uid() = user_id);

create policy "Users can update own aid offers"
  on public.user_aid_offers for update using (auth.uid() = user_id);

create policy "Users can delete own aid offers"
  on public.user_aid_offers for delete using (auth.uid() = user_id);
