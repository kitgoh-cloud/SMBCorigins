# Roadmap: SMBC Origin — Frontend

**Project code:** ORIGIN
**Created:** 2026-04-24
**Granularity:** standard (8 phases)
**Coverage:** 43/43 v1 requirements mapped

## Overview

Eight phases take the frontend from zero to a full stakeholder-demo prototype. Phase 1 is a paper-only alignment checkpoint with Evan (no code). Phase 2 stands up Next.js + Tailwind + Vercel with a live URL on day one. Phase 3 locks the cross-GSD contract (`types/origin.ts`, `lib/api.ts`, `data/seed.ts`) so Kit can ship on mocks while Evan builds the real backend. Phase 4 delivers the app shell and the five shared primitives that every screen downstream depends on. Phases 5 and 6 are the two heartbeat screens — Yuki's Client Journey Dashboard and James's RM Cockpit — the minimum pair that tells the demo story. Phase 7 fills in all six onboarding stages (client + RM sides). Phase 8 layers in the four AI hero moments that make the demo sing: UBO Intelligence, Doc Extraction, Credit Memo Drafter, and the RM Copilot sidecar.

**Hard schedule (from CLAUDE.md):**
- Phase 2 produces a live Vercel URL on day 1
- Phase 5 (first heartbeat screen) complete by end of day 3
- Phase 6 (both heartbeats) complete by end of day 5
- First hero moment (HERO-01, UBO Intelligence) complete by end of week 1

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [x] **Phase 1: Setup & Alignment** - Kit + Evan lock the cross-GSD contract and document decisions in CLAUDE.md (no code)
- [x] **Phase 2: Scaffolding** - Next.js 14 App Router + TypeScript strict + Tailwind + design tokens + fonts + Vercel auto-deploy
- [ ] **Phase 3: Shared Boundary** - `types/origin.ts`, `lib/api.ts` mock/real switch, and full `data/seed.ts` for Kaisei + portfolio
- [ ] **Phase 4: App Shell & Primitives** - Top strip, logo, dev mode switcher, and five shared primitives used across every screen
- [ ] **Phase 5: Client Journey Dashboard** - Yuki's heartbeat screen running on mocks at 1440px
- [ ] **Phase 6: RM Cockpit** - James's heartbeat screen: sidebar, stats, "Needs You" queue, "AI Has Been Busy" panel, portfolio kanban
- [ ] **Phase 7: Stage Screens** - All six onboarding stages, client + RM sides, as structural frames
- [ ] **Phase 8: Hero Moments** - UBO Intelligence, Doc Extraction, Credit Memo Drafter, and the cross-cutting RM Copilot sidecar

## Phase Details

### Phase 1: Setup & Alignment
**Goal**: Kit and Evan have a shared, written agreement on the cross-GSD technical contract before any code is written — so the two parallel GSDs cannot drift.
**Depends on**: Nothing (first phase)
**Requirements**: SETUP-01, SETUP-02, SETUP-03
**Success Criteria** (what must be TRUE):
  1. CLAUDE.md contains an explicit "Stack contract" section covering Next.js version, TypeScript strictness, Tailwind config baseline, Node version, Supabase dev-mode (local vs cloud), and branch protection rules — both Kit and Evan have signed off in writing (PR merged)
  2. CLAUDE.md contains an explicit "Scaffolding ownership" section naming who runs `create-next-app`, who authors the initial commit, and the initial directory layout
  3. `/docs/ORIGIN_PRODUCT_BRIEF.html`, `/docs/ORIGIN_DESIGN.md`, `/docs/ORIGIN_JOURNEY_DOC.html`, `/docs/ORIGIN_BUILD_PROMPT.md` all exist in the repo and open cleanly
  4. No code has been written in this phase — output is decisions captured in shared documents
