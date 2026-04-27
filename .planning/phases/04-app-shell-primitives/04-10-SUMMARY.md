---
phase: 04-app-shell-primitives
plan: 10
subsystem: ui
tags: [topstrip, route-group-layouts, demo-page, retrofit-1-and-2, fraunces-soft-wonk, use-client, tdd]

# Dependency graph
requires:
  - phase: 04-03-persona
    provides: lib/persona.ts — PERSONAS, modeForPathname, Mode
  - phase: 04-05-primitives
    provides: Eyebrow, Icon, Avatar, StatusChip, StagePill, AIPulseDot, AIBadge, ActionCard barrel
  - phase: 04-08-shell-risingmark-languagetoggle-modeswitcher
    provides: RisingMark, LanguageToggle, ModeSwitcher
  - phase: 04-09-shell-client-rm-shells
    provides: ClientShell, RMShell
  - phase: 04-02-globals-fonts
    provides: app/layout.tsx with IBM Plex Mono weight=['400','500']

provides:
  - components/shell/TopStrip.tsx — 'use client' chrome strip composing all Wave 1-3 shell components
  - components/shell/TopStrip.test.tsx — 19 tests covering 3 modes + retrofits + OD-12 + SHELL-05 invariant
  - app/layout.tsx (modified) — root layout now renders TopStrip above children
  - app/(client)/layout.tsx — client route-group layout wrapping ClientShell
  - app/(rm)/layout.tsx — RM route-group layout wrapping RMShell
  - app/dev/primitives/page.tsx — SHELL-04 acceptance demo page with all 8 primitives

affects:
  - 04-11-shell05-enforcement (grep script will see TopStrip.tsx; SHELL-05 negative invariant test confirms compliance)
  - Phase 5 (CJD-01..07): consumes app/(client)/layout.tsx + ClientShell
  - Phase 6 (RMC-01..07): consumes app/(rm)/layout.tsx + RMShell

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "'use client' TopStrip as child of RSC root layout — only client boundary in the chrome (RESEARCH §Pattern 1)"
    - "Route-group layout pattern: app/(group)/layout.tsx wraps group pages in shell component"
    - "OD-12 strategy b: inline fontVariationSettings on wordmark span — no axes: in next/font config"
    - "Retrofit-at-authorship: TopStrip authored with trad-green-soft + signal-amber at write time"
    - "Demo page as 'use client' — required because ActionCard onClick handlers cannot be RSC props"

key-files:
  created:
    - components/shell/TopStrip.tsx
    - components/shell/TopStrip.test.tsx
    - app/(client)/layout.tsx
    - app/(rm)/layout.tsx
    - app/dev/primitives/page.tsx
  modified:
    - app/layout.tsx

key-decisions:
  - "TopStrip is 'use client' — usePathname() requires client context; this is the only client boundary in the root layout chain"
  - "Demo page uses 'use client' — ActionCard onClick handlers cannot be passed as RSC props during static prerender"
  - "OD-12 strategy b confirmed: inline fontVariationSettings on the 'Origin' wordmark span; no axes: key in Fraunces config"
  - "Vertical dividers use w-px h-6 bg-paper/[0.12] — matches rgba(255,255,255,0.12) from UI-SPEC"
  - "SHELL-05 negative invariant test strips <line>...</line> (not self-closing) before grep — JSDOM serializes SVG as paired tags"

# Metrics
duration: 7min
completed: 2026-04-27
---

# Phase 4 Plan 10: TopStrip + Route Layouts + Demo Page Summary

**TopStrip 'use client' chrome composing all Wave 1-3 shell components with retrofits #1+#2 and OD-12 inline SOFT/WONK; root layout wired; route-group layouts wired to ClientShell/RMShell; SHELL-04 demo page renders all 8 primitives**

## Performance

- **Duration:** 7 min
- **Started:** 2026-04-27
- **Completed:** 2026-04-27
- **Tasks:** 3 (TDD for Task 1: RED + GREEN)
- **Files modified:** 6

## Accomplishments

- `components/shell/TopStrip.tsx` — `'use client'` chrome bar that uses `usePathname()` + `modeForPathname` to drive 3 display modes (client/rm/demo); composes RisingMark + Eyebrow + Icon + Avatar + LanguageToggle + ModeSwitcher; retrofits #1 (`Avatar color="trad-green-soft"`) and #2 (`bg-signal-amber` mail dot) applied at authorship; OD-12 strategy b inline `fontVariationSettings: '"SOFT" 80, "WONK" 1'` on "Origin" wordmark
- `components/shell/TopStrip.test.tsx` — 19 test assertions (5 base + 4 client + 4 rm + 4 demo + 2 SHELL-05 negative invariant); all pass
- `app/layout.tsx` — TopStrip import added; `<TopStrip />` rendered above `{children}` in body; Plan 04-02 font edits preserved (no `axes:` in Fraunces, `weight: ['400', '500']` on IBM Plex Mono)
- `app/(client)/layout.tsx` — server component `ClientGroupLayout` wrapping `ClientShell` (D-64)
- `app/(rm)/layout.tsx` — server component `RMGroupLayout` wrapping `RMShell` (D-64)
- `app/dev/primitives/page.tsx` — `'use client'` demo page rendering all 8 primitives × all states: 4 Eyebrow, 12 StatusChip (6 kinds × dot/no-dot), 18 StagePill (3 states × 6 n), 2 AIPulseDot, 3 AIBadge, 3 ActionCard, 35 Icon, 7 Avatar; lives outside route groups (path `app/dev/primitives/` not under `(client)/` or `(rm)/`)

