/**
 * components/primitives/AIPulseDot.test.tsx — Tests for AIPulseDot (SHELL-04, D-75).
 */

import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { AIPulseDot } from '@/components/primitives/AIPulseDot'

describe('components/primitives/AIPulseDot (SHELL-04, D-75)', () => {
  it('renders a span with role="img"', () => {
    const { container } = render(<AIPulseDot />)
    const span = container.querySelector('span')
    expect(span).not.toBeNull()
    expect(span?.getAttribute('role')).toBe('img')
  })

  it('default aria-label is "AI active"', () => {
    const { container } = render(<AIPulseDot />)
    const span = container.querySelector('span')
    expect(span?.getAttribute('aria-label')).toBe('AI active')
  })

  it('ariaLabel prop overrides the default', () => {
    const { container } = render(<AIPulseDot ariaLabel="Origin is thinking" />)
    const span = container.querySelector('span')
    expect(span?.getAttribute('aria-label')).toBe('Origin is thinking')
  })

  it('classList contains bg-fresh-green and animate-ai-pulse', () => {
    const { container } = render(<AIPulseDot />)
    const span = container.querySelector('span')
    expect(span?.className).toContain('bg-fresh-green')
    expect(span?.className).toContain('animate-ai-pulse')
  })

  it('classList contains w-2 h-2 (8px square)', () => {
    const { container } = render(<AIPulseDot />)
    const span = container.querySelector('span')
    expect(span?.className).toContain('w-2')
    expect(span?.className).toContain('h-2')
  })

  it('classList contains rounded-full (circular)', () => {
    const { container } = render(<AIPulseDot />)
    const span = container.querySelector('span')
    expect(span?.className).toContain('rounded-full')
  })

  it('renders no children (bare dot)', () => {
    const { container } = render(<AIPulseDot />)
    const span = container.querySelector('span')
    expect(span?.children.length).toBe(0)
    expect(span?.textContent).toBe('')
  })
})
