-- AidPilot: per-user FAFSA verification status, so /verification remembers a
-- student's tracking group + tax-filing answer + school across sessions and
-- devices. One row per user. Not sensitive PII (no SSNs/docs) — just the
-- self-reported group, whether they filed, and an optional school name.
--
-- Mirrors the fafsa_step_progress persistence pattern (020). Safe to rerun.

create table if not exists public.user_verification_status (
  user_id uuid primary key references auth.users (id) on delete cascade,
  updated_at timestamptz not null default now(),
  tracking_group text,   -- 'V1' | 'V4' | 'V5' | 'unsure'
  filed_taxes text,      -- 'filed' | 'did_not_file' | 'unsure'
  school_name text
);

comment on table public.user_verification_status is
  'Per-user FAFSA verification helper state (tracking group, filing status, school).';

alter table public.user_verification_status enable row level security;

drop policy if exists "Users manage their own verification status" on public.user_verification_status;
create policy "Users manage their own verification status" on public.user_verification_status
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
