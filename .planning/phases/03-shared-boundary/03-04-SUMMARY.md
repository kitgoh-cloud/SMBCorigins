---
phase: 03-shared-boundary
plan: 04
subsystem: api-mock
tags: [bound-04, mock, api, intake, vitest, pattern-g, pattern-h, pattern-j, pattern-k]

requires:
  - phase: 03-shared-boundary
    plan: 01
    provides: vitest config + test runner script
  - phase: 03-shared-boundary
    plan: 02
    provides: data/seed.ts frozen mock dataset (8 orgs, intake-token fixtures, demoNewClientTemplate)
  - phase: 03-shared-boundary
    plan: 03
    provides: lib/types-pending.ts (ApplicationCreated, SubscribeToPortfolio shim) + lib/stages.ts deriveStages
provides:
  - Full OriginAPI implementation (lib/api.mock.ts, ~567 lines, replaces 29-line stub)
  - All 13 OriginAPI methods + subscribeToPortfolio extension
  - IntakeTokenError class with reason: 'expired' | 'unknown' | 'consumed' (D-54)
  - _createApplicationFull named export returning ApplicationCreated (CONTEXT addendum A-02)
  - In-memory mutable store via lazy structuredClone of frozen seed (Pattern G)
  - Synchronous emitter behind Promise-returning subscribeToPortfolio (Pattern H)
  - must<T> helper for narrowing T | undefined; zero non-null assertions (Pattern J)
  - 15-case Vitest behavior suite (lib/api.mock.test.ts) covering error reasons, idempotency, subscribe lifecycle, composite views
affects:
  - 04+ phases consuming the mock through lib/api.ts proxy
  - Rebase post evan/api-routes-merge (Pattern K — see Rebase TODO below)

tech-stack:
  added: []
  patterns:
    - "Pattern G (runtime side): lazy structuredClone of frozen seed exports into _store; mutations write to _store only"
    - "Pattern H (producer side): synchronous Set<Listener> emitter behind Promise-returning subscribeToPortfolio; consumer hook lives in Phase 5/6"
    - "Pattern J: must<T>(x, label) helper for typed narrowing; zero `!` non-null assertions"
    - "Pattern K consumer: imports ApplicationCreated + SubscribeToPortfolio from lib/types-pending.ts (deletion-on-rebase shim)"

key-files:
  created:
    - lib/api.mock.test.ts
  modified:
    - lib/api.mock.ts

key-decisions:
  - "createApplication on main types as Promise<Application>; the mock implements _createApplicationFull (named export) returning ApplicationCreated, and a thin wrapper unwraps to Application for OriginAPI conformance. Rebase plan: rename _createApplicationFull -> createApplication once lib/api.ts contract changes."
  - "Token entropy via crypto.randomUUID() (T-03-04-01) for both applicationId and tokenStr at runtime; 7-day TTL per D-51 refinement"
  - "submitIntake idempotency: token consumed-check fires BEFORE any mutation. Second call throws IntakeTokenError('consumed'); portfolio length unchanged."
  - "submitIntake materializes Entity + UBO records from demoNewClientTemplate against the same applicationId the token belongs to (Hayashi for tok-fresh-test-001) — Stage 1 -> Stage 2 transition"
  - "Stage post-processing extracted into deriveStagesWithTimestamps helper (D-64) so deriveStages stays pure (returns completedAt: null) and is independently testable in Plan 05"
  - "subscribeToPortfolio's initial emission happens inside the Promise body before resolution; consumer sees data without waiting for the first mutation"

requirements-completed:
  - BOUND-02
  - BOUND-04

duration: ~6 min
completed: 2026-04-26
---

# Phase 03 Plan 04: lib/api.mock.ts Implementation Summary

**Replaced Evan's 29-line OriginAPI stub with a 567-line stateful mock backed by data/seed.ts; ships IntakeTokenError + _createApplicationFull + subscribeToPortfolio with a 15-case Vitest behavior suite (all green).**

## Performance

- **Duration:** ~6 min
- **Started:** 2026-04-26T16:55Z
- **Completed:** 2026-04-26T17:01Z
- **Tasks:** 2 (both `type="auto"`, both committed atomically)
- **Files created:** 1 (lib/api.mock.test.ts, 234 lines)
- **Files modified:** 1 (lib/api.mock.ts: +555 / -17)

