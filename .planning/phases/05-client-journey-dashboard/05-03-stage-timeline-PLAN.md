---
phase: 5
plan: 05-03
title: StageTimeline component (revised) — 6 pills + connectors + AIPulseDot, strict P-1 inert
wave: 1
depends_on: [05-01, 05-02]
files_modified:
  - components/journey/StageTimeline.tsx
  - components/journey/StageTimeline.test.tsx
autonomous: true
requirements_addressed: [CJD-03]
od5r_resolutions: [OD5R-04]
estimated_minutes: 45
---

<objective>
Build the revised `StageTimeline` component. Renders the 6-stage pill strip with 5 connectors and an AIPulseDot adjacent to the current stage. **Strict P-1 inert** (OD5R-04): no `<a>`, no `<Link>`, no `onClick`. Pills have visual states only.

The revised timeline LOSES the archive's standalone `<section>` wrapper and "YOUR JOURNEY" eyebrow — those concerns move to `ApplicationCard` (Plan 05-05) which hosts the timeline as an inner composition. The component renders only the pill+connector strip; styling is locked to `size={34}` pills (D-17) and 11-track CSS Grid layout from UI-SPEC §Component Specs.

Foundation for Plan 05-05 (ApplicationCard).
</objective>

<must_haves>
- `components/journey/StageTimeline.tsx` is a Server Component (no `'use client'`).
- Props: `{ stages: readonly Stage[] }`.
- Renders an `<ol>` with 11 grid tracks: `auto 1fr auto 1fr auto 1fr auto 1fr auto 1fr auto`.
- For each stage: a `<li>` containing `<StagePill n={stage.number} state={pillState} size={34} />` plus a stage-name `<Eyebrow>` below (font-size 11px, weight 500 if current else 400, max-width 80px, line-height 1.2 — these are chrome-metric exceptions per UI-SPEC).
- For the current stage: an additional `<AIPulseDot ariaLabel="AI is processing your documents" />` rendered adjacent (right side, ml-2).
- Between consecutive stages: a `<li>` containing a 2px connector span. Connector class is `bg-trad-green` when both adjacent stages are `complete`, else `bg-mist`. **NEVER `bg-fresh-green`** (negative-tested).
- Connector vertical offset `marginTop: -18px` (chrome-metric exception, source: prototype `05bee446.js:70`).
- Connector horizontal margin `mx-1` (4px each side, source: prototype `05bee446.js:71`).
- `pillState` derived via `stageStatusToPillState(stage.status)` from `lib/cjd.ts`.
- Stage names sourced from `STAGE_NAMES` constant in `lib/stages.ts` — NOT hard-coded in JSX.
- **No `<a>`, no `<Link>`, no `onClick`, no `cursor-pointer`** — strict P-1 inert. The prototype's `onClick={() => go('client-stage-N')}` is overridden per OD5R-04. Tests verify all four absences.
- AIPulseDot ariaLabel override `"AI is processing your documents"` (D-18; verifies prototype's CSS `ai-pulse` class is replaced with the Phase 4 primitive's accessible variant).
- File header comment naming Phase 5 redo + decisions covered (D-16, D-17, D-18, D-32 W-01).
- Tests in `components/journey/StageTimeline.test.tsx`: all listed under <verify>.
- All tests pass; typecheck/lint clean.
</must_haves>

<threat_model>
| Threat ID | Category | Component | Disposition | Mitigation |
|-----------|----------|-----------|-------------|------------|
| T-05R-08 | Policy bypass (fresh-green) | StageTimeline connectors | mitigate | Connectors use `bg-mist` or `bg-trad-green`. Negative grep test verifies absence of `bg-fresh-green` and `text-fresh-green` outside the AIPulseDot primitive (which is allowlisted). |
| T-05R-09 | P-1 violation (navigation leak) | Stage pills | mitigate | No `<a>`, `<Link>`, or `onClick` in StageTimeline source. Tests verify all four absences. |
| T-05R-10 | Tampering (stage names hard-coded) | Stage labels | mitigate | Stage names come from `STAGE_NAMES` Record. Test grep verifies no literal stage names in JSX. |

</threat_model>

<tasks>

