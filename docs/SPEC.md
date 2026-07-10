# AidPilot v1 — SPEC (what to build)

> **Status: CURRENT — governs v1.** Pairs with `docs/DESIGN_SOURCE.md` (how it
> looks) and `AGENT_RULES.md` (non-negotiable rules). Historical/ignore:
> `docs/database-expansion.md`, `docs/scholarship-sources.md`. Reference only:
> `docs/fafsa-workflow-map.md`, `docs/user-research.md`.

## What this is (one sentence)

A **no-login, bilingual (EN/ES/VI) web guide** that gets one Garden Grove senior
and their parent from "haven't started" to a **completed FAFSA or CADAA
worksheet**, storing **zero personal data**, so one counselor's completion rate
goes up this cycle.

**If a screen doesn't move a student toward a finished worksheet, it isn't in v1.**

## Features (build in this order)

Each feature: run build + lint, fix all errors, commit as `F<n>: <summary>`,
print a one-line status.

- **F1 — Foundation & i18n.** next-intl with EN/ES/VI + language switcher from the
  existing UI kit; app shell + nav (Triage → Walkthrough → Worksheet) on the clay
  surface; landing page on the flat surface (placeholder copy via i18n keys).
  Vercel-deployable.
- **F2 — Client-only session state.** In-memory store
  `{ path: 'fafsa' | 'cadaa' | null, answers: {} }`. No server persistence.
  Backbone for F3–F5. Build before any screen that collects an answer.
- **F3 — Triage wizard.** 3–5 questions (OptionCard/SegmentedControl) → FAFSA,
  CADAA, or "see your counselor" (mixed-status → routed, **NOT** solved in v1).
  Writes `path` to session state. Question text = i18n placeholder keys.
- **F4 — Walkthrough shell (FAFSA + CADAA).** Section-by-section flow driven by a
  structured content file of `{ sectionKey, fieldKey, whatItMeansKey,
  documentNeededKey, commonErrorKey }` — all i18n placeholder keys, **NO** real
  aid content. Render with existing ChecklistItem/Card/ProgressBar/SectionHeading.
  Include a contributor/FSA ID explainer section (placeholder, explainer only).
  Progress in session state; back/forward; nothing transmitted.
- **F5 — Worksheet generator.** Compile session answers into a
  printable/downloadable worksheet, generated **entirely client-side** (pdf-lib or
  react-pdf), styled to design tokens. Visible disclaimer: not official advice,
  verify with counselor, sign and submit on the official site yourself. Nothing
  transmitted.
- **F6 — Anonymous self-report.** One "I finished my application" action that
  increments an **anonymous aggregate counter** (Supabase). No identifiers, no
  answers, no PII — the only server write in the app, and it's anonymous.
- **F7 — Counselor-referral landing.** One shareable route a counselor can hand
  out.

## Out of scope (do not build)

Stored roster / counselor dashboard; automated completion-data integration;
mixed-status non-SSN-contributor detection + CADAA auto-fallback; scholarship
engine; aid-letter decoder; appeal assistant; AI free-form advice; payments;
multi-district tenancy.

## Definition of done

A Vietnamese-speaking parent and their senior can, on a phone (~360px), be
correctly triaged, walk through the form in Vietnamese, and download a completed
worksheet — no account, nothing about them stored.

## Mandatory verification (run + paste)

- grep for any place a form field or session answer is sent over the network
  (fetch/axios/route/analytics) — confirm **NONE** for student data;
- confirm no analytics captures input;
- confirm ~360px mobile-first;
- confirm no `tailwind.config` added and no component restyled outside the system.

## Content policy

Do **not** fill in real FAFSA/CADAA content — that is a separate human step. Every
explanation ships as a keyed placeholder for later human sourcing.
