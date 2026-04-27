---
phase: 5
plan: 05-06
title: AttentionCard component — "For your attention" action queue with strict P-1 inert rows
wave: 2
depends_on: [05-01]
files_modified:
  - components/journey/AttentionCard.tsx
  - components/journey/AttentionCard.test.tsx
autonomous: true
requirements_addressed: [CJD-04]
od5r_resolutions: [OD5R-04]
estimated_minutes: 35
---

<objective>
Build `AttentionCard`, the action-queue card in the 3-column grid. Renders:
- Header: `<Eyebrow>For your attention · {N}</Eyebrow>` (Phase 4 primitive applies the locked mono/uppercase/tracking style) + `<StatusChip kind="amber">Due this week</StatusChip>`
- Body: 3 inert ActionRow components from `STAGE_3_ATTENTION_ITEMS` (lib/cjd.ts), with the third row faint (opacity 0.7)

**Strict P-1 inert** (OD5R-04): rows are `<div>` elements (NOT `<button>`, NOT `<a>`), no `onClick`, no `cursor-pointer`. The chevron-right icon is a decorative affordance signaling future drilldown — not an interactive trigger. No hover/focus styles (the surface is not interactive in v1).

This card has **NO fresh-green surfaces**. File NOT in `.freshgreen-allowlist`.
</objective>

<must_haves>
- `components/journey/AttentionCard.tsx` is a Server Component with no props.
- Outer `<section className="card relative">` (Phase 4 card classes or inline equivalent: `bg-paper border border-mist rounded-[12px] p-6 relative`).
- Header (mb-4, flex justify-between items-center):
  - `<Eyebrow>{`For your attention · ${STAGE_3_ATTENTION_ITEMS.length}`}</Eyebrow>` (= "FOR YOUR ATTENTION · 3" after uppercase)
  - `<StatusChip kind="amber">Due this week</StatusChip>`
- Body: `STAGE_3_ATTENTION_ITEMS.map((item, idx) => <ActionRow key={item.id} title={item.title} meta={item.meta} faint={idx === 2} />)`
- Inline `ActionRow` sub-component (in same file): `<div>` (NOT button, NOT anchor), with:
  - className: `flex items-center gap-3 py-3 border-b border-mist`
  - inline `style={{ opacity: faint ? 0.7 : 1 }}`
  - 8×8 dot: `<span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: faint ? 'var(--color-ink-faint)' : 'var(--color-signal-amber)' }} />`
  - Body div: title at fontSize 13.5, weight 500, ink; meta at fontSize 12, ink-muted
  - Trailing chevron: `<Icon name="chevron-right" size={16} style={{ color: 'var(--color-ink-muted)' }} />`
- File header comment naming Phase 5 + decisions (D-19, D-20, OD5R-04).
- **No `onClick`, no `<button>`, no `<a>`, no `cursor-pointer`** — strict P-1 inert.
- **No fresh-green tokens** — negative grep test passes.
- Tests cover all locked copy strings + P-1 inert assertions + fresh-green negative.
- File NOT in `.freshgreen-allowlist`.
</must_haves>

<threat_model>
| Threat ID | Category | Component | Disposition | Mitigation |
|-----------|----------|-----------|-------------|------------|
| T-05R-18 | P-1 violation (rows interactive) | ActionRow | mitigate | Renders as `<div>`, no `onClick`, no `cursor-pointer`. Tests grep all four absences. |
| T-05R-19 | Wrong indicator color (fresh-green dot leak) | ActionRow indicator | mitigate | Indicator dots use `var(--color-signal-amber)` or `var(--color-ink-faint)` — never fresh-green. Negative grep test. |

</threat_model>

<tasks>

<task type="auto">
  <name>Task 1: Create AttentionCard.tsx with inline ActionRow</name>
  <read_first>
    - .planning/phases/05-client-journey-dashboard/05-UI-SPEC.md §Component Specs > AttentionCard, §Copywriting Contract > AttentionCard
    - .planning/phases/05-client-journey-dashboard/05-CONTEXT.md D-19, D-20
    - lib/cjd.ts (STAGE_3_ATTENTION_ITEMS)
    - components/primitives/index.ts (Eyebrow, StatusChip, Icon)
  </read_first>
  <action>
