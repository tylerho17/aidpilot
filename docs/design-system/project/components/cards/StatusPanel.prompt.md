# StatusPanel

The soft gradient callout behind AidPilot's emotional status messages. Tone maps to meaning: green protected, amber attention, coral risk, blue info.

```jsx
<StatusPanel tone="green" icon="shield-check" eyebrow="Protected"
  title="Your aid is protected this week."
  trailing={<Badge tone="green">On track</Badge>}>
  We watch your eligibility, enrollment, and requirements so surprises don't cost you money.
</StatusPanel>
```
All parts are optional: `icon`, `eyebrow`, `title`, body (`children`), `trailing`.
