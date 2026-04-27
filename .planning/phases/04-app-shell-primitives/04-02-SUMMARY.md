---
phase: 04-app-shell-primitives
plan: "02"
subsystem: fonts
tags: [fonts, fraunces, ibm-plex-mono, decisions, planner-directive]

dependency_graph:
  requires: [04-01]
  provides: [IBM Plex Mono weight 500 in font bundle, D-64/D-65/D-66 audit trail]
  affects: [app/layout.tsx, DECISIONS.md]

tech_stack:
  added: []
  patterns:
    - "IBM Plex Mono loaded at weights 400 + 500 (not 700) via next/font"
    - "Fraunces SOFT/WONK deferred to inline fontVariationSettings at wordmark (OD-12 strategy b)"

key_files:
  modified:
    - app/layout.tsx
    - DECISIONS.md

decisions:
  - "D-64: IBM Plex Mono weight bundle swapped 700→500 — weight 700 was dead-weight; Phase 4 mono surfaces need 500"
  - "D-65: Fraunces SOFT/WONK via inline fontVariationSettings on wordmark only (OD-12 strategy b); D-31 Fraunces import stays untouched"
  - "D-66: modeForPathname 3-arm union 'client' | 'rm' | 'demo' — /dev paths return 'demo' chrome variant"

metrics:
  duration: "135s"
  completed: "2026-04-27"
  tasks_completed: 3
  files_modified: 2
---

# Phase 4 Plan 02: App Layout Fonts Summary

IBM Plex Mono weight bundle swapped from `['400', '700']` to `['400', '500']` in `app/layout.tsx`, with D-64/D-65/D-66 audit-trail entries appended to DECISIONS.md.

## Tasks Completed

| # | Task | Commit | Outcome |
|---|------|--------|---------|
| 1 | PD-1 safety pre-check (grep font-bold) | — | 0 matches — verified safe to swap weight |
| 2 | Swap IBM Plex Mono weight `['400', '700']` → `['400', '500']` | fc7b763 | Single-line edit at `app/layout.tsx:31` |
| 3 | Append D-64 + D-65 + D-66 to DECISIONS.md | f8ba054 | Three new entries; no existing lines modified |

## What Was Built

- **`app/layout.tsx:31`** — `weight: ['400', '700']` changed to `weight: ['400', '500']`. Phase 4 mono surfaces (Eyebrow 10/500, ModeSwitcher labels 14/500) now resolve weight 500 correctly. Dead-weight 700 removed from the bundle.
- **`DECISIONS.md`** — Three new entries appended:
  - D-64: Records the IBM Plex Mono weight swap with safety pre-check evidence
  - D-65: Records OD-12 strategy (b) — Fraunces SOFT/WONK inline at wordmark only; D-31 import stays untouched
  - D-66: Records modeForPathname 3-arm union extension (`'client' | 'rm' | 'demo'`) per RESEARCH §8.2

## Safety Pre-Check Evidence (Task 1)

```
$ grep -rn "font-bold" app/ components/ lib/
(components/ does not exist yet — Phase 4 creates it; absence = 0 matches)
Exit code: 1 from grep on app/ and lib/ — confirmed 0 font-bold occurrences
```

The swap is safe: no existing surface relied on `font-bold` (weight 700) in the mono context.

## Verification

- `app/layout.tsx` diff: exactly 1 changed line (line 31, `'700'` → `'500'`)
- `DECISIONS.md` diff: exactly 3 added lines (D-64, D-65, D-66) — no deletions
- Fraunces config (lines 5–12): byte-identical to pre-edit state
- Body: still `<body>{children}</body>` — TopStrip insert is Plan 04-10
- `npm run typecheck` — exit 0
- `npm run lint` — exit 0
- `npm run test` — 34 tests passed
- `npm run build` — exit 0

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — this plan is configuration + audit-trail only; no UI rendering paths introduced.

## Threat Flags

None — changes are font configuration and append-only documentation. No new network endpoints, auth paths, file access patterns, or schema changes.

## Self-Check: PASSED

- `app/layout.tsx` exists and contains `weight: ['400', '500'],` at line 31 ✓
- `DECISIONS.md` contains D-64, D-65, D-66 entries ✓
- Commits fc7b763 and f8ba054 exist in git log ✓
