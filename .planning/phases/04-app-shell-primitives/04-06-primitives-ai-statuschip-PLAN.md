---
phase: 04-app-shell-primitives
plan: 06
type: execute
wave: 2
depends_on: [04-01, 04-04]
files_modified:
  - components/primitives/AIPulseDot.tsx
  - components/primitives/AIPulseDot.test.tsx
  - components/primitives/AIBadge.tsx
  - components/primitives/AIBadge.test.tsx
  - components/primitives/StatusChip.tsx
  - components/primitives/StatusChip.test.tsx
autonomous: true
requirements: [SHELL-04, SHELL-05]
tags: [primitives, ai-presence, status-chip, fresh-green, allowlisted, d-87]

must_haves:
  truths:
    - "AIPulseDot renders an 8x8 fresh-green dot with the animate-ai-pulse Tailwind utility (consumes Plan 04-04's keyframe)"
    - "AIBadge renders a trad-green-deep rounded-full pill containing AIPulseDot + a label (default 'Origin')"
    - "StatusChip uses a 6-arm closed kind enum where ONLY kind='ai' produces fresh-green tokens; the other 5 kinds (ok, amber, ghost, red, info) produce non-fresh-green tokens (D-87 mandatory per-kind tests verify)"
  artifacts:
    - path: "components/primitives/AIPulseDot.tsx"
      provides: "AIPulseDot — bare animated fresh-green dot (allowlisted)"
      exports: ["AIPulseDot"]
    - path: "components/primitives/AIBadge.tsx"
      provides: "AIBadge — trad-green-deep pill + AIPulseDot + label (allowlisted)"
      exports: ["AIBadge"]
    - path: "components/primitives/StatusChip.tsx"
      provides: "StatusChip — 6-kind closed enum; only kind='ai' uses fresh-green (allowlisted, D-87 second line of defense)"
      exports: ["StatusChip", "StatusChipKind"]
  key_links:
    - from: "components/primitives/AIPulseDot.tsx"
      to: "app/globals.css @keyframes ai-pulse"
      via: "animate-ai-pulse Tailwind utility"
      pattern: "animate-ai-pulse"
    - from: "components/primitives/StatusChip.tsx"
      to: "components/primitives/StatusChip.test.tsx (D-87)"
      via: "per-kind unit tests verifying only kind='ai' renders fresh-green tokens"
      pattern: "kind: 'ai'"
---

<objective>
Build the three "AI presence" primitives. AIPulseDot and AIBadge are pure AI-presence indicators (always fresh-green); StatusChip is a 6-arm closed-enum chip where only the `kind='ai'` branch renders fresh-green. Per D-85, all three primitive files are listed in `.freshgreen-allowlist` (Plan 04-11). Per D-87, StatusChip per-kind unit tests are MANDATORY as the second line of defense for the file-level allowlist (whole-file allowlist is coarse — without per-kind tests, a future PR could swap `kind='ok'` to fresh-green and the lint would still pass).

