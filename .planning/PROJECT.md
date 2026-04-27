# SMBC Origin — Frontend

## What This Is

An AI-native corporate banking onboarding prototype for SMBC, shown as a clickable desktop-first demo that collapses today's 90–180 day client onboarding journey into days. This `.planning/` tracks the **frontend scope only** — Kit's work. Backend (Supabase schema, API routes, Claude API integration) is owned by Evan and runs its own GSD. The two scopes meet at a typed boundary: `types/origin.ts` + `lib/api.ts`, swappable mock↔real via `NEXT_PUBLIC_USE_MOCK`.

The prototype is a showpiece for stakeholder demos and workshops, not production. Two personas: **Yuki Tanaka** (Treasurer, Kaisei Manufacturing KK — client-side) and **James Lee** (RM, Japanese Corporates desk, SMBC Singapore — RM-side). Hero scenario: Kaisei expanding into Singapore, Hong Kong, and the UK — cash management, trade finance, $50M revolver.

## Core Value

A stakeholder watching Yuki's and James's paired screens believes an AI-native onboarding is feasible at SMBC and can see it working — with the design feeling distinctively SMBC, not generic fintech.

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

- [x] **Repo setup & stack alignment with Evan** — decisions captured in CLAUDE.md (Phase 1)
- [x] **Next.js 16.2 App Router scaffold with TypeScript strict, Tailwind v4, design tokens, fonts** — live Vercel URL on day 1 (Phase 2)
- [x] **Shared boundary types and mock/real API switch** — `types/origin.ts`, `lib/api.ts`, `lib/api.mock.ts`, `lib/api.real.ts` locked; `data/seed.ts` with Kaisei + 6 portfolio clients (Phase 3)
- [x] **App shell and shared primitives** — TopStrip, route-group layouts, 8 primitives (Eyebrow/Icon/Avatar/AIPulseDot/AIBadge/StatusChip/StagePill/ActionCard), SHELL-05 Fresh Green enforcement gate; 201 tests (Phase 4)

### Active

<!-- Current scope. Building toward these. Detailed breakdown lives in REQUIREMENTS.md. -->

- [ ] Client Journey Dashboard (Yuki's heartbeat screen) running on mocks
- [ ] RM Cockpit home (James's heartbeat screen)
- [ ] Six onboarding stages, client + RM sides in parallel
- [ ] Four hero moments: UBO Intelligence (Stage 2), Doc Extraction (Stage 3), Credit Memo Drafter (Stage 5), RM Copilot (cross-cutting)

### Out of Scope

<!-- Explicit boundaries. Includes reasoning to prevent re-adding. -->

- **Authentication flows** — mock logged-in state; auth is not a demo moment
- **Real KYC / AML / screening integrations** — all mocked; third-party integrations distract from the narrative
- **Supabase schema, API routes, Claude API calls** — Evan's scope, lives in a separate GSD; arrives here via `NEXT_PUBLIC_USE_MOCK=false` swap
- **Compliance officer and ops persona views** — RM + Client only for v1; widening personas dilutes the demo
- **Mobile responsiveness** — desktop-first, 1440px canvas; demo audience is a workshop room, not a phone
- **Accessibility certification** — prototype, not production; best-effort only
- **Production hardening** — no rate limiting, error budgets, observability, etc.

## Context

**Repo state at project start:**
- Git repo: `evangohAIO/SMBCorigins`, main branch, initial commits contain `CLAUDE.md` (shared product brief) and empty `/docs` placeholders
- Reference docs expected in `/docs/`: `ORIGIN_PRODUCT_BRIEF.html`, `ORIGIN_DESIGN.md`, `ORIGIN_JOURNEY_DOC.html`, `ORIGIN_BUILD_PROMPT.md` — user will fill these
- An existing HTML mockup of the Client Journey Dashboard exists externally (1280px canvas, paired "Your turn / Our turn" pattern); canvas will be rescaled to 1440px during the port

**Ways of working:**
- Two humans (Kit + Evan), one repo, parallel GSDs — Kit's is this one
- Small PRs, merge daily, no long-lived branches
- Branch naming: `kit/<area>` or `evan/<area>`
- `types/origin.ts` is the critical shared artefact — never edit without telling Evan

**Design system (locked, from CLAUDE.md):**
- Typography: Fraunces (display, numerals) · Inter Tight (UI body) · Noto Sans JP · IBM Plex Mono (data, IDs, timestamps, eyebrows)
- Colors: Trad Green `#004832`, Fresh Green `#BFD730`, warm paper `#FAFBF7`
- **Fresh Green is reserved exclusively for AI outputs and AI presence** — never use it for generic accents or primary buttons

**Stage structure:** Six onboarding stages — (1) Invite & Intent · (2) Entity & Structure · (3) Documentation · (4) Screening · (5) Products & Credit · (6) Activation + Perpetual KYC teaser. Plus the RM Copilot sidecar cross-cutting every RM screen.

## Constraints

- **Tech stack**: Next.js 14+ App Router · TypeScript strict · Tailwind · Supabase (Evan's side) · Claude API (Evan's side) · Vercel deployment — Locked with Evan; do not change without cross-GSD alignment
- **Viewport**: Desktop-only, 1440px canvas — The mockup references 1280px; all ports standardize to 1440px (CLAUDE.md wins)
- **Shared boundary**: Frontend consumes `types/origin.ts` + `lib/api.ts`; real backend arrives behind `NEXT_PUBLIC_USE_MOCK` — Enables frontend to ship against mocks while Evan builds; swap without refactor
- **Timeline**: First deployed URL day 1 · first heartbeat screen by end of day 3 · both heartbeats (Yuki + James) by end of day 5 · first hero moment (UBO) by end of week 1 — Demo-driven schedule
- **Brand rule**: Fresh Green `#BFD730` used exclusively on AI-generated outputs and AI presence indicators — Core brand signal; wrong application breaks the AI-as-connective-tissue story
- **Language**: English only in UI body, Japanese supported for persona-surface copy (bilingual greetings) and Noto Sans JP font available — Language toggle is visual-only for v1

## Key Decisions

<!-- Decisions that constrain future work. Add throughout project lifecycle. -->

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Frontend and backend run separate GSDs | Kit and Evan work at different cadences; one GSD per person keeps plans personal and fast. The shared `types/origin.ts` + `lib/api.ts` contract is the synchronization point | — Pending |
| Phase 1 (alignment) lives inside this `.planning/` | Tracking the cross-GSD alignment conversation as a Phase 1 deliverable keeps decisions versioned and auditable, rather than lost in chat. Output is agreed decisions written into CLAUDE.md | — Pending |
| Canvas standardizes to 1440px | CLAUDE.md wins over the 1280px mockup reference — new work and ports both target 1440px to avoid two concurrent design systems | — Pending |
| Mock-first frontend with env-flag swap to real backend | Lets frontend ship a live Vercel URL on day 1 without waiting on Supabase. `NEXT_PUBLIC_USE_MOCK` flips the data source when Evan's API is ready | — Pending |
| Route groups `/(client)` and `/(rm)` with dev-only mode switcher | Single Next.js app serves both personas; mode switcher in top nav flips context during demos and development | — Pending |
| Fresh Green is an AI-only brand token | Reserving `#BFD730` for AI outputs makes the "AI as connective tissue" story legible at a glance in every screen | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-27 — Phase 4 complete (app shell + primitives)*
