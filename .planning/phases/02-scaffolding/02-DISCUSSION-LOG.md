# Phase 2: Scaffolding - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-25
**Phase:** 02-scaffolding
**Areas discussed:** Design tokens & Fresh Green rule, Font loading strategy, Vercel bootstrap & day-1 URL, Tooling baseline & placeholders

---

## Design tokens & Fresh Green rule

### Q1: How should design tokens land in the codebase? Tailwind v4 changed token wiring — the `@theme` directive auto-generates utilities AND exposes CSS vars.

| Option | Description | Selected |
|--------|-------------|----------|
| Tailwind v4 @theme (Recommended) | Define tokens in `app/globals.css` inside `@theme { --color-trad-green: #004832; ... }`. Tailwind auto-generates utilities (`bg-trad-green`, `text-paper`) AND exposes CSS vars (`var(--color-trad-green)` for gradients/style attrs). Idiomatic v4, single source of truth, ergonomic for downstream phases. | ✓ |
| Plain CSS custom properties only | Copy ORIGIN_DESIGN.md §8.1 verbatim into `:root { --trad-green: #004832; ... }`. No utility classes generated — every use site writes `style={{ color: 'var(--trad-green)' }}` or className with arbitrary values. Faithful to the design doc but loses Tailwind ergonomics. | |
| Hybrid — @theme for colors, plain vars for spacing/radius | Tokens that benefit from utilities (colors, fontFamily) go in @theme. Tokens that don't naturally map to utilities (spacing already in Tailwind defaults, radius scale) stay as plain CSS vars. More fiddly but gives finer-grained control. | |

**User's choice:** Tailwind v4 @theme (Recommended)

### Q2: Which tokens from ORIGIN_DESIGN.md §8 should ship in Phase 2?

| Option | Description | Selected |
|--------|-------------|----------|
| All §8 tokens (Recommended) | Port the full set: 6 trad/fresh-green variants, 6 neutrals (ink/paper/mist), 3 signals (amber/red/info), 3 dark-mode tokens, plus typography families, spacing scale (4..96), radius scale (6/12/16). Matches §8 verbatim. Phases 3+ never have to revisit token plumbing. Cost: a one-time longer @theme block. | ✓ |
| v1-essential subset | Trad Green, Fresh Green, warm paper, ink, ink-soft, mist + typography families only. Defer signals/dark-mode/scale tokens to phases that need them. Smaller surface to verify in SCAFF-04 acceptance, but adds friction whenever a later phase reaches for `--signal-amber` or `--paper-deep`. | |
| v1-essential + signals (no dark mode) | Full light-mode palette (greens + neutrals + signals). Skip dark mode tokens — ORIGIN_DESIGN.md notes dark mode as "RM cockpit option" which isn't in v1 scope. Reasonable middle: covers everything Phase 5/6 will hit without paying for dark mode plumbing. | |

**User's choice:** All §8 tokens (Recommended)

### Q3: How should the Fresh Green AI-only rule (#BFD730 only on AI surfaces) be enforced?

| Option | Description | Selected |
|--------|-------------|----------|
| Defer enforcement to Phase 4 (Recommended) | Phase 2 ships tokens with documentation: comment in globals.css "// Fresh Green = AI-only — see CLAUDE.md §Design system". Phase 4 lands `AIPulseDot` primitive + SHELL-05's grep/lint check, which is the natural enforcement seam (the requirement says "lint rule, grep check, or visual audit"). Nothing to enforce yet — no AI surfaces exist in Phase 2. | ✓ |
| Naming convention now | Rename the token from `--color-fresh-green` to `--color-ai-pulse` so the className signals intent at use site (`bg-ai-pulse` reads as "this is an AI surface"). Most lightweight enforcement — the rule travels with the code, no tooling needed. Cost: diverges from the brand-document name "Fresh Green". | |
| Grep check in CI now | Add a CI step that greps for `fresh-green` outside an allowlist (initially empty, Phase 4 adds `components/ai/**`). Concrete and verifiable. Cost: noisy until Phase 4 lands its AI surfaces, and the allowlist needs maintenance. | |
| ESLint custom rule | Write a project-local ESLint rule disallowing `(bg|text|border)-fresh-green` outside specific paths. Most rigorous but heaviest to author for a prototype — ESLint custom rules are a real time-sink. | |

