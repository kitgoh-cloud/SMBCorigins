// lib/cjd.ts — Phase 5 (REDO) Client Journey Dashboard helper module.
//
// Pure synchronous helpers + view-layer adapters consumed by components/journey/*
// compositions. No React, no DOM, no async. Mirrors lib/persona.ts shape per Phase
// 4 D-66 (chrome decoupled from lib/api.mock.ts).
//
// Decisions covered:
//   D-04 (watermark trad-green; not relevant to module surface but motivates D-31)
//   D-09 (static "29 April 2026" ETA; underlies formatBusinessDaysAhead)
//   D-12 (SERVER_DEMO_DATE — server-stable demo date, prevents SSR hydration drift)
//   D-15 ("47 fields" static; underlies the page-level greeting copy)
//   D-19 (STAGE_3_ATTENTION_ITEMS locked Stage 3 demo data)
//   D-21 (STAGE_3_AI_TASKS locked Stage 3 demo data)
//   D-23 (TEAM_MEMBERS constant; OD5R-06 v1 escape hatch)
//   D-27 (ActivityFeed row shape: Time · Indicator · Actor — text)
//   D-28 (eventToCopy verbatim carryforward from archive)
//   D-29 (top-6 truncation: topNActivities)
//   D-30 (formatActivityRelativeTime: HH:mm UTC / Yesterday / MMM dd)
//   D-31 (this module's surface — see <exports> in 05-01-PLAN.md)
//   OD5R-02b (slide-the-window business-day formatter)
//   OD5R-03 (47 fields static via constants — no derivation in v1)
//   OD5R-06 (TEAM_MEMBERS as constant for v1; Phase 6 migration tracked in CONTEXT)
//
// `TEAM_MEMBERS` references AvatarColor values `'signal-info'`, `'warm-amber'`,
// and `'fresh-green'` that Plan 05-02 added to the AvatarColor closed enum in
// components/primitives/Avatar.tsx (D-24, OD5R-05). Literals satisfy the union
// directly; the transient `as AvatarColor` casts from Plan 05-01 are removed.

import type { Activity, ProductType, StageStatus } from '@/types/origin'
import type { AvatarColor, StagePillState } from '@/components/primitives'

// ---------------------------------------------------------------------------
// 1. Server-stable demo date (D-12)
// ---------------------------------------------------------------------------

/**
 * Server-stable demo date — locks the dashboard to 2026-04-27 so Reiwa
 * formatting, Gregorian formatting, "In progress: N days", and the "29 April
 * 2026" ETA are all stable across SSR + client renders. Consumers MUST NOT
 * mutate this value (Date instances are not deep-frozen by JS).
 */
export const SERVER_DEMO_DATE: Date = new Date('2026-04-27T00:00:00Z')

// ---------------------------------------------------------------------------
// 2. Reiwa formatter — ports prototype `77ddc8bb.js:154-160`
// ---------------------------------------------------------------------------

/**
 * Format a Date as Reiwa-era Japanese: `令和Y年M月D日` (no zero-padding).
 * Reiwa year = Gregorian year - 2018. Year 1 = 2019. SERVER_DEMO_DATE is
 * Reiwa year 8 (2026). Uses UTC components so the result is hydration-stable.
 */
export function formatReiwa(date: Date): string {
  const year = date.getUTCFullYear() - 2018
  const month = date.getUTCMonth() + 1
  const day = date.getUTCDate()
  return `令和${year}年${month}月${day}日`
}

// ---------------------------------------------------------------------------
// 3. Business-day formatter — OD5R-02b slide-the-window
// ---------------------------------------------------------------------------

const EN_GB_DATE_FMT = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
})

/**
 * Add N business days to `from`, skipping Saturdays and Sundays. Returns the
 * resulting date formatted in en-GB long form (e.g. `"29 April 2026"`).
 *
 * Boundary semantics:
 *   - `from` is the starting day; the result is `from` + `businessDays`
 *     business days. If `businessDays === 0` the result is `from` itself.
 *   - Weekend days encountered during the walk do NOT count toward
 *     `businessDays`.
 *   - For SERVER_DEMO_DATE (Mon 2026-04-27) + 2 → Wed 2026-04-29.
 *   - For Fri 2026-05-01 + 2 → skips Sat/Sun → Mon 2026-05-04 (1st BD)
 *     → Tue 2026-05-05 (2nd BD) → returns "5 May 2026".
 */
