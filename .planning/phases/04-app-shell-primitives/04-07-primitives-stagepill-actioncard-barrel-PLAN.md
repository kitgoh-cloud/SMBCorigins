---
phase: 04-app-shell-primitives
plan: 07
type: execute
wave: 3
depends_on: [04-01, 04-05, 04-06]
files_modified:
  - components/primitives/StagePill.tsx
  - components/primitives/StagePill.test.tsx
  - components/primitives/ActionCard.tsx
  - components/primitives/ActionCard.test.tsx
  - components/primitives/index.ts
autonomous: true
requirements: [SHELL-04]
tags: [primitives, stage-pill, action-card, barrel-export, closed-enum]

must_haves:
  truths:
    - "StagePill renders a circular numbered disc with closed enums n: 1..6 and state: 'done' | 'current' | 'upcoming'; ✓ shown for done state; pure presentational (does NOT consume Application or call deriveStages per D-74)"
    - "ActionCard is a row primitive (not container card) with slot-shaped indicator/cta; renders as <button> when onClick provided, <div> otherwise; uses 'use client' directive when interactive"
    - "components/primitives/index.ts barrel exports all 8 primitives + their public types in alphabetical order"
  artifacts:
    - path: "components/primitives/StagePill.tsx"
      provides: "StagePill primitive — circular numbered disc 1..6 with done/current/upcoming states"
      exports: ["StagePill", "StagePillState"]
    - path: "components/primitives/ActionCard.tsx"
      provides: "ActionCard row primitive with slot-shaped indicator/cta + onClick interaction"
      exports: ["ActionCard"]
    - path: "components/primitives/index.ts"
      provides: "Barrel export of all 8 primitives + public types"
      exports: ["Eyebrow", "StatusChip", "StagePill", "AIPulseDot", "AIBadge", "ActionCard", "Icon", "Avatar", "StatusChipKind", "StagePillState", "IconName", "AvatarColor"]
  key_links:
    - from: "components/primitives/StagePill.tsx"
      to: "types/origin.ts StageNumber"
      via: "import type StageNumber"
      pattern: "import type \\{ StageNumber \\}"
    - from: "components/primitives/index.ts"
      to: "all 8 primitive files"
      via: "named re-exports"
      pattern: "export \\{"
---

<objective>
Complete the primitive set: StagePill (closed-enum numbered disc, consumes types/origin StageNumber type — exact-match analog from PATTERNS.md), ActionCard (the only `'use client'` primitive — interactive when onClick is provided per UI-SPEC Interaction States), and the barrel `index.ts` that re-exports all 8 primitives so consumers can `import { Eyebrow, StatusChip, ... } from '@/components/primitives'`.

This plan lands AFTER Plans 04-05 and 04-06 (Wave 2) so the barrel export references existing files. The barrel is named-exports only (not `export *`) for self-documentation and tree-shake friendliness.

Output:
- `components/primitives/StagePill.tsx` + `.test.tsx`
- `components/primitives/ActionCard.tsx` + `.test.tsx`
- `components/primitives/index.ts` (barrel)
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/04-app-shell-primitives/04-CONTEXT.md
@.planning/phases/04-app-shell-primitives/04-RESEARCH.md
@.planning/phases/04-app-shell-primitives/04-PATTERNS.md
@.planning/phases/04-app-shell-primitives/04-UI-SPEC.md
@types/origin.ts

<interfaces>
<!-- types/origin.ts (line 47) — StageNumber export Phase 4 imports -->
```ts
export type StageNumber = 1 | 2 | 3 | 4 | 5 | 6
```

<!-- StagePill state mapping — RESEARCH §5.4 verbatim from /tmp/proto_primitives.js lines 186-208 -->
```ts
const STYLES_BY_STATE = {
  done:     'bg-trad-green text-paper',
  current:  'bg-paper text-trad-green border-2 border-trad-green',
  upcoming: 'bg-mist text-ink-muted',
}
```
- done glyph: `✓` (Unicode U+2713 CHECK MARK — literal character in JSX)
- current/upcoming glyph: the number `n` (1..6)
- Diameter: 34px per UI-SPEC OD-2
- Numeral typography: Fraunces 600 at fontSize size×0.44 (UI-SPEC Typography 14/600 for the locked numeral tier)
- Optional: `fontVariationSettings: '"SOFT" 60, "WONK" 1'` per RESEARCH §5.4 — but per OD-12 strategy (b), SOFT/WONK is applied INLINE only at the wordmark in TopStrip. StagePill's numeral does NOT use SOFT/WONK in Phase 4 (consistent with strategy b's "smallest blast radius" rationale). If Phase 5+ wants StagePill to also use SOFT/WONK, that phase revisits.

