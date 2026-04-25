---
id: 02-05
phase: 02-scaffolding
plan: 05
status: complete
completed_at: 2026-04-25
commit: 59a0887
merge_commit: 4337654
---

# 02-05 SUMMARY — CI + README/CLAUDE.md + PR + branch protection + production verify

## What landed
- `.github/workflows/ci.yml`: two top-level jobs (`typecheck`, `lint`), each with explicit `name:` (D-39). Both use `actions/checkout@v4`, `actions/setup-node@v4` with `node-version-file: '.nvmrc'`, `cache: 'npm'`, and `npm ci`. Workflow root has `permissions: contents: read` for least-privilege GITHUB_TOKEN. No `pull_request_target`, no `matrix:`.
- `README.md`: replaced create-next-app boilerplate with project-specific How to run + pre-PR validation + live URL + repo structure.
- `CLAUDE.md`: replaced line-100 `_TBD — filled in once scaffolded._` placeholder with run + validation + live URL block. All four Phase 1 sections preserved (Stack contract / Scaffolding ownership / Design system / Personas).

## Outcomes
- **PR**: https://github.com/kitgoh-cloud/SMBCorigins/pull/2 — opened from `kit/scaffold` to `main`.
- **First CI run**: typecheck ✓, lint ✓, Vercel ✓.
- **Branch protection on `main`** configured: `Require a pull request before merging` (0 required approvals — CODEOWNERS handles boundary review per D-08), three required status checks (typecheck, lint, Vercel).
- **Merge commit**: `4337654` (Evan merged PR #2 into main).
- **Production URL**: https://smbcorigins.vercel.app

## Repo / hosting note
The git remote is `kitgoh-cloud/SMBCorigins` (not `evangohAIO/SMBCorigins` as referenced in DECISIONS / earlier plans). Vercel and branch protection are configured against the actual remote. PR / CI / preview / production all flow through `kitgoh-cloud/SMBCorigins`. If DECISIONS.md needs to be reconciled to the actual repo path, do it in a follow-up doc-only PR.

## ROADMAP §Phase 2 success criteria (all four pass)
1. **`npm run dev` boots locally with zero TypeScript errors** — verified post-merge on `main`: `npm run typecheck` exit 0, `npm run dev` serves HTTP 200 on localhost:3000.
2. **Vercel production URL renders palette + four fonts** — verified at https://smbcorigins.vercel.app: full 18-swatch token showcase visible (4 groups: Brand greens / Neutrals / Signals / Dark mode); all four fonts (Fraunces, Inter Tight, Noto Sans JP, IBM Plex Mono) render distinctly; Japanese sample line renders; mono ID line renders.
3. **Each PR produces a unique preview URL** — proven structurally: PR #2's preview at https://smbcorigins-git-kit-scaffold-kitgoh-clouds-projects.vercel.app/. Vercel GitHub App is now linked and continues to deploy previews on every future PR.
4. **`/(client)` and `/(rm)` route-group URLs return persona-specific placeholders** — `/journey` (Yuki bilingual greeting) and `/cockpit` (James RM placeholder w/ ID:RM-0001) render on both preview and production.

## Phase 2 closes SCAFF-01..07
| Req | Closure |
|-----|---------|
| SCAFF-01 | 02-01 — booting `npm run dev` |
| SCAFF-02 | 02-02 — TS strict + noUncheckedIndexedAccess; build/typecheck/lint green |
| SCAFF-03 | 02-03 — Tailwind v4 utilities applied (verified via DevTools computed style) |
| SCAFF-04 | 02-03 — full ORIGIN_DESIGN §8 token set in @theme block |
| SCAFF-05 | 02-03 — four next/font/google fonts loaded; visible on production |
| SCAFF-06 | 02-04 — `/(client)/journey` + `/(rm)/cockpit` route groups, both 200 simultaneously |
| SCAFF-07 | 02-05 — branch protection on main + Vercel auto-deploy + PR previews |

## Deviations summary (across all 5 plans)
1. **02-01**: scaffolded into `/tmp/smbcorigins-scaffold` and rsynced into repo (npm name rule rejects capitals in `SMBCorigins`).
2. **02-02**: extended `.prettierignore` to skip planning + author-curated docs (CLAUDE.md byte-identical preservation rule).
3. **02-03**: dropped `axes: ['wght']` from Fraunces (next/font@16 type only accepts opsz/SOFT/WONK; wght is implicit).
4. **02-04**: switched `<a>` → `<Link>` for internal nav (satisfies `@next/next/no-html-link-for-pages` lint rule; typedRoutes accepts since routes exist).
5. **02-05**: PAT initially lacked `workflow` scope — push deferred until Kit refreshed scopes; remote is `kitgoh-cloud/SMBCorigins`, not `evangohAIO/SMBCorigins` as plans referenced.

All deviations preserve plan intent; behavior contract intact.

## Next
Phase 2 complete. Ready for Phase 3 (Shared Boundary): `types/origin.ts`, `lib/api.ts` mock/real switch, `data/seed.ts`.