export function formatBusinessDaysAhead(from: Date, businessDays: number): string {
  // Work in UTC to keep the slide hydration-stable.
  const cursor = new Date(from.getTime())
  let added = 0
  while (added < businessDays) {
    cursor.setUTCDate(cursor.getUTCDate() + 1)
    const dow = cursor.getUTCDay()
    if (dow !== 0 && dow !== 6) {
      added += 1
    }
  }
  return EN_GB_DATE_FMT.format(cursor)
}

// ---------------------------------------------------------------------------
// 4. Stage adapter — StageStatus → StagePillState
// ---------------------------------------------------------------------------

/**
 * Map an `Application.stages[].status` enum value into the visual pill state
 * the StagePill primitive renders. Defensive default: `'blocked'` maps to
 * `'upcoming'` (not `'current'`) so a stuck stage does not visually claim
 * to be in progress.
 */
export function stageStatusToPillState(status: StageStatus): StagePillState {
  switch (status) {
    case 'complete':
      return 'done'
    case 'in_progress':
      return 'current'
    case 'not_started':
      return 'upcoming'
    case 'blocked':
      return 'upcoming'
  }
}

// ---------------------------------------------------------------------------
// 5. Activity adapters
// ---------------------------------------------------------------------------

/**
 * Verbatim copy strings keyed by Activity.id for the 13 Kaisei demo events.
 * Carryforward from the Phase 5 archive (D-28) — the strings are stable demo
 * copy and reused unchanged. Source: archive `lib/cjd.ts:64-78`.
 *
 * SECURITY: These strings are LITERAL constants. No template substitution
 * from `event.payload` happens here, so the Tampering threat T-05R-01 is
 * mitigated at the data layer (verbatim lookup) and React auto-escaping
 * handles JSX rendering downstream.
 */
const COPY_BY_ACTIVITY_ID: Readonly<Record<string, string>> = Object.freeze({
  'act-kaisei-001': 'James sent your onboarding invitation.',
  'act-kaisei-002':
    'You submitted your application — Singapore, Hong Kong, UK; accounts, cash management, trade finance, credit.',
  'act-kaisei-003': 'Origin found 5 entities across your group structure.',
  'act-kaisei-004':
    'Origin unwrapped a BVI shell and found 4 beneficial owners through Tanaka Family Trust.',
  'act-kaisei-005':
    'James approved your group structure — 6 entities, 7 owners verified.',
  'act-kaisei-006': 'You uploaded your 2024 audited financials.',
  'act-kaisei-007':
    'Origin extracted structured fields from your 2024 audited financials. 94% confidence.',
  'act-kaisei-008':
    'You uploaded the certificate of incorporation for Kaisei Asia Pacific.',
  'act-kaisei-009':
    'Your previous Singapore COI was older than 6 months — please re-upload.',
  'act-kaisei-010':
    'Origin completed screening on 7 subjects — 6 cleared, 1 escalated to James for review.',
  'act-kaisei-011':
    'Origin drafted the executive summary section of your credit memo. 91% confidence.',
  'act-kaisei-012':
    'Origin drafted the recommendation section of your credit memo. 88% confidence.',
  'act-kaisei-013':
    "Activation is pending James's final memo approval.",
})

/**
 * Resolve an Activity to its locked display copy. Falls back to a defensive
 * `${eventType} (${actorType})` rendering for unknown IDs — should never
 * trigger for the seed.
 */
export function eventToCopy(activity: Activity): string {
  return (
    COPY_BY_ACTIVITY_ID[activity.id] ??
    `${activity.eventType} (${activity.actorType})`
  )
}

/**
 * Map an Activity's actor to the display name shown in the ActivityFeed
 * row. Phase 5 hard-codes RM = James and client = Yuki because Kaisei is the
 * only application on the dashboard. A future cockpit-aware variant would
 * resolve actorId → User.displayName via the seed.
 */
export function eventToActorDisplay(activity: Activity): string {
  switch (activity.actorType) {
    case 'ai':
      return 'Origin'
    case 'rm':
      return 'James Lee'
    case 'client':
      return 'Yuki Tanaka'
    case 'system':
      return 'System'
  }
}

