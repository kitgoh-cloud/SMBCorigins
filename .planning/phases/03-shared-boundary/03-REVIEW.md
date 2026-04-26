---
phase: 03-shared-boundary
reviewed: 2026-04-26T00:00:00Z
depth: standard
files_reviewed: 11
files_reviewed_list:
  - vitest.config.ts
  - package.json
  - .github/workflows/ci.yml
  - .github/CODEOWNERS
  - data/seed.ts
  - data/seed.test.ts
  - lib/types-pending.ts
  - lib/api.mock.ts
  - lib/api.mock.test.ts
  - lib/stages.test.ts
  - CLAUDE.md
findings:
  critical: 0
  warning: 3
  info: 4
  total: 7
status: issues_found
---

# Phase 3: Code Review Report

**Reviewed:** 2026-04-26
**Depth:** standard
**Files Reviewed:** 11
**Status:** issues_found

## Summary

Phase 3 ships the typed shared boundary (mock API, seed data, contract tests, Vitest runner, CODEOWNERS). Code quality is high overall: zero non-null assertions in source, zero structural `as <Type>` casts, frozen seed exports, explicit `must<T>` narrowing, and `crypto.randomUUID()` for token entropy. CI runs typecheck/lint/test in parallel under least-privilege `permissions: contents: read`. No critical security issues.

Three warnings worth addressing before deeper consumption by Phase 5/6 UI:

1. `submitIntake` does not enforce token expiry — only the `isUsed` flag is checked. T-03-04-02 mitigation lives only in `getIntakeByToken`. An expired-but-unused token would still allow intake to succeed, contradicting the threat-model claim.
2. A time-bomb fixture: `seedIntakeTokens['tok-fresh-test-001'].expiresAt` is hard-coded to `2026-05-03`, only 7 days after the seed's "today." Once that date passes, the "fresh token" test path silently flips to expired and tests start failing for spurious reasons.
3. `submitIntake`'s materialization of `demoNewClientTemplate` does not honor the inline comment that promises parent-link resolution; the MY sub-entity is inserted as an orphan root. The Plan 04 SUMMARY acknowledges this ("Plan 04 keeps parents flat") but the seed-side comment still claims runtime resolution — it will mislead the next contributor.

Four info-level notes cover an unused local, a hard-coded expired-token date, and minor consistency suggestions.

## Warnings

### WR-01: `submitIntake` does not check token expiry

**File:** `lib/api.mock.ts:420-433`
**Issue:** The function looks up an intake token by `applicationId` and rejects only if the token is missing or `isUsed === true`. It does NOT check `expiresAt`. An expired-but-unused token would let intake proceed and consume the token. The threat-model note T-03-04-02 in the Plan 04 SUMMARY claims expiry is enforced, but enforcement lives only in `getIntakeByToken` (line 517). A misbehaving or test-only caller that bypasses `getIntakeByToken` (e.g., reuses an `applicationId` known from another path) would defeat the expiry control.

Additionally, the lookup-by-`applicationId` semantics are surprising: `submitIntake` accepts an `applicationId`, not a token string, so a caller need not actually possess the token to consume it. For a demo this is acceptable; for symmetry with `getIntakeByToken` it should be documented.

**Fix:**
```ts
async function submitIntake(
  applicationId: string,
  payload: IntakePayload,
): Promise<Application> {
  await sleep(LATENCY_MS.submitIntake)
  const store = getStore()

  const token = store.intakeTokens.find(
    (t) => t.applicationId === applicationId,
  )
  if (token === undefined) throw new IntakeTokenError('unknown')
  if (token.isUsed) throw new IntakeTokenError('consumed')
  if (Date.now() > Date.parse(token.expiresAt)) {
    throw new IntakeTokenError('expired')
  }
  // ...rest unchanged
}
```
The current single-error-reason `consumed` collapses three distinct states into one — splitting them matches `getIntakeByToken`'s behavior and makes the threat-model claim true.

### WR-02: Time-bomb in `seedIntakeTokens` — fresh fixture expires May 3

**File:** `data/seed.ts:1553` (and corresponding test at `lib/api.mock.test.ts:59-64`, `data/seed.test.ts:95-104`)
**Issue:** `tok-fresh-test-001` has `expiresAt: '2026-05-03T00:00:00Z'`. Today is 2026-04-26, so the fixture is "fresh" only for ~7 days. Once May 3 passes, the test `'returns IntakeToken for a fresh, valid, unused token'` and the idempotency tests that depend on it will throw `IntakeTokenError('expired')` and the suite goes red without any code change. This is a silent fixture-rot timer.

**Fix:** Compute the expiry relative to a far-future date, or use a fixed-clock pattern. Simplest: bump to `2099-01-01T00:00:00Z` so the fixture is permanently fresh:
```ts
{
  token: 'tok-fresh-test-001',
  applicationId: 'app-hayashi',
  organization: HAYASHI_ORG,
  expiresAt: '2099-01-01T00:00:00Z', // far-future sentinel; survives clock drift
  isUsed: false,
},
```
Alternatively, freeze test-clock with `vi.useFakeTimers({ now: new Date('2026-04-26') })` in `beforeEach` of `lib/api.mock.test.ts` so all expiry comparisons are deterministic regardless of wall-clock.

