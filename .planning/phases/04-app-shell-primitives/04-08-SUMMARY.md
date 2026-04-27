---
phase: 04-app-shell-primitives
plan: 08
subsystem: ui
tags: [shell, chrome, rising-mark, language-toggle, mode-switcher, retrofit-3-and-4, env-gated, tdd]

# Dependency graph
requires:
  - phase: 04-01-test-infrastructure
    provides: vitest config with globals:false and @/ path aliases
  - phase: 04-03-persona
    provides: lib/persona.ts — PERSONA_HOME, Mode type
  - phase: 04-05-primitives
    provides: components/primitives/Eyebrow.tsx

provides:
  - components/shell/RisingMark.tsx — brand SVG with fresh-green clock hand (allowlisted D-85)
  - components/shell/LanguageToggle.tsx — visual-only EN / 日本語 non-interactive spans
  - components/shell/ModeSwitcher.tsx — env-gated dev affordance, retrofits #3 + #4 applied at authorship
  - components/shell/RisingMark.test.tsx — 8 passing assertions
  - components/shell/LanguageToggle.test.tsx — 8 passing assertions
  - components/shell/ModeSwitcher.test.tsx — 14 passing assertions

affects:
  - 04-10-topstrip (composes all 3 components)
  - 04-11-shell05-enforcement (grep script allowlists RisingMark.tsx; sees no violations in ModeSwitcher/LanguageToggle)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Env-gated RSC pattern: early return null when process.env.NEXT_PUBLIC_* !== 'true' (D-68)"
    - "Retrofit-at-authorship: new files use replacement tokens directly; grep script sees no violations"
    - "Non-interactive span toggle: visual-only affordance rendered as <span> so it never receives focus"
    - "Brand-iconographic exception: fresh-green in RisingMark.tsx is the only allowlisted usage in shell/"

key-files:
  created:
    - components/shell/RisingMark.tsx
    - components/shell/RisingMark.test.tsx
    - components/shell/LanguageToggle.tsx
    - components/shell/LanguageToggle.test.tsx
    - components/shell/ModeSwitcher.tsx
    - components/shell/ModeSwitcher.test.tsx
  modified: []

key-decisions:
  - "RisingMark default size=24 (UI-SPEC OD-3 TopStrip use) overrides prototype default of 28 — callers don't need to pass size={24} explicitly"
  - "LanguageToggle comment 'No AI-reserved brand tokens' avoids matching the SHELL-05 grep pattern — documentation clarity without false positives"
  - "ModeSwitcher file-header comment references retrofits as 'prototype bad value → replacement' rather than quoting the forbidden hex/rgba — avoids grep false positives while preserving documentation intent"
  - "ModeSwitcher is RSC (no 'use client') — Link from next/link works in RSC; TopStrip holds the client boundary and passes activeMode as prop"

# Metrics
duration: 4min
completed: 2026-04-27
---

# Phase 4 Plan 08: RisingMark + LanguageToggle + ModeSwitcher Summary

