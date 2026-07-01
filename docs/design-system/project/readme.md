# AidPilot Design System

**AidPilot is a financial-aid copilot for students.** It helps students protect their financial aid, avoid FAFSA mistakes, track documents and deadlines, understand aid offers in plain language, and find more scholarship money — with one calm check-in a week. The product promise is emotional as much as functional: *"Financial aid, finally on your side."*

This design system captures AidPilot's real, shipping visual language so any agent can build on-brand screens, marketing pages, decks, and prototypes. It is built **on top of the existing product**, not a reinvention — every token, component, and pattern here is transcribed from the live codebase and the designer's own rationale.

---

## Sources

Everything here was reverse-engineered from materials the AidPilot team provided. You may not have access, but they are recorded so you (or a teammate who does) can go deeper:

- **Codebase — source of truth:** `github.com/tylerho17/aidpilot` — a Next.js 16 + React 19 + Tailwind v4 + Supabase app. The design language lives in `app/globals.css`, `app/layout.tsx` (fonts), `components/AppShell.tsx`, `components/ProductUI.tsx`, `components/AuthShell.tsx`, `app/page.tsx` (marketing), `app/onboarding/`, and `components/product/*`. Explore this repo to build higher-fidelity work than this system alone captures.
- **Figma — "AidPilot v0.1 Product Design":** a moodboard, a documented **Visual System** page (Cards, Checklist Rows, Status Badges, Sidebar, Typography, and a written **Color Rationale**), and 15 product screens. The Figma uses Inter as a placeholder; **the codebase's fonts (Nunito + Hanken Grotesk) win.**
- A read-only mirror of the imported source sits under `_source/` in this project for reference — it is **not** part of the shipped system.

> **Font note:** AidPilot loads **Nunito** and **Hanken Grotesk** from Google Fonts (via `next/font/google`). This system loads the exact same families from Google Fonts — no substitution was needed. If you later self-host, drop the `.woff2` files in `assets/fonts/` and swap the `@import` in `tokens/fonts.css` for `@font-face` rules.

---

## Content fundamentals

AidPilot's voice is a **calm coach for a stressed student**. Money and financial aid are anxiety-inducing; every word works to lower the temperature.

- **Person & address.** Speak to the student as **"you"**; the product is **"AidPilot"** or **"we"** ("We found money for you this week"). Warm, direct, never institutional.
- **Tone: reassuring, not alarmist.** Amber means *"pay attention," not "you're doomed."* Deadlines are "caught early," documents "become simple next steps." Even risk is framed gently ("Needs upload," not "MISSING — ACTION REQUIRED").
- **Plain language over jargon.** Translate the aid world: "Understand your aid offer in plain language," "what you're actually paying." Avoid insider terms (SAI, verification hold) unless immediately explained.
- **Encouraging micro-copy.** The product literally coaches: *"You're doing great, 2 to go." · "Nice work, Maya. One less thing to worry about." · "Every task done. You're fully protected."*
- **Casing.** Sentence case everywhere — headlines, buttons, labels. Uppercase is reserved for tiny tracked **eyebrows** ("THE PRODUCT", "YOUR WEEKLY CHECK-IN") and micro-labels ("COMING SOON").
- **Honesty & trust.** AidPilot is careful to say what it is *not*: not affiliated with FAFSA/ED, doesn't submit forms, doesn't collect SSNs or tax docs, can't guarantee aid. Trust copy appears under forms and in the FAQ.
- **Numbers are the hero.** Dollar amounts and countdowns ("$18,400", "8 days", "12 new") are set big in the display face — they're the proof the product is working.
- **Emoji: essentially none.** The UI uses its own line-icon set instead of emoji. Keep emoji out of product and marketing copy.

**In one line:** *plain, warm, second-person, specific, and calm — a knowledgeable friend who's got your back.*

---

## Visual foundations

A single **trust-blue** system, kept calm by soft off-white canvases and warmed by three soft status tints. Nothing is loud.

