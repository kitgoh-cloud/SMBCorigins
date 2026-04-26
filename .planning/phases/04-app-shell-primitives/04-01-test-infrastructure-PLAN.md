---
phase: 04-app-shell-primitives
plan: 01
type: execute
wave: 0
depends_on: []
files_modified:
  - package.json
  - vitest.config.ts
  - vitest.setup.ts
autonomous: true
requirements: [SHELL-04, SHELL-05]
tags: [vitest, jsdom, testing-library, ci, infrastructure]

must_haves:
  truths:
    - "Vitest discovers and runs *.test.tsx files (not just *.test.ts)"
    - "@testing-library/react render() works in tests with jsdom"
    - "expect(el).toHaveClass(...) and other jest-dom matchers work without per-file imports"
    - "Phase 3's existing lib/*.test.ts tests still pass after the env switch"
  artifacts:
    - path: "vitest.setup.ts"
      provides: "jest-dom matcher registration"
      contains: "@testing-library/jest-dom/vitest"
    - path: "vitest.config.ts"
      provides: "Vitest config with jsdom env + tsx include + setupFiles"
      contains: "environment: 'jsdom'"
    - path: "package.json"
      provides: "jsdom + testing-library dev deps"
      contains: "jsdom"
  key_links:
    - from: "vitest.config.ts"
      to: "vitest.setup.ts"
      via: "setupFiles array"
      pattern: "setupFiles:.*vitest\\.setup\\.ts"
    - from: "vitest.setup.ts"
      to: "@testing-library/jest-dom"
      via: "side-effect import"
      pattern: "@testing-library/jest-dom/vitest"
---

<objective>
Land the Vitest jsdom + React Testing Library + jest-dom upgrade so Wave 1+ plans can write *.test.tsx React component tests without per-file boilerplate. This is BLOCKING for every primitive and shell test in Phase 4 — without it, every test plan ships with `❌ MISSING` references per VALIDATION.md.

Purpose: Unblock React component DOM testing under Vitest. Phase 3 wired Vitest in node-environment mode only (`*.test.ts` matched, jsdom not installed); Phase 4 needs jsdom + @testing-library/react + jest-dom matchers.

