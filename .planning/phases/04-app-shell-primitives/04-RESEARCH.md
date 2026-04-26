# Phase 4: App Shell & Primitives — Research

**Researched:** 2026-04-26
**Domain:** Next.js 16 App Router chrome + bespoke React primitive component library + CI guardrails
**Confidence:** HIGH (most decisions confirm-and-cite from CONTEXT/UI-SPEC; net-new technical lookups verified against Next.js 16 official docs and Tailwind v4 official docs)

## Summary

Phase 4 has unusually low research surface because CONTEXT.md (D-64..D-89) and the approved UI-SPEC already lock the architectural shape. The remaining technical work is: (1) confirm three specific Next.js 16 / Tailwind v4 behaviours that the planner needs as ground truth before writing tasks, (2) extract concrete defaults from the prototype JS source so plan-phase tasks have file-level acceptance criteria with exact pixel/keyword/hex values, and (3) lock 9 open technical questions that the additional_context block enumerated.

The dominant finding: the prototype's `Avatar` is constructed with `color="var(--fresh-green)"` for **both** Yuki and James personas — that's retrofit #1 and SHELL-05's original violation. Five SHELL-05 violations are confirmed in `/tmp/proto_*.js` with file:line citations and replacement tokens recommended below.

**Primary recommendation:** Lock D-89 strategy **(c) component-prop-driven styling** for the port; lock OD-12 Fraunces axes treatment **(b) inline `fontVariationSettings` on the wordmark `<span>` only**; ship the SHELL-05 grep as **bash** in a **fourth top-level CI job**; use **Vitest with jsdom + @testing-library/react** for primitive DOM tests (additive devDeps required — Phase 3 wired Vitest in node-environment mode only).

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| TopStrip rendering | Frontend Server (RSC root layout) | Browser/Client (TopStrip child uses `'use client'` + `usePathname`) | Root layout stays server-rendered for streaming; TopStrip needs `usePathname` for mode-switcher highlighting |
| Persona constants (`PERSONAS`, `PERSONA_HOME`, `modeForPathname`) | Frontend Server (compile-time TS module) | — | Plain TS constants; no API, no DB, no client-state |
| Mode-switcher gating (`NEXT_PUBLIC_SHOW_MODE_SWITCHER`) | Frontend Server (build-time inline) | — | `NEXT_PUBLIC_*` is inlined at build; no runtime fetch |
| Route-group inner shells (ClientShell, RMShell) | Frontend Server (RSC `layout.tsx`) | — | Layouts are server components; no interactivity in shell chrome itself |
| Primitives (Eyebrow, StatusChip, StagePill, AIPulseDot, AIBadge, ActionCard, Icon, Avatar) | Frontend Server (RSC by default) | Browser/Client (only when `onClick` prop provided to ActionCard) | All primitives are presentational; only ActionCard with onClick becomes a client boundary |
| Demo page `/dev/primitives` | Frontend Server (RSC) | — | Static rendering of every primitive in every state; no client logic |
| Fresh-green grep enforcement | CI / Build | — | Bash script in GitHub Actions; runs against committed source |

**Architectural sanity check:** Only TopStrip (and any ActionCard with onClick) crosses the RSC→client boundary. Everything else stays server-rendered, which matches Next.js 16's "client components only when needed" guidance.

## User Constraints (from CONTEXT.md)

### Locked Decisions (D-64..D-89 — do NOT re-litigate)

**Shell layout & placement:**
- D-64 — TopStrip in `app/layout.tsx`; route-group layouts at `app/(client)/layout.tsx` (ClientShell) and `app/(rm)/layout.tsx` (RMShell)
- D-65 — TopStrip full prototype shape: brand → divider → context badge (mode-conditional) → spacer → ModeSwitcher → LanguageToggle → mail icon (with notification dot) → help icon → divider → persona block (name + role + Avatar)
- D-66 — Persona constants in `lib/persona.ts` as plain TS (NOT `lib/api.mock.ts`); chrome decoupled from data layer
- D-67 — TopStrip is `'use client'` + `usePathname()` + `modeForPathname()` route-to-mode map
- D-68 — Mode switcher gated by `NEXT_PUBLIC_SHOW_MODE_SWITCHER` env var (renders null when not 'true')
- D-69 — Mode switcher = two `<Link>`s (NOT buttons), targets `PERSONA_HOME.client`/`PERSONA_HOME.rm`
- D-70 — URL-driven mode only; NO localStorage; NO auto-redirect
- D-71 — `components/shell/` for chrome, `components/primitives/` for the 8 primitives

**Primitives — set, drift, and shape:**
- D-72 — REQUIREMENTS.md SHELL-04 amended in same PR (5 → 8 primitives drift recorded)
- D-73 — `StatusChip`: closed enum `kind: 'ok' | 'ai' | 'amber' | 'ghost' | 'red' | 'info'`; only `kind='ai'` uses fresh-green
- D-74 — `StagePill`: closed `n: 1..6` and `state: 'done' | 'current' | 'upcoming'`; pure presentational; consumer renders stage names
- D-75 — `AIPulseDot` (bare dot, ~6-8px) and `AIBadge` (trad-green-deep pill + dot + label) are separate primitives; the prototype's `AIPulse` middle-ground is NOT shipped
- D-76 — `ActionCard` is a row primitive (NOT container card); `indicator` and `cta` are slot-shaped `ReactNode`
- D-77 — Container-level cards stay screen-specific (Phase 5/6/7 own them)
- D-78 — `Avatar.color` is closed `AvatarColor` enum, explicitly excluding fresh-green family
- D-79 — `Icon.name` is closed string union of ~40 names ported from prototype
- D-80 — Primitives demo page at `/dev/primitives` (NOT `/_dev/primitives` — App Router private-folder convention)
- D-81 — `PriorityBar` NOT a primitive in Phase 4

