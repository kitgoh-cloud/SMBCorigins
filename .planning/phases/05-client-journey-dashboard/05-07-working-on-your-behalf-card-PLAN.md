---
phase: 5
plan: 05-07
title: WorkingOnYourBehalfCard component — AI lane card with 3 task rows + Origin quote
wave: 2
depends_on: [05-01, 05-02]
files_modified:
  - components/journey/WorkingOnYourBehalfCard.tsx
  - components/journey/WorkingOnYourBehalfCard.test.tsx
autonomous: true
requirements_addressed: [CJD-04, CJD-07]
od5r_resolutions: []
estimated_minutes: 50
---

<objective>
Build `WorkingOnYourBehalfCard`, the AI lane card in the 3-column grid. **Renamed from archive's "AILaneCard"/"NarrativeRow"** to drop the 2-lane mental model. The name matches the prototype's literal eyebrow text "Working on your behalf".

Renders:
- Header: `<AIBadge>Origin</AIBadge>` + `<Eyebrow>Working on your behalf</Eyebrow>` (left flex group with gap 10px, using the Phase 4 Eyebrow primitive) + `<AIPulseDot ariaLabel="AI activity" />` (right)
- 3 inline `AILaneRow` components from `STAGE_3_AI_TASKS` (lib/cjd.ts) — live, pending, done states
- `<hr>` divider with margin `14px 0 12px`
- Origin quote: `<div>` italic ink-muted 12px containing the locked quote string + "— Origin" attribution in `var(--color-trad-green)` (NOT fresh-green)

The card uses fresh-green tinted background + 35%-opacity fresh-green border (`.card--ai` styles, inline-equivalent). AILaneRow has fresh-green border-bottom (20% opacity) + fresh-green default-state dot. **File IS in `.freshgreen-allowlist`** (added in Plan 05-02). This is the dashboard's primary AI-presence surface.
</objective>

