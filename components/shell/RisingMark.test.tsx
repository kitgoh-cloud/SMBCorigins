/**
 * components/shell/RisingMark.test.tsx — Tests for RisingMark (SHELL-03).
 */

import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { RisingMark } from '@/components/shell/RisingMark'

describe('components/shell/RisingMark (SHELL-03)', () => {
  it('renders an svg with viewBox 0 0 40 40', () => {
    const { container } = render(<RisingMark />)
    const svg = container.querySelector('svg')
    expect(svg).not.toBeNull()
    expect(svg?.getAttribute('viewBox')).toBe('0 0 40 40')
  })

  it('default size is 24 (UI-SPEC OD-3 TopStrip default)', () => {
    const { container } = render(<RisingMark />)
    const svg = container.querySelector('svg')
    expect(svg?.getAttribute('width')).toBe('24')
    expect(svg?.getAttribute('height')).toBe('24')
  })

  it('size prop overrides default (e.g., 26 for BrandLockup)', () => {
    const { container } = render(<RisingMark size={26} />)
    const svg = container.querySelector('svg')
    expect(svg?.getAttribute('width')).toBe('26')
    expect(svg?.getAttribute('height')).toBe('26')
  })

  it('contains 2 circles and 2 lines (4 SVG children)', () => {
    const { container } = render(<RisingMark />)
    const circles = container.querySelectorAll('svg > circle')
    const lines = container.querySelectorAll('svg > line')
    expect(circles.length).toBe(2)
    expect(lines.length).toBe(2)
  })

  it('hand line uses var(--color-fresh-green) by default (allowlisted brand exception)', () => {
    const { container } = render(<RisingMark />)
    const lines = container.querySelectorAll('svg > line')
    const handLine = lines[0] // first line is the clock-hand
    expect(handLine?.getAttribute('stroke')).toBe('var(--color-fresh-green)')
  })

  it('color prop overrides the circle/serif tick stroke', () => {
    const { container } = render(<RisingMark color="#000000" />)
    const circles = container.querySelectorAll('svg > circle')
    const lines = container.querySelectorAll('svg > line')
    expect(circles[0]?.getAttribute('stroke')).toBe('#000000')
    expect(circles[1]?.getAttribute('fill')).toBe('#000000')
    expect(lines[1]?.getAttribute('stroke')).toBe('#000000') // serif tick
  })

  it('hand prop overrides the clock-hand stroke', () => {
    const { container } = render(<RisingMark hand="#ff0000" />)
    const lines = container.querySelectorAll('svg > line')
    expect(lines[0]?.getAttribute('stroke')).toBe('#ff0000')
  })

  it('svg is aria-hidden=true (brand mark is decorative; wordmark carries meaning)', () => {
    const { container } = render(<RisingMark />)
    const svg = container.querySelector('svg')
    expect(svg?.getAttribute('aria-hidden')).toBe('true')
  })
})
