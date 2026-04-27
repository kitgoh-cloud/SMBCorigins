/**
 * components/shell/ClientShell.test.tsx — Tests for ClientShell (SHELL-01).
 */

import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { ClientShell } from '@/components/shell/ClientShell'

describe('components/shell/ClientShell (SHELL-01)', () => {
  it('renders children', () => {
    const { container } = render(
      <ClientShell>
        <p data-testid="child">Hello</p>
      </ClientShell>,
    )
    expect(container.querySelector('[data-testid="child"]')).not.toBeNull()
  })

  it('outer wrapper has bg-paper, min-h-[calc(100vh-56px)], relative, overflow-hidden', () => {
    const { container } = render(<ClientShell><p>x</p></ClientShell>)
    const outer = container.firstElementChild as HTMLElement
    expect(outer.className).toContain('bg-paper')
    expect(outer.className).toContain('min-h-[calc(100vh-56px)]')
    expect(outer.className).toContain('relative')
    expect(outer.className).toContain('overflow-hidden')
  })

  it('inner content container has max-w-[1200px], mx-auto, pt-9 px-10 pb-20', () => {
    const { container } = render(<ClientShell><p>x</p></ClientShell>)
    // Rule 1 fix: container.querySelector('div > div') returns the OUTER div (first match in
    // document order) because the testing-library container itself is a <div>. Use
    // firstElementChild.firstElementChild to reach the inner content div specifically.
    const inner = (container.firstElementChild as HTMLElement).querySelector('div') as HTMLElement
    expect(inner.className).toContain('max-w-[1200px]')
    expect(inner.className).toContain('mx-auto')
    expect(inner.className).toContain('pt-9')
    expect(inner.className).toContain('px-10')
    expect(inner.className).toContain('pb-20')
  })

  it('contains NO fresh-green tokens', () => {
    const { container } = render(<ClientShell><p>x</p></ClientShell>)
    expect(container.innerHTML).not.toMatch(/fresh-green/)
  })
})