## Task Commits

Each task committed atomically:

1. **Task 1 RED: TopStrip failing tests** — `2626dd9` (test)
2. **Task 1 GREEN: TopStrip implementation** — `2baf543` (feat)
3. **Task 2: Layout wiring** — `25ab964` (feat)
4. **Task 3: Primitives demo page** — `1f87302` (feat)

## Files Created/Modified

- `components/shell/TopStrip.tsx` — 'use client'; usePathname → modeForPathname; brand cluster (RisingMark + wordmark + Eyebrow); context badge; ModeSwitcher; LanguageToggle; mail/help icons; persona block; 3 mode arms
- `components/shell/TopStrip.test.tsx` — 19 assertions: base rendering, client mode (YT/TREASURER/Kaisei), rm mode (JL/RELATIONSHIP MGR/Japanese Corporates), demo mode (no persona/no badge), SHELL-05 negative invariant
- `app/layout.tsx` — added `import { TopStrip }` + `<TopStrip />` above `{children}` in body
- `app/(client)/layout.tsx` — new; default export `ClientGroupLayout` → `<ClientShell>{children}</ClientShell>`
- `app/(rm)/layout.tsx` — new; default export `RMGroupLayout` → `<RMShell>{children}</RMShell>`
- `app/dev/primitives/page.tsx` — new; 'use client'; 8 sections; file-header cites D-80, D-85, SHELL-04

## Decisions Made

- TopStrip is the only `'use client'` component in the root layout chain — `usePathname()` requires client context; all other shell components (ClientShell, RMShell, ModeSwitcher, LanguageToggle) remain RSC
- Demo page requires `'use client'` because `ActionCard`'s `onClick` prop is an event handler that cannot be serialized by Next.js prerender when passing from an RSC to a client component
- OD-12 strategy b confirmed: inline `style={{ fontVariationSettings: '"SOFT" 80, "WONK" 1' }}` on the wordmark `<span>` is the sole SOFT/WONK consumer in Phase 4; no `axes:` key in `Fraunces()` config

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] SHELL-05 negative invariant test regex: `/>` vs `></line>`**
- **Found during:** Task 1 GREEN (first test run)
- **Issue:** Plan-specified test regex `/<line[^>]*stroke="var\(--color-fresh-green\)"[^>]*\/>/g` uses self-closing `/>` to strip the RisingMark hand `<line>` before checking for remaining fresh-green. JSDOM serializes SVG elements as paired tags (`</line>`) not self-closing, so the regex never matched and the `<line>` stroke remained in the checked HTML string.
- **Fix:** Changed regex to `/<line[^>]*stroke="var\(--color-fresh-green\)"[^>]*><\/line>/g`
- **Files modified:** `components/shell/TopStrip.test.tsx`
- **Commit:** `2baf543` (included in GREEN feat commit)

**2. [Rule 1 - Bug] Demo page prerender error: onClick handler in RSC**
- **Found during:** Task 3 build verification
- **Issue:** `app/dev/primitives/page.tsx` was a Server Component but passed `onClick={() => {}}` to `ActionCard`. Next.js static prerender throws: "Event handlers cannot be passed to Client Component props."
- **Fix:** Added `'use client'` directive on line 1 of the demo page; updated file-header comment to document the reason
- **Files modified:** `app/dev/primitives/page.tsx`
- **Commit:** `1f87302` (included in task commit)

## Known Stubs

None — all components render their intended content. The route-group layouts are intentionally minimal (shell wrappers); they receive content from Phase 5/6 pages.

## Threat Surface Scan

No new threat surface beyond what the plan's threat model covers:
- T-04-10-01 (env gate via ModeSwitcher): ModeSwitcher's own env gate handles this; TopStrip passes `activeMode` prop only
- T-04-10-04 (SHELL-05 retrofits): Confirmed at authorship — Avatar `color="trad-green-soft"`, mail dot `bg-signal-amber`; SHELL-05 negative invariant test (test 19) verifies no residual fresh-green in rendered HTML after RisingMark line removal

## Self-Check: PASSED

All 6 files exist:
- components/shell/TopStrip.tsx: FOUND
- components/shell/TopStrip.test.tsx: FOUND
- app/layout.tsx: FOUND (modified)
- app/(client)/layout.tsx: FOUND
- app/(rm)/layout.tsx: FOUND
- app/dev/primitives/page.tsx: FOUND

All 4 task commits exist:
- 2626dd9 (TopStrip test RED): FOUND
- 2baf543 (TopStrip impl GREEN): FOUND
- 25ab964 (layout wiring): FOUND
- 1f87302 (primitives demo): FOUND

Final verification: typecheck + lint + 182 tests (18 test files) all pass; `npm run build` exits 0 with 5 routes compiled (/dev/primitives added).

---
*Phase: 04-app-shell-primitives*
*Completed: 2026-04-27*
