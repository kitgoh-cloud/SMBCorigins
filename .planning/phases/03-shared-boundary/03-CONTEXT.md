# Phase 3: Shared Boundary - Context

**Gathered:** 2026-04-26
**Status:** Ready for planning

<domain>
## Phase Boundary

**Kit's mock-layer half of the cross-GSD shared boundary.** This phase ships `data/seed.ts`, `lib/api.mock.ts`, and `lib/stages.ts` — typed against `types/origin.ts` and conforming to `OriginAPI` from `lib/api.ts` (both authored by Evan in PR #4, which is in review at the time this phase opens). The mock layer is **stateful and mutable** — backing the demo's three-act flow:

1. **Cockpit cold open** (Act 1) — Kaisei + 6 background portfolio clients exist as seeded historical state at app boot.
2. **Kaisei Stage 3 deep-dive** (Act 2) — Kaisei opens at Stage 3 (Documentation) with Stages 1–2 complete; demo flips between completed/in-progress/upcoming surfaces.
3. **Live new-client submission** (Act 3) — RM invites a new client, client submits intake form, Application transitions Stage 1 → Stage 2 with canned "entity discovery" enrichment. This act is **runtime-created**, not seeded, and demonstrates write paths through the mock.

**Working mode:** Kit's PR branches off `main`, not off Evan's PR #4 branch — review trees stay disentangled. When Evan's PR #4 merges, Kit rebases. If Evan's contract shape shifts during his review-fix cycles, Kit adjusts seed/mock to match.

**Out of scope for Phase 3** — these belong to later phases:
- Real email delivery for RM invite (intake link returned directly; "copied to clipboard" UX pattern)
- Real entity enrichment / external registry queries (canned data via `demoNewClientTemplate`)
- Stage 3+ progression for the runtime-created client (demo stops before then)
- Realistic error rates beyond the bounded intake-token error surface (Phase 8+ if needed)
- LocalStorage / sessionStorage persistence (session-scoped in-memory only)
- Authentication flows (mocked logged-in state per PROJECT.md Out of Scope)
- App shell, Yuki/James screens, hero moments — Phases 4–8

</domain>

<decisions>
## Implementation Decisions

### Phase-scope split (pre-decided by Kit's framing — not re-litigated)
- **D-42:** Phase 3 scope is split across the two GSDs. Evan owns `types/origin.ts` (BOUND-01) and `lib/api.ts` (BOUND-02) in PR #4. Kit owns `data/seed.ts` (BOUND-03) and `lib/api.mock.ts` (BOUND-04), plus the new `lib/stages.ts` helper. Kit's PR branches off `main`, not Evan's PR #4 branch — review trees stay disentangled. Per D-15, first-PR-wins; second rebases.
- **D-43:** Treat Evan's PR #4 + Kit's two architectural pushes (move `STAGE_NAMES` + `deriveStages` to `lib/stages.ts`; validate `EntityAddress.country` in mapper) as the contract baseline. If Evan rejects the `lib/stages.ts` push, fall back to importing from `types/origin.ts` — the mock change is one import path. If Evan rejects the country-validation push, the targeted invariant test (D-58 below) catches drift independently.
- **D-44:** Kit's branch name = `kit/phase-3-shared-boundary` (mirrors prior `kit/scaffold` / `kit/phase-1-alignment` naming). Single-PR-per-phase per Phase 1/2 cadence.

### Action items raised during this discussion (Kit-side, before plan-phase)
- **A-01:** **Re-read PR #4's `lib/api.ts` and confirm `OriginAPI` includes the three intake mutation methods** (`createApplication`, `submitIntake`, `getIntakeByToken`). The original Phase 3 ROADMAP success criterion #2 ("`lib/api.ts` returns typed `Application` objects") is read-shaped, predating the Act 3 demo flow discovery. If `OriginAPI` is read-only, send Evan a 5th review point before he finalizes PR #4 — `lib/api.mock.ts` can't satisfy a unified `OriginAPI` if mutation methods aren't typed there. Action belongs to Kit, not the planner.

