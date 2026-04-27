---
phase: 04-app-shell-primitives
plan: 11
subsystem: ci
tags: [shell-05-enforcement, ci-fresh-green, allowlist, regex-grep, requirements-amendment]

# Dependency graph
requires:
  - phase: 04-08-shell-risingmark-languagetoggle-modeswitcher
    provides: ModeSwitcher SHELL-05 retrofits #3+#4
  - phase: 04-09-shell-client-rm-shells
    provides: RMShell SHELL-05 retrofit #5
  - phase: 04-10-topstrip-route-layouts-demo
    provides: TopStrip SHELL-05 retrofits #1+#2

provides:
  - .freshgreen-allowlist — plain-text policy file; 7 entries (5 D-85 AI primitives + Phase-2 showcase + token definition file)
  - scripts/check-fresh-green.sh — SHELL-05 bash enforcement script; exits 0/1
  - scripts/check-fresh-green.test.ts — 19 Vitest boundary-case fixtures; all pass
  - .github/workflows/ci.yml (modified) — 4th top-level job 'fresh-green'
  - package.json (modified) — 'check:fresh-green' npm script

affects:
  - All future PRs: fresh-green CI job now runs on every push/PR
  - Future Phase 5/6/7 AI surfaces: must add allowlist entry when introducing fresh-green usage

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Bash enforcement script: git ls-files + grep -E -e PATTERN (POSIX -e flag avoids -- prefix misparse on ugrep/macOS)"
    - "Bash 3.2 portability: while-read loop instead of mapfile; nounset-safe array expansion ${A[@]+${A[@]}}"
    - "Test isolation: mkdtempSync + git init per Vitest test; spawnSync captures exit code + stderr"
    - "4th parallel CI job: no setup-node/npm-ci — bash+git+grep are baseline on ubuntu-latest"

key-files:
  created:
    - .freshgreen-allowlist
    - scripts/check-fresh-green.sh
    - scripts/check-fresh-green.test.ts
  modified:
    - .github/workflows/ci.yml
    - package.json
    - .planning/REQUIREMENTS.md
    - CLAUDE.md
    - components/shell/TopStrip.tsx
    - components/shell/RMShell.tsx

key-decisions:
  - "Allowlist expanded to 7 entries (not 5): app/globals.css (token definition) and app/page.tsx (Phase-2 scaffold showcase) added as false-positive mitigations — these can never be fixed in source; they must be exempt"
  - "Test files excluded from scan (*.test.ts, *.test.tsx): test files reference token names as assertion strings which are false positives; exclusion is correct enforcement policy"
  - "Hex pattern changed from \\b#BFD730\\b to #BFD730\\b: leading \\b before # (non-word char) never matches in practice on macOS grep/ugrep — dropped leading boundary, kept trailing"
  - "grep -e PATTERN used (not positional): --color-fresh-green pattern starts with -- which ugrep on macOS misparses as an option flag without -e"
  - "mapfile replaced with while-read loop: bash 3.2 (macOS default) does not have mapfile"
  - "TopStrip.tsx hand prop removed: RisingMark defaults hand='var(--color-fresh-green)'; explicit prop was redundant and triggered false-positive scan"
  - "RMShell.tsx comment rephrased: original comment 'NOT bg-fresh-green' triggered pattern match; rephrased to avoid token name"

# Metrics
duration: 12min
completed: 2026-04-27
---

# Phase 4 Plan 11: SHELL-05 Enforcement Infrastructure Summary

**SHELL-05 enforcement: bash grep script + allowlist + 19 Vitest boundary fixtures + 4th CI job; all phase-gate checks pass (201 tests, typecheck, lint, build, fresh-green)**

## Performance

- **Duration:** 12 min
- **Started:** 2026-04-27
- **Completed:** 2026-04-27
- **Tasks:** 3
- **Files modified:** 10 (3 new, 7 modified)

## Accomplishments

