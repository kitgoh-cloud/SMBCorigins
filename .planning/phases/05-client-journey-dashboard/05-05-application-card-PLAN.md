---
phase: 5
plan: 05-05
title: ApplicationCard component — hero status card with stage numeral + ETA + StageTimeline + key-facts column
wave: 2
depends_on: [05-01, 05-02, 05-03]
files_modified:
  - components/journey/ApplicationCard.tsx
  - components/journey/ApplicationCard.test.tsx
autonomous: true
requirements_addressed: [CJD-02, CJD-03]
od5r_resolutions: [OD5R-01, OD5R-02, OD5R-09]
estimated_minutes: 70
---

<objective>
Build `ApplicationCard`, the hero status card. Two-column grid (1.4fr 1fr, gap 40px):

**Left column** — Application ID eyebrow → stage numeral 76px (`application.currentStage`) + "/6" companion → stage name (e.g., "Documentation") → ETA strip ("Estimated completion · {date} · 5 business days") → embedded `<StageTimeline>`.

**Right column** (after `border-l border-mist`, `pl-8`) — "What you're applying for" eyebrow → product list (label/detail per `PRODUCT_DISPLAY_LABEL`) → `hr` divider → 24px-gap row of "Jurisdictions" (4 flag emojis, JP first) + "In progress" (N days, trad-green numeral).

**OD5R resolutions enforced:**
- **OD5R-01 SKIP**: NO `.card--hero::after` bottom-edge fresh-green gradient. Card uses standard `.card .card--hero` styles only (padding 32px, radius 18px, box-shadow). File NOT in `.freshgreen-allowlist`.
- **OD5R-02 SLIDE THE WINDOW**: ETA date computed via `formatBusinessDaysAhead(SERVER_DEMO_DATE, 2)` from lib/cjd.ts. Date string updates if SERVER_DEMO_DATE moves; "5 business days" stays static.
- **OD5R-09 STAGE NUMERAL**: 76px Fraunces showing `application.currentStage` (e.g., "3") with 28px "/6" companion. NO 96px days-countdown numeral.
</objective>

<must_haves>
- `components/journey/ApplicationCard.tsx` is a Server Component.
- Props: `{ application: Application; stages: readonly Stage[]; daysIn: number }`.
- Outer `<section className="card card--hero relative mb-6">` — uses Phase 4 `.card`/`.card--hero` CSS classes if available, else inlines the styles (padding 32px, border-radius 18px, box-shadow).
- **NO `::after` bottom-edge gradient** (OD5R-01).
- Inner grid: `display: grid, gridTemplateColumns: '1.4fr 1fr', gap: 40px`.
- **Left column** (`<div>`):
  1. `<Eyebrow className="mb-4">{`Application · ${application.id.toUpperCase()}`}</Eyebrow>` (D-10)
  2. Hero numeral row (flex, baseline-aligned, gap-3, mb-1):
     - `<span className="t-numeral text-trad-green-deep" style={{ fontSize: 76, lineHeight: 1, fontFamily: 'var(--font-fraunces)', fontVariationSettings: '"SOFT" 60, "WONK" 1', fontWeight: 400 }}>{application.currentStage}</span>`
     - `<span style={{ fontFamily: 'var(--font-fraunces)', fontSize: 28, color: 'var(--color-ink-muted)', fontVariationSettings: '"SOFT" 60, "WONK" 0', fontWeight: 400 }}>/ 6</span>`
  3. Stage name: `<div style={{ fontFamily: 'var(--font-fraunces)', fontSize: 20, color: 'var(--color-ink)', fontWeight: 400 }} className="mb-1">{STAGE_NAMES[application.currentStage]}</div>`
  4. ETA strip: `<div className="text-[14px] text-ink-soft mb-6">Estimated completion · <strong className="font-medium text-ink">{formatBusinessDaysAhead(SERVER_DEMO_DATE, 2)}</strong> · 5 business days</div>`
  5. `<StageTimeline stages={stages} />` (embedded — Plan 05-03 component)
