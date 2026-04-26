---
phase: 04-app-shell-primitives
plan: 09
type: execute
wave: 3
depends_on: [04-01, 04-05]
files_modified:
  - components/shell/ClientShell.tsx
  - components/shell/ClientShell.test.tsx
  - components/shell/RMShell.tsx
  - components/shell/RMShell.test.tsx
autonomous: true
requirements: [SHELL-01]
tags: [shell, layout-wrappers, sidebar, retrofit-5, copilot-slot]

must_haves:
  truths:
    - "ClientShell wraps children in a single-column workspace with bg-paper, min-height = calc(100vh - 56px), 1200px max-width content area"
    - "RMShell renders sidebar (220px fixed) + workspace (flex-1) + EMPTY copilot-sidecar slot (Phase 8 owns the actual copilot per D-77)"
    - "RMShell sidebar active-route indicator dot (when present) uses bg-trad-green, NOT bg-fresh-green (retrofit #5 per D-88)"
    - "Both shells are server components (no 'use client'); they accept children: ReactNode and render through"
  artifacts:
    - path: "components/shell/ClientShell.tsx"
      provides: "ClientShell — single-column wrapper for /(client)/* routes"
      exports: ["ClientShell"]
    - path: "components/shell/RMShell.tsx"
      provides: "RMShell — sidebar + workspace + empty copilot slot for /(rm)/* routes"
      exports: ["RMShell"]
  key_links:
    - from: "components/shell/RMShell.tsx"
      to: "components/primitives/Icon.tsx + Eyebrow.tsx"
      via: "sidebar nav items + Workspace eyebrow"
      pattern: "<Icon name=\"cockpit\""
---

<objective>
Build the two route-group inner shells. ClientShell is a single-column workspace wrapper; RMShell is a 3-zone layout (sidebar 220px + workspace flex-1 + empty copilot-sidecar slot). RMShell ships with placeholder sidebar nav items (Cockpit, Pipeline, Applications, Copilot) — these are visual placeholders, NOT live route handlers (Phase 6 wires real navigation; this plan ships the structure).

CRITICAL: RMShell's sidebar active-route indicator dot (when shown for the active "Cockpit" item) uses `bg-trad-green` — retrofit #5 per D-88 + UI-SPEC line 184 + RESEARCH §5.10 row 5. NEVER copy the prototype's `var(--fresh-green)` dot into the new code.

Phase 4 sidebar nav items render as `<span>` placeholders (NOT live `<Link>`s) per UI-SPEC Interaction States line 409 — "Plan-phase decides: either inert <span> items (no hover, no cursor) OR placeholder <Link> items pointing at future routes". This plan picks `<span>` for Phase 4 — sidebar navigation is a Phase 6 deliverable; placeholder span keeps the visual surface honest about the wiring state.

Output:
- 2 chrome `.tsx` files in `components/shell/`
- 2 co-located `.test.tsx` files
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
@app/(client)/journey/page.tsx
@app/(rm)/cockpit/page.tsx

<interfaces>
<!-- ClientShell layout — RESEARCH §5.8 verbatim from /tmp/proto_shell.js lines 121-129 -->
- Outer: `min-h-[calc(100vh-56px)] bg-paper relative overflow-hidden`
- Inner: `max-w-[1200px] mx-auto pt-9 px-10 pb-20` (36px ≈ pt-9; 40px = px-10; 80px = pb-20)
- 56px = TopStrip height (UI-SPEC Chrome metric exceptions)

