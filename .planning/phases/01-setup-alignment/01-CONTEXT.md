# Phase 1: Setup & Alignment - Context

**Gathered:** 2026-04-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Kit and Evan reach a written, version-controlled agreement on the cross-GSD technical contract — stack versions, scaffolding ownership, shared-boundary governance, and a closure mechanism — before any code is written. Output is documents committed to the repo; no code changes. Evan does **not** use GSD; all artifacts are tool-agnostic and live at repo root so the contract works regardless of either dev's toolchain.

</domain>

<decisions>
## Implementation Decisions

### Stack contract (to formalize with Evan)
- **D-01:** Next.js **16.2 LTS** — current stable as of Apr 2026; 14 EOL Apr 30; 15 supported but 16 is the Vercel-recommended LTS with Turbopack stable, React Compiler stable, and AI-agent-friendly tooling that fits the Claude Code build flow.
- **D-02:** Node **24 LTS** — Active LTS through Apr 2028; Node 20 EOL Apr 30; Node 22 in maintenance. Pin via `.nvmrc` and `engines.node` in `package.json` so Kit and Evan run identical versions.
- **D-03:** Tailwind **v4** — CSS-first config (`@theme`) aligns with the design-tokens-as-CSS-variables approach in CLAUDE.md and `docs/ORIGIN_DESIGN.md`.
- **D-04:** Supabase **hosted dev project** — lets Vercel previews flip `NEXT_PUBLIC_USE_MOCK=false` against a real backend; Kit avoids local Docker.
- **D-05:** TypeScript **`strict: true` + `noUncheckedIndexedAccess: true`** — catches `T | undefined` on indexed access, critical for `data/seed.ts` lookups; intentionally not adopting `exactOptionalPropertyTypes` (too much boilerplate for a prototype).
- **D-06:** Package manager = **npm** — standard, zero-setup, fewest surprises on clone.
- **D-07:** Linter/formatter = **ESLint flat config + Prettier** — industry-standard plugin coverage (a11y, React hooks).
- **D-08:** Branch protection on `main` — **PR required + status checks**. CI typecheck + lint + Vercel preview must pass. No required reviewers (small team — trust + daily-merge cadence over enforced review).

### Scaffolding ownership & layout
- **D-09:** **Kit alone** runs `create-next-app` and pushes the initial scaffold; Evan reviews. Preserves day-1 Vercel URL target.
- **D-10:** Initial directory layout = **root-level `app/`**, `components/`, `lib/`, `types/`, `data/`. Matches REQUIREMENTS.md paths verbatim (BOUND-01..04, SCAFF-06). No `src/` wrapper.
- **D-11:** **`types/origin.ts` at repo root** — single source of truth, max visibility, matches BOUND-01 path exactly.
- **D-12:** Initial scaffold ships as one PR on branch `kit/scaffold` — reviewed and merged by Evan.

### Cross-GSD sync mechanism
- **D-13:** `types/origin.ts` is **co-owned with cross-review required** — encoded in `.github/CODEOWNERS` so GitHub auto-requests the other person on every touching PR. Toolchain-independent enforcement.
- **D-14:** Contract changes are announced via **Slack ping + PR link** in a shared channel. Lightweight, async, no polling.
- **D-15:** Conflict resolution = **first-PR-wins**; the second person rebases on main, resolves, gets re-review. Standard git flow, no special tooling.
- **D-16:** `lib/api.ts` is **split into `lib/api.mock.ts` (Kit) + `lib/api.real.ts` (Evan)**; `lib/api.ts` is the typed export-with-switch on `NEXT_PUBLIC_USE_MOCK`. Each side owns its file at `CODEOWNERS` level; the top-level switch file is co-owned. *Note for Phase 3 planner: this still satisfies BOUND-02 because `lib/api.ts` remains the typed client export — it just delegates internally.*

### Phase closure & sign-off
- **D-17:** Closure ships as a **single PR** on branch `kit/phase-1-alignment` containing all four artifacts: updated `CLAUDE.md`, new `DECISIONS.md`, new `CONTRACT.md`, new `.github/CODEOWNERS`. Evan reviews and merges.
- **D-18:** Evidence of agreement = **PR approval + per-row `— agreed: kit + evan, YYYY-MM-DD` signature in `DECISIONS.md`**. PR approval is the global sign-off; per-row signatures provide an audit trail in case scope-of-approval is ever disputed.
- **D-19:** Fallback if Evan can't review in target window = **soft-block**. Kit may begin Phase 2 work on `kit/scaffold` using these locks but **cannot merge to main** until the Phase 1 PR closes. Preserves the day-1 deploy schedule without front-running Evan's sign-off.
- **D-20:** Doc roles: **`DECISIONS.md` is canonical** (append-only, dated, signed). **`CLAUDE.md`** has a "Stack contract" + "Scaffolding ownership" section that summarizes the active locks for session-start reading. On conflict, DECISIONS.md wins.
- **D-21:** **Evan does NOT use GSD.** All Phase 1 artifacts are tool-agnostic and live at repo root. Nothing in `.planning/` is canonical for the cross-GSD contract; Evan never touches `.planning/`.

### Artifact specs (the four files Phase 1 produces)
- **D-22:** **`DECISIONS.md`** at repo root — append-only running log. Format: `YYYY-MM-DD · area · decision — agreed: kit + evan`. Initial seed = all decisions in this CONTEXT.md (D-01..D-21).
- **D-23:** **`CONTRACT.md`** at repo root — boundary governance: rules for `types/origin.ts` and the `lib/api.ts` split, including co-ownership + cross-review, "first-PR-wins; second rebases", and Slack-ping-on-contract-PR convention.
- **D-24:** **`.github/CODEOWNERS`** — auto-requires reviewer on `types/origin.ts` (both), `lib/api.ts` (both), `lib/api.mock.ts` (Kit-only writes; Evan reviews), `lib/api.real.ts` (Evan-only writes; Kit reviews).
- **D-25:** **`CLAUDE.md`** mutation — add "Stack contract" section (summarizes D-01..D-08) and "Scaffolding ownership" section (summarizes D-09..D-12) under existing structure. Existing content unchanged.

