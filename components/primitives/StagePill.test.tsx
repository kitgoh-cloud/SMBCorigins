/**
 * components/primitives/StagePill.test.tsx — Tests for StagePill (SHELL-04, D-74).
 */

import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { StagePill, type StagePillState } from '@/components/primitives/StagePill'
import type { StageNumber } from '@/types/origin'

const ALL_NUMBERS: ReadonlyArray<StageNumber> = [1, 2, 3, 4, 5, 6]
const ALL_STATES: ReadonlyArray<StagePillState> = ['done', 'current', 'upcoming']

describe('components/primitives/StagePill (SHELL-04, D-74)', () => {
  it('renders the numeral 1..6 when state is upcoming', () => {
    for (const n of ALL_NUMBERS) {
      const { container } = render(<StagePill n={n} state="upcoming" />)
      expect(container.textContent).toBe(String(n))
    }
  })

  it('renders the ✓ glyph when state is done (regardless of n)', () => {
    for (const n of ALL_NUMBERS) {
      const { container } = render(<StagePill n={n} state="done" />)
      expect(container.textContent).toBe('✓')
    }
  })

  it('renders the numeral when state is current (NOT ✓)', () => {
    for (const n of ALL_NUMBERS) {
      const { container } = render(<StagePill n={n} state="current" />)
      expect(container.textContent).toBe(String(n))
    }
  })

  it('state=done has bg-trad-green and text-paper', () => {
    const { container } = render(<StagePill n={1} state="done" />)
    const span = container.firstElementChild as HTMLElement
    expect(span.className).toContain('bg-trad-green')
    expect(span.className).toContain('text-paper')
  })

  it('state=current has border-2 border-trad-green', () => {
    const { container } = render(<StagePill n={2} state="current" />)
    const span = container.firstElementChild as HTMLElement
    expect(span.className).toContain('bg-paper')
    expect(span.className).toContain('text-trad-green')
    expect(span.className).toContain('border-2')
    expect(span.className).toContain('border-trad-green')
  })

  it('state=upcoming has bg-mist and text-ink-muted', () => {
    const { container } = render(<StagePill n={3} state="upcoming" />)
    const span = container.firstElementChild as HTMLElement
    expect(span.className).toContain('bg-mist')
    expect(span.className).toContain('text-ink-muted')
  })

  it('default size is 34 (UI-SPEC OD-2)', () => {
    const { container } = render(<StagePill n={1} state="upcoming" />)
    const span = container.firstElementChild as HTMLElement
    expect(span.style.width).toBe('34px')
    expect(span.style.height).toBe('34px')
    expect(span.style.fontSize).toBe('15px') // round(34 * 0.44) = 15
  })

  it('size prop overrides default', () => {
    const { container } = render(<StagePill n={1} state="upcoming" size={48} />)
    const span = container.firstElementChild as HTMLElement
    expect(span.style.width).toBe('48px')
    expect(span.style.height).toBe('48px')
  })

  it('disc is rounded-full and uses font-display (Fraunces) at semibold weight', () => {
    const { container } = render(<StagePill n={1} state="upcoming" />)
    const span = container.firstElementChild as HTMLElement
    expect(span.className).toContain('rounded-full')
    expect(span.className).toContain('font-display')
    expect(span.className).toContain('font-semibold')
  })

  it('aria-label communicates "Stage N state" for accessibility', () => {
    const { container } = render(<StagePill n={4} state="current" />)
    const span = container.firstElementChild as HTMLElement
    expect(span.getAttribute('aria-label')).toBe('Stage 4 current')
  })

  it('renders all 18 (n × state) combinations without throwing', () => {
    for (const n of ALL_NUMBERS) {
      for (const state of ALL_STATES) {
        expect(() => render(<StagePill n={n} state={state} />)).not.toThrow()
      }
    }
  })
})