- **Right column** (`<div className="pl-8 border-l border-mist">`):
  1. `<Eyebrow className="mb-4">What you're applying for</Eyebrow>`
  2. Products loop: `application.productsRequested.map(p => (<div key={p} className="mb-4"><div style={{ fontSize: 14, color: 'var(--color-ink)', fontWeight: 500 }}>{PRODUCT_DISPLAY_LABEL[p].label}</div><div style={{ fontSize: 12.5, color: 'var(--color-ink-muted)', marginTop: 2 }}>{PRODUCT_DISPLAY_LABEL[p].detail}</div></div>))`
  3. `<hr className="hr my-5" />` (a 1px mist line, margin-y 20px from prototype `margin: "20px 0"`)
  4. Two-column row (flex, gap-6):
     - **Jurisdictions**: `<div><Eyebrow>Jurisdictions</Eyebrow><div style={{ fontSize: 18, marginTop: 4 }}>{['JP', ...application.targetJurisdictions].filter(unique).map(j => JURISDICTION_FLAG[j]).join(' ')}</div></div>` — JP always prefixed (D-11)
     - **In progress**: `<div><Eyebrow>In progress</Eyebrow><div className="t-numeral text-trad-green" style={{ fontSize: 20, marginTop: 4, fontFamily: 'var(--font-fraunces)', fontVariationSettings: '"SOFT" 60, "WONK" 1', fontWeight: 400 }}>{daysIn} days</div></div>`
- File header comment naming Phase 5 + decisions (D-09, D-10, D-11, D-31, D-34 W-03, OD5R-01, OD5R-02, OD5R-09).
- **No fresh-green tokens** anywhere — negative grep test passes (OD5R-01 enforcement).
- All tests pass; typecheck/lint clean.
- File NOT in `.freshgreen-allowlist`.
</must_haves>

<threat_model>
| Threat ID | Category | Component | Disposition | Mitigation |
|-----------|----------|-----------|-------------|------------|
| T-05R-14 | Hydration mismatch | ETA computation | mitigate | `formatBusinessDaysAhead(SERVER_DEMO_DATE, 2)` is pure on a frozen constant. SSR/CSR identical. |
| T-05R-15 | Fresh-green leak | `::after` gradient temptation | mitigate | OD5R-01 explicitly forbids the gradient. Negative grep test verifies absence of `bg-fresh-green` / `text-fresh-green` and any `::after` content rule that would emit fresh-green. |
| T-05R-16 | Type-coverage gap | Unknown ProductType | mitigate | `PRODUCT_DISPLAY_LABEL` is `Record<ProductType, ...>` — TypeScript ensures all ProductType values are mapped. Defensive: if a future ProductType is added without a corresponding label, the typecheck would fail. |
| T-05R-17 | Wrong jurisdiction set | Jurisdiction flag list | mitigate | JP is prepended unconditionally (D-11); duplicates filtered. Test: `targetJurisdictions = ['SG', 'HK', 'GB']` produces 4 flags including JP. |

</threat_model>

<tasks>

<task type="auto">
  <name>Task 1: Create components/journey/ApplicationCard.tsx</name>
  <read_first>
    - .planning/phases/05-client-journey-dashboard/05-UI-SPEC.md §Page Layout > Section 2, §Component Specs > ApplicationCard, §Spacing Chrome Metric Exceptions (76px numeral, 28px /6, 20px stage name, 32px card padding)
    - .planning/phases/05-client-journey-dashboard/05-CONTEXT.md D-09, D-10, D-11, OD5R-01, OD5R-02, OD5R-09
    - lib/cjd.ts (formatBusinessDaysAhead, SERVER_DEMO_DATE, PRODUCT_DISPLAY_LABEL, JURISDICTION_FLAG)
    - lib/stages.ts (STAGE_NAMES)
    - components/journey/StageTimeline.tsx (Plan 05-03 — composed inside this card)
    - app/globals.css (verify .card / .card--hero classes exist — if NOT, this plan inlines the equivalent Tailwind utilities and adds `box-shadow-card` if a project shadow token exists)
    - types/origin.ts (Application, Stage, StageNumber, ProductType)
  </read_first>
  <action>
