# Badge

Rounded status pill. Tone is semantic in AidPilot: **green** = safe / on-track / complete, **amber** = due soon, **coral** = risk / missing document, **blue** = informational, **gray** = neutral.

```jsx
<Badge tone="green" icon="check">Protected</Badge>
<Badge tone="amber">Due in 8 days</Badge>
<Badge tone="coral" dot>Needs upload</Badge>
<Badge tone="blue">12 new</Badge>
```

- `tone`: `green` | `amber` | `coral` | `blue` (default) | `gray`.
- `icon` adds a leading `Icon`; `dot` adds a small status dot in the tone color.
- Always a full pill, 12px / 800 weight — use it for statuses, counts, and category tags.
