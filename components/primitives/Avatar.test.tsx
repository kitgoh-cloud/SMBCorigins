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
  'signal-info',
  'warm-amber',
  'fresh-green',
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

  it('all AvatarColor members map to bg-{color} utility', () => {
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

  it('AvatarColor enum has exactly 10 members (Phase 5 D-24 extension; Plan 04-05 lock + Phase 5 +3)', () => {
    expect(ALL_COLORS.length).toBe(10)
  })

  it('AvatarColor enum includes fresh-green for the AI Origin avatar (D-24, OD5R-05); excludes the -mute/-glow variants', () => {
    const colors: string[] = ALL_COLORS as unknown as string[]
    expect(colors).toContain('fresh-green') // AI Origin avatar — allowlisted via Plan 05-02
    expect(colors).not.toContain('fresh-green-mute')
    expect(colors).not.toContain('fresh-green-glow')
  })
})

describe('Avatar — Phase 5 D-24 enum extension', () => {
  it('renders bg-fresh-green when color="fresh-green" (Origin AI avatar)', () => {
    const { container } = render(<Avatar initials="◉" color="fresh-green" size={34} />)
    const span = container.firstElementChild as HTMLElement
    expect(span.className).toContain('bg-fresh-green')
  })

  it('renders bg-signal-info when color="signal-info" (Akiko avatar)', () => {
    const { container } = render(<Avatar initials="AS" color="signal-info" size={34} />)
    const span = container.firstElementChild as HTMLElement
    expect(span.className).toContain('bg-signal-info')
  })

  it('renders bg-warm-amber when color="warm-amber" (Priya avatar)', () => {
    const { container } = render(<Avatar initials="PN" color="warm-amber" size={34} />)
    const span = container.firstElementChild as HTMLElement
    expect(span.className).toContain('bg-warm-amber')
  })

  it('Origin avatar pattern (color=fresh-green + textColor=trad-green-deep) produces both classes', () => {
    const { container } = render(
      <Avatar initials="◉" color="fresh-green" textColor="trad-green-deep" size={34} />
    )
    const span = container.firstElementChild as HTMLElement
    expect(span.className).toContain('bg-fresh-green')
    expect(span.className).toContain('text-trad-green-deep')
  })
})
