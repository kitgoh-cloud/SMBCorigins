/**
 * components/primitives/Avatar.test.tsx — Tests for Avatar primitive (SHELL-04, D-78).
 */

import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Avatar, type AvatarColor } from '@/components/primitives/Avatar'

const ALL_COLORS: ReadonlyArray<AvatarColor> = [
  'trad-green',
  'trad-green-soft',
  'trad-green-deep',
  'ink',
  'ink-muted',
  'paper',
  'mist',
]

describe('components/primitives/Avatar (SHELL-04, D-78)', () => {
  it('renders initials as text', () => {
    const { container } = render(<Avatar initials="YT" color="trad-green-soft" />)
    const span = container.firstElementChild as HTMLElement
    expect(span.textContent).toBe('YT')
  })

  it('default size is 30 (UI-SPEC OD-4)', () => {
    const { container } = render(<Avatar initials="YT" color="trad-green-soft" />)
    const span = container.firstElementChild as HTMLElement
    expect(span.style.width).toBe('30px')
    expect(span.style.height).toBe('30px')
  })

  it('size prop overrides default', () => {
    const { container } = render(<Avatar initials="JL" color="trad-green-soft" size={48} />)
    const span = container.firstElementChild as HTMLElement
    expect(span.style.width).toBe('48px')
    expect(span.style.height).toBe('48px')
  })

  it('initials rendered in mono font (font-mono utility class)', () => {
    const { container } = render(<Avatar initials="YT" color="trad-green-soft" />)
    const span = container.firstElementChild as HTMLElement
    expect(span.className).toContain('font-mono')
  })

  it('all 7 AvatarColor members map to bg-{color} utility', () => {
    for (const color of ALL_COLORS) {
      const { container } = render(<Avatar initials="XX" color={color} />)
      const span = container.firstElementChild as HTMLElement
      expect(span.className, `color="${color}" should produce bg-${color}`).toContain(`bg-${color}`)
    }
  })

  it('default textColor is "paper" (text-paper utility)', () => {
    const { container } = render(<Avatar initials="XX" color="trad-green" />)
    const span = container.firstElementChild as HTMLElement
    expect(span.className).toContain('text-paper')
  })

  it('textColor prop overrides the default', () => {
    const { container } = render(
      <Avatar initials="XX" color="paper" textColor="trad-green-deep" />
    )
    const span = container.firstElementChild as HTMLElement
    expect(span.className).toContain('text-trad-green-deep')
  })

  it('AvatarColor enum has exactly 7 members (Plan 04-05 lock)', () => {
    expect(ALL_COLORS.length).toBe(7)
  })

  it('AvatarColor enum excludes fresh-green family (D-78)', () => {
    const colors: string[] = ALL_COLORS as unknown as string[]
    expect(colors).not.toContain('fresh-green')
    expect(colors).not.toContain('fresh-green-mute')
    expect(colors).not.toContain('fresh-green-glow')
  })
})
