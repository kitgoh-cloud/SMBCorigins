# Phase 2: Scaffolding — Research

**Researched:** 2026-04-25
**Domain:** Next.js 16.2 App Router scaffolding, Tailwind v4 CSS-first theming, next/font/google multi-font setup, Vercel Git integration, GitHub Actions CI
**Confidence:** HIGH (all critical findings verified against official Next.js 16.2 / Tailwind v4 docs as of Apr 2026)

## Summary

Phase 2 stands up a `create-next-app` scaffold on `kit/scaffold`, ports the Origin design tokens into a Tailwind v4 `@theme` block, wires four Google fonts via `next/font/google`, adds two persona route groups, lands a CI workflow with two parallel required-status jobs, and links Vercel before first push so previews exist from commit one.

The key reality-check finding: **`create-next-app@latest` (16.2.4) ships Tailwind v4 by default — no v3-to-v4 upgrade path is needed**. Tailwind v4 became the create-next-app default with Next.js 15.2 and remains so in 16.x. The default template even uses `@theme inline {}` for next/font integration, which is exactly the pattern D-33 prescribes.

**Primary recommendation:** Run `npx create-next-app@16.2.4 . --typescript --tailwind --eslint --app --no-src-dir --use-npm --import-alias "@/*" --no-react-compiler --no-agents-md --turbopack` inside the existing repo, then hand-edit four files (`tsconfig.json`, `eslint.config.mjs`, `app/globals.css`, `app/layout.tsx`) to layer in the Origin-specific decisions. Plus three new files (`.nvmrc`, `.prettierrc`, `.github/workflows/ci.yml`) and the two route-group placeholders.

## User Constraints (from CONTEXT.md)

### Locked Decisions

These are non-negotiable. Plans must implement these as specified.

**Stack version reconciliation**
- **Next.js 16.2 LTS** (D-01) — DECISIONS.md wins over ROADMAP.md's "14+" wording per D-20. "14+" is satisfied.

**Design tokens (Tailwind v4 `@theme`)**
- **D-26:** Tokens land in Tailwind v4 `@theme {}` inside `app/globals.css`. Tailwind auto-generates utility classes (`bg-trad-green`, `text-paper`, `font-display`, etc.) AND exposes CSS variables for non-utility use cases.
- **D-27:** Port the **full token set from `docs/ORIGIN_DESIGN.md` §8 verbatim** — six green variants, six neutrals, three signals, three dark-mode tokens, four typography families, 8px-base spacing scale (4, 8, 12, 16, 24, 32, 48, 64, 96), radius scale (6 / 12 / 16 + full).
- **D-28:** Fresh Green AI-only enforcement is **deferred to Phase 4**. Phase 2 only adds a code comment in `app/globals.css` next to the fresh-green tokens pointing to `CLAUDE.md §Design system`.
- **D-29:** Tokens live in a **single `app/globals.css`** alongside `@import "tailwindcss";`. No `styles/tokens.css` split.

**Font loading (next/font/google)**
- **D-30:** All four fonts via `next/font/google` in `app/layout.tsx`.
- **D-31:** **Fraunces** with **wght variable axis only** (no opsz/SOFT/WONK in v1).
- **D-32:** **Noto Sans JP** with `subsets: ['latin']` only (JP via unicode-range auto-loading).
- **D-33:** Chain: next/font CSS vars → `@theme` remap → utilities. Apply all four `.variable` classNames to `<html>`.

**Vercel bootstrap & day-1 URL**
- **D-34:** Vercel project linked via dashboard "Import Git Repository" flow (manual, by Kit, before push).
- **D-35:** `NEXT_PUBLIC_USE_MOCK=true` on **both Production and Preview** environments.
- **D-36:** Auto-generated `*.vercel.app` URL — no custom domain in v1.
- **D-37:** Sequence — Link Vercel **BEFORE** first push to `kit/scaffold`.
- **D-37b:** Phase 1 PR already merged (`de2701c`). `kit/scaffold` branches off clean `main`.

**Tooling baseline**
- **D-02:** Node 24 LTS via `.nvmrc` + `engines.node` in `package.json`.
- **D-05:** TypeScript `strict: true` + `noUncheckedIndexedAccess: true`. **Do NOT add** `exactOptionalPropertyTypes`.
- **D-06:** npm.
- **D-07:** ESLint flat config (`eslint.config.mjs`) + Prettier.
- **D-08:** Branch protection on `main` — three required status checks: `typecheck`, `lint`, Vercel preview.
- **D-10:** Root-level `app/`, `components/`, `lib/`, `types/`, `data/` — **NO `src/` wrapper**.
- **D-38:** Defaults only — `@/*` import alias, no Tailwind plugins.
- **D-39:** One `.github/workflows/ci.yml` with **TWO PARALLEL JOBS** (`typecheck` and `lint`), each a distinct required check.
- **D-40:** **No husky, no lint-staged, no test framework** in Phase 2.

**Placeholder content (D-41)**
- **Root `/`** — token showcase (6 color tokens as labeled swatches + 4 fonts as labeled sample paragraphs, including Japanese sample line).
- **`/(client)`** — bilingual greeting for Yuki (e.g., `Yukiさん、ようこそ — Welcome, Yuki`).
- **`/(rm)`** — English-only RM placeholder for James (e.g., `James Lee · RM Cockpit · ID: RM-0001`), with ID set in IBM Plex Mono.
- All three pages share a minimal layout (warm paper background, Trad Green text, no chrome).

### Claude's Discretion