### Seed data depth & realism (BOUND-03)
- **D-45:** **Kaisei's hero application is thick — demo-ready prose.** Every `Document` carries a populated `extraction_result` (typed per `doc_type`); every `ScreeningHit` carries an `ai_narrative` and `disposition_note`; the `CreditMemo` for the $50M revolver has all 5 sections populated (`exec_summary`, `client_overview`, `financials`, `risk`, `recommendation`). Phases 5–8 just render the seeded prose. Trade-off accepted: more rework if Evan reshapes a sub-field, but the demo's "feels real" texture lives in this prose.
- **D-46:** **6 background portfolio clients are lightweight — kanban + Needs You only.** Per `docs/ORIGIN_DESIGN.md §11.3`: Fujiwara Pharma (Stage 3, doc review), Sato Trading (Stage 4, screening, 1 amber hit), Ishikawa Logistics (Stage 5, credit memo drafting), Hayashi Foods (Stage 1, invited), Nakamura Electronics (Stage 6, activating), Ota Robotics (on hold, regulatory). Each gets a full `Application` record + 1 lightweight `Entity` + 1 `UBO` + 1 stage-relevant `Document`. No full entity trees. Demo moments live on Kaisei.
- **D-47:** **Kaisei opens at Stage 3 (Documentation) in progress.** Stages 1–2 (Invite & Intent, Entity & Structure) are complete in seeded state — UBO tree fully discovered, structure approved. Stage 3 has some docs verified, some pending. Stages 4–6 are upcoming. CJD-03 timeline tells a richer "in-flight journey" story; Stage 2 UBO Intelligence hero replays as a "completed" view in Phase 8; Stage 3 Doc Extraction hero is the active surface; Stage 5 Credit Memo Drafter is upcoming.
- **D-48:** **Activity feed = ~15–20 events spanning all 6 stages.** Mix of `actor_type: 'client'`, `'rm'`, `'ai'`, `'system'`. Realistic spread — clustered bursts (UBO discovery moment in Stage 2, doc upload batch in Stage 3) and quiet spans. Each event timestamp explicit and IBM-Plex-Mono-renderable. Phase 5 (CJD-05) just renders.
- **D-49:** **22 documents per BOUND-03** spread across `doc_type` values from `docs/ORIGIN_DESIGN.md §7` (table 6 — coi/moa/board_res/signatory_id/financials/...). Distribute across Kaisei's entity tree (Japan parent, SG/HK/UK subs, Kaisei Technology, Morita Holdings shell). Mix of `status` values — `verified` (Stages 1–2 docs), `extracted` and `extracting` (Stage 3 in-progress), `uploaded` (still to-process), and 1–2 `rejected` for narrative texture.

