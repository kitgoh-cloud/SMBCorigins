// components/journey/TeamCard.test.tsx — Phase 5 redo CJD-06 tests.
//
// Verifies: header eyebrow; 4 members rendered in canonical order (James,
// Akiko, Priya, Origin); role · location verbatim; Avatar colors per member
// (D-24); Origin is fresh-green + trad-green-deep text and is the ONLY
// fresh-green Avatar; James matches rm.displayName (catches RM/seed drift);
// "Message James" button is disabled / aria-disabled / no <a> wrapper /
// W-01 transition + focus classes. OD5R-04 (strict inert), OD5R-05 (closed
// enum), OD5R-06 (constant for v1).

import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import type { User } from '@/types/origin'
import { TeamCard } from '@/components/journey/TeamCard'

function makeRM(overrides: Partial<User> = {}): User {
  return {
    id: 'rm-james',
    role: 'rm',
    displayName: 'James Lee',
    email: 'james.lee@smbc.com',
    avatarUrl: null,
    orgId: null,
    createdAt: '2025-01-15T08:00:00Z',
    updatedAt: '2025-01-15T08:00:00Z',
    ...overrides,
  }
}

describe('TeamCard — header (D-23)', () => {
  it('renders "Your team" eyebrow', () => {
    const { container } = render(<TeamCard rm={makeRM()} />)
    expect(container.textContent).toContain('Your team')
  })
})

describe('TeamCard — 4 members (D-23)', () => {
  it('renders all 4 member names in canonical order', () => {
    const { container } = render(<TeamCard rm={makeRM()} />)
    const text = container.textContent ?? ''
    const idxJames = text.indexOf('James Lee')
    const idxAkiko = text.indexOf('Akiko Sato')
    const idxPriya = text.indexOf('Priya Nair')
    const idxOrigin = text.indexOf('Origin')
    expect(idxJames).toBeGreaterThan(-1)
    expect(idxAkiko).toBeGreaterThan(idxJames)
    expect(idxPriya).toBeGreaterThan(idxAkiko)
    expect(idxOrigin).toBeGreaterThan(idxPriya)
  })

  it('renders role · location for each member', () => {
    const { container } = render(<TeamCard rm={makeRM()} />)
    expect(container.textContent).toContain('Relationship Manager · SMBC Singapore')
    expect(container.textContent).toContain('Credit Analyst · SMBC Tokyo')
    expect(container.textContent).toContain('KYC Operations Lead · SMBC Singapore')
    expect(container.textContent).toContain('AI orchestrator · —')
  })

  it('TEAM_MEMBERS[0] (James Lee) matches rm.displayName', () => {
    // Defensive — catches divergence if seed/RM data shifts
    const { container } = render(<TeamCard rm={makeRM({ displayName: 'James Lee' })} />)
    expect(container.textContent).toContain('James Lee')
  })
})

describe('TeamCard — Avatar colors (D-24, OD5R-05)', () => {
  it('James avatar is trad-green-soft', () => {
    const { container } = render(<TeamCard rm={makeRM()} />)
    const jamesAvatar = container.querySelector('.bg-trad-green-soft')
    expect(jamesAvatar).not.toBeNull()
    expect(jamesAvatar?.textContent).toBe('JL')
  })

  it('Akiko avatar is signal-info', () => {
    const { container } = render(<TeamCard rm={makeRM()} />)
    const akikoAvatar = container.querySelector('.bg-signal-info')
    expect(akikoAvatar).not.toBeNull()
    expect(akikoAvatar?.textContent).toBe('AS')
  })

  it('Priya avatar is warm-amber', () => {
    const { container } = render(<TeamCard rm={makeRM()} />)
    const priyaAvatar = container.querySelector('.bg-warm-amber')
    expect(priyaAvatar).not.toBeNull()
    expect(priyaAvatar?.textContent).toBe('PN')
  })

  it('Origin avatar is fresh-green with trad-green-deep text (the ONLY fresh-green Avatar)', () => {
    const { container } = render(<TeamCard rm={makeRM()} />)
    const originAvatar = container.querySelector('.bg-fresh-green')
    expect(originAvatar).not.toBeNull()
    expect(originAvatar?.textContent).toBe('◉')
    expect(originAvatar?.className).toContain('text-trad-green-deep')
  })

  it('contains exactly one fresh-green Avatar (Origin only)', () => {
    const { container } = render(<TeamCard rm={makeRM()} />)
    const freshAvatars = container.querySelectorAll('.bg-fresh-green')
    expect(freshAvatars.length).toBe(1)
  })
})

describe('TeamCard — "Message James" button (D-26, OD5R-04)', () => {
  it('renders a button with text "Message James" and a mail icon', () => {
    const { container } = render(<TeamCard rm={makeRM()} />)
    const btn = container.querySelector('button')
    expect(btn).not.toBeNull()
    expect(btn?.textContent).toContain('Message James')
    expect(btn?.querySelector('svg')).not.toBeNull()
  })

  it('button is disabled (P-1 strict inert)', () => {
    const { container } = render(<TeamCard rm={makeRM()} />)
    const btn = container.querySelector('button') as HTMLButtonElement
    expect(btn.disabled).toBe(true)
    expect(btn.getAttribute('aria-disabled')).toBe('true')
  })

  it('button has no <a> wrapper (no mailto leak)', () => {
    const { container } = render(<TeamCard rm={makeRM()} />)
    const a = container.querySelector('a')
    expect(a).toBeNull()
  })

  it('button has W-01 transition + focus classes (visible affordance even when disabled)', () => {
    const { container } = render(<TeamCard rm={makeRM()} />)
    const btn = container.querySelector('button') as HTMLButtonElement
    expect(btn.className).toContain('transition-colors')
    expect(btn.className).toContain('duration-200')
    expect(btn.className).toContain('ease-out')
    expect(btn.className).toContain('focus-visible:outline-2')
    expect(btn.className).toContain('focus-visible:outline-offset-2')
    expect(btn.className).toContain('focus-visible:outline-trad-green')
  })
})

describe('TeamCard — fresh-green discipline', () => {
  it('Origin avatar is the ONLY fresh-green surface (no leakage to text/button/etc.)', () => {
    const { container } = render(<TeamCard rm={makeRM()} />)
    // Strip the Origin avatar and verify outer DOM has no fresh-green tokens
    const root = container.firstElementChild as Element
    const clone = root.cloneNode(true) as Element
    const origins = clone.querySelectorAll('.bg-fresh-green')
    for (const el of Array.from(origins)) el.parentElement?.removeChild(el)
    expect(clone.innerHTML).not.toMatch(/\bbg-fresh-green\b/)
    expect(clone.innerHTML).not.toMatch(/\btext-fresh-green\b/)
  })
})