**User's choice:** Defer enforcement to Phase 4 (Recommended)

### Q4: Where do the design tokens live as a file?

| Option | Description | Selected |
|--------|-------------|----------|
| Single `app/globals.css` (Recommended) | All tokens in one file at `app/globals.css` inside the `@theme {}` block, alongside `@import 'tailwindcss';` and any base resets. Tailwind v4 idiomatic, easy to navigate, matches what next/tailwind starters do. | ✓ |
| Split: `styles/tokens.css` + `app/globals.css` | Tokens in `styles/tokens.css`, imported by `app/globals.css` via `@import './tokens.css';`. Useful if tokens grow large or you want CSS modules to import tokens directly. Adds a file for arguably no benefit at v1. | |

**User's choice:** Single `app/globals.css` (Recommended)

---

## Font loading strategy

### Q1: How should the four fonts (Fraunces, Inter Tight, Noto Sans JP, IBM Plex Mono) load?

| Option | Description | Selected |
|--------|-------------|----------|
| next/font/google (Recommended) | App Router idiomatic. Next.js auto-hosts the fonts at build time, generates `font-display: swap` + `size-adjust` to prevent CLS, and exposes each font as a CSS variable (`fraunces.variable` → `--font-fraunces`). Wires directly into Tailwind v4 @theme via `--font-display: var(--font-fraunces)`. Zero third-party requests at runtime. | ✓ |
| Direct <link> to Google Fonts CDN | Add `<link rel='stylesheet' href='https://fonts.googleapis.com/...'>` in the root layout. Simpler conceptually, but: third-party request at runtime, no CLS protection, no auto-subsetting, Next.js ESLint will warn. | |
| Self-hosted .woff2 files | Download font files into `public/fonts/`, declare `@font-face` in globals.css. Maximum control (no Google dependency, full Fraunces variable axes available), but: manual subsetting work, file maintenance, no auto-CLS guards. Heavy for a prototype. | |

**User's choice:** next/font/google (Recommended)

### Q2: Fraunces is a variable font with opsz, SOFT, WONK axes. How should we load it?

| Option | Description | Selected |
|--------|-------------|----------|
| Variable wght only via next/font (Recommended) | Use next/font/google's default — weight as variable axis (300-900), no opsz/SOFT/WONK. ORIGIN_DESIGN.md says "opsz + SOFT + WONK axes" but those aren't strictly needed for the demo. Smallest bundle, cleanest integration. Can revisit if Phase 5+ designs call for opsz scaling. | ✓ |
| Variable wght + opsz via next/font | Pass `axes: ['opsz']` to next/font/google to enable optical-size scaling — Fraunces was designed for this; lets large display headings auto-scale glyphs. SOFT and WONK are not exposed by Google Fonts' next/font integration, so they can't be loaded this way regardless. Slightly larger bundle. | |
| Self-host full variable file | Download the upstream Fraunces variable font (with all four axes: wght, opsz, SOFT, WONK), self-host. Only path that exposes SOFT and WONK. Required only if the design genuinely uses them. Adds maintenance and bundle weight. | |

**User's choice:** Variable wght only via next/font (Recommended)

### Q3: Noto Sans JP includes a massive Japanese glyph set. Subsetting strategy?

| Option | Description | Selected |
|--------|-------------|----------|
| next/font subsets: ['latin'] only (Recommended) | Load Noto Sans JP with the Latin subset only — the demo uses Japanese characters in a small set of strings (縁 watermark, persona names like 海星製造, bilingual greetings). next/font auto-loads `unicode-range` so the JP subset only fetches when characters from that range render. Standard approach. Lightest first paint. | ✓ |
| next/font subsets: ['latin', 'japanese'] | Explicitly request the Japanese subset. Larger payload (~1-3 MB extra) but JP characters are guaranteed to render with the right glyphs immediately. For desktop-only demo on fast networks, the cost is acceptable. | |
| Variable axis weight 500 only, latin subset | Per ORIGIN_DESIGN.md §8.2 "weight 500 default". Pin to weight 500 only with latin subset — smallest possible bundle. Risks: any Phase 5+ design wanting weight 400 or 700 needs a font reload. | |

