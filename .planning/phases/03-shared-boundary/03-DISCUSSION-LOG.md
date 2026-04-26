# Phase 3: Shared Boundary - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-26
**Phase:** 03-shared-boundary
**Areas discussed:** Seed data depth & realism, Mock API behavior contract, lib/stages.ts authorship & sequencing, Type-shape drift handling

**Pre-framing from Kit (not discussed; treated as locked entering this discuss-phase):**
- Phase scope = BOUND-03 (seed.ts) + BOUND-04 (api.mock.ts) + lib/stages.ts. BOUND-01/02 are Evan's deliverables in PR #4 (Kit reviews).
- Branch off `main`, not Evan's PR #4 branch.
- Treat Evan's PR #4 + Kit's two architectural pushes (move STAGE_NAMES + deriveStages to lib/stages.ts; validate EntityAddress.country in mapper) as the contract baseline.
- Rebase if shape shifts during Evan's review-fix cycles.

---

## Seed data depth & realism

### Q1: How rich should Kaisei's hero application records be in seed.ts?

| Option | Description | Selected |
|--------|-------------|----------|
| Thick — demo-ready prose (Recommended) | Every Document has full extraction_result fields, every ScreeningHit has ai_narrative + disposition_note, CreditMemo has all 5 sections with realistic prose. Phases 5–8 just render. Higher rework if Evan reshapes a sub-field. | ✓ |
| Medium — typed and plausible, light prose | All required fields populated with sensible values; AI-narrative-style fields are 1–2 sentence stubs. Phases 5–8 may need to enrich for hero moments. | |
| Thin — minimum to satisfy types | Just enough to make the type system happy. AI-narrative fields are placeholder strings. Phases 5–8 do most of the demo content authoring. | |

**User's choice:** Thick — demo-ready prose
**Notes:** Captured in CONTEXT.md as D-45.

---

### Q2: How detailed are the 6 background portfolio clients (RM Cockpit kanban texture)?

| Option | Description | Selected |
|--------|-------------|----------|
| Just enough for kanban + 'Needs You' (Recommended) | Each background client gets a full Application + lightweight Entity + 1 UBO + 1 stage-relevant Document. Enough to populate RMC-04/05/07. No full entity trees. Demo moments live on Kaisei. | ✓ |
| Mini-Kaisei each — small entity tree + 2–3 UBOs | Each background client has a 2-entity tree and 2 UBOs. Richer kanban detail-on-hover, but ~5× the seed authoring work. | |
| Bare — just Application + org name + stage | Background clients exist as Application records but no full Entity/UBO/Document depth. | |

**User's choice:** Just enough for kanban + 'Needs You'
**Notes:** Captured as D-46.

---

### Q3: What stage does the demo open on for Kaisei?

| Option | Description | Selected |
|--------|-------------|----------|
| Mid-journey — Stage 3 in progress (Recommended) | Stages 1–2 complete, Stage 3 (Documentation) active, Stages 4–6 pending. CJD-03 timeline tells a richer story. | (effectively ✓ via addendum) |
| Late — Stage 5 in progress | Front-loads Credit Memo Drafter hero. Sacrifices "progressive journey" feel. | |
| Early — Stage 2 in progress | Lands on UBO Intelligence hero. Most stages "pending" so timeline feels empty. | |

**User's choice (verbatim addendum):**

