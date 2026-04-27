---
phase: 5
plan: 05-01
title: lib/cjd.ts dashboard helper module + co-located tests
wave: 1
depends_on: []
files_modified:
  - lib/cjd.ts
  - lib/cjd.test.ts
autonomous: true
requirements_addressed: [CJD-02, CJD-03, CJD-05]
od5r_resolutions: [OD5R-02, OD5R-03, OD5R-04, OD5R-06]
estimated_minutes: 50
---

<objective>
Create `lib/cjd.ts` (Phase 5 redo dashboard helper module) plus co-located `lib/cjd.test.ts`. Module exports the constants and pure functions consumed by all Wave 2 components: server-stable demo date, Reiwa formatter, business-day formatter (OD5R-02 slide-the-window), `daysIn` computer, Activity → row-prop adapters, top-N truncation, plus locked content constants (`STAGE_3_ATTENTION_ITEMS`, `STAGE_3_AI_TASKS`, `TEAM_MEMBERS`, `PRODUCT_DISPLAY_LABEL`, `JURISDICTION_FLAG`).

The module follows `lib/persona.ts` conventions: file-header comment naming Phase 5 + decisions covered, type imports first, named exports, `Record<EnumKey, ValueShape>` lookup tables, `as const` literals. No React, no DOM, no async. Pure synchronous helpers + frozen constants.
</objective>

<must_haves>
- `lib/cjd.ts` exists at repo root with exports listed in <exports> below.
- `lib/cjd.test.ts` exists with at least one positive test per exported function plus boundary cases for date math.
- `formatReiwa(new Date('2026-04-27T00:00:00Z'))` returns `'令和8年4月27日'`.
- `formatBusinessDaysAhead(SERVER_DEMO_DATE, 2)` returns `'29 April 2026'` when SERVER_DEMO_DATE is 2026-04-27 (a Monday) — skipping weekends as needed.
- `stageStatusToPillState` covers all 4 input values: complete→done, in_progress→current, not_started→upcoming, blocked→upcoming (defensive default).
- `eventToCopy` returns the verbatim copy strings from UI-SPEC §Copywriting Contract for each of the 13 Kaisei activity event IDs (`act-kaisei-001..013`).
- `eventToActorDisplay` returns `'Origin'` for `actorType: 'ai'`, `'James Lee'` for `'rm'`, `'Yuki Tanaka'` for `'client'`, `'System'` for `'system'`.
- `eventToDotColor` returns `'var(--color-fresh-green)'` for `'ai'`, `'var(--color-signal-info)'` for `'rm'`, `'var(--color-ink-muted)'` for `'client' | 'system'`.
- `formatActivityRelativeTime` returns `'09:14 UTC'` for same-day, `'Yesterday'` for 1 day ago, `'MMM dd'` (e.g., `'Apr 22'`) for older — relative to `SERVER_DEMO_DATE`.
- `topNActivities([... 13 ...], 6)` returns 6 events sorted desc by createdAt.
- `computeDaysIn('2026-03-25T08:00:00Z', SERVER_DEMO_DATE)` returns 33 (33 days from 2026-03-25 to 2026-04-27).
- `STAGE_3_ATTENTION_ITEMS` array has 3 entries with locked title/meta strings (UI-SPEC §Copywriting Contract > AttentionCard).
- `STAGE_3_AI_TASKS` array has 3 entries (live, pending, done) with locked text/meta strings.
- `TEAM_MEMBERS` array has 4 entries; Origin entry has `color: 'fresh-green'` and `textColor: 'trad-green-deep'`.
- `PRODUCT_DISPLAY_LABEL` has entries for all 5 `ProductType` values from `types/origin.ts`.
- `JURISDICTION_FLAG` has `JP, SG, HK, GB` minimum (extensible).
- All constants frozen via `as const` or `Object.freeze(...)`.
- All tests pass: `npm run test -- --run lib/cjd.test.ts` exits 0.
- Typecheck passes: `npm run typecheck` exits 0.
- Lint passes: `npm run lint` exits 0.
- `lib/cjd.ts` IS added to `.freshgreen-allowlist` by Plan 05-02 — required because `eventToDotColor` returns the literal string `'var(--color-fresh-green)'`, which **does** match `scripts/check-fresh-green.sh`'s pattern 4 (`\[var\(--color-fresh-green`) and pattern 2 (`--color-fresh-green(-[a-z0-9]+)?`). Plan 05-01 introduces the file knowing it will fail the SHELL-05 check standalone; Plan 05-02 lands the allowlist entry, after which the gate passes. Sequential ordering of Wave 1 (05-01 → 05-02) is therefore load-bearing for SHELL-05 enforcement to clear at the Wave 1 → Wave 2 boundary.
</must_haves>

