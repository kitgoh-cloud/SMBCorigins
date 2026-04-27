---
phase: 04-app-shell-primitives
plan: 05
subsystem: primitives
tags: [primitives, typography, icons, avatar, closed-enum, tdd]

# Dependency graph
requires: [04-01, 04-02]
provides:
  - Eyebrow primitive — IBM Plex Mono 10/500, 0.18em tracking, ink-muted (non-AI surface)
  - Icon primitive — 36-name closed IconName union with verbatim SVG paths and a11y toggle
  - Avatar primitive — 7-member closed AvatarColor enum (fresh-green family excluded at compile time)
affects: [04-06, 04-07, 04-08, 04-09, 04-10]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - closed-string-union-enum (IconName, AvatarColor) — TypeScript exhaustive-switch + Record<K,V> for runtime-safe mapping
    - tdd-red-green (test file created first, implementation second, verified in order)
    - pure-server-component (no 'use client', no hooks, no external state)

key-files:
  created:
    - components/primitives/Eyebrow.tsx
    - components/primitives/Eyebrow.test.tsx
    - components/primitives/Icon.tsx
    - components/primitives/Icon.test.tsx
    - components/primitives/Avatar.tsx
    - components/primitives/Avatar.test.tsx
  modified: []

key-decisions:
  - "IconName union contains 36 names (not 35 as stated in plan text) — plan's interface list had 36 literals; count corrected in test to match the actual union"
  - "Record<AvatarColor, string> used for BG/TEXT maps to satisfy noUncheckedIndexedAccess without optional chaining"
  - "TDD pattern applied: test written first (RED = import resolution failure), implementation written second (GREEN = 21 tests pass)"

# Metrics
duration: 5min
completed: 2026-04-27
---

# Phase 4 Plan 05: Eyebrow + Icon + Avatar Primitives Summary

**Three atomic server-component primitives built TDD-first: Eyebrow (mono tracked label), Icon (36-name SVG dictionary with a11y), Avatar (round disc with 7-member closed enum blocking fresh-green at compile time)**

## Performance

- **Duration:** 5 min
- **Started:** 2026-04-27T01:27:40Z
- **Completed:** 2026-04-27T01:32:40Z
- **Tasks:** 3
- **Files modified:** 6

## Accomplishments

- `Eyebrow.tsx` — pure server component, IBM Plex Mono 10px/500/0.18em tracking, `text-ink-muted`, named export only, no external deps
- `Icon.tsx` — 36-name `IconName` closed union, all SVG paths verbatim from prototype, `ariaLabel` toggles `role="img"` vs `aria-hidden="true"`, TypeScript exhaustive-switch enforces union/switch parity
- `Avatar.tsx` — 7-member `AvatarColor` closed union (trad-green, trad-green-soft, trad-green-deep, ink, ink-muted, paper, mist), `Record<AvatarColor, string>` maps for bg/text, `size=30` default, `textColor='paper'` default, IBM Plex Mono 12/400 initials
- 21 tests across 3 files: Eyebrow (4), Icon (8), Avatar (9) — all pass
- `npm run typecheck`, `npm run lint`, `npm run test` all exit 0

## Task Commits

1. **Task 1: Eyebrow primitive + test** — `6bffd61` (feat)
2. **Task 2: Icon primitive + test** — `c2590a3` (feat)
3. **Task 3: Avatar primitive + test** — `1145fdb` (feat)

## Files Created/Modified

- `components/primitives/Eyebrow.tsx` — Span wrapper with locked typography classes; `EyebrowProps` type
- `components/primitives/Eyebrow.test.tsx` — 4 tests: span render, classlist, className append, ReactNode children
- `components/primitives/Icon.tsx` — 36-name `IconName` union + exhaustive switch returning SVG elements; `IconProps` type
- `components/primitives/Icon.test.tsx` — 8 tests: all-names smoke (36), a11y with label, a11y without label, single-path (check), fill-circle (dot), multi-child circle+path (help), 3-child (users), size prop
- `components/primitives/Avatar.tsx` — `AvatarColor` 7-member union + BG_BY_COLOR + TEXT_BY_COLOR Records; `AvatarProps` type
- `components/primitives/Avatar.test.tsx` — 9 tests: initials text, default size 30, size override, font-mono, all 7 colors → bg-{color}, textColor default (paper), textColor override, enum count lock (7), fresh-green exclusion

## Decisions Made

- IconName union corrected to 36 members — plan prose said "35 names total" but the interface block listed 36 literals (alphabetized app-folder through yen); implementation and test aligned to 36
- `Record<AvatarColor, string>` pattern used for both BG and TEXT maps — prevents `noUncheckedIndexedAccess` from producing `string | undefined` on lookup

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] IconName count discrepancy: plan said 35, union list had 36**
- **Found during:** Task 2 GREEN phase — test `expect(ALL_NAMES.length).toBe(35)` failed because the union list in the plan's `<interfaces>` block actually had 36 entries (app-folder through yen)
- **Issue:** Plan prose stated "35 names total" but the verbatim icon list contained 36 names; the test array copied from the plan also had 36 entries
- **Fix:** Updated test assertion from `toBe(35)` to `toBe(36)` to match the actual union
- **Files modified:** `components/primitives/Icon.test.tsx`
- **Commit:** `c2590a3`

## Known Stubs

None — these are pure presentational primitives with no data sources.

## Threat Flags

None — all three files are pure presentational components with static content. No new network endpoints, auth paths, or schema changes introduced.

## TDD Gate Compliance

All three tasks followed the RED/GREEN/REFACTOR cycle:
- RED: test file created first → failed with import resolution error (file doesn't exist yet)
- GREEN: implementation created → all tests passed immediately
- REFACTOR: not required — implementations were clean as written

---
*Phase: 04-app-shell-primitives*
*Completed: 2026-04-27*

## Self-Check: PASSED

- components/primitives/Eyebrow.tsx: FOUND
- components/primitives/Eyebrow.test.tsx: FOUND
- components/primitives/Icon.tsx: FOUND
- components/primitives/Icon.test.tsx: FOUND
- components/primitives/Avatar.tsx: FOUND
- components/primitives/Avatar.test.tsx: FOUND
- .planning/phases/04-app-shell-primitives/04-05-SUMMARY.md: FOUND
- Commit 6bffd61 (Task 1 — Eyebrow): FOUND
- Commit c2590a3 (Task 2 — Icon): FOUND
- Commit 1145fdb (Task 3 — Avatar): FOUND
