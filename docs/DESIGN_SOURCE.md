# AidPilot — Design Source of Truth

> **This document is an inventory, not a new design.** It transcribes the design
> system already committed to this branch. The authoritative artifacts are the
> files themselves — this doc only indexes them so feature work never re-invents
> tokens, components, or conventions.
>
> **The only design sources of truth are:**
> - `app/globals.css` — design tokens, keyframes, animation/utility classes
> - `app/layout.tsx` — font wiring (next/font → CSS variables)
> - `components/ui/**` — the component kit (import from `@/components/ui`)
>
> Do not introduce new colors, fonts, radii, shadows, spacing values, or parallel
> components. If something you need isn't here, extend these files rather than
> inventing alongside them.

---

## v1 scope guardrails (governance)

**v1 is intentionally narrow. These constraints govern all v1 work:**

- **ZERO student PII.** v1 does not collect, store, or transmit personally
  identifiable student information.
- **No database of student data.** There is no student-data store in v1.
- **No scholarship engine / scholarship database.**

**Document status — what is and isn't current scope:**

| Doc | Status |
|---|---|
| `docs/DESIGN_SOURCE.md` (this file) | **Current** — governs v1 UI/UX & design. |
| `docs/database-expansion.md` | **Historical / superseded.** NOT a requirement. Contradicts "no student DB." |
| `docs/scholarship-sources.md` | **Historical / superseded.** NOT a requirement. Contradicts "no scholarship engine." |
| `docs/fafsa-workflow-map.md` | **Reference only.** Useful background, not scope. |
| `docs/user-research.md` | **Reference only.** Useful background, not scope. |

If any historical/reference doc appears to require a feature that conflicts with
the guardrails above, **the guardrails win** — do not build it for v1.

---

## 0. Provenance & gaps found

- Tokens in `globals.css` are annotated "transcribed verbatim from the Claude
  Design handoff (`docs/design-system/project/tokens/*`)". **That handoff
  directory does not exist in this repo** (checked working tree + `overhaul` +
  `main`). The committed CSS is therefore the canonical copy — there is no
  upstream token file to reconcile against.
- **`docs/SPEC.md` does not exist** anywhere in the repo or on any branch. The
  request referenced "the UI/UX section of `/docs/SPEC.md`" as a source of
  truth, but there is no such file. The `docs/` folder contains only:
  `database-expansion.md`, `fafsa-workflow-map.md`, `scholarship-sources.md`,
  `user-research.md` — none of which cover UI/UX, and their scope status is
  recorded in "v1 scope guardrails" above (two are historical/superseded, two are
  reference-only). **If a SPEC.md is expected, it needs to be supplied or written;
  until then the code is the sole UI/UX source.**
- **There is no `tailwind.config.*`.** Styling is Tailwind v4 via a single
  `@import "tailwindcss";` at the top of `globals.css`; theming is done with
  plain CSS custom properties (not `@theme` / Tailwind tokens). Component styling
  is overwhelmingly **inline `style={}` objects referencing `var(--…)`**, not
  utility classes. Tailwind classes appear only for layout scaffolding.

---

## 1. Fonts (`app/layout.tsx`)

Three Google fonts via `next/font`, exposed as CSS variables on `<html>`:

| Family | Variable | Weights | Role | Token |
|---|---|---|---|---|
| **Nunito** | `--font-nunito` | 700, 800, 900 | Display / headings ("font-display") | `--font-display` |
| **Hanken Grotesk** | `--font-hanken` | 400, 500, 600, 700, 800 | Body & UI (default `body` font) | `--font-body` |
| **Rubik** | `--font-rubik` | 500, 600, 700, 800 | Metric face — money, counts, % in stat boxes | `--font-metric` |

- `body` defaults to `--font-body`; `.font-display` (defined in globals) switches
  to Nunito. Use `var(--font-metric)` for large numeric figures (see `StatCard`).
- `<html>` also carries `h-full antialiased`; `<body>` is `min-h-full flex flex-col`.

---

## 2. Design tokens (`app/globals.css` `:root`)

All values below are **defined**, not proposed. Reference by `var(--…)`.

### Color — raw palette
- **Blue (trust / primary):** `--blue-900 #094b8e`, `--blue-700 #0b5cad`,
  `--blue-500 #3e86d6`, `--blue-300 #a9c7ee`, `--blue-200 #d7e7fb`,
  `--blue-100 #eaf3ff`, `--blue-50 #f4f8fe`
