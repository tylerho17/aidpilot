# AidPilot — Marketing UI kit (skeuomorphic)

A **skeuomorphic** landing page: it stages the messy *paper* world of college aid — a manila folder, a checklist sheet with a rubber stamp, sticky notes, tape, a paperclip, a pencil — and shows AidPilot clearing the desk. Real-world objects make an abstract product instantly legible. Open `index.html`; the CTA scrolls to a working email capture on a sheet of lined paper.

**Sections**
- `MarketingNav.jsx` — glassy nav: `Logo` + "See demo" + one pill CTA.
- `MarketingHero.jsx` — the desk scene: a **FAFSA checklist on lined paper** (real checkboxes + an "On track" stamp + the AidPilot mark), an amber "Cal Grant due!" sticky, a green "$24,500 found" sticky (Rubik), a manila folder, and a pencil — beside the headline **"Financial aid, minus the mess."** (with a highlighter swipe). Exports the reusable skeuomorphic pieces (`Sticky`, `Tape`, `Stamp`, `Pencil`, `Highlight`).
- `MarketingSections.jsx` — `HowItWorks`: three paper step-cards (Protect · Track · Find) taped down and joined by a **dashed pencil trail**. `Closer`: a lined-paper sheet with a paperclip + "Approved" stamp + email capture. Minimal footer.

Intent: creative and tactile, but clear and uncluttered — a handful of well-composed objects, one message, one CTA. Metrics use Rubik; headlines use Nunito. Cosmetic only.