<exports>

```ts
// File-header comment with Phase 5 redo + decisions covered (D-04, D-09, D-12, D-15, D-23, D-27..D-30, D-31, OD5R-02b, OD5R-03, OD5R-06)

import type { Activity, ProductType, StageNumber, StageStatus } from '@/types/origin'
import type { StagePillState, AvatarColor } from '@/components/primitives'

// 1. Server-stable demo date (D-12)
export const SERVER_DEMO_DATE: Date

// 2. Reiwa formatter
export function formatReiwa(date: Date): string

// 3. Business-day formatter (OD5R-02b — slide-the-window)
export function formatBusinessDaysAhead(from: Date, businessDays: number): string

// 4. Stage adapters
export function stageStatusToPillState(status: StageStatus): StagePillState

// 5. Activity adapters
export function eventToCopy(activity: Activity): string
export function eventToActorDisplay(activity: Activity): string
export function eventToDotColor(activity: Activity): string
export function formatActivityRelativeTime(iso: string, now: Date): string
export function topNActivities(activities: readonly Activity[], n: number): Activity[]

// 6. Page-level helpers
export function computeDaysIn(openedAt: string, now: Date): number

// 7. Locked content constants
export type AttentionItem = {
  readonly id: string
  readonly title: string
  readonly meta: string
}
export const STAGE_3_ATTENTION_ITEMS: readonly AttentionItem[]

export type AILaneState = 'live' | 'pending' | 'done'
export type AILaneItem = {
  readonly id: string
  readonly text: string
  readonly meta: string
  readonly state: AILaneState
}
export const STAGE_3_AI_TASKS: readonly AILaneItem[]

export type TeamMember = {
  readonly name: string
  readonly role: string
  readonly location: string
  readonly initials: string
  readonly color: AvatarColor
  readonly textColor: AvatarColor
}
export const TEAM_MEMBERS: readonly TeamMember[]

export const PRODUCT_DISPLAY_LABEL: Readonly<Record<ProductType, { readonly label: string; readonly detail: string }>>
export const JURISDICTION_FLAG: Readonly<Record<string, string>>
```

</exports>

<threat_model>
**Trust boundaries:** None new. `lib/cjd.ts` consumes typed `Activity`, `ProductType`, `StageStatus` from `@/types/origin` (closed enums + locked seed) and emits closed-enum view types (`StagePillState`, `AvatarColor`). No user input crosses any boundary inside this module.

| Threat ID | Category | Component | Disposition | Mitigation |
|-----------|----------|-----------|-------------|------------|
| T-05R-01 | Tampering | `eventToCopy` return strings | mitigate | Copy strings are LITERAL constants in a `Record<string, string>` lookup. No template substitution from `event.payload`. React auto-escapes when consumers render via JSX text. |
| T-05R-02 | Policy bypass (fresh-green) | `eventToDotColor` returns | mitigate | The function returns CSS color values for inline `style={{ background: ... }}` use in ActivityRow. The literal string `'var(--color-fresh-green)'` IS matched by `scripts/check-fresh-green.sh` pattern 4 (`\[var\(--color-fresh-green`) and pattern 2 (`--color-fresh-green(-[a-z0-9]+)?`). Plan 05-02 adds `lib/cjd.ts` to `.freshgreen-allowlist` to clear the gate. The fresh-green-bearing **rendered** surface is `components/journey/ActivityFeed.tsx` (also allowlisted in Plan 05-02). Wave 1 sequential ordering (05-01 → 05-02) is load-bearing for the gate to pass at the Wave 1 → Wave 2 boundary. |
| T-05R-03 | Tampering | `formatReiwa` / `formatBusinessDaysAhead` | accept | Pure date arithmetic; no external input. SERVER_DEMO_DATE is a frozen constant. |

</threat_model>

<tasks>

