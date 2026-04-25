# Phase 1: Setup & Alignment - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in `01-CONTEXT.md` — this log preserves the alternatives considered.

**Date:** 2026-04-25
**Phase:** 01-setup-alignment
**Areas discussed:** Stack contract specifics, Scaffolding ownership & layout, Cross-GSD sync mechanism, Phase closure & sign-off

---

## Stack contract specifics

### Q1: Next.js version

| Option | Description | Selected |
|--------|-------------|----------|
| 15.x latest (originally Recommended) | React 19, Turbopack stable, async dynamic APIs | |
| 14.2.x stable | Battle-tested App Router, more tutorials/SO answers | |
| Whatever Evan prefers | Defer | |

**User's choice (Other):** **Next.js 16.2 LTS** — current stable as of April 2026; 14 EOL; 15 supported but 16 is Vercel-recommended LTS with Turbopack stable, React Compiler stable, and AI-agent-friendly tooling for the Claude Code build flow.

### Q2: Node version

| Option | Description | Selected |
|--------|-------------|----------|
| Node 22 LTS (originally Recommended) | Active LTS through 2027 | |
| Node 20 LTS | Maximum library compatibility | |
| Whatever Evan prefers | Defer | |

**User's choice (Other):** **Node 24 LTS** — Active LTS as of Apr 2026, supported through Apr 2028; Node 20 EOL Apr 30; Node 22 already in maintenance. Next.js 16 + Vercel target Node 24, AWS SDK aligns. Pin via `.nvmrc` + `engines.node`.

### Q3: Tailwind version

| Option | Description | Selected |
|--------|-------------|----------|
| Tailwind v4 (Recommended) | CSS-first config matches design-tokens-as-CSS-vars approach | ✓ |
| Tailwind v3 | Mature, all third-party UI components target this | |
| Defer to Evan | No strong preference | |

### Q4: Supabase dev-mode

| Option | Description | Selected |
|--------|-------------|----------|
| Hosted dev project (Recommended) | Vercel previews can flip `NEXT_PUBLIC_USE_MOCK=false` against real backend | ✓ |
| Local Docker | Evan-only; Kit on mocks | |
| Both | Local for Evan, hosted for previews | |

### Q5: TypeScript strict baseline

| Option | Description | Selected |
|--------|-------------|----------|
| strict + noUncheckedIndexedAccess (Recommended) | Catches `T \| undefined` on indexed access; critical for seed lookups | ✓ |
| strict only | Minimal interpretation of "TypeScript strict" | |
| Maximum strictness | strict + noUncheckedIndexedAccess + exactOptionalPropertyTypes + more | |
| Defer to Evan | No strong preference | |

### Q6: Package manager

| Option | Description | Selected |
|--------|-------------|----------|
| pnpm (Recommended) | Faster, disk-efficient, strict by default | |
| npm | Default, zero-setup, fewest surprises | ✓ |
| bun | Fastest but rough edges | |
| Defer to Evan | No strong preference | |

### Q7: Linter/formatter

| Option | Description | Selected |
|--------|-------------|----------|
| Biome (Recommended) | Single tool for lint + format, ~50x faster | |
| ESLint flat config + Prettier | Industry standard, more plugins | ✓ |
| Next.js default ESLint only | Minimal config | |
| Defer to Evan | No strong preference | |

### Q8: Branch protection on `main`

| Option | Description | Selected |
|--------|-------------|----------|
| PR required + status checks (Recommended) | No direct push, CI typecheck + lint + Vercel preview required | ✓ |
| PR + 1 review required | Adds reviewer requirement | |
| Light: PR required only | No enforced status checks | |
| None — trust the team | Direct push allowed | |

---

## Scaffolding ownership & layout

### Q1: Who runs `create-next-app`

| Option | Description | Selected |
|--------|-------------|----------|
| Kit, alone (Recommended) | Kit owns frontend; commits scaffold + tokens + fonts as one PR | ✓ |
| Evan, alone | Evan scaffolds so backend integration points land first | |
| Pair session | Kit + Evan scaffold together | |
| Kit scaffolds, Evan adds Supabase boilerplate in same PR | Combined initial PR | |

### Q2: Initial directory layout

| Option | Description | Selected |
|--------|-------------|----------|
| Root-level `app/` (Recommended) | `app/`, `components/`, `lib/`, `types/`, `data/` at repo root | ✓ |
| `src/app/` with everything under `src/` | Cleaner separation but REQUIREMENTS.md paths would shift | |
| Defer to Evan | No strong preference | |

### Q3: Where `types/origin.ts` lives

| Option | Description | Selected |
|--------|-------------|----------|
| `types/origin.ts` at repo root (Recommended) | Matches REQUIREMENTS.md (BOUND-01) and PROJECT.md exactly | ✓ |
| `src/types/origin.ts` | Lives under `src/`, requires path alias | |
| Separate package `packages/types/` | Workspace package isolation | |

### Q4: Initial commit/PR pattern

| Option | Description | Selected |
|--------|-------------|----------|
| One PR by Kit, Evan reviews & merges (Recommended) | `kit/scaffold` branch, single review surface | ✓ |
| Direct push to main (one-time exception) | Skip first-PR ritual | |
| Kit + Evan co-authored commit | Pair-author for partnership signal | |
| Two stacked PRs: scaffold + boundary | Atomic per concern | |

---

## Cross-GSD sync mechanism

### Q1: Ownership model for `types/origin.ts`

