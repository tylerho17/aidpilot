# Logo

The AidPilot brand logo — the real artwork: a blue **"A" monogram** whose counter is cut into a paper-plane, beside the two-tone **"Aid"** (ink) / **"Pilot"** (blue) wordmark. Embedded as data URIs so it works in any project with no asset paths.

```jsx
<Logo />                       {/* full lockup, height 32, on light */}
<Logo variant="mark" size={40} />
<Logo on="brand" size={36} />  {/* white knockout for the blue sidebar */}
<Logo variant="wordmark" size={24} />
```

- `variant`: `full` (default), `mark` (A-monogram only), `wordmark` (text only).
- `on="brand"` renders the all-white knockout — the plane shows the surface through it — for the `#0B5CAD` sidebar or any dark/photo background.
- `size` is the rendered **height** in px; width scales to preserve the artwork's aspect (full ≈ 3:1, mark ≈ 1:1, wordmark ≈ 4.8:1).
- For a tiny standalone plane glyph in UI (not the logo), use `<Icon name="plane" />` instead.
