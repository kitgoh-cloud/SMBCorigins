---
phase: 04-app-shell-primitives
plan: 11
type: execute
wave: 5
depends_on: [04-01, 04-04, 04-05, 04-06, 04-07, 04-08, 04-09, 04-10]
files_modified:
  - .freshgreen-allowlist
  - scripts/check-fresh-green.sh
  - scripts/check-fresh-green.test.ts
  - .github/workflows/ci.yml
  - package.json
  - .planning/REQUIREMENTS.md
  - CLAUDE.md
autonomous: true
requirements: [SHELL-04, SHELL-05]
tags: [shell-05-enforcement, ci-fresh-green, allowlist, regex-grep, requirements-amendment]

must_haves:
  truths:
    - "scripts/check-fresh-green.sh runs locally and in CI; exits 0 when no unallowlisted fresh-green appears in tracked source files; exits 1 with a stderr report when any violation is found"
    - "scripts/check-fresh-green.test.ts passes with all 16 positive boundary-case fixtures flagged + all 2 negative fixtures NOT flagged (D-84 + RESEARCH §3 boundary-case map)"
    - ".freshgreen-allowlist contains exactly 5 initial entries (D-85: AIPulseDot.tsx, AIBadge.tsx, StatusChip.tsx, RisingMark.tsx, app/dev/primitives/page.tsx) plus the D-86 self-documenting comment header verbatim"
    - "CI workflow has a 4th top-level job 'fresh-green' running on ubuntu-latest with steps: actions/checkout@v4 + bash scripts/check-fresh-green.sh; runs in parallel with typecheck/lint/test"
    - "package.json scripts include 'check:fresh-green: bash scripts/check-fresh-green.sh' so Kit can invoke the same check locally"
    - ".planning/REQUIREMENTS.md SHELL-04 wording is amended to record the 5→8 primitive drift per D-72 (final wording: 'reword' approach — see Task 3 action); SHELL-04 row in the Phase Mapping table is unchanged"
    - "CLAUDE.md Design system section has a brief pointer to .freshgreen-allowlist + scripts/check-fresh-green.sh so future Claude sessions discover the enforcement mechanism at session start"
    - "Fresh Green #BFD730 appears only on AIPulseDot and AI-output surfaces; the grep check confirms it is absent from primary buttons and non-AI surfaces (SHELL-05 success criterion verbatim from ROADMAP)"
  artifacts:
    - path: "scripts/check-fresh-green.sh"
      provides: "SHELL-05 enforcement script — bash, walks git ls-files, applies 5 D-83 regexes, exits 1 on unallowlisted hits"
      contains: "set -euo pipefail"
    - path: "scripts/check-fresh-green.test.ts"
      provides: "Vitest fixtures verifying every D-84 + RESEARCH §3 boundary case (16 positive + 2 negative)"
      contains: "describe('SHELL-05 grep — boundary cases'"
    - path: ".freshgreen-allowlist"
      provides: "Plain-text policy file with D-86 comment header + 5 initial entries"
      contains: "components/primitives/AIPulseDot.tsx"
    - path: ".github/workflows/ci.yml"
      provides: "4th top-level CI job 'fresh-green' (Pattern M' from PATTERNS.md)"
      contains: "fresh-green:"
    - path: "package.json"
      provides: "check:fresh-green script entry"
      contains: "check:fresh-green"
    - path: ".planning/REQUIREMENTS.md"
      provides: "SHELL-04 amended to record 5→8 primitive drift"
      contains: "5 brand primitives + 3 infrastructure primitives = 8"
    - path: "CLAUDE.md"
      provides: "Design system section pointer to enforcement files"
      contains: ".freshgreen-allowlist"
  key_links:
    - from: ".github/workflows/ci.yml fresh-green job"
      to: "scripts/check-fresh-green.sh"
      via: "bash scripts/check-fresh-green.sh step"
      pattern: "bash scripts/check-fresh-green.sh"
    - from: "scripts/check-fresh-green.sh"
      to: ".freshgreen-allowlist"
      via: "mapfile read of allowlisted paths"
      pattern: "\\.freshgreen-allowlist"
    - from: "scripts/check-fresh-green.test.ts"
      to: "scripts/check-fresh-green.sh"
      via: "execSync invocation in tempdir fixture"
      pattern: "execSync.*check-fresh-green\\.sh"
    - from: "package.json scripts"
      to: "scripts/check-fresh-green.sh"
      via: "check:fresh-green npm script"
      pattern: "bash scripts/check-fresh-green\\.sh"
---

