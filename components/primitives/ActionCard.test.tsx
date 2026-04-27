/**
 * components/primitives/ActionCard.test.tsx — Tests for ActionCard (SHELL-04, D-76).
 */

import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { ActionCard } from '@/components/primitives/ActionCard'

describe('components/primitives/ActionCard (SHELL-04, D-76)', () => {
  it('renders title text', () => {
    const { container } = render(<ActionCard title="Review documents" />)
    expect(container.textContent).toContain('Review documents')
  })

  it('renders meta when provided', () => {
    const { container } = render(<ActionCard title="Title" meta="2026-04-26 14:30" />)
    expect(container.textContent).toContain('2026-04-26 14:30')
  })

  it('omits meta block when meta is undefined', () => {
    const { container } = render(<ActionCard title="Title only" />)
    const elements = container.querySelectorAll('span')
    const metaSpans = Array.from(elements).filter((el) =>
      el.className.includes('font-mono'),
    )
    expect(metaSpans.length).toBe(0)
  })

  it('renders as <div> when onClick is not provided', () => {
    const { container } = render(<ActionCard title="Static row" />)
    const root = container.firstElementChild
    expect(root?.tagName.toLowerCase()).toBe('div')
  })

  it('renders as <button type="button"> when onClick is provided', () => {
    const onClick = vi.fn()
    const { container } = render(<ActionCard title="Click me" onClick={onClick} />)
    const root = container.firstElementChild as HTMLButtonElement
    expect(root.tagName.toLowerCase()).toBe('button')
    expect(root.getAttribute('type')).toBe('button')
  })

  it('onClick fires when the button is clicked', () => {
    const onClick = vi.fn()
    const { container } = render(<ActionCard title="Click" onClick={onClick} />)
    const button = container.firstElementChild as HTMLButtonElement
    fireEvent.click(button)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('renders indicator slot ReactNode (left side)', () => {
    const { container } = render(
      <ActionCard
        title="With indicator"
        indicator={<span data-testid="ind">!</span>}
      />,
    )
    expect(container.querySelector('[data-testid="ind"]')).not.toBeNull()
  })

  it('renders cta slot ReactNode (right side)', () => {
    const { container } = render(
      <ActionCard title="With cta" cta={<span data-testid="cta">→</span>} />,
    )
    expect(container.querySelector('[data-testid="cta"]')).not.toBeNull()
  })

  it('faint=true applies text-ink-muted to title', () => {
    const { container } = render(<ActionCard title="Old row" faint />)
    // The title span has font-body class; find it
    const allSpans = container.querySelectorAll('span')
    const found = Array.from(allSpans).find((el) => el.className.includes('font-body'))
    expect(found?.className).toContain('text-ink-muted')
  })

  it('faint=true wraps indicator in opacity-60', () => {
    const { container } = render(
      <ActionCard
        title="Faint row"
        faint
        indicator={<span data-testid="ind">!</span>}
      />,
    )
    // The indicator's parent wrapper carries opacity-60
    const ind = container.querySelector('[data-testid="ind"]')
    const wrapper = ind?.closest('span.opacity-60')
    expect(wrapper).not.toBeNull()
  })

  it('interactive: classList contains cursor-pointer + hover/focus utilities', () => {
    const { container } = render(<ActionCard title="Click" onClick={() => {}} />)
    const root = container.firstElementChild as HTMLElement
    expect(root.className).toContain('cursor-pointer')
    expect(root.className).toContain('hover:bg-paper-deep')
    expect(root.className).toContain('focus-visible:outline-2')
    expect(root.className).toContain('focus-visible:outline-trad-green')
    expect(root.className).toContain('focus-visible:outline-offset-2')
    expect(root.className).toContain('active:bg-mist')
  })

  it('non-interactive: classList contains cursor-default; no hover/focus utilities', () => {
    const { container } = render(<ActionCard title="Static" />)
    const root = container.firstElementChild as HTMLElement
    expect(root.className).toContain('cursor-default')
    expect(root.className).not.toContain('hover:bg-paper-deep')
    expect(root.className).not.toContain('focus-visible')
  })

  it('classList contains transition-colors duration-200 ease-out (shared 200ms baseline)', () => {
    const { container } = render(<ActionCard title="row" />)
    const root = container.firstElementChild as HTMLElement
    expect(root.className).toContain('transition-colors')
    expect(root.className).toContain('duration-200')
    expect(root.className).toContain('ease-out')
  })
})
