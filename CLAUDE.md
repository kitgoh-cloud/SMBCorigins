# SMBCorigins

Working repository for **SMBC Origin** — an AI-native corporate banking onboarding prototype. This file is read by Claude Code at the start of every session. Keep it current.

## What we're building

A clickable desktop-first prototype showing how corporate client onboarding could work at SMBC with AI as the connective tissue — collapsing today's 90–180 day journey into days. This is a showpiece for stakeholder demos and workshops, not a production system.

## Who's building it

- **Kit** (frontend) — UI, components, screens, client + RM experiences
- **Evan** (backend) — Supabase schema, API routes, Claude API integration, auth

Both work in this single Next.js repo.

## Stack contract

The locked technical stack agreed by Kit and Evan in Phase 1 (see `DECISIONS.md` D-01..D-08 for the canonical record — this is a summary).

- **Framework**: Next.js 16.2 LTS, App Router (D-01)
- **Runtime**: Node 24 LTS — pinned via `.nvmrc` and `engines.node` in `package.json` (D-02)
- **Styling**: Tailwind v4 with CSS-first `@theme` config (D-03)
- **Backend**: Supabase hosted dev project — Vercel previews flip `NEXT_PUBLIC_USE_MOCK=false` against a real backend (D-04)
- **TypeScript**: `strict: true` and `noUncheckedIndexedAccess: true` — `exactOptionalPropertyTypes` deliberately not adopted for prototype velocity (D-05)
- **Package manager**: npm (D-06)
- **Linter / formatter**: ESLint flat config + Prettier (D-07)
- **Branch protection on `main`**: PR required + status checks (CI typecheck + lint + Vercel preview); no required reviewers at branch level — cross-GSD review is enforced via `.github/CODEOWNERS` for the four boundary files only (D-08)
- **Deployment**: Vercel auto-deploy from `main`; PR previews per branch
- **Anthropic Claude API** for the four AI hero moments (Evan's GSD owns the integration)

On any conflict between this section and `DECISIONS.md`, `DECISIONS.md` wins (per D-20). Update both atomically when locks change.

## Scaffolding ownership

Who owns initial repo scaffolding (Phase 2) and the directory layout that Phase 3+ depends on. Canonical record lives in `DECISIONS.md` D-09..D-12.

- **Initial scaffold author**: Kit alone runs `create-next-app` and pushes the initial scaffold; Evan reviews. This preserves the day-1 Vercel URL target. (D-09)
- **Directory layout**: root-level `app/`, `components/`, `lib/`, `types/`, `data/` — no `src/` wrapper. Matches `REQUIREMENTS.md` paths verbatim (BOUND-01..04, SCAFF-06). (D-10)
- **`types/origin.ts` at repo root** — single source of truth, max visibility, matches BOUND-01 path exactly. (D-11)
- **Initial-scaffold PR**: branch `kit/scaffold`, single PR, reviewed and merged by Evan. (D-12)

The four shared boundary files (`types/origin.ts`, `lib/api.ts`, `lib/api.mock.ts`, `lib/api.real.ts`) are governed by `CONTRACT.md` and enforced via `.github/CODEOWNERS` — see those files for the cross-review rules.

## Working principles

- **Desktop-first** — designed for 1440px
- **Contract first** — `types/origin.ts` and `lib/api.ts` are the shared boundary
- **Never edit `types/origin.ts` without telling the other person**
- **Frontend builds against mocked data initially**; real Supabase swaps in later via an env flag
- **Small PRs, merge daily** — no long-lived branches
- **Branch naming**: `kit/<area>` or `evan/<area>`

## Personas

- **Yuki Tanaka** — Treasurer, Kaisei Manufacturing KK (client-side persona)
- **James Lee** — Relationship Manager, Japanese Corporates desk, SMBC Singapore (RM-side persona)

## Hero scenario

Kaisei Manufacturing KK expanding from Japan into Singapore, Hong Kong, and the UK — applying for cash management, trade finance, and a $50M revolving credit facility.

## The six stages

1. Invite & Intent
2. Entity & Structure → *UBO Intelligence hero moment*
3. Documentation → *Doc Extraction hero moment*
4. Screening
5. Products & Credit → *Credit Memo Drafter hero moment*
6. Activation + Perpetual KYC teaser

Plus the **RM Copilot** sidecar (4th hero moment) — cross-cuts every RM screen.

## Design system (locked — do not deviate)

- **Typography**: Fraunces (display, numerals) · Inter Tight (UI body) · Noto Sans JP (Japanese) · IBM Plex Mono (data, timestamps, IDs, eyebrows)
- **Colors**: Trad Green `#004832` · Fresh Green `#BFD730` · warm paper `#FAFBF7`
- **Critical rule**: Fresh Green is reserved **exclusively** for AI outputs and AI presence. Do not use it for generic accents or primary buttons.
- **Enforcement**: Fresh Green usage is mechanically policed by `scripts/check-fresh-green.sh` (run by the `fresh-green` CI job). Allowlisted exceptions live in `.freshgreen-allowlist` at the repo root. Adding an entry there requires architectural review.

## Reference docs

Additional context lives in `/docs/`:

- `ORIGIN_PRODUCT_BRIEF.html` — executive brief
- `ORIGIN_DESIGN.md` — technical master (schema, components, phases)
- `ORIGIN_JOURNEY_DOC.html` — detailed UX walkthrough
- `ORIGIN_BUILD_PROMPT.md` — the prompt used to generate the design prototype

At session start, read this file plus the relevant doc for what you're working on.

## Non-goals

- Authentication flows (assume logged in; mock for now)
- Real KYC / AML / screening provider integrations — all mocked
- Compliance officer or ops persona views — RM + Client only for v1
- Mobile responsiveness (desktop-only)
- Production hardening

## Cross-phase watch items

Carryforward constraints from completed phases. Every executor building Phase 5+ must read this section and check each item against the surfaces they build.

**W-01 — Interaction-state timing (Phase 4 origin)**
All interactive surfaces must use `transition-colors duration-200 ease-out` for color transitions and `focus-visible:outline-2 focus-visible:outline-offset-2` for focus rings. These are the agreed values from Phase 4 primitives (ActionCard, ModeSwitcher segment links). Flag any Phase 5+ surface that uses a different timing, easing, or ring thickness as a regression — it won't fail any automated test but will produce visual inconsistency at the demo.

**W-02 — Styling-pathway routing: D-89 hybrid (Phase 4 origin)**
Phase 4 settled on a hybrid approach (D-89 strategy c): component-level Tailwind utilities for structure/typography, `app/globals.css @theme` tokens for design-system values, and a `@keyframes` carve-out only for animations that Tailwind's utility system can't express. Do NOT mix pathways on the same surface (e.g., half `@apply`, half utilities), and do NOT route a new animation through a one-off `style=` prop when a `@keyframes` token is the right tool. If a Phase 5 surface needs a new animation, add the token to `globals.css` and wire it via `@theme`, consistent with how `--animate-ai-pulse` was added in Plan 04-04.

**W-03 — Fraunces axis declarations: OD-12 strategy b (Phase 4 origin)**
Fraunces consumers must declare SOFT and WONK axes **inline at the usage site** — not via `next/font` config and not via a Tailwind token. The pattern established in TopStrip's wordmark is the reference. Missing axis declarations on a heading that the design spec called for are a visual regression that no automated test catches. When building Phase 5+ headings/display text using Fraunces: check the UI-SPEC for whether SOFT/WONK were specified for that surface; if yes, add `fontVariationSettings` inline.

**W-04 — Prototype-to-spec encoding fidelity (Phase 5 origin, 2026-04-27)**
Phase 5's UI-SPEC was generated by `gsd-ui-researcher` with a Pre-Population Receipt that cited `docs/ORIGIN_JOURNEY_DOC.html`, `docs/ORIGIN_DESIGN.md`, `REQUIREMENTS.md` CJD-01..CJD-07, `data/seed.ts`, `lib/api.mock.ts`, `lib/stages.ts`, `lib/persona.ts`, and Phase 4 UI-SPEC. It did NOT cite `docs/ORIGIN_PROTOTYPE.html` (named "Origin Prototype.html" at the time of the failure; renamed for naming-convention consistency in commit 2c6719f) — a 9.5 MB prototype that had been in the same `docs/` directory since 2026-04-24, three days before Phase 5 research ran, and which contained the actual screen design intent for the Client Journey Dashboard. The prototype was not hidden, gated, or referenced ambiguously; it was sitting next to the docs that WERE cited.

The result: UI-SPEC produced a single-column vertical-band layout (HeroBlock → StageTimeline → NarrativeRow → ActivityFeed → TeamCard, space-y-8) faithful to its declared sources but substantially divergent from the prototype's multi-card dashboard composition (hero card, attention card, working-on-your-behalf card with live AI progress, applying-for card, multi-member team card). All eight Phase 5 plans, all six Phase 5 component implementations, and the page composition were faithful to the spec — and therefore divergent from the prototype. Detected during UAT screenshot review on 2026-04-27 after the implementation was complete and on main.

Posture for future phases:
1. `gsd-ui-researcher` MUST run a directory inventory of `docs/` (or any project-defined design-asset directory) BEFORE generating UI-SPEC. Every file in that directory is in the candidate-source set; exclusion requires a stated rationale.
2. `gsd-ui-researcher`'s Pre-Population Receipt MUST list every prototype, mock, or design-spec file consulted with file path, OR explicitly note "no prototype exists" or "prototype excluded because [rationale]". Silent omission of an existing prototype is a research-phase defect.
3. `gsd-ui-checker`'s verification MUST include a page-composition cross-check: if a prototype exists in `docs/`, the spec's Page Layout section is checked against the prototype's structure. Bands-vs-cards, single-column-vs-grid, and component density (single-item vs multi-item) are first-class checker concerns.
4. CONTEXT.md capture MUST include a "Prototype consulted" field with the file path or "none exists". Silent omission is what failed in Phase 5.
5. Phase 5's `docs/` contained the prototype before research ran; the failure was researcher diligence, not artifact availability. The lesson is not "make prototypes more findable" — it is "the researcher must look at what is in the directory."

Mitigation status: process change, not code change. Applied retroactively to Phase 5 redo (re-spec from `docs/ORIGIN_PROTOTYPE.html`, re-plan, re-execute). Phase 5 divergent implementation preserved on archive branch `phase-5-spec-divergence-archive` for forensic reference and partial reuse during redo.

Watchlist disposition: keep open through Phase 6. If Phase 6 has a prototype, the new posture must be followed and the Pre-Population Receipt must explicitly cite or explicitly exclude it. If Phase 6 has no prototype, the W-04 posture is untested and stays open through Phase 7.

## Execution gate notes

Known gaps in the automated pre-PR gate (`npm run typecheck && npm run lint && npm run test && npm run build`).

**EG-01 — `npm run build` does not catch all PostCSS/Tailwind parse errors (Phase 4 origin; Phase 5 recurrence)**
During Phase 4, a Tailwind v4 class-scan error (`bg-[var(--token)]` in a `.planning/` markdown file) caused `npm run dev` to fail immediately, but `npm run build` exited 0. The Turbopack production build path silently skipped the CSS error that the dev server surfaces. Mitigation: `.planning/**` is now excluded via `@source not "../.planning/**"` in `app/globals.css`. **Phase 5 recurrence (2026-04-28):** the same failure mode triggered again because this very paragraph in CLAUDE.md previously contained a literal class-like prose example, and CLAUDE.md sits at the repo root — outside the `.planning/**` exclusion. Twice-confirmed: the build gate cannot be trusted to catch this error class. Mitigation extended in Phase 5: `@source not "../CLAUDE.md"` added alongside `.planning/**`, and the example string above rewritten to `bg-[var(--token)]` (a form that does not match Tailwind's class-extraction regex). If the dev server fails on startup with a PostCSS error after a phase completes, suspect Tailwind scanning a non-source file — check for literal `var(...)`, `bg-[`, or other class-like strings in newly added markdown or config files. A smoke-test of `next dev` startup is the right next move for the automated gate; tracked as a follow-up commit.

## How to run

```bash
nvm use 24                # Node 24 LTS per D-02
npm install
npm run dev               # → http://localhost:3000
```

Pre-PR validation: `npm run typecheck && npm run lint && npm run test && npm run build`.

Live URL: <https://smbcorigins.vercel.app> (Vercel-assigned production hostname — confirm in Vercel dashboard).
Every PR produces a unique preview URL via the Vercel GitHub App.