**User's choice:** next/font subsets: ['latin'] only (Recommended)

### Q4: How should fonts wire into Tailwind utilities (so Phase 4+ can use `font-display`, `font-body`, `font-jp`, `font-mono`)?

| Option | Description | Selected |
|--------|-------------|----------|
| next/font CSS vars → @theme → utilities (Recommended) | next/font exposes `fraunces.variable` (e.g., `--font-fraunces`). Add to @theme: `--font-display: var(--font-fraunces); --font-body: var(--font-inter-tight); --font-jp: var(--font-noto-jp); --font-mono: var(--font-ibm-plex-mono);`. Tailwind v4 auto-generates `font-display`, `font-body`, `font-jp`, `font-mono` utilities. Apply variables to <html> in root layout. | ✓ |
| next/font className on root, no Tailwind mapping | Apply `${fraunces.className} ${interTight.className} ...` to <html>. Skip @theme mapping. Use raw font-family CSS at use-site. Simpler but loses utility ergonomics — every site that needs Fraunces writes `style={{ fontFamily: 'var(--font-fraunces)' }}` or similar. | |

**User's choice:** next/font CSS vars → @theme → utilities (Recommended)

---

## Vercel bootstrap & day-1 URL

### Q1: How should the Vercel project get linked to the GitHub repo?

| Option | Description | Selected |
|--------|-------------|----------|
| Vercel dashboard 'Import Git Repository' (Recommended) | One-time UI flow: Vercel dashboard → Add New → Project → Import evangohAIO/SMBCorigins. Vercel auto-detects Next.js, configures build, and starts watching the repo. After this, every push to main → production deploy, every PR → preview deploy. Simplest first-time path; no local CLI auth dance. | ✓ |
| Vercel CLI from local repo | Run `npx vercel link` and `npx vercel --prod` from the repo root. Faster if you've authed Vercel CLI before; produces `.vercel/project.json` (which gets gitignored). Same result, more terminal-driven. | |
| Vercel CLI inside kit/scaffold PR | Bake the link step into the scaffolding PR's execution — Claude runs `vercel link` as part of plan execution. Most automated but requires Vercel auth tokens in the executor's environment, which is a friction point. | |

**User's choice:** Vercel dashboard 'Import Git Repository' (Recommended)

### Q2: What env vars get set on Vercel at link time?

| Option | Description | Selected |
|--------|-------------|----------|
| NEXT_PUBLIC_USE_MOCK=true on Production + Preview (Recommended) | CLAUDE.md and PROJECT.md state mock-first frontend with env-flag swap. Setting `true` on both environments now means Phase 3+ doesn't have to flip anything to keep working — the swap to `false` happens later when Evan's backend is ready. No other env vars needed in Phase 2 (Supabase keys come in Phase 3). | ✓ |
| No env vars at link time — add as needed | Skip env var setup entirely; Phase 3 handles when it introduces lib/api.ts. Keeps Phase 2 surface area minimal but means the mock-vs-real switch isn't validated end-to-end on Vercel until Phase 3. | |
| NEXT_PUBLIC_USE_MOCK=true Production, =false Preview | Use Preview as the "real backend" channel so Vercel previews can validate against Evan's hosted Supabase dev project (per D-04). Right shape long-term, but Phase 2 has no real backend yet — setting `false` on previews would either no-op (no api.ts code paths exist) or require placeholder. Premature. | |

**User's choice:** NEXT_PUBLIC_USE_MOCK=true on Production + Preview (Recommended)

### Q3: Domain for the Day 1 URL?

| Option | Description | Selected |
|--------|-------------|----------|
| Auto *.vercel.app (Recommended) | Use Vercel's auto-generated domain (e.g., smbcorigins.vercel.app) for v1. Zero DNS work, zero waiting. Custom domains can land in a polish phase before final stakeholder demo. Phase 2's success criterion #2 says "live page styled with the locked color palette" — the URL surface itself isn't the demo moment. | ✓ |
| Custom domain (e.g., origin.smbc.demo) | Configure a custom domain at link time. Adds DNS + SSL cert wait time (minutes to hours). Worth it only if a specific URL is needed for stakeholder demo materials. Not in scope per CLAUDE.md / REQUIREMENTS.md. | |

