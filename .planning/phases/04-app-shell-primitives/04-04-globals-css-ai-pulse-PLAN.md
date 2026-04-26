---
phase: 04-app-shell-primitives
plan: 04
type: execute
wave: 1
depends_on: [04-01]
files_modified:
  - app/globals.css
autonomous: true
requirements: [SHELL-04, SHELL-05]
tags: [css, animation, keyframes, theme, tailwind-v4]

must_haves:
  truths:
    - "app/globals.css contains a `@keyframes ai-pulse` block — D-89 strategy (c) carve-out for the one CSS-keyframe primitive that cannot live in component-prop styling"
    - "Tailwind v4's `--animate-ai-pulse` token in the @theme block auto-generates the `animate-ai-pulse` utility class that AIPulseDot consumes"
    - "Existing @theme tokens (color palette, spacing, radius, font remap) are byte-identical to pre-edit state — additive change only"
  artifacts:
    - path: "app/globals.css"
      provides: "@keyframes ai-pulse + --animate-ai-pulse @theme token"
      contains: "@keyframes ai-pulse"
  key_links:
    - from: "app/globals.css"
      to: "components/primitives/AIPulseDot.tsx"
      via: "animate-ai-pulse utility class"
      pattern: "animate-ai-pulse"
---

<objective>
Add the `@keyframes ai-pulse` block + `--animate-ai-pulse` @theme token to `app/globals.css` so AIPulseDot (Plan 04-06) can consume the `animate-ai-pulse` Tailwind utility per RESEARCH §1 D-89 strategy (c) carve-out and §5.3 timing recommendation (1200ms cubic-bezier(0.4, 0, 0.2, 1) infinite alternate).

Strategic note: D-89 is locked at strategy (c) component-prop-driven styling (UI-SPEC OD-1). The ai-pulse keyframe is the ONE carve-out — keyframes are CSS, not Tailwind utilities, so they live in `app/globals.css`. This plan does NOT add `@apply` directives, does NOT port the prototype's `t-eyebrow`/`chip--*`/`btn--*`/`card--*` classes (those are explicitly NOT carried forward in strategy c per RESEARCH §1 lines 711–722).

Purpose: Make `animate-ai-pulse` a real Tailwind utility AIPulseDot can use without inline-style fallback.

Output: 1 additive edit to `app/globals.css` — append the keyframes block + 1 token line to the existing `@theme` block.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/04-app-shell-primitives/04-RESEARCH.md
@.planning/phases/04-app-shell-primitives/04-PATTERNS.md
@.planning/phases/04-app-shell-primitives/04-UI-SPEC.md
@app/globals.css

<interfaces>
<!-- Current app/globals.css (verbatim, 73 lines, 2026-04-26) -->
The file has 4 distinct regions:
1. Lines 1-3: file-header comment block
2. Lines 5: `@import 'tailwindcss';`
3. Lines 7-53: `@theme {}` block — palette + spacing + radius tokens
4. Lines 55-65: `@theme inline {}` block — next/font CSS-variable remap
5. Lines 67-72: minimal `body {}` reset

The end of the `@theme {}` block (line 53) is `}` — closing brace. Phase 4's additive token line `--animate-ai-pulse: ...` MUST go INSIDE the existing `@theme {}` block (lines 7-53), not after. The `@keyframes ai-pulse {}` block goes AFTER the closing `}` of `@theme inline` (line 65) but BEFORE the `body {}` reset (line 67) — between blocks at top-level.