<task type="auto">
  <name>Task 1: Create components/journey/StageTimeline.tsx</name>
  <read_first>
    - .planning/phases/05-client-journey-dashboard/05-UI-SPEC.md §Component Specs > StageTimeline (revised)
    - .planning/phases/05-client-journey-dashboard/05-CONTEXT.md D-16, D-17, D-18
    - phase-5-spec-divergence-archive:components/journey/StageTimeline.tsx (archive shape; the 11-track grid layout, connector logic, and AIPulseDot wiring carry forward — only the outer `<section>` + Eyebrow are stripped)
    - components/primitives/index.ts (StagePill, AIPulseDot, Eyebrow imports)
    - lib/stages.ts (STAGE_NAMES constant)
    - lib/cjd.ts (stageStatusToPillState)
    - types/origin.ts (Stage, StageStatus types)
  </read_first>
  <action>
Create the component:

```tsx
// components/journey/StageTimeline.tsx — Phase 5 redo CJD-03 (revised).
//
// Server Component (no 'use client'). Renders the 6-stage pill strip + 5
// connectors + 1 AIPulseDot adjacent to the current pill. Consumed by
// ApplicationCard (Plan 05-05); does NOT have its own <section> wrapper or
// eyebrow — those concerns live in ApplicationCard's left column.
//
// Decisions covered:
//   D-16 (P-1 strict inert, OD5R-04): pills are inert — no <a>, no <Link>, no onClick.
//   D-17: StagePill size={34} (chrome-metric exception from prototype 05bee446.js:61).
//   D-18: AIPulseDot adjacent to current pill, ariaLabel override.
//   D-32 (W-01): no transition/focus styles since pills are inert (nothing to transition).
//   RESEARCH §3.5: stageStatusToPillState adapter from lib/cjd.ts.

import type { CSSProperties, ReactElement } from 'react'
import { Fragment } from 'react'
import type { Stage } from '@/types/origin'
import { AIPulseDot, Eyebrow, StagePill } from '@/components/primitives'
import { stageStatusToPillState } from '@/lib/cjd'
import { STAGE_NAMES } from '@/lib/stages'

export type StageTimelineProps = {
  stages: readonly Stage[]
}

const GRID_TEMPLATE: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'auto 1fr auto 1fr auto 1fr auto 1fr auto 1fr auto',
  alignItems: 'center',
}

export function StageTimeline({ stages }: StageTimelineProps): ReactElement {
  return (
    <ol className="list-none p-0 m-0 w-full" style={GRID_TEMPLATE}>
      {stages.map((stage, idx) => {
        const pillState = stageStatusToPillState(stage.status)
        const isLast = idx === stages.length - 1
        const next = isLast ? null : stages[idx + 1]
        const connectorComplete =
          stage.status === 'complete' && next != null && next.status === 'complete'
        const connectorClass = connectorComplete ? 'bg-trad-green' : 'bg-mist'
        const isCurrent = pillState === 'current'
        return (
          <Fragment key={stage.number}>
            <li className="flex flex-col items-center">
              <div className="relative flex items-center">
                <StagePill n={stage.number} state={pillState} size={34} />
                {isCurrent && (
                  <span className="ml-2">
                    <AIPulseDot ariaLabel="AI is processing your documents" />
                  </span>
                )}
              </div>
              <Eyebrow
                className="mt-2 text-center"
                style={{
                  fontSize: 11,
                  fontWeight: isCurrent ? 500 : 400,
                  maxWidth: 80,
                  lineHeight: 1.2,
                }}
              >
                {STAGE_NAMES[stage.number]}
              </Eyebrow>
            </li>
            {!isLast && (
              <li className="flex items-center" style={{ marginTop: -18 }}>
                <span
                  aria-hidden="true"
                  className={`h-[2px] w-full block mx-1 ${connectorClass}`}
                />
              </li>
            )}
          </Fragment>
        )
      })}
    </ol>
  )
}
```

**Eyebrow primitive dependency:** This component uses `<Eyebrow ... style={{...}}>` to apply inline metric exceptions (font-weight 500/400, max-width 80px, line-height 1.2 for the under-pill stage names). The Eyebrow primitive's `style?: CSSProperties` prop is added by **Plan 05-02 Task 5**. This plan (05-03) does NOT modify Eyebrow.tsx itself — it consumes the extended Eyebrow primitive after Plan 05-02 lands. Wave 1 sequential ordering (05-01 → 05-02 → 05-03) makes this a hard dependency, captured in the `depends_on` frontmatter.
  </action>
  <verify>
    - File exists at `components/journey/StageTimeline.tsx`.
    - `npm run typecheck` exits 0.
    - `npm run lint -- components/journey/StageTimeline.tsx` exits 0.
  </verify>
