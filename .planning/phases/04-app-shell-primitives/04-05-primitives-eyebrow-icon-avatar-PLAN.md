---
phase: 04-app-shell-primitives
plan: 05
type: execute
wave: 2
depends_on: [04-01, 04-02]
files_modified:
  - components/primitives/Eyebrow.tsx
  - components/primitives/Eyebrow.test.tsx
  - components/primitives/Icon.tsx
  - components/primitives/Icon.test.tsx
  - components/primitives/Avatar.tsx
  - components/primitives/Avatar.test.tsx
autonomous: true
requirements: [SHELL-04]
tags: [primitives, typography, icons, avatar, closed-enum]

must_haves:
  truths:
    - "Eyebrow renders mono uppercase tracked text with the locked typography (10/500 IBM Plex Mono, 0.18em tracking, ink-muted color)"
    - "Icon renders the closed 35-name union of inline SVG paths verbatim from the prototype; ariaLabel toggles role='img' (when set) vs aria-hidden='true' (when omitted)"
    - "Avatar renders a round disc with mono initials in a closed AvatarColor enum (7 members, no fresh-green family — TypeScript blocks attempts to pass fresh-green at compile time)"
  artifacts:
    - path: "components/primitives/Eyebrow.tsx"
      provides: "Eyebrow primitive — typography eyebrow"
      exports: ["Eyebrow"]
    - path: "components/primitives/Icon.tsx"
      provides: "Icon primitive with 35 closed-name SVG paths"
      exports: ["Icon", "IconName"]
    - path: "components/primitives/Avatar.tsx"
      provides: "Avatar primitive with closed AvatarColor enum (no fresh-green)"
      exports: ["Avatar", "AvatarColor"]
  key_links:
    - from: "components/primitives/Avatar.tsx"
      to: "AvatarColor closed enum"
      via: "TypeScript closed string union"
      pattern: "type AvatarColor ="
---

<objective>
Build the three "atomic" primitives that the TopStrip + chrome shell consume: Eyebrow (mono text), Icon (35-name SVG dictionary), Avatar (round-disc with initials + closed-enum color). All three:
- Are pure server components (no `'use client'`)
- Use closed-enum prop discipline per UI-SPEC (D-79 IconName, D-78 AvatarColor)
- Have co-located `*.test.tsx` files using @testing-library/react (Wave 0 jsdom setup unblocked them)
- Do NOT touch fresh-green tokens (none of these are AI-presence primitives)

