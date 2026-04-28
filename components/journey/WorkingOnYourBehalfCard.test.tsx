// components/journey/WorkingOnYourBehalfCard.test.tsx — Phase 5 redo Plan 05-07.
//
// Tests cover the locked content surface (header + 3 AILaneRows + Origin quote)
// and defend against fresh-green leak into the "— Origin" attribution
// (T-05R-20: must be trad-green, NOT fresh-green).

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
    expect(container.textContent).toContain(
      'Extracting fields from your HK Business Registration',
    )
    expect(container.textContent).toContain('29 of ~38 fields · 0.96 confidence')
    expect(container.textContent).toContain(
      'Cross-referencing director IDs against all 5 entities',
    )
    expect(container.textContent).toContain('6 of 8 matched')
    expect(container.textContent).toContain(
      'Pre-filled your UK application using Singapore filing',
    )
    expect(container.textContent).toContain('12 fields carried across · 1 min ago')
  })

  it('live row renders an AIPulseDot with ariaLabel "AI live task" (D-22)', () => {
    const { container } = render(<WorkingOnYourBehalfCard />)
    const liveDot = container.querySelector('[aria-label="AI live task"]')
    expect(liveDot).not.toBeNull()
  })

  it('done row renders a check Icon (svg present)', () => {
    const { container } = render(<WorkingOnYourBehalfCard />)
    const svgs = container.querySelectorAll('svg')
    expect(svgs.length).toBeGreaterThan(0)
  })

  it('pending row renders a 6x6 fresh-green dot', () => {
    const { container } = render(<WorkingOnYourBehalfCard />)
    const pendingDots = Array.from(
      container.querySelectorAll('span[aria-hidden="true"][class*="rounded-full"]'),
    ) as HTMLElement[]
    const freshDot = pendingDots.find(
      (s) =>
        s.style.background === 'var(--color-fresh-green)' &&
        s.style.width === '6px',
    )
    expect(freshDot).toBeDefined()
  })

  it('AILaneRow has fresh-green 20% bottom border', () => {
    const { container } = render(<WorkingOnYourBehalfCard />)
    const rows = Array.from(container.querySelectorAll('div')).filter(
      (d) =>
        d.style.borderBottom &&
        d.style.borderBottom.includes('rgba(191, 215, 48, 0.2)'),
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