Create the component:

```tsx
// components/journey/AttentionCard.tsx — Phase 5 redo CJD-04 (action queue card).
//
// Server Component. Stage 3 lock with static demo data from STAGE_3_ATTENTION_ITEMS.
// Strict P-1 inert per OD5R-04: rows are <div>, no onClick, no cursor-pointer.
//
// Decisions covered: D-19 (Stage 3 lock), D-20 (ActionRow as div).
// OD5R resolution: OD5R-04 (strict inert).

import type { ReactElement } from 'react'
import { Eyebrow, Icon, StatusChip } from '@/components/primitives'
import { STAGE_3_ATTENTION_ITEMS } from '@/lib/cjd'

export function AttentionCard(): ReactElement {
  const count = STAGE_3_ATTENTION_ITEMS.length
  return (
    <section className="relative bg-paper border border-mist rounded-[12px] p-6">
      <div className="flex items-center justify-between mb-4">
        <Eyebrow>{`For your attention · ${count}`}</Eyebrow>
        <StatusChip kind="amber">Due this week</StatusChip>
      </div>
      {STAGE_3_ATTENTION_ITEMS.map((item, idx) => (
        <ActionRow
          key={item.id}
          title={item.title}
          meta={item.meta}
          faint={idx === 2}
        />
      ))}
    </section>
  )
}

type ActionRowProps = {
  title: string
  meta: string
  faint?: boolean
}

function ActionRow({ title, meta, faint = false }: ActionRowProps): ReactElement {
  return (
    <div
      className="flex items-center gap-3 py-3 border-b border-mist"
      style={{ opacity: faint ? 0.7 : 1 }}
    >
      <span
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{
          background: faint
            ? 'var(--color-ink-faint)'
            : 'var(--color-signal-amber)',
        }}
        aria-hidden="true"
      />
      <div className="flex-1">
        <div style={{ fontSize: 13.5, color: 'var(--color-ink)', fontWeight: 500 }}>
          {title}
        </div>
        <div style={{ fontSize: 12, color: 'var(--color-ink-muted)', marginTop: 2 }}>
          {meta}
        </div>
      </div>
      <Icon name="chevron-right" size={16} style={{ color: 'var(--color-ink-muted)' }} />
    </div>
  )
}
```
  </action>
  <verify>
    - File exists; typecheck/lint clean.
  </verify>
</task>

<task type="auto">
  <name>Task 2: Create AttentionCard.test.tsx</name>
  <action>
Create tests covering:
- Header eyebrow renders "FOR YOUR ATTENTION · 3" (uppercased).
- StatusChip with kind="amber" + text "Due this week".
- 3 ActionRows render with locked title/meta strings.
- 3rd row has `opacity: 0.7` (faint flag).
- 1st + 2nd row indicator dots have `background: var(--color-signal-amber)`; 3rd row has `var(--color-ink-faint)`.
- **No `<button>`, no `<a>`, no `onClick`, no `cursor-pointer`** — P-1 inert (OD5R-04).
- **No fresh-green tokens** anywhere.
- Chevron icons render at size 16.

