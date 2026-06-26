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
NEXT_PUBLIC_ADMIN_EMAILS=your@email.com
```

`NEXT_PUBLIC_ADMIN_EMAILS` is optional for normal student use. Set it to a comma-separated list of emails allowed to access `/admin/scholarships`. The same email(s) must also be inserted into `public.admin_allowlist` in Supabase (see migration 007).

Get values from the Supabase dashboard: **Project Settings → API**.

## Supabase setup

Run migrations in the Supabase SQL Editor (in order):

1. `supabase/schema.sql`
2. `supabase/002_database_expansion.sql`
3. `supabase/003_phase_3_completion.sql`
4. `supabase/004_mvp_intelligence_layer.sql`
5. `supabase/005_seed_global_intelligence_data.sql` — FAFSA workflow steps and scholarship sources (global read-only data)
6. `supabase/007_phase_5_scholarship_engine.sql` — scholarship engine schema, admin RLS, match columns
7. `supabase/008_seed_phase_5_scholarships.sql` — Phase 5 starter scholarships

After running 007, add your admin email:

```sql
insert into public.admin_allowlist (email) values ('your@email.com') on conflict do nothing;
```

## Deploy on Vercel

1. Push this repo to GitHub.
2. Import the project in [Vercel](https://vercel.com/new).
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_ADMIN_EMAILS` (optional, for scholarship admin)
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
4. Log out and log back in — data persists in Supabase
