// components/journey/ApplicationCard.test.tsx — Phase 5 redo Plan 05-05.
//
// Coverage:
//   - D-10: Application eyebrow uses uppercase application.id ("APP-KAISEI").
//   - OD5R-09: 76px stage numeral renders application.currentStage with WONK 1.
//   - OD5R-09: "/ 6" companion uses WONK 0 (locked verbatim, NOT WONK 1).
//   - STAGE_NAMES wiring: stage name resolves from currentStage.
//   - OD5R-02b: ETA strip renders formatBusinessDaysAhead(SERVER_DEMO_DATE, 2)
//     = "29 April 2026" + static "5 business days".
//   - StageTimeline embedding: 6 stage pills render via [aria-label^="Stage "].
//   - PRODUCT_DISPLAY_LABEL: 4 product details render for Kaisei seed.
//   - D-11: Jurisdictions list always prefixes JP even when targetJurisdictions
//     excludes it (4 flags including 🇯🇵 with input ['SG', 'HK', 'GB']).
//   - "In progress" numeral uses text-trad-green (NOT fresh-green).
//   - OD5R-01: NO bottom-edge fresh-green gradient anywhere on the rendered
//     hero card. Negative greps for `bg-fresh-green`, `text-fresh-green`,
//     and any `linear-gradient(...)` containing fresh-green tokens.

import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import type {
  Application,
  ProductType,
  Stage,
  StageNumber,
} from '@/types/origin'
import { ApplicationCard } from '@/components/journey/ApplicationCard'

function makeApp(overrides: Partial<Application> = {}): Application {
  return {
    id: 'app-kaisei',
    organizationId: 'org-kaisei',
    rmUserId: 'rm-james',
    status: 'in_progress',
    currentStage: 3,
    targetJurisdictions: ['SG', 'HK', 'GB'],
    productsRequested: [
      'accounts',
      'cash_management',
      'trade_finance',
      'credit',
    ] as ProductType[],
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
    const { container } = render(
      <ApplicationCard
        application={makeApp()}
        stages={makeStages()}
        daysIn={33}
      />,
    )
    expect(container.textContent).toContain('Application · APP-KAISEI')
  })

  it('renders the stage numeral 76px Fraunces with current stage', () => {
    const { container } = render(
      <ApplicationCard
        application={makeApp({ currentStage: 3 as StageNumber })}
        stages={makeStages()}
        daysIn={33}
      />,
    )
    const span = Array.from(container.querySelectorAll('span')).find(
      (s) => s.textContent === '3' && s.style.fontSize === '76px',
    ) as HTMLElement | undefined
    expect(span).toBeDefined()
    expect(span?.className).toContain('text-trad-green-deep')
    expect(span?.style.fontVariationSettings).toContain('SOFT')
    expect(span?.style.fontVariationSettings).toContain('60')
    expect(span?.style.fontVariationSettings).toContain('WONK')
    expect(span?.style.fontVariationSettings).toContain('1')
  })

  it('renders "/ 6" with WONK 0 (NOT WONK 1)', () => {
    const { container } = render(
      <ApplicationCard
        application={makeApp()}
        stages={makeStages()}
        daysIn={33}
      />,
    )
    const span = Array.from(container.querySelectorAll('span')).find(
      (s) =>
        (s.textContent ?? '').includes('/ 6') && s.style.fontSize === '28px',
    ) as HTMLElement | undefined
    expect(span).toBeDefined()
    expect(span?.style.fontVariationSettings).toContain('WONK')
    expect(span?.style.fontVariationSettings).toContain('0')
    // Must NOT match WONK 1
    expect(span?.style.fontVariationSettings).not.toMatch(/WONK"\s+1\b/)
  })

  it('renders stage name from STAGE_NAMES (Documentation for stage 3)', () => {
    const { container } = render(
      <ApplicationCard
        application={makeApp({ currentStage: 3 as StageNumber })}
        stages={makeStages()}
        daysIn={33}
      />,
    )
    expect(container.textContent).toContain('Documentation')
  })

  it('renders ETA strip with formatBusinessDaysAhead(2) = "29 April 2026" + "5 business days"', () => {
    const { container } = render(
      <ApplicationCard
        application={makeApp()}
        stages={makeStages()}
        daysIn={33}
      />,
    )
    expect(container.textContent).toContain('29 April 2026')
    expect(container.textContent).toContain('5 business days')
  })

  it('embeds StageTimeline (6 pills detected)', () => {
    const { container } = render(
      <ApplicationCard
        application={makeApp()}
        stages={makeStages()}
        daysIn={33}
      />,
    )
    const pills = container.querySelectorAll('[aria-label^="Stage "]')
    expect(pills.length).toBe(6)
  })
})

