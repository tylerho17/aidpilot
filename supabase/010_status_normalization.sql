-- AidPilot P1: normalize and constrain status values
-- Safe to rerun. Run after core schema migrations.

-- ---------------------------------------------------------------------------
-- aid_tasks.status
-- Allowed: Complete, Due Soon, Missing, Needs Review, Optional, Upcoming
-- ---------------------------------------------------------------------------
update public.aid_tasks set status = 'Complete' where lower(status) in ('complete', 'completed');
update public.aid_tasks set status = 'Due Soon' where lower(status) in ('in_progress', 'due soon', 'due_soon');
update public.aid_tasks set status = 'Missing' where lower(status) in ('missing', 'blocked', 'not_started');
update public.aid_tasks set status = 'Needs Review' where lower(status) in ('needs review', 'needs_review');
update public.aid_tasks set status = 'Optional' where lower(status) = 'optional';
update public.aid_tasks set status = 'Upcoming' where lower(status) in ('upcoming', 'not started');

alter table public.aid_tasks drop constraint if exists aid_tasks_status_check;
alter table public.aid_tasks
  add constraint aid_tasks_status_check
  check (status in ('Complete', 'Due Soon', 'Missing', 'Needs Review', 'Optional', 'Upcoming'));

-- ---------------------------------------------------------------------------
-- deadlines.status
-- Allowed: upcoming, due soon, needs attention, completed
-- ---------------------------------------------------------------------------
update public.deadlines set status = 'completed' where lower(status) in ('complete', 'completed');
update public.deadlines set status = 'due soon' where lower(status) in ('in_progress', 'due_soon', 'due soon');
update public.deadlines set status = 'needs attention' where lower(status) in ('needs attention', 'needs_attention', 'missed', 'at risk');
update public.deadlines set status = 'upcoming' where lower(status) in ('upcoming', 'not_started', 'not started');

alter table public.deadlines drop constraint if exists deadlines_status_check;
alter table public.deadlines
  add constraint deadlines_status_check
  check (status in ('upcoming', 'due soon', 'needs attention', 'completed'));

-- ---------------------------------------------------------------------------
-- document_items.status
-- Allowed: not_started, needed, submitted, verified
-- ---------------------------------------------------------------------------
update public.document_items set status = 'verified' where lower(status) in ('verified', 'complete', 'completed', 'uploaded');
update public.document_items set status = 'submitted' where lower(status) in ('submitted', 'needs review', 'needs_review');
update public.document_items set status = 'needed' where lower(status) in ('needed', 'missing', 'required');
update public.document_items set status = 'not_started' where lower(status) in ('not_started', 'not started', 'upcoming', 'optional');

alter table public.document_items drop constraint if exists document_items_status_check;
alter table public.document_items
  add constraint document_items_status_check
  check (status in ('not_started', 'needed', 'submitted', 'verified'));

notify pgrst, 'reload schema';
