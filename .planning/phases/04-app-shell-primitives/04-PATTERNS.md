# Phase 4 — Pattern Map

**Mapped:** 2026-04-26
**Files analyzed:** 28 (creates) + 7 (modifies) = 35 file actions
**Analogs found in repo:** mixed — see per-section breakdowns
**Codebase scope scanned:** `app/`, `lib/`, `data/`, `types/`, root configs (`vitest.config.ts`, `eslint.config.mjs`, `.prettierrc`, `tsconfig.json`, `package.json`, `.github/workflows/ci.yml`, `.gitignore`)

## Greenfield Notice — `components/` and `scripts/` directories do not exist on `main`

Phase 4 is the **first phase to create source under `components/`**. Verified by:

```
ls components 2>&1  →  No such file or directory
ls scripts    2>&1  →  No such file or directory
find . -name "*.tsx" -not -path "./.next/*" -not -path "./node_modules/*"
  → only app/(client)/journey/page.tsx, app/(rm)/cockpit/page.tsx, app/page.tsx
```

There are **zero existing React component files**, **zero `'use client'` files**, **zero bash scripts**, and **zero `.test.tsx` files** in the repo. Phase 4 is establishing all of these patterns. The closest TypeScript-React analogs for shape/style are the three RSC pages (`app/page.tsx`, `app/(client)/journey/page.tsx`, `app/(rm)/cockpit/page.tsx`) — all server components, all using Tailwind utilities + the `@/` path alias.

The closest **TypeScript file-header / typing / test conventions** to inherit come from Phase 3's `lib/api.mock.ts`, `lib/stages.ts`, `lib/api.mock.test.ts`, `lib/stages.test.ts`, `data/seed.ts`, `data/seed.test.ts`. Phase 3's idioms (file-header JSDoc, explicit imports, closed string unions, `Pattern J` `must<T>` over non-null assertion, `Object.freeze` on constants, co-located `*.test.ts` with `globals: false` Vitest config) are the strongest signals for the new files.

Per RESEARCH.md `## Greenfield Notice` style from Phase 2, treat each Phase 4 file as a pattern *establishment* exercise where no in-repo analog exists, and a pattern *adoption* exercise where one does.

---

## File Classification

### Creates — chrome (`components/shell/`)

| New file | Role | Data flow in | Data flow out | Closest analog | Match quality |
|----------|------|--------------|---------------|----------------|---------------|
| `components/shell/TopStrip.tsx` | client component (`'use client'`) | `usePathname()` from `next/navigation`; `modeForPathname` + `PERSONAS` from `@/lib/persona` | renders `<header>` with brand cluster + context badge + spacer + ModeSwitcher + LanguageToggle + Icon mail/help + persona block | **No `'use client'` analog exists.** Closest TypeScript-React shape: `app/page.tsx` (RSC, Tailwind utilities, `@/` import). For `'use client'` directive convention, follow Next.js 16 docs cited in RESEARCH §Pattern 1. | role-match (TSX + Tailwind), pattern-establishing |
| `components/shell/RisingMark.tsx` | server component (pure SVG) | none (props: `size?: number`, `color?: string`, `hand?: string`) | inline SVG markup | none — first SVG component; closest is `app/page.tsx` swatch JSX style | role-match for TSX shape |
| `components/shell/LanguageToggle.tsx` | server component (visual-only) | none | renders `<span>` segments EN / 日本語 with `font-body` / `font-jp` | none — but the `font-jp` consumption pattern is established by `app/(client)/journey/page.tsx` line 10 (`<p className="font-jp text-3xl">Yukiさん、ようこそ</p>`) | partial — font idiom only |
| `components/shell/ModeSwitcher.tsx` | server component, env-gated | reads `process.env.NEXT_PUBLIC_SHOW_MODE_SWITCHER` at module evaluation; takes `activeMode: 'client' \| 'rm' \| 'demo'` prop | two `<Link>` components (from `next/link`) wrapping mode segments | `Link` usage analog: `app/page.tsx:152-157` (`<Link href="/journey" ...>`); `app/(client)/journey/page.tsx:17`; `app/(rm)/cockpit/page.tsx:16` | role-match for `<Link>` idiom |
| `components/shell/ClientShell.tsx` | server component (layout wrapper) | `children: React.ReactNode` | `<main>` single-column + computed min-height | partial — `app/(client)/journey/page.tsx` shows the `<main className="bg-paper text-trad-green min-h-screen p-8">` Phase 2 idiom but Phase 4 supersedes the `min-h-screen` with `min-h-[calc(100vh-56px)]` (RESEARCH §5.8) | role-match (layout shape) |
| `components/shell/RMShell.tsx` | server component (layout wrapper, 3-zone) | `children: React.ReactNode` | sidebar (220px fixed) + workspace (flex-1) + empty copilot-sidecar slot | none for sidebar shape; closest body shape: `app/(rm)/cockpit/page.tsx` (existing placeholder is bare; Phase 4 adds the full sidebar) | partial — page-level idiom only |

### Creates — primitives (`components/primitives/`)

| New file | Role | Data flow in | Data flow out | Closest analog | Match quality |
|----------|------|--------------|---------------|----------------|---------------|
| `components/primitives/Eyebrow.tsx` | server component (typography primitive) | `{ children: ReactNode, className?: string }` | `<span>` with mono uppercase tracked | `app/page.tsx:101` (`<p className="font-mono text-xs text-ink-soft">`) — same family of mono-utility idiom | role-match (typography) |
| `components/primitives/StatusChip.tsx` | server component (closed enum kind) | `{ kind: 'ok' \| 'ai' \| 'amber' \| 'ghost' \| 'red' \| 'info', children, dot?: boolean }` | pill `<span>` with leading optional dot | none — but closed-enum-prop discipline mirrors `lib/api.ts:17-49` `OriginAPI` interface and `types/origin.ts:18-49` enum unions | role-match for enum-prop shape |
| `components/primitives/StagePill.tsx` | server component (numbered disc) | `{ n: 1\|2\|3\|4\|5\|6, state: 'done'\|'current'\|'upcoming', size?: number }` | circular `<span>` with ✓ or numeral | closest enum-prop discipline: `lib/stages.ts:1-22` (`StageNumber` literal type 1..6 already defined in `types/origin.ts:47`) — Phase 4 RE-USES `StageNumber` from `types/origin.ts` | exact (consumes existing type) |
| `components/primitives/AIPulseDot.tsx` | server component (animated dot) | `{ ariaLabel?: string }` (default "AI active") | `<span>` 8×8 with `animate-ai-pulse` utility | none — first animated component; CSS animation token added to `app/globals.css` per RESEARCH §5.3 | role-match (Tailwind utility consumer) |
| `components/primitives/AIBadge.tsx` | server component (composite) | `{ label?: string }` (default "Origin") | `<span>` pill containing AIPulseDot + label | none | role-match (composite) |
| `components/primitives/ActionCard.tsx` | client component (`'use client'` when `onClick` provided per RESEARCH Pitfall 3) | `{ title, meta?, indicator?: ReactNode, cta?: ReactNode, onClick?: () => void, faint?: boolean }` | row `<button>` or `<div>` with slots for indicator + cta | `app/page.tsx:91-110` `SwatchGrid` `<article>` rows give the closest "card row" Tailwind shape | partial — card-row idiom only |
| `components/primitives/Icon.tsx` | server component (closed-name SVG dictionary) | `{ name: IconName (35-name closed union), size?, stroke?, color?, ariaLabel?, style? }` | `<svg viewBox="0 0 24 24">` with switch-mapped path/circle/rect | none — first SVG dictionary component; 35 paths verbatim from RESEARCH §5.2 | greenfield (literal SVG content) |
| `components/primitives/Avatar.tsx` | server component | `{ initials: string, size?: number, color: AvatarColor, textColor?: AvatarColor }` | round `<span>` with monospace initials | none for component; closed-enum discipline mirrors `types/origin.ts:18-49` | role-match (closed enum prop) |
| `components/primitives/index.ts` | barrel export | re-exports the 8 primitives + types | re-exports only | none — first barrel export in repo. Convention: re-export named values + types from a flat list. | greenfield |

