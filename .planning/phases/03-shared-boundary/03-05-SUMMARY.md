---
phase: 03-shared-boundary
plan: 05
subsystem: shared-boundary
tags: [test, vitest, contract-lock, lib-stages]
requires:
  - lib/stages.ts (Evan-authored, co-owned per Plan 03 CODEOWNERS update)
  - vitest.config.ts (Plan 04)
  - npm run test script + vitest devDep (Plan 04)
provides:
  - Compile-time + run-time contract lock on STAGE_NAMES (canonical 6-stage list)
  - Purity contract lock on deriveStages (D-64 — completedAt: null for all stages)
affects:
  - Future PRs touching lib/stages.ts will fail this test if STAGE_NAMES drifts or deriveStages starts populating completedAt directly
tech-stack:
  added: []
  patterns: [Pattern I — co-located vitest tests, third instance]
key-files:
  created:
    - lib/stages.test.ts
  modified: []
decisions:
  - Test file co-located with lib/stages.ts (Pattern I) — third instance after data/seed.test.ts and lib/api.mock.test.ts
  - Used optional chaining `stages[i]?.number` per Pattern J (noUncheckedIndexedAccess discipline) — no `!` non-null assertions
  - Authored 3 separate completedAt:null assertions across currentStage 1, 3, 6 to enforce D-64 across multiple input states
metrics:
  duration: ~3 min
  completed: 2026-04-26
---

# Phase 3 Plan 5: lib/stages Contract Tests Summary

Locked the contract of `lib/stages.ts` (Evan-authored helper Kit's PR adopts via D-57) with a co-located Vitest suite. Two contracts now CI-enforced: STAGE_NAMES is the canonical 6-stage list verbatim per CLAUDE.md `## The six stages`, and deriveStages is pure per D-64 (returns `completedAt: null` for all stages — the mock's `deriveStagesWithTimestamps` post-processor fills timestamps).

## What Was Built

- **`lib/stages.test.ts`** (124 lines, 10 test cases) co-located with the function under test.

Test coverage breakdown:
1. **STAGE_NAMES structure** (2 tests) — exactly 6 entries, names match canon verbatim ('Invite & Intent', 'Entity & Structure', 'Documentation', 'Screening', 'Products & Credit', 'Activation').
2. **deriveStages status mapping** (5 tests) — Kaisei seeded state (currentStage=3 → 1-2 complete, 3 in_progress, 4-6 not_started per D-47); Hayashi invited (currentStage=1); Nakamura activating (currentStage=6); Stage.number 1-indexed; Stage.name matches STAGE_NAMES.
3. **deriveStages purity contract D-64** (3 tests) — `completedAt === null` for ALL stages across currentStage 1, 3, 6.

## Test Results

- `npx vitest run lib/stages.test.ts`: **10/10 passed** (114ms)
- `npm run test` (full Phase 3 suite): **35/35 passed** across 3 test files (data/seed.test.ts, lib/api.mock.test.ts, lib/stages.test.ts) — 8.19s
- `npm run typecheck`: passed
- `npm run lint`: passed

## Patterns Observed

- **Pattern I (co-located vitest test)** — third instance in the project after `data/seed.test.ts` (Plan 04 wave) and `lib/api.mock.test.ts` (Plan 04 wave). Idiom now established: source `foo.ts` → test `foo.test.ts`, header `import { describe, it, expect } from 'vitest'` (globals: false), `@/*` path alias works via vite-tsconfig-paths.
- **Pattern J (noUncheckedIndexedAccess discipline)** — `stages[i]?.number` uses optional chaining; no `!` non-null assertions. Verified via grep (0 matches for `!.` and `: any`).

## Co-ownership Note

`lib/stages.ts` is co-owned per the new CODEOWNERS rule added in Plan 03 (D-58). Any future modification of `lib/stages.ts` requires both Kit and Evan to review the PR. This test file is co-located but does NOT modify `lib/stages.ts` — verified by `git diff lib/stages.ts` returning empty.

## Cross-Plan Verification Closure

Combined with Plan 04's `lib/api.mock.test.ts` `getApplicationDetail` test, the post-processing pipeline is now verified end-to-end:

- **Plan 05 (this plan)** — verifies `deriveStages` returns `completedAt: null` (the contract input).
- **Plan 04** — verifies `getApplicationDetail` calls `deriveStagesWithTimestamps` which fills `completedAt` from `stageCompletionTimes` for stages whose status is `'complete'`.

If a future contributor populates `completedAt` directly inside `deriveStages`, this plan's tests fail. If the mock's post-processor stops calling the helper, Plan 04's tests fail. The two layers are independently locked.

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

- File exists: `/Users/wyekitgoh/Projects/SMBCorigins/lib/stages.test.ts` — FOUND
- Commit exists: `db84baf` — FOUND in `git log`
- `npm run typecheck && npm run lint && npm run test` all exit 0
