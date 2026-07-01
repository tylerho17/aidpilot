# OptionCard

Selectable card for the onboarding "pick your goals / interests" step. Selected gets a blue border, soft-blue fill, and a check. Drive `selected` yourself for single- or multi-select.

```jsx
<OptionCard icon="shield" title="Protect my aid"
  description="Watch eligibility and requirements"
  selected={goal === "protect"} onClick={() => setGoal("protect")} />
```
