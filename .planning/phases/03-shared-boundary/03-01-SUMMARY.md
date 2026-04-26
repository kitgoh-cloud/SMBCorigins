---
phase: 03-shared-boundary
plan: 01
subsystem: tooling
tags: [vitest, ci, test-runner, devdeps]
requires:
  - .github/workflows/ci.yml (Phase 2 — typecheck + lint jobs)
  - package.json (Phase 2 — scripts block + devDeps)
  - tsconfig.json paths (Phase 2 — @/* alias)
provides:
  - npm run test / npm run test:watch (Vitest)
  - vitest.config.ts (test runner config with @/ alias resolution)
  - third top-level CI job `test` parallel to typecheck + lint
  - pre-PR validation chain extended with `npm run test`
affects:
  - downstream plans 03-02, 03-04, 03-05 (can now author *.test.ts files)
tech-stack:
  added:
    - vitest ^4.1.5
    - vite-tsconfig-paths ^6.1.1
  patterns:
    - "Pattern I: Co-located Vitest tests with node environment (established)"
key-files:
  created:
    - vitest.config.ts
  modified:
    - package.json
    - package-lock.json
    - .github/workflows/ci.yml
    - CLAUDE.md
decisions:
  - "Use --passWithNoTests on `npm run test` because Vitest 4.x exits non-zero on zero test files"
metrics:
  duration_minutes: 3
  completed: 2026-04-26
  tasks_completed: 4
  files_changed: 5
---

# Phase 3 Plan 01: Wire Vitest Test Runner Summary

Vitest is wired as the project's test runner with a third parallel `test` CI job and pre-PR validation chain extended to include it — zero test files yet, runner ready for plans 02/04/05.

## What Shipped

**Task 1.1 — Install Vitest + scripts (`package.json`)**
- Installed `vitest@^4.1.5` and `vite-tsconfig-paths@^6.1.1` as devDependencies via `npm install --save-dev`.
- Added `"test": "vitest run --passWithNoTests"` and `"test:watch": "vitest"` to scripts block.
- Note: original plan spec was `"vitest run"` without the flag; see Deviations below.

**Task 1.2 — Vitest config (`vitest.config.ts`)**
- Minimal 11-line config: `tsconfigPaths()` plugin (so `@/` resolves at test time), `environment: 'node'`, `globals: false`, `include: ['**/*.test.ts']`.
- Establishes Pattern I (co-located Vitest tests with node env) per `03-PATTERNS.md`.
- `npm run typecheck` still passes (config file participates in tsconfig include `**/*.ts`).
- Vitest emits a deprecation note: "vite-tsconfig-paths is detected. Vite now supports tsconfig paths resolution natively via the resolve.tsconfigPaths option." Left the plugin in place per the plan spec; future cleanup candidate when Vite/Vitest pin pushes us to migrate.

**Task 1.3 — CI `test` job (`.github/workflows/ci.yml`)**
- Appended a third top-level `test` job structurally identical to existing `typecheck` and `lint` jobs (same checkout@v4, setup-node@v4 with `node-version-file: '.nvmrc'`, `npm ci`, then `npm run test`).
- Three top-level jobs verified by regex: typecheck, lint, test.
- Workflow-level `permissions: contents: read` covers the new job; no per-job override needed.

**Task 1.4 — Pre-PR validation line (`CLAUDE.md`)**
- Single-line edit: `npm run typecheck && npm run lint && npm run build` → `npm run typecheck && npm run lint && npm run test && npm run build`.
- No other sections of CLAUDE.md modified.

## Verification Run

| Check | Result |
|-------|--------|
| `package.json` scripts.test = `"vitest run --passWithNoTests"` | OK |
| `package.json` scripts["test:watch"] = `"vitest"` | OK |
| `package.json` devDependencies.vitest = `^4.1.5` | OK |
| `package.json` devDependencies["vite-tsconfig-paths"] = `^6.1.1` | OK |
| `vitest.config.ts` exists with required substrings | OK |
| `.github/workflows/ci.yml` has 3 top-level jobs | OK |
| `CLAUDE.md` contains `npm run test && npm run build` | OK |
| `npm run test` exits 0 ("No test files found, exiting with code 0") | OK |
| `npm run typecheck` passes | OK |
| `npm run lint` passes | OK |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added `--passWithNoTests` to `test` script**
- **Found during:** Task 1.2 verification (running `npx vitest run`)
- **Issue:** Vitest 4.1.5 (the version npm resolved) exits with code 1 when no test files match the include glob, with output `No test files found, exiting with code 1`. The plan's success criterion requires `npm run test` to exit 0 from a clean checkout (zero test files). Without the flag, the new CI `test` job would fail on the very first push, blocking plans 02/04/05.
- **Fix:** Changed `"test": "vitest run"` → `"test": "vitest run --passWithNoTests"`. Verified: exit 0 with "No test files found, exiting with code 0".
- **Files modified:** `package.json` (scripts.test only)
- **Anticipated by plan:** Yes — the plan's `<verification>` §5 explicitly flagged this contingency: "If Vitest 3.x changes the zero-test default to non-zero exit, the fix is `"test": "vitest run --passWithNoTests"`. Document this in SUMMARY.md if encountered." Vitest 4.x carries the same behavior, so the documented fallback applies.
- **Commit:** e291b06

## Vitest Version Resolved

- `vitest@^4.1.5` (npm picked the 4.x major; plan instructed not to hand-pick)
- `vite-tsconfig-paths@^6.1.1`

The plan's pattern map referenced `"^2.x"`/`"^5.x"` as illustrative ranges; the live npm registry resolved newer majors.

## TODO for Maintainer (manual, post-merge)

After this branch's first CI run on GitHub Actions validates the new job surfaces with the status check name `test`, manually add `test` as the fourth required status check on `main` via:
**GitHub → Settings → Branches → Edit rule for `main` → Require status checks → Add `test`**

This is documented in `03-PATTERNS.md` line 676 and is explicitly NOT in this plan's scope (UI step, not in-repo).

## Commits

| Commit | Message |
|--------|---------|
| e291b06 | chore(03-01): wire vitest test runner + CI test job |

Per the plan's task 1.1 explicit direction ("DO NOT commit yet; commit comes after all four tasks in this plan land in working tree"), all four task changes ship in a single commit rather than per-task atomic commits.

## Patterns Established

- **Pattern I** (co-located Vitest tests with node env) — runner config landed in `vitest.config.ts`. First test files (`*.test.ts`) arrive in plans 03-02 / 03-04 / 03-05.

## Self-Check: PASSED

- File `vitest.config.ts` — FOUND
- File `package.json` (modified) — FOUND
- File `package-lock.json` (modified) — FOUND
- File `.github/workflows/ci.yml` (modified) — FOUND
- File `CLAUDE.md` (modified) — FOUND
- Commit e291b06 — FOUND in `git log`