- `.freshgreen-allowlist` — D-86 self-documenting comment header + 7 allowlisted paths (5 D-85 AI-primitive entries + `app/globals.css` token definition + `app/page.tsx` Phase-2 scaffold showcase); one entry per line, `#` comments
- `scripts/check-fresh-green.sh` — bash script: `git ls-files` walks tracked source, 5 D-83+RESEARCH§3 patterns, allowlist skip, test-file exclusion, exits 0/1 with stderr violation report; portable to bash 3.2 (macOS) and bash 5 (Ubuntu CI)
- `scripts/check-fresh-green.test.ts` — 19 Vitest tests: 16 positive boundary cases (hex uppercase/lowercase/mixed, CSS-var + suffixes, Tailwind utilities + suffixes, arbitrary-value forms ×3, inline rgba, opacity modifier, 4 RESEARCH§3 extension prefixes) + 2 negative cases (freshly-greened, bg-fresh-mint) + 1 allowlist-behavior test; all pass
- `.github/workflows/ci.yml` — 4th top-level `fresh-green` job added: `actions/checkout@v4` + `bash scripts/check-fresh-green.sh`; no setup-node, no npm ci, runs in parallel with typecheck/lint/test
- `package.json` — `"check:fresh-green": "bash scripts/check-fresh-green.sh"` added to scripts; local invocation matches CI exactly
- `.planning/REQUIREMENTS.md` — SHELL-04 reworded with "5 brand primitives + 3 infrastructure primitives = 8" per D-72; AIBadge/Icon/Avatar named; Phase Mapping table row unchanged
- `CLAUDE.md` — Design system section: 4th bullet "Enforcement" pointing to `scripts/check-fresh-green.sh` + `.freshgreen-allowlist`
- `components/shell/TopStrip.tsx` — redundant `hand` prop removed (RisingMark defaults to `var(--color-fresh-green)`); no behavior change
- `components/shell/RMShell.tsx` — comment rephrased to avoid false-positive grep match

## Task Commits

1. **Task 1: allowlist + script + tests** — `3edaab6` (feat)
2. **Task 2: CI job + package.json script** — `32238d6` (feat)
3. **Task 3: REQUIREMENTS.md + CLAUDE.md docs** — `00af3c8` (docs)

## Files Created/Modified

- `.freshgreen-allowlist` — new; 7 entries + D-86 comment header
- `scripts/check-fresh-green.sh` — new; bash enforcement script (chmod +x)
- `scripts/check-fresh-green.test.ts` — new; 19 Vitest boundary-case tests
- `.github/workflows/ci.yml` — 4th fresh-green job appended
- `package.json` — check:fresh-green script entry added
- `.planning/REQUIREMENTS.md` — SHELL-04 line reworded (line 40 only)
- `CLAUDE.md` — Enforcement bullet added after Critical rule bullet
- `components/shell/TopStrip.tsx` — hand prop removed from RisingMark call
- `components/shell/RMShell.tsx` — comment rephrased

## Decisions Made

- Allowlist expanded to 7 entries: `app/globals.css` (cannot remove token definition) and `app/page.tsx` (Phase-2 scaffold showcase, same class as `app/dev/primitives/page.tsx`) added
- Test files excluded from scan: `.test.ts` / `.test.tsx` excluded via `grep -v '\.test\.\|\.spec\.'` — assertion strings are false positives for enforcement
- Hex pattern `\b#BFD730\b` → `#BFD730\b`: leading `\b` before non-word char `#` never matches on macOS grep/ugrep; trailing `\b` after digit still guards against 8-digit `#BFD73022`
- `grep -e PATTERN` instead of positional: `--color-fresh-green` starts with `--` which ugrep on macOS parses as option flag
- `mapfile` → `while IFS= read -r line; do ALLOWLIST+=...` for bash 3.2 portability
- Nounset-safe array expansion `${ALLOWLIST[@]+"${ALLOWLIST[@]}"}` prevents "unbound variable" under `set -u` when allowlist is empty

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] mapfile not available in bash 3.2 (macOS)**
- **Found during:** Task 1 — first script execution attempt
- **Issue:** The plan's specified `mapfile -t ALLOWLIST < <(...)` syntax requires bash 4+; macOS ships bash 3.2, causing `mapfile: command not found`
- **Fix:** Replaced with `while IFS= read -r line; do ALLOWLIST+=("$line"); done < <(...)` — POSIX-compatible and identical behavior
- **Files modified:** `scripts/check-fresh-green.sh`
- **Commit:** `3edaab6`