<!-- RMShell layout — RESEARCH §5.9 verbatim from /tmp/proto_shell.js lines 132-213 -->
- Outer container: `flex bg-paper-deep min-h-[calc(100vh-56px)]` (note: paper-deep, NOT paper — workspace surround is darker)
- Sidebar:
  - `w-[220px] flex-shrink-0 bg-paper border-r border-mist`
  - `sticky top-14 h-[calc(100vh-56px)]` (top-14 = 56px to sit below TopStrip; sticky behavior keeps sidebar visible during workspace scroll)
  - `flex flex-col px-3.5 py-5` (20px vertical padding ≈ py-5; 14px horizontal ≈ px-3.5)
  - Internal:
    - "Workspace" eyebrow at top (Eyebrow primitive, padding `px-2.5 pb-3`)
    - 4 nav items (Cockpit, Pipeline, Applications, Copilot) each rendered as <span> with: Icon + label + (active dot for "Cockpit" item), `flex items-center gap-2.5 px-2.5 py-2 rounded-md`, `text-[13px]`
      - Active item ("Cockpit"): `bg-paper-deep text-ink font-medium`, with right-aligned active dot `ml-auto block w-1.5 h-1.5 rounded-full bg-trad-green` (retrofit #5: bg-trad-green NOT bg-fresh-green)
      - Inactive items: `bg-transparent text-ink-soft font-normal`
    - Bottom block (Portfolio summary placeholder eyebrow): `mt-auto px-2.5 pt-3 border-t border-mist`
- Workspace: `flex-1 px-8 py-7 min-w-0 relative` (28px py = py-7 ≈ 28px; 32px px = px-8)
- Copilot sidecar slot: OMITTED in Phase 4 per CONTEXT D-77. RMShell's flex-1 workspace handles available space without the slot. When Phase 8 adds the copilot, RMShell's flex layout grows naturally.

Sidebar nav-item icons (per RESEARCH §5.9 line 1180):
- Cockpit → `<Icon name="cockpit" />`
- Pipeline → `<Icon name="pipeline" />`
- Applications → `<Icon name="app-folder" />`
- Copilot → `<Icon name="sparkle" />` (sparkle is the AI presence cue; safe — Icon doesn't auto-color, and the icon stroke uses currentColor which inherits from text-ink-soft, not fresh-green)
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Create ClientShell.tsx + test (single-column wrapper)</name>
  <read_first>
    - .planning/phases/04-app-shell-primitives/04-UI-SPEC.md §"Inner Shells > ClientShell" (lines 326–337)
    - .planning/phases/04-app-shell-primitives/04-RESEARCH.md §5.8 (lines 1152–1165) — verbatim layout
    - .planning/phases/04-app-shell-primitives/04-PATTERNS.md §"components/shell/ClientShell.tsx" (lines 211–231)
  </read_first>
  <behavior>
    - Test 1: Renders an outer wrapper with `bg-paper`, `min-h-[calc(100vh-56px)]`, `relative`, `overflow-hidden`
    - Test 2: Renders an inner content container with `max-w-[1200px] mx-auto pt-9 px-10 pb-20`
    - Test 3: Children are passed through (rendered inside the inner container)
  </behavior>
  <files>components/shell/ClientShell.tsx, components/shell/ClientShell.test.tsx</files>
  <action>
    Create `components/shell/ClientShell.tsx`:

    ```tsx
    // components/shell/ClientShell.tsx — Phase 4 SHELL-01 client route-group inner shell.
    //
    // Renders a single-column workspace below the TopStrip. Consumed by
    // app/(client)/layout.tsx (Plan 04-10 Wave 4). 56px chrome height supersedes
    // Phase 2 placeholder pages' min-h-screen with min-h-[calc(100vh-56px)].
    //
    // No fresh-green tokens. Server component — no client-state.

    import type { ReactNode, ReactElement } from 'react'

    export type ClientShellProps = {
      children: ReactNode
    }

    export function ClientShell({ children }: ClientShellProps): ReactElement {
      return (
        <div className="bg-paper min-h-[calc(100vh-56px)] relative overflow-hidden">
          <div className="max-w-[1200px] mx-auto pt-9 px-10 pb-20 relative">
            {children}
          </div>
        </div>
      )
    }
    ```

    Conventions:
    - Outer is `<div>` (NOT `<main>`) — `<main>` is the page-level convention; ClientShell is a wrapper INSIDE the page-level structure (root layout already has `<body>`; the page's first content element MAY be `<main>`)
    - `pt-9 px-10 pb-20` matches RESEARCH §5.8 measurements
    - `relative overflow-hidden` from prototype — for any absolutely-positioned watermark consumers (Phase 5 KanjiWatermark)
    - NO fresh-green
    - Server component (no 'use client')

    Create `components/shell/ClientShell.test.tsx`:

    ```tsx
    /**
     * components/shell/ClientShell.test.tsx — Tests for ClientShell (SHELL-01).
     */

    import { describe, it, expect } from 'vitest'
    import { render } from '@testing-library/react'
    import { ClientShell } from '@/components/shell/ClientShell'

    describe('components/shell/ClientShell (SHELL-01)', () => {
      it('renders children', () => {
        const { container } = render(
          <ClientShell>
            <p data-testid="child">Hello</p>
          </ClientShell>,
        )
        expect(container.querySelector('[data-testid="child"]')).not.toBeNull()
      })

      it('outer wrapper has bg-paper, min-h-[calc(100vh-56px)], relative, overflow-hidden', () => {
        const { container } = render(<ClientShell><p>x</p></ClientShell>)
        const outer = container.firstElementChild as HTMLElement
        expect(outer.className).toContain('bg-paper')
        expect(outer.className).toContain('min-h-[calc(100vh-56px)]')
        expect(outer.className).toContain('relative')
        expect(outer.className).toContain('overflow-hidden')
      })

      it('inner content container has max-w-[1200px], mx-auto, pt-9 px-10 pb-20', () => {
        const { container } = render(<ClientShell><p>x</p></ClientShell>)
        const inner = container.querySelector('div > div') as HTMLElement
        expect(inner.className).toContain('max-w-[1200px]')
        expect(inner.className).toContain('mx-auto')
        expect(inner.className).toContain('pt-9')
        expect(inner.className).toContain('px-10')
        expect(inner.className).toContain('pb-20')
      })

      it('contains NO fresh-green tokens', () => {
        const { container } = render(<ClientShell><p>x</p></ClientShell>)
        expect(container.innerHTML).not.toMatch(/fresh-green/)
      })
    })
    ```
  </action>
  <verify>
    <automated>
    test -f components/shell/ClientShell.tsx && grep -q "min-h-\[calc(100vh-56px)\]" components/shell/ClientShell.tsx && grep -q "max-w-\[1200px\]" components/shell/ClientShell.tsx && ! grep -E "(fresh-green|#[Bb][Ff][Dd]7[3]0)" components/shell/ClientShell.tsx && npm run test -- components/shell/ClientShell.test.tsx
    </automated>
  </verify>
  <acceptance_criteria>
    - File `components/shell/ClientShell.tsx` exists
    - File contains `min-h-[calc(100vh-56px)]` (TopStrip height accounted for)
    - File contains `max-w-[1200px] mx-auto` (centered 1200px content)
    - File contains `pt-9 px-10 pb-20` (RESEARCH §5.8 measurements)
    - File has NO fresh-green tokens
    - Server component (no 'use client' directive)
    - File `components/shell/ClientShell.test.tsx` exists with ≥4 test cases
    - All tests pass
  </acceptance_criteria>
  <done>ClientShell single-column wrapper exists with locked layout measurements; no fresh-green; tests verify structure + children pass-through.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Create RMShell.tsx + test (3-zone layout with retrofit #5 sidebar dot)</name>
  <read_first>
    - .planning/phases/04-app-shell-primitives/04-UI-SPEC.md §"Inner Shells > RMShell" (lines 339–357)
    - .planning/phases/04-app-shell-primitives/04-RESEARCH.md §5.9 (lines 1167–1190) — verbatim layout from prototype
    - .planning/phases/04-app-shell-primitives/04-RESEARCH.md §5.10 row 5 (line 1199) — retrofit #5: sidebar dot bg = trad-green NOT fresh-green
    - .planning/phases/04-app-shell-primitives/04-CONTEXT.md D-77 — empty copilot sidecar slot
    - .planning/phases/04-app-shell-primitives/04-UI-SPEC.md §"Interaction States > Other interactive surfaces" line 409 — sidebar nav items decision (this plan picks `<span>` placeholders)
    - .planning/phases/04-app-shell-primitives/04-PATTERNS.md §"components/shell/RMShell.tsx" (lines 234–256)
  </read_first>
  <behavior>
    - Test 1: Outer container has `flex`, `bg-paper-deep`, `min-h-[calc(100vh-56px)]`
    - Test 2: Sidebar has `w-[220px]`, `flex-shrink-0`, `bg-paper`, `border-r`, `border-mist`, `sticky`, `top-14`, `h-[calc(100vh-56px)]`
    - Test 3: Sidebar contains "Workspace" eyebrow text
    - Test 4: Sidebar contains 4 nav items: Cockpit, Pipeline, Applications, Copilot (verifiable via textContent)
    - Test 5: Active "Cockpit" nav item has classes `bg-paper-deep text-ink font-medium`
    - Test 6: Inactive nav items have classes `bg-transparent text-ink-soft font-normal`
    - Test 7: Active "Cockpit" item has a right-aligned active dot with `bg-trad-green` (retrofit #5 — NOT bg-fresh-green)
    - Test 8: Workspace has `flex-1 px-8 py-7 min-w-0 relative`
    - Test 9: Children render in workspace area
    - Test 10: NO copilot sidecar element in DOM (Phase 4 ships empty slot per D-77)
    - Test 11: NO fresh-green tokens anywhere in the rendered HTML (retrofit #5 enforced at authorship)
  </behavior>
  <files>components/shell/RMShell.tsx, components/shell/RMShell.test.tsx</files>
  <action>
    Create `components/shell/RMShell.tsx`:

    ```tsx
    // components/shell/RMShell.tsx — Phase 4 SHELL-01 RM route-group inner shell.
    //
    // 3-zone layout: sidebar 220px + workspace flex-1 + empty copilot-sidecar slot
    // (Phase 8 owns the actual copilot per D-77; Phase 4 ships the empty slot only).
    //
    // SHELL-05 retrofit #5 applied at authorship per D-88: the active sidebar item's
    // indicator dot uses bg-trad-green, NOT bg-fresh-green. The fresh-green dot was
    // semantically wrong (active state = brand color, not AI signal); the existing
    // bg-paper-deep row background already signals "selected".
    //
    // Sidebar nav items are <span> placeholders (NOT live <Link>s). Phase 6 wires
    // navigation when the cockpit/pipeline/applications/copilot routes land. The
    // <span> choice keeps the visual surface honest about wiring state — UI-SPEC
    // Interaction States line 409 grants this discretion.

    import type { ReactNode, ReactElement } from 'react'
    import { Icon, type IconName } from '@/components/primitives/Icon'
    import { Eyebrow } from '@/components/primitives/Eyebrow'

    export type RMShellProps = {
      children: ReactNode
    }

    type NavItem = {
      readonly label: string
      readonly icon: IconName
      readonly active: boolean
    }

    const NAV_ITEMS: ReadonlyArray<NavItem> = [
      { label: 'Cockpit', icon: 'cockpit', active: true },
      { label: 'Pipeline', icon: 'pipeline', active: false },
      { label: 'Applications', icon: 'app-folder', active: false },
      { label: 'Copilot', icon: 'sparkle', active: false },
    ]

    export function RMShell({ children }: RMShellProps): ReactElement {
      return (
        <div className="flex bg-paper-deep min-h-[calc(100vh-56px)]">
          <aside className="w-[220px] flex-shrink-0 bg-paper border-r border-mist sticky top-14 h-[calc(100vh-56px)] flex flex-col px-3.5 py-5">
            <Eyebrow className="px-2.5 pb-3">Workspace</Eyebrow>
            <nav className="flex flex-col gap-1">
              {NAV_ITEMS.map((item) => {
                const itemClass = item.active
                  ? 'flex items-center gap-2.5 px-2.5 py-2 rounded-md bg-paper-deep text-ink font-medium text-[13px]'
                  : 'flex items-center gap-2.5 px-2.5 py-2 rounded-md bg-transparent text-ink-soft font-normal text-[13px]'
                return (
                  <span key={item.label} className={itemClass} aria-current={item.active ? 'page' : undefined}>
                    <Icon name={item.icon} size={16} />
                    <span>{item.label}</span>
                    {item.active ? (
                      <span
                        aria-hidden="true"
                        className="ml-auto block w-1.5 h-1.5 rounded-full bg-trad-green"
                      />
                    ) : null}
                  </span>
                )
              })}
            </nav>
            <div className="mt-auto px-2.5 pt-3 border-t border-mist">
              <Eyebrow>Portfolio</Eyebrow>
            </div>
          </aside>
          <main className="flex-1 px-8 py-7 min-w-0 relative">
            {children}
          </main>
          {/* Copilot sidecar slot: Phase 4 ships this empty per D-77. Phase 8 will
              add the actual copilot at this position; the flex-1 workspace handles
              available space without explicit slot reservation. */}
        </div>
      )
    }
    ```

    Conventions:
    - 3-zone container is `<div className="flex ...">` per RESEARCH §5.9
    - Sidebar uses `<aside>` (semantic; sidebar role)
    - Workspace uses `<main>` (page-level main content; ClientShell uses `<div>` because there's only one content zone per route — not strictly inconsistent because each layout's children can render its own `<main>` if desired; UI-SPEC doesn't lock this; picking `<main>` for RMShell signals the workspace is the primary surface)
    - Sidebar nav items use `<span>` placeholders (UI-SPEC line 409 discretion)
    - Active "Cockpit" item: `bg-paper-deep text-ink font-medium` + right-aligned `bg-trad-green` dot (retrofit #5)
    - Inactive items: `bg-transparent text-ink-soft font-normal`
    - Active dot is 6px (`w-1.5 h-1.5`) with `aria-hidden="true"` (decorative; the `aria-current="page"` on the parent span carries semantic meaning)
    - NO fresh-green tokens anywhere — retrofit #5 enforced at authorship
    - NO Copilot sidecar element rendered (Phase 8 owns; Phase 4 ships empty)
    - Server component (no 'use client')

    Create `components/shell/RMShell.test.tsx`:

    ```tsx
    /**
     * components/shell/RMShell.test.tsx — Tests for RMShell (SHELL-01, retrofit #5).
     */

    import { describe, it, expect } from 'vitest'
    import { render } from '@testing-library/react'
    import { RMShell } from '@/components/shell/RMShell'

    describe('components/shell/RMShell (SHELL-01, D-77, retrofit #5)', () => {
      it('renders children inside the workspace', () => {
        const { container } = render(
          <RMShell>
            <h1 data-testid="workspace-content">Cockpit</h1>
          </RMShell>,
        )
        expect(container.querySelector('[data-testid="workspace-content"]')).not.toBeNull()
      })

      it('outer container is flex bg-paper-deep min-h-[calc(100vh-56px)]', () => {
        const { container } = render(<RMShell><p>x</p></RMShell>)
        const outer = container.firstElementChild as HTMLElement
        expect(outer.className).toContain('flex')
        expect(outer.className).toContain('bg-paper-deep')
        expect(outer.className).toContain('min-h-[calc(100vh-56px)]')
      })

      it('sidebar is <aside> with w-[220px] flex-shrink-0 bg-paper sticky top-14', () => {
        const { container } = render(<RMShell><p>x</p></RMShell>)
        const aside = container.querySelector('aside')
        expect(aside).not.toBeNull()
        expect(aside?.className).toContain('w-[220px]')
        expect(aside?.className).toContain('flex-shrink-0')
        expect(aside?.className).toContain('bg-paper')
        expect(aside?.className).toContain('sticky')
        expect(aside?.className).toContain('top-14')
        expect(aside?.className).toContain('border-r')
        expect(aside?.className).toContain('border-mist')
      })

      it('sidebar contains "Workspace" eyebrow', () => {
        const { container } = render(<RMShell><p>x</p></RMShell>)
        const aside = container.querySelector('aside')
        expect(aside?.textContent).toContain('Workspace')
      })

      it('sidebar contains 4 nav items: Cockpit, Pipeline, Applications, Copilot', () => {
        const { container } = render(<RMShell><p>x</p></RMShell>)
        const aside = container.querySelector('aside')
        const text = aside?.textContent ?? ''
        expect(text).toContain('Cockpit')
        expect(text).toContain('Pipeline')
        expect(text).toContain('Applications')
        expect(text).toContain('Copilot')
      })

      it('Cockpit nav item is active (bg-paper-deep text-ink font-medium + aria-current=page)', () => {
        const { container } = render(<RMShell><p>x</p></RMShell>)
        const navItems = container.querySelectorAll('aside nav > span')
        const cockpit = Array.from(navItems).find((el) => el.textContent?.includes('Cockpit')) as HTMLElement
        expect(cockpit.className).toContain('bg-paper-deep')
        expect(cockpit.className).toContain('text-ink')
        expect(cockpit.className).toContain('font-medium')
        expect(cockpit.getAttribute('aria-current')).toBe('page')
      })

      it('inactive nav items have bg-transparent text-ink-soft font-normal, no aria-current', () => {
        const { container } = render(<RMShell><p>x</p></RMShell>)
        const navItems = container.querySelectorAll('aside nav > span')
        const inactive = Array.from(navItems).filter((el) => !el.textContent?.includes('Cockpit'))
        expect(inactive.length).toBe(3)
        for (const item of inactive) {
          expect(item.className).toContain('bg-transparent')
          expect(item.className).toContain('text-ink-soft')
          expect(item.className).toContain('font-normal')
          expect(item.getAttribute('aria-current')).toBeNull()
        }
      })

      it('active Cockpit item has right-aligned dot with bg-trad-green (retrofit #5 — NOT fresh-green)', () => {
        const { container } = render(<RMShell><p>x</p></RMShell>)
        const navItems = container.querySelectorAll('aside nav > span')
        const cockpit = Array.from(navItems).find((el) => el.textContent?.includes('Cockpit')) as HTMLElement
        const dot = cockpit.querySelector('span[aria-hidden="true"]')
        expect(dot).not.toBeNull()
        expect(dot?.className).toContain('bg-trad-green')
        expect(dot?.className).toContain('rounded-full')
        expect(dot?.className).toContain('ml-auto')
        expect(dot?.className).not.toMatch(/fresh-green/)
      })

      it('inactive nav items have NO active-indicator dot', () => {
        const { container } = render(<RMShell><p>x</p></RMShell>)
        const navItems = container.querySelectorAll('aside nav > span')
        const inactive = Array.from(navItems).filter((el) => !el.textContent?.includes('Cockpit'))
        for (const item of inactive) {
          const dot = item.querySelector('span[aria-hidden="true"]')
          // Inactive items have no active dot (only the icon's children, which use the SVG aria-hidden)
          // The SVG has aria-hidden too; differentiate by checking for the rounded-full class
          const activeDot = item.querySelector('span[aria-hidden="true"].rounded-full')
          expect(activeDot).toBeNull()
        }
      })

      it('workspace is <main> with flex-1 px-8 py-7 min-w-0 relative', () => {
        const { container } = render(<RMShell><p>x</p></RMShell>)
        const main = container.querySelector('main')
        expect(main).not.toBeNull()
        expect(main?.className).toContain('flex-1')
        expect(main?.className).toContain('px-8')
        expect(main?.className).toContain('py-7')
        expect(main?.className).toContain('min-w-0')
        expect(main?.className).toContain('relative')
      })

      it('NO copilot sidecar element rendered (Phase 4 ships empty per D-77)', () => {
        const { container } = render(<RMShell><p>x</p></RMShell>)
        // No element with copilot-related class or data-attribute
        expect(container.querySelector('[data-copilot]')).toBeNull()
        expect(container.querySelector('[aria-label*="Copilot"]')).toBeNull()
      })

      it('full HTML output contains NO fresh-green substring (retrofit #5 enforced at authorship)', () => {
        const { container } = render(<RMShell><p>x</p></RMShell>)
        expect(container.innerHTML).not.toMatch(/fresh-green/)
        expect(container.innerHTML).not.toMatch(/#[Bb][Ff][Dd]7[3]0/)
      })

      it('sidebar has portfolio bottom block separated by border-t border-mist', () => {
        const { container } = render(<RMShell><p>x</p></RMShell>)
        const aside = container.querySelector('aside')
        const bottom = aside?.querySelector('.mt-auto')
        expect(bottom).not.toBeNull()
        expect(bottom?.className).toContain('border-t')
        expect(bottom?.className).toContain('border-mist')
      })
    })
    ```
  </action>
  <verify>
    <automated>
    test -f components/shell/RMShell.tsx && grep -q "bg-trad-green" components/shell/RMShell.tsx && grep -q "w-\[220px\]" components/shell/RMShell.tsx && ! grep -E "(fresh-green|#[Bb][Ff][Dd]7[3]0)" components/shell/RMShell.tsx && npm run test -- components/shell/RMShell.test.tsx && npm run typecheck && npm run lint
    </automated>
  </verify>
  <acceptance_criteria>
    - File `components/shell/RMShell.tsx` exists
    - File imports `Icon` and `IconName` from `@/components/primitives/Icon`, `Eyebrow` from `@/components/primitives/Eyebrow`
    - Outer container: `flex bg-paper-deep min-h-[calc(100vh-56px)]`
    - Sidebar: `<aside className="w-[220px] flex-shrink-0 bg-paper border-r border-mist sticky top-14 ...">`
    - Sidebar contains 4 nav items: Cockpit (active), Pipeline, Applications, Copilot
    - Active item has `bg-paper-deep text-ink font-medium` + active dot
    - Active dot is `<span aria-hidden="true" className="ml-auto block w-1.5 h-1.5 rounded-full bg-trad-green" />` (retrofit #5: bg-trad-green, NOT bg-fresh-green)
    - Inactive items: `bg-transparent text-ink-soft font-normal`, no active dot
    - Workspace: `<main className="flex-1 px-8 py-7 min-w-0 relative">`
    - NO copilot sidecar element (Phase 4 empty slot per D-77 — comment block in JSX explains)
    - File has NO fresh-green tokens (verifiable via grep negation in verify command)
    - File `components/shell/RMShell.test.tsx` exists with ≥12 test cases
    - All tests pass; the "NO fresh-green substring" invariant test passes
    - `npm run typecheck` exits 0
    - `npm run lint` exits 0
  </acceptance_criteria>
  <done>RMShell 3-zone layout with sidebar nav placeholders + active "Cockpit" with retrofit-#5 trad-green dot + workspace + empty copilot slot; no fresh-green; tests verify retrofit + D-77.</done>
</task>

</tasks>

<threat_model>
This plan creates the layout shells. No user input flow; no event handlers; placeholder nav items are inert spans.

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-04-09-01 | SHELL-05 / Token leak | RMShell sidebar active dot | mitigate | Retrofit #5 applied at authorship — `bg-trad-green` (NOT `bg-fresh-green`). Negative-invariant test in RMShell.test.tsx confirms. |
| T-04-09-02 | V14 / Empty slot semantics | Copilot sidecar slot | accept | Phase 4 ships empty per D-77 — no element rendered. The flex-1 workspace handles available space; Phase 8's copilot grows naturally. No security implication; visual completeness deferred (acceptable per UI-SPEC OD-15). |
| T-04-09-03 | A11y / Inert nav placeholders | Sidebar `<span>` items | accept | Per UI-SPEC line 409, `<span>` placeholders are valid for Phase 4 — sidebar nav is a Phase 6 deliverable. The active item has `aria-current="page"` for screen readers; inactive items are inert (no focus, no click). Phase 6 swaps `<span>` → `<Link>` and adds focus-visible styling per UI-SPEC ActionCard pattern. |

Active mitigation: retrofit-at-authorship for SHELL-05 dot color.
</threat_model>

<verification>
After both tasks land:
1. `npm run typecheck && npm run lint && npm run test -- components/shell/ClientShell.test.tsx components/shell/RMShell.test.tsx` exits 0
2. `grep -E "fresh-green|#[Bb][Ff][Dd]7[3]0" components/shell/ClientShell.tsx components/shell/RMShell.tsx` returns 0 matches (clean files; only RisingMark.tsx has fresh-green from Plan 04-08)
3. `ls components/shell/` shows ClientShell.tsx + .test.tsx + RMShell.tsx + .test.tsx (plus the 3 chrome files from Plan 04-08)
4. Plan 04-10 wires these via `app/(client)/layout.tsx` and `app/(rm)/layout.tsx`
</verification>

<success_criteria>
- [ ] ClientShell.tsx renders single-column wrapper with min-h-[calc(100vh-56px)] + max-w-[1200px] inner container; no fresh-green; tests pass
- [ ] RMShell.tsx renders 3-zone (sidebar 220 + workspace flex-1 + empty copilot slot); active "Cockpit" item has retrofit-#5 bg-trad-green dot; no fresh-green; tests pass
- [ ] All sidebar nav items are `<span>` placeholders (no live `<Link>` wiring — Phase 6 owns)
- [ ] `npm run typecheck`, `npm run lint`, `npm run test` all exit 0
</success_criteria>

<output>
After completion, create `.planning/phases/04-app-shell-primitives/04-09-SUMMARY.md`
</output>
