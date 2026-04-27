---
phase: 5
plan: 05-04
title: GreetingBlock component — 縁 watermark + bilingual greeting + Reiwa·Gregorian eyebrow + summary paragraph
wave: 2
depends_on: [05-01, 05-02]
files_modified:
  - components/journey/GreetingBlock.tsx
  - components/journey/GreetingBlock.test.tsx
autonomous: true
requirements_addressed: [CJD-02]
od5r_resolutions: [OD5R-03]
estimated_minutes: 50
---

<objective>
Build `GreetingBlock`, the free-floating greeting header at the top of the dashboard. Renders:

1. **縁 watermark** (decorative, absolutely positioned to top-right, off-canvas) — color `var(--color-trad-green)` at opacity 0.035, font-weight 300 (P-2'). **NOT fresh-green; NOT in `.freshgreen-allowlist`** (D-04).
2. **Eyebrow**: `${reiwa} · ${gregorian}` — date strings derived from `SERVER_DEMO_DATE` (D-12) for hydration stability.
3. **Bilingual greeting**: h1 "Good morning, Yuki-san." (44px Fraunces, SOFT 80 WONK 1) + JP "おはようございます" (22px Noto Sans JP, ink-muted), baseline-aligned with gap 16px.
4. **Summary paragraph**: 16px Inter Tight, ink-soft, max-width 640px. Includes "47 fields of document extraction" wrapped in `<strong style="color: var(--color-trad-green)">`. Static demo copy (OD5R-03).

Server Component. No interactive surfaces.
</objective>

<must_haves>
- `components/journey/GreetingBlock.tsx` is a Server Component (no `'use client'`).
- No props (or empty props type) — pulls `SERVER_DEMO_DATE` directly from `lib/cjd.ts`.
- Outer wrapper `<div className="reveal relative mb-7">` (mb-7 = 28px from chrome-metric exception).
- Watermark `<span aria-hidden="true">` rendered inside the GreetingBlock with locked CSS contract:
  - `position: absolute, top: -40px, right: -60px`
  - `font-family: var(--font-noto-sans-jp)` (or `font-jp` Tailwind utility — verify project convention)
  - `fontSize: 360px, fontWeight: 300, lineHeight: 0.8`
  - `color: var(--color-trad-green), opacity: 0.035`
  - `pointerEvents: none, userSelect: none`
  - Content: `縁`
- Eyebrow uses Phase 4 `<Eyebrow>` primitive; copy `${reiwa} · ${gregorian}` where:
  - `reiwa = formatReiwa(SERVER_DEMO_DATE)` → `'令和8年4月27日'`
  - `gregorian = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(SERVER_DEMO_DATE)` → `'Monday, 27 April 2026'`
  - Eyebrow `mb-[10px]` (chrome-metric exception, 10px from prototype `marginBottom: 10`).
- h1 + JP row: flex, baseline-aligned, gap-4 (16px), mb-2 (8px from prototype `marginBottom: 8`).
- h1 element: `<h1>` with text `'Good morning, Yuki-san.'`, `font-fraunces`, `text-[44px]`, `font-normal`, leading-[1.05]`, color `text-ink`, inline `style={{ fontVariationSettings: '"SOFT" 80, "WONK" 1' }}` (W-03).
- JP `<span>` with text `'おはようございます'`, `font-jp` (or equivalent), `text-[22px]`, `font-normal`, color `text-ink-muted`.
- Summary `<p>` with `text-[16px]`, `text-ink-soft`, `leading-relaxed`, `max-w-[640px]`, content **exactly**: `Your onboarding with SMBC is on track. Origin handled <strong style="color: var(--color-trad-green)">47 fields of document extraction</strong> overnight — two items need your attention today.` (the `<strong>` wraps "47 fields of document extraction"; the `—` is em-dash U+2014).
- File header comment naming Phase 5 redo + decisions covered (D-04, D-05, D-06, D-12, D-13, D-14, D-15, OD5R-03).
- **No fresh-green tokens anywhere** — negative grep test passes (the watermark is trad-green, not fresh-green; this is the D-04 correction).
- All tests pass; typecheck/lint clean.
- File NOT in `.freshgreen-allowlist`.
</must_haves>

<threat_model>
| Threat ID | Category | Component | Disposition | Mitigation |
|-----------|----------|-----------|-------------|------------|
| T-05R-11 | Hydration mismatch | Server Component date rendering | mitigate | Component reads `SERVER_DEMO_DATE` (frozen constant from `lib/cjd.ts`), NOT `new Date()`. SSR and CSR produce identical output. Test asserts the literal Reiwa + Gregorian strings. |
| T-05R-12 | Watermark mis-classification (fresh-green leak) | 縁 watermark | mitigate | Watermark color is locked to `var(--color-trad-green)` at opacity 0.035. Negative grep test verifies absence of `bg-fresh-green`, `text-fresh-green`, and any `rgba(191, 215, 48, ...)` literal. File NOT added to allowlist. |
| T-05R-13 | XSS in summary `<strong>` | Summary paragraph | mitigate | Static literal text. `<strong>` rendered via JSX text node (React auto-escapes). Inline `style` is a static string, not user input. |

</threat_model>

<tasks>

<task type="auto">
  <name>Task 1: Create components/journey/GreetingBlock.tsx</name>
  <read_first>
    - .planning/phases/05-client-journey-dashboard/05-UI-SPEC.md §Page Layout > Section 1, §Component Specs > GreetingBlock, §Copywriting Contract > GreetingBlock
    - .planning/phases/05-client-journey-dashboard/05-CONTEXT.md D-04, D-05, D-06, D-12, D-13, D-14, D-15
    - lib/cjd.ts (SERVER_DEMO_DATE, formatReiwa exports)
    - components/primitives/Eyebrow.tsx (Phase 4 primitive — verify it accepts `style` prop or pass via className)
    - app/globals.css @theme block (verify --color-trad-green token exists; --font-noto-sans-jp registered)
  </read_first>
  <action>
Create the component:

```tsx
// components/journey/GreetingBlock.tsx — Phase 5 redo CJD-02 greeting header.
//
// Server Component. Renders 縁 watermark (trad-green, weight 300 — D-04, D-05),
// Reiwa·Gregorian eyebrow (D-12), bilingual h1 (D-13, D-14), summary paragraph
// with static "47 fields" copy (D-15, OD5R-03 resolved STATIC).
//
// Hydration: SERVER_DEMO_DATE is a frozen constant — SSR and CSR identical.

import type { ReactElement } from 'react'
import { Eyebrow } from '@/components/primitives'
import { SERVER_DEMO_DATE, formatReiwa } from '@/lib/cjd'

const GREGORIAN_FORMATTER = new Intl.DateTimeFormat('en-GB', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

export function GreetingBlock(): ReactElement {
  const reiwa = formatReiwa(SERVER_DEMO_DATE)
  const gregorian = GREGORIAN_FORMATTER.format(SERVER_DEMO_DATE)

  return (
    <section className="reveal relative mb-7">
      {/* 縁 watermark — D-04: trad-green at opacity 0.035, NOT fresh-green */}
      <span
        aria-hidden="true"
        className="font-jp pointer-events-none select-none absolute"
        style={{
          position: 'absolute',
          top: '-40px',
          right: '-60px',
          fontSize: '360px',
          fontWeight: 300,
          color: 'var(--color-trad-green)',
          opacity: 0.035,
          lineHeight: 0.8,
          letterSpacing: '-0.05em',
        }}
      >
        縁
      </span>

      {/* Reiwa · Gregorian eyebrow */}
      <Eyebrow className="relative" style={{ marginBottom: 10 }}>
        {`${reiwa} · ${gregorian}`}
      </Eyebrow>

      {/* Bilingual h1 row */}
      <div className="relative flex items-baseline gap-4 mb-2">
        <h1
          className="font-fraunces text-[44px] font-normal leading-[1.05] text-ink m-0"
          style={{ fontVariationSettings: '"SOFT" 80, "WONK" 1' }}
        >
          Good morning, Yuki-san.
        </h1>
        <span className="font-jp text-[22px] font-normal text-ink-muted">
          おはようございます
        </span>
      </div>

      {/* Summary paragraph */}
      <p className="relative text-[16px] text-ink-soft leading-relaxed max-w-[640px] m-0">
        Your onboarding with SMBC is on track. Origin handled{' '}
        <strong style={{ color: 'var(--color-trad-green)', fontWeight: 500 }}>
          47 fields of document extraction
        </strong>{' '}
        overnight — two items need your attention today.
      </p>
    </section>
  )
}
```

**Eyebrow primitive dependency:** This component uses `<Eyebrow ... style={{ marginBottom: 10 }}>` for the 10px margin (chrome-metric exception from prototype `05bee446.js:19` `marginBottom: 10`). The Eyebrow primitive's `style?: CSSProperties` prop is added by Plan 05-02 Task 5. Plan 05-04 consumes the extended primitive; depends_on includes 05-02.
  </action>
  <verify>
    - File exists.
    - `npm run typecheck` exits 0.
    - `npm run lint -- components/journey/GreetingBlock.tsx` exits 0.
  </verify>
</task>

<task type="auto">
  <name>Task 2: Create GreetingBlock.test.tsx</name>
  <read_first>
    - phase-5-spec-divergence-archive:components/journey/HeroBlock.test.tsx (archive watermark/W-03/D-02 test patterns — repurpose for GreetingBlock)
  </read_first>
  <action>
Create `components/journey/GreetingBlock.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { GreetingBlock } from '@/components/journey/GreetingBlock'

describe('GreetingBlock — Reiwa·Gregorian eyebrow (D-12)', () => {
  it('renders "令和8年4月27日 · Monday, 27 April 2026"', () => {
    const { container } = render(<GreetingBlock />)
    expect(container.textContent).toContain('令和8年4月27日 · Monday, 27 April 2026')
  })
})

describe('GreetingBlock — bilingual greeting (D-13, D-14)', () => {
  it('renders EN h1 "Good morning, Yuki-san."', () => {
    const { container } = render(<GreetingBlock />)
    const h1 = container.querySelector('h1')
    expect(h1?.textContent).toBe('Good morning, Yuki-san.')
  })

  it('renders JP greeting "おはようございます"', () => {
    const { container } = render(<GreetingBlock />)
    expect(container.textContent).toContain('おはようございます')
  })

  it('h1 has inline fontVariationSettings "SOFT" 80, "WONK" 1', () => {
    const { container } = render(<GreetingBlock />)
    const h1 = container.querySelector('h1') as HTMLElement
    expect(h1.style.fontVariationSettings).toContain('SOFT')
    expect(h1.style.fontVariationSettings).toContain('80')
    expect(h1.style.fontVariationSettings).toContain('WONK')
    expect(h1.style.fontVariationSettings).toContain('1')
  })
})

describe('GreetingBlock — 縁 watermark (D-04, D-05, D-06)', () => {
  it('renders watermark span with content 縁 and aria-hidden', () => {
    const { container } = render(<GreetingBlock />)
    const wm = Array.from(container.querySelectorAll('span')).find(
      (el) => el.textContent === '縁' && el.getAttribute('aria-hidden') === 'true',
    ) as HTMLElement | undefined
    expect(wm).toBeDefined()
  })

  it('watermark CSS is trad-green at opacity 0.035, weight 300, 360px', () => {
    const { container } = render(<GreetingBlock />)
    const wm = Array.from(container.querySelectorAll('span')).find(
      (el) => el.textContent === '縁',
    ) as HTMLElement
    expect(wm.style.position).toBe('absolute')
    expect(wm.style.top).toBe('-40px')
    expect(wm.style.right).toBe('-60px')
    expect(wm.style.fontSize).toBe('360px')
    expect(String(wm.style.fontWeight)).toBe('300')
    expect(wm.style.color).toBe('var(--color-trad-green)')
    expect(String(wm.style.opacity)).toBe('0.035')
    expect(String(wm.style.lineHeight)).toBe('0.8')
  })

  it('watermark has pointer-events-none and select-none', () => {
    const { container } = render(<GreetingBlock />)
    const wm = Array.from(container.querySelectorAll('span')).find(
      (el) => el.textContent === '縁',
    ) as HTMLElement
    expect(wm.className).toContain('pointer-events-none')
    expect(wm.className).toContain('select-none')
  })
})

describe('GreetingBlock — summary paragraph (D-15, OD5R-03)', () => {
  it('renders the full paragraph with "47 fields of document extraction" in <strong>', () => {
    const { container } = render(<GreetingBlock />)
    const p = container.querySelector('p')
    expect(p).not.toBeNull()
    expect(p!.textContent).toBe(
      'Your onboarding with SMBC is on track. Origin handled 47 fields of document extraction overnight — two items need your attention today.',
    )
    const strong = container.querySelector('strong')
    expect(strong?.textContent).toBe('47 fields of document extraction')
  })

  it('<strong> uses trad-green color (NOT fresh-green)', () => {
    const { container } = render(<GreetingBlock />)
    const strong = container.querySelector('strong') as HTMLElement
    expect(strong.style.color).toBe('var(--color-trad-green)')
  })
})

describe('GreetingBlock — fresh-green negative (CJD-07 / W-04 correction)', () => {
  it('outerHTML contains no bg-fresh-green or text-fresh-green tokens', () => {
    const { container } = render(<GreetingBlock />)
    expect(container.innerHTML).not.toMatch(/\bbg-fresh-green\b/)
    expect(container.innerHTML).not.toMatch(/\btext-fresh-green\b/)
  })

  it('outerHTML contains no rgba(191, 215, 48 ...) literal (the archive\'s incorrect watermark color)', () => {
    const { container } = render(<GreetingBlock />)
    expect(container.innerHTML).not.toMatch(/rgba\s*\(\s*191\s*,\s*215\s*,\s*48/)
  })
})
```
  </action>
  <verify>
    - `npm run test -- --run components/journey/GreetingBlock.test.tsx` exits 0.
    - All assertions pass — including the trad-green watermark and fresh-green negative grep.
  </verify>
</task>

<task type="auto">
  <name>Task 3: Atomic commit</name>
  <action>
Stage `components/journey/GreetingBlock.tsx` + test. Commit:
```
feat(phase-05-redo): GreetingBlock component (Plan 05-04)

Phase 5 redo Wave 2: free-floating greeting header. Renders 縁 watermark
(trad-green at 0.035 opacity, weight 300 per D-04/D-05; NOT fresh-green),
Reiwa·Gregorian eyebrow (server-stable via SERVER_DEMO_DATE — D-12),
bilingual h1 with W-03 inline fontVariationSettings, summary paragraph
with static "47 fields" copy (OD5R-03 resolved STATIC).

Decisions covered: D-04 (watermark trad-green), D-05 (weight 300),
D-06 (watermark dimensions), D-12 (server-stable date), D-13 (h1 copy),
D-14 (JP copy), D-15 (47 fields static).
OD5R resolution: OD5R-03 (47 fields static, editorial not metric).

W-04 correction: the archive's HeroBlock used rgba(191,215,48,0.06)
fresh-green watermark sourced from ORIGIN_JOURNEY_DOC.html. The
prototype's actual watermark is trad-green at 0.035 — corrected here.
File NOT added to .freshgreen-allowlist (no fresh-green surfaces).
```
  </action>
  <verify>
    - Clean tree.
  </verify>
</task>

</tasks>

<acceptance>
- `components/journey/GreetingBlock.tsx` exists; renders all 4 elements (watermark, eyebrow, h1+JP row, paragraph).
- Watermark color is trad-green at 0.035 opacity, weight 300, 360px.
- File NOT in `.freshgreen-allowlist`.
- Negative fresh-green grep test passes.
- `npm run typecheck && npm run lint && npm run test` exit 0.
- `bash scripts/check-fresh-green.sh` exits 0.
</acceptance>
