# AGENT_RULES — AidPilot v1 (non-negotiable)

> These rules bind **every phase, every file**. They override convenience,
> assumptions, and anything in historical docs. Pairs with `docs/SPEC.md` (what)
> and `docs/DESIGN_SOURCE.md` (how it looks).

1. **Zero student PII leaves the browser.** No API route, log, analytics call, or
   DB write may ever receive a name, financial figure, document, or identifier.
   All answers live in **client-side session state only**.

2. **Never write or generate FAFSA/CADAA guidance content.** Every explanation is
   a TODO placeholder keyed for later human sourcing. Do not invent aid advice.

3. **No auth, no login, no accounts.**

4. **Match the EXISTING design exactly.** Tailwind v4 + CSS custom properties,
   styling via inline `style={{ }}` with `var(--…)`, and the 21 existing
   `@/components/ui` components. No `tailwind.config`, no utility-class restyle, no
   new component library. Honor **flat** (marketing/auth) vs **clay** (in-app)
   surfaces and status colors (green=safe, amber=due-soon, coral=risk, blue=info,
   gray=neutral).

5. **All user-facing text via i18n keys**, locales EN/ES/VI. EN real; ES/VI
   stubbed `NEEDS_NATIVE_REVIEW`. No hardcoded strings.

6. **Never submits to any government site; never handles credentials.** It
   prepares a worksheet; the student signs/submits on the official site
   themselves.