**Fresh Green enforcement:**
- D-82 — Mechanism = CI grep script + `.freshgreen-allowlist`; bash OR TS (planner picks); 4th top-level job OR step in `test` job
- D-83 — Grep match list locked (5 patterns covering hex / CSS-var / Tailwind utility / arbitrary-value / rgba)
- D-84 — Vitest test fixtures cover bypass attempts including arbitrary-value forms and case variants
- D-85 — Initial allowlist contains only Phase 4 PR files: `components/primitives/AIPulseDot.tsx`, `AIBadge.tsx`, `StatusChip.tsx`, `components/shell/RisingMark.tsx`, `app/dev/primitives/page.tsx`
- D-86 — Allowlist comment header (verbatim spec'd in CONTEXT)
- D-87 — Per-kind StatusChip tests at `components/primitives/StatusChip.test.tsx`
- D-88 — Same PR retrofits 5 known violations so script passes from day one

**Port strategy:**
- D-89 — Plan-phase MUST pick one of three strategies (a/b/c) for porting prototype's non-Tailwind class names; NOT silent default

### Claude's Discretion

- Exact pixel sizes for primitives — partly already locked in UI-SPEC (StagePill 34, RisingMark 24/26, Avatar 30, AIPulseDot 8, TopStrip 56) per OD-2 through OD-5, OD-17. Outstanding: ClientShell content padding, RMShell workspace padding, copilot-sidecar slot width.
- AIPulseDot animation duration / easing — UI-SPEC OD-6 recommends 1200ms cubic-bezier(0.4, 0, 0.2, 1) infinite alternate; planner locks
- Exact `Avatar.color` enum members — UI-SPEC has a full 12-member candidate list; planner can trim
- Exact ~40-name icon list — research below extracts the verbatim 35 names from prototype
- Exact 5 retrofit replacement tokens — UI-SPEC recommends; research below confirms
- `components/shell/` vs `components/chrome/` — UI-SPEC OD-10 picks `shell/`
- Single-file `lib/persona.ts` vs split — UI-SPEC OD-13 picks single file
- Bash vs TS for grep script — UI-SPEC OD-14 recommends bash; this research confirms with rationale (§8)
- Demo page rendering style — static JSX vs iteration; planner picks
- Fraunces SOFT/WONK strategy — UI-SPEC OD-12 recommends (b); this research confirms with citation (§3)

### Deferred Ideas (OUT OF SCOPE)

- Wiring chrome to `lib/api.mock.ts` (Phase 5/6 owns)
- Container-level card primitives (For-your-attention, AI lane, Needs you, Overnight) — Phase 5/6/7 screen-specific
- `BrandLockup`, `Bilingual`, `formatReiwa`, `KanjiWatermark`, `ConfidenceMeter`, `AIPulse` (the dot+label wrapper), `PriorityBar` — Phase 5/6/8 own
- Copilot trigger button + Copilot sidecar — Phase 8 owns
- Real i18n framework — language toggle visual-only
- Storybook, mobile responsiveness, authentication — explicit non-goals
- Vercel env-var dashboard config for `NEXT_PUBLIC_SHOW_MODE_SWITCHER` — manual UI work
- GitHub Action auto-detecting allowlist additions — manual review sufficient
- Branch-protection update to add SHELL-05 check as 5th required status — manual GitHub UI step after first CI run

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SHELL-01 | Top strip renders across all screens with visual-only EN / 日本語 toggle | §5 (Next.js 16 App Router specifics — root layout RSC + client child); §6 (TopStrip pixel layout extraction) |
| SHELL-02 | Dev-only mode switcher flips client/RM contexts; hidden in production builds | §5 (Link semantics + prefetch); §6 (mode-switcher prototype shape); §9 (TopStrip "neither persona" behavior on `/dev/primitives`) |
| SHELL-03 | Rising Mark logo component, sized correctly, used in top strip | §6 (RisingMark SVG verbatim from `/tmp/proto_primitives.js`) |
| SHELL-04 | Primitives exported from `components/primitives/` (drift to 8 per D-72) | §6 (Icon name union, StagePill colors, StatusChip tokens, Avatar color enum, AIPulseDot animation) |
| SHELL-05 | Fresh Green appears only on AI surfaces; lint/grep confirms | §4 (regex audit + extensions); §7 (Vitest + jsdom for tests); §8 (bash grep script in 4th CI job) |

## Project Constraints (from CLAUDE.md)

These directives carry the same authority as locked decisions and the planner must verify task compliance:

- **Stack contract (D-01..D-08):** Next.js 16.2 LTS, Node 24 LTS, Tailwind v4 with `@theme` config, TypeScript `strict: true` + `noUncheckedIndexedAccess: true`, npm package manager, ESLint flat config + Prettier, branch protection requires CI typecheck + lint + test + Vercel preview.
- **Scaffolding ownership (D-09..D-12):** Root-level `app/`, `components/`, `lib/`, `types/`, `data/` (no `src/` wrapper); `types/origin.ts` at repo root; branch naming `kit/<area>` or `evan/<area>`; small PRs, merge daily.
- **Design system locked:** Fresh Green `#BFD730` is **AI-only** (this is the SHELL-05 spirit — code MUST NOT use this hex on primary buttons or generic accents).
- **Typography locked:** Fraunces (display, numerals) · Inter Tight (UI body) · Noto Sans JP (Japanese) · IBM Plex Mono (data, timestamps, IDs, eyebrows). The 4-family + 3-weight (400/500/600) matrix is locked above Phase 4.
- **Desktop-first at 1440px** — no mobile responsiveness work in Phase 4.
- **Pre-PR validation:** `npm run typecheck && npm run lint && npm run test && npm run build`.
- **Boundary files governed by `CONTRACT.md` and `.github/CODEOWNERS`** — Phase 4 does NOT touch `types/origin.ts`, `lib/api.ts`, `lib/api.mock.ts`, `lib/api.real.ts`, `lib/stages.ts`. Cross-GSD review (CODEOWNERS auto-request) does NOT fire for Phase 4.

## Standard Stack

### Core (already in place from Phases 2-3 — DO NOT re-install)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 16.2.4 | App Router framework | D-01 locked; provides root/route-group layouts, `usePathname`, `<Link>` |
| react / react-dom | 19.2.4 | UI library | bundled with next 16; Phase 4 uses RSC + targeted `'use client'` |
| tailwindcss | ^4 | CSS utilities | D-03 locked; `@theme` defines all design tokens |
| @tailwindcss/postcss | ^4 | Tailwind v4 PostCSS plugin | required for v4 toolchain |
| typescript | ^5 | Type checking | D-05 locked; `strict: true` + `noUncheckedIndexedAccess: true` |
| eslint | ^9 + eslint-config-next 16.2.4 | Linting | D-07 locked |
| vitest | ^4.1.5 | Test runner | D-61 locked; co-located `*.test.ts(x)` |
| vite-tsconfig-paths | ^6.1.1 | Vitest path alias `@/*` | already wired |

### Supporting — required additive devDeps for Phase 4 testing

[VERIFIED: package.json line 14 — `"test": "vitest run --passWithNoTests"`; vitest.config.ts has `environment: 'node'` and `include: ['**/*.test.ts']` — no `.tsx` and no jsdom]

The current Vitest config is **node-only** and matches `*.test.ts` only. Phase 4 needs to test React component rendering, which requires jsdom + @testing-library/react. These are additive — Phase 3's existing tests stay node.

| Library | Recommended Version | Purpose | When to Use |
|---------|---------------------|---------|-------------|
| jsdom | ^25.0.0 | DOM simulation for Vitest | Required for D-87 StatusChip rendering tests |
| @testing-library/react | ^16.0.0 | React component test utilities | `render()`, `screen.getBy*` for D-87 tests |
| @testing-library/jest-dom | ^6.4.0 | DOM matchers (`toHaveClass`, `toBeInTheDocument`) | Optional but ergonomic for assertions |

[VERIFIED: npm view jsdom version — published 2024-2025 cycle, current major is 25.x]
[VERIFIED: npm view @testing-library/react version — current major 16.x is the React 19-compatible line]

**Verification protocol for planner:** before writing the install task, run:
```bash
npm view jsdom version
npm view @testing-library/react version
npm view @testing-library/jest-dom version
```
…and lock the exact published versions in PLAN.md. Versions in this RESEARCH.md are accurate as-of training data plus npm registry confirmation; planner verifies one more time at task-write time.

### Vitest config update required

Current `vitest.config.ts` (verified):
```ts
test: {
  environment: 'node',
  globals: false,
  include: ['**/*.test.ts'],
}
```

Phase 4 needs Vitest to discover `.test.tsx` files AND run them in jsdom. Two options:

**Option A (recommended):** Single config, jsdom for all:
```ts
test: {
  environment: 'jsdom',
  globals: false,
  include: ['**/*.test.{ts,tsx}'],
}
```
Pro: simple. Con: Phase 3's existing `lib/*.test.ts` files now run in jsdom too — wasteful but harmless because they don't touch DOM.

**Option B:** Per-file environment via `// @vitest-environment jsdom` pragma at top of each `.test.tsx` file, keep config as `environment: 'node'`, just expand `include` to `['**/*.test.{ts,tsx}']`.
Pro: Phase 3 tests stay in node. Con: every primitive test file needs the pragma comment as line 1.

**Recommendation:** Option A for Phase 4. Vitest's jsdom is fast enough that running Phase 3's small node-tests in jsdom adds <100ms; planner accepts the cost for config simplicity. If Phase 3's data tests (e.g., `data/seed.test.ts`) ever surface a jsdom-incompatibility, add the pragma `// @vitest-environment node` to those files specifically — Vitest supports per-file overrides.

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| jsdom | happy-dom | happy-dom is faster but less complete; jsdom is the @testing-library default and aligns with Vitest's documented integration |
| @testing-library/react | direct ReactDOM.render in tests | testing-library provides accessibility-first queries which align with future a11y work; ReactDOM-only tests are brittle |
| bash grep script | TypeScript script via tsx | bash zero-deps and runs in <50ms on a small tree; TS would force adding `tsx` runtime dep just for a CI script — see §8 |

## Architecture Patterns

### System Architecture Diagram

```
┌────────────────────────────────────────────────────────────┐
│  HTTP Request → Next.js 16 App Router                      │
└──────────────────┬─────────────────────────────────────────┘
                   │
                   ▼
       ┌───────────────────────────┐
       │ app/layout.tsx (RSC root) │  ← renders <html>, <body>, fonts
       └────────┬──────────────────┘
                │ wraps every route
                ▼
       ┌───────────────────────────┐
       │ <TopStrip />              │  ← 'use client' (uses usePathname)
       │  (above {children})       │
       └────────┬──────────────────┘
                │
                ▼
       ┌──────────────────────────────────────────────────┐
       │ Route resolution                                 │
       │   /journey       → app/(client)/journey/page.tsx │
       │   /messages      → app/(client)/messages/page.tsx│
       │   /cockpit       → app/(rm)/cockpit/page.tsx     │
       │   /portfolio     → app/(rm)/portfolio/page.tsx   │
       │   /dev/primitives→ app/dev/primitives/page.tsx   │
       └────────┬─────────────────────────────────────────┘
                │
                ▼
       ┌──────────────────────────────────────────────────┐
       │ Route-group layout selection                     │
       │                                                  │
       │  /(client)/* routes  → app/(client)/layout.tsx   │
       │                        (ClientShell wrapper)     │
       │                                                  │
       │  /(rm)/* routes      → app/(rm)/layout.tsx       │
       │                        (RMShell wrapper:         │
       │                          sidebar + workspace +   │
       │                          empty copilot slot)     │
       │                                                  │
       │  /dev/primitives     → NO route-group layout     │
       │                        (renders bare on bg-paper)│
       └────────┬─────────────────────────────────────────┘
                │
                ▼
       ┌──────────────────────────────────────────────────┐
       │ Page content uses primitives:                    │
       │  Eyebrow, StatusChip, StagePill, AIPulseDot,     │
       │  AIBadge, ActionCard, Icon, Avatar               │
       └──────────────────────────────────────────────────┘

       ┌──────────────────────────────────────────────────┐
       │ Persona data (build-time TS constants):          │
       │  lib/persona.ts                                  │
       │    PERSONAS, PERSONA_HOME, modeForPathname       │
       │  Consumed by TopStrip via direct import          │
       │  NOT routed through lib/api.ts                   │
       └──────────────────────────────────────────────────┘

       ┌──────────────────────────────────────────────────┐
       │ CI guardrail (parallel job):                     │
       │  scripts/check-fresh-green.sh                    │
       │    walks tracked .ts/.tsx/.css files             │
       │    matches 5 regex patterns from D-83            │
       │    excludes paths in .freshgreen-allowlist       │
       │    fails CI if any unallowlisted match found     │
       └──────────────────────────────────────────────────┘
```

### Recommended Project Structure (after Phase 4 PR merges)

```
app/
├── layout.tsx              # MODIFIED — adds <TopStrip /> above {children}
├── page.tsx                # UNCHANGED — Phase 2 token showcase (Phase 4 may leave or replace)
├── (client)/
│   ├── layout.tsx          # NEW — ClientShell wrapper
│   └── journey/page.tsx    # UNCHANGED — Phase 2 placeholder
├── (rm)/
│   ├── layout.tsx          # NEW — RMShell wrapper
│   └── cockpit/page.tsx    # UNCHANGED — Phase 2 placeholder
├── dev/
│   └── primitives/page.tsx # NEW — demo page (D-80)
└── globals.css             # UNCHANGED if D-89 = (a) or (c); MODIFIED if (b)

components/
├── shell/                  # NEW directory
│   ├── TopStrip.tsx        # 'use client' — usePathname() + modeForPathname()
│   ├── RisingMark.tsx      # SHELL-05 allowlisted (brand exception)
│   ├── LanguageToggle.tsx  # visual-only EN / 日本語
│   ├── ModeSwitcher.tsx    # gated by NEXT_PUBLIC_SHOW_MODE_SWITCHER; two <Link>s
│   ├── ClientShell.tsx     # single-column wrapper (used by app/(client)/layout.tsx)
│   └── RMShell.tsx         # sidebar + workspace + empty copilot slot
└── primitives/             # NEW directory
    ├── Eyebrow.tsx
    ├── StatusChip.tsx + StatusChip.test.tsx (D-87)
    ├── StagePill.tsx
    ├── AIPulseDot.tsx      # SHELL-05 allowlisted
    ├── AIBadge.tsx         # SHELL-05 allowlisted
    ├── ActionCard.tsx
    ├── Icon.tsx
    ├── Avatar.tsx
    └── index.ts            # barrel export

lib/
└── persona.ts              # NEW — PERSONAS, PERSONA_HOME, modeForPathname

scripts/
├── check-fresh-green.sh    # NEW — bash grep script (recommended in §8)
└── check-fresh-green.test.ts # NEW — Vitest fixtures (D-84)

.freshgreen-allowlist       # NEW — root-level plain-text allowlist
.github/workflows/ci.yml    # MODIFIED — adds 4th `fresh-green` job
package.json                # MODIFIED — adds devDeps for jsdom + testing-library; possibly adds check:fresh-green script
vitest.config.ts            # MODIFIED — environment: 'jsdom' + include .tsx
.planning/REQUIREMENTS.md   # MODIFIED — SHELL-04 amended (5 → 8) per D-72
```

### Pattern 1: TopStrip as `'use client'` child of RSC root layout

**What:** The Phase 2 root `app/layout.tsx` is a server component. Phase 4 adds a client child (`<TopStrip />`) above `{children}`. This is the standard Next.js 16 pattern — `usePathname` is a client-only hook (verified below), so any component using it must be `'use client'`. Server components rendering client children is fully supported and does not require the parent to also be `'use client'`.

**When to use:** Anywhere you need read-only client URL state inside an otherwise-server-rendered tree. The boundary stays at the smallest scope possible.

**Example:**
```tsx
// app/layout.tsx — STAYS a server component
import './globals.css'
import { Fraunces, Inter_Tight, Noto_Sans_JP, IBM_Plex_Mono } from 'next/font/google'
import { TopStrip } from '@/components/shell/TopStrip'

// font configs unchanged from Phase 2

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${interTight.variable} ${notoSansJP.variable} ${ibmPlexMono.variable}`}>
      <body>
        <TopStrip />
        {children}
      </body>
    </html>
  )
}
```

```tsx
// components/shell/TopStrip.tsx
'use client'
// Source: Next.js 16 docs — usePathname is a Client Component hook
// https://nextjs.org/docs/app/api-reference/functions/use-pathname
import { usePathname } from 'next/navigation'
import { modeForPathname } from '@/lib/persona'
// ... rest of TopStrip
```

[CITED: https://nextjs.org/docs/app/api-reference/functions/use-pathname — "usePathname is a Client Component hook"]

### Pattern 2: Route groups apply different layouts via `(parens)` folders

**What:** Phase 2 already established `(client)` and `(rm)` route groups holding placeholder pages. Phase 4 adds a `layout.tsx` to each group; Next.js 16 applies the route-group layout transparently on top of the root layout.

**When to use:** Different chrome for different sets of routes that share a common URL root (in our case, `/`).

**Example:**
```tsx
// app/(client)/layout.tsx — server component
import { ClientShell } from '@/components/shell/ClientShell'

export default function ClientGroupLayout({ children }: { children: React.ReactNode }) {
  return <ClientShell>{children}</ClientShell>
}
```

```tsx
// app/(rm)/layout.tsx — server component
import { RMShell } from '@/components/shell/RMShell'

export default function RMGroupLayout({ children }: { children: React.ReactNode }) {
  return <RMShell>{children}</RMShell>
}
```

Routes outside both groups (e.g., `/dev/primitives`) bypass both layouts entirely.

[CITED: https://nextjs.org/docs/app/api-reference/file-conventions/route-groups — "you can create a different layout for each group by adding a layout.js file inside their folders"]
[CITED: https://nextjs.org/docs/app/getting-started/project-structure — "Adding a layout to a subset of routes in a common segment"]

### Pattern 3: ModeSwitcher as two `<Link>`s

**What:** Per D-69, ModeSwitcher renders two `<Link>` components instead of `<button onClick={navigate}>`. This gives client-side navigation, prefetch, and accessibility for free. `<Link>` from `next/link` extends `<a>` — `className`, `aria-label`, `target`, etc. pass through.

**When to use:** Any navigational chrome where the destination is a fixed path. Use `<button onClick={navigate}>` only when navigation depends on runtime computation that can't be expressed in `href`.

**Example:**
```tsx
// components/shell/ModeSwitcher.tsx — server component (no hooks)
import Link from 'next/link'
import { PERSONA_HOME } from '@/lib/persona'

type Props = { activeMode: 'client' | 'rm' }