<task type="auto">
  <name>Task 1: Create lib/cjd.ts with all exports</name>
  <read_first>
    - lib/persona.ts (analog file shape — verbatim convention reference)
    - lib/stages.ts (STAGE_NAMES + deriveStages pattern)
    - types/origin.ts lines 45-49 (Activity, ActorType, StageStatus, StageNumber, ProductType types)
    - types/origin.ts lines 260-268 (Activity interface)
    - components/primitives/index.ts (AvatarColor, StagePillState type re-exports)
    - data/seed.ts lines 1276-1399 (13 Kaisei Activity events — eventType, actorType, payload, createdAt)
    - .planning/phases/05-client-journey-dashboard/05-UI-SPEC.md §Copywriting Contract (verbatim copy strings: AttentionCard 3 items, AILaneRow 3 tasks, ActivityFeed 13 event copies)
    - .planning/phases/05-client-journey-dashboard/05-CONTEXT.md D-12, D-15, D-19, D-21, D-23, D-27..D-30 (helper module decisions)
    - .planning/phases/05-client-journey-dashboard/05-CONTEXT.md §Specifics (SERVER_DEMO_DATE, computeDaysIn formula, formatReiwa algorithm)
  </read_first>
  <action>
Create `lib/cjd.ts` with the structure listed in <exports> above. Implementation notes:

**SERVER_DEMO_DATE:** `export const SERVER_DEMO_DATE = new Date('2026-04-27T00:00:00Z')` — frozen by reference (Date instances are immutable on the value level except via mutation methods; consumers MUST NOT call setX methods).

**formatReiwa(date):** Reiwa year = `date.getFullYear() - 2018`. Format `令和${year}年${month}月${day}日` where month and day come from getMonth+1 and getDate. Source: prototype `77ddc8bb.js:154-160`.

**formatBusinessDaysAhead(from, businessDays):** Iterate from `from` adding 1 day at a time, skipping Saturday (getDay() === 6) and Sunday (getDay() === 0), until `businessDays` business days have been added. Format the result with `Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })` → `'29 April 2026'`. For SERVER_DEMO_DATE = 2026-04-27 (Mon), +2 business days = 2026-04-29 (Wed). For 2026-04-29 input → +2 = 2026-05-01 (Fri). For 2026-05-01 + 2 = 2026-05-05 (Mon, skipping Sat/Sun). Test these boundaries.

**stageStatusToPillState:** switch on the 4 StageStatus values; complete→'done', in_progress→'current', not_started→'upcoming', blocked→'upcoming' (defensive: Kaisei seed never produces 'blocked', but mapping it to 'upcoming' rather than 'current' avoids visually misrepresenting a stuck stage as in-progress).

**eventToCopy:** `Record<string, string>` keyed by Activity.id with the 13 verbatim strings from UI-SPEC §Copywriting Contract > ActivityFeed (carryforward from archive — same 13 strings keyed by `act-kaisei-001..013`). Fallback: `${event.eventType} (${event.actorType})` if id is unknown (defensive — should never trigger for the seed).

