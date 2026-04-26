---
phase: 03-shared-boundary
plan: 02
subsystem: data
tags: [seed, fixtures, vitest, invariants, bound-03, mock-data]

requires:
  - phase: 02-scaffolding
    provides: Next.js + TypeScript strict scaffold; @/* path alias; tsconfig.json with noUncheckedIndexedAccess; warm-paper Tailwind v4 baseline
provides:
  - Frozen mock dataset (data/seed.ts) typed against @/types/origin
  - 8 organizations: Kaisei + 6 background portfolio + Maritime Robotics (Act 3)
  - Kaisei 6-entity tree per ORIGIN_DESIGN.md §11.1 + 6 lightweight roots
  - 13 named UBO records (Kaisei 7 incl. 4 Tanaka Family Trust beneficiaries; ~88% named, ~12% public float)
  - 22 documents per BOUND-03 (verified/extracted/extracting/uploaded/rejected mix)
  - Kaisei $50M revolver CreditMemo with all 5 sections drafted
  - 18 Activity events spanning all 6 stages; mixed actor types (client/rm/ai/system)
  - 3 IntakeToken fixtures (fresh/expired/consumed) for Plan 04 IntakeTokenError tests
  - demoNewClientTemplate (Maritime Robotics Pte Ltd) for Act 3 live submission
  - ISO_3166_ALPHA2 vendored alpha-2 country-code constant (no dep)
  - Per-application stageCompletionTimes map for D-64 post-processing in Plan 04
  - 10-test Vitest invariant suite (data/seed.test.ts) enforcing structural correctness
affects: [03-03 lib/api.mock.ts, 03-04 wave-2 mock implementation, 04-onwards UI consumption]

tech-stack:
  added: []
  patterns:
    - "Pattern G: Frozen seed exports (Object.freeze + ReadonlyArray<T>) — seed.ts side"
    - "Pattern I: Co-located Vitest tests, environment: 'node', globals: false, explicit imports"
    - "Pattern J: noUncheckedIndexedAccess discipline (no `!`; narrow with `if (!x)` or `?.`)"

key-files:
  created:
    - data/seed.ts
    - data/seed.test.ts
  modified: []

key-decisions:
  - "Tanaka Family Trust modeled as 4 separate UBO records (Aiko, Daichi, Mika, Sho) per ORIGIN_DESIGN.md §11.2 'four natural persons'"
  - "Kaisei named UBO sum ≈ 88% — ~12% public float intentionally NOT a named UBO record (D-60 invariant tests handle this case via toBeLessThanOrEqual(100))"
  - "Morita Holdings nested under entity-kaisei-tech (per §11.1 narrative — Morita owns 20% of Kaisei Technology KK), jurisdiction VG (BVI), isShell: true, source: document"
  - "ISO_3166_ALPHA2 vendored as a 23-entry constant rather than pulling a dependency (CONTEXT.md canonical_refs)"
  - "8th organization (Maritime Robotics) seeded with NO Application; Plan 04's createApplication consumes it at runtime per CONTEXT addendum D-50"
  - "demoNewClientTemplate ships as a single canned shape (Singapore parent + MY sub + 2 UBOs); per CONTEXT.md Claude's Discretion bullet 9, multi-shape variety deferred"

patterns-established:
  - "Pattern G (seed side): Frozen exports via Object.freeze on every named array; ReadonlyArray<T> annotations type-check against @/types/origin"
  - "Pattern I: Vitest co-location (data/seed.test.ts next to data/seed.ts) with explicit imports of describe/it/expect"
  - "Pattern J: Lookups inside seed.ts (HAYASHI_ORG, KAISEI_ORG, FUJIWARA_ORG for IntakeToken.organization) use explicit `if (!x) throw` narrowing — no non-null assertions anywhere"

requirements-completed:
  - BOUND-01
  - BOUND-03

duration: ~10 min
completed: 2026-04-26
---

# Phase 03 Plan 02: Mock Dataset Authoring Summary

**Frozen 1646-line typed mock dataset (Kaisei + 6 portfolio + Act 3 org + 22 docs + activity feed) with co-located Vitest invariant suite enforcing BOUND-03 acceptance.**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-04-26T08:42Z (worktree spawn)
- **Completed:** 2026-04-26T08:52Z
- **Tasks:** 2 (both `type="auto"`, both committed)
- **Files created:** 2 (data/seed.ts, data/seed.test.ts)

## Accomplishments

- **BOUND-03 acceptance hit verbatim:** 22 documents exactly; Kaisei 6-entity tree (parent + SG/HK/UK/Tech subs + Morita Holdings BVI shell); 6 background portfolio names matching ORIGIN_DESIGN.md §11.3; 8th Act 3 organization (Maritime Robotics) seeded with no Application.
- **Demo-grade prose populated** (D-45): Kaisei's $50M revolver CreditMemo has all 5 sections drafted with realistic financial commentary; ScreeningHits carry full aiNarrative + dispositionNote prose; verified/extracted documents have populated extractionResult payloads (CoI directors, financials with revenue/EBITDA/net income, shareholder register, trust-deed beneficiaries).
- **Test-fixture surface ready for Plan 04:** 3 IntakeToken records (fresh `tok-fresh-test-001`, expired `tok-expired-test-002`, consumed `tok-consumed-test-003`) cover all three IntakeTokenError reason branches per CONTEXT addendum D-54.
- **Invariant safety net** (D-60): 10 Vitest tests covering BOUND-03 acceptance, ISO-3166 country-code validity, entity-tree non-emptiness, Kaisei 6-entity shape, 6 background names, 8-org count, intake-token fixtures, Kaisei UBO count >= 5, stage-completion coverage. Tests run green against parent worktree's vitest install (4.1.5).
- **Type-safety compliance:** `npx tsc --noEmit` exits 0; zero structural type assertions (`as Application`-style) in source; one minimal `as const` on `source: 'registry'` literals inside `demoNewClientTemplate` to prevent string-widening through the `Omit<Entity, ...>` boundary (sanctioned escape hatch per plan's action step 5).

## Task Commits

Each task committed atomically on the worktree branch:

1. **Task 2.1: Author data/seed.ts** — `1d9e81d` (feat)
2. **Task 2.2: Author data/seed.test.ts** — `d653fdb` (test)

The orchestrator owns the final metadata commit (.planning STATE/ROADMAP updates after wave-1 reconciliation).

## Files Created/Modified

- `data/seed.ts` (1646 lines, NEW) — frozen typed mock dataset; 14 named exports (seedUsers, seedOrganizations, seedApplications, seedEntities, seedUBOs, seedDocuments, seedScreeningHits, seedCreditMemos, seedActivities, seedProducts, seedIntakeTokens, demoNewClientTemplate, stageCompletionTimes, ISO_3166_ALPHA2). 26 `Object.freeze` calls. Every shape imported from `@/types/origin`.
- `data/seed.test.ts` (120 lines, NEW) — 10-case Vitest invariant suite. Pattern I (co-located, globals: false, explicit imports). Pattern J (no non-null assertions; `if (!x) throw` and `?.` narrowing).

## Decisions Made

- **Tanaka Family Trust = 4 separate UBO records** (Aiko, Daichi, Mika, Sho) per ORIGIN_DESIGN.md §11.2 "four natural persons." Names invented per CONTEXT.md ## Claude's Discretion bullet 7 (Japanese naming conventions). Headline "5 UBOs" in ROADMAP success criterion #3 maps to 5 distinct ownership lineage groups; data has 7 named UBO records for Kaisei. Test asserts `>= 5` (does not lock to exactly 5).
- **Public-float case modeled by intent** — Kaisei named UBO sum ≈ 88%; remaining ~12% is public float not modeled as a UBO record. Inline comment in seedUBOs documents this. The D-60 invariant test uses `toBeLessThanOrEqual(100)` rather than naive sum-equals-100% — handles this case correctly.
- **ISO_3166_ALPHA2 vendored** as 23-entry constant inline (not as a dependency) per CONTEXT.md canonical_refs.
- **`as const` escape hatch used minimally** — only on the two `source: 'registry'` literals inside `demoNewClientTemplate.entities` where `Omit<Entity, 'id' | 'applicationId' | 'createdAt'>` would otherwise widen to `string`. Sanctioned by the plan's action step 5 ("`as const` is allowed; only structural `as <ConcreteType>` is forbidden").

## Deviations from Plan

None — plan executed as written.

## Issues Encountered

- **One TypeScript widening error** during initial typecheck: `demoNewClientTemplate.entities[].source` inferred as `string` rather than `EntitySource`, failing the `Omit<Entity, ...>` shape. Resolved with the plan's sanctioned `as const` pattern on the two literal values. Not a deviation — the plan's action step 5 explicitly allows `as const` for this exact widening scenario.
- **vitest not installed in worktree** — vitest install/config is owned by Plan 03-01 (running in parallel worktree). Tests verified by invoking parent repo's installed binary (`/Users/wyekitgoh/Projects/SMBCorigins/node_modules/.bin/vitest run data/seed.test.ts`) against a temporarily-copied vitest.config.ts (deleted after verification, not committed). All 10 tests pass. Post-merge in the orchestrator step, `npm run test` from the merged branch will re-verify in standard CI.

## Threat Surface Notes

The plan's `<threat_model>` mitigation T-03-02-03 (frozen exports prevent runtime mutation) is satisfied: every named array export wraps `Object.freeze`. The downstream `structuredClone` in Plan 03-03/04's `lib/api.mock.ts` will detach the runtime store from these frozen seed templates.

No threat-flag-worthy new surface introduced — this plan ships only typed in-memory data fixtures with no network endpoints, auth paths, file access patterns, or schema changes.

## User Setup Required

None.

## Next Phase / Wave Readiness

- **For Plan 03-03** (`lib/api.mock.ts` implementation, also wave-1 parallel): All 14 named exports from `@/data/seed` are stable and typed. The store hydration pattern in `lib/api.mock.ts` will spread these arrays into a `structuredClone`'d mutable store (Pattern G runtime side).
- **For Plan 03-04** (wave-2 tests for the mock): The 3 intake-token fixtures (`tok-fresh-test-001`, `tok-expired-test-002`, `tok-consumed-test-003`) align verbatim with the IntakeTokenError reason mapping in CONTEXT addendum D-54.
- **For orchestrator's wave-1 reconciliation:** No conflicts expected with Plan 03-01 (vitest config / package.json / CI) or Plan 03-03 (`lib/api.mock.ts`) — file scopes are disjoint.

## Self-Check: PASSED

Verified after summary write:

- `data/seed.ts` exists at `/Users/wyekitgoh/Projects/SMBCorigins/.claude/worktrees/agent-aeb491e791dfb30a2/data/seed.ts` — FOUND
- `data/seed.test.ts` exists at same worktree — FOUND
- Commit `1d9e81d` (Task 2.1) — FOUND in `git log`
- Commit `d653fdb` (Task 2.2) — FOUND in `git log`
- `npx tsc --noEmit` exits 0 — VERIFIED
- Vitest invariant suite (10/10) passes against parent vitest install — VERIFIED

---

*Phase: 03-shared-boundary*
*Plan: 02*
*Completed: 2026-04-26*
