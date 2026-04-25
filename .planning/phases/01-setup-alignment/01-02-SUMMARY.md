---
phase: 01-setup-alignment
plan: 02
subsystem: governance
tags:
  - governance
  - boundary-contract
  - phase-1
  - cross-gsd
requirements:
  - SETUP-01
dependency-graph:
  requires: []
  provides:
    - "CONTRACT.md (cross-GSD boundary governance, repo root)"
  affects:
    - ".github/CODEOWNERS (Plan 01-03 will enforce CONTRACT.md ownership rules in GitHub)"
    - "Phase 3 boundary files (types/origin.ts, lib/api.ts, lib/api.mock.ts, lib/api.real.ts)"
tech-stack:
  added: []
  patterns:
    - "Repo-root governance docs (vs .planning/) so cross-GSD partner without GSD tooling can read them — D-21"
key-files:
  created:
    - "CONTRACT.md"
  modified: []
decisions:
  - "Co-ownership matrix: types/origin.ts and lib/api.ts are co-owned (Kit + Evan); lib/api.mock.ts is Kit-owned; lib/api.real.ts is Evan-owned (per D-16)"
  - "First-PR-wins is the conflict resolution protocol — second PR rebases on main and re-requests review (per D-15)"
  - "Slack-ping on every PR touching co-owned files; CODEOWNERS auto-request is the GitHub enforcement layer (per D-14)"
  - "DECISIONS.md is canonical; CONTRACT.md is the human-readable expansion. On disagreement, DECISIONS.md wins (per D-20)"
metrics:
  duration: "~3 minutes"
  completed: "2026-04-25"
  tasks_completed: 1
  files_created: 1
  files_modified: 0
  commits: 1
---

# Phase 01 Plan 02: CONTRACT.md (Cross-GSD Boundary Governance) Summary

Authored `CONTRACT.md` at the repo root — a human-readable governance document encoding co-ownership, first-PR-wins conflict resolution, and Slack-ping convention for the four cross-GSD boundary files that Phase 3 will create.

## What was built

A single new file at repo root: `CONTRACT.md` (61 lines, 7 H2 sections). It pre-establishes governance for the boundary files (`types/origin.ts`, `lib/api.ts`, `lib/api.mock.ts`, `lib/api.real.ts`) before they exist in code, so the moment Phase 3 creates them the rules already apply.

### Sections

1. Boundary files (ownership table for the four shared files)
2. Co-ownership rules (cross-review required, type changes are breaking by default)
3. Conflict resolution: first-PR-wins (standard git rebase flow, no special tooling)
4. Announcement convention: Slack-ping on contract PRs (CODEOWNERS + Slack as the full notification path)
5. Branch protection (D-08 reference)
6. Soft-block on Phase 2 merge (D-19 reference)
7. Updating this contract (dual-write flow with DECISIONS.md)

## Tasks completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create CONTRACT.md at repo root with boundary governance prose | ad87bb9 | CONTRACT.md |

## Verification results

| Check | Result |
|-------|--------|
| `test -f CONTRACT.md` | PASS |
| H2 sections >= 6 | PASS (7 sections) |
| All four boundary files referenced | PASS |
| First-PR-wins documented | PASS |
| Slack-ping convention documented | PASS |
| CODEOWNERS reference | PASS |
| Canonical-source disclaimer (DECISIONS.md wins) | PASS (present at lines 5 and 61, with markdown backtick formatting around `DECISIONS.md`) |
| Owner attribution table (Kit / Evan) | PASS |
| File NOT in `.planning/` (D-21) | PASS |
| min_lines >= 40 | PASS (61 lines) |
| Contains "first-PR-wins" | PASS |

## Decisions made

- Followed the verbatim file content specified in the plan's `<action>` block exactly — no prose modifications.
- Used the Write tool (per plan instruction) rather than heredoc.
- Used U+2014 em-dash characters as specified.

## Deviations from Plan

None — plan executed exactly as written.

### Note on acceptance grep pattern

The plan's acceptance criterion `grep -q "DECISIONS.md wins"` is technically not a literal substring match against the verbatim content the plan also mandated, because the verbatim content wraps `DECISIONS.md` in markdown backticks (`` `DECISIONS.md` wins``). The plan instructed "copy verbatim" — which we did — so the file matches the content spec. The semantic intent of the acceptance check (canonical-source disclaimer present) is satisfied: the disclaimer appears twice in the file (lines 5 and 61). This is documented here rather than as a deviation because no deviation occurred — both the file content and the verification intent align.

## Threat model status

All Plan-level threats from the threat register are mitigated by the file content as written:

- **T-02-01** (Tampering) → "Updating this contract" section enforces dual-write with DECISIONS.md
- **T-02-02** (Repudiation) → first-PR-wins recorded both in DECISIONS.md (D-15) and operationalized in CONTRACT.md
- **T-02-03** (Information Disclosure) → accepted; team norms are not sensitive
- **T-02-04** (Elevation of Privilege) → branch protection (D-08) is the gate; CODEOWNERS does not auto-route CONTRACT.md itself
- **T-02-05** (Spoofing/DoS) → n/a, static markdown

No new threat surface introduced.

## Known stubs

None. CONTRACT.md is complete prose governance — no placeholders, no TODOs, no empty sections.

## Next steps

- Plan 01-03 (CODEOWNERS) will create the GitHub-enforcement complement to CONTRACT.md, auto-routing review for the four boundary files to the partner.
- Phase 3 (Shared Boundary, BOUND-01..04) will create the four files CONTRACT.md governs. The contract is in force from the moment they appear.

## Self-Check: PASSED

- FOUND: CONTRACT.md (at repo root)
- FOUND: commit ad87bb9 in git log
- VERIFIED: not present at .planning/CONTRACT.md (D-21 enforced)
