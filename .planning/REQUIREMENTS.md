# Requirements: SMBC Origin — Frontend

**Defined:** 2026-04-24
**Core Value:** A stakeholder watching Yuki's and James's paired screens believes an AI-native onboarding is feasible at SMBC and can see it working — with the design feeling distinctively SMBC, not generic fintech.

## v1 Requirements

Requirements for the demo-ready prototype. Each maps to exactly one roadmap phase.

### Setup & Alignment (SETUP)

- [ ] **SETUP-01**: Kit and Evan agree on and document a cross-GSD stack contract — Next.js version, TypeScript strictness, Tailwind config, Node version, Supabase dev-mode (local vs cloud), branch protection rules — captured in `CLAUDE.md`
- [ ] **SETUP-02**: Kit and Evan agree on scaffolding ownership — who runs `create-next-app`, initial commit author, initial directory layout — captured in `CLAUDE.md`
- [ ] **SETUP-03**: Reference docs (`ORIGIN_PRODUCT_BRIEF.html`, `ORIGIN_DESIGN.md`, `ORIGIN_JOURNEY_DOC.html`, `ORIGIN_BUILD_PROMPT.md`) are populated in `/docs/` and readable

### Scaffolding (SCAFF)

- [ ] **SCAFF-01**: Next.js 14+ App Router project boots locally with `npm run dev` and renders a placeholder page
- [ ] **SCAFF-02**: TypeScript is configured with `strict: true` in `tsconfig.json` and compiles cleanly
- [ ] **SCAFF-03**: Tailwind is configured, purging correctly, and applies utility classes in the placeholder page
- [ ] **SCAFF-04**: Design tokens from `ORIGIN_DESIGN.md` are ported into `globals.css` as CSS custom properties (Trad Green, Fresh Green, warm paper, plus any scale tokens)
- [ ] **SCAFF-05**: Four fonts load correctly — Fraunces (display/numerals), Inter Tight (UI body), Noto Sans JP (Japanese), IBM Plex Mono (data/IDs/eyebrows) — and each is visible in a test page
- [ ] **SCAFF-06**: Route groups `/(client)` and `/(rm)` exist in `app/`, each with a placeholder page
- [ ] **SCAFF-07**: Vercel project is linked, `main` auto-deploys to a working URL, each PR produces a preview deployment

### Shared Boundary (BOUND)

- [ ] **BOUND-01**: `types/origin.ts` exports `Application`, `Entity`, `UBO`, `Document`, `ScreeningHit`, `CreditMemo`, `Stage`, `User` — co-authored with Evan, reviewed before merge
- [ ] **BOUND-02**: `lib/api.ts` exports a typed API client that switches between mock and real backends via `NEXT_PUBLIC_USE_MOCK` — default is `true`
- [ ] **BOUND-03**: `data/seed.ts` provides a full mock dataset — Kaisei Manufacturing KK entity tree, 5 UBOs with holding %, 6 background portfolio clients (for RM views), 22 documents across types
- [ ] **BOUND-04**: With mock mode on, `lib/api.ts` reads from `data/seed.ts` and returns typed `Application` objects matching the persona

### App Shell & Primitives (SHELL)

- [ ] **SHELL-01**: Top strip component renders across all screens with an (visual-only) language toggle EN / 日本語
- [ ] **SHELL-02**: Dev-only mode switcher component flips between `/(client)` and `/(rm)` contexts; hidden in production builds
- [ ] **SHELL-03**: Rising Mark logo component exists, sized correctly, used in top strip
- [ ] **SHELL-04**: Shared primitives exist and are exported from `components/primitives/`: `Eyebrow`, `StatusChip`, `StagePill`, `AIPulseDot`, `ActionCard`
- [ ] **SHELL-05**: Fresh Green `#BFD730` is applied exclusively to AI-output surfaces and `AIPulseDot`; a lint or visual check confirms it is NOT used on primary buttons, generic accents, or non-AI elements

### Client Journey Dashboard — Yuki's heartbeat (CJD)

- [ ] **CJD-01**: Route `/(client)/journey` (or equivalent) renders the Client Journey Dashboard at 1440px desktop canvas
- [ ] **CJD-02**: Hero section shows bilingual greeting (English + Japanese), 縁 (en) watermark, and an ETA hero number drawn from mock seed
- [ ] **CJD-03**: 6-stage timeline renders showing Kaisei's current stage, completed stages, and upcoming stages with correct status chips
- [ ] **CJD-04**: Paired narrative row renders using the "Your turn / Our turn" pattern from the existing HTML mockup
- [ ] **CJD-05**: Activity feed renders recent events pulled from mock seed, each with timestamp in IBM Plex Mono
- [ ] **CJD-06**: Team card renders showing James Lee as RM with avatar and contact affordance
- [ ] **CJD-07**: All AI-generated surfaces on this screen use Fresh Green; no other surfaces do

### RM Cockpit — James's heartbeat (RMC)

- [ ] **RMC-01**: Route `/(rm)/cockpit` renders the RM Cockpit home at 1440px
- [ ] **RMC-02**: Sidebar navigation renders with links to each major RM area
- [ ] **RMC-03**: Top bar renders with James's identity, notifications indicator, search
- [ ] **RMC-04**: Stats row renders portfolio-level numbers from mock seed
- [ ] **RMC-05**: "Needs You" queue renders items requiring James's action, pulled from mock seed
- [ ] **RMC-06**: "AI Has Been Busy" panel renders a feed of AI-authored work across James's portfolio, styled with Fresh Green
- [ ] **RMC-07**: 6-column portfolio kanban renders the 6 background clients + Kaisei across the six onboarding stages

### Stage Screens — client + RM sides (STAGE)

