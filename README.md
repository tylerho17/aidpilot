# AidPilot

Financial aid copilot for students. Track FAFSA progress, documents, deadlines, scholarships, and aid offers in one place.

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

Create `.env.local` in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

`SUPABASE_SERVICE_ROLE_KEY` is optional but required for server-side account deletion in Settings. Never expose this key to the client or commit it to git.

Get values from the Supabase dashboard: **Project Settings → API**.

## Supabase setup

Run migrations in the Supabase SQL Editor **in this order** on a fresh project:

| # | File | Purpose |
|---|------|---------|
| 1 | `supabase/schema.sql` | Core tables, RLS, auth-linked profiles |
| 2 | `supabase/002_database_expansion.sql` | Expanded aid tasks, documents, deadlines |
| 3 | `supabase/003_phase_3_completion.sql` | Phase 3 schema completion |
| 4 | `supabase/003_feedback.sql` | In-app feedback table + RLS |
| 5 | `supabase/004_mvp_intelligence_layer.sql` | Recommendations, weekly reports, intelligence tables |
| 6 | `supabase/005_seed_global_intelligence_data.sql` | FAFSA workflow steps and scholarship sources (global read-only data) |
| 7 | `supabase/007_phase_5_scholarship_engine.sql` | Scholarship engine, admin allowlist, match columns |
| 8 | `supabase/008_seed_phase_5_scholarships.sql` | Phase 5 starter scholarships |
| 9 | `supabase/009_phase_5_schema_parity.sql` | Scholarship column parity, indexes, feedback safety net, admin RPC, schema reload |
| 10 | `supabase/010_status_normalization.sql` | Canonical task, deadline, and document status constraints |
| 11 | `supabase/011_profile_enrichment.sql` | Scholarship profile fields on student_profiles |
| 12 | `supabase/012_fafsa_intake.sql` | FAFSA intake responses and plan task metadata on aid_tasks |
| 13 | `supabase/013_student_profile_parity.sql` | Optional profile/scholarship columns on student_profiles + schema reload |
| 14 | `supabase/014_profile_column_names.sql` | Rename legacy first_gen/pell_eligible columns to canonical names + schema reload |
| 15 | `supabase/015_onboarding_profile_columns.sql` | One-shot parity for deployed DBs: all onboarding/matching columns + legacy renames |
| 16 | `supabase/016_student_profile_canonical.sql` | **Canonical profile columns** (full_name, school_name, education_level, etc.) + full backfill |
| 17 | `supabase/017_scholarship_schema_parity.sql` | **Scholarship engine columns** on scholarship_matches and scholarship_sources + admin RPC + schema reload |
| 18 | `supabase/018_fafsa_intake_parity.sql` | **FAFSA intake column parity** - text wizard answers, missing columns, RLS + aid_tasks plan metadata |
| 19 | `supabase/019_fafsa_save_parity.sql` | **FAFSA save fix** - `schools` text[], `required_info` text[], unique indexes |

**Deployed production fix (scholarships):** Run `017_scholarship_schema_parity.sql` in the Supabase SQL Editor (idempotent, safe to rerun). Equivalent to running migrations 007 and 009 scholarship sections if those were skipped.

**Deployed production fix (FAFSA readiness):** Run `018_fafsa_intake_parity.sql` then `019_fafsa_save_parity.sql` in the Supabase SQL Editor (idempotent, safe to rerun).

**Deployed production fix (profiles):** Run `016_student_profile_canonical.sql` in the Supabase SQL Editor (idempotent, safe to rerun).

After running 007 and 009, grant scholarship admin access by adding your email to the database allowlist:

```sql
insert into public.admin_allowlist (email) values ('your@email.com') on conflict do nothing;
```

Scholarship admin access is enforced server-side via `admin_allowlist` and the `is_current_user_scholarship_admin()` RPC. No client env allowlist is required.

## Deploy on Vercel

1. Push this repo to GitHub.
2. Import the project in [Vercel](https://vercel.com/new).
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (optional, for account deletion)
4. Deploy. Vercel runs `npm run build` automatically.

## Scripts

```bash
npm run lint    # ESLint
npm run build   # Production build
npm run dev     # Development server
```

## Demo flow

1. Sign up with a test email
2. Complete onboarding → land on dashboard
3. FAFSA workflow, Documents, Deadlines, Scholarships, Aid Letter
4. Log out and log back in - data persists in Supabase