<!-- ActionCard props — UI-SPEC Component Inventory + D-76 -->
```ts
type ActionCardProps = {
  title: string
  meta?: string
  indicator?: ReactNode  // slot-shaped (not enumerated union)
  cta?: ReactNode        // slot-shaped
  onClick?: () => void
  faint?: boolean
}
```

<!-- ActionCard interaction states — UI-SPEC "Interaction States" -->
- Default (no onClick): `cursor: default`, no hover/focus-visible (presentational)
- Default + onClick: `cursor: pointer`
- Hover (when onClick): `bg-paper-deep` (subtle bg lift; no border change)
- Focus-visible (keyboard, when onClick): `outline-2 outline-trad-green outline-offset-2` (2px solid outline, 2px offset)
- Active (mouse-down/keyboard, when onClick): `bg-mist`
- faint=true: text rendered with `text-ink-muted`; indicator at 60% opacity (caller's responsibility for visual de-emphasis)
- Disabled / loading: N/A in Phase 4 — UI-SPEC line 381–382 explicitly says no `disabled` or `loading` props in this phase

<!-- ActionCard rendering: <button type="button"> when onClick, <div> otherwise -->
- onClick provided: `<button type="button" onClick={...}>` — native focus-visible + keyboard activation
- onClick absent: `<div>` — purely presentational
- 'use client' directive REQUIRED on ActionCard.tsx (per RESEARCH Pitfall 3 — interactive components need client boundary; the file ships ready for onClick callers regardless of how the FIRST consumer uses it)
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Create StagePill.tsx + test (closed enum n: 1..6 × state: done/current/upcoming)</name>
  <read_first>
    - .planning/phases/04-app-shell-primitives/04-UI-SPEC.md §"Component Inventory" StagePill row (line 249) — props
    - .planning/phases/04-app-shell-primitives/04-CONTEXT.md D-74 — pure presentational; consumer renders stage names
    - .planning/phases/04-app-shell-primitives/04-RESEARCH.md §5.4 (lines 1023–1045) — verbatim per-state styles + ✓ glyph
    - .planning/phases/04-app-shell-primitives/04-PATTERNS.md §"components/primitives/StagePill.tsx" (lines 311–337) — closest analog: uses `StageNumber` from `@/types/origin`
    - /Users/wyekitgoh/Projects/SMBCorigins/types/origin.ts (line 47) — verify `StageNumber` export shape
  </read_first>
  <behavior>
    - Test 1: For each n=1..6 with state='upcoming', renders the numeral n inside the disc
    - Test 2: For state='done' with any n, renders the ✓ glyph (NOT the numeral)
    - Test 3: For state='current', renders the numeral and the disc has the `border-2 border-trad-green` class
    - Test 4: For state='done', the disc has `bg-trad-green text-paper` classes
    - Test 5: For state='upcoming', the disc has `bg-mist text-ink-muted` classes
    - Test 6: Default size=34 produces inline width:34px, height:34px (UI-SPEC OD-2)
    - Test 7: Default font is Fraunces (verifiable: classList contains `font-display`)
    - Test 8: Disc is rounded-full
  </behavior>
  <files>components/primitives/StagePill.tsx, components/primitives/StagePill.test.tsx</files>
  <action>
    Create `components/primitives/StagePill.tsx`:

    ```tsx
    // components/primitives/StagePill.tsx — Phase 4 SHELL-04 stage primitive (D-74).
    // Pure presentational circular numbered disc. Imports StageNumber from
    // @/types/origin (cross-boundary read of the existing closed literal — the only
    // primitive that consumes the contract types per PATTERNS.md exact-match analog).
    // Consumer renders stage names — this primitive is name-agnostic per D-74.
    // No fresh-green tokens (StagePill is not an AI surface).

    import type { CSSProperties, ReactElement } from 'react'
    import type { StageNumber } from '@/types/origin'

    export type StagePillState = 'done' | 'current' | 'upcoming'

    type StageStyles = {
      readonly bg: string
      readonly text: string
      readonly border: string
    }

    const STYLES_BY_STATE: Record<StagePillState, StageStyles> = {
      done: {
        bg: 'bg-trad-green',
        text: 'text-paper',
        border: '',
      },
      current: {
        bg: 'bg-paper',
        text: 'text-trad-green',
        border: 'border-2 border-trad-green',
      },
      upcoming: {
        bg: 'bg-mist',
        text: 'text-ink-muted',
        border: '',
      },
    }

    export type StagePillProps = {
      n: StageNumber
      state: StagePillState
      size?: number
    }

    export function StagePill({ n, state, size = 34 }: StagePillProps): ReactElement {
      const styles = STYLES_BY_STATE[state]
      const sizeStyle: CSSProperties = {
        width: size,
        height: size,
        fontSize: Math.round(size * 0.44),
        flexShrink: 0,
      }
      const className = [
        'inline-flex items-center justify-center rounded-full',
        'font-display font-semibold leading-none',
        styles.bg,
        styles.text,
        styles.border,
      ]
        .filter(Boolean)
        .join(' ')
      const glyph = state === 'done' ? '✓' : n
      return (
        <span className={className} style={sizeStyle} aria-label={`Stage ${n} ${state}`}>
          {glyph}
        </span>
      )
    }
    ```

    Conventions:
    - `import type { StageNumber }` from `@/types/origin` — cross-boundary type read (allowed: presentational consumer; PATTERNS.md line 313 confirms)
    - Closed `Record<StagePillState, StageStyles>` typing
    - `font-display` (Fraunces) + `font-semibold` (weight 600) per UI-SPEC Typography 14/600 numeral row
    - `font-size: size * 0.44` matches the prototype's proportional scaling (RESEARCH §5.4 line 1044)
    - The literal character `✓` (U+2713) — JSX accepts as text content directly
    - `aria-label="Stage N <state>"` for screen readers (since the visual is just a number)
    - NO inline `fontVariationSettings` — Phase 4 OD-12 strategy (b) applies SOFT/WONK only to the wordmark; the numeral does NOT consume SOFT/WONK (consistent with strategy b's "smallest blast radius")
    - NO fresh-green tokens (verifiable via grep)

    Create `components/primitives/StagePill.test.tsx`:

    ```tsx
    /**
     * components/primitives/StagePill.test.tsx — Tests for StagePill (SHELL-04, D-74).
     */

    import { describe, it, expect } from 'vitest'
    import { render } from '@testing-library/react'
    import { StagePill, type StagePillState } from '@/components/primitives/StagePill'
    import type { StageNumber } from '@/types/origin'

    const ALL_NUMBERS: ReadonlyArray<StageNumber> = [1, 2, 3, 4, 5, 6]
    const ALL_STATES: ReadonlyArray<StagePillState> = ['done', 'current', 'upcoming']

    describe('components/primitives/StagePill (SHELL-04, D-74)', () => {
      it('renders the numeral 1..6 when state is upcoming', () => {
        for (const n of ALL_NUMBERS) {
          const { container } = render(<StagePill n={n} state="upcoming" />)
          expect(container.textContent).toBe(String(n))
        }
      })

      it('renders the ✓ glyph when state is done (regardless of n)', () => {
        for (const n of ALL_NUMBERS) {
          const { container } = render(<StagePill n={n} state="done" />)
          expect(container.textContent).toBe('✓')
        }
      })

      it('renders the numeral when state is current (NOT ✓)', () => {
        for (const n of ALL_NUMBERS) {
          const { container } = render(<StagePill n={n} state="current" />)
          expect(container.textContent).toBe(String(n))
        }
      })

      it('state=done has bg-trad-green and text-paper', () => {
        const { container } = render(<StagePill n={1} state="done" />)
        const span = container.firstElementChild as HTMLElement
        expect(span.className).toContain('bg-trad-green')
        expect(span.className).toContain('text-paper')
      })

      it('state=current has border-2 border-trad-green', () => {
        const { container } = render(<StagePill n={2} state="current" />)
        const span = container.firstElementChild as HTMLElement
        expect(span.className).toContain('bg-paper')
        expect(span.className).toContain('text-trad-green')
        expect(span.className).toContain('border-2')
        expect(span.className).toContain('border-trad-green')
      })

      it('state=upcoming has bg-mist and text-ink-muted', () => {
        const { container } = render(<StagePill n={3} state="upcoming" />)
        const span = container.firstElementChild as HTMLElement
        expect(span.className).toContain('bg-mist')
        expect(span.className).toContain('text-ink-muted')
      })

      it('default size is 34 (UI-SPEC OD-2)', () => {
        const { container } = render(<StagePill n={1} state="upcoming" />)
        const span = container.firstElementChild as HTMLElement
        expect(span.style.width).toBe('34px')
        expect(span.style.height).toBe('34px')
        expect(span.style.fontSize).toBe('15px') // round(34 * 0.44) = 15
      })

      it('size prop overrides default', () => {
        const { container } = render(<StagePill n={1} state="upcoming" size={48} />)
        const span = container.firstElementChild as HTMLElement
        expect(span.style.width).toBe('48px')
        expect(span.style.height).toBe('48px')
      })

      it('disc is rounded-full and uses font-display (Fraunces) at semibold weight', () => {
        const { container } = render(<StagePill n={1} state="upcoming" />)
        const span = container.firstElementChild as HTMLElement
        expect(span.className).toContain('rounded-full')
        expect(span.className).toContain('font-display')
        expect(span.className).toContain('font-semibold')
      })

      it('aria-label communicates "Stage N state" for accessibility', () => {
        const { container } = render(<StagePill n={4} state="current" />)
        const span = container.firstElementChild as HTMLElement
        expect(span.getAttribute('aria-label')).toBe('Stage 4 current')
      })

      it('renders all 18 (n × state) combinations without throwing', () => {
        for (const n of ALL_NUMBERS) {
          for (const state of ALL_STATES) {
            expect(() => render(<StagePill n={n} state={state} />)).not.toThrow()
          }
        }
      })
    })
    ```
  </action>
  <verify>
    <automated>
    test -f components/primitives/StagePill.tsx && grep -q "import type { StageNumber } from '@/types/origin'" components/primitives/StagePill.tsx && ! grep -E "(fresh-green|#[Bb][Ff][Dd]7[3]0)" components/primitives/StagePill.tsx && npm run test -- components/primitives/StagePill.test.tsx && npm run typecheck
    </automated>
  </verify>
  <acceptance_criteria>
    - File `components/primitives/StagePill.tsx` exists
    - File imports `StageNumber` from `@/types/origin` (cross-boundary type read)
    - File exports `StagePillState` as the literal union `'done' | 'current' | 'upcoming'`
    - File exports `StagePill` named function and `StagePillProps` type
    - Per-state mapping locked: done = bg-trad-green/text-paper, current = bg-paper/text-trad-green/border-2/border-trad-green, upcoming = bg-mist/text-ink-muted
    - Glyph: `✓` for done, the numeric `n` otherwise
    - Default size: 34px (UI-SPEC OD-2)
    - Font: `font-display` (Fraunces) + `font-semibold` (600 weight)
    - aria-label: `"Stage {n} {state}"` for accessibility
    - File has NO fresh-green tokens
    - File has NO inline `fontVariationSettings` (OD-12 strategy b consistency)
    - File `components/primitives/StagePill.test.tsx` exists with ≥10 test cases
    - The "renders all 18 combinations without throwing" test ensures every n × state combination is exhaustively rendered
    - `npm run test -- components/primitives/StagePill.test.tsx` exits 0
    - `npm run typecheck` exits 0 (closed enums + StageNumber import resolve)
  </acceptance_criteria>
  <done>StagePill primitive with closed enums + verbatim per-state mapping + tests covering 18 combinations + 10+ assertions.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Create ActionCard.tsx + test (the only 'use client' primitive; UI-SPEC Interaction States)</name>
  <read_first>
    - .planning/phases/04-app-shell-primitives/04-UI-SPEC.md §"Component Inventory" ActionCard row (line 252)
    - .planning/phases/04-app-shell-primitives/04-UI-SPEC.md §"Interaction States > ActionCard" (lines 369–384) — hover/focus/active/faint contract
    - .planning/phases/04-app-shell-primitives/04-CONTEXT.md D-76 (lines 50) — slot-shaped indicator/cta; row primitive (NOT container card)
    - .planning/phases/04-app-shell-primitives/04-RESEARCH.md §"Pitfall 3: 'use client' cascade contamination" (lines 467–476)
    - .planning/phases/04-app-shell-primitives/04-PATTERNS.md §"components/primitives/ActionCard.tsx" (lines 362–394)
    - /Users/wyekitgoh/Projects/SMBCorigins/app/page.tsx (lines 91–110 — SwatchGrid card-row analog)
  </read_first>
  <behavior>
    - Test 1: With onClick provided, renders as `<button type="button">`
    - Test 2: Without onClick, renders as `<div>`
    - Test 3: title prop renders as text content
    - Test 4: meta prop renders below title (when provided)
    - Test 5: indicator slot renders the passed ReactNode
    - Test 6: cta slot renders the passed ReactNode
    - Test 7: onClick fires when the button is clicked (use fireEvent.click)
    - Test 8: faint=true applies text-ink-muted to text + opacity-60 to indicator (or wraps indicator with the opacity)
    - Test 9: When onClick provided, classList contains `cursor-pointer`
    - Test 10: When onClick absent, classList contains `cursor-default` (or no cursor utility — implicit)
  </behavior>
  <files>components/primitives/ActionCard.tsx, components/primitives/ActionCard.test.tsx</files>
  <action>
    Create `components/primitives/ActionCard.tsx` — note the `'use client'` directive on line 1:

    ```tsx
    'use client'

    // components/primitives/ActionCard.tsx — Phase 4 SHELL-04 row primitive (D-76).
    // ActionCard is a row primitive (NOT container card). Indicator and cta are
    // slot-shaped ReactNodes — composers pass <AIPulseDot/>, <StatusChip kind="amber" dot/>,
    // an inline priority bar div, etc. The 4 prototype row variants (ActionRow, NeedsYouRow,
    // AILaneRow, OvernightRow) become composition recipes — consuming phases assemble.
    //
    // 'use client' directive at top: ActionCard ships ready for onClick callers per
    // RESEARCH Pitfall 3. Cost is small for a single primitive; alternative is two
    // versions (server+client) which adds maintenance.
    //
    // Interaction states locked per UI-SPEC Interaction States table:
    //   - default (no onClick): cursor-default, no hover/focus
    //   - default + onClick: cursor-pointer
    //   - hover (onClick): bg-paper-deep (subtle bg lift)
    //   - focus-visible (onClick): 2px outline trad-green, 2px offset
    //   - active (onClick): bg-mist
    //   - faint=true: text-ink-muted text, indicator wrapped in opacity-60
    //   - disabled / loading: N/A in Phase 4 (no consumer; UI-SPEC line 381-382)
    //
    // No fresh-green tokens (ActionCard is not an AI-presence primitive; AI rows
    // compose ActionCard + AIBadge in their own card header).

    import type { ReactNode, ReactElement } from 'react'

    export type ActionCardProps = {
      title: string
      meta?: string
      indicator?: ReactNode
      cta?: ReactNode
      onClick?: () => void
      faint?: boolean
    }

    export function ActionCard({
      title,
      meta,
      indicator,
      cta,
      onClick,
      faint = false,
    }: ActionCardProps): ReactElement {
      const isInteractive = typeof onClick === 'function'

      const baseClasses = [
        'flex items-center gap-3 w-full',
        'bg-paper border border-mist rounded-card',
        'px-4 py-3 text-left',
        'transition-colors duration-200 ease-out',
      ]
      const interactiveClasses = isInteractive
        ? [
            'cursor-pointer',
            'hover:bg-paper-deep',
            'focus-visible:outline-2 focus-visible:outline-trad-green focus-visible:outline-offset-2',
            'active:bg-mist',
          ]
        : ['cursor-default']
      const className = [...baseClasses, ...interactiveClasses].join(' ')

      const titleClass = faint ? 'text-ink-muted' : 'text-ink'
      const metaClass = faint ? 'text-ink-muted/70' : 'text-ink-soft'
      const wrappedIndicator = faint && indicator ? (
        <span className="opacity-60">{indicator}</span>
      ) : indicator

      const inner = (
        <>
          {wrappedIndicator ? <span className="flex-shrink-0">{wrappedIndicator}</span> : null}
          <span className="flex flex-col flex-1 min-w-0">
            <span className={`font-body text-[14px] leading-tight ${titleClass}`}>{title}</span>
            {meta ? (
              <span className={`font-mono text-[10px] mt-1 leading-tight ${metaClass}`}>{meta}</span>
            ) : null}
          </span>
          {cta ? <span className="flex-shrink-0">{cta}</span> : null}
        </>
      )

      if (isInteractive) {
        return (
          <button type="button" className={className} onClick={onClick}>
            {inner}
          </button>
        )
      }
      return <div className={className}>{inner}</div>
    }
    ```

    Conventions:
    - `'use client'` on line 1 (per RESEARCH Pitfall 3 — ActionCard ships ready for onClick callers)
    - `transition-colors duration-200 ease-out` matches UI-SPEC's shared 200ms transition baseline (line 365)
    - `focus-visible:outline-2 focus-visible:outline-trad-green focus-visible:outline-offset-2` is the locked focus pattern (UI-SPEC line 367 — 2px outline, 2px offset, NOT box-shadow ring)
    - `active:bg-mist` for keyboard/mouse activation feedback
    - `<button type="button">` when onClick provided — gets focus-visible + keyboard activation for free
    - `<div>` when onClick absent — purely presentational, no focus ring
    - faint wraps indicator in `<span className="opacity-60">` for the 60% indicator opacity rule (UI-SPEC line 380)
    - meta uses `font-mono text-[10px]` matching UI-SPEC Eyebrow tier (line 116) since meta typically renders timestamps/IDs
    - title uses `font-body text-[14px]` matching UI-SPEC Body tier
    - NO fresh-green tokens

    Create `components/primitives/ActionCard.test.tsx`:

    ```tsx
    /**
     * components/primitives/ActionCard.test.tsx — Tests for ActionCard (SHELL-04, D-76).
     */

    import { describe, it, expect, vi } from 'vitest'
    import { render, fireEvent } from '@testing-library/react'
    import { ActionCard } from '@/components/primitives/ActionCard'

    describe('components/primitives/ActionCard (SHELL-04, D-76)', () => {
      it('renders title text', () => {
        const { container } = render(<ActionCard title="Review documents" />)
        expect(container.textContent).toContain('Review documents')
      })

      it('renders meta when provided', () => {
        const { container } = render(<ActionCard title="Title" meta="2026-04-26 14:30" />)
        expect(container.textContent).toContain('2026-04-26 14:30')
      })

      it('omits meta block when meta is undefined', () => {
        const { container } = render(<ActionCard title="Title only" />)
        const elements = container.querySelectorAll('span')
        const metaSpans = Array.from(elements).filter((el) =>
          el.className.includes('font-mono'),
        )
        expect(metaSpans.length).toBe(0)
      })

      it('renders as <div> when onClick is not provided', () => {
        const { container } = render(<ActionCard title="Static row" />)
        const root = container.firstElementChild
        expect(root?.tagName.toLowerCase()).toBe('div')
      })

      it('renders as <button type="button"> when onClick is provided', () => {
        const onClick = vi.fn()
        const { container } = render(<ActionCard title="Click me" onClick={onClick} />)
        const root = container.firstElementChild as HTMLButtonElement
        expect(root.tagName.toLowerCase()).toBe('button')
        expect(root.getAttribute('type')).toBe('button')
      })

      it('onClick fires when the button is clicked', () => {
        const onClick = vi.fn()
        const { container } = render(<ActionCard title="Click" onClick={onClick} />)
        const button = container.firstElementChild as HTMLButtonElement
        fireEvent.click(button)
        expect(onClick).toHaveBeenCalledTimes(1)
      })

      it('renders indicator slot ReactNode (left side)', () => {
        const { container } = render(
          <ActionCard
            title="With indicator"
            indicator={<span data-testid="ind">!</span>}
          />,
        )
        expect(container.querySelector('[data-testid="ind"]')).not.toBeNull()
      })

      it('renders cta slot ReactNode (right side)', () => {
        const { container } = render(
          <ActionCard title="With cta" cta={<span data-testid="cta">→</span>} />,
        )
        expect(container.querySelector('[data-testid="cta"]')).not.toBeNull()
      })

      it('faint=true applies text-ink-muted to title', () => {
        const { container } = render(<ActionCard title="Old row" faint />)
        const titleSpan = container.querySelector('span > span:not(.flex-shrink-0)')
        // The title span has font-body class; find it
        const allSpans = container.querySelectorAll('span')
        const found = Array.from(allSpans).find((el) => el.className.includes('font-body'))
        expect(found?.className).toContain('text-ink-muted')
      })

      it('faint=true wraps indicator in opacity-60', () => {
        const { container } = render(
          <ActionCard
            title="Faint row"
            faint
            indicator={<span data-testid="ind">!</span>}
          />,
        )
        // The indicator's parent wrapper carries opacity-60 (or the indicator itself does)
        const ind = container.querySelector('[data-testid="ind"]')
        const wrapper = ind?.closest('span.opacity-60')
        expect(wrapper).not.toBeNull()
      })

      it('interactive: classList contains cursor-pointer + hover/focus utilities', () => {
        const { container } = render(<ActionCard title="Click" onClick={() => {}} />)
        const root = container.firstElementChild as HTMLElement
        expect(root.className).toContain('cursor-pointer')
        expect(root.className).toContain('hover:bg-paper-deep')
        expect(root.className).toContain('focus-visible:outline-2')
        expect(root.className).toContain('focus-visible:outline-trad-green')
        expect(root.className).toContain('focus-visible:outline-offset-2')
        expect(root.className).toContain('active:bg-mist')
      })

      it('non-interactive: classList contains cursor-default; no hover/focus utilities', () => {
        const { container } = render(<ActionCard title="Static" />)
        const root = container.firstElementChild as HTMLElement
        expect(root.className).toContain('cursor-default')
        expect(root.className).not.toContain('hover:bg-paper-deep')
        expect(root.className).not.toContain('focus-visible')
      })

      it('classList contains transition-colors duration-200 ease-out (shared 200ms baseline)', () => {
        const { container } = render(<ActionCard title="row" />)
        const root = container.firstElementChild as HTMLElement
        expect(root.className).toContain('transition-colors')
        expect(root.className).toContain('duration-200')
        expect(root.className).toContain('ease-out')
      })
    })
    ```
  </action>
  <verify>
    <automated>
    test -f components/primitives/ActionCard.tsx && head -1 components/primitives/ActionCard.tsx | grep -q "'use client'" && ! grep -E "(fresh-green|#[Bb][Ff][Dd]7[3]0)" components/primitives/ActionCard.tsx && grep -q "type=\"button\"" components/primitives/ActionCard.tsx && npm run test -- components/primitives/ActionCard.test.tsx && npm run typecheck && npm run lint
    </automated>
  </verify>
  <acceptance_criteria>
    - File `components/primitives/ActionCard.tsx` exists with `'use client'` on line 1
    - File exports `ActionCard` named function and `ActionCardProps` type
    - Props: `title: string`, `meta?: string`, `indicator?: ReactNode`, `cta?: ReactNode`, `onClick?: () => void`, `faint?: boolean`
    - Renders `<button type="button">` when onClick provided; `<div>` otherwise
    - Interactive classes when onClick: `cursor-pointer`, `hover:bg-paper-deep`, `focus-visible:outline-2 focus-visible:outline-trad-green focus-visible:outline-offset-2`, `active:bg-mist`
    - Non-interactive: `cursor-default` (no hover/focus utilities)
    - faint=true: title uses `text-ink-muted`; indicator wrapped in `<span className="opacity-60">`
    - Shared transition baseline: `transition-colors duration-200 ease-out`
    - File has NO fresh-green tokens
    - File `components/primitives/ActionCard.test.tsx` exists with ≥12 test cases including: title/meta render, button-vs-div based on onClick, onClick fires via fireEvent, indicator/cta slots render, faint applies text-ink-muted + opacity-60, interactive class set, non-interactive class set, transition baseline class set
    - `npm run test -- components/primitives/ActionCard.test.tsx` exits 0
    - `npm run typecheck` exits 0
    - `npm run lint` exits 0
  </acceptance_criteria>
  <done>ActionCard 'use client' primitive with full interaction-state contract per UI-SPEC; tests cover 12+ scenarios including onClick fireEvent + faint visual de-emphasis.</done>
</task>

<task type="auto" tdd="false">
  <name>Task 3: Create components/primitives/index.ts barrel export</name>
  <read_first>
    - All 8 primitive .tsx files (verify exports exist before barrel re-exports them):
      - components/primitives/Eyebrow.tsx (Plan 04-05) — exports `Eyebrow`, `EyebrowProps` (type)
      - components/primitives/StatusChip.tsx (Plan 04-06) — exports `StatusChip`, `StatusChipKind`, `StatusChipProps`
      - components/primitives/StagePill.tsx (Plan 04-07 Task 1) — exports `StagePill`, `StagePillState`, `StagePillProps`
      - components/primitives/AIPulseDot.tsx (Plan 04-06) — exports `AIPulseDot`, `AIPulseDotProps`
      - components/primitives/AIBadge.tsx (Plan 04-06) — exports `AIBadge`, `AIBadgeProps`
      - components/primitives/ActionCard.tsx (Plan 04-07 Task 2) — exports `ActionCard`, `ActionCardProps`
      - components/primitives/Icon.tsx (Plan 04-05) — exports `Icon`, `IconName`, `IconProps`
      - components/primitives/Avatar.tsx (Plan 04-05) — exports `Avatar`, `AvatarColor`, `AvatarProps`
    - .planning/phases/04-app-shell-primitives/04-PATTERNS.md §"components/primitives/index.ts" (lines 422–442) — recommended shape
  </read_first>
  <files>components/primitives/index.ts</files>
  <action>
    Create `components/primitives/index.ts` with explicit named re-exports (NOT `export *`) — alphabetical for self-documentation. Includes both runtime exports and `export type` re-exports for the public types. Keep the file flat and easy to grep:

    ```ts
    // components/primitives/index.ts — Phase 4 SHELL-04 barrel export.
    //
    // Re-exports the 8 primitives + their public types so consumers can import
    // from a single path: `import { Eyebrow, StatusChip, ... } from '@/components/primitives'`.
    //
    // Explicit named re-exports (NOT `export *`) — keeps the barrel self-documenting
    // and tree-shake friendly. Alphabetical ordering for readability.

    // Components (alphabetical)
    export { ActionCard } from './ActionCard'
    export { AIBadge } from './AIBadge'
    export { AIPulseDot } from './AIPulseDot'
    export { Avatar } from './Avatar'
    export { Eyebrow } from './Eyebrow'
    export { Icon } from './Icon'
    export { StagePill } from './StagePill'
    export { StatusChip } from './StatusChip'

    // Public types (alphabetical)
    export type { ActionCardProps } from './ActionCard'
    export type { AIBadgeProps } from './AIBadge'
    export type { AIPulseDotProps } from './AIPulseDot'
    export type { AvatarColor, AvatarProps } from './Avatar'
    export type { EyebrowProps } from './Eyebrow'
    export type { IconName, IconProps } from './Icon'
    export type { StagePillProps, StagePillState } from './StagePill'
    export type { StatusChipKind, StatusChipProps } from './StatusChip'
    ```

    Conventions:
    - 8 component re-exports, alphabetical
    - 12 type re-exports (some files export 1 type, some 2): ActionCardProps, AIBadgeProps, AIPulseDotProps, AvatarColor, AvatarProps, EyebrowProps, IconName, IconProps, StagePillProps, StagePillState, StatusChipKind, StatusChipProps
    - `export type` keyword for type-only re-exports (preserves erasure under `isolatedModules` / `verbatimModuleSyntax`)
    - NO `export *` (anti-pattern; loses self-documentation)
    - NO default exports
    - File-header comment summarizes purpose
  </action>
  <verify>
    <automated>
    test -f components/primitives/index.ts && grep -c "^export { " components/primitives/index.ts | awk '{exit ($1 != 8)}' && grep -c "^export type" components/primitives/index.ts | awk '{exit ($1 != 8)}' && npm run typecheck && npm run lint
    </automated>
  </verify>
  <acceptance_criteria>
    - File `components/primitives/index.ts` exists
    - File contains exactly 8 lines starting with `export { ` (one per component): ActionCard, AIBadge, AIPulseDot, Avatar, Eyebrow, Icon, StagePill, StatusChip
    - File contains 8 lines starting with `export type` (some lines re-export 2 types from one file: AvatarColor+AvatarProps, IconName+IconProps, StagePillProps+StagePillState, StatusChipKind+StatusChipProps; others 1: ActionCardProps, AIBadgeProps, AIPulseDotProps, EyebrowProps)
    - File has NO `export *` statements
    - File has NO `export default`
    - All re-exports resolve at typecheck time (`npm run typecheck` exits 0)
    - `npm run lint` exits 0
    - Test consumer pattern: from any test file, `import { Eyebrow, StatusChip, type StatusChipKind } from '@/components/primitives'` resolves cleanly (verifiable by writing a minimal test that imports from the barrel)
  </acceptance_criteria>
  <done>Barrel index.ts exists with explicit named re-exports of 8 primitives + 12 public types; typecheck + lint pass.</done>
</task>

</tasks>

<threat_model>
This plan completes the primitive set. Applicable ASVS categories: V5 Input Validation (children + onClick handler), V14 Configuration (closed enums + 'use client' boundary).

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-04-07-01 | V5 Input Validation | ActionCard onClick handler | accept | Caller-provided callback; React's standard event handling. No string-eval; no command injection vector. Phase 4 callers (in TopStrip / chrome) pass static handlers; Phase 5+ may pass api-bound handlers — same React safety applies. |
| T-04-07-02 | V14 / Closed enum drift | StagePillState | mitigate | Closed `'done' | 'current' | 'upcoming'` union prevents drift; the per-state STYLES_BY_STATE Record is keyed by the union, so any future addition to the union without a styles entry fails at compile. |
| T-04-07-03 | V14 / Client boundary | ActionCard 'use client' | accept | Per RESEARCH Pitfall 3, ActionCard ships as 'use client' to support onClick callers. Cost is a small client-bundle inclusion (RSC payload includes ActionCard's serialized props). No security implication. |

No active threats requiring runtime mitigation.
</threat_model>

<verification>
After all 3 tasks land:
1. `npm run typecheck && npm run lint && npm run test -- components/primitives/` exits 0
2. `ls components/primitives/` shows 17 files: 8 .tsx + 7 .test.tsx (all but ActionCard.test.tsx if you choose to skip — but Task 2 creates ActionCard.test.tsx; so 8 .test.tsx total) + 1 index.ts
3. `node -e "const m = require('./components/primitives/index.ts'); console.log(Object.keys(m))"` would be ideal but TypeScript file — instead, write a smoke test in `npm run test` that imports from the barrel and verifies all 8 components are functions
4. Wave 4's TopStrip plan can `import { Eyebrow, Icon, Avatar } from '@/components/primitives'` from the barrel
</verification>

<success_criteria>
- [ ] StagePill.tsx imports `StageNumber` from `@/types/origin`; closed enums; 18 (n × state) combinations covered in tests
- [ ] ActionCard.tsx is `'use client'`; renders button vs div based on onClick; tests cover 12+ scenarios; matches UI-SPEC Interaction States contract
- [ ] index.ts barrel exports all 8 components + 12 types alphabetically with explicit named re-exports (NO export *)
- [ ] No fresh-green tokens in StagePill or ActionCard (these are not AI primitives)
- [ ] `npm run typecheck`, `npm run lint`, `npm run test` all exit 0
</success_criteria>

<output>
After completion, create `.planning/phases/04-app-shell-primitives/04-07-SUMMARY.md`
</output>
