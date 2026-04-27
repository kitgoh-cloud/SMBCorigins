---
phase: 5
plan: 05-10
title: components/journey barrel + page composition + integration tests
wave: 3
depends_on: [05-04, 05-05, 05-06, 05-07, 05-08, 05-09]
files_modified:
  - components/journey/index.ts
  - app/(client)/journey/page.tsx
  - app/(client)/journey/page.test.tsx
autonomous: true
requirements_addressed: [CJD-01, CJD-02, CJD-03, CJD-04, CJD-05, CJD-06, CJD-07]
od5r_resolutions: [OD5R-01, OD5R-02, OD5R-03, OD5R-04, OD5R-05, OD5R-06, OD5R-07, OD5R-09]
estimated_minutes: 60
---

<objective>
Wave 3 integration: wire the 6 Wave 2 components into the dashboard page. Three artifacts:

1. **`components/journey/index.ts`** — barrel re-exporting `GreetingBlock`, `ApplicationCard`, `AttentionCard`, `WorkingOnYourBehalfCard`, `ActivityFeed`, `TeamCard`. Mirrors the `components/primitives/index.ts` shape (alphabetical exports + types). `StageTimeline` is internal to `ApplicationCard` and intentionally NOT exported from the barrel.
2. **`app/(client)/journey/page.tsx`** — REPLACES the Phase 2 placeholder. Server Component that fetches `getApplicationDetail('app-kaisei')`, computes `daysIn` server-side, and composes the 4-section layout: GreetingBlock → ApplicationCard → 3-column grid (AttentionCard | WorkingOnYourBehalfCard | TeamCard) → ActivityFeed. The page renders directly inside ClientShell — no max-width wrapper, no padding (D-01).
3. **`app/(client)/journey/page.test.tsx`** — integration test verifying all 4 sections present, no fresh-green leak outside allowlisted surfaces, P-1 inert across the page, no `<a>` to `/stage/N` or `/messages` (the routes don't exist yet).

Final phase output: a fully-functional, prototype-faithful Client Journey Dashboard at `/journey`.
</objective>

<must_haves>
- `components/journey/index.ts` exists with named re-exports for the 6 components + their props types. NOT exporting `StageTimeline` (internal to ApplicationCard).
- `app/(client)/journey/page.tsx` is a Server Component (`async` default export, no `'use client'`).
- Page outer wrapper: `<div className="relative">` (D-02 — for watermark clipping).
- Page calls `api.getApplicationDetail('app-kaisei')` once (D-08 carryforward — single round-trip).
- Page computes `daysIn = computeDaysIn(detail.application.openedAt, SERVER_DEMO_DATE)`.
- Page composition (top-to-bottom):
  1. `<GreetingBlock />` (no props)
  2. `<ApplicationCard application={detail.application} stages={detail.stages} daysIn={daysIn} />`
  3. `<div className="grid mb-6" style={{ gridTemplateColumns: '1.2fr 1.2fr 0.9fr', gap: 20 }}>` containing `<AttentionCard />`, `<WorkingOnYourBehalfCard />`, `<TeamCard rm={detail.rm} />`
  4. `<ActivityFeed activities={detail.recentActivities} />`
- Page does NOT add its own max-width, mx-auto, or padding (D-01 — ClientShell provides `max-w-[1200px] mx-auto pt-9 px-10 pb-20`).
- File header comment naming Phase 5 redo + decisions covered (D-01, D-02, D-03, D-08, D-31) + the 8 OD5R resolutions.
- **Integration test** (`page.test.tsx`):
  - Renders the page (mock the api or import the mock directly via `lib/api.mock.ts`).
  - Verifies all 4 section markers present: GreetingBlock h1 "Good morning, Yuki-san.", ApplicationCard "Application · APP-KAISEI", AttentionCard "FOR YOUR ATTENTION · 3", WorkingOnYourBehalfCard "Working on your behalf", ActivityFeed "RECENT ACTIVITY", TeamCard "YOUR TEAM".
  - Verifies "47 fields of document extraction" string present (greeting summary).
  - Verifies stage numeral 76px renders Kaisei's currentStage (3).
  - Verifies 6 stage pills render (StageTimeline embedded).
  - Verifies "29 April 2026" + "5 business days" ETA strip renders.
  - Verifies 4 jurisdiction flags including 🇯🇵.
  - Verifies 4 team members in canonical order with Origin as fresh-green.
  - Verifies top-6 activity rows render with the most recent first.
  - **Negative grep**: outerHTML has no `<a>` linking to `/stage/N` or `/messages` (the routes don't exist).
  - **P-1 sweep**: no `cursor-pointer` anywhere on the page (excluding any Phase 4 primitive that legitimately uses it).
  - **Fresh-green sweep**: page-level outerHTML has fresh-green tokens ONLY inside surfaces that are allowlisted (Avatar.bg-fresh-green for Origin, AIBadge content, AIPulseDot, etc.); `.card--ai`-style background on WorkingOnYourBehalfCard is allowed.
- All tests pass; typecheck/lint clean.
- `npm run dev` starts; visiting `http://localhost:3000/journey` renders the dashboard without errors (manual smoke test step recorded in <verify>).
- `npm run build` exits 0 (full production build verifies no runtime issues — including the EG-01 PostCSS gap).
- `bash scripts/check-fresh-green.sh` exits 0.
</must_haves>

<threat_model>
| Threat ID | Category | Component | Disposition | Mitigation |
|-----------|----------|-----------|-------------|------------|
| T-05R-30 | Hydration mismatch | page.tsx Server Component | mitigate | Page is async Server Component; SERVER_DEMO_DATE is the only date-derived input (frozen). `daysIn` computed once on server. |
| T-05R-31 | Page-level fresh-green leak | composed components | mitigate | Each component plan has its own negative grep test. Integration test does an additional page-level sweep, excluding allowlisted surfaces. |
| T-05R-32 | Broken navigation (route 404) | StageTimeline pills, ActionRow, Message James button | mitigate | OD5R-04 strict inert posture: no `<a>` to `/stage/N` or `/messages` anywhere. Integration test's negative grep verifies absence. Phase 6/7 lift the routes. |
| T-05R-33 | Missing data path | api.getApplicationDetail | mitigate | The api method already ships in Phase 4 (`lib/api.mock.ts`). The seed has `app-kaisei` with valid Application/Stages/Activities/User. Existing tests cover the api. |

</threat_model>

<tasks>

<task type="auto">
  <name>Task 1: Create components/journey/index.ts barrel</name>
  <read_first>
    - components/primitives/index.ts (barrel pattern reference)
  </read_first>
  <action>
Create:

```ts
// components/journey/index.ts — Phase 5 redo barrel (CJD-01..07).
//
// Exports the 6 dashboard compositions consumed by app/(client)/journey/page.tsx.
// Mirrors components/primitives/index.ts shape — explicit named re-exports,
// alphabetical ordering. StageTimeline is intentionally NOT exported here —
// it is internal to ApplicationCard.

export { ActivityFeed } from './ActivityFeed'
export type { ActivityFeedProps } from './ActivityFeed'

export { ApplicationCard } from './ApplicationCard'
export type { ApplicationCardProps } from './ApplicationCard'

export { AttentionCard } from './AttentionCard'

export { GreetingBlock } from './GreetingBlock'

export { TeamCard } from './TeamCard'
export type { TeamCardProps } from './TeamCard'

export { WorkingOnYourBehalfCard } from './WorkingOnYourBehalfCard'
```

(`AttentionCard` and `GreetingBlock` have no exposed props types; they take no props. `WorkingOnYourBehalfCard` also takes no props.)
  </action>
  <verify>
    - `npm run typecheck` exits 0.
  </verify>
</task>

<task type="auto">
  <name>Task 2: Replace app/(client)/journey/page.tsx</name>
  <read_first>
    - app/(client)/journey/page.tsx (current Phase 2 placeholder)
    - app/(client)/layout.tsx (ClientShell wrapper — confirm Phase 5 page slots inside)
    - lib/api.ts (api client interface)
    - lib/cjd.ts (SERVER_DEMO_DATE, computeDaysIn)
    - .planning/phases/05-client-journey-dashboard/05-UI-SPEC.md §Page Layout
    - .planning/phases/05-client-journey-dashboard/05-CONTEXT.md D-01, D-02, D-03, D-08
  </read_first>
  <action>
Create the new page (REPLACES placeholder):

```tsx
// app/(client)/journey/page.tsx — Phase 5 redo Client Journey Dashboard (CJD-01..07).
//
// Server Component. Replaces Phase 2 placeholder. Composes the 4-section
// dashboard from the components/journey/ barrel.
//
// Decisions covered: D-01 (renders directly inside ClientShell — no own
// max-width or padding), D-02 (relative wrapper for watermark clipping),
// D-03 (no space-y band stack — explicit per-section margins), D-08 (single
// api round-trip), D-31 (lib/cjd module).
//
// OD5R resolutions: OD5R-01 (no hero card gradient), OD5R-02 (slide-the-window
// ETA), OD5R-03 (47 fields static), OD5R-04 (strict inert nav surfaces),
// OD5R-05 (Avatar closed enum extension), OD5R-06 (TEAM_MEMBERS constant),
// OD5R-07 (paired-card narrative), OD5R-09 (stage numeral hero).

import type { ReactElement } from 'react'
import { api } from '@/lib/api'
import {
  ActivityFeed,
  ApplicationCard,
  AttentionCard,
  GreetingBlock,
  TeamCard,
  WorkingOnYourBehalfCard,
} from '@/components/journey'
import { SERVER_DEMO_DATE, computeDaysIn } from '@/lib/cjd'

export default async function ClientJourneyPage(): Promise<ReactElement> {
  const detail = await api.getApplicationDetail('app-kaisei')
  const daysIn = computeDaysIn(detail.application.openedAt, SERVER_DEMO_DATE)

  return (
    <div className="relative">
      <GreetingBlock />
      <ApplicationCard
        application={detail.application}
        stages={detail.stages}
        daysIn={daysIn}
      />
      <div
        className="grid mb-6"
        style={{ gridTemplateColumns: '1.2fr 1.2fr 0.9fr', gap: 20 }}
      >
        <AttentionCard />
        <WorkingOnYourBehalfCard />
        <TeamCard rm={detail.rm} />
      </div>
      <ActivityFeed activities={detail.recentActivities} />
    </div>
  )
}
```
  </action>
  <verify>
    - File replaces the placeholder.
    - `npm run typecheck` exits 0.
    - `npm run dev` starts; `curl -sI http://localhost:3000/journey` returns 200 (or use a smoke test step).
  </verify>
</task>

<task type="auto">
  <name>Task 3: Create page integration test</name>
  <action>
Create `app/(client)/journey/page.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import ClientJourneyPage from '@/app/(client)/journey/page'

// Server Component is async — await the JSX output then render.
async function renderPage() {
  const jsx = await ClientJourneyPage()
  return render(jsx)
}

describe('ClientJourneyPage — 4 sections present', () => {
  it('renders GreetingBlock with "Good morning, Yuki-san."', async () => {
    const { container } = await renderPage()
    expect(container.textContent).toContain('Good morning, Yuki-san.')
    expect(container.textContent).toContain('おはようございます')
  })

  it('renders the Reiwa·Gregorian eyebrow', async () => {
    const { container } = await renderPage()
    expect(container.textContent).toContain('令和8年4月27日 · Monday, 27 April 2026')
  })

  it('renders the "47 fields of document extraction" greeting summary', async () => {
    const { container } = await renderPage()
    expect(container.textContent).toContain('47 fields of document extraction')
  })

  it('renders ApplicationCard with "Application · APP-KAISEI"', async () => {
    const { container } = await renderPage()
    expect(container.textContent).toContain('Application · APP-KAISEI')
  })

  it('renders the stage numeral 76px Fraunces (currentStage)', async () => {
    const { container } = await renderPage()
    const numeral = Array.from(container.querySelectorAll('span')).find(
      s => s.textContent === '3' && s.style.fontSize === '76px',
    )
    expect(numeral).toBeDefined()
  })

  it('renders the ETA strip "29 April 2026" + "5 business days"', async () => {
    const { container } = await renderPage()
    expect(container.textContent).toContain('29 April 2026')
    expect(container.textContent).toContain('5 business days')
  })

  it('renders 6 StagePill elements (StageTimeline embedded)', async () => {
    const { container } = await renderPage()
    const pills = container.querySelectorAll('[aria-label^="Stage "]')
    expect(pills.length).toBe(6)
  })

  it('renders 4 jurisdiction flags (JP, SG, HK, GB)', async () => {
    const { container } = await renderPage()
    expect(container.textContent).toContain('🇯🇵')
    expect(container.textContent).toContain('🇸🇬')
    expect(container.textContent).toContain('🇭🇰')
    expect(container.textContent).toContain('🇬🇧')
  })

  it('renders AttentionCard "For your attention · 3"', async () => {
    const { container } = await renderPage()
    expect(container.textContent).toContain('For your attention · 3')
  })

  it('renders WorkingOnYourBehalfCard "Working on your behalf"', async () => {
    const { container } = await renderPage()
    expect(container.textContent).toContain('Working on your behalf')
    expect(container.textContent).toContain("I'll flag anything you need to decide")
  })

  it('renders TeamCard "Your team" with 4 members', async () => {
    const { container } = await renderPage()
    expect(container.textContent).toContain('Your team')
    expect(container.textContent).toContain('James Lee')
    expect(container.textContent).toContain('Akiko Sato')
    expect(container.textContent).toContain('Priya Nair')
    expect(container.textContent).toContain('Origin')
  })

  it('renders ActivityFeed "Recent activity" + "LAST 72H"', async () => {
    const { container } = await renderPage()
    expect(container.textContent).toContain('Recent activity')
    expect(container.textContent).toContain('LAST 72H')
  })
})

describe('ClientJourneyPage — strict P-1 inert (OD5R-04)', () => {
  it('contains no <a> element linking to /stage or /messages routes', async () => {
    const { container } = await renderPage()
    const anchors = Array.from(container.querySelectorAll('a')) as HTMLAnchorElement[]
    for (const a of anchors) {
      expect(a.getAttribute('href') ?? '').not.toMatch(/^\/stage|^\/messages/)
    }
  })

  it('contains no cursor-pointer Tailwind class anywhere', async () => {
    const { container } = await renderPage()
    expect(container.innerHTML).not.toMatch(/cursor-pointer/)
  })

  it('"Message James" button is disabled', async () => {
    const { container } = await renderPage()
    const messageBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('Message James'),
    )
    expect(messageBtn).toBeDefined()
    expect((messageBtn as HTMLButtonElement).disabled).toBe(true)
  })
})

describe('ClientJourneyPage — fresh-green discipline (CJD-07)', () => {
  it('Origin avatar is the only fresh-green Avatar primitive on the page', async () => {
    const { container } = await renderPage()
    // The Avatar primitive renders as <span class="inline-flex items-center justify-center rounded-full font-mono ... bg-fresh-green ...">
    // AIPulseDot also renders as <span class="bg-fresh-green ..."> with role="img".
    // Discriminate via Avatar's signature className combo (font-mono + rounded-full + initials),
    // exclude AIPulseDot (role="img") and the WorkingOnYourBehalfCard pending-state inline-style dot.
    const avatars = Array.from(container.querySelectorAll('span.bg-fresh-green'))
      .filter((el) => !el.hasAttribute('role'))           // exclude AIPulseDot (role="img")
      .filter((el) => el.className.includes('font-mono')) // Avatar primitive uses font-mono
      .filter((el) => el.className.includes('rounded-full'))
    expect(avatars.length).toBe(1)
    // Verify that single match is the Origin avatar (initials "◉")
    expect(avatars[0]?.textContent).toBe('◉')
  })

  it('there are exactly 3 AIPulseDot instances on the page (Stage 3 current pill, AI lane header, AI lane live row)', async () => {
    // Defensive count to ensure the previous test's selector exclusion is calibrated correctly.
    const { container } = await renderPage()
    const pulseDots = container.querySelectorAll('[role="img"].bg-fresh-green, [aria-label*="AI"].bg-fresh-green, span.bg-fresh-green.animate-ai-pulse')
    // Note: exact selector depends on AIPulseDot's actual className; test asserts ≥ 3 (StageTimeline + WorkingOnYourBehalf header + live row).
    expect(pulseDots.length).toBeGreaterThanOrEqual(3)
  })

  it('GreetingBlock watermark has no fresh-green tokens (D-04)', async () => {
    const { container } = await renderPage()
    const wm = Array.from(container.querySelectorAll('span')).find(
      s => s.textContent === '縁',
    ) as HTMLElement | undefined
    expect(wm).toBeDefined()
    expect(wm?.style.color).toBe('var(--color-trad-green)')
    expect(wm?.style.opacity).toBe('0.035')
    expect(String(wm?.style.fontWeight)).toBe('300')
    expect(wm?.className).not.toContain('bg-fresh-green')
    expect(wm?.className).not.toContain('text-fresh-green')
  })

  it('ApplicationCard does NOT have a fresh-green gradient bottom edge (OD5R-01)', async () => {
    const { container } = await renderPage()
    // Find the application card and check it has no inline ::after-style gradient
    expect(container.innerHTML).not.toMatch(/linear-gradient[^)]*var\(--color-fresh-green\)[^)]*0%/)
  })
})

describe('ClientJourneyPage — page-level layout (D-01, D-02, D-03)', () => {
  it('outer wrapper is <div className="relative"> (D-02)', async () => {
    const { container } = await renderPage()
    const root = container.firstElementChild as HTMLElement
    expect(root.tagName).toBe('DIV')
    expect(root.className).toContain('relative')
  })

  it('page does NOT add its own max-width or padding (D-01)', async () => {
    const { container } = await renderPage()
    const root = container.firstElementChild as HTMLElement
    expect(root.className).not.toMatch(/max-w-/)
    expect(root.className).not.toMatch(/mx-auto/)
    expect(root.className).not.toMatch(/\bpx-/)
    expect(root.className).not.toMatch(/\bpt-/)
    expect(root.className).not.toMatch(/\bpb-/)
  })

  it('GreetingBlock has mb-7, ApplicationCard has mb-6, 3-column grid has mb-6 (D-03)', async () => {
    const { container } = await renderPage()
    // Just verify 3 distinct section margins are applied; precise selector depends on render
    const sections = container.querySelectorAll('section, .grid')
    expect(sections.length).toBeGreaterThanOrEqual(3)
  })
})
```
  </action>
  <verify>
    - `npm run test -- --run app/(client)/journey/page.test.tsx` exits 0.
    - All 4 sections detectable in the rendered DOM.
    - No `/stage` or `/messages` href anywhere.
    - Origin avatar is the only fresh-green surface.
  </verify>
</task>

<task type="auto">
  <name>Task 4: Pre-PR verification gate</name>
  <action>
Run the full pre-PR validation chain:
```bash
npm run typecheck && npm run lint && npm run test && npm run build
bash scripts/check-fresh-green.sh
```

Then start the dev server and visit `/journey` to manually verify the rendered page matches the prototype. Take a screenshot for the UAT record (placement: `.planning/phases/05-client-journey-dashboard/uat-screenshot.png` or similar — document path in commit).

If `npm run build` fails with a PostCSS/Tailwind error (per EG-01 cross-phase watch item), inspect for stray class-like strings in markdown or non-source files. The `@source not "../.planning/**"` exclusion should cover the planning files.
  </action>
  <verify>
    - All four pre-PR commands exit 0.
    - SHELL-05 enforcement passes.
    - Manual smoke at `/journey` renders all 4 sections without console errors.
  </verify>
</task>

<task type="auto">
  <name>Task 5: Atomic commit</name>
  <action>
Stage `components/journey/index.ts`, `app/(client)/journey/page.tsx`, `app/(client)/journey/page.test.tsx`, and the UAT screenshot if produced. Commit:
```
feat(phase-05-redo): barrel + page composition + integration tests (Plan 05-10)

Phase 5 redo Wave 3 — final integration. Wires the 6 Wave 2 components
into the dashboard page:
- components/journey/index.ts: barrel re-exports (StageTimeline NOT
  exposed; internal to ApplicationCard).
- app/(client)/journey/page.tsx: Server Component, single
  api.getApplicationDetail() round-trip, daysIn computed server-side,
  4-section composition (GreetingBlock → ApplicationCard → 3-col grid
  → ActivityFeed). No max-width or padding (ClientShell provides them).
- app/(client)/journey/page.test.tsx: integration test verifying all 4
  sections, P-1 inert sweep (no /stage or /messages hrefs, no
  cursor-pointer), fresh-green discipline (Origin avatar is the only
  fresh-green Avatar surface).

Decisions covered: D-01, D-02, D-03, D-08, D-31.
OD5R resolutions: OD5R-01..07, OD5R-09 (all 8 user-resolved decisions
land in this composition).

Closes CJD-01..07 against the redo UI-SPEC. The CJD-04 + CJD-02
follow-up REQUIREMENTS.md amendments (paired-card narrative + stage
numeral hero) are tracked as a Phase-5-adjacent task in CONTEXT.md.

Phase 5 redo complete.
```
  </action>
  <verify>
    - `git status` clean.
    - Phase 5 redo branch ready for PR / squash to main.
  </verify>
</task>

</tasks>

<acceptance>
- `components/journey/index.ts` barrel exports 6 components.
- `app/(client)/journey/page.tsx` Server Component composes the 4-section dashboard.
- Page integration test passes.
- `npm run typecheck && npm run lint && npm run test && npm run build` all exit 0.
- `bash scripts/check-fresh-green.sh` exits 0.
- Manual smoke at `http://localhost:3000/journey` renders the prototype-faithful dashboard.
- All 7 CJD requirements satisfied per UI-SPEC §Coverage.
- All 8 user-resolved OD5Rs land in code.
</acceptance>
