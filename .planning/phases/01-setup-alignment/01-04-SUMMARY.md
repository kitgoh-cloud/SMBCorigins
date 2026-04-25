---
phase: 01-setup-alignment
plan: 04
subsystem: docs/session-brief
tags:
  - claude-md
  - stack-contract
  - scaffolding-ownership
  - phase-1
requires:
  - DECISIONS.md (D-01..D-12, D-20)
provides:
  - CLAUDE.md "Stack contract" section (summarizes D-01..D-08)
  - CLAUDE.md "Scaffolding ownership" section (summarizes D-09..D-12)
affects:
  - CLAUDE.md (session-start brief read by Claude Code at every session)
tech-stack:
  added: []
  patterns:
    - "Two-document canonical pattern: DECISIONS.md = canonical (append-only); CLAUDE.md = summary; on conflict DECISIONS.md wins"
    - "Inline (D-XX) decision references for traceability"
key-files:
  created: []
  modified:
    - CLAUDE.md
decisions:
  - "Replace placeholder Stack section in place rather than appending — keeps file lean"
  - "Insert Scaffolding ownership directly after Stack contract, before Working principles — locks/governance flow before practice"
  - "Inline (D-XX) tags on every bullet — gives any future reader a one-grep route to the signed line in DECISIONS.md"
metrics:
  duration: ~5min
  completed: 2026-04-25
  tasks: 2
  files_changed: 1
requirements:
  - SETUP-01
  - SETUP-02
---

# Phase 01 Plan 04: CLAUDE.md Stack Contract & Scaffolding Ownership Summary

CLAUDE.md mutated in place to add "Stack contract" (D-01..D-08) and "Scaffolding ownership" (D-09..D-12) sections, replacing the obsolete "Stack (to be locked together)" placeholder so every future Claude Code session sees the active Phase 1 locks at session start.

## What Was Done

### Task 1: Replace Stack placeholder with Stack contract section
- Removed `## Stack (to be locked together)` placeholder (4 generic bullets, Next.js 14, etc.).
- Added `## Stack contract` with 10 bullets covering D-01..D-08 plus deployment + Anthropic Claude API note.
- Each stack bullet carries an inline `(D-0X)` tag pointing back to DECISIONS.md.
- Closing paragraph: "On any conflict… DECISIONS.md wins (per D-20). Update both atomically when locks change."
- Commit: `f4e23dd`

### Task 2: Insert Scaffolding ownership section
- Inserted new `## Scaffolding ownership` H2 between Stack contract and Working principles.
- Four bullets covering D-09 (Kit runs `create-next-app`), D-10 (root-level layout, no `src/`), D-11 (`types/origin.ts` at repo root), D-12 (single PR on `kit/scaffold`).
- Closing paragraph points to `CONTRACT.md` and `.github/CODEOWNERS` for boundary file governance.
- Commit: `fec657b`

## Files Modified

- `CLAUDE.md` — Stack placeholder replaced; Scaffolding ownership section inserted. All other H2 sections (What we're building, Who's building it, Working principles, Personas, Hero scenario, The six stages, Design system, Reference docs, Non-goals, How to run) preserved verbatim.

## Verification

All success criteria from the plan pass:

- `grep -cE '^## Stack contract$' CLAUDE.md` → 1
- `grep -cE '^## Stack \(to be locked together\)$' CLAUDE.md` → 0
- `grep -cE '^## Scaffolding ownership$' CLAUDE.md` → 1
- All eight `(D-01)`..`(D-08)` and four `(D-09)`..`(D-12)` inline tags present
- Specific values present: `Next.js 16.2 LTS`, `Node 24 LTS`, `Tailwind v4`, `Supabase hosted dev project`, `noUncheckedIndexedAccess`, `ESLint flat config`, `Vercel auto-deploy`, `kit/scaffold`, `create-next-app`, `types/origin.ts`, `BOUND-01`, `SCAFF-06`
- Canonical-source disclaimers present: `DECISIONS.md wins`, links to `CONTRACT.md` and `.github/CODEOWNERS`
- Section ordering: Stack contract (line 16) < Scaffolding ownership (line 33) < Working principles (line 44)
- All other H2 sections preserved (verified by grep set)

## Deviations from Plan

None - plan executed exactly as written.

## Decisions Made

- Used Edit tool (not Write) for both tasks — preserves surrounding content exactly, mitigates T-04-02 (accidental section removal).
- No `(D-X)` tag added to "Vercel auto-deploy" or "Anthropic Claude API" bullets — those are summaries of pre-existing context, not Phase 1 lock decisions; tagging them would imply a false provenance.

## Threat Model Disposition

- T-04-01 (CLAUDE.md / DECISIONS.md drift) — mitigated: explicit "DECISIONS.md wins (per D-20). Update both atomically" disclaimer in Stack contract section.
- T-04-02 (accidental removal of unrelated sections) — mitigated: Edit tool used for surgical replacement; verification grep set confirms all 9 unrelated H2 sections survive.
- T-04-03 (decision repudiation) — mitigated: every bullet carries inline `(D-XX)` reference back to signed DECISIONS.md row.

## Requirements Satisfied

- SETUP-01: CLAUDE.md "Stack contract" section exists summarizing D-01..D-08.
- SETUP-02: CLAUDE.md "Scaffolding ownership" section exists summarizing D-09..D-12.

## Self-Check: PASSED

- Files modified verified present:
  - `CLAUDE.md` — FOUND, contains both new sections.
- Commits verified in `git log`:
  - `f4e23dd` — FOUND (Task 1: Stack contract).
  - `fec657b` — FOUND (Task 2: Scaffolding ownership).