## Accomplishments

- **All 13 OriginAPI methods + subscribeToPortfolio implemented end-to-end.** No method throws "mock not implemented yet"; reads return data assembled from `data/seed.ts` via the lazy-cloned `_store`; mutations write to `_store` and call `emit()`.
- **IntakeTokenError surface complete:** `getIntakeByToken` resolves all three reason branches (`unknown` / `expired` / `consumed`) against the seeded fixtures `tok-fresh-test-001`, `tok-expired-test-002`, `tok-consumed-test-003`. Verified by 4 dedicated tests.
- **submitIntake idempotency proven:** the second call after a successful submit throws `IntakeTokenError('consumed')` and leaves `portfolioBefore.length === portfolioAfter.length`. State mutation is gated on `token.isUsed === false`; the consumed flip happens before any application/entity writes.
- **_createApplicationFull composite return matches CONTEXT addendum A-02:** ApplicationCreated `{ application, intakeToken }` with 7-day TTL on the token, `crypto.randomUUID()` for both ids (T-03-04-01 mitigation). Default `createApplication` unwraps to Application to satisfy the current `lib/api.ts` contract.
- **subscribeToPortfolio lifecycle:** initial emission on subscribe (call 1), re-emission on every store mutation (call 2 after `_createApplicationFull`), and `unsubscribe()` halts further callbacks. Test calls `vi.fn()` and asserts call counts.
- **Composite views verified:** `getApplicationDetail('app-kaisei')` returns 6 stages with `completedAt` populated for stages 1+2 (D-64 post-processing) and null for stage 3 in_progress; `getCreditMemo` returns null for Hayashi (Stage 1, no memo) and the populated $50M memo for Kaisei.
- **Pattern J discipline preserved:** `npx tsc --noEmit` exits 0 with `noUncheckedIndexedAccess: true`; zero `!` non-null assertions and zero structural `as <Type>` casts in the implementation. The `structuredClone` call uses `const seed: Store = { ... }` explicit-typing instead of `as Store`.

## Task Commits

1. **Task 4.1: Implement lib/api.mock.ts** — `fc5a7cc` (feat)
2. **Task 4.2: Author lib/api.mock.test.ts** — `ecd2bc8` (test)

## Files Created / Modified

- `lib/api.mock.ts` (REPLACED, 567 lines, +555 / -17) — full OriginAPI implementation. 14 functions exposed on the default export; 4 named exports (`IntakeTokenError`, `_createApplicationFull`, `__resetStoreForTests`, `__clearListenersForTests`).
- `lib/api.mock.test.ts` (NEW, 234 lines) — 15-case behavior suite. Pattern I (co-located, globals: false, explicit imports). `beforeEach` resets module-scoped store + listeners.

## Test Run

```
$ npm run test
Test Files  2 passed (2)
     Tests  25 passed (25)
   Duration  8.20s
```

Two suites: `data/seed.test.ts` (10 invariants, from Plan 02) + `lib/api.mock.test.ts` (15 behavior cases, this plan). Total 25 tests, all green.

## Patterns Established

- **Pattern G (runtime side):** `_store: Store | null = null` + lazy `structuredClone({ organizations: [...seedOrganizations], ... })` on first read. Mutations write to `_store` only; the frozen seed exports are never touched. Page refresh resets `_store` to null on module re-evaluation.
- **Pattern H (producer side):** synchronous `Set<Listener>` emitter; mutations call `emit()` after writing. The public `subscribeToPortfolio` is `async` so it returns `Promise<() => void>` for parity with Supabase Realtime's async API. The consumer-side hook (Phase 5/6) handles the cancelled-sentinel race; not delivered here.
- **Pattern J:** `must<T>(x: T | undefined, label: string): T` helper for typed narrowing inside seed-integrity lookups. Zero non-null assertions in the file.
- **Pattern K (consumer):** `import type { ApplicationCreated, SubscribeToPortfolio } from '@/lib/types-pending'` per Plan 03's shim. JSDoc at the top of the file documents the rebase deletion plan.

## Rebase TODO (Pattern K)