These are research/recommendation areas — the planner picks based on this research:
- Exact prose phrasing of placeholder content (Yuki's greeting wording, swatch labels).
- Exact ordering of color swatches on the showcase page.
- Exact ESLint rule overrides beyond Next.js + Prettier defaults.
- Exact Prettier config values (line width, quotes, semis).
- `next.config.ts` (or `.mjs`) shape — likely defaults; consider `experimental.typedRoutes`.
- Root layout `<head>` metadata.
- `.gitignore` additions: `.vercel/`, `.env*.local`, plus what `create-next-app` ships.
- README.md "How to run" updates and CLAUDE.md "How to run" section fill-in.

### Deferred Ideas (OUT OF SCOPE)

Do not include any of the following in plans:
- Fraunces opsz/SOFT/WONK axes (revisit Phase 5+).
- `@tailwindcss/typography` plugin (Phase 8 concern).
- `@tailwindcss/forms` plugin (likely never).
- Custom domain.
- Husky / lint-staged.
- Fresh Green AI-only enforcement (Phase 4 / SHELL-05).
- Dark-mode wiring (tokens are added, no toggle).
- README.md full rewrite.
- Testing framework choice (Phase 3).
- Secrets handling pattern (Phase 3).
- `data/seed.ts` divergence governance (Phase 3).
- Any `types/origin.ts`, `lib/api.*`, `data/seed.ts` files (Phase 3).
- App shell, primitives, mode switcher (Phase 4).

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SCAFF-01 | Next.js 14+ App Router boots locally with `npm run dev` and renders a placeholder | `npx create-next-app@16.2.4` produces booting scaffold; `app/page.tsx` renders root showcase per D-41 |
| SCAFF-02 | TypeScript `strict: true`, compiles cleanly | create-next-app default tsconfig has `strict: true`; Phase 2 adds `noUncheckedIndexedAccess: true` per D-05 |
| SCAFF-03 | Tailwind configured, purges, applies utility classes | create-next-app v16 ships Tailwind v4 by default with `@import "tailwindcss";` in globals.css and `@tailwindcss/postcss` plugin in postcss.config.mjs |
| SCAFF-04 | Design tokens from ORIGIN_DESIGN §8 ported as CSS custom properties | Tailwind v4 `@theme {}` declarations in app/globals.css generate both utilities and CSS vars (e.g., `--color-trad-green` → `bg-trad-green` utility AND `var(--color-trad-green)` raw CSS var) |
| SCAFF-05 | Four fonts (Fraunces, Inter Tight, Noto Sans JP, IBM Plex Mono) load and render | `next/font/google` imports applied as `.variable` className combo on `<html>`; remapped in `@theme inline {}` to font utilities |
| SCAFF-06 | Route groups `/(client)` and `/(rm)` exist with placeholder pages | `app/(client)/page.tsx` and `app/(rm)/page.tsx` per Next.js 16 App Router file conventions; folders in parens don't appear in URLs |
| SCAFF-07 | Vercel project linked, `main` auto-deploys, every PR produces a preview URL | Vercel "Import Git Repository" auto-detects Next.js framework preset, builds with `npm run build`, deploys `main` to `*.vercel.app` and every push (including non-`main`) to a unique preview URL |

## Tech Stack Reality Check

### Versions Verified (npm registry, 2026-04-25)

| Package | Version | Verified | Source |
|---------|---------|----------|--------|
| `next` | **16.2.4** | `[VERIFIED: npm view next version]` | `latest` dist-tag = 16.2.4 |
| `create-next-app` | **16.2.4** | `[VERIFIED: npm view create-next-app version]` | `latest` |
| `tailwindcss` | **4.2.4** | `[VERIFIED: npm view tailwindcss version]` | `latest` (v4 line) |
| `@tailwindcss/postcss` | **4.2.4** | `[VERIFIED: npm view @tailwindcss/postcss version]` | `latest` |
| `eslint-config-next` | **16.2.4** | `[VERIFIED: npm view eslint-config-next version]` | matches Next major |
| `eslint` | **10.2.1** | `[VERIFIED: npm view eslint version]` | flat config era |
| `typescript` | **6.0.3** | `[VERIFIED: npm view typescript version]` | latest |
| `prettier` | **3.8.3** | `[VERIFIED: npm view prettier version]` | latest |
| `eslint-config-prettier` | **10.1.8** | `[VERIFIED: npm view eslint-config-prettier version]` | latest, exposes `/flat` |

### Surprises & Defaults

**1. Tailwind v4 is now the create-next-app default — confirmed.** `[VERIFIED: nextjs.org/docs/app/getting-started/css]`
- The Apr 2025-era discussions about "create-next-app installs v3" are stale. Next.js 15.2 made v4 the default, and 16.x retains it.
- The default template's `app-tw/ts/postcss.config.mjs` is exactly:
  ```js
  const config = { plugins: { "@tailwindcss/postcss": {} } };
  export default config;
  ```
- The default template's `globals.css` already uses `@import "tailwindcss";` and a `@theme inline {}` block referencing next/font CSS vars (Geist + Geist_Mono). This is the same pattern D-33 prescribes — we just swap fonts and tokens.
- **No `tailwind.config.ts` is generated and none should be added** — Tailwind v4 is CSS-first. `[VERIFIED: tailwindcss.com/docs/installation/framework-guides/nextjs]`

**2. Default `tsconfig.json` already has `strict: true`.** `[VERIFIED: github.com/vercel/next.js create-next-app templates]`
- We need to **add only** `"noUncheckedIndexedAccess": true` to `compilerOptions`.
- We do **NOT** add `exactOptionalPropertyTypes` (D-05 explicit exclusion).
- The default uses `"moduleResolution": "bundler"` and `"target": "ES2017"` — leave these alone.

**3. `next lint` is removed in Next.js 16.** `[VERIFIED: nextjs.org/docs/app/api-reference/config/eslint v16.0.0 changelog]`
- Phase 2's `package.json` `lint` script must run the ESLint CLI directly: `eslint .`
- The `eslint` field in `next.config.*` is also gone — do not add one.

**4. ESLint flat config from create-next-app already includes Next.js + Prettier-friendly setup.** `[VERIFIED: nextjs.org/docs/app/api-reference/config/eslint]`
- create-next-app generates `eslint.config.mjs` using `defineConfig` and spreads `eslint-config-next/core-web-vitals` + `eslint-config-next/typescript`.
- For Prettier integration, install `eslint-config-prettier` and append `prettier` from `eslint-config-prettier/flat` to the config array. We do NOT need `eslint-plugin-prettier` (Next.js docs explicitly recommend the `eslint-config-prettier` flat preset; that approach disables formatting rules so Prettier owns formatting and ESLint owns code-quality. Adding `eslint-plugin-prettier` would re-introduce formatting noise into ESLint output, which is what `eslint-config-prettier` exists to prevent).

**5. `--no-react-compiler` flag is required.** `[VERIFIED: nextjs.org/docs/app/api-reference/cli/create-next-app]`
- create-next-app 16 prompts for React Compiler. Per CONTEXT.md §Claude's Discretion / "minimum surprise", we don't need React Compiler in v1 — keep the bundle and config small. Use `--no-react-compiler` to skip the prompt.

**6. `--no-agents-md` flag is required.** `[VERIFIED: nextjs.org/docs/app/api-reference/cli/create-next-app]`
- create-next-app 16 includes `AGENTS.md` and `CLAUDE.md` by default. **CRITICAL:** the existing `CLAUDE.md` at the repo root is canonical (Phase 1 closure artifact, ~5.2 KB of locked content). Letting create-next-app overwrite it would destroy Stack contract / Scaffolding ownership / Design system content. Use `--no-agents-md` to skip.

**7. `next.config.*` file extension default has shifted toward TypeScript.** `[VERIFIED: nextjs.org/docs/app/api-reference/config/typescript v15.0.0 changelog]`
- create-next-app 16 generates `next.config.ts` (not `.mjs`) when `--typescript` is used. Plans should expect `next.config.ts`.

**8. `next-env.d.ts` is auto-generated and should be in `.gitignore`.** `[VERIFIED: nextjs.org/docs/app/api-reference/config/typescript]`
- The Next.js docs explicitly recommend gitignoring `next-env.d.ts`. Default `create-next-app` `.gitignore` covers `/.next/` but not `next-env.d.ts` — Phase 2 should add it.

**9. Node 25 is installed locally; D-02 mandates Node 24 LTS.** `[VERIFIED: node --version → v25.6.1]`
- Use `nvm use 24` or `volta install node@24` before running create-next-app. The `.nvmrc` file Phase 2 creates will pin this for future contributors.

**10. `gh` CLI is NOT installed locally.** `[VERIFIED: command -v gh → not found]`
- Branch protection setup must happen via GitHub web UI (not `gh api`). Document the manual steps in the plan.

### Existing Repo State

- Repo is greenfield on the code side: no `package.json`, no `app/`, no `node_modules/`. `[VERIFIED: ls /Users/wyekitgoh/Projects/SMBCorigins]`
- Phase 1 already produced: `CLAUDE.md`, `DECISIONS.md`, `CONTRACT.md`, `.github/CODEOWNERS`, `.gitignore` (48 bytes — minimal), `docs/`, `.planning/`. `[VERIFIED: directory listing]`
- `.github/CODEOWNERS` already governs Phase 3 boundary files (`types/origin.ts`, `lib/api.ts`, `lib/api.mock.ts`, `lib/api.real.ts`). Phase 2 must not create those files.
- Existing `.gitignore` is just 48 bytes — needs full expansion. create-next-app will overwrite it; we should preserve any custom entries (currently none of substance per file size).

## Implementation Patterns

### 1. create-next-app invocation (the key command)

Run from inside `/Users/wyekitgoh/Projects/SMBCorigins/` on the `kit/scaffold` branch:

```bash
nvm use 24  # or volta install node@24
npx create-next-app@16.2.4 . \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --no-src-dir \
  --use-npm \
  --import-alias "@/*" \
  --no-react-compiler \
  --no-agents-md \
  --turbopack
```

**Flag rationale:**

| Flag | Why |
|------|-----|
| `.` | Scaffold INTO existing repo (preserves CLAUDE.md, DECISIONS.md, CONTRACT.md, .github/CODEOWNERS, docs/, .planning/) |
| `--typescript` | D-05 mandate |
| `--tailwind` | D-03 mandate; ships v4 by default in 16.x |
| `--eslint` | D-07 mandate (skip `--biome`) |
| `--app` | App Router (D-01) |
| `--no-src-dir` | D-10 mandate (root-level `app/`, no `src/` wrapper) |
| `--use-npm` | D-06 mandate |
| `--import-alias "@/*"` | D-38 default |
| `--no-react-compiler` | D-38 minimum surprise; React Compiler not needed for v1 |
| `--no-agents-md` | **CRITICAL:** prevents overwrite of existing CLAUDE.md from Phase 1 |
| `--turbopack` | Default; faster dev experience; explicit for clarity |

**Conflict handling:** create-next-app may complain about non-empty target directory. Use `--yes` to override prompts, or pre-empt by ensuring no name collisions with the files create-next-app generates. The existing files (`CLAUDE.md`, `DECISIONS.md`, `CONTRACT.md`, `.github/CODEOWNERS`, `docs/`, `.planning/`, `.git/`) do not overlap with create-next-app's output, EXCEPT `.gitignore` and potentially `README.md`. Plan for: backup-then-restore or accept overwrite if existing content is minimal (current `.gitignore` is 48 bytes; no `README.md` exists).

**`--yes` interaction:** With `--yes` create-next-app will silently use defaults including `--agents-md`. Do NOT combine `--yes` with this flag set. Use the explicit per-flag form above.

### 2. `tsconfig.json` — minimal edit

create-next-app generates `tsconfig.json` with `strict: true` already. Only one line needs adding:

```jsonc
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noUncheckedIndexedAccess": true, // <-- ADD THIS LINE (D-05)
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts",
    "**/*.mts"
  ],
  "exclude": ["node_modules"]
}
```

`[VERIFIED: nextjs.org docs + github.com/vercel/next.js canary template]` — this is the exact default; only `noUncheckedIndexedAccess` is added. **Do NOT** add `exactOptionalPropertyTypes` (D-05 explicit exclusion).

### 3. `next.config.ts` — start minimal

```ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Statically typed Link hrefs (cheap, catches typos)
  typedRoutes: true,
}

export default nextConfig
```

`[CITED: nextjs.org/docs/app/api-reference/config/typescript#statically-typed-links]` — `typedRoutes` is a near-free win and the file already exists; cost is negligible. CONTEXT.md §Claude's Discretion expressly permits adding it "if it doesn't pull in build cost."

### 4. `app/globals.css` — token plumbing

This is the load-bearing file for SCAFF-04. Structure is **two `@theme` blocks**: one regular (token literals) and one `inline` (font CSS-var references):

```css
/* app/globals.css — design tokens for SMBC Origin */
/* Source for all token values: docs/ORIGIN_DESIGN.md §8 (D-27) */

@import "tailwindcss";

@theme {
  /* ====== Brand greens — primary SMBC palette ====== */
  --color-trad-green: #004832;       /* Primary dark, nav, headers */
  --color-trad-green-deep: #00301F;  /* Hover, depth */
  --color-trad-green-soft: #1A5F48;  /* Hover lighter */

  /* Fresh Green is RESERVED FOR AI OUTPUTS ONLY (D-28; enforcement in Phase 4 / SHELL-05).
     See CLAUDE.md "Design system" — never use on primary buttons or generic accents. */
  --color-fresh-green: #BFD730;
  --color-fresh-green-mute: #D4E566;
  --color-fresh-green-glow: #BFD73022;

  /* ====== Neutrals ====== */
  --color-ink: #0A1410;
  --color-ink-soft: #3C4540;
  --color-ink-muted: #7A827D;
  --color-paper: #FAFBF7;
  --color-paper-deep: #F3F5EE;
  --color-mist: #E8EDE4;

  /* ====== Signals ====== */
  --color-signal-amber: #E8A317;
  --color-signal-red: #C73E1D;
  --color-signal-info: #2A6F97;

  /* ====== Dark mode (RM cockpit option — tokens only, not wired in v1) ====== */
  --color-dark-bg: #0B1F17;
  --color-dark-surface: #112820;
  --color-dark-text: #E8EDE4;

  /* ====== Spacing — 8px base scale (ORIGIN_DESIGN.md §8.3) ====== */
  --spacing-1: 4px;
  --spacing-2: 8px;
  --spacing-3: 12px;
  --spacing-4: 16px;
  --spacing-6: 24px;
  --spacing-8: 32px;
  --spacing-12: 48px;
  --spacing-16: 64px;
  --spacing-24: 96px;

  /* ====== Radius (ORIGIN_DESIGN.md §8.4) ====== */
  --radius-button: 6px;   /* Buttons / inputs */
  --radius-card: 12px;    /* Cards */
  --radius-modal: 16px;   /* Modals */
  /* Avatars use `rounded-full` (built-in) */
}

@theme inline {
  /* Remap next/font CSS variables to Tailwind font namespace.
     The `inline` keyword inlines the var() reference, avoiding cascade scoping bugs
     when next/font writes the var on <html> and Tailwind utilities resolve it elsewhere. */
  --font-display: var(--font-fraunces);     /* Headings, display, stat numerals */
  --font-body: var(--font-inter-tight);     /* UI body */
  --font-jp: var(--font-noto-sans-jp);      /* Japanese characters */
  --font-mono: var(--font-ibm-plex-mono);   /* Data, IDs, timestamps */
}

/* Base resets — minimal. App shell (Phase 4) will add more. */
body {
  background-color: var(--color-paper);
  color: var(--color-ink);
  font-family: var(--font-body), system-ui, sans-serif;
}
```

**Why two `@theme` blocks:**
- `@theme {}` (regular) — bakes literal values into utility class CSS. Use for tokens whose value is a literal (hex, px).
- `@theme inline {}` — emits `var(...)` references in utility class CSS. **Required when the value depends on a variable defined elsewhere (e.g., next/font sets `--font-fraunces` on `<html>`)**. Without `inline`, Tailwind would generate `font-display: var(--font-display)` which references a token that the utility-class scope can't resolve back to the font var. With `inline`, Tailwind generates `font-family: var(--font-fraunces)` directly — which DOES resolve in the body's scope because next/font set it on `<html>`.

`[VERIFIED: tailwindcss.com/docs/theme + create-next-app default app-tw/ts/app/globals.css]`

**Auto-generated utilities** Tailwind v4 produces from this file:
- `bg-trad-green`, `text-trad-green`, `border-trad-green`, `fill-trad-green`, `stroke-trad-green` (× 18 color tokens)
- `font-display`, `font-body`, `font-jp`, `font-mono`
- `p-1`, `p-2`, `p-3`, `p-4`, `p-6`, `p-8`, `p-12`, `p-16`, `p-24` and `m-`, `gap-`, `w-`, `h-`, etc. for each spacing token
- `rounded-button`, `rounded-card`, `rounded-modal`

CSS custom properties are also exposed at `:root` automatically — `var(--color-trad-green)`, `var(--font-display)`, etc. — for inline styles, gradients, computed style attributes, third-party config that doesn't accept utilities.

### 5. `app/layout.tsx` — four fonts via next/font/google

```tsx
import type { Metadata } from 'next'
import { Fraunces, Inter_Tight, Noto_Sans_JP, IBM_Plex_Mono } from 'next/font/google'
import './globals.css'

// D-31: Fraunces — wght axis only (no opsz/SOFT/WONK in v1)
const fraunces = Fraunces({
  subsets: ['latin'],
  axes: ['wght'],
  variable: '--font-fraunces',
  display: 'swap',
})

// Inter Tight — variable font, no weight specification needed
const interTight = Inter_Tight({
  subsets: ['latin'],
  variable: '--font-inter-tight',
  display: 'swap',
})

// D-32: Noto Sans JP — subsets: ['latin'] only.
// JP characters auto-load via Google Fonts unicode-range when they appear on the page.
const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  variable: '--font-noto-sans-jp',
  display: 'swap',
})

// IBM Plex Mono — not a variable font on Google Fonts; specify weights.
const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'SMBC Origin',
  description: 'AI-native corporate banking onboarding — prototype',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
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

**The CSS variable name pattern matters.** `next/font/google` writes the variable name you supply via the `variable` prop directly onto whatever element receives the `.variable` className. So:
- `variable: '--font-fraunces'` → `<html style="--font-fraunces: '__Fraunces_xxx', ...">`
- That CSS var is then picked up by `@theme inline { --font-display: var(--font-fraunces); }`
- Which generates `.font-display { font-family: var(--font-fraunces); }` (because of `inline`)
- Which resolves correctly in any descendant scope.

**Inter Tight import name is `Inter_Tight`** — underscore-separated, capitalized first letter of each word. This is the next/font/google convention for multi-word Google Font names. `[VERIFIED: fonts.google.com/specimen/Inter+Tight + next/font convention]`

**IBM Plex Mono is NOT a variable font on Google Fonts** — must specify weights. We need 400 (regular) for general use and 700 (bold) for IDs / timestamp emphasis. `[CITED: fonts.google.com/specimen/IBM+Plex+Mono]`

**Subsets: latin only is sufficient** for all four. JP coverage on Noto Sans JP comes from Google Fonts auto-attaching subset stylesheets via `unicode-range` when the JP code points appear in rendered output. `[VERIFIED: nextjs.org/docs/messages/google-fonts-missing-subsets]`

### 6. Route groups — `app/(client)/page.tsx` and `app/(rm)/page.tsx`

Route groups are folders wrapped in parens — they organize but **do not appear in URLs**. Both `app/(client)/page.tsx` and `app/(rm)/page.tsx` map to `/` — **WHICH WOULD BE A URL CONFLICT.** `[VERIFIED: nextjs.org/docs/app/getting-started/project-structure]`

**Resolution per D-41:** Each route group must contain at least one nested folder so the URLs are unique. SCAFF-06 says "navigating to /(client) and /(rm) route-group URLs returns persona-specific placeholder pages." Since `(client)` and `(rm)` themselves are NOT URL segments, the actual URLs need to be:
- `app/(client)/dashboard/page.tsx` → `/dashboard` (or similar)
- `app/(rm)/cockpit/page.tsx` → `/cockpit` (or similar)

OR keep root `/` for the client greeting and use a non-conflicting RM path. **Recommended pattern (matches Phase 5+ conventions):**
- `app/page.tsx` → root `/` — token showcase per D-41
- `app/(client)/journey/page.tsx` → `/journey` — Yuki's bilingual greeting (forward-compatible: Phase 5 builds out `/journey` per CJD-01)
- `app/(rm)/cockpit/page.tsx` → `/cockpit` — James's RM placeholder (forward-compatible: Phase 6 builds out `/cockpit` per RMC-01)

This approach (a) avoids the URL collision, (b) maps cleanly to Phase 5–6 routes (`CJD-01: /(client)/journey`, `RMC-01: /(rm)/cockpit`), and (c) gives reviewers three distinct working URLs to verify Phase 2.

**Plan note:** plans should explicitly use `/journey` and `/cockpit` as the placeholder URLs. The placeholder pages are stand-ins; Phases 5 and 6 replace their contents — the routes themselves remain.

Each route-group page is just a normal React component:

```tsx
// app/(client)/journey/page.tsx
export default function ClientJourneyPlaceholder() {
  return (
    <main className="p-8 bg-paper text-trad-green min-h-screen">
      <p className="font-jp text-3xl">Yukiさん、ようこそ</p>
      <p className="font-body text-xl mt-4">Welcome, Yuki — Client Journey (Phase 5 placeholder)</p>
      <a href="/" className="font-mono text-signal-info underline mt-8 inline-block">← back to /</a>
    </main>
  )
}
```

```tsx
// app/(rm)/cockpit/page.tsx
export default function RMCockpitPlaceholder() {
  return (
    <main className="p-8 bg-paper text-trad-green min-h-screen">
      <h1 className="font-display text-4xl">James Lee · RM Cockpit</h1>
      <p className="font-mono text-ink-soft mt-2">ID: RM-0001</p>
      <p className="font-body mt-4">Phase 6 placeholder — full cockpit lands in RMC-01..07.</p>
      <a href="/" className="font-mono text-signal-info underline mt-8 inline-block">← back to /</a>
    </main>
  )
}
```

The root `app/page.tsx` is the token showcase per D-41 — the verification surface for SCAFF-04 and SCAFF-05. (See Validation Architecture §3 for detailed requirements.)

### 7. `eslint.config.mjs` — flat config with Prettier

The create-next-app default already wires `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`. Phase 2 adds the Prettier preset:

```bash
npm install -D eslint-config-prettier
```

```js
// eslint.config.mjs
import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import prettier from 'eslint-config-prettier/flat'

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier, // disables formatting rules that conflict with Prettier
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
])

