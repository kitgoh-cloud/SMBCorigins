# Phase 2: Scaffolding - Context

**Gathered:** 2026-04-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Stand up the Next.js repo so that `npm run dev` boots a TypeScript-strict, Tailwind-styled app with all four fonts and design tokens applied, both persona route groups (`/(client)`, `/(rm)`) exist with placeholder pages, and a Vercel project auto-deploys `main` to a live `*.vercel.app` URL with previews on every PR.

**Out of scope for Phase 2** — these belong to later phases:
- `types/origin.ts`, `lib/api.ts`, `lib/api.mock.ts`, `lib/api.real.ts` (Phase 3 creates these — `.github/CODEOWNERS` already pre-establishes governance)
- `data/seed.ts` mock dataset (Phase 3)
- App shell (top strip, logo, mode switcher), shared primitives, Fresh Green enforcement check (Phase 4)
- Any persona screens or hero moments (Phases 5–8)

</domain>

<decisions>
## Implementation Decisions

### Stack version reconciliation (canonical lock note)
- **Next.js version:** ROADMAP.md and REQUIREMENTS.md (SCAFF-01) say "Next.js 14+". DECISIONS.md `D-01` locks **Next.js 16.2 LTS** as the canonical choice. Per `D-20`, DECISIONS.md wins on conflict. **Use Next.js 16.2 LTS.** "14+" is satisfied by 16.x.

### Design tokens (Tailwind v4 @theme)
- **D-26:** Tokens land in **Tailwind v4 `@theme {}`** inside `app/globals.css`. Tailwind auto-generates utility classes (`bg-trad-green`, `text-paper`, `font-display`, `font-jp`, etc.) AND exposes CSS variables (`var(--color-trad-green)`, `var(--font-fraunces)`) for use cases that don't fit utilities (gradients, computed style attributes, third-party config).
- **D-27:** Port the **full token set from `docs/ORIGIN_DESIGN.md` §8** verbatim — all six green variants (trad-green / -deep / -soft, fresh-green / -mute / -glow), all six neutrals (ink / -soft / -muted, paper / -deep, mist), all three signals (amber / red / info), all three dark-mode tokens (dark-bg / -surface / -text), typography families, the 8px-base spacing scale (4, 8, 12, 16, 24, 32, 48, 64, 96), and the radius scale (6 / 12 / 16 + full). Phases 3–8 never have to revisit token plumbing.
- **D-28:** Fresh Green AI-only enforcement is **deferred to Phase 4**. SHELL-05 explicitly mentions "a lint rule, grep check, or visual audit confirms it is absent from primary buttons and non-AI surfaces" — that is the natural enforcement seam, landing alongside `AIPulseDot` and the `components/primitives/` directory. Phase 2 only adds a code comment in `app/globals.css` next to the fresh-green tokens pointing to `CLAUDE.md §Design system`.
- **D-29:** Tokens live in a **single `app/globals.css`** alongside `@import "tailwindcss";` and any minimal base resets. No `styles/tokens.css` split.

### Font loading (next/font/google)
- **D-30:** All four fonts load via **`next/font/google`** in `app/layout.tsx`. Auto-hosted at build time, `font-display: swap` and `size-adjust` applied automatically (no CLS), zero third-party requests at runtime.
- **D-31:** **Fraunces** loads with the **wght variable axis only** (no opsz/SOFT/WONK in v1). Smallest bundle, cleanest next/font integration. Revisit if Phase 5+ display designs call for optical-size scaling — the upgrade is one config line if Google Fonts exposes opsz, or self-host if SOFT/WONK become genuinely needed.
- **D-32:** **Noto Sans JP** loads with `subsets: ['latin']` only. Japanese characters (e.g., 縁 watermark, persona name 海星 / カイセイ, bilingual greetings) render via `unicode-range` auto-loading — next/font fetches the JP subset only when those code points actually appear in rendered output. Lightest first paint.
- **D-33:** Fonts wire into Tailwind utilities via the chain **next/font CSS vars → @theme remap → utilities**:
  - `next/font/google` returns objects with `.variable` (e.g., `fraunces.variable === '__variable_xxxxx'`, sets `--font-fraunces` on whatever element receives the className).
  - Apply all four `.variable` classNames to `<html>` in the root layout.
  - In `@theme {}`: `--font-display: var(--font-fraunces); --font-body: var(--font-inter-tight); --font-jp: var(--font-noto-jp); --font-mono: var(--font-ibm-plex-mono);`
  - Tailwind auto-generates `font-display`, `font-body`, `font-jp`, `font-mono` utilities for use across all phases.

