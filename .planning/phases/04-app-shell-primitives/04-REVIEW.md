---
phase: 04-app-shell-primitives
reviewed: 2026-04-27T00:00:00Z
depth: standard
files_reviewed: 26
files_reviewed_list:
  - .freshgreen-allowlist
  - .github/workflows/ci.yml
  - CLAUDE.md
  - app/(client)/layout.tsx
  - app/(rm)/layout.tsx
  - app/dev/primitives/page.tsx
  - app/layout.tsx
  - components/primitives/AIBadge.tsx
  - components/primitives/AIPulseDot.tsx
  - components/primitives/ActionCard.tsx
  - components/primitives/Avatar.tsx
  - components/primitives/Eyebrow.tsx
  - components/primitives/Icon.tsx
  - components/primitives/StagePill.tsx
  - components/primitives/StatusChip.tsx
  - components/primitives/index.ts
  - components/shell/ClientShell.tsx
  - components/shell/LanguageToggle.tsx
  - components/shell/ModeSwitcher.tsx
  - components/shell/RMShell.tsx
  - components/shell/RisingMark.tsx
  - components/shell/TopStrip.tsx
  - lib/persona.ts
  - package.json
  - scripts/check-fresh-green.sh
  - vitest.config.ts
  - vitest.setup.ts
findings:
  critical: 0
  warning: 1
  info: 3
  total: 4
status: issues_found
---

# Phase 4: Code Review Report

**Reviewed:** 2026-04-27
**Depth:** standard
**Files Reviewed:** 26
**Status:** issues_found

## Summary

Phase 4 delivers the app shell (TopStrip, ClientShell, RMShell), all 8 design primitives, the lib/persona stubs, the SHELL-05 Fresh Green enforcement script, and the CI pipeline. The implementation is well-structured and defensively written. No critical issues were found.

The SHELL-05 Fresh Green enforcement is thorough: the script, allowlist, CI job, and per-kind test mandate work together correctly. All allowlisted files (AIPulseDot, AIBadge, StatusChip, RisingMark, app/dev/primitives/page.tsx, app/globals.css) have clear documented rationale. The Icon switch covers all 36 union members and TypeScript's control flow analysis confirms no missing-return risk.

One warning is flagged in the shell enforcement script (unsafe word-splitting on filenames with spaces), and three informational items are noted: a `@types/node` version mismatch, an aria-label on a roleless span, and a TODO comment left in the enforcement script.

## Warnings

### WR-01: Unsafe word-splitting in check-fresh-green.sh file loop

**File:** `scripts/check-fresh-green.sh:47-51`
**Issue:** `FILES` is populated via command substitution and then iterated with `for FILE in $FILES`. Unquoted variable expansion performs word-splitting on whitespace, so any source file path containing a space would be split into multiple tokens and treated as separate (nonexistent) filenames. The loop would silently skip those files, creating a bypass in SHELL-05 enforcement.

```bash
# Line 47 — current:
FILES=$(git ls-files | grep -E '\.(ts|tsx|css|js|jsx)$' | grep -v '\.test\.\|\.spec\.' || true)

# Lines 51+ — current:
for FILE in $FILES; do
```

**Fix:** Pipe directly into a `while read` loop, which handles the file list line-by-line without word-splitting:

```bash
while IFS= read -r FILE; do
  [[ -z "$FILE" ]] && continue
  # ... existing ALLOWED check and grep loop ...
done < <(git ls-files | grep -E '\.(ts|tsx|css|js|jsx)$' | grep -v '\.test\.\|\.spec\.' || true)
```

This is consistent with the `while IFS= read -r line` pattern already used on lines 36-38 for the allowlist parsing. Source filenames with spaces are rare in practice, so this is not currently exploitable, but the pattern is a correctness gap in the enforcement gate.

## Info

### IN-01: @types/node version lags behind pinned Node runtime

**File:** `package.json:28`
**Issue:** `@types/node` is pinned to `^20` (resolves to the latest 20.x release) while the project runs Node 24 LTS per CLAUDE.md D-02 and `engines.node`. APIs introduced in Node 21–24 will have no type definitions, producing silent `any` types if those APIs are called directly.

**Fix:** Align to `^24` to match the runtime pin:

```json
"@types/node": "^24"
```

For a Next.js frontend prototype that accesses Node APIs only through Next.js abstractions, the practical risk is low. However the mismatch is inconsistent with the D-05 strict TypeScript policy and should be corrected before Phase 5 work begins.

### IN-02: aria-label on roleless span in LanguageToggle

**File:** `components/shell/LanguageToggle.tsx:17`
**Issue:** The outer `<span>` carries `aria-label="Language"` but has no ARIA role. ARIA naming rules (accname-1.1) prohibit `aria-label` on elements whose role is `none`/`presentation` or whose implicit role does not support naming. A plain `<span>` has an implicit role of `generic`, which is a nameable role, so this is not a hard spec violation — but many screen readers will silently ignore `aria-label` on generic elements with no interactive or landmark role, making the label invisible to assistive technology.

**Fix:** Since the UI-SPEC explicitly calls this a visual-only, non-interactive surface (line 405), the simplest correct fix is to remove the `aria-label` (no interaction = no label needed) or add `role="group"` if labelling the cluster as a unit is desired:

```tsx
// Option A — remove the label (cleanest for a purely visual control):
<span className="inline-flex items-center gap-1 text-[14px] font-medium">

// Option B — add role if the label is meaningful for a11y:
<span role="group" aria-label="Language" className="inline-flex items-center gap-1 text-[14px] font-medium">
```

### IN-03: TODO comment left in enforcement script

**File:** `scripts/check-fresh-green.sh:21`
**Issue:** A TODO comment documents a forward-looking caveat about new `--color-fresh-green-*` suffix tokens:

```bash
# TODO: if app/globals.css @theme adds new --color-fresh-green-* suffixes,
# the existing pattern 2 + 3 already cover them via `(-[a-z0-9]+)?`.
```

The comment itself answers its own question (the patterns already handle new suffixes), making this a stale TODO. Left as-is it could prompt unnecessary future investigation.

**Fix:** Convert to a plain statement or remove:

```bash
# Note: if app/globals.css @theme adds new --color-fresh-green-* suffixes,
# patterns 2 and 3 already cover them via the `(-[a-z0-9]+)?` suffix match.
```

---

_Reviewed: 2026-04-27_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