> Addendum to Phase 3 framing — demo flow constraint discovered.
>
> The demo this all serves is a three-act structure:
> 1. Cockpit cold open (Kaisei + 6 background clients = production snapshot)
> 2. Kaisei Stage 3 deep-dive (depth proof)
> 3. Live new-client submission, RM invite → client intake → Stage 1/2 transition (hero act)
>
> Act 3 means BOUND-04 is NOT read-only. The mock layer needs write paths and the kanban needs to reflect runtime mutations within a session.
>
> Specific additions to BOUND-04 scope:
> - createApplication(invite: { clientName, clientEmail, productType }) — creates Application record in Stage 1, returns intake token/link. New record appears in cockpit kanban.
> - submitIntake(token, formData) — accepts client-side intake submission, creates Entity + initial UBO records from form data, transitions Application from Stage 1 → Stage 2, triggers fake "entity discovery" enrichment (canned data, ~2s delay to feel real).
> - getIntakeByToken(token) — read path for the client-facing intake form.
> - In-memory mutable store backing all of this. Does NOT need to persist across reloads — demo runs in one session. Should support reactive reads so the kanban updates without hard refresh (subscription pattern or polling, your call).
>
> Specific additions to BOUND-03 (seed) scope:
> - The 7 existing clients (Kaisei + 6 background) are seeded historical state — they exist at app boot.
> - Add a demoNewClientTemplate export — canned enrichment data (entity details, suggested KYC docs, jurisdiction risk flags) that submitIntake uses to populate the Stage 2 transition. Not seeded as a record; consumed at runtime by the mock's submit handler.
>
> Things explicitly out of scope for the demo and therefore out of scope for the mock:
> - Real email sending (invite returns link directly, "copied to clipboard" UX)
> - Real entity enrichment (canned data only)
> - Stage 3+ progression for the runtime-created client (demo stops before then)
>
> Please re-plan Phase 3 with these additions folded in. Flag if anything in BOUND-02 (lib/api.ts interface from Evan) doesn't already accommodate createApplication / submitIntake / getIntakeByToken shapes — if his interface is read-only, that's a fifth review point I need to send him before he finalizes PR #4.