### Creates — `lib/` helpers

| New file | Role | Data flow in | Data flow out | Closest analog | Match quality |
|----------|------|--------------|---------------|----------------|---------------|
| `lib/persona.ts` | shared utility (plain TS constants) | none (constants) | `PERSONAS`, `PERSONA_HOME`, `modeForPathname()` | **`lib/stages.ts`** (constants `STAGE_NAMES` + helper `deriveStages`) — exact-shape analog: per-key Record + pure helper function. **Closest match in repo.** | exact match |
| `lib/priority.ts` (optional, deferred per CONTEXT D-81) | shared utility | none | `priorityColor()` helper | `lib/stages.ts` | exact match |

### Creates — `app/` route-group layouts and demo page

| New file | Role | Data flow in | Data flow out | Closest analog | Match quality |
|----------|------|--------------|---------------|----------------|---------------|
| `app/(client)/layout.tsx` | server component (route-group layout) | `{ children: React.ReactNode }` | `<ClientShell>{children}</ClientShell>` | `app/layout.tsx:41-50` (root layout — same `RootLayout({ children })` server-component shape) | exact match (layout pattern) |
| `app/(rm)/layout.tsx` | server component (route-group layout) | `{ children: React.ReactNode }` | `<RMShell>{children}</RMShell>` | `app/layout.tsx:41-50` | exact match |
| `app/dev/primitives/page.tsx` | server component (demo page, OUTSIDE route groups) | none | static JSX rendering every primitive in every state | `app/page.tsx` (existing token showcase — exact same demo-page pattern: bare `<main>`, sectioned articles, mono class hints) | **strong analog** |

### Creates — scripts and tests

| New file | Role | Data flow in | Data flow out | Closest analog | Match quality |
|----------|------|--------------|---------------|----------------|---------------|
| `scripts/check-fresh-green.sh` | bash CI script | reads `git ls-files`, `.freshgreen-allowlist`, source files | exit code 0 (clean) or 1 (violation) + stderr report | **none — first script in repo.** Closest convention reference: RESEARCH §7.1 verbatim draft (lines 1278-1322) | greenfield (literal contents from RESEARCH §7.1) |
| `scripts/check-fresh-green.test.ts` | Vitest test (boundary-case fixtures) | invokes `check-fresh-green.sh` via `execSync` per RESEARCH §6 | passes/fails based on grep output | `lib/stages.test.ts` and `data/seed.test.ts` for Vitest co-located test idiom | exact match (test framework idioms) |
| `.freshgreen-allowlist` | plain-text policy file at repo root | none | `git ls-files`-relative paths, one per line, `#` comments | none — first allowlist file in repo. Closest comment-header convention: `lib/api.ts:1-10` (multi-line block comment with policy + cross-ref) | greenfield (literal content from CONTEXT D-86) |
| `vitest.setup.ts` (NEW) | Vitest setup file (jest-dom matchers) | `import '@testing-library/jest-dom/vitest'` | side-effect: registers matchers | none — first Vitest setup file. Closest one-line module idiom: any module-level side-effect import (e.g., `app/layout.tsx:3` `import './globals.css'`) | greenfield |
| Co-located `*.test.tsx` per primitive | Vitest tests with React Testing Library `render()` | imports primitive + `@testing-library/react` | DOM assertions via `expect(...).toHaveClass(...)` | `lib/stages.test.ts:1-9` for the `import { describe, it, expect } from 'vitest'` idiom + `app/page.tsx` JSX shape for the rendered tree | role-match (test framework only — `.tsx` rendering is new) |

### Modifies

| Modified file | What changes | Current shape | Source-of-truth |
|---------------|--------------|---------------|-----------------|
| `app/layout.tsx` | (1) PD-1: line 31 `weight: ['400', '700']` → `weight: ['400', '500']`; (2) OD-12: line 8 `Fraunces({ subsets, variable, display })` → add `axes: ['SOFT', 'WONK']` (or use inline `fontVariationSettings` per OD-12 strategy b); (3) wrap children: insert `<TopStrip />` above `{children}` in body | 50 lines, 4 `next/font` imports + RootLayout RSC | UI-SPEC PD-1 + OD-12; RESEARCH §3 |
| `app/globals.css` | additive: append `@keyframes ai-pulse` block + `--animate-ai-pulse` token inside the existing `@theme` block (D-89 carve-out per RESEARCH §1) | 73 lines: `@import "tailwindcss"`; `@theme {}` palette/spacing/radius; `@theme inline {}` font remap; minimal body reset | RESEARCH §5.3 |
| `vitest.config.ts` | (1) `environment: 'node'` → `environment: 'jsdom'`; (2) `include: ['**/*.test.ts']` → `include: ['**/*.test.{ts,tsx}']`; (3) add `setupFiles: ['./vitest.setup.ts']` | 11 lines, defineConfig with tsconfigPaths plugin | RESEARCH §6 |
| `.github/workflows/ci.yml` | append a fourth top-level job `fresh-green` (no setup-node, no npm ci — bash-only) | 49 lines, 3 jobs (typecheck / lint / test) | RESEARCH §7.2 |
| `.planning/REQUIREMENTS.md` | amend SHELL-04 wording for the 5→8 primitive drift per D-72 (split into SHELL-04 brand + SHELL-04a infrastructure, OR reword) | currently lists 5 primitives | CONTEXT D-72 |
| `package.json` | add devDeps `jsdom@^25 @testing-library/react@^16 @testing-library/jest-dom@^6`; OPTIONALLY add `"check:fresh-green": "bash scripts/check-fresh-green.sh"` script for local-run parity | 30 lines, scripts + deps + devDependencies | RESEARCH §6, §7.2 |
| `tsconfig.json` | NO change required — `**/*.ts` glob in `include` (line 28) already covers `vitest.setup.ts`; `vitest.config.ts` already covered by Phase 3 | 35 lines, current `include` covers `.tsx` | tsconfig already covers everything |

---

## Section 1: Files Created — closest analogs (concrete excerpts)

### `components/shell/TopStrip.tsx` (`'use client'` chrome component)

- **Role:** client component, hooks `usePathname()`, renders shell strip with mode-conditional context badge and persona block
- **Closest analog:** none — first `'use client'` file in repo. The TypeScript-React shape closest to TopStrip is `app/page.tsx` for Tailwind utility composition; `'use client'` directive convention from Next.js 16 docs (RESEARCH §Pattern 1, line 308-345)
- **Excerpt to inherit (Tailwind utility composition + `@/` import idiom from `app/page.tsx`):**

  ```tsx
  // app/page.tsx (lines 1-6, 113-115) — analog idiom
  // Phase 2 verification surface (D-41) — token showcase for SCAFF-04 + SCAFF-05.
  // Reviewers confirm Phase 2 done by opening this page and scanning swatches + fonts.
  // Phase 4 (app shell) supersedes this content.

  import Link from 'next/link'
  ...
  export default function TokenShowcase() {
    return (
      <main className="bg-paper text-trad-green min-h-screen p-12">
  ```

- **Conventions to follow (from this analog + Phase 3):**
  - File-header comment block: 1-3 lines naming the phase + decision IDs the file satisfies (matches `app/page.tsx:1-3`, `lib/api.mock.ts:1-22`, `lib/stages.ts:1`)
  - `import` ordering: `next` packages → `@/` aliased project imports → relative imports (matches `lib/api.mock.ts:24-59`)
  - Prefer Tailwind utility classes from `@theme` tokens; never inline hex (Pattern A from Phase 2 PATTERNS, retained)
  - `'use client'` directive on line 1 of the file (Next.js 16 convention; first instance in repo)
  - Use `usePathname()` from `next/navigation` per RESEARCH §4.3 + Pattern 1
  - Type props with closed unions; Phase 3 establishes the discipline (`lib/api.mock.ts:65-72` `IntakeTokenError` reason union)

---

### `components/shell/RisingMark.tsx` (server SVG component)

