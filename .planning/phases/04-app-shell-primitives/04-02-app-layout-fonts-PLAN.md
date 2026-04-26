---
phase: 04-app-shell-primitives
plan: 02
type: execute
wave: 1
depends_on: [04-01]
files_modified:
  - app/layout.tsx
  - DECISIONS.md
autonomous: true
requirements: [SHELL-01, SHELL-03]
tags: [fonts, fraunces, ibm-plex-mono, decisions, planner-directive]

must_haves:
  truths:
    - "IBM Plex Mono loads weights 400 + 500 (NOT 400 + 700) — the font bundle no longer ships dead-weight 700"
    - "Fraunces import is unchanged at the next/font level (OD-12 strategy b) — `axes` array NOT added; SOFT/WONK applied via inline style on the wordmark only at TopStrip composition time (Plan 04-10)"
    - "DECISIONS.md has a new D-26 entry recording the IBM Plex Mono weight swap (PD-1 in Phase 4 PR), and a new D-27 entry recording the OD-12 Fraunces SOFT/WONK strategy lock"
    - "PD-1 safety pre-check (`grep -rn 'font-bold' app/ components/ lib/` returns 0) re-verified at execution time before the swap"
  artifacts:
    - path: "app/layout.tsx"
      provides: "next/font wirings with IBM Plex Mono weight ['400', '500']"
      contains: "weight: ['400', '500']"
    - path: "DECISIONS.md"
      provides: "appended D-26 + D-27 audit-trail entries for the Phase 4 font changes"
      contains: "D-26"
  key_links:
    - from: "app/layout.tsx"
      to: "@theme inline --font-mono"
      via: "ibmPlexMono.variable"
      pattern: "ibmPlexMono.variable"
---

<objective>
Apply UI-SPEC Planner Directive PD-1: swap IBM Plex Mono `weight: ['400', '700']` → `['400', '500']` so Phase 4's mono surfaces (Eyebrow primitive 10/500, mode-switcher labels 14/500) render the correct weight 500 and stop loading dead-weight 700. Honor OD-12 strategy (b) for Fraunces — DO NOT modify the next/font import; SOFT/WONK applied inline at the wordmark in Plan 04-10. Append D-26 + D-27 entries to DECISIONS.md per RESEARCH §2 Open Question #1 to preserve the audit trail per D-20.

Purpose:
- Without PD-1, `font-medium` (weight 500) on a mono element silently snaps to 400 or 700 via browser fallback — visually wrong.
- Adding `axes: ['SOFT', 'WONK']` to Fraunces (OD-12 option a) was rejected by UI-SPEC OD-12 in favor of (b) — only the "Origin" wordmark needs SOFT/WONK; loading the axes globally adds bundle weight for no other consumer.
- DECISIONS.md is canonical per D-20; phase decisions touching project-wide locks (D-31) need explicit append entries so future phases can audit.

Output:
- 1 line edit in `app/layout.tsx` line 31: `weight: ['400', '700']` → `weight: ['400', '500']`
- 0 line edits to the Fraunces config (line 8–12) — strategy (b) leaves the import untouched
- 2 new appended lines in DECISIONS.md: D-26 (IBM Plex Mono weight swap) + D-27 (Fraunces SOFT/WONK inline-style strategy)

NOT in scope for this plan:
- Inserting `<TopStrip />` into `app/layout.tsx` body — that lands in Plan 04-10 (Wave 4)
- Adding `axes: ['SOFT', 'WONK']` to the Fraunces import — explicitly REJECTED by OD-12; if a future phase needs SOFT/WONK across all Fraunces consumers, it can revisit
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/04-app-shell-primitives/04-UI-SPEC.md
@.planning/phases/04-app-shell-primitives/04-RESEARCH.md
@.planning/phases/04-app-shell-primitives/04-PATTERNS.md
@app/layout.tsx
@DECISIONS.md

<interfaces>
<!-- Current app/layout.tsx (lines 28–34, IBM Plex Mono import) -->
```tsx
// IBM Plex Mono — NOT a variable font on Google Fonts; weights must be explicit.
const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],   // ← line 31 — change to ['400', '500']
  variable: '--font-ibm-plex-mono',
  display: 'swap',
})
```

