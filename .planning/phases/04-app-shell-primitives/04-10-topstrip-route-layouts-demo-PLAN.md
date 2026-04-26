---
phase: 04-app-shell-primitives
plan: 10
type: execute
wave: 4
depends_on: [04-02, 04-03, 04-04, 04-05, 04-06, 04-07, 04-08, 04-09]
files_modified:
  - components/shell/TopStrip.tsx
  - components/shell/TopStrip.test.tsx
  - app/layout.tsx
  - app/(client)/layout.tsx
  - app/(rm)/layout.tsx
  - app/dev/primitives/page.tsx
autonomous: true
requirements: [SHELL-01, SHELL-02, SHELL-03, SHELL-04]
tags: [topstrip, route-group-layouts, demo-page, retrofit-1-and-2, fraunces-soft-wonk]

must_haves:
  truths:
    - "TopStrip is a 'use client' component using usePathname() + modeForPathname; renders the full prototype shape with retrofits #1 + #2 applied at authorship (Avatar bg = trad-green-soft, mail dot = signal-amber)"
    - "TopStrip 'Origin' wordmark uses inline `style={{ fontVariationSettings: '\"SOFT\" 80, \"WONK\" 1' }}` per OD-12 strategy (b)"
    - "TopStrip on /dev/* paths suppresses persona-context block + ModeSwitcher segments are both inactive (mode='demo' branch per RESEARCH §8.2)"
    - "app/layout.tsx body now renders <TopStrip /> ABOVE {children}"
    - "app/(client)/layout.tsx wraps children in <ClientShell> (D-64); app/(rm)/layout.tsx wraps in <RMShell>"
    - "app/dev/primitives/page.tsx renders all 8 primitives in all states; lives outside route groups (no ClientShell/RMShell wraps it)"
  artifacts:
    - path: "components/shell/TopStrip.tsx"
      provides: "TopStrip — full chrome composition with retrofits #1 + #2"
      exports: ["TopStrip"]
    - path: "app/layout.tsx"
      provides: "Root layout with <TopStrip /> rendered above children"
      contains: "<TopStrip />"
    - path: "app/(client)/layout.tsx"
      provides: "Client route-group layout wrapping in ClientShell"
      contains: "ClientShell"
    - path: "app/(rm)/layout.tsx"
      provides: "RM route-group layout wrapping in RMShell"
      contains: "RMShell"
    - path: "app/dev/primitives/page.tsx"
      provides: "SHELL-04 acceptance demo page (allowlisted)"
      contains: "/dev/primitives"
  key_links:
    - from: "app/layout.tsx"
      to: "components/shell/TopStrip.tsx"
      via: "TopStrip rendered above children"
      pattern: "<TopStrip />"
    - from: "components/shell/TopStrip.tsx"
      to: "lib/persona.ts modeForPathname + PERSONAS"
      via: "usePathname → modeForPathname → PERSONAS lookup"
      pattern: "modeForPathname"
---

<objective>
Wire all the chrome together. This is the largest plan in Phase 4 — composes everything from Waves 1–3 into the live application surface. Four artifacts:

1. **TopStrip.tsx** — `'use client'` chrome bar that uses `usePathname()` + `modeForPathname` to choose between client / rm / demo content; composes RisingMark + Eyebrow + Icon (mail/help) + Avatar + LanguageToggle + ModeSwitcher. Retrofits #1 (Avatar.color = 'trad-green-soft', NOT 'fresh-green') + #2 (mail-icon notification dot bg = signal-amber, NOT fresh-green) applied at authorship per D-88.

2. **app/layout.tsx** — insert `<TopStrip />` above `{children}` (single-line edit; Phase 04-02 already did the font edits).

3. **app/(client)/layout.tsx** + **app/(rm)/layout.tsx** — route-group layouts wrapping their group's pages in ClientShell / RMShell.

4. **app/dev/primitives/page.tsx** — public SHELL-04 acceptance demo page rendering all 8 primitives in all states. Lives OUTSIDE both route groups per D-80.

Per RESEARCH §8.2: TopStrip's 'demo' mode (when pathname starts with `/dev`) suppresses the persona-context block (no Yuki/James shown) and renders both ModeSwitcher segments as inactive. LanguageToggle + mail/help icons stay visible (they're not persona-specific) per RESEARCH §"Open Questions" #3.

Per OD-12 strategy (b): the "Origin" wordmark uses inline `style={{ fontVariationSettings: '"SOFT" 80, "WONK" 1' }}` — this is the ONLY consumer of SOFT/WONK in Phase 4 chrome.

Output:
- 1 new chrome `.tsx` (TopStrip) + 1 test
- 3 layout `.tsx` files (root mod + 2 route-group new)
- 1 demo page
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
@app/layout.tsx
@app/(client)/journey/page.tsx
@app/(rm)/cockpit/page.tsx
@app/page.tsx

<interfaces>
<!-- TopStrip composition — UI-SPEC line 291-313 + RESEARCH §5.7 lines 1108-1151 -->
Layout (left to right at 1440px, height 56px, bg-trad-green-deep, text-paper, sticky top-0 z-100, border-bottom-rgba(255,255,255,0.06)-1px):
1. **Brand cluster** (gap 10px between RisingMark and wordmark):
   - `<RisingMark size={24} color="var(--color-paper)" hand="var(--color-fresh-green)" />` — color=paper because chrome bg is dark; hand stays fresh-green (allowlisted brand exception per RisingMark allowlist entry)
   - "Origin" wordmark: `<span>` with `font-display text-[19px] font-semibold leading-tight tracking-[-0.02em]` + inline style `{ fontVariationSettings: '"SOFT" 80, "WONK" 1' }`
   - "BY SMBC" eyebrow: `<Eyebrow className="text-paper/50">BY SMBC</Eyebrow>`