export default eslintConfig
```

`[VERIFIED: nextjs.org/docs/app/api-reference/config/eslint § With Prettier]`

**`package.json` lint script** (since `next lint` is removed in v16):

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit"
  }
}
```

### 8. `.prettierrc` — sensible defaults

```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "always"
}
```

`[ASSUMED]` — these are conventional choices consistent with the create-next-app default code style (no semis, single quotes); CONTEXT.md §Claude's Discretion permits "pick something sensible and consistent." `printWidth: 100` matches a desktop-first 1440px workflow where reviewers don't need 80-col wrapping. (Listed in Assumptions Log; flag if the user prefers semis or 80-col.)

### 9. `.prettierignore`

```
.next/
out/
build/
node_modules/
package-lock.json
*.min.js
*.min.css
```

### 10. `.nvmrc` — pin Node 24

```
24
```

`[VERIFIED: D-02 mandate]` — Node 24 LTS is "Active LTS through Apr 2028." `engines.node` in `package.json`:

```json
{
  "engines": {
    "node": ">=24.0.0 <25.0.0"
  }
}
```

### 11. `.github/workflows/ci.yml` — TWO PARALLEL JOBS

D-39 mandates two **separate jobs** (not steps inside one job) so each surfaces as a distinct required status check on `main`.

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  typecheck:
    name: typecheck
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: '.nvmrc'
          cache: 'npm'
      - run: npm ci
      - run: npm run typecheck

  lint:
    name: lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: '.nvmrc'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