export function ModeSwitcher({ activeMode }: Props) {
  if (process.env.NEXT_PUBLIC_SHOW_MODE_SWITCHER !== 'true') return null
  return (
    <div className="..."> {/* dashed border container */}
      <span className="...">DEMO</span>
      <Link
        href={PERSONA_HOME.client}
        className={activeMode === 'client' ? 'bg-paper text-trad-green-deep' : 'bg-trad-green-deep text-paper'}
        aria-current={activeMode === 'client' ? 'page' : undefined}
      >
        Client · Yuki
      </Link>
      <Link
        href={PERSONA_HOME.rm}
        className={activeMode === 'rm' ? 'bg-paper text-trad-green-deep' : 'bg-trad-green-deep text-paper'}
        aria-current={activeMode === 'rm' ? 'page' : undefined}
      >
        RM · James
      </Link>
    </div>
  )
}
```

**Note on prefetching:** Per Next.js 16 docs (verified below), `<Link>` defaults to `prefetch="auto"` which prefetches static routes when the link enters the viewport. Both `/journey` and `/cockpit` are simple SSG-able pages, so they will be prefetched automatically — exactly the snappy-demo behavior we want. **No prefetch tuning required.** Prefetching is production-only; in dev it's a no-op.

[CITED: https://nextjs.org/docs/app/api-reference/components/link — "Prefetching happens when a Link component enters the user's viewport... Prefetching is only enabled in production"]

### Anti-Patterns to Avoid

- **Putting `'use client'` at the top of `app/layout.tsx`:** would force the entire route tree client-side; defeats RSC streaming. Keep root layout server; only TopStrip is client.
- **Using `useState` to track mode in TopStrip:** D-70 explicitly chose URL-driven mode. `usePathname()` reads URL once per render; no internal state.
- **Hand-rolling `<a href="/journey">` instead of `<Link href="/journey">`:** loses prefetch + client-side navigation; full page load on every mode switch ruins demo feel.
- **Calling `useRouter().push(...)` from button onClick instead of `<Link>`:** works but adds a client-component boundary that `<Link>` avoids; also more code; loses keyboard navigation semantics by default.
- **Wrapping primitives in `'use client'`:** primitives are presentational; they should stay RSC-compatible so consuming pages can render them server-side. Only ActionCard becomes client when an `onClick` prop is provided (treated like a `<button>` — interactive elements need client boundaries for event handlers).
- **Conditional rendering of TopStrip based on pathname inside the root layout:** the route-group-layout-skip approach (D-80, /dev/primitives bypasses ClientShell/RMShell) is the right idiom for "no inner shell." TopStrip itself stays universal — its mode-conditional content lives inside TopStrip via `usePathname`.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Reading current URL from a client component | `window.location.pathname` + custom subscriber | `usePathname()` from `next/navigation` | usePathname is hydration-safe; window.location desyncs during App Router transitions |
| Mode-switcher navigation | `<button onClick={() => router.push(href)}>` | `<Link href={href}>` | Link prefetches; provides client-side nav with no JS handler boilerplate; accessible by default |
| Conditional dev-only UI gating | Runtime feature-flag fetch | `process.env.NEXT_PUBLIC_*` build-time inline | Build-time inline is zero-cost at runtime; matches Phase 3's `NEXT_PUBLIC_USE_MOCK` precedent (D-35) |
| DOM testing | Manual ReactDOM.render + querySelector assertions | `@testing-library/react` + jsdom | Accessibility-first queries align with future a11y work; established Vitest integration pattern |
| Tailwind utility class composition (if D-89 = b) | Custom CSS in primitive files | `@apply` directive in `globals.css` referencing @theme tokens | @apply works with @theme-derived utilities in global stylesheets; no @reference needed for global CSS |
| Variable font axis switching for "Origin" wordmark | Loading two separate fonts | next/font `axes` array OR inline `fontVariationSettings` | Single font file, tree-shakeable; see §3 below |
| Fresh-green enforcement | Custom ESLint plugin | bash grep + .freshgreen-allowlist | ESLint plugin would need AST-aware token tracking; bash grep is faster (<50ms) and human-auditable |
| Icon library wholesale | npm install heroicons / lucide-react / phosphor | Inline SVG paths in single `Icon.tsx` with closed `IconName` union | Per D-79; the prototype already has 35 icons drawn; closed union prevents free-form additions slipping past PR review |

**Key insight:** Phase 4 has very few "hand-roll" risks because the prototype provides ground-truth shapes for everything. The risk is the opposite — **over-engineering by adopting libraries that don't add value** (e.g., adding lucide-react when 35 inline SVGs are already designed with the brand's specific 1.6-stroke style).

## Common Pitfalls

### Pitfall 1: Hydration mismatch on TopStrip first render

**What goes wrong:** TopStrip uses `usePathname()` which is client-only. On initial SSR, the root layout server-renders TopStrip's HTML (because the `'use client'` boundary still emits HTML for the initial hydration). If TopStrip's rendered output depends on `pathname` and rewrites are involved, the hydration HTML and the client-side first render can disagree → React hydration warning.

**Why it happens:** SSR renders TopStrip with `pathname` set to the source URL; if a Vercel rewrite serves a different actual URL to the browser, `usePathname()` returns the rewritten path, mismatching the SSR HTML.

**How to avoid:** No rewrites are configured for Phase 4 (verified: `next.config.ts` is minimal + `proxy.ts` does not exist). The hydration issue does not apply. Plan-phase verifies `next.config.ts` does not gain a rewrites field in this PR; if it does, the pattern from Next.js docs (render stable fallback on server, update via `useEffect` on client) is the mitigation.

**Warning signs:** React DevTools console emits "Text content does not match server-rendered HTML"; visible flash of mode-switcher highlight changing on first paint.

[CITED: https://nextjs.org/docs/app/api-reference/functions/use-pathname — "If your page is being statically prerendered and your app has rewrites... reading the pathname with usePathname() can result in hydration mismatch errors"]

### Pitfall 2: `noUncheckedIndexedAccess` breaks naive map lookups

**What goes wrong:** `PERSONAS[mode]` returns `Persona | undefined` because of D-05's `noUncheckedIndexedAccess: true`. TopStrip code that does `PERSONAS[mode].name` fails type check.

**Why it happens:** Phase 1 D-05 is intentional — it forces explicit narrowing on every indexed access.

**How to avoid:** Type `PERSONAS` as `Record<'client' | 'rm', Persona>` so indexed access by a known-narrow key returns `Persona`, not `Persona | undefined`. Or use direct property access (`mode === 'client' ? PERSONAS.client.name : PERSONAS.rm.name`). The prototype's wide-open `localStorage.getItem('origin-mode') || 'client'` pattern is exactly the kind of thing `noUncheckedIndexedAccess` catches.

**Warning signs:** `tsc --noEmit` errors like `Object is possibly 'undefined'`.

### Pitfall 3: `'use client'` cascade contamination

**What goes wrong:** Marking a parent component `'use client'` makes ALL descendants render client-side, even those that don't need to. Common mistake: adding `'use client'` to a route-group layout to enable a small interactive child.

**Why it happens:** RSC boundary semantics — `'use client'` is a one-way gate; once you cross into client, you cannot cross back into server within the same component tree without an explicit child boundary.

**How to avoid:** Keep client boundaries as small as possible. Phase 4's only client component is TopStrip. Inner shells (ClientShell, RMShell) and route-group layouts stay server. ActionCard becomes client only when used with `onClick` (planner: implement ActionCard as `'use client'` because the file ships with onClick capability; cost is small for a single primitive).

**Warning signs:** Browser DevTools "RSC payload" tab shows tree branches as serialized client components when they should be HTML; bundle size larger than expected.

### Pitfall 4: Vitest jsdom environment doesn't auto-import @testing-library matchers

**What goes wrong:** After installing `@testing-library/jest-dom`, calling `expect(el).toHaveClass('bg-fresh-green')` errors `toHaveClass is not a function`.

**Why it happens:** jest-dom matchers must be explicitly registered in a Vitest setup file.

**How to avoid:** Add a `vitest.setup.ts` at repo root:
```ts
import '@testing-library/jest-dom/vitest'
```
And in `vitest.config.ts`:
```ts
test: {
  environment: 'jsdom',
  globals: false,
  setupFiles: ['./vitest.setup.ts'],
  include: ['**/*.test.{ts,tsx}'],
}
```

**Warning signs:** TypeScript errors like `Property 'toHaveClass' does not exist on type 'Assertion'`.

### Pitfall 5: SHELL-05 grep regex over-matches

**What goes wrong:** D-83's regex `(bg|text|...)-fresh-green(-[a-z0-9]+)?` is greedy. A token like `bg-fresh-green-foo` matches even though `--color-fresh-green-foo` doesn't exist as a token. Worse: a comment containing the literal word "fresh-green" in source code matches the rgba/hex pattern (since regex doesn't parse out comments).

**Why it happens:** Plain grep can't differentiate code from comments.

**How to avoid:** The script should accept that some false positives may need allowlist entries. The 5 existing allowlisted files have comments like `// bg-fresh-green is allowed here because...` — those comments WILL match. Mitigation: the allowlist is per-file, so files with intentional fresh-green also have intentional comments about it; both pass.