</task>

<task type="auto">
  <name>Task 2: Create StageTimeline.test.tsx</name>
  <read_first>
    - phase-5-spec-divergence-archive:components/journey/StageTimeline.test.tsx (archive tests — most patterns reusable; remove the standalone-section assertions and the YOUR JOURNEY eyebrow assertion)
  </read_first>
  <action>
Create `components/journey/StageTimeline.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import type { Stage, StageStatus } from '@/types/origin'
import { StageTimeline } from '@/components/journey/StageTimeline'

function makeStages(currentIdx: number = 3): Stage[] {
  return [1, 2, 3, 4, 5, 6].map((n) => {
    let status: StageStatus
    if (n < currentIdx) status = 'complete'
    else if (n === currentIdx) status = 'in_progress'
    else status = 'not_started'
    return { number: n as Stage['number'], name: '', status, completedAt: null }
  })
}

describe('StageTimeline — Kaisei states (CJD-03)', () => {
  it('renders 6 stage pills', () => {
    const { container } = render(<StageTimeline stages={makeStages(3)} />)
    const pills = container.querySelectorAll('[aria-label^="Stage "]')
    expect(pills.length).toBe(6)
  })

  it('renders 2 ✓ glyphs for done pills + numerals 3, 4, 5, 6', () => {
    const { container } = render(<StageTimeline stages={makeStages(3)} />)
    const text = container.textContent ?? ''
    const checks = (text.match(/✓/g) ?? []).length
    expect(checks).toBe(2)
    expect(text).toContain('3'); expect(text).toContain('4')
    expect(text).toContain('5'); expect(text).toContain('6')
  })

  it('renders stage names from STAGE_NAMES — no hard-coded JSX', () => {
    const { container } = render(<StageTimeline stages={makeStages(3)} />)
    const text = container.textContent ?? ''
    expect(text).toContain('Documentation')
    expect(text).toContain('Activation')
    expect(text).toContain('Invite & Intent')
  })
})

describe('StageTimeline — AIPulseDot adjacency (D-18)', () => {
  it('renders exactly one AIPulseDot with the overridden ariaLabel', () => {
    const { container } = render(<StageTimeline stages={makeStages(3)} />)
    const dots = container.querySelectorAll('[aria-label="AI is processing your documents"]')
    expect(dots.length).toBe(1)
  })

  it('does NOT use the default "AI active" ariaLabel', () => {
    const { container } = render(<StageTimeline stages={makeStages(3)} />)
    const defaultDots = container.querySelectorAll('[aria-label="AI active"]')
    expect(defaultDots.length).toBe(0)
  })

  it('renders no AIPulseDot when no stage is in_progress', () => {
    const allComplete = makeStages(7) // all stages < 7 → complete; none current
    const { container } = render(<StageTimeline stages={allComplete} />)
    const dots = container.querySelectorAll('[aria-label="AI is processing your documents"]')
    expect(dots.length).toBe(0)
  })
})

describe('StageTimeline — connectors (CJD-07 defensive)', () => {
  it('renders 5 connector spans between 6 pills', () => {
    const { container } = render(<StageTimeline stages={makeStages(3)} />)
    const connectors = container.querySelectorAll('span[aria-hidden="true"][class*="h-[2px]"]')
    expect(connectors.length).toBe(5)
  })

  it('connectors use bg-mist or bg-trad-green only — never bg-fresh-green', () => {
    const { container } = render(<StageTimeline stages={makeStages(3)} />)
    const connectors = container.querySelectorAll('span[aria-hidden="true"][class*="h-[2px]"]')
    for (const c of Array.from(connectors)) {
      expect(c.className).toMatch(/bg-mist|bg-trad-green/)
      expect(c.className).not.toMatch(/\bbg-fresh-green\b/)
    }
  })

  it('outerHTML excluding AIPulseDot has no fresh-green Tailwind tokens', () => {
    const { container } = render(<StageTimeline stages={makeStages(3)} />)
    const root = container.firstElementChild as Element
    const clone = root.cloneNode(true) as Element
    const dots = clone.querySelectorAll('[role="img"]')
    for (const d of Array.from(dots)) d.parentElement?.removeChild(d)
    expect(clone.innerHTML).not.toMatch(/\bbg-fresh-green\b/)
    expect(clone.innerHTML).not.toMatch(/\btext-fresh-green\b/)
  })
})

describe('StageTimeline — defensive blocked → upcoming', () => {
  it('blocked status renders as upcoming pill (no current decoration)', () => {
    const stages: Stage[] = [
      { number: 1, name: '', status: 'complete', completedAt: null },
      { number: 2, name: '', status: 'complete', completedAt: null },
      { number: 3, name: '', status: 'blocked', completedAt: null },
      { number: 4, name: '', status: 'not_started', completedAt: null },
      { number: 5, name: '', status: 'not_started', completedAt: null },
      { number: 6, name: '', status: 'not_started', completedAt: null },
    ]
    const { container } = render(<StageTimeline stages={stages} />)
    const dots = container.querySelectorAll('[aria-label="AI is processing your documents"]')
    expect(dots.length).toBe(0)
  })
})

describe('StageTimeline — strict P-1 inert (OD5R-04)', () => {
  it('contains no <a> elements', () => {
    const { container } = render(<StageTimeline stages={makeStages(3)} />)
    expect(container.querySelectorAll('a').length).toBe(0)
  })

  it('contains no <button> elements', () => {
    const { container } = render(<StageTimeline stages={makeStages(3)} />)
    expect(container.querySelectorAll('button').length).toBe(0)
  })

  it('contains no onClick handlers (no role="button" attributes)', () => {
    const { container } = render(<StageTimeline stages={makeStages(3)} />)
    expect(container.querySelectorAll('[role="button"]').length).toBe(0)
  })

  it('does not apply cursor-pointer to any element', () => {
    const { container } = render(<StageTimeline stages={makeStages(3)} />)
    expect(container.innerHTML).not.toMatch(/cursor-pointer/)
  })
})

describe('StageTimeline — current-pill stage-name weight (D-17)', () => {
  it('current pill stage name has fontWeight 500; non-current has 400', () => {
    const { container } = render(<StageTimeline stages={makeStages(3)} />)
    // Eyebrow primitive emits Tailwind classes (font-mono uppercase tracking-...).
    // Each rendered eyebrow is a <span> with those classes; filter by textContent.
    const eyebrows = Array.from(
      container.querySelectorAll('span.font-mono.uppercase'),
    ) as HTMLElement[]
    const docs = eyebrows.find((el) => el.textContent === 'Documentation')
    expect(docs).toBeDefined()
    expect(String(docs?.style.fontWeight)).toBe('500')
    const screening = eyebrows.find((el) => el.textContent === 'Screening')
    expect(screening).toBeDefined()
    expect(String(screening?.style.fontWeight)).toBe('400')
  })
})
```
  </action>
  <verify>
    - `npm run test -- --run components/journey/StageTimeline.test.tsx` exits 0.
    - All P-1 inert assertions pass (no `<a>`, no `<button>`, no `cursor-pointer`).
    - Negative fresh-green grep passes.
  </verify>