**eventToActorDisplay:** switch on actorType: ai→'Origin', rm→'James Lee' (Phase 5 always shows James as the RM since Kaisei's rmUserId is rm-james), client→'Yuki Tanaka', system→'System'.

**eventToDotColor:** ai→'var(--color-fresh-green)', rm→'var(--color-signal-info)', client | system→'var(--color-ink-muted)'.

**formatActivityRelativeTime(iso, now):** Compute diff = startOfDay(now) - startOfDay(parsedIso), in days. If diff === 0: return `${HH}:${mm} UTC` (UTC hours/minutes from iso). If diff === 1: return `'Yesterday'`. Else: return formatted as `MMM dd` (e.g., `'Apr 22'`) — three-letter month abbreviation + zero-padded day. The `now` param is required (callers pass SERVER_DEMO_DATE for stable demo behavior).

**topNActivities(activities, n):** `[...activities].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)).slice(0, n)`. Carryforward from archive verbatim.

**computeDaysIn(openedAt, now):** `Math.round((now.getTime() - Date.parse(openedAt)) / 86_400_000)`.

**STAGE_3_ATTENTION_ITEMS:** Array of 3 objects with the verbatim title/meta strings:
```ts
[
  { id: 'attn-coi-uk',     title: 'Upload Kaisei Europe — Certificate of Incorporation',  meta: 'Required · UK jurisdiction · due Apr 28' },
  { id: 'attn-sow-tanaka', title: 'Attest source-of-wealth — Tanaka Family Trust',         meta: 'Template ready · 4 beneficiaries' },
  { id: 'attn-hk-dirs',    title: 'Confirm directors on HK application',                   meta: 'Pre-filled by Origin from Singapore — review and submit' },
] as const
```

**STAGE_3_AI_TASKS:**
```ts
[
  { id: 'ai-hk-extract',     text: 'Extracting fields from your HK Business Registration',          meta: '29 of ~38 fields · 0.96 confidence', state: 'live' },
  { id: 'ai-director-xref',  text: 'Cross-referencing director IDs against all 5 entities',         meta: '6 of 8 matched',                     state: 'pending' },
  { id: 'ai-uk-prefill',     text: 'Pre-filled your UK application using Singapore filing',         meta: '12 fields carried across · 1 min ago', state: 'done' },
] as const
```

**TEAM_MEMBERS:**
```ts
[
  { name: 'James Lee',  role: 'Relationship Manager',  location: 'SMBC Singapore', initials: 'JL', color: 'trad-green-soft', textColor: 'paper' },
  { name: 'Akiko Sato', role: 'Credit Analyst',         location: 'SMBC Tokyo',     initials: 'AS', color: 'signal-info',     textColor: 'paper' },
  { name: 'Priya Nair', role: 'KYC Operations Lead',    location: 'SMBC Singapore', initials: 'PN', color: 'warm-amber',      textColor: 'paper' },
  { name: 'Origin',     role: 'AI orchestrator',        location: '—',              initials: '◉',  color: 'fresh-green',     textColor: 'trad-green-deep' },
] as const
```
**Note:** `'signal-info'`, `'warm-amber'`, `'fresh-green'` are all required AvatarColor values added by Plan 05-02. Until Plan 05-02 ships, this file will fail typecheck. Plan 05-02 runs after 05-01 in Wave 1 — sequential dependency. Alternative: 05-01 lands the constant with `as AvatarColor` casts, then 05-02 removes the casts. **Chosen approach: TypeScript `as AvatarColor` casts in 05-01; removed in 05-02 verification step.** This preserves Wave 1 sequential ordering while keeping each plan atomic.

**PRODUCT_DISPLAY_LABEL:** entries for `'accounts'`, `'cash_management'`, `'fx'`, `'trade_finance'`, `'credit'` per UI-SPEC §Component Specs > ApplicationCard:
```ts
{
  accounts:        { label: 'Accounts',                   detail: 'Multi-currency operating accounts' },
  cash_management: { label: 'Cash management',            detail: 'Multi-currency accounts across JP / SG / HK / UK' },
  fx:              { label: 'FX & hedging',               detail: 'Forward and option lines' },
  trade_finance:   { label: 'Trade finance',              detail: 'LC issuance, supply chain finance — SG + HK' },
  credit:          { label: 'Revolving credit facility',  detail: 'USD 50M, 3-year tenor, uncommitted pricing grid' },
}
```

**JURISDICTION_FLAG:**
```ts
{ JP: '🇯🇵', SG: '🇸🇬', HK: '🇭🇰', GB: '🇬🇧', US: '🇺🇸', CN: '🇨🇳' }
```
(JP, SG, HK, GB are required for the Kaisei seed; US/CN included for forward-compat.)
  </action>
  <verify>
    - File exists at `lib/cjd.ts`
    - `npm run typecheck` exits 0
    - `npm run lint -- lib/cjd.ts` exits 0
  </verify>
</task>

<task type="auto">
  <name>Task 2: Create lib/cjd.test.ts with full coverage</name>
  <read_first>
    - lib/persona.test.ts (analog test shape; positive + boundary)
    - data/seed.ts lines 1276-1399 (13 Kaisei Activity events fixture)
  </read_first>
  <action>
Create `lib/cjd.test.ts`. Use `vitest`. Group tests by export. At minimum:

```ts
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
import type { Activity } from '@/types/origin'

describe('SERVER_DEMO_DATE', () => {
  it('is 2026-04-27T00:00:00Z', () => {
    expect(SERVER_DEMO_DATE.toISOString()).toBe('2026-04-27T00:00:00.000Z')
  })
})

describe('formatReiwa', () => {
  it('formats SERVER_DEMO_DATE as 令和8年4月27日', () => {
    expect(formatReiwa(SERVER_DEMO_DATE)).toBe('令和8年4月27日')
  })
  it('formats 2019-05-01 as 令和1年5月1日 (Reiwa year 1 boundary)', () => {
    expect(formatReiwa(new Date('2019-05-01T00:00:00Z'))).toBe('令和1年5月1日')
  })
})

describe('formatBusinessDaysAhead', () => {
  it('SERVER_DEMO_DATE + 2 business days → "29 April 2026" (Mon→Wed)', () => {
    expect(formatBusinessDaysAhead(SERVER_DEMO_DATE, 2)).toBe('29 April 2026')
  })
  it('Friday + 2 business days skips weekend (Fri 2026-05-01 → Tue 2026-05-05)', () => {
    expect(formatBusinessDaysAhead(new Date('2026-05-01T00:00:00Z'), 2)).toBe('5 May 2026')
  })
})

describe('stageStatusToPillState', () => {
  it.each([
    ['complete', 'done'],
    ['in_progress', 'current'],
    ['not_started', 'upcoming'],
    ['blocked', 'upcoming'],
  ])('maps %s → %s', (status, expected) => {
    expect(stageStatusToPillState(status as never)).toBe(expected)
  })
})

describe('eventToCopy', () => {
  it('returns locked copy for act-kaisei-007 (doc_extracted, AI)', () => {
    const e: Activity = { id: 'act-kaisei-007', applicationId: 'app-kaisei', actorType: 'ai', actorId: null, eventType: 'doc_extracted', payload: {}, createdAt: '2026-04-15T14:24:00Z' }
    expect(eventToCopy(e)).toBe('Origin extracted structured fields from your 2024 audited financials. 94% confidence.')
  })
  // ... cover all 13 act-kaisei-* IDs
})

describe('eventToActorDisplay', () => {
  it.each([
    ['ai', 'Origin'],
    ['rm', 'James Lee'],
    ['client', 'Yuki Tanaka'],
    ['system', 'System'],
  ])('actorType=%s → %s', (actorType, expected) => {
    const e: Activity = { id: 'x', applicationId: 'app', actorType: actorType as never, actorId: null, eventType: 'x', payload: {}, createdAt: '2026-04-27T00:00:00Z' }
    expect(eventToActorDisplay(e)).toBe(expected)
  })
})

describe('eventToDotColor', () => {
  it.each([
    ['ai', 'var(--color-fresh-green)'],
    ['rm', 'var(--color-signal-info)'],
    ['client', 'var(--color-ink-muted)'],
    ['system', 'var(--color-ink-muted)'],
  ])('actorType=%s → %s', (actorType, expected) => {
    const e: Activity = { id: 'x', applicationId: 'app', actorType: actorType as never, actorId: null, eventType: 'x', payload: {}, createdAt: '2026-04-27T00:00:00Z' }
    expect(eventToDotColor(e)).toBe(expected)
  })
})

describe('formatActivityRelativeTime', () => {
  it('same-day → HH:mm UTC', () => {
    expect(formatActivityRelativeTime('2026-04-27T09:14:00Z', SERVER_DEMO_DATE)).toBe('09:14 UTC')
  })
  it('yesterday → "Yesterday"', () => {
    expect(formatActivityRelativeTime('2026-04-26T07:00:00Z', SERVER_DEMO_DATE)).toBe('Yesterday')
  })
  it('5 days ago → "Apr 22"', () => {
    expect(formatActivityRelativeTime('2026-04-22T16:08:00Z', SERVER_DEMO_DATE)).toBe('Apr 22')
  })
})

describe('topNActivities', () => {
  it('returns 6 most recent in desc order', () => {
    const acts: Activity[] = [/* construct 13 fixtures matching the seed */]
    const top6 = topNActivities(acts, 6)
    expect(top6).toHaveLength(6)
    // assert sort order
  })
})

describe('computeDaysIn', () => {
  it('Kaisei opened 2026-03-25, demo date 2026-04-27 → 33 days', () => {
    expect(computeDaysIn('2026-03-25T08:00:00Z', SERVER_DEMO_DATE)).toBe(33)
  })
})

describe('STAGE_3_ATTENTION_ITEMS', () => {
  it('has exactly 3 items with locked title/meta', () => {
    expect(STAGE_3_ATTENTION_ITEMS).toHaveLength(3)
    expect(STAGE_3_ATTENTION_ITEMS[0].title).toBe('Upload Kaisei Europe — Certificate of Incorporation')
    expect(STAGE_3_ATTENTION_ITEMS[0].meta).toBe('Required · UK jurisdiction · due Apr 28')
    // ... verify all 3
  })
})

describe('STAGE_3_AI_TASKS', () => {
  it('has 3 tasks: live, pending, done', () => {
    expect(STAGE_3_AI_TASKS).toHaveLength(3)
    expect(STAGE_3_AI_TASKS.map(t => t.state)).toEqual(['live', 'pending', 'done'])
  })
  it('preserves locked text/meta strings', () => {
    expect(STAGE_3_AI_TASKS[0].text).toBe('Extracting fields from your HK Business Registration')
    // ... verify all 3
  })
})

describe('TEAM_MEMBERS', () => {
  it('has 4 members in canonical order: James, Akiko, Priya, Origin', () => {
    expect(TEAM_MEMBERS).toHaveLength(4)
    expect(TEAM_MEMBERS.map(m => m.name)).toEqual(['James Lee', 'Akiko Sato', 'Priya Nair', 'Origin'])
  })
  it('Origin entry uses fresh-green avatar with trad-green-deep text', () => {
    const origin = TEAM_MEMBERS.find(m => m.name === 'Origin')!
    expect(origin.color).toBe('fresh-green')
    expect(origin.textColor).toBe('trad-green-deep')
    expect(origin.initials).toBe('◉')
  })
  it('James entry is the RM (trad-green-soft)', () => {
    const james = TEAM_MEMBERS[0]
    expect(james.color).toBe('trad-green-soft')
    expect(james.role).toBe('Relationship Manager')
    expect(james.location).toBe('SMBC Singapore')
  })
})

describe('PRODUCT_DISPLAY_LABEL', () => {
  it('has entries for all 5 ProductType values', () => {
    expect(Object.keys(PRODUCT_DISPLAY_LABEL).sort()).toEqual(['accounts', 'cash_management', 'credit', 'fx', 'trade_finance'])
  })
})

describe('JURISDICTION_FLAG', () => {
  it('has flags for JP, SG, HK, GB', () => {
    expect(JURISDICTION_FLAG.JP).toBe('🇯🇵')
    expect(JURISDICTION_FLAG.SG).toBe('🇸🇬')
    expect(JURISDICTION_FLAG.HK).toBe('🇭🇰')
    expect(JURISDICTION_FLAG.GB).toBe('🇬🇧')
  })
})
```
  </action>
  <verify>
    - `npm run test -- --run lib/cjd.test.ts` exits 0
    - All 13 act-kaisei-* IDs covered in eventToCopy tests
    - boundary test for formatBusinessDaysAhead crosses a weekend
  </verify>
</task>

<task type="auto">
  <name>Task 3: Atomic commit</name>
  <action>
Stage `lib/cjd.ts` and `lib/cjd.test.ts`. Commit with message:
```
feat(phase-05-redo): add lib/cjd.ts dashboard helper module + tests (Plan 05-01)

Phase 5 redo Wave 1 foundation. Exports SERVER_DEMO_DATE, formatReiwa,
formatBusinessDaysAhead (OD5R-02b slide-the-window), Activity adapters,
top-N truncation, computeDaysIn, plus locked content constants
(STAGE_3_ATTENTION_ITEMS, STAGE_3_AI_TASKS, TEAM_MEMBERS,
PRODUCT_DISPLAY_LABEL, JURISDICTION_FLAG).

Decisions covered: D-12, D-15, D-19, D-21, D-23, D-27..D-30, D-31.
OD5R resolutions: OD5R-02 (slide-the-window helper), OD5R-03 (47 fields
static via constants), OD5R-04 (P-1 inert posture — no nav helpers),
OD5R-06 (TEAM_MEMBERS as constant for v1; Phase 6 migration tracked).

The TEAM_MEMBERS constant uses AvatarColor enum values that don't exist
yet in components/primitives/Avatar.tsx — Plan 05-02 extends the enum
with 'signal-info', 'warm-amber', 'fresh-green' before any consumer
ships. The TEAM_MEMBERS literal will fail typecheck transiently until
Plan 05-02 lands; mitigated via 'as AvatarColor' casts that Plan 05-02
removes.
```
  </action>
  <verify>
    - `git status` shows clean tree
    - `git log -1 --oneline` shows the commit
  </verify>
</task>

</tasks>

<acceptance>
- `lib/cjd.ts` exists with all listed exports.
- `lib/cjd.test.ts` exists; `npm run test -- --run lib/cjd.test.ts` exits 0.
- `npm run typecheck` exits 0 (transient `as AvatarColor` casts in TEAM_MEMBERS pass; Plan 05-02 will remove them).
- `npm run lint` exits 0.
- Commit message references Plan 05-01 + the OD5R resolutions.
</acceptance>
