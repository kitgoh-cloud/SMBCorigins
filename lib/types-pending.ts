/**
 * lib/types-pending.ts — TEMPORARY shim for types pending on evan/api-routes
 *
 * SOURCE: These shapes live on Evan's branch `evan/api-routes` (commit 33f8500)
 *         and are NOT YET on main at the time this file is created.
 *
 * TODO: delete on rebase after evan/api-routes contract sub-PR merges to main.
 *       Once that PR lands, ApplicationCreated and SubscribeToPortfolio live in
 *       @/types/origin and @/lib/api respectively, and lib/api.mock.ts imports
 *       them from there. This file's job is done; remove it.
 *
 * Rebase deletion checklist (per Pattern K in .planning/phases/03-shared-boundary/03-PATTERNS.md):
 *   1. Delete this file: `rm lib/types-pending.ts`
 *   2. In lib/api.mock.ts, change every import `from '@/lib/types-pending'` to:
 *      - `ApplicationCreated` -> `from '@/types/origin'`
 *      - `SubscribeToPortfolio` (or its expanded shape) -> `from '@/lib/api'` (added to OriginAPI)
 *   3. Re-run `npm run typecheck && npm run test`. Both must pass with the new imports
 *      pointing at the canonical location.
 *
 * If you are reading this file post-merge, it should not exist. Open an issue.
 */

import type {
  Application,
  IntakeToken,
  PortfolioItem,
} from '@/types/origin'

/**
 * Composite return of `createApplication` per evan/api-routes (commit 33f8500).
 * On main, `createApplication` returns `Promise<Application>` only.
 * The pending sub-PR changes the return to `Promise<ApplicationCreated>` so the RM
 * receives both the new Application AND the freshly-minted IntakeToken in one round-trip.
 */
export interface ApplicationCreated {
  application: Application
  intakeToken: IntakeToken
}

/**
 * Signature of the new `subscribeToPortfolio` method on OriginAPI per evan/api-routes.
 * Returns a Promise<unsubscribe> for parity with Supabase Realtime's async subscribe API.
 * The `onUpdate` callback receives the full latest PortfolioItem[] each time the store mutates;
 * mock's internal emitter is synchronous, but the public surface is Promise-returning so
 * the real Supabase implementation can return a Promise<RealtimeChannel.unsubscribe>.
 *
 * Consumer hook pattern (Phase 5/6, NOT Phase 3 — included for context):
 *   useEffect(() => {
 *     let cancelled = false; let unsub: (() => void) | null = null
 *     api.subscribeToPortfolio(rmUserId, items => { if (!cancelled) setItems(items) })
 *       .then(u => { if (cancelled) u(); else unsub = u })
 *     return () => { cancelled = true; unsub?.() }
 *   }, [rmUserId])
 */
export type SubscribeToPortfolio = (
  rmUserId: string,
  onUpdate: (items: PortfolioItem[]) => void,
) => Promise<() => void>
