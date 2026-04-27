---
phase: 04-app-shell-primitives
verified: 2026-04-27T10:22:00Z
status: human_needed
score: 4/4 must-haves verified
overrides_applied: 0
human_verification:
  - test: "Navigate to http://localhost:3000/ and confirm TopStrip renders at 56px height with Rising Mark logo, EN / 日本語 language toggle, and trad-green-deep background"
    expected: "TopStrip visible across all routes; Rising Mark SVG with fresh-green clock hand; EN / 日本語 segments are non-interactive spans; no cursor change on hover"
    why_human: "Visual rendering and non-interactivity cannot be confirmed programmatically without a running browser"
  - test: "Set NEXT_PUBLIC_SHOW_MODE_SWITCHER=true npm run dev — verify ModeSwitcher appears in TopStrip; then unset and reload to confirm it disappears"
    expected: "ModeSwitcher shows dashed border (ink-muted/30), DEMO eyebrow in signal-amber, two segment links. Absent when env unset."
    why_human: "Env-gated UI appearance and production-safety requires browser verification"
  - test: "Navigate to http://localhost:3000/dev/primitives and visually confirm all 8 primitives render in all states"
    expected: "8 sections visible: Eyebrow (4 examples), StatusChip (12 chips — 6 kinds × dot/no-dot), StagePill (18 pills — 3 states × 6 numbers), AIPulseDot (animating), AIBadge (default + custom label), ActionCard (3 recipes), Icon (35 named icons), Avatar (7 colors)"
    why_human: "Visual completeness and AIPulseDot animation (animate-ai-pulse keyframe) require browser verification"
  - test: "Compare Avatar bg and mail-icon dot colors in TopStrip against design spec: Avatar bg must appear as trad-green-soft (a dark green, NOT the bright #BFD730 fresh-green); mail dot must appear amber (NOT fresh-green)"
    expected: "All 5 retrofit sites render correct replacement tokens — Avatar dark green, mail dot amber, ModeSwitcher dashed border paper-toned, DEMO eyebrow amber, sidebar Cockpit dot dark green"
    why_human: "Retrofit visual accuracy requires human colour comparison against the spec"
---

# Phase 4: App Shell & Primitives Verification Report

**Phase Goal:** Deliver the app shell and the five shared primitives that every screen downstream depends on — TopStrip chrome, route-group layouts for client and RM personas, and a complete primitive set (Eyebrow, Icon, Avatar, AIPulseDot, AIBadge, StatusChip, StagePill, ActionCard) plus the SHELL-05 fresh-green enforcement gate.
**Verified:** 2026-04-27T10:22:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Top strip renders across all screens with EN / 日本語 language toggle (SHELL-01) | ✓ VERIFIED | `TopStrip.tsx` exists as `'use client'` component; `LanguageToggle` composed inside; `LanguageToggle.tsx` renders non-interactive `<span>` segments with EN + 日本語; `<TopStrip />` wired in `app/layout.tsx` above `{children}` |
| 2 | Dev-only mode switcher flips between /(client) and /(rm), hidden in production (SHELL-02) | ✓ VERIFIED | `ModeSwitcher.tsx` has `process.env.NEXT_PUBLIC_SHOW_MODE_SWITCHER !== 'true'` early-return null; two `<Link>` segments for `/journey` and `/cockpit` via `PERSONA_HOME`; composed in `TopStrip.tsx` |
| 3 | Rising Mark logo component exists, sized correctly, used in top strip (SHELL-03) | ✓ VERIFIED | `RisingMark.tsx` exists in `components/shell/`; default `size=24` (UI-SPEC OD-3); viewBox 0 0 40 40 (2 circles + 2 lines); imported and rendered in `TopStrip.tsx` |
| 4 | Shared primitives (8 total) exported from `components/primitives/`, visible on demo page (SHELL-04) | ✓ VERIFIED | All 8 present: Eyebrow, Icon, Avatar, AIPulseDot, AIBadge, StatusChip, StagePill, ActionCard; `index.ts` barrel exports all 8 + 12 public types; `app/dev/primitives/page.tsx` at `/dev/primitives` renders all; REQUIREMENTS.md amended per D-72 to record 5→8 drift |
| 5 | Fresh Green #BFD730 exclusive to AI surfaces; grep check confirms absent from non-AI elements (SHELL-05) | ✓ VERIFIED | `bash scripts/check-fresh-green.sh` exits 0 on live repo; only 7 allowlisted files contain fresh-green tokens (AIPulseDot.tsx, AIBadge.tsx, StatusChip.tsx [kind='ai' only], RisingMark.tsx [brand exception], app/dev/primitives/page.tsx, app/globals.css [token definition], app/page.tsx [Phase-2 showcase]); 5 prototype violations retrofitted: Avatar bg → trad-green-soft (#1), mail dot → signal-amber (#2), ModeSwitcher border → ink-muted/30 (#3), DEMO eyebrow → signal-amber (#4), RMShell sidebar dot → trad-green (#5) |

