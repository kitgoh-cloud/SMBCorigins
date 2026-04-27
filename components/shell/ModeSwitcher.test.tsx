/**
 * components/shell/ModeSwitcher.test.tsx — Tests for ModeSwitcher (SHELL-02, D-68, D-69, retrofits #3 #4).
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render } from '@testing-library/react'
import { ModeSwitcher } from '@/components/shell/ModeSwitcher'

// Set/restore env var across tests so the gate is exercised in both directions.
const ORIGINAL_ENV = process.env.NEXT_PUBLIC_SHOW_MODE_SWITCHER

afterEach(() => {
  // Reset env var to original after every test
  if (ORIGINAL_ENV === undefined) {
    delete process.env.NEXT_PUBLIC_SHOW_MODE_SWITCHER
  } else {
    process.env.NEXT_PUBLIC_SHOW_MODE_SWITCHER = ORIGINAL_ENV
  }
})

describe('components/shell/ModeSwitcher (SHELL-02, D-68 env gate)', () => {
  it('renders null when env var is undefined', () => {
    delete process.env.NEXT_PUBLIC_SHOW_MODE_SWITCHER
    const { container } = render(<ModeSwitcher activeMode="client" />)
    expect(container.firstChild).toBeNull()
  })

  it('renders null when env var is "false" (not the string "true")', () => {
    process.env.NEXT_PUBLIC_SHOW_MODE_SWITCHER = 'false'
    const { container } = render(<ModeSwitcher activeMode="client" />)
    expect(container.firstChild).toBeNull()
  })

  it('renders null when env var is the empty string', () => {
    process.env.NEXT_PUBLIC_SHOW_MODE_SWITCHER = ''
    const { container } = render(<ModeSwitcher activeMode="client" />)
    expect(container.firstChild).toBeNull()
  })

  it('renders the switcher when env var is exactly "true"', () => {
    process.env.NEXT_PUBLIC_SHOW_MODE_SWITCHER = 'true'
    const { container } = render(<ModeSwitcher activeMode="client" />)
    expect(container.firstChild).not.toBeNull()
  })
})

describe('components/shell/ModeSwitcher — composition (D-69 + retrofits #3 #4)', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SHOW_MODE_SWITCHER = 'true'
  })

  it('renders DEMO eyebrow with text-signal-amber (retrofit #4 — NOT fresh-green)', () => {
    const { container } = render(<ModeSwitcher activeMode="client" />)
    expect(container.textContent).toContain('DEMO')
    // The eyebrow is the first child of the wrapper; class includes signal-amber
    const wrapper = container.firstElementChild as HTMLElement
    const eyebrow = wrapper.firstElementChild as HTMLElement
    expect(eyebrow.className).toContain('text-signal-amber')
    expect(eyebrow.className).not.toMatch(/fresh-green/)
  })

  it('container border is dashed + ink-muted/30 (retrofit #3 — NOT fresh-green)', () => {
    const { container } = render(<ModeSwitcher activeMode="client" />)
    const wrapper = container.firstElementChild as HTMLElement
    expect(wrapper.className).toContain('border-dashed')
    expect(wrapper.className).toContain('border-ink-muted/30')
    expect(wrapper.className).not.toMatch(/fresh-green/)
  })

  it('renders two <a> elements (Link components) with hrefs /journey and /cockpit', () => {
    const { container } = render(<ModeSwitcher activeMode="client" />)
    const links = container.querySelectorAll('a')
    expect(links.length).toBe(2)
    expect(links[0]?.getAttribute('href')).toBe('/journey')
    expect(links[1]?.getAttribute('href')).toBe('/cockpit')
  })

  it('activeMode="client": /journey link has bg-paper text-trad-green-deep + aria-current=page', () => {
    const { container } = render(<ModeSwitcher activeMode="client" />)
    const links = container.querySelectorAll('a')
    const journeyLink = links[0] as HTMLAnchorElement
    const cockpitLink = links[1] as HTMLAnchorElement
    expect(journeyLink.className).toContain('bg-paper')
    expect(journeyLink.className).toContain('text-trad-green-deep')
    expect(journeyLink.getAttribute('aria-current')).toBe('page')
    // /cockpit is inactive
    expect(cockpitLink.className).toContain('bg-trad-green-deep')
    expect(cockpitLink.className).toContain('text-paper')
    expect(cockpitLink.getAttribute('aria-current')).toBeNull()
  })

  it('activeMode="rm": /cockpit link is active', () => {
    const { container } = render(<ModeSwitcher activeMode="rm" />)
    const links = container.querySelectorAll('a')
    const journeyLink = links[0] as HTMLAnchorElement
    const cockpitLink = links[1] as HTMLAnchorElement
    expect(cockpitLink.className).toContain('bg-paper')
    expect(cockpitLink.getAttribute('aria-current')).toBe('page')
    expect(journeyLink.className).toContain('bg-trad-green-deep')
    expect(journeyLink.getAttribute('aria-current')).toBeNull()
  })

  it('activeMode="demo": BOTH segments are inactive (visual ambiguity)', () => {
    const { container } = render(<ModeSwitcher activeMode="demo" />)
    const links = container.querySelectorAll('a')
    for (const link of Array.from(links)) {
      expect(link.className).toContain('bg-trad-green-deep')
      expect(link.className).toContain('text-paper')
      expect(link.getAttribute('aria-current')).toBeNull()
    }
  })

  it('inactive segments have hover:bg-trad-green (UI-SPEC Interaction States line 393)', () => {
    const { container } = render(<ModeSwitcher activeMode="demo" />)
    const links = container.querySelectorAll('a')
    for (const link of Array.from(links)) {
      expect(link.className).toContain('hover:bg-trad-green')
    }
  })

  it('all segments have focus-visible outline-paper outline-offset-2 (UI-SPEC line 394)', () => {
    const { container } = render(<ModeSwitcher activeMode="demo" />)
    const links = container.querySelectorAll('a')
    for (const link of Array.from(links)) {
      expect(link.className).toContain('focus-visible:outline-2')
      expect(link.className).toContain('focus-visible:outline-paper')
      expect(link.className).toContain('focus-visible:outline-offset-2')
    }
  })

  it('full HTML output contains NO fresh-green substring (retrofits enforce SHELL-05 at authorship)', () => {
    const { container } = render(<ModeSwitcher activeMode="client" />)
    expect(container.innerHTML).not.toMatch(/fresh-green/)
    expect(container.innerHTML).not.toMatch(/#[Bb][Ff][Dd]7[3]0/)
    expect(container.innerHTML).not.toMatch(/rgba\(191,\s*215,\s*48/)
  })

  it('segment labels are "Client · Yuki" and "RM · James"', () => {
    const { container } = render(<ModeSwitcher activeMode="client" />)
    const links = container.querySelectorAll('a')
    expect(links[0]?.textContent).toBe('Client · Yuki')
    expect(links[1]?.textContent).toBe('RM · James')
  })
})