Per RESEARCH §5.5 the StatusChip per-kind token mapping is a recommendation derived from UI-SPEC + Phase 2 @theme tokens (the prototype's actual `chip--*` styles live in HTML and could not be extracted). The mapping below is the LOCK for Phase 4; visual tuning happens via the demo page review in Plan 04-10.

Output:
- 3 primitive `.tsx` files in `components/primitives/`
- 3 co-located `.test.tsx` files (StatusChip's tests are mandatory per D-87)
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
@app/globals.css

<interfaces>
<!-- AIPulseDot — UI-SPEC + RESEARCH §5.3 -->
```tsx
// components/primitives/AIPulseDot.tsx
<span
  aria-label={ariaLabel ?? 'AI active'}
  role="img"
  className="block w-2 h-2 rounded-full bg-fresh-green animate-ai-pulse"
/>
```
- 8px diameter (w-2 h-2 — Phase 2 spacing token --spacing-2 = 8px)
- bg-fresh-green is the AI presence accent (allowlisted by D-85)
- animate-ai-pulse is the Tailwind utility generated from Plan 04-04's @theme --animate-ai-pulse token

<!-- AIBadge — UI-SPEC + prototype proto_primitives.js lines 54-69 -->
Visual: dark `--trad-green-deep` rounded-full pill, ~22px tall, padding 3px 10px 3px 8px, gap 6px, fontSize 11, fontWeight 500. Inset shadow `inset 0 0 0 1px rgba(191,215,48,0.2)`.
Props: `{ label?: string }` defaulting to 'Origin'. Composes `<AIPulseDot />` + label `<span>`.

<!-- StatusChip per-kind token mapping — RESEARCH §5.5 LOCK -->
| Kind | Background | Text | Dot color (when dot=true) |
|------|------------|------|--------------------------|
| ok | bg-trad-green-soft/15 OR bg-mist | text-trad-green | bg-trad-green |
| ai | bg-fresh-green-glow | text-trad-green-deep | bg-fresh-green |
| amber | bg-signal-amber/15 | text-signal-amber | bg-signal-amber |
| ghost | bg-paper-deep OR bg-mist | text-ink-muted | bg-ink-muted |
| red | bg-signal-red/15 | text-signal-red | bg-signal-red |
| info | bg-signal-info/15 | text-signal-info | bg-signal-info |

Phase 4 LOCK (deciding between alternatives in the table):
- ok bg = `bg-mist` (cleaner than the /15 opacity tint; mist is already in @theme as #E8EDE4)
- ghost bg = `bg-paper-deep` (mist is already used by ok; paper-deep #F3F5EE differentiates ghost as "more inert")

So the final mapping for Plan 04-06:
| Kind | Background utility | Text utility | Dot bg utility |
|------|-------------------|--------------|----------------|
| ok | `bg-mist` | `text-trad-green` | `bg-trad-green` |
| ai | `bg-fresh-green-glow` | `text-trad-green-deep` | `bg-fresh-green` |
| amber | `bg-signal-amber/15` | `text-signal-amber` | `bg-signal-amber` |
| ghost | `bg-paper-deep` | `text-ink-muted` | `bg-ink-muted` |
| red | `bg-signal-red/15` | `text-signal-red` | `bg-signal-red` |
| info | `bg-signal-info/15` | `text-signal-info` | `bg-signal-info` |

Visual sizing (from prototype `chip` style — RESEARCH §5.5 + UI-SPEC Spacing): chip is a horizontal `inline-flex` pill: `px-3 py-1 text-[11px] font-medium rounded-full` with `gap-2` between dot and text.
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Create AIPulseDot.tsx + test (allowlisted, animate-ai-pulse consumer)</name>
  <read_first>
    - .planning/phases/04-app-shell-primitives/04-UI-SPEC.md §"Component Inventory" AIPulseDot row (line 250)
    - .planning/phases/04-app-shell-primitives/04-RESEARCH.md §5.3 (lines 984–1021) — verbatim implementation
    - .planning/phases/04-app-shell-primitives/04-PATTERNS.md §"components/primitives/AIPulseDot.tsx" (lines 340–348)
    - /Users/wyekitgoh/Projects/SMBCorigins/app/globals.css (verify @keyframes ai-pulse + --animate-ai-pulse token exist after Plan 04-04 lands)
  </read_first>
  <behavior>
    - Test 1: Renders a `<span>` with role="img"
    - Test 2: Default aria-label is "AI active"
    - Test 3: ariaLabel prop overrides the default
    - Test 4: Element classList contains `bg-fresh-green` and `animate-ai-pulse`
    - Test 5: Element is 8px square (w-2 h-2 utilities)
    - Test 6: Element has no children (bare dot, no label)
  </behavior>
  <files>components/primitives/AIPulseDot.tsx, components/primitives/AIPulseDot.test.tsx</files>
  <action>
    Create `components/primitives/AIPulseDot.tsx`:

    ```tsx
    // components/primitives/AIPulseDot.tsx — Phase 4 SHELL-04 AI presence primitive (D-75).
    // Bare 8px fresh-green dot with the animate-ai-pulse keyframe (Plan 04-04 → globals.css).
    // ALLOWLISTED in .freshgreen-allowlist (D-85, Plan 04-11) — fresh-green is the AI signal here.
    // Default aria-label = "AI active"; overridable for context-specific labels.

    import type { ReactElement } from 'react'

    export type AIPulseDotProps = {
      ariaLabel?: string
    }

    export function AIPulseDot({ ariaLabel = 'AI active' }: AIPulseDotProps): ReactElement {
      return (
        <span
          role="img"
          aria-label={ariaLabel}
          className="block w-2 h-2 rounded-full bg-fresh-green animate-ai-pulse"
        />
      )
    }
    ```

    Create `components/primitives/AIPulseDot.test.tsx`:

    ```tsx
    /**
     * components/primitives/AIPulseDot.test.tsx — Tests for AIPulseDot (SHELL-04, D-75).
     */

    import { describe, it, expect } from 'vitest'
    import { render } from '@testing-library/react'
    import { AIPulseDot } from '@/components/primitives/AIPulseDot'

    describe('components/primitives/AIPulseDot (SHELL-04, D-75)', () => {
      it('renders a span with role="img"', () => {
        const { container } = render(<AIPulseDot />)
        const span = container.querySelector('span')
        expect(span).not.toBeNull()
        expect(span?.getAttribute('role')).toBe('img')
      })

      it('default aria-label is "AI active"', () => {
        const { container } = render(<AIPulseDot />)
        const span = container.querySelector('span')
        expect(span?.getAttribute('aria-label')).toBe('AI active')
      })

      it('ariaLabel prop overrides the default', () => {
        const { container } = render(<AIPulseDot ariaLabel="Origin is thinking" />)
        const span = container.querySelector('span')
        expect(span?.getAttribute('aria-label')).toBe('Origin is thinking')
      })

      it('classList contains bg-fresh-green and animate-ai-pulse', () => {
        const { container } = render(<AIPulseDot />)
        const span = container.querySelector('span')
        expect(span?.className).toContain('bg-fresh-green')
        expect(span?.className).toContain('animate-ai-pulse')
      })

      it('classList contains w-2 h-2 (8px square)', () => {
        const { container } = render(<AIPulseDot />)
        const span = container.querySelector('span')
        expect(span?.className).toContain('w-2')
        expect(span?.className).toContain('h-2')
      })

      it('classList contains rounded-full (circular)', () => {
        const { container } = render(<AIPulseDot />)
        const span = container.querySelector('span')
        expect(span?.className).toContain('rounded-full')
      })

      it('renders no children (bare dot)', () => {
        const { container } = render(<AIPulseDot />)
        const span = container.querySelector('span')
        expect(span?.children.length).toBe(0)
        expect(span?.textContent).toBe('')
      })
    })
    ```
  </action>
  <verify>
    <automated>
    test -f components/primitives/AIPulseDot.tsx && grep -q "bg-fresh-green animate-ai-pulse" components/primitives/AIPulseDot.tsx && npm run test -- components/primitives/AIPulseDot.test.tsx && npm run typecheck
    </automated>
  </verify>
  <acceptance_criteria>
    - File `components/primitives/AIPulseDot.tsx` exists
    - File contains `bg-fresh-green` (this file IS in the SHELL-05 allowlist by D-85)
    - File contains `animate-ai-pulse` (consumes Plan 04-04's keyframe)
    - File contains `w-2 h-2 rounded-full` (8px circular)
    - Default aria-label is `'AI active'`
    - File `components/primitives/AIPulseDot.test.tsx` exists with ≥7 test cases
    - All tests pass under jsdom
    - `npm run typecheck` exits 0
  </acceptance_criteria>
  <done>AIPulseDot primitive + tests; allowlisted fresh-green; consumes the @theme animation token.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Create AIBadge.tsx + test (allowlisted; composes AIPulseDot)</name>
  <read_first>
    - .planning/phases/04-app-shell-primitives/04-UI-SPEC.md §"Component Inventory" AIBadge row (line 251)
    - .planning/phases/04-app-shell-primitives/04-CONTEXT.md "Specifics" AIBadge description (lines 268–270)
    - /tmp/proto_primitives.js (lines 54–69 — AIBadge prototype source: trad-green-deep pill, fresh-green dot+text, 6px gap, 22px tall, padding 3px 10px 3px 8px, fontSize 11, weight 500, inset shadow rgba(191,215,48,0.2))
    - .planning/phases/04-app-shell-primitives/04-PATTERNS.md §"components/primitives/AIBadge.tsx" (lines 351–358)
  </read_first>
  <behavior>
    - Test 1: Renders a `<span>` containing AIPulseDot + label text
    - Test 2: Default label is "Origin"
    - Test 3: label prop overrides the default
    - Test 4: Outer span classList contains `bg-trad-green-deep` and `text-fresh-green` (the AI badge body uses the AI-color label text)
    - Test 5: Outer span classList contains `inline-flex`, `items-center`, `gap-2` (or gap-1.5), `rounded-full`, `px-3` (or matching padding utility)
    - Test 6: Inner AIPulseDot renders (verifiable: span > span structure with the dot's bg-fresh-green class on the inner element)
  </behavior>
  <files>components/primitives/AIBadge.tsx, components/primitives/AIBadge.test.tsx</files>
  <action>
    Create `components/primitives/AIBadge.tsx`:

    ```tsx
    // components/primitives/AIBadge.tsx — Phase 4 SHELL-04 AI presence primitive (D-75).
    // Trad-green-deep rounded-full pill containing AIPulseDot + label (default "Origin").
    // ALLOWLISTED in .freshgreen-allowlist (D-85, Plan 04-11) — composes AIPulseDot
    // (fresh-green dot) and uses text-fresh-green for the label, by design.

    import type { ReactElement } from 'react'
    import { AIPulseDot } from './AIPulseDot'

    export type AIBadgeProps = {
      label?: string
    }

    export function AIBadge({ label = 'Origin' }: AIBadgeProps): ReactElement {
      return (
        <span className="inline-flex items-center gap-2 rounded-full bg-trad-green-deep text-fresh-green px-3 py-1 text-[11px] font-medium">
          <AIPulseDot />
          <span>{label}</span>
        </span>
      )
    }
    ```

    Conventions:
    - Composes AIPulseDot via relative import (`./AIPulseDot`) — same-directory primitive composition
    - `text-fresh-green` on the outer wrapper styles the label text (allowlisted by D-85)
    - `bg-trad-green-deep` is the dark pill background; the prototype's exact `inset 0 0 0 1px rgba(191,215,48,0.2)` shadow is OMITTED (rgba(191,215,48,...) would trip the SHELL-05 grep — and the allowlist is per-file so it would still pass, but cleaner to drop it; the trad-green-deep + fresh-green contrast is sufficient AI-signal without the extra inset)
    - Padding `px-3 py-1` ≈ prototype's 3px 10px 3px 8px (asymmetric padding is overridden in favor of symmetric Tailwind utilities; the visual difference is negligible at 22-26px overall height)
    - Default `label = 'Origin'` per CONTEXT D-75
    - Named export only

    Create `components/primitives/AIBadge.test.tsx`:

    ```tsx
    /**
     * components/primitives/AIBadge.test.tsx — Tests for AIBadge (SHELL-04, D-75).
     */

    import { describe, it, expect } from 'vitest'
    import { render } from '@testing-library/react'
    import { AIBadge } from '@/components/primitives/AIBadge'

    describe('components/primitives/AIBadge (SHELL-04, D-75)', () => {
      it('default label is "Origin"', () => {
        const { container } = render(<AIBadge />)
        expect(container.textContent).toBe('Origin')
      })

      it('label prop overrides the default', () => {
        const { container } = render(<AIBadge label="Reviewing" />)
        expect(container.textContent).toBe('Reviewing')
      })

      it('outer pill has trad-green-deep background and fresh-green text', () => {
        const { container } = render(<AIBadge />)
        const outer = container.firstElementChild as HTMLElement
        expect(outer.className).toContain('bg-trad-green-deep')
        expect(outer.className).toContain('text-fresh-green')
      })

      it('outer pill is rounded-full inline-flex with gap', () => {
        const { container } = render(<AIBadge />)
        const outer = container.firstElementChild as HTMLElement
        expect(outer.className).toContain('rounded-full')
        expect(outer.className).toContain('inline-flex')
        expect(outer.className).toContain('items-center')
        expect(outer.className).toContain('gap-2')
      })

      it('contains AIPulseDot (inner span with bg-fresh-green animate-ai-pulse)', () => {
        const { container } = render(<AIBadge />)
        const dot = container.querySelector('span > span[role="img"]')
        expect(dot).not.toBeNull()
        expect(dot?.className).toContain('bg-fresh-green')
        expect(dot?.className).toContain('animate-ai-pulse')
      })

      it('label rendered as a child span (preserves text-fresh-green via parent inheritance)', () => {
        const { container } = render(<AIBadge label="Test" />)
        // Two child spans: AIPulseDot (role=img) + label span
        const innerSpans = container.querySelectorAll('span > span')
        expect(innerSpans.length).toBe(2)
      })
    })
    ```
  </action>
  <verify>
    <automated>
    test -f components/primitives/AIBadge.tsx && grep -q "bg-trad-green-deep text-fresh-green" components/primitives/AIBadge.tsx && grep -q "AIPulseDot" components/primitives/AIBadge.tsx && npm run test -- components/primitives/AIBadge.test.tsx && npm run typecheck
    </automated>
  </verify>
  <acceptance_criteria>
    - File `components/primitives/AIBadge.tsx` exists
    - File imports `AIPulseDot` from `./AIPulseDot` (relative same-directory)
    - File contains `bg-trad-green-deep` and `text-fresh-green` (allowlisted by D-85)
    - File contains `inline-flex`, `items-center`, `gap-2`, `rounded-full`, `px-3`, `py-1`, `text-[11px]`, `font-medium`
    - Default `label = 'Origin'` per D-75
    - File `components/primitives/AIBadge.test.tsx` exists with ≥6 test cases
    - All tests pass; the AIPulseDot child renders (verifiable via DOM query)
    - `npm run typecheck` exits 0
  </acceptance_criteria>
  <done>AIBadge primitive composes AIPulseDot in a trad-green-deep pill; label defaults to "Origin"; tests verify composition.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 3: Create StatusChip.tsx + MANDATORY per-kind tests (D-87 second-line-of-defense)</name>
  <read_first>
    - .planning/phases/04-app-shell-primitives/04-UI-SPEC.md §"Component Inventory" StatusChip row (line 248) — props `{ kind: 'ok' | 'ai' | 'amber' | 'ghost' | 'red' | 'info', children: ReactNode, dot?: boolean }`
    - .planning/phases/04-app-shell-primitives/04-CONTEXT.md D-73 (lines 47), D-87 (lines 84) — kind enum + per-kind tests are MANDATORY
    - .planning/phases/04-app-shell-primitives/04-RESEARCH.md §5.5 (lines 1048–1083) — per-kind token mapping recommendation + verbatim test recipe
    - .planning/phases/04-app-shell-primitives/04-UI-SPEC.md §"SHELL-05 Fresh Green Enforcement Mechanism > Per-kind unit tests" (lines 512–520) — D-87 spec
    - .planning/phases/04-app-shell-primitives/04-PATTERNS.md §"components/primitives/StatusChip.tsx" (lines 284–306)
  </read_first>
  <behavior>
    - Test 1: For each of 6 kinds (ok, ai, amber, ghost, red, info), the chip renders with the correct `bg-*` and `text-*` utility classes per the LOCKED mapping table
    - Test 2: kind='ai' is the ONLY kind that produces fresh-green tokens — all others have NO fresh-green substring in the className
    - Test 3: When dot=true (default), the chip has a leading colored dot child whose `bg-*` class matches the kind's dot mapping
    - Test 4: When dot=false, no dot child is rendered
    - Test 5: Children are rendered inside the chip
    - Test 6: Chip is `inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-medium` (the visual contract)
  </behavior>
  <files>components/primitives/StatusChip.tsx, components/primitives/StatusChip.test.tsx</files>
  <action>
    Create `components/primitives/StatusChip.tsx`:

    ```tsx
    // components/primitives/StatusChip.tsx — Phase 4 SHELL-04 chip primitive (D-73).
    // 6-kind closed enum; ALLOWLISTED in .freshgreen-allowlist (D-85) for the kind='ai'
    // branch only. D-87 mandates per-kind unit tests as the second line of defense
    // for whole-file allowlisting — see StatusChip.test.tsx.
    //
    // Per RESEARCH §5.5 the per-kind token mapping is locked; kind='ai' is the ONLY
    // kind that uses fresh-green tokens. Any future PR that swaps another kind's
    // tokens to fresh-green will pass the file-level allowlist but FAIL the per-kind
    // unit test — the test catches what the allowlist cannot.

    import type { ReactNode, ReactElement } from 'react'

    export type StatusChipKind = 'ok' | 'ai' | 'amber' | 'ghost' | 'red' | 'info'

    export type StatusChipProps = {
      kind: StatusChipKind
      children: ReactNode
      dot?: boolean
    }

    type ChipStyles = {
      readonly bg: string
      readonly text: string
      readonly dotBg: string
    }

    const STYLES_BY_KIND: Record<StatusChipKind, ChipStyles> = {
      ok:    { bg: 'bg-mist',              text: 'text-trad-green',      dotBg: 'bg-trad-green' },
      ai:    { bg: 'bg-fresh-green-glow',  text: 'text-trad-green-deep', dotBg: 'bg-fresh-green' },
      amber: { bg: 'bg-signal-amber/15',   text: 'text-signal-amber',    dotBg: 'bg-signal-amber' },
      ghost: { bg: 'bg-paper-deep',        text: 'text-ink-muted',       dotBg: 'bg-ink-muted' },
      red:   { bg: 'bg-signal-red/15',     text: 'text-signal-red',      dotBg: 'bg-signal-red' },
      info:  { bg: 'bg-signal-info/15',    text: 'text-signal-info',     dotBg: 'bg-signal-info' },
    }

    export function StatusChip({ kind, children, dot = true }: StatusChipProps): ReactElement {
      const styles = STYLES_BY_KIND[kind]
      const className = [
        'inline-flex items-center gap-2 rounded-full px-3 py-1',
        'text-[11px] font-medium',
        styles.bg,
        styles.text,
      ].join(' ')
      return (
        <span className={className}>
          {dot ? <span className={`block w-1.5 h-1.5 rounded-full ${styles.dotBg}`} aria-hidden="true" /> : null}
          {children}
        </span>
      )
    }
    ```

    Conventions:
    - kind='ai' is the ONLY arm that uses `bg-fresh-green-glow` and `bg-fresh-green` (the dot) — D-87 enforced by tests
    - Closed `Record<StatusChipKind, ChipStyles>` typing prevents `noUncheckedIndexedAccess` undefined narrowing (RESEARCH Pitfall 2)
    - Dot is 6px (`w-1.5 h-1.5`) — smaller than AIPulseDot (8px) because chip dots are status indicators, not animated AI presence
    - `aria-hidden="true"` on the dot — it's decorative; the chip's text content carries the meaning
    - Default `dot = true` per D-73

    Create `components/primitives/StatusChip.test.tsx` (D-87 — MANDATORY per-kind tests):

    ```tsx
    /**
     * components/primitives/StatusChip.test.tsx — D-87 MANDATORY per-kind token tests.
     *
     * Per CONTEXT.md D-87: whole-file allowlist (D-85) is coarse — for files where only
     * SOME branches use fresh-green (StatusChip's kind='ai'), unit tests verify each
     * branch renders the expected token as a second line of defense.
     *
     * If a future PR swaps kind='ok' to use fresh-green, the lint passes (file is
     * allowlisted) but the unit test fails — that's what these tests are FOR.
     *
     * Coverage: every kind × (bg, text, dot) token = 6 × 3 = 18 explicit assertions,
     * plus the negative invariant: ONLY kind='ai' produces fresh-green tokens.
     */

    import { describe, it, expect } from 'vitest'
    import { render } from '@testing-library/react'
    import { StatusChip, type StatusChipKind } from '@/components/primitives/StatusChip'

    const KINDS: ReadonlyArray<StatusChipKind> = ['ok', 'ai', 'amber', 'ghost', 'red', 'info']

    describe('components/primitives/StatusChip (SHELL-04, D-73, D-87)', () => {
      it('kind="ok" renders bg-mist, text-trad-green, dot bg-trad-green', () => {
        const { container } = render(<StatusChip kind="ok">Verified</StatusChip>)
        const chip = container.firstElementChild as HTMLElement
        expect(chip.className).toContain('bg-mist')
        expect(chip.className).toContain('text-trad-green')
        const dot = chip.querySelector('span[aria-hidden="true"]') as HTMLElement
        expect(dot.className).toContain('bg-trad-green')
        // negative: kind='ok' MUST NOT use fresh-green
        expect(chip.className).not.toMatch(/fresh-green/)
        expect(dot.className).not.toMatch(/fresh-green/)
      })

      it('kind="ai" renders bg-fresh-green-glow, text-trad-green-deep, dot bg-fresh-green (D-87)', () => {
        const { container } = render(<StatusChip kind="ai">Origin</StatusChip>)
        const chip = container.firstElementChild as HTMLElement
        expect(chip.className).toContain('bg-fresh-green-glow')
        expect(chip.className).toContain('text-trad-green-deep')
        const dot = chip.querySelector('span[aria-hidden="true"]') as HTMLElement
        expect(dot.className).toContain('bg-fresh-green')
      })

      it('kind="amber" renders signal-amber tokens, NO fresh-green', () => {
        const { container } = render(<StatusChip kind="amber">Pending</StatusChip>)
        const chip = container.firstElementChild as HTMLElement
        expect(chip.className).toContain('bg-signal-amber/15')
        expect(chip.className).toContain('text-signal-amber')
        const dot = chip.querySelector('span[aria-hidden="true"]') as HTMLElement
        expect(dot.className).toContain('bg-signal-amber')
        expect(chip.className).not.toMatch(/fresh-green/)
        expect(dot.className).not.toMatch(/fresh-green/)
      })

      it('kind="ghost" renders bg-paper-deep, text-ink-muted, dot bg-ink-muted, NO fresh-green', () => {
        const { container } = render(<StatusChip kind="ghost">Optional</StatusChip>)
        const chip = container.firstElementChild as HTMLElement
        expect(chip.className).toContain('bg-paper-deep')
        expect(chip.className).toContain('text-ink-muted')
        const dot = chip.querySelector('span[aria-hidden="true"]') as HTMLElement
        expect(dot.className).toContain('bg-ink-muted')
        expect(chip.className).not.toMatch(/fresh-green/)
        expect(dot.className).not.toMatch(/fresh-green/)
      })

      it('kind="red" renders signal-red tokens, NO fresh-green', () => {
        const { container } = render(<StatusChip kind="red">Blocked</StatusChip>)
        const chip = container.firstElementChild as HTMLElement
        expect(chip.className).toContain('bg-signal-red/15')
        expect(chip.className).toContain('text-signal-red')
        const dot = chip.querySelector('span[aria-hidden="true"]') as HTMLElement
        expect(dot.className).toContain('bg-signal-red')
        expect(chip.className).not.toMatch(/fresh-green/)
        expect(dot.className).not.toMatch(/fresh-green/)
      })

      it('kind="info" renders signal-info tokens, NO fresh-green', () => {
        const { container } = render(<StatusChip kind="info">Info</StatusChip>)
        const chip = container.firstElementChild as HTMLElement
        expect(chip.className).toContain('bg-signal-info/15')
        expect(chip.className).toContain('text-signal-info')
        const dot = chip.querySelector('span[aria-hidden="true"]') as HTMLElement
        expect(dot.className).toContain('bg-signal-info')
        expect(chip.className).not.toMatch(/fresh-green/)
        expect(dot.className).not.toMatch(/fresh-green/)
      })

      it('only kind="ai" produces fresh-green tokens — all 5 other kinds are clean (D-87 invariant)', () => {
        for (const kind of KINDS) {
          const { container } = render(<StatusChip kind={kind}>label</StatusChip>)
          const chip = container.firstElementChild as HTMLElement
          const fullText = chip.outerHTML // includes dot child
          if (kind === 'ai') {
            expect(fullText, `kind="ai" must contain fresh-green`).toMatch(/fresh-green/)
          } else {
            expect(fullText, `kind="${kind}" must NOT contain fresh-green`).not.toMatch(/fresh-green/)
          }
        }
      })

      it('dot=false omits the leading dot', () => {
        const { container } = render(<StatusChip kind="ok" dot={false}>Plain</StatusChip>)
        const chip = container.firstElementChild as HTMLElement
        const dot = chip.querySelector('span[aria-hidden="true"]')
        expect(dot).toBeNull()
      })

      it('dot=true (default) renders the leading dot', () => {
        const { container } = render(<StatusChip kind="ok">With dot</StatusChip>)
        const chip = container.firstElementChild as HTMLElement
        const dot = chip.querySelector('span[aria-hidden="true"]')
        expect(dot).not.toBeNull()
      })

      it('renders children inside the chip', () => {
        const { container } = render(<StatusChip kind="ai">Origin · ready</StatusChip>)
        expect(container.textContent).toContain('Origin · ready')
      })

      it('chip is inline-flex rounded-full px-3 py-1 text-[11px] font-medium', () => {
        const { container } = render(<StatusChip kind="ok">label</StatusChip>)
        const chip = container.firstElementChild as HTMLElement
        expect(chip.className).toContain('inline-flex')
        expect(chip.className).toContain('items-center')
        expect(chip.className).toContain('gap-2')
        expect(chip.className).toContain('rounded-full')
        expect(chip.className).toContain('px-3')
        expect(chip.className).toContain('py-1')
        expect(chip.className).toContain('text-[11px]')
        expect(chip.className).toContain('font-medium')
      })
    })
    ```
  </action>
  <verify>
    <automated>
    test -f components/primitives/StatusChip.tsx && test -f components/primitives/StatusChip.test.tsx && grep -q "STYLES_BY_KIND" components/primitives/StatusChip.tsx && grep -c "kind=\"" components/primitives/StatusChip.test.tsx | awk '{exit ($1 < 6)}' && npm run test -- components/primitives/StatusChip.test.tsx && npm run typecheck
    </automated>
  </verify>
  <acceptance_criteria>
    - File `components/primitives/StatusChip.tsx` exists
    - File exports `StatusChipKind` as the literal union `'ok' | 'ai' | 'amber' | 'ghost' | 'red' | 'info'` (6 members)
    - File exports `StatusChipProps` with `kind: StatusChipKind`, `children: ReactNode`, `dot?: boolean` (default true)
    - File contains `STYLES_BY_KIND: Record<StatusChipKind, ChipStyles>` mapping
    - The `ai` row in STYLES_BY_KIND uses `bg-fresh-green-glow`, `text-trad-green-deep`, `bg-fresh-green` (dot)
    - The `ok` row uses `bg-mist`, `text-trad-green`, `bg-trad-green` (no fresh-green)
    - The `amber`, `ghost`, `red`, `info` rows have NO fresh-green tokens (verifiable via grep against the kind blocks)
    - File `components/primitives/StatusChip.test.tsx` exists with ≥10 test cases (6 per-kind cases + invariant + dot=true/false + children + visual contract)
    - The `it('only kind="ai" produces fresh-green tokens — all 5 other kinds are clean (D-87 invariant)', ...)` test exists and passes — D-87 verbatim coverage
    - `npm run test -- components/primitives/StatusChip.test.tsx` exits 0 with all 10+ assertions passing
    - `npm run typecheck` exits 0
  </acceptance_criteria>
  <done>StatusChip primitive with 6-arm closed kind enum; per-kind tests (D-87) verify only kind='ai' produces fresh-green; coverage = 6 kinds × 3 tokens = 18+ explicit assertions.</done>
</task>

</tasks>

<threat_model>
This plan creates the three AI-presence primitives. Applicable ASVS categories: V14 Configuration (allowlist + closed-enum guardrails), V5 Input Validation (children pass-through).

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-04-06-01 | V14 Configuration / SHELL-05 | StatusChip kind enum | mitigate | D-87 per-kind unit tests are the second line of defense after Plan 04-11's whole-file allowlist. If a future PR swaps `kind='ok'` to use fresh-green, the lint passes but the unit test fails. Closed `StatusChipKind` union prevents drift at the type level. |
| T-04-06-02 | V14 / Animation | AIPulseDot animate-ai-pulse | accept | The animation is purely visual (CSS keyframes); no scripted execution path; no user input. Per RESEARCH §"Open Questions" #5, if Tailwind v4's `--animate-*` doesn't auto-generate the utility, fall back to inline `style={{ animation: ... }}` — a Plan 04-06 follow-up if `npm run build` reveals the utility doesn't compile. |
| T-04-06-03 | V5 Input Validation | StatusChip children, AIBadge label | accept | All children/labels flow through React's default text escaping; no `dangerouslySetInnerHTML`. Phase 4 callers pass static literals; Phase 5+ may pass dynamic content from `lib/api.mock.ts` results — same React-default safety applies. |

Active mitigation = D-87 per-kind tests (codified in Task 3).
</threat_model>

<verification>
After all 3 tasks land:
1. `npm run typecheck && npm run lint && npm run test -- components/primitives/AIPulseDot.test.tsx components/primitives/AIBadge.test.tsx components/primitives/StatusChip.test.tsx` exits 0
2. `grep -E '(fresh-green|#[Bb][Ff][Dd]7[3]0)' components/primitives/AIPulseDot.tsx components/primitives/AIBadge.tsx components/primitives/StatusChip.tsx` shows fresh-green ONLY in the expected places (AIPulseDot's bg-fresh-green + animate-ai-pulse; AIBadge's text-fresh-green; StatusChip's STYLES_BY_KIND.ai row); the StatusChip non-ai kinds DO NOT contain fresh-green
3. `npm run test -- components/primitives/StatusChip.test.tsx -t "only kind"` passes (D-87 invariant test)
4. Plan 04-11 will allowlist these 3 files in `.freshgreen-allowlist`; the SHELL-05 grep script will pass on these files only because they are allowlisted
</verification>

<success_criteria>
- [ ] AIPulseDot.tsx renders bare 8px fresh-green dot with animate-ai-pulse utility; tests pass
- [ ] AIBadge.tsx composes AIPulseDot in a trad-green-deep pill with text-fresh-green; tests pass
- [ ] StatusChip.tsx ships 6-arm closed enum with locked per-kind token mapping; only kind='ai' uses fresh-green
- [ ] StatusChip.test.tsx has the D-87 mandatory per-kind tests (≥10 cases including the negative invariant)
- [ ] `npm run typecheck`, `npm run lint`, `npm run test` all exit 0
- [ ] These 3 files will be allowlisted in Plan 04-11; tests catch any future drift the allowlist cannot
</success_criteria>

<output>
After completion, create `.planning/phases/04-app-shell-primitives/04-06-SUMMARY.md`
</output>