**Plans**: 5 plans
  - [x] 01-01-PLAN.md — Seed DECISIONS.md at repo root with all 25 locked decisions (D-01..D-25)
  - [x] 01-02-PLAN.md — Author CONTRACT.md at repo root governing the cross-GSD shared boundary
  - [x] 01-03-PLAN.md — Author .github/CODEOWNERS encoding boundary auto-review rules
  - [x] 01-04-PLAN.md — Mutate CLAUDE.md to add Stack contract and Scaffolding ownership sections
  - [x] 01-05-PLAN.md — Verify the four /docs/ reference files exist and open cleanly (SETUP-03)

### Phase 2: Scaffolding
**Goal**: The repository has a booting Next.js 14 App Router application with TypeScript strict, Tailwind, design tokens, all four fonts, both persona route groups, and a live Vercel URL auto-deploying from `main`.
**Depends on**: Phase 1
**Requirements**: SCAFF-01, SCAFF-02, SCAFF-03, SCAFF-04, SCAFF-05, SCAFF-06, SCAFF-07
**Success Criteria** (what must be TRUE):
  1. Running `npm run dev` locally boots the app and renders a placeholder page with zero TypeScript errors
  2. Visiting the Vercel production URL returns a live page styled with the locked color palette (Trad Green `#004832`, Fresh Green `#BFD730`, warm paper `#FAFBF7`) and all four fonts visibly rendering (Fraunces, Inter Tight, Noto Sans JP, IBM Plex Mono)
  3. Opening any PR produces a unique preview deployment URL
  4. Navigating to `/(client)` and `/(rm)` route-group URLs returns the persona-specific placeholder pages
**Plans**: 5 plans
  - [ ] 02-01-PLAN.md — Vercel link + Node 24 + create-next-app scaffold on kit/scaffold
  - [ ] 02-02-PLAN.md — Tighten config: tsconfig + eslint flat + prettier + .nvmrc + scripts + .gitignore
  - [ ] 02-03-PLAN.md — Design tokens (@theme) + four next/font fonts + root token showcase page
  - [ ] 02-04-PLAN.md — Persona route groups: /journey (client) + /cockpit (RM) placeholders
  - [ ] 02-05-PLAN.md — CI workflow + README/CLAUDE.md How-to-run + PR open + branch protection + post-merge production verify
**UI hint**: yes

### Phase 3: Shared Boundary
**Goal**: The cross-GSD contract (`types/origin.ts`, `lib/api.ts`, `data/seed.ts`) is established so the frontend can develop against mocks while Evan's backend is under construction, and the real backend can swap in later with no refactor.
**Depends on**: Phase 2
**Requirements**: BOUND-01, BOUND-02, BOUND-03, BOUND-04
**Success Criteria** (what must be TRUE):
  1. `types/origin.ts` exports typed shapes for `Application`, `Entity`, `UBO`, `Document`, `ScreeningHit`, `CreditMemo`, `Stage`, `User` and the file has been reviewed by Evan (PR approval recorded)
  2. With `NEXT_PUBLIC_USE_MOCK=true` (default), `lib/api.ts` returns typed `Application` objects sourced from `data/seed.ts`
  3. `data/seed.ts` contains a complete mock dataset: Kaisei Manufacturing KK entity tree, 5 UBOs with holding percentages, 6 background portfolio clients for RM views, and 22 documents spread across document types
  4. Setting `NEXT_PUBLIC_USE_MOCK=false` causes `lib/api.ts` to route to the real backend stub (even if unimplemented, the switch itself works and is type-safe)
**Plans**: 5 plans
  - [x] 03-01-PLAN.md — Vitest infrastructure (config, scripts, third CI job, CLAUDE.md update)
  - [x] 03-02-PLAN.md — data/seed.ts (Kaisei + 6 portfolio + Act 3 org + 22 docs) + invariant tests
  - [x] 03-03-PLAN.md — lib/types-pending.ts shim + .github/CODEOWNERS edit (lib/stages.ts grouped with contract surfaces)
  - [x] 03-04-PLAN.md — lib/api.mock.ts full implementation (replace stub) + behavior tests
  - [x] 03-05-PLAN.md — lib/stages.test.ts (STAGE_NAMES + deriveStages purity contract)

