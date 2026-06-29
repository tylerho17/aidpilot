-- Guided 9-step FAFSA progress (plan_key based).
-- Distinct from user_fafsa_steps (workflow_step_id) in 004_mvp_intelligence_layer.sql.

create table if not exists public.fafsa_step_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  plan_key text not null,
  completed boolean not null default false,
  completed_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, plan_key)
);

create index if not exists fafsa_step_progress_user_id_idx on public.fafsa_step_progress (user_id);

alter table public.fafsa_step_progress enable row level security;

drop policy if exists "Users can select own fafsa step progress" on public.fafsa_step_progress;
drop policy if exists "Users can insert own fafsa step progress" on public.fafsa_step_progress;
drop policy if exists "Users can update own fafsa step progress" on public.fafsa_step_progress;
drop policy if exists "Users can delete own fafsa step progress" on public.fafsa_step_progress;

create policy "Users can select own fafsa step progress"
  on public.fafsa_step_progress for select using (auth.uid() = user_id);

create policy "Users can insert own fafsa step progress"
  on public.fafsa_step_progress for insert with check (auth.uid() = user_id);

create policy "Users can update own fafsa step progress"
  on public.fafsa_step_progress for update using (auth.uid() = user_id);

create policy "Users can delete own fafsa step progress"
  on public.fafsa_step_progress for delete using (auth.uid() = user_id);
