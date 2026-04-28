import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import type { Activity, ActorType } from '@/types/origin'
import { ActivityFeed } from '@/components/journey/ActivityFeed'

function makeActivity(overrides: Partial<Activity>): Activity {
  return {
    id: 'act-kaisei-000',
    applicationId: 'app-kaisei',
    actorType: 'system' as ActorType,
    actorId: null,
    eventType: 'activation_pending',
    payload: {},
    createdAt: '2026-04-26T07:00:00Z',
    ...overrides,
  }
}

const KAISEI_13: Activity[] = [
  makeActivity({ id: 'act-kaisei-001', actorType: 'rm',     actorId: 'rm-james',     eventType: 'invite_sent',          createdAt: '2026-03-25T08:00:00Z' }),
  makeActivity({ id: 'act-kaisei-002', actorType: 'client', actorId: 'client-yuki',  eventType: 'intake_submitted',     createdAt: '2026-03-26T09:45:00Z' }),
  makeActivity({ id: 'act-kaisei-003', actorType: 'ai',     actorId: null,           eventType: 'entity_discovered',    createdAt: '2026-04-04T11:00:00Z' }),
  makeActivity({ id: 'act-kaisei-004', actorType: 'ai',     actorId: null,           eventType: 'ubo_discovered',       createdAt: '2026-04-08T13:45:00Z' }),
  makeActivity({ id: 'act-kaisei-005', actorType: 'rm',     actorId: 'rm-james',     eventType: 'structure_approved',   createdAt: '2026-04-08T14:00:00Z' }),
  makeActivity({ id: 'act-kaisei-006', actorType: 'client', actorId: 'client-yuki',  eventType: 'doc_uploaded',         createdAt: '2026-04-15T14:20:00Z' }),
  makeActivity({ id: 'act-kaisei-007', actorType: 'ai',     actorId: null,           eventType: 'doc_extracted',        createdAt: '2026-04-15T14:24:00Z' }),
  makeActivity({ id: 'act-kaisei-008', actorType: 'client', actorId: 'client-yuki',  eventType: 'doc_uploaded',         createdAt: '2026-04-16T09:00:00Z' }),
  makeActivity({ id: 'act-kaisei-009', actorType: 'system', actorId: 'system',       eventType: 'doc_rejected',         createdAt: '2026-04-09T10:05:00Z' }),
  makeActivity({ id: 'act-kaisei-010', actorType: 'ai',     actorId: null,           eventType: 'screening_complete',   createdAt: '2026-04-09T10:30:00Z' }),
  makeActivity({ id: 'act-kaisei-011', actorType: 'ai',     actorId: null,           eventType: 'memo_section_drafted', createdAt: '2026-04-22T16:00:00Z' }),
  makeActivity({ id: 'act-kaisei-012', actorType: 'ai',     actorId: null,           eventType: 'memo_section_drafted', createdAt: '2026-04-22T16:08:00Z' }),
  makeActivity({ id: 'act-kaisei-013', actorType: 'system', actorId: 'system',       eventType: 'activation_pending',   createdAt: '2026-04-26T07:00:00Z' }),
]

describe('ActivityFeed — header (D-27)', () => {
  it('renders "RECENT ACTIVITY" eyebrow + "LAST 72H" mono tag', () => {
    const { container } = render(<ActivityFeed activities={KAISEI_13} />)
    expect(container.textContent).toContain('Recent activity')
    expect(container.textContent).toContain('LAST 72H')
  })
})

describe('ActivityFeed — top-6 truncation + sort (D-29)', () => {
  it('renders exactly 6 ActivityRow elements', () => {
    const { container } = render(<ActivityFeed activities={KAISEI_13} />)
    const rows = container.querySelectorAll('[class*="border-b"][class*="border-mist"]')
    expect(rows.length).toBe(6)
  })

  it('first row is most recent (act-kaisei-013, system, 2026-04-26)', () => {
    const { container } = render(<ActivityFeed activities={KAISEI_13} />)
    // act-kaisei-013 actor "System", same-day relative to SERVER_DEMO_DATE 2026-04-27 → "Yesterday"
    expect(container.textContent).toMatch(/Yesterday[\s\S]*System/)
  })
})

