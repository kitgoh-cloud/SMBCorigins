---
phase: 5
plan: 05-08
title: ActivityFeed component (revised) — prototype row shape with LAST 72H header tag
wave: 2
depends_on: [05-01, 05-02]
files_modified:
  - components/journey/ActivityFeed.tsx
  - components/journey/ActivityFeed.test.tsx
autonomous: true
requirements_addressed: [CJD-05, CJD-07]
od5r_resolutions: []
estimated_minutes: 45
---

<objective>
Build `ActivityFeed`, the full-width activity card at the bottom of the dashboard. Adopts the prototype's row shape `<Time · Indicator · **Actor** — text>` (D-27) — different from the archive's `<Indicator + copy + timestamp-right>` shape.

Renders:
- Header (mb-[18px], flex justify-between items-center): `<Eyebrow>Recent activity</Eyebrow>` + `<span>` LAST 72H tag (font-mono, 11px, ink-muted)
- Body: top-6 activities (sorted desc by createdAt) — each as an `ActivityRow` with `<Time · 8px Indicator dot · **Actor** — text>`
- Indicator dot color by `actorType`: ai → fresh-green; rm → signal-info; client/system → ink-muted

File **IS** in `.freshgreen-allowlist` (added by Plan 05-02) — the AI-actor indicator dot is fresh-green.
</objective>

<must_haves>
- `components/journey/ActivityFeed.tsx` is a Server Component.
- Props: `{ activities: readonly Activity[] }`.
- Outer `<section className="card relative">` (or inline-equivalent: `relative bg-paper border border-mist rounded-[12px] p-6`).
- Header (flex justify-between items-center, mb-[18px] = 18px chrome-metric exception):
  - `<Eyebrow>Recent activity</Eyebrow>`
  - `<span className="font-mono text-ink-muted" style={{ fontSize: 11 }}>LAST 72H</span>`
- Body: `topNActivities(activities, 6).map(a => <ActivityRow key={a.id} activity={a} />)`
- Inline `ActivityRow` sub-component:
  - className: `flex items-start py-2.5 border-b border-mist`
  - inline `style={{ gap: 14 }}`
  - **Time column** (80px wide, mono):
    `<div className="font-mono flex-shrink-0" style={{ fontSize: 11, color: 'var(--color-ink-muted)', width: 80, paddingTop: 2 }}>{formatActivityRelativeTime(activity.createdAt, SERVER_DEMO_DATE)}</div>`
  - **Indicator dot** (8×8):
    `<span className="rounded-full flex-shrink-0" style={{ width: 8, height: 8, background: eventToDotColor(activity), marginTop: 6 }} aria-hidden="true" />`
  - **Body span** (flex-1):
    ```jsx
    <span style={{ fontSize: 13, color: 'var(--color-ink)' }}>
      <strong style={{ fontWeight: 500 }}>{eventToActorDisplay(activity)}</strong>
      <span style={{ color: 'var(--color-ink-soft)' }}>{` — ${eventToCopy(activity)}`}</span>
    </span>
    ```
- File header comment naming Phase 5 + decisions (D-27, D-28, D-29, D-30, D-31).
- Tests cover: top-6 truncation; sort desc order; LAST 72H tag; AI rows have fresh-green dot; RM rows have signal-info dot; no `<a>`/`<button>`/`onClick`/`cursor-pointer` (P-1 inert per D-19 / OD5R-04 carried over to ActivityFeed); fresh-green tokens only on the AI indicator dot inline `style`.
- File IS in `.freshgreen-allowlist` (verified — added by Plan 05-02).
</must_haves>

<threat_model>
| Threat ID | Category | Component | Disposition | Mitigation |
|-----------|----------|-----------|-------------|------------|
| T-05R-23 | XSS in row text | eventToCopy strings | mitigate | Copy comes from `lib/cjd.ts` `Record<string, string>` — literal constants. JSX text-node interpolation auto-escapes. |
| T-05R-24 | Fresh-green leak (non-AI dots) | ActivityRow indicator | mitigate | `eventToDotColor` returns specific tokens per actorType — fresh-green only for `'ai'`. Test verifies RM rows have signal-info, client/system rows have ink-muted. |
| T-05R-25 | P-1 violation | ActivityRow | mitigate | Renders as `<div>` (no nav semantics). No `onClick`, no `cursor-pointer`. Tests verify. |

</threat_model>

<tasks>

<task type="auto">
  <name>Task 1: Create ActivityFeed.tsx</name>
  <read_first>
    - .planning/phases/05-client-journey-dashboard/05-UI-SPEC.md §Component Specs > ActivityFeed (revised)
    - .planning/phases/05-client-journey-dashboard/05-CONTEXT.md D-27, D-28, D-29, D-30
    - lib/cjd.ts (topNActivities, eventToCopy, eventToActorDisplay, eventToDotColor, formatActivityRelativeTime, SERVER_DEMO_DATE)
    - types/origin.ts (Activity)
  </read_first>
  <action>
