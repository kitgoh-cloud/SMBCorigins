# CONTRACT — Cross-GSD Shared Boundary Governance

This document governs the typed boundary between Kit's frontend GSD and Evan's backend GSD. It describes ownership, change protocol, and conflict resolution for the four shared boundary files.

The active locks are recorded in `DECISIONS.md` (canonical, append-only). On conflict between this document and `DECISIONS.md`, `DECISIONS.md` wins. This file exists for human readability and onboarding — Evan does not use GSD or `.planning/` (D-21), so all governance is documented here at the repo root.

## Boundary files

The four files below form the cross-GSD shared boundary. They will be created in Phase 3 (Shared Boundary, requirements `BOUND-01..04`); this contract pre-establishes their governance so it is in force the moment those files first appear.

| File | Role | Owner | Reviewer |
|------|------|-------|----------|
| `types/origin.ts` | Single source of truth for shared types: `Application`, `Entity`, `UBO`, `Document`, `ScreeningHit`, `CreditMemo`, `Stage`, `User` | Co-owned (Kit + Evan) | The other person — auto-requested via `.github/CODEOWNERS` |
| `lib/api.ts` | Typed top-level API export. Switches between mock and real backends on `NEXT_PUBLIC_USE_MOCK`. Contains no business logic — only the switch and the type-level export surface. | Co-owned (Kit + Evan) | The other person — auto-requested via `.github/CODEOWNERS` |
| `lib/api.mock.ts` | Mock implementation reading from `data/seed.ts`. The default path when `NEXT_PUBLIC_USE_MOCK=true`. | Kit | Evan reviews on PR (auto-requested via `.github/CODEOWNERS`) |
| `lib/api.real.ts` | Real implementation reading from Evan's Supabase + API routes. The path when `NEXT_PUBLIC_USE_MOCK=false`. | Evan | Kit reviews on PR (auto-requested via `.github/CODEOWNERS`) |

Splitting `lib/api.ts` into `lib/api.mock.ts` + `lib/api.real.ts` (with `lib/api.ts` as the typed switch) gives clean file-level ownership for the implementation halves while keeping the public surface co-owned. This still satisfies `BOUND-02` because `lib/api.ts` remains the typed client export — it just delegates internally based on the env flag.

## Co-ownership rules

1. **Cross-review required on every touching PR.** GitHub auto-requests the other person as reviewer via `.github/CODEOWNERS`. Do not bypass.
2. **Never edit `types/origin.ts` without telling the other person.** This is a working principle from `CLAUDE.md` and is now contract-level.
3. **Type changes are breaking changes by default.** Treat any addition, removal, or rename in `types/origin.ts` as breaking. The author owns the migration on their side; the reviewer owns the migration on theirs.
4. **The two halves of `lib/api.*` must stay shape-compatible.** Both `lib/api.mock.ts` and `lib/api.real.ts` must export the same function signatures (typed against `types/origin.ts`). The top-level `lib/api.ts` switch is the compile-time gate.

## Conflict resolution: first-PR-wins

When two PRs touch the same boundary file (e.g. both add a field to `types/origin.ts`):

1. **First PR to merge wins.** Whoever merges first sets the new shape.
2. **The second PR rebases on `main`** and resolves the conflict locally — re-running typecheck to confirm the merged shape still works for their side.
3. **The second PR re-requests review** after rebase. The reviewer re-approves only after confirming the rebased diff still matches the original intent.
4. **No special tooling.** This is standard git flow; no merge queue, no priority claims, no out-of-band locking.

## Announcement convention: Slack-ping on contract PRs

Any PR that touches `types/origin.ts` or `lib/api.ts` (the co-owned files):

1. **Author pings the shared Slack channel** with the PR link the moment they open it.
2. **Body of the ping** must include: a one-line summary of the change, and a callout of any breaking type changes.
3. **The reviewer commits to a turnaround target** in the channel (or replies "blocked, will review at <time>").
4. **No polling.** GitHub's auto-request via CODEOWNERS plus the Slack ping is the full notification path. Don't wait silently for review.

## Branch protection

Per `D-08` (recorded in `DECISIONS.md`): `main` is PR-protected. Status checks (CI typecheck + lint + Vercel preview) must pass before merge. No required reviewers at the branch-protection level — required reviewers come from `.github/CODEOWNERS` for the four boundary files only.

## Soft-block on Phase 2 merge

Per `D-19`: if Evan cannot review the Phase 1 closure PR (`kit/phase-1-alignment`) in the target window, Kit may begin Phase 2 work on a separate branch (`kit/scaffold`) using these locks but cannot merge to `main` until Phase 1 closes. This preserves the day-1 deploy schedule without front-running Evan's sign-off.

## Updating this contract

This file is governance, not code. Updates follow the same flow as decisions:

1. Record the new decision in `DECISIONS.md` first (append-only line; signed).
2. Edit `CONTRACT.md` to reflect the new state.
3. Open a single PR with both changes; both Kit and Evan approve before merge.

If `CONTRACT.md` and `DECISIONS.md` ever disagree, `DECISIONS.md` wins (per `D-20`) and `CONTRACT.md` is corrected.
