---
phase: 04-app-shell-primitives
plan: 08
type: execute
wave: 3
depends_on: [04-01, 04-03, 04-05]
files_modified:
  - components/shell/RisingMark.tsx
  - components/shell/RisingMark.test.tsx
  - components/shell/LanguageToggle.tsx
  - components/shell/LanguageToggle.test.tsx
  - components/shell/ModeSwitcher.tsx
  - components/shell/ModeSwitcher.test.tsx
autonomous: true
requirements: [SHELL-01, SHELL-02, SHELL-03]
tags: [shell, chrome, rising-mark, language-toggle, mode-switcher, retrofit-3-and-4, env-gated]

must_haves:
  truths:
    - "RisingMark renders the brand SVG with the fresh-green clock-hand stroke (allowlisted brand-iconographic exception per D-85)"
    - "LanguageToggle renders two non-interactive <span> segments (EN, 日本語) — visual-only per CLAUDE.md; never receives focus"
    - "ModeSwitcher is gated by NEXT_PUBLIC_SHOW_MODE_SWITCHER (returns null when not 'true' per D-68); when shown, renders DEMO eyebrow + two <Link> segments (D-69)"
    - "ModeSwitcher applies retrofit #3 (dashed border tint = ink-muted/30, NOT rgba(191,215,48,0.3)) and retrofit #4 (DEMO eyebrow color = signal-amber, NOT fresh-green) per D-88"
  artifacts:
    - path: "components/shell/RisingMark.tsx"
      provides: "RisingMark — brand SVG with fresh-green clock hand (allowlisted)"
      exports: ["RisingMark"]
    - path: "components/shell/LanguageToggle.tsx"
      provides: "LanguageToggle — visual-only EN / 日本語 segments"
      exports: ["LanguageToggle"]
    - path: "components/shell/ModeSwitcher.tsx"
      provides: "ModeSwitcher — env-gated dev affordance with two <Link> segments"
      exports: ["ModeSwitcher"]
  key_links:
    - from: "components/shell/ModeSwitcher.tsx"
      to: "lib/persona.ts PERSONA_HOME"
      via: "Link href"
      pattern: "PERSONA_HOME\\.client.*PERSONA_HOME\\.rm"
    - from: "components/shell/ModeSwitcher.tsx"
      to: "process.env.NEXT_PUBLIC_SHOW_MODE_SWITCHER"
      via: "build-time env gate"
      pattern: "NEXT_PUBLIC_SHOW_MODE_SWITCHER"
---

