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
```

These are the only environment variables required for normal app use. A Supabase service role key is **not** required for the browser app.

Get values from the Supabase dashboard: **Project Settings → API**.

## Supabase setup

Run migrations in the Supabase SQL Editor (in order):

1. `supabase/schema.sql`
2. `supabase/002_database_expansion.sql`
3. `supabase/003_phase_3_completion.sql`
4. `supabase/004_mvp_intelligence_layer.sql`
5. `supabase/005_seed_global_intelligence_data.sql` — FAFSA workflow steps and scholarship sources (global read-only data)

## Deploy on Vercel

1. Push this repo to GitHub.
2. Import the project in [Vercel](https://vercel.com/new).
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
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