Create the component (full source as specified in the Must-Haves section). Key implementation notes:

- The `.card .card--hero` classes from the prototype CSS may NOT exist in the project's Phase 4 globals.css. Verify by reading globals.css. If absent, inline-equivalent the Tailwind utilities: `bg-paper border border-mist rounded-[18px] p-8 relative overflow-hidden shadow-[0_1px_2px_rgba(10,20,16,0.04),0_8px_24px_rgba(10,20,16,0.04)]` (the `--shadow-card` value from prototype `:root` CSS).
- The "/6" companion gets a slightly different `fontVariationSettings: '"SOFT" 60, "WONK" 0'` (note WONK 0, not 1) per prototype `05bee446.js:43`. The hero numeral and "In progress" numeral use WONK 1.
- Jurisdictions: ensure JP is first AND deduplicated. Use a Set: `Array.from(new Set(['JP', ...application.targetJurisdictions]))`.

```tsx
// components/journey/ApplicationCard.tsx — Phase 5 redo CJD-02 + CJD-03 hero card.
//
// Server Component. Renders the application status hero card with stage numeral
// (OD5R-09: stage numeral, NOT countdown), ETA strip (OD5R-02b: slide-the-window
// date), embedded StageTimeline, and right-column key facts (products /
// jurisdictions / days-in-progress).
//
// OD5R-01: NO .card--hero::after bottom-edge gradient. File NOT allowlisted.
// OD5R-02: ETA date via formatBusinessDaysAhead(SERVER_DEMO_DATE, 2);
//          "5 business days" stays static for v1.
// OD5R-09: 76px stage numeral over /6, NOT 96px days countdown.
//
// Decisions covered: D-09, D-10, D-11, D-31, D-34 W-03, OD5R-01/02/09.

import type { ReactElement } from 'react'
import type { Application, Stage } from '@/types/origin'
import { Eyebrow } from '@/components/primitives'
import { StageTimeline } from '@/components/journey/StageTimeline'
import {
  SERVER_DEMO_DATE,
  formatBusinessDaysAhead,
  PRODUCT_DISPLAY_LABEL,
  JURISDICTION_FLAG,
} from '@/lib/cjd'
import { STAGE_NAMES } from '@/lib/stages'

export type ApplicationCardProps = {
  application: Application
  stages: readonly Stage[]
  daysIn: number
}

export function ApplicationCard({
  application,
  stages,
  daysIn,
}: ApplicationCardProps): ReactElement {
  const etaDate = formatBusinessDaysAhead(SERVER_DEMO_DATE, 2)
  const stageName = STAGE_NAMES[application.currentStage]
  const allJurisdictions = Array.from(
    new Set(['JP', ...application.targetJurisdictions]),
  )

  return (
    <section
      className="relative mb-6 rounded-[18px] border border-mist bg-paper p-8 overflow-hidden"
      style={{ boxShadow: '0 1px 2px rgba(10, 20, 16, 0.04), 0 8px 24px rgba(10, 20, 16, 0.04)' }}
    >
      <div className="grid" style={{ gridTemplateColumns: '1.4fr 1fr', gap: 40 }}>
        {/* LEFT COLUMN — stage numeral + ETA + StageTimeline */}
        <div>
          <Eyebrow className="mb-4">
            {`Application · ${application.id.toUpperCase()}`}
          </Eyebrow>

          <div className="flex items-baseline gap-3 mb-1">
            <span
              className="text-trad-green-deep tabular-nums"
              style={{
                fontFamily: 'var(--font-fraunces)',
                fontSize: 76,
                lineHeight: 1,
                fontWeight: 400,
                fontVariationSettings: '"SOFT" 60, "WONK" 1',
                letterSpacing: '-0.055em',
              }}
            >
              {application.currentStage}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-fraunces)',
                fontSize: 28,
                color: 'var(--color-ink-muted)',
                fontWeight: 400,
                fontVariationSettings: '"SOFT" 60, "WONK" 0',
              }}
            >
              / 6
            </span>
          </div>

          <div
            className="mb-1 text-ink"
            style={{
              fontFamily: 'var(--font-fraunces)',
              fontSize: 20,
              fontWeight: 400,
            }}
          >
            {stageName}
          </div>

          <div className="text-[14px] text-ink-soft mb-6">
            Estimated completion ·{' '}
            <strong className="font-medium text-ink">{etaDate}</strong> ·
            5 business days
          </div>

          <StageTimeline stages={stages} />
        </div>

        {/* RIGHT COLUMN — key facts */}
        <div className="pl-8 border-l border-mist">
          <Eyebrow className="mb-4">What you're applying for</Eyebrow>
          {application.productsRequested.map((p) => {
            const display = PRODUCT_DISPLAY_LABEL[p]
            return (
              <div key={p} className="mb-4">
                <div style={{ fontSize: 14, color: 'var(--color-ink)', fontWeight: 500 }}>
                  {display.label}
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--color-ink-muted)', marginTop: 2 }}>
                  {display.detail}
                </div>
              </div>
            )
          })}
          <hr className="my-5 border-0 h-px bg-mist" />
          <div className="flex" style={{ gap: 24 }}>
            <div>
              <Eyebrow>Jurisdictions</Eyebrow>
              <div style={{ fontSize: 18, marginTop: 4 }}>
                {allJurisdictions.map((j) => JURISDICTION_FLAG[j] ?? '').join(' ')}
              </div>
            </div>
            <div>
              <Eyebrow>In progress</Eyebrow>
              <div
                className="text-trad-green tabular-nums"
                style={{
                  fontFamily: 'var(--font-fraunces)',
                  fontSize: 20,
                  marginTop: 4,
                  fontWeight: 400,
                  fontVariationSettings: '"SOFT" 60, "WONK" 1',
                  letterSpacing: '-0.055em',
                }}
              >
                {`${daysIn} days`}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
```
  </action>
  <verify>
    - File exists.
    - `npm run typecheck` exits 0.
    - `npm run lint` exits 0.
  </verify>