### Vercel bootstrap & day-1 URL
- **D-34:** Vercel project is linked via the **Vercel dashboard "Import Git Repository"** flow (one-time, ~2 min). Kit performs this manually before the kit/scaffold work begins. Vercel auto-detects Next.js, configures build (`npm run build`, output `.next`), and starts watching the `evangohAIO/SMBCorigins` repo.
- **D-35:** At link time, set `NEXT_PUBLIC_USE_MOCK=true` on **both Production and Preview environments**. Aligns with PROJECT.md / CLAUDE.md "mock-first frontend" — Phase 3+ doesn't have to flip anything to keep working. The swap to `false` happens later when Evan's backend is ready, scoped at the env-var level. No other env vars needed in Phase 2 (Supabase keys arrive in Phase 3).
- **D-36:** Domain is the **auto-generated `*.vercel.app` URL** for v1 (likely `smbcorigins.vercel.app` if available, else Vercel's default). No custom domain. Custom domain is a polish task before final stakeholder demo, not a Phase 2 deliverable.
- **D-37:** **Sequence: Link Vercel BEFORE first push to `kit/scaffold`**:
  1. Kit links the GitHub repo to Vercel via dashboard.
  2. Kit runs `create-next-app` locally on `kit/scaffold` branch.
  3. First push to `kit/scaffold` triggers a Vercel preview deploy of the bare scaffold — Kit can iterate against a real preview URL while building Phase 2.
  4. Subsequent commits each get their own preview URL.
  5. PR merge to `main` triggers the production deploy, satisfying SCAFF-07 success criterion 2.
- **D-37b:** Phase 1 PR (`kit/phase-1-alignment`) is **already merged** to `main` (verified via `git log` — commit `de2701c`). The D-19 soft-block is therefore moot — `kit/scaffold` branches off a clean `main` and merges back normally.

### Tooling baseline
- **D-38:** **Defaults only** for path aliases and Tailwind plugins.
  - Path aliases: keep `@/*` → repo root from `create-next-app`'s default `tsconfig.json` paths config. With `D-10`'s no-`src/` layout, `@/components`, `@/lib`, `@/types`, `@/data` resolve naturally.
  - Tailwind plugins: **none**. Tailwind v4 ships with `aspect-ratio` and container-queries built in. `@tailwindcss/typography` and `@tailwindcss/forms` aren't needed in Phase 2; later phases can add them when an actual use case lands.
- **D-39:** CI is **one** `.github/workflows/ci.yml` with two parallel jobs: `typecheck` (running `tsc --noEmit`) and `lint` (running `npm run lint` for ESLint flat config). Each job becomes a distinct required status check on `main`. Vercel preview is the third required check (provided automatically by the Vercel GitHub integration). Three required checks — clean mapping to D-08's "CI typecheck + lint + Vercel preview must pass."
- **D-40:** **No husky / lint-staged. No test framework in Phase 2.**
  - Skip pre-commit hooks — CI catches issues; hooks slow commits.
  - Skip Vitest / Jest until Phase 3 lands `types/origin.ts` and `lib/api.ts`. Those are the artifacts actually worth unit-testing. The demo prototype's QA stack is type system + manual QA + Vercel previews, not unit tests.

### Placeholder content (proof-of-life for SCAFF-04 + SCAFF-05)
- **D-41:** Three pages render in Phase 2:
  - **Root `/`** is the **Phase 2 demo URL** — a token showcase rendering all 6 color tokens as labeled swatches (palette grid: trad-green/-deep/-soft, fresh-green/-mute/-glow, paper/-deep, mist, ink/-soft/-muted, signal-amber/-red/-info) and all 4 fonts as labeled sample paragraphs (each font's name set in itself: "Fraunces" in Fraunces, "Inter Tight" in Inter Tight, "Noto Sans JP" in Noto Sans JP with at least one Japanese sample line, "IBM Plex Mono" in IBM Plex Mono). Acts as visual proof for SCAFF-04 (palette) and SCAFF-05 (all four fonts visibly rendering).
  - **`/(client)`** placeholder renders a bilingual greeting for Yuki (e.g., `Yukiさん、ようこそ — Welcome, Yuki`), proving Noto Sans JP + Inter Tight render together correctly. Includes a small nav link back to `/`.
  - **`/(rm)`** placeholder renders an English-only RM placeholder for James (e.g., `James Lee · RM Cockpit · ID: RM-0001`), with the ID set in IBM Plex Mono (proving the mono utility works). Includes a small nav link back to `/`.
  - All three pages share a minimal layout (warm paper background, Trad Green text, no chrome — the app shell is Phase 4).

### Claude's Discretion
- Exact prose phrasing of placeholder content (Yuki's greeting wording, James's stat line, swatch labels).
- Exact ordering of color swatches on the showcase page (suggest: brand colors first → neutrals → signals → dark-mode samples).
- Exact ESLint flat-config rule set beyond Next.js + Prettier defaults (`eslint-config-next`, `eslint-plugin-prettier`).
- Exact Prettier config values (line width, single vs double quotes, semis) — pick something sensible and consistent.
- `next.config.ts` (or `.mjs`) shape — likely just defaults; add `experimental.typedRoutes` if it doesn't pull in build cost.
- Root layout `<head>` metadata (title, description, viewport — desktop-first 1440px is the canvas but viewport meta should still allow zooming).
- `.gitignore` additions: `.vercel/`, `.env*.local`, `node_modules/`, `.next/`, plus what `create-next-app` ships.
- Whether to use `next.config.ts` (typed) or `next.config.mjs` (Next.js default through 16.x — typed config is becoming the default in newer versions).
- README.md updates noting `npm run dev` and the live URL — minor.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project planning (frontend GSD)
- `.planning/PROJECT.md` — vision, locked design system, working principles, mock-first stance
- `.planning/REQUIREMENTS.md` — `SCAFF-01..07` define the seven Phase 2 acceptance items
- `.planning/ROADMAP.md` §"Phase 2: Scaffolding" — phase goal and four success criteria
- `.planning/STATE.md` — current project status; updated by Phase 1 to "ready for Phase 2"
- `.planning/phases/01-setup-alignment/01-CONTEXT.md` — prior decisions D-01..D-25 (stack, scaffolding ownership, cross-GSD governance)

### Cross-GSD locked decisions (canonical)
- `DECISIONS.md` (repo root) — append-only canonical log, D-01..D-25 already locked. **Per D-20, on conflict with any other doc, this file wins.** Read this BEFORE making any version/version-related implementation decisions in Phase 2 (Next.js 16.2 LTS, Node 24 LTS, Tailwind v4, TS strict + noUncheckedIndexedAccess, npm, ESLint flat + Prettier, branch protection rules).
- `CONTRACT.md` (repo root) — cross-GSD boundary governance for the four files Phase 3 creates. Phase 2 does NOT create those files but should not preempt their contracts.
- `.github/CODEOWNERS` (already exists) — auto-review rules for boundary files; Phase 2 should not modify.

### Product context
- `CLAUDE.md` — repo-root brief read at every Claude session start. Contains "Stack contract" (D-01..D-08 summary) and "Scaffolding ownership" (D-09..D-12 summary). Defines the Fresh Green AI-only rule.
- `docs/ORIGIN_DESIGN.md` §8 — design tokens (color, typography, spacing, radius, motion), the canonical source for D-26 and D-27 token porting.
- `docs/ORIGIN_DESIGN.md` §8.2 — typography choices and per-font roles (Fraunces for display/numerals, Inter Tight for UI body, Noto Sans JP for Japanese, IBM Plex Mono for data/IDs/timestamps).
- `docs/ORIGIN_PRODUCT_BRIEF.html`, `docs/ORIGIN_JOURNEY_DOC.html`, `docs/ORIGIN_BUILD_PROMPT.md` — additional product context; not directly needed for Phase 2 but should be available.

### External docs (verify current best practices at planning time)
- Next.js 16.2 App Router docs — `app/layout.tsx`, `next/font/google`, route groups (`(client)`, `(rm)`), `next.config.ts`
- Tailwind v4 docs — `@theme` directive, CSS-first configuration, `@import "tailwindcss";` syntax
- Vercel docs — Git integration "Import Project", environment variable scoping (Production / Preview / Development), branch deployment behavior

### Files this phase creates
- `package.json`, `package-lock.json`, `tsconfig.json`, `next.config.ts` (or `.mjs`), `eslint.config.mjs`, `.prettierrc`, `.prettierignore`
- `app/layout.tsx`, `app/page.tsx` (root showcase), `app/globals.css`
- `app/(client)/page.tsx`, `app/(rm)/page.tsx`
- `.github/workflows/ci.yml`
- `.nvmrc`, `.gitignore` updates, `README.md` updates

### Files this phase explicitly does NOT create (Phase 3+ scope)
- `types/origin.ts`, `lib/api.ts`, `lib/api.mock.ts`, `lib/api.real.ts`, `data/seed.ts`
- Any `components/primitives/*`, top strip, mode switcher, logo

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **None yet** — this is a greenfield scaffold. Phase 1 produced docs only (`DECISIONS.md`, `CONTRACT.md`, `.github/CODEOWNERS`, `CLAUDE.md` mutations) — no code, no `package.json`, no `app/`. Phase 2 starts from `npx create-next-app@latest`.

### Established Patterns (inherit from Phase 1)
- **Branch naming:** `kit/<area>` per CLAUDE.md — Phase 2 work goes on `kit/scaffold` per D-12.
- **Single-PR-per-phase:** Phase 1 closure was one PR (`kit/phase-1-alignment` — already merged as `de2701c`). Phase 2 mirrors this: one PR on `kit/scaffold`, reviewed and merged by Evan.
- **Commit message style** (visible in `git log`): `feat(02-NN): ...`, `docs(02-NN): ...`, `chore(02): ...` — `02-NN` indicates `phase-plan` numbering. Match this convention.
- **GSD planning artifacts in `.planning/`** are Kit-only per D-21. Evan never touches `.planning/`. Phase 2 artifacts there are internal only.
- **Soft-block on merge** (D-19): no longer applicable since Phase 1 PR is merged, but the principle (build on a feature branch and only merge to `main` when reviewed) remains the operating mode.

### Integration Points
- **`evangohAIO/SMBCorigins`** GitHub repo is the deployment integration target. Vercel link at D-34 is the new integration point Phase 2 establishes.
- **`.github/CODEOWNERS`** already governs the four Phase 3 boundary files. Phase 2 must not create those files; if it does, CODEOWNERS will trigger cross-review on the scaffold PR for files that don't belong to Phase 2.
- **`CLAUDE.md`** is read at every Claude session start. Phase 2 may add a "How to run" section (currently `_TBD — filled in once scaffolded._` per CLAUDE.md L114) once `npm run dev` works.
- **Branch protection on `main`** (D-08): the three required status checks (`typecheck`, `lint`, Vercel preview) become enforceable as soon as Phase 2's CI workflow + Vercel link land. Repo admin (Kit) needs to mark them required in GitHub repo settings — this is a manual GitHub UI step, not a code change.

</code_context>

<specifics>
## Specific Ideas

- **Visual proof on the live URL.** Phase 2's success criterion #2 says the production URL "returns a live page styled with the locked color palette and all four fonts visibly rendering." That's why D-41 makes root `/` a token showcase instead of a redirect or minimal placeholder — it's the verification surface for SCAFF-04 + SCAFF-05 simultaneously. A reviewer can confirm the phase is done by opening one URL.
- **Bilingual moment on `/(client)`.** Per CLAUDE.md and ORIGIN_DESIGN.md, the demo's bilingual angle (Japanese + English) is part of "feeling distinctively SMBC, not generic fintech." The `/(client)` placeholder gets a Japanese line (Noto Sans JP rendering) on day 1 — small but signals the design intent through Phase 2's URL.
- **`*.vercel.app` is fine.** This is a stakeholder demo prototype, not a customer-facing product. The URL surface itself is not the demo moment — what shows up at the URL is. No DNS / cert work in Phase 2.
- **Vercel link timing matters.** D-37 sequences the Vercel link BEFORE the first scaffold push so Kit can iterate against a real preview URL during execution, catching deploy-config issues early. Linking after merge would defer all Vercel-side surprises to the worst possible moment.
- **Three required status checks, not two.** D-39 deliberately splits typecheck and lint into separate jobs (not steps in one job) so each becomes its own required check. Maps cleanly to D-08's wording.
- **No tests in Phase 2.** D-40 is a deliberate choice. Phase 3 can pick a test framework when there's something worth unit-testing. Phase 2 has no business logic — only config, layouts, and placeholder JSX.

</specifics>

<deferred>
## Deferred Ideas

### Re-deferred from Phase 1
- **Testing framework choice (Vitest vs Jest vs Playwright)** — confirmed deferred to Phase 3+. Pick when the first unit-testable artifact (`types/origin.ts` runtime validators, `lib/api.ts` switch logic, or `data/seed.ts` shape integrity) lands.
- **Secrets handling pattern (Vercel env vars vs `.env.local` conventions)** — Phase 3 concern when actual secrets exist (Supabase URL/anon-key for the real backend swap).
- **`data/seed.ts` divergence governance** — Phase 3.

### Newly deferred from Phase 2 discussion
- **Fraunces opsz axis loading** — revisit if Phase 5+ display designs need optical-size scaling. Single config-line addition if Google Fonts exposes it for next/font.
- **Fraunces SOFT and WONK axes** — only available via self-hosted upstream variable file. Defer indefinitely; only adopt if a specific design moment genuinely requires those axes.
- **`@tailwindcss/typography` plugin** — likely needed for Phase 8's Credit Memo Drafter prose rendering. Adopt then.
- **`@tailwindcss/forms` plugin** — likely never needed for v1 (forms aren't a demo moment per REQUIREMENTS Out of Scope).
- **Custom domain for the live URL** — pre-stakeholder-demo polish task, not a phase deliverable.
- **Husky / lint-staged** — adopt only if commit-time noise becomes a real problem; CI is the safety net for v1.
- **Fresh Green AI-only enforcement (lint or grep)** — Phase 4 ships this alongside `AIPulseDot` (SHELL-05).
- **Dark-mode wiring** — tokens are present (D-27 ports `--dark-bg`, `--dark-surface`, `--dark-text`) but no dark-mode media query / toggle is wired in Phase 2. ORIGIN_DESIGN.md notes it as "RM cockpit option" — out of v1 scope.
- **`README.md` rewrite** — Phase 2 adds a minimal "How to run" section; full README polish is a later concern.
- **`How to run` section in CLAUDE.md** — currently `_TBD — filled in once scaffolded._`. Phase 2 should fill it once `npm run dev` works.

</deferred>

---

*Phase: 02-scaffolding*
*Context gathered: 2026-04-25*
