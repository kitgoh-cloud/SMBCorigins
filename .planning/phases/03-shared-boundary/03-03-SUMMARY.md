---
phase: 03-shared-boundary
plan: 03
subsystem: shared-boundary
tags: [governance, types, codeowners, cross-gsd]
tasks_completed: 2
tasks_total: 2
requires:
  - types/origin.ts (Application, IntakeToken, PortfolioItem types — already on main)
provides:
  - lib/types-pending.ts (temporary shim for ApplicationCreated + SubscribeToPortfolio)
  - .github/CODEOWNERS rule for lib/stages.ts (co-owned auto-review)
affects:
  - lib/api.mock.ts (Plan 04 will import from lib/types-pending.ts)
  - Future PRs touching lib/stages.ts (auto-request Kit + Evan)
tech-stack:
  added: []
  patterns:
    - "Pattern K: Temporary type shim for cross-GSD timing dependencies"
key-files:
  created:
    - lib/types-pending.ts
  modified:
    - .github/CODEOWNERS
decisions:
  - "Adopted Pattern K (temporary type shim) for cross-GSD timing — lib/types-pending.ts named, deletable, JSDoc-documented"
  - "CODEOWNERS lib/stages.ts entry grouped with co-owned contract surfaces (D-58, NOT alphabetical)"
metrics:
  duration: ~3 minutes
  completed: 2026-04-26T08:45:14Z
---

# Phase 03 Plan 03: Pending-Types Shim + CODEOWNERS Surface Summary

**One-liner:** Created the `lib/types-pending.ts` shim (ApplicationCreated + SubscribeToPortfolio) that lets Plan 04's mock compile against `evan/api-routes` shapes before that sub-PR merges, and added `lib/stages.ts` to `.github/CODEOWNERS` in the co-owned contract-surface block per D-58.

## What Shipped

### Files Created

- **`lib/types-pending.ts`** (58 lines) — Temporary shim re-declaring two types that live on Evan's `evan/api-routes` branch but are not yet on `main`:
  - `interface ApplicationCreated { application: Application; intakeToken: IntakeToken }` — composite return for `createApplication`
  - `type SubscribeToPortfolio = (rmUserId, onUpdate) => Promise<() => void>` — Promise-returning subscribe signature
  - Type-only imports from `@/types/origin` (no runtime code)
  - Header JSDoc names the source branch (`evan/api-routes`, commit `33f8500`) and embeds the rebase deletion checklist verbatim from Pattern K

### Files Modified

- **`.github/CODEOWNERS`** — One line added inside the "Co-owned: typed boundary surface" block, between `lib/api.ts` and the comment header for the Kit-owned block:

  ```
  lib/stages.ts            @kitgoh-cloud @evangohAIO
  ```

  Position deliberately NOT alphabetical (D-58: position is signal — this is contract surface).

## Verification

- `npx tsc --noEmit` exits 0 — `lib/types-pending.ts` imports resolve and types are valid
- Substring checks pass: `TODO: delete on rebase`, `evan/api-routes`, `ApplicationCreated`, `SubscribeToPortfolio`
- Ordering check passes: `lib/api.ts` < `lib/stages.ts` < `lib/api.mock.ts` (line indexes 16 < 17 < 20)
- CODEOWNERS retains trailing newline (`tail -c 1` = `0a`)
- `git diff .github/CODEOWNERS`: exactly one inserted line, no whitespace-only edits

## Patterns Established

- **Pattern K (Temporary type shim for cross-GSD timing dependencies)** — first instance in this repo. Future use: any cross-GSD PR that depends on a peer's not-yet-merged shape can replicate the named-and-deletable shim idiom. Reviewer test: PR description mentions the shim file as scheduled-for-deletion; post-merge rebase deletes the file in the same commit that retargets imports.

## Cross-PR Coordination Note

`lib/types-pending.ts` exists ONLY because of timing: Evan's `evan/api-routes` sub-PR adds `ApplicationCreated` to `types/origin.ts` and `subscribeToPortfolio` to `OriginAPI` in `lib/api.ts`, but it has not yet merged to `main`. On rebase post-merge, Kit MUST:

1. Delete `lib/types-pending.ts` (`rm lib/types-pending.ts`)
2. Retarget `lib/api.mock.ts` imports — `ApplicationCreated` from `@/types/origin`, `SubscribeToPortfolio` (or its expanded shape) from `@/lib/api`
3. Re-run `npm run typecheck && npm run test`

Both the JSDoc header and the PR description must reference this file as scheduled-for-deletion so review catches a forgotten cleanup.

## Maintainer Note

The new `lib/stages.ts` CODEOWNERS rule takes effect on the next PR that modifies `lib/stages.ts`. No Phase 3 plan touches `lib/stages.ts` (Plan 04 imports from it but does not modify; Plan 05 tests it via `lib/stages.test.ts` but does not modify the source). The first real cross-test of this rule will be a future PR that adds helpers to `lib/stages.ts`. Confirm GitHub picks up the rule by inspecting the Reviewers panel on Phase 3's PR.

## Deviations from Plan

None — plan executed exactly as written.

## Threat Flags

None — no new security-relevant surface introduced. The shim is type-only (no runtime code, no network surface, no auth path). The CODEOWNERS rule is governance-only.

## Commits

- `3ead48f` — `feat(03-03): add lib/types-pending.ts shim for evan/api-routes types`
- `1d2611d` — `chore(03-03): add lib/stages.ts to CODEOWNERS co-owned block`

## Self-Check: PASSED

- FOUND: lib/types-pending.ts
- FOUND: .github/CODEOWNERS modification (lib/stages.ts line)
- FOUND commit: 3ead48f
- FOUND commit: 1d2611d
