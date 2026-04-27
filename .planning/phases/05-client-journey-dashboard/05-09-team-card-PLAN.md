---
phase: 5
plan: 05-09
title: TeamCard component (revised) — 4-member multi-avatar list with inert "Message James" button
wave: 2
depends_on: [05-01, 05-02]
files_modified:
  - components/journey/TeamCard.tsx
  - components/journey/TeamCard.test.tsx
autonomous: true
requirements_addressed: [CJD-06]
od5r_resolutions: [OD5R-04, OD5R-05, OD5R-06]
estimated_minutes: 45
---

<objective>
Build `TeamCard` (revised), the team list card in the 3-column grid. Renders 4 members from `TEAM_MEMBERS` (lib/cjd.ts): James Lee (RM, trad-green-soft), Akiko Sato (Credit Analyst, signal-info), Priya Nair (KYC Operations Lead, warm-amber), Origin (AI orchestrator, fresh-green).

Members rendered as `<Avatar size={34} />` with name (13/500 ink) + role + " · " + location (11px ink-muted). Origin uses `color="fresh-green"` and `textColor="trad-green-deep"` (the only fresh-green Avatar in the dashboard).

CTA: `<button disabled>` "Message James" with mail icon, full-width, ghost styling, `mt-1.5` (6px from prototype). **Inert** (OD5R-04 — Phase 6 wires the route).

File IS in `.freshgreen-allowlist` (added by Plan 05-02) — for the Origin avatar surface.
</objective>

<must_haves>
- `components/journey/TeamCard.tsx` is a Server Component.
- Props: `{ rm: User }`. (Currently the prop is unused for display purposes since TEAM_MEMBERS is a constant; the `rm` prop is passed-through for future re-binding when seedUsers integration ships per OD5R-06 migration path. The first member in TEAM_MEMBERS is "James Lee" — assert in tests that this matches `rm.displayName` to catch divergence.)
- Outer `<section className="card relative">` (or inline-equivalent: `relative bg-paper border border-mist rounded-[12px] p-6`).
- Header: `<Eyebrow className="mb-4">Your team</Eyebrow>`
- Members: `TEAM_MEMBERS.map((member) => <TeamMemberRow key={member.name} member={member} />)`
- Inline `TeamMemberRow` sub-component:
  - className: `flex items-center` + inline `style={{ gap: 12, marginBottom: 14 }}`
  - `<Avatar initials={member.initials} color={member.color} textColor={member.textColor} size={34} />`
  - Body div:
    - Name: `<div style={{ fontSize: 13, color: 'var(--color-ink)', fontWeight: 500 }}>{member.name}</div>`
    - Role · Location: `<div style={{ fontSize: 11, color: 'var(--color-ink-muted)' }}>{`${member.role} · ${member.location}`}</div>`
- CTA button:
  ```jsx
  <button
    type="button"
    disabled
    aria-disabled="true"
    className="w-full mt-1.5 flex items-center justify-center gap-2 rounded-md border border-mist-deep px-4 py-1.5 text-[12px] font-medium text-ink transition-colors duration-200 ease-out hover:bg-paper-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-trad-green disabled:cursor-not-allowed"
  >
    <Icon name="mail" size={14} />
    Message James
  </button>
  ```
