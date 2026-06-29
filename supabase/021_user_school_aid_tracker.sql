-- School portal + verification follow-up tracker (Phase 3).

create table if not exists public.user_school_aid_statuses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  school_name text not null,
  portal_url text,
  school_email text,
  fafsa_received_status text not null default 'unknown',
  portal_checked_status text not null default 'not_checked',
  documents_requested_status text not null default 'unknown',
  verification_status text not null default 'not_requested',
  aid_offer_status text not null default 'not_received',
  last_checked_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_school_aid_statuses_fafsa_received_check
    check (fafsa_received_status in ('unknown', 'received', 'not_received', 'action_needed')),
  constraint user_school_aid_statuses_portal_checked_check
    check (portal_checked_status in ('not_checked', 'checked', 'action_needed')),
  constraint user_school_aid_statuses_documents_requested_check
    check (documents_requested_status in ('unknown', 'none', 'requested', 'submitted', 'completed')),
  constraint user_school_aid_statuses_verification_check
    check (verification_status in ('not_requested', 'requested', 'submitted', 'approved', 'action_needed')),
  constraint user_school_aid_statuses_aid_offer_check
    check (aid_offer_status in ('not_received', 'estimated', 'official', 'reviewed', 'accepted_or_declined'))
);

create index if not exists user_school_aid_statuses_user_id_idx on public.user_school_aid_statuses (user_id);

alter table public.user_school_aid_statuses enable row level security;

drop policy if exists "Users can select own school aid statuses" on public.user_school_aid_statuses;
drop policy if exists "Users can insert own school aid statuses" on public.user_school_aid_statuses;
drop policy if exists "Users can update own school aid statuses" on public.user_school_aid_statuses;
drop policy if exists "Users can delete own school aid statuses" on public.user_school_aid_statuses;

create policy "Users can select own school aid statuses"
  on public.user_school_aid_statuses for select using (auth.uid() = user_id);

create policy "Users can insert own school aid statuses"
  on public.user_school_aid_statuses for insert with check (auth.uid() = user_id);

create policy "Users can update own school aid statuses"
  on public.user_school_aid_statuses for update using (auth.uid() = user_id);

create policy "Users can delete own school aid statuses"
  on public.user_school_aid_statuses for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------

create table if not exists public.user_school_aid_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  school_aid_status_id uuid not null references public.user_school_aid_statuses (id) on delete cascade,
  title text not null,
  description text,
  task_type text not null default 'general',
  status text not null default 'todo',
  priority text not null default 'medium',
  due_date date,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_school_aid_tasks_task_type_check
    check (task_type in ('portal_check', 'document_request', 'verification', 'aid_offer', 'general')),
  constraint user_school_aid_tasks_status_check
    check (status in ('todo', 'done', 'skipped')),
  constraint user_school_aid_tasks_priority_check
    check (priority in ('low', 'medium', 'high', 'urgent'))
);

create index if not exists user_school_aid_tasks_user_id_idx on public.user_school_aid_tasks (user_id);
create index if not exists user_school_aid_tasks_school_id_idx on public.user_school_aid_tasks (school_aid_status_id);

alter table public.user_school_aid_tasks enable row level security;

drop policy if exists "Users can select own school aid tasks" on public.user_school_aid_tasks;
drop policy if exists "Users can insert own school aid tasks" on public.user_school_aid_tasks;
drop policy if exists "Users can update own school aid tasks" on public.user_school_aid_tasks;
drop policy if exists "Users can delete own school aid tasks" on public.user_school_aid_tasks;

create policy "Users can select own school aid tasks"
  on public.user_school_aid_tasks for select using (auth.uid() = user_id);

create policy "Users can insert own school aid tasks"
  on public.user_school_aid_tasks for insert with check (auth.uid() = user_id);

create policy "Users can update own school aid tasks"
  on public.user_school_aid_tasks for update using (auth.uid() = user_id);

create policy "Users can delete own school aid tasks"
  on public.user_school_aid_tasks for delete using (auth.uid() = user_id);