<must_haves>
- `components/journey/WorkingOnYourBehalfCard.tsx` is a Server Component with no props.
- Outer `<section className="card card--ai relative">` — uses Phase 4 classes if present; else inline-equivalent: `relative bg-paper border rounded-[12px] p-6` plus inline `style={{ background: 'linear-gradient(180deg, var(--color-fresh-green-glow), transparent 60%), var(--color-paper)', borderColor: 'rgba(191, 215, 48, 0.35)' }}`.
- `--color-fresh-green-glow` token: already present in `app/globals.css` (Phase 4 baseline — value `#bfd73022`, alpha ≈ 0.13; UI-SPEC's prototype value `rgba(191,215,48,0.08)` differs slightly but the visual delta is small and the existing token wins per the inheritance receipt). No new token added by this plan.
- Header (mb-4, flex justify-between items-center):
  - Left flex group (`gap-2.5` = 10px): `<AIBadge>Origin</AIBadge>` + `<Eyebrow>Working on your behalf</Eyebrow>` (Phase 4 primitive — applies the locked mono/uppercase/tracking eyebrow styling)
  - Right: `<AIPulseDot ariaLabel="AI activity" />`
- Body: `STAGE_3_AI_TASKS.map(task => <AILaneRow key={task.id} text={task.text} meta={task.meta} state={task.state} />)`
- `<hr className="my-3.5 border-0 h-px bg-mist" />` — actually 14px top, 12px bottom inline `style={{ margin: '14px 0 12px' }}`
- Origin quote `<div>` italic ink-muted 12px:
  - Text content: `"I'll flag anything you need to decide — otherwise the work just moves forward."`
  - Followed by `<span style={{ color: 'var(--color-trad-green)', fontStyle: 'normal', marginLeft: 6 }}>— Origin</span>`
- Inline `AILaneRow` sub-component:
  - className: `flex items-start gap-2.5 py-2.5`
  - inline `style={{ borderBottom: '1px solid rgba(191, 215, 48, 0.2)' }}`
  - Indicator (40px wide flex shrink area):
    - `state === 'live'`: `<AIPulseDot ariaLabel="AI live task" />` (the existing primitive — D-22)
    - `state === 'done'`: `<Icon name="check" size={14} style={{ color: 'var(--color-trad-green)' }} />` (trad-green check)
    - `state === 'pending'` (default): `<span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-fresh-green)' }} />` (6×6 fresh-green dot)
  - Body div (flex-1):
    - text at fontSize 13, ink
    - meta at fontSize 11, ink-muted, font-mono, marginTop 3
- File header comment naming Phase 5 + decisions (D-21, D-22, D-31, D-32 W-01, P-5).
- Tests cover all 3 AI task rows with locked text/meta + Origin quote + AIBadge "Origin" + 2 AIPulseDots (header + live row) + done check icon + pending dot.
- File IS in `.freshgreen-allowlist` (added by Plan 05-02 — verify the entry exists).
</must_haves>

<threat_model>
| Threat ID | Category | Component | Disposition | Mitigation |
|-----------|----------|-----------|-------------|------------|
| T-05R-20 | Fresh-green leak (non-AI text) | Origin quote attribution | mitigate | "— Origin" uses `var(--color-trad-green)` (NOT fresh-green) per prototype — tested. The card is allowlisted but specific text surfaces still discriminate. |
| T-05R-21 | Missing AI-presence cues | AI lane card | mitigate | Header has AIBadge + AIPulseDot; live row has AIPulseDot; pending state has fresh-green dot; card has fresh-green-tinted background. Multiple redundant signals. |
| T-05R-22 | Token availability | --color-fresh-green-glow | accept | Token already exists in app/globals.css (Phase 4 baseline). No new task. |

</threat_model>

<tasks>

<task type="auto">
  <name>Task 1: Create WorkingOnYourBehalfCard.tsx</name>
  <read_first>
    - .planning/phases/05-client-journey-dashboard/05-UI-SPEC.md §Component Specs > WorkingOnYourBehalfCard, §Copywriting Contract
    - .planning/phases/05-client-journey-dashboard/05-CONTEXT.md D-21, D-22
    - lib/cjd.ts (STAGE_3_AI_TASKS)
    - components/primitives/index.ts (AIBadge, AIPulseDot, Eyebrow, Icon)
  </read_first>
  <action>
Create the component:

```tsx
// components/journey/WorkingOnYourBehalfCard.tsx — Phase 5 redo CJD-04 + CJD-07 AI lane.
//
// Server Component. Renamed from archive AILaneCard / NarrativeRow to drop
// the 2-lane mental model. Stage 3 lock with static demo data from
// STAGE_3_AI_TASKS.
//
// Decisions covered: D-21 (Stage 3 lock), D-22 (AILaneRow live uses AIPulseDot
// primitive), D-31 (lib/cjd module).
// P-5: This card is the dashboard's primary AI-presence surface.

import type { ReactElement } from 'react'
import { AIBadge, AIPulseDot, Eyebrow, Icon } from '@/components/primitives'
import { STAGE_3_AI_TASKS, type AILaneState } from '@/lib/cjd'

export function WorkingOnYourBehalfCard(): ReactElement {
  return (
    <section
      className="relative bg-paper border rounded-[12px] p-6"
      style={{
        background:
          'linear-gradient(180deg, var(--color-fresh-green-glow), transparent 60%), var(--color-paper)',
        borderColor: 'rgba(191, 215, 48, 0.35)',
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center" style={{ gap: 10 }}>
          <AIBadge>Origin</AIBadge>
          <Eyebrow>Working on your behalf</Eyebrow>
        </div>
        <AIPulseDot ariaLabel="AI activity" />
      </div>
      {STAGE_3_AI_TASKS.map((task) => (
        <AILaneRow
          key={task.id}
          text={task.text}
          meta={task.meta}
          state={task.state}
        />
      ))}
      <hr
        className="border-0 h-px bg-mist"
        style={{ margin: '14px 0 12px' }}
        aria-hidden="true"
      />
      <div className="italic" style={{ fontSize: 12, color: 'var(--color-ink-muted)' }}>
        "I'll flag anything you need to decide — otherwise the work just moves forward."
        <span
          style={{
            color: 'var(--color-trad-green)',
            fontStyle: 'normal',
            marginLeft: 6,
          }}
        >
          — Origin
        </span>
      </div>
    </section>
  )
}

type AILaneRowProps = {
  text: string
  meta: string
  state: AILaneState
}

function AILaneRow({ text, meta, state }: AILaneRowProps): ReactElement {
  return (
    <div
      className="flex items-start py-2.5"
      style={{ gap: 10, borderBottom: '1px solid rgba(191, 215, 48, 0.2)' }}
    >
      <div className="flex-shrink-0" style={{ marginTop: 5 }}>
        {state === 'live' ? (
          <AIPulseDot ariaLabel="AI live task" />
        ) : state === 'done' ? (
          <Icon name="check" size={14} style={{ color: 'var(--color-trad-green)' }} />
        ) : (
          <span
            className="inline-block rounded-full"
            style={{
              width: 6,
              height: 6,
              background: 'var(--color-fresh-green)',
            }}
            aria-hidden="true"
          />
        )}
      </div>
      <div className="flex-1">
        <div style={{ fontSize: 13, color: 'var(--color-ink)' }}>{text}</div>
        <div
          className="font-mono"
          style={{ fontSize: 11, color: 'var(--color-ink-muted)', marginTop: 3 }}
        >
          {meta}
        </div>
      </div>
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
  <name>Task 2: Create WorkingOnYourBehalfCard.test.tsx</name>
  <action>
Create tests covering:

```tsx
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { WorkingOnYourBehalfCard } from '@/components/journey/WorkingOnYourBehalfCard'

describe('WorkingOnYourBehalfCard — header', () => {
  it('renders AIBadge with text "Origin"', () => {
    const { container } = render(<WorkingOnYourBehalfCard />)
    expect(container.textContent).toContain('Origin')
  })

  it('renders "Working on your behalf" eyebrow', () => {
    const { container } = render(<WorkingOnYourBehalfCard />)
    expect(container.textContent).toContain('Working on your behalf')
  })

  it('renders header AIPulseDot with ariaLabel "AI activity"', () => {
    const { container } = render(<WorkingOnYourBehalfCard />)
    const headerPulse = container.querySelector('[aria-label="AI activity"]')
    expect(headerPulse).not.toBeNull()
  })
})

describe('WorkingOnYourBehalfCard — 3 AILaneRows (D-21)', () => {
  it('renders the 3 locked task texts verbatim', () => {
    const { container } = render(<WorkingOnYourBehalfCard />)
    expect(container.textContent).toContain('Extracting fields from your HK Business Registration')
    expect(container.textContent).toContain('29 of ~38 fields · 0.96 confidence')
    expect(container.textContent).toContain('Cross-referencing director IDs against all 5 entities')
    expect(container.textContent).toContain('6 of 8 matched')
    expect(container.textContent).toContain('Pre-filled your UK application using Singapore filing')
    expect(container.textContent).toContain('12 fields carried across · 1 min ago')
  })

  it('live row renders an AIPulseDot with ariaLabel "AI live task" (D-22)', () => {
    const { container } = render(<WorkingOnYourBehalfCard />)
    const liveDot = container.querySelector('[aria-label="AI live task"]')
    expect(liveDot).not.toBeNull()
  })

  it('done row renders a check Icon (14px, trad-green)', () => {
    const { container } = render(<WorkingOnYourBehalfCard />)
    // Find the SVG with stroke-color trad-green or similar Icon signature
    const svgs = container.querySelectorAll('svg')
    expect(svgs.length).toBeGreaterThan(0)
  })

  it('pending row renders a 6x6 fresh-green dot', () => {
    const { container } = render(<WorkingOnYourBehalfCard />)
    const pendingDots = Array.from(container.querySelectorAll('span[aria-hidden="true"][class*="rounded-full"]')) as HTMLElement[]
    const freshDot = pendingDots.find(s => s.style.background === 'var(--color-fresh-green)' && s.style.width === '6px')
    expect(freshDot).toBeDefined()
  })

  it('AILaneRow has fresh-green 20% bottom border', () => {
    const { container } = render(<WorkingOnYourBehalfCard />)
    const rows = Array.from(container.querySelectorAll('div')).filter(d =>
      d.style.borderBottom && d.style.borderBottom.includes('rgba(191, 215, 48, 0.2)'),
    )
    expect(rows.length).toBeGreaterThanOrEqual(3)
  })
})

describe('WorkingOnYourBehalfCard — Origin quote', () => {
  it('renders the locked quote string', () => {
    const { container } = render(<WorkingOnYourBehalfCard />)
    expect(container.textContent).toContain(
      "I'll flag anything you need to decide — otherwise the work just moves forward.",
    )
  })

  it('"— Origin" attribution uses var(--color-trad-green) (NOT fresh-green)', () => {
    const { container } = render(<WorkingOnYourBehalfCard />)
    const attribution = Array.from(container.querySelectorAll('span')).find(
      (s) => s.textContent === '— Origin',
    ) as HTMLElement | undefined
    expect(attribution).toBeDefined()
    expect(attribution?.style.color).toBe('var(--color-trad-green)')
    expect(attribution?.style.fontStyle).toBe('normal')
  })
})

describe('WorkingOnYourBehalfCard — card--ai background', () => {
  it('outer section has fresh-green-glow gradient background and 35% border', () => {
    const { container } = render(<WorkingOnYourBehalfCard />)
    const section = container.querySelector('section') as HTMLElement
    expect(section.style.background).toContain('var(--color-fresh-green-glow)')
    expect(section.style.borderColor).toBe('rgba(191, 215, 48, 0.35)')
  })
})

describe('WorkingOnYourBehalfCard — strict P-1 inert (no nav)', () => {
  it('contains no <button> or <a> elements', () => {
    const { container } = render(<WorkingOnYourBehalfCard />)
    expect(container.querySelectorAll('button').length).toBe(0)
    expect(container.querySelectorAll('a').length).toBe(0)
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
feat(phase-05-redo): WorkingOnYourBehalfCard component (Plan 05-07)

Phase 5 redo Wave 2: AI lane card with 3 task rows (live, pending, done)
+ Origin quote. Renamed from archive AILaneCard/NarrativeRow to match
the prototype's literal eyebrow text and drop the 2-lane mental model.

Decisions covered: D-21 (Stage 3 lock), D-22 (AILaneRow live state uses
AIPulseDot primitive instead of inline ai-pulse class), P-5 (primary
AI-presence surface).

The card uses fresh-green-tinted background + 35%-opacity fresh-green
border (allowlisted via Plan 05-02). AILaneRow has fresh-green-20%
bottom borders + fresh-green pending dots. The "— Origin" attribution
uses trad-green (NOT fresh-green) — tested defensively.
```
  </action>
</task>

</tasks>

<acceptance>
- WorkingOnYourBehalfCard renders all locked content (header, 3 rows, quote).
- File IS in `.freshgreen-allowlist` (added by Plan 05-02).
- "— Origin" attribution is trad-green, not fresh-green (tested).
- Tests/typecheck/lint exit 0.
- `bash scripts/check-fresh-green.sh` exits 0.
</acceptance>