### Demo Act 3 — runtime-created state (BOUND-03 + BOUND-04 expansions)
- **D-50:** **`data/seed.ts` exports `demoNewClientTemplate`** — canned enrichment data (entity details, suggested KYC documents, jurisdiction risk flags) consumed by `submitIntake` at runtime to populate the Stage 2 transition. **NOT seeded as a record** — the new application enters the store via `createApplication`, not via seed; the template is the payload that hydrates the Entity + UBO records that `submitIntake` creates from the form data plus enrichment.
- **D-51:** **`lib/api.mock.ts` provides three intake-flow methods** (subject to A-01 confirmation against Evan's `OriginAPI`):
  - `createApplication(invite: { clientName, clientEmail, productType }) → Promise<{ application: Application; intakeToken: string; intakeUrl: string }>` — creates an `Application` in Stage 1 (`status: 'invited'`), returns intake token + URL. New record appears in cockpit kanban via subscribe-emit.
  - `submitIntake(token: string, formData: IntakeFormData) → Promise<Application>` — accepts client-side intake submission; creates `Entity` + initial `UBO` records from form data merged with `demoNewClientTemplate`; transitions `Application` Stage 1 → Stage 2; emits store-mutation event so kanban updates.
  - `getIntakeByToken(token: string) → Promise<{ application: Application; invite: InviteContext }>` — read path for the client-facing intake form. Throws on bad/stale/consumed token (D-54 below).
- **D-52:** **In-memory mutable store, session-scoped.** Module-scoped state hydrated lazily from `data/seed.ts` on first read (`structuredClone` deep clone). Page refresh re-runs module code = fresh seed = clean demo run. **No localStorage / sessionStorage persistence** — explicit non-goal per Kit's addendum.

### Mock API behavior (BOUND-04)
- **D-53:** **Per-call latency map with AI-moment overrides.** Reads ~80–150ms (feels live, not instant), writes ~200–400ms (feels acknowledged), AI-flavored calls 1.5–2.5s — UBO Intelligence enrichment, Doc Extraction stream, Credit Memo draft, and `submitIntake`'s entity-discovery transition. Defined as a per-method config map in `lib/api.mock.ts`. **No random jitter** — predictable for live demo run-throughs (a stakeholder watching shouldn't see the "AI moment" feel inconsistent across attempts).
- **D-54:** **Bounded error surface — intake flow only.** Define `IntakeTokenError extends Error` with field `reason: 'expired' | 'unknown' | 'consumed'`.
  - `getIntakeByToken` throws `IntakeTokenError` with the appropriate `reason` on bad / stale / already-used tokens.
  - `submitIntake` is **idempotent**: a second call with the same token throws `IntakeTokenError({ reason: 'consumed' })` and does NOT create duplicate `Application` / `Entity` records. The first successful call wins.
  - The intake form renders distinct copy per `reason` ('expired' → "your invite link expired, please ask James to resend"; 'unknown' → "we don't recognize this link"; 'consumed' → "this intake has already been submitted").
  - **All other mock methods remain happy-path.** No random error rates anywhere else. A debug-only `?simulateError=…` query-param hook is deferred (not Phase 3 scope).
- **D-55:** **Reactive reads via tiny event-emitter + `React.useSyncExternalStore`.** Mock store exposes `subscribe(listener: () => void): () => void` and emits on every mutation. Cockpit kanban and any other live view subscribes via a thin hook (e.g., `useApplications()`) that wraps `useSyncExternalStore`. Zero dependencies, ~50 LOC of glue. Plays cleanly with future swap to `lib/api.real.ts` — when Evan wires Supabase realtime, the same hooks adapt without component-level changes. **Not adopting React Query / SWR in Phase 3** — defer until a real backend is in play.
- **D-56:** **Lazy deep-clone on first read.** Store hydrates on the first call to any `lib/api.mock.ts` method. `data/seed.ts` exports stay frozen (treat as immutable templates). Mutations write to the cloned store only; subsequent reads return cloned-store data. Eliminates HMR-bleed risk between dev sessions.

### lib/stages.ts (new file Kit creates this phase)
- **D-57:** **Kit creates `lib/stages.ts` in this phase's PR**, holding the `STAGE_NAMES` constant + `deriveStages(application: Application): StageStatus[]` helper that Kit's review push moved out of `types/origin.ts`. Surface is **strictly** these two exports — no `getStageProgress`, no `getActiveStage` helpers. Future stage-related utilities live in their own files when needed; broader scope here is creep.
- **D-58:** **Add `lib/stages.ts` to `.github/CODEOWNERS` as co-owned** (`lib/stages.ts @kitgoh-cloud @evangohAIO`). Group with the other co-owned contract surfaces (`types/origin.ts`, `lib/api.ts`) — **not** alphabetically. The grouping signals "this is the contract surface," matching CONTRACT.md §"Co-ownership rules". CODEOWNERS edit lands in the same PR that creates `lib/stages.ts`.
- **D-59:** **Fallback if Evan rejects the move** — accept Evan's call (per D-15 first-PR-wins on co-owned files). On rebase, delete `lib/stages.ts` from this PR, re-target seed/mock imports to `types/origin.ts`. No re-litigation.

