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
