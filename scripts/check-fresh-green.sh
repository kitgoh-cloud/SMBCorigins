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
  '#[Bb][Ff][Dd]7[3]0\b'
  '--color-fresh-green(-[a-z0-9]+)?'
  '(bg|text|border|ring|ring-offset|from|to|via|outline|fill|stroke|divide|placeholder|caret|accent|shadow|inset-shadow|decoration)-fresh-green(-[a-z0-9]+)?(/[0-9]+)?'
  '\[(#[Bb][Ff][Dd]7[3]0|var\(--color-fresh-green|rgba\(\s*191\s*,\s*215\s*,\s*48)'
  'rgba\(\s*191\s*,\s*215\s*,\s*48'
)

# --- Read allowlist (one path per line; lines starting with # are comments) -
ALLOWLIST_FILE="${ALLOWLIST_FILE:-.freshgreen-allowlist}"
# Note: `mapfile` (bash 4+) is not available on macOS bash 3.2; use `while read` for portability.
ALLOWLIST=()
while IFS= read -r line; do
  ALLOWLIST+=("$line")
done < <(grep -v '^#' "${ALLOWLIST_FILE}" 2>/dev/null | grep -v '^$' || true)

# --- Find candidate files (tracked source) ----------------------------------
# Use git ls-files so we follow .gitignore + skip node_modules / .next / etc.
# Restrict to source extensions: ts, tsx, css, js, jsx
# Exclude test files (*.test.ts, *.test.tsx, *.spec.ts, *.spec.tsx) — test files
# reference token names as assertion strings (e.g., expect(x).toContain('bg-fresh-green'))
# which are false positives for enforcement. Tests for allowlisted AI components
# (AIPulseDot, AIBadge, StatusChip) legitimately assert the presence of fresh-green tokens.
FILES=$(git ls-files | grep -E '\.(ts|tsx|css|js|jsx)$' | grep -v '\.test\.\|\.spec\.' || true)

# --- Scan each file, skipping allowlisted ones ------------------------------
EXIT_CODE=0
for FILE in $FILES; do
  # Skip if file is in allowlist
  # Note: "${ALLOWLIST[@]+"${ALLOWLIST[@]}"}" is the nounset-safe expansion for
  # empty arrays under `set -u` (bash 3.2 compat — macOS ships bash 3.2).
  ALLOWED=0
  for A in "${ALLOWLIST[@]+"${ALLOWLIST[@]}"}"; do
    if [[ "$FILE" == "$A" ]]; then
      ALLOWED=1
      break
    fi
  done
  if [[ $ALLOWED -eq 1 ]]; then
    continue
  fi

  # Apply each pattern
  # Use -e PATTERN (not positional arg) to avoid -- prefix in pattern 2 being
  # misinterpreted as a grep option flag (affects ugrep on macOS + some GNU grep
  # versions). -e is POSIX-standard and safe across all grep implementations.
  for PATTERN in "${PATTERNS[@]}"; do
    if grep -E -n -e "$PATTERN" "$FILE" > /dev/null 2>&1; then
      echo "SHELL-05 violation in $FILE:" >&2
      grep -E -n -e "$PATTERN" "$FILE" >&2
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