2. **Vertical divider** 1px × 24px, `bg-paper/12` (12% opacity matches prototype's `rgba(255,255,255,0.12)`)
3. **Context badge** (mode-conditional):
   - Client mode: `<Icon name="bank" size={14} ariaLabel="Client" />` + `Kaisei Manufacturing KK` (Inter Tight 13/500 text-paper) + ` · ` + `開成製造` (Noto Sans JP 12/500 text-paper/50)
   - RM mode: `<Icon name="users" size={14} ariaLabel="RM portfolio" />` + `Japanese Corporates · 25 clients · Singapore desk`
   - Demo mode: SUPPRESSED (no badge rendered; replaced with subtle eyebrow indicating demo context)
4. **Flex spacer** `flex-1`
5. **ModeSwitcher** — `<ModeSwitcher activeMode={mode} />` (passes the 3-arm Mode prop from `modeForPathname()`)
6. **LanguageToggle** — visible across all modes per RESEARCH §"Open Questions" #3
7. **Mail icon group**: `<Icon name="mail" size={18} ariaLabel="Mail" />` with relative-positioned amber notification dot when mode === 'client' (retrofit #2: `bg-signal-amber` NOT `bg-fresh-green`)
8. **Help icon**: `<Icon name="help" size={18} ariaLabel="Help" />` (no dot)
9. **Vertical divider** (same as #2)
10. **Persona block** (suppressed in demo mode):
    - Right-aligned 2-line text: name (Inter Tight 13/400) + role <Eyebrow> (10/500 mono)
    - `<Avatar initials="YT" or "JL" size={30} color="trad-green-soft" textColor="paper" />` (retrofit #1: color='trad-green-soft' NOT 'fresh-green')
    - Demo mode: replaced with subtle "/dev/primitives" eyebrow

Active client mode: PERSONAS.client; active RM mode: PERSONAS.rm; demo mode: no persona, no badge.

<!-- app/dev/primitives/page.tsx — D-80 + UI-SPEC Demo Page section (lines 419-431) -->
- Path: `app/dev/primitives/page.tsx` → URL `/dev/primitives`
- Lives OUTSIDE route groups (no ClientShell, no RMShell — bare page on bg-paper)
- File-header comment cites D-80, UI-SPEC, and that this file is allowlisted in Plan 04-11
- Renders one section per primitive (8 sections):
  - Eyebrow: 3 examples (default, "BY SMBC", "DEMO")
  - StatusChip: all 6 kinds × dot=true / dot=false = 12 examples
  - StagePill: 3 states (done, current, upcoming) × 6 numbers = 18 examples
  - AIPulseDot: default
  - AIBadge: default + 1 with custom label
  - ActionCard: 3 recipes (action row, AI lane row with AIBadge, activity row with timestamp meta + faint)
  - Icon: all 35 names at default size, with class hint labels
  - Avatar: all 7 colors at default size (initials "YT", "JL", "AA", etc.)
- Each primitive section has a heading (Fraunces 16/600) + a small mono-font code-hint string
- Demo page is allowlisted (D-85) since it renders AI primitives

<!-- app/layout.tsx final state — combine Plan 04-02's font edit + this plan's TopStrip insert -->
After Plan 04-02: line 31 is `weight: ['400', '500'],`. After this plan: body becomes:
```tsx
<body>
  <TopStrip />
  {children}
</body>
```
The TopStrip import goes near the top with other component imports. The font configs (lines 5-34) stay byte-identical to Plan 04-02's state.
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Create TopStrip.tsx + test ('use client', usePathname, retrofits #1 + #2, OD-12 inline SOFT/WONK)</name>
  <read_first>
    - .planning/phases/04-app-shell-primitives/04-UI-SPEC.md §"TopStrip Composition" (lines 287–319) — full visual contract
    - .planning/phases/04-app-shell-primitives/04-UI-SPEC.md §"Color > Forbidden surfaces" rows 1 + 2 (lines 180, 181) — retrofit replacements
    - .planning/phases/04-app-shell-primitives/04-RESEARCH.md §5.7 (lines 1108–1151) — verbatim pixel layout
    - .planning/phases/04-app-shell-primitives/04-RESEARCH.md §5.10 rows 1 + 2 (lines 1195–1196) — retrofits
    - .planning/phases/04-app-shell-primitives/04-RESEARCH.md §"Pattern 1: TopStrip as 'use client' child of RSC root layout" (lines 308–344)
    - .planning/phases/04-app-shell-primitives/04-RESEARCH.md §"Pitfall 1: Hydration mismatch on TopStrip first render" (lines 446–456) — no rewrites in next.config.ts so safe
    - .planning/phases/04-app-shell-primitives/04-RESEARCH.md §8.2 (lines 1366–1410) — demo-mode behavior
    - .planning/phases/04-app-shell-primitives/04-PATTERNS.md §"components/shell/TopStrip.tsx" (lines 95–121)
    - lib/persona.ts (Plan 04-03) — verify exports
    - All 8 primitives + RisingMark + LanguageToggle + ModeSwitcher (Plans 04-05/06/07/08) — verify imports resolve
    - Plan 04-02's app/layout.tsx state (verify line 31 is now ['400','500'])
  </read_first>
  <behavior>
    - Test 1: TopStrip renders a `<header>` element with bg-trad-green-deep and text-paper
    - Test 2: When pathname='/journey' (client mode), persona block shows "Yuki Tanaka" / "TREASURER" / Avatar with initials "YT" + bg-trad-green-soft (retrofit #1)
    - Test 3: When pathname='/cockpit' (rm mode), persona block shows "James Lee" / "RELATIONSHIP MGR" / Avatar with initials "JL" + bg-trad-green-soft
    - Test 4: When pathname='/dev/primitives' (demo mode), persona block is suppressed (Yuki and James names absent from rendered text)
    - Test 5: When pathname='/journey' (client mode), context badge shows "Kaisei Manufacturing KK" + "開成製造"
    - Test 6: When pathname='/cockpit' (rm mode), context badge shows "Japanese Corporates · 25 clients · Singapore desk"
    - Test 7: When pathname='/dev/primitives' (demo mode), context badge is suppressed (Kaisei and Japanese Corporates absent)
    - Test 8: Mail icon notification dot is rendered ONLY in client mode AND has bg-signal-amber (retrofit #2 — NOT fresh-green)
    - Test 9: "Origin" wordmark has inline style `font-variation-settings: '"SOFT" 80, "WONK" 1'` (OD-12 strategy b)
    - Test 10: Brand cluster contains the RisingMark SVG (verifiable via querying svg viewBox=0 0 40 40 inside the header)
    - Test 11: TopStrip is height 56px (verifiable: `h-14` Tailwind class which is 56px in default scale)
    - Test 12: TopStrip is sticky top-0 z-100 (or z-[100])
    - Test 13: Full HTML output contains NO fresh-green tokens EXCEPT the RisingMark hand (the hand uses var(--color-fresh-green); the rest of TopStrip's SCSS-equivalent surfaces use the retrofitted tokens)
    - Test 14: Mocking usePathname to return different values produces different rendered outputs
  </behavior>
  <files>components/shell/TopStrip.tsx, components/shell/TopStrip.test.tsx</files>
  <action>
    Create `components/shell/TopStrip.tsx`:

    ```tsx
    'use client'

    // components/shell/TopStrip.tsx — Phase 4 SHELL-01 chrome top strip.
    //
    // Renders the full prototype shape with Phase 4 retrofits applied at authorship:
    //   #1 Avatar bg = 'trad-green-soft' (NOT 'fresh-green')
    //   #2 Mail-icon notification dot bg = 'bg-signal-amber' (NOT 'bg-fresh-green')
    //
    // 'use client' because usePathname() is a client-only hook (RESEARCH §Pattern 1).
    // Mode is computed from pathname per modeForPathname (D-67 + RESEARCH §8.2 'demo'
    // arm). Demo mode suppresses persona block + context badge — visual cue that the
    // user is on a meta page, not a persona view.
    //
    // OD-12 strategy (b): "Origin" wordmark uses inline fontVariationSettings.
    // No font import change in app/layout.tsx (Plan 04-02 left Fraunces wght-only).

    import type { ReactElement } from 'react'
    import { usePathname } from 'next/navigation'
    import { RisingMark } from './RisingMark'
    import { LanguageToggle } from './LanguageToggle'
    import { ModeSwitcher } from './ModeSwitcher'
    import { Eyebrow, Icon, Avatar } from '@/components/primitives'
    import { PERSONAS, modeForPathname, type Mode } from '@/lib/persona'

    export function TopStrip(): ReactElement {
      const pathname = usePathname()
      const mode: Mode = modeForPathname(pathname ?? '/')

      return (
        <header className="sticky top-0 z-[100] h-14 bg-trad-green-deep text-paper border-b border-paper/[0.06] flex items-center px-6 gap-6">
          {/* Brand cluster */}
          <div className="flex items-center gap-2.5">
            <RisingMark size={24} color="var(--color-paper)" hand="var(--color-fresh-green)" />
            <span className="flex items-baseline gap-2">
              <span
                className="font-display text-[19px] font-semibold leading-tight tracking-[-0.02em]"
                style={{ fontVariationSettings: '"SOFT" 80, "WONK" 1' }}
              >
                Origin
              </span>
              <Eyebrow className="text-paper/50">BY SMBC</Eyebrow>
            </span>
          </div>

          {/* Vertical divider */}
          <span aria-hidden="true" className="block w-px h-6 bg-paper/[0.12]" />

          {/* Context badge — mode-conditional */}
          <ContextBadge mode={mode} />

          {/* Spacer */}
          <span className="flex-1" />

          {/* Mode switcher (env-gated) */}
          <ModeSwitcher activeMode={mode} />

          {/* Language toggle */}
          <LanguageToggle />

          {/* Mail icon + notification dot (client mode only) */}
          <span className="relative inline-flex">
            <Icon name="mail" size={18} ariaLabel="Mail" color="var(--color-paper)" />
            {mode === 'client' ? (
              <span
                aria-hidden="true"
                className="absolute -top-0.5 -right-0.5 block w-2 h-2 rounded-full bg-signal-amber"
              />
            ) : null}
          </span>

          {/* Help icon */}
          <Icon name="help" size={18} ariaLabel="Help" color="var(--color-paper)" />

          {/* Vertical divider */}
          <span aria-hidden="true" className="block w-px h-6 bg-paper/[0.12]" />

          {/* Persona block (suppressed in demo mode) */}
          <PersonaBlock mode={mode} />
        </header>
      )
    }

    function ContextBadge({ mode }: { mode: Mode }): ReactElement | null {
      if (mode === 'demo') {
        return (
          <Eyebrow className="text-paper/50">DEV · Primitives Demo</Eyebrow>
        )
      }
      if (mode === 'client') {
        return (
          <span className="flex items-center gap-2.5 text-paper/80">
            <Icon name="bank" size={14} ariaLabel="Client" color="currentColor" />
            <span className="font-body text-[13px] font-medium">{PERSONAS.client.context}</span>
            <span className="text-paper/40">·</span>
            <span className="font-jp text-[12px] font-medium text-paper/50">{PERSONAS.client.contextJp}</span>
          </span>
        )
      }
      // mode === 'rm'
      return (
        <span className="flex items-center gap-2.5 text-paper/80">
          <Icon name="users" size={14} ariaLabel="RM portfolio" color="currentColor" />
          <span className="font-body text-[13px] font-medium">{PERSONAS.rm.context}</span>
          {PERSONAS.rm.contextSub ? (
            <>
              <span className="text-paper/40">·</span>
              <span className="font-body text-[12px] font-medium text-paper/50">{PERSONAS.rm.contextSub}</span>
            </>
          ) : null}
        </span>
      )
    }

    function PersonaBlock({ mode }: { mode: Mode }): ReactElement | null {
      if (mode === 'demo') {
        return null
      }
      const persona = mode === 'client' ? PERSONAS.client : PERSONAS.rm
      const initials = mode === 'client' ? 'YT' : 'JL'
      return (
        <div className="flex items-center gap-2.5">
          <div className="flex flex-col items-end leading-tight">
            <span className="font-body text-[13px] text-paper">{persona.name}</span>
            <Eyebrow className="text-paper/55">{persona.role}</Eyebrow>
          </div>
          <Avatar initials={initials} size={30} color="trad-green-soft" textColor="paper" />
        </div>
      )
    }
    ```

    Conventions:
    - `'use client'` on line 1 (per RESEARCH Pattern 1)
    - `usePathname()` returns `string | null` in some Next.js 16 type definitions; the `pathname ?? '/'` narrows the call to modeForPathname (which expects `string`)
    - 56px chrome height = `h-14` Tailwind class (14 × 4px = 56px)
    - `z-[100]` for arbitrary z-index 100 (matches prototype's zIndex 100)
    - `border-b border-paper/[0.06]` is the subtle separator (6% opacity matches `rgba(255,255,255,0.06)`)
    - Vertical dividers: `w-px h-6 bg-paper/[0.12]` (1px wide × 24px tall × 12% opacity)
    - Mail dot: `absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-signal-amber` (retrofit #2)
    - Avatar: `color="trad-green-soft" textColor="paper"` (retrofit #1)
    - "Origin" wordmark: inline `style={{ fontVariationSettings: '"SOFT" 80, "WONK" 1' }}` (OD-12 strategy b)
    - ModeSwitcher takes activeMode={mode} prop — TopStrip computes the mode and passes; ModeSwitcher stays stateless
    - ContextBadge + PersonaBlock are local helpers (not exported) — each takes mode prop and renders the variant
    - Demo mode: ContextBadge renders a "DEV · Primitives Demo" eyebrow (replacement for the persona-context block); PersonaBlock returns null
    - All Icon, LanguageToggle, ModeSwitcher, etc. inherit text-paper from the parent `<header>` (Tailwind cascade); explicit `color="var(--color-paper)"` on the mail/help icons because Icon's default `color="currentColor"` would already work, but being explicit makes the dark-substrate intent obvious

    Create `components/shell/TopStrip.test.tsx`:

    ```tsx
    /**
     * components/shell/TopStrip.test.tsx — Tests for TopStrip (SHELL-01, retrofits #1 #2, OD-12).
     *
     * Mocks next/navigation's usePathname so the test can drive different modes.
     */

    import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
    import { render } from '@testing-library/react'

    // Mock next/navigation BEFORE the component import resolves
    vi.mock('next/navigation', () => ({
      usePathname: () => mockPathname,
    }))

    // Local mutable state for the mock
    let mockPathname = '/'

    import { TopStrip } from '@/components/shell/TopStrip'

    const ORIGINAL_ENV = process.env.NEXT_PUBLIC_SHOW_MODE_SWITCHER

    beforeEach(() => {
      // Default to no mode-switcher so we test TopStrip independently of ModeSwitcher rendering
      delete process.env.NEXT_PUBLIC_SHOW_MODE_SWITCHER
    })

    afterEach(() => {
      mockPathname = '/'
      if (ORIGINAL_ENV === undefined) {
        delete process.env.NEXT_PUBLIC_SHOW_MODE_SWITCHER
      } else {
        process.env.NEXT_PUBLIC_SHOW_MODE_SWITCHER = ORIGINAL_ENV
      }
    })

    describe('components/shell/TopStrip — base rendering (SHELL-01)', () => {
      it('renders a <header> with bg-trad-green-deep and text-paper', () => {
        mockPathname = '/journey'
        const { container } = render(<TopStrip />)
        const header = container.querySelector('header')
        expect(header).not.toBeNull()
        expect(header?.className).toContain('bg-trad-green-deep')
        expect(header?.className).toContain('text-paper')
      })

      it('header has 56px height (h-14) and is sticky top-0 z-[100]', () => {
        mockPathname = '/journey'
        const { container } = render(<TopStrip />)
        const header = container.querySelector('header')
        expect(header?.className).toContain('h-14')
        expect(header?.className).toContain('sticky')
        expect(header?.className).toContain('top-0')
        expect(header?.className).toContain('z-[100]')
      })

      it('renders the RisingMark brand SVG (viewBox 0 0 40 40)', () => {
        mockPathname = '/journey'
        const { container } = render(<TopStrip />)
        const svg = container.querySelector('svg[viewBox="0 0 40 40"]')
        expect(svg).not.toBeNull()
      })

      it('"Origin" wordmark has inline fontVariationSettings (OD-12 strategy b)', () => {
        mockPathname = '/journey'
        const { container } = render(<TopStrip />)
        // Find the span with text "Origin"
        const allSpans = container.querySelectorAll('span')
        const origin = Array.from(allSpans).find((el) => el.textContent === 'Origin') as HTMLElement
        expect(origin).not.toBeUndefined()
        expect(origin.style.fontVariationSettings).toContain('SOFT')
        expect(origin.style.fontVariationSettings).toContain('WONK')
      })

      it('renders "BY SMBC" eyebrow', () => {
        mockPathname = '/journey'
        const { container } = render(<TopStrip />)
        expect(container.textContent).toContain('BY SMBC')
      })
    })

    describe('components/shell/TopStrip — client mode (pathname=/journey)', () => {
      beforeEach(() => {
        mockPathname = '/journey'
      })

      it('context badge shows "Kaisei Manufacturing KK" and "開成製造"', () => {
        const { container } = render(<TopStrip />)
        expect(container.textContent).toContain('Kaisei Manufacturing KK')
        expect(container.textContent).toContain('開成製造')
      })

      it('persona block shows "Yuki Tanaka" + "TREASURER"', () => {
        const { container } = render(<TopStrip />)
        expect(container.textContent).toContain('Yuki Tanaka')
        expect(container.textContent).toContain('TREASURER')
      })

      it('Avatar has initials "YT", color trad-green-soft (retrofit #1), size 30', () => {
        const { container } = render(<TopStrip />)
        // Find avatar by its initials
        const allSpans = container.querySelectorAll('span')
        const avatar = Array.from(allSpans).find((el) => el.textContent === 'YT') as HTMLElement
        expect(avatar).not.toBeUndefined()
        expect(avatar.className).toContain('bg-trad-green-soft')
        expect(avatar.className).not.toMatch(/bg-fresh-green/)
        expect(avatar.style.width).toBe('30px')
      })

      it('mail icon has notification dot with bg-signal-amber (retrofit #2)', () => {
        const { container } = render(<TopStrip />)
        const mailGroup = container.querySelector('.relative.inline-flex')
        expect(mailGroup).not.toBeNull()
        const dot = mailGroup?.querySelector('span[aria-hidden="true"]')
        expect(dot).not.toBeNull()
        expect(dot?.className).toContain('bg-signal-amber')
        expect(dot?.className).not.toMatch(/bg-fresh-green/)
      })
    })

    describe('components/shell/TopStrip — rm mode (pathname=/cockpit)', () => {
      beforeEach(() => {
        mockPathname = '/cockpit'
      })

      it('context badge shows "Japanese Corporates · 25 clients · Singapore desk"', () => {
        const { container } = render(<TopStrip />)
        expect(container.textContent).toContain('Japanese Corporates')
        expect(container.textContent).toContain('25 clients · Singapore desk')
      })

      it('persona block shows "James Lee" + "RELATIONSHIP MGR"', () => {
        const { container } = render(<TopStrip />)
        expect(container.textContent).toContain('James Lee')
        expect(container.textContent).toContain('RELATIONSHIP MGR')
      })

      it('Avatar has initials "JL", color trad-green-soft (retrofit #1), size 30', () => {
        const { container } = render(<TopStrip />)
        const allSpans = container.querySelectorAll('span')
        const avatar = Array.from(allSpans).find((el) => el.textContent === 'JL') as HTMLElement
        expect(avatar).not.toBeUndefined()
        expect(avatar.className).toContain('bg-trad-green-soft')
      })

      it('mail icon has NO notification dot (client-only feature)', () => {
        const { container } = render(<TopStrip />)
        const mailGroup = container.querySelector('.relative.inline-flex')
        const dot = mailGroup?.querySelector('span[aria-hidden="true"]')
        expect(dot).toBeNull()
      })
    })

    describe('components/shell/TopStrip — demo mode (pathname=/dev/primitives)', () => {
      beforeEach(() => {
        mockPathname = '/dev/primitives'
      })

      it('persona block is suppressed (Yuki, James names absent)', () => {
        const { container } = render(<TopStrip />)
        expect(container.textContent).not.toContain('Yuki Tanaka')
        expect(container.textContent).not.toContain('James Lee')
        expect(container.textContent).not.toContain('TREASURER')
        expect(container.textContent).not.toContain('RELATIONSHIP MGR')
      })

      it('context badge is replaced with "DEV · Primitives Demo" eyebrow', () => {
        const { container } = render(<TopStrip />)
        expect(container.textContent).toContain('DEV')
        expect(container.textContent).toContain('Primitives Demo')
        expect(container.textContent).not.toContain('Kaisei Manufacturing KK')
        expect(container.textContent).not.toContain('Japanese Corporates')
      })

      it('LanguageToggle still renders (visible across all modes per RESEARCH §Open Questions #3)', () => {
        const { container } = render(<TopStrip />)
        expect(container.textContent).toContain('EN')
        expect(container.textContent).toContain('日本語')
      })

      it('mail and help icons still render', () => {
        const { container } = render(<TopStrip />)
        // Mail and help icons are SVGs; verify by ariaLabel
        expect(container.querySelector('svg[aria-label="Mail"]')).not.toBeNull()
        expect(container.querySelector('svg[aria-label="Help"]')).not.toBeNull()
      })
    })

    describe('components/shell/TopStrip — SHELL-05 negative invariant (only RisingMark uses fresh-green)', () => {
      beforeEach(() => {
        mockPathname = '/journey'
      })

      it('the RisingMark hand stroke uses var(--color-fresh-green) (allowlisted brand exception)', () => {
        const { container } = render(<TopStrip />)
        const lines = container.querySelectorAll('svg[viewBox="0 0 40 40"] line')
        const handLine = lines[0] as SVGLineElement
        expect(handLine.getAttribute('stroke')).toBe('var(--color-fresh-green)')
      })

      it('no other element uses fresh-green: Avatar bg, mail dot bg, ModeSwitcher (when env=true) all use retrofitted tokens', () => {
        process.env.NEXT_PUBLIC_SHOW_MODE_SWITCHER = 'true'
        const { container } = render(<TopStrip />)
        // Strip out the RisingMark <line> stroke (which legitimately uses fresh-green)
        const html = container.innerHTML.replace(/<line[^>]*stroke="var\(--color-fresh-green\)"[^>]*\/>/g, '')
        // Now the remaining HTML must contain NO fresh-green substring
        expect(html).not.toMatch(/fresh-green/)
        expect(html).not.toMatch(/#[Bb][Ff][Dd]7[3]0/)
      })
    })
    ```
  </action>
  <verify>
    <automated>
    test -f components/shell/TopStrip.tsx && head -1 components/shell/TopStrip.tsx | grep -q "'use client'" && grep -q "color=\"trad-green-soft\"" components/shell/TopStrip.tsx && grep -q "bg-signal-amber" components/shell/TopStrip.tsx && grep -q "fontVariationSettings" components/shell/TopStrip.tsx && grep -q "modeForPathname" components/shell/TopStrip.tsx && npm run test -- components/shell/TopStrip.test.tsx && npm run typecheck && npm run lint
    </automated>
  </verify>
  <acceptance_criteria>
    - File `components/shell/TopStrip.tsx` exists with `'use client'` on line 1
    - File imports `usePathname` from `next/navigation`
    - File imports `RisingMark`, `LanguageToggle`, `ModeSwitcher` from `./` (relative)
    - File imports `Eyebrow`, `Icon`, `Avatar` from `@/components/primitives` (the barrel)
    - File imports `PERSONAS`, `modeForPathname`, `Mode` from `@/lib/persona`
    - File contains `color="trad-green-soft"` on Avatar (retrofit #1)
    - File contains `bg-signal-amber` on the notification dot (retrofit #2)
    - File contains `fontVariationSettings: '"SOFT" 80, "WONK" 1'` (OD-12 strategy b)
    - File renders `<header className="...h-14 bg-trad-green-deep...">` (56px chrome)
    - Mode resolution via `modeForPathname(pathname ?? '/')`
    - Demo mode suppresses persona block + context badge
    - Client mode shows mail notification dot; rm/demo modes do NOT
    - File `components/shell/TopStrip.test.tsx` exists with ≥18 test cases (5 base + 5 client + 4 rm + 4 demo + 2 SHELL-05 negative)
    - All tests pass (mocking next/navigation usePathname)
    - `npm run typecheck` exits 0
    - `npm run lint` exits 0
  </acceptance_criteria>
  <done>TopStrip 'use client' chrome with retrofits #1 + #2 + OD-12 inline SOFT/WONK; tests cover all 3 modes (client, rm, demo) with mocked usePathname; SHELL-05 negative invariant test confirms only RisingMark uses fresh-green.</done>
</task>

<task type="auto" tdd="false">
  <name>Task 2: Insert <TopStrip /> in app/layout.tsx + create app/(client)/layout.tsx + app/(rm)/layout.tsx</name>
  <read_first>
    - /Users/wyekitgoh/Projects/SMBCorigins/app/layout.tsx (current state — Plan 04-02 already swapped IBM Plex Mono weight; verify line 31 reads ['400', '500'])
    - .planning/phases/04-app-shell-primitives/04-CONTEXT.md D-64 — TopStrip lives in app/layout.tsx; route-group layouts hold ClientShell/RMShell
    - .planning/phases/04-app-shell-primitives/04-RESEARCH.md §"Pattern 2: Route groups apply different layouts via `(parens)` folders" (lines 348–376)
    - .planning/phases/04-app-shell-primitives/04-PATTERNS.md §"Files Modified — app/layout.tsx" change (c) (lines 789) — body insert
    - .planning/phases/04-app-shell-primitives/04-PATTERNS.md §"app/(client)/layout.tsx" + §"app/(rm)/layout.tsx" (lines 497–537) — analogs
    - components/shell/ClientShell.tsx (Plan 04-09 — verify exists)
    - components/shell/RMShell.tsx (Plan 04-09 — verify exists)
    - components/shell/TopStrip.tsx (Plan 04-10 Task 1 — verify exists)
  </read_first>
  <files>app/layout.tsx, app/(client)/layout.tsx, app/(rm)/layout.tsx</files>
  <action>
    **Edit (1):** Modify `app/layout.tsx` — add TopStrip import + insert `<TopStrip />` above `{children}`:

    Before this plan, `app/layout.tsx` has 50 lines with body line:
    ```tsx
    <body>{children}</body>
    ```

    After this plan, the file has 52 lines:
    - Add at the top (after the existing `import './globals.css'` line 3, BEFORE the const fraunces block):
      ```tsx
      import { TopStrip } from '@/components/shell/TopStrip'
      ```
    - Replace the body line:
      ```tsx
      <body>
        <TopStrip />
        {children}
      </body>
      ```

    Do NOT touch the font configs (lines 5-34 — Plan 04-02 already set `weight: ['400', '500']`). Do NOT add `axes: ['SOFT', 'WONK']` to Fraunces (OD-12 strategy b explicitly rejected this). Do NOT modify the metadata or RootLayout signature.

    **Edit (2):** Create `app/(client)/layout.tsx`:

    ```tsx
    // app/(client)/layout.tsx — Phase 4 client route-group layout (D-64).
    //
    // Wraps all /(client)/* pages in <ClientShell> below the root <TopStrip />.
    // Phase 5 (CJD-01..07) consumes this layout when populating the dashboard.

    import type { ReactNode } from 'react'
    import { ClientShell } from '@/components/shell/ClientShell'

    export default function ClientGroupLayout({ children }: { children: ReactNode }) {
      return <ClientShell>{children}</ClientShell>
    }
    ```

    **Edit (3):** Create `app/(rm)/layout.tsx`:

    ```tsx
    // app/(rm)/layout.tsx — Phase 4 RM route-group layout (D-64).
    //
    // Wraps all /(rm)/* pages in <RMShell> (sidebar + workspace + empty copilot
    // sidecar slot) below the root <TopStrip />. Phase 6 (RMC-01..07) consumes
    // this layout when populating the cockpit.

    import type { ReactNode } from 'react'
    import { RMShell } from '@/components/shell/RMShell'

    export default function RMGroupLayout({ children }: { children: ReactNode }) {
      return <RMShell>{children}</RMShell>
    }
    ```

    Conventions:
    - Both route-group layouts are server components (no 'use client') — TopStrip is the only client child of the root layout
    - Default-exported function names are descriptive (`ClientGroupLayout`, `RMGroupLayout`) for stack traces / DevTools clarity
    - Both use `ReactNode` type for children prop (Phase 2 D-39 Prettier convention)
    - File-header comments cite D-64 and the phase that consumes them (Phase 5/6)
  </action>
  <verify>
    <automated>
    grep -q "import { TopStrip }" app/layout.tsx && grep -q "<TopStrip />" app/layout.tsx && test -f app/\(client\)/layout.tsx && grep -q "ClientShell" app/\(client\)/layout.tsx && test -f app/\(rm\)/layout.tsx && grep -q "RMShell" app/\(rm\)/layout.tsx && npm run build && npm run typecheck && npm run lint
    </automated>
  </verify>
  <acceptance_criteria>
    - `app/layout.tsx` contains `import { TopStrip } from '@/components/shell/TopStrip'`
    - `app/layout.tsx` body contains `<TopStrip />` ABOVE `{children}` (verifiable: regex matching `<TopStrip />\s*\{children\}` at the body level)
    - `app/layout.tsx` line 31 still reads `weight: ['400', '500'],` (Plan 04-02's edit preserved)
    - `app/layout.tsx` has NO `axes:` line in the Fraunces config (OD-12 strategy b — no font-import change)
    - `app/(client)/layout.tsx` exists with default export `ClientGroupLayout` returning `<ClientShell>{children}</ClientShell>`
    - `app/(rm)/layout.tsx` exists with default export `RMGroupLayout` returning `<RMShell>{children}</RMShell>`
    - Both route-group layouts are server components (no `'use client'`)
    - `npm run typecheck` exits 0
    - `npm run lint` exits 0
    - `npm run build` exits 0 (Next.js compiles all routes; root layout + 2 route-group layouts + existing placeholder pages all build)
  </acceptance_criteria>
  <done>app/layout.tsx renders TopStrip above children; route-group layouts wrap ClientShell/RMShell respectively; build succeeds.</done>
</task>

<task type="auto" tdd="false">
  <name>Task 3: Create app/dev/primitives/page.tsx — SHELL-04 acceptance demo page (allowlisted)</name>
  <read_first>
    - .planning/phases/04-app-shell-primitives/04-UI-SPEC.md §"Demo Page (/dev/primitives)" (lines 419–431)
    - .planning/phases/04-app-shell-primitives/04-CONTEXT.md D-80 (lines 54), D-85 (line 67) — allowlisted
    - .planning/phases/04-app-shell-primitives/04-RESEARCH.md §8.1 (lines 1359–1364) — routing
    - .planning/phases/04-app-shell-primitives/04-PATTERNS.md §"app/dev/primitives/page.tsx" (lines 540–581)
    - /Users/wyekitgoh/Projects/SMBCorigins/app/page.tsx (existing token showcase analog)
    - All 8 primitive .tsx files (verify barrel exports resolve)
  </read_first>
  <files>app/dev/primitives/page.tsx</files>
  <action>
    Create `app/dev/primitives/page.tsx` with a static-JSX rendering of all 8 primitives in their state combinations. This is a long file (~150 LOC) but well-structured.

    Use static JSX (not iteration over a state matrix) per UI-SPEC OD-11 — copy-paste-friendly for future contributors, easy to grep, no meta-magic. Keep each primitive's section visually distinct with a heading.

    File-header comment must cite:
    - D-80 (path coercion from /_dev to /dev)
    - D-85 (this file is allowlisted)
    - SHELL-04 (acceptance surface)

    Structure each section like this (showing 2 primitives as the template; replicate for the other 6):

    ```tsx
    // app/dev/primitives/page.tsx — Phase 4 SHELL-04 acceptance demo page (D-80, D-85).
    //
    // Lives outside both route groups (no ClientShell, no RMShell wraps it).
    // ALLOWLISTED in .freshgreen-allowlist (D-85, Plan 04-11) because it renders
    // the AI-presence primitives (AIPulseDot, AIBadge, StatusChip kind="ai").
    //
    // Static JSX (UI-SPEC OD-11) — copy-paste-friendly; each primitive in every
    // state. Plan-phase decided static over iteration for grep-ability.

    import {
      Eyebrow,
      StatusChip,
      StagePill,
      AIPulseDot,
      AIBadge,
      ActionCard,
      Icon,
      Avatar,
      type AvatarColor,
      type IconName,
      type StatusChipKind,
      type StagePillState,
    } from '@/components/primitives'

    const ALL_AVATAR_COLORS: ReadonlyArray<AvatarColor> = [
      'trad-green', 'trad-green-soft', 'trad-green-deep', 'ink', 'ink-muted', 'paper', 'mist',
    ]

    const ALL_ICON_NAMES: ReadonlyArray<IconName> = [
      'app-folder', 'arrow-right', 'arrow-up-right', 'bank', 'bell', 'bolt',
      'calendar', 'check', 'chevron-down', 'chevron-right', 'clock', 'close',
      'cockpit', 'copilot', 'credit', 'docs', 'dot', 'edit', 'external',
      'filter', 'globe', 'help', 'mail', 'paperclip', 'pipeline', 'refresh',
      'rocket', 'search', 'send', 'shield', 'sparkle', 'stack', 'tree',
      'upload', 'users', 'yen',
    ]

    const ALL_STATUS_KINDS: ReadonlyArray<StatusChipKind> = [
      'ok', 'ai', 'amber', 'ghost', 'red', 'info',
    ]

    const ALL_STAGE_STATES: ReadonlyArray<StagePillState> = [
      'done', 'current', 'upcoming',
    ]

    function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
      return (
        <section className="mb-12 pb-8 border-b border-mist last:border-b-0">
          <h2 className="font-display text-[16px] font-semibold mb-1">{title}</h2>
          {hint ? <p className="font-mono text-[10px] text-ink-muted mb-4">{hint}</p> : null}
          <div className="flex flex-wrap items-center gap-4">{children}</div>
        </section>
      )
    }

    export default function PrimitivesDemoPage() {
      return (
        <main className="bg-paper min-h-[calc(100vh-56px)] px-12 py-12 max-w-[1200px] mx-auto">
          <header className="mb-12">
            <h1 className="font-display text-[16px] font-semibold mb-2">Primitives — SHELL-04</h1>
            <p className="font-body text-[14px] text-ink-soft">
              Phase 4 design contract — every primitive in every state. Allowlisted for SHELL-05.
            </p>
          </header>

          {/* 1. Eyebrow */}
          <Section title="1. Eyebrow" hint="<Eyebrow>BY SMBC</Eyebrow>">
            <Eyebrow>BY SMBC</Eyebrow>
            <Eyebrow>DEMO</Eyebrow>
            <Eyebrow>TREASURER</Eyebrow>
            <Eyebrow>RELATIONSHIP MGR</Eyebrow>
          </Section>

          {/* 2. StatusChip */}
          <Section title="2. StatusChip" hint='<StatusChip kind="ai">Origin</StatusChip>'>
            {ALL_STATUS_KINDS.map((kind) => (
              <StatusChip key={kind} kind={kind}>
                {kind}
              </StatusChip>
            ))}
            {ALL_STATUS_KINDS.map((kind) => (
              <StatusChip key={`${kind}-nodot`} kind={kind} dot={false}>
                {kind} (no dot)
              </StatusChip>
            ))}
          </Section>

          {/* 3. StagePill */}
          <Section title="3. StagePill" hint='<StagePill n={1} state="done" />'>
            {ALL_STAGE_STATES.map((state) => (
              <div key={state} className="flex flex-col items-center gap-2">
                <Eyebrow>{state}</Eyebrow>
                <div className="flex gap-2">
                  {([1, 2, 3, 4, 5, 6] as const).map((n) => (
                    <StagePill key={`${state}-${n}`} n={n} state={state} />
                  ))}
                </div>
              </div>
            ))}
          </Section>

          {/* 4. AIPulseDot */}
          <Section title="4. AIPulseDot" hint="<AIPulseDot />">
            <AIPulseDot />
            <AIPulseDot ariaLabel="Origin is reviewing" />
          </Section>

          {/* 5. AIBadge */}
          <Section title="5. AIBadge" hint="<AIBadge />">
            <AIBadge />
            <AIBadge label="Origin · ready" />
            <AIBadge label="reviewing" />
          </Section>

          {/* 6. ActionCard */}
          <Section title="6. ActionCard" hint="<ActionCard title=... onClick=... />">
            <div className="flex flex-col gap-3 w-full max-w-[600px]">
              <ActionCard
                title="Submit beneficial-owner attestation"
                meta="2026-04-25 14:30 · Yuki"
                indicator={<StatusChip kind="amber" dot>Action</StatusChip>}
                cta={<Icon name="arrow-right" size={16} ariaLabel="open" />}
                onClick={() => {}}
              />
              <ActionCard
                title="Origin compiled the credit memo"
                meta="2026-04-25 13:14"
                indicator={<AIBadge />}
                onClick={() => {}}
              />
              <ActionCard
                title="Older entry — reduced visual weight"
                meta="2026-04-20 09:00"
                indicator={<StatusChip kind="ghost" dot>archived</StatusChip>}
                faint
              />
            </div>
          </Section>

          {/* 7. Icon */}
          <Section title="7. Icon (35 names)" hint='<Icon name="check" />'>
            {ALL_ICON_NAMES.map((name) => (
              <div key={name} className="flex flex-col items-center gap-1 w-20">
                <Icon name={name} ariaLabel={name} />
                <span className="font-mono text-[10px] text-ink-muted">{name}</span>
              </div>
            ))}
          </Section>

          {/* 8. Avatar */}
          <Section title="8. Avatar (7 colors, no fresh-green family)" hint='<Avatar initials="YT" color="trad-green-soft" />'>
            {ALL_AVATAR_COLORS.map((color, idx) => (
              <div key={color} className="flex flex-col items-center gap-1">
                <Avatar
                  initials={String.fromCharCode(65 + idx) + String.fromCharCode(65 + ((idx + 7) % 26))}
                  color={color}
                  textColor={color === 'paper' || color === 'mist' ? 'trad-green-deep' : 'paper'}
                />
                <span className="font-mono text-[10px] text-ink-muted">{color}</span>
              </div>
            ))}
          </Section>
        </main>
      )
    }
    ```

    Conventions:
    - Static JSX with one section per primitive (8 sections total)
    - `<Section>` local helper (not exported) wraps each primitive group with title + optional hint + content
    - Class hints use IBM Plex Mono 10px text-ink-muted (matches UI-SPEC line 428)
    - `<main>` at root with `bg-paper min-h-[calc(100vh-56px)]` (TopStrip still renders above; demo page is OUTSIDE route groups so neither ClientShell nor RMShell wraps it)
    - Allowlisted file (Plan 04-11 will add this path to .freshgreen-allowlist) — page renders AIPulseDot, AIBadge, StatusChip kind="ai" which are fresh-green
    - Avatar textColor mapping: `'paper'` and `'mist'` (light bg) get `'trad-green-deep'` text; others get `'paper'` text
    - All Icon names rendered with `ariaLabel={name}` — demonstrates the FLAG 1 fix
  </action>
  <verify>
    <automated>
    test -f app/dev/primitives/page.tsx && grep -q "from '@/components/primitives'" app/dev/primitives/page.tsx && grep -q "ALL_ICON_NAMES" app/dev/primitives/page.tsx && grep -q "Primitives — SHELL-04" app/dev/primitives/page.tsx && npm run build && npm run typecheck && npm run lint
    </automated>
  </verify>
  <acceptance_criteria>
    - File `app/dev/primitives/page.tsx` exists at the path that resolves to URL `/dev/primitives`
    - File imports all 8 primitives + 4 types from `@/components/primitives` (the barrel)
    - File has 8 distinct sections — one per primitive (Eyebrow, StatusChip, StagePill, AIPulseDot, AIBadge, ActionCard, Icon, Avatar)
    - StatusChip section renders all 6 kinds × 2 dot variants = 12 chips
    - StagePill section renders all 3 states × 6 numbers = 18 pills
    - Icon section renders all 35 named icons
    - Avatar section renders all 7 colors
    - File contains `Primitives — SHELL-04` page title
    - File is `<main>` at root (NOT wrapped in ClientShell or RMShell — verifiable: file lives at `app/dev/primitives/page.tsx`, not under `(client)/` or `(rm)/`)
    - `npm run typecheck` exits 0
    - `npm run lint` exits 0
    - `npm run build` exits 0; running `npm run dev` and visiting `http://localhost:3000/dev/primitives` shows all 8 sections (manual smoke check — not blocking acceptance)
  </acceptance_criteria>
  <done>Demo page renders all 8 primitives in all states; allowlisted; lives outside route groups; build succeeds.</done>
</task>

</tasks>

<threat_model>
This plan composes everything together. Active threats: V14 Configuration (env-gated dev affordance), V5 Input Validation (none active — pathname is read-only), Hydration mismatch (none — no rewrites in next.config.ts).

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-04-10-01 | V14 Configuration | TopStrip via ModeSwitcher | mitigate | TopStrip's child ModeSwitcher applies the env gate (Plan 04-08 enforces). TopStrip itself doesn't read the env var; it just passes the activeMode prop. Production-leak mitigation: Vercel dashboard scoping (manual, deferred). |
| T-04-10-02 | V14 / Hydration injection | TopStrip usePathname | accept | Per RESEARCH §"Pitfall 1" lines 446–456, hydration mismatch only occurs with rewrites. Phase 4 verified next.config.ts has no rewrites; Plan 04-10 does NOT add rewrites. Forward-compat note: any future PR that adds rewrites must also add hydration-safe TopStrip rendering. |
| T-04-10-03 | XSS / Static demo content | app/dev/primitives/page.tsx | accept | All children are static literals; no user input flows; no `dangerouslySetInnerHTML`. The demo page's allowlist entry is for the AI-primitive renders, not for any dynamic content vector. |
| T-04-10-04 | SHELL-05 / TopStrip retrofits | components/shell/TopStrip.tsx | mitigate | Retrofits #1 + #2 applied at authorship in TopStrip.tsx Task 1. The negative-invariant test (last test in TopStrip.test.tsx) confirms only the RisingMark hand uses fresh-green; everything else (Avatar bg, mail dot, ModeSwitcher container) uses retrofitted tokens. |

Active mitigation: env gate + retrofit-at-authorship. Forward-compat note logged for hydration if rewrites are added later.
</threat_model>

<verification>
After all 3 tasks land:
1. `npm run typecheck && npm run lint && npm run test && npm run build` all exit 0
2. `npm run dev` and manually visit:
   - `http://localhost:3000/` — TopStrip renders; client-mode persona block (Yuki) shows
   - `http://localhost:3000/journey` — TopStrip + ClientShell render; client-mode chrome
   - `http://localhost:3000/cockpit` — TopStrip + RMShell render; rm-mode chrome with sidebar
   - `http://localhost:3000/dev/primitives` — TopStrip with demo-mode chrome; all 8 primitives visible below
3. With `NEXT_PUBLIC_SHOW_MODE_SWITCHER=true npm run dev`, ModeSwitcher renders in TopStrip; clicking either segment navigates between /journey and /cockpit
4. With env var unset, ModeSwitcher renders nothing — TopStrip looks "bare" between LanguageToggle and the persona block (this is the production-look)
5. RisingMark hand stroke renders fresh-green visibly on the dark TopStrip chrome (allowlisted brand exception)
6. No SHELL-05 violations in chrome — verified manually that Avatar bg is a darker green (not fresh-green), mail-icon dot is amber (not fresh-green)
</verification>

<success_criteria>
- [ ] components/shell/TopStrip.tsx is 'use client'; uses usePathname + modeForPathname; renders 3 modes (client, rm, demo); retrofits #1 + #2 applied; OD-12 SOFT/WONK inline-style on wordmark
- [ ] app/layout.tsx imports TopStrip and renders it above {children}
- [ ] app/(client)/layout.tsx wraps in ClientShell
- [ ] app/(rm)/layout.tsx wraps in RMShell
- [ ] app/dev/primitives/page.tsx renders all 8 primitives in all states; lives outside route groups; allowlisted
- [ ] All Phase 4 PR builds: `npm run build` exits 0
- [ ] TopStrip tests cover ≥18 cases including all 3 modes + retrofit assertions + SHELL-05 negative invariant
- [ ] `npm run typecheck`, `npm run lint`, `npm run test` all exit 0
</success_criteria>

<output>
After completion, create `.planning/phases/04-app-shell-primitives/04-10-SUMMARY.md`
</output>