### WR-03: Misleading comment — parent-link resolution promised, not delivered

**File:** `data/seed.ts:1600` (paired with `lib/api.mock.ts:466`)
**Issue:** The seed template states `parentEntityId: null, // resolved at runtime by submitIntake to the parent's id` for the MY sub-entity, but `submitIntake` does NOT resolve the link — it copies `tplEntity.parentEntityId` verbatim (line 466), so the MY entity is materialized as an orphan root alongside the SG parent. The Plan 04 SUMMARY acknowledges this trade-off ("Plan 04 keeps parents flat — leave as-is"), but the comment in `seed.ts` still asserts runtime resolution. The next contributor reading the seed will assume a resolution step exists and may rely on the parent linkage.

**Fix:** Update the seed comment to reflect actual behavior, or implement the resolution. Lowest-risk path is to fix the comment:
```ts
{
  parentEntityId: null, // FLAT for Phase 3 — submitIntake does NOT resolve to parent.id;
                        // sub appears as an orphan root. Revisit if Phase 5+ needs the tree shape.
  legalName: 'Maritime Robotics Operations Sdn Bhd',
  // ...
},
```
If the tree shape matters for the kanban demo, implement two-pass materialization in `submitIntake`: first pass creates parents, second pass maps `parentEntityId` (looked up by `legalName` or template index) to the freshly-minted `id`.

## Info

### IN-01: Unused local `newEntityIds` in `submitIntake`

**File:** `lib/api.mock.ts:453, 458`
**Issue:** The local `const newEntityIds: string[] = []` is populated via `newEntityIds.push(newId)` inside the entity-materialization loop but never read. Likely a leftover from a planned parent-link-resolution second pass that didn't ship (see WR-03).
**Fix:** Either delete the variable, or wire it into the second-pass parent-resolution suggested in WR-03. If keeping it for future use, mark with a comment so the next reviewer doesn't delete it: `// retained for Phase 5 parent-link resolution`.

### IN-02: `seedIntakeTokens['tok-expired-test-002']` also a fixed past date

**File:** `data/seed.ts:1560`
**Issue:** `expiresAt: '2026-03-01T00:00:00Z'` is intentionally past. This is correct *today* (2026-04-26) but is a less acute version of the WR-02 time-bomb in reverse: if the project is ever restarted in a sandboxed environment with clock < 2026-03-01, the "expired" fixture becomes "fresh." Low risk for a 4-week demo, but the same fake-timers fix from WR-02 would cover this too.
**Fix:** Optional. Lock test-clock with `vi.useFakeTimers` if any time-related fixtures multiply.

### IN-03: `vitest.config.ts` `include` glob may match unintended trees

**File:** `vitest.config.ts:9`
**Issue:** `include: ['**/*.test.ts']` matches every `*.test.ts` under the project root. Vitest defaults exclude `node_modules` so the practical risk is low, but as `.planning/`, `.claude/worktrees/`, or future demo scratch directories accumulate, a stray `*.test.ts` will be picked up and run. Tighter glob makes the test surface explicit.
**Fix:**
```ts
include: ['data/**/*.test.ts', 'lib/**/*.test.ts', 'app/**/*.test.ts', 'components/**/*.test.ts'],
```
Or add `exclude: ['.planning/**', '.claude/**']` alongside the existing default excludes.

### IN-04: `vite-tsconfig-paths` deprecation note recorded but not actioned

**File:** `vitest.config.ts:2,5`
**Issue:** The Plan 01 SUMMARY records: "Vitest emits a deprecation note: `vite-tsconfig-paths is detected. Vite now supports tsconfig paths resolution natively via the resolve.tsconfigPaths option.`" The plugin is installed and listed as a devDependency. Migrating to native `resolve.tsconfigPaths` would drop one dependency.
**Fix:** Track for a follow-up cleanup (already noted in Plan 01 SUMMARY as "future cleanup candidate"). No change required for this phase.

---

## Notes (not findings)

- **Pattern compliance:** Zero `!` non-null assertions and zero structural `as <Type>` casts in source files (verified by grep). The two `as const` literals in `seed.ts` `demoNewClientTemplate` are sanctioned and minimal.
- **Security:** No hardcoded secrets, no `eval`, no `Math.random` for token entropy (verified). `crypto.randomUUID()` used for all id minting in the mutation paths. CI workflow is least-privilege (`permissions: contents: read`) at workflow root.
- **Test isolation:** `beforeEach` in `lib/api.mock.test.ts` calls both `__resetStoreForTests()` and `__clearListenersForTests()`, preventing module-scoped state leak across cases. Good.
- **CODEOWNERS:** `lib/stages.ts` correctly placed in the co-owned block after `lib/api.ts`, matching the position-as-signal convention from D-58. The Kit-owned line for `lib/api.mock.ts` lists Evan first as required reviewer (`@kitgoh-cloud @evangohAIO`) — rule is reasonable.
- **The two `TODO` comments** flagged by the debug-artifact regex are the intentional Pattern K rebase-deletion markers in `lib/types-pending.ts` and `lib/api.mock.ts`. Not findings.

---

_Reviewed: 2026-04-26_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