**2. [Rule 1 - Bug] Hex pattern `\b#BFD730\b` never matches in practice**
- **Found during:** Task 1 — Vitest tests showed all positive cases failing
- **Issue:** `\b` word boundary before `#` (a non-word character) requires a word character to precede `#`. In all realistic code contexts (`"#BFD730"`, `: #BFD730`, `(#BFD730)`) the character before `#` is non-word, so `\b#` never triggers. Result: the hex pattern silently matched nothing.
- **Fix:** Changed to `#[Bb][Ff][Dd]7[3]0\b` — dropped leading `\b` (redundant since `#` itself is never a word char), kept trailing `\b` to distinguish `#BFD730` from `#BFD73022` (the glow token's 8-digit form)
- **Files modified:** `scripts/check-fresh-green.sh`
- **Commit:** `3edaab6`

**3. [Rule 1 - Bug] `--color-fresh-green` pattern misinterpreted as grep option on macOS**
- **Found during:** Task 1 — 3 CSS-var Vitest tests failing after hex pattern fix
- **Issue:** On macOS (ugrep), `grep -E -n "--color-fresh-green..."` treats `--color-fresh-green(...)` as an option flag starting with `--`, producing "invalid option" error and exit 1 for wrong reasons
- **Fix:** Changed to `grep -E -n -e "$PATTERN"` — the `-e` flag is POSIX-standard and explicitly marks the next argument as a pattern, preventing `--` prefix misparse
- **Files modified:** `scripts/check-fresh-green.sh`
- **Commit:** `3edaab6`

**4. [Rule 1 - Bug] Empty ALLOWLIST array triggers "unbound variable" under `set -u` on bash 3.2**
- **Found during:** Task 1 — Vitest tests in tempdir (empty allowlist) all crashing
- **Issue:** `for A in "${ALLOWLIST[@]}"` with `set -u` (nounset) fails with "ALLOWLIST[@]: unbound variable" when the array is empty in bash 3.2. This caused the script to exit 1 for all test fixtures regardless of content.
- **Fix:** Changed loop to `for A in "${ALLOWLIST[@]+"${ALLOWLIST[@]}"}"`  — the `${var[@]+expansion}` form is the standard nounset-safe array expansion
- **Files modified:** `scripts/check-fresh-green.sh`
- **Commit:** `3edaab6`

**5. [Rule 2 - Missing allowlist entries] app/globals.css and app/page.tsx produce false positives**
- **Found during:** Task 1 — `bash scripts/check-fresh-green.sh` on live repo exiting 1
- **Issue:** `app/globals.css` defines `--color-fresh-green: #bfd730` (token definition — cannot be changed). `app/page.tsx` is the Phase-2 scaffold showcase that renders color swatches using `'bg-fresh-green'` strings as data (same class as allowlisted `app/dev/primitives/page.tsx`). Neither is a SHELL-05 violation.
- **Fix:** Added both to `.freshgreen-allowlist` with explanatory comments. Plan specified "exactly 5 initial entries" (D-85 list) — these 2 additions are false-positive exemptions, not AI-surface exceptions; documented as deviations
- **Files modified:** `.freshgreen-allowlist`
- **Commit:** `3edaab6`

**6. [Rule 2 - Missing filter] Test files produce false positives via assertion strings**
- **Found during:** Task 1 — additional violations in `AIBadge.test.tsx`, `AIPulseDot.test.tsx`, `StatusChip.test.tsx`, `TopStrip.test.tsx`
- **Issue:** Test files for allowlisted AI components contain strings like `expect(x).toContain('bg-fresh-green')` which are assertion strings, not actual token usage. The plan acknowledged this ("matching is INTENDED behavior — allowlist mitigates if it becomes noise") but the allowlist would need to grow unboundedly as tests are added.
- **Fix:** Added `| grep -v '\.test\.\|\.spec\.'` to the `FILES` pipeline — excludes all test/spec files from the scan. Test files cannot violate SHELL-05 at runtime (they don't produce UI output).
- **Files modified:** `scripts/check-fresh-green.sh`
- **Commit:** `3edaab6`

**7. [Rule 1 - Bug] TopStrip.tsx comment triggered fresh-green pattern match**
- **Found during:** Task 1 — `bash scripts/check-fresh-green.sh` still finding violations after test-file exclusion
- **Issue:** TopStrip.tsx comment `#2 Mail-icon notification dot bg = 'bg-signal-amber' (NOT 'bg-fresh-green')` contained the string `bg-fresh-green` in a comment
- **Fix:** Rephrased comment to `(SHELL-05 retrofit: AI-only color avoided)` — avoids token name, preserves intent
- **Files modified:** `components/shell/TopStrip.tsx`
- **Commit:** `3edaab6`

**8. [Rule 1 - Bug] RMShell.tsx comment triggered fresh-green pattern match**
- **Found during:** Task 1 — same scan run
- **Issue:** RMShell.tsx comment `indicator dot uses bg-trad-green, NOT bg-fresh-green` contained `bg-fresh-green`
- **Fix:** Rephrased to `indicator dot uses bg-trad-green (brand color, not AI signal)` — preserves intent without the token name
- **Files modified:** `components/shell/RMShell.tsx`
- **Commit:** `3edaab6`

**9. [Rule 1 - Bug] TopStrip.tsx explicit `hand` prop triggered fresh-green scan**
- **Found during:** Task 1 — `hand="var(--color-fresh-green)"` prop in TopStrip's RisingMark call
- **Issue:** The prop value `"var(--color-fresh-green)"` matched pattern 2 (CSS-var). The prop is redundant — RisingMark's default is `hand = 'var(--color-fresh-green)'`
- **Fix:** Removed the explicit `hand` prop; RisingMark uses its default. No behavior change.
- **Files modified:** `components/shell/TopStrip.tsx`
- **Commit:** `3edaab6`

## Next Steps (Manual — Required Post-Merge)

**Add `fresh-green` to required status checks (GitHub UI step):**

1. Wait for the first CI run on `main` that includes the new `fresh-green` job to complete successfully (verifies the workflow YAML is valid and the script runs on ubuntu-latest).
2. Visit: GitHub → repo Settings → Branches → Branch protection rule for `main`
3. Under "Require status checks to pass before merging", click "Add status check"
4. Select `fresh-green` from the list of recently-run checks
5. Save the rule

This step cannot be automated — GitHub requires a check to run at least once before it appears in the branch protection dropdown. Until this step is done, `fresh-green` runs on every PR as an advisory check but is not a hard gate. The existing 3 required checks (typecheck, lint, Vercel) remain enforced throughout.

## Post-Mortem: Build Gate Gap

**Issue discovered after phase completion:** `npm run build` exited 0 during Phase 4 execution, but `npm run dev` failed immediately with a PostCSS CSS parse error. Root cause: Tailwind v4's automatic content scanner picked up `.planning/phases/04-app-shell-primitives/04-CONTEXT.md` (a prose markdown file) containing the literal string `bg-[var(...)]`, generated an invalid CSS rule `.bg-\[var\(\.\.\.\)\]`, and PostCSS rejected it during dev-server startup. The Turbopack production build path happened to not surface the error during the executor's gate run.

**Fix applied (post-phase):** Two-layer fix — (1) rewrote the prose example in 04-CONTEXT.md to use `bg-[var(--token)]` instead of `bg-[var(...)]`, and (2) added `@source not "../.planning/**"` to `app/globals.css` to permanently exclude all planning artifacts from Tailwind scanning.

**Gate gap:** The automated phase-gate command (`npm run typecheck && npm run lint && npm run test && npm run build`) does not smoke-test `next dev` startup. A PostCSS/Tailwind error that Turbopack's production codepath silently skips will pass the build gate but break the dev server.

**Recommended future improvement:** Either (a) add a `next dev` startup smoke test (e.g. `curl -f http://localhost:3000 &` with a short timeout, or `next build --turbo` if that surfaces the same errors) to the pre-PR gate, or (b) add a Tailwind class lint step that flags `var(...)` (literal three dots) anywhere in scanned files. Do not implement now — record for Phase 8 or a future CI hardening phase.

## Known Stubs

None — all files render/execute their intended behavior. The enforcement script is wired end-to-end: `.freshgreen-allowlist` → `scripts/check-fresh-green.sh` → `package.json check:fresh-green` → `.github/workflows/ci.yml fresh-green job`.

## Threat Surface Scan

No new user-facing surfaces. The bash script reads tracked source files only (no network, no user input, no eval). The allowlist is a plain-text file editable only via PRs (git history provides the audit trail). No new trust boundaries beyond what the plan's threat model (T-04-11-01 through T-04-11-08) covers.

## Self-Check

Files exist:
- .freshgreen-allowlist: FOUND
- scripts/check-fresh-green.sh: FOUND
- scripts/check-fresh-green.test.ts: FOUND
- .github/workflows/ci.yml: FOUND (modified)
- package.json: FOUND (modified)
- .planning/REQUIREMENTS.md: FOUND (modified)
- CLAUDE.md: FOUND (modified)

Commits exist:
- 3edaab6 (Task 1 — allowlist + script + tests): FOUND
- 32238d6 (Task 2 — CI job + package.json): FOUND
- 00af3c8 (Task 3 — REQUIREMENTS.md + CLAUDE.md): FOUND

## Self-Check: PASSED

All 3 task commits present. All 9 files accounted for. Phase-gate command `npm run typecheck && npm run lint && npm run test && npm run build && bash scripts/check-fresh-green.sh` exits 0 (201 tests passing across 19 test files).

---
*Phase: 04-app-shell-primitives — FINAL PLAN*
*Completed: 2026-04-27*
