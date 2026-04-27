---
phase: 04-app-shell-primitives
plan: "07"
subsystem: primitives
tags: [primitives, stage-pill, action-card, barrel-export, closed-enum, tdd, shell-04, d-74, d-76]

# Dependency graph
requires:
  - phase: 04-app-shell-primitives/04-05
    provides: Eyebrow, Icon, Avatar primitives (Wave 2)
  - phase: 04-app-shell-primitives/04-06
    provides: AIPulseDot, AIBadge, StatusChip primitives (Wave 2)
  - phase: 04-app-shell-primitives/04-01
    provides: components/primitives/ directory, test infrastructure
provides:
  - StagePill — circular numbered disc 1..6 with done/current/upcoming states; imports StageNumber from @/types/origin
  - ActionCard — row primitive with slot-shaped indicator/cta + onClick interaction; 'use client'
  - components/primitives/index.ts — barrel re-exports all 8 primitives + 12 public types alphabetically
affects: [04-08, 04-09, 04-10, 04-11, 05-client-journey, 06-rm-cockpit, 07-stages, 08-hero-moments]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - closed-record-enum (StagePillState × StageStyles Record — compile-time exhaustiveness)
    - tdd-red-green (test file written before implementation; import failure = RED gate; both tasks)
    - client-boundary-primitive ('use client' on ActionCard ships the file ready for onClick callers per RESEARCH Pitfall 3)
    - barrel-explicit-named-export (NO export *; alphabetical; tree-shake friendly; 8 components + 12 types)

key-files:
  created:
    - components/primitives/StagePill.tsx
    - components/primitives/StagePill.test.tsx
    - components/primitives/ActionCard.tsx
    - components/primitives/ActionCard.test.tsx
    - components/primitives/index.ts
  modified: []

key-decisions:
  - "StagePill does NOT use fontVariationSettings for SOFT/WONK — OD-12 strategy (b) applies SOFT/WONK only to the wordmark in TopStrip; StagePill numeral is plain Fraunces to minimize blast radius"
  - "ActionCard ships as 'use client' rather than server-only — RESEARCH Pitfall 3; cost is small for a single leaf primitive; avoids two-version maintenance overhead"
  - "Barrel uses explicit named re-exports (NOT export *) — self-documenting + tree-shake-friendly; anti-pattern avoidance"

# Metrics
duration: 4min
completed: 2026-04-27
---

# Phase 4 Plan 07: StagePill + ActionCard + Barrel Export Summary

**StagePill (closed-enum disc), ActionCard ('use client' row), and barrel index.ts complete the 8-primitive set — all 69 tests pass across the full primitives suite**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-04-27T01:37:37Z
- **Completed:** 2026-04-27T01:41:35Z
- **Tasks:** 3
- **Files modified:** 5 created

## Accomplishments

- `StagePill.tsx` — Pure presentational circular disc; `StageNumber` imported from `@/types/origin` (cross-boundary type read); `STYLES_BY_STATE: Record<StagePillState, StageStyles>` with done=bg-trad-green/text-paper, current=bg-paper/text-trad-green/border-2/border-trad-green, upcoming=bg-mist/text-ink-muted; glyph ✓ for done, numeric n otherwise; default size=34 (UI-SPEC OD-2); font-display+font-semibold; aria-label="Stage N state"; no fresh-green; no fontVariationSettings (OD-12 strategy b)
- `ActionCard.tsx` — `'use client'` on line 1; renders `<button type="button">` when onClick provided, `<div>` otherwise; full interaction-state contract from UI-SPEC (cursor-pointer, hover:bg-paper-deep, focus-visible:outline-2/outline-trad-green/outline-offset-2, active:bg-mist); faint=true wraps indicator in opacity-60 + applies text-ink-muted to title; shared 200ms transition baseline; slot-shaped indicator+cta ReactNode props (D-76)
- `index.ts` — Barrel re-exports all 8 components alphabetically (ActionCard, AIBadge, AIPulseDot, Avatar, Eyebrow, Icon, StagePill, StatusChip) + 12 public types (ActionCardProps, AIBadgeProps, AIPulseDotProps, AvatarColor, AvatarProps, EyebrowProps, IconName, IconProps, StagePillProps, StagePillState, StatusChipKind, StatusChipProps); NO export *; explicit named re-exports only
- 24 new tests (11 StagePill + 13 ActionCard); full suite: 69 tests across 8 test files — all pass
- `npm run typecheck`, `npm run lint`, `npm run test` all exit 0