**User's choice:** Auto *.vercel.app (Recommended)

### Q4: When does the Vercel link happen relative to the kit/scaffold PR?

| Option | Description | Selected |
|--------|-------------|----------|
| Link Vercel BEFORE first push to kit/scaffold (Recommended) | Sequence: (1) Kit links GitHub repo to Vercel via dashboard — ~2 min one-time. (2) Run `create-next-app` locally on `kit/scaffold` branch. (3) First push triggers a Vercel preview deploy of the bare scaffold. (4) PR merges to main — production URL goes live with the styled scaffold. Each later commit gets a preview URL. Validates the deploy pipeline incrementally during scaffolding work itself. | ✓ |
| Link Vercel AFTER kit/scaffold merges to main | Sequence: (1) Build entire scaffold on kit/scaffold, PR review/merge happens against main with no deploys yet. (2) After merge, link Vercel to the repo; first deploy comes from main. Cleaner first deploy (no "half-baked" previews) but loses the preview validation on the scaffolding PR itself — you don't see the live URL until everything's already merged. Risks a late surprise (e.g., env-var or build-config issue) at the worst time. | |

**User's choice:** Link Vercel BEFORE first push to kit/scaffold (Recommended)

---

## Tooling baseline & placeholders

### Q1: Path aliases and Tailwind v4 plugins — starter config?

| Option | Description | Selected |
|--------|-------------|----------|
| Defaults only (Recommended) | Keep `@/*` → repo root from create-next-app's tsconfig.json (with no src/ per D-10, this means `@/components`, `@/lib`, `@/types`, `@/data`). No Tailwind plugins — v4 has aspect-ratio and container-queries built in; @tailwindcss/typography and /forms aren't needed for Phase 2 work. Add later only when a phase actually wants them. | ✓ |
| Custom aliases per directory | Define explicit aliases: `@/components`, `@/lib`, `@/types`, `@/data`, `@/app`. Slightly more typing in tsconfig.json paths config; identical import ergonomics to the `@/*` default. Largely cosmetic. | |
| Defaults + @tailwindcss/typography | Keep `@/*`. Add @tailwindcss/typography plugin now in anticipation of Phase 8's Credit Memo Drafter rendering AI-authored prose. Premature — Phase 8 is weeks away and may want different prose styling. | |

**User's choice:** Defaults only (Recommended)

### Q2: GitHub Actions CI workflow shape (D-08 says 'CI typecheck + lint + Vercel preview must pass')?

| Option | Description | Selected |
|--------|-------------|----------|
| Single .github/workflows/ci.yml with two jobs (Recommended) | One workflow file with parallel `typecheck` and `lint` jobs. Each job becomes a distinct required status check on main. Vercel preview is the third required check (provided by the Vercel GitHub integration). Three required checks total — clean mapping to D-08's wording. | ✓ |
| Separate workflows: typecheck.yml + lint.yml | Each in its own file. More flexible to evolve independently, but adds workflow files for no real benefit at Phase 2 — they share the same trigger and same npm install setup. | |
| No GHA — rely on Vercel build's typecheck only | Vercel's Next.js build fails on TS errors out of the box. Skip GHA entirely; Vercel preview becomes the single required status check. Lightweight but: lint isn't covered (Vercel doesn't run ESLint by default unless Next.js build does, which depends on next.config), and you lose fast-fail typecheck-only CI. | |

**User's choice:** Single .github/workflows/ci.yml with two jobs (Recommended)

### Q3: Pre-commit hooks (husky + lint-staged) and testing framework — adopt now or defer?

