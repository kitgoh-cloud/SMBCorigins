/**
 * components/primitives/AIBadge.test.tsx — Tests for AIBadge (SHELL-04, D-75).
 */

import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { AIBadge } from '@/components/primitives/AIBadge'

describe('components/primitives/AIBadge (SHELL-04, D-75)', () => {
  it('default label is "Origin"', () => {
    const { container } = render(<AIBadge />)
    expect(container.textContent).toBe('Origin')
  })

  it('label prop overrides the default', () => {
    const { container } = render(<AIBadge label="Reviewing" />)
    expect(container.textContent).toBe('Reviewing')
  })

  it('outer pill has trad-green-deep background and fresh-green text', () => {
    const { container } = render(<AIBadge />)
    const outer = container.firstElementChild as HTMLElement
    expect(outer.className).toContain('bg-trad-green-deep')
    expect(outer.className).toContain('text-fresh-green')
  })

  it('outer pill is rounded-full inline-flex with gap', () => {
    const { container } = render(<AIBadge />)
    const outer = container.firstElementChild as HTMLElement
    expect(outer.className).toContain('rounded-full')
    expect(outer.className).toContain('inline-flex')
    expect(outer.className).toContain('items-center')
    expect(outer.className).toContain('gap-2')
  })

  it('contains AIPulseDot (inner span with bg-fresh-green animate-ai-pulse)', () => {
    const { container } = render(<AIBadge />)
    const dot = container.querySelector('span > span[role="img"]')
    expect(dot).not.toBeNull()
    expect(dot?.className).toContain('bg-fresh-green')
    expect(dot?.className).toContain('animate-ai-pulse')
  })

  it('label rendered as a child span (preserves text-fresh-green via parent inheritance)', () => {
    const { container } = render(<AIBadge label="Test" />)
    // Two child spans: AIPulseDot (role=img) + label span
    const innerSpans = container.querySelectorAll('span > span')
    expect(innerSpans.length).toBe(2)
  })
})