Create the component:

```tsx
// components/journey/ActivityFeed.tsx — Phase 5 redo CJD-05 activity feed (revised).
//
// Server Component. Adopts prototype row shape: <Time · 8px Indicator · **Actor** — text>.
// Top-6 truncation (D-29). LAST 72H header tag (D-27 prototype addition).
// AI-row dots use fresh-green via eventToDotColor — fresh-green allowlist coverage.
//
// Decisions covered: D-27 (prototype row shape), D-28 (eventToCopy carryforward),
// D-29 (top-6 truncation), D-30 (relative timestamp format), D-31 (lib/cjd module).

import type { ReactElement } from 'react'
import type { Activity } from '@/types/origin'
import { Eyebrow } from '@/components/primitives'
import {
  SERVER_DEMO_DATE,
  topNActivities,
  eventToCopy,
  eventToActorDisplay,
  eventToDotColor,
  formatActivityRelativeTime,
} from '@/lib/cjd'

export type ActivityFeedProps = {
  activities: readonly Activity[]
}

export function ActivityFeed({ activities }: ActivityFeedProps): ReactElement {
  const rows = topNActivities(activities, 6)
  return (
    <section className="relative bg-paper border border-mist rounded-[12px] p-6">
      <div className="flex items-center justify-between" style={{ marginBottom: 18 }}>
        <Eyebrow>Recent activity</Eyebrow>
        <span
          className="font-mono"
          style={{ fontSize: 11, color: 'var(--color-ink-muted)' }}
        >
          LAST 72H
        </span>
      </div>
      {rows.map((activity) => (
        <ActivityRow key={activity.id} activity={activity} />
      ))}
    </section>
  )
}

function ActivityRow({ activity }: { activity: Activity }): ReactElement {
  const t = formatActivityRelativeTime(activity.createdAt, SERVER_DEMO_DATE)
  const actor = eventToActorDisplay(activity)
  const text = eventToCopy(activity)
  const dotColor = eventToDotColor(activity)

  return (
    <div
      className="flex items-start py-2.5 border-b border-mist"
      style={{ gap: 14 }}
    >
      <div
        className="font-mono flex-shrink-0"
        style={{
          fontSize: 11,
          color: 'var(--color-ink-muted)',
          width: 80,
          paddingTop: 2,
        }}
      >
        {t}
      </div>
      <span
        className="rounded-full flex-shrink-0"
        style={{
          width: 8,
          height: 8,
          background: dotColor,
          marginTop: 6,
        }}
        aria-hidden="true"
      />
      <div className="flex-1">
        <span style={{ fontSize: 13, color: 'var(--color-ink)' }}>
          <strong style={{ fontWeight: 500 }}>{actor}</strong>
          <span style={{ color: 'var(--color-ink-soft)' }}>
            {` — ${text}`}
          </span>
        </span>
      </div>
    </div>
  )
}
```
  </action>
  <verify>
    - Typecheck/lint exit 0.
  </verify>
</task>

<task type="auto">
  <name>Task 2: Create ActivityFeed.test.tsx</name>
  <action>
Reuse archive test patterns (truncation, sort order, AI/RM/client indicators, P-1 inert) — adapted to the new row shape.

```tsx
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
    expect(container.textContent).toMatch(/Yesterday.*System/s)
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
    const { container } = render(<ActivityFeed activities={KAISEI_13} />)
    // act-kaisei-005 is RM but rejected from top-6 by sort; let's use a single-fixture test
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
```
  </action>
  <verify>
    - All tests pass.
  </verify>
</task>

<task type="auto">
  <name>Task 3: Atomic commit</name>
  <action>
Commit:
```
feat(phase-05-redo): ActivityFeed component (revised) (Plan 05-08)

Phase 5 redo Wave 2: full-width activity feed with prototype row shape
<Time · Indicator · **Actor** — text> (D-27). Top-6 truncation
(D-29). LAST 72H header tag (D-27 addition).

Decisions covered: D-27 (prototype row shape), D-28 (eventToCopy
carryforward — 13 strings unchanged), D-29 (top-6 truncation),
D-30 (relative timestamp).

AI rows render fresh-green indicator dot (allowlisted via Plan 05-02).
RM rows: signal-info dot. Client/system: ink-muted dot. P-1 inert —
rows are <div>, no nav.
```
  </action>
</task>

</tasks>

<acceptance>
- ActivityFeed renders top-6 sorted desc with prototype row shape.
- AI dots are fresh-green; RM dots are signal-info; client/system dots are ink-muted.
- File IS in `.freshgreen-allowlist`.
- Tests/typecheck/lint exit 0.
- `bash scripts/check-fresh-green.sh` exits 0.
</acceptance>
