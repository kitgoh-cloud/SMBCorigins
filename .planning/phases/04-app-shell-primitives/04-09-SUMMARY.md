---
phase: 04-app-shell-primitives
plan: 09
subsystem: ui
tags: [shell, layout-wrappers, sidebar, tailwind, react, nextjs]

# Dependency graph
requires:
  - phase: 04-app-shell-primitives plan 05
    provides: Icon primitive with cockpit/pipeline/app-folder/sparkle icon names
  - phase: 04-app-shell-primitives plan 01
    provides: Tailwind token setup (bg-paper, bg-paper-deep, bg-trad-green, bg-mist, text-ink, text-ink-soft)

provides:
  - ClientShell: single-column workspace wrapper for /(client)/* routes (bg-paper, min-h-[calc(100vh-56px)], max-w-[1200px] centered content)
  - RMShell: 3-zone layout for /(rm)/* routes (sidebar 220px + workspace flex-1 + empty copilot slot)
  - Retrofit #5 (D-88): active sidebar dot uses bg-trad-green NOT bg-fresh-green, confirmed by negative-invariant test

affects:
  - 04-10: wires ClientShell into app/(client)/layout.tsx and RMShell into app/(rm)/layout.tsx
  - phase 06: replaces RMShell sidebar <span> placeholders with live <Link> navigation
  - phase 08: adds copilot sidecar component into the empty slot in RMShell

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Server component shell wrappers with no use client — layout components have no client state"
    - "Sidebar nav items as <span> placeholders (not live <Link>s) when route wiring is deferred"
    - "Negative-invariant test pattern: test that rendered HTML does NOT contain fresh-green"
    - "aria-current=page on active nav span for screen-reader semantics without live routing"

key-files:
  created:
    - components/shell/ClientShell.tsx
    - components/shell/ClientShell.test.tsx
    - components/shell/RMShell.tsx
    - components/shell/RMShell.test.tsx
  modified: []

key-decisions:
  - "Sidebar nav items are <span> placeholders in Phase 4; Phase 6 swaps to <Link> when cockpit/pipeline/applications/copilot routes land (UI-SPEC line 409)"
  - "RMShell workspace uses <main> tag (primary content zone); ClientShell uses <div> outer (ClientShell children provide their own <main> at page level)"
  - "Retrofit #5 (D-88): active sidebar indicator dot = bg-trad-green, confirmed by negative test that bg-fresh-green is absent from rendered HTML"

patterns-established:
  - "Shell wrappers are server components that accept children: ReactNode — no client-side state needed"
  - "RMShell empty copilot sidecar slot: Phase 4 ships no element; a JSX comment block documents D-77 deferral"

requirements-completed: [SHELL-01]

# Metrics
duration: 4min
completed: 2026-04-27
---

# Phase 4 Plan 09: Client Shell + RM Shell Summary

**ClientShell single-column wrapper and RMShell 3-zone sidebar layout with retrofit-#5 bg-trad-green active dot, 17 tests passing, no fresh-green tokens in either component**

## Performance

- **Duration:** 4 min
- **Started:** 2026-04-27T01:38:10Z
- **Completed:** 2026-04-27T01:42:14Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- ClientShell: single-column wrapper with `bg-paper min-h-[calc(100vh-56px)] relative overflow-hidden` outer and `max-w-[1200px] mx-auto pt-9 px-10 pb-20` inner container, ready for `app/(client)/layout.tsx` consumption in Plan 04-10
- RMShell: 3-zone layout with 220px sticky sidebar, 4 nav item `<span>` placeholders (Cockpit/Pipeline/Applications/Copilot), flex-1 workspace, and empty copilot slot (D-77); retrofit #5 applied at authorship — active Cockpit dot uses `bg-trad-green` never `bg-fresh-green`
- 17 tests total (4 ClientShell + 13 RMShell) all passing; negative-invariant test verifies no fresh-green in rendered HTML at the bit level

## Task Commits

Each task was committed atomically (TDD: RED then GREEN per task):

1. **Task 1 RED: ClientShell failing test** - `db7b7ce` (test)
2. **Task 1 GREEN: ClientShell implementation** - `1e36d33` (feat)
3. **Task 2 RED: RMShell failing test** - `290f4d4` (test)
4. **Task 2 GREEN: RMShell implementation** - `9756caa` (feat)

**Plan metadata:** (docs commit to follow)

_Note: TDD tasks have test commit (RED) followed by implementation commit (GREEN)_

## Files Created/Modified

- `components/shell/ClientShell.tsx` - Single-column workspace wrapper for /(client)/* routes; server component, no fresh-green
- `components/shell/ClientShell.test.tsx` - 4-test suite: children pass-through, outer div classes, inner div classes, no fresh-green
- `components/shell/RMShell.tsx` - 3-zone RM shell: sidebar 220px + workspace flex-1 + empty copilot slot; imports Icon + Eyebrow primitives
- `components/shell/RMShell.test.tsx` - 13-test suite covering sidebar structure, nav items, retrofit #5 dot color, D-77 empty copilot slot

## Decisions Made

- Sidebar nav items use `<span>` placeholders, not `<Link>` — UI-SPEC line 409 grants this discretion; Phase 6 wires real navigation when cockpit/pipeline/applications routes exist
- RMShell workspace uses `<main>` (primary content surface); ClientShell outer wrapper uses `<div>` since client-side pages supply their own `<main>` at the page level if needed
- Retrofit #5 confirmed via both implementation choice (bg-trad-green) and negative-invariant test (rendered HTML must not contain "fresh-green" or `#BFD730`)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed test selector for ClientShell inner div**
- **Found during:** Task 1 GREEN (ClientShell implementation)
- **Issue:** Plan-specified test used `container.querySelector('div > div')` to find the inner content div, but this returns the OUTER div first (testing-library `container` is itself a `<div>`, making the outer component div the first `div > div` match in document order)
- **Fix:** Changed test selector to `(container.firstElementChild as HTMLElement).querySelector('div')` which correctly targets the first child of the outer wrapper (i.e., the inner content div)
- **Files modified:** `components/shell/ClientShell.test.tsx`
- **Verification:** All 4 ClientShell tests pass including the inner-div class assertion
- **Committed in:** `db7b7ce` (Task 1 test commit, selector fixed before GREEN commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - bug in plan-specified test selector)
**Impact on plan:** Minimal — test selector fixed to correctly target the inner div. Implementation unchanged from plan spec. No scope creep.

## Issues Encountered

The plan's `grep` verify command (`grep -E "fresh-green|#BFD730" ClientShell.tsx RMShell.tsx`) will produce false matches on comment lines that document WHY fresh-green is absent (e.g. `// No fresh-green tokens.`). The rendered HTML test (`container.innerHTML not to match /fresh-green/`) is the authoritative check and passes cleanly. Source file comments are documentation, not token usage.

## Threat Surface Scan

No new security-relevant surface introduced — both components are server-side layout wrappers with no user input, no event handlers, and no network requests. All three threats in the plan's threat model are addressed:
- T-04-09-01 (SHELL-05 token leak): retrofit #5 applied; negative-invariant test confirms
- T-04-09-02 (empty copilot slot): no element rendered; comment documents D-77 deferral
- T-04-09-03 (inert nav placeholders): `<span>` with `aria-current="page"` on active item; Phase 6 upgrades to `<Link>`

## Known Stubs

None — both shells are layout wrappers with no data dependencies. The 4 sidebar nav items are intentional `<span>` placeholders by design (Phase 6 deliverable per plan spec).

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Plan 04-10 (Wave 4) can now consume `ClientShell` and `RMShell` directly in `app/(client)/layout.tsx` and `app/(rm)/layout.tsx`
- Phase 6 will swap sidebar `<span>` placeholders to live `<Link>` components and add focus-visible styling
- Phase 8 will insert the copilot sidecar component into RMShell's empty slot position

## Self-Check: PASSED

All files created:
- components/shell/ClientShell.tsx: FOUND
- components/shell/ClientShell.test.tsx: FOUND
- components/shell/RMShell.tsx: FOUND
- components/shell/RMShell.test.tsx: FOUND
- .planning/phases/04-app-shell-primitives/04-09-SUMMARY.md: FOUND

All commits verified:
- db7b7ce (ClientShell test RED): FOUND
- 1e36d33 (ClientShell impl GREEN): FOUND
- 290f4d4 (RMShell test RED): FOUND
- 9756caa (RMShell impl GREEN): FOUND

---
*Phase: 04-app-shell-primitives*
*Completed: 2026-04-27*
