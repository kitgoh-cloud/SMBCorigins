---
phase: 04-app-shell-primitives
plan: "04"
subsystem: css-tokens
tags: [css, animation, keyframes, tailwind-v4, theme]
dependency_graph:
  requires: [04-01]
  provides: [animate-ai-pulse utility class via @theme token]
  affects: [components/primitives/AIPulseDot.tsx]
tech_stack:
  added: []
  patterns: [Tailwind v4 --animate-* token auto-generating animate-* utility, CSS keyframes carve-out per D-89 strategy (c)]
key_files:
  created: []
  modified:
    - app/globals.css
decisions:
  - "D-89 strategy (c) carve-out: @keyframes is CSS, not a Tailwind utility — lives in globals.css, not in component props"
  - "Timing locked at 1200ms cubic-bezier(0.4, 0, 0.2, 1) infinite alternate per UI-SPEC OD-6"
metrics:
  duration: "< 5 min"
  completed: "2026-04-27"
  tasks_completed: 1
  files_modified: 1
---

# Phase 4 Plan 04: globals.css AI Pulse Animation Summary

Additive edits to `app/globals.css` — added `--animate-ai-pulse` @theme token and `@keyframes ai-pulse` block so `AIPulseDot` (Plan 04-06) can consume the `animate-ai-pulse` Tailwind utility per D-89 strategy (c) carve-out.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add @keyframes ai-pulse + --animate-ai-pulse token | 74ed710 | app/globals.css |

## What Was Built

Two additive edits to `app/globals.css`:

1. `--animate-ai-pulse: ai-pulse 1200ms cubic-bezier(0.4, 0, 0.2, 1) infinite alternate;` added inside the existing `@theme {}` block after the radius tokens. Tailwind v4's `--animate-*` naming convention auto-generates the `animate-ai-pulse` utility class.

2. `@keyframes ai-pulse {}` block added at top level between `@theme inline {}` and `body {}`. The keyframe defines `0%` (scale 1, opacity 0.85) → `100%` (scale 1.15, opacity 1) with `infinite alternate` for a smooth, non-snapping pulse.

All existing tokens (palette, spacing, radius, font remap, body reset) are byte-identical to pre-edit state — purely additive change.

## Verification Passed

- `grep -q "@keyframes ai-pulse {"` — PASS
- `grep -q "--animate-ai-pulse: ai-pulse 1200ms..."` — PASS
- `grep -c "^@theme {"` returns 1 — PASS (exactly one `@theme {` block)
- `wc -l app/globals.css` returns 87 (73 + 14 net additions — within expected ~85–95 range) — PASS
- `npm run build` exits 0 — PASS
- `npm run lint` exits 0 — PASS

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — this plan adds CSS primitives only. `AIPulseDot` (Plan 04-06) will wire the `animate-ai-pulse` class.

## Threat Flags

No new security-relevant surface introduced. Static CSS keyframe with no user input interpolation (per T-04-04-01 and T-04-04-02 in plan threat model).

## Self-Check: PASSED

- app/globals.css: FOUND
- Commit 74ed710: FOUND