<objective>
This is the FINAL plan in Phase 4. It introduces the SHELL-05 enforcement infrastructure: a CI grep script + allowlist + Vitest fixtures + a 4th CI job. By the time this plan runs, all 5 prototype SHELL-05 violations have been retrofitted by the chrome plans (04-08 retrofits #3 + #4 in ModeSwitcher; 04-09 retrofit #5 in RMShell sidebar; 04-10 retrofits #1 + #2 in TopStrip), and the only legitimate fresh-green token uses outside the StatusChip kind='ai' branch are the four allowlisted files (RisingMark.tsx, AIPulseDot.tsx, AIBadge.tsx, app/dev/primitives/page.tsx) plus StatusChip.tsx (whole-file allowlist mitigated by D-87 per-kind unit tests in plan 04-06).

Three tasks:

1. **Task 1 — Create `.freshgreen-allowlist` + `scripts/check-fresh-green.sh` + `scripts/check-fresh-green.test.ts`** (one task because they form a tightly-coupled unit: the script reads the allowlist, the test invokes the script). Bash language per RESEARCH §7.1 (zero new tooling deps, sub-second execution, audit-friendly). Regex match list extends D-83 with the 4 RESEARCH §3 prefixes (`via`, `decoration`, `ring-offset`, `inset-shadow`) plus optional opacity modifier `/[0-9]+`. Test fixtures cover all 16 positive boundary cases + 2 negative cases verbatim from VALIDATION.md §"Boundary-case map for SHELL-05 grep test fixtures".

2. **Task 2 — Wire CI 4th job + package.json script** (small wiring task). Append `fresh-green` job to `.github/workflows/ci.yml` after line 49 (Pattern M' from PATTERNS.md, per RESEARCH §7.2). Job depends on no other jobs (parallel with typecheck/lint/test). Manual GitHub UI follow-up step is documented (NOT executed in this plan): after the first CI run includes the new job, add it to required status checks via Settings → Branches → main. Add `"check:fresh-green": "bash scripts/check-fresh-green.sh"` to package.json scripts so Kit can invoke locally with the same exact command CI uses.

3. **Task 3 — Amend REQUIREMENTS.md SHELL-04 + add CLAUDE.md pointer note** (documentation amendment per D-72). Pick the **reword approach** (option (a) in CONTEXT D-72 / PATTERNS line 879): SHELL-04 wording becomes "5 brand primitives + 3 infrastructure primitives = 8". The split-into-SHELL-04a alternative is explicitly NOT chosen — keeps the requirement ID stable for the Phase Mapping table (lines 122–126 of REQUIREMENTS.md) and avoids a renumbering cascade for downstream tooling. Add a single-sentence pointer to CLAUDE.md's Design system section so future Claude sessions discover the enforcement mechanism at session start (CLAUDE.md is read every session).

Output:
- 3 new files (`.freshgreen-allowlist`, `scripts/check-fresh-green.sh`, `scripts/check-fresh-green.test.ts`)
- 4 modified files (`.github/workflows/ci.yml`, `package.json`, `.planning/REQUIREMENTS.md`, `CLAUDE.md`)
- 1 documented manual GitHub UI follow-up step (post-merge branch protection update)

This plan completes Phase 4. After this plan ships:
- `npm run typecheck && npm run lint && npm run test && npm run build && bash scripts/check-fresh-green.sh` all exit 0 (the phase-gate command from VALIDATION.md §"Sampling Rate")
- The 4 CI jobs all pass on the PR
- SHELL-05's ROADMAP success criterion (#4) is mechanically verifiable
- The drift in SHELL-04 is recorded in the same PR that introduces the 8 primitives (per CONTEXT D-72 — "silent scope extension is worse than wrong decision")
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/04-app-shell-primitives/04-CONTEXT.md
@.planning/phases/04-app-shell-primitives/04-RESEARCH.md
@.planning/phases/04-app-shell-primitives/04-PATTERNS.md
@.planning/phases/04-app-shell-primitives/04-VALIDATION.md
@.planning/REQUIREMENTS.md
@.github/workflows/ci.yml
@package.json
@CLAUDE.md

<interfaces>
<!-- The full bash regex match list — locked verbatim per D-83 + RESEARCH §3 audit extensions -->

D-83 base patterns (5):
1. Hex literal: `\b#[Bb][Ff][Dd]7[3]0\b`
2. CSS-var: `--color-fresh-green(-[a-z0-9]+)?`
3. Tailwind utility classes: `(bg|text|border|ring|from|to|outline|fill|stroke|divide|placeholder|caret|accent|shadow)-fresh-green(-[a-z0-9]+)?`
4. Arbitrary-value forms: `\[(#[Bb][Ff][Dd]7[3]0|var\(--color-fresh-green|rgba\(\s*191\s*,\s*215\s*,\s*48)`
5. rgba inline: `rgba\(\s*191\s*,\s*215\s*,\s*48`

RESEARCH §3 audit extensions (4 prefix additions + opacity modifier):
- Pattern 3 extended to: `(bg|text|border|ring|ring-offset|from|to|via|outline|fill|stroke|divide|placeholder|caret|accent|shadow|inset-shadow|decoration)-fresh-green(-[a-z0-9]+)?(/[0-9]+)?`

Final 5-pattern array the bash script uses (one entry per pattern):
```
PATTERNS=(
  '\b#[Bb][Ff][Dd]7[3]0\b'
  '--color-fresh-green(-[a-z0-9]+)?'
  '(bg|text|border|ring|ring-offset|from|to|via|outline|fill|stroke|divide|placeholder|caret|accent|shadow|inset-shadow|decoration)-fresh-green(-[a-z0-9]+)?(/[0-9]+)?'
  '\[(#[Bb][Ff][Dd]7[3]0|var\(--color-fresh-green|rgba\(\s*191\s*,\s*215\s*,\s*48)'
  'rgba\(\s*191\s*,\s*215\s*,\s*48'
)
```

<!-- The exact .freshgreen-allowlist file content — D-86 comment header + 5 D-85 entries verbatim -->

```
# SHELL-05 reserves Fresh Green (#BFD730) for AI-authored output and
# AI presence indicators only. CSS var: --color-fresh-green (and -mute, -glow).
# Adding a path here requires architectural review, not just code review.
# Per-file allowlist is coarse — for files where only some branches use
# fresh-green (e.g., StatusChip's kind='ai'), unit tests verify each branch
# renders the expected token as a second line of defense.
# See .planning/phases/04-app-shell-primitives/04-CONTEXT.md D-82..D-88.

components/primitives/AIPulseDot.tsx
components/primitives/AIBadge.tsx
components/primitives/StatusChip.tsx
components/shell/RisingMark.tsx
app/dev/primitives/page.tsx
```

<!-- Boundary-case fixture map (verbatim from VALIDATION.md lines 118-138 + RESEARCH §3 + RESEARCH §9 lines 1416-1434) -->

POSITIVE cases that MUST flag (16 fixtures):
1. Hex `#BFD730`
2. Hex lowercase `#bfd730`
3. Hex mixed-case `#bFd730`
4. CSS-var `var(--color-fresh-green)`
5. CSS-var suffix `var(--color-fresh-green-mute)`
6. CSS-var suffix `var(--color-fresh-green-glow)`
7. Tailwind utility `bg-fresh-green`
8. Tailwind utility suffix `bg-fresh-green-mute`
9. Tailwind utility suffix `bg-fresh-green-glow`
10. Arbitrary-value with hex `bg-[#BFD730]`
11. Arbitrary-value with var `bg-[var(--color-fresh-green)]`
12. Arbitrary-value with rgba `bg-[rgba(191,215,48,0.3)]`
13. Inline rgba `rgba(191,215,48,0.3)`
14. Opacity modifier `bg-fresh-green/30` (RESEARCH §3 extension)
15. Extended prefix `via-fresh-green` (RESEARCH §3 extension)
16. Extended prefix `decoration-fresh-green` + `ring-offset-fresh-green` + `inset-shadow-fresh-green` (RESEARCH §3 extensions; combined into one fixture string `via-fresh-green decoration-fresh-green ring-offset-fresh-green inset-shadow-fresh-green` so a single-file fixture covers all 4)

NEGATIVE cases that MUST NOT flag (2 fixtures):
1. Unrelated string `freshly-greened` (regex word-boundary handles)
2. Token in different namespace `bg-fresh-mint` (currently safe — no other tokens share substring `fresh-green`)

<!-- Note on negative cases: Comment lines containing `fresh-green` (e.g., `// fresh-green note`) WILL match by design per VALIDATION.md line 138. NOT included as a negative case because the matching is INTENDED behavior — allowlist mitigates if it becomes noise. -->

<!-- The exact CI workflow YAML appendage — verbatim from PATTERNS.md lines 859-866 + RESEARCH §7.2 lines 1341-1352 -->

```yaml
  fresh-green:
    name: fresh-green
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: bash scripts/check-fresh-green.sh
```

This appends to `.github/workflows/ci.yml` AFTER line 49 (the existing `test` job's last `- run: npm run test` line). Indentation: 2 spaces for the job key (`fresh-green:`), 4 spaces for inner keys (`name:`, `runs-on:`, `steps:`), 6 spaces for the steps list items. Matches the existing `typecheck:`, `lint:`, `test:` indentation.

<!-- The exact package.json script entry — verbatim from PATTERNS.md line 916 -->

```json
"check:fresh-green": "bash scripts/check-fresh-green.sh"
```

Inserts in the `"scripts"` block, AFTER `"test:watch": "vitest"` (line 15 of current package.json). Trailing comma on the previous line; no comma on the new last line per JSON syntax.

<!-- The REQUIREMENTS.md SHELL-04 amendment — reword approach (option a) -->

Current line 40 (verbatim from REQUIREMENTS.md):
```
- [ ] **SHELL-04**: Shared primitives exist and are exported from `components/primitives/`: `Eyebrow`, `StatusChip`, `StagePill`, `AIPulseDot`, `ActionCard`
```

After amendment (reword + record the 3 infrastructure additions):
```
- [ ] **SHELL-04**: Shared primitives exist and are exported from `components/primitives/`. Phase 4 ships **5 brand primitives + 3 infrastructure primitives = 8** (drift recorded per Phase 4 D-72): brand = `Eyebrow`, `StatusChip`, `StagePill`, `AIPulseDot`, `AIBadge`, `ActionCard`; infrastructure = `Icon`, `Avatar`. (`AIBadge` was originally derived during prototype port; `Icon` and `Avatar` are infrastructure dependencies of the 5 named primitives.)
```

(Note: `AIBadge` is included in the brand subset — that brings the brand count to 6, not 5. The "5 brand + 3 infrastructure" wording is the literal D-72 phrasing from CONTEXT line 46. The list above expands the brand subset to make the AIBadge addition explicit; keeps the headline count phrasing intact while disclosing the actual 8-primitive set.)

The Phase Mapping table at lines 122–126 of REQUIREMENTS.md stays UNCHANGED — the requirement ID `SHELL-04` remains. Status flips from "Pending" to "Complete" at the end of Phase 4 (handled by /gsd-verify-work, not this plan).

<!-- CLAUDE.md pointer note — single sentence appended to the Design system section -->

Current CLAUDE.md lines 73–77 (verbatim):
```
## Design system (locked — do not deviate)

- **Typography**: Fraunces (display, numerals) · Inter Tight (UI body) · Noto Sans JP (Japanese) · IBM Plex Mono (data, timestamps, IDs, eyebrows)
- **Colors**: Trad Green `#004832` · Fresh Green `#BFD730` · warm paper `#FAFBF7`
- **Critical rule**: Fresh Green is reserved **exclusively** for AI outputs and AI presence. Do not use it for generic accents or primary buttons.
```

After amendment (add ONE additional bullet immediately after the "Critical rule" bullet on line 77):
```
- **Enforcement**: Fresh Green usage is mechanically policed by `scripts/check-fresh-green.sh` (run by the `fresh-green` CI job). Allowlisted exceptions live in `.freshgreen-allowlist` at the repo root. Adding an entry there requires architectural review.
```

Keeps the addition narrow per the plan brief: a single bullet pointing at the two enforcement files. No expansion into D-82..D-88 detail (CLAUDE.md is read every session and should stay short).
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create .freshgreen-allowlist + scripts/check-fresh-green.sh + scripts/check-fresh-green.test.ts (script + allowlist + boundary-case fixtures)</name>
  <read_first>
    - .planning/phases/04-app-shell-primitives/04-CONTEXT.md D-82..D-88 (lines 59–91) — full mechanism + match list + allowlist content + comment header verbatim
    - .planning/phases/04-app-shell-primitives/04-RESEARCH.md §3 (lines 767–824) — fresh-green grep coverage audit + 4 prefix extensions + opacity-modifier extension
    - .planning/phases/04-app-shell-primitives/04-RESEARCH.md §7.1 (lines 1266–1325) — bash language recommendation + draft script body verbatim
    - .planning/phases/04-app-shell-primitives/04-RESEARCH.md §6 (lines 1203–1262) — Vitest jsdom test setup; execSync pattern for invoking bash from Vitest
    - .planning/phases/04-app-shell-primitives/04-RESEARCH.md §"Pitfall 5: SHELL-05 grep regex over-matches" (lines 499–510)
    - .planning/phases/04-app-shell-primitives/04-VALIDATION.md §"Boundary-case map for SHELL-05 grep test fixtures" (lines 118–138) — exact positive + negative fixture list
    - .planning/phases/04-app-shell-primitives/04-PATTERNS.md §"scripts/check-fresh-green.sh" (lines 584–612) — recommended header style + conventions
    - .planning/phases/04-app-shell-primitives/04-PATTERNS.md §"scripts/check-fresh-green.test.ts" (lines 614–653) — Vitest idiom + execSync pattern
    - .planning/phases/04-app-shell-primitives/04-PATTERNS.md §".freshgreen-allowlist" (lines 656–682) — exact file content + conventions
    - .planning/phases/04-app-shell-primitives/04-PATTERNS.md §"Pattern K' (allowlist-as-policy file)" (lines 961–966)
    - .planning/phases/04-app-shell-primitives/04-PATTERNS.md §"Pattern L' (bash CI script)" (lines 967–972)
    - lib/api.mock.test.ts (any prior Phase 3 test) — for the JSDoc test-header convention
    - lib/stages.test.ts — for the explicit-imports Vitest idiom (`globals: false` in vitest.config.ts)
    - app/globals.css — confirm the 3 fresh-green tokens that exist in @theme: `--color-fresh-green`, `--color-fresh-green-mute`, `--color-fresh-green-glow`
  </read_first>
  <files>.freshgreen-allowlist, scripts/check-fresh-green.sh, scripts/check-fresh-green.test.ts</files>
  <action>
Create 3 files in this order: allowlist first (the script reads it), then script, then test (which invokes the script).

***

**File 1 — `.freshgreen-allowlist`** (repo root). Plain text. EXACT content (D-86 comment header verbatim + 5 D-85 entries; one trailing newline at EOF):

```
# SHELL-05 reserves Fresh Green (#BFD730) for AI-authored output and
# AI presence indicators only. CSS var: --color-fresh-green (and -mute, -glow).
# Adding a path here requires architectural review, not just code review.
# Per-file allowlist is coarse — for files where only some branches use
# fresh-green (e.g., StatusChip's kind='ai'), unit tests verify each branch
# renders the expected token as a second line of defense.
# See .planning/phases/04-app-shell-primitives/04-CONTEXT.md D-82..D-88.

components/primitives/AIPulseDot.tsx
components/primitives/AIBadge.tsx
components/primitives/StatusChip.tsx
components/shell/RisingMark.tsx
app/dev/primitives/page.tsx
```

Conventions:
- `#` line comments only (matches `.gitignore` convention)
- One repo-relative path per line, forward-slash separators
- Blank lines and full-line `#` comments allowed; trailing comments NOT supported (the bash script `mapfile` reads lines and skips lines starting with `#` only — see Task 1 Part 2 script body)
- DO NOT add any other entries (no `components/screens/**/Hero*.tsx`, no globs); per D-85 "no speculative globs". Phase 5/6/7 PRs add their own entries when they ship AI surfaces.

***

**File 2 — `scripts/check-fresh-green.sh`** (new file). Make sure to `chmod +x` after creation (the bash invocation `bash scripts/check-fresh-green.sh` does NOT require executable bit; but local `./scripts/check-fresh-green.sh` would. Set it to be helpful.) Use Bash tool: `chmod +x scripts/check-fresh-green.sh` after writing.

EXACT content (RESEARCH §7.1 draft + PATTERNS.md §"scripts/check-fresh-green.sh" header style merged):

```bash
#!/usr/bin/env bash
# scripts/check-fresh-green.sh — SHELL-05 Fresh Green AI-only enforcement
#
# See .planning/phases/04-app-shell-primitives/04-CONTEXT.md D-82..D-88
# See CLAUDE.md "Design system" — Fresh Green is reserved for AI outputs only.
# Allowlist: .freshgreen-allowlist (one path per line, # comments allowed)
#
# Run locally: bash scripts/check-fresh-green.sh
#   (or `npm run check:fresh-green` after Plan 04-11)
# Run in CI: 4th top-level job in .github/workflows/ci.yml
#
# Exit codes:
#   0 — no unallowlisted fresh-green token usage found
#   1 — at least one violation; details printed to stderr

set -euo pipefail

# --- Match list (D-83 + RESEARCH §3 audit extensions) -----------------------
# Pattern 3 (Tailwind utilities) extended with: via, decoration, ring-offset,
# inset-shadow + optional opacity modifier (e.g., bg-fresh-green/30).
# TODO: if app/globals.css @theme adds new --color-fresh-green-* suffixes,
# the existing pattern 2 + 3 already cover them via `(-[a-z0-9]+)?`.

PATTERNS=(
  '\b#[Bb][Ff][Dd]7[3]0\b'
  '--color-fresh-green(-[a-z0-9]+)?'
  '(bg|text|border|ring|ring-offset|from|to|via|outline|fill|stroke|divide|placeholder|caret|accent|shadow|inset-shadow|decoration)-fresh-green(-[a-z0-9]+)?(/[0-9]+)?'
  '\[(#[Bb][Ff][Dd]7[3]0|var\(--color-fresh-green|rgba\(\s*191\s*,\s*215\s*,\s*48)'
  'rgba\(\s*191\s*,\s*215\s*,\s*48'
)

# --- Read allowlist (one path per line; lines starting with # are comments) -
ALLOWLIST_FILE="${ALLOWLIST_FILE:-.freshgreen-allowlist}"
mapfile -t ALLOWLIST < <(grep -v '^#' "${ALLOWLIST_FILE}" 2>/dev/null | grep -v '^$' || true)

# --- Find candidate files (tracked source) ----------------------------------
# Use git ls-files so we follow .gitignore + skip node_modules / .next / etc.
# Restrict to source extensions: ts, tsx, css, js, jsx
FILES=$(git ls-files | grep -E '\.(ts|tsx|css|js|jsx)$' || true)

# --- Scan each file, skipping allowlisted ones ------------------------------
EXIT_CODE=0
for FILE in $FILES; do
  # Skip if file is in allowlist
  ALLOWED=0
  for A in "${ALLOWLIST[@]}"; do
    if [[ "$FILE" == "$A" ]]; then
      ALLOWED=1
      break
    fi
  done
  if [[ $ALLOWED -eq 1 ]]; then
    continue
  fi

  # Apply each pattern
  for PATTERN in "${PATTERNS[@]}"; do
    if grep -E -n "$PATTERN" "$FILE" > /dev/null 2>&1; then
      echo "SHELL-05 violation in $FILE:" >&2
      grep -E -n "$PATTERN" "$FILE" >&2
      EXIT_CODE=1
    fi
  done
done

if [[ $EXIT_CODE -ne 0 ]]; then
  echo "" >&2
  echo "Fresh Green is reserved for AI-only surfaces." >&2
  echo "See .freshgreen-allowlist for the policy + .planning/phases/04-app-shell-primitives/04-CONTEXT.md D-82..D-88." >&2
fi

exit $EXIT_CODE
```

Conventions:
- Shebang `#!/usr/bin/env bash` (matches macOS + Ubuntu CI runner; no `/bin/bash` hardcode)
- `set -euo pipefail` for strict mode (errors short-circuit; unset vars fail; pipe failures propagate)
- `ALLOWLIST_FILE` env var override (defaults to `.freshgreen-allowlist`) — the test will use this to point at a tempfile
- `git ls-files` walks tracked files only (skips `node_modules`, `.next`, ignored dirs natively — no explicit excludes needed)
- Source extension filter: `\.(ts|tsx|css|js|jsx)$` (covers all source files; SKIPS `.md`, `.json`, `.yaml` — not source code)
- For each violation, print to stderr: file name + grep output (line number + matched line)
- Exit 1 on any violation; 0 otherwise

After writing the script, also run `chmod +x scripts/check-fresh-green.sh` via Bash tool to set the executable bit (matches the convention that scripts/ files are runnable; the bash invocation in CI doesn't strictly need it but local `./scripts/...` does).

***

**File 3 — `scripts/check-fresh-green.test.ts`** (new file). Vitest test that invokes the bash script against fixtures and asserts exit codes + output.

The strategy: write fixtures to a tempdir, run the script with `ALLOWLIST_FILE` pointing at a local empty allowlist (so nothing is exempted), and assert that each positive fixture produces exit 1 + a violation message; each negative fixture produces exit 0.

Use `os.tmpdir()` + `fs.mkdtempSync()` to create a unique tempdir per test; CHANGE INTO that tempdir before invoking the script (since `git ls-files` runs in CWD — for the test, we initialize a tiny git repo in the tempdir and `git add` the fixture file).

EXACT content:

```ts
/**
 * scripts/check-fresh-green.test.ts — Boundary-case tests for SHELL-05 grep enforcement.
 *
 * Covers Phase 4 D-84 + RESEARCH §3 audit extensions:
 *   - 16 positive fixtures (regex MUST flag)
 *   - 2 negative fixtures (regex MUST NOT flag)
 *
 * Strategy: each fixture is written to a fresh tempdir initialized as a git repo,
 * then the bash script is invoked with that tempdir as CWD and an empty allowlist
 * file (via ALLOWLIST_FILE env override). The script's exit code + stderr is the
 * assertion target.
 *
 * Why a tempdir per test: the script uses `git ls-files` to walk source files,
 * which only finds files tracked by the surrounding git repo. Test isolation
 * requires a per-test tracked-file set; `git init` + `git add` in a tempdir
 * delivers that without polluting the real repo.
 */

import { describe, it, expect, beforeAll } from 'vitest'
import { execSync, spawnSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

const SCRIPT_PATH = resolve(__dirname, 'check-fresh-green.sh')

// Helper: create an isolated tempdir-as-git-repo with a single fixture file,
// run the script with that tempdir as CWD + an empty allowlist, return result.
function runScriptOnFixture(fixtureContent: string, fixtureRelPath = 'src/fixture.ts'): {
  status: number | null
  stdout: string
  stderr: string
} {
  const dir = mkdtempSync(join(tmpdir(), 'fresh-green-test-'))
  try {
    // git init (quiet)
    execSync('git init -q', { cwd: dir })
    // configure a noop user so commits work (we don't commit, but git ls-files
    // works without a commit if files are added to the index)
    execSync('git config user.email "test@example.com"', { cwd: dir })
    execSync('git config user.name "Test"', { cwd: dir })

    // Write empty allowlist file
    writeFileSync(join(dir, '.freshgreen-allowlist'), '# empty for tests\n')

    // Write fixture file
    const fixturePath = join(dir, fixtureRelPath)
    mkdirSync(join(dir, 'src'), { recursive: true })
    writeFileSync(fixturePath, fixtureContent)

    // git add so git ls-files picks it up
    execSync(`git add ${fixtureRelPath} .freshgreen-allowlist`, { cwd: dir })

    // Run the script
    const result = spawnSync('bash', [SCRIPT_PATH], {
      cwd: dir,
      env: { ...process.env, ALLOWLIST_FILE: '.freshgreen-allowlist' },
      encoding: 'utf-8',
    })

    return {
      status: result.status,
      stdout: result.stdout,
      stderr: result.stderr,
    }
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

beforeAll(() => {
  // Sanity: the script file must exist before any test runs
  // (vitest catches this as a load-time failure, but explicit check helps debugging)
  expect(SCRIPT_PATH).toMatch(/check-fresh-green\.sh$/)
})

describe('SHELL-05 grep — positive boundary cases (regex MUST flag)', () => {
  // Group 1: hex literals (3 case variants per D-84)
  it('flags hex literal #BFD730 (uppercase)', () => {
    const r = runScriptOnFixture('const c = "#BFD730"')
    expect(r.status).toBe(1)
    expect(r.stderr).toContain('SHELL-05 violation')
  })

  it('flags hex literal #bfd730 (lowercase)', () => {
    const r = runScriptOnFixture('const c = "#bfd730"')
    expect(r.status).toBe(1)
    expect(r.stderr).toContain('SHELL-05 violation')
  })

  it('flags hex literal #bFd730 (mixed case)', () => {
    const r = runScriptOnFixture('const c = "#bFd730"')
    expect(r.status).toBe(1)
    expect(r.stderr).toContain('SHELL-05 violation')
  })

  // Group 2: CSS-var forms
  it('flags var(--color-fresh-green)', () => {
    const r = runScriptOnFixture('const c = "var(--color-fresh-green)"')
    expect(r.status).toBe(1)
    expect(r.stderr).toContain('SHELL-05 violation')
  })

  it('flags var(--color-fresh-green-mute) (suffix variant)', () => {
    const r = runScriptOnFixture('const c = "var(--color-fresh-green-mute)"')
    expect(r.status).toBe(1)
    expect(r.stderr).toContain('SHELL-05 violation')
  })

  it('flags var(--color-fresh-green-glow) (suffix variant)', () => {
    const r = runScriptOnFixture('const c = "var(--color-fresh-green-glow)"')
    expect(r.status).toBe(1)
    expect(r.stderr).toContain('SHELL-05 violation')
  })

  // Group 3: Tailwind utilities — base prefixes
  it('flags Tailwind utility bg-fresh-green', () => {
    const r = runScriptOnFixture('const c = "bg-fresh-green"')
    expect(r.status).toBe(1)
    expect(r.stderr).toContain('SHELL-05 violation')
  })

  it('flags Tailwind utility bg-fresh-green-mute (suffix variant)', () => {
    const r = runScriptOnFixture('const c = "bg-fresh-green-mute"')
    expect(r.status).toBe(1)
    expect(r.stderr).toContain('SHELL-05 violation')
  })

  it('flags Tailwind utility bg-fresh-green-glow (suffix variant)', () => {
    const r = runScriptOnFixture('const c = "bg-fresh-green-glow"')
    expect(r.status).toBe(1)
    expect(r.stderr).toContain('SHELL-05 violation')
  })

  // Group 4: arbitrary-value forms (3 sub-variants per D-84)
  it('flags arbitrary-value with hex bg-[#BFD730]', () => {
    const r = runScriptOnFixture('const c = "bg-[#BFD730]"')
    expect(r.status).toBe(1)
    expect(r.stderr).toContain('SHELL-05 violation')
  })

  it('flags arbitrary-value with var bg-[var(--color-fresh-green)]', () => {
    const r = runScriptOnFixture('const c = "bg-[var(--color-fresh-green)]"')
    expect(r.status).toBe(1)
    expect(r.stderr).toContain('SHELL-05 violation')
  })

  it('flags arbitrary-value with rgba bg-[rgba(191,215,48,0.3)]', () => {
    const r = runScriptOnFixture('const c = "bg-[rgba(191,215,48,0.3)]"')
    expect(r.status).toBe(1)
    expect(r.stderr).toContain('SHELL-05 violation')
  })

  // Group 5: inline rgba (the prototype's mode-switcher dashed border tint form)
  it('flags inline rgba(191,215,48,0.3)', () => {
    const r = runScriptOnFixture('const c = "rgba(191,215,48,0.3)"')
    expect(r.status).toBe(1)
    expect(r.stderr).toContain('SHELL-05 violation')
  })

  // Group 6: opacity modifier (RESEARCH §3 extension)
  it('flags opacity modifier bg-fresh-green/30 (RESEARCH §3 extension)', () => {
    const r = runScriptOnFixture('const c = "bg-fresh-green/30"')
    expect(r.status).toBe(1)
    expect(r.stderr).toContain('SHELL-05 violation')
  })

  // Group 7: extended Tailwind prefixes (RESEARCH §3 extension)
  it('flags via-fresh-green (RESEARCH §3 extension)', () => {
    const r = runScriptOnFixture('const c = "via-fresh-green"')
    expect(r.status).toBe(1)
    expect(r.stderr).toContain('SHELL-05 violation')
  })

  it('flags decoration-fresh-green + ring-offset-fresh-green + inset-shadow-fresh-green (combined; RESEARCH §3 extensions)', () => {
    const r = runScriptOnFixture(
      'const c = "decoration-fresh-green ring-offset-fresh-green inset-shadow-fresh-green"',
    )
    expect(r.status).toBe(1)
    expect(r.stderr).toContain('SHELL-05 violation')
  })
})

describe('SHELL-05 grep — negative cases (regex MUST NOT flag)', () => {
  it('does not flag unrelated string "freshly-greened" (word boundary)', () => {
    const r = runScriptOnFixture('const note = "freshly-greened"')
    expect(r.status).toBe(0)
    expect(r.stderr).not.toContain('SHELL-05 violation')
  })

  it('does not flag a different namespace token (bg-fresh-mint)', () => {
    const r = runScriptOnFixture('const c = "bg-fresh-mint"')
    expect(r.status).toBe(0)
    expect(r.stderr).not.toContain('SHELL-05 violation')
  })
})

describe('SHELL-05 grep — allowlist behavior', () => {
  it('exempts a file when its path is in the allowlist', () => {
    // Manually craft a tempdir with a fresh-green hit + that file allowlisted
    const dir = mkdtempSync(join(tmpdir(), 'fresh-green-allowlist-'))
    try {
      execSync('git init -q', { cwd: dir })
      execSync('git config user.email "test@example.com"', { cwd: dir })
      execSync('git config user.name "Test"', { cwd: dir })

      // Allowlist explicitly exempts src/allowed.ts
      writeFileSync(join(dir, '.freshgreen-allowlist'), 'src/allowed.ts\n')

      // src/allowed.ts contains a fresh-green hit
      mkdirSync(join(dir, 'src'), { recursive: true })
      writeFileSync(join(dir, 'src/allowed.ts'), 'const c = "#BFD730"\n')

      execSync('git add src/allowed.ts .freshgreen-allowlist', { cwd: dir })

      const result = spawnSync('bash', [SCRIPT_PATH], {
        cwd: dir,
        env: { ...process.env, ALLOWLIST_FILE: '.freshgreen-allowlist' },
        encoding: 'utf-8',
      })

      expect(result.status).toBe(0)
      expect(result.stderr).not.toContain('SHELL-05 violation')
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})
```

Conventions:
- Multi-line JSDoc file header naming the file + decision IDs covered (matches `lib/api.mock.test.ts:1-13`)
- Explicit imports of `describe`, `it`, `expect` (Phase 3 Vitest `globals: false`)
- `import { execSync, spawnSync } from 'node:child_process'` (use `spawnSync` for capturing exit code reliably)
- `import { mkdtempSync, ... } from 'node:fs'` and `import { join, resolve } from 'node:path'` (Node built-ins, no devDeps needed)
- Tempdir-per-test pattern via `mkdtempSync(tmpdir())` — cleaned up in `try/finally`
- 3 describe blocks: positive cases, negative cases, allowlist behavior
- 16 positive cases as separate `it()` blocks (combined-string fixture for the 4 RESEARCH §3 extension prefixes counts as 1 test that checks all 4 in one call)
- 2 negative cases as separate `it()` blocks
- 1 allowlist-behavior test that exercises the whole exempt-path code path
- Use `result.status` (not stdout/stderr) as the primary assertion target — the exit code is the contract; the stderr message is helpful for debugging

Why this is sized correctly: 19 test cases (16 positive + 2 negative + 1 allowlist) × ~10 LOC each + 1 helper function = ~250 LOC test file. Vitest jsdom environment is fine (the test doesn't render any DOM; it spawns child processes). All tests run in <5 seconds total.
  </action>
  <verify>
    <automated>
test -f .freshgreen-allowlist && grep -q "components/primitives/AIPulseDot.tsx" .freshgreen-allowlist && grep -q "components/primitives/StatusChip.tsx" .freshgreen-allowlist && grep -q "components/shell/RisingMark.tsx" .freshgreen-allowlist && grep -q "app/dev/primitives/page.tsx" .freshgreen-allowlist && grep -q "components/primitives/AIBadge.tsx" .freshgreen-allowlist && [ "$(grep -v '^#' .freshgreen-allowlist | grep -v '^$' | wc -l | tr -d ' ')" = "5" ] && test -f scripts/check-fresh-green.sh && grep -q "set -euo pipefail" scripts/check-fresh-green.sh && grep -q "via|outline|fill|stroke" scripts/check-fresh-green.sh && grep -q "ring-offset" scripts/check-fresh-green.sh && grep -q "inset-shadow" scripts/check-fresh-green.sh && grep -q "decoration" scripts/check-fresh-green.sh && grep -q '/\[0-9\]+' scripts/check-fresh-green.sh && test -f scripts/check-fresh-green.test.ts && bash scripts/check-fresh-green.sh && npm run test -- scripts/check-fresh-green.test.ts && npm run typecheck && npm run lint
    </automated>
  </verify>
  <acceptance_criteria>
    - File `.freshgreen-allowlist` exists at repo root
    - `.freshgreen-allowlist` first line is `# SHELL-05 reserves Fresh Green (#BFD730) for AI-authored output and`
    - `.freshgreen-allowlist` contains exactly the D-86 7-line comment header verbatim (lines 1–7) followed by 1 blank line + 5 path entries
    - `.freshgreen-allowlist` contains exactly 5 non-blank non-comment lines: `components/primitives/AIPulseDot.tsx`, `components/primitives/AIBadge.tsx`, `components/primitives/StatusChip.tsx`, `components/shell/RisingMark.tsx`, `app/dev/primitives/page.tsx`
    - `.freshgreen-allowlist` contains NO speculative globs (no `**`, no `*` patterns)
    - File `scripts/check-fresh-green.sh` exists
    - `scripts/check-fresh-green.sh` first line is `#!/usr/bin/env bash`
    - `scripts/check-fresh-green.sh` contains `set -euo pipefail`
    - `scripts/check-fresh-green.sh` PATTERNS array contains all 5 patterns: hex `\b#[Bb][Ff][Dd]7[3]0\b`, css-var `--color-fresh-green(-[a-z0-9]+)?`, Tailwind utilities (extended), arbitrary-value, rgba inline
    - `scripts/check-fresh-green.sh` Tailwind utilities pattern (pattern 3) includes the 4 RESEARCH §3 extensions: `via`, `decoration`, `ring-offset`, `inset-shadow`
    - `scripts/check-fresh-green.sh` Tailwind utilities pattern (pattern 3) includes optional opacity modifier `(/[0-9]+)?`
    - `scripts/check-fresh-green.sh` reads `ALLOWLIST_FILE` env var with default `.freshgreen-allowlist`
    - `scripts/check-fresh-green.sh` uses `git ls-files` (NOT `find`) to walk source files
    - `scripts/check-fresh-green.sh` exits 0 when no violations; exits 1 when at least one violation
    - `scripts/check-fresh-green.sh` is executable (`-x` bit set)
    - When run on the live repo (CWD = repo root), `bash scripts/check-fresh-green.sh` exits 0 (all 5 retrofits applied + 5 allowlisted files exempt)
    - File `scripts/check-fresh-green.test.ts` exists
    - `scripts/check-fresh-green.test.ts` has exactly 3 `describe` blocks: positive boundary cases, negative cases, allowlist behavior
    - `scripts/check-fresh-green.test.ts` has at least 16 positive-case `it()` blocks (one per fixture from the boundary-case map)
    - `scripts/check-fresh-green.test.ts` has at least 2 negative-case `it()` blocks
    - `scripts/check-fresh-green.test.ts` has at least 1 allowlist-behavior `it()` block
    - `scripts/check-fresh-green.test.ts` uses `spawnSync('bash', [SCRIPT_PATH], ...)` to invoke the script (NOT `execSync` since exit-code capture matters)
    - `scripts/check-fresh-green.test.ts` uses `mkdtempSync` + `git init` per test for isolation
    - `npm run test -- scripts/check-fresh-green.test.ts` exits 0 (all tests pass)
    - `npm run typecheck` exits 0
    - `npm run lint` exits 0
  </acceptance_criteria>
  <done>SHELL-05 enforcement infrastructure exists: allowlist + bash script + Vitest fixtures all wired and passing. The script exits 0 on the live repo (no unallowlisted fresh-green); the test exercises every D-84 + RESEARCH §3 boundary case.</done>
</task>

<task type="auto">
  <name>Task 2: Wire CI 4th job + package.json check:fresh-green script (Pattern M', enables required status check)</name>
  <read_first>
    - .github/workflows/ci.yml (current state — verbatim 49 lines; Phase 4 appends a 4th job after line 49)
    - package.json (current scripts block — verify `check:fresh-green` does not already exist)
    - .planning/phases/04-app-shell-primitives/04-RESEARCH.md §7.2 (lines 1326–1354) — 4th-job recommendation + exact YAML
    - .planning/phases/04-app-shell-primitives/04-RESEARCH.md §"Pitfall 6: Forgetting to register Phase 4 grep CI job in branch protection" (lines 511–519) — manual GitHub UI step
    - .planning/phases/04-app-shell-primitives/04-PATTERNS.md §".github/workflows/ci.yml" (lines 839–870) — exact YAML appendage + indentation
    - .planning/phases/04-app-shell-primitives/04-PATTERNS.md §"package.json" (lines 888–918) — devDep + script notes
    - .planning/phases/04-app-shell-primitives/04-PATTERNS.md §"Pattern M' (4th top-level CI job)" (lines 973–977)
    - .planning/phases/02-scaffolding/02-PATTERNS.md §"Pattern D" (line 475 + surrounding) — third-job pattern this extends
    - scripts/check-fresh-green.sh (created in Task 1) — verify it exists and runs
  </read_first>
  <files>.github/workflows/ci.yml, package.json</files>
  <action>
Two file edits + one documented manual follow-up step.

***

**Edit 1 — `.github/workflows/ci.yml`** — append 4th top-level job `fresh-green` AFTER line 49 (after the existing `test` job's last `- run: npm run test` line).

Current state (lines 39–49 of ci.yml):
```yaml
  test:
    name: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: '.nvmrc'
          cache: 'npm'
      - run: npm ci
      - run: npm run test
```

After the change, the file will end with these new lines (preserve existing trailing newline, add new job + trailing newline):

```yaml
  fresh-green:
    name: fresh-green
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: bash scripts/check-fresh-green.sh
```

EXACT indentation:
- 2 spaces for the job key (`fresh-green:`) — matches `typecheck:`, `lint:`, `test:`
- 4 spaces for inner keys (`name:`, `runs-on:`, `steps:`)
- 6 spaces for the `-` of each step list item

CRITICAL — what to OMIT from this job (and why):
- NO `actions/setup-node@v4` step — bash + git ls-files + grep are baseline on `ubuntu-latest`; Node not needed
- NO `npm ci` step — no Node deps consumed by the script
- NO `cache: 'npm'` — no Node setup at all
- NO `working-directory` override — the runner's default CWD (the repo root checkout) is correct
- NO `if:` condition — runs on every push/PR like the other 3 jobs
- NO matrix strategy — single job, single run

This is the Pattern M' from PATTERNS.md (4th top-level CI job; never matrix steps). Total runtime <30 seconds (the script is sub-second; checkout + setup overhead is the bulk).

The 4 jobs (typecheck, lint, test, fresh-green) all run in parallel because they declare no `needs:` dependency on each other. On a PR, all 4 surface as 4 distinct status checks in the GitHub PR check-run UI.

***

**Edit 2 — `package.json`** — add `check:fresh-green` script entry inside the `scripts` block.

Current scripts block (lines 8–16 of package.json):
```json
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run --passWithNoTests",
    "test:watch": "vitest"
  },
```

After the change (add a comma after `"test:watch": "vitest"` and a new line for `check:fresh-green`):

```json
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run --passWithNoTests",
    "test:watch": "vitest",
    "check:fresh-green": "bash scripts/check-fresh-green.sh"
  },
```

CRITICAL JSON syntax: Node tooling tolerates trailing commas in some contexts but `package.json` is parsed by strict JSON parsers; do NOT add a trailing comma after the last entry.

After this edit:
- `npm run check:fresh-green` invokes the same exact command CI runs
- Kit can run it locally before pushing; CI will produce the same result
- Other plans (e.g., 04-01 Vitest devDeps) may have already added new entries to `scripts` or `devDependencies` — verify current file state with Read tool BEFORE editing, and merge non-conflicting changes properly. The change locus is the `scripts` block; do NOT modify `devDependencies` in this task.

***

**Documented manual GitHub UI follow-up step (NOT executed in this plan):**

After this PR merges to `main`:

1. Wait for the first CI run on `main` to include the new `fresh-green` job (verifies the workflow is valid YAML + the script runs successfully).
2. Visit GitHub → repo Settings → Branches → Branch protection rule for `main`.
3. In the "Require status checks to pass before merging" section, click "Add status check" and select `fresh-green` from the list of recently-run checks.
4. Save the rule.

This step is a Phase 2 D-39 echo: status checks must run at least once before they're available to add to branch protection. The same first-run-then-protect sequence Phase 2 used for `typecheck`, `lint`, `test` applies here.

Per RESEARCH §"Pitfall 6", this step is NOT blocking PR merge for Phase 4 — the `fresh-green` job already runs on the PR (as does typecheck/lint/test). Branch-protection enforcement is a follow-up that prevents future PRs from merging if `fresh-green` fails. Until the manual step is done, branch protection still has 4 required checks (typecheck + lint + test + Vercel) — `fresh-green` is just an advisory check.

This task does NOT execute the manual step (it requires GitHub UI access and admin permissions). Document it in the SUMMARY.md (handled by /gsd-execute-phase via the `<output>` block) so the user knows to do it post-merge.
  </action>
  <verify>
    <automated>
test -f .github/workflows/ci.yml && grep -q "  fresh-green:" .github/workflows/ci.yml && grep -q "name: fresh-green" .github/workflows/ci.yml && grep -q "bash scripts/check-fresh-green.sh" .github/workflows/ci.yml && [ "$(grep -c "name:" .github/workflows/ci.yml)" = "4" ] && test -f package.json && grep -q '"check:fresh-green"' package.json && grep -q '"check:fresh-green": "bash scripts/check-fresh-green.sh"' package.json && node -e "JSON.parse(require('fs').readFileSync('package.json'))" && npm run check:fresh-green && npm run typecheck && npm run lint
    </automated>
  </verify>
  <acceptance_criteria>
    - `.github/workflows/ci.yml` has a 4th top-level job `fresh-green` (verifiable: 4 occurrences of `name:` in the file — was 3 before)
    - The `fresh-green` job has `name: fresh-green` and `runs-on: ubuntu-latest`
    - The `fresh-green` job has exactly 2 steps: `actions/checkout@v4` and `bash scripts/check-fresh-green.sh`
    - The `fresh-green` job has NO `setup-node` step
    - The `fresh-green` job has NO `npm ci` step
    - The `fresh-green` job has NO `if:` condition
    - YAML indentation matches existing jobs (2-space for job key, 4-space for inner keys, 6-space for steps list)
    - `package.json` is valid JSON (parses with `node -e "JSON.parse(require('fs').readFileSync('package.json'))"` exit 0)
    - `package.json` `scripts` block contains `"check:fresh-green": "bash scripts/check-fresh-green.sh"`
    - `npm run check:fresh-green` exits 0 (the live repo has no unallowlisted fresh-green hits)
    - `npm run typecheck` exits 0
    - `npm run lint` exits 0
    - `package.json` `devDependencies` block is UNMODIFIED by this task (Plan 04-01 already added jsdom + testing-library entries; this task only touches `scripts`)
    - The manual GitHub UI follow-up step (add `fresh-green` to required status checks) is documented in the plan's task action — NOT executed in this task. The SUMMARY.md (created by /gsd-execute-phase) will surface this for the user.
  </acceptance_criteria>
  <done>CI 4th job `fresh-green` wired in `.github/workflows/ci.yml`; `npm run check:fresh-green` script wired in `package.json`; both invocation paths run the same bash script; manual GitHub UI step documented for post-merge follow-up.</done>
</task>

<task type="auto">
  <name>Task 3: Amend REQUIREMENTS.md SHELL-04 wording (5→8 primitive drift per D-72) + add CLAUDE.md enforcement pointer</name>
  <read_first>
    - .planning/REQUIREMENTS.md lines 35–41 (SHELL section) — current SHELL-04 wording verbatim
    - .planning/REQUIREMENTS.md lines 115–127 (Phase Mapping table for SHELL rows) — verify table format
    - .planning/phases/04-app-shell-primitives/04-CONTEXT.md D-72 (line 46) — drift recording requirement
    - .planning/phases/04-app-shell-primitives/04-PATTERNS.md §".planning/REQUIREMENTS.md" (lines 874–884) — reword vs split decision
    - CLAUDE.md lines 73–77 — current Design system section (typography + colors + critical rule)
    - CLAUDE.md lines 1–10 — confirm it's a project-instructions file read every session
    - .planning/phases/04-app-shell-primitives/04-CONTEXT.md "Files this phase modifies" — REQUIREMENTS.md amendment listed
  </read_first>
  <files>.planning/REQUIREMENTS.md, CLAUDE.md</files>
  <action>
Two documentation edits.

***

**Edit 1 — `.planning/REQUIREMENTS.md` SHELL-04 amendment (D-72 reword approach)**

The decision per D-72: pick ONE of (a) reword OR (b) split. **Plan 04-11 picks (a) reword.** Rationale (locks here for the executor):

- Reword keeps the requirement ID `SHELL-04` stable.
- The Phase Mapping table at lines 122–126 of REQUIREMENTS.md uses `SHELL-04` as the key — splitting into SHELL-04 + SHELL-04a would force a new row in the table + a renumbering cascade for any downstream tooling that consumes the requirement IDs.
- Reword surfaces the drift (5→8) in the requirement text itself, which is what D-72 says is necessary ("silent scope extension is worse than wrong decision").
- Both options satisfy D-72; reword is the lower-overhead choice.

Current line 40 of REQUIREMENTS.md (verbatim):
```
- [ ] **SHELL-04**: Shared primitives exist and are exported from `components/primitives/`: `Eyebrow`, `StatusChip`, `StagePill`, `AIPulseDot`, `ActionCard`
```

Replace with this NEW line (single bullet, no checkbox change — still `- [ ]`):
```
- [ ] **SHELL-04**: Shared primitives exist and are exported from `components/primitives/`. Phase 4 ships **5 brand primitives + 3 infrastructure primitives = 8** (drift from the original 5 recorded per Phase 4 D-72): brand = `Eyebrow`, `StatusChip`, `StagePill`, `AIPulseDot`, `AIBadge`, `ActionCard`; infrastructure = `Icon`, `Avatar`. (`AIBadge` was derived during prototype port; `Icon` and `Avatar` are infrastructure primitives the brand set composes.)
```

CRITICAL: do NOT modify lines 35–39 (SHELL-01..03 stay unchanged), do NOT modify line 41 (SHELL-05 stays unchanged). Edit only line 40.

CRITICAL: the Phase Mapping table at lines 122–126 of REQUIREMENTS.md stays UNCHANGED. The row `| SHELL-04 | Phase 4: App Shell & Primitives | Pending |` stays as-is. Status flips to "Complete" at the end of Phase 4 (handled by /gsd-verify-work, not this plan).

The wording "5 brand primitives + 3 infrastructure primitives = 8" is verbatim from CONTEXT D-72 line 46 — do not paraphrase.

The expanded brand subset list contains 6 names (Eyebrow, StatusChip, StagePill, AIPulseDot, AIBadge, ActionCard) — that is intentional. The CONTEXT D-72 phrasing groups AIBadge with the brand set even though the headline count is "5"; the parenthetical at the end of the new wording explains AIBadge as "derived during prototype port". Reading the full sentence makes the count consistent: brand = 6 (5 originally named + 1 derived AIBadge), infrastructure = 2 (Icon + Avatar) — total = 8. The "5 + 3" headline phrasing is the lexical summary; the parenthetical is the audit trail.

(If a checker objects to the 6 vs "5 brand" count: this is the literal D-72 text. Per the planner authority limits, this plan does not re-litigate D-72; it implements it.)

***

**Edit 2 — `CLAUDE.md` Design system pointer**

Current Design system section (lines 73–77 verbatim):
```
## Design system (locked — do not deviate)

- **Typography**: Fraunces (display, numerals) · Inter Tight (UI body) · Noto Sans JP (Japanese) · IBM Plex Mono (data, timestamps, IDs, eyebrows)
- **Colors**: Trad Green `#004832` · Fresh Green `#BFD730` · warm paper `#FAFBF7`
- **Critical rule**: Fresh Green is reserved **exclusively** for AI outputs and AI presence. Do not use it for generic accents or primary buttons.
```

After the edit (insert ONE new bullet IMMEDIATELY after the existing "Critical rule" bullet, BEFORE the blank line that separates this section from the next):

```
## Design system (locked — do not deviate)

- **Typography**: Fraunces (display, numerals) · Inter Tight (UI body) · Noto Sans JP (Japanese) · IBM Plex Mono (data, timestamps, IDs, eyebrows)
- **Colors**: Trad Green `#004832` · Fresh Green `#BFD730` · warm paper `#FAFBF7`
- **Critical rule**: Fresh Green is reserved **exclusively** for AI outputs and AI presence. Do not use it for generic accents or primary buttons.
- **Enforcement**: Fresh Green usage is mechanically policed by `scripts/check-fresh-green.sh` (run by the `fresh-green` CI job). Allowlisted exceptions live in `.freshgreen-allowlist` at the repo root. Adding an entry there requires architectural review.
```

CRITICAL: keep the addition to ONE bullet only. CLAUDE.md is read at every Claude session start; brevity matters. Do NOT add a sub-bullet list, do NOT expand into D-82..D-88 detail, do NOT cite the boundary-case map. The bullet's purpose is discovery — "you can find the enforcement here" — not documentation.

CRITICAL: do NOT modify the existing 3 bullets (Typography, Colors, Critical rule). Edit only by APPENDING the new "Enforcement" bullet as the 4th item in the list.

CRITICAL: do NOT touch any other section of CLAUDE.md. The Stack contract section (lines 14–28), Scaffolding ownership (lines 30–40), Working principles (lines 42–50), Personas (lines 52–55), Hero scenario (lines 57–60), The six stages (lines 62–71), Reference docs (lines 79–86), Non-goals (lines 88–93), How to run (lines 95–105) all stay byte-identical.

***

**Why these documentation edits ship in the same plan:**

- Both are small (~1-paragraph changes)
- Both record outcomes of the SHELL-05 enforcement work that the OTHER tasks in this plan introduce
- Both are tightly coupled to D-72 (REQUIREMENTS.md drift) and D-86 (allowlist visibility for future Claude sessions)
- Splitting into two tasks would add overhead without isolation benefit (they don't conflict, neither blocks the other)

The amendments are conservative: no new requirement IDs, no new design system rules, no scope expansion. Pure documentation alignment with what plans 04-01 through 04-10 + Tasks 1+2 of this plan have already shipped.
  </action>
  <verify>
    <automated>
grep -q "5 brand primitives + 3 infrastructure primitives = 8" .planning/REQUIREMENTS.md && grep -q "drift from the original 5 recorded per Phase 4 D-72" .planning/REQUIREMENTS.md && grep -q "AIBadge.*Icon.*Avatar\|Icon.*Avatar" .planning/REQUIREMENTS.md && [ "$(grep -c "^- \[ \] \*\*SHELL-" .planning/REQUIREMENTS.md)" = "5" ] && grep -q "| SHELL-04 | Phase 4: App Shell & Primitives | Pending |" .planning/REQUIREMENTS.md && grep -q "Fresh Green usage is mechanically policed by" CLAUDE.md && grep -q ".freshgreen-allowlist" CLAUDE.md && grep -q "scripts/check-fresh-green.sh" CLAUDE.md && grep -q "Fresh Green is reserved \*\*exclusively\*\* for AI outputs and AI presence" CLAUDE.md && [ "$(grep -c "^- \*\*" CLAUDE.md | head -1)" -ge "12" ] && bash scripts/check-fresh-green.sh && npm run check:fresh-green
    </automated>
  </verify>
  <acceptance_criteria>
    - `.planning/REQUIREMENTS.md` line for SHELL-04 contains literal phrase `5 brand primitives + 3 infrastructure primitives = 8` (verbatim from D-72 / CONTEXT line 46)
    - `.planning/REQUIREMENTS.md` line for SHELL-04 mentions `AIBadge`, `Icon`, `Avatar` (the 3 derived/infrastructure additions)
    - `.planning/REQUIREMENTS.md` line for SHELL-04 cites `D-72` (audit trail)
    - `.planning/REQUIREMENTS.md` SHELL section (lines around 35–41) still has 5 SHELL-* checkbox bullets (SHELL-01..05) — no row was added or removed
    - `.planning/REQUIREMENTS.md` Phase Mapping table row `| SHELL-04 | Phase 4: App Shell & Primitives | Pending |` stays exactly as-is (no renumbering, no SHELL-04a row added)
    - `.planning/REQUIREMENTS.md` SHELL-01..03 + SHELL-05 wording is byte-identical to the previous version (only SHELL-04's text changes)
    - `CLAUDE.md` Design system section has 4 bullets (Typography, Colors, Critical rule, Enforcement) — was 3 before
    - `CLAUDE.md` new Enforcement bullet contains `scripts/check-fresh-green.sh`
    - `CLAUDE.md` new Enforcement bullet contains `.freshgreen-allowlist`
    - `CLAUDE.md` new Enforcement bullet mentions architectural review requirement
    - `CLAUDE.md` Critical rule bullet is byte-identical to the previous version (the new Enforcement bullet appends, does not replace)
    - `CLAUDE.md` sections OUTSIDE the Design system section are byte-identical (Stack contract, Scaffolding ownership, Working principles, Personas, Hero scenario, Six stages, Reference docs, Non-goals, How to run all unchanged)
    - `bash scripts/check-fresh-green.sh` exits 0 (the SHELL-05 grep doesn't fire on the documentation edits — `--color-fresh-green` and `#BFD730` mentions in REQUIREMENTS.md / CLAUDE.md are in `.md` files which the script's source-extension filter excludes)
    - `npm run check:fresh-green` exits 0
  </acceptance_criteria>
  <done>SHELL-04 drift recorded in REQUIREMENTS.md per D-72 reword approach; CLAUDE.md Design system section has a discovery-pointer to the enforcement files; both edits are minimal, byte-precise, and don't trigger the SHELL-05 grep (md files are excluded from the source-extension filter).</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| Developer source code → CI runner | Push events trigger CI; the bash script runs against tracked source files |
| CLI invocation → bash script | `npm run check:fresh-green` and `bash scripts/check-fresh-green.sh` both reach the same script; ALLOWLIST_FILE env override is the only configuration surface |
| Vitest fixture → bash script (subprocess) | Test isolates fixtures via tempdir + git init; `spawnSync` captures exit code + stderr |

## STRIDE Threat Register (ASVS L1, security_enforcement: block on high)

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-04-11-01 | Tampering / V14 Configuration | `.freshgreen-allowlist` (allowlist could be widened to exempt files that should be enforced) | mitigate | D-86 self-documenting comment header explains the policy; widening requires PR (visible in git history; reviewable by Kit). Per D-87, files with mixed branches (StatusChip kind='ai' is the only branch allowed to use fresh-green) get unit tests as a second line of defense — those tests live in plan 04-06 and verify each kind's rendered token. |
| T-04-11-02 | Tampering / V14 Configuration | Branch protection (until manual GitHub UI step) — without `fresh-green` in required checks, a regression could merge | accept | The CI job runs on every PR regardless of branch protection. Branch protection enforcement is a post-merge follow-up step explicitly documented in Task 2's action. Risk window: the time between Phase 4 PR merge and Kit's manual GitHub UI step. Acceptable because (a) Kit reviews every PR, (b) the script is advisory immediately, (c) the manual step is one-click. Documented in the SUMMARY for this plan. |
| T-04-11-03 | Tampering / V14 Configuration | Bypass via Tailwind utility prefix not in regex (e.g., a Tailwind v5 future prefix) | mitigate | RESEARCH §3 audit identified 4 prefix gaps (`via`, `decoration`, `ring-offset`, `inset-shadow`) and the opacity-modifier gap; all extensions are baked into the script's pattern array. The Vitest fixture in Task 1 includes one positive case for each extension — if the regex regresses, the fixture test fails. New Tailwind major versions adding new color-utility prefixes would need a re-audit; flagged as a deferred concern (NOT blocking — the comment in the script flags `TODO` for that case). |
| T-04-11-04 | Tampering / V5 Input Validation | Bash script command injection via fixture file content | accept | The script does NOT eval / interpret file contents — `grep -E -n` reads files as plain text and regex-matches. No `eval`, no `$(...)` on file content, no `bash -c "$content"`. File paths come from `git ls-files` (tracked source — not user input). Safe. |
| T-04-11-05 | Tampering / V14 Configuration | Test fixture pollutes real repo state | mitigate | Vitest fixtures use `mkdtempSync()` per test + `git init` in tempdir + `try/finally rmSync recursive`. Real repo's `.git/` is never touched. The `git init` call is in the tempdir, not the surrounding repo. Verified by review of the test code structure (Task 1 action's exact code). |
| T-04-11-06 | Information Disclosure | The bash script's stderr output prints fixture content + grep matches; could leak fresh-green-adjacent code patterns from private files | accept | The script ONLY scans tracked source files (`git ls-files`). Repo is public-by-design (prototype demo; no secrets per CLAUDE.md "Non-goals"). NEXT_PUBLIC_* env vars are intentionally client-bundled. There's no private content for the script to leak. Stderr output is intended for the developer / CI logs. |
| T-04-11-07 | Denial of Service | Script runs on every PR; could slow CI | accept | RESEARCH §7.1 measured the script as sub-second; the 4th job's bottleneck is checkout (~5s) not grep (~500ms). Total <30s per RESEARCH §7.2. Negligible CI cost. |
| T-04-11-08 | V14 Configuration | `find` / `git ls-files` could miss files in unexpected locations | mitigate | Script uses `git ls-files` (NOT `find`) which natively respects `.gitignore` AND only returns tracked files. Future files added to a `.gitignored` directory would be skipped — but they wouldn't be shipped either, so SHELL-05 doesn't apply. Files added to the repo but not yet `git add`-ed would be skipped on the developer's machine but caught in CI (where the `actions/checkout@v4` step provides a clean tracked tree). |

**ASVS L1 mapping confirmed via RESEARCH §"Security Domain" Phase 4 verdict (line 685):** "No additional security controls beyond verifying that (a) the env var gate is correctly scoped at Vercel, and (b) no user-controlled data passes through any primitive." This plan adds NO new user input surfaces (the bash script reads tracked files; the test reads fixture strings; no user input to validate). V5 / V8 / V2-V9 are not active. V14 (Configuration) is the only active control — covered by T-04-11-01, T-04-11-02, T-04-11-03 above.

**No high-severity threats.** All threats are mitigate or accept; none require disposition `transfer`. Plan ships.
</threat_model>

<verification>
After all 3 tasks land:

1. **`bash scripts/check-fresh-green.sh`** exits 0 — the live repo has zero unallowlisted fresh-green hits (5 retrofits applied by plans 04-08, 04-09, 04-10; 5 files allowlisted by Task 1).
2. **`npm run check:fresh-green`** exits 0 — same script invoked via the package.json shortcut; matches Task 2's wiring.
3. **`npm run test`** full suite exits 0 — includes `scripts/check-fresh-green.test.ts` with 19 test cases (16 positive + 2 negative + 1 allowlist-behavior); all pass.
4. **`npm run typecheck`** exits 0 — no type drift; the test file uses Node built-ins + Vitest types.
5. **`npm run lint`** exits 0 — ESLint flat config + Prettier rules followed.
6. **`npm run build`** exits 0 — no production-bundle regression.
7. **CI workflow valid YAML** — `node -e "console.log(require('js-yaml').load(require('fs').readFileSync('.github/workflows/ci.yml', 'utf-8')))"` parses without error (or rely on GitHub's CI run as the canonical validator).
8. **REQUIREMENTS.md SHELL-04** wording amended; SHELL-04 row in the Phase Mapping table unchanged.
9. **CLAUDE.md** has 4 bullets in the Design system section (was 3); pointer to enforcement files present.
10. **Manual follow-up** documented in Task 2's action: post-merge, add `fresh-green` to required status checks via GitHub Settings → Branches → main.

The phase-gate command from VALIDATION.md §"Sampling Rate" (line 33) — `npm run typecheck && npm run lint && npm run test && npm run build && bash scripts/check-fresh-green.sh` — exits 0 in full after this plan ships.

Plus manual visual checks (also from VALIDATION.md §"Sampling Rate"):
- Open `npm run dev`, set browser to 1440px
- Verify TopStrip renders on `/`, `/journey`, `/cockpit`, `/dev/primitives`
- Verify ModeSwitcher appears with `NEXT_PUBLIC_SHOW_MODE_SWITCHER=true` and is hidden when unset
- Verify `/dev/primitives` renders all 8 primitives in all states
- Verify the 5 retrofit sites (TopStrip Avatar, mail-icon dot, mode-switcher dashed border + DEMO eyebrow, sidebar active-route dot) render the replacement tokens correctly (no broken UI)

These manual checks are NOT this plan's responsibility — plans 04-08, 04-09, 04-10 own them — but they're listed here as the phase-gate completion criteria.
</verification>

<success_criteria>
- [ ] Task 1: `.freshgreen-allowlist` exists at repo root with the D-86 7-line comment header verbatim + 5 D-85 entries (no globs, no extras)
- [ ] Task 1: `scripts/check-fresh-green.sh` exists, executable, with `set -euo pipefail`, the 5-pattern array including the 4 RESEARCH §3 prefix extensions + opacity modifier, `git ls-files`-based file walking, allowlist-respecting skip logic
- [ ] Task 1: `scripts/check-fresh-green.test.ts` exists with 16 positive + 2 negative + 1 allowlist-behavior `it()` blocks; all pass under `npm run test`
- [ ] Task 1: `bash scripts/check-fresh-green.sh` run on the live repo exits 0 (no unallowlisted fresh-green hits)
- [ ] Task 2: `.github/workflows/ci.yml` has a 4th top-level `fresh-green` job (no `setup-node`, no `npm ci`; just `actions/checkout@v4` + `bash scripts/check-fresh-green.sh`)
- [ ] Task 2: `package.json` `scripts` block has `"check:fresh-green": "bash scripts/check-fresh-green.sh"`; `package.json` is valid JSON; `npm run check:fresh-green` exits 0
- [ ] Task 2: Manual GitHub UI follow-up step documented (NOT executed in this plan)
- [ ] Task 3: REQUIREMENTS.md SHELL-04 reworded with the literal "5 brand primitives + 3 infrastructure primitives = 8" phrase + AIBadge/Icon/Avatar mentioned + D-72 cited; Phase Mapping table row for SHELL-04 unchanged
- [ ] Task 3: CLAUDE.md Design system section has 4 bullets (Typography, Colors, Critical rule, Enforcement); the Enforcement bullet points to `scripts/check-fresh-green.sh` + `.freshgreen-allowlist`
- [ ] Phase-gate command `npm run typecheck && npm run lint && npm run test && npm run build && bash scripts/check-fresh-green.sh` exits 0
- [ ] SHELL-05 success criterion (verbatim from ROADMAP line 92) is mechanically verifiable: "Fresh Green #BFD730 appears only on AIPulseDot and AI-output surfaces; a lint rule, grep check, or visual audit confirms it is absent from primary buttons and non-AI surfaces"
- [ ] All 4 CI jobs (typecheck, lint, test, fresh-green) pass on the PR
- [ ] No fresh-green tokens leak outside the 5 allowlisted files (verifiable: `bash scripts/check-fresh-green.sh` exits 0)
- [ ] `<threat_model>` block addresses V14 Configuration threats (T-04-11-01, T-04-11-02, T-04-11-03) and confirms no high-severity threats; all dispositions are mitigate or accept
</success_criteria>

<output>
After completion, create `.planning/phases/04-app-shell-primitives/04-11-SUMMARY.md`.

The SUMMARY must include the manual GitHub UI follow-up step from Task 2 in the "Next Steps" section so the user knows to add `fresh-green` to required status checks via Settings → Branches → main after the PR merges. This is the single human-in-the-loop step Phase 4 leaves for the user; everything else is automated.

Plan 04-11 is the FINAL plan in Phase 4. After this plan's SUMMARY lands, Phase 4 is complete and ready for `/gsd-verify-work`.
</output>
</content>
</invoke>