### Type-shape drift handling
- **D-60:** **Primary safety net = compile-time (`tsc --noEmit`) + targeted invariant tests.** Phase 2's CI typecheck job already catches structural drift on every commit. Phase 3 adds a small Vitest suite (~3–8 cases) for invariants the type system can't catch:
  - Sum of `UBO.ownership_pct` across each Application is plausible (≤ 100% for direct ownership, with explicit notes for nested-via-holding cases per Kaisei).
  - Every `EntityAddress.country` is a valid ISO-3166-1 alpha-2 code (supports Kit's second architectural push independently of whether Evan's mapper validation lands).
  - Total document count = 22 across the seeded set (BOUND-03 acceptance).
  - Every `Application` has a non-empty entity tree (root entity exists; for Kaisei specifically, the 5-entity tree shape matches `docs/ORIGIN_DESIGN.md §11.1`).
  - 6 background portfolio clients exist in the seeded set with the names from `docs/ORIGIN_DESIGN.md §11.3`.
  - `lib/stages.ts deriveStages()` returns expected statuses for the Kaisei seeded state (Stages 1–2 complete, Stage 3 active, Stages 4–6 upcoming).
- **D-61:** **Test framework = Vitest** (resolves Phase 1 deferred item). ESM-native, zero-config with Next.js 16 + Tailwind v4 + TS strict. Adopting Vitest now per the Phase 1 deferral signal: "pick when types/origin.ts and the artifacts worth unit-testing actually land."
- **D-62:** **Co-located tests** — `data/seed.test.ts`, `lib/api.mock.test.ts`, `lib/stages.test.ts`. Standard Vitest convention; matches "where do I test seed.ts? right next to it" discoverability.
- **D-63:** **Third top-level CI job** — `test` runs alongside `typecheck` and `lint` per Pattern D in `02-PATTERNS.md`. Becomes a fourth required status check (`typecheck`, `lint`, `test`, `Vercel`) — branch protection updated in the same PR cycle. New `package.json` scripts: `"test": "vitest run"` and `"test:watch": "vitest"`. Update `CLAUDE.md`'s "How to run" section to include `npm run test` in pre-PR validation.