Output:
- Three new devDependencies in package.json (jsdom, @testing-library/react, @testing-library/jest-dom)
- Modified vitest.config.ts (env=jsdom, include .tsx, setupFiles)
- New vitest.setup.ts at repo root (one-line jest-dom matcher import)
- npm run test continues to pass (Phase 3's three test files run cleanly under the new env)
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/04-app-shell-primitives/04-RESEARCH.md
@.planning/phases/04-app-shell-primitives/04-VALIDATION.md
@.planning/phases/04-app-shell-primitives/04-PATTERNS.md
@vitest.config.ts
@package.json
@.planning/STATE.md

<interfaces>
<!-- Current vitest.config.ts (verbatim from disk) -->
```ts
// vitest.config.ts (CURRENT — Phase 3, 11 lines)
import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'node',
    globals: false,
    include: ['**/*.test.ts'],
  },
})
```

Phase 3 existing test files that MUST continue passing under jsdom env:
- `lib/api.mock.test.ts`
- `lib/stages.test.ts`
- `data/seed.test.ts`

These test pure-function logic; jsdom adds a global `window` which they ignore. See RESEARCH §6 Pitfall A5 for jsdom-compat assertion.
</interfaces>
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: Install jsdom + @testing-library/react + @testing-library/jest-dom dev deps</name>
  <read_first>
    - /Users/wyekitgoh/Projects/SMBCorigins/package.json (current devDependencies layout — confirm no testing-library or jsdom present)
    - .planning/phases/04-app-shell-primitives/04-RESEARCH.md §"Standard Stack" (lines 117–151) — version verification protocol
    - .planning/phases/04-app-shell-primitives/04-PATTERNS.md §"Files Modified — package.json" (lines 88) — add devDeps
  </read_first>
  <files>package.json, package-lock.json</files>
  <action>
    Run `npm view jsdom version`, `npm view @testing-library/react version`, `npm view @testing-library/jest-dom version` and capture the current major versions in your reasoning. Then run a SINGLE install command pinned to those majors:
    ```
    npm install --save-dev jsdom@^25 @testing-library/react@^16 @testing-library/jest-dom@^6
    ```
    Three packages, one command, --save-dev so they land in `devDependencies`. If `npm view` reports a newer major (e.g., jsdom@26 ships before plan-phase), pin the latest stable major instead — the spec says ^25 / ^16 / ^6 as research-time recommendations; honor "current major stable" at install time.
    Do NOT add any other deps. Do NOT run `npm audit fix`. Do NOT bump existing deps.
    After install, verify by running `npm ls jsdom @testing-library/react @testing-library/jest-dom` — all three should resolve to a single version each (no duplicates).
  </action>
  <verify>
    <automated>
    grep -E '"(jsdom|@testing-library/(react|jest-dom))"' package.json | wc -l
    </automated>
  </verify>
  <acceptance_criteria>
    - `package.json` `devDependencies` contains exactly three new keys: `"jsdom"`, `"@testing-library/react"`, `"@testing-library/jest-dom"`
    - The grep `grep -E '"(jsdom|@testing-library/(react|jest-dom))"' package.json | wc -l` returns `3`
    - `package-lock.json` is updated and committed (npm install regenerates it; verify `git diff package-lock.json` shows additions, not just timestamp churn)
    - `npm ls jsdom @testing-library/react @testing-library/jest-dom` exits 0 with no `UNMET DEPENDENCY` or `extraneous` warnings
    - No other `package.json` lines change (no script churn, no existing-dep version bumps)
    - `npm run test` still exits 0 with the OLD vitest.config.ts (the install alone shouldn't break Phase 3's tests; this is the floor)
  </acceptance_criteria>
  <done>Three new devDeps present in package.json + package-lock.json; npm ls clean; existing test suite still passes.</done>
</task>

<task type="auto" tdd="false">
  <name>Task 2: Create vitest.setup.ts (one-line jest-dom matcher import)</name>
  <read_first>
    - .planning/phases/04-app-shell-primitives/04-RESEARCH.md §"Pitfall 4: Vitest jsdom environment doesn't auto-import @testing-library matchers" (lines 477–497)
    - .planning/phases/04-app-shell-primitives/04-PATTERNS.md §"vitest.setup.ts (NEW)" (lines 685–698) — analog: `app/layout.tsx:3` `import './globals.css'` one-line side-effect import idiom
  </read_first>
  <files>vitest.setup.ts</files>
  <action>
    Create the file at the repo root (NOT under app/ or lib/) at path `vitest.setup.ts`. Content is exactly two lines (one import + a trailing newline):
    ```ts
    import '@testing-library/jest-dom/vitest'
    ```
    No file-header comment. No `export {}`. No additional setup logic. Keep it bare — this file's only purpose is to register jest-dom's matcher augmentations on Vitest's `expect`.
    Per RESEARCH §6 line 1241–1244, `@testing-library/jest-dom/vitest` (note the `/vitest` path) is the Vitest-specific entrypoint that ships its own type augmentation — no separate `@types/jest-dom` package is required.
  </action>
  <verify>
    <automated>
    test -f vitest.setup.ts && grep -q "@testing-library/jest-dom/vitest" vitest.setup.ts && wc -l vitest.setup.ts | awk '{exit ($1 > 3)}'
    </automated>
  </verify>
  <acceptance_criteria>
    - File `vitest.setup.ts` exists at repo root (`/Users/wyekitgoh/Projects/SMBCorigins/vitest.setup.ts`)
    - File contains the literal string `import '@testing-library/jest-dom/vitest'` (single quotes, exactly that import path with the `/vitest` subpath)
    - File is ≤3 lines (verified by `wc -l vitest.setup.ts`)
    - File has no `export` statements (purely side-effect import)
    - File has no file-header comment
  </acceptance_criteria>
  <done>vitest.setup.ts exists with the single import line and nothing else.</done>
</task>

<task type="auto" tdd="false">
  <name>Task 3: Update vitest.config.ts — environment jsdom, include .tsx, setupFiles</name>
  <read_first>
    - /Users/wyekitgoh/Projects/SMBCorigins/vitest.config.ts (current 11-line file — confirm `environment: 'node'`, `include: ['**/*.test.ts']`, no setupFiles)
    - .planning/phases/04-app-shell-primitives/04-RESEARCH.md §6 (lines 1203–1262) — verbatim recommended config
    - .planning/phases/04-app-shell-primitives/04-PATTERNS.md §"Files Modified — vitest.config.ts" (line 85) — three changes summary
  </read_first>
  <files>vitest.config.ts</files>
  <action>
    Replace `vitest.config.ts` with this exact content (preserve current import order; only the `test` block changes):
    ```ts
    import { defineConfig } from 'vitest/config'
    import tsconfigPaths from 'vite-tsconfig-paths'

    export default defineConfig({
      plugins: [tsconfigPaths()],
      test: {
        environment: 'jsdom',
        globals: false,
        setupFiles: ['./vitest.setup.ts'],
        include: ['**/*.test.{ts,tsx}'],
      },
    })
    ```
    Three changes from current state (per RESEARCH §6 + PATTERNS line 85):
    1. `environment: 'node'` → `environment: 'jsdom'`
    2. NEW `setupFiles: ['./vitest.setup.ts']` line (between `globals` and `include`)
    3. `include: ['**/*.test.ts']` → `include: ['**/*.test.{ts,tsx}']`
    Keep `globals: false` (Phase 3 D-63 lock per CONTEXT.md). Keep the tsconfigPaths plugin order. Keep the import order. Do NOT add any new top-level keys.
  </action>
  <verify>
    <automated>
    grep -q "environment: 'jsdom'" vitest.config.ts && grep -q "setupFiles: \['./vitest.setup.ts'\]" vitest.config.ts && grep -q "include: \['\*\*/\*.test.{ts,tsx}'\]" vitest.config.ts && grep -q "globals: false" vitest.config.ts && npm run test
    </automated>
  </verify>
  <acceptance_criteria>
    - File `vitest.config.ts` exists with `environment: 'jsdom'` (NOT `'node'`)
    - File contains `setupFiles: ['./vitest.setup.ts']` exactly (single quotes, dot-slash relative path)
    - File contains `include: ['**/*.test.{ts,tsx}']` (extension brace expansion)
    - File still contains `globals: false` (D-63 lock preserved — explicit imports of `describe`/`it`/`expect` remain required)
    - File still contains `tsconfigPaths()` plugin invocation (path-alias support preserved)
    - `npm run test` exits 0 (all 3 Phase 3 tests pass under jsdom — `lib/api.mock.test.ts`, `lib/stages.test.ts`, `data/seed.test.ts`; jsdom-compat per RESEARCH §A5)
    - `npm run typecheck` exits 0 (no TS errors introduced by the config change)
  </acceptance_criteria>
  <done>vitest.config.ts replaces 'node' with 'jsdom', adds setupFiles + tsx-include; full Phase 3 test suite still passes under the new env.</done>
</task>

</tasks>

<threat_model>
Phase 4 plan with **no active code-runtime threats** — this plan modifies build/test config only. The single applicable ASVS category is V14 Configuration; risk = 0 because the test config affects only the developer's Vitest environment, not production runtime.

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-04-01-01 | V14 Configuration | vitest.config.ts | accept | Test-only config; no production code path. The jsdom environment runs only when `npm run test` is invoked locally or in CI's `test` job. Phase 3 tests verified jsdom-compatible per RESEARCH §A5. |

No supply-chain controls beyond standard `npm install` — the three new devDeps (jsdom, @testing-library/react, @testing-library/jest-dom) are all from established maintainer accounts (jsdom org, testing-library org). Versions pinned to majors via `^` per RESEARCH §A4.
</threat_model>

<verification>
After all 3 tasks land:
1. `npm run test` exits 0 with all Phase 3 tests passing.
2. `npm run typecheck` exits 0.
3. `npm run lint` exits 0.
4. Inside the repo: `cat vitest.setup.ts` shows the single import line.
5. Inside the repo: `cat vitest.config.ts` shows `environment: 'jsdom'`.
6. `git status` shows changes in: `package.json`, `package-lock.json`, `vitest.config.ts`, `vitest.setup.ts`.

Wave-gate: this plan must be GREEN before Wave 1+ starts. Subsequent primitive `.test.tsx` plans will fail-fast without this infra.
</verification>

<success_criteria>
- [ ] devDeps `jsdom@^25`, `@testing-library/react@^16`, `@testing-library/jest-dom@^6` (or current stable majors) installed
- [ ] `vitest.setup.ts` exists at repo root with `import '@testing-library/jest-dom/vitest'`
- [ ] `vitest.config.ts` has `environment: 'jsdom'`, `setupFiles: ['./vitest.setup.ts']`, `include: ['**/*.test.{ts,tsx}']`
- [ ] All Phase 3 tests still pass under the new jsdom env (`npm run test` exits 0)
- [ ] No new lint or typecheck errors introduced
</success_criteria>

<output>
After completion, create `.planning/phases/04-app-shell-primitives/04-01-SUMMARY.md`
</output>
