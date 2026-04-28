/**
 * lib/cjd.test.ts — Tests for the Phase 5 (REDO) Client Journey Dashboard
 * helper module. Co-located with `lib/cjd.ts`. Covers:
 *
 *   - SERVER_DEMO_DATE literal (D-12)
 *   - formatReiwa: SERVER_DEMO_DATE + Reiwa year 1 boundary
 *   - formatBusinessDaysAhead: weekday + weekend-skipping (OD5R-02b)
 *   - stageStatusToPillState: all 4 StageStatus inputs
 *   - eventToCopy: ALL 13 act-kaisei-* IDs (verbatim D-28 strings) + fallback
 *   - eventToActorDisplay: all 4 ActorType values
 *   - eventToDotColor: all 4 ActorType values
 *   - formatActivityRelativeTime: same-day / yesterday / older
 *   - topNActivities: sort + slice using the 13 Kaisei events
 *   - computeDaysIn: Kaisei opened → SERVER_DEMO_DATE = 33 days
 *   - STAGE_3_ATTENTION_ITEMS, STAGE_3_AI_TASKS, TEAM_MEMBERS,
 *     PRODUCT_DISPLAY_LABEL, JURISDICTION_FLAG locked-content shape
 */

import { describe, it, expect } from 'vitest'
import {
  SERVER_DEMO_DATE,
  formatReiwa,
  formatBusinessDaysAhead,
  stageStatusToPillState,
  eventToCopy,
  eventToActorDisplay,
  eventToDotColor,
  formatActivityRelativeTime,
  topNActivities,
  computeDaysIn,
  STAGE_3_ATTENTION_ITEMS,
  STAGE_3_AI_TASKS,
  TEAM_MEMBERS,
  PRODUCT_DISPLAY_LABEL,
  JURISDICTION_FLAG,
} from '@/lib/cjd'
import type { Activity, ActorType, ProductType, StageStatus } from '@/types/origin'

// Fixture helper — concise builder for synthetic Activity rows in tests.
function activity(
  id: string,
  actorType: ActorType,
  createdAt: string,
  eventType = 'unit_test',
): Activity {
  return {
    id,
    applicationId: 'app-kaisei',
    actorType,
    actorId: null,
    eventType,
    payload: {},
    createdAt,
  }
}

describe('SERVER_DEMO_DATE (D-12)', () => {
  it('is exactly 2026-04-27T00:00:00Z', () => {
    expect(SERVER_DEMO_DATE.toISOString()).toBe('2026-04-27T00:00:00.000Z')
  })

  it('is a Monday (UTC) — anchors the formatBusinessDaysAhead boundary tests', () => {
    expect(SERVER_DEMO_DATE.getUTCDay()).toBe(1)
  })
})

describe('formatReiwa', () => {
  it('formats SERVER_DEMO_DATE as 令和8年4月27日', () => {
    expect(formatReiwa(SERVER_DEMO_DATE)).toBe('令和8年4月27日')
  })

  it('formats 2019-05-01 as 令和1年5月1日 (Reiwa year 1 boundary)', () => {
    expect(formatReiwa(new Date('2019-05-01T00:00:00Z'))).toBe('令和1年5月1日')
  })

  it('formats a single-digit-day date with no zero-padding', () => {
    // 2026-01-03 → 令和8年1月3日 (no leading zeros on month or day)
    expect(formatReiwa(new Date('2026-01-03T00:00:00Z'))).toBe('令和8年1月3日')
  })
})

describe('formatBusinessDaysAhead (OD5R-02b)', () => {
  it('SERVER_DEMO_DATE + 2 business days → "29 April 2026" (Mon → Wed)', () => {
    expect(formatBusinessDaysAhead(SERVER_DEMO_DATE, 2)).toBe('29 April 2026')
  })

  it('Friday + 2 business days skips the weekend (Fri 2026-05-01 → Tue 2026-05-05)', () => {
    expect(formatBusinessDaysAhead(new Date('2026-05-01T00:00:00Z'), 2)).toBe(
      '5 May 2026',
    )
  })

  it('Friday + 1 business day skips Sat/Sun (Fri 2026-05-01 → Mon 2026-05-04)', () => {
    expect(formatBusinessDaysAhead(new Date('2026-05-01T00:00:00Z'), 1)).toBe(
      '4 May 2026',
    )
  })

  it('businessDays = 0 returns the input day formatted (no slide)', () => {
    expect(formatBusinessDaysAhead(SERVER_DEMO_DATE, 0)).toBe('27 April 2026')
  })

  it('does not mutate the input Date', () => {
    const before = SERVER_DEMO_DATE.toISOString()
    formatBusinessDaysAhead(SERVER_DEMO_DATE, 5)
    expect(SERVER_DEMO_DATE.toISOString()).toBe(before)
  })
})

