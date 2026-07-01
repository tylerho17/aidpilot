# Button

The AidPilot action button. Primary is the saturated trust-blue with a soft blue-tinted shadow that lifts on hover; secondary is a white outline for lower-priority actions; ghost is text-only.

```jsx
<Button>Join early access</Button>
<Button size="lg" iconRight="arrow-right">See demo</Button>
<Button variant="secondary">Log in</Button>
<Button variant="primary" shape="pill">Log out</Button>
<Button loading fullWidth>Log in</Button>
```

- `variant`: `primary` (default), `secondary`, `ghost`.
- `size`: `sm`, `md` (default), `lg` (hero CTA).
- `shape`: `rounded` (default, 14px) or `pill` (nav / logout).
- `iconLeft` / `iconRight` take an `Icon` name; `loading` swaps in a spinner.
- Hover deepens primary to `--blue-900` and raises the shadow; press nudges down 1px. Disabled goes gray.