**Effective resolution:** Stage 3 mid-journey for Kaisei (D-47) + three-act demo flow locked in CONTEXT.md domain section + new mutation methods folded into BOUND-04 (D-51) + `demoNewClientTemplate` added to BOUND-03 (D-50) + action item A-01 raised (re-confirm Evan's `OriginAPI` accommodates mutations).

---

### Q4: How long is the activity feed (CJD-05 / activities table)?

| Option | Description | Selected |
|--------|-------------|----------|
| ~15–20 events spanning all 6 stages (Recommended) | Mix of client/rm/ai actor types. Realistic spread — clustered bursts and quiet spans. Phase 5 just renders. | ✓ |
| ~30+ events — dense, scrollable | Hyper-realistic. Most demo-impressive but most fragile to type changes. | |
| ~5–7 events — thin, recent only | Minimal feed. Phase 5 has to expand. | |

**User's choice:** ~15–20 events spanning all 6 stages
**Notes:** Captured as D-48.

---

## Mock API behavior contract

### Q1: What's the latency shape across mock methods?

| Option | Description | Selected |
|--------|-------------|----------|
| Per-call defaults + AI-moment overrides (Recommended) | Reads ~80–150ms, writes ~200–400ms, AI-flavored calls 1.5–2.5s. Defined per-method; no random jitter. | ✓ |
| Instant for all (sync-shaped Promises) | Promise.resolve everywhere. Loses "feels real" texture for AI moments. | |
| Single global delay (~200ms) everywhere | Uniform feel; AI moments don't feel different. | |

**User's choice:** Per-call defaults + AI-moment overrides
**Notes:** Captured as D-53.

---

### Q2: What's the reactive-reads mechanism backing kanban updates?

| Option | Description | Selected |
|--------|-------------|----------|
| Tiny event-emitter + React useSyncExternalStore (Recommended) | Mock store exposes subscribe(listener); components useSyncExternalStore. Zero deps, ~50 LOC. Plays nicely with future Supabase realtime swap. | ✓ |
| Polling on a 1–2s interval in components | useEffect-poll the mock. No subscribe surface needed; burns renders. | |
| React Query / SWR with manual invalidation | Adopt fetching library now. Adds dep. Real backend swap is cleaner. | |

**User's choice:** Tiny event-emitter + useSyncExternalStore
**Notes:** Captured as D-55.

---

### Q3: How does the mock seed its state at app boot?

| Option | Description | Selected |
|--------|-------------|----------|
| Deep-clone seed on first read, mutations stay in-memory (Recommended) | Module-scoped store hydrated lazily from data/seed.ts (structuredClone). Page refresh = fresh seed = clean demo run. | ✓ |
| Eager hydration at module load | Same end behavior; slightly worse cold-boot latency. | |
| Seed by reference | Cheapest but breaks idempotency under HMR. Avoid. | |

**User's choice:** Deep-clone seed on first read, mutations stay in-memory
**Notes:** Captured as D-52 + D-56.

---

### Q4: Error simulation — what does the mock surface?

| Option | Description | Selected |
|--------|-------------|----------|
| No errors in v1 (Recommended) | All mock methods always succeed. Debug query-param hook deferred. | |
| Light error surface for the intake flow only | submitIntake throws on invalid token (expired/unknown). Everything else happy-path. | ✓ |
| Realistic error rates (~5% on writes) | Random errors. Risk: torpedoes a live demo run. | |

**User's choice:** Light error surface for the intake flow only

**Follow-up specification (Kit, in addendum during "Done" check):**
- `IntakeTokenError` class extends Error, field `reason: 'expired' | 'unknown' | 'consumed'`.
- `getIntakeByToken` throws `IntakeTokenError` with appropriate reason on bad/stale/already-used token.
- `submitIntake` is **idempotent** — second call with same token throws `reason: 'consumed'`, does NOT create duplicate Application/Entity records.
- Intake form renders distinct copy per reason.
- All other mock methods remain happy-path. No error rates elsewhere.

**Captured as:** D-54 (with the full IntakeTokenError specification folded in).

---

## lib/stages.ts authorship & sequencing

### Q1: Who creates lib/stages.ts and when?

| Option | Description | Selected |
|--------|-------------|----------|
| Kit creates lib/stages.ts in this PR (Recommended) | Author lib/stages.ts on feature branch with moved STAGE_NAMES + deriveStages. Resolves architectural push immediately. | ✓ |
| Wait for Evan to fold the move into PR #4 | Cleanest cross-GSD etiquette but blocks Kit's seed/mock work. | |
| Shadow file lib/stages.local.ts now, rename on rebase | Both PRs purely additive but adds rename + import-rewrite. | |

**User's choice:** Kit creates lib/stages.ts in this PR
**Notes:** Captured as D-57.

---

### Q2: Should lib/stages.ts be added to CODEOWNERS?

| Option | Description | Selected |
|--------|-------------|----------|
| Co-owned with cross-review (Recommended) | Add `lib/stages.ts @kitgoh-cloud @evangohAIO` per CONTRACT.md §"Co-ownership rules". | ✓ |
| Kit-write / Evan-review (like lib/api.mock.ts) | Pragmatic; less symmetric. | |
| Leave out of CODEOWNERS for now, revisit if friction | Default repo-admin review. Lightest. | |

**User's choice:** Co-owned with cross-review

**Follow-up specification (Kit, in addendum during "Done" check):**
- Add `/lib/stages.ts @kitgoh-cloud @evangohAIO` to CODEOWNERS in the same PR that creates the file.
- Group with other co-owned contract surfaces (types/origin.ts, lib/api.ts), **not** alphabetically — the grouping signals "this is the contract surface."

**Captured as:** D-58.

---

### Q3: What lives in lib/stages.ts — just STAGE_NAMES + deriveStages, or more?

| Option | Description | Selected |
|--------|-------------|----------|
| Strictly STAGE_NAMES + deriveStages (Recommended) | Match Evan's original intent verbatim, just relocated. Future helpers live in their own files. | ✓ |
| Include broader stage helpers up-front | Add getStageProgress, getActiveStage, getCompletedStages. Risks scope creep. | |

**User's choice:** Strictly STAGE_NAMES + deriveStages
**Notes:** Captured as D-57.

---

### Q4: If Evan rejects the move, what's the fallback?

| Option | Description | Selected |
|--------|-------------|----------|
| Accept Evan's call — import from types/origin.ts (Recommended) | Defer per D-15 first-PR-wins. Delete lib/stages.ts on rebase; re-target imports. | ✓ |
| Re-litigate via Slack ping + PR comment | Push back harder. Risks longer review loop. | |

**User's choice:** Accept Evan's call — import from types/origin.ts
**Notes:** Captured as D-59.

---

## Type-shape drift handling

### Q1: Primary safety net for ensuring seed/mock matches Evan's types?

| Option | Description | Selected |
|--------|-------------|----------|
| Compile-time + targeted invariant tests (Recommended) | tsc --noEmit catches structural drift; ~3–6 invariant tests catch value-level drift (UBO%, ISO-3166, doc count, entity tree shape). | ✓ |
| Compile-time only | Trust strict TS. Misses runtime invariant violations. | |
| Compile-time + Zod schemas at fixture boundary | Schemas drift from types unless kept in lockstep. Heavy for prototype. | |

**User's choice:** Compile-time + targeted invariant tests
**Notes:** Captured as D-60.

---

### Q2: Test framework choice (deferred from Phase 1)?

| Option | Description | Selected |
|--------|-------------|----------|
| Vitest (Recommended) | Fast, ESM-native, zero-config with Next.js 16 + Tailwind v4 + TS. | ✓ |
| Node's built-in node:test | Zero-deps. Less ergonomic — no watch mode, less helpful diff output. | |
| Defer test framework to Phase 4+ | Invariant checks live as runtime asserts in seed.ts module-load. | |

**User's choice:** Vitest
**Notes:** Captured as D-61. Resolves Phase 1's deferred test-framework decision.

---

### Q3: Where do tests live?

| Option | Description | Selected |
|--------|-------------|----------|
| Co-located: data/seed.test.ts + lib/api.mock.test.ts (Recommended) | Standard Vitest convention. Discoverable. | ✓ |
| Top-level tests/ directory | Cleaner separation; adds indirection. | |

**User's choice:** Co-located
**Notes:** Captured as D-62.

---

### Q4: How does the test job hook into CI?

| Option | Description | Selected |
|--------|-------------|----------|
| Third top-level job in ci.yml (Recommended) | Add `test` as third parallel job per Pattern D in 02-PATTERNS.md. Becomes a fourth required status check. | ✓ |
| Add to typecheck job as a second step | Saves a runner; loses per-check status granularity. | |
| Run locally only, skip CI for now | Cheapest; loses safety net. | |

**User's choice:** Third top-level job in ci.yml
**Notes:** Captured as D-63.

---

## Claude's Discretion

Areas where Kit explicitly delegated to Claude during planning/implementation:
- Exact in-memory store implementation (single module-scoped object, Map-keyed by id, or class-instance — picker's choice; emitter shape stays the same).
- Intake token format (uuid v4, nanoid, deterministic-from-id).
- Per-method exact latency values within recommended ranges.
- Vitest config shape.
- Exact prose for Kaisei's CreditMemo sections, ScreeningHit narratives, document extractions.
- Exact ScreeningHit count and disposition mix.
- Tanaka Family Trust beneficiary names and holding %.
- Whether `demoNewClientTemplate` ships as one shape or 2–3 shapes (start with one).

## Deferred Ideas

Captured in CONTEXT.md `<deferred>` section. Highlights:
- Stage 3+ progression for runtime-created Act 3 client (out of scope; demo stops at Stage 2).
- LocalStorage persistence (out of scope).
- React Query / SWR (defer until real backend lands).
- Zod runtime schemas (defer in favor of compile-time + Vitest invariants).
- Realistic error rates (rejected; demo predictability wins).
- Debug `?simulateError=…` hook.
- Stage helpers beyond `STAGE_NAMES` + `deriveStages`.
- E2E / Playwright tests.
- Multiple `demoNewClientTemplate` shapes (start with one).
- GitHub Action that auto-posts the contract-change Slack ping.

## Action items raised during this discussion

- **A-01 (Kit, before plan-phase locks BOUND-04 surface):** Re-read PR #4's `lib/api.ts` and confirm `OriginAPI` includes `createApplication`, `submitIntake`, `getIntakeByToken` mutation methods. If not, send Evan a 5th review point before he finalizes PR #4 — `lib/api.mock.ts` can't satisfy a unified `OriginAPI` if mutations aren't typed there.