describe('ActivityFeed — indicator dot colors (D-27 / CJD-07)', () => {
  it('AI rows have fresh-green dot', () => {
    const { container } = render(<ActivityFeed activities={KAISEI_13} />)
    const dots = Array.from(container.querySelectorAll('span[aria-hidden="true"][class*="rounded-full"]')) as HTMLElement[]
    const freshDots = dots.filter(d => d.style.background === 'var(--color-fresh-green)')
    // Top-6 includes act-kaisei-013 (system), 012 (ai), 011 (ai), 008 (client), 007 (ai), 006 (client)
    // → 3 AI dots
    expect(freshDots.length).toBe(3)
  })

  it('RM-only fixture renders signal-info dot', () => {
    const rmOnly: Activity[] = [makeActivity({ id: 'rm1', actorType: 'rm', actorId: 'rm-james', eventType: 'structure_approved', createdAt: '2026-04-26T12:00:00Z' })]
    const { container } = render(<ActivityFeed activities={rmOnly} />)
    const dot = container.querySelector('span[aria-hidden="true"][class*="rounded-full"]') as HTMLElement
    expect(dot.style.background).toBe('var(--color-signal-info)')
  })

  it('client/system rows have ink-muted dot', () => {
    const sysOnly: Activity[] = [makeActivity({ id: 's1', actorType: 'system', actorId: 'system', eventType: 'activation_pending', createdAt: '2026-04-26T12:00:00Z' })]
    const { container } = render(<ActivityFeed activities={sysOnly} />)
    const dot = container.querySelector('span[aria-hidden="true"][class*="rounded-full"]') as HTMLElement
    expect(dot.style.background).toBe('var(--color-ink-muted)')
  })
})

describe('ActivityFeed — actor display (D-27)', () => {
  it('AI rows show "Origin" actor', () => {
    const { container } = render(<ActivityFeed activities={KAISEI_13} />)
    expect(container.textContent).toContain('Origin')
  })

  it('RM rows show "James Lee" actor', () => {
    const rmOnly: Activity[] = [makeActivity({ id: 'rm1', actorType: 'rm', actorId: 'rm-james', eventType: 'structure_approved', createdAt: '2026-04-26T12:00:00Z' })]
    const { container: c2 } = render(<ActivityFeed activities={rmOnly} />)
    expect(c2.textContent).toContain('James Lee')
  })

  it('client rows show "Yuki Tanaka" actor', () => {
    const clientOnly: Activity[] = [makeActivity({ id: 'c1', actorType: 'client', actorId: 'client-yuki', eventType: 'doc_uploaded', createdAt: '2026-04-26T12:00:00Z' })]
    const { container } = render(<ActivityFeed activities={clientOnly} />)
    expect(container.textContent).toContain('Yuki Tanaka')
  })
})

describe('ActivityFeed — strict P-1 inert', () => {
  it('contains no <a> or <button> elements', () => {
    const { container } = render(<ActivityFeed activities={KAISEI_13} />)
    expect(container.querySelectorAll('a').length).toBe(0)
    expect(container.querySelectorAll('button').length).toBe(0)
  })

  it('does not apply cursor-pointer', () => {
    const { container } = render(<ActivityFeed activities={KAISEI_13} />)
    expect(container.innerHTML).not.toMatch(/cursor-pointer/)
  })
})

describe('ActivityFeed — fresh-green negative grep (defensive)', () => {
  it('outerHTML has no bg-fresh-green or text-fresh-green Tailwind tokens', () => {
    const { container } = render(<ActivityFeed activities={KAISEI_13} />)
    expect(container.innerHTML).not.toMatch(/\bbg-fresh-green\b/)
    expect(container.innerHTML).not.toMatch(/\btext-fresh-green\b/)
  })
})
