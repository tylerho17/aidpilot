# AidPilot ✈️

**An AI financial aid copilot for students.** AidPilot turns the FAFSA's forms, deadlines, and fine print into one simple weekly check — with a sourced, bilingual guide to every section of the form and grounded AI answers on top of it.

**Live demo:** open the site and hit **"See the demo"** — no account needed. You'll land on a dashboard running on typed demo fixtures behind the same components that serve real data.

## What's inside

- **Dashboard · Protect · FAFSA Plan** — a three-tab app behind Supabase auth. Protect watches FAFSA steps, school portal follow-ups, verification requests, and aid offers, and surfaces the single next action.
- **FAFSA guide** — the real post-2024 FAFSA structure (plus the California Dream Act Application), section by section, with human-sourced "what it means / document needed / common mistake" helpers in English and Spanish. Structure and content live as typed data in `lib/fafsa-guide`.
- **Ask AidPilot** — a Claude-powered Q&A box grounded *strictly* in that sourced guide: the model is instructed to decline anything the guide doesn't cover rather than guess. Questions are never stored. (`app/api/fafsa-guide/ask`)
- **Aid offer decoder** — grants vs. loans vs. the real remaining cost, per school.
- **Onboarding wizard** — select-style questions that end in a personalized aid plan.
- **Design system** — a token-driven "claymorphism" system (`app/globals.css` + 21 typed components in `components/ui`): trust-blue palette, Nunito/Hanken/Rubik type roles, blue-tinted clay shadows, spring motion. The marketing landing is a CSS-built skeuomorphic desk — paper plane, spiral notebook, wooden pencil, no images.
- **Demo seam** (`lib/demo`) — typed fixtures fill in only when demo mode is on and Supabase is empty; real rows always win. One flag flips the whole app to live data.
- **i18n seam** (`lib/i18n`) — English/Spanish per-surface dictionaries; display labels localize, stored values stay canonical.

**Stack:** Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Supabase (auth + Postgres + RLS) · Anthropic Claude API · Vercel.

## Privacy stance

AidPilot never collects FAFSA login credentials, Social Security numbers, or tax documents — the guide teaches, the tracker tracks, and the AI answers are grounded in sourced content with no personal data involved.

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables (`.env.local`)

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key   # optional: server-side account deletion
ANTHROPIC_API_KEY=your-anthropic-key              # optional: powers Ask AidPilot
```

Without `ANTHROPIC_API_KEY`, the Ask AidPilot box degrades gracefully with a notice. Get Supabase values from **Project Settings → API**.

### Supabase setup

Run the migrations in `supabase/` in numeric order (starting with `schema.sql`) in the Supabase SQL Editor. Each is idempotent. To grant scholarship-admin access:

```sql
insert into public.admin_allowlist (email) values ('your@email.com') on conflict do nothing;
```

## Deploy on Vercel

Import the repo, add the environment variables above, deploy. Pushes to `main` go to production; every branch gets a preview URL.

## Scripts

```bash
npm run dev     # Development server
npm run build   # Production build (Turbopack)
npm run lint    # ESLint
```