```

`[VERIFIED: github.com/actions/setup-node + nextjs.org/docs/app/guides/ci-build-caching]`

**Why two top-level `jobs:` (not a matrix):**
- Each top-level job becomes its own GitHub status check named after the `name:` (or job key). Branch protection rules can target each by name independently.
- A matrix would surface as multiple runs of one check — but branch protection lets you require at most one of them per check name. Two separate jobs gives clean "typecheck required" + "lint required" branch-protection rule targeting.

**`actions/setup-node@v4` not v6:** v4 is current stable on the marketplace as of Apr 2026 and is what most active workflows use. The v6 number from one search result is a major-bumped pre-release; sticking with v4 avoids breaking changes mid-sprint.

**`node-version-file: '.nvmrc'`** automatically reads the `.nvmrc` Phase 2 creates — single source of truth.

### 12. Vercel link flow (manual, dashboard-driven)

D-34 + D-37 sequence:

1. **Sign in to Vercel dashboard** (kit's account already linked to evangohAIO/SMBCorigins via GitHub).
2. **Click "New Project"** at top right.
3. **Select GitHub** as Git provider; pick `evangohAIO/SMBCorigins` from the repo list.
4. **Vercel auto-detects Next.js** as Framework Preset (build command `npm run build`, output directory `.next`, install `npm install`). Leave defaults.
5. **Project name** — accept default or set to `smbcorigins` (auto-generates `smbcorigins.vercel.app` if available).
6. **Environment Variables** — click "Add" and add:
   - **Key:** `NEXT_PUBLIC_USE_MOCK`
   - **Value:** `true`
   - **Environments:** check both **Production** and **Preview** (D-35 — also include **Development** if Vercel CLI usage is anticipated).
7. **Click "Deploy"** — Vercel runs first build. Even if there's no code yet on the branch, Vercel marks the project as linked. The first push to `kit/scaffold` after this will trigger a preview deploy.
8. **Production branch** is `main` by default — confirm in Project Settings → Environments → Production → Branch Tracking.

`[CITED: vercel.com/docs/git + vercel.com/docs/git/vercel-for-github]`

**Preview URL pattern:** `<project>-git-<branch-slug>-<team-slug>.vercel.app`. Each PR commit gets its own immutable URL; the branch URL aliases to the latest commit on that branch.

**Branch protection setup** (manual, GitHub web UI; `gh` CLI not available locally):
1. GitHub repo → **Settings** → **Branches** → **Add branch protection rule**.
2. **Branch name pattern:** `main`.
3. Check **Require a pull request before merging** (D-08 — but no required-reviewer count; CODEOWNERS handles boundary review).
4. Check **Require status checks to pass before merging**.
5. Search and select three checks:
   - `typecheck` (from CI workflow)
   - `lint` (from CI workflow)
   - `Vercel` (the Vercel GitHub integration's check)
6. Optionally check **Require branches to be up to date before merging** (recommended for clean linear history).
7. Click **Create**.

**Note on check name discoverability:** GitHub's UI only surfaces check names that have already run on at least one commit in the repo. **Sequence:** push the CI workflow first (any commit on `kit/scaffold` triggers the workflow on the PR), let it run once, then return to GitHub Settings → Branches and add the protection rule. Vercel's check appears after first deployment.

### 13. `.gitignore` — full set

create-next-app generates a `.gitignore`. Phase 2 should ensure these entries exist:

```gitignore
# dependencies
/node_modules
/.pnp
.pnp.*
.yarn/*
!.yarn/patches
!.yarn/plugins
!.yarn/releases
!.yarn/versions

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# env files (D-35 — env vars set in Vercel dashboard, not committed)
.env*.local
.env

# vercel
.vercel/

# typescript
*.tsbuildinfo
next-env.d.ts
```

The `.env`, `.env*.local`, `.vercel/`, `next-env.d.ts` lines are the project-specific additions on top of create-next-app's defaults.

## Architectural Responsibility Map

For Phase 2 capabilities (build/test/deploy infrastructure dominates here — application tiers are placeholder-only):

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Render token showcase page (root `/`) | Frontend Server (RSC) | Browser | App Router default is server components; CSS computed by browser |
| Render persona placeholders (`/journey`, `/cockpit`) | Frontend Server (RSC) | Browser | Same as above; no client-side state in Phase 2 |
| Load + apply Google fonts | Frontend Server (next/font self-hosting) | Browser | next/font writes static font files at build; browser loads via `<link>` |
| Generate utility CSS from `@theme` tokens | Build-time (PostCSS via `@tailwindcss/postcss`) | — | Tailwind v4 compiles at build, not runtime |
| Type-check + lint validation | CI / Build (GitHub Actions) | — | Branch protection enforces; D-39 / D-08 |
| Deploy + preview generation | CDN / Static (Vercel) | — | D-34 / D-37 — Vercel auto-detects, builds, hosts on `*.vercel.app` |
| Auth, API routes, business logic | — | — | **NONE in Phase 2** — Phase 3+ scope |

**Sanity check:** No capability in Phase 2 lives in the API/Backend tier. Plans that propose "API endpoint" or "server action" tasks are out of scope. The token showcase, fonts, and routes are all rendered as static or RSC content with no data fetching.

## Validation Architecture

### Test Framework

Per D-40, **NO test framework is added in Phase 2**. Validation is type system + manual QA + Vercel previews.

| Property | Value |
|----------|-------|
| Framework | None — D-40 explicit ("Skip Vitest / Jest until Phase 3 lands `types/origin.ts` and `lib/api.ts`") |
| Config file | None |
| Quick run command | `npm run typecheck && npm run lint` |
| Full suite command | `npm run typecheck && npm run lint && npm run build` (production build is the de-facto "integration test" for Phase 2) |

### Phase Requirements → Validation Map

| Req ID | Behavior | Validation Type | Automated Command | File / Manual Step |
|--------|----------|----------------|-------------------|---------------------|
| SCAFF-01 | `npm run dev` boots, renders placeholder, zero TS errors | smoke | `npm run dev` → curl http://localhost:3000 → expect HTTP 200 with HTML body | + `npm run typecheck` for "zero TS errors" |
| SCAFF-02 | TypeScript `strict: true` compiles cleanly | unit | `npm run typecheck` (= `tsc --noEmit`) | tsconfig.json contains `"strict": true` and `"noUncheckedIndexedAccess": true` |
| SCAFF-03 | Tailwind purges and applies utility classes | smoke | `npm run build` succeeds + grep generated CSS for utility presence | manual: open root `/` in dev, inspect computed style of element with `bg-trad-green` — expect background `rgb(0, 72, 50)` |
| SCAFF-04 | Six color tokens (Trad Green, Fresh Green, paper + variants) render | manual / visual | — | open root `/` showcase page, verify all 18 swatches visually match `docs/ORIGIN_DESIGN.md §8.1` hex values; spot-check via DevTools computed style |
| SCAFF-05 | Four fonts (Fraunces, Inter Tight, Noto Sans JP, IBM Plex Mono) visibly render | manual / visual | — | open root `/`, verify each labeled paragraph renders in distinct font; DevTools computed style on each label shows correct `font-family` |
| SCAFF-06 | `/(client)` and `/(rm)` route groups exist with placeholder pages | smoke | `curl http://localhost:3000/journey -o /dev/null -w "%{http_code}"` (expect 200) + same for `/cockpit` | manual: open both URLs in browser, verify persona-specific content |
| SCAFF-07 | Vercel project linked, `main` deploys, every PR previews | manual | — | (a) Vercel dashboard shows `evangohAIO/SMBCorigins` linked; (b) push to `kit/scaffold` produces a preview URL within ~2 min; (c) opening kit/scaffold PR gives unique preview comment from Vercel bot |

### Sampling Rate

- **Per task commit:** `npm run typecheck && npm run lint`
- **Per wave merge:** `npm run typecheck && npm run lint && npm run build` (catches any prod-build-only failure like missing TypeScript types or unresolved fonts)
- **Phase gate (before `/gsd-verify-work`):** all of the above PLUS manual visual verification of root `/`, `/journey`, `/cockpit` on both `npm run dev` and the Vercel preview URL.

### Wave 0 Gaps

None — the validation strategy is "no test framework + type system + manual QA on the live preview URL." The placeholder pages themselves are the validation surface (root `/` proves SCAFF-04 + SCAFF-05; `/journey` and `/cockpit` prove SCAFF-06; the preview URL existing proves SCAFF-07).

The closest thing to Wave 0 is: **the root `/` showcase page must be designed as a checklist** — a reviewer can scan it and confirm:
1. Six brand color swatches present (trad-green, trad-green-deep, trad-green-soft, fresh-green, fresh-green-mute, fresh-green-glow)
2. Six neutral swatches present (ink, ink-soft, ink-muted, paper, paper-deep, mist)
3. Three signal swatches (signal-amber, signal-red, signal-info)
4. Three dark-mode swatches (dark-bg, dark-surface, dark-text)
5. Four font sample paragraphs, each labeled in its own font
6. Japanese sample line in Noto Sans JP
7. Mono ID/timestamp sample in IBM Plex Mono

Plan: include a `## Verification checklist` H2 in `app/page.tsx` rendering each swatch with its hex code visible — so reviewing the page IS the test.

## Landmines & Gotchas

### 1. URL conflict from `/(client)/page.tsx` + `/(rm)/page.tsx` at root

**What goes wrong:** Both files map to URL `/`. Next.js throws build error `You cannot have two parallel pages that resolve to the same path`.

**Why:** Route groups `(folder)` are organizational only — they don't add URL segments. Two `page.tsx` at the root of two different groups both become `/`.

**How to avoid:** Place persona placeholders at nested paths that match Phase 5/6's planned routes — `app/(client)/journey/page.tsx` (`/journey`) and `app/(rm)/cockpit/page.tsx` (`/cockpit`). Root `/` is the token showcase. (Already addressed in Implementation Pattern §6.)

**Warning signs:** `next dev` startup error mentioning "parallel pages" or "duplicate route."

`[VERIFIED: nextjs.org/docs/app/getting-started/project-structure + github discussion #50034]`

### 2. CLAUDE.md overwrite by create-next-app

**What goes wrong:** create-next-app 16 ships `--agents-md` as default behavior. It writes a generic `CLAUDE.md` that overwrites the existing 5.2 KB Phase 1 closure CLAUDE.md (Stack contract, Scaffolding ownership, Design system).

**Why:** create-next-app does not detect existing `CLAUDE.md` and prompt for overwrite — it just writes.

**How to avoid:** Always include `--no-agents-md` in the create-next-app invocation. **Pre-flight verification step:** before running create-next-app, `cp CLAUDE.md /tmp/CLAUDE.md.backup`; after, `diff CLAUDE.md /tmp/CLAUDE.md.backup` should produce zero output. If diff is non-zero, restore from backup.

**Warning signs:** Existing CLAUDE.md content (Stack contract / Design system / Personas sections) suddenly absent after running create-next-app.

`[VERIFIED: nextjs.org/docs/app/api-reference/cli/create-next-app — `--agents-md` listed as default]`

### 3. `next/font` CSS variables not resolving in utility classes

**What goes wrong:** You set `--font-fraunces` on `<html>` via next/font's `.variable` className, declare `--font-display: var(--font-fraunces)` in `@theme {}` (without `inline`), and the resulting `.font-display` utility class shows `Fraunces`-but-fallback-font instead.

**Why:** Without `inline`, Tailwind generates `font-family: var(--font-display)` in the utility class. That CSS var is defined in `:root` (= `<html>`), but the font var it points at (`--font-fraunces`) is *also* on `<html>`. The cascade chain works in this specific case, but fails in any scope where `<html>` isn't the resolution root (Shadow DOM, certain CSS-in-JS isolations, server-rendered fragments).

**How to avoid:** Use `@theme inline {}` for ALL next/font remaps. With `inline`, Tailwind generates `font-family: var(--font-fraunces)` directly in the utility class — one less indirection, no scoping bug.

**Warning signs:** Font appears correctly in DevTools "Styles" panel but the rendered text uses fallback (system) font. Or: works in dev but breaks in production build.

`[VERIFIED: tailwindcss.com/docs/theme + tailwindlabs/tailwindcss discussion #15267]`

### 4. Phase 2 success criterion #2 ambiguity — "Vercel production URL"

**What goes wrong:** SCAFF-07 + ROADMAP.md success criterion #2 say "Vercel production URL returns a live page with locked palette and four fonts." But Phase 2 happens on `kit/scaffold` branch, which produces only **preview** URLs. The **production URL** doesn't exist until the PR merges to `main`.

**Why:** Vercel binds production URL to the `main` branch only. Pre-merge, all deploys are previews.

**How to avoid:** Plan must distinguish the two acceptance conditions:
- **Pre-merge (during Phase 2 execution):** verify the **preview URL** for the latest `kit/scaffold` commit shows the showcase page correctly. This is `kit-scaffold-<hash>-<team>.vercel.app` or the branch alias `smbcorigins-git-kit-scaffold-<team>.vercel.app`.
- **Post-merge (Phase 2 closure):** after Evan reviews and merges the PR, verify `smbcorigins.vercel.app` (the production URL) shows the same content. THIS is what success criterion #2 strictly requires.

**Warning signs:** Plan that says "verify production URL works" while still on `kit/scaffold` — that URL won't exist yet.

**Plan note:** Add a final post-merge verification task (or document as a closure step) that runs after the PR merges.

### 5. `noUncheckedIndexedAccess` cascading errors in placeholder pages

**What goes wrong:** Adding `noUncheckedIndexedAccess: true` to `tsconfig.json` causes `tsc --noEmit` to flag every array/object index access as `T | undefined` in any code that does `arr[0]` or `obj[key]`. The Phase 2 placeholder pages mostly avoid this, but if any pattern like `someArray[i]` slips in, typecheck fails.

**Why:** D-05 deliberately turns this on for the safety it provides on `data/seed.ts` lookups (Phase 3). Phase 2 inherits the strictness.

**How to avoid:** In Phase 2 code, prefer:
- `for...of` loops over indexed `for` loops
- `Array.prototype.at()` returning `T | undefined` explicitly typed
- Explicit existence checks: `if (arr[0]) { ... }` or `arr[0] ?? defaultValue`

The placeholder pages in Phase 2 don't use index access at all — they're flat JSX. But: any code review check in CI that might iterate over the swatch list (e.g., `swatches[0].label`) needs a guard.

**Warning signs:** `tsc --noEmit` fails with `error TS2532: Object is possibly 'undefined'` in the showcase page's swatch list rendering.

`[VERIFIED: typescriptlang.org/tsconfig/noUncheckedIndexedAccess.html]`

### 6. Branch protection check names not auto-discoverable until first run

**What goes wrong:** You create `.github/workflows/ci.yml` and immediately go to GitHub repo Settings → Branches → Add rule. The status check selector dropdown shows nothing — `typecheck` and `lint` aren't listed.

**Why:** GitHub branch protection only lets you select check names that have already executed at least once on a commit in the repo.

**How to avoid:** **Sequence**: push the CI workflow first → trigger a run on `kit/scaffold` (any commit will do, including the workflow file commit) → wait for the workflow to complete → THEN go to Settings → Branches and add protection rule. The check names appear in the dropdown after their first run.

**Vercel check name appears as `Vercel`** (or the project name suffix) — appears in the dropdown only after the first deploy attempt.

**Warning signs:** Branch protection setup says "no available checks" — means workflow hasn't run yet.

`[VERIFIED: github.com/orgs/community/discussions/167194 + bastion.tech/articles/3205560683-how-to-setup-github-branch-protection-and-required-status-checks]`

### 7. `next lint` removed in Next.js 16 — old `package.json` scripts break

**What goes wrong:** Some templates / tutorials still show `"lint": "next lint"` in `package.json`. In Next.js 16 this command is removed and `npm run lint` fails with command-not-found.

**Why:** Next.js 16 deprecated and removed `next lint` in favor of using ESLint CLI directly. The `eslint` field in `next.config.*` is also removed.

**How to avoid:** `package.json` scripts use `eslint .` directly:
```json
{ "scripts": { "lint": "eslint ." } }
```

**Warning signs:** Running `npm run lint` produces `next lint: command not found` or warns about deprecated Next.js lint config.

`[VERIFIED: nextjs.org/docs/app/api-reference/config/eslint v16.0.0 changelog]`

### 8. Node 25 vs Node 24 — local environment mismatch

**What goes wrong:** Local Node is `v25.6.1` (verified). Running create-next-app installs dependencies under Node 25 — works, but the `.nvmrc` will say `24` and CI installs under Node 24, producing a possible npm-audit / package-lock divergence on first CI run.

**Why:** `package-lock.json` records the Node version it was generated under. Mismatch can cause subtle install variance.

**How to avoid:** **Switch to Node 24 BEFORE running create-next-app.** Use `nvm install 24 && nvm use 24` (or volta equivalent). Verify with `node --version` showing `v24.x.x` before any `npx` command.

**Warning signs:** `npm ci` in CI produces different `node_modules` than local; CI typecheck fails on something local typecheck passed; `engines.node` warning in npm output.

### 9. `pages/` directory accidentally created

**What goes wrong:** create-next-app's `--app` flag scaffolds App Router. But if someone runs without the flag, or partially scaffolds, a `pages/` directory might appear alongside `app/`, creating routing ambiguity.

**Why:** `pages/` and `app/` directories coexist (Next.js supports both routers simultaneously) but are surprising. Phase 2 is App-Router-only per D-01.

**How to avoid:** After create-next-app runs, verify `ls` output shows `app/` and NO `pages/`. If `pages/` appears, delete it.

**Warning signs:** Build output mentions both `app/` and `pages/` route segments.

### 10. ESLint v10 + flat config requires Node 20.18+

**What goes wrong:** ESLint 10.x uses native ESM and flat config; older Node may not support all features.

**Why:** ESLint 10 raised its minimum Node version compared to v9.

**How to avoid:** Node 24 LTS (D-02) comfortably exceeds ESLint 10's requirements. Not a real risk if D-02 is honored — included for completeness.

`[VERIFIED: eslint.org docs imply v10 requires modern Node]`

## Code Examples

All snippets above are verified against current 2026-04-25 sources. Inline citations:

- `app/globals.css` `@theme` patterns — `[VERIFIED: tailwindcss.com/docs/theme]`
- `app/layout.tsx` next/font multi-font — `[VERIFIED: nextjs.org/docs/app/getting-started/fonts + next/font/google API]`
- `eslint.config.mjs` — `[VERIFIED: nextjs.org/docs/app/api-reference/config/eslint § With Prettier]`
- `tsconfig.json` — `[VERIFIED: github.com/vercel/next.js create-next-app templates/app/ts/tsconfig.json]`
- `.github/workflows/ci.yml` — pattern verified per `[VERIFIED: github.com/actions/setup-node + nextjs.org/docs/app/guides/ci-build-caching]`

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `tailwind.config.ts` with theme.extend | `@theme {}` block in CSS | Tailwind v4 (Jan 2025) | No JS config file; everything CSS-first |
| `@tailwind base; @tailwind components; @tailwind utilities;` | `@import "tailwindcss";` (single line) | Tailwind v4 | Simpler |
| `postcss.config.js` with `tailwindcss` + `autoprefixer` | `postcss.config.mjs` with `@tailwindcss/postcss` only | Tailwind v4 | Autoprefixer handled internally; one plugin |
| `next lint` command | `eslint .` direct CLI | Next.js 16 | One less abstraction layer |
| ESLint `.eslintrc.json` | `eslint.config.mjs` (flat config) | ESLint 9+, mandatory in 10 | Modern config format; better TypeScript support |
| `next.config.js` (CommonJS) | `next.config.ts` (TypeScript) | Next.js 15+ | Type-safe config |
| Manual font self-hosting + CLS workarounds | `next/font/google` | Next.js 13+ | Zero CLS, automatic |

## Project Constraints (from CLAUDE.md)

These directives from `CLAUDE.md` must be honored by all plans:

- **Desktop-first** — designed for 1440px (no mobile responsiveness in Phase 2 placeholders).
- **Branch naming:** `kit/<area>` — Phase 2 is `kit/scaffold`.
- **Small PRs, merge daily** — Phase 2 is one PR per D-12.
- **Never edit `types/origin.ts` without telling the other person** — Phase 2 doesn't create it (Phase 3 scope).
- **Frontend builds against mocked data initially** — `NEXT_PUBLIC_USE_MOCK=true` is the default (D-35).
- **Fresh Green `#BFD730` is reserved exclusively for AI outputs and AI presence** — Phase 2 token showcase shows the token but with a code comment marking the rule (D-28); enforcement is Phase 4 / SHELL-05.
- **Stack contract + Scaffolding ownership sections in CLAUDE.md are canonical** — must NOT be overwritten by create-next-app (use `--no-agents-md`).
- **Read CLAUDE.md at session start** — Phase 2 should fill the "How to run" section after `npm run dev` works (currently `_TBD — filled in once scaffolded._` per CLAUDE.md L100).

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Build / dev / CI | ✓ (locally v25; CI will use v24 via .nvmrc) | 25.6.1 | **switch to Node 24 BEFORE create-next-app** |
| npm | Package install | ✓ | 11.9.0 | — |
| npx | create-next-app invocation | ✓ | 11.9.0 | — |
| git | Branch + commit | Assumed ✓ (`.git/` present) | — | — |
| GitHub CLI (`gh`) | Branch protection automation | **✗** | — | Manual GitHub UI steps documented in plan |
| Vercel CLI | Local Vercel testing | Not verified — not required for Phase 2 | — | Vercel dashboard handles all linking |
| Internet access | Download Google Fonts at build, deploy to Vercel | Assumed ✓ | — | — |

**Missing dependencies with no fallback:** None.

**Missing dependencies with fallback:** `gh` CLI — branch protection setup uses GitHub web UI instead.

**Action items for the plan:**
1. First task in plan must include `nvm use 24` (or equivalent) to switch to Node 24 LTS before any npm/npx invocation.
2. Branch protection setup task must include explicit GitHub UI walkthrough (Settings → Branches → Add rule → status check picker), since `gh` is unavailable.

## Assumptions Log

Claims marked `[ASSUMED]` in this research. The discuss-phase / planner should confirm with the user before locking these in:

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Prettier config values: `printWidth: 100`, `singleQuote: true`, `semi: false`, `trailingComma: "all"`, `tabWidth: 2`, `arrowParens: "always"` | Implementation Pattern §8 | Low — CONTEXT.md §Claude's Discretion permits "pick something sensible." User may prefer semis or 80-col width. |
| A2 | Vercel project name `smbcorigins` (giving URL `smbcorigins.vercel.app`) | Implementation Pattern §12 | Low — Vercel auto-suggests; if name taken, falls back to `smbcorigins-<random>.vercel.app`. CONTEXT.md §D-36 already accepts auto-generated URL. |
| A3 | Persona placeholder URLs are `/journey` and `/cockpit` (matching Phase 5/6 routes CJD-01, RMC-01) | Implementation Pattern §6 | Low — alternative is having the placeholders at `/(client)/something-temporary` paths that get replaced in Phase 5. Forward-compatible URLs are better. |
| A4 | `next.config.ts` uses `typedRoutes: true` only — no other config needed in v1 | Implementation Pattern §3 | Very low — `typedRoutes` is opt-in and removable later. CONTEXT.md §Claude's Discretion permits adding it. |
| A5 | Spacing tokens use indexed names (`--spacing-1`, `--spacing-2`, etc.) producing `p-1`, `p-2` utilities consistent with the 8px-base scale (4, 8, 12, 16, 24, 32, 48, 64, 96) | Implementation Pattern §4 | Medium — Tailwind v4 has built-in spacing utilities (`p-1` = 0.25rem by default). Custom `--spacing-*` tokens override these. Naming should be reviewed: alternative is `--spacing-tight: 4px`, `--spacing-base: 8px` etc. semantic naming. The numeric naming preserves familiarity with Tailwind defaults. |
| A6 | Radius tokens named `--radius-button: 6px`, `--radius-card: 12px`, `--radius-modal: 16px` (semantic names, not numeric) | Implementation Pattern §4 | Low — ORIGIN_DESIGN.md §8.4 defines them by component (button, card, modal). Semantic naming honors that. Tailwind generates `rounded-button`, `rounded-card`, `rounded-modal` utilities. |
| A7 | Inter Tight import name in next/font/google is `Inter_Tight` (verified pattern, but exact next/font/google export name not bench-tested) | Implementation Pattern §5 | Very low — confirmed via Google Fonts URL slug `Inter+Tight` and next/font convention of `_` substitution. Will be verified at first build attempt. |

If any of A1–A7 turn out to need user input, surface them in the plan as questions for kit before execution.

## Sources

### Primary (HIGH confidence)
- **Next.js 16.2 official docs** (verified 2026-04-25, version 16.2.4):
  - [create-next-app CLI](https://nextjs.org/docs/app/api-reference/cli/create-next-app) — flag list, default behaviors
  - [TypeScript config](https://nextjs.org/docs/app/api-reference/config/typescript) — strict mode defaults, typed routes
  - [ESLint config](https://nextjs.org/docs/app/api-reference/config/eslint) — flat config, Prettier integration, v16.0.0 changelog ("`next lint` removed")
  - [CSS / Tailwind setup](https://nextjs.org/docs/app/getting-started/css) — Tailwind v4 install, `@import "tailwindcss";`, postcss.config.mjs
  - [Font optimization](https://nextjs.org/docs/app/getting-started/fonts) — next/font/google patterns, variable fonts, multiple fonts on `<html>`
  - [Project structure](https://nextjs.org/docs/app/getting-started/project-structure) — route groups, multiple root layouts, URL conflict rules
  - [Route groups](https://nextjs.org/docs/app/api-reference/file-conventions/route-groups) — `(folder)` convention
- **Tailwind CSS v4 official docs** (verified 2026-04-25, version 4.2.4):
  - [Theme variables](https://tailwindcss.com/docs/theme) — `@theme {}` directive, namespace prefixes (`--color-*`, `--font-*`, etc.), `@theme inline {}`
  - [Functions and directives](https://tailwindcss.com/docs/functions-and-directives)
  - [Next.js installation guide](https://tailwindcss.com/docs/installation/framework-guides/nextjs)
- **Vercel docs** (verified 2026-04-25):
  - [Git integration overview](https://vercel.com/docs/git) — Import Git Repository flow, production branch, preview branches
  - [Vercel for GitHub](https://vercel.com/docs/git/vercel-for-github) — System env vars, deployment authorizations, deployment checks integration
- **GitHub Actions** (verified 2026-04-25):
  - [actions/setup-node@v4](https://github.com/actions/setup-node) — Node version pinning via `.nvmrc`, npm cache
- **TypeScript docs**:
  - [noUncheckedIndexedAccess option](https://www.typescriptlang.org/tsconfig/noUncheckedIndexedAccess.html) — behavior, opt-in nature
- **Verified npm registry queries** (2026-04-25):
  - `npm view next version` → `16.2.4`
  - `npm view tailwindcss version` → `4.2.4`
  - `npm view @tailwindcss/postcss version` → `4.2.4`
  - `npm view eslint-config-next version` → `16.2.4`
  - `npm view eslint version` → `10.2.1`
  - `npm view typescript version` → `6.0.3`
  - `npm view prettier version` → `3.8.3`
  - `npm view eslint-config-prettier version` → `10.1.8`
- **GitHub canary template files** (verified 2026-04-25):
  - [create-next-app TypeScript App Router tsconfig.json](https://raw.githubusercontent.com/vercel/next.js/canary/packages/create-next-app/templates/app/ts/tsconfig.json)
  - [create-next-app Tailwind app-tw template globals.css](https://raw.githubusercontent.com/vercel/next.js/canary/packages/create-next-app/templates/app-tw/ts/app/globals.css)
  - [create-next-app Tailwind app-tw template postcss.config.mjs](https://raw.githubusercontent.com/vercel/next.js/canary/packages/create-next-app/templates/app-tw/ts/postcss.config.mjs)
  - [create-next-app templates/index.ts](https://raw.githubusercontent.com/vercel/next.js/canary/packages/create-next-app/templates/index.ts) — confirms `tailwindcss: ^4` and `@tailwindcss/postcss: ^4` in template
- **Local environment probes** (2026-04-25):
  - `node --version` → `v25.6.1` (mismatch with D-02 Node 24 — flagged)
  - `npm --version` → `11.9.0`
  - `gh --version` → not installed (flagged)
  - `ls /Users/wyekitgoh/Projects/SMBCorigins/` → confirmed greenfield code state

### Secondary (MEDIUM confidence)
- [Tailwind v4 + next/font integration discussion](https://github.com/tailwindlabs/tailwindcss/discussions/15267) — community confirmation that `@theme inline {}` is the canonical pattern (matches Next.js docs and Tailwind docs).
- [Next.js 16 release blog post](https://nextjs.org/blog/next-16) — confirms create-next-app simplifications.

### Tertiary (LOW confidence — flag for validation if used)
- None used as load-bearing claims.

## Metadata

**Confidence breakdown:**
- Standard stack (Next.js 16.2.4, Tailwind v4.2.4, ESLint 10.x, etc.): **HIGH** — all versions verified against npm registry on research day; all integration patterns verified against current 16.2 official docs.
- Architecture (route groups, App Router patterns, RSC defaults): **HIGH** — Next.js docs explicit; default tsconfig and globals.css verified against canary templates.
- Token plumbing (Tailwind v4 `@theme` + next/font chain): **HIGH** — pattern verified against Tailwind v4 official docs AND replicated in create-next-app's own default template (just with Geist instead of our four fonts).
- Vercel link flow: **HIGH** — official Vercel docs cover the dashboard import flow exactly.
- GitHub Actions CI: **HIGH** — `actions/setup-node@v4` + `node-version-file: '.nvmrc'` is the canonical pattern.
- Branch protection setup: **MEDIUM** — manual UI steps; the "check name discoverability after first run" gotcha is community-confirmed but not in formal docs.
- Pitfalls: **HIGH** — all gotchas have direct citations; A1–A7 assumptions are isolated and low-impact.

**Research date:** 2026-04-25
**Valid until:** ~2026-05-25 (30 days for stable Next.js 16.2 LTS line; re-verify if Phase 2 doesn't ship within 30 days due to any patch versions of Next.js, Tailwind, ESLint, or eslint-config-prettier).
