# AidPilot - Improvement & Cleanup Backlog

Flagged findings from a whole-repo audit (security · dead code/removal · demo blockers · inefficiency · organization · UI/UX), with a verification pass on every removal candidate. Each item: `[Severity P0–P3] [Effort S/M/L] [Phase]`. `Phase` refers to the overhaul plan (`overhaul` branch). Line numbers are from `main @ 7d571e6`.

> Corrections applied after verification (initial automated audit ran on a smaller model): `lib/supabase.ts` is **not** directly deletable (`app/page.tsx` waitlist uses it); the stray `console.*` are mostly `isDev`-guarded `devLog` (low priority); the 6 feature hooks are all **live** (architectural redundancy, not dead code); the `useUserData` memoization fix must memoize the returned object *inside* the hook (can't wrap a hook call in `useMemo`); the open-redirect fix must guard `//` and `@`, not just `://`.

## A. Remove / stray files - verified safe to delete
| Item | Evidence | Verdict |
|---|---|---|
| `aidpilot-debug.zip` (687 KB) | Full stale copy of the source tree incl. `.DS_Store`, committed at `f471a2f`; zero references | **Delete + gitignore `*.zip`** `[P0][S][Phase 5]` |
| `lib/dashboard-data.ts` | Hardcoded demo arrays; **0 inbound imports** | Delete `[P2][S][Phase 5]` |
| `lib/intelligence/fafsa-workflow-data.ts` | `FAFSA_WORKFLOW_STEP_SEEDS`; superseded by SQL seed `005`; 0 imports | Delete `[P2][S][Phase 5]` |
| `lib/intelligence/scholarship-sources-data.ts` | `SCHOLARSHIP_SOURCE_SEEDS`; superseded by SQL seed `008`; 0 imports | Delete `[P2][S][Phase 5]` |
| `lib/seed.ts` + `lib/demo-data.ts` (344 + 733 lines) | `seed.ts` imports `demo-data.ts`; `seed.ts` has **0 callers** | Delete both (or move to `supabase/seeds/`) `[P2][M][Phase 5]` |
| `public/{next,vercel,window,globe,file}.svg` | Next.js boilerplate; 0 references | Delete `[P3][S][Phase 5]` |
| Dead scholarship-tracker subtree: `components/scholarships/ScholarshipTrackerClient.tsx`, `ScholarshipTrackerList.tsx`, likely `AddScholarshipForm.tsx` + `hooks/useScholarshipTracker.ts` | `/scholarships` renders `components/product/ScholarshipsClient.tsx`; `ScholarshipTrackerClient` imported **nowhere**; the hook is used only by this dead subtree | Re-verify subtree, then delete `[P2][M][Phase 5]` |

> Note: the overhaul replaces the entire presentation layer, so most legacy components (`AppShell` sidebar, `ProductUI`, old `*Client` bodies) become dead as they're superseded - delete on replacement.

## B. Redundancy
- **Three Supabase client entrypoints** (`lib/supabase.ts` legacy singleton vs `lib/supabase/client.ts` + `server.ts`). Migrate `app/page.tsx` waitlist to `@/lib/supabase/client`, delete `lib/supabase.ts`. `[P2][S][Phase 5]`
- **State-management duplication:** `useUserData` (868 lines) + 6 feature hooks each re-auth and re-fetch overlapping tables. Consolidate to one fetch/auth source (or React Query/SWR). `[P1][L][backlog]`
- **Duplicated button styles** across ~23 files - resolved by the `Button` primitive in the overhaul. `[P2][S][done via Phase 1]`
- **SQL "parity" migration churn** (`009, 013, 017, 018, 019`) - optionally fold into one canonical `025_schema_cleanup.sql`. `[P2][M][backlog]`

## C. Security
| Finding | File | Sev | Plan |
|---|---|---|---|
| **Open redirect** - `next` concatenated unvalidated (`${origin}${next}`), exploitable via `@`/`//` | `app/auth/callback/route.ts` | P0 | Phase 5 - allow only `next.startsWith('/') && !next.startsWith('//')`, else `/dashboard` |
| **Admin cache never expires** - revoked admin keeps access until reload | `hooks/useUserData.tsx` (`adminCacheRef`) | P1 | Phase 5 - add ~5-min TTL |
| **No HSTS header** | `middleware.ts` | P2 | Phase 5 - `Strict-Transport-Security` |
| Service-role delete route lacks CSRF + rate-limit | `app/api/account/delete/route.ts` | P1 | backlog (auth-gated; verify `SameSite=Strict`) |
| Feedback insert has no rate-limit / length cap | `supabase/009_*.sql` | P2 | backlog |
| Demo data stored in `localStorage` plaintext | `lib/fafsa-demo-fallback.ts`, `lib/aid-letter-local.ts` | P2 | backlog (keep values synthetic) |

RLS is comprehensively enabled (`auth.uid()`); admin gating is server-side via `is_current_user_scholarship_admin()` RPC - **no critical RLS gaps found**.

## D. Demo blockers (resolved naturally by the overhaul rebuild)
- `"Coming soon"` nav item in the signed-in shell - `components/AppShell.tsx:220` (sidebar removed in overhaul).
- `"More settings coming soon."` - `components/product/SettingsClient.tsx:162`.
- Admin scholarship forms surface **raw Supabase errors** - wrap with `toFriendlyError()` (`lib/friendly-errors.ts`). `[P2][S]`
- Schema-drift fallback banners fire on an incomplete DB - mitigate by seeding a fully-migrated demo DB (all migrations through `024`). `[P1][M]`
- `console.error` on the non-error demo-fallback path (`lib/fafsa-demo-fallback.ts:111,115,128`) → downgrade to `warn`. `[P3][S]`

## E. Inefficiency
- **`useUserData` context value not memoized** → every state change re-renders all consumers (`hooks/useUserData.tsx:858`). Memoize the returned object *inside* `useUserDataState`. `[P1][S][Phase 5]`
- **No DB indexes** on `user_id` / `workflow_step_id` (0 `CREATE INDEX` in any migration) - add `026_indexes.sql`. `[P2][S][Phase 5]`
- Redundant `auth.getSession()/getUser()` across hooks; sequential awaits in `lib/intelligence/seed-global.ts`; per-hook `createClient()` instances. `[P2][M/L][backlog]`

## F. Organization / UI-UX (largely addressed by the overhaul)
- `lib/` has 29 flat files beside 7 domain folders; `components/product/` coexists with 6 feature folders; inconsistent `Client` suffix. Target: domain-first structure + `lib/README.md`. `[P1][M][backlog]`
- Design tokens scattered; **560+ inline `style={{}}`**; only 4 shared primitives; no responsive system - **replaced** by the design-system tokens + `components/ui/` in the overhaul.