- **Green (safe / complete):** `--green-700 #15803d`, `--green-600 #15885a`,
  `--green-200 #d5f0e2`, `--green-100 #eafbf1`
- **Amber (due soon):** `--amber-700 #b45309`, `--amber-600 #b7791f`,
  `--amber-200 #f2e6c8`, `--amber-100 #fff7e6`
- **Coral (risk / missing):** `--coral-700 #b91c1c`, `--coral-600 #c04e57`,
  `--coral-200 #f4d2d6`, `--coral-100 #ffe4e6`
- **Ink & neutrals (navy-gray, never pure black):** `--ink-900 #15212e`,
  `--ink-800 #1f2937`, `--ink-700 #374151`, `--ink-600 #5b6573`,
  `--gray-500 #6b7280`, `--gray-400 #9aa4b2`, `--gray-300 #cbd2da`,
  `--gray-200 #e5e7eb`, `--gray-100 #f3f4f6`, `--white #ffffff`

### Color — semantic aliases (prefer these in features)
- Surfaces: `--surface-page #f9fafb`, `--surface-app #f4f8fe`, `--surface-card #fff`
- Borders: `--border-default`, `--border-card`, `--border-soft`, `--border-nav`,
  `--border-strong`, `--track`
- Brand: `--color-primary` (=blue-700), `--color-primary-hover` (=blue-900),
  `--color-primary-soft` (=blue-100), `--color-link`, `--color-focus-ring`
- Text: `--text-heading` (ink-900), `--text-body` (ink-800),
  `--text-muted` (gray-500), `--text-subtle` (gray-400), `--text-on-brand` (white)
- Status sets (fill / fg / border) for **safe, warn, risk, info, neutral** —
  e.g. `--status-safe-fill/-fg/-border`. These map green→safe, amber→warn,
  coral→risk, blue→info, gray→neutral.

### Gradients (signature)
`--gradient-progress` (blue bar), `--gradient-hero`, `--gradient-auth`,
`--gradient-safe`, `--gradient-warn`, `--gradient-risk`, `--gradient-info`.

### Typography scale
- Weights: `--weight-regular 400` … `--weight-black 900`.
- Sizes: `--text-hero 60` · `--text-display 44` · `--text-h1 30` · `--text-h2 26`
  · `--text-h3 24` · `--text-h4 20` · `--text-lg 19` · `--text-md 17` ·
  `--text-base 15` · `--text-sm 14` · `--text-xs 13` · `--text-2xs 12` ·
  `--text-3xs 11` (px).
- Line height: `--leading-tight 1.03` · `--leading-snug 1.2` ·
  `--leading-normal 1.35` · `--leading-relaxed 1.6`.
- Tracking: `--tracking-hero -1.8px` · `-tight -0.8` · `-snug -0.5` ·
  `-wordmark -0.3` · `-normal 0` · `-eyebrow 0.8`.

### Spacing (loose ~2px rhythm)
`--space-0`…`--space-24` (0, 3, 6, 9, 10, 12, 14, 16, 18, 20, 24, 26, 28, 34, 40,
44, 48, 60 px). Composite pads: `--pad-card 18px 20px`, `--pad-input 13px 16px`,
`--pad-btn 11px 20px`, `--pad-btn-lg 16px 30px`, `--pad-page 36px 44px 72px`.

### Layout widths
`--sidebar-width 232px` · `--content-max 1100px` · `--marketing-max 1280px` ·
`--auth-max 440px`.

### Radii
`--radius-xs 8` · `-nav 11` · `-sm 12` · `-md 14` · `-lg 16` · `-xl 18` ·
`-2xl 20` · `-3xl 24` · `-clay 24` · `-clay-lg 30` · `-pill 999`.

### Shadows (all blue-tinted — never neutral gray)
- Elevation: `--shadow-xs`, `--shadow-card`, `--shadow-card-hover`,
  `--shadow-modal`, `--shadow-lift`, `--shadow-brand`.
- Buttons: `--shadow-btn`, `--shadow-btn-lg`.
- **Claymorphism × Material** (the app-surface signature): `--shadow-clay`,
  `--shadow-clay-sm`, `--shadow-clay-hover`, `--shadow-clay-pressed`,
  `--shadow-clay-brand`, `--shadow-clay-brand-pressed`.

