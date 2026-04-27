---
phase: 04-app-shell-primitives
plan: 03
subsystem: ui
tags: [persona, route-map, plain-ts-constants, lib, vitest]

# Dependency graph
requires:
  - phase: 04-01-test-infrastructure
    provides: vitest config with globals:false and @/ path aliases

provides:
  - lib/persona.ts — PERSONAS, PERSONA_HOME, modeForPathname, Mode, Persona exports
  - lib/persona.test.ts — 13 passing assertions covering all three exported values

affects:
  - 04-08-shell-risingmark-languagetoggle-modeswitcher (consumes modeForPathname, Mode)
  - 04-10-topstrip-route-layouts-demo (consumes PERSONAS, PERSONA_HOME, modeForPathname)
  - 04-09-shell-client-rm-shells (consumes PERSONA_HOME for redirect)
  - All Wave 3+ chrome components indexing PERSONAS by mode

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Plain TS constants pattern: Record<KeyUnion, Value> const + pure helper function (mirrors lib/stages.ts shape)"
    - "3-arm mode union: 'client' | 'rm' | 'demo' — /dev prefix cascade-first in modeForPathname"
    - "Chrome decoupled from data layer: no imports from @/types/origin or @/lib/api* (D-66)"

key-files:
  created:
    - lib/persona.ts
    - lib/persona.test.ts
  modified: []

key-decisions:
  - "Mode union is 3-arm ('client' | 'rm' | 'demo') per RESEARCH §8.2 and D-66 — /dev/* routes return 'demo' to suppress persona-context UI on the primitives page"
  - "PERSONAS keyed by 'client' | 'rm' only (not 'demo') — Record<'client'|'rm', Persona> avoids noUncheckedIndexedAccess undefined pain when TopStrip indexes by mode"
  - "PERSONA_HOME excludes 'demo' key — demo page has no canonical home route"
  - "modeForPathname checks /dev BEFORE RM prefixes — cascade order matters for future /cockpit-dev hypotheticals"

patterns-established:
  - "Record<KeyUnion, Value> as const: preferred shape for persona/config lookup tables in lib/ (follows lib/stages.ts line 3)"
  - "Pure helper function alongside const: modeForPathname is stateless, takes a string, returns a closed enum (no side effects)"
  - "Chrome data stays in lib/persona.ts, not lib/api.mock.ts — frontend persona constants are UI-layer, not API-layer"

requirements-completed: [SHELL-01, SHELL-02]

# Metrics
duration: 2min
completed: 2026-04-27
---

# Phase 4 Plan 03: lib/persona Summary

**Plain TS persona module with PERSONAS Record, PERSONA_HOME, and 3-arm modeForPathname routing function — single source of truth for chrome persona data decoupled from the data layer**

## Performance

- **Duration:** 2 min
- **Started:** 2026-04-27T01:20:03Z
- **Completed:** 2026-04-27T01:22:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- `lib/persona.ts` creates the persona stub module with PERSONAS literal data (Yuki Tanaka + James Lee), PERSONA_HOME (/journey, /cockpit), and modeForPathname returning the 3-arm 'client' | 'rm' | 'demo' union
- `lib/persona.test.ts` provides 13 assertions across 3 describe blocks covering PERSONAS data fidelity, PERSONA_HOME literal paths, and modeForPathname route-table cascade
- All 47 project tests pass (4 test files); typecheck + lint green with no changes required

## Task Commits

Each task was committed atomically:

1. **Task 1: Create lib/persona.ts** - `9f3d077` (feat)
2. **Task 2: Create lib/persona.test.ts** - `091551b` (test)

**Plan metadata:** See final docs commit after SUMMARY.md creation

## Files Created/Modified
- `lib/persona.ts` — PERSONAS (Record<'client'|'rm', Persona>), PERSONA_HOME (as const), modeForPathname (3-arm enum), Mode type, Persona type
- `lib/persona.test.ts` — 13 vitest assertions: 3 PERSONAS tests, 3 PERSONA_HOME tests, 7 modeForPathname tests

## Decisions Made
- Mode union is 3-arm per D-66 + RESEARCH §8.2; 'demo' arm enables /dev/* paths to suppress persona-context UI (OD-A1 in Open Questions)
- PERSONAS only has 'client' | 'rm' keys (not 'demo') to avoid noUncheckedIndexedAccess pain when TopStrip indexes by mode
- /dev prefix checked first in modeForPathname cascade to prevent longer-path shadowing (e.g., hypothetical /cockpit-dev)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- `lib/persona.ts` is ready for import by all Wave 3+ chrome components
- TopStrip (Plan 04-10) can `import { PERSONAS, PERSONA_HOME, modeForPathname } from '@/lib/persona'` without further setup
- ModeSwitcher (Plan 04-08) can use `Mode` type and `modeForPathname` directly

---
*Phase: 04-app-shell-primitives*
*Completed: 2026-04-27*