| Option | Description | Selected |
|--------|-------------|----------|
| Co-owned, cross-review required (Recommended) | CODEOWNERS auto-requires the other person | ✓ |
| Evan owns; Kit proposes | Single source of truth on backend side | |
| Kit owns; Evan proposes | Frontend-consumer-led ownership | |
| Anyone edits, just announce | Slack ping only, no PR gate | |

### Q2: How contract changes get communicated

| Option | Description | Selected |
|--------|-------------|----------|
| Slack ping + PR link (Recommended) | Lightweight, async, no polling | ✓ |
| Daily standup only | Up to 24h delay before other person sees changes | |
| Dedicated CHANGELOG | `CONTRACT-CHANGELOG.md` updated per change | |
| Just trust GitHub notifications | CODEOWNERS auto-request IS the comms | |

### Q3: Conflict handling when both edit `types/origin.ts`

| Option | Description | Selected |
|--------|-------------|----------|
| First-PR-wins; second rebases (Recommended) | Standard git flow | ✓ |
| Pair-coordinate live | 5-min call, edit together | |
| Lock file via Slack | Explicit "editing now" handoff | |
| Cross our fingers | Don't pre-engineer, handle on-occurrence | |

### Q4: How `lib/api.ts` is coordinated

| Option | Description | Selected |
|--------|-------------|----------|
| Kit owns surface; Evan owns real impl (Recommended) | Kit defines signatures + mocks, Evan implements real branch | |
| Single shared file, co-owned | Both edit freely with cross-review | |
| Split into two files | `lib/api.mock.ts` (Kit) + `lib/api.real.ts` (Evan), `lib/api.ts` is the switch | ✓ |
| Defer — figure out in Phase 3 | Phase 3 (BOUND-02) discussion | |

**User's choice:** Split into two files — clean file-level ownership, satisfies BOUND-02 because `lib/api.ts` remains the typed export that delegates internally.

---

## Phase closure & sign-off

### Mid-area context update from Kit

> Heads up: Evan is NOT using GSD. He works directly in terminal with his own approach. We've already aligned on a tool-agnostic shared contract.
>
> Agreed shared artifacts (tool-agnostic, both maintained at repo root):
> 1. **DECISIONS.md** — running log of locked decisions. Both append. One line per decision: date · area · decision · who agreed.
> 2. **CONTRACT.md** — rules governing the shared boundary. Includes "first-PR-wins; second rebases" and Slack-ping-on-contract-PR convention.
> 3. **`.github/CODEOWNERS`** — auto-requires reviewer regardless of toolchain.
> 4. **CLAUDE.md** updated with "Stack contract" and "Scaffolding ownership" sections.
>
> Phase closure framing: PR approval on GitHub is the canonical sign-off; Kit commits Phase 1 outputs as a single PR; Evan approves and merges = phase closed. Evan never touches `.planning/`.

### Q1: Phase 1 PR scope

| Option | Description | Selected |
|--------|-------------|----------|
| Single PR, all 4 artifacts (Recommended) | Branch `kit/phase-1-alignment`: CLAUDE.md + DECISIONS.md + CONTRACT.md + CODEOWNERS | ✓ |
| Two PRs: docs first, governance second | Substance before enforcement | |
| Three PRs: stack → ownership → governance | Atomic per concern, 3 review cycles | |
| Single PR, draft-mode iteration | Draft until consensus, then ready | |

### Q2: Evidence of agreement

| Option | Description | Selected |
|--------|-------------|----------|
| PR approval = global sign-off (Recommended) | GitHub approval covers everything in PR | |
| PR approval + DECISIONS.md per-row `agreed: kit + evan` signatures | Belt-and-suspenders audit trail | ✓ |
| Slack screenshot in PR description | Pasted ambient evidence + approval | |
| Defer to Evan's preference | Ask him | |

### Q3: Fallback if Evan slips

| Option | Description | Selected |
|--------|-------------|----------|
| Soft-block: start Phase 2 work, hold merges (Recommended) | Branch work continues, no merges to main | ✓ |
| Hard-block: no Phase 2 until Phase 1 closes | Strict gate, risks day-1 schedule | |
| Tentative-merge: Kit self-merges, retros if Evan dissents | Implicit-not-explicit contract | |
| Async pair-review | Recorded screen-share walkthrough | |

### Q4: Roles of CLAUDE.md vs DECISIONS.md

| Option | Description | Selected |
|--------|-------------|----------|
| DECISIONS.md = log; CLAUDE.md = summary (Recommended) | Append-only auditable record + session-start summary | ✓ |
| CLAUDE.md only — DECISIONS.md is for process | Stack values only in CLAUDE.md | |
| DECISIONS.md only — CLAUDE.md links to it | Single source of truth | |
| Same content in both (mirror) | Full duplication, drift risk | |

---

## Claude's Discretion

- Exact prose phrasing of new CLAUDE.md sections
- Exact CONTRACT.md section structure and headings
- CODEOWNERS pattern syntax (placeholder `@kit` / `@evan` until actual GitHub usernames confirmed)
- Whether DECISIONS.md initial seed is line-per-decision or grouped-by-area

## Deferred Ideas

- Testing framework choice (Vitest vs Jest vs Playwright)
- CI provider workflows
- Secrets handling pattern
- Path aliases beyond Next.js defaults
- Tailwind v4 plugin set
- `data/seed.ts` divergence governance
- Contract version-bump triggers
- GitHub usernames for CODEOWNERS