<objective>
Build the three small chrome components TopStrip composes: RisingMark (brand SVG; the only allowlisted shell file because of brand-iconographic exception per D-85), LanguageToggle (visual-only EN / 日本語), ModeSwitcher (env-gated dev affordance with the retrofit #3 + #4 SHELL-05 violations FIXED at authorship time — NEVER copy the prototype's `rgba(191,215,48,0.3)` border or `var(--fresh-green)` DEMO eyebrow into the new code).

Per CONTEXT D-71 + UI-SPEC OD-10, folder is `components/shell/` (LOCKED — not `components/chrome/`).

Per RESEARCH §5.10 the retrofit principle is "the retrofit is to NEVER copy the violations into the new code." This plan authors fresh files that use the replacement tokens directly. The SHELL-05 grep script (Plan 04-11) sees no fresh-green in ModeSwitcher.tsx because there isn't any — pre-emptively fixed.

Output:
- 3 chrome `.tsx` files in `components/shell/`
- 3 co-located `.test.tsx` files
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

<interfaces>
<!-- RisingMark — verbatim from /tmp/proto_primitives.js lines 5-17 (with prop names matched) -->
```tsx
function RisingMark({ size = 28, color = "var(--trad-green)", hand = "var(--fresh-green)" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" style={{ display: "block", flexShrink: 0 }}>
      <circle cx="20" cy="20" r="17" fill="none" stroke={color} strokeWidth="2" />
      <circle cx="20" cy="20" r="2.2" fill={color} />
      {/* clock-hand stroke rising to ~1 o'clock */}
      <line x1="20" y1="20" x2="29.2" y2="12" stroke={hand} strokeWidth="2.4" strokeLinecap="round" />
      {/* tiny serif tick at 12 */}
      <line x1="20" y1="4" x2="20" y2="7" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
```
The `hand` prop default is `var(--fresh-green)` — that's the brand-iconographic exception per D-85 + UI-SPEC "Color > Accent reserved for" line 173. RisingMark.tsx is allowlisted in Plan 04-11.

<!-- LanguageToggle visual contract — UI-SPEC TopStrip Composition + CLAUDE.md "Language: English only in UI body" -->
- Two non-interactive `<span>` segments (NOT button, NOT Link): EN (active, `var(--paper)` color, padding 2px 6px, bg `rgba(255,255,255,0.08)`, border-radius 4) + 日本語 (inactive, `rgba(250,251,247,0.7)` color)
- Render in TopStrip context (parent is `bg-trad-green-deep`); LanguageToggle's own background uses subtle white-tint (8% opacity) on the active segment for "you're reading this language" without breaking the dark chrome
- `EN` uses Inter Tight (font-body); `日本語` uses Noto Sans JP (font-jp)
- Both at 14px / weight 500 (UI-SPEC Body/label tier)
- Wrapper: `inline-flex items-center gap-1`

<!-- ModeSwitcher visual contract — UI-SPEC TopStrip Composition + retrofits #3, #4 + RESEARCH §5.7 lines 1129-1135 -->
- Container: `inline-flex items-center gap-1 px-1 py-1 rounded-full border border-dashed border-ink-muted/30` (retrofit #3 — paper-toned dashed border, NOT fresh-green tint; matches `rgba(122,130,125,0.3)` derived from `--ink-muted`)
- Background: `bg-black/30` (matches prototype's `rgba(0,0,0,0.32)` — black-tint inset on the trad-green-deep chrome)
- DEMO eyebrow: leading element using <Eyebrow> primitive with `className="text-signal-amber px-2"` (retrofit #4 — amber, NOT fresh-green; eyebrow base is 10/500 IBM Plex Mono uppercase)
- Two `<Link>` segments per D-69: `href={PERSONA_HOME.client}` (`/journey`) and `href={PERSONA_HOME.rm}` (`/cockpit`)
- Active segment (current pathname matches): `bg-paper text-trad-green-deep px-3 py-1 rounded-full text-[14px] font-medium`
- Inactive segment: `bg-trad-green-deep text-paper px-3 py-1 rounded-full text-[14px] font-medium hover:bg-trad-green` (UI-SPEC Interaction States line 393)
- Focus-visible (UI-SPEC line 394): `focus-visible:outline-2 focus-visible:outline-paper focus-visible:outline-offset-2` (paper outline on dark chrome)
- Segment labels: `Client · Yuki` and `RM · James`
- Active determination: takes `activeMode: 'client' | 'rm' | 'demo'` prop (passed by TopStrip from `modeForPathname()`); when activeMode='demo', BOTH segments are inactive (visual ambiguity: "you're on neither")
- Env gate: at top of function, `if (process.env.NEXT_PUBLIC_SHOW_MODE_SWITCHER !== 'true') return null` per D-68

ModeSwitcher is a server component (no 'use client') — Link from next/link works in RSC; usePathname is NOT used here (TopStrip computes activeMode and passes as prop, keeping ModeSwitcher itself stateless).
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Create RisingMark.tsx + test (allowlisted brand SVG)</name>
  <read_first>
    - .planning/phases/04-app-shell-primitives/04-UI-SPEC.md §"Component Inventory > Chrome" RisingMark row (line 265)
    - .planning/phases/04-app-shell-primitives/04-UI-SPEC.md §"Color > Accent reserved for" RisingMark row (line 173) — brand-iconographic exception
    - .planning/phases/04-app-shell-primitives/04-CONTEXT.md "Specifics" Rising Mark brand-vs-AI tension (lines 258–262) — Option (a) recommended: allowlist
    - .planning/phases/04-app-shell-primitives/04-RESEARCH.md §5.10 row 5 (sidebar dot retrofit, NOT this file — RisingMark stays as-is)
    - /tmp/proto_primitives.js (lines 5–17) — verbatim SVG source
    - .planning/phases/04-app-shell-primitives/04-PATTERNS.md §"components/shell/RisingMark.tsx" (lines 124–153)
    - .planning/phases/04-app-shell-primitives/04-UI-SPEC.md §"Open Decisions OD-3" — sized at 24px in TopStrip / 26px in BrandLockup
  </read_first>
  <behavior>
    - Test 1: Renders an `<svg>` with `viewBox="0 0 40 40"`
    - Test 2: SVG contains 2 circles + 2 lines (4 children total per prototype)
    - Test 3: Default size = 24 (UI-SPEC OD-3 TopStrip default; the prototype default 28 is overridden to match UI-SPEC)
    - Test 4: Default `color` prop = `'var(--color-trad-green)'`; default `hand` prop = `'var(--color-fresh-green)'`
    - Test 5: Custom size, color, hand props override defaults
    - Test 6: The `hand` SVG line has stroke = the hand prop value (verifiable: render with hand='red' and check stroke attr)
  </behavior>
  <files>components/shell/RisingMark.tsx, components/shell/RisingMark.test.tsx</files>
  <action>
    Create `components/shell/RisingMark.tsx`:

    ```tsx
    // components/shell/RisingMark.tsx — Phase 4 SHELL-03 brand mark.
    //
    // Renders the SMBC Origin brand mark: a circle + center dot + clock-hand stroke
    // rising to ~1 o'clock + tiny serif tick at 12. The clock hand is fresh-green
    // by design — brand-iconographic exception per D-85 + UI-SPEC "Color > Accent
    // reserved for" (line 173). The brand mark predates the AI rule; SHELL-05's
    // spirit is "don't dilute the AI signal," and the brand mark IS the SMBC signal.
    //
    // ALLOWLISTED in .freshgreen-allowlist (Plan 04-11). Rationale documented in
    // the allowlist comment header per D-86.
    //
    // Default size 24 matches UI-SPEC OD-3 (TopStrip use); the prototype's default
    // 28 is overridden so callers don't have to pass size={24} for the common case.
    // BrandLockup-style consumers (Phase 5+) pass size={26}.

    import type { CSSProperties, ReactElement } from 'react'

    export type RisingMarkProps = {
      size?: number
      color?: string
      hand?: string
      style?: CSSProperties
    }

    export function RisingMark({
      size = 24,
      color = 'var(--color-trad-green)',
      hand = 'var(--color-fresh-green)',
      style,
    }: RisingMarkProps): ReactElement {
      const svgStyle: CSSProperties = {
        display: 'block',
        flexShrink: 0,
        ...style,
      }
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 40 40"
          style={svgStyle}
          aria-hidden="true"
          focusable="false"
        >
          <circle cx="20" cy="20" r="17" fill="none" stroke={color} strokeWidth="2" />
          <circle cx="20" cy="20" r="2.2" fill={color} />
          {/* clock-hand stroke rising to ~1 o'clock */}
          <line x1="20" y1="20" x2="29.2" y2="12" stroke={hand} strokeWidth="2.4" strokeLinecap="round" />
          {/* tiny serif tick at 12 */}
          <line x1="20" y1="4" x2="20" y2="7" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      )
    }
    ```

    Conventions:
    - Default `color` and `hand` use the FULL CSS-var name (`var(--color-trad-green)`, `var(--color-fresh-green)`) — Tailwind v4's `@theme` exposes tokens with the `--color-*` prefix
    - `aria-hidden="true"` and `focusable="false"` on the SVG — the brand mark is paired with the "Origin" wordmark text in TopStrip; the wordmark carries the meaning, the SVG is decorative for screen readers
    - Default `size = 24` (UI-SPEC OD-3 TopStrip default)
    - The `hand` line has `stroke={hand}` — the fresh-green is the prop default value (allowlisted file gets to use `var(--color-fresh-green)`)
    - File-header comment cites D-85, UI-SPEC line 173, D-86 (allowlist comment header)

    Create `components/shell/RisingMark.test.tsx`:

    ```tsx
    /**
     * components/shell/RisingMark.test.tsx — Tests for RisingMark (SHELL-03).
     */

    import { describe, it, expect } from 'vitest'
    import { render } from '@testing-library/react'
    import { RisingMark } from '@/components/shell/RisingMark'

    describe('components/shell/RisingMark (SHELL-03)', () => {
      it('renders an svg with viewBox 0 0 40 40', () => {
        const { container } = render(<RisingMark />)
        const svg = container.querySelector('svg')
        expect(svg).not.toBeNull()
        expect(svg?.getAttribute('viewBox')).toBe('0 0 40 40')
      })

      it('default size is 24 (UI-SPEC OD-3 TopStrip default)', () => {
        const { container } = render(<RisingMark />)
        const svg = container.querySelector('svg')
        expect(svg?.getAttribute('width')).toBe('24')
        expect(svg?.getAttribute('height')).toBe('24')
      })

      it('size prop overrides default (e.g., 26 for BrandLockup)', () => {
        const { container } = render(<RisingMark size={26} />)
        const svg = container.querySelector('svg')
        expect(svg?.getAttribute('width')).toBe('26')
        expect(svg?.getAttribute('height')).toBe('26')
      })

      it('contains 2 circles and 2 lines (4 SVG children)', () => {
        const { container } = render(<RisingMark />)
        const circles = container.querySelectorAll('svg > circle')
        const lines = container.querySelectorAll('svg > line')
        expect(circles.length).toBe(2)
        expect(lines.length).toBe(2)
      })

      it('hand line uses var(--color-fresh-green) by default (allowlisted brand exception)', () => {
        const { container } = render(<RisingMark />)
        const lines = container.querySelectorAll('svg > line')
        const handLine = lines[0] // first line is the clock-hand
        expect(handLine?.getAttribute('stroke')).toBe('var(--color-fresh-green)')
      })

      it('color prop overrides the circle/serif tick stroke', () => {
        const { container } = render(<RisingMark color="#000000" />)
        const circles = container.querySelectorAll('svg > circle')
        const lines = container.querySelectorAll('svg > line')
        expect(circles[0]?.getAttribute('stroke')).toBe('#000000')
        expect(circles[1]?.getAttribute('fill')).toBe('#000000')
        expect(lines[1]?.getAttribute('stroke')).toBe('#000000') // serif tick
      })

      it('hand prop overrides the clock-hand stroke', () => {
        const { container } = render(<RisingMark hand="#ff0000" />)
        const lines = container.querySelectorAll('svg > line')
        expect(lines[0]?.getAttribute('stroke')).toBe('#ff0000')
      })

      it('svg is aria-hidden=true (brand mark is decorative; wordmark carries meaning)', () => {
        const { container } = render(<RisingMark />)
        const svg = container.querySelector('svg')
        expect(svg?.getAttribute('aria-hidden')).toBe('true')
      })
    })
    ```
  </action>
  <verify>
    <automated>
    test -f components/shell/RisingMark.tsx && grep -q "var(--color-fresh-green)" components/shell/RisingMark.tsx && npm run test -- components/shell/RisingMark.test.tsx && npm run typecheck
    </automated>
  </verify>
  <acceptance_criteria>
    - File `components/shell/RisingMark.tsx` exists
    - File contains the literal `var(--color-fresh-green)` (this file IS allowlisted by D-85 — fresh-green is the BRAND signal here)
    - Default size = 24 (UI-SPEC OD-3)
    - SVG viewBox = "0 0 40 40"
    - SVG contains 2 `<circle>` + 2 `<line>` children (per prototype lines 9–14)
    - SVG has `aria-hidden="true"` and `focusable="false"`
    - File `components/shell/RisingMark.test.tsx` exists with ≥7 test cases
    - All tests pass; the "hand line stroke = var(--color-fresh-green)" test confirms the allowlisted token usage
    - `npm run typecheck` exits 0
  </acceptance_criteria>
  <done>RisingMark brand SVG renders with default fresh-green hand stroke; allowlisted file with brand-iconographic exception documented; tests verify SVG structure + prop overrides.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Create LanguageToggle.tsx + test (visual-only, non-interactive)</name>
  <read_first>
    - .planning/phases/04-app-shell-primitives/04-UI-SPEC.md §"Component Inventory > Chrome" LanguageToggle row (line 266)
    - .planning/phases/04-app-shell-primitives/04-UI-SPEC.md §"TopStrip Composition" line 317 — LanguageToggle non-interactive + cursor:default
    - .planning/phases/04-app-shell-primitives/04-UI-SPEC.md §"Interaction States > Other interactive surfaces" line 405 — render as `<span>` (NOT button/Link) so it never receives focus
    - .planning/phases/04-app-shell-primitives/04-CONTEXT.md "Specifics" — visual-only per CLAUDE.md
    - .planning/phases/04-app-shell-primitives/04-RESEARCH.md §5.7 (lines 1138–1140) — LanguageToggle layout from prototype
    - .planning/phases/04-app-shell-primitives/04-PATTERNS.md §"components/shell/LanguageToggle.tsx" (lines 156–179) — font-jp idiom analog
  </read_first>
  <behavior>
    - Test 1: Renders a wrapper `<span>` containing 2 child `<span>` segments
    - Test 2: First segment text content is "EN" with classList containing `font-body`
    - Test 3: Second segment text content is "日本語" with classList containing `font-jp`
    - Test 4: Wrapper is `inline-flex items-center gap-1`
    - Test 5: Wrapper is NOT a `<button>` or `<a>` — it never receives focus (verifiable: tabindex absent, type=button absent)
    - Test 6: Active segment "EN" has subtle white-tint background classes per UI-SPEC line 1139 (e.g., `bg-paper/8` or equivalent)
  </behavior>
  <files>components/shell/LanguageToggle.tsx, components/shell/LanguageToggle.test.tsx</files>
  <action>
    Create `components/shell/LanguageToggle.tsx`:

    ```tsx
    // components/shell/LanguageToggle.tsx — Phase 4 SHELL-01 language toggle.
    //
    // VISUAL-ONLY per CLAUDE.md "Language: English only in UI body". Both segments
    // render as <span> (NOT button, NOT Link) so they never receive focus per
    // UI-SPEC Interaction States table line 405. Real i18n is deferred (CONTEXT
    // "Deferred Ideas" — out of scope for v1).
    //
    // Active segment "EN" gets a subtle paper-tinted background (8% opacity) on
    // the trad-green-deep chrome substrate so sighted users can read "EN is active"
    // without thinking it's a button. The 日本語 segment is the inactive variant.
    // No fresh-green tokens.

    import type { ReactElement } from 'react'

    export function LanguageToggle(): ReactElement {
      return (
        <span className="inline-flex items-center gap-1 text-[14px] font-medium" aria-label="Language">
          <span className="font-body text-paper bg-paper/8 px-2 py-0.5 rounded">
            EN
          </span>
          <span className="font-jp text-paper/70 px-2 py-0.5">
            日本語
          </span>
        </span>
      )
    }
    ```

    Conventions:
    - The wrapper `<span>` carries `aria-label="Language"` for screen readers (mirrors UI-SPEC voice; non-interactive but labels its role)
    - Active "EN" segment: `bg-paper/8` (8% opacity tint matches prototype's `rgba(255,255,255,0.08)` per RESEARCH §5.7 line 1139)
    - Inactive "日本語" segment: `text-paper/70` (70% opacity matches prototype's `rgba(250,251,247,0.7)`)
    - Both segments at 14/500 — Inter Tight (font-body) for EN, Noto Sans JP (font-jp) for 日本語 (UI-SPEC Typography Body/label row)
    - NO `<button>`, NO `<a>`, NO `<Link>` — pure `<span>` so no focus, no click, no cursor-pointer
    - NO fresh-green tokens
    - Component is a server component (no 'use client')

    Create `components/shell/LanguageToggle.test.tsx`:

    ```tsx
    /**
     * components/shell/LanguageToggle.test.tsx — Tests for LanguageToggle (SHELL-01).
     */

    import { describe, it, expect } from 'vitest'
    import { render } from '@testing-library/react'
    import { LanguageToggle } from '@/components/shell/LanguageToggle'

    describe('components/shell/LanguageToggle (SHELL-01)', () => {
      it('renders wrapper span with two segment children', () => {
        const { container } = render(<LanguageToggle />)
        const wrapper = container.firstElementChild as HTMLElement
        expect(wrapper.tagName.toLowerCase()).toBe('span')
        expect(wrapper.children.length).toBe(2)
      })

      it('first segment is "EN" using font-body (Inter Tight)', () => {
        const { container } = render(<LanguageToggle />)
        const segments = container.querySelectorAll('span > span')
        expect(segments[0]?.textContent).toBe('EN')
        expect(segments[0]?.className).toContain('font-body')
      })

      it('second segment is "日本語" using font-jp (Noto Sans JP)', () => {
        const { container } = render(<LanguageToggle />)
        const segments = container.querySelectorAll('span > span')
        expect(segments[1]?.textContent).toBe('日本語')
        expect(segments[1]?.className).toContain('font-jp')
      })

      it('active "EN" segment has bg-paper/8 (subtle white-tint)', () => {
        const { container } = render(<LanguageToggle />)
        const segments = container.querySelectorAll('span > span')
        expect(segments[0]?.className).toContain('bg-paper/8')
      })

      it('inactive "日本語" segment has text-paper/70 (70% opacity)', () => {
        const { container } = render(<LanguageToggle />)
        const segments = container.querySelectorAll('span > span')
        expect(segments[1]?.className).toContain('text-paper/70')
      })

      it('wrapper is inline-flex items-center gap-1', () => {
        const { container } = render(<LanguageToggle />)
        const wrapper = container.firstElementChild as HTMLElement
        expect(wrapper.className).toContain('inline-flex')
        expect(wrapper.className).toContain('items-center')
        expect(wrapper.className).toContain('gap-1')
      })

      it('wrapper is NOT a button or anchor (no focus, no click)', () => {
        const { container } = render(<LanguageToggle />)
        const wrapper = container.firstElementChild as HTMLElement
        expect(wrapper.tagName.toLowerCase()).not.toBe('button')
        expect(wrapper.tagName.toLowerCase()).not.toBe('a')
        // segments also are spans, not buttons/anchors
        const segments = container.querySelectorAll('span > span')
        for (const seg of Array.from(segments)) {
          expect(seg.tagName.toLowerCase()).toBe('span')
        }
      })

      it('wrapper has aria-label="Language" for screen readers', () => {
        const { container } = render(<LanguageToggle />)
        const wrapper = container.firstElementChild as HTMLElement
        expect(wrapper.getAttribute('aria-label')).toBe('Language')
      })
    })
    ```
  </action>
  <verify>
    <automated>
    test -f components/shell/LanguageToggle.tsx && ! grep -E "(fresh-green|#[Bb][Ff][Dd]7[3]0)" components/shell/LanguageToggle.tsx && grep -q "日本語" components/shell/LanguageToggle.tsx && grep -q "font-jp" components/shell/LanguageToggle.tsx && npm run test -- components/shell/LanguageToggle.test.tsx && npm run typecheck
    </automated>
  </verify>
  <acceptance_criteria>
    - File `components/shell/LanguageToggle.tsx` exists
    - File contains the literal Japanese characters `日本語` (UTF-8 encoding preserved)
    - File uses `font-jp` for the Japanese segment and `font-body` for EN
    - Active EN segment uses `bg-paper/8` (subtle 8% white tint)
    - Both segments render as `<span>` (NOT `<button>` / `<Link>` / `<a>`)
    - File has NO fresh-green tokens
    - File `components/shell/LanguageToggle.test.tsx` exists with ≥8 test cases
    - All tests pass
    - `npm run typecheck` exits 0
  </acceptance_criteria>
  <done>LanguageToggle visual-only with EN + 日本語 segments rendered as non-interactive spans; tests confirm no focus surface, font-jp/font-body utilities applied.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 3: Create ModeSwitcher.tsx + test (env-gated; retrofits #3 + #4 applied at authorship)</name>
  <read_first>
    - .planning/phases/04-app-shell-primitives/04-UI-SPEC.md §"Component Inventory > Chrome" ModeSwitcher row (line 267)
    - .planning/phases/04-app-shell-primitives/04-UI-SPEC.md §"Color > Forbidden surfaces" rows 3 + 4 (lines 182, 183) — retrofit replacements
    - .planning/phases/04-app-shell-primitives/04-UI-SPEC.md §"Interaction States > ModeSwitcher" (lines 388–399) — hover / focus-visible contract
    - .planning/phases/04-app-shell-primitives/04-CONTEXT.md D-68 (lines 39), D-69 (lines 40), D-70 (lines 41)
    - .planning/phases/04-app-shell-primitives/04-RESEARCH.md §"Pattern 3: ModeSwitcher as two `<Link>`s" (lines 377–417)
    - .planning/phases/04-app-shell-primitives/04-RESEARCH.md §5.10 row 3 + row 4 (line 1196, 1198) — retrofit token recommendations
    - .planning/phases/04-app-shell-primitives/04-PATTERNS.md §"components/shell/ModeSwitcher.tsx" (lines 182–207) — Link analog from app/page.tsx
    - lib/persona.ts (Plan 04-03 — must exist before this task; verify PERSONA_HOME exports)
    - components/primitives/Eyebrow.tsx (Plan 04-05 — must exist; verify Eyebrow primitive imports)
  </read_first>
  <behavior>
    - Test 1: When `process.env.NEXT_PUBLIC_SHOW_MODE_SWITCHER !== 'true'`, returns null (renders nothing)
    - Test 2: When env var is 'true', renders a wrapper element containing DEMO eyebrow + 2 Link segments
    - Test 3: DEMO eyebrow uses `text-signal-amber` (retrofit #4 — NOT fresh-green)
    - Test 4: Wrapper container has `border-dashed` and `border-ink-muted/30` classes (retrofit #3 — NOT fresh-green border)
    - Test 5: Two `<a>` elements (Next.js `<Link>` renders as `<a>` in jsdom) with hrefs `/journey` and `/cockpit`
    - Test 6: When activeMode='client', the /journey link has bg-paper / text-trad-green-deep (active styling); /cockpit has bg-trad-green-deep / text-paper (inactive)
    - Test 7: When activeMode='rm', the /cockpit link is active and /journey is inactive
    - Test 8: When activeMode='demo', BOTH segments are inactive (visual ambiguity)
    - Test 9: Container has NO fresh-green tokens anywhere (negative invariant — retrofits enforced at authorship)
  </behavior>
  <files>components/shell/ModeSwitcher.tsx, components/shell/ModeSwitcher.test.tsx</files>
  <action>
    Create `components/shell/ModeSwitcher.tsx`:

    ```tsx
    // components/shell/ModeSwitcher.tsx — Phase 4 SHELL-02 dev-only mode switcher.
    //
    // Gated by NEXT_PUBLIC_SHOW_MODE_SWITCHER env var (D-68). Renders null in
    // production builds where the env var is unset/false. Two <Link>s per D-69 —
    // active determined by activeMode prop (TopStrip computes via modeForPathname).
    //
    // SHELL-05 retrofits applied at authorship time per D-88 — this code uses the
    // replacement tokens directly, so the SHELL-05 grep script (Plan 04-11) sees no
    // fresh-green here. Retrofits:
    //   #3 dashed border tint: rgba(191,215,48,0.3) → border-ink-muted/30
    //   #4 DEMO eyebrow color: var(--fresh-green) → text-signal-amber
    //
    // No 'use client' — Link from next/link works in RSC; activeMode is passed by
    // the parent (TopStrip) which holds the only client boundary in the chrome.

    import type { ReactElement } from 'react'
    import Link from 'next/link'
    import { Eyebrow } from '@/components/primitives/Eyebrow'
    import { PERSONA_HOME, type Mode } from '@/lib/persona'

    export type ModeSwitcherProps = {
      activeMode: Mode
    }

    export function ModeSwitcher({ activeMode }: ModeSwitcherProps): ReactElement | null {
      if (process.env.NEXT_PUBLIC_SHOW_MODE_SWITCHER !== 'true') {
        return null
      }

      const baseSegment =
        'px-3 py-1 rounded-full text-[14px] font-medium transition-colors duration-200 ease-out focus-visible:outline-2 focus-visible:outline-paper focus-visible:outline-offset-2'
      const activeSegment = `${baseSegment} bg-paper text-trad-green-deep`
      const inactiveSegment = `${baseSegment} bg-trad-green-deep text-paper hover:bg-trad-green`

      const clientActive = activeMode === 'client'
      const rmActive = activeMode === 'rm'

      return (
        <span className="inline-flex items-center gap-1 px-1 py-1 rounded-full bg-black/30 border border-dashed border-ink-muted/30">
          <Eyebrow className="text-signal-amber px-2">DEMO</Eyebrow>
          <Link
            href={PERSONA_HOME.client}
            className={clientActive ? activeSegment : inactiveSegment}
            aria-current={clientActive ? 'page' : undefined}
          >
            Client · Yuki
          </Link>
          <Link
            href={PERSONA_HOME.rm}
            className={rmActive ? activeSegment : inactiveSegment}
            aria-current={rmActive ? 'page' : undefined}
          >
            RM · James
          </Link>
        </span>
      )
    }
    ```

    Conventions:
    - Env gate at the TOP of the function — early return null
    - Container classes (retrofit #3): `bg-black/30 border border-dashed border-ink-muted/30` — NO `rgba(191,215,48,0.3)`, NO fresh-green
    - DEMO eyebrow (retrofit #4): `<Eyebrow className="text-signal-amber px-2">DEMO</Eyebrow>` — NO fresh-green
    - Active vs inactive segment classes per UI-SPEC Interaction States table (line 393–395)
    - Hover on inactive: `hover:bg-trad-green` (lighter than `-deep`)
    - Focus-visible: `outline-2 outline-paper outline-offset-2` (paper outline on dark chrome)
    - `aria-current="page"` on the active Link for accessibility
    - `Mode` type imported from `lib/persona.ts` (3-arm union including 'demo')
    - When activeMode='demo', NEITHER `clientActive` nor `rmActive` is true — both segments render as inactive (visual ambiguity per RESEARCH §8.2)
    - File has NO fresh-green tokens at all (verifiable via grep — this file is NOT in the allowlist)

    Create `components/shell/ModeSwitcher.test.tsx`:

    ```tsx
    /**
     * components/shell/ModeSwitcher.test.tsx — Tests for ModeSwitcher (SHELL-02, D-68, D-69, retrofits #3 #4).
     */

    import { describe, it, expect, beforeEach, afterEach } from 'vitest'
    import { render } from '@testing-library/react'
    import { ModeSwitcher } from '@/components/shell/ModeSwitcher'

    // Set/restore env var across tests so the gate is exercised in both directions.
    const ORIGINAL_ENV = process.env.NEXT_PUBLIC_SHOW_MODE_SWITCHER

    afterEach(() => {
      // Reset env var to original after every test
      if (ORIGINAL_ENV === undefined) {
        delete process.env.NEXT_PUBLIC_SHOW_MODE_SWITCHER
      } else {
        process.env.NEXT_PUBLIC_SHOW_MODE_SWITCHER = ORIGINAL_ENV
      }
    })

    describe('components/shell/ModeSwitcher (SHELL-02, D-68 env gate)', () => {
      it('renders null when env var is undefined', () => {
        delete process.env.NEXT_PUBLIC_SHOW_MODE_SWITCHER
        const { container } = render(<ModeSwitcher activeMode="client" />)
        expect(container.firstChild).toBeNull()
      })

      it('renders null when env var is "false" (not the string "true")', () => {
        process.env.NEXT_PUBLIC_SHOW_MODE_SWITCHER = 'false'
        const { container } = render(<ModeSwitcher activeMode="client" />)
        expect(container.firstChild).toBeNull()
      })

      it('renders null when env var is the empty string', () => {
        process.env.NEXT_PUBLIC_SHOW_MODE_SWITCHER = ''
        const { container } = render(<ModeSwitcher activeMode="client" />)
        expect(container.firstChild).toBeNull()
      })

      it('renders the switcher when env var is exactly "true"', () => {
        process.env.NEXT_PUBLIC_SHOW_MODE_SWITCHER = 'true'
        const { container } = render(<ModeSwitcher activeMode="client" />)
        expect(container.firstChild).not.toBeNull()
      })
    })

    describe('components/shell/ModeSwitcher — composition (D-69 + retrofits #3 #4)', () => {
      beforeEach(() => {
        process.env.NEXT_PUBLIC_SHOW_MODE_SWITCHER = 'true'
      })

      it('renders DEMO eyebrow with text-signal-amber (retrofit #4 — NOT fresh-green)', () => {
        const { container } = render(<ModeSwitcher activeMode="client" />)
        expect(container.textContent).toContain('DEMO')
        // The eyebrow is the first child of the wrapper; class includes signal-amber
        const wrapper = container.firstElementChild as HTMLElement
        const eyebrow = wrapper.firstElementChild as HTMLElement
        expect(eyebrow.className).toContain('text-signal-amber')
        expect(eyebrow.className).not.toMatch(/fresh-green/)
      })

      it('container border is dashed + ink-muted/30 (retrofit #3 — NOT fresh-green)', () => {
        const { container } = render(<ModeSwitcher activeMode="client" />)
        const wrapper = container.firstElementChild as HTMLElement
        expect(wrapper.className).toContain('border-dashed')
        expect(wrapper.className).toContain('border-ink-muted/30')
        expect(wrapper.className).not.toMatch(/fresh-green/)
      })

      it('renders two <a> elements (Link components) with hrefs /journey and /cockpit', () => {
        const { container } = render(<ModeSwitcher activeMode="client" />)
        const links = container.querySelectorAll('a')
        expect(links.length).toBe(2)
        expect(links[0]?.getAttribute('href')).toBe('/journey')
        expect(links[1]?.getAttribute('href')).toBe('/cockpit')
      })

      it('activeMode="client": /journey link has bg-paper text-trad-green-deep + aria-current=page', () => {
        const { container } = render(<ModeSwitcher activeMode="client" />)
        const links = container.querySelectorAll('a')
        const journeyLink = links[0] as HTMLAnchorElement
        const cockpitLink = links[1] as HTMLAnchorElement
        expect(journeyLink.className).toContain('bg-paper')
        expect(journeyLink.className).toContain('text-trad-green-deep')
        expect(journeyLink.getAttribute('aria-current')).toBe('page')
        // /cockpit is inactive
        expect(cockpitLink.className).toContain('bg-trad-green-deep')
        expect(cockpitLink.className).toContain('text-paper')
        expect(cockpitLink.getAttribute('aria-current')).toBeNull()
      })

      it('activeMode="rm": /cockpit link is active', () => {
        const { container } = render(<ModeSwitcher activeMode="rm" />)
        const links = container.querySelectorAll('a')
        const journeyLink = links[0] as HTMLAnchorElement
        const cockpitLink = links[1] as HTMLAnchorElement
        expect(cockpitLink.className).toContain('bg-paper')
        expect(cockpitLink.getAttribute('aria-current')).toBe('page')
        expect(journeyLink.className).toContain('bg-trad-green-deep')
        expect(journeyLink.getAttribute('aria-current')).toBeNull()
      })

      it('activeMode="demo": BOTH segments are inactive (visual ambiguity)', () => {
        const { container } = render(<ModeSwitcher activeMode="demo" />)
        const links = container.querySelectorAll('a')
        for (const link of Array.from(links)) {
          expect(link.className).toContain('bg-trad-green-deep')
          expect(link.className).toContain('text-paper')
          expect(link.getAttribute('aria-current')).toBeNull()
        }
      })

      it('inactive segments have hover:bg-trad-green (UI-SPEC Interaction States line 393)', () => {
        const { container } = render(<ModeSwitcher activeMode="demo" />)
        const links = container.querySelectorAll('a')
        for (const link of Array.from(links)) {
          expect(link.className).toContain('hover:bg-trad-green')
        }
      })

      it('all segments have focus-visible outline-paper outline-offset-2 (UI-SPEC line 394)', () => {
        const { container } = render(<ModeSwitcher activeMode="demo" />)
        const links = container.querySelectorAll('a')
        for (const link of Array.from(links)) {
          expect(link.className).toContain('focus-visible:outline-2')
          expect(link.className).toContain('focus-visible:outline-paper')
          expect(link.className).toContain('focus-visible:outline-offset-2')
        }
      })

      it('full HTML output contains NO fresh-green substring (retrofits enforce SHELL-05 at authorship)', () => {
        const { container } = render(<ModeSwitcher activeMode="client" />)
        expect(container.innerHTML).not.toMatch(/fresh-green/)
        expect(container.innerHTML).not.toMatch(/#[Bb][Ff][Dd]7[3]0/)
        expect(container.innerHTML).not.toMatch(/rgba\(191,\s*215,\s*48/)
      })

      it('segment labels are "Client · Yuki" and "RM · James"', () => {
        const { container } = render(<ModeSwitcher activeMode="client" />)
        const links = container.querySelectorAll('a')
        expect(links[0]?.textContent).toBe('Client · Yuki')
        expect(links[1]?.textContent).toBe('RM · James')
      })
    })
    ```

    Note on env-var testing under Vitest jsdom: `process.env` is a global Node object. Mutating it in a test affects subsequent tests in the same file. The `beforeEach` + `afterEach` pattern resets it; verified safe under Vitest's per-file test runner.
  </action>
  <verify>
    <automated>
    test -f components/shell/ModeSwitcher.tsx && ! grep -E "(fresh-green|#[Bb][Ff][Dd]7[3]0|rgba\(191,\s*215,\s*48)" components/shell/ModeSwitcher.tsx && grep -q "NEXT_PUBLIC_SHOW_MODE_SWITCHER" components/shell/ModeSwitcher.tsx && grep -q "PERSONA_HOME" components/shell/ModeSwitcher.tsx && grep -q "text-signal-amber" components/shell/ModeSwitcher.tsx && grep -q "border-ink-muted/30" components/shell/ModeSwitcher.tsx && npm run test -- components/shell/ModeSwitcher.test.tsx && npm run typecheck && npm run lint
    </automated>
  </verify>
  <acceptance_criteria>
    - File `components/shell/ModeSwitcher.tsx` exists
    - File contains the env-gate `process.env.NEXT_PUBLIC_SHOW_MODE_SWITCHER !== 'true'` check (D-68)
    - File imports `Link` from `next/link`, `Eyebrow` from `@/components/primitives/Eyebrow`, `PERSONA_HOME` and `type Mode` from `@/lib/persona`
    - File contains `text-signal-amber` (retrofit #4 — DEMO eyebrow)
    - File contains `border-ink-muted/30` and `border-dashed` (retrofit #3 — container border)
    - File has NO fresh-green tokens, NO `#BFD730`, NO `rgba(191, 215, 48, ...)` (the retrofits are enforced at authorship — verifiable via the negative grep in verify command)
    - File has NO `'use client'` directive (server component; Link works in RSC)
    - File `components/shell/ModeSwitcher.test.tsx` exists with ≥13 test cases covering: 4 env-gate cases (undefined/false/empty/true), retrofit #3 retrofit #4 absence-of-fresh-green, 2 Links rendered, activeMode='client'/'rm'/'demo' segment styling, hover/focus-visible classes, segment labels, full-HTML negative-fresh-green invariant
    - All tests pass
    - `npm run typecheck` exits 0 (closed Mode union from lib/persona resolves)
    - `npm run lint` exits 0
  </acceptance_criteria>
  <done>ModeSwitcher renders dev-only with env gate; retrofits #3 + #4 applied at authorship (no fresh-green anywhere); 13+ tests cover env gate + activeMode variants + retrofit assertions.</done>
</task>

</tasks>

<threat_model>
This plan creates the env-gated ModeSwitcher (the dominant V14 Configuration concern in Phase 4), the visual-only LanguageToggle (V5 — but no input flow), and the brand SVG RisingMark.

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-04-08-01 | V14 Configuration | NEXT_PUBLIC_SHOW_MODE_SWITCHER env var | mitigate | The dev affordance must NOT leak to Production. Verification path: (1) Phase 4 PR sets env=true in Vercel Preview scope, env=false (or unset) in Vercel Production scope (manual dashboard work, deferred per CONTEXT.md "Newly deferred"); (2) Post-merge manual check: visit https://smbcorigins.vercel.app and confirm ModeSwitcher does NOT render. The env gate at code-level (Task 3) is the necessary condition; the Vercel scoping is the sufficient condition. Pitfall #6 (RESEARCH lines 511–520) describes the related branch-protection gotcha — captured in Plan 04-11. |
| T-04-08-02 | V5 Input Validation | LanguageToggle | accept | Visual-only; renders 2 spans with no event handlers, no input flow, no state. No XSS vector. |
| T-04-08-03 | V5 / XSS via SVG | RisingMark | accept | All SVG paths/circles/lines are static literals; no `dangerouslySetInnerHTML`; the `color` and `hand` props accept CSS values (`var(--color-*)` / hex / rgba) which are sanitized by React's prop-handling for SVG attributes. Risk = 0. |
| T-04-08-04 | SHELL-05 / Token leak | ModeSwitcher | mitigate | Retrofits #3 + #4 applied at authorship — the file contains NO fresh-green tokens. The negative-invariant test (Task 3 last test) asserts `container.innerHTML` does not match the fresh-green regex. Plan 04-11's grep script catches future drift. |

Active mitigation: env gate (T-04-08-01) + retrofit-at-authorship (T-04-08-04).
</threat_model>

<verification>
After all 3 tasks land:
1. `npm run typecheck && npm run lint && npm run test -- components/shell/` exits 0
2. `ls components/shell/` shows 6 files: 3 .tsx + 3 .test.tsx
3. `grep -E "fresh-green|#[Bb][Ff][Dd]7[3]0" components/shell/ModeSwitcher.tsx components/shell/LanguageToggle.tsx` returns 0 matches (only RisingMark.tsx contains fresh-green, intentionally)
4. ModeSwitcher renders nothing without the env var; renders fully when env=true
5. Wave 4's TopStrip plan composes these 3 components
</verification>

<success_criteria>
- [ ] RisingMark.tsx renders the brand SVG; default size=24; default hand color = var(--color-fresh-green) (allowlisted brand exception)
- [ ] LanguageToggle.tsx is visual-only with EN + 日本語 spans (NOT buttons/links); no fresh-green
- [ ] ModeSwitcher.tsx is env-gated (returns null when env != 'true'); retrofit #3 (dashed border = ink-muted/30) + retrofit #4 (DEMO eyebrow = signal-amber) applied at authorship; NO fresh-green anywhere
- [ ] All 6 test files pass (≥7 + 8 + 13 = 28+ test cases total)
- [ ] `npm run typecheck`, `npm run lint`, `npm run test` all exit 0
</success_criteria>

<output>
After completion, create `.planning/phases/04-app-shell-primitives/04-08-SUMMARY.md`
</output>