| Option | Description | Selected |
|--------|-------------|----------|
| No husky, no test framework (Recommended) | Skip pre-commit hooks (CI catches issues; hooks slow commits). Skip Vitest/Jest until Phase 3 lands `types/origin.ts` and `lib/api.ts` — those are the things actually worth unit-testing. Demo prototype's QA stack is types + manual QA + Vercel previews, not unit tests. | ✓ |
| Husky + lint-staged, no test framework | Add husky + lint-staged so `npm install` wires up a pre-commit hook that runs ESLint on staged files. Catches issues before push at the cost of slower commits. Still no test framework. | |
| Husky + Vitest now | Adopt both up front. Most front-loaded but Phase 2 has nothing to test (no business logic exists yet). Cost without payoff at Phase 2. | |

**User's choice:** No husky, no test framework (Recommended)

### Q4: What do the route group placeholders and root `/` page render? (SCAFF-04 and SCAFF-05 acceptance — 'Vercel URL shows palette and all four fonts visibly rendering' — hinge on this.)

| Option | Description | Selected |
|--------|-------------|----------|
| Root `/` is a token showcase, /(client) and /(rm) are persona placeholders (Recommended) | Root `/` is THE Phase 2 demo URL: a single page rendering all 6 color tokens as labeled swatches, all 4 fonts as labeled sample paragraphs (each font's name set in itself), and a small Trad/Fresh Green callout. Acts as proof-of-life for SCAFF-04 + SCAFF-05. /(client) renders 'Yukiさん、ようこそ — Welcome, Yuki' (proves Noto Sans JP renders). /(rm) renders 'James Lee — RM Cockpit' (proves Inter Tight + IBM Plex Mono). Each placeholder also has a top-strip nav link back to /. | ✓ |
| All three pages render the same token showcase | Same content at /, /(client)/[anything], /(rm)/[anything]. Validates routing without persona-specific text. Wastes a chance to put bilingual / Japanese text in front of the user on day 1. | |
| Minimal: text-only placeholders, root redirects to /(client) | Root `/` redirects to /(client). Each persona route renders just its name. Misses the SCAFF-04+SCAFF-05 visual-acceptance moment — the live URL would show 'Yuki' on warm paper but no obvious palette/font proof. Reviewers (and you) would have to check globals.css to know tokens are wired. | |

**User's choice:** Root `/` is a token showcase, /(client) and /(rm) are persona placeholders (Recommended)

---

## Closure check

### Q: We've discussed Design tokens, Font loading, Vercel bootstrap, and Tooling/placeholders. Anything else to clarify before writing CONTEXT.md?

| Option | Description | Selected |
|--------|-------------|----------|
| I'm ready for context | Write CONTEXT.md and DISCUSSION-LOG.md with the 16 decisions captured. Smaller items (Prettier config, exact next.config.ts contents, root-layout metadata, branch-naming inheritance) become Claude's Discretion or follow established Phase 1 patterns. | ✓ |
| Explore more gray areas | Surface 2-4 additional gray areas based on what we've discussed so far. | |

**User's choice:** I'm ready for context

---

## Claude's Discretion

Per CONTEXT.md, the following are not locked decisions and the executor has flexibility:
- Exact prose phrasing of placeholder content (Yuki's greeting wording, James's stat line, swatch labels)
- Exact ordering of color swatches on the showcase page
- Exact ESLint flat-config rule set beyond Next.js + Prettier defaults
- Exact Prettier config values (line width, quotes, semis)
- `next.config.ts` (or `.mjs`) shape — likely just defaults
- Root layout `<head>` metadata
- `.gitignore` additions
- README.md updates noting `npm run dev` and the live URL

## Deferred Ideas

Per CONTEXT.md `<deferred>` section:
- Testing framework choice (Vitest/Jest/Playwright) — Phase 3+
- Secrets handling pattern — Phase 3
- `data/seed.ts` divergence governance — Phase 3
- Fraunces opsz axis — revisit if Phase 5+ needs it
- Fraunces SOFT and WONK axes — defer indefinitely
- @tailwindcss/typography — Phase 8 prose rendering
- @tailwindcss/forms — likely never for v1
- Custom domain — pre-stakeholder-demo polish
- Husky / lint-staged — only if commit-time noise becomes a problem
- Fresh Green AI-only enforcement — Phase 4 (SHELL-05)
- Dark-mode wiring — out of v1 scope
- README.md rewrite, CLAUDE.md "How to run" section — Phase 2 may add minimal versions