### Borders (composite)
`--border-hairline 1px`, `--border-input 1.5px`, `--border-btn-secondary 1.5px`.

### Motion
`--ease-spring cubic-bezier(0.2,0.7,0.2,1)` · `--ease-standard ease` ·
`--duration-fast .2s` · `--duration-base .45s` · `--duration-slow .8s` ·
`--blur-nav blur(14px)`.

---

## 3. Global classes, keyframes & behaviors (`globals.css`)

- **`.font-display`** — switch to Nunito.
- **Keyframes:** `floaty`, `floaty2`, `dash`, `marquee`, `pop`, `slideIn`,
  `toastIn`, `driftY`, `driftY2`, `sway`, `spin`, `pageIn`.
- **Animation utilities:** `.animate-floaty[/-slow]`, `.animate-floaty2[/-slow]`,
  `.animate-marquee`, `.animate-pop`, `.animate-slide-in`, `.animate-toast-in`,
  `.animate-drift`, `.animate-drift2`, `.animate-sway`.
- **`.page-enter`** — 240ms fade+rise on route change (app chrome stays put).
- **`.stagger-children`** — staggered entrance for a grid/list; caps at 8 kids.
- **`.card-lift`** — hover raises card on `--shadow-card-hover` (−3px translate).
- **`.progress-fill`** — eases width over `--duration-slow`.
- **Focus rings:** `:focus-visible:not(.ap-btn)` gets a 3px `--color-focus-ring`;
  `.ap-btn` variants define their own focus shadows via `[data-variant]`.
- **`.ap-btn`** — resets native button appearance (needed under Tailwind preflight).
- **Marketing layout helpers:** `.hero-section`, `.hero-grid`, `.hero-desk`,
  `.steps-grid` with responsive rules at 960 / 1180 / 720px breakpoints.
- **`prefers-reduced-motion`** disables all animation/transition — honor it.

---

## 4. Component kit (`components/ui`, import from `@/components/ui`)

All components are `"use client"`, style via inline `style` + `var(--…)` tokens,
and accept `className` / `style` passthrough. **Reuse these; do not fork them.**

### Primitives
| Component | Key props | Notes |
|---|---|---|
| **`Icon`** | `name`, `size=20`, `color="currentColor"`, `strokeWidth=2` | 24×24 stroked line set. `ICON_NAMES` exported. Names: `plane, grid, clipboard, file, calendar, letter, gear, shield, shield-check, calendar-check, star, bookmark, check, arrow-right, chevron-left, chevron-down, x, plus`. Unknown name → warns, renders null. |
| **`Logo`** | `variant="full"\|"mark"\|"wordmark"`, `on="light"\|"brand"`, `size=32` | Renders `<img>` from `logo-assets.js` (base64 data URIs: full/mark/word × light/white + `logoAspect`). `on="brand"` = white knockout for blue rail. |

### Buttons
| Component | Key props | Notes |
|---|---|---|
| **`Button`** | `variant="primary"\|"secondary"\|"ghost"\|"clay"`, `size="sm"\|"md"\|"lg"`, `shape="rounded"\|"pill"`, `iconLeft/iconRight` (icon name), `loading`, `disabled`, `fullWidth`, `type` | `clay` = puffy molded blue app button. Carries `.ap-btn` + `data-variant`. Hover deepens color/lifts shadow; press settles. Built-in `Spinner` on `loading`. Font weight 700, `--font-body`. |
| **`IconButton`** | `icon`, `variant="soft"\|"ghost"\|"solid"`, `size="sm"(30)\|"md"(36)\|"lg"(42)`, `active`, `aria-label` | Square, `--radius-sm`. Icon sizes to ~50% of box. |