describe('stageStatusToPillState', () => {
  it.each<[StageStatus, string]>([
    ['complete', 'done'],
    ['in_progress', 'current'],
    ['not_started', 'upcoming'],
    ['blocked', 'upcoming'],
  ])('maps %s → %s', (status, expected) => {
    expect(stageStatusToPillState(status)).toBe(expected)
  })
})

describe('eventToCopy (D-28 verbatim)', () => {
  // All 13 act-kaisei-* IDs covered verbatim from the archive map.
  const cases: Array<[string, string]> = [
    ['act-kaisei-001', 'James sent your onboarding invitation.'],
    [
      'act-kaisei-002',
      'You submitted your application — Singapore, Hong Kong, UK; accounts, cash management, trade finance, credit.',
    ],
    ['act-kaisei-003', 'Origin found 5 entities across your group structure.'],
    [
      'act-kaisei-004',
      'Origin unwrapped a BVI shell and found 4 beneficial owners through Tanaka Family Trust.',
    ],
    [
      'act-kaisei-005',
      'James approved your group structure — 6 entities, 7 owners verified.',
    ],
    ['act-kaisei-006', 'You uploaded your 2024 audited financials.'],
    [
      'act-kaisei-007',
      'Origin extracted structured fields from your 2024 audited financials. 94% confidence.',
    ],
    [
      'act-kaisei-008',
      'You uploaded the certificate of incorporation for Kaisei Asia Pacific.',
    ],
    [
      'act-kaisei-009',
      'Your previous Singapore COI was older than 6 months — please re-upload.',
    ],
    [
      'act-kaisei-010',
      'Origin completed screening on 7 subjects — 6 cleared, 1 escalated to James for review.',
    ],
    [
      'act-kaisei-011',
      'Origin drafted the executive summary section of your credit memo. 91% confidence.',
    ],
    [
      'act-kaisei-012',
      'Origin drafted the recommendation section of your credit memo. 88% confidence.',
    ],
    [
      'act-kaisei-013',
      "Activation is pending James's final memo approval.",
    ],
  ]

  it.each(cases)('returns locked copy for %s', (id, expected) => {
    const e = activity(id, 'ai', '2026-04-27T00:00:00Z')
    expect(eventToCopy(e)).toBe(expected)
  })

  it('falls back to "{eventType} ({actorType})" for unknown ID', () => {
    const e = activity('act-unknown-xyz', 'rm', '2026-04-27T00:00:00Z', 'mystery_event')
    expect(eventToCopy(e)).toBe('mystery_event (rm)')
  })
})

describe('eventToActorDisplay', () => {
  it.each<[ActorType, string]>([
    ['ai', 'Origin'],
    ['rm', 'James Lee'],
    ['client', 'Yuki Tanaka'],
    ['system', 'System'],
  ])('actorType=%s → %s', (actorType, expected) => {
    expect(eventToActorDisplay(activity('x', actorType, '2026-04-27T00:00:00Z'))).toBe(
      expected,
    )
  })
})

describe('eventToDotColor', () => {
  it.each<[ActorType, string]>([
    ['ai', 'var(--color-fresh-green)'],
    ['rm', 'var(--color-signal-info)'],
    ['client', 'var(--color-ink-muted)'],
    ['system', 'var(--color-ink-muted)'],
  ])('actorType=%s → %s', (actorType, expected) => {
    expect(eventToDotColor(activity('x', actorType, '2026-04-27T00:00:00Z'))).toBe(
      expected,
    )
  })
})

describe('formatActivityRelativeTime (D-30)', () => {
  it('same UTC day → "HH:mm UTC" with zero-padding', () => {
    expect(formatActivityRelativeTime('2026-04-27T09:14:00Z', SERVER_DEMO_DATE)).toBe(
      '09:14 UTC',
    )
  })

  it('zero-pads single-digit minutes', () => {
    expect(formatActivityRelativeTime('2026-04-27T07:05:00Z', SERVER_DEMO_DATE)).toBe(
      '07:05 UTC',
    )
  })

  it('1 day before SERVER_DEMO_DATE → "Yesterday"', () => {
    expect(formatActivityRelativeTime('2026-04-26T07:00:00Z', SERVER_DEMO_DATE)).toBe(
      'Yesterday',
    )
  })

  it('5 days before → "Apr 22" (en-US MMM dd)', () => {
    expect(formatActivityRelativeTime('2026-04-22T16:08:00Z', SERVER_DEMO_DATE)).toBe(
      'Apr 22',
    )
  })

  it('33 days before (Kaisei openedAt) → "Mar 25"', () => {
    expect(formatActivityRelativeTime('2026-03-25T08:00:00Z', SERVER_DEMO_DATE)).toBe(
      'Mar 25',
    )
  })
})