</task>

<task type="auto">
  <name>Task 2: Create ApplicationCard.test.tsx</name>
  <action>
Create `components/journey/ApplicationCard.test.tsx`. Cover:

- **Eyebrow renders "Application · APP-KAISEI"** when `application.id === 'app-kaisei'`.
- **Stage numeral renders `application.currentStage`** with class `text-trad-green-deep`, fontSize 76 inline.
- **"/6" companion renders** with `WONK 0` (not WONK 1) — locked verbatim.
- **Stage name** renders `STAGE_NAMES[currentStage]` — e.g., "Documentation" for currentStage=3.
- **ETA strip** renders the literal "Estimated completion · 29 April 2026 · 5 business days" when SERVER_DEMO_DATE = 2026-04-27.
- **6 stage pills** rendered (via embedded StageTimeline).
- **Products list** renders `PRODUCT_DISPLAY_LABEL` entries for `productsRequested` — e.g., for Kaisei `['accounts', 'cash_management', 'trade_finance', 'credit']`, 4 product rows render.
- **Jurisdictions row** renders 4 flags including 🇯🇵 even when `targetJurisdictions = ['SG', 'HK', 'GB']` (D-11 lock).
- **In progress** renders `${daysIn} days` with `text-trad-green` (NOT fresh-green).
- **No `::after` gradient**: assert `container.outerHTML` does not contain a `card--hero::after` rule or any inline gradient `linear-gradient(.*fresh-green)` — this is the OD5R-01 enforcement.
- **Negative fresh-green grep**: outerHTML contains no `bg-fresh-green`, `text-fresh-green`, or `rgba(191, 215, 48` literal.