</task>

<task type="auto">
  <name>Task 3: Atomic commit</name>
  <action>
Stage `components/journey/StageTimeline.tsx` and `components/journey/StageTimeline.test.tsx`. (Eyebrow primitive changes are owned by Plan 05-02 Task 5 and already committed.) Commit:
```
feat(phase-05-redo): StageTimeline component (revised, strict P-1 inert) (Plan 05-03)

Phase 5 redo Wave 1 final: the 6-stage pill strip with connectors and
AIPulseDot. Renders inside ApplicationCard (Plan 05-05) — no standalone
section wrapper, no YOUR JOURNEY eyebrow.

Decisions covered: D-16 (strict P-1 inert), D-17 (size 34), D-18
(AIPulseDot ariaLabel override).
OD5R resolution: OD5R-04 (no nav surfaces — pills inert; routes defer
to Phase 7).

The 11-track CSS Grid layout, the connector color logic, and the
AIPulseDot adjacency carry forward from the archive verbatim. Stripped:
the outer <section>, the YOUR JOURNEY eyebrow, and the prototype's
onClick handler.
```
  </action>
  <verify>
    - `git status` clean.
    - `git log -1` shows the commit.
  </verify>
</task>

</tasks>

<acceptance>
- `components/journey/StageTimeline.tsx` exists; `npm run typecheck && npm run lint` exits 0.
- `components/journey/StageTimeline.test.tsx` covers 6 pills + 5 connectors + AIPulseDot + P-1 inert + fresh-green negative grep.
- `npm run test -- --run components/journey/StageTimeline.test.tsx` exits 0.
- Commit message references Plan 05-03 + OD5R-04.
</acceptance>