<!-- Current app/layout.tsx (lines 5–12, Fraunces import — DO NOT MODIFY in this plan) -->
```tsx
// D-31: Fraunces — wght-only is the default (no opsz/SOFT/WONK in v1; deferred per CONTEXT §"Deferred Ideas").
// next/font@16's Fraunces type only accepts opsz/SOFT/WONK as `axes` (wght is implicit/always-on),
// so we pass no `axes` to keep wght-only behavior.
const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
})
```

<!-- DECISIONS.md tail (last 2 entries — D-25 is the highest current; D-26 is next) -->
```
2026-04-25 · artifacts · D-24: `.github/CODEOWNERS` ...
2026-04-25 · artifacts · D-25: `CLAUDE.md` mutation ...
```

DECISIONS.md format per D-22: `YYYY-MM-DD · area · decision — agreed: kit + evan, YYYY-MM-DD`. Append-only per D-20.
</interfaces>
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: Re-verify PD-1 safety pre-check (grep font-bold = 0 matches)</name>
  <read_first>
    - .planning/phases/04-app-shell-primitives/04-UI-SPEC.md §"PD-1 — IBM Plex Mono weight bundle: swap '700' → '500'" — particularly the safety pre-check rationale (lines 38–46)
  </read_first>
  <files>(none — verification-only task)</files>
  <action>
    Run the safety pre-check verbatim from UI-SPEC PD-1 line 39:
    ```
    grep -rn "font-bold" app/ components/ lib/
    ```
    Expected output: zero lines, exit code 1 (grep returns 1 when no match found; that's the success signal here).

    If grep returns ≥1 match, STOP. Do NOT proceed to Task 2's swap. Per UI-SPEC PD-1 lines 41–43, the planner has two recovery paths:
    - (a) Refactor the offending surface to `font-medium` (500) — preferred, same PR.
    - (b) Keep `'700'` in the bundle additively → `weight: ['400', '500', '700']` — explicitly forbidden by Typography Weight Override "Forbidden additions" rule unless DECISIONS.md gains a new explicit decision overriding it.

    If grep returns 0 matches (the expected case as of 2026-04-26 per UI-SPEC line 39), proceed to Task 2.

    Capture the verification step's output as evidence in the SUMMARY.md per D-21 (planning artifact).
  </action>
  <verify>
    <automated>
    ! grep -rn "font-bold" app/ components/ lib/ 2>/dev/null
    </automated>
  </verify>
  <acceptance_criteria>
    - `grep -rn "font-bold" app/ components/ lib/` returns 0 lines (exit code 1 from grep, which the wrapper `!` flips to 0 = pass)
    - The verification command output is captured for SUMMARY.md so reviewers can audit the pre-check
    - Components/ directory may not exist yet (Phase 4 creates it); if so, grep silently passes — the absence of the directory means there's no font-bold in it. Bash will print a "No such file or directory" warning to stderr; that is acceptable and does not affect exit code under `grep -rn` (grep returns 2 only on regex error, not missing dirs)
  </acceptance_criteria>
  <done>0 font-bold matches in app/, components/, lib/ — safe to swap weight 700 → 500.</done>
</task>

<task type="auto" tdd="false">
  <name>Task 2: Swap IBM Plex Mono weight ['400', '700'] → ['400', '500'] in app/layout.tsx line 31</name>
  <read_first>
    - /Users/wyekitgoh/Projects/SMBCorigins/app/layout.tsx (full 50 lines — current state)
    - .planning/phases/04-app-shell-primitives/04-UI-SPEC.md §"PD-1" (lines 30–46)
    - .planning/phases/04-app-shell-primitives/04-PATTERNS.md §"Files Modified — app/layout.tsx" change (a) (lines 783–791)
  </read_first>
  <files>app/layout.tsx</files>
  <action>
    Make a single one-line edit at `app/layout.tsx:31`:
    - From: `  weight: ['400', '700'],`
    - To:   `  weight: ['400', '500'],`

    Indent stays at 2 spaces (matches surrounding block). Comma stays. Single quotes stay (Phase 2 D-39 Prettier convention enforced via .prettierrc).

    Add NO file-header changes. Add NO new imports. Do NOT touch the Fraunces config (lines 5–12) — Fraunces SOFT/WONK is OD-12 strategy (b) which means the next/font import stays untouched; the `fontVariationSettings` lands inline at the wordmark `<span>` in Plan 04-10.

    Do NOT insert `<TopStrip />` into the body — that's Plan 04-10's responsibility. The body remains `<body>{children}</body>` for now.

    After the edit, verify the file is exactly 50 lines (unchanged length — single-character class change doesn't add or remove lines).
  </action>
  <verify>
    <automated>
    grep -n "weight:" app/layout.tsx | grep -q "weight: \['400', '500'\]" && ! grep -q "weight: \['400', '700'\]" app/layout.tsx && npm run typecheck && npm run lint
    </automated>
  </verify>
  <acceptance_criteria>
    - `app/layout.tsx` line 31 contains exactly `  weight: ['400', '500'],` (2-space indent, single quotes, trailing comma)
    - `grep -n "weight: \['400', '700'\]" app/layout.tsx` returns 0 matches (the old value is GONE)
    - `grep -n "weight: \['400', '500'\]" app/layout.tsx` returns exactly 1 match
    - File length unchanged: `wc -l app/layout.tsx` returns `50`
    - The Fraunces config block (lines 5–12) is byte-identical to the pre-edit state — no `axes:` line added; `subsets`, `variable`, `display` all present and unchanged
    - The body line still reads `<body>{children}</body>` — no `<TopStrip />` insertion (Plan 04-10 owns that)
    - `npm run typecheck` exits 0
    - `npm run lint` exits 0 (Prettier formatting preserved)
    - `npm run build` exits 0 (Next.js can resolve the new font weight subset; weight 500 is a valid IBM Plex Mono Google Fonts variant)
  </acceptance_criteria>
  <done>app/layout.tsx line 31 reads `weight: ['400', '500'],`; everything else in the file is byte-identical to the pre-edit state; build/typecheck/lint all green.</done>
</task>

<task type="auto" tdd="false">
  <name>Task 3: Append D-26 (PD-1) + D-27 (OD-12 strategy b) entries to DECISIONS.md</name>
  <read_first>
    - /Users/wyekitgoh/Projects/SMBCorigins/DECISIONS.md (last 5 lines — confirm D-25 is currently the highest entry; new entries are D-26 and D-27)
    - .planning/phases/04-app-shell-primitives/04-RESEARCH.md §"Open Questions" #1 (lines 1450–1454) — recommends appending a new D-NN entry for the Fraunces axes change to preserve audit trail per D-20
    - .planning/phases/04-app-shell-primitives/04-UI-SPEC.md §"Open Decisions OD-12" + §"Planner Directives PD-1" — the source-of-truth for both new entries
  </read_first>
  <files>DECISIONS.md</files>
  <action>
    APPEND-ONLY to DECISIONS.md per D-22 — never modify existing lines. Append two new lines at end of file in the existing format `YYYY-MM-DD · area · decision — agreed: kit + evan, YYYY-MM-DD`. Use today's date (2026-04-26).

    Line 1 (D-26):
    ```
    2026-04-26 · typography · D-26: IBM Plex Mono weight bundle swapped from `['400', '700']` to `['400', '500']` in `app/layout.tsx:31`. Phase 4 UI-SPEC's mono surfaces (Eyebrow 10/500, ModeSwitcher labels 14/500, Avatar initials 12/400) need weight 500; weight 700 was unused dead-weight in the bundle. Safety pre-check `grep -rn font-bold app/ components/ lib/` returned 0 matches before the swap. Supersedes nothing — Phase 2 D-31 governs Fraunces only. — agreed: kit + evan, 2026-04-26
    ```

    Line 2 (D-27):
    ```
    2026-04-26 · typography · D-27: Fraunces SOFT/WONK variation rendered via inline `style={{ fontVariationSettings: '"SOFT" 80, "WONK" 1' }}` on the "Origin" wordmark `<span>` only (Phase 4 OD-12 strategy b). Phase 2 D-31 (Fraunces wght-only `axes`) stays in force — no font-import change. Other Phase 4 Fraunces consumers (StagePill numerals) intentionally do NOT use SOFT/WONK; if a future phase needs the axes globally, that phase revisits D-31. — agreed: kit + evan, 2026-04-26
    ```

    Both lines written exactly as above (single backticks for inline code, em-dashes `—`, no extra whitespace, single trailing newline at end of file). The two lines append AFTER the current D-25 line; do NOT delete or rewrite any existing line.

    Do NOT renumber existing D-NN entries. Do NOT add a section heading. Do NOT add a horizontal rule. The format precedent is set by D-22..D-25.
  </action>
  <verify>
    <automated>
    grep -q "D-26: IBM Plex Mono weight bundle swapped" DECISIONS.md && grep -q "D-27: Fraunces SOFT/WONK variation" DECISIONS.md && grep -c "^[0-9]\{4\}-[0-9]\{2\}-[0-9]\{2\} · " DECISIONS.md | awk '{exit ($1 < 27)}'
    </automated>
  </verify>
  <acceptance_criteria>
    - DECISIONS.md contains exactly one line with `D-26:` (the IBM Plex Mono weight swap entry)
    - DECISIONS.md contains exactly one line with `D-27:` (the Fraunces SOFT/WONK strategy entry)
    - Both lines start with `2026-04-26 · typography · ` (date + area)
    - Both lines end with `— agreed: kit + evan, 2026-04-26`
    - Total D-NN entries in DECISIONS.md: at least 27 (D-01 through D-27 — confirmed by `grep -c "^[0-9]\{4\}-[0-9]\{2\}-[0-9]\{2\} · " DECISIONS.md` ≥ 27)
    - No existing D-NN entry text is modified (verifiable via `git diff DECISIONS.md` showing only +adds, never -dels)
    - File ends with a single trailing newline (standard POSIX convention)
  </acceptance_criteria>
  <done>DECISIONS.md has D-26 + D-27 appended at end-of-file; D-01..D-25 untouched; format matches existing entries verbatim.</done>
</task>

</tasks>

<threat_model>
This plan is configuration + audit-trail only. The applicable ASVS category is V14 Configuration; risk = low because the change is in `next/font` weight subset (one of the family's published Google Fonts variants — weight 500 is valid IBM Plex Mono), and the DECISIONS.md append is documentation.

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-04-02-01 | V14 Configuration | app/layout.tsx font import | mitigate | PD-1 safety pre-check (Task 1) catches any code that relied on `font-bold` (weight 700) before the swap. Existing `font-mono` surfaces use no weight modifier and default to 400, per UI-SPEC PD-1 lines 39–40. |
| T-04-02-02 | V14 Configuration | DECISIONS.md append-only audit log | accept | Append-only convention enforced socially (D-22) — Git history preserves any tampering. No automated guardrail (would need pre-commit hook); accepted for prototype velocity. |

No active code-runtime threats. No user input flow affected. No persistence layer affected.
</threat_model>

<verification>
After all 3 tasks land:
1. `npm run typecheck && npm run lint && npm run test && npm run build` exits 0
2. `git diff app/layout.tsx` shows exactly one changed line (line 31)
3. `git diff DECISIONS.md` shows exactly two added lines (D-26, D-27) at EOF
4. `grep -rn "font-bold" app/ components/ lib/` still returns 0 matches (post-condition holds)
5. `cat app/layout.tsx | grep -A 1 "IBM_Plex_Mono"` confirms `weight: ['400', '500'],`
</verification>

<success_criteria>
- [ ] `app/layout.tsx:31` reads `weight: ['400', '500'],`
- [ ] `app/layout.tsx` Fraunces config (lines 5–12) byte-identical to pre-edit state
- [ ] `app/layout.tsx` body line still `<body>{children}</body>` (TopStrip insert is Plan 04-10)
- [ ] `DECISIONS.md` has D-26 + D-27 appended in the exact format specified
- [ ] `grep -rn "font-bold" app/ components/ lib/` returns 0 matches (PD-1 safety pre-check holds before AND after)
- [ ] `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build` all exit 0
</success_criteria>

<output>
After completion, create `.planning/phases/04-app-shell-primitives/04-02-SUMMARY.md`
</output>