Final structure after Phase 4 edits:
```css
@import 'tailwindcss';

@theme {
  /* ====== existing palette + spacing + radius tokens unchanged ====== */
  ...
  /* ====== Animation tokens — Phase 4 (D-89 strategy (c) carve-out) ====== */
  --animate-ai-pulse: ai-pulse 1200ms cubic-bezier(0.4, 0, 0.2, 1) infinite alternate;
}

@theme inline {
  /* existing font remap unchanged */
}

/* @keyframes — Phase 4 (D-89 carve-out per RESEARCH §1) */
@keyframes ai-pulse {
  0% {
    transform: scale(1);
    opacity: 0.85;
  }
  100% {
    transform: scale(1.15);
    opacity: 1;
  }
}

body {
  /* existing reset unchanged */
}
```
</interfaces>
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: Add @keyframes ai-pulse + --animate-ai-pulse token to app/globals.css</name>
  <read_first>
    - /Users/wyekitgoh/Projects/SMBCorigins/app/globals.css (full 73 lines — confirm current `@theme {}` block ends at line 53 with closing `}`; `@theme inline {}` ends at line 65; `body {}` starts at line 68)
    - .planning/phases/04-app-shell-primitives/04-RESEARCH.md §1 D-89 (lines 693–725) — strategy (c) + carve-out for `@keyframes ai-pulse`
    - .planning/phases/04-app-shell-primitives/04-RESEARCH.md §5.3 (lines 984–1021) — verbatim keyframe block + token recommendation
    - .planning/phases/04-app-shell-primitives/04-UI-SPEC.md §"Open Decisions" OD-6 (line 537) — animation timing locked at 1200ms cubic-bezier(0.4, 0, 0.2, 1) infinite alternate
    - .planning/phases/04-app-shell-primitives/04-PATTERNS.md §"Files Modified — app/globals.css" (lines 84) — additive change scope
  </read_first>
  <files>app/globals.css</files>
  <action>
    Two additive edits to `app/globals.css`:

    **Edit (1):** Inside the existing `@theme {}` block (lines 7–53), JUST BEFORE its closing `}` (currently line 53), append a new section block (4 lines + blank line above for separation):
    ```css

      /* ====== Animation tokens — Phase 4 (D-89 strategy (c) carve-out per RESEARCH §1) ====== */
      --animate-ai-pulse: ai-pulse 1200ms cubic-bezier(0.4, 0, 0.2, 1) infinite alternate;
    ```
    Indent matches the surrounding tokens (2 spaces). Place this AFTER the existing radius block (`--radius-modal: 16px;` line 51) but BEFORE the closing `}` of `@theme {}`.

    Tailwind v4's `--animate-*` theme tokens auto-generate `animate-*` utilities — so `--animate-ai-pulse` exposes `animate-ai-pulse` as a Tailwind class. Per RESEARCH §"Open Questions" #5 (line 1470–1473), if the auto-utility doesn't generate during build, the AIPulseDot primitive falls back to inline `style={{ animation: 'ai-pulse 1200ms ...' }}` — but that's a Plan 04-06 concern, not this plan's.

    **Edit (2):** OUTSIDE both `@theme` blocks (i.e., at the top level), after the closing `}` of `@theme inline {}` (line 65) but BEFORE the `body {` line (line 68), append a new top-level keyframes block (10 lines + blank lines):
    ```css

    /* @keyframes — Phase 4 (D-89 carve-out per RESEARCH §1, timing per UI-SPEC OD-6) */
    @keyframes ai-pulse {
      0% {
        transform: scale(1);
        opacity: 0.85;
      }
      100% {
        transform: scale(1.15);
        opacity: 1;
      }
    }
    ```

    Constraints:
    - Do NOT touch the existing palette tokens (lines 8–35) — every `--color-*` and `--spacing-*` and `--radius-*` line stays byte-identical
    - Do NOT touch the `@theme inline` block (lines 55–65) — font remap stays untouched
    - Do NOT touch the `body {}` reset (lines 67–72)
    - Do NOT add `@apply` directives anywhere — strategy (c) explicitly rejects (b)
    - Do NOT port the prototype's `t-eyebrow`/`chip--*`/`btn--*`/`card--*` classes — strategy (c) means primitives own their style via Tailwind utilities at the component-prop level
    - Final file length: 73 + ~14 added lines = ~87 lines

    The keyframe `0%` opacity 0.85 → `100%` opacity 1 + scale 1.0 → 1.15 produces a gentle pulse at 1200ms cubic-bezier(0.4, 0, 0.2, 1) — slow enough to read as "AI presence" not "alert blink". `infinite alternate` reverses the keyframes so the dot doesn't snap back.
  </action>
  <verify>
    <automated>
    grep -q "@keyframes ai-pulse {" app/globals.css && grep -q "\-\-animate-ai-pulse: ai-pulse 1200ms cubic-bezier(0.4, 0, 0.2, 1) infinite alternate;" app/globals.css && grep -c "@theme {" app/globals.css | awk '{exit ($1 != 1)}' && npm run build && npm run lint
    </automated>
  </verify>
  <acceptance_criteria>
    - `app/globals.css` contains exactly one `@keyframes ai-pulse {` block (top-level, between `@theme inline {}` and `body {}`)
    - `app/globals.css` contains exactly one `--animate-ai-pulse: ai-pulse 1200ms cubic-bezier(0.4, 0, 0.2, 1) infinite alternate;` line, INSIDE the existing `@theme {}` block (NOT inside `@theme inline {}`)
    - The keyframe block defines `0%` (`transform: scale(1)`, `opacity: 0.85`) and `100%` (`transform: scale(1.15)`, `opacity: 1`) at minimum
    - Existing `@theme {}` block still contains all 12 `--color-*` tokens (trad-green, trad-green-deep, trad-green-soft, fresh-green, fresh-green-mute, fresh-green-glow, ink, ink-soft, ink-muted, paper, paper-deep, mist, signal-amber, signal-red, signal-info — 16 tokens total counting subvariants)
    - Existing `@theme {}` block still contains all 9 `--spacing-*` tokens (1, 2, 3, 4, 6, 8, 12, 16, 24)
    - Existing `@theme {}` block still contains all 3 `--radius-*` tokens (button, card, modal)
    - Existing `@theme inline {}` block byte-identical (4 font-family remaps preserved)
    - Existing `body {}` reset byte-identical
    - File contains exactly ONE `@theme {` opening (no duplicate `@theme` blocks introduced) — verified by `grep -c "^@theme {" app/globals.css` returning 1; the `@theme inline {` opening is a separate match per the leading whitespace
    - `npm run build` exits 0 (Next.js + Tailwind v4 PostCSS compiles successfully; the new keyframe + token are valid Tailwind v4 syntax)
    - `npm run lint` exits 0
    - File length increases by ~14 lines (73 → ~87) — confirmed by `wc -l app/globals.css` returning ≥85 and ≤95
  </acceptance_criteria>
  <done>app/globals.css has the @keyframes ai-pulse block + --animate-ai-pulse token added; existing tokens untouched; build + lint green.</done>
