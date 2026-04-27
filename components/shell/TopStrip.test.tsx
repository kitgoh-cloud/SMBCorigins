/**
 * components/shell/TopStrip.test.tsx — Tests for TopStrip (SHELL-01, retrofits #1 #2, OD-12).
 *
 * Mocks next/navigation's usePathname so the test can drive different modes.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render } from '@testing-library/react'

// Mock next/navigation BEFORE the component import resolves
vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}))

// Local mutable state for the mock
let mockPathname = '/'

import { TopStrip } from '@/components/shell/TopStrip'

const ORIGINAL_ENV = process.env.NEXT_PUBLIC_SHOW_MODE_SWITCHER

beforeEach(() => {
  // Default to no mode-switcher so we test TopStrip independently of ModeSwitcher rendering
  delete process.env.NEXT_PUBLIC_SHOW_MODE_SWITCHER
})

afterEach(() => {
  mockPathname = '/'
  if (ORIGINAL_ENV === undefined) {
    delete process.env.NEXT_PUBLIC_SHOW_MODE_SWITCHER
  } else {
    process.env.NEXT_PUBLIC_SHOW_MODE_SWITCHER = ORIGINAL_ENV
  }
})

describe('components/shell/TopStrip — base rendering (SHELL-01)', () => {
  it('renders a <header> with bg-trad-green-deep and text-paper', () => {
    mockPathname = '/journey'
    const { container } = render(<TopStrip />)
    const header = container.querySelector('header')
    expect(header).not.toBeNull()
    expect(header?.className).toContain('bg-trad-green-deep')
    expect(header?.className).toContain('text-paper')
  })

  it('header has 56px height (h-14) and is sticky top-0 z-[100]', () => {
    mockPathname = '/journey'
    const { container } = render(<TopStrip />)
    const header = container.querySelector('header')
    expect(header?.className).toContain('h-14')
    expect(header?.className).toContain('sticky')
    expect(header?.className).toContain('top-0')
    expect(header?.className).toContain('z-[100]')
  })

  it('renders the RisingMark brand SVG (viewBox 0 0 40 40)', () => {
    mockPathname = '/journey'
    const { container } = render(<TopStrip />)
    const svg = container.querySelector('svg[viewBox="0 0 40 40"]')
    expect(svg).not.toBeNull()
  })

  it('"Origin" wordmark has inline fontVariationSettings (OD-12 strategy b)', () => {
    mockPathname = '/journey'
    const { container } = render(<TopStrip />)
    // Find the span with text "Origin"
    const allSpans = container.querySelectorAll('span')
    const origin = Array.from(allSpans).find((el) => el.textContent === 'Origin') as HTMLElement
    expect(origin).not.toBeUndefined()
    expect(origin.style.fontVariationSettings).toContain('SOFT')
    expect(origin.style.fontVariationSettings).toContain('WONK')
  })

  it('renders "BY SMBC" eyebrow', () => {
    mockPathname = '/journey'
    const { container } = render(<TopStrip />)
    expect(container.textContent).toContain('BY SMBC')
  })
})

describe('components/shell/TopStrip — client mode (pathname=/journey)', () => {
  beforeEach(() => {
    mockPathname = '/journey'
  })

  it('context badge shows "Kaisei Manufacturing KK" and "開成製造"', () => {
    const { container } = render(<TopStrip />)
    expect(container.textContent).toContain('Kaisei Manufacturing KK')
    expect(container.textContent).toContain('開成製造')
  })

  it('persona block shows "Yuki Tanaka" + "TREASURER"', () => {
    const { container } = render(<TopStrip />)
    expect(container.textContent).toContain('Yuki Tanaka')
    expect(container.textContent).toContain('TREASURER')
  })

  it('Avatar has initials "YT", color trad-green-soft (retrofit #1), size 30', () => {
    const { container } = render(<TopStrip />)
    // Find avatar by its initials
    const allSpans = container.querySelectorAll('span')
    const avatar = Array.from(allSpans).find((el) => el.textContent === 'YT') as HTMLElement
    expect(avatar).not.toBeUndefined()
    expect(avatar.className).toContain('bg-trad-green-soft')
    expect(avatar.className).not.toMatch(/bg-fresh-green/)
    expect(avatar.style.width).toBe('30px')
  })

  it('mail icon has notification dot with bg-signal-amber (retrofit #2)', () => {
    const { container } = render(<TopStrip />)
    const mailGroup = container.querySelector('.relative.inline-flex')
    expect(mailGroup).not.toBeNull()
    const dot = mailGroup?.querySelector('span[aria-hidden="true"]')
    expect(dot).not.toBeNull()
    expect(dot?.className).toContain('bg-signal-amber')
    expect(dot?.className).not.toMatch(/bg-fresh-green/)
  })
})

describe('components/shell/TopStrip — rm mode (pathname=/cockpit)', () => {
  beforeEach(() => {
    mockPathname = '/cockpit'
  })

  it('context badge shows "Japanese Corporates · 25 clients · Singapore desk"', () => {
    const { container } = render(<TopStrip />)
    expect(container.textContent).toContain('Japanese Corporates')
    expect(container.textContent).toContain('25 clients · Singapore desk')
  })

  it('persona block shows "James Lee" + "RELATIONSHIP MGR"', () => {
    const { container } = render(<TopStrip />)
    expect(container.textContent).toContain('James Lee')
    expect(container.textContent).toContain('RELATIONSHIP MGR')
  })

  it('Avatar has initials "JL", color trad-green-soft (retrofit #1), size 30', () => {
    const { container } = render(<TopStrip />)
    const allSpans = container.querySelectorAll('span')
    const avatar = Array.from(allSpans).find((el) => el.textContent === 'JL') as HTMLElement
    expect(avatar).not.toBeUndefined()
    expect(avatar.className).toContain('bg-trad-green-soft')
  })

  it('mail icon has NO notification dot (client-only feature)', () => {
    const { container } = render(<TopStrip />)
    const mailGroup = container.querySelector('.relative.inline-flex')
    const dot = mailGroup?.querySelector('span[aria-hidden="true"]')
    expect(dot).toBeNull()
  })
})

describe('components/shell/TopStrip — demo mode (pathname=/dev/primitives)', () => {
  beforeEach(() => {
    mockPathname = '/dev/primitives'
  })

  it('persona block is suppressed (Yuki, James names absent)', () => {
    const { container } = render(<TopStrip />)
    expect(container.textContent).not.toContain('Yuki Tanaka')
    expect(container.textContent).not.toContain('James Lee')
    expect(container.textContent).not.toContain('TREASURER')
    expect(container.textContent).not.toContain('RELATIONSHIP MGR')
  })

  it('context badge is replaced with "DEV · Primitives Demo" eyebrow', () => {
    const { container } = render(<TopStrip />)
    expect(container.textContent).toContain('DEV')
    expect(container.textContent).toContain('Primitives Demo')
    expect(container.textContent).not.toContain('Kaisei Manufacturing KK')
    expect(container.textContent).not.toContain('Japanese Corporates')
  })

  it('LanguageToggle still renders (visible across all modes per RESEARCH §Open Questions #3)', () => {
    const { container } = render(<TopStrip />)
    expect(container.textContent).toContain('EN')
    expect(container.textContent).toContain('日本語')
  })

  it('mail and help icons still render', () => {
    const { container } = render(<TopStrip />)
    // Mail and help icons are SVGs; verify by ariaLabel
    expect(container.querySelector('svg[aria-label="Mail"]')).not.toBeNull()
    expect(container.querySelector('svg[aria-label="Help"]')).not.toBeNull()
  })
})

describe('components/shell/TopStrip — SHELL-05 negative invariant (only RisingMark uses fresh-green)', () => {
  beforeEach(() => {
    mockPathname = '/journey'
  })

  it('the RisingMark hand stroke uses var(--color-fresh-green) (allowlisted brand exception)', () => {
    const { container } = render(<TopStrip />)
    const lines = container.querySelectorAll('svg[viewBox="0 0 40 40"] line')
    const handLine = lines[0] as SVGLineElement
    expect(handLine.getAttribute('stroke')).toBe('var(--color-fresh-green)')
  })

  it('no other element uses fresh-green: Avatar bg, mail dot bg, ModeSwitcher (when env=true) all use retrofitted tokens', () => {
    process.env.NEXT_PUBLIC_SHOW_MODE_SWITCHER = 'true'
    const { container } = render(<TopStrip />)
    // Strip out the RisingMark <line> stroke (which legitimately uses fresh-green)
    // Note: JSDOM serializes SVG elements as <line ...></line> (not self-closing)
    const html = container.innerHTML.replace(/<line[^>]*stroke="var\(--color-fresh-green\)"[^>]*><\/line>/g, '')
    // Now the remaining HTML must contain NO fresh-green substring
    expect(html).not.toMatch(/fresh-green/)
    expect(html).not.toMatch(/#[Bb][Ff][Dd]7[3]0/)
  })
})