describe('ApplicationCard — right column key facts', () => {
  it("renders \"What you're applying for\" eyebrow + 4 product rows for Kaisei", () => {
    const { container } = render(
      <ApplicationCard
        application={makeApp()}
        stages={makeStages()}
        daysIn={33}
      />,
    )
    expect(container.textContent).toContain("What you're applying for")
    expect(container.textContent).toContain('Multi-currency operating accounts') // accounts.detail
    expect(container.textContent).toContain(
      'Multi-currency accounts across JP / SG / HK / UK',
    ) // cash_management.detail
    expect(container.textContent).toContain(
      'LC issuance, supply chain finance — SG + HK',
    ) // trade_finance.detail
    expect(container.textContent).toContain(
      'USD 50M, 3-year tenor, uncommitted pricing grid',
    ) // credit.detail
  })

  it('renders 4 jurisdiction flags including 🇯🇵 even when targetJurisdictions excludes JP (D-11)', () => {
    const { container } = render(
      <ApplicationCard
        application={makeApp({ targetJurisdictions: ['SG', 'HK', 'GB'] })}
        stages={makeStages()}
        daysIn={33}
      />,
    )
    expect(container.textContent).toContain('🇯🇵')
    expect(container.textContent).toContain('🇸🇬')
    expect(container.textContent).toContain('🇭🇰')
    expect(container.textContent).toContain('🇬🇧')
  })

  it('renders "33 days" in trad-green (NOT fresh-green)', () => {
    const { container } = render(
      <ApplicationCard
        application={makeApp()}
        stages={makeStages()}
        daysIn={33}
      />,
    )
    const span = Array.from(container.querySelectorAll('div')).find(
      (d) => d.textContent === '33 days',
    ) as HTMLElement | undefined
    expect(span).toBeDefined()
    expect(span?.className).toContain('text-trad-green')
    expect(span?.className).not.toContain('text-fresh-green')
  })
})

describe('ApplicationCard — fresh-green negative (OD5R-01)', () => {
  it('outerHTML has no bg-fresh-green / text-fresh-green Tailwind tokens', () => {
    const { container } = render(
      <ApplicationCard
        application={makeApp()}
        stages={makeStages()}
        daysIn={33}
      />,
    )
    // Exclude AIPulseDot from StageTimeline (allowlisted via primitive)
    const root = container.firstElementChild as Element
    const clone = root.cloneNode(true) as Element
    const dots = clone.querySelectorAll('[role="img"]')
    for (const d of Array.from(dots)) d.parentElement?.removeChild(d)
    expect(clone.innerHTML).not.toMatch(/\bbg-fresh-green\b/)
    expect(clone.innerHTML).not.toMatch(/\btext-fresh-green\b/)
  })

  it('has no card--hero::after bottom-edge gradient (OD5R-01 SKIP)', () => {
    const { container } = render(
      <ApplicationCard
        application={makeApp()}
        stages={makeStages()}
        daysIn={33}
      />,
    )
    // No element should have an inline linear-gradient containing fresh-green
    expect(container.innerHTML).not.toMatch(/linear-gradient[^)]*fresh-green/)
    expect(container.innerHTML).not.toMatch(
      /linear-gradient[^)]*191[\s,]+215[\s,]+48/,
    )
  })
})