describe('topNActivities (D-29)', () => {
  // Synthesize the 13 Kaisei activity timestamps in seed order; the helper
  // must return them in descending createdAt order.
  const fixtures: Activity[] = [
    activity('act-kaisei-001', 'rm', '2026-03-25T08:00:00Z'),
    activity('act-kaisei-002', 'client', '2026-03-26T09:45:00Z'),
    activity('act-kaisei-003', 'ai', '2026-04-04T11:00:00Z'),
    activity('act-kaisei-004', 'ai', '2026-04-08T13:45:00Z'),
    activity('act-kaisei-005', 'rm', '2026-04-08T14:00:00Z'),
    activity('act-kaisei-006', 'client', '2026-04-15T14:20:00Z'),
    activity('act-kaisei-007', 'ai', '2026-04-15T14:24:00Z'),
    activity('act-kaisei-008', 'client', '2026-04-16T09:00:00Z'),
    activity('act-kaisei-009', 'system', '2026-04-09T10:05:00Z'),
    activity('act-kaisei-010', 'ai', '2026-04-09T10:30:00Z'),
    activity('act-kaisei-011', 'ai', '2026-04-22T16:00:00Z'),
    activity('act-kaisei-012', 'ai', '2026-04-22T16:08:00Z'),
    activity('act-kaisei-013', 'system', '2026-04-26T07:00:00Z'),
  ]

  it('returns 6 most recent in descending createdAt order', () => {
    const top6 = topNActivities(fixtures, 6)
    expect(top6).toHaveLength(6)
    expect(top6.map((a) => a.id)).toEqual([
      'act-kaisei-013', // 2026-04-26
      'act-kaisei-012', // 2026-04-22 16:08
      'act-kaisei-011', // 2026-04-22 16:00
      'act-kaisei-008', // 2026-04-16
      'act-kaisei-007', // 2026-04-15 14:24
      'act-kaisei-006', // 2026-04-15 14:20
    ])
  })

  it('does not mutate the input array', () => {
    const before = fixtures.map((a) => a.id)
    topNActivities(fixtures, 6)
    expect(fixtures.map((a) => a.id)).toEqual(before)
  })

  it('handles n > activities.length by returning all events', () => {
    expect(topNActivities(fixtures, 100)).toHaveLength(13)
  })

  it('returns [] for n = 0', () => {
    expect(topNActivities(fixtures, 0)).toEqual([])
  })
})

describe('computeDaysIn', () => {
  it('Kaisei opened 2026-03-25 → SERVER_DEMO_DATE = 33 days', () => {
    expect(computeDaysIn('2026-03-25T08:00:00Z', SERVER_DEMO_DATE)).toBe(33)
  })

  it('same day → 0', () => {
    expect(computeDaysIn('2026-04-27T00:00:00Z', SERVER_DEMO_DATE)).toBe(0)
  })
})

describe('STAGE_3_ATTENTION_ITEMS (D-19)', () => {
  it('has exactly 3 items in canonical order', () => {
    expect(STAGE_3_ATTENTION_ITEMS).toHaveLength(3)
    expect(STAGE_3_ATTENTION_ITEMS.map((i) => i.id)).toEqual([
      'attn-coi-uk',
      'attn-sow-tanaka',
      'attn-hk-dirs',
    ])
  })

  it('locks the UK COI title + meta', () => {
    const uk = STAGE_3_ATTENTION_ITEMS[0]!
    expect(uk.title).toBe('Upload Kaisei Europe — Certificate of Incorporation')
    expect(uk.meta).toBe('Required · UK jurisdiction · due Apr 28')
  })

  it('locks the Tanaka source-of-wealth row', () => {
    const sow = STAGE_3_ATTENTION_ITEMS[1]!
    expect(sow.title).toBe('Attest source-of-wealth — Tanaka Family Trust')
    expect(sow.meta).toBe('Template ready · 4 beneficiaries')
  })

  it('locks the HK directors row', () => {
    const hk = STAGE_3_ATTENTION_ITEMS[2]!
    expect(hk.title).toBe('Confirm directors on HK application')
    expect(hk.meta).toBe('Pre-filled by Origin from Singapore — review and submit')
  })
})

