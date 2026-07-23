-- AidPilot: a generic per-user "saved / handled" store, so students can bookmark
-- a scholarship from the /ca-aid catalog and mark a /key-dates deadline as
-- handled, and have it stick across sessions and devices. One row per
-- (user, item_type, item_key). Not sensitive PII — just references to catalog
-- items the student flagged. Mirrors the per-user RLS pattern. Safe to rerun.

create table if not exists public.user_saved_items (
  user_id uuid not null references auth.users (id) on delete cascade,
  item_type text not null,   -- 'scholarship' | 'deadline'
  item_key text not null,    -- scholarship_sources.id / aid_deadlines.slug
  created_at timestamptz not null default now(),
  primary key (user_id, item_type, item_key)
);

comment on table public.user_saved_items is
  'Per-user saved scholarships and handled deadlines (references to catalog items).';

alter table public.user_saved_items enable row level security;

drop policy if exists "Users manage their own saved items" on public.user_saved_items;
create policy "Users manage their own saved items" on public.user_saved_items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