### Phase 4: App Shell & Primitives
**Goal**: The shell chrome and five shared primitives that every downstream screen consumes are built, typed, and locked — so the heartbeat screens can be assembled from existing parts without shell work getting entangled in screen work.
**Depends on**: Phase 3
**Requirements**: SHELL-01, SHELL-02, SHELL-03, SHELL-04, SHELL-05
**Success Criteria** (what must be TRUE):
  1. The top strip renders on every route with the Rising Mark logo and a visual-only EN / 日本語 language toggle
  2. A dev-only mode switcher visible in development flips between `/(client)` and `/(rm)` and is absent in production builds
  3. `components/primitives/` exports `Eyebrow`, `StatusChip`, `StagePill`, `AIPulseDot`, and `ActionCard`, each visible on a primitives demo page
  4. Fresh Green `#BFD730` appears only on `AIPulseDot` and AI-output surfaces; a lint rule, grep check, or visual audit confirms it is absent from primary buttons and non-AI surfaces
**Plans**: 11 plans
  - [x] 04-01-PLAN.md — Land Vitest jsdom + Testing Library + jest-dom test infrastructure (Wave 0 unblocking every primitive/shell test)
  - [x] 04-02-PLAN.md — Apply UI-SPEC PD-1: IBM Plex Mono weight ['400','500'] + DECISIONS.md D-64 + D-65 + D-66 entries (font weight fix; SOFT/WONK inlined per OD-12 strategy b; modeForPathname 3-arm union authorization)
  - [x] 04-03-PLAN.md — Create lib/persona.ts (PERSONAS, PERSONA_HOME, modeForPathname) — plain TS constants per D-66 (3-arm union 'client' | 'rm' | 'demo'), no api.mock coupling
  - [x] 04-04-PLAN.md — Add @keyframes ai-pulse + --animate-ai-pulse @theme token to app/globals.css (consumed by AIPulseDot)
  - [x] 04-05-PLAN.md — Build atomic primitives: Eyebrow (mono text), Icon (35-name SVG dictionary), Avatar (closed-enum color)
  - [x] 04-06-PLAN.md — Build AI presence primitives: AIPulseDot, AIBadge, StatusChip (per-kind D-87 tests as 2nd line of defense for whole-file allowlist)
  - [ ] 04-07-PLAN.md — Complete primitive set: StagePill (numbered disc), ActionCard ('use client' interactive), barrel index.ts
  - [ ] 04-08-PLAN.md — Chrome trio: RisingMark (allowlisted brand SVG), LanguageToggle (visual-only), ModeSwitcher (env-gated; retrofits #3 + #4 at authorship)
  - [ ] 04-09-PLAN.md — Inner shells: ClientShell (single-column) + RMShell (sidebar 220 + workspace + empty copilot slot; retrofit #5 sidebar dot)
  - [ ] 04-10-PLAN.md — TopStrip composition + route-group layouts + /dev/primitives demo page (retrofits #1 + #2; OD-12 strategy b SOFT/WONK)
  - [ ] 04-11-PLAN.md — SHELL-05 enforcement: bash grep script + .freshgreen-allowlist + Vitest fixtures + 4th CI job + REQUIREMENTS.md/CLAUDE.md amendments
**UI hint**: yes

### Phase 5: Client Journey Dashboard
**Goal**: Yuki's heartbeat screen is live on mocks at 1440px — the first demo-quality screen, and the one the hard schedule gates on day 3.
**Depends on**: Phase 4
**Requirements**: CJD-01, CJD-02, CJD-03, CJD-04, CJD-05, CJD-06, CJD-07
**Success Criteria** (what must be TRUE):
  1. Navigating to `/(client)/journey` renders the full Client Journey Dashboard at a 1440px desktop canvas
  2. The hero section shows a bilingual greeting for Yuki, the 縁 (en) watermark, and an ETA hero number sourced from `data/seed.ts`
  3. The 6-stage timeline correctly reflects Kaisei's current, completed, and upcoming stages with the right status chips, and the paired "Your turn / Our turn" narrative row renders from the existing mockup pattern
  4. The activity feed renders seed events with IBM Plex Mono timestamps, and the team card shows James Lee as the assigned RM
  5. Every AI-generated surface on the screen is Fresh Green; no other surfaces use it
**Plans**: TBD
**UI hint**: yes

### Phase 6: RM Cockpit
**Goal**: James's heartbeat screen is live — the second half of the paired-screens demo, gating the end-of-day-5 milestone.
**Depends on**: Phase 5 (reuses primitives + seed; CJD validated Fresh Green rules first)
**Requirements**: RMC-01, RMC-02, RMC-03, RMC-04, RMC-05, RMC-06, RMC-07
**Success Criteria** (what must be TRUE):
  1. Navigating to `/(rm)/cockpit` renders the full RM Cockpit at 1440px with the sidebar navigation, top bar (James's identity, notifications, search), and stats row populated from seed
  2. The "Needs You" queue renders action-requiring items drawn from `data/seed.ts`
  3. The "AI Has Been Busy" panel renders AI-authored work across James's portfolio, styled in Fresh Green to signal AI authorship at a glance
  4. The 6-column portfolio kanban renders Kaisei plus the 6 background portfolio clients distributed across the six onboarding stages
  5. Switching between `/(client)/journey` and `/(rm)/cockpit` via the mode switcher works cleanly — both heartbeat screens coexist in the demo
**Plans**: TBD
**UI hint**: yes

### Phase 7: Stage Screens
**Goal**: All six onboarding stages exist as structural frames on both client and RM sides — the skeleton into which Phase 8's hero moments slot.
**Depends on**: Phase 6
**Requirements**: STAGE-01, STAGE-02, STAGE-03, STAGE-04, STAGE-05, STAGE-06
**Success Criteria** (what must be TRUE):
  1. All six stages (Invite & Intent, Entity & Structure, Documentation, Screening, Products & Credit, Activation + Perpetual KYC teaser) have a client-side view rendering at 1440px with seed data
  2. All six stages have an RM-side view rendering at 1440px with seed data
  3. Navigation from the CJD timeline drills into the correct client-side stage view; navigation from the RM Cockpit drills into the correct RM-side stage view
  4. Each stage screen reuses the Phase 4 primitives (`StagePill`, `StatusChip`, `Eyebrow`, `ActionCard`) — no one-off components crept in
**Plans**: TBD
**UI hint**: yes

### Phase 8: Hero Moments
**Goal**: The four AI hero moments are live — the demo-defining surfaces that make the "AI as connective tissue" story legible. HERO-01 lands first to meet the end-of-week-1 schedule.
**Depends on**: Phase 7
**Requirements**: HERO-01, HERO-02, HERO-03, HERO-04
**Success Criteria** (what must be TRUE):
  1. In Stage 2, the UBO Intelligence hero moment renders an AI-authored UBO analysis in Fresh Green with an interactive entity tree showing Kaisei and its 5 UBOs with holding percentages
  2. In Stage 3, the Doc Extraction hero moment renders a side-by-side original-vs-extracted view with AI-pulled structured fields styled in Fresh Green
  3. In Stage 5, the Credit Memo Drafter hero moment renders an AI-authored draft memo for Kaisei's $50M revolver with editable sections and per-section confidence indicators
  4. The RM Copilot sidecar docks on every `/(rm)/*` route, renders contextual AI suggestions based on the current page, and is stylistically distinct (Fresh Green) from non-AI surfaces
  5. A full demo run-through (Yuki's CJD → Stage 2 UBO hero → Stage 3 Doc hero → James's Cockpit → Stage 5 Credit Memo hero → Copilot interaction) completes end-to-end on the live Vercel URL
**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Setup & Alignment | 0/TBD | Not started | - |
| 2. Scaffolding | 0/TBD | Not started | - |
| 3. Shared Boundary | 0/TBD | Not started | - |
| 4. App Shell & Primitives | 0/TBD | Not started | - |
| 5. Client Journey Dashboard | 0/TBD | Not started | - |
| 6. RM Cockpit | 0/TBD | Not started | - |
| 7. Stage Screens | 0/TBD | Not started | - |
| 8. Hero Moments | 0/TBD | Not started | - |

---
*Roadmap created: 2026-04-24*