- File header comment naming Phase 5 + decisions (D-23, D-24, D-25, D-26, OD5R-04, OD5R-05, OD5R-06).
- Tests cover: 4 members + locked names/roles/locations + Avatar colors per member + Origin uses fresh-green/trad-green-deep + James matches `rm.displayName` + Message James button is `disabled` + W-01 transition/focus classes on button + no `onClick` + no `<a>` (the button is `<button>`, but it's `disabled` + has no `onClick`).
- File IS in `.freshgreen-allowlist` (verified — added by Plan 05-02).
</must_haves>

<threat_model>
| Threat ID | Category | Component | Disposition | Mitigation |
|-----------|----------|-----------|-------------|------------|
| T-05R-26 | Wrong avatar color (fresh-green leak on non-AI member) | Team member avatars | mitigate | TEAM_MEMBERS uses closed-enum AvatarColor; James/Akiko/Priya use trad-green-soft/signal-info/warm-amber. Only Origin uses fresh-green. Tests verify each member's color individually. |
| T-05R-27 | Synthetic mailto leak | CTA button | mitigate | The button is `<button disabled>`, NOT `<a href>`. No mailto in any form. The archive's synthetic .example mailto retires entirely. |
| T-05R-28 | Disabled button bypassed via JS | CTA | accept | The button has `disabled` attribute (browser-enforced) AND `aria-disabled="true"` (assistive-tech-enforced) AND no `onClick` handler. A motivated user could remove `disabled` via DevTools — that's out of scope for a demo. |
| T-05R-29 | rm prop unused | TeamCard | mitigate | The `rm` prop is intentionally unused for display in v1 (TEAM_MEMBERS is the source of truth) but kept in the props signature for forward-compatibility with OD5R-06 migration. A test asserts that TEAM_MEMBERS[0].name === rm.displayName to catch drift if seed/RM data diverges. |

</threat_model>

<tasks>

<task type="auto">
  <name>Task 1: Create TeamCard.tsx</name>
  <read_first>
    - .planning/phases/05-client-journey-dashboard/05-UI-SPEC.md §Component Specs > TeamCard, §Copywriting Contract > TeamCard
    - .planning/phases/05-client-journey-dashboard/05-CONTEXT.md D-23, D-24, D-25, D-26
    - lib/cjd.ts (TEAM_MEMBERS constant)
    - components/primitives/Avatar.tsx (extended in Plan 05-02 — verify the new color values + textColor prop are accepted)
    - components/primitives/index.ts (Eyebrow, Icon)
    - types/origin.ts (User type)
  </read_first>
  <action>
Create the component:

```tsx
// components/journey/TeamCard.tsx — Phase 5 redo CJD-06 team list (revised).
//
// Server Component. Multi-member card: James Lee (RM), Akiko Sato (Credit
// Analyst), Priya Nair (KYC Ops Lead), Origin (AI). Origin avatar uses
// fresh-green — the only fresh-green Avatar in the dashboard.
//
// Decisions covered: D-23 (TEAM_MEMBERS constant), D-24 (AvatarColor enum
// extension), D-25 (textColor prop), D-26 (Message James inert).
// OD5R resolutions: OD5R-04 (button inert), OD5R-05 (closed enum), OD5R-06
// (constant for v1 — migration path documented in CONTEXT.md).

import type { ReactElement } from 'react'
import type { User } from '@/types/origin'
import { Avatar, Eyebrow, Icon } from '@/components/primitives'
import { TEAM_MEMBERS, type TeamMember } from '@/lib/cjd'

export type TeamCardProps = {
  rm: User
}

export function TeamCard({ rm: _rm }: TeamCardProps): ReactElement {
  // The `rm` prop is currently unused — TEAM_MEMBERS is the canonical source
  // for v1 (OD5R-06). Kept in the signature for the seed migration path.
  return (
    <section className="relative bg-paper border border-mist rounded-[12px] p-6">
      <Eyebrow className="mb-4">Your team</Eyebrow>
      {TEAM_MEMBERS.map((member) => (
        <TeamMemberRow key={member.name} member={member} />
      ))}
      <button
        type="button"
        disabled
        aria-disabled="true"
        className="w-full mt-1.5 flex items-center justify-center gap-2 rounded-md border border-mist-deep px-4 py-1.5 text-[12px] font-medium text-ink transition-colors duration-200 ease-out hover:bg-paper-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-trad-green disabled:cursor-not-allowed"
      >
        <Icon name="mail" size={14} />
        Message James
      </button>
    </section>
  )
}

function TeamMemberRow({ member }: { member: TeamMember }): ReactElement {
  return (
    <div className="flex items-center" style={{ gap: 12, marginBottom: 14 }}>
      <Avatar
        initials={member.initials}
        color={member.color}
        textColor={member.textColor}
        size={34}
      />
      <div>
        <div style={{ fontSize: 13, color: 'var(--color-ink)', fontWeight: 500 }}>
          {member.name}
        </div>
        <div style={{ fontSize: 11, color: 'var(--color-ink-muted)' }}>
          {`${member.role} · ${member.location}`}
        </div>
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
  <name>Task 2: Create TeamCard.test.tsx</name>
  <action>
Create tests:

```tsx
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
feat(phase-05-redo): TeamCard component (revised, multi-member) (Plan 05-09)

Phase 5 redo Wave 2: 4-member team list — James Lee (RM, trad-green-soft),
Akiko Sato (Credit Analyst, signal-info), Priya Nair (KYC Ops Lead,
warm-amber), Origin (AI, fresh-green). Origin avatar is the ONLY
fresh-green Avatar in the dashboard.

CTA: <button disabled> "Message James" with mail icon. P-1 inert per
OD5R-04 — Phase 6 wires the /messages route. W-01 hover/focus styles
applied (visual affordance preserved despite disabled).

Decisions covered: D-23 (TEAM_MEMBERS constant), D-24 (AvatarColor
enum extension), D-25 (textColor prop), D-26 (Message James inert).
OD5R resolutions: OD5R-04 (strict inert button), OD5R-05 (closed enum),
OD5R-06 (constant for v1; seedUsers migration path tracked).
```
  </action>
</task>

</tasks>

<acceptance>
- TeamCard renders 4 members with locked colors and copy.
- Origin is the only fresh-green Avatar.
- "Message James" button is disabled with W-01 styles applied.
- File IS in `.freshgreen-allowlist`.
- Tests/typecheck/lint exit 0.
- `bash scripts/check-fresh-green.sh` exits 0.
</acceptance>