/**
 * Map an Activity's actor to the indicator dot color (CSS `var(...)` value
 * for inline `style={{ background }}` use in ActivityRow).
 *
 * NOTE (SHELL-05 / fresh-green allowlist): the literal string
 * `'var(--color-fresh-green)'` matches `scripts/check-fresh-green.sh`
 * patterns 2 + 4. Plan 05-02 adds `lib/cjd.ts` to `.freshgreen-allowlist`.
 * Wave 1 ordering 05-01 → 05-02 is load-bearing for the gate to clear.
 */
export function eventToDotColor(activity: Activity): string {
  switch (activity.actorType) {
    case 'ai':
      return 'var(--color-fresh-green)'
    case 'rm':
      return 'var(--color-signal-info)'
    case 'client':
    case 'system':
      return 'var(--color-ink-muted)'
  }
}

const MMM_DD_FMT = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: '2-digit',
  timeZone: 'UTC',
})

function startOfUtcDay(d: Date): number {
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
}

/**
 * Relative timestamp for an activity row, rendered against `now` (callers
 * pass SERVER_DEMO_DATE for stable demo behavior).
 *
 * Output:
 *   - same UTC day → `"HH:mm UTC"` (zero-padded, hours from `iso`)
 *   - 1 day before  → `"Yesterday"`
 *   - older         → `"MMM dd"` (e.g. `"Apr 22"`, two-digit day)
 *
 * Source: prototype `0a3f3e90.js:101-108` (relative format), with the JST
 * suffix replaced by UTC (D-30 — neutral; no user-timezone concept in v1).
 */
export function formatActivityRelativeTime(iso: string, now: Date): string {
  const parsed = new Date(iso)
  const diffMs = startOfUtcDay(now) - startOfUtcDay(parsed)
  const diffDays = Math.round(diffMs / 86_400_000)
  if (diffDays === 0) {
    const hh = String(parsed.getUTCHours()).padStart(2, '0')
    const mm = String(parsed.getUTCMinutes()).padStart(2, '0')
    return `${hh}:${mm} UTC`
  }
  if (diffDays === 1) {
    return 'Yesterday'
  }
  // en-US "MMM dd" — Intl produces e.g. "Apr 22" with a non-breaking space
  // in some locales; en-US uses a regular space. We normalize defensively.
  return MMM_DD_FMT.format(parsed).replace(/ /g, ' ')
}

/**
 * Top-N activities sorted descending by `createdAt`. Carryforward from the
 * Phase 5 archive (D-29 / archive D-04). Pure — does not mutate the input.
 */
export function topNActivities(
  activities: readonly Activity[],
  n: number,
): Activity[] {
  return [...activities]
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    .slice(0, n)
}

// ---------------------------------------------------------------------------
// 6. Page-level helpers
// ---------------------------------------------------------------------------

/**
 * Days elapsed between `openedAt` (ISO) and `now` (Date), rounded to the
 * nearest whole day. For Kaisei (`openedAt: '2026-03-25T08:00:00Z'`,
 * `now = SERVER_DEMO_DATE`): 33 days.
 */
export function computeDaysIn(openedAt: string, now: Date): number {
  return Math.round((now.getTime() - Date.parse(openedAt)) / 86_400_000)
}

// ---------------------------------------------------------------------------
// 7. Locked content constants — Stage 3 lock for v1 (D-19, D-21, D-23)
// ---------------------------------------------------------------------------

export type AttentionItem = {
  readonly id: string
  readonly title: string
  readonly meta: string
}

/**
 * Stage 3 (Documentation) attention items. Locked demo copy per UI-SPEC
 * §Copywriting Contract > AttentionCard. v1 always renders these 3 items;
 * Phase 7+ would replace the constant with stage-aware copy.
 */
export const STAGE_3_ATTENTION_ITEMS: readonly AttentionItem[] = Object.freeze([
  {
    id: 'attn-coi-uk',
    title: 'Upload Kaisei Europe — Certificate of Incorporation',
    meta: 'Required · UK jurisdiction · due Apr 28',
  },
  {
    id: 'attn-sow-tanaka',
    title: 'Attest source-of-wealth — Tanaka Family Trust',
    meta: 'Template ready · 4 beneficiaries',
  },
  {
    id: 'attn-hk-dirs',
    title: 'Confirm directors on HK application',
    meta: 'Pre-filled by Origin from Singapore — review and submit',
  },
] as const)