describe('STAGE_3_AI_TASKS (D-21)', () => {
  it('has 3 tasks in canonical state order: live, pending, done', () => {
    expect(STAGE_3_AI_TASKS).toHaveLength(3)
    expect(STAGE_3_AI_TASKS.map((t) => t.state)).toEqual([
      'live',
      'pending',
      'done',
    ])
  })

  it('locks the HK extract live task', () => {
    const live = STAGE_3_AI_TASKS[0]!
    expect(live.id).toBe('ai-hk-extract')
    expect(live.text).toBe('Extracting fields from your HK Business Registration')
    expect(live.meta).toBe('29 of ~38 fields · 0.96 confidence')
  })

  it('locks the director cross-reference pending task', () => {
    const pending = STAGE_3_AI_TASKS[1]!
    expect(pending.id).toBe('ai-director-xref')
    expect(pending.text).toBe(
      'Cross-referencing director IDs against all 5 entities',
    )
    expect(pending.meta).toBe('6 of 8 matched')
  })

  it('locks the UK pre-fill done task', () => {
    const done = STAGE_3_AI_TASKS[2]!
    expect(done.id).toBe('ai-uk-prefill')
    expect(done.text).toBe('Pre-filled your UK application using Singapore filing')
    expect(done.meta).toBe('12 fields carried across · 1 min ago')
  })
})

describe('TEAM_MEMBERS (D-23, OD5R-06)', () => {
  it('has 4 members in canonical order: James, Akiko, Priya, Origin', () => {
    expect(TEAM_MEMBERS).toHaveLength(4)
    expect(TEAM_MEMBERS.map((m) => m.name)).toEqual([
      'James Lee',
      'Akiko Sato',
      'Priya Nair',
      'Origin',
    ])
  })

  it('James entry is the RM in Singapore (trad-green-soft on paper)', () => {
    const james = TEAM_MEMBERS[0]!
    expect(james.role).toBe('Relationship Manager')
    expect(james.location).toBe('SMBC Singapore')
    expect(james.initials).toBe('JL')
    expect(james.color).toBe('trad-green-soft')
    expect(james.textColor).toBe('paper')
  })

  it('Akiko Sato is the Tokyo credit analyst (signal-info background)', () => {
    const akiko = TEAM_MEMBERS[1]!
    expect(akiko.role).toBe('Credit Analyst')
    expect(akiko.location).toBe('SMBC Tokyo')
    expect(akiko.initials).toBe('AS')
    expect(akiko.color).toBe('signal-info')
    expect(akiko.textColor).toBe('paper')
  })

  it('Priya Nair is the Singapore KYC ops lead (warm-amber background)', () => {
    const priya = TEAM_MEMBERS[2]!
    expect(priya.role).toBe('KYC Operations Lead')
    expect(priya.location).toBe('SMBC Singapore')
    expect(priya.initials).toBe('PN')
    expect(priya.color).toBe('warm-amber')
    expect(priya.textColor).toBe('paper')
  })

  it('Origin entry uses fresh-green avatar with trad-green-deep text', () => {
    const origin = TEAM_MEMBERS[3]!
    expect(origin.name).toBe('Origin')
    expect(origin.role).toBe('AI orchestrator')
    expect(origin.location).toBe('—')
    expect(origin.initials).toBe('◉')
    expect(origin.color).toBe('fresh-green')
    expect(origin.textColor).toBe('trad-green-deep')
  })
})

describe('PRODUCT_DISPLAY_LABEL (D-10)', () => {
  it('has entries for all 5 ProductType values', () => {
    expect(Object.keys(PRODUCT_DISPLAY_LABEL).sort()).toEqual([
      'accounts',
      'cash_management',
      'credit',
      'fx',
      'trade_finance',
    ])
  })

  it.each<[ProductType, string, string]>([
    ['accounts', 'Accounts', 'Multi-currency operating accounts'],
    [
      'cash_management',
      'Cash management',
      'Multi-currency accounts across JP / SG / HK / UK',
    ],
    ['fx', 'FX & hedging', 'Forward and option lines'],
    [
      'trade_finance',
      'Trade finance',
      'LC issuance, supply chain finance — SG + HK',
    ],
    [
      'credit',
      'Revolving credit facility',
      'USD 50M, 3-year tenor, uncommitted pricing grid',
    ],
  ])('%s entry locks label + detail', (key, label, detail) => {
    expect(PRODUCT_DISPLAY_LABEL[key].label).toBe(label)
    expect(PRODUCT_DISPLAY_LABEL[key].detail).toBe(detail)
  })
})

describe('JURISDICTION_FLAG (D-11)', () => {
  it('has flags for JP, SG, HK, GB (Kaisei seed minimum)', () => {
    expect(JURISDICTION_FLAG.JP).toBe('🇯🇵')
    expect(JURISDICTION_FLAG.SG).toBe('🇸🇬')
    expect(JURISDICTION_FLAG.HK).toBe('🇭🇰')
    expect(JURISDICTION_FLAG.GB).toBe('🇬🇧')
  })

  it('includes US + CN for forward-compat', () => {
    expect(JURISDICTION_FLAG.US).toBe('🇺🇸')
    expect(JURISDICTION_FLAG.CN).toBe('🇨🇳')
  })
})