- **Role:** server component, returns inline `<svg>` with the brand mark (paper outer arc + fresh-green clock-hand stroke, allowlisted)
- **Closest analog:** none for SVG; for plain RSC export shape, `app/(rm)/cockpit/page.tsx`
- **Excerpt to inherit (RSC export idiom from `app/(rm)/cockpit/page.tsx:1-21`):**

  ```tsx
  // app/(rm)/cockpit/page.tsx — verbatim
  // app/(rm)/cockpit/page.tsx
  // Phase 2 placeholder for SCAFF-06 RM route group.
  // Phase 6 (RMC-01..07) replaces this content but keeps the route path.

  import Link from 'next/link'

  export default function RMCockpitPlaceholder() {
    return (
      <main className="bg-paper text-trad-green min-h-screen p-8">
        ...
      </main>
    )
  }
  ```

- **Conventions to follow:**
  - Default export (RSC component); no named-export pattern in `app/` exists
  - Multi-line file-header comment with phase ID + which decision/REQ this satisfies
  - For shell components in `components/shell/`, use **named** exports (matches Phase 3's `lib/stages.ts` named-export discipline; the `components/primitives/index.ts` barrel re-exports named symbols)
  - Inline SVG path data verbatim from RESEARCH §5.2; no separate icon library
  - Allowlist this file in `.freshgreen-allowlist` for the clock-hand `var(--color-fresh-green)` (D-85, brand-iconographic exception)

---

### `components/shell/LanguageToggle.tsx` (server, visual-only)

- **Role:** server component, two `<span>` segments rendering "EN" (Inter Tight) and "日本語" (Noto Sans JP)
- **Closest analog:** `app/(client)/journey/page.tsx:10` — same `font-jp` utility consumption for Japanese characters
- **Excerpt to inherit (lines 1-22 of `app/(client)/journey/page.tsx`):**

  ```tsx
  // app/(client)/journey/page.tsx
  // Phase 2 placeholder for SCAFF-06 client route group.
  // Phase 5 (CJD-01) replaces this content but keeps the route path.

  import Link from 'next/link'

  export default function ClientJourneyPlaceholder() {
    return (
      <main className="bg-paper text-trad-green min-h-screen p-8">
        <p className="font-jp text-3xl">Yukiさん、ようこそ</p>
        <p className="font-body text-xl mt-4">Welcome, Yuki — Client Journey (Phase 5 placeholder)</p>
  ```

- **Conventions to follow:**
  - Mix latin + JP characters by changing utility class (`font-body` ↔ `font-jp`) on the segment, NOT by changing components
  - Render as `<span>` (NOT `<button>`/`<Link>`) so segments never receive focus (UI-SPEC Interaction States table, "non-interactive" row)

---

### `components/shell/ModeSwitcher.tsx` (server, env-gated, two `<Link>`s)

- **Role:** server component, gated by `process.env.NEXT_PUBLIC_SHOW_MODE_SWITCHER`, renders dashed-border container with two `<Link>` segments
- **Closest analog:** `<Link>` import + usage at `app/page.tsx:152-157`
- **Excerpt to inherit:**

  ```tsx
  // app/page.tsx (lines 5, 152-158) — verbatim
  import Link from 'next/link'
  ...
  <nav className="mt-4 flex gap-4">
    <Link href="/journey" className="font-mono text-signal-info underline">
      → /journey (client placeholder)
    </Link>
    <Link href="/cockpit" className="font-mono text-signal-info underline">
      → /cockpit (RM placeholder)
    </Link>
  </nav>
  ```

- **Conventions to follow:**
  - `<Link>` from `next/link` for in-app navigation (NOT `<button onClick={navigate}>` — RESEARCH §Pattern 3, lines 377-405)
  - `href` is a string literal pointing at `PERSONA_HOME.client` / `PERSONA_HOME.rm` (constants from `lib/persona.ts`)
  - `className` accepts Tailwind utilities directly; tokens come from `@theme` (mode-switcher container uses `border-1 border-dashed border-ink-muted/30` per UI-SPEC retrofit #3)
  - Read env vars at module evaluation time: `if (process.env.NEXT_PUBLIC_SHOW_MODE_SWITCHER !== 'true') return null` — first repo instance of this pattern; aligns with the `process.env.NEXT_PUBLIC_USE_MOCK` switch logic in `lib/api.ts:87` (also string-literal `'false'` comparison)

---

### `components/shell/ClientShell.tsx` (RSC layout wrapper)

- **Role:** server component, single-column workspace wrapper consumed by `app/(client)/layout.tsx`
- **Closest analog:** **`app/(client)/journey/page.tsx`** — closest `<main>` shape for client surfaces:
- **Excerpt to inherit (lines 7-22):**

  ```tsx
  // app/(client)/journey/page.tsx — analog
  export default function ClientJourneyPlaceholder() {
    return (
      <main className="bg-paper text-trad-green min-h-screen p-8">
        ...
      </main>
    )
  }
  ```

- **Conventions to follow:**
  - Phase 4 supersedes `min-h-screen` with `min-h-[calc(100vh-56px)]` (RESEARCH §5.8 — TopStrip is 56px and ClientShell sits below)
  - Inner content max-width `1200px` centered + `pt-9 px-10 pb-20` per RESEARCH §5.8
  - Named export `ClientShell` (not default) so the route-group layout can `import { ClientShell }`

---

### `components/shell/RMShell.tsx` (RSC layout wrapper, 3-zone)

- **Role:** server component, `flex` container with sidebar (220px fixed) + workspace (flex-1) + empty copilot-sidecar slot
- **Closest analog:** none; `app/(rm)/cockpit/page.tsx:7-21` provides the `<main className="bg-paper text-trad-green min-h-screen p-8">` Phase 2 idiom but Phase 4 replaces this entirely
- **Excerpt to inherit (RSC export shape from `app/(rm)/cockpit/page.tsx:7-21`):**

  ```tsx
  // app/(rm)/cockpit/page.tsx — RSC shape only
  export default function RMCockpitPlaceholder() {
    return (
      <main className="bg-paper text-trad-green min-h-screen p-8">
        <h1 className="font-display text-4xl">James Lee · RM Cockpit</h1>
        ...
      </main>
    )
  }
  ```

- **Conventions to follow:**
  - Verbatim layout shape from RESEARCH §5.9 lines 1167-1187: outer `flex bg-paper-deep min-h-[calc(100vh-56px)]`; sidebar `w-[220px] bg-paper border-r border-mist sticky top-14 h-[calc(100vh-56px)]`; workspace `flex-1 px-8 py-7 min-w-0 relative`
  - Sidebar nav items use `<Link>` from `next/link` (planner picks per UI-SPEC Interaction States table — placeholder Links acceptable, plan-phase locks)
  - Copilot sidecar slot: omit entirely in Phase 4 (Phase 8 owns; per CONTEXT D-77)
  - Sidebar active-route indicator: replace fresh-green dot with `bg-trad-green` per UI-SPEC retrofit #5

---

### `components/primitives/Eyebrow.tsx`

- **Role:** server component (typography), `<span>` mono uppercase tracked
- **Closest analog:** `app/page.tsx:101` — same `font-mono text-{xs|sm}` family
- **Excerpt to inherit:**

  ```tsx
  // app/page.tsx (lines 99-104) — analog idiom
  <div className="p-3 bg-paper-deep">
    <p className="font-mono text-sm text-ink">{swatch.token}</p>
    <p className="font-mono text-xs text-ink-soft">{swatch.hex}</p>
    {swatch.note ? (
      <p className="font-mono text-xs text-signal-amber mt-1">{swatch.note}</p>
    ) : null}
  </div>
  ```

- **Conventions to follow:**
  - 10/500 IBM Plex Mono with 0.18em tracking → Tailwind class shape: `font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-ink-muted`
  - Accept `className?: string` and merge via template literal (not classnames lib — Phase 2 D-38 has no Tailwind plugins)
  - Ship as named export

---

### `components/primitives/StatusChip.tsx`

- **Role:** server component, closed `kind` enum determining bg + text + (optional) dot color
- **Closest analog (for closed-enum prop discipline):** `lib/api.ts:33-79` `OriginAPI` interface + `types/origin.ts:18-49` enum unions
- **Excerpt to inherit (closed-string-union prop pattern from `types/origin.ts:18-49`):**

  ```ts
  // types/origin.ts (lines 18-49) — analog: closed string-literal union
  export type UserRole = 'rm' | 'client_admin' | 'client_user'
  export type ApplicationStatus =
    | 'invited'
    | 'in_progress'
    | 'in_review'
    | 'approved'
    | 'activated'
    | 'on_hold'
  ...
  ```

- **Conventions to follow:**
  - Define `StatusChipKind = 'ok' | 'ai' | 'amber' | 'ghost' | 'red' | 'info'` as a closed string union (matches Phase 3's discipline above)
  - Map kind → Tailwind utility class via a `Record<StatusChipKind, string>` object so the per-kind unit tests (D-87) can assert classlist directly
  - **Allowlisted file** (D-85) — only `kind='ai'` branch uses `bg-fresh-green-glow` + `bg-fresh-green` (dot)
  - Co-located `StatusChip.test.tsx` per D-87 verifies 6 kinds × token mapping (RESEARCH §5.5 line 1071-1083 has the verbatim test recipe)

---

### `components/primitives/StagePill.tsx`

- **Role:** server component, circular numbered disc; renders ✓ for `done`, numeral 1..6 otherwise
- **Closest analog (re-uses existing types):** `types/origin.ts:47` exports `StageNumber = 1 | 2 | 3 | 4 | 5 | 6` — Phase 4 imports this for the `n` prop type
- **Excerpt to inherit (existing typed-literal idiom):**

  ```ts
  // types/origin.ts (line 47)
  export type StageNumber = 1 | 2 | 3 | 4 | 5 | 6

  // lib/stages.ts (lines 1-22) — analog: import + use a closed-literal type
  import type { Application, Stage, StageNumber } from '@/types/origin'

  export const STAGE_NAMES: Record<StageNumber, string> = { ... }

  export function deriveStages(app: Application): Stage[] {
    return ([1, 2, 3, 4, 5, 6] as StageNumber[]).map((n) => ({ ... }))
  }
  ```

- **Conventions to follow:**
  - Import `StageNumber` from `@/types/origin` (cross-boundary type — fine because StagePill's prop is read-only)
  - Define local `StagePillState = 'done' | 'current' | 'upcoming'` (presentation state, NOT mirrored to `StageStatus` from types/origin — those are different domains per CONTEXT D-74)
  - Per-state class map verbatim from RESEARCH §5.4 line 1036-1041
  - Glyph `✓` (literal Unicode U+2713) — RESEARCH §5.4 line 1043
  - Pure presentational — does NOT consume `Application` or call `deriveStages` (CONTEXT D-74)

---

### `components/primitives/AIPulseDot.tsx`

- **Role:** server component, animated 8×8 fresh-green dot
- **Closest analog:** none — first animated component
- **Conventions to follow:**
  - Two-line component: `<span aria-label={ariaLabel ?? 'AI active'} role="img" className="block w-2 h-2 rounded-full bg-fresh-green animate-ai-pulse" />` (RESEARCH §5.3 line 1011-1017)
  - Animation token added to `app/globals.css` `@theme` block: `--animate-ai-pulse: ai-pulse 1200ms cubic-bezier(0.4, 0, 0.2, 1) infinite alternate` plus `@keyframes ai-pulse { 0% {...} 100% {...} }`
  - **Allowlisted file** (D-85)

---

### `components/primitives/AIBadge.tsx`

- **Role:** server component, dark trad-green-deep pill containing AIPulseDot + label
- **Closest analog:** `app/page.tsx:97` chained className idiom: `className="rounded-card overflow-hidden border border-mist"`
- **Conventions to follow:**
  - Import `AIPulseDot` from `./AIPulseDot` (same directory, relative)
  - Default `label="Origin"` per CONTEXT D-75
  - **Allowlisted file** (D-85) — composes AIPulseDot

---

### `components/primitives/ActionCard.tsx`

- **Role:** client component (`'use client'`) when `onClick` provided; row primitive
- **Closest analog (composite-card shape):** `app/page.tsx:91-110` `SwatchGrid` `<article>` row idiom
- **Excerpt to inherit:**

  ```tsx
  // app/page.tsx (lines 91-110) — closest "card row" shape
  function SwatchGrid({ title, items }: { title: string; items: ReadonlyArray<Swatch> }) {
    return (
      <section className="mb-12">
        <h2 className="font-display text-2xl mb-4">{title}</h2>
        <div className="grid grid-cols-3 gap-4">
          {items.map((swatch) => (
            <article key={swatch.token} className="rounded-card overflow-hidden border border-mist">
              <div className={`${swatch.utilityBg} h-24 w-full`} />
              <div className="p-3 bg-paper-deep">
                ...
              </div>
            </article>
          ))}
        </div>
      </section>
    )
  }
  ```

- **Conventions to follow:**
  - `'use client'` directive at line 1 (per RESEARCH Pitfall 3 lines 467-475 — declare client at the smallest scope; ActionCard ships ready for `onClick` callers)
  - Slot props `indicator?: ReactNode, cta?: ReactNode` are unconstrained per CONTEXT D-76
  - Render as `<button type="button">` when `onClick` provided, `<div>` otherwise (UI-SPEC Interaction States table)
  - Hover/focus-visible/active states per UI-SPEC Interaction States table (paper-deep bg, trad-green outline, mist active bg)

---

### `components/primitives/Icon.tsx`

- **Role:** server component, switch-mapped SVG path dictionary
- **Closest analog:** none — first SVG dictionary
- **Conventions to follow:**
  - Type `IconName` as 35-name closed string union, verbatim from RESEARCH §5.1 lines 879-915 (alphabetized)
  - Map name → JSX child (path/circle/rect/multi-element) inside a switch or Record
  - SVG defaults: `viewBox="0 0 24 24"`, `fill="none"`, `stroke="currentColor"`, `strokeWidth=1.6`, `strokeLinecap="round"`, `strokeLinejoin="round"`
  - Special cases per RESEARCH §5.2: `dot` uses `<circle cx="12" cy="12" r="4" fill={color}/>`; `help`, `search`, `copilot`, `calendar`, `clock`, `globe`, `users` are multi-child SVGs
  - `ariaLabel?: string` toggles `role="img"` + `aria-label` vs `aria-hidden="true"` per UI-SPEC FLAG 1

---

### `components/primitives/Avatar.tsx`

- **Role:** server component, round disc with monospace initials
- **Closest analog:** none — closed-enum prop discipline mirrors `types/origin.ts:18-49`
- **Conventions to follow:**
  - `AvatarColor` closed string union excluding fresh-green family (UI-SPEC Color section, 12 candidate members; RESEARCH §5.6 recommends 7-member subset)
  - Map color → `bg-{color}` Tailwind utility via `Record<AvatarColor, string>`
  - Default `size: 30` for TopStrip use (UI-SPEC OD-4)
  - IBM Plex Mono 12/400 for initials (UI-SPEC Typography table)

---

### `components/primitives/index.ts` (barrel export)

- **Role:** barrel re-export of the 8 primitives + their public types
- **Closest analog:** none — first barrel in repo
- **Conventions to follow (recommended shape):**
  ```ts
  // Suggested shape — re-export named values + types
  export { Eyebrow } from './Eyebrow'
  export { StatusChip } from './StatusChip'
  export type { StatusChipKind } from './StatusChip'
  export { StagePill } from './StagePill'
  export type { StagePillState } from './StagePill'
  export { AIPulseDot } from './AIPulseDot'
  export { AIBadge } from './AIBadge'
  export { ActionCard } from './ActionCard'
  export { Icon } from './Icon'
  export type { IconName } from './Icon'
  export { Avatar } from './Avatar'
  export type { AvatarColor } from './Avatar'
  ```
  - Re-exports are explicit (NOT `export *`) so the barrel is self-documenting and tree-shakable

---

### `lib/persona.ts` (plain TS constants — STRONGEST analog match)

- **Role:** shared utility, plain TS constants + helper function (mirrors `lib/stages.ts` 1-to-1)
- **Closest analog:** **`lib/stages.ts`** — exact-shape analog
- **Excerpt to inherit (verbatim from `lib/stages.ts:1-22`):**

  ```ts
  // lib/stages.ts (lines 1-22) — verbatim analog template
  import type { Application, Stage, StageNumber } from '@/types/origin'

  export const STAGE_NAMES: Record<StageNumber, string> = {
    1: 'Invite & Intent',
    2: 'Entity & Structure',
    3: 'Documentation',
    4: 'Screening',
    5: 'Products & Credit',
    6: 'Activation',
  }

  export function deriveStages(app: Application): Stage[] {
    return ([1, 2, 3, 4, 5, 6] as StageNumber[]).map((n) => ({
      number: n,
      name: STAGE_NAMES[n],
      status:
        n < app.currentStage  ? 'complete'
        : n === app.currentStage ? 'in_progress'
        : 'not_started',
      completedAt: null,
    }))
  }
  ```

- **Conventions to follow (mirror this template):**
  - No file-header JSDoc block (this file is small, just like `lib/stages.ts`)
  - Type imports from `@/types/origin` if needed (for `lib/persona.ts` — likely none; pure utility)
  - Named exports only; no default export
  - `Record<KeyUnion, ValueShape>` typing for the constant map — narrow keys avoid `noUncheckedIndexedAccess` undefined pitfalls (RESEARCH Pitfall 2 lines 457-466)
  - Pure synchronous helper function (no Promises; no `await`); aligned typing with `Record<'client' | 'rm', Persona>` so `PERSONAS[mode].name` doesn't trip `noUncheckedIndexedAccess`
  - Per CONTEXT D-66 + UI-SPEC OD-13: single file with `PERSONAS`, `PERSONA_HOME`, `modeForPathname()`. Recommended `modeForPathname` extension to return `'client' | 'rm' | 'demo'` per RESEARCH §8.2 (planner locks)
  - Use `as const` on object literals to preserve narrow types (UI-SPEC TopStrip section line 278: `} as const`)

---

### `lib/priority.ts` (optional, deferred)

- **Role:** shared utility, `priorityColor()` helper
- **Closest analog:** `lib/stages.ts` (same shape)
- **Conventions to follow:** identical to `lib/persona.ts`. Per CONTEXT D-81, only ship if Phase 4 needs it (likely Phase 6).

---

### `app/(client)/layout.tsx` (route-group layout)

- **Role:** server component (route-group layout per Next.js 16)
- **Closest analog:** **`app/layout.tsx`** — exact-pattern analog (RootLayout server component receiving `{ children }`)
- **Excerpt to inherit (lines 41-50 of `app/layout.tsx`):**

  ```tsx
  // app/layout.tsx (lines 41-50) — verbatim analog
  export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
      <html
        lang="en"
        className={`${fraunces.variable} ${interTight.variable} ${notoSansJP.variable} ${ibmPlexMono.variable}`}
      >
        <body>{children}</body>
      </html>
    )
  }
  ```

- **Conventions to follow:**
  - Default-export named `ClientGroupLayout` (descriptive; not just `Layout`)
  - Server component; no `'use client'`
  - Body returns `<ClientShell>{children}</ClientShell>` — per RESEARCH §Pattern 2 lines 354-361:
    ```tsx
    import { ClientShell } from '@/components/shell/ClientShell'

    export default function ClientGroupLayout({ children }: { children: React.ReactNode }) {
      return <ClientShell>{children}</ClientShell>
    }
    ```

---

### `app/(rm)/layout.tsx` (route-group layout)

- **Role:** server component
- **Closest analog:** identical to `app/(client)/layout.tsx`; `app/layout.tsx` is the exact-pattern template
- **Excerpt to inherit:** same as the (client) layout above
- **Conventions to follow:** mirror the client layout but compose `<RMShell>{children}</RMShell>`

---

### `app/dev/primitives/page.tsx` (demo page)

- **Role:** server component, public demo page outside both route groups
- **Closest analog:** **`app/page.tsx`** — exact-pattern analog (existing token-showcase demo page)
- **Excerpt to inherit (lines 1-19, 113-145 of `app/page.tsx`):**

  ```tsx
  // app/page.tsx (lines 1-19, 113-122) — analog template
  // Phase 2 verification surface (D-41) — token showcase for SCAFF-04 + SCAFF-05.
  // Reviewers confirm Phase 2 done by opening this page and scanning swatches + fonts.
  // Phase 4 (app shell) supersedes this content.

  import Link from 'next/link'

  type Swatch = {
    readonly token: string
    readonly hex: string
    readonly utilityBg: string
    readonly note?: string
  }
  ...
  export default function TokenShowcase() {
    return (
      <main className="bg-paper text-trad-green min-h-screen p-12">
        <header className="mb-12">
          <h1 className="font-display text-5xl">SMBC Origin — Phase 2 Token Showcase</h1>
          <p className="font-body text-lg mt-2 text-ink-soft">
            Verification surface for SCAFF-04 (palette) and SCAFF-05 (typography). Source of truth:
            docs/ORIGIN_DESIGN.md §8.
          </p>
        </header>
        ...
  ```

- **Conventions to follow:**
  - File-header comment naming Phase 4 + which decision/REQ this satisfies (mirrors `app/page.tsx:1-3`)
  - Section-per-primitive layout (mirrors `app/page.tsx`'s SwatchGrid sections per palette group)
  - Class hints rendered with `font-mono text-xs text-ink-soft` exactly like `app/page.tsx:101`
  - **Allowlisted file** (D-85) — page renders all primitives including the AI ones
  - Path: `app/dev/primitives/page.tsx` → URL `/dev/primitives` (CONTEXT D-80; coerced from user's `/_dev/primitives` because `_`-prefix folders are non-routable)
  - Lives outside both route groups so neither ClientShell nor RMShell wraps it (RESEARCH §8.1)

---

### `scripts/check-fresh-green.sh` (bash CI script)

- **Role:** bash script, walks `git ls-files`, applies 5 regex patterns from D-83, exits 1 on violation
- **Closest analog:** **none — first script in repo.** No conventions exist.
- **Recommended header style (synthesized from `lib/api.ts:1-10` repo conventions):**

  ```bash
  #!/usr/bin/env bash
  # scripts/check-fresh-green.sh — SHELL-05 Fresh Green AI-only enforcement
  #
  # See .planning/phases/04-app-shell-primitives/04-CONTEXT.md D-82..D-88
  # See CLAUDE.md "Design system" — Fresh Green is reserved for AI outputs only.
  # Allowlist: .freshgreen-allowlist (one path per line, # comments allowed)
  #
  # Run locally: bash scripts/check-fresh-green.sh
  # Run in CI: 4th top-level job in .github/workflows/ci.yml

  set -euo pipefail
  ```

- **Conventions to establish (full body verbatim from RESEARCH §7.1 lines 1278-1322):**
  - `set -euo pipefail` at the top for strict bash mode
  - 5 regex patterns from CONTEXT D-83 (RESEARCH §3 audit may extend the Tailwind utility prefix list)
  - Read allowlist via `mapfile`, skip `#` comments and blank lines
  - Walk source files via `git ls-files | grep -E '\.(ts|tsx|css|js|jsx)$'` — uses git-tracked sources only (skips node_modules, .next, etc. without explicit excludes)
  - Print violations to stderr with file path + line number + matched line
  - Exit 0 (clean) or 1 (violation)

---

### `scripts/check-fresh-green.test.ts`

- **Role:** Vitest test, boundary-case fixtures + script invocation via `execSync`
- **Closest analog:** **`lib/stages.test.ts`** for the Vitest idiom + `lib/api.mock.test.ts:15-25` for the test-isolation pattern
- **Excerpt to inherit (lines 1-25 of `lib/api.mock.test.ts`):**

  ```ts
  // lib/api.mock.test.ts (lines 1-25) — analog: Vitest co-located test header
  /**
   * lib/api.mock.test.ts — Behavior tests for the mock API surface (D-60).
   *
   * Covers the contract surface added in Plan 04:
   *   - IntakeTokenError reason mapping (D-54)
   *   - submitIntake idempotency (D-54)
   *   ...
   *
   * Test isolation: the in-memory store is module-scoped (Pattern G). beforeEach
   * resets _store and clears listeners so cases don't bleed.
   */

  import { describe, it, expect, vi, beforeEach } from 'vitest'
  import mockAPI, {
    IntakeTokenError,
    __resetStoreForTests,
    __clearListenersForTests,
  } from '@/lib/api.mock'

  beforeEach(() => {
    __resetStoreForTests()
    __clearListenersForTests()
  })
  ```

- **Conventions to follow:**
  - Multi-line JSDoc file-header naming the file + decision IDs covered (matches `lib/api.mock.test.ts:1-13`)
  - Explicit imports: `import { describe, it, expect } from 'vitest'` — Phase 3's `globals: false` Vitest config (verified `vitest.config.ts:8`) requires explicit imports
  - For the boundary-case fixtures, write inline string literals (NOT separate fixture files) — the test file IS the fixture set
  - Invoke the bash script via `execSync` (RESEARCH §6 line 1254): `execSync('bash scripts/check-fresh-green.sh', { input: fixtureContent })` or via tempfile + path argument
  - Test cases per CONTEXT D-84 + RESEARCH §3: 3 hex case variants (`#BFD730` / `#bfd730` / `#bFd730`); arbitrary-value forms (`bg-[#BFD730]`, `bg-[var(--color-fresh-green)]`, `bg-[rgba(191,215,48,0.3)]`); rgba form

---

### `.freshgreen-allowlist`

- **Role:** plain-text policy file at repo root
- **Closest analog:** **none — first allowlist file.** Closest comment-header convention: `lib/api.ts:1-10` (multi-line policy block at top of file)
- **Recommended content (verbatim from CONTEXT D-86):**

  ```
  # SHELL-05 reserves Fresh Green (#BFD730) for AI-authored output and
  # AI presence indicators only. CSS var: --color-fresh-green (and -mute, -glow).
  # Adding a path here requires architectural review, not just code review.
  # Per-file allowlist is coarse — for files where only some branches use
  # fresh-green (e.g., StatusChip's kind='ai'), unit tests verify each branch
  # renders the expected token as a second line of defense.
  # See .planning/phases/04-app-shell-primitives/04-CONTEXT.md D-82..D-88.

  components/primitives/AIPulseDot.tsx
  components/primitives/AIBadge.tsx
  components/primitives/StatusChip.tsx
  components/shell/RisingMark.tsx
  app/dev/primitives/page.tsx
  ```

- **Conventions to establish:**
  - `#` for line comments (matches the broader repo convention — `.gitignore:1`, `.gitignore:33`, `.nvmrc` is bare)
  - One path per line, repo-relative, forward-slash separators
  - Blank lines and full-line `#` comments allowed; trailing comments NOT supported (the bash script reads lines via `mapfile` and skips lines starting with `#` only)

---

### `vitest.setup.ts` (NEW)

- **Role:** Vitest setup file; one-line side-effect import to register jest-dom matchers
- **Closest analog:** `app/layout.tsx:3` `import './globals.css'` — same one-line side-effect import idiom
- **Recommended content (verbatim from RESEARCH §6 line 1241-1244):**

  ```ts
  import '@testing-library/jest-dom/vitest'
  ```

- **Conventions to follow:**
  - No file-header comment needed (file is one line)
  - Lives at repo root, NOT under `app/` or `lib/`
  - Referenced from `vitest.config.ts` via `setupFiles: ['./vitest.setup.ts']` per RESEARCH §6 line 1235

---

### Co-located `*.test.tsx` per primitive

- **Role:** Vitest tests with React Testing Library `render()` + jest-dom matchers
- **Closest analog (Vitest idiom):** `lib/stages.test.ts:1-9` — explicit imports + `describe`/`it`/`expect`
- **Closest analog (test-isolation):** `lib/api.mock.test.ts:22-25` — `beforeEach` resets state
- **Excerpt to inherit (`lib/stages.test.ts:1-25`):**

  ```ts
  // lib/stages.test.ts (lines 1-25) — analog: simple Vitest co-located test
  import { describe, it, expect } from 'vitest'
  import { deriveStages, STAGE_NAMES } from '@/lib/stages'
  import type { Application } from '@/types/origin'

  /**
   * Test fixture: a minimal Application stub.
   * ...
   */
  function makeApp(currentStage: 1 | 2 | 3 | 4 | 5 | 6): Application { ... }

  describe('lib/stages — STAGE_NAMES canonical 6-stage list (CLAUDE.md `## The six stages`)', () => {
    it('STAGE_NAMES has exactly 6 entries', () => {
      const keys = Object.keys(STAGE_NAMES)
      expect(keys.length).toBe(6)
      expect(keys.sort()).toEqual(['1', '2', '3', '4', '5', '6'])
    })
  })
  ```

- **Conventions to follow:**
  - Explicit imports of `describe`, `it`, `expect` (Phase 3 Vitest `globals: false`)
  - `import { render, screen } from '@testing-library/react'` for `.tsx` tests (NEW — first uses)
  - Use `it` (Phase 3 convention) rather than `test` for case names — both work but consistency matters
  - JSDoc-style describe-message phrasing (matches `lib/stages.test.ts:27` `'lib/stages — STAGE_NAMES canonical 6-stage list (CLAUDE.md ...)'`) — file path + decision/REQ ID in describe block
  - For StatusChip per-kind tests (D-87): use the recipe from RESEARCH §5.5 lines 1071-1083

---

## Section 2: Files Modified — current state + change locus

### `app/layout.tsx`

- **Current state (verbatim, 50 lines, 2026-04-26):**
  ```tsx
  // line 1-12 (Fraunces import — current)
  import type { Metadata } from 'next'
  import { Fraunces, Inter_Tight, Noto_Sans_JP, IBM_Plex_Mono } from 'next/font/google'
  import './globals.css'

  // D-31: Fraunces — wght-only is the default (no opsz/SOFT/WONK in v1; deferred per CONTEXT §"Deferred Ideas").
  // next/font@16's Fraunces type only accepts opsz/SOFT/WONK as `axes` (wght is implicit/always-on),
  // so we pass no `axes` to keep wght-only behavior.
  const fraunces = Fraunces({
    subsets: ['latin'],
    variable: '--font-fraunces',
    display: 'swap',
  })
  ```
  ```tsx
  // line 28-34 (IBM Plex Mono import — current)
  // IBM Plex Mono — NOT a variable font on Google Fonts; weights must be explicit.
  const ibmPlexMono = IBM_Plex_Mono({
    subsets: ['latin'],
    weight: ['400', '700'],
    variable: '--font-ibm-plex-mono',
    display: 'swap',
  })
  ```
  ```tsx
  // line 41-50 (RootLayout — current)
  export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
      <html
        lang="en"
        className={`${fraunces.variable} ${interTight.variable} ${notoSansJP.variable} ${ibmPlexMono.variable}`}
      >
        <body>{children}</body>
      </html>
    )
  }
  ```

- **Phase 4 changes (3 distinct edits to this file):**

  | # | Line | From | To | Authority |
  |---|------|------|-----|-----------|
  | (a) PD-1 IBM Plex Mono weight swap | 31 | `weight: ['400', '700'],` | `weight: ['400', '500'],` | UI-SPEC PD-1 (lines 30-46); pre-condition: `grep -rn "font-bold" app/ components/ lib/` returns 0 |
  | (b) OD-12 Fraunces SOFT/WONK | 8-12 | `Fraunces({ subsets, variable, display })` (no `axes`) | Plan-phase picks **(a) add `axes: ['SOFT', 'WONK']`** OR **(b) leave font import alone, use inline `style={{ fontVariationSettings: '"SOFT" 80, "WONK" 1' }}` on the wordmark `<span>` only**. UI-SPEC OD-12 + RESEARCH §2 recommend (b). | UI-SPEC OD-12; RESEARCH §2 |
  | (c) Render TopStrip | 47 | `<body>{children}</body>` | `<body>` + `<TopStrip />` + `{children}` + `</body>` (TopStrip rendered ABOVE children per CONTEXT D-64) | CONTEXT D-64; RESEARCH §Pattern 1 |

- **Critical:** PD-1 also has a planner safety pre-check requirement: re-run `grep -rn "font-bold" app/ components/ lib/` at plan-phase time and confirm 0 matches before applying the swap (UI-SPEC PD-1 lines 38-46).

---

### `app/globals.css`

- **Current state:** 73 lines; structure is `@import "tailwindcss"` + `@theme {}` palette/spacing/radius + `@theme inline {}` font remap + minimal body reset. The relevant region is the `@theme {}` block (lines 7-53).

- **Phase 4 change (additive — does not remove or modify existing tokens):**

  | Locus | Insert | Authority |
  |-------|--------|-----------|
  | Inside `@theme { ... }` block (anywhere; recommend after the radius tokens line ~52) | `--animate-ai-pulse: ai-pulse 1200ms cubic-bezier(0.4, 0, 0.2, 1) infinite alternate;` | CONTEXT D-89 strategy (a/b/c — see Section 3 below); RESEARCH §5.3 line 994-1008; UI-SPEC OD-6 |
  | After the `@theme {}` block but before the body reset (i.e., between line ~53 and line ~67) | `@keyframes ai-pulse { 0% { transform: scale(1); opacity: 0.85; } 100% { transform: scale(1.15); opacity: 1; } }` | RESEARCH §5.3 line 998-1008 |

- **Caveat:** if D-89 plan-phase picks strategy (b) `@apply` directives, additional `@apply` blocks for `chip`, `card`, `t-eyebrow`, etc. would land here. UI-SPEC OD-1 recommends strategy (c) (component-prop-driven, no shared class names) — under (c) ONLY the `@keyframes` + animate token are added.

---

### `vitest.config.ts`

- **Current state (verbatim, 11 lines, 2026-04-26):**
  ```ts
  import { defineConfig } from 'vitest/config'
  import tsconfigPaths from 'vite-tsconfig-paths'

  export default defineConfig({
    plugins: [tsconfigPaths()],
    test: {
      environment: 'node',
      globals: false,
      include: ['**/*.test.ts'],
    },
  })
  ```

- **Phase 4 changes (3 edits):**

  | # | Line | From | To | Authority |
  |---|------|------|-----|-----------|
  | (a) jsdom environment | 7 | `environment: 'node',` | `environment: 'jsdom',` | RESEARCH §6 line 1232 |
  | (b) include `.tsx` | 9 | `include: ['**/*.test.ts'],` | `include: ['**/*.test.{ts,tsx}'],` | RESEARCH §6 line 1236 |
  | (c) setupFiles | (insert after `globals: false,`) | (none) | `setupFiles: ['./vitest.setup.ts'],` | RESEARCH §6 line 1235 + Pitfall 4 line 487 |

- **Side effect:** Phase 3's existing `lib/*.test.ts` and `data/*.test.ts` files will now run in jsdom too. RESEARCH §6 line 173 confirms this is acceptable: "Vitest's jsdom is fast enough that running Phase 3's small node-tests in jsdom adds <100ms; planner accepts the cost for config simplicity."

---

### `.github/workflows/ci.yml`

- **Current state (verbatim, 49 lines, 2026-04-26):**
  ```yaml
  # lines 39-49 (test job — current — last block in file)
    test:
      name: test
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        - uses: actions/setup-node@v4
          with:
            node-version-file: '.nvmrc'
            cache: 'npm'
        - run: npm ci
        - run: npm run test
  ```

- **Phase 4 change (append a 4th top-level job after line 49):**

  ```yaml
    fresh-green:
      name: fresh-green
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        - run: bash scripts/check-fresh-green.sh
  ```

- **Authority:** RESEARCH §7.2 lines 1339-1352. **No `setup-node`, no `npm ci`** — pure bash + `git ls-files` + grep. Job runs in <30 seconds.

- **Branch protection follow-up (manual, GitHub UI):** Per RESEARCH Pitfall 6 lines 511-519, after the first CI run on `main` includes the new `fresh-green` job, manually add it to required status checks at GitHub Settings → Branches → main. Same first-run-then-protect sequence Phase 2 D-39 used.

---

### `.planning/REQUIREMENTS.md`

- **Current state:** SHELL-04 lists 5 named primitives (Eyebrow, StatusChip, StagePill, AIPulseDot, ActionCard).

- **Phase 4 change (per CONTEXT D-72):** plan-phase picks one of:
  - **(a) reword:** SHELL-04 wording becomes "5 brand primitives + 3 infrastructure primitives = 8" and adds AIBadge, Icon, Avatar to the explicit list.
  - **(b) split:** SHELL-04 (brand: Eyebrow, StatusChip, StagePill, AIPulseDot, AIBadge, ActionCard) and SHELL-04a (infrastructure: Icon, Avatar).

  Either choice records the drift in the same PR as enforcement.

- **Authority:** CONTEXT D-72.

---

### `package.json`

- **Current state (verbatim, 30 lines, 2026-04-26):**
  ```json
  // lines 17-30 (devDependencies — current)
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.2.4",
    "eslint-config-prettier": "^10.1.8",
    "prettier": "^3.8.3",
    "tailwindcss": "^4",
    "typescript": "^5",
    "vite-tsconfig-paths": "^6.1.1",
    "vitest": "^4.1.5"
  }
  ```

- **Phase 4 changes:**

  | Locus | Add | Authority |
  |-------|-----|-----------|
  | `devDependencies` | `"jsdom": "^25.0.0"` | RESEARCH §Standard Stack lines 137-139 |
  | `devDependencies` | `"@testing-library/react": "^16.0.0"` | RESEARCH §Standard Stack |
  | `devDependencies` | `"@testing-library/jest-dom": "^6.4.0"` | RESEARCH §Standard Stack + Pitfall 4 |
  | `scripts` (optional) | `"check:fresh-green": "bash scripts/check-fresh-green.sh"` | RESEARCH §7.2 line 1354 (recommended for ergonomic parity) |

- **Pre-write verification protocol:** RESEARCH §Standard Stack lines 144-150 mandates `npm view jsdom version`, `npm view @testing-library/react version`, `npm view @testing-library/jest-dom version` to lock exact published versions at plan-phase time.

---

### `tsconfig.json`

- **Current state:** 35 lines. The `include` array (lines 26-33) already covers `**/*.ts` + `**/*.tsx` + `**/*.mts`.
- **Phase 4 change:** **NO CHANGE REQUIRED.** `vitest.setup.ts` is a `.ts` file at repo root; the existing `**/*.ts` glob covers it. `vitest.config.ts` is already covered. Vitest globals types come from `'@testing-library/jest-dom/vitest'` import in `vitest.setup.ts` and Vitest's own type augmentation — no `types` field in `compilerOptions` required.

- **If a planner finds a type-resolution issue at execution time:** add `"types": ["vitest/globals"]` to `compilerOptions` — but this is a fallback, not a confirmed need.

---

## Section 3: New Patterns Phase 4 Introduces

These are patterns that have NO in-repo analog and Phase 4 establishes for Phases 5-8 to inherit. Plans should call these out explicitly.

### Pattern G' (extending Phase 3): `'use client'` directive on the smallest scope possible

- **Source file (after Phase 4):** `components/shell/TopStrip.tsx`, `components/primitives/ActionCard.tsx` (only when `onClick` is provided)
- **Rule:** Mark a file `'use client'` only when it directly uses a client-only hook (`usePathname`, `useState`, `useEffect`, etc.) or accepts an event handler prop that requires browser-side execution. Server components rendering client children is fully supported.
- **Anti-pattern (Pitfall 3):** Adding `'use client'` to a route-group layout to enable a small interactive child. Don't.
- **Apply to:** Phase 5+ when interactive primitives or screens are added.

### Pattern H' (component-driven styling — D-89 strategy (c))

- **UI-SPEC OD-1 recommendation:** Component-prop-driven styling with no shared class names. Each primitive owns its style; consumers don't write Tailwind for typography idioms.
- **Source file (after Phase 4):** All 8 primitives in `components/primitives/`
- **Rule:** Primitives map their props to Tailwind utility class strings via local `Record<EnumKey, string>` lookups. Consumers compose primitives, not className strings. SHELL-05 grep targets primitive component files only — most granular surface.
- **Apply to:** Phase 5+ AI surfaces. Maintain the closed-enum-prop discipline; widening a prop to `string` breaks the SHELL-05 enforcement model.

### Pattern I' (named SVG dictionary — Icon component)

- **Source file (after Phase 4):** `components/primitives/Icon.tsx`
- **Rule:** Single `<Icon>` component with a closed `IconName` string union, mapping name → inline SVG content. NO `children` slot, NO `path` prop. Adding an icon is a deliberate code change reviewed in PR.
- **Apply to:** Phase 5+ icons extend the union additively in their PR. Promote icon-set growth to a separate library only if the union exceeds ~80 names.

### Pattern J' (env-var feature gate at module evaluation)

- **Source file (after Phase 4):** `components/shell/ModeSwitcher.tsx` reads `process.env.NEXT_PUBLIC_SHOW_MODE_SWITCHER`
- **Rule:** `NEXT_PUBLIC_*` env vars are inlined at build time. Read once at module evaluation; `if (process.env.X !== 'true') return null`. Aligns with `lib/api.ts:87` `process.env.NEXT_PUBLIC_USE_MOCK === 'false'` pattern.
- **Apply to:** Phase 5+ feature gates (preview-only screens, etc.).

### Pattern K' (allowlist-as-policy file)

- **Source file (after Phase 4):** `.freshgreen-allowlist` at repo root
- **Rule:** Plain-text policy files with `#` comment header explaining the policy + cross-reference to canonical decisions. Per-line entries are repo-relative paths. Widening requires PR review = visible in git history.
- **Apply to:** Future "you opted into the exception" rule sets (e.g., a hypothetical `.darkmode-allowlist` if dark mode is ever enabled per-surface).

### Pattern L' (bash CI script)

- **Source file (after Phase 4):** `scripts/check-fresh-green.sh`
- **Rule:** Shell scripts that walk source files use `git ls-files | grep -E '\.(ts|tsx|css|js|jsx)$'` rather than `find` — restricts to tracked sources, skips ignored dirs natively. `set -euo pipefail` for strict mode. Output violations to stderr. Exit code drives CI status.
- **Apply to:** Future CI guardrails (e.g., a hypothetical "no inline `style={{ }}` outside primitives" check).

### Pattern M' (4th top-level CI job)

- **Source file (after Phase 4):** `.github/workflows/ci.yml`
- **Rule:** Phase 2 PATTERNS Pattern D established the third-job pattern. Phase 4 extends to a fourth (`fresh-green`). New CI jobs are top-level, never matrix steps. Each becomes one required status check on `main`.
- **Apply to:** Phase 5+ CI additions (e.g., bundle-size budget check, accessibility audit).

### Pattern N' (Vitest jsdom environment + jest-dom matchers)

- **Source files (after Phase 4):** `vitest.config.ts` + `vitest.setup.ts`
- **Rule:** `environment: 'jsdom'` for the whole test suite (Phase 3's `node`-only Vitest tests run unchanged at +<100ms). `setupFiles: ['./vitest.setup.ts']` registers `@testing-library/jest-dom/vitest` matchers globally for `expect(...).toHaveClass(...)` etc.
- **Apply to:** Phase 5+ component tests inherit this baseline. `.tsx` test files use `import { render, screen } from '@testing-library/react'`.

---

## Section 4: Tooling Baseline Confirmed

Verified as-of 2026-04-26 by reading `package.json`, `vitest.config.ts`, `tsconfig.json`, `.github/workflows/ci.yml`:

| Tool | Version (from `package.json`) | Status | Notes for Phase 4 |
|------|------------------------------|--------|--------------------|
| Next.js | `16.2.4` | installed | matches D-01 (Next.js 16.2 LTS); RESEARCH §Standard Stack |
| React / React DOM | `19.2.4` | installed | RESEARCH §Standard Stack; D-31 + RESEARCH §Pattern 1 RSC + `'use client'` boundary correct |
| TypeScript | `^5` | installed | tsconfig `strict: true` + `noUncheckedIndexedAccess: true` (verified `tsconfig.json:7-8`) — D-05 |
| Tailwind | `^4` (`tailwindcss` + `@tailwindcss/postcss`) | installed | Phase 2 D-03; Phase 4 D-89 strategy decision applies on top |
| ESLint | `^9` + `eslint-config-next 16.2.4` + `eslint-config-prettier ^10.1.8` | installed | D-07, flat config (verified `eslint.config.mjs`) |
| Prettier | `^3.8.3` | installed | D-07; config: 100-col, single quotes, no semis (verified `.prettierrc`) |
| Vitest | `^4.1.5` | installed | D-61; current config `environment: 'node'` `include: ['**/*.test.ts']` `globals: false` (verified `vitest.config.ts`) — Phase 4 modifies all three |
| `vite-tsconfig-paths` | `^6.1.1` | installed | enables `@/*` import alias in Vitest (D-38, Phase 3 wired) |
| Node | `>=24.0.0 <25.0.0` (engines) | pinned | D-02; `.nvmrc` contains `24` |
| npm | repo-locked | installed | D-06 |
| CI runner | Ubuntu latest | active | RESEARCH §7.1 line 1274 — bash universally available |

**Phase 4 additive devDeps to install (verified availability via npm registry per RESEARCH §Standard Stack):**

| Package | Recommended version | Purpose |
|---------|---------------------|---------|
| `jsdom` | `^25.0.0` | DOM simulation for Vitest |
| `@testing-library/react` | `^16.0.0` | React component test utilities (React 19-compatible line) |
| `@testing-library/jest-dom` | `^6.4.0` | DOM matchers (`toHaveClass`, `toBeInTheDocument`) |

Plan-phase MUST re-verify exact published versions via `npm view {pkg} version` at task-write time per RESEARCH §Standard Stack lines 144-150.

---

## Metadata

**Analog search scope:** `/Users/wyekitgoh/Projects/SMBCorigins/` excluding `.git/`, `.planning/`, `.next/`, `docs/`, `node_modules/`, `tsconfig.tsbuildinfo`, `package-lock.json`.

**Files scanned (read in full):**
- `app/layout.tsx` (50 lines)
- `app/globals.css` (73 lines)
- `app/page.tsx` (163 lines)
- `app/(client)/journey/page.tsx` (23 lines)
- `app/(rm)/cockpit/page.tsx` (22 lines)
- `lib/stages.ts` (23 lines)
- `lib/api.ts` (108 lines)
- `lib/api.real.ts` (32 lines)
- `lib/api.mock.ts` (545 lines)
- `lib/stages.test.ts` (124 lines)
- `lib/api.mock.test.ts` (head ~120 lines — sufficient for header/idiom)
- `data/seed.ts` (head ~60 lines — sufficient for header/idiom)
- `data/seed.test.ts` (head ~100 lines)
- `vitest.config.ts` (11 lines)
- `.github/workflows/ci.yml` (49 lines)
- `tsconfig.json` (35 lines)
- `package.json` (30 lines)
- `.gitignore`, `.prettierrc`, `eslint.config.mjs`
- `types/origin.ts` (head 80 lines)

**Files scanned (skimmed):** RESEARCH.md §5 (lines 868-1202), §6 (1203-1262), §7 (1264-1354), §8 (1356-1411). UI-SPEC.md (full). Phase 2 PATTERNS.md (full). Phase 2 + Phase 3 CONTEXT.md (full).

**Pattern extraction date:** 2026-04-26
**Greenfield surfaces:** `components/`, `scripts/`, `.freshgreen-allowlist`, `vitest.setup.ts`, `'use client'` directive, `.tsx` tests, bash CI scripts — all first instance in repo.

---

## PATTERN MAPPING COMPLETE
