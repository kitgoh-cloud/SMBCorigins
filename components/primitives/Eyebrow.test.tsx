/**
 * components/primitives/Eyebrow.test.tsx — Tests for the Eyebrow primitive (SHELL-04).
 *
 * Covers:
 *   - Renders as <span> with children
 *   - Default classlist matches UI-SPEC typography (10/500 IBM Plex Mono, 0.18em tracking)
 *   - className prop appends to defaults (does not replace)
 */

import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Eyebrow } from '@/components/primitives/Eyebrow'

describe('components/primitives/Eyebrow (SHELL-04)', () => {
  it('renders children inside a span', () => {
    const { container } = render(<Eyebrow>BY SMBC</Eyebrow>)
    const span = container.querySelector('span')
    expect(span).not.toBeNull()
    expect(span?.textContent).toBe('BY SMBC')
  })

  it('default classlist matches locked typography', () => {
    const { container } = render(<Eyebrow>label</Eyebrow>)
    const span = container.firstElementChild as HTMLElement
    expect(span.className).toContain('font-mono')
    expect(span.className).toContain('uppercase')
    expect(span.className).toContain('tracking-[0.18em]')
    expect(span.className).toContain('text-ink-muted')
    expect(span.className).toContain('text-[10px]')
    expect(span.className).toContain('font-medium')
  })

  it('className prop appends to defaults', () => {
    const { container } = render(<Eyebrow className="text-paper">DEMO</Eyebrow>)
    const span = container.firstElementChild as HTMLElement
    // both default and custom classes coexist
    expect(span.className).toContain('font-mono')
    expect(span.className).toContain('text-paper')
  })

  it('renders complex children (ReactNode, not just string)', () => {
    const { container } = render(
      <Eyebrow>
        label · <strong>bold</strong>
      </Eyebrow>
    )
    const span = container.firstElementChild as HTMLElement
    expect(span.textContent).toContain('label')
    expect(span.querySelector('strong')).not.toBeNull()
  })
})
