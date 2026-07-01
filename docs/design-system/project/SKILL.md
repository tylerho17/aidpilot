---
name: aidpilot-design
description: Use this skill to generate well-branded interfaces and assets for AidPilot — the financial-aid copilot for students — either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

## Where things are
- `readme.md` — the full design guide: content voice, visual foundations, iconography, and a manifest.
- `styles.css` — the single stylesheet to link; it `@import`s every token + font (`tokens/*.css`).
- `components/` — React UI primitives (`<Name>.jsx` + `.d.ts` + `.prompt.md`). Load `_ds_bundle.js` and read from `window.AidPilotDesignSystem_59a3d7`.
- `guidelines/foundations/*.card.html` — specimen cards (Colors, Type, Spacing, Brand).
- `ui_kits/marketing/` and `ui_kits/app/` — full interactive screen recreations to learn layout patterns from.
- `assets/` — the logo artwork (`aidpilot-logo.png`, `aidpilot-mark.png`, `-white` knockouts).

## The essentials
- **One trust-blue** (`#0B5CAD`) for all actions; soft off-white canvases (`#F9FAFB` / `#F4F8FE`); three soft status tints (green safe, amber attention, coral risk). Navy-gray text, never black.
- **Nunito** for display/headlines/numbers (900, tight tracking); **Hanken Grotesk** for all body/UI.
- **Blue-tinted shadows** everywhere (never gray), generous rounding (14–24px, full pills), 1.5px focus-blue inputs.
- **Voice:** calm coach — plain, warm, second-person, reassuring, specific. No jargon, no emoji, no alarm.
- **Logo:** the "A" monogram with a paper-plane counter + two-tone wordmark. Use the `-white` knockout on blue/dark.
