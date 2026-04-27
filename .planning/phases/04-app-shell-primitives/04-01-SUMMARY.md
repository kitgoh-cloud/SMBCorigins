---
phase: 04-app-shell-primitives
plan: 01
subsystem: testing
tags: [vitest, jsdom, testing-library, jest-dom, react, ci, infrastructure]

# Dependency graph
requires: []
provides:
  - Vitest jsdom environment configured for React component DOM testing
  - jest-dom matchers registered globally via vitest.setup.ts
  - "*.test.tsx" file discovery enabled in vitest.config.ts
  - Phase 3 existing test suite verified compatible with jsdom env
affects: [04-02, 04-03, 04-04, 04-05, 04-06, 04-07, 04-08, 04-09, 04-10, 04-11]

# Tech tracking
tech-stack:
  added: [jsdom@29.0.2, "@testing-library/react@16.3.2", "@testing-library/jest-dom@6.9.1"]
  patterns: [vitest-jsdom-setup, jest-dom-global-registration, tsx-test-discovery]

key-files:
  created: [vitest.setup.ts]
  modified: [package.json, package-lock.json, vitest.config.ts]

key-decisions:
  - "jsdom pinned to current stable major @^29 (not ^25 from plan research time) — plan instructs honor current major at install time"
  - "globals: false preserved (D-63 lock) — describe/it/expect still require explicit imports in test files"
  - "setupFiles uses relative path './vitest.setup.ts' to ensure portability"

patterns-established:
  - "vitest.setup.ts: one-line side-effect import pattern for global test augmentation"
  - "All React component tests discovered via '**/*.test.{ts,tsx}' glob — no per-directory config needed"

requirements-completed: [SHELL-04, SHELL-05]

# Metrics
duration: 3min
completed: 2026-04-27
---

# Phase 4 Plan 01: Test Infrastructure Summary

**Vitest upgraded to jsdom + @testing-library/react + jest-dom so Wave 1+ plans can write React component tests without per-file boilerplate**

## Performance

- **Duration:** 3 min
- **Started:** 2026-04-27T01:20:08Z
- **Completed:** 2026-04-27T01:22:52Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments

- Three new devDependencies installed: jsdom@29.0.2, @testing-library/react@16.3.2, @testing-library/jest-dom@6.9.1
- vitest.setup.ts created at repo root with single jest-dom matcher registration import
- vitest.config.ts updated: environment jsdom, setupFiles wired to setup file, include glob expanded to .tsx
- All 34 Phase 3 tests (api.mock, stages, seed) verified passing under the new jsdom environment

## Task Commits

Each task was committed atomically:

1. **Task 1: Install jsdom + @testing-library/react + @testing-library/jest-dom dev deps** - `6367874` (chore)
2. **Task 2: Create vitest.setup.ts (one-line jest-dom matcher import)** - `5959fd5` (chore)
3. **Task 3: Update vitest.config.ts — environment jsdom, include .tsx, setupFiles** - `91cb42c` (chore)

## Files Created/Modified

- `vitest.setup.ts` - One-line side-effect import registering jest-dom matchers globally on Vitest's expect
- `vitest.config.ts` - environment changed to jsdom, setupFiles added, include expanded to {ts,tsx}
- `package.json` - Three new devDependencies: jsdom, @testing-library/react, @testing-library/jest-dom
- `package-lock.json` - Updated lockfile with 455 new packages

## Decisions Made

- jsdom installed at major ^29 (current stable) rather than ^25 from research-time recommendation — plan explicitly instructs to honor current major at install time
- globals: false preserved per D-63 lock — test files must explicitly import describe/it/expect from vitest
- No `@types/jest-dom` added — `@testing-library/jest-dom/vitest` subpath ships its own Vitest-specific type augmentation

## Deviations from Plan

None — plan executed exactly as written. The only adjustment was jsdom major (^29 vs ^25) which the plan explicitly anticipated and authorized.

## Issues Encountered

None. The vite-tsconfig-paths advisory notice ("Vite now supports tsconfig paths natively") appeared in test output but is a non-blocking informational message, not an error. Left as-is per scope boundary (pre-existing config, out-of-scope fix).

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Wave 1+ plans (04-02 through 04-11) can now write `*.test.tsx` files with `@testing-library/react` render() and `expect(el).toHaveClass(...)` without any per-file setup
- jest-dom matchers available globally in all test files
- Phase 3 test suite unaffected — continues passing under jsdom

---
*Phase: 04-app-shell-primitives*
*Completed: 2026-04-27*

## Self-Check: PASSED

- vitest.setup.ts: FOUND
- vitest.config.ts: FOUND
- 04-01-SUMMARY.md: FOUND
- Commit 6367874 (Task 1 — install deps): FOUND
- Commit 5959fd5 (Task 2 — vitest.setup.ts): FOUND
- Commit 91cb42c (Task 3 — vitest.config.ts): FOUND