### Status & display
| Component | Key props | Notes |
|---|---|---|
| **`Badge`** | `tone="green"\|"amber"\|"coral"\|"blue"\|"gray"`, `icon`, `dot` | Pill chip, uses `--status-*` tokens. Weight 800. |
| **`Avatar`** | `initials="AP"`, `src`, `size="sm\|md\|lg\|xl"\|number`, `onBrand` | Soft-blue initials chip; `src` for image. |
| **`ProgressBar`** | `pct=0`, `fill=--gradient-progress`, `height=10`, `track`, `label`, `showValue` | Clamps 0–100; fill eases via `.progress-fill`. |
| **`IconTile`** | `icon`, `tone="blue\|green\|amber\|coral\|brand"`, `size=52`, `radius`, `strokeWidth` | Tinted rounded square behind a feature icon. |
| **`StatCard`** | `label`, `value`, `sub`, `icon`, `tone="blue\|green\|amber\|coral"`, `valueColor` | Clay dashboard metric box; value set in **Rubik** (`--font-metric`), 32px. Hover = tone ring, card stays put. |
| **`StatusPanel`** | `tone="green\|amber\|coral\|blue"`, `icon`, `eyebrow`, `title`, `children`, `trailing` | Soft gradient emotional panel ("Your aid is protected this week"). |
| **`FeatureCard`** | `icon`, `tone`, `title`, `children`, `badge`, `badgeTone` | Lifting white card w/ IconTile + copy + optional corner badge. |
| **`Card`** | `variant="flat"\|"clay"`, `lift`, `padding=20`, `radius`, `as` | Base surface. `flat`=white+hairline+`--shadow-card` (marketing); `clay`=puffy app surface (`--radius-clay`, `--shadow-clay`, no border). |

### Forms
| Component | Key props | Notes |
|---|---|---|
| **`TextField`** | `label`, `hint`, `error`, `icon`, + native input attrs | 14px radius, 1.5px border → blue on focus w/ ring; coral on error. Auto-generates `id` from label. |
| **`Select`** | `label`, `hint`, `error`, `options` (string \| `{value,label}`) | Matches TextField geometry; native `<select>` + custom chevron. |
| **`Checkbox`** | `checked`, `onChange`, `label`, `disabled` | Rounded 20px box, fills blue + white check when on. Controlled. |
| **`OptionCard`** | `selected`, `onClick`, `icon`, `title`, `description` | Onboarding "pick your goals" row; selected = blue border + blue-100 fill + check. `aria-pressed`. |
| **`ChecklistItem`** | `done`, `title`, `sub`, `badge`, `badgeTone`, `popping`, `divider`, `onToggle` | Linear-style task row; circular check fills **green** when done. `popping` plays spring pop. `role="checkbox"`. |

### Navigation & structure
| Component | Key props | Notes |
|---|---|---|
| **`NavItem`** | `icon`, `label`, `active`, `on="brand"\|"light"`, `tag`, `href`, `onClick` | Sidebar rail item. `brand`=blue rail (active→white pill); `light`=white surface. Renders `<a>` if `href` else `<button>`. |
| **`SectionHeading`** | `eyebrow`, `eyebrowTone`, `title`, `subtitle`, `action`, `align="left"\|"center"`, `size="sm"(24)\|"md"(30)\|"lg"(42)` | Uppercase eyebrow over Nunito-900 title. Renders `<h2>`. |
| **`SegmentedControl`** | `options` (string\|`{value,label}`), `value`, `onChange`, `size="sm"\|"md"` | Pill tabs; active = solid blue w/ shadow. |
| **`TabBar`** | `tabs` (`[{key,label,icon}]`), `active`, `onChange` | Clay top-bar nav with a single sliding molded-blue pill (ResizeObserver-tracked). |

---

## 5. Conventions to follow when writing feature UI

1. **Import UI from `@/components/ui`** — never hand-roll a button, card, badge,
   input, nav item, etc. that one of these already covers.
2. **Style with `var(--…)` tokens**, matching the inline-`style` idiom of the kit.
   No hard-coded hex, px radii, or shadows that duplicate an existing token.
3. **Two surface languages:** `flat` (white + hairline + `--shadow-card`) for
   marketing/auth; `clay` (`--shadow-clay*`, `--radius-clay`) for the in-app
   product. Match the surrounding context.
4. **Status semantics are fixed:** green=safe/done, amber=due soon,
   coral=risk/missing, blue=info, gray=neutral. Use the matching `tone`.
5. **Type roles:** Nunito (`.font-display`) for headings, Hanken (body default)
   for UI copy, Rubik (`--font-metric`) for big numeric figures only.
6. **Motion:** reuse the `.animate-*` / `.page-enter` / `.stagger-children` /
   `.card-lift` classes and `--ease-spring`; always safe under reduced-motion
   (globals already guards it).
7. **Never pure black** — text tops out at `--ink-900`; shadows are blue-tinted.
