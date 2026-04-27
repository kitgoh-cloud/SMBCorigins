/**
 * components/primitives/Icon.test.tsx — Tests for the Icon primitive (SHELL-04, D-79).
 */

import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Icon, type IconName } from '@/components/primitives/Icon'

const ALL_NAMES: ReadonlyArray<IconName> = [
  'app-folder', 'arrow-right', 'arrow-up-right', 'bank', 'bell', 'bolt',
  'calendar', 'check', 'chevron-down', 'chevron-right', 'clock', 'close',
  'cockpit', 'copilot', 'credit', 'docs', 'dot', 'edit', 'external',
  'filter', 'globe', 'help', 'mail', 'paperclip', 'pipeline', 'refresh',
  'rocket', 'search', 'send', 'shield', 'sparkle', 'stack', 'tree',
  'upload', 'users', 'yen',
]

describe('components/primitives/Icon (SHELL-04, D-79)', () => {
  it('renders an svg for every name in the closed union (36 names)', () => {
    expect(ALL_NAMES.length).toBe(36)
    for (const name of ALL_NAMES) {
      const { container } = render(<Icon name={name} />)
      const svg = container.querySelector('svg')
      expect(svg, `Icon name="${name}" must render an <svg>`).not.toBeNull()
    }
  })

  it('ariaLabel sets role=img and aria-label, no aria-hidden', () => {
    const { container } = render(<Icon name="mail" ariaLabel="Mail" />)
    const svg = container.querySelector('svg')
    expect(svg?.getAttribute('role')).toBe('img')
    expect(svg?.getAttribute('aria-label')).toBe('Mail')
    expect(svg?.hasAttribute('aria-hidden')).toBe(false)
  })

  it('omitted ariaLabel sets aria-hidden=true and no aria-label', () => {
    const { container } = render(<Icon name="check" />)
    const svg = container.querySelector('svg')
    expect(svg?.getAttribute('aria-hidden')).toBe('true')
    expect(svg?.hasAttribute('aria-label')).toBe(false)
    expect(svg?.hasAttribute('role')).toBe(false)
  })

  it('check icon renders single path child', () => {
    const { container } = render(<Icon name="check" />)
    const paths = container.querySelectorAll('svg > path')
    const circles = container.querySelectorAll('svg > circle')
    expect(paths.length).toBe(1)
    expect(circles.length).toBe(0)
  })

  it('dot icon renders one circle with fill (not stroke)', () => {
    const { container } = render(<Icon name="dot" color="#ff0000" />)
    const circle = container.querySelector('svg > circle')
    expect(circle).not.toBeNull()
    expect(circle?.getAttribute('fill')).toBe('#ff0000')
  })

  it('help icon renders one circle + one path (multi-child)', () => {
    const { container } = render(<Icon name="help" />)
    const circles = container.querySelectorAll('svg > circle')
    const paths = container.querySelectorAll('svg > path')
    expect(circles.length).toBe(1)
    expect(paths.length).toBe(1)
  })

  it('users icon renders two circles + one path (3 children)', () => {
    const { container } = render(<Icon name="users" />)
    const circles = container.querySelectorAll('svg > circle')
    const paths = container.querySelectorAll('svg > path')
    expect(circles.length).toBe(2)
    expect(paths.length).toBe(1)
  })

  it('size prop applies to width and height', () => {
    const { container } = render(<Icon name="check" size={24} />)
    const svg = container.querySelector('svg') as SVGElement
    expect((svg.style as CSSStyleDeclaration).width).toBe('24px')
    expect((svg.style as CSSStyleDeclaration).height).toBe('24px')
  })
})