When `evan/api-routes` merges to main:

1. In `lib/api.mock.ts`, change `import type { ApplicationCreated, SubscribeToPortfolio } from '@/lib/types-pending'` to import these from `@/types/origin` (ApplicationCreated) and `@/lib/api` (SubscribeToPortfolio is added to the `OriginAPI` interface there).
2. Delete `lib/types-pending.ts`.
3. Replace `createApplication`'s body with the body of `_createApplicationFull` (the `lib/api.ts` `OriginAPI` contract changes to `Promise<ApplicationCreated>`); decide whether to keep `_createApplicationFull` as an alias or remove it.
4. Run `npm run typecheck && npm run lint && npm run test && npm run build`. All four must exit 0.

## Deviations from Plan

None — plan executed as written. The verification command embedded in Task 4.1 (`tsc --noEmit` + the regex/substring checks) passed first try. Lint exits clean. All 15 new tests pass on first run.

## Notes for Plan 05 / Phase 5+

- `lib/stages.test.ts` (Plan 05) will validate `deriveStages` independently. The `deriveStagesWithTimestamps` post-processor in this file is verified indirectly by the `getApplicationDetail` test in this suite (Kaisei stages 1-2 `completedAt` populated, stage 3 null). Plan 05 should keep `deriveStages` returning `completedAt: null` for ALL stages — the contract relied on by this file.
- Phase 5/6 will add the consumer-side `usePortfolio()` hook wrapping `subscribeToPortfolio` in `useEffect` with the `cancelled` sentinel race guard (Pattern H consumer side, documented in 03-PATTERNS.md lines 768-781).
- For the Act 3 demo flow: `_createApplicationFull({ organizationId: 'org-maritime', rmUserId: 'rm-james', ... })` returns the new Application + token. `submitIntake(<applicationId>, payload)` materializes Entities/UBOs from `demoNewClientTemplate` and emits to subscribers — kanban will update live.

## Threat Surface Notes

All four mitigation-disposition threats from `<threat_model>` satisfied:

- **T-03-04-01 (token entropy):** `crypto.randomUUID()` used for both `applicationId` and `tokenStr` in `_createApplicationFull`. `grep "crypto.randomUUID" lib/api.mock.ts | wc -l` returns 5 (createApplication × 2, plus 3 activity ids). No `Math.random()` or `Date.now()`-derived ids.
- **T-03-04-02 (expiry enforcement):** `getIntakeByToken` checks `Date.now() > Date.parse(record.expiresAt)` BEFORE returning. Test `tok-expired-test-002` (expiresAt 2026-03-01, today is 2026-04-26) asserts the `expired` reason fires.
- **T-03-04-03 (idempotency / replay):** `submitIntake` checks `token.isUsed` BEFORE any mutation. Test asserts portfolio length unchanged after the failed second call.
- **T-03-04-04 (frozen-seed mutation):** `structuredClone` deep-copies on first `getStore()`; the implementation only writes to `_store`. Frozen seed exports remain untouched.
- **T-03-04-06 (test-only export naming):** `__resetStoreForTests` and `__clearListenersForTests` use the double-underscore convention; `_createApplicationFull` uses single underscore for "internal but exposed for tests/future". Production callers reference the default `mockAPI` which excludes the test helpers.

No new threat surface introduced beyond what `<threat_model>` enumerates.

## User Setup Required

None.

## Self-Check: PASSED

Verified after summary write:

- `lib/api.mock.ts` exists, 567 lines — FOUND
- `lib/api.mock.test.ts` exists, 234 lines — FOUND
- Commit `fc5a7cc` (Task 4.1) — FOUND in git log
- Commit `ecd2bc8` (Task 4.2) — FOUND in git log
- `npm run typecheck` exits 0 — VERIFIED
- `npm run lint` exits 0 — VERIFIED
- `npm run test` exits 0 with 25/25 tests passing — VERIFIED
- Plan's verification regex/substring checks all pass (`default`, `error`, `reset`, `full`, `structuredClone`, `uuid`, `latencyMap` present; `nonNullBang`, `structCast` absent) — VERIFIED

---

*Phase: 03-shared-boundary*
*Plan: 04*
*Completed: 2026-04-26*