### Claude's Discretion
- Exact prose phrasing of the new CLAUDE.md sections.
- Exact CONTRACT.md section ordering and headings.
- CODEOWNERS pattern syntax (`@username` resolution depends on actual GitHub handles for Kit and Evan — placeholder until confirmed at execution).
- Whether to seed DECISIONS.md as one line per decision or grouped under area headings (line-per-decision is closer to "append-only log"; grouped is more readable — executor can pick).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project planning
- `.planning/PROJECT.md` — vision, key decisions table, locked design system, working principles
- `.planning/REQUIREMENTS.md` — `SETUP-01`, `SETUP-02`, `SETUP-03` are the three requirements this phase covers
- `.planning/ROADMAP.md` §"Phase 1: Setup & Alignment" — goal and four success criteria
- `.planning/STATE.md` — notes the existing "Phase 1 readiness" blocker (Evan's availability for sign-off)

### Product context
- `CLAUDE.md` — repo-root brief read at every Claude session start. **This phase mutates this file** (adds Stack contract + Scaffolding ownership sections).
- `docs/ORIGIN_PRODUCT_BRIEF.html` — executive brief for the prototype
- `docs/ORIGIN_DESIGN.md` — design system master, design tokens, component patterns
- `docs/ORIGIN_JOURNEY_DOC.html` — UX walkthrough across the six stages
- `docs/ORIGIN_BUILD_PROMPT.md` — original prompt used to seed the design prototype

### Files this phase creates (do not pre-write — produced during execution)
- `DECISIONS.md` (new, repo root)
- `CONTRACT.md` (new, repo root)
- `.github/CODEOWNERS` (new)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `CLAUDE.md` already exists with stack listed at family-level (Next.js 14+ / TypeScript / Tailwind / Supabase / Vercel). Phase 1 adds explicit version-pinned "Stack contract" section under existing structure — does not rewrite from scratch.
- `/docs/` is fully populated with all four reference docs. **SETUP-03 is essentially already satisfied** — verification step only, no doc-writing work.

### Established Patterns
- Branch naming `kit/<area>` and `evan/<area>` per CLAUDE.md — Phase 1 closure PR follows this (`kit/phase-1-alignment`).
- "Small PRs, merge daily" — Phase 1 closure PR fits this cadence as a single-day landing.
- Frontend builds against mocks; real backend swaps in later via `NEXT_PUBLIC_USE_MOCK` — Phase 1's split-`lib/api.ts` decision concretizes the seam.

### Integration Points
- `CLAUDE.md` is read at every Claude session start — adding the new sections means every future session automatically sees the locks without anyone having to surface them.
- `.github/CODEOWNERS` is GitHub-native enforcement — works regardless of which AI tooling either dev uses (Kit on Claude Code + GSD, Evan on plain terminal).
- `types/origin.ts`, `lib/api.ts`, `lib/api.mock.ts`, `lib/api.real.ts` don't exist yet — they're created in Phase 3 (BOUND-01..04). Phase 1's CONTRACT.md and CODEOWNERS pre-establish governance so the moment those files appear, rules apply automatically.

</code_context>

<specifics>
## Specific Ideas

- **Evan does NOT use GSD.** He works directly in terminal with his own approach. All Phase 1 artifacts must be tool-agnostic and at repo root. Sign-off is GitHub PR approval, not any GSD-side ritual. Evan never touches `.planning/`.
- The shared contract was already pre-aligned with Evan in conversation. Phase 1 formalizes it in repo files; it is not negotiating from scratch — execution should treat the decisions above as proposals Evan has informally agreed to, with PR approval as the formal lock.
- Per-row `— agreed: kit + evan, YYYY-MM-DD` signatures in DECISIONS.md are belt-and-suspenders evidence in case scope-of-PR-approval is ever disputed later in the project.
- The split `lib/api.mock.ts` / `lib/api.real.ts` pattern means Phase 3 doesn't have a "shared file with two branches" headache — clean ownership at file-level, with `lib/api.ts` itself as a thin co-owned switch.
- The four reference docs in `/docs/` are intentionally not modified by this phase — they're inputs that already exist.

</specifics>

<deferred>
## Deferred Ideas

- Testing framework choice (Vitest vs Jest vs Playwright) — Phase 2 or Phase 3 concern; not part of stack contract
- CI provider workflows (`.github/workflows/*.yml`) — Phase 2 ships scaffolding + CI together
- Secrets handling pattern (Vercel env vars vs `.env.local` conventions) — Phase 2 / Phase 3 concern
- Path aliases beyond Next.js defaults (`@/` etc.) — Phase 2 scaffolding decision
- Tailwind v4 plugin set (typography, forms, etc.) — Phase 2 scaffolding decision
- `data/seed.ts` divergence governance (when Kit's mocks and Evan's real data drift after Phase 3) — Phase 3 discuss
- Contract version-bump triggers (when does a `types/origin.ts` change warrant a major-bump tag?) — surface during Phase 3 if friction emerges
- GitHub usernames for `@kit` / `@evan` in CODEOWNERS — confirm at execution time

</deferred>

---

*Phase: 01-setup-alignment*
*Context gathered: 2026-04-25*
