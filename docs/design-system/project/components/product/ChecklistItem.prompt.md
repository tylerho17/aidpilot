# ChecklistItem

The interactive task row from AidPilot's checklist. A rounded check chip (green + white check when done) beside a title/sub and a trailing status badge. Clicking anywhere toggles it.

```jsx
<ChecklistItem title="Submit your FAFSA" sub="Federal aid application" done />
<ChecklistItem title="Upload your 2024 tax return" sub="Needed for verification"
  badge="Needs upload" badgeTone="coral" onToggle={...} />
```
Pass `popping` briefly after completion to play the spring "pop" feedback.