**Three shell chrome components with TDD: brand SVG (allowlisted fresh-green), visual-only language toggle (non-interactive spans), and env-gated mode switcher (SHELL-05 retrofits #3+#4 applied at authorship — no forbidden tokens)**

## Performance

- **Duration:** 4 min
- **Started:** 2026-04-27T01:38:14Z
- **Completed:** 2026-04-27T01:42:xx Z
- **Tasks:** 3
- **Files modified:** 6

## Accomplishments

- `components/shell/RisingMark.tsx` — brand SVG with 2 circles + 2 lines, default size=24 (UI-SPEC OD-3), fresh-green clock-hand stroke via allowlisted brand-iconographic exception (D-85)
- `components/shell/LanguageToggle.tsx` — visual-only EN/日本語 rendered as `<span>` elements (never receives focus), EN active via `bg-paper/8`, 日本語 inactive via `text-paper/70`, font-body/font-jp applied
- `components/shell/ModeSwitcher.tsx` — env-gated (returns null unless `NEXT_PUBLIC_SHOW_MODE_SWITCHER === 'true'`); retrofit #3 (`border-ink-muted/30` dashed border) and retrofit #4 (`text-signal-amber` DEMO eyebrow via `<Eyebrow>`) applied at authorship; uses `PERSONA_HOME` from lib/persona.ts; RSC (no `'use client'`)
- 30 total test assertions across 3 test files (8 + 8 + 14); all pass

## Task Commits

Each task was committed atomically:

1. **Task 1: RisingMark.tsx + test** — `22f5218` (feat)
2. **Task 2: LanguageToggle.tsx + test** — `28555ba` (feat)
3. **Task 3: ModeSwitcher.tsx + test** — `6a774cd` (feat)

## Files Created/Modified

- `components/shell/RisingMark.tsx` — SVG brand mark; fresh-green hand prop default (allowlisted D-85); default size=24; aria-hidden=true
- `components/shell/RisingMark.test.tsx` — 8 assertions: SVG structure, size defaults, prop overrides, allowlisted fresh-green token
- `components/shell/LanguageToggle.tsx` — visual-only EN/日本語; both `<span>` (no focus); font-body/font-jp; bg-paper/8 active tint; no AI-reserved tokens
- `components/shell/LanguageToggle.test.tsx` — 8 assertions: segment structure, font utilities, non-interactivity, aria-label
- `components/shell/ModeSwitcher.tsx` — env-gated RSC; 2 Links (/journey, /cockpit); retrofit #3 + #4; activeMode prop; no AI-reserved tokens
- `components/shell/ModeSwitcher.test.tsx` — 14 assertions: 4 env-gate cases, retrofit class assertions, 2 Links, activeMode='client'/'rm'/'demo' variants, hover/focus-visible, segment labels, negative fresh-green invariant

## Decisions Made

- Default size=24 for RisingMark overrides the prototype's 28 — matches UI-SPEC OD-3 TopStrip default so TopStrip doesn't need to pass size={24} explicitly
- ModeSwitcher comment language avoids quoting forbidden hex/rgba literals to prevent SHELL-05 grep false positives; uses "prototype bad value" phrasing
- LanguageToggle comment avoids "fresh-green" in comment text to stay clean under the grep enforcement pass

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Comment text triggered SHELL-05 grep false positives**
- **Found during:** Task 1 and Task 3
- **Issue:** LanguageToggle's comment "No fresh-green tokens." and ModeSwitcher's retrofit documentation comments both contained the literal "fresh-green" string, causing `grep -E "fresh-green"` to return matches even though no actual CSS token used the forbidden value
- **Fix:** Replaced "No fresh-green tokens" with "No AI-reserved brand tokens" in LanguageToggle; replaced quoted forbidden values in ModeSwitcher header with "prototype bad value" phrasing
- **Files modified:** `components/shell/LanguageToggle.tsx`, `components/shell/ModeSwitcher.tsx`
- **Commit:** Included in task commits 28555ba and 6a774cd

## Known Stubs

None — all three components render their intended output. No placeholder copy, no wired-to-empty data.

## Threat Flags

T-04-08-01 (NEXT_PUBLIC_SHOW_MODE_SWITCHER env leak) is mitigated at code level — the early-return null gate is in place. Vercel production scope configuration (env var unset in production) is a manual dashboard step deferred per CONTEXT.md "Newly deferred" and is not a code concern for this plan.

No new threat surface introduced beyond what the plan's threat model covers.

## Self-Check: PASSED

All 6 files exist and are accounted for:
- components/shell/RisingMark.tsx ✓
- components/shell/RisingMark.test.tsx ✓
- components/shell/LanguageToggle.tsx ✓
- components/shell/LanguageToggle.test.tsx ✓
- components/shell/ModeSwitcher.tsx ✓
- components/shell/ModeSwitcher.test.tsx ✓

All 3 commits exist:
- 22f5218 (RisingMark) ✓
- 28555ba (LanguageToggle) ✓
- 6a774cd (ModeSwitcher) ✓

Final verification (typecheck + lint + all shell tests): 47 tests across 5 test files in components/shell/ passed; 0 failures.

---
*Phase: 04-app-shell-primitives*
*Completed: 2026-04-27*