export type AILaneState = 'live' | 'pending' | 'done'

export type AILaneItem = {
  readonly id: string
  readonly text: string
  readonly meta: string
  readonly state: AILaneState
}

/**
 * Stage 3 AI tasks shown by WorkingOnYourBehalfCard. Locked demo copy per
 * UI-SPEC §Copywriting Contract > AILaneRow. The 3 entries demonstrate the
 * three states (live / pending / done) in canonical order.
 */
export const STAGE_3_AI_TASKS: readonly AILaneItem[] = Object.freeze([
  {
    id: 'ai-hk-extract',
    text: 'Extracting fields from your HK Business Registration',
    meta: '29 of ~38 fields · 0.96 confidence',
    state: 'live',
  },
  {
    id: 'ai-director-xref',
    text: 'Cross-referencing director IDs against all 5 entities',
    meta: '6 of 8 matched',
    state: 'pending',
  },
  {
    id: 'ai-uk-prefill',
    text: 'Pre-filled your UK application using Singapore filing',
    meta: '12 fields carried across · 1 min ago',
    state: 'done',
  },
] as const)

export type TeamMember = {
  readonly name: string
  readonly role: string
  readonly location: string
  readonly initials: string
  readonly color: AvatarColor
  readonly textColor: AvatarColor
}

/**
 * Team roster for the dashboard's TeamCard (D-23). v1 lives as a constant
 * here rather than in `seedUsers` (OD5R-06). If Phase 6 RM Cockpit needs
 * Akiko/Priya as first-class users, migrate to `seedUsers` rows with a new
 * UserRole — tracked in CONTEXT.md §Deferred Ideas.
 *
 * The `'signal-info'`, `'warm-amber'`, and `'fresh-green'` AvatarColor
 * literals are members of the closed enum in components/primitives/Avatar.tsx
 * (extended by Plan 05-02 per D-24 / OD5R-05). No casts required.
 */
export const TEAM_MEMBERS: readonly TeamMember[] = Object.freeze([
  {
    name: 'James Lee',
    role: 'Relationship Manager',
    location: 'SMBC Singapore',
    initials: 'JL',
    color: 'trad-green-soft',
    textColor: 'paper',
  },
  {
    name: 'Akiko Sato',
    role: 'Credit Analyst',
    location: 'SMBC Tokyo',
    initials: 'AS',
    color: 'signal-info',
    textColor: 'paper',
  },
  {
    name: 'Priya Nair',
    role: 'KYC Operations Lead',
    location: 'SMBC Singapore',
    initials: 'PN',
    color: 'warm-amber',
    textColor: 'paper',
  },
  {
    name: 'Origin',
    role: 'AI orchestrator',
    location: '—',
    initials: '◉',
    color: 'fresh-green',
    textColor: 'trad-green-deep',
  },
] as const)

/**
 * Display labels for each ProductType. Per UI-SPEC §Component Specs >
 * ApplicationCard. Locked demo copy.
 */
export const PRODUCT_DISPLAY_LABEL: Readonly<
  Record<ProductType, { readonly label: string; readonly detail: string }>
> = Object.freeze({
  accounts: {
    label: 'Accounts',
    detail: 'Multi-currency operating accounts',
  },
  cash_management: {
    label: 'Cash management',
    detail: 'Multi-currency accounts across JP / SG / HK / UK',
  },
  fx: {
    label: 'FX & hedging',
    detail: 'Forward and option lines',
  },
  trade_finance: {
    label: 'Trade finance',
    detail: 'LC issuance, supply chain finance — SG + HK',
  },
  credit: {
    label: 'Revolving credit facility',
    detail: 'USD 50M, 3-year tenor, uncommitted pricing grid',
  },
})

/**
 * ISO-3166 country code → flag emoji. JP/SG/HK/GB are required by the Kaisei
 * seed; US/CN are forward-compatible for future portfolios.
 */
export const JURISDICTION_FLAG: Readonly<Record<string, string>> = Object.freeze({
  JP: '🇯🇵',
  SG: '🇸🇬',
  HK: '🇭🇰',
  GB: '🇬🇧',
  US: '🇺🇸',
  CN: '🇨🇳',
})
