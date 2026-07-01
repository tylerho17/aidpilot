# AidPilot — App UI kit (Claymorphism × Material)

An interactive recreation of the signed-in AidPilot product, restyled in a **Claymorphism × Material** language — puffy, tactile cards with soft molded shadows, chunky rounding, and clear Material affordances — so students *and* parents have an easy, friendly experience. Money and metrics are set in **Rubik** for a professional read; greetings and titles keep the warm Nunito face. Open `index.html` and use the centered top bar to move between tabs.

**Navigation** — `AppTopBar.jsx`: a centered `TabBar` (logo left, tabs middle, profile right). The active tab lifts into a raised molded blue pill. Only **four** destinations, deliberately consolidated:
- **Home** — greeting, "aid protected" panel, Rubik stat boxes, weekly to-dos.
- **FAFSA** — readiness % + step checklist + next action.
- **Aid & Money** — *(Aid Offers + Scholarships merged)*: a decoded aid offer with a stacked cost bar + Rubik breakdown, and scholarship match cards.
- **Docs & Dates** — *(Documents + Deadlines merged)*: deadline cards + document rows.

**Files** — `AppScreens.jsx` (Home, FAFSA) and `AppScreens2.jsx` (Aid & Money, Docs & Dates), built from the design-system components (`Card variant="clay"`, `StatCard`, `Button variant="clay"`, `TabBar`, `StatusPanel`, `Badge`, `IconTile`). Cosmetic only — fake data, no backend.
