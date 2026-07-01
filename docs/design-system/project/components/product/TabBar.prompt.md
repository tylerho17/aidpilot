# TabBar

Centered top-bar tab navigation — the AidPilot app's primary nav. A softly recessed track holds a small set of tabs; the active one lifts into a raised, molded brand-blue pill (Claymorphism × Material) so students and parents always know where they are.

```jsx
<TabBar active={tab} onChange={setTab} tabs={[
  { key: "home", label: "Home", icon: "grid" },
  { key: "fafsa", label: "FAFSA", icon: "clipboard" },
  { key: "money", label: "Aid & Money", icon: "star" },
  { key: "tasks", label: "Docs & Dates", icon: "calendar" },
]} />
```

Keep the tab set small (4–5). Pair it with the `Logo` on the left and an `Avatar` on the right for the full top bar.