```tsx
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import type { Application, Stage, StageNumber, ProductType } from '@/types/origin'
import { ApplicationCard } from '@/components/journey/ApplicationCard'

function makeApp(overrides: Partial<Application> = {}): Application {
  return {
    id: 'app-kaisei',
    organizationId: 'org-kaisei',
    rmUserId: 'rm-james',
    status: 'in_progress',
    currentStage: 3,
    targetJurisdictions: ['SG', 'HK', 'GB'],
    productsRequested: ['accounts', 'cash_management', 'trade_finance', 'credit'] as ProductType[],
    openedAt: '2026-03-25T08:00:00Z',
    targetCloseDate: '2026-06-15',
    closedAt: null,
    ...overrides,
  }
}

function makeStages(): Stage[] {
  return [
    { number: 1, name: '', status: 'complete', completedAt: null },
    { number: 2, name: '', status: 'complete', completedAt: null },
    { number: 3, name: '', status: 'in_progress', completedAt: null },
    { number: 4, name: '', status: 'not_started', completedAt: null },
    { number: 5, name: '', status: 'not_started', completedAt: null },
    { number: 6, name: '', status: 'not_started', completedAt: null },
  ]
}

describe('ApplicationCard — left column header (D-10, OD5R-09)', () => {
  it('renders Application eyebrow with uppercase ID', () => {
    const { container } = render(<ApplicationCard application={makeApp()} stages={makeStages()} daysIn={33} />)
    expect(container.textContent).toContain('Application · APP-KAISEI')
  })

  it('renders the stage numeral 76px Fraunces with current stage', () => {
    const { container } = render(<ApplicationCard application={makeApp({ currentStage: 3 as StageNumber })} stages={makeStages()} daysIn={33} />)
    const span = Array.from(container.querySelectorAll('span')).find(s => s.textContent === '3' && s.style.fontSize === '76px') as HTMLElement | undefined
    expect(span).toBeDefined()
    expect(span?.className).toContain('text-trad-green-deep')
    expect(span?.style.fontVariationSettings).toContain('SOFT')
    expect(span?.style.fontVariationSettings).toContain('60')
    expect(span?.style.fontVariationSettings).toContain('WONK')
    expect(span?.style.fontVariationSettings).toContain('1')
  })

  it('renders "/ 6" with WONK 0 (NOT WONK 1)', () => {
    const { container } = render(<ApplicationCard application={makeApp()} stages={makeStages()} daysIn={33} />)
    const span = Array.from(container.querySelectorAll('span')).find(s => (s.textContent ?? '').includes('/ 6') && s.style.fontSize === '28px') as HTMLElement | undefined
    expect(span).toBeDefined()
    expect(span?.style.fontVariationSettings).toContain('WONK')
    expect(span?.style.fontVariationSettings).toContain('0')
    // Must NOT match WONK 1
    expect(span?.style.fontVariationSettings).not.toMatch(/WONK"\s+1\b/)
  })

  it('renders stage name from STAGE_NAMES (Documentation for stage 3)', () => {
    const { container } = render(<ApplicationCard application={makeApp({ currentStage: 3 as StageNumber })} stages={makeStages()} daysIn={33} />)
    expect(container.textContent).toContain('Documentation')
  })

  it('renders ETA strip with formatBusinessDaysAhead(2) = "29 April 2026" + "5 business days"', () => {
    const { container } = render(<ApplicationCard application={makeApp()} stages={makeStages()} daysIn={33} />)
    expect(container.textContent).toContain('29 April 2026')
    expect(container.textContent).toContain('5 business days')
  })

  it('embeds StageTimeline (6 pills detected)', () => {
    const { container } = render(<ApplicationCard application={makeApp()} stages={makeStages()} daysIn={33} />)
    const pills = container.querySelectorAll('[aria-label^="Stage "]')
    expect(pills.length).toBe(6)
  })
})

describe('ApplicationCard — right column key facts', () => {
  it('renders "What you\'re applying for" eyebrow + 4 product rows for Kaisei', () => {
    const { container } = render(<ApplicationCard application={makeApp()} stages={makeStages()} daysIn={33} />)
    expect(container.textContent).toContain("What you're applying for")
    expect(container.textContent).toContain('Multi-currency operating accounts') // accounts.detail
    expect(container.textContent).toContain('Multi-currency accounts across JP / SG / HK / UK') // cash_management.detail
    expect(container.textContent).toContain('LC issuance, supply chain finance — SG + HK') // trade_finance.detail
    expect(container.textContent).toContain('USD 50M, 3-year tenor, uncommitted pricing grid') // credit.detail
  })

  it('renders 4 jurisdiction flags including 🇯🇵 even when targetJurisdictions excludes JP (D-11)', () => {
    const { container } = render(<ApplicationCard application={makeApp({ targetJurisdictions: ['SG', 'HK', 'GB'] })} stages={makeStages()} daysIn={33} />)
    expect(container.textContent).toContain('🇯🇵')
    expect(container.textContent).toContain('🇸🇬')
    expect(container.textContent).toContain('🇭🇰')
    expect(container.textContent).toContain('🇬🇧')
  })

  it('renders "33 days" in trad-green (NOT fresh-green)', () => {
    const { container } = render(<ApplicationCard application={makeApp()} stages={makeStages()} daysIn={33} />)
    const span = Array.from(container.querySelectorAll('div')).find(d => d.textContent === '33 days') as HTMLElement | undefined
    expect(span).toBeDefined()
    expect(span?.className).toContain('text-trad-green')
    expect(span?.className).not.toContain('text-fresh-green')
  })
})

describe('ApplicationCard — fresh-green negative (OD5R-01)', () => {
  it('outerHTML has no bg-fresh-green / text-fresh-green Tailwind tokens', () => {
    const { container } = render(<ApplicationCard application={makeApp()} stages={makeStages()} daysIn={33} />)
    // Exclude AIPulseDot from StageTimeline (allowlisted via primitive)
    const root = container.firstElementChild as Element
    const clone = root.cloneNode(true) as Element
    const dots = clone.querySelectorAll('[role="img"]')
    for (const d of Array.from(dots)) d.parentElement?.removeChild(d)
    expect(clone.innerHTML).not.toMatch(/\bbg-fresh-green\b/)
    expect(clone.innerHTML).not.toMatch(/\btext-fresh-green\b/)
  })

  it('has no card--hero::after bottom-edge gradient (OD5R-01 SKIP)', () => {
    const { container } = render(<ApplicationCard application={makeApp()} stages={makeStages()} daysIn={33} />)
    // No element should have an inline linear-gradient containing fresh-green
    expect(container.innerHTML).not.toMatch(/linear-gradient[^)]*fresh-green/)
    expect(container.innerHTML).not.toMatch(/linear-gradient[^)]*191[\s,]+215[\s,]+48/)
  })
})
```
  </action>
  <verify>
    - All assertions pass.
  </verify>