- **Color.** One saturated brand blue — **`#0B5CAD`** — is reserved for actions, links, active nav, and the brand. Backgrounds are soft off-whites (`#F9FAFB` marketing, `#F4F8FE` app) so the interface feels "calm, clean, and official… less harsh for students dealing with stressful tasks." Status is carried by three soft tints — **green** = safe/protected/on-track, **amber** = due-soon/attention, **coral** = friendly risk/missing — each a pale fill + a readable foreground. Text is navy-gray (`#1F2937`), never pure black. (See `tokens/colors.css` for the full palette and the designer's per-color rationale.)
- **Typography.** Three families. **Nunito** (700/800/900) — rounded, friendly, heavy — carries display: headlines, section titles, greetings, and the wordmark, with tight negative tracking (down to −1.8px on the hero). **Hanken Grotesk** (400–800) — a clean humanist grotesque — handles all body and UI text at a comfortable 1.55–1.6 line height. **Rubik** (500–800) is the **metric face**: money, day-counts, and percentages in the big dashboard boxes are set in Rubik so they read precise and professional for parents (Nunito is too playful there). The pairing = warmth where it reassures, precision where it counts.
- **Surface treatments.** Two, by surface: the **signed-in app** uses **Claymorphism × Material** — puffy, tactile cards with soft molded shadows (`--shadow-clay*`), chunky rounding (`--radius-clay`), and clear Material affordances, for an easy student-and-parent experience. The **marketing site** is **skeuomorphic** — paper, sticky notes, tape, stamps, and a pencil stage the real paper mess of college aid, then show AidPilot clearing it.
- **Backgrounds.** Flat soft-white canvases, not imagery. Marketing sections alternate white and the pale blue/green washes. The hero uses a subtle vertical `#FFFFFF → #F4F8FE` gradient with **floating organic "blob" shapes** (`#EAF3FF`, `#EAFBF1`) drifting behind the content, plus a dashed animated flight-path line. Auth/onboarding sit on a `#F4F8FE → #EAFBF1` gradient. No photography, no heavy textures.
- **Cards.** White, a **hairline blue-tinted border** (`#E6EDF6`), generous radius (18–24px), and a **soft, far-throw blue-tinted shadow** (`0 16px 34px -24px rgba(11,92,173,.18)`). On hover they **lift 3px** onto a stronger blue shadow. Clarity and separation are the goal — "each task, deadline, scholarship feels separate and easy to understand."
- **Shadows are always blue.** The entire elevation system is tinted `rgba(11,92,173,…)` — never neutral gray. This ties every floating surface back to the brand. Buttons get a tighter, more saturated blue glow.
- **Corners.** Everything is rounded: inputs & primary buttons at 14, cards 18–24, nav items 12, and **full pills (999px)** for badges, status chips, avatars, and secondary/nav buttons.
- **Borders.** Soft and structural, never heavy: `#E5E7EB` on inputs/dividers, `#E6EDF6`/`#E9EDF2` on cards. Inputs use a **1.5px** border that turns brand-blue with a 3px soft focus ring.
- **Motion.** Calm and springy. The signature easing is **`cubic-bezier(.2,.7,.2,1)`**. Blobs drift on 7–15s float loops; cards lift on hover; a completed checkbox does one **0.42s spring "pop"**; progress bars ease their width over 0.8s; toasts and content slide-fade in. Everything is disabled under `prefers-reduced-motion`.
- **Hover / press.** Primary buttons deepen `#0B5CAD → #094B8E` and raise their shadow on hover; press nudges down 1px. Secondary buttons pick up a faint blue tint. Cards lift. No aggressive scale or color flips.
- **Transparency & blur.** Used sparingly and purposefully: the marketing nav is a glass bar (`rgba(255,255,255,.86)` + `blur(14px)`); the blue sidebar layers translucent-white panels (`rgba(255,255,255,.08–.18)`) for the profile chip, plan card, and active states.
- **Layout.** Marketing: sticky glass nav, centered ~1180–1280px sections, big centered eyebrow+headline blocks. App: a fixed **232px blue sidebar** + a `#F4F8FE` content region capped at ~1100px with `36–44px` padding. Generous whitespace throughout.

---

## Iconography

AidPilot ships its **own hand-built line-icon set** — there is no third-party icon library and no icon font in the codebase; every glyph is an inline SVG.

- **Style.** 24×24 viewBox, **stroke-only** (no fills), **2px** stroke, round caps and joins — a Lucide-like humanist line style. Check marks are drawn heavier (stroke ~3). Icons inherit `currentColor`.
- **The set** (reproduced verbatim in `components/icon/Icon.jsx`): `plane` (the brand mark), `grid`, `clipboard`, `file`, `calendar`, `letter`, `gear`, `shield`, `shield-check`, `calendar-check`, `star`, `bookmark`, `check`, plus directional `arrow-right`, `chevron-left`, `chevron-down`, `x`, `plus`. Use `<Icon name="…" />`.
- **The logo** is the **"A" monogram** — a bold blue *A* whose counter is cut into an upward paper-plane — locked up with the two-tone **Aid**/**Pilot** wordmark. Assets: `assets/aidpilot-logo.png` (full lockup), `assets/aidpilot-mark.png` (monogram), `assets/aidpilot-wordmark.png`, each with a `-white` knockout for dark/blue surfaces. The `Logo` component embeds this artwork as data URIs, so `<Logo />` works in any project. (The small `plane` glyph in the `Icon` set is a separate UI accent, not the brand mark.)
- **Icon tiles.** Icons frequently sit in a soft **tinted rounded square** (`IconTile`) — blue/green/amber/coral fills behind feature icons, auth headers, and empty states.
- **Emoji / unicode as icons: no.** Always use the line-icon set. (The marketing marquee uses tiny college-crest SVGs as logos, but those are content, not UI icons.)

---

## Using this system

Consumers link **one file** — `styles.css` (project root) — which `@import`s every token and font. Components are exposed on the global namespace after the bundle loads:

```html
<link rel="stylesheet" href="styles.css" />
<script src="_ds_bundle.js"></script>
<script>
  const { Button, Card, Badge, StatusPanel, Icon, Logo } = window.AidPilotDesignSystem_59a3d7;
</script>
```

Reach for tokens via CSS custom properties (`var(--blue-700)`, `var(--font-display)`, `var(--shadow-card)`) rather than hard-coded values.

---

## Index / manifest

**Foundations**
- `styles.css` — global entry (import-only manifest)
- `tokens/fonts.css` · `colors.css` · `typography.css` · `spacing.css` · `effects.css` · `base.css`
- `guidelines/foundations/*.card.html` — specimen cards (Colors, Type, Spacing, Brand)

**Assets** — `assets/aidpilot-logo.png` (+ `-white`), `aidpilot-mark.png` (+ `-white`), `aidpilot-wordmark.png` (+ `-white`); the master upload lives at `uploads/AidPilotLogo0.png`

**Components** (`window.AidPilotDesignSystem_59a3d7`)
- Brand: `Logo`
- Icon: `Icon` (+ `ICON_NAMES`)
- Buttons: `Button`, `IconButton`
- Forms: `TextField`, `Select`, `Checkbox`, `OptionCard`
- Data display: `Badge`, `Avatar`, `ProgressBar`
- Cards & surfaces: `Card` (`variant="clay"`), `IconTile`, `StatCard` (Rubik metrics), `StatusPanel`, `FeatureCard`
- Product patterns: `TabBar` (top-bar nav), `NavItem`, `SegmentedControl`, `ChecklistItem`, `SectionHeading`

**UI kits** — `ui_kits/marketing/` (landing page) · `ui_kits/app/` (signed-in product)

**Reference** — `_source/` (imported AidPilot code, read-only) · `SKILL.md` (Agent-Skill entry)
