# Icon

The AidPilot line-icon set — 24×24 stroked glyphs (round caps/joins) taken straight from the product. Use it anywhere the UI needs an icon; it inherits text color via `currentColor`.

```jsx
<Icon name="shield" size={18} />
<Icon name="star" color="#0B5CAD" />
<Icon name="check" strokeWidth={3} color="#15885A" />
```

- **Names**: `plane`, `grid`, `clipboard`, `file`, `calendar`, `letter`, `gear`, `shield`, `shield-check`, `calendar-check`, `star`, `bookmark`, `check`, `arrow-right`, `chevron-left`, `chevron-down`, `x`, `plus` (also exported as `ICON_NAMES`).
- `plane` is the AidPilot brand glyph — prefer the `Logo` component for the full lockup.
- Nav/UI icons render at stroke 2; check marks are drawn heavier (stroke 3) in context.
- Default `color` is `currentColor`, so an icon inside a colored button or link tints automatically.
