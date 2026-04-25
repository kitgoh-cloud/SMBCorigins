---
id: 02-03
phase: 02-scaffolding
plan: 03
status: complete
completed_at: 2026-04-25
commit: 90fc06d
---

# 02-03 SUMMARY — Design tokens + four fonts + token showcase

## What landed
- `app/globals.css` rewritten: full SMBC token set in `@theme {}` + font remap in `@theme inline {}` + minimal body reset.
- `app/layout.tsx` rewritten: four Google Fonts loaded via `next/font/google`, all four `.variable` classNames composed onto `<html>`, metadata set to "SMBC Origin".
- `app/page.tsx` rewritten: D-41 verification surface — 18 swatches (4 groups) + 4 font samples + Japanese line + IBM Plex Mono ID/timestamp sample.

## Color tokens (18 — verbatim from docs/ORIGIN_DESIGN.md §8.1)
| Token | Hex |
|-------|-----|
| `--color-trad-green` | `#004832` |
| `--color-trad-green-deep` | `#00301F` |
| `--color-trad-green-soft` | `#1A5F48` |
| `--color-fresh-green` (AI-only D-28) | `#BFD730` |
| `--color-fresh-green-mute` (AI-only D-28) | `#D4E566` |
| `--color-fresh-green-glow` (AI-only D-28) | `#BFD73022` |
| `--color-ink` | `#0A1410` |
| `--color-ink-soft` | `#3C4540` |
| `--color-ink-muted` | `#7A827D` |
| `--color-paper` | `#FAFBF7` |
| `--color-paper-deep` | `#F3F5EE` |
| `--color-mist` | `#E8EDE4` |
| `--color-signal-amber` | `#E8A317` |
| `--color-signal-red` | `#C73E1D` |
| `--color-signal-info` | `#2A6F97` |
| `--color-dark-bg` | `#0B1F17` |
| `--color-dark-surface` | `#112820` |
| `--color-dark-text` | `#E8EDE4` |

## Spacing tokens (9, 8px scale)
`--spacing-1: 4px`, `--spacing-2: 8px`, `--spacing-3: 12px`, `--spacing-4: 16px`, `--spacing-6: 24px`, `--spacing-8: 32px`, `--spacing-12: 48px`, `--spacing-16: 64px`, `--spacing-24: 96px`

## Radius tokens (3)
`--radius-button: 6px`, `--radius-card: 12px`, `--radius-modal: 16px`

## Font config
| Font | Subsets | Axes / Weight | CSS var |
|------|---------|---------------|---------|
| Fraunces | `['latin']` | implicit `wght` (next/font@16 type rejects explicit `'wght'`) | `--font-fraunces` |
| Inter Tight | `['latin']` | variable (no weight) | `--font-inter-tight` |
| Noto Sans JP | `['latin']` only (D-32 — JP via unicode-range) | variable | `--font-noto-sans-jp` |
| IBM Plex Mono | `['latin']` | `weight: ['400','700']` (NOT a variable font) | `--font-ibm-plex-mono` |

Cross-file CSS-var contract verified: the four `variable: '--font-*'` strings in `app/layout.tsx` match the four `var(--font-*)` references in `app/globals.css` `@theme inline`.

## Verification
- `npm run typecheck` → exit 0 ✓
- `npm run lint` → exit 0 ✓
- `npm run build` → "Compiled successfully" ✓ (Next.js 16.2.4 / Tailwind v4)
- `npx prettier --check .` → clean ✓
- Manual smoke test pending: open `npm run dev` to confirm 18 labeled swatches + 4 font samples render.

## Deviations from plan
1. **`axes: ['wght']` removed from Fraunces.** next/font@16's TS types only accept `'SOFT' | 'WONK' | 'opsz'` as axes; `wght` is implicit/always-on for variable fonts. Behavior unchanged (Fraunces still loads as wght-only variable font). D-31 intent satisfied.

## Next
- 02-04: persona route groups `app/(client)/journey/page.tsx` and `app/(rm)/cockpit/page.tsx`.