</task>

</tasks>

<threat_model>
Plan 04-04 modifies a CSS file additively. The applicable ASVS category is V14 Configuration; risk = very low because the CSS keyframe is a static animation with no scripted execution path.

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-04-04-01 | V14 Configuration | app/globals.css | accept | CSS keyframes execute in the browser's compositor thread; no eval, no scripted side effect, no user input. The animation runs whenever AIPulseDot mounts; no security implication. |
| T-04-04-02 | XSS via CSS | @keyframes ai-pulse | accept | Static literal CSS; no interpolation from user input; no `expression()`-style legacy IE syntax. No risk. |

No active threats. The "carve-out" decision (D-89 strategy (c) + this single keyframe) is documented in the comment header of the new CSS block + in DECISIONS.md D-64/D-65 from Plan 04-02 (audit trail).
</threat_model>

<verification>
After Task 1 lands:
1. `cat app/globals.css | grep -A 8 "@keyframes ai-pulse"` shows the full keyframe block
2. `cat app/globals.css | grep "animate-ai-pulse"` shows the @theme token line
3. `npm run build` exits 0; the build emits a CSS bundle that contains the new keyframe (verifiable in `.next/static/css/*.css` post-build, but post-build inspection is not required at the plan-acceptance gate — `npm run build` succeeding is sufficient)
4. `npm run dev` (manual smoke check) — visit `/` and DevTools → Animations panel should show no animations yet (AIPulseDot doesn't exist yet); the keyframe is registered but not consumed. This is expected; AIPulseDot in Plan 04-06 binds `animate-ai-pulse` and triggers the animation.
</verification>

<success_criteria>
- [ ] `@keyframes ai-pulse` block exists in `app/globals.css` between `@theme inline {}` and `body {}`
- [ ] `--animate-ai-pulse: ...` token line exists inside the `@theme {}` block (NOT inside `@theme inline {}`)
- [ ] Existing palette / spacing / radius / font-remap / body-reset tokens are byte-identical to pre-edit state
- [ ] `npm run build` exits 0 (Tailwind v4 compiles the new token + keyframe)
- [ ] `npm run lint` exits 0
</success_criteria>

<output>
After completion, create `.planning/phases/04-app-shell-primitives/04-04-SUMMARY.md`
</output>
