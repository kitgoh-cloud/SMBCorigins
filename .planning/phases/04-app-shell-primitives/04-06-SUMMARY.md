---
phase: 04-app-shell-primitives
plan: "06"
subsystem: ui
tags: [primitives, ai-presence, status-chip, fresh-green, tailwind-v4, vitest, tdd, d-73, d-75, d-85, d-87]

# Dependency graph
requires:
  - phase: 04-app-shell-primitives/04-01
    provides: components/primitives/ directory, test infrastructure (vitest + jsdom)
  - phase: 04-app-shell-primitives/04-04
    provides: animate-ai-pulse Tailwind utility (--animate-ai-pulse @theme token + @keyframes ai-pulse in globals.css)
provides:
  - AIPulseDot — bare 8px fresh-green animated dot (allowlisted, animate-ai-pulse consumer)
  - AIBadge — trad-green-deep pill composing AIPulseDot with text-fresh-green label (default "Origin")
  - StatusChip — 6-arm closed-enum chip; only kind='ai' uses fresh-green (D-87 per-kind tests enforce this)
affects: [04-10, 04-11, 05-client-journey, 06-rm-cockpit, 07-stages, 08-hero-moments]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - TDD RED/GREEN per file (test file written before component; import failure = RED gate)
    - Closed Record<Kind, Styles> pattern prevents noUncheckedIndexedAccess undefined narrowing (RESEARCH Pitfall 2)
    - D-87 per-kind unit tests as second line of defense for coarse whole-file allowlist
    - Same-directory relative imports for component composition (AIPulseDot <- AIBadge)

key-files:
  created:
    - components/primitives/AIPulseDot.tsx
    - components/primitives/AIPulseDot.test.tsx
    - components/primitives/AIBadge.tsx
    - components/primitives/AIBadge.test.tsx
    - components/primitives/StatusChip.tsx
    - components/primitives/StatusChip.test.tsx
  modified: []

key-decisions:
  - "TDD approach: tests written first; import failure used as RED gate (no separate stub needed)"
  - "StatusChip dot size: 6px (w-1.5 h-1.5) vs AIPulseDot 8px (w-2 h-2) — status dots are smaller than AI presence dots"
  - "AIBadge omits prototype inset shadow rgba(191,215,48,0.2) — would trip SHELL-05 grep if not allowlisted; trad-green-deep + text-fresh-green contrast is sufficient AI signal"
  - "D-87 per-kind tests enforce only kind='ai' uses fresh-green — whole-file allowlist is coarse, tests are the real guard"

patterns-established:
  - "AI presence primitives: AIPulseDot is the atomic unit; AIBadge composes it"
  - "StatusChip closed-enum pattern: STYLES_BY_KIND Record with readonly ChipStyles ensures TypeScript catches missing kinds"
  - "Fresh green segregation: only AIPulseDot, AIBadge, and StatusChip kind='ai' arm use fresh-green tokens; all are allowlisted"

requirements-completed: [SHELL-04, SHELL-05]

# Metrics
duration: 3min
completed: 2026-04-27
---

# Phase 4 Plan 06: AI Presence Primitives (AIPulseDot, AIBadge, StatusChip) Summary

**Three AI-presence primitives with 24 passing tests: AIPulseDot (animate-ai-pulse consumer), AIBadge (trad-green-deep pill), and StatusChip (6-arm enum with D-87 per-kind fresh-green guards)**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-04-27T01:28:16Z
- **Completed:** 2026-04-27T01:31:11Z
- **Tasks:** 3 (all TDD)
- **Files modified:** 6 created (3 components, 3 test files)

## Accomplishments

- AIPulseDot: bare 8px `bg-fresh-green animate-ai-pulse` dot; role="img"; default aria-label="AI active"; consumes Plan 04-04's @theme animation token
- AIBadge: `bg-trad-green-deep text-fresh-green` rounded-full pill composing AIPulseDot; label defaults to "Origin" per D-75
- StatusChip: 6-arm closed `StatusChipKind` enum with locked per-kind token mapping; `kind='ai'` is the ONLY arm using fresh-green tokens; D-87 mandatory invariant test passes; 11 tests cover all 6 kinds, dot=true/false, children, visual contract

## Task Commits

Each task was committed atomically:

1. **Task 1: AIPulseDot + tests** - `c10bb00` (feat)
2. **Task 2: AIBadge + tests** - `0f434b5` (feat)
3. **Task 3: StatusChip + D-87 mandatory tests** - `f8df034` (feat)

## Files Created/Modified

- `components/primitives/AIPulseDot.tsx` - Bare 8px fresh-green animated dot; allowlisted; animate-ai-pulse consumer
- `components/primitives/AIPulseDot.test.tsx` - 7 tests: role, aria-label, classList tokens, sizing, no-children
- `components/primitives/AIBadge.tsx` - Trad-green-deep pill with AIPulseDot + text-fresh-green label; allowlisted
- `components/primitives/AIBadge.test.tsx` - 6 tests: default label, override, pill classes, AIPulseDot composition
- `components/primitives/StatusChip.tsx` - 6-arm closed enum; STYLES_BY_KIND Record; only kind='ai' uses fresh-green; allowlisted
- `components/primitives/StatusChip.test.tsx` - 11 tests including D-87 mandatory per-kind assertions and negative invariant

## Decisions Made

- TDD approach: tests written first; import failure used as RED gate (no separate stub needed since the import error is a clear failure signal)
- StatusChip dot uses `w-1.5 h-1.5` (6px) — smaller than AIPulseDot (8px) because status dots are indicators, not the animated AI presence signal
- AIBadge omits the prototype's `inset 0 0 0 1px rgba(191,215,48,0.2)` shadow — would trip SHELL-05 grep; visual contrast is sufficient without it
- D-87 closed `Record<StatusChipKind, ChipStyles>` typing prevents `noUncheckedIndexedAccess` undefined narrowing (RESEARCH Pitfall 2)

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## Known Stubs

None — all three primitives are fully implemented and wired. No placeholder data, no hardcoded empty values.

## Threat Flags

No new security-relevant surface introduced. All three files are pure presentational components accepting static string children/labels with standard React text escaping (T-04-06-03: accept disposition). The D-87 per-kind tests actively mitigate T-04-06-01 (fresh-green drift via coarse allowlist).

## Next Phase Readiness

- All three primitives are ready for consumption by Plan 04-10 (demo page visual review)
- Plan 04-11 must add these 3 files to `.freshgreen-allowlist` to satisfy SHELL-05 lint enforcement
- No blockers; typecheck, lint, and all 24 tests pass

---
*Phase: 04-app-shell-primitives*
*Completed: 2026-04-27*

## Self-Check: PASSED

Files verified:
- `components/primitives/AIPulseDot.tsx`: FOUND
- `components/primitives/AIPulseDot.test.tsx`: FOUND
- `components/primitives/AIBadge.tsx`: FOUND
- `components/primitives/AIBadge.test.tsx`: FOUND
- `components/primitives/StatusChip.tsx`: FOUND
- `components/primitives/StatusChip.test.tsx`: FOUND

Commits verified:
- c10bb00 (Task 1 - AIPulseDot): FOUND
- 0f434b5 (Task 2 - AIBadge): FOUND
- f8df034 (Task 3 - StatusChip): FOUND
