# AidPilot Database Expansion

This document explains the v0.3 database expansion added in `supabase/002_database_expansion.sql`. It is additive and does not replace `supabase/schema.sql`.

## Why these tables exist

### `schools`

AidPilot needs school-level financial aid metadata for future school-specific workflows: aid portal links, priority deadlines, and verification notes. The seed rows are placeholder reference data for California schools commonly used in demos. AidPilot is not partnered with or endorsed by these schools.

Authenticated users can read `schools`. Normal users cannot insert, update, or delete school records.

### `deadlines`

`aid_tasks` is a checklist of things a student should do. `deadlines` is a separate calendar of date-driven aid events: FAFSA priority dates, Cal Grant deadlines, school portal due dates, and scholarship close dates.

Separating deadlines from tasks lets AidPilot:

- Track date-only events without forcing them into a task workflow
- Attach deadlines to a `school_id` when relevant
- Store source metadata (`source_type`, `source_name`, `action_url`) for reminders

Each deadline row belongs to one user and is protected by row level security.

### `scholarships`

`scholarship_matches` stores user-specific matches: saved state, started state, match percent, and why it fits that student.

`scholarships` stores the canonical scholarship catalog: source name, eligibility, amounts, deadlines, verification status, and application links. This is the supply side. `scholarship_matches` is the demand side.

The optional `scholarship_id` column on `scholarship_matches` links a user match to a catalog row when one exists. Demo and seeded matches can still work without a catalog link.

No verified scholarship catalog rows are seeded in this migration. Opportunities should only be added after checking official source pages.

### `weekly_reports`

AidPilot's core habit is a weekly check-in. `weekly_reports` stores one summary per user per week:

- Aid status (protected, needs attention, at risk)
- Counts for tasks due, missing documents, and scholarships
- Potential scholarship dollars
- Top task and scholarship match IDs
- Flexible `recommendations` JSON for future report content

The unique constraint on `(user_id, report_week_start)` prevents duplicate reports for the same week.

## Existing tables unchanged

These v0.2 tables are not renamed or removed:

- `student_profiles`
- `aid_tasks`
- `document_items`
- `scholarship_matches`

## What is intentionally not built yet

This expansion does not add:

- `aid_letters` (aid offer storage and decoding)
- `appeal_drafts` (financial aid appeal writing)
- Document file uploads or storage
- FAFSA account connections
- Automatic pulls from school portals
- Payment or subscription tables

`aid_letters` and `appeal_drafts` involve more sensitive financial content and should come after the core workflow (tasks, deadlines, documents status, scholarships, weekly reports) is validated with real students.

AidPilot still does not collect Social Security numbers, FAFSA login credentials, or tax documents.

## How to run the migration

1. Open [Supabase Dashboard](https://supabase.com/dashboard) and select your AidPilot project.
2. Go to **SQL Editor**.
3. Click **New query**.
4. Paste the full contents of `supabase/002_database_expansion.sql`.
5. Click **Run**.

The migration is safe to rerun. It uses `IF NOT EXISTS` for tables and indexes, checks before adding `scholarship_id`, and drops policies before recreating them.

## After migration

The app continues to use v0.2 tables for auth, onboarding, dashboard, checklist, and scholarships. New tables are schema-only for now. Application code can adopt them in a future release when school workflows, deadline reminders, catalog matching, and stored weekly reports are implemented.