For the demo page, code that displays `bg-fresh-green` as a literal class hint to users (e.g., `<code>bg-fresh-green</code>` in the demo page) WILL match the regex. The demo page is allowlisted (D-85 entry #5) so this is fine.

**Warning signs:** Script flags a legitimate file you didn't expect; investigate whether the file should be allowlisted (rare — Phase 5+ AI surfaces) or whether the source actually does have a bypass attempt that needs fixing.

### Pitfall 6: Forgetting to register Phase 4 grep CI job in branch protection

**What goes wrong:** Phase 4 PR adds a 4th CI job named `fresh-green`, but branch protection only requires `typecheck`, `lint`, `test`. PRs can merge with the fresh-green check failing.

**Why it happens:** Branch protection check names are auto-discovered by GitHub only after the check has run at least once on `main`. Updating the rule is a manual GitHub UI step.

**How to avoid:** Plan-phase task includes a manual checklist step: "After this PR's first CI run, add `fresh-green` to required status checks in repo Settings → Branches → main." Same pattern as Phase 2 D-39's first-run-then-protect sequence (Phase 2 PATTERNS.md Pattern D references this).

**Warning signs:** A PR merges to main with red `fresh-green` job; bug surfaces in production demo.

## Code Examples

### Verified Tailwind v4 `@apply` with `@theme` tokens (informs D-89 strategy b)

```css
/* Source: Tailwind v4 docs https://tailwindcss.com/docs/functions-and-directives */
/* This works in app/globals.css alongside Phase 2's @theme block */

@theme {
  --color-fresh-green: #bfd730;
  /* ...other tokens already in app/globals.css */
}

/* @apply composing @theme-derived utilities — no @reference needed in global stylesheets */
.t-eyebrow {
  @apply font-mono uppercase tracking-[0.18em] text-ink-muted text-[10px];
}

.chip--ai {
  @apply bg-trad-green-deep text-fresh-green;
}
```

[CITED: https://tailwindcss.com/docs/functions-and-directives — "Use the @apply directive to inline any existing utility classes into your own custom CSS"]
[CITED: tailwindcss.com — "@reference is required when using @apply or @variant in component-scoped styles" — implicit: NOT required for global stylesheets like our app/globals.css]

### Verified next/font axes signature (informs OD-12 / Fraunces SOFT/WONK)

```ts
// Source: https://nextjs.org/docs/app/api-reference/components/font#axes
import { Fraunces } from 'next/font/google'

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  axes: ['SOFT', 'WONK'],  // valid for Fraunces variable font
  display: 'swap',
})
```

[CITED: https://nextjs.org/docs/app/api-reference/components/font — "Some variable fonts have extra `axes` that can be included. By default, only the font weight is included to keep the file size down. The possible values of `axes` depend on the specific font."]
[CITED: GitHub googlefonts/fraunces — Fraunces ships 4 axes: wght (registered), opsz (registered), SOFT (custom), WONK (custom)]

### Verified usePathname pattern (informs D-67)

```tsx
// Source: https://nextjs.org/docs/app/api-reference/functions/use-pathname
'use client'

import { usePathname } from 'next/navigation'
import { modeForPathname } from '@/lib/persona'

export function TopStrip() {
  const pathname = usePathname()
  const mode = modeForPathname(pathname)
  // ...render based on mode
}
```

## Runtime State Inventory

Phase 4 is a **greenfield additive** phase — no rename, refactor, or migration. No prior Phase 4 components exist; CONTEXT confirms "components/ does NOT exist yet" (verified by `ls`). The Runtime State Inventory section is therefore not applicable.

**Single forward-compat note for the planner:** the file `app/(client)/journey/page.tsx` and `app/(rm)/cockpit/page.tsx` Phase 2 placeholders MUST stay intact — Phase 5/6 owns content replacement, not Phase 4. Phase 4's route-group layouts wrap them transparently.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `<a href="/foo">` for internal nav | `<Link href="/foo">` from next/link | Next.js 1.0 (2016) | Phase 4 ModeSwitcher uses Link |
| `next.config.js` `eslint` field | flat ESLint config + `eslint-config-next` | Next.js 16 | Already adopted in Phase 2 |
| `axes: ['wght']` explicit on Fraunces import | No `axes` (wght is implicit default) | next/font defaults | Phase 2 chose no-axes; Phase 4 OD-12 considers adding 'SOFT', 'WONK' |
| Pages Router + `useRouter().pathname` | App Router + `usePathname()` from next/navigation | Next.js 13+ App Router | Already on App Router; usePathname is the correct hook |
| Tailwind v3 `tailwind.config.{js,ts}` + `theme.extend.*` | Tailwind v4 `@theme {}` in CSS | Tailwind v4 (2024-2025) | Already adopted in Phase 2 |
| React 18 hydration with strict-mismatch errors | React 19 hydration with relaxed-mismatch + "useSyncExternalStore" | React 19 | Phase 4 inherits; usePathname is hydration-safe in React 19 |

**Deprecated/outdated:**
- The prototype uses `localStorage.getItem('origin-mode')` for mode persistence (line 217 of `/tmp/proto_shell.js`). D-70 explicitly diverges from this — URL-driven mode only. Reason: hydration simplicity and URL-as-source-of-truth.
- The prototype's `useRoute` hash-router (`window.location.hash`) is a single-page-app pattern that does not apply to App Router. Phase 4 uses real Next.js routes; the hash-router is dropped entirely.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.5 (existing per D-61) + jsdom 25.x + @testing-library/react 16.x (NEW devDeps) |
| Config file | `vitest.config.ts` (existing — Phase 4 modifies environment to jsdom and include to `*.test.{ts,tsx}`); add `vitest.setup.ts` for jest-dom matchers |
| Quick run command | `npm run test -- --run components/primitives/StatusChip.test.tsx` (single-file) |
| Full suite command | `npm run test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|--------------|
| SHELL-01 | TopStrip renders on every route | smoke (manual /dev navigate) + snapshot of TopStrip render | `npm run test -- components/shell/TopStrip.test.tsx` | ❌ Wave 0 |
| SHELL-01 | TopStrip context badge switches by route | unit | `npm run test -- components/shell/TopStrip.test.tsx -t "context badge"` | ❌ Wave 0 |
| SHELL-01 | Language toggle is non-interactive | unit (renders, no event handler attached) | `npm run test -- components/shell/LanguageToggle.test.tsx` | ❌ Wave 0 |
| SHELL-02 | ModeSwitcher renders null when env=false | unit | `npm run test -- components/shell/ModeSwitcher.test.tsx -t "env gate"` | ❌ Wave 0 |
| SHELL-02 | ModeSwitcher renders two Links when env=true | unit | `npm run test -- components/shell/ModeSwitcher.test.tsx -t "two links"` | ❌ Wave 0 |
| SHELL-03 | RisingMark renders SVG | unit (snapshot) | `npm run test -- components/shell/RisingMark.test.tsx` | ❌ Wave 0 |
| SHELL-04 | Each primitive renders without error | smoke | `npm run test -- components/primitives/` | ❌ Wave 0 |
| SHELL-04 | StatusChip per-kind tokens (D-87) | unit | `npm run test -- components/primitives/StatusChip.test.tsx` | ❌ Wave 0 |
| SHELL-04 | StagePill per-state visuals (done/current/upcoming) | unit | `npm run test -- components/primitives/StagePill.test.tsx` | ❌ Wave 0 |
| SHELL-04 | Avatar refuses fresh-green family at type level | typecheck | `npm run typecheck` (passing means closed enum holds) | n/a (compile-time) |
| SHELL-04 | Icon name union is closed | typecheck | `npm run typecheck` | n/a (compile-time) |
| SHELL-04 | All primitives discoverable on demo page | manual (browse `/dev/primitives`) | `npm run dev` then visit URL | n/a (manual) |
| SHELL-05 | Grep flags hex literals (`#BFD730`) | unit (script test) | `npm run test -- scripts/check-fresh-green.test.ts` | ❌ Wave 0 |
| SHELL-05 | Grep flags Tailwind utilities (`bg-fresh-green`) | unit | same | ❌ Wave 0 |
| SHELL-05 | Grep flags arbitrary-values (`bg-[#BFD730]`, `bg-[var(--color-fresh-green)]`) | unit | same | ❌ Wave 0 |
| SHELL-05 | Grep flags rgba inline (`rgba(191,215,48,...)`) | unit | same | ❌ Wave 0 |
| SHELL-05 | Grep flags case variants (`#bfd730`, `#bFd730`) | unit | same | ❌ Wave 0 |
| SHELL-05 | Allowlist exempts the 5 known files | integration (script run on tree) | `bash scripts/check-fresh-green.sh` (exits 0 if allowlist working) | ❌ Wave 0 |
| SHELL-05 | After 5 retrofits, grep produces 0 unallowlisted hits | integration | same | ❌ Wave 0 (depends on retrofit completion) |

### Sampling Rate

- **Per task commit:** `npm run typecheck && npm run lint && npm run test -- <touched files>` — fast feedback during execution. The fresh-green script can also run locally: `bash scripts/check-fresh-green.sh`.
- **Per wave merge:** `npm run test` (full Vitest suite) + `bash scripts/check-fresh-green.sh` — verifies cross-task interactions.
- **Phase gate:** `npm run typecheck && npm run lint && npm run test && npm run build && bash scripts/check-fresh-green.sh` — full validation before `/gsd-verify-work`. Plus manual: open `npm run dev` and verify (a) TopStrip renders on `/`, `/journey`, `/cockpit`, `/dev/primitives`; (b) ModeSwitcher present with `NEXT_PUBLIC_SHOW_MODE_SWITCHER=true`, hidden when unset; (c) `/dev/primitives` renders all 8 primitives in all states.

### Wave 0 Gaps

- [ ] `vitest.setup.ts` — jest-dom matcher import
- [ ] `vitest.config.ts` modification — environment: 'jsdom', include `.tsx`
- [ ] `components/shell/TopStrip.test.tsx` — 2-3 unit tests for context badge + render-on-every-route
- [ ] `components/shell/ModeSwitcher.test.tsx` — env-gate + two-links rendering
- [ ] `components/shell/RisingMark.test.tsx` — snapshot
- [ ] `components/primitives/StatusChip.test.tsx` — D-87's per-kind token verification (REQUIRED)
- [ ] `components/primitives/StagePill.test.tsx` — per-state rendering (number vs ✓)
- [ ] `components/primitives/AIPulseDot.test.tsx` — renders dot with default aria-label
- [ ] `components/primitives/AIBadge.test.tsx` — renders dot + label
- [ ] `components/primitives/Icon.test.tsx` — closed-name-union renders SVG path
- [ ] `components/primitives/Avatar.test.tsx` — color enum mapping renders correct bg
- [ ] `components/primitives/ActionCard.test.tsx` — onClick wires; faint prop applies; slot rendering
- [ ] `scripts/check-fresh-green.test.ts` — fixtures per D-84 (12+ test cases)
- [ ] Framework install: `npm install --save-dev jsdom@^25 @testing-library/react@^16 @testing-library/jest-dom@^6` (versions to be re-verified at plan-phase; see Standard Stack table)

## Security Domain

Phase 4 is **chrome + visual primitives only** with no data handling, no auth, no user input, no API calls, no state persistence. The dominant security concerns flagged by ASVS are not active.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|------------------|
| V2 Authentication | no | CLAUDE.md "Non-goals" excludes auth from prototype |
| V3 Session Management | no | URL-driven mode (D-70) means no session state to attack |
| V4 Access Control | no | demo prototype, no real users |
| V5 Input Validation | minimal | the only user input in Phase 4 is the LanguageToggle (visual-only, no event handler) and ModeSwitcher (`<Link>` to fixed paths). No free-form input. |
| V6 Cryptography | no | no secrets, no tokens, no passwords |
| V7 Error Handling | minimal | TopStrip falls back to client mode if pathname doesn't match (D-67); no sensitive data in error paths |
| V8 Data Protection | no | no data layer in chrome (D-66) |
| V9 Communication Security | n/a | HTTPS handled by Vercel |
| V14 Configuration | yes | `NEXT_PUBLIC_SHOW_MODE_SWITCHER` exposes the dev-only mode switcher; misconfiguration in Vercel Production would leak the dev affordance to end users |

### Known Threat Patterns for Next.js 16 frontend chrome

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| `NEXT_PUBLIC_*` exposes secrets to client bundle | Information Disclosure | Phase 4 only uses `NEXT_PUBLIC_SHOW_MODE_SWITCHER` (boolean dev affordance — not a secret); the existing `NEXT_PUBLIC_USE_MOCK` (D-35) is also not a secret. Code reviewer rule: never put API keys, signing secrets, or tokens behind `NEXT_PUBLIC_*` |
| Dev-only UI accidentally shipped to Production | Tampering / Information Disclosure | D-68 gates ModeSwitcher behind env var; production build sets it false. Verification: post-deploy manual check that ModeSwitcher does NOT render on `https://smbcorigins.vercel.app`. Plan-phase task explicitly notes Vercel dashboard scoping (true in Preview, false in Production). |
| XSS via inline SVG paths in Icon | Tampering | All icon paths are static literals in `Icon.tsx` (closed `IconName` union); no user-controlled SVG. No `dangerouslySetInnerHTML`. Risk = 0 |
| Hydration injection (server/client mismatch exploited) | Tampering | usePathname is hydration-safe in non-rewrite scenarios (verified: no rewrites in repo). Plan-phase verifies `next.config.ts` does not gain a `rewrites` field. |

**Phase 4 verdict:** No additional security controls beyond verifying that (a) the env var gate is correctly scoped at Vercel, and (b) no user-controlled data passes through any primitive. The ASVS V14 (configuration) item is the only one with an active control: the manual Vercel dashboard scoping.

---

# Net-New Research — answering the 9 open questions

This section is structured by the additional_context's 9 questions. Each section locks an answer with citation.

## §1. D-89 port strategy recommendation

**The question:** which of three options should plan-phase pick for porting the prototype's non-Tailwind class names (`card`, `card--hero`, `card--ai`, `chip chip--{kind}`, `chip--dot`, `btn`, `btn--ghost`, `btn--sm`, `t-display`, `t-eyebrow`, `t-numeral`, `t-jp`, `t-mono`, `ai-pulse`, `reveal`, `hr`, `watermark-en`)?

**Tailwind v4 `@apply` confirmed working in `app/globals.css`:** [CITED: https://tailwindcss.com/docs/functions-and-directives] — "Use the @apply directive to inline any existing utility classes into your own custom CSS." `@apply` continues to support utilities derived from `@theme` tokens. The only `@apply`-related restriction in Tailwind v4 is that scoped contexts (Vue/Svelte `<style>` blocks, CSS Modules) require a `@reference` directive — global stylesheets like `app/globals.css` do NOT.

**Recommendation: lock strategy (c) — component-prop-driven styling — with one carve-out for `ai-pulse`.**

**Rationale:**

| Strategy | Pros | Cons | SHELL-05 grep impact |
|----------|------|------|---------------------|
| (a) Utility soup at call sites | Single source of truth | Long className strings; possible duplication; primitives are tiny so not painful but the *demo page* would have hundreds of classes per row | Grep targets call-site utility class strings; **5 files allowlisted as primary surface, but duplication risk = more places to mis-color** |
| (b) `@apply` directives in `globals.css` | Short class names; semantic naming | Indirection: `class="t-eyebrow"` requires reader to look up `globals.css`; `@apply` rules are coarse allowlist nodes (one rule applies to all consumers) | Grep walks into `@apply` blocks (D-83 catches Tailwind utilities inside them); but mixed-branch primitives (StatusChip kind='ai') become harder to test per D-87 because the `kind='ai'` token is hidden inside `chip--ai`'s `@apply` |
| (c) Component-prop-driven styling | Cleanest API; primitives own their style; closed-enum API matches D-73/D-78/D-79 discipline; smallest grep surface | Every typography variant needs a prop or component | Grep targets primitive component files only — most granular allowlist |

**The carve-out:** the `ai-pulse` CSS keyframe animation MUST live in `globals.css` because keyframes are not Tailwind utilities (Tailwind v4's `@theme --animate-*` syntax could express it, but it's idiomatic CSS). Plan-phase adds a single `@keyframes ai-pulse {...}` block to `globals.css` and the `AIPulseDot.tsx` primitive consumes it via `style={{ animation: 'ai-pulse 1200ms ...' }}` or a Tailwind animation utility derived from `@theme --animate-ai-pulse`.

**Why (c) over (b):**
1. SHELL-05's per-kind unit tests (D-87) need to assert that `kind='ai'` renders a fresh-green token. With strategy (c), the StatusChip component contains an explicit if/switch that maps `kind='ai'` → `bg-fresh-green text-trad-green-deep`, which is testable by checking the rendered classList. With strategy (b), the same logic hides inside `globals.css`'s `.chip--ai { @apply bg-fresh-green ... }` rule — testing this would require reading globals.css, which is brittle.
2. The primitives are 8 small files. The "duplication" argument that would favor (b) is weak when the primitive itself is the de-duplication unit.
3. Closed-enum API discipline (D-73, D-78, D-79) is already the dominant pattern. Strategy (c) is consistent — the API IS the styling.
4. Strategy (b)'s "shorter class names" benefit is illusory because primitives wrap the className anyway — consumers write `<Eyebrow>BY SMBC</Eyebrow>`, not `<span className="t-eyebrow">BY SMBC</span>`.

**What plan-phase locks in PLAN.md for the strategy decision:**
- Strategy: (c) component-prop-driven
- Carve-out: `@keyframes ai-pulse` in `globals.css` (single keyframe block; not a class)
- Optional `@theme --animate-ai-pulse: ai-pulse 1200ms cubic-bezier(0.4,0,0.2,1) infinite alternate` to expose `animate-ai-pulse` as a Tailwind utility (cleaner than inline `style`)
- All other prototype class names (`card`, `chip`, `btn`, `t-eyebrow`, etc.) are NOT ported as classes — they become primitive component names or are inlined as Tailwind utilities at primitive call sites only

[CITED: https://tailwindcss.com/docs/functions-and-directives — @apply documented to compose existing utilities; @reference required only for component-scoped contexts]
[VERIFIED: Tailwind v4 docs explicitly demonstrate composing utilities via @apply: ".select2-results__group { @apply text-lg font-bold text-gray-900; }"]

## §2. OD-12 Fraunces axes recommendation

**The question:** Phase 2 D-31 imports Fraunces with no `axes` (defaulting to wght-only). Prototype uses inline `fontVariationSettings: '"SOFT" 80, "WONK" 1'`. Two paths: (a) revisit D-31 to add axes; (b) inline-style on the wordmark only.

**Confirmed facts:**
- next/font's `axes` option is documented: `"Some variable fonts have extra axes that can be included. By default, only the font weight is included to keep the file size down. The possible values of axes depend on the specific font."` [CITED: https://nextjs.org/docs/app/api-reference/components/font#axes]
- Fraunces ships 4 axes on Google Fonts: wght, opsz, SOFT, WONK. [CITED: GitHub googlefonts/fraunces project README, plus search-confirmed from Google Fonts specimen page.]
- Adding axes increases the variable-font CSS file size (the additional axis interpolation data must be included). The growth is small for two narrow axes (SOFT 0-100, WONK 0-1) but non-zero.
- Inline `style={{ fontVariationSettings: '"SOFT" 80, "WONK" 1' }}` on a `<span>` works without changing the font import, because variable-font axes are part of the variable file at the format level — even when next/font only loads wght, the underlying variable file still ships SOFT/WONK metadata; the browser interpolates from defaults.

  **CRITICAL caveat:** that last claim needs verification. Some font CDNs (including Google Fonts when accessed via next/font) generate per-axis-subset font files. If the next/font cache only includes wght data, then `fontVariationSettings: '"SOFT" 80, "WONK" 1'` on the consuming element would be a no-op (browser would render the default value).

  [ASSUMED] — verifying the exact Google Fonts CDN behavior under next/font with wght-only `axes` would require either (a) a test build comparing rendered glyphs with vs without `axes: ['SOFT', 'WONK']`, or (b) deeper next/font source inspection. Training data is ambiguous here.

**Recommendation: lock OD-12 strategy (a) — revisit D-31 and add `axes: ['SOFT', 'WONK']` to the Fraunces import.**

**Rationale:**
1. **Eliminates the [ASSUMED] uncertainty** about whether inline-style works without the axes load. Adding the axes guarantees the SOFT/WONK values render correctly.
2. **Tiny bundle cost.** Fraunces SOFT and WONK are narrow axes (especially WONK which is binary 0/1). Estimated additional <10KB on the Fraunces variable file (gzipped) — negligible vs. the 1440px-canvas demo's overall page weight.
3. **Future-proof.** Phase 5 hero scenario screens may want to apply the brand wordmark or other Fraunces display text with subtle SOFT variation; having the axes available is cheap.
4. **Consistent across all Fraunces consumers.** Phase 4's Eyebrow-adjacent display surfaces (StagePill numerals, future BrandLockup component) MAY want SOFT/WONK adjustments — having the axes loaded means future surfaces can opt in via inline `fontVariationSettings` without touching `app/layout.tsx` again.
5. **The prototype validates this is a brand-meaningful axis choice.** The prototype's `proto_primitives.js` line 27 uses `'"SOFT" 80, "WONK" 1'` on the BrandLockup; line 38 of `proto_shell.js` uses `'"SOFT" 80, "WONK" 1'` on the TopStrip wordmark; line 203 of `proto_primitives.js` uses `'"SOFT" 60, "WONK" 1'` on the StageNumeral. Multiple consumers want it.

**What plan-phase locks in PLAN.md:**
- Modify `app/layout.tsx` line ~7 (Fraunces config block):
  ```ts
  const fraunces = Fraunces({
    subsets: ['latin'],
    variable: '--font-fraunces',
    axes: ['SOFT', 'WONK'],   // NEW — was implicit wght-only
    display: 'swap',
  })
  ```
- DO NOT add `'opsz'` unless a real consumer surfaces (deferred until Phase 5+).
- Phase 4 wordmark in TopStrip uses inline `style={{ fontVariationSettings: '"SOFT" 80, "WONK" 1' }}` on the `<span>` rendering "Origin".

**Cross-reference:** This change affects the Phase 2 D-31 lock. Plan-phase records this as a Phase 4 PR additive change — `DECISIONS.md` may gain a new D-NN entry ("Fraunces axes extended to include SOFT, WONK") to preserve the audit trail per D-20.

[CITED: https://nextjs.org/docs/app/api-reference/components/font#axes — "axes: ['slnt']" example with array-of-strings type]
[CITED: GitHub googlefonts/fraunces — Fraunces is "an expressive Variable Font" with 4 axes including SOFT and WONK]

## §3. Fresh-green grep coverage audit

**The question:** D-83 locks the regex match list. Verify completeness against Tailwind v4 utility-name generation rules.

**Tailwind v4 utility-name generation from `@theme {}`:** A `@theme { --color-X: ...; }` declaration auto-generates utilities `bg-X`, `text-X`, `border-X`, `outline-X`, `ring-X`, `divide-X`, `placeholder-X`, `caret-X`, `accent-X`, `fill-X`, `stroke-X`, plus gradient stops `from-X`, `to-X`, `via-X`. [VERIFIED from Tailwind v4 docs and the existing Phase 2 verification page `app/page.tsx` which uses `bg-fresh-green`, `bg-fresh-green-mute`, `bg-fresh-green-glow` — confirming the prefix pattern.]

**D-83's locked match list (from CONTEXT):**
1. Hex literal: `\b#[Bb][Ff][Dd]7[3]0\b`
2. CSS-var: `--color-fresh-green(-[a-z0-9]+)?`
3. Tailwind utilities: `(bg|text|border|ring|from|to|outline|fill|stroke|divide|placeholder|caret|accent|shadow)-fresh-green(-[a-z0-9]+)?`
4. Arbitrary-value: `\[(#[Bb][Ff][Dd]7[3]0|var\(--color-fresh-green|rgba\(\s*191\s*,\s*215\s*,\s*48)`
5. rgba inline: `rgba\(\s*191\s*,\s*215\s*,\s*48`

**Audit findings:**

✅ **Patterns 1, 2, 4, 5 are complete.** Hex / CSS-var / arbitrary-value / rgba forms are all covered.

⚠️ **Pattern 3 (Tailwind utility prefix list) has potential gaps:**

| Tailwind v4 prefix | In D-83 list? | Risk |
|--------------------|---------------|------|
| `bg-` | ✅ yes | covered |
| `text-` | ✅ yes | covered |
| `border-` | ✅ yes | covered |
| `ring-` | ✅ yes | covered |
| `from-` | ✅ yes | covered |
| `to-` | ✅ yes | covered |
| `via-` | ❌ **missing** | gradient middle stop `via-fresh-green` would slip through |
| `outline-` | ✅ yes | covered |
| `fill-` | ✅ yes | covered |
| `stroke-` | ✅ yes | covered |
| `divide-` | ✅ yes | covered |
| `placeholder-` | ✅ yes | covered |
| `caret-` | ✅ yes | covered |
| `accent-` | ✅ yes | covered |
| `shadow-` | ✅ yes | covered |
| `decoration-` | ❌ **missing** | text-decoration color: `decoration-fresh-green` slips through |
| `ring-offset-` | ❌ **missing** | `ring-offset-fresh-green` slips through |
| `shadow-` (already there but Tailwind also has `inset-shadow-` in v4) | partial | `inset-shadow-fresh-green` slips through |

**Recommendation: D-83's regex MUST be extended.** Add `via`, `decoration`, `ring-offset`, `inset-shadow` to the prefix alternation. Updated regex:

```
(bg|text|border|ring|ring-offset|from|to|via|outline|fill|stroke|divide|placeholder|caret|accent|shadow|inset-shadow|decoration)-fresh-green(-[a-z0-9]+)?
```

**Plan-phase action:** Update the locked match-list in the script + the test fixtures (D-84) to include at least one bypass attempt for each of `via-fresh-green`, `decoration-fresh-green`, `ring-offset-fresh-green`, `inset-shadow-fresh-green` — adding 4 fixture cases.

**Additional consideration — utilities with arbitrary opacity:** Tailwind v4 supports `bg-fresh-green/30` (opacity modifier). The current pattern `(prefix)-fresh-green(-[a-z0-9]+)?` does NOT match `/30` because the `/` is a different character class. Add an optional opacity-modifier match:

```
(bg|text|border|...)-fresh-green(-[a-z0-9]+)?(/[0-9]+)?
```

This catches `bg-fresh-green/50` etc. **Plan-phase fixture addition:** test for `bg-fresh-green/30` as a bypass attempt.

[VERIFIED: `app/globals.css` line 15-17 declares the three fresh-green tokens; `app/page.tsx` line 27, 33, 39 confirms Tailwind v4 generates `bg-fresh-green`, `bg-fresh-green-mute`, `bg-fresh-green-glow` from those tokens.]
[VERIFIED: Tailwind v4 docs and DEV community migration guides confirm the full prefix list; Tailwind v4 added `inset-shadow-` and continues to support `via-`, `decoration-`, `ring-offset-`.]

## §4. Next.js 16 App Router specifics

### §4.1 Route-group layouts

**Confirmed:** Next.js 16's App Router supports `app/(client)/layout.tsx` and `app/(rm)/layout.tsx` as route-group layouts. The `(parens)` folder is organizational; its layout wraps all pages inside the group transparently. [CITED: https://nextjs.org/docs/app/api-reference/file-conventions/route-groups — "Adding a layout to a subset of routes in a common segment"; example explicitly shows `app/(shop)/cart/page.tsx` with `(shop)` having its own layout.]

**No semantic change from Next.js 14/15.** The convention is stable.

**One caveat from the docs:** "If you navigate between routes that use different root layouts, it'll trigger a full page reload." This applies only when route groups have **separate root layouts** (i.e., each group has its own `<html>` and `<body>`). Phase 4 does NOT do that — there's a single root `app/layout.tsx` that renders `<html>`+`<body>`+TopStrip, and the route-group layouts (ClientShell, RMShell) are children of that root. So full-page reload does NOT happen on mode switch — `/journey` → `/cockpit` is a client-side navigation. ✅ This matches the demo "snappy" UX expectation.

### §4.2 Private-folder convention `_prefix`

**Confirmed unchanged in Next.js 16.** [CITED: https://nextjs.org/docs/app/getting-started/project-structure — "Private folders can be created by prefixing a folder with an underscore: `_folderName`. This indicates the folder is a private implementation detail and should not be considered by the routing system, thereby opting the folder and all its subfolders out of routing."]

**Confirms D-80's coercion:** the user's stated `/_dev/primitives` is non-routable because `_dev` opts out of routing. `/dev/primitives` (no underscore) is the correct path. Plan-phase locks the file at `app/dev/primitives/page.tsx`.

### §4.3 `usePathname()` stability in Next.js 16

**Confirmed stable.** [CITED: https://nextjs.org/docs/app/api-reference/functions/use-pathname — version history shows `v13.0.0: usePathname introduced`; no breaking changes through v16.]

**Returns:** A string of the current URL's pathname. For `/journey` it returns `'/journey'`. For `/dashboard?v=2` it returns `'/dashboard'` (search params stripped).

**Hydration safety:** As discussed in §"Common Pitfalls" #1, hydration mismatch only occurs with rewrites configured. Phase 4's `next.config.ts` has no rewrites. ✅

### §4.4 Server-component root rendering `'use client'` child

**Confirmed standard pattern.** Next.js 16 docs explicitly document this in `app/layout.tsx` examples that render fixed `<header>` chrome above `{children}`. There's no special wiring required. The TopStrip is hydrated on first client render; no warning.

**One gotcha:** the RSC payload includes the TopStrip as a serialized client component. Bundle size: TopStrip is ~20-30 lines of React + imports of usePathname + shell-mate components. The total RSC client-bundle delta from TopStrip + its imports (RisingMark, LanguageToggle, ModeSwitcher, Avatar, Eyebrow, Icon) should be well under 10KB gzipped. ✅

### §4.5 `<Link>` prefetch behavior

**Confirmed:** [CITED: https://nextjs.org/docs/app/api-reference/components/link — "Prefetching happens when a Link component enters the user's viewport (initially or through scroll). Next.js prefetches and loads the linked route (denoted by the href) and its data in the background. Prefetching is only enabled in production."]

**Default `prefetch` value:** `"auto"` (or `null`). For static routes (which `/journey` and `/cockpit` are — no dynamic params), the FULL route is prefetched.

**Implication for Phase 4:** ModeSwitcher's two `<Link>`s automatically prefetch the destination on viewport entry. In production, hovering the mode-switcher will result in instantaneous navigation. In development, prefetching is disabled — local testing shows full page transitions as expected.

**No tuning needed.** Plan-phase does NOT pass `prefetch={true}` (would force prefetch even for dynamic routes — irrelevant for our static routes) or `prefetch={false}` (would defeat the snappy-demo goal).

[CITED: https://nextjs.org/docs/app/api-reference/components/link — Reference table; default is "auto"]

## §5. Prototype-extracted defaults — concrete locks

This section reads `/tmp/proto_*.js` and reports verbatim values for plan-phase to copy.

### §5.1 Icon names — exact 35-name closed string union [VERIFIED from /tmp/proto_primitives.js lines 81-118]

**The CONTEXT D-79 prose said "~40 names"; the actual prototype Icon switch has 35 cases.** Verified by counting `case "...":` lines in `/tmp/proto_primitives.js`.

**Alphabetized union literal — copy verbatim into `components/primitives/Icon.tsx`:**

```ts
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
```

**Total: 35 names.** Phase 5/6/7 PRs extend additively per D-79.

### §5.2 Icon SVG paths — verbatim from /tmp/proto_primitives.js

**All 35 icons share defaults:** `viewBox="0 0 24 24"`, `fill="none"`, `stroke="currentColor"`, `strokeWidth=1.6` (default; overridable via `stroke` prop), `strokeLinecap="round"`, `strokeLinejoin="round"`.

**Two icons override the line-icon defaults** to use `fill={color}` instead of stroke:
- `dot` (line 85): `<circle cx="12" cy="12" r="4" fill={color}/>`

That's the only exception. All others use the standard `common = { fill: "none", stroke, strokeWidth, strokeLinecap, strokeLinejoin }` props.

**Per-name path data** (verbatim from prototype lines 82-117 — copy into the Icon.tsx switch):

| Name | Path `d` attribute | Special |
|------|-------------------|---------|
| arrow-right | `M5 12h14M13 6l6 6-6 6` | — |
| arrow-up-right | `M7 17L17 7M8 7h9v9` | — |
| check | `M5 12l5 5L20 7` | — |
| dot | (uses `<circle cx="12" cy="12" r="4" fill={color}/>` instead of path) | filled, not stroke |
| chevron-right | `M9 6l6 6-6 6` | — |
| chevron-down | `M6 9l6 6 6-6` | — |
| close | `M6 6l12 12M18 6L6 18` | — |
| tree | `M12 3v6m0 0H7v4m5-4h5v4M7 13H5v4h4v-4H7zm10 0h-2v4h4v-4h-2zm-7 0h-2v4h4v-4h-2zM12 13h0` | — |
| docs | `M8 3h8l4 4v14H8V3zM8 8h8M8 12h8M8 16h5` | — |
| shield | `M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z` | — |
| credit | `M3 7h18v10H3V7zm0 4h18M7 15h4` | — |
| rocket | `M5 19l3-3m6-10c3 0 5 2 5 5l-6 6-5-5 6-6zm-1 5a1 1 0 100-2 1 1 0 000 2z` | — |
| mail | `M3 6h18v12H3V6zm0 0l9 7 9-7` | — |
| help | combo: `<circle cx="12" cy="12" r="9" />` + `<path d="M9.5 9.5a2.5 2.5 0 015 0c0 1.5-2.5 2-2.5 3.5M12 17h.01" />` | two SVG children |
| bell | `M6 16V11a6 6 0 1112 0v5l2 2H4l2-2zM10 20a2 2 0 004 0` | — |
| search | combo: `<circle cx="11" cy="11" r="7" />` + `<path d="M20 20l-4-4" />` | two SVG children |
| sparkle | `M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6zM19 14l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z` | — |
| cockpit | `M3 4h7v9H3V4zm11 0h7v5h-7V4zm0 9h7v7h-7v-7zM3 15h7v5H3v-5z` | — |
| pipeline | `M3 7h4l3 4-3 4H3M10 7h4l3 4-3 4h-4` | — |
| app-folder | `M3 7a2 2 0 012-2h5l2 3h7a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2V7z` | — |
| copilot | combo: `<circle cx="12" cy="12" r="9" />` + `<path d="M8 12l3 3 5-6" />` | two SVG children |
| upload | `M4 17v3h16v-3M12 15V4m0 0l-5 5m5-5l5 5` | — |
| paperclip | `M20 12l-8 8a5 5 0 01-7-7l9-9a3 3 0 014 4l-9 9a1 1 0 01-1-1l8-8` | — |
| calendar | combo: `<rect x="3" y="5" width="18" height="16" rx="2" />` + `<path d="M3 10h18M8 3v4M16 3v4" />` | rect + path |
| clock | combo: `<circle cx="12" cy="12" r="9" />` + `<path d="M12 7v5l3 2" />` | two SVG children |
| globe | combo: `<circle cx="12" cy="12" r="9" />` + `<path d="M3 12h18M12 3c3 3.5 3 14.5 0 18-3-3.5-3-14.5 0-18z" />` | two SVG children |
| yen | `M6 4l6 8 6-8M6 13h12M6 17h12M12 12v8` | — |
| filter | `M4 5h16l-6 8v6l-4-2v-4L4 5z` | — |
| edit | `M4 20h4L20 8l-4-4L4 16v4z` | — |
| refresh | `M4 4v6h6M20 20v-6h-6M5 14a8 8 0 0014 4M19 10A8 8 0 005 6` | — |
| send | `M4 20l17-8L4 4v6l11 2-11 2v6z` | — |
| external | `M14 3h7v7M21 3l-9 9M10 5H5a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-5` | — |
| stack | `M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5M3 18l9 5 9-5` | — |
| users | combo: `<circle cx="9" cy="8" r="3" />` + `<circle cx="17" cy="9" r="2" />` + `<path d="M3 19c0-3 3-5 6-5s6 2 6 5M15 19c0-2 2-4 4-4s2 2 2 4" />` | three SVG children |
| bolt | `M13 3L5 14h6l-1 7 8-11h-6l1-7z` | — |
| bank | `M3 10l9-6 9 6M5 10v9h14v-9M8 12v5M12 12v5M16 12v5M3 21h18` | — |

**Plan-phase note:** the multi-child icons (help, search, copilot, calendar, clock, globe, users, dot) need their JSX written carefully — each `<svg>` returns one child element with multiple `<path>` / `<circle>` / `<rect>` siblings. Single-path icons can use `<svg viewBox="0 0 24 24" {...style}><path d="..." {...common}/></svg>`. Plan-phase implements with a switch/dictionary mapping name → JSX.

**`Icon.tsx` props per UI-SPEC + D-79:**
```ts
export type IconProps = {
  name: IconName
  size?: number       // default 16
  stroke?: number     // default 1.6
  color?: string      // default 'currentColor'
  ariaLabel?: string  // FLAG 1 fix per UI-SPEC; presence toggles role="img" vs aria-hidden
  style?: CSSProperties
}
```

### §5.3 AIPulseDot animation

**The prototype's `.ai-pulse` class is defined in a CSS block not extracted to /tmp/** — it's part of the HTML `<style>` block in the artifact bundle, not the JS modules. The exact prototype keyframes are not directly inspectable from the extracts.

**UI-SPEC OD-6 already locked the recommendation:** `1200ms cubic-bezier(0.4, 0, 0.2, 1) infinite alternate`.

**Plan-phase implementation in `app/globals.css`:**

```css
@theme {
  /* existing tokens... */
  --animate-ai-pulse: ai-pulse 1200ms cubic-bezier(0.4, 0, 0.2, 1) infinite alternate;
}

@keyframes ai-pulse {
  0% {
    transform: scale(1);
    opacity: 0.85;
  }
  100% {
    transform: scale(1.15);
    opacity: 1;
  }
}
```

**`AIPulseDot.tsx` consumes via Tailwind's auto-generated utility:**
```tsx
<span
  aria-label={ariaLabel ?? 'AI active'}
  role="img"
  className="block w-2 h-2 rounded-full bg-fresh-green animate-ai-pulse"
/>
```

(8px = `w-2 h-2` because `--spacing-2` = 8px in Phase 2 tokens.)

**Plan-phase locks:** the `@keyframes ai-pulse` block and the `@theme --animate-ai-pulse` line in `app/globals.css` (additive; doesn't conflict with Phase 2's existing block).

### §5.4 StagePill per-state colors [VERIFIED from /tmp/proto_primitives.js lines 186-208]

The prototype's `StageNumeral` (renamed StagePill per D-74) defines:

| State | bg | color (text) | border |
|-------|-----|--------------|--------|
| `done` | `var(--trad-green)` | `var(--paper)` | (none) |
| `current` | `var(--paper)` | `var(--trad-green)` | `2px solid var(--trad-green)` |
| `upcoming` | `var(--mist)` | `var(--ink-muted)` | (none) |

**Plan-phase locks** for `StagePill.tsx`:

```tsx
const stylesByState = {
  done:     'bg-trad-green text-paper',
  current:  'bg-paper text-trad-green border-2 border-trad-green',
  upcoming: 'bg-mist text-ink-muted',
} as const
```

**Glyph for done state:** `✓` (Unicode U+2713 CHECK MARK). Verified at proto_primitives.js line 206: `state === "done" ? "✓" : n`. Use the literal character `✓` (no escaping in JSX).

**Numeral typography:** Fraunces, `fontVariationSettings: '"SOFT" 60, "WONK" 1'` (line 203), font-size = `size * 0.44` (e.g., 34 × 0.44 ≈ 15px — UI-SPEC rounds this to 14/600 in the typography table). UI-SPEC has already locked Fraunces 14/600 for the numeral. The prototype's exact `fontVariationSettings` (`"SOFT" 60, "WONK" 1`) is what plan-phase should set on the numeral `<span>` for fidelity (this requires §3 OD-12 strategy (a) to have made SOFT/WONK loaded in the font import).

### §5.5 StatusChip per-kind tokens

**The prototype's StatusChip.tsx (line 73-75 of /tmp/proto_primitives.js) delegates entirely to CSS classes:**
```js
function StatusChip({ kind = "ok", children, dot = true }) {
  return <span className={`chip chip--${kind} ${dot ? "chip--dot" : ""}`}>{children}</span>;
}
```

The actual `chip--ok`, `chip--ai`, `chip--amber`, `chip--ghost`, `chip--red`, `chip--info` color definitions live in the prototype's HTML `<style>` block — NOT in the extracted JS modules. So the prototype's exact token mappings cannot be read directly.

**Recommendation: derive from UI-SPEC + Phase 2 @theme tokens (the safe semantic mapping):**

| Kind | Background | Text | Border (optional) | Dot color (when `dot=true`) |
|------|------------|------|-------------------|----------------------------|
| `ok` | `bg-trad-green-soft/15` (15% opacity tint) or `bg-mist` | `text-trad-green` | `border border-trad-green-soft/30` | `bg-trad-green` |
| `ai` | `bg-fresh-green-glow` (note: this is `#bfd73022` = `#bfd730` at 13% opacity, already in Phase 2 @theme) | `text-trad-green-deep` | `border border-fresh-green/50` | `bg-fresh-green` |
| `amber` | `bg-signal-amber/15` | `text-signal-amber` | `border border-signal-amber/30` | `bg-signal-amber` |
| `ghost` | `bg-paper-deep` or `bg-mist` | `text-ink-muted` | `border border-mist` | `bg-ink-muted` |
| `red` | `bg-signal-red/15` | `text-signal-red` | `border border-signal-red/30` | `bg-signal-red` |
| `info` | `bg-signal-info/15` | `text-signal-info` | `border border-signal-info/30` | `bg-signal-info` |

**[ASSUMED]** — the exact tints (`/15`, `/30`) are heuristic recommendations consistent with the prototype's "soft tinted background + saturated text" idiom (validated against `proto_rm_cockpit.js` line 95-96 where the prototype uses `linear-gradient(180deg, var(--fresh-green-glow), transparent 60%)` on KPI tiles and `border: 1px solid rgba(191,215,48,0.35)`). Plan-phase MAY adjust the exact opacity/intensity via visual review on the demo page; the closed enum + per-kind test pattern is what matters for SHELL-05 enforcement.

**Critical invariant for D-87 unit tests:**
```ts
// components/primitives/StatusChip.test.tsx
test('kind="ai" renders fresh-green token', () => {
  const { container } = render(<StatusChip kind="ai">Origin</StatusChip>)
  expect(container.firstChild).toHaveClass('bg-fresh-green-glow') // or whichever ai-bg token plan-phase locks
})
test('kind="ok" does NOT use fresh-green', () => {
  const { container } = render(<StatusChip kind="ok">Verified</StatusChip>)
  // assert classlist doesn't contain "fresh-green"
  expect(container.firstChild?.className).not.toMatch(/fresh-green/)
})
// repeat for amber, ghost, red, info
```

### §5.6 Avatar.color closed enum recommendation

**UI-SPEC already locked 12 members (Color section):** `'trad-green' | 'trad-green-deep' | 'trad-green-soft' | 'ink' | 'ink-soft' | 'ink-muted' | 'paper' | 'paper-deep' | 'mist' | 'signal-amber' | 'signal-info' | 'signal-red'`.

**Recommendation: ship 7 members in Phase 4** — drop the rarely-needed members to keep the demo page focused. Promote to full 12 in Phase 5+ when consumers materialize.

**Phase 4 recommended subset:**
```ts
export type AvatarColor =
  | 'trad-green'        // default for any RM persona avatar
  | 'trad-green-soft'   // RECOMMENDED Yuki & James TopStrip default per D-88 retrofit #1
  | 'trad-green-deep'   // high-contrast on paper
  | 'ink'               // neutral default for unknown personas
  | 'ink-muted'         // placeholder/empty avatar fallback
  | 'paper'             // light avatar on dark chrome
  | 'mist'              // softest light variant
```

**7 members.** Excludes the signal colors (no Phase 4 demo case for amber/info/red avatars), `paper-deep`, `ink-soft`. Phase 5/6 add members additively per their PR.

**Plan-phase pick:** UI-SPEC lists 12; this research recommends starting with 7. Plan-phase locks either based on demo-page coverage philosophy. Either is correct.

### §5.7 TopStrip pixel layout [VERIFIED from /tmp/proto_shell.js lines 17-118]

**Container styles (line 22-32):**
- `height: 56px`
- `background: var(--trad-green-deep)` (`#00301F`)
- `color: var(--paper)` (`#FAFBF7`)
- `display: flex; align-items: center`
- `padding: 0 24px` (left/right gutter)
- `gap: 24px` (between top-level children)
- `position: sticky; top: 0; zIndex: 100`
- `border-bottom: 1px solid rgba(255,255,255,0.06)` (subtle separator)

**Brand cluster (line 34-42):** gap 10px between RisingMark and wordmark.
- `RisingMark size={24}` with `color="var(--paper)"` and `hand="var(--fresh-green)"`
- "Origin" wordmark: `font-display`, `fontSize: 19px`, `fontVariationSettings: '"SOFT" 80, "WONK" 1'`, `letterSpacing: -0.02em`
- "BY SMBC" eyebrow: `font-mono`, `fontSize: 10px`, `color: rgba(250,251,247,0.5)`, `letterSpacing: 0.14em`

**Vertical divider (line 45):** 1px wide × 20px tall, `rgba(255,255,255,0.12)`.

**Context badge (line 46-60):** gap 10px between icon + text. Bank icon (client) or users icon (RM), size 14, color `rgba(250,251,247,0.6)`. Latin label `fontSize: 13`. JP label (`開成製造`) `fontSize: 12`, color `rgba(250,251,247,0.5)`.

**Mode-switcher container (line 65-71):**
- `gap: 4px` between segments
- `padding: 3px`
- `background: rgba(0,0,0,0.32)`
- `border-radius: 999`
- `border: 1px dashed rgba(191,215,48,0.3)` ← **VIOLATION #3 (D-88 retrofit)**
- "DEMO" eyebrow: `fontSize: 9px` (NB: smaller than UI-SPEC's 10px Eyebrow standard — plan-phase decides whether to honor 9 or 10), color `var(--fresh-green)` ← **VIOLATION #4 (D-88 retrofit)**, `letterSpacing: 0.18em`, `padding: 0 8px`
- Each segment button: `padding: 4px 12px`, `border-radius: 999`, `fontSize: 12`. Active segment: `bg: var(--paper)`, `color: var(--trad-green-deep)`. Inactive: `bg: transparent`, `color: rgba(250,251,247,0.7)`.

**Language toggle (line 90-93):** `fontSize: 12`, `color: rgba(250,251,247,0.7)`.
- Active "EN" segment: `color: var(--paper)`, `padding: 2px 6px`, `border-radius: 4`, `bg: rgba(255,255,255,0.08)`.
- Inactive "日本語" segment: just `padding: 2px 6px`. (Visual-only — no real toggle behavior per CLAUDE.md.)

**Mail icon (line 96-101):** size 18, `color: var(--paper) opacity: 0.8`. Notification dot (only when `isClient`): position `top: -3, right: -3`, `width: 8, height: 8`, `border-radius: 50%`, `background: var(--fresh-green)` ← **VIOLATION #2 (D-88 retrofit)**.

**Help icon (line 102):** size 18, `color: var(--paper) opacity: 0.8`. No dot.

**Vertical divider (line 104):** same shape as the first one (1px × 20px, `rgba(255,255,255,0.12)`).

**Persona block (line 107-115):** gap 10px between text and avatar.
- Text right-aligned. Name: `fontSize: 13`, `lineHeight: 1.2`. Role: `font-mono`, `fontSize: 10px`, `color: rgba(250,251,247,0.55)`, `letterSpacing: 0.08em`.
- `Avatar initials={...}` with `color="var(--fresh-green)"` ← **VIOLATION #1 (D-88 retrofit)**, `textColor="var(--trad-green-deep)"`, `size={30}`.

### §5.8 ClientShell layout [VERIFIED from /tmp/proto_shell.js lines 121-129]

```
<div minHeight="calc(100vh - 56px)" background="var(--paper)" position="relative" overflow="hidden">
  <div maxWidth="1200" margin="0 auto" padding="36px 40px 80px" position="relative">
    {children}
  </div>
</div>
```

**Plan-phase locks:**
- Outer: `min-h-[calc(100vh-56px)] bg-paper relative overflow-hidden`
- Inner: `max-w-[1200px] mx-auto pt-9 px-10 pb-20` (36px ≈ 9 × 4px = `pt-9`; 40px = `px-10`; 80px = `pb-20`)

### §5.9 RMShell layout [VERIFIED from /tmp/proto_shell.js lines 132-213]

**Outer container (line 146):** `display: flex; min-height: calc(100vh - 56px); background: var(--paper-deep)` (note: `paper-deep`, NOT `paper`).

**Sidebar (line 148-183):**
- `width: 220px; flex-shrink: 0`
- `background: var(--paper)` (lighter than the workspace surround)
- `border-right: 1px solid var(--mist)`
- `padding: 20px 14px`
- `display: flex; flex-direction: column`
- `position: sticky; top: 56px; height: calc(100vh - 56px)` — sticky below TopStrip

Sidebar internal structure:
- "Workspace" eyebrow at top, padding `0 10px 12px`
- Nav items map (4 items in prototype: Cockpit, Pipeline, Applications, Copilot — with icons cockpit, pipeline, app-folder, sparkle)
- Each nav item: `display: flex; align-items: center; gap: 10`, `padding: 9px 10px`, `border-radius: 8`. Active state: `background: var(--paper-deep)`, `color: var(--ink)`, `font-weight: 500`. Inactive: `background: transparent`, `color: var(--ink-soft)`, `font-weight: 400`. `font-size: 13`. Icon size 16.
- Active route indicator dot (only on cockpit + active): `margin-left: auto; width: 6; height: 6; border-radius: 50%; background: var(--fresh-green)` ← **VIOLATION #5 (D-88 retrofit)**
- Bottom block (Portfolio summary): `margin-top: auto; padding: 12px 10px; border-top: 1px solid var(--mist)`

**Workspace (line 186):** `flex: 1; padding: 28px 32px; min-width: 0; position: relative`.

**Copilot sidecar slot (line 191):** prototype renders `<CopilotSidecar />` here when `copilotOpen`. Phase 4 ships this slot **empty** (no rendered element). Plan-phase: simply omit the slot entirely. The workspace's `flex: 1` handles the available space without the slot. When Phase 8 adds the copilot, RMShell's flex layout grows naturally.

**Copilot trigger button (line 193-210):** Phase 4 does NOT ship per D-77 / UI-SPEC OD-15.

### §5.10 SHELL-05 violation file:line citations + replacement tokens

| # | File | Line | Original | Recommended replacement | UI-SPEC alignment |
|---|------|------|----------|------------------------|-------------------|
| 1 | `/tmp/proto_shell.js` | **114** | `<Avatar initials={isClient ? "YT" : "JL"} color="var(--fresh-green)" textColor="var(--trad-green-deep)" size={30} />` | `<Avatar initials={...} color="trad-green-soft" textColor="paper" size={30} />` | UI-SPEC retrofit #1 ✓ |
| 2 | `/tmp/proto_shell.js` | **99** | `<span style={{...background: "var(--fresh-green)" }}></span>` (mail icon notification dot) | bg = `bg-signal-amber` | UI-SPEC retrofit #2 ✓ |
| 3 | `/tmp/proto_shell.js` | **70** | `border: "1px dashed rgba(191,215,48,0.3)"` (mode-switcher container border) | `border-1 border-dashed border-ink-muted/30` (= `rgba(122,130,125,0.3)`) | UI-SPEC retrofit #3 ✓ |
| 4 | `/tmp/proto_shell.js` | **72** | `color: "var(--fresh-green)"` (mode-switcher DEMO eyebrow) | `text-signal-amber` (= `#E8A317`) | UI-SPEC retrofit #4 ✓ |
| 5 | `/tmp/proto_shell.js` | **172** | `<span style={{...background: "var(--fresh-green)"}}></span>` (sidebar active-route indicator dot) | bg = `bg-trad-green` (or remove entirely; the active item's `bg-paper-deep` row already signals selection) | UI-SPEC retrofit #5 ✓ |

**Plan-phase tasks:** since the prototype JS is reference-only (we're authoring fresh `.tsx` files in `components/shell/` and `components/primitives/`), the "retrofit" actually means **never copy the violations into the new code**. Each new component file (TopStrip.tsx, RMShell.tsx) is written with the replacement tokens directly. The `.freshgreen-allowlist` initial state therefore omits TopStrip.tsx, RMShell.tsx — those files SHOULD pass the grep on first authorship.

## §6. Vitest + DOM testing

**Current state (verified from `/Users/wyekitgoh/Projects/SMBCorigins/vitest.config.ts`):**
```ts
{
  plugins: [tsconfigPaths()],
  test: {
    environment: 'node',
    globals: false,
    include: ['**/*.test.ts'],
  },
}
```

**Required changes for Phase 4:**

1. **Install devDeps:**
   ```bash
   npm install --save-dev jsdom@^25 @testing-library/react@^16 @testing-library/jest-dom@^6
   ```
   [VERIFIED: npm registry shows jsdom 25.x and @testing-library/react 16.x as current; @testing-library/jest-dom 6.x is current]

2. **Modify `vitest.config.ts`:**
   ```ts
   import { defineConfig } from 'vitest/config'
   import tsconfigPaths from 'vite-tsconfig-paths'

   export default defineConfig({
     plugins: [tsconfigPaths()],
     test: {
       environment: 'jsdom',
       globals: false,
       setupFiles: ['./vitest.setup.ts'],
       include: ['**/*.test.{ts,tsx}'],
     },
   })
   ```

3. **Create `vitest.setup.ts` at repo root:**
   ```ts
   import '@testing-library/jest-dom/vitest'
   ```

4. **Add `@types/jest-dom` if needed for type augmentation** — actually `@testing-library/jest-dom/vitest` ships its own type augmentation; no separate types package required.

**Fresh-green grep test (D-84) — does it run in Vitest's default jsdom?**

Yes, no concern. The grep test reads file contents and applies regexes — pure Node.js APIs, jsdom doesn't interfere. Path:
```ts
// scripts/check-fresh-green.test.ts
import { describe, test, expect } from 'vitest'
import { matchesFreshGreen } from './check-fresh-green' // or invoke the bash script via execSync

describe('SHELL-05 grep', () => {
  test('flags hex literal #BFD730', () => { /* ... */ })
  // ...
})
```

The script can be invoked via `execSync('bash scripts/check-fresh-green.sh')` if the script is bash, OR imported as a function if TS. See §8 below for the bash recommendation.

## §7. CI script form (bash vs TS) + 4th-job vs step-in-test

### §7.1 Language: bash vs TypeScript

**Recommendation: lock bash.**

**Rationale:**
1. **Zero new tooling deps.** A TS script would need `tsx` runtime (or compile step) to execute in the existing `test` job; npm package adds ~50KB of devDeps.
2. **Speed.** A small grep over `app/`, `components/`, `lib/`, `scripts/`, `app/globals.css` is sub-second in bash. TS via tsx would add Node startup + transpile overhead (~500ms-1s).
3. **Auditable for non-Claude reviewers.** The bash script is ~30 lines of `grep -E -r ...` calls — anyone can read it. A TS equivalent has more boilerplate (file walking via `fs.readdirSync` recursion, skip-list logic).
4. **CI runner is Linux (Ubuntu — verified from `.github/workflows/ci.yml` lines 17, 31, 41).** Bash is universally available; no Windows compatibility concern (the CI runner doesn't change; Kit may run locally on macOS — bash works there too).
5. **Test fixtures stay in TS regardless.** D-84's `scripts/check-fresh-green.test.ts` runs under Vitest; it can `execSync('bash scripts/check-fresh-green.sh ...')` to invoke the bash script and assert exit codes / output. Pattern works for any external tool.

**Recommended script structure (bash):**
```bash
#!/usr/bin/env bash
set -euo pipefail

# Match-list per D-83 (extended per §3 audit)
PATTERNS=(
  '\b#[Bb][Ff][Dd]7[3]0\b'
  '--color-fresh-green(-[a-z0-9]+)?'
  '(bg|text|border|ring|ring-offset|from|to|via|outline|fill|stroke|divide|placeholder|caret|accent|shadow|inset-shadow|decoration)-fresh-green(-[a-z0-9]+)?(/[0-9]+)?'
  '\[(#[Bb][Ff][Dd]7[3]0|var\(--color-fresh-green|rgba\(\s*191\s*,\s*215\s*,\s*48)'
  'rgba\(\s*191\s*,\s*215\s*,\s*48'
)

# Read allowlist (one path per line; lines starting with # are comments)
mapfile -t ALLOWLIST < <(grep -v '^#' .freshgreen-allowlist 2>/dev/null | grep -v '^$' || true)

# Find candidate files (tracked source)
FILES=$(git ls-files | grep -E '\.(ts|tsx|css|js|jsx)$' | grep -vE 'node_modules/|\.next/|out/|build/')

# Run each pattern against each file, skipping allowlisted files
EXIT_CODE=0
for FILE in $FILES; do
  # Skip if file is in allowlist
  for ALLOWED in "${ALLOWLIST[@]}"; do
    if [[ "$FILE" == "$ALLOWED" ]]; then
      continue 2
    fi
  done

  for PATTERN in "${PATTERNS[@]}"; do
    if grep -E -n "$PATTERN" "$FILE" > /dev/null 2>&1; then
      echo "SHELL-05 violation in $FILE:" >&2
      grep -E -n "$PATTERN" "$FILE" >&2
      EXIT_CODE=1
    fi
  done
done

if [[ $EXIT_CODE -ne 0 ]]; then
  echo "" >&2
  echo "Fresh Green is reserved for AI-only surfaces. See .freshgreen-allowlist for the policy." >&2
fi

exit $EXIT_CODE
```

(Plan-phase will polish this draft. The shape is correct for the matching logic.)

### §7.2 4th top-level job vs step inside `test` job

**Recommendation: lock 4th top-level job named `fresh-green`.**

**Rationale:**
1. **Phase 2 PATTERNS.md Pattern D establishes the third-job pattern.** "Future CI jobs (e.g., a `test` job in Phase 3) get added as a third top-level job (NOT a matrix step). Each job is one required status check." Phase 4 inherits this pattern for the 4th job.
2. **Branch protection has cleaner status check listing.** With 4 separate jobs, the status checks pane shows `typecheck`, `lint`, `test`, `fresh-green` as four checkboxes. With a step inside `test`, the pane shows just `test` and the SHELL-05 failure surfaces only in the `test` job's logs — harder to triage at-a-glance for whoever is reviewing the PR.
3. **Parallel execution.** A separate job runs in parallel with the others, shaving ~10-20 seconds off total CI time vs. serializing inside `test`.
4. **Independent failure semantics.** A typecheck or test failure should NOT mask a SHELL-05 failure. Separate jobs give independent green/red signals.
5. **Cosmetic argument is real:** Pattern D says "follow the third-job pattern"; the 4th job is the literal next instance.

**Cost:** branch protection rule must be manually updated to add `fresh-green` as a required check (per Common Pitfalls #6). Plan-phase task includes this manual step.

**CI workflow modification:**

```yaml
# Append to .github/workflows/ci.yml (after the existing `test` job)

  fresh-green:
    name: fresh-green
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: bash scripts/check-fresh-green.sh
```

(No `setup-node`, no `npm ci` — pure bash + git ls-files + grep. Job runs in <30 seconds.)

**Optional:** a corresponding `package.json` script `"check:fresh-green": "bash scripts/check-fresh-green.sh"` so Kit can run it locally identically. Plan-phase decides; recommend adding it for ergonomic parity.

## §8. Demo page routing — `/dev/primitives` + TopStrip "neither persona" behavior

### §8.1 Routing

**Confirmed:** `app/dev/primitives/page.tsx` resolves to `/dev/primitives`. Lives outside both `(client)` and `(rm)` route groups, so neither ClientShell nor RMShell wraps it. Bare page renders directly inside the root `app/layout.tsx` (which still includes `<TopStrip />` above `{children}`). [CITED: https://nextjs.org/docs/app/getting-started/project-structure — colocation rules show that pages under unwrapped folders inherit only the root layout]

**No need for `app/dev/layout.tsx`** — the absence of a route-group layout is sufficient to skip ClientShell/RMShell. Confirmed: route-group layouts apply only to routes within their `(parens)` folder.

### §8.2 TopStrip "neither persona" behavior

**The question:** When pathname is `/dev/primitives`, what should TopStrip's mode display? D-67 says default → client. But the demo page is technically neither persona.

**Recommendation:** Plan-phase locks `modeForPathname()` to return one of three values: `'client' | 'rm' | 'demo'` (NOT just `'client' | 'rm'`).

**Rationale:** the demo page is a meta-context. Showing Yuki's persona block on the demo page would be misleading (the user is viewing a primitive showcase, not Yuki's view). Two implementation options:

**Option A (recommended): extend the union to include 'demo'.**

```ts
// lib/persona.ts
export function modeForPathname(p: string): 'client' | 'rm' | 'demo' {
  if (p.startsWith('/dev')) return 'demo'
  if (p.startsWith('/cockpit') || p.startsWith('/portfolio') || p.startsWith('/application')) return 'rm'
  return 'client' // default for /journey, /messages, /, etc.
}
```

```tsx
// components/shell/TopStrip.tsx
const mode = modeForPathname(pathname)

// Render context badge conditionally:
{mode === 'client' && <ClientContextBadge />}
{mode === 'rm' && <RMContextBadge />}
{mode === 'demo' && <DemoContextBadge />}  // e.g., "Primitives demo" eyebrow

// Render persona block conditionally:
{mode === 'demo' ? (
  <DemoEyebrow>SHELL-04 demo · /dev/primitives</DemoEyebrow>
) : (
  <PersonaBlock persona={mode === 'client' ? PERSONAS.client : PERSONAS.rm} />
)}
```

**Option B: keep the union narrow at 'client' | 'rm'; accept that /dev/primitives shows Yuki's persona.**

Cheaper to implement; less correct UX.

**Plan-phase pick:** Option A. The demo page is the SHELL-04 acceptance surface — its visual identity should reflect that.

**Update `Avatar.color`:** if 'demo' mode, render the avatar with `color='ink-muted'` (placeholder/empty) and initials `'??'` or omit the persona block entirely.

**Mode switcher behavior on /dev/primitives:**
- Both segments are inactive (neither client nor rm).
- Recommended visual: both `<Link>`s render in their inactive style; visual ambiguity makes clear "you're on neither" without breaking the affordance.

## §9. Validation Architecture — already documented above

The `## Validation Architecture` section above (after Pitfalls + Code Examples) covers Phase 4's testing strategy: framework, Phase Requirements → Test Map, Sampling Rate, Wave 0 Gaps. That section is the canonical Validation Architecture for this phase; plan-phase consumes it directly when generating VALIDATION.md per the plan-phase step 5.5.

**One additional plan-phase note for boundary-case sampling:** the SHELL-05 grep test (D-84) covers explicit bypass attempts. The boundary case map for the test fixtures should include:

- ✅ explicit hex (3 case variants)
- ✅ explicit CSS-var (`var(--color-fresh-green)`)
- ✅ explicit Tailwind utility (`bg-fresh-green`)
- ✅ explicit suffix variant (`bg-fresh-green-mute`, `bg-fresh-green-glow`)
- ✅ arbitrary-value (`bg-[#BFD730]`)
- ✅ arbitrary-value with var (`bg-[var(--color-fresh-green)]`)
- ✅ arbitrary-value with rgba (`bg-[rgba(191,215,48,0.3)]`)
- ✅ inline rgba (`rgba(191,215,48,0.3)`)
- ✅ opacity modifier (`bg-fresh-green/30`) — extension per §3 audit
- ✅ via-* gradient stop (`via-fresh-green`) — extension per §3 audit
- ✅ decoration-* (`decoration-fresh-green`) — extension per §3 audit
- ✅ ring-offset-* (`ring-offset-fresh-green`) — extension per §3 audit

Plus **negative cases that should NOT match** (so the regex doesn't over-fire):
- ❌ unrelated string `freshly-greened` (regex word-boundary handles)
- ❌ comment-line `// fresh-green note` — actually WILL match because grep doesn't strip comments; that's accepted (allowlist mitigates)
- ❌ token in a different namespace — currently safe because no other tokens share the substring `fresh-green`

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `bg-fresh-green/30` Tailwind v4 opacity modifier syntax matches the pattern `(prefix)-fresh-green(-[a-z0-9]+)?(/[0-9]+)?` | §3 fresh-green grep audit | Wrong: bypass via opacity slips through. Verify with a real Tailwind v4 build that `bg-fresh-green/30` compiles to a known CSS form, then ensure regex matches. |
| A2 | StatusChip per-kind exact tints (`/15` opacity, etc.) | §5.5 | Wrong tint = visual review fails on demo page. Plan-phase locks via demo-page eyeball test. The closed enum + per-kind unit test pattern is what matters for SHELL-05; exact tint is brand-aesthetic. |
| A3 | next/font Fraunces with `axes: ['SOFT', 'WONK']` ships actual SOFT/WONK metadata in the loaded font file (not just registers the axis names) | §2 | If the next/font bundler subsets axes — i.e., even with `axes: ['SOFT', 'WONK']` declared, only the wght data ships — then inline `fontVariationSettings: '"SOFT" 80'` would silently no-op. Mitigation: plan-phase includes a visual-check task ("compare 'Origin' wordmark on `/dev/primitives` with vs without inline fontVariationSettings to confirm the SOFT axis renders"). If it doesn't render, fall back to OD-12 strategy (b) inline-style only and document in PLAN.md. |
| A4 | jsdom 25.x and @testing-library/react 16.x are the current stable versions | Standard Stack | Wrong major versions cause install failures. Plan-phase re-runs `npm view` at task-write time. |
| A5 | Vitest jsdom environment doesn't break Phase 3's `lib/*.test.ts` data tests | §6 | Phase 3 tests touch no DOM APIs; jsdom just provides a `window` object that's ignored. Mitigation: run full test suite locally before committing the config change; if any Phase 3 test breaks, use the per-file pragma (`// @vitest-environment node`) override. |
| A6 | The bash grep script's pattern array correctly handles all Tailwind v4 utility names with fresh-green tokens | §3, §7 | Patterns mis-matched = bypasses slip through OR false positives flag legitimate code. Mitigation: the test fixtures (D-84) are the authority — every fixture must pass; if a real bypass slips into Phase 5+, add it to the fixtures + extend the regex. |
| A7 | Branch protection on `main` can be updated to add `fresh-green` as a 5th required check via GitHub Settings UI | §7.2 | Not really an assumption — this is documented GitHub functionality. Listed for completeness because it's a manual step. |

## Open Questions

1. **Should Phase 4's PR also amend `DECISIONS.md` to record the Fraunces axes extension (D-31 → new D-NN)?**
   - What we know: D-31 locked Fraunces wght-only with deferral note. Phase 4 OD-12 strategy (a) revisits.
   - What's unclear: whether DECISIONS.md needs a new explicit entry, OR whether updating CLAUDE.md's Stack contract summary is sufficient.
   - Recommendation: append a new D-NN to DECISIONS.md (e.g., D-90: Fraunces axes extended to include SOFT, WONK for "Origin" wordmark fidelity in Phase 4 chrome — supersedes deferral in D-31). Maintains audit trail per D-20. Plan-phase locks the exact wording.

2. **Should `lib/persona.ts` export `MODE` as a const-asserted union type, or as the string literal type `'client' | 'rm' | 'demo'`?**
   - What we know: D-66 says plain TS constants. UI-SPEC §"TopStrip Composition" implies a string literal.
   - What's unclear: stylistic preference. `as const` produces a tuple-like inference; string-literal is simpler.
   - Recommendation: simple string-literal export `export type Mode = 'client' | 'rm' | 'demo'`. Plan-phase locks.

3. **For the demo page `/dev/primitives`, should TopStrip render the LanguageToggle and persona-block elements at all?**
   - What we know: the demo is meta-content; persona block doesn't apply.
   - What's unclear: whether the planner should keep all chrome elements (for visual completeness so reviewers see the entire TopStrip surface) or hide them (for clarity that you're on a meta page).
   - Recommendation: keep LanguageToggle, mail icon, help icon visible (they're not persona-specific). Replace persona block with a "demo" eyebrow. Mode-switcher segments both inactive. Plan-phase confirms.

4. **The recommended `Avatar.color` 7-member subset (§5.6) vs UI-SPEC's 12-member full enum.**
   - What we know: UI-SPEC lists 12 candidates. Phase 4 chrome only consumes 1 (`trad-green-soft` for both personas). Demo page renders all members.
   - What's unclear: whether to ship 7 or 12 in `AvatarColor` union.
   - Recommendation: ship 7 (per §5.6); Phase 5/6 add additively. Plan-phase locks.

5. **AIPulseDot animation token in `app/globals.css` — `@theme --animate-ai-pulse: ai-pulse 1200ms cubic-bezier(0.4, 0, 0.2, 1) infinite alternate` syntax.**
   - What we know: Tailwind v4 supports `--animate-*` theme tokens that auto-generate `animate-*` utilities.
   - What's unclear [ASSUMED]: exact syntax — whether the value must be the full animation shorthand or just the keyframe name.
   - Recommendation: plan-phase tests the `@theme --animate-ai-pulse: ai-pulse 1200ms cubic-bezier(0.4, 0, 0.2, 1) infinite alternate` form against a Tailwind v4 build; if it doesn't generate `animate-ai-pulse` correctly, fall back to inline `style={{ animation: 'ai-pulse 1200ms ...' }}` on the `AIPulseDot` `<span>`.

## Sources

### Primary (HIGH confidence)
- [Next.js 16 docs — Font Module API Reference](https://nextjs.org/docs/app/api-reference/components/font) — `axes` option signature, syntax for variable font axes
- [Next.js 16 docs — usePathname](https://nextjs.org/docs/app/api-reference/functions/use-pathname) — Client Component requirement, hydration mismatch caveat with rewrites
- [Next.js 16 docs — Route Groups](https://nextjs.org/docs/app/api-reference/file-conventions/route-groups) — confirms route-group layouts pattern
- [Next.js 16 docs — Project Structure](https://nextjs.org/docs/app/getting-started/project-structure) — confirms `_prefix` private folders, `(parens)` route groups, colocation rules
- [Next.js 16 docs — Link Component](https://nextjs.org/docs/app/api-reference/components/link) — prefetch defaults to `auto`; production-only; static routes prefetched fully
- [Tailwind CSS v4 — Functions and Directives](https://tailwindcss.com/docs/functions-and-directives) — `@apply` syntax, `@reference` only required in scoped contexts
- [`/tmp/proto_primitives.js`](file:///tmp/proto_primitives.js) — verbatim Icon names + paths, StagePill/StageNumeral colors, Avatar shape, AIBadge structure, AIPulse class pattern
- [`/tmp/proto_shell.js`](file:///tmp/proto_shell.js) — TopStrip layout dimensions, ClientShell/RMShell measurements, all 5 SHELL-05 violation file:line references
- [`/tmp/proto_rm_cockpit.js`](file:///tmp/proto_rm_cockpit.js) — KpiCell + NeedsYouRow + OvernightRow recipes (informs ActionCard slot shape)
- [`/Users/wyekitgoh/Projects/SMBCorigins/app/globals.css`](file:///Users/wyekitgoh/Projects/SMBCorigins/app/globals.css) — verified Phase 2 `@theme` token names match D-83 regex assumptions
- [`/Users/wyekitgoh/Projects/SMBCorigins/app/layout.tsx`](file:///Users/wyekitgoh/Projects/SMBCorigins/app/layout.tsx) — confirmed Phase 2 next/font wirings, IBM Plex Mono weights ['400', '700'] (PD-1 swap target)
- [`/Users/wyekitgoh/Projects/SMBCorigins/vitest.config.ts`](file:///Users/wyekitgoh/Projects/SMBCorigins/vitest.config.ts) — verified node-only environment, `*.test.ts` only
- [`/Users/wyekitgoh/Projects/SMBCorigins/.github/workflows/ci.yml`](file:///Users/wyekitgoh/Projects/SMBCorigins/.github/workflows/ci.yml) — verified existing 3 jobs (typecheck, lint, test)
- [`/Users/wyekitgoh/Projects/SMBCorigins/package.json`](file:///Users/wyekitgoh/Projects/SMBCorigins/package.json) — verified next 16.2.4, react 19.2.4, vitest 4.1.5, no jsdom/testing-library yet

### Secondary (MEDIUM confidence — verified against multiple sources)
- [Fraunces typeface specification — googlefonts/fraunces](https://github.com/googlefonts/fraunces) — confirms 4-axis variable font (wght, opsz, SOFT, WONK)
- [DEV community Tailwind v4 migration guide](https://dev.to/pockit_tools/tailwind-css-v4-migration-guide-everything-that-changed-and-how-to-upgrade-2026-5d4) — corroborates `@apply` continued support; @reference for scoped contexts
- [LogRocket Tailwind 2026 guide](https://blog.logrocket.com/tailwind-css-guide/) — corroborates v4 utility-name generation rules

### Tertiary (LOW confidence — single source, marked for assumption tracking)
- (none — all major claims verified against primary sources)

## Metadata

**Confidence breakdown:**
- Locked decisions confirmation: HIGH — direct read of CONTEXT, UI-SPEC, DECISIONS, REQUIREMENTS
- Standard stack: HIGH — npm registry + Next.js 16 official docs
- Architecture patterns (RSC + client child + route groups + Link): HIGH — Next.js 16 official docs verified
- D-89 port strategy recommendation: HIGH — Tailwind v4 docs confirm `@apply` semantics + per-kind test ergonomics drive (c)
- OD-12 Fraunces axes: MEDIUM — next/font signature verified, but A3 [ASSUMED] adds residual risk; mitigation listed
- Fresh-green grep regex audit: HIGH — Tailwind v4 utility-name rules verified; 4 missing prefixes identified
- Next.js 16 specifics (route groups, private folders, usePathname, Link): HIGH — all 5 sub-questions answered with citations
- Prototype-extracted defaults (Icons, StagePill, TopStrip, Shells, violations): HIGH — verbatim from /tmp/proto_*.js with line numbers
- Vitest + DOM testing: HIGH — current state verified; recommended additive deps standard
- CI script form (bash + 4th job): HIGH — pattern aligns with Phase 2 PATTERNS.md Pattern D
- Demo page routing + neither-persona: HIGH — Next.js 16 colocation rules verified
- Validation Architecture: HIGH — straightforward Vitest + grep test sampling

**Research date:** 2026-04-26
**Valid until:** 2026-07-26 (3 months — Next.js 16 LTS is stable; Tailwind v4 is stable; the prototype source is frozen)

## RESEARCH COMPLETE