Per RESEARCH §5.6 the recommended Avatar.color enum is the 7-member subset (subset of UI-SPEC's 12-member candidate list). Per UI-SPEC OD-7, planner picks. THIS PLAN LOCKS 7-member subset to keep the demo page focused; Phase 5/6 add additively.

Per RESEARCH §5.1 the Icon name union is the alphabetized 35-name list verbatim from the prototype `Icon` switch. Per RESEARCH §5.2 the SVG paths are copied verbatim — most are single-path; 7 use multi-child SVGs (help, search, copilot, calendar, clock, globe, users); 1 uses fill instead of stroke (dot).

Output:
- 3 primitive `.tsx` files in `components/primitives/`
- 3 co-located `.test.tsx` files (jsdom + @testing-library/react)
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
@app/page.tsx
@lib/stages.test.ts
@types/origin.ts

<interfaces>
<!-- Avatar.color closed enum — Plan 04-05 LOCK: 7-member Phase 4 subset per RESEARCH §5.6 -->
```ts
export type AvatarColor =
  | 'trad-green'        // #004832 — brand primary
  | 'trad-green-soft'   // #1A5F48 — TopStrip default per D-88 retrofit #1
  | 'trad-green-deep'   // #00301F — high-contrast on paper
  | 'ink'               // #0A1410 — neutral default
  | 'ink-muted'         // #7A827D — placeholder/empty fallback
  | 'paper'             // #FAFBF7 — light avatar on dark chrome
  | 'mist'              // #E8EDE4 — softest light variant
```
EXCLUDED on purpose (per D-78): `fresh-green`, `fresh-green-mute`, `fresh-green-glow`. Phase 5/6 may extend additively to add `paper-deep`, `ink-soft`, `signal-amber`, `signal-info`, `signal-red`.

<!-- IconName 35-name closed union — RESEARCH §5.1 alphabetized list verbatim -->
```ts
export type IconName =
  | 'app-folder' | 'arrow-right' | 'arrow-up-right' | 'bank' | 'bell' | 'bolt'
  | 'calendar' | 'check' | 'chevron-down' | 'chevron-right' | 'clock' | 'close'
  | 'cockpit' | 'copilot' | 'credit' | 'docs' | 'dot' | 'edit' | 'external'
  | 'filter' | 'globe' | 'help' | 'mail' | 'paperclip' | 'pipeline' | 'refresh'
  | 'rocket' | 'search' | 'send' | 'shield' | 'sparkle' | 'stack' | 'tree'
  | 'upload' | 'users' | 'yen'
```
35 names total.

<!-- All 35 SVG paths verbatim from /tmp/proto_primitives.js lines 81-118 -->
| Name | Children (paste into JSX exactly) |
|------|-----------------------------------|
| arrow-right | `<path d="M5 12h14M13 6l6 6-6 6" {...common}/>` |
| arrow-up-right | `<path d="M7 17L17 7M8 7h9v9" {...common}/>` |
| check | `<path d="M5 12l5 5L20 7" {...common}/>` |
| dot | `<circle cx="12" cy="12" r="4" fill={color}/>` |
| chevron-right | `<path d="M9 6l6 6-6 6" {...common}/>` |
| chevron-down | `<path d="M6 9l6 6 6-6" {...common}/>` |
| close | `<path d="M6 6l12 12M18 6L6 18" {...common}/>` |
| tree | `<path d="M12 3v6m0 0H7v4m5-4h5v4M7 13H5v4h4v-4H7zm10 0h-2v4h4v-4h-2zm-7 0h-2v4h4v-4h-2zM12 13h0" {...common}/>` |
| docs | `<path d="M8 3h8l4 4v14H8V3zM8 8h8M8 12h8M8 16h5" {...common}/>` |
| shield | `<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" {...common}/>` |
| credit | `<path d="M3 7h18v10H3V7zm0 4h18M7 15h4" {...common}/>` |
| rocket | `<path d="M5 19l3-3m6-10c3 0 5 2 5 5l-6 6-5-5 6-6zm-1 5a1 1 0 100-2 1 1 0 000 2z" {...common}/>` |
| mail | `<path d="M3 6h18v12H3V6zm0 0l9 7 9-7" {...common}/>` |
| help | `<><circle cx="12" cy="12" r="9" {...common}/><path d="M9.5 9.5a2.5 2.5 0 015 0c0 1.5-2.5 2-2.5 3.5M12 17h.01" {...common}/></>` |
| bell | `<path d="M6 16V11a6 6 0 1112 0v5l2 2H4l2-2zM10 20a2 2 0 004 0" {...common}/>` |
| search | `<><circle cx="11" cy="11" r="7" {...common}/><path d="M20 20l-4-4" {...common}/></>` |
| sparkle | `<path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6zM19 14l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z" {...common}/>` |
| cockpit | `<path d="M3 4h7v9H3V4zm11 0h7v5h-7V4zm0 9h7v7h-7v-7zM3 15h7v5H3v-5z" {...common}/>` |
| pipeline | `<path d="M3 7h4l3 4-3 4H3M10 7h4l3 4-3 4h-4" {...common}/>` |
| app-folder | `<path d="M3 7a2 2 0 012-2h5l2 3h7a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" {...common}/>` |
| copilot | `<><circle cx="12" cy="12" r="9" {...common}/><path d="M8 12l3 3 5-6" {...common}/></>` |
| upload | `<path d="M4 17v3h16v-3M12 15V4m0 0l-5 5m5-5l5 5" {...common}/>` |
| paperclip | `<path d="M20 12l-8 8a5 5 0 01-7-7l9-9a3 3 0 014 4l-9 9a1 1 0 01-1-1l8-8" {...common}/>` |
| calendar | `<><rect x="3" y="5" width="18" height="16" rx="2" {...common}/><path d="M3 10h18M8 3v4M16 3v4" {...common}/></>` |
| clock | `<><circle cx="12" cy="12" r="9" {...common}/><path d="M12 7v5l3 2" {...common}/></>` |
| globe | `<><circle cx="12" cy="12" r="9" {...common}/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18-3-3.5-3-14.5 0-18z" {...common}/></>` |
| yen | `<path d="M6 4l6 8 6-8M6 13h12M6 17h12M12 12v8" {...common}/>` |
| filter | `<path d="M4 5h16l-6 8v6l-4-2v-4L4 5z" {...common}/>` |
| edit | `<path d="M4 20h4L20 8l-4-4L4 16v4z" {...common}/>` |
| refresh | `<path d="M4 4v6h6M20 20v-6h-6M5 14a8 8 0 0014 4M19 10A8 8 0 005 6" {...common}/>` |
| send | `<path d="M4 20l17-8L4 4v6l11 2-11 2v6z" {...common}/>` |
| external | `<path d="M14 3h7v7M21 3l-9 9M10 5H5a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-5" {...common}/>` |
| stack | `<path d="M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5M3 18l9 5 9-5" {...common}/>` |
| users | `<><circle cx="9" cy="8" r="3" {...common}/><circle cx="17" cy="9" r="2" {...common}/><path d="M3 19c0-3 3-5 6-5s6 2 6 5M15 19c0-2 2-4 4-4s2 2 2 4" {...common}/></>` |
| bolt | `<path d="M13 3L5 14h6l-1 7 8-11h-6l1-7z" {...common}/>` |
| bank | `<path d="M3 10l9-6 9 6M5 10v9h14v-9M8 12v5M12 12v5M16 12v5M3 21h18" {...common}/>` |

Common SVG defaults (from prototype line 80):
```ts
const common = { fill: 'none', stroke: color, strokeWidth: stroke, strokeLinecap: 'round', strokeLinejoin: 'round' } as const
```

The `dot` icon uses `fill={color}` instead — special-cased.
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Create components/primitives/Eyebrow.tsx + co-located test</name>
  <read_first>
    - .planning/phases/04-app-shell-primitives/04-UI-SPEC.md §"Component Inventory" Eyebrow row (line 247) — props `{ children: ReactNode, className?: string }`
    - .planning/phases/04-app-shell-primitives/04-UI-SPEC.md §"Typography Size scale" — Eyebrow tier (line 116): IBM Plex Mono 10px / 500 / 1.2 / 0.18em tracking
    - .planning/phases/04-app-shell-primitives/04-PATTERNS.md §"components/primitives/Eyebrow.tsx" (lines 260–281) — analog: `app/page.tsx:101` mono-utility idiom
    - /Users/wyekitgoh/Projects/SMBCorigins/app/page.tsx (lines 99–104) — analog mono-utility composition
    - /Users/wyekitgoh/Projects/SMBCorigins/lib/stages.test.ts (Vitest test idiom: explicit imports, describe + it, no globals)
  </read_first>
  <behavior>
    - Test 1: Renders children inside a `<span>` element
    - Test 2: Default classlist contains `font-mono`, `uppercase`, `tracking-[0.18em]`, `text-ink-muted`, `text-[10px]`, `font-medium`
    - Test 3: When `className` prop is provided, it appends after the default classes (verifiable: render with className="custom" and assert both default and custom classes coexist)
    - Test 4: Renders text content faithfully (e.g., `<Eyebrow>BY SMBC</Eyebrow>` produces text "BY SMBC")
  </behavior>
  <files>components/primitives/Eyebrow.tsx, components/primitives/Eyebrow.test.tsx</files>
  <action>
    Create `components/primitives/Eyebrow.tsx` with this exact content:

    ```tsx
    // components/primitives/Eyebrow.tsx — Phase 4 SHELL-04 typography primitive.
    // Mono / uppercase / 0.18em tracked label; per UI-SPEC Typography 10/500.
    // No fresh-green tokens (this primitive is non-AI surface).

    import type { ReactNode } from 'react'

    export type EyebrowProps = {
      children: ReactNode
      className?: string
    }

    const baseClasses =
      'font-mono uppercase tracking-[0.18em] text-ink-muted text-[10px] font-medium leading-tight'

    export function Eyebrow({ children, className }: EyebrowProps) {
      const composed = className ? `${baseClasses} ${className}` : baseClasses
      return <span className={composed}>{children}</span>
    }
    ```

    Create `components/primitives/Eyebrow.test.tsx` with this exact content:

    ```tsx
    /**
     * components/primitives/Eyebrow.test.tsx — Tests for the Eyebrow primitive (SHELL-04).
     *
     * Covers:
     *   - Renders as <span> with children
     *   - Default classlist matches UI-SPEC typography (10/500 IBM Plex Mono, 0.18em tracking)
     *   - className prop appends to defaults (does not replace)
     */

    import { describe, it, expect } from 'vitest'
    import { render } from '@testing-library/react'
    import { Eyebrow } from '@/components/primitives/Eyebrow'

    describe('components/primitives/Eyebrow (SHELL-04)', () => {
      it('renders children inside a span', () => {
        const { container } = render(<Eyebrow>BY SMBC</Eyebrow>)
        const span = container.querySelector('span')
        expect(span).not.toBeNull()
        expect(span?.textContent).toBe('BY SMBC')
      })

      it('default classlist matches locked typography', () => {
        const { container } = render(<Eyebrow>label</Eyebrow>)
        const span = container.firstElementChild as HTMLElement
        expect(span.className).toContain('font-mono')
        expect(span.className).toContain('uppercase')
        expect(span.className).toContain('tracking-[0.18em]')
        expect(span.className).toContain('text-ink-muted')
        expect(span.className).toContain('text-[10px]')
        expect(span.className).toContain('font-medium')
      })

      it('className prop appends to defaults', () => {
        const { container } = render(<Eyebrow className="text-paper">DEMO</Eyebrow>)
        const span = container.firstElementChild as HTMLElement
        // both default and custom classes coexist
        expect(span.className).toContain('font-mono')
        expect(span.className).toContain('text-paper')
      })

      it('renders complex children (ReactNode, not just string)', () => {
        const { container } = render(
          <Eyebrow>
            label · <strong>bold</strong>
          </Eyebrow>
        )
        const span = container.firstElementChild as HTMLElement
        expect(span.textContent).toContain('label')
        expect(span.querySelector('strong')).not.toBeNull()
      })
    })
    ```

    Conventions:
    - Named export only (`export function Eyebrow` — no default)
    - Type imports use `type` keyword for tree-shake friendliness
    - className is concatenated with template literal (no `clsx` / `classnames` lib — Phase 2 D-38 has no Tailwind plugins; keep dep surface minimal)
    - No fresh-green tokens used — this primitive is NOT in the SHELL-05 allowlist
  </action>
  <verify>
    <automated>
    test -f components/primitives/Eyebrow.tsx && test -f components/primitives/Eyebrow.test.tsx && grep -q "export function Eyebrow" components/primitives/Eyebrow.tsx && npm run test -- components/primitives/Eyebrow.test.tsx && npm run typecheck && npm run lint
    </automated>
  </verify>
  <acceptance_criteria>
    - File `components/primitives/Eyebrow.tsx` exists
    - File contains named export `export function Eyebrow` (NOT `export default`)
    - File exports `EyebrowProps` type with fields `children: ReactNode` and `className?: string`
    - File contains default classes string with: `font-mono`, `uppercase`, `tracking-[0.18em]`, `text-ink-muted`, `text-[10px]`, `font-medium`
    - `grep -E '(fresh-green|#[Bb][Ff][Dd]7[3]0)' components/primitives/Eyebrow.tsx` returns 0 matches (NOT a fresh-green allowlist file)
    - File `components/primitives/Eyebrow.test.tsx` exists with ≥4 `it` blocks
    - `npm run test -- components/primitives/Eyebrow.test.tsx` exits 0
    - `npm run typecheck` exits 0
    - `npm run lint` exits 0
  </acceptance_criteria>
  <done>Eyebrow primitive + tests created; no fresh-green tokens; tests pass.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Create components/primitives/Icon.tsx + test (35-name closed union, verbatim SVG paths)</name>
  <read_first>
    - .planning/phases/04-app-shell-primitives/04-UI-SPEC.md §"Component Inventory" Icon row (line 253) + FLAG 1 fix (line 256)
    - .planning/phases/04-app-shell-primitives/04-RESEARCH.md §5.1 (lines 873–916) — alphabetized 35-name list
    - .planning/phases/04-app-shell-primitives/04-RESEARCH.md §5.2 (lines 920–981) — verbatim SVG path data table for all 35 icons
    - /tmp/proto_primitives.js (lines 78–120 — Icon switch source-of-truth)
    - .planning/phases/04-app-shell-primitives/04-PATTERNS.md §"components/primitives/Icon.tsx" (lines 397–407)
  </read_first>
  <behavior>
    - Test 1: Renders an `<svg>` element when given a valid name
    - Test 2: When ariaLabel is provided, svg has `role="img"` + `aria-label="<value>"`; aria-hidden is absent or false
    - Test 3: When ariaLabel is omitted, svg has `aria-hidden="true"` (decorative; aria-label absent)
    - Test 4: For at least 5 representative names (covers single-path, multi-child, fill-circle): renders correct child elements
      - `name="check"` → 1 path child (single-path)
      - `name="dot"` → 1 circle child with `fill={color}` (filled, not stroked)
      - `name="help"` → 1 circle + 1 path (multi-child, 2 elements)
      - `name="search"` → 1 circle + 1 path
      - `name="users"` → 2 circles + 1 path (multi-child, 3 elements)
    - Test 5: All 35 names from the closed union render without throwing (smoke test — iterate the type literal members; if a name is in the union but not in the switch, this catches it)
  </behavior>
  <files>components/primitives/Icon.tsx, components/primitives/Icon.test.tsx</files>
  <action>
    Create `components/primitives/Icon.tsx` with this exact structure (copy SVG paths verbatim from RESEARCH §5.2 / `/tmp/proto_primitives.js` lines 82–117):

    ```tsx
    // components/primitives/Icon.tsx — Phase 4 SHELL-04 icon primitive (D-79).
    // 35-name closed union; SVG paths verbatim from prototype's primitives.js Icon
    // component (RESEARCH §5.1, §5.2). No path/SVG-children slot — additions are
    // deliberate, reviewed in PR. Phase 5/6/7 extend the union additively.
    // No fresh-green tokens — Icon is not an AI-presence surface; XSS safe per
    // RESEARCH §"Security Domain" (paths are static literals, no user input).

    import type { CSSProperties, ReactElement } from 'react'

    export type IconName =
      | 'app-folder'
      | 'arrow-right'
      | 'arrow-up-right'
      | 'bank'
      | 'bell'
      | 'bolt'
      | 'calendar'
      | 'check'
      | 'chevron-down'
      | 'chevron-right'
      | 'clock'
      | 'close'
      | 'cockpit'
      | 'copilot'
      | 'credit'
      | 'docs'
      | 'dot'
      | 'edit'
      | 'external'
      | 'filter'
      | 'globe'
      | 'help'
      | 'mail'
      | 'paperclip'
      | 'pipeline'
      | 'refresh'
      | 'rocket'
      | 'search'
      | 'send'
      | 'shield'
      | 'sparkle'
      | 'stack'
      | 'tree'
      | 'upload'
      | 'users'
      | 'yen'

    export type IconProps = {
      name: IconName
      size?: number
      stroke?: number
      color?: string
      ariaLabel?: string
      style?: CSSProperties
    }

    export function Icon({
      name,
      size = 16,
      stroke = 1.6,
      color = 'currentColor',
      ariaLabel,
      style,
    }: IconProps): ReactElement {
      const svgStyle: CSSProperties = {
        width: size,
        height: size,
        display: 'block',
        flexShrink: 0,
        ...style,
      }
      const common = {
        fill: 'none',
        stroke: color,
        strokeWidth: stroke,
        strokeLinecap: 'round' as const,
        strokeLinejoin: 'round' as const,
      }
      const a11y = ariaLabel
        ? { role: 'img' as const, 'aria-label': ariaLabel }
        : { 'aria-hidden': true as const }

      switch (name) {
        case 'arrow-right':
          return <svg viewBox="0 0 24 24" style={svgStyle} {...a11y}><path d="M5 12h14M13 6l6 6-6 6" {...common} /></svg>
        case 'arrow-up-right':
          return <svg viewBox="0 0 24 24" style={svgStyle} {...a11y}><path d="M7 17L17 7M8 7h9v9" {...common} /></svg>
        case 'check':
          return <svg viewBox="0 0 24 24" style={svgStyle} {...a11y}><path d="M5 12l5 5L20 7" {...common} /></svg>
        case 'dot':
          return <svg viewBox="0 0 24 24" style={svgStyle} {...a11y}><circle cx="12" cy="12" r="4" fill={color} /></svg>
        case 'chevron-right':
          return <svg viewBox="0 0 24 24" style={svgStyle} {...a11y}><path d="M9 6l6 6-6 6" {...common} /></svg>
        case 'chevron-down':
          return <svg viewBox="0 0 24 24" style={svgStyle} {...a11y}><path d="M6 9l6 6 6-6" {...common} /></svg>
        case 'close':
          return <svg viewBox="0 0 24 24" style={svgStyle} {...a11y}><path d="M6 6l12 12M18 6L6 18" {...common} /></svg>
        case 'tree':
          return <svg viewBox="0 0 24 24" style={svgStyle} {...a11y}><path d="M12 3v6m0 0H7v4m5-4h5v4M7 13H5v4h4v-4H7zm10 0h-2v4h4v-4h-2zm-7 0h-2v4h4v-4h-2zM12 13h0" {...common} /></svg>
        case 'docs':
          return <svg viewBox="0 0 24 24" style={svgStyle} {...a11y}><path d="M8 3h8l4 4v14H8V3zM8 8h8M8 12h8M8 16h5" {...common} /></svg>
        case 'shield':
          return <svg viewBox="0 0 24 24" style={svgStyle} {...a11y}><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" {...common} /></svg>
        case 'credit':
          return <svg viewBox="0 0 24 24" style={svgStyle} {...a11y}><path d="M3 7h18v10H3V7zm0 4h18M7 15h4" {...common} /></svg>
        case 'rocket':
          return <svg viewBox="0 0 24 24" style={svgStyle} {...a11y}><path d="M5 19l3-3m6-10c3 0 5 2 5 5l-6 6-5-5 6-6zm-1 5a1 1 0 100-2 1 1 0 000 2z" {...common} /></svg>
        case 'mail':
          return <svg viewBox="0 0 24 24" style={svgStyle} {...a11y}><path d="M3 6h18v12H3V6zm0 0l9 7 9-7" {...common} /></svg>
        case 'help':
          return <svg viewBox="0 0 24 24" style={svgStyle} {...a11y}><circle cx="12" cy="12" r="9" {...common} /><path d="M9.5 9.5a2.5 2.5 0 015 0c0 1.5-2.5 2-2.5 3.5M12 17h.01" {...common} /></svg>
        case 'bell':
          return <svg viewBox="0 0 24 24" style={svgStyle} {...a11y}><path d="M6 16V11a6 6 0 1112 0v5l2 2H4l2-2zM10 20a2 2 0 004 0" {...common} /></svg>
        case 'search':
          return <svg viewBox="0 0 24 24" style={svgStyle} {...a11y}><circle cx="11" cy="11" r="7" {...common} /><path d="M20 20l-4-4" {...common} /></svg>
        case 'sparkle':
          return <svg viewBox="0 0 24 24" style={svgStyle} {...a11y}><path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6zM19 14l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z" {...common} /></svg>
        case 'cockpit':
          return <svg viewBox="0 0 24 24" style={svgStyle} {...a11y}><path d="M3 4h7v9H3V4zm11 0h7v5h-7V4zm0 9h7v7h-7v-7zM3 15h7v5H3v-5z" {...common} /></svg>
        case 'pipeline':
          return <svg viewBox="0 0 24 24" style={svgStyle} {...a11y}><path d="M3 7h4l3 4-3 4H3M10 7h4l3 4-3 4h-4" {...common} /></svg>
        case 'app-folder':
          return <svg viewBox="0 0 24 24" style={svgStyle} {...a11y}><path d="M3 7a2 2 0 012-2h5l2 3h7a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" {...common} /></svg>
        case 'copilot':
          return <svg viewBox="0 0 24 24" style={svgStyle} {...a11y}><circle cx="12" cy="12" r="9" {...common} /><path d="M8 12l3 3 5-6" {...common} /></svg>
        case 'upload':
          return <svg viewBox="0 0 24 24" style={svgStyle} {...a11y}><path d="M4 17v3h16v-3M12 15V4m0 0l-5 5m5-5l5 5" {...common} /></svg>
        case 'paperclip':
          return <svg viewBox="0 0 24 24" style={svgStyle} {...a11y}><path d="M20 12l-8 8a5 5 0 01-7-7l9-9a3 3 0 014 4l-9 9a1 1 0 01-1-1l8-8" {...common} /></svg>
        case 'calendar':
          return <svg viewBox="0 0 24 24" style={svgStyle} {...a11y}><rect x="3" y="5" width="18" height="16" rx="2" {...common} /><path d="M3 10h18M8 3v4M16 3v4" {...common} /></svg>
        case 'clock':
          return <svg viewBox="0 0 24 24" style={svgStyle} {...a11y}><circle cx="12" cy="12" r="9" {...common} /><path d="M12 7v5l3 2" {...common} /></svg>
        case 'globe':
          return <svg viewBox="0 0 24 24" style={svgStyle} {...a11y}><circle cx="12" cy="12" r="9" {...common} /><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18-3-3.5-3-14.5 0-18z" {...common} /></svg>
        case 'yen':
          return <svg viewBox="0 0 24 24" style={svgStyle} {...a11y}><path d="M6 4l6 8 6-8M6 13h12M6 17h12M12 12v8" {...common} /></svg>
        case 'filter':
          return <svg viewBox="0 0 24 24" style={svgStyle} {...a11y}><path d="M4 5h16l-6 8v6l-4-2v-4L4 5z" {...common} /></svg>
        case 'edit':
          return <svg viewBox="0 0 24 24" style={svgStyle} {...a11y}><path d="M4 20h4L20 8l-4-4L4 16v4z" {...common} /></svg>
        case 'refresh':
          return <svg viewBox="0 0 24 24" style={svgStyle} {...a11y}><path d="M4 4v6h6M20 20v-6h-6M5 14a8 8 0 0014 4M19 10A8 8 0 005 6" {...common} /></svg>
        case 'send':
          return <svg viewBox="0 0 24 24" style={svgStyle} {...a11y}><path d="M4 20l17-8L4 4v6l11 2-11 2v6z" {...common} /></svg>
        case 'external':
          return <svg viewBox="0 0 24 24" style={svgStyle} {...a11y}><path d="M14 3h7v7M21 3l-9 9M10 5H5a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-5" {...common} /></svg>
        case 'stack':
          return <svg viewBox="0 0 24 24" style={svgStyle} {...a11y}><path d="M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5M3 18l9 5 9-5" {...common} /></svg>
        case 'users':
          return <svg viewBox="0 0 24 24" style={svgStyle} {...a11y}><circle cx="9" cy="8" r="3" {...common} /><circle cx="17" cy="9" r="2" {...common} /><path d="M3 19c0-3 3-5 6-5s6 2 6 5M15 19c0-2 2-4 4-4s2 2 2 4" {...common} /></svg>
        case 'bolt':
          return <svg viewBox="0 0 24 24" style={svgStyle} {...a11y}><path d="M13 3L5 14h6l-1 7 8-11h-6l1-7z" {...common} /></svg>
        case 'bank':
          return <svg viewBox="0 0 24 24" style={svgStyle} {...a11y}><path d="M3 10l9-6 9 6M5 10v9h14v-9M8 12v5M12 12v5M16 12v5M3 21h18" {...common} /></svg>
      }
    }
    ```

    Note: TypeScript's exhaustive-switch checking on the closed `IconName` union means every name MUST appear in the switch — if a name in the union is missing, `tsc --noEmit` errors with "Function lacks ending return statement". This is the type-level test that the union and switch stay in sync.

    Create `components/primitives/Icon.test.tsx`:

    ```tsx
    /**
     * components/primitives/Icon.test.tsx — Tests for the Icon primitive (SHELL-04, D-79).
     */

    import { describe, it, expect } from 'vitest'
    import { render } from '@testing-library/react'
    import { Icon, type IconName } from '@/components/primitives/Icon'

    const ALL_NAMES: ReadonlyArray<IconName> = [
      'app-folder', 'arrow-right', 'arrow-up-right', 'bank', 'bell', 'bolt',
      'calendar', 'check', 'chevron-down', 'chevron-right', 'clock', 'close',
      'cockpit', 'copilot', 'credit', 'docs', 'dot', 'edit', 'external',
      'filter', 'globe', 'help', 'mail', 'paperclip', 'pipeline', 'refresh',
      'rocket', 'search', 'send', 'shield', 'sparkle', 'stack', 'tree',
      'upload', 'users', 'yen',
    ]

    describe('components/primitives/Icon (SHELL-04, D-79)', () => {
      it('renders an svg for every name in the closed union (35 names)', () => {
        expect(ALL_NAMES.length).toBe(35)
        for (const name of ALL_NAMES) {
          const { container } = render(<Icon name={name} />)
          const svg = container.querySelector('svg')
          expect(svg, `Icon name="${name}" must render an <svg>`).not.toBeNull()
        }
      })

      it('ariaLabel sets role=img and aria-label, no aria-hidden', () => {
        const { container } = render(<Icon name="mail" ariaLabel="Mail" />)
        const svg = container.querySelector('svg')
        expect(svg?.getAttribute('role')).toBe('img')
        expect(svg?.getAttribute('aria-label')).toBe('Mail')
        expect(svg?.hasAttribute('aria-hidden')).toBe(false)
      })

      it('omitted ariaLabel sets aria-hidden=true and no aria-label', () => {
        const { container } = render(<Icon name="check" />)
        const svg = container.querySelector('svg')
        expect(svg?.getAttribute('aria-hidden')).toBe('true')
        expect(svg?.hasAttribute('aria-label')).toBe(false)
        expect(svg?.hasAttribute('role')).toBe(false)
      })

      it('check icon renders single path child', () => {
        const { container } = render(<Icon name="check" />)
        const paths = container.querySelectorAll('svg > path')
        const circles = container.querySelectorAll('svg > circle')
        expect(paths.length).toBe(1)
        expect(circles.length).toBe(0)
      })

      it('dot icon renders one circle with fill (not stroke)', () => {
        const { container } = render(<Icon name="dot" color="#ff0000" />)
        const circle = container.querySelector('svg > circle')
        expect(circle).not.toBeNull()
        expect(circle?.getAttribute('fill')).toBe('#ff0000')
      })

      it('help icon renders one circle + one path (multi-child)', () => {
        const { container } = render(<Icon name="help" />)
        const circles = container.querySelectorAll('svg > circle')
        const paths = container.querySelectorAll('svg > path')
        expect(circles.length).toBe(1)
        expect(paths.length).toBe(1)
      })

      it('users icon renders two circles + one path (3 children)', () => {
        const { container } = render(<Icon name="users" />)
        const circles = container.querySelectorAll('svg > circle')
        const paths = container.querySelectorAll('svg > path')
        expect(circles.length).toBe(2)
        expect(paths.length).toBe(1)
      })

      it('size prop applies to width and height', () => {
        const { container } = render(<Icon name="check" size={24} />)
        const svg = container.querySelector('svg') as SVGElement
        expect((svg.style as CSSStyleDeclaration).width).toBe('24px')
        expect((svg.style as CSSStyleDeclaration).height).toBe('24px')
      })
    })
    ```
  </action>
  <verify>
    <automated>
    test -f components/primitives/Icon.tsx && grep -q "export type IconName" components/primitives/Icon.tsx && grep -c "case '" components/primitives/Icon.tsx | awk '{exit ($1 != 36)}' && npm run test -- components/primitives/Icon.test.tsx && npm run typecheck && npm run lint
    </automated>
  </verify>
  <acceptance_criteria>
    - File `components/primitives/Icon.tsx` exists
    - File exports `IconName` as a closed string union of exactly 35 alphabetized literals (verifiable: `grep -c "  | '" components/primitives/Icon.tsx` ≥ 34, accounting for the first member starting with `=` not `|`)
    - File exports `IconProps` with fields `name: IconName`, `size?: number`, `stroke?: number`, `color?: string`, `ariaLabel?: string`, `style?: CSSProperties`
    - Default `size = 16`, `stroke = 1.6`, `color = 'currentColor'`
    - Switch statement contains exactly 36 `case '` lines (35 cases + 1 starting line offset, OR 35 cases — accept ≥35)
    - The `dot` case uses `fill={color}` (NOT stroke)
    - The `help`, `search`, `copilot`, `clock`, `globe` cases each render a `<circle>` + `<path>` pair
    - The `calendar` case renders a `<rect>` + `<path>` pair
    - The `users` case renders 2 `<circle>` + 1 `<path>`
    - When `ariaLabel` is provided, the rendered svg has `role="img"` and `aria-label="<value>"`
    - When `ariaLabel` is omitted, the rendered svg has `aria-hidden="true"`
    - File has NO fresh-green tokens (`grep -E '(fresh-green|#[Bb][Ff][Dd]7[3]0)' components/primitives/Icon.tsx` returns 0 matches)
    - File `components/primitives/Icon.test.tsx` exists with ≥7 test cases
    - `npm run test -- components/primitives/Icon.test.tsx` exits 0; the "renders an svg for every name" test iterates the full 35-name list and passes
    - `npm run typecheck` exits 0 (TypeScript exhaustive-switch holds — all 35 union members are matched in the switch)
    - `npm run lint` exits 0
  </acceptance_criteria>
  <done>Icon primitive with 35-name closed union + verbatim SVG paths + a11y per FLAG 1; tests cover every name and special cases.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 3: Create components/primitives/Avatar.tsx + test (7-member AvatarColor enum, no fresh-green)</name>
  <read_first>
    - .planning/phases/04-app-shell-primitives/04-UI-SPEC.md §"Component Inventory" Avatar row (line 254) — props `{ initials: string, size?: number, color: AvatarColor, textColor?: AvatarColor }`
    - .planning/phases/04-app-shell-primitives/04-UI-SPEC.md §"Color > Avatar.color closed enum" (lines 188–206) — UI-SPEC's 12-member candidate list
    - .planning/phases/04-app-shell-primitives/04-RESEARCH.md §5.6 (lines 1086–1106) — recommendation: 7-member subset for Phase 4 (LOCKED in this plan)
    - .planning/phases/04-app-shell-primitives/04-PATTERNS.md §"components/primitives/Avatar.tsx" (lines 411–419)
    - .planning/phases/04-app-shell-primitives/04-UI-SPEC.md §"Typography > Micro/mono" (line 117) — Avatar initials are IBM Plex Mono 12/400
  </read_first>
  <behavior>
    - Test 1: Renders a `<span>` (or `<div>`) with the provided initials as text
    - Test 2: Default size=30 produces inline width:30px, height:30px
    - Test 3: For each of the 7 AvatarColor members, the rendered element's classList contains `bg-{color}` (the corresponding Tailwind utility)
    - Test 4: textColor prop maps to `text-{textColor}` Tailwind class; default text color is `paper`
    - Test 5: TypeScript REJECTS `color="fresh-green"` (compile-time test — verified by `npm run typecheck` passing for the locked enum AND by attempting to typecheck a fixture file that uses `color="fresh-green"` should fail; this test is implicit via the closed union)
    - Test 6: Initials render in IBM Plex Mono (verifiable: classList contains `font-mono`)
  </behavior>
  <files>components/primitives/Avatar.tsx, components/primitives/Avatar.test.tsx</files>
  <action>
    Create `components/primitives/Avatar.tsx` with this exact content:

    ```tsx
    // components/primitives/Avatar.tsx — Phase 4 SHELL-04 avatar primitive (D-78).
    // 7-member closed AvatarColor enum (Plan 04-05 lock; Phase 5/6 add additively).
    // Explicitly EXCLUDES fresh-green family per D-78 — the closed union blocks
    // callers from passing fresh-green at compile time, which is the second line
    // of defense for SHELL-05 (the first being scripts/check-fresh-green.sh).

    import type { CSSProperties, ReactElement } from 'react'

    export type AvatarColor =
      | 'trad-green'
      | 'trad-green-soft'
      | 'trad-green-deep'
      | 'ink'
      | 'ink-muted'
      | 'paper'
      | 'mist'

    const BG_BY_COLOR: Record<AvatarColor, string> = {
      'trad-green': 'bg-trad-green',
      'trad-green-soft': 'bg-trad-green-soft',
      'trad-green-deep': 'bg-trad-green-deep',
      ink: 'bg-ink',
      'ink-muted': 'bg-ink-muted',
      paper: 'bg-paper',
      mist: 'bg-mist',
    }

    const TEXT_BY_COLOR: Record<AvatarColor, string> = {
      'trad-green': 'text-trad-green',
      'trad-green-soft': 'text-trad-green-soft',
      'trad-green-deep': 'text-trad-green-deep',
      ink: 'text-ink',
      'ink-muted': 'text-ink-muted',
      paper: 'text-paper',
      mist: 'text-mist',
    }

    export type AvatarProps = {
      initials: string
      size?: number
      color: AvatarColor
      textColor?: AvatarColor
    }

    export function Avatar({
      initials,
      size = 30,
      color,
      textColor = 'paper',
    }: AvatarProps): ReactElement {
      const sizeStyle: CSSProperties = {
        width: size,
        height: size,
        fontSize: 12,
        flexShrink: 0,
      }
      const className = [
        'inline-flex items-center justify-center rounded-full',
        'font-mono font-normal leading-none',
        BG_BY_COLOR[color],
        TEXT_BY_COLOR[textColor],
      ].join(' ')
      return (
        <span className={className} style={sizeStyle}>
          {initials}
        </span>
      )
    }
    ```

    Conventions:
    - Default `color` is REQUIRED (no default) — per UI-SPEC `color: AvatarColor` is mandatory; callers MUST pick a token. This is the "no silent fresh-green" rule applied at the API level.
    - Default `textColor: 'paper'` — sensible default for dark backgrounds (TopStrip use case). Caller overrides for light avatars.
    - Default `size: 30` per UI-SPEC OD-4
    - `font-mono` (IBM Plex Mono) + `font-normal` (weight 400) per UI-SPEC Typography table — initials are 12/400
    - `Record<AvatarColor, string>` typing prevents `noUncheckedIndexedAccess` undefined issue (RESEARCH Pitfall 2)
    - NO fresh-green tokens anywhere in the file — closed enum prevents callers from passing them; the implementation never references `bg-fresh-green` etc.

    Create `components/primitives/Avatar.test.tsx`:

    ```tsx
    /**
     * components/primitives/Avatar.test.tsx — Tests for Avatar primitive (SHELL-04, D-78).
     */

    import { describe, it, expect } from 'vitest'
    import { render } from '@testing-library/react'
    import { Avatar, type AvatarColor } from '@/components/primitives/Avatar'

    const ALL_COLORS: ReadonlyArray<AvatarColor> = [
      'trad-green',
      'trad-green-soft',
      'trad-green-deep',
      'ink',
      'ink-muted',
      'paper',
      'mist',
    ]

    describe('components/primitives/Avatar (SHELL-04, D-78)', () => {
      it('renders initials as text', () => {
        const { container } = render(<Avatar initials="YT" color="trad-green-soft" />)
        const span = container.firstElementChild as HTMLElement
        expect(span.textContent).toBe('YT')
      })

      it('default size is 30 (UI-SPEC OD-4)', () => {
        const { container } = render(<Avatar initials="YT" color="trad-green-soft" />)
        const span = container.firstElementChild as HTMLElement
        expect(span.style.width).toBe('30px')
        expect(span.style.height).toBe('30px')
      })

      it('size prop overrides default', () => {
        const { container } = render(<Avatar initials="JL" color="trad-green-soft" size={48} />)
        const span = container.firstElementChild as HTMLElement
        expect(span.style.width).toBe('48px')
        expect(span.style.height).toBe('48px')
      })

      it('initials rendered in mono font (font-mono utility class)', () => {
        const { container } = render(<Avatar initials="YT" color="trad-green-soft" />)
        const span = container.firstElementChild as HTMLElement
        expect(span.className).toContain('font-mono')
      })

      it('all 7 AvatarColor members map to bg-{color} utility', () => {
        for (const color of ALL_COLORS) {
          const { container } = render(<Avatar initials="XX" color={color} />)
          const span = container.firstElementChild as HTMLElement
          expect(span.className, `color="${color}" should produce bg-${color}`).toContain(`bg-${color}`)
        }
      })

      it('default textColor is "paper" (text-paper utility)', () => {
        const { container } = render(<Avatar initials="XX" color="trad-green" />)
        const span = container.firstElementChild as HTMLElement
        expect(span.className).toContain('text-paper')
      })

      it('textColor prop overrides the default', () => {
        const { container } = render(
          <Avatar initials="XX" color="paper" textColor="trad-green-deep" />
        )
        const span = container.firstElementChild as HTMLElement
        expect(span.className).toContain('text-trad-green-deep')
      })

      it('AvatarColor enum has exactly 7 members (Plan 04-05 lock)', () => {
        expect(ALL_COLORS.length).toBe(7)
      })

      it('AvatarColor enum excludes fresh-green family (D-78)', () => {
        const colors: string[] = ALL_COLORS as unknown as string[]
        expect(colors).not.toContain('fresh-green')
        expect(colors).not.toContain('fresh-green-mute')
        expect(colors).not.toContain('fresh-green-glow')
      })
    })
    ```
  </action>
  <verify>
    <automated>
    test -f components/primitives/Avatar.tsx && grep -q "export type AvatarColor" components/primitives/Avatar.tsx && ! grep -E "(fresh-green|#[Bb][Ff][Dd]7[3]0)" components/primitives/Avatar.tsx && npm run test -- components/primitives/Avatar.test.tsx && npm run typecheck && npm run lint
    </automated>
  </verify>
  <acceptance_criteria>
    - File `components/primitives/Avatar.tsx` exists
    - File exports `AvatarColor` as a closed string union of exactly 7 members: `'trad-green'`, `'trad-green-soft'`, `'trad-green-deep'`, `'ink'`, `'ink-muted'`, `'paper'`, `'mist'`
    - File exports `AvatarProps` with fields `initials: string`, `size?: number`, `color: AvatarColor` (REQUIRED, no default), `textColor?: AvatarColor`
    - File contains `Record<AvatarColor, string>` for both `BG_BY_COLOR` and `TEXT_BY_COLOR`
    - Default values: `size = 30`, `textColor = 'paper'`
    - Initials rendered with `font-mono` and `font-normal` (weight 400) classes per UI-SPEC Typography Micro/mono row
    - File has NO fresh-green tokens (`grep -E '(fresh-green|#[Bb][Ff][Dd]7[3]0)' components/primitives/Avatar.tsx` returns 0 matches — confirmed via the negation in the verify command)
    - File `components/primitives/Avatar.test.tsx` exists with ≥9 test cases
    - One test asserts `ALL_COLORS.length === 7` (the lock)
    - One test asserts `ALL_COLORS` excludes fresh-green members
    - `npm run test -- components/primitives/Avatar.test.tsx` exits 0 (all 7 colors tested, all assertions pass)
    - `npm run typecheck` exits 0
    - `npm run lint` exits 0
  </acceptance_criteria>
  <done>Avatar primitive with 7-member closed enum (no fresh-green) + initials in mono 12/400 + tests covering every color; typecheck enforces the closed enum.</done>
</task>

</tasks>

<threat_model>
This plan creates 3 presentational primitives + tests. Applicable ASVS categories: V5 Input Validation (Avatar `initials` prop), V14 Configuration (closed enums as guardrails).

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-04-05-01 | V5 Input Validation | Avatar.initials | accept | Initials are pass-through string content rendered as text; React's default escaping prevents XSS. No `dangerouslySetInnerHTML`. Phase 4 callers always pass static literals (`"YT"`, `"JL"`). |
| T-04-05-02 | V14 Configuration / SHELL-05 | Avatar.color closed enum | mitigate | Closed `AvatarColor` union excludes the entire fresh-green family by design. TypeScript blocks `color="fresh-green"` at compile time — second line of defense for SHELL-05 (first is the grep script in Plan 04-11). |
| T-04-05-03 | V5 / XSS via SVG | Icon component | accept | All 35 SVG paths are static literals in the switch; no user-controlled input flows to SVG. No `dangerouslySetInnerHTML`. Per RESEARCH §"Security Domain" line 682, risk = 0. |
| T-04-05-04 | V14 / Closed enum drift | IconName union | mitigate | TypeScript exhaustive-switch checking on the closed `IconName` union enforces that every name in the type appears in the runtime switch. If a name in the union is missing from the switch, `tsc --noEmit` errors. The type-level test is the second line of defense after Task 2's "renders an svg for every name" smoke test. |

No active threats requiring runtime mitigation.
</threat_model>

<verification>
After all 3 tasks land:
1. `npm run typecheck && npm run lint && npm run test -- components/primitives/` exits 0
2. `ls components/primitives/` shows 6 new files: Eyebrow.tsx, Eyebrow.test.tsx, Icon.tsx, Icon.test.tsx, Avatar.tsx, Avatar.test.tsx
3. `bash scripts/check-fresh-green.sh` would show 0 matches in any of these files (the script doesn't exist yet — Plan 04-11 creates it; this is a forward-compatible check)
4. Wave 3 chrome plans can `import { Eyebrow } from '@/components/primitives/Eyebrow'` etc. (and later via the barrel export from Plan 04-07)
</verification>

<success_criteria>
- [ ] `components/primitives/Eyebrow.tsx` + co-located test exist; tests pass
- [ ] `components/primitives/Icon.tsx` exports 35-name closed union; SVG paths verbatim from prototype; ariaLabel toggles role/aria-hidden; tests cover all 35 names + edge cases (multi-child, fill-vs-stroke)
- [ ] `components/primitives/Avatar.tsx` exports 7-member closed `AvatarColor` enum (NO fresh-green); tests cover every color, sizes, textColor default
- [ ] `npm run typecheck`, `npm run lint`, `npm run test` all exit 0
- [ ] No fresh-green tokens in any of these 3 primitives (grep confirms 0 matches)
</success_criteria>

<output>
After completion, create `.planning/phases/04-app-shell-primitives/04-05-SUMMARY.md`
</output>
