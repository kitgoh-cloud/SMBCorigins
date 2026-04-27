/**
 * components/shell/RMShell.test.tsx — Tests for RMShell (SHELL-01, retrofit #5).
 */

import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { RMShell } from '@/components/shell/RMShell'

describe('components/shell/RMShell (SHELL-01, D-77, retrofit #5)', () => {
  it('renders children inside the workspace', () => {
    const { container } = render(
      <RMShell>
        <h1 data-testid="workspace-content">Cockpit</h1>
      </RMShell>,
    )
    expect(container.querySelector('[data-testid="workspace-content"]')).not.toBeNull()
  })

  it('outer container is flex bg-paper-deep min-h-[calc(100vh-56px)]', () => {
    const { container } = render(<RMShell><p>x</p></RMShell>)
    const outer = container.firstElementChild as HTMLElement
    expect(outer.className).toContain('flex')
    expect(outer.className).toContain('bg-paper-deep')
    expect(outer.className).toContain('min-h-[calc(100vh-56px)]')
  })

  it('sidebar is <aside> with w-[220px] flex-shrink-0 bg-paper sticky top-14', () => {
    const { container } = render(<RMShell><p>x</p></RMShell>)
    const aside = container.querySelector('aside')
    expect(aside).not.toBeNull()
    expect(aside?.className).toContain('w-[220px]')
    expect(aside?.className).toContain('flex-shrink-0')
    expect(aside?.className).toContain('bg-paper')
    expect(aside?.className).toContain('sticky')
    expect(aside?.className).toContain('top-14')
    expect(aside?.className).toContain('border-r')
    expect(aside?.className).toContain('border-mist')
  })

  it('sidebar contains "Workspace" eyebrow', () => {
    const { container } = render(<RMShell><p>x</p></RMShell>)
    const aside = container.querySelector('aside')
    expect(aside?.textContent).toContain('Workspace')
  })

  it('sidebar contains 4 nav items: Cockpit, Pipeline, Applications, Copilot', () => {
    const { container } = render(<RMShell><p>x</p></RMShell>)
    const aside = container.querySelector('aside')
    const text = aside?.textContent ?? ''
    expect(text).toContain('Cockpit')
    expect(text).toContain('Pipeline')
    expect(text).toContain('Applications')
    expect(text).toContain('Copilot')
  })

  it('Cockpit nav item is active (bg-paper-deep text-ink font-medium + aria-current=page)', () => {
    const { container } = render(<RMShell><p>x</p></RMShell>)
    const navItems = container.querySelectorAll('aside nav > span')
    const cockpit = Array.from(navItems).find((el) => el.textContent?.includes('Cockpit')) as HTMLElement
    expect(cockpit.className).toContain('bg-paper-deep')
    expect(cockpit.className).toContain('text-ink')
    expect(cockpit.className).toContain('font-medium')
    expect(cockpit.getAttribute('aria-current')).toBe('page')
  })

  it('inactive nav items have bg-transparent text-ink-soft font-normal, no aria-current', () => {
    const { container } = render(<RMShell><p>x</p></RMShell>)
    const navItems = container.querySelectorAll('aside nav > span')
    const inactive = Array.from(navItems).filter((el) => !el.textContent?.includes('Cockpit'))
    expect(inactive.length).toBe(3)
    for (const item of inactive) {
      expect(item.className).toContain('bg-transparent')
      expect(item.className).toContain('text-ink-soft')
      expect(item.className).toContain('font-normal')
      expect(item.getAttribute('aria-current')).toBeNull()
    }
  })

  it('active Cockpit item has right-aligned dot with bg-trad-green (retrofit #5 — NOT fresh-green)', () => {
    const { container } = render(<RMShell><p>x</p></RMShell>)
    const navItems = container.querySelectorAll('aside nav > span')
    const cockpit = Array.from(navItems).find((el) => el.textContent?.includes('Cockpit')) as HTMLElement
    const dot = cockpit.querySelector('span[aria-hidden="true"]')
    expect(dot).not.toBeNull()
    expect(dot?.className).toContain('bg-trad-green')
    expect(dot?.className).toContain('rounded-full')
    expect(dot?.className).toContain('ml-auto')
    expect(dot?.className).not.toMatch(/fresh-green/)
  })

  it('inactive nav items have NO active-indicator dot', () => {
    const { container } = render(<RMShell><p>x</p></RMShell>)
    const navItems = container.querySelectorAll('aside nav > span')
    const inactive = Array.from(navItems).filter((el) => !el.textContent?.includes('Cockpit'))
    for (const item of inactive) {
      // Inactive items have no active dot (only the icon's children, which use the SVG aria-hidden)
      // The SVG has aria-hidden too; differentiate by checking for the rounded-full class
      const activeDot = item.querySelector('span[aria-hidden="true"].rounded-full')
      expect(activeDot).toBeNull()
    }
  })

  it('workspace is <main> with flex-1 px-8 py-7 min-w-0 relative', () => {
    const { container } = render(<RMShell><p>x</p></RMShell>)
    const main = container.querySelector('main')
    expect(main).not.toBeNull()
    expect(main?.className).toContain('flex-1')
    expect(main?.className).toContain('px-8')
    expect(main?.className).toContain('py-7')
    expect(main?.className).toContain('min-w-0')
    expect(main?.className).toContain('relative')
  })

  it('NO copilot sidecar element rendered (Phase 4 ships empty per D-77)', () => {
    const { container } = render(<RMShell><p>x</p></RMShell>)
    // No element with copilot-related class or data-attribute
    expect(container.querySelector('[data-copilot]')).toBeNull()
    expect(container.querySelector('[aria-label*="Copilot"]')).toBeNull()
  })

  it('full HTML output contains NO fresh-green substring (retrofit #5 enforced at authorship)', () => {
    const { container } = render(<RMShell><p>x</p></RMShell>)
    expect(container.innerHTML).not.toMatch(/fresh-green/)
    expect(container.innerHTML).not.toMatch(/#[Bb][Ff][Dd]7[3]0/)
  })

  it('sidebar has portfolio bottom block separated by border-t border-mist', () => {
    const { container } = render(<RMShell><p>x</p></RMShell>)
    const aside = container.querySelector('aside')
    const bottom = aside?.querySelector('.mt-auto')
    expect(bottom).not.toBeNull()
    expect(bottom?.className).toContain('border-t')
    expect(bottom?.className).toContain('border-mist')
  })
})
