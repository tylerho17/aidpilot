# IconButton

Compact square button carrying a single `Icon`. `soft` (blue tint on the app wash), `ghost` (transparent), or `solid` (brand blue). Always pass `aria-label`.

```jsx
<IconButton icon="bookmark" aria-label="Save scholarship" />
<IconButton icon="x" variant="ghost" aria-label="Dismiss" />
<IconButton icon="plus" variant="solid" aria-label="Add" />
```

- `variant`: `soft` (default), `ghost`, `solid`.
- `size`: `sm` (30), `md` (36), `lg` (42).
- `active` tints soft/ghost blue (e.g. a bookmarked state).