```tsx
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { AttentionCard } from '@/components/journey/AttentionCard'

describe('AttentionCard — header', () => {
  it('renders FOR YOUR ATTENTION · 3 eyebrow + Due this week amber chip', () => {
    const { container } = render(<AttentionCard />)
    expect(container.textContent).toContain('For your attention · 3')
    expect(container.textContent).toContain('Due this week')
    const chip = container.querySelector('[class*="chip--amber"], .chip--amber, [data-kind="amber"]')
    expect(chip).not.toBeNull()
  })
})

describe('AttentionCard — locked content (Stage 3 lock, D-19)', () => {
  it('renders the 3 locked titles and metas verbatim', () => {
    const { container } = render(<AttentionCard />)
    expect(container.textContent).toContain('Upload Kaisei Europe — Certificate of Incorporation')
    expect(container.textContent).toContain('Required · UK jurisdiction · due Apr 28')
    expect(container.textContent).toContain('Attest source-of-wealth — Tanaka Family Trust')
    expect(container.textContent).toContain('Template ready · 4 beneficiaries')
    expect(container.textContent).toContain('Confirm directors on HK application')
    expect(container.textContent).toContain('Pre-filled by Origin from Singapore — review and submit')
  })

  it('renders 3 separator borders (or 3 ActionRow divs)', () => {
    const { container } = render(<AttentionCard />)
    const rows = container.querySelectorAll('[class*="border-b"][class*="border-mist"]')
    expect(rows.length).toBe(3)
  })
})

describe('AttentionCard — faint flag (3rd row opacity)', () => {
  it('3rd ActionRow has opacity 0.7; 1st and 2nd have opacity 1', () => {
    const { container } = render(<AttentionCard />)
    const rows = Array.from(container.querySelectorAll('[class*="border-b"][class*="border-mist"]')) as HTMLElement[]
    expect(String(rows[0].style.opacity)).toBe('1')
    expect(String(rows[1].style.opacity)).toBe('1')
    expect(String(rows[2].style.opacity)).toBe('0.7')
  })
})

describe('AttentionCard — indicator dot colors', () => {
  it('1st + 2nd dots use signal-amber; 3rd dot uses ink-faint', () => {
    const { container } = render(<AttentionCard />)
    const dots = Array.from(container.querySelectorAll('[aria-hidden="true"][class*="rounded-full"]')) as HTMLElement[]
    expect(dots.length).toBeGreaterThanOrEqual(3)
    expect(dots[0].style.background).toBe('var(--color-signal-amber)')
    expect(dots[1].style.background).toBe('var(--color-signal-amber)')
    expect(dots[2].style.background).toBe('var(--color-ink-faint)')
  })
})

describe('AttentionCard — strict P-1 inert (OD5R-04)', () => {
  it('contains no <button> elements', () => {
    const { container } = render(<AttentionCard />)
    expect(container.querySelectorAll('button').length).toBe(0)
  })

  it('contains no <a> elements', () => {
    const { container } = render(<AttentionCard />)
    expect(container.querySelectorAll('a').length).toBe(0)
  })

  it('does not apply cursor-pointer to any element', () => {
    const { container } = render(<AttentionCard />)
    expect(container.innerHTML).not.toMatch(/cursor-pointer/)
  })
})

describe('AttentionCard — fresh-green negative', () => {
  it('outerHTML has no bg-fresh-green / text-fresh-green tokens', () => {
    const { container } = render(<AttentionCard />)
    expect(container.innerHTML).not.toMatch(/\bbg-fresh-green\b/)
    expect(container.innerHTML).not.toMatch(/\btext-fresh-green\b/)
  })
})
```
  </action>
  <verify>
    - All tests pass.
  </verify>
</task>

<task type="auto">
  <name>Task 3: Atomic commit</name>
  <action>
Commit:
```
feat(phase-05-redo): AttentionCard component (Plan 05-06)

Phase 5 redo Wave 2: action queue card with 3 inert ActionRows. "For
your attention · 3" eyebrow + amber StatusChip + 3 rows with locked
title/meta strings. 3rd row faint (opacity 0.7).

Decisions covered: D-19 (Stage 3 lock), D-20 (ActionRow as <div>).
OD5R resolution: OD5R-04 (strict inert — no nav, no cursor-pointer).

NO fresh-green surfaces; file NOT in .freshgreen-allowlist. Indicator
dots use signal-amber and ink-faint colors only.
```
  </action>
</task>

</tasks>

<acceptance>
- AttentionCard renders eyebrow "For your attention · 3", amber chip, 3 ActionRows, 3rd row faint.
- No `<button>`, `<a>`, `cursor-pointer`, fresh-green tokens.
- File NOT in `.freshgreen-allowlist`.
- Tests/typecheck/lint exit 0.
</acceptance>