## Task Commits

1. **Task 1: StagePill + test** — `cbded67` (feat)
2. **Task 2: ActionCard + test** — `69dd187` (feat)
3. **Task 3: Barrel index.ts** — `7f170fe` (feat)

## Files Created/Modified

- `components/primitives/StagePill.tsx` — Closed-enum disc; StageNumber cross-boundary type import; StagePillState union; STYLES_BY_STATE Record; aria-label; no fresh-green
- `components/primitives/StagePill.test.tsx` — 11 tests: numeral rendering for all n×state, ✓ glyph for done, per-state class contract (bg/text/border), default size 34px, fontSize 15px, size override, rounded-full/font-display/font-semibold, aria-label, all 18 combinations without throwing
- `components/primitives/ActionCard.tsx` — 'use client'; button-vs-div based on onClick; full interaction-state class set; faint support; slot-shaped indicator+cta; transition-colors duration-200 ease-out
- `components/primitives/ActionCard.test.tsx` — 13 tests: title render, meta render, meta omission, div-render, button-render, onClick fires via fireEvent, indicator slot, cta slot, faint text-ink-muted, faint opacity-60 wrapper, interactive classes, non-interactive classes, transition baseline
- `components/primitives/index.ts` — 8 component exports + 8 type export lines (12 types total); alphabetical; NO export *; NO export default

## Decisions Made

- StagePill numeral does NOT use fontVariationSettings (SOFT/WONK) — OD-12 strategy (b) confines SOFT/WONK to the wordmark in TopStrip only; smallest blast radius
- ActionCard ships as 'use client' — RESEARCH Pitfall 3 confirms this avoids the two-version maintenance overhead for a single leaf component
- Barrel uses explicit named re-exports — anti-pattern (export *) avoided for self-documentation and tree-shake-friendliness

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — all three artifacts are fully implemented. StagePill and ActionCard are pure presentational; index.ts is a barrel with no logic.

## Threat Flags

No new security-relevant surface introduced. All files are pure presentational components with static class names and standard React prop handling. The closed `Record<StagePillState, StageStyles>` satisfies T-04-07-02 (compile-time drift prevention). ActionCard's 'use client' boundary is an architectural accept (T-04-07-03).

## TDD Gate Compliance

Tasks 1 and 2 both followed RED/GREEN:
- RED: test file created first → failed with import resolution error (file does not exist)
- GREEN: implementation created → all tests passed immediately
- REFACTOR: not required — implementations were clean as written

Task 3 (barrel export) was not TDD (plan frontmatter: tdd="false" for Task 3).

---
*Phase: 04-app-shell-primitives*
*Completed: 2026-04-27*

## Self-Check: PASSED

Files verified:
- `components/primitives/StagePill.tsx`: FOUND
- `components/primitives/StagePill.test.tsx`: FOUND
- `components/primitives/ActionCard.tsx`: FOUND
- `components/primitives/ActionCard.test.tsx`: FOUND
- `components/primitives/index.ts`: FOUND
- `.planning/phases/04-app-shell-primitives/04-07-SUMMARY.md`: FOUND

Commits verified:
- cbded67 (Task 1 - StagePill): FOUND
- 69dd187 (Task 2 - ActionCard): FOUND
- 7f170fe (Task 3 - Barrel index.ts): FOUND