</task>

<task type="auto">
  <name>Task 3: Atomic commit</name>
  <action>
Commit:
```
feat(phase-05-redo): ApplicationCard component (Plan 05-05)

Phase 5 redo Wave 2: hero status card with two-column layout. Left:
stage numeral 76px (OD5R-09 — NOT countdown), stage name, ETA strip
(OD5R-02b — slide-the-window date), embedded StageTimeline. Right:
products list, jurisdictions (JP-prefixed), days-in-progress numeral.

Decisions covered: D-09, D-10, D-11, D-31, D-34 W-03.
OD5R resolutions: OD5R-01 (NO bottom gradient — file NOT allowlisted),
OD5R-02 (slide-the-window ETA via formatBusinessDaysAhead),
OD5R-09 (stage numeral over /6).

Card uses Phase 4-style box-shadow inline rather than .card--hero CSS
class, since the prototype's class set is not reproduced in
app/globals.css. The visual contract matches the prototype.
```
  </action>
  <verify>
    - Clean tree.
  </verify>
</task>

</tasks>

<acceptance>
- ApplicationCard renders both columns correctly per UI-SPEC §Page Layout > Section 2.
- Stage numeral is 76px (NOT 96px); "/6" companion has WONK 0 (NOT WONK 1).
- ETA date string is "29 April 2026" (computed via formatBusinessDaysAhead).
- 4 jurisdiction flags including 🇯🇵.
- File NOT in `.freshgreen-allowlist`.
- Negative fresh-green grep + ::after-gradient grep both pass.
- All test/typecheck/lint exit 0.
</acceptance>