- [ ] **STAGE-01**: Stage 1 (Invite & Intent) — client view renders; RM view renders
- [ ] **STAGE-02**: Stage 2 (Entity & Structure) — client view renders; RM view renders
- [ ] **STAGE-03**: Stage 3 (Documentation) — client view renders; RM view renders
- [ ] **STAGE-04**: Stage 4 (Screening) — client view renders; RM view renders
- [ ] **STAGE-05**: Stage 5 (Products & Credit) — client view renders; RM view renders
- [ ] **STAGE-06**: Stage 6 (Activation + Perpetual KYC teaser) — client view renders; RM view renders

### Hero Moments (HERO)

- [ ] **HERO-01**: UBO Intelligence hero moment (Stage 2) — AI-authored UBO analysis rendered in Fresh Green, with interactive entity tree for Kaisei and 5 UBOs
- [ ] **HERO-02**: Doc Extraction hero moment (Stage 3) — AI-authored document extraction view showing structured fields pulled from source docs, side-by-side original vs extracted
- [ ] **HERO-03**: Credit Memo Drafter hero moment (Stage 5) — AI-authored draft credit memo for $50M revolver, editable sections, confidence indicators
- [ ] **HERO-04**: RM Copilot sidecar (cross-cutting) — docked sidebar accessible from every RM screen, renders contextual AI suggestions based on current page

## v2 Requirements

No deferrals. The v1 set IS the demo. Anything not listed here is out of scope (below).

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Authentication flows | Mock logged-in state; auth is not a demo moment |
| Real KYC / AML / screening provider integrations | All mocked; real integrations distract from the narrative |
| Supabase schema, migrations, RLS policies | Evan's scope, lives in his separate GSD |
| API routes, Claude API calls, backend logic | Evan's scope; this repo consumes via `lib/api.ts` |
| Compliance officer persona | RM + Client only for v1; widening personas dilutes the demo |
| Ops / back-office persona | Same reasoning |
| Mobile responsiveness | Desktop-only at 1440px; demo audience is a workshop room |
| Accessibility certification | Prototype, not production; best-effort only |
| Production hardening (rate limits, error budgets, observability) | Not required for a demo |
| Real-time collaboration on documents | Not part of the demo narrative |
| Multi-tenant support | Single hero client (Kaisei) for the demo |
| Functional language switching (beyond visual toggle) | Visual-only in v1; real i18n is a later lift |

## Traceability

Every v1 requirement maps to exactly one phase. All 43 requirements are covered.

| Requirement | Phase | Status |
|-------------|-------|--------|
| SETUP-01 | Phase 1: Setup & Alignment | Pending |
| SETUP-02 | Phase 1: Setup & Alignment | Pending |
| SETUP-03 | Phase 1: Setup & Alignment | Pending |
| SCAFF-01 | Phase 2: Scaffolding | Pending |
| SCAFF-02 | Phase 2: Scaffolding | Pending |
| SCAFF-03 | Phase 2: Scaffolding | Pending |
| SCAFF-04 | Phase 2: Scaffolding | Pending |
| SCAFF-05 | Phase 2: Scaffolding | Pending |
| SCAFF-06 | Phase 2: Scaffolding | Pending |
| SCAFF-07 | Phase 2: Scaffolding | Pending |
| BOUND-01 | Phase 3: Shared Boundary | Pending |
| BOUND-02 | Phase 3: Shared Boundary | Pending |
| BOUND-03 | Phase 3: Shared Boundary | Pending |
| BOUND-04 | Phase 3: Shared Boundary | Pending |
| SHELL-01 | Phase 4: App Shell & Primitives | Pending |
| SHELL-02 | Phase 4: App Shell & Primitives | Pending |
| SHELL-03 | Phase 4: App Shell & Primitives | Pending |
| SHELL-04 | Phase 4: App Shell & Primitives | Pending |
| SHELL-05 | Phase 4: App Shell & Primitives | Pending |
| CJD-01 | Phase 5: Client Journey Dashboard | Pending |
| CJD-02 | Phase 5: Client Journey Dashboard | Pending |
| CJD-03 | Phase 5: Client Journey Dashboard | Pending |
| CJD-04 | Phase 5: Client Journey Dashboard | Pending |
| CJD-05 | Phase 5: Client Journey Dashboard | Pending |
| CJD-06 | Phase 5: Client Journey Dashboard | Pending |
| CJD-07 | Phase 5: Client Journey Dashboard | Pending |
| RMC-01 | Phase 6: RM Cockpit | Pending |
| RMC-02 | Phase 6: RM Cockpit | Pending |
| RMC-03 | Phase 6: RM Cockpit | Pending |
| RMC-04 | Phase 6: RM Cockpit | Pending |
| RMC-05 | Phase 6: RM Cockpit | Pending |
| RMC-06 | Phase 6: RM Cockpit | Pending |
| RMC-07 | Phase 6: RM Cockpit | Pending |
| STAGE-01 | Phase 7: Stage Screens | Pending |
| STAGE-02 | Phase 7: Stage Screens | Pending |
| STAGE-03 | Phase 7: Stage Screens | Pending |
| STAGE-04 | Phase 7: Stage Screens | Pending |
| STAGE-05 | Phase 7: Stage Screens | Pending |
| STAGE-06 | Phase 7: Stage Screens | Pending |
| HERO-01 | Phase 8: Hero Moments | Pending |
| HERO-02 | Phase 8: Hero Moments | Pending |
| HERO-03 | Phase 8: Hero Moments | Pending |
| HERO-04 | Phase 8: Hero Moments | Pending |

**Coverage:**
- v1 requirements: 43 total
- Mapped to phases: 43
- Unmapped: 0

---
*Requirements defined: 2026-04-24*
*Last updated: 2026-04-24 after roadmap creation — traceability populated*