### Claude's Discretion
- Exact in-memory store implementation (single module-scoped object, Map-keyed by id, or class-instance — picker's choice; emitter shape stays the same).
- Intake token format (uuid v4, nanoid, deterministic-from-application-id) — any URL-safe string works; demo doesn't gate on format.
- Per-method latency exact values within the recommended ranges (e.g., 100ms for `getApplications`, 120ms for `getApplication(id)`, 1800ms for the UBO Intelligence enrichment).
- Vitest config shape (`vitest.config.ts` vs inline `vite.config.ts`) — keep minimal.
- Exact prose for Kaisei's CreditMemo sections, ScreeningHit narratives, document extractions — pull cues from `docs/ORIGIN_DESIGN.md §5` (AI hero moment specs) but Kit drafts the actual text.
- Exact ScreeningHit count and disposition mix (e.g., 2 cleared + 1 pending vs 3 cleared) — pick to feel realistic.
- The 4 Tanaka Family Trust beneficiaries (per `docs/ORIGIN_DESIGN.md §11.2`) — names, holding %, nationalities — Kit invents names following Japanese naming conventions.
- Whether `demoNewClientTemplate` ships as one shape (a single canned new client) or a small array of 2–3 shapes (RM picks at invite time) — start with one; add variety only if a stakeholder asks.

### Folded Todos
*(none — `gsd-sdk query todo.match-phase 3` returned 0 matches)*

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project planning (frontend GSD)
- `.planning/PROJECT.md` — vision, locked design system, working principles, mock-first stance
- `.planning/REQUIREMENTS.md` — `BOUND-01..04` define the four Phase 3 acceptance items; note that BOUND-01 + BOUND-02 are Evan's deliverables, this CONTEXT.md scopes Kit's BOUND-03 + BOUND-04 + lib/stages.ts.
- `.planning/ROADMAP.md` §"Phase 3: Shared Boundary" — phase goal and four success criteria. **Note:** success criterion #2 reads "lib/api.ts returns typed Application objects" — read-shaped wording predates the Act 3 demo-flow discovery. Action item A-01 above resolves whether Evan's `OriginAPI` accommodates the three intake mutation methods.
- `.planning/STATE.md` — current project status; Phase 2 merged, Vercel production live at https://smbcorigins.vercel.app
- `.planning/phases/01-setup-alignment/01-CONTEXT.md` — D-01..D-25 (stack contract, scaffolding ownership, cross-GSD governance)
- `.planning/phases/02-scaffolding/02-CONTEXT.md` — D-26..D-41 (design tokens, fonts, Vercel link, CI baseline, placeholder pages)
- `.planning/phases/02-scaffolding/02-PATTERNS.md` §"Pattern D" (CI third-job pattern for `test`), §"Pattern E" (Vercel env-var scoping for `NEXT_PUBLIC_USE_MOCK`)

### Cross-GSD canonical (boundary governance — must read before touching shared files)
- `DECISIONS.md` (repo root) — append-only canonical log. **Per D-20, on conflict with any other doc, this file wins.** Especially relevant: `D-13` (co-ownership), `D-15` (first-PR-wins on conflicts), `D-16` (lib/api.* split with Kit/Evan ownership), `D-23` / `D-24` (CONTRACT + CODEOWNERS governance). New decisions in Phase 3 (D-42..D-63) extend this log via the per-row signature convention (D-22) — append at execution time, signed by both Kit and Evan.
- `CONTRACT.md` (repo root) — boundary co-ownership rules, conflict resolution flow, Slack-ping-on-contract-PR convention. **Phase 3 PR triggers a Slack ping per CONTRACT.md §"Announcement convention".**
- `.github/CODEOWNERS` (already exists) — auto-review rules for `types/origin.ts`, `lib/api.ts`, `lib/api.mock.ts`, `lib/api.real.ts`. **Phase 3 modifies this file** to add `lib/stages.ts` per D-58.

### Product context
- `CLAUDE.md` — repo-root brief read at every Claude session start. Contains "Stack contract" (D-01..D-08 summary) and "Scaffolding ownership" (D-09..D-12 summary). Defines the Fresh Green AI-only rule. **Phase 3 updates "How to run"** to include `npm run test` (D-63).
- `docs/ORIGIN_DESIGN.md` §5 — four AI hero moments (UBO Intelligence Stage 2, Doc Extraction Stage 3, Credit Memo Drafter Stage 5, RM Copilot cross-cutting). Informs `lib/api.mock.ts` latency map for AI-flavored calls (D-53) and seeded prose richness for Kaisei's records (D-45).
- `docs/ORIGIN_DESIGN.md` §7 — 10-table Supabase schema. **This is the canonical shape source for `types/origin.ts`** that Evan authors in PR #4 — Kit's `data/seed.ts` fixtures must conform to whatever shape Evan ships. Sections to read: `applications` (status enum, current_stage 1-6, target_jurisdictions[], products_requested[]), `entities` (parent_entity_id self-ref, ownership_pct, confidence_score, is_shell, source enum), `ubos` (control_type, is_pep, screening_status, confidence_score), `documents` (doc_type, status enum, extraction_result jsonb), `screening_results` (subject_type enum, sanctions/pep/adverse_media booleans, ai_narrative, disposition enum), `credit_memos` (sections jsonb with 5 keys, status enum), `activities` (actor_type enum, event_type, payload jsonb).
- `docs/ORIGIN_DESIGN.md` §11 — **canonical seed data spec.** §11.1 = Kaisei entity tree (5 entities). §11.2 = 5 UBOs with %. §11.3 = 6 background portfolio clients with names + stage hints. **Kit's `data/seed.ts` must match these specs verbatim** (D-46, D-47).
- `docs/ORIGIN_DESIGN.md` §8 — design tokens (already ported to `app/globals.css` in Phase 2; not modified by Phase 3, but seeded prose may reference token-styled surfaces).
- `docs/ORIGIN_PRODUCT_BRIEF.html`, `docs/ORIGIN_JOURNEY_DOC.html`, `docs/ORIGIN_BUILD_PROMPT.md` — additional product context.

### Files Evan ships in PR #4 (Kit imports from these once merged)
- `types/origin.ts` — typed shapes for `Application`, `Entity`, `UBO`, `Document`, `ScreeningHit`, `CreditMemo`, `Stage`, `User`. Contract baseline = Evan's PR #4 + Kit's two architectural pushes (D-43).
- `lib/api.ts` — typed `OriginAPI` interface + the `NEXT_PUBLIC_USE_MOCK` switch. **Pending action item A-01** — confirm `OriginAPI` includes mutation methods before Phase 3 plan-phase locks BOUND-04 surface.

### Files this phase creates
- `lib/stages.ts` (new — D-57)
- `data/seed.ts` (new — BOUND-03; includes `demoNewClientTemplate` per D-50)
- `lib/api.mock.ts` (new — BOUND-04)
- `data/seed.test.ts`, `lib/api.mock.test.ts`, `lib/stages.test.ts` (new — D-62)
- `vitest.config.ts` (new — minimal config per D-61)

### Files this phase modifies
- `.github/CODEOWNERS` (add `lib/stages.ts` co-owned entry per D-58)
- `.github/workflows/ci.yml` (add `test` as third top-level job per D-63)
- `package.json` (add `vitest` devDep, `test` + `test:watch` scripts)
- `CLAUDE.md` (update "How to run" to include `npm run test` in pre-PR validation)
- Branch-protection rules on `main` — manual GitHub UI step to add `test` as a fourth required status check after the first CI run on the new job

### External docs (verify current best practices at planning time)
- React `useSyncExternalStore` docs — official subscribe API for non-React-state external stores; the canonical mechanism for D-55.
- Vitest docs — Next.js + TS integration, co-located test discovery, CI invocation (`vitest run` non-watch mode).
- ISO 3166-1 alpha-2 code list — for the country-code invariant test (D-60). Vendor a small constant list rather than pulling a dependency.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **None yet inside the boundary.** `types/origin.ts`, `lib/api.ts`, `lib/api.mock.ts`, `lib/api.real.ts`, `data/seed.ts` do not exist on `main` at the time this CONTEXT.md is written. Kit's PR creates the mock-half files; Evan's PR #4 creates the typed-shape + switch files.
- **Phase 2's scaffold is the substrate** — `app/(client)/journey/page.tsx`, `app/(rm)/cockpit/page.tsx` exist as bare placeholders; `app/globals.css` has the `@theme` token block; four `next/font` fonts are wired through `app/layout.tsx`. Phase 3 does NOT touch these — the mock layer ships under `data/`, `lib/`, and `types/`, not under `app/`.

### Established Patterns (inherit from prior phases)
- **Branch naming** `kit/<area>` per CLAUDE.md and D-12 — Phase 3 work goes on `kit/phase-3-shared-boundary` (D-44).
- **Single-PR-per-phase** — Phase 1 closure was one PR; Phase 2 was one PR. Phase 3 mirrors this: one PR on `kit/phase-3-shared-boundary`, reviewed and merged by Evan (cross-review enforced via CODEOWNERS for the boundary files).
- **Commit message style** (`git log` shows `feat(NN-MM): ...`, `docs(NN-MM): ...`, `chore(NN): ...`) — match this for Phase 3 commits.
- **GSD planning artifacts** stay in `.planning/` (Kit-only per D-21). Evan never touches `.planning/`.
- **CSS-first `@theme` tokens** (Pattern A from `02-PATTERNS.md`) — Phase 3 doesn't touch tokens, but if seeded prose references token-styled surfaces in Phase 5+ rendering, those surfaces use `bg-fresh-green`, `text-trad-green`, etc. utilities — never inline hex.
- **Two-job CI workflow** (Pattern D from `02-PATTERNS.md`) — Phase 3 adds the third top-level job (`test`); structure is identical (own runner, own status check name).
- **`@/` path alias** resolves to repo root (D-38) — `import { Application } from '@/types/origin'`, `import { mockApi } from '@/lib/api.mock'`, `import { seedApplications } from '@/data/seed'`.

### Integration Points
- **`OriginAPI` interface in `lib/api.ts`** (Evan-authored in PR #4) — `lib/api.mock.ts` implements this verbatim. **Pending A-01** — confirm interface accommodates three mutation methods (D-51) before locking BOUND-04 surface.
- **`types/origin.ts`** (Evan-authored in PR #4) — Kit's `data/seed.ts` and `lib/api.mock.ts` import every typed shape from here. Treat the shape as the contract baseline + the two pushes (D-43); rebase if it shifts.
- **`.github/CODEOWNERS`** — Phase 3 adds `lib/stages.ts` entry per D-58. Group with `types/origin.ts` and `lib/api.ts`, not alphabetically (signals "contract surface").
- **`.github/workflows/ci.yml`** — Phase 3 adds `test` job as a third top-level entry. Same `actions/checkout@v4` + `actions/setup-node@v4` (`node-version-file: '.nvmrc'`) + `npm ci` boilerplate as the existing `typecheck` and `lint` jobs.
- **Branch protection on `main`** (D-08, set up in Phase 2) — fourth required status check (`test`) gets added manually via GitHub Settings → Branches → Edit rule, after the first CI run on the new job (per `02-PATTERNS.md` Pattern D's "sequence" note).
- **Vercel `NEXT_PUBLIC_USE_MOCK=true`** — already set in both Production and Preview per D-35. Phase 3's mock layer reads the same env var (defaults to `true` if unset). The `false` swap happens later when Evan's `lib/api.real.ts` is wired.
- **`useSyncExternalStore` from `react`** — built-in since React 18. Next.js 16 ships React 19; available without dep changes.

### Tooling baseline (already in place from Phase 2)
- TypeScript `strict: true` + `noUncheckedIndexedAccess: true` (D-05) — `data/seed.ts` lookups by id will return `T | undefined` and need explicit narrowing (or `at()` with explicit existence checks).
- ESLint flat config + Prettier (D-07) — Phase 3 source files match existing rules.
- npm (D-06) — Vitest installs via `npm install --save-dev vitest`.

</code_context>

<specifics>
## Specific Ideas

- **Three-act demo flow is the load-bearing mental model** for Phase 3. Act 1 (cockpit cold open) and Act 2 (Kaisei Stage 3 deep-dive) are seeded historical state — `data/seed.ts` does the work. Act 3 (live new-client submission) is runtime-created — `lib/api.mock.ts` does the work. Both halves of the mock layer serve the same demo, but their job descriptions differ. The planner should structure plans around this split: seed plan(s), mutation/intake plan(s), reactivity plan(s), test plan(s).
- **"Feels real, not slow"** — D-53's latency map is calibrated so reads are perceptible (you see a brief shimmer) but not annoying, and AI moments are dramatic enough to land as "the AI is doing something" without dragging. Reference: stakeholders watching a workshop demo, not users waiting for a banking app to respond.
- **Idempotent intake submission is a demo-protection feature.** A live demo where the presenter accidentally submits twice should NOT create two clients in the cockpit kanban. D-54's `IntakeTokenError({ reason: 'consumed' })` makes the second submission fail loudly with helpful copy, not silently duplicate.
- **Frozen `data/seed.ts` exports + lazy-cloned mutable store** is the "cheap immutable seed + cheap mutable runtime" pattern. `data/seed.ts` reads like a fixtures file; `lib/api.mock.ts` reads like a tiny in-memory backend. Page refresh = clean slate. No localStorage means the demo is reproducible run-to-run.
- **Kaisei's `Morita Holdings — BVI (shell)` entity is the UBO Intelligence narrative anchor.** Per `docs/ORIGIN_DESIGN.md §11.1`, Morita Holdings is the BVI shell that Stage 2's UBO agent unwraps to surface the Tanaka Family Trust beneficiaries. The seed must model this clearly: `Entity.is_shell: true`, `Entity.source: 'document'` or `'registry'` (whichever fits the narrative), and a corresponding `UBO` for the Tanaka Family Trust with confidence_score reflecting "discovered, requires review."
- **`demoNewClientTemplate` should feel plausibly different from Kaisei** so the live submission demo doesn't look like "Kaisei again, but blank." Suggest a single Singapore-incorporated mid-size manufacturer with a 2-entity tree (parent + 1 sub) and 1–2 UBOs — concrete enough that the entity-discovery enrichment lands as "the system found 2 entities and 2 UBOs from your inputs." Names invented; not based on real companies.
- **Ownership % invariant test (D-60) needs to handle the 80%-public-float case** for Kaisei Manufacturing KK directly. Per `docs/ORIGIN_DESIGN.md §11.2`, named UBOs total ~72% (42 + 18 + 12) plus the Tanaka Family Trust (4 persons each <5%, so ~16% combined) plus public float (~12%). The invariant assertion should compare named-UBO sum vs. an explicit "total accounted for" annotation in seed metadata, not naively check "sum equals 100%."
- **CONTRACT.md §"Announcement convention" applies to Phase 3's PR.** When Kit opens the PR on `kit/phase-3-shared-boundary`, ping the shared Slack channel with the PR link, a one-line summary, and a callout — specifically that `data/seed.ts` and `lib/api.mock.ts` are the new mock surface, and that `lib/stages.ts` is the architectural-push file. Evan reviews per CODEOWNERS auto-request.

</specifics>

<deferred>
## Deferred Ideas

### Re-deferred from prior phases
- **Real entity enrichment / external registry queries** — confirmed deferred (out of scope per Kit's addendum). Stage 2's UBO Intelligence agent narrative is satisfied by canned data in seed (D-45) for Kaisei and `demoNewClientTemplate` (D-50) for the runtime client.
- **Real email sending for RM invite** — deferred. Intake link is returned directly from `createApplication` and copied to clipboard in the UI (Phase 6+ handles the copy-to-clipboard moment).
- **Custom Vercel domain** — Phase 2 deferral; still deferred. `*.vercel.app` is the demo URL until pre-stakeholder polish.
- **Husky / lint-staged** — Phase 2 deferral; still deferred. CI is the safety net; Phase 3 adds the third (`test`) check.
- **Fresh Green AI-only enforcement (lint or grep)** — Phase 4 deliverable per SHELL-05; Phase 3 doesn't touch.
- **Secrets handling pattern** — still deferred until Evan's `lib/api.real.ts` introduces real Supabase keys.

### Newly deferred from Phase 3 discussion
- **Stage 3+ progression for the runtime-created Act 3 client** — explicitly out of scope. The demo stops at Stage 2. If a stakeholder wants to see "what happens after intake," Kaisei's seeded Stage 3 is the answer.
- **LocalStorage / sessionStorage persistence of mutations** — explicitly out of scope. Page refresh resets state. If a future phase wants persistence (e.g., to share a demo URL with mutations baked in), revisit then.
- **React Query / SWR adoption** — deferred. `useSyncExternalStore` is sufficient for Phase 3; if Evan's real backend adds Supabase realtime in a future phase, the swap point is `lib/api.real.ts`, not the components.
- **Zod runtime schemas at the fixture boundary** — deferred in favor of compile-time + targeted Vitest invariant tests (D-60). Reconsider only if shape drift between Evan's types and Kit's seed becomes a recurring failure mode.
- **Realistic random error rates (~5% on writes)** — explicitly rejected. Demo predictability outweighs "production realism."
- **Debug-only `?simulateError=…` query-param hook** — light error injection for stakeholder Q&A — deferred. Add when a stakeholder asks "what if it fails?" and not before.
- **Stage helpers beyond `STAGE_NAMES` + `deriveStages`** — `getStageProgress`, `getActiveStage`, `getCompletedStages` etc. live in their own files in later phases when the consuming components actually need them. Phase 3's `lib/stages.ts` stays narrow per D-57.
- **E2E / Playwright tests** — deferred. Vitest unit tests for invariants are sufficient for Phase 3. Revisit if Phase 7+ stage-screen interactions warrant browser-level coverage.
- **`@tailwindcss/typography` plugin** — Phase 2 deferral; still deferred. Stage 5 Credit Memo Drafter (Phase 8) is the natural moment to evaluate.
- **Vitest UI / coverage reports** — defer until there's a question worth answering. `vitest run` in CI is enough for Phase 3.
- **Multiple `demoNewClientTemplate` shapes** — start with one canned new client; add variety only if a stakeholder asks for it.
- **GitHub Action that auto-posts the contract-change Slack ping** — could automate CONTRACT.md §"Announcement convention" via a workflow on PRs touching the boundary files. Manual ping is fine for now.

</deferred>

---

*Phase: 03-shared-boundary*
*Context gathered: 2026-04-26*