**Score:** 4/4 truths verified (SC #3 in ROADMAP mentions 5 primitives by name; REQUIREMENTS.md was intentionally amended via D-72 to record the 8-primitive reality — not a gap, a documented scope extension)

### Note on ROADMAP SC #3 vs Actual Deliverable

ROADMAP Phase 4 SC #3 lists 5 named primitives (Eyebrow, StatusChip, StagePill, AIPulseDot, ActionCard). The phase actually shipped 8 (+ Icon, Avatar, AIBadge). This divergence was anticipated, documented in CONTEXT D-72, and formally recorded by amending REQUIREMENTS.md SHELL-04 wording ("5 brand primitives + 3 infrastructure primitives = 8"). All 8 are exported from the barrel and visible on the demo page — the SC's observable intent ("each visible on a primitives demo page") is satisfied at the higher count.

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `vitest.setup.ts` | jest-dom matcher registration | ✓ VERIFIED | Contains `import '@testing-library/jest-dom/vitest'`; wired via `vitest.config.ts` setupFiles |
| `vitest.config.ts` | jsdom env + tsx include + setupFiles | ✓ VERIFIED | `environment: 'jsdom'`, `setupFiles: ['./vitest.setup.ts']`, `include: ['**/*.test.{ts,tsx}']` |
| `lib/persona.ts` | PERSONAS, PERSONA_HOME, modeForPathname, Mode, Persona | ✓ VERIFIED | All 5 exports present; Mode = `'client' \| 'rm' \| 'demo'`; PERSONA_HOME has /journey + /cockpit |
| `app/globals.css` | @keyframes ai-pulse + --animate-ai-pulse token | ✓ VERIFIED | Both present; keyframe between `@theme inline {}` and `body {}`; token inside `@theme {}` |
| `components/primitives/Eyebrow.tsx` | Eyebrow primitive | ✓ VERIFIED | Named export; `font-mono uppercase tracking-[0.18em] text-ink-muted text-[10px] font-medium`; no fresh-green |
| `components/primitives/Icon.tsx` | Icon with 35-name closed union | ✓ VERIFIED | `IconName` 36-member union (35 icon names); exhaustive switch; ariaLabel toggles role/aria-hidden |
| `components/primitives/Avatar.tsx` | Avatar with 7-member AvatarColor (no fresh-green) | ✓ VERIFIED | `AvatarColor` excludes fresh-green family; `Record<AvatarColor, string>` maps; default size=30 |
| `components/primitives/AIPulseDot.tsx` | 8px fresh-green dot with animate-ai-pulse | ✓ VERIFIED | `bg-fresh-green animate-ai-pulse w-2 h-2 rounded-full`; role=img; default aria-label "AI active" |
| `components/primitives/AIBadge.tsx` | trad-green-deep pill + AIPulseDot + label | ✓ VERIFIED | Composes AIPulseDot; `bg-trad-green-deep text-fresh-green`; default label "Origin" |
| `components/primitives/StatusChip.tsx` | 6-kind enum; only kind='ai' uses fresh-green | ✓ VERIFIED | `STYLES_BY_KIND` Record; ai row uses `bg-fresh-green-glow` + `bg-fresh-green`; other 5 kinds clean |
| `components/primitives/StagePill.tsx` | Circular disc 1..6 × done/current/upcoming | ✓ VERIFIED | Imports `StageNumber` from `@/types/origin`; ✓ glyph for done; `font-display font-semibold`; no fresh-green |
| `components/primitives/ActionCard.tsx` | 'use client' row primitive with button/div | ✓ VERIFIED | `'use client'` on line 1; `<button type="button">` when onClick, `<div>` otherwise; interaction states wired |
| `components/primitives/index.ts` | Barrel export of all 8 primitives + 12 types | ✓ VERIFIED | 8 `export { }` lines + 8 `export type` lines; no `export *` |
| `components/shell/RisingMark.tsx` | Brand SVG with fresh-green clock hand (allowlisted) | ✓ VERIFIED | `var(--color-fresh-green)` default for `hand` prop; 2 circles + 2 lines; aria-hidden=true |
| `components/shell/LanguageToggle.tsx` | Visual-only EN / 日本語 segments | ✓ VERIFIED | Both segments are `<span>` (NOT button/Link); `font-body` for EN, `font-jp` for 日本語; no fresh-green |
| `components/shell/ModeSwitcher.tsx` | Env-gated; retrofit #3 + #4 applied | ✓ VERIFIED | Env gate present; `border-ink-muted/30` (#3); `text-signal-amber` (#4); NO fresh-green |
| `components/shell/ClientShell.tsx` | Single-column wrapper for /(client) | ✓ VERIFIED | `min-h-[calc(100vh-56px)]`; `max-w-[1200px] mx-auto pt-9 px-10 pb-20`; server component |
| `components/shell/RMShell.tsx` | Sidebar 220px + workspace + empty copilot slot | ✓ VERIFIED | `w-[220px]` sidebar; active Cockpit dot `bg-trad-green` (#5 retrofit); NO copilot sidecar rendered; no fresh-green |
| `components/shell/TopStrip.tsx` | 'use client' chrome with all retrofits + OD-12 | ✓ VERIFIED | `usePathname` + `modeForPathname`; Avatar `color="trad-green-soft"` (#1); mail dot `bg-signal-amber` (#2); `fontVariationSettings: '"SOFT" 80, "WONK" 1'` (OD-12) |
| `app/layout.tsx` | Root layout with TopStrip above children | ✓ VERIFIED | `import { TopStrip }` present; `<TopStrip />` above `{children}` in body; IBM Plex Mono weight `['400','500']` |
| `app/(client)/layout.tsx` | Client route-group layout wrapping ClientShell | ✓ VERIFIED | Default export `ClientGroupLayout`; returns `<ClientShell>{children}</ClientShell>`; server component |
| `app/(rm)/layout.tsx` | RM route-group layout wrapping RMShell | ✓ VERIFIED | Default export `RMGroupLayout`; returns `<RMShell>{children}</RMShell>`; server component |
| `app/dev/primitives/page.tsx` | Demo page rendering all 8 primitives | ✓ VERIFIED | Lives at `app/dev/primitives/page.tsx` (outside route groups); imports all 8 from barrel; 8 sections present |
| `scripts/check-fresh-green.sh` | SHELL-05 enforcement bash script | ✓ VERIFIED | `set -euo pipefail`; 5-pattern array with RESEARCH §3 extensions; `git ls-files`; exits 0 on live repo |
| `.freshgreen-allowlist` | 7 entries + D-86 comment header | ✓ VERIFIED | 7 non-blank non-comment lines; D-86 7-line comment header |
| `scripts/check-fresh-green.test.ts` | 19 boundary-case Vitest fixtures | ✓ VERIFIED | All 201 tests pass across 19 test files including this one |
| `.github/workflows/ci.yml` | 4th fresh-green CI job | ✓ VERIFIED | `fresh-green:` job with `actions/checkout@v4` + `bash scripts/check-fresh-green.sh`; no setup-node |
| `package.json` | check:fresh-green script | ✓ VERIFIED | `"check:fresh-green": "bash scripts/check-fresh-green.sh"` present |
| `DECISIONS.md` | D-64 + D-65 + D-66 entries | ✓ VERIFIED | All three entries present with correct content |
| `.planning/REQUIREMENTS.md` | SHELL-04 amended per D-72 | ✓ VERIFIED | Contains "5 brand primitives + 3 infrastructure primitives = 8" per D-72 reword approach |
| `CLAUDE.md` | Enforcement pointer in Design system section | ✓ VERIFIED | "Enforcement" bullet added citing `scripts/check-fresh-green.sh` + `.freshgreen-allowlist` |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `vitest.config.ts` | `vitest.setup.ts` | setupFiles array | ✓ WIRED | `setupFiles: ['./vitest.setup.ts']` present |
| `vitest.setup.ts` | `@testing-library/jest-dom` | side-effect import | ✓ WIRED | `import '@testing-library/jest-dom/vitest'` present |
| `app/layout.tsx` | `components/shell/TopStrip.tsx` | TopStrip rendered above children | ✓ WIRED | Import + `<TopStrip />` both present in body |
| `app/(client)/layout.tsx` | `components/shell/ClientShell.tsx` | wraps children | ✓ WIRED | Import + `<ClientShell>{children}</ClientShell>` present |
| `app/(rm)/layout.tsx` | `components/shell/RMShell.tsx` | wraps children | ✓ WIRED | Import + `<RMShell>{children}</RMShell>` present |
| `components/shell/TopStrip.tsx` | `lib/persona.ts` | modeForPathname + PERSONAS | ✓ WIRED | Both `modeForPathname` call and `PERSONAS` lookup present |
| `components/shell/ModeSwitcher.tsx` | `lib/persona.ts PERSONA_HOME` | Link href | ✓ WIRED | `PERSONA_HOME.client` and `PERSONA_HOME.rm` used as Link hrefs |
| `components/primitives/AIPulseDot.tsx` | `app/globals.css @keyframes ai-pulse` | animate-ai-pulse utility | ✓ WIRED | `animate-ai-pulse` in className; keyframe exists in globals.css |
| `components/primitives/StagePill.tsx` | `types/origin.ts StageNumber` | import type StageNumber | ✓ WIRED | `import type { StageNumber } from '@/types/origin'` present |
| `components/primitives/index.ts` | all 8 primitive files | named re-exports | ✓ WIRED | 8 `export { }` lines enumerate all components |
| `.github/workflows/ci.yml fresh-green job` | `scripts/check-fresh-green.sh` | bash invocation step | ✓ WIRED | `bash scripts/check-fresh-green.sh` step present in fresh-green job |
| `scripts/check-fresh-green.sh` | `.freshgreen-allowlist` | mapfile/while-read | ✓ WIRED | `ALLOWLIST_FILE="${ALLOWLIST_FILE:-.freshgreen-allowlist}"` with read loop |

### Data-Flow Trace (Level 4)

All primitives and shell components render static props/constants only (no DB queries, no API calls). The persona data flows from `lib/persona.ts` constants → `TopStrip.tsx` render → browser DOM. This is not dynamic data — it is design-system static content. No Level 4 concerns apply.

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| All 201 tests pass | `npm test` | 19 test files, 201 tests, all passing | ✓ PASS |
| TypeScript compiles cleanly | `npm run typecheck` | Exits 0, no errors | ✓ PASS |
| ESLint passes | `npm run lint` | Exits 0, no errors | ✓ PASS |
| SHELL-05 grep check clean | `bash scripts/check-fresh-green.sh` | Exits 0, no violations | ✓ PASS |
| Barrel resolves all 8 | `grep "^export {" components/primitives/index.ts \| wc -l` | 8 | ✓ PASS |
| Vitest jsdom configured | `grep "environment: 'jsdom'" vitest.config.ts` | Match found | ✓ PASS |
| TopStrip in root layout | `grep "<TopStrip />" app/layout.tsx` | Match found | ✓ PASS |
| ModeSwitcher env-gated | `grep "NEXT_PUBLIC_SHOW_MODE_SWITCHER !== 'true'" components/shell/ModeSwitcher.tsx` | Match found | ✓ PASS |
| Visual rendering at 1440px | Browser required | — | ? SKIP (human needed) |

### Requirements Coverage

| Requirement | Source Plans | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| SHELL-01 | 04-08, 04-09, 04-10 | Top strip with EN / 日本語 language toggle across all screens | ✓ SATISFIED | LanguageToggle in TopStrip; TopStrip in app/layout.tsx; renders on all routes |
| SHELL-02 | 04-08, 04-10 | Dev-only mode switcher flips between /(client) and /(rm); hidden in production | ✓ SATISFIED | ModeSwitcher env-gated; composed in TopStrip; returns null when env != 'true' |
| SHELL-03 | 04-08, 04-10 | Rising Mark logo component; sized correctly; used in top strip | ✓ SATISFIED | RisingMark.tsx exists; size=24 default; SVG viewBox correct; in TopStrip |
| SHELL-04 | 04-05, 04-06, 04-07, 04-10 | Shared primitives exist and exported; SHELL-04 amended to record 8-primitive reality per D-72 | ✓ SATISFIED | All 8 primitives in barrel; all visible on /dev/primitives demo page; REQUIREMENTS.md amended |
| SHELL-05 | 04-06, 04-11 | Fresh Green exclusive to AI-output surfaces; grep check confirms absence elsewhere | ✓ SATISFIED | `bash scripts/check-fresh-green.sh` exits 0; 5 retrofits applied; 7 allowlisted files; CI job wired |

### Anti-Patterns Found

| File | Pattern | Severity | Impact |
|------|---------|----------|--------|
| `components/primitives/Eyebrow.tsx` | Comment mentions "fresh-green" (line ~3) | ℹ️ Info | Comment only — not functional code; `check-fresh-green.sh` excludes the file correctly (not an allowlisted source file — HOWEVER the script targets non-allowlisted source files, and `Eyebrow.tsx` is NOT in the allowlist. Verified: the grep in `check-fresh-green.sh` does NOT flag it because the reference is a comment string only, and the script's patterns match functional token usage not comments in context.) |

**Note on comment-only references:** Several non-AI primitive files contain JSDoc-style comments mentioning "fresh-green" to explain what they exclude (e.g., "No fresh-green tokens — this primitive is non-AI surface"). These are documentation, not violations. The live `check-fresh-green.sh` passing (exit 0) confirms the script correctly handles these — the patterns target CSS/Tailwind token syntax, not plain English words.

### Human Verification Required

### 1. TopStrip Visual Rendering

**Test:** Run `npm run dev`, navigate to `http://localhost:3000/` at 1440px width
**Expected:** TopStrip at 56px height, trad-green-deep background, Rising Mark SVG with visible fresh-green clock hand, EN / 日本語 segments as non-interactive spans (no hover cursor change), "Origin" wordmark with SOFT/WONK variation, "BY SMBC" eyebrow
**Why human:** Visual appearance (colors, font rendering, element heights) cannot be verified programmatically without a running browser

### 2. ModeSwitcher Production Safety

**Test:** Run `npm run dev` WITHOUT `NEXT_PUBLIC_SHOW_MODE_SWITCHER`; verify ModeSwitcher is absent. Then re-run WITH `NEXT_PUBLIC_SHOW_MODE_SWITCHER=true`; verify it appears with dashed border and amber DEMO eyebrow.
**Expected:** Absent without env var; present with env var showing: dashed border (paper-toned, not bright green), DEMO eyebrow in amber color, two persona links
**Why human:** Env-gated UI presence and visual accuracy of retrofit tokens (#3 amber-tinted border, #4 amber DEMO eyebrow) require browser inspection

### 3. /dev/primitives Demo Page

**Test:** Navigate to `http://localhost:3000/dev/primitives`
**Expected:** 8 primitive sections visible, all states rendered, AIPulseDot animating (gentle pulse), AIBadge showing "Origin" label with animated green dot, StatusChip showing 6 kinds with correct color coding (only kind='ai' in green)
**Why human:** Animation behavior (AIPulseDot pulse) and visual color-coding accuracy require browser verification

### 4. Retrofit Visual Accuracy

**Test:** On `http://localhost:3000/journey`, inspect TopStrip: Avatar initials "YT" background color, and mail icon notification dot color
**Expected:** Avatar background is a dark teal/green (trad-green-soft, NOT the bright #BFD730 fresh-green); mail dot is amber (NOT green). On `http://localhost:3000/cockpit`, sidebar "Cockpit" active indicator dot should be dark green (trad-green, NOT bright green).
**Why human:** Color accuracy of the 5 SHELL-05 retrofits requires human colour comparison — the programmatic check confirms tokens but not visual appearance at runtime

### Gaps Summary

No programmatic gaps found. All 4 ROADMAP success criteria (SHELL-01 through SHELL-05) are verified against actual code:

1. **SHELL-01 (TopStrip + language toggle):** TopStrip wired in root layout; LanguageToggle composed inside as non-interactive spans
2. **SHELL-02 (Dev mode switcher):** ModeSwitcher env-gated; composed in TopStrip; two persona Links to /journey and /cockpit
3. **SHELL-03 (Rising Mark logo):** RisingMark component exists; correct SVG structure; wired in TopStrip
4. **SHELL-04 (Primitives):** All 8 primitives in barrel export; visible on /dev/primitives demo page; D-72 scope extension documented
5. **SHELL-05 (Fresh Green enforcement):** Bash grep script passes (exit 0) on live repo; CI job wired; 5 prototype violations retrofitted; allowlist with 7 entries governing legitimate exceptions

The 4 human verification items concern visual rendering accuracy and production-safety confirmation — they cannot be resolved programmatically. All automated checks pass.

---

_Verified: 2026-04-27T10:22:00Z_
_Verifier: Claude (gsd-verifier)_
