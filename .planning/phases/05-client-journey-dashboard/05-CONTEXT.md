# Phase 5: Client Journey Dashboard — Context (REDO)

**Gathered:** 2026-04-27
**Status:** Ready for planning (after UI-SPEC approval)
**Supersedes:** `phase-5-spec-divergence-archive:.planning/phases/05-client-journey-dashboard/05-CONTEXT.md`

> This CONTEXT supersedes the archive CONTEXT after the W-04 process change. The archive cited `docs/ORIGIN_JOURNEY_DOC.html` and `docs/ORIGIN_DESIGN.md` as primary brand sources for dashboard-specific values without consulting `docs/ORIGIN_PROTOTYPE.html`. The redo reverses that priority: the prototype is the primary source for all dashboard-specific values; the older docs are secondary references for brand-system inheritance only.

**Prototype consulted: yes — `docs/ORIGIN_PROTOTYPE.html`.**

**Other design docs consulted:** `docs/ORIGIN_DESIGN.md` and `docs/ORIGIN_JOURNEY_DOC.html` were inventoried but **NOT used as primary sources for any dashboard-specific value in this redo**. They serve as secondary references for brand-system inheritance only (palette, typography family, voice register) — concerns that don't conflict with prototype-specific values. Where the older docs and the prototype disagree on a dashboard-specific value, the prototype wins.

---

<domain>
## Phase Boundary

Build Yuki's Client Journey Dashboard at `/(client)/journey` — the first demo-quality client surface, gating the day-3 hard schedule. The page composes 7 purpose-built components (4 new, 2 revised, 1 mostly-survived) from the Phase 4 primitive set, wired to mock seed data via `getApplicationDetail('app-kaisei')`. The page renders inside the existing `<ClientShell>` (max-width 1200, pt-9 px-10 pb-20).

**Page composition (top-to-bottom):**
1. **GreetingBlock** (NEW) — 縁 watermark + bilingual greeting + Reiwa·Gregorian date eyebrow + "47 fields overnight" summary paragraph
2. **ApplicationCard** (NEW) — hero status card; left column: stage numeral 76px + stage name + ETA date + 6-stage `StageTimeline`; right column: "What you're applying for" products list + jurisdictions flags + "In progress: N days"
3. **Three-column grid** (1.2fr 1.2fr 0.9fr, gap 20):
   - **AttentionCard** (NEW) — "For your attention · 3" + amber StatusChip + 3 ActionRows (Stage 3 lock, P-1 inert)
   - **WorkingOnYourBehalfCard** (NEW; renamed from archive AILaneCard/NarrativeRow to drop the 2-lane mental model) — AIBadge + AIPulseDot + 3 AILaneRows (live/pending/done) + Origin quote
   - **TeamCard** (REVISED) — 4-member list (James, Akiko, Priya, Origin) + "Message James" inert button (P-1)
4. **ActivityFeed** (REVISED, mostly survives) — header eyebrow + "LAST 72H" mono tag + top-6 truncated activity rows with prototype's "Time · Indicator · **Actor** — text" shape

All compositions live in `components/journey/` (new directory). The page (`app/(client)/journey/page.tsx`) replaces the Phase 2 placeholder with a Server Component that fetches seed data, computes `daysIn` server-side, and composes the 4 sections.

### Renamed from archive
- `AILaneCard` (or any "lane" wording) → `WorkingOnYourBehalfCard`. The new name matches the prototype's literal eyebrow text ("Working on your behalf") and removes the residual 2-lane mental model from the retired `NarrativeRow`.

### Out of scope for Phase 5
- Stage screen content (Phase 7+) — pills are inert
- Message routes (Phase 6+) — TeamCard CTA is inert
- Stage-aware AttentionCard / WorkingOnYourBehalfCard — for v1 the cards lock to Stage 3 (Kaisei's current stage) with static demo copy
- Language switching (visual-only toggle inherited from Phase 4 — no `locale=ja` rendering)
- RM Cockpit (Phase 6)
- Hero moments (Phase 8)
- Loading skeletons — server-rendered at 150ms mock latency, below perception threshold (D-13 carryforward)
- Hero-card bottom-edge fresh-green gradient — see OD5R-01 (default: skip)
- Per-stage ETA derivation — see OD5R-02 (default: static for v1)

</domain>

<decisions>
## Implementation Decisions

Decision numbers are Phase-5-redo-local (D-01..D-23). Cross-phase numbering for plan-level decisions starts at D-90+ (continuing the project sequence).

### Page Composition
- **D-01:** **Page renders directly inside ClientShell.** No max-width wrapper, no mx-auto, no padding on the page itself. The existing `ClientShell` (`max-w-[1200px] mx-auto pt-9 px-10 pb-20`, Phase 4 D-64) provides the container. Source: prototype `4c54d558.js:121-129` matches `components/shell/ClientShell.tsx`.

- **D-02:** **Page outer wrapper is `<div className="relative">`** to clip the absolute-positioned 縁 watermark. The watermark itself lives inside `GreetingBlock`, not at the page level — this scopes the watermark visually to the greeting and prevents it from following the user's reading down the page. Source: prototype `05bee446.js:14-15`.

- **D-03:** **No `space-y-*` band stack.** Section gaps are explicit per-section: GreetingBlock has `mb-7` (28px), ApplicationCard has `mb-6` (24px), the 3-column grid has `mb-6` (24px). The ActivityFeed is the last child with no margin. Source: prototype `05bee446.js:18, 34, 104` (`marginBottom: 28, 24, 24`).

### Watermark — corrected from archive
- **D-04:** **縁 watermark is `var(--color-trad-green)` at opacity 0.035 — NOT fresh-green.** Source: prototype CSS `template.html:4719-4720`. The archive incorrectly cited `rgba(191,215,48,0.06)` from `docs/ORIGIN_JOURNEY_DOC.html` `.cover-kanji` class. The watermark is decorative trad-green chrome; **no `.freshgreen-allowlist` entry required.**

- **D-05:** **縁 watermark font-weight is 300** (Noto Sans JP weight 300). Source: prototype CSS `template.html:4718`. The archive incorrectly used weight 200 (also from the journey doc). The Phase 5 plan adds weight 300 to `Noto_Sans_JP({ weight: ['300'], ... })` in `app/layout.tsx`.

- **D-06:** **縁 watermark dimensions:** ch="縁", `top: -40px`, `right: -60px`, `font-size: 360px` (overrides KanjiWatermark CSS default 320px), `line-height: 0.8`, `pointer-events: none`, `user-select: none`. Source: prototype `05bee446.js:15` + CSS `template.html:4715-4724`.

### Color decisions — corrected from archive
- **D-07:** **Global `:focus-visible` ring stays trad-green** (Phase 4 W-01 inheritance). The prototype's `outline: 2px solid var(--fresh-green)` global focus would put fresh-green on every focusable surface, violating CLAUDE.md's "fresh-green = AI only" rule. The redo overrides the prototype here. Source: prototype CSS `template.html:4754-4759`; CLAUDE.md "Design system" §Critical rule.

- **D-08:** **Hero card bottom-edge gradient (`.card--hero::after`) NOT shipped.** The 2px linear gradient (`var(--trad-green) → var(--fresh-green) → transparent`) at the prototype CSS `template.html:4686-4692` would make the application status card fresh-green on a non-AI surface. Phase 5 ships the hero card without the gradient (visual hierarchy preserved via `box-shadow`). See OD5R-01 if the user prefers prototype fidelity. The other `.card--hero` styles (`padding: 32px`, `border-radius: 18px`, `box-shadow: var(--shadow-card)`, `overflow: hidden`) are kept.

### Application card content
- **D-09:** **ETA date and business-day count are static demo copy.** Locked: `"Estimated completion · 29 April 2026 · 5 business days"` for Stage 3 (Documentation). The seed has no per-stage ETA field; deriving a stage-end date from `Application.targetCloseDate` (which is the activation target) would mislead. Defer dynamic per-stage ETA to a future phase that introduces `Stage.eta`. See OD5R-02.

- **D-10:** **Application ID display is "APP-KAISEI"** (uppercase project ID), not the prototype's `"APP-2026-JP-0431"`. The project's seed has `application.id = 'app-kaisei'`. The redo derives display ID via `application.id.toUpperCase()`. Source: prototype `05bee446.js:38` shows display-only ID; project seed binds the actual ID.

- **D-11:** **Jurisdictions flag list always includes 🇯🇵 first**, then maps `application.targetJurisdictions` (`['SG', 'HK', 'GB']` in seed) to `🇸🇬 🇭🇰 🇬🇧`. The prototype shows JP because Kaisei's HQ jurisdiction is Japan; the JP flag is added explicitly via a static prefix in the component. Static `JURISDICTION_FLAG: Record<string, string>` map lives in `lib/cjd.ts`. Source: prototype `05bee446.js:92`.

### Greeting block content
- **D-12:** **GreetingBlock uses a server-stable demo date** `SERVER_DEMO_DATE = new Date('2026-04-27T00:00:00Z')` (matches CLAUDE.md `currentDate: 2026-04-27`). The constant lives in `lib/cjd.ts` and feeds both `formatReiwa()` and the `Intl.DateTimeFormat('en-GB', ...)` Gregorian formatter. Reason: prevents hydration mismatch (Server Component renders during SSR; without a stable date, `new Date()` differs between SSR and any subsequent re-render). Reason 2: locks the demo to a known date (e.g., the "29 April 2026" ETA is exactly 2 days away).

- **D-13:** **Greeting EN h1: "Good morning, Yuki-san."** Static demo copy. Time-of-day "morning" is locked for v1 (the prototype hardcodes "Good morning"); deferring time-aware variants ("Good afternoon", "Good evening") to a future phase. Source: prototype `05bee446.js:24`.

- **D-14:** **Greeting JP: "おはようございます"** (no period; matches prototype). Hiragana, polite register, no honorific suffix on Yuki-san (she's first-name addressed in the EN greeting, JP greeting is general). Source: prototype `05bee446.js:26`.

- **D-15:** **Summary paragraph "47 fields" is static demo copy.** Hardcoded string. The seed lacks a `fieldCount` payload field for AI extraction events; computing the number would require seed extension. See OD5R-03 if the user prefers derivation. Source: prototype `05bee446.js:28-30`.

### Stage timeline
- **D-16:** **StageTimeline pills are inert (P-1).** No `<a>`, no `<Link>`, no `onClick`. The prototype's `onClick={() => go('client-stage-N')}` is overridden because `/stage/N` routes are Phase 7 scope. Visual states (done/current/upcoming) are unchanged; navigation is removed. See OD5R-04.

- **D-17:** **StagePill size is 34** (`size={34}`) inside the ApplicationCard hero. The Phase 4 `StagePill` primitive defaults to a different size; the chrome-metric exception is locked at 34 per prototype `05bee446.js:61`.

- **D-18:** **AIPulseDot adjacent to current pill** with `ariaLabel="AI is processing your documents"`. Carryforward from archive D-01. The current stage is read from `application.currentStage`; the dot renders only when a stage is in_progress.

### AttentionCard
- **D-19:** **AttentionCard is Stage 3 lock with static demo data.** `STAGE_3_ATTENTION_ITEMS` constant in `lib/cjd.ts` holds the 3 items. Future stages would need stage-aware copy or a derived data source — deferred. Source: prototype `05bee446.js:106-124`.

- **D-20:** **ActionRow renders as a `<div>`** (P-1 strict inert). No `<button>`, no `<a>`, no `onClick`, no `cursor-pointer`. The chevron-right icon is decorative (signals drilldown exists in Phase 7+). The prototype's `onClick={() => go('client-stage-3')}` is removed.

### WorkingOnYourBehalfCard
- **D-21:** **WorkingOnYourBehalfCard is Stage 3 lock with static demo data.** `STAGE_3_AI_TASKS` constant in `lib/cjd.ts` holds the 3 task rows (live, pending, done). Future stages would have different AI activity; deferred to a per-stage refinement.

- **D-22:** **AILaneRow live state uses the existing `AIPulseDot` primitive.** The prototype's inline `<span className="ai-pulse"></span>` is replaced with `<AIPulseDot ariaLabel="AI live task" />` to reuse the Phase 4 primitive. The prototype's CSS class and the primitive produce visually equivalent output (8px fresh-green dot with 2s pulse animation).

### TeamCard
- **D-23:** **TeamCard renders 4 members** from `TEAM_MEMBERS` constant in `lib/cjd.ts`. The constant is the canonical Phase 5 source for the team list — cleaner than extending `seedUsers` for dashboard-display-only data. **OD5R-06 resolved (2026-04-27):** Constant for Phase 5 is the v1 choice. **Known migration path:** if Phase 6 RM Cockpit needs Akiko/Priya as first-class users, migrate `TEAM_MEMBERS` to `seedUsers` rows (`user-akiko-sato`, `user-priya-nair`) with a new `UserRole` value (`types/origin.ts` change → cross-GSD review). Revisit when Phase 6 scope firms up. Tracked in §Deferred Ideas > Akiko/Priya seed migration.

- **D-24:** **AvatarColor closed enum is extended with 3 new values:** `'signal-info'`, `'warm-amber'`, `'fresh-green'`. The Phase 4 enum (Phase 4 D-78) deliberately excluded fresh-green; Phase 5 lifts the exclusion **for the AI member only**, type-system-policed via the closed enum extension. The Avatar primitive file `components/primitives/Avatar.tsx` is added to `.freshgreen-allowlist` in this phase. **Boundary-file convention note:** `components/primitives/Avatar.tsx` is Kit-owned and **not** one of the four shared-boundary files (`types/origin.ts`, `lib/api.ts`, `lib/api.mock.ts`, `lib/api.real.ts` per CLAUDE.md "Working principles" + `.github/CODEOWNERS` D-08). No cross-GSD owner sign-off (Evan) is required. The convention being followed: a Phase N+ plan task may modify any Kit-owned Phase 4 primitive additively (closed-enum extensions, additive props) without cross-GSD review. Breaking changes to a primitive's existing API would warrant a heads-up but still don't trigger CODEOWNERS. The Phase 5 plan touching `Avatar.tsx` follows this convention.

- **D-25:** **Avatar `textColor` prop is added** to the primitive. Default remains `'paper'`; Origin uses `'trad-green-deep'` (dark text on fresh-green background). Source: prototype `05bee446.js:156`. This is an additive primitive change; backward-compatible.

- **D-26:** **"Message James" button is inert (`disabled`).** `<button type="button" disabled aria-disabled="true">` — visible, hover/focus styles apply per W-01, but no onClick. Phase 6 lifts the disabled flag and wires the route. Reason: the demo benefits from the affordance being visible (Yuki sees there IS a way to message James); inert avoids broken navigation. See OD5R-04.

### ActivityFeed
- **D-27:** **ActivityFeed adopts the prototype's row shape:** `<Time · Indicator · **Actor** — text>`. Time in 80px-wide IBM Plex Mono column; indicator is an 8×8 dot colored by `actorType` (ai → fresh-green, rm → signal-info, client/system → ink-muted); actor name in 13/500 ink; text in 13/normal ink-soft. The archive's `<Indicator + copy + timestamp-right>` shape retires.

- **D-28:** **`eventToCopy` map carries forward unchanged** from archive `lib/cjd.ts`. The 13 Kaisei activity copy strings (keyed by `act-kaisei-001..013`) are stable demo copy. Reused verbatim.

- **D-29:** **Top-6 truncation carries forward** from archive D-04. `topNActivities(activities, 6)` sorts desc by `createdAt`, slices 6. No "View all" link (P-1 inert; the route doesn't exist).

- **D-30:** **Relative timestamp format:** `formatActivityRelativeTime(iso, SERVER_DEMO_DATE)` produces "HH:mm UTC" (same-day), "Yesterday" (1 day ago), "MMM dd" (2-7 days), "MMM dd" (>7 days). Source: prototype `0a3f3e90.js:101-108` for friendly relative format ("09:14 JST", "Yesterday", "Apr 02"). The prototype's "JST" suffix is replaced with "UTC" — neutral, no user-timezone concept in v1.

### lib/cjd.ts module
- **D-31:** **`lib/cjd.ts` is the dashboard helper module.** Carries forward archive D-14 with revised function set. Exports:
  - `SERVER_DEMO_DATE: Date` constant (D-12)
  - `formatReiwa(date: Date): string` (new, ports prototype `77ddc8bb.js:154-160`)
  - `stageStatusToPillState(status: StageStatus): StagePillState` (carryforward)
  - `eventToCopy(activity: Activity): string` (carryforward)
  - `eventToActorDisplay(activity: Activity): string` ("Origin"/"James Lee"/"Yuki Tanaka"/"System")
  - `eventToDotColor(activity: Activity): string` (CSS color value)
  - `formatActivityRelativeTime(iso: string, now: Date): string` (D-30, replaces archive `formatActivityTimestamp`)
  - `topNActivities(activities, n): Activity[]` (carryforward archive D-04)
  - `computeDaysIn(openedAt: string, now: Date): number` (new)
  - `STAGE_3_ATTENTION_ITEMS: readonly AttentionItem[]` (D-19)
  - `STAGE_3_AI_TASKS: readonly AILaneItem[]` (D-21)
  - `TEAM_MEMBERS: readonly TeamMember[]` (D-23)
  - `PRODUCT_DISPLAY_LABEL: Record<ProductType, { label: string; detail: string }>` (D-10)
  - `JURISDICTION_FLAG: Record<string, string>` (D-11)
- The retired archive helpers `etaContextEyebrow` and `currentStageActor` do NOT carry forward (their consumers — HeroBlock and NarrativeRow — retire).

### Inheritance & W-01 alignment
- **D-32:** **W-01 (interaction-state timing) is enforced verbatim.** All interactive surfaces use `transition-colors duration-200 ease-out`; focus rings are `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-trad-green` (trad-green per D-07). Inert surfaces (StageTimeline pills, ActionRow, ActivityFeed rows) do NOT add hover or focus styles since they are not interactive.

- **D-33:** **W-02 (D-89 hybrid styling) is enforced verbatim.** Tailwind utilities for structure/typography; `@theme` tokens for design-system values; inline `style=` props ONLY where prototype-locked numeric chrome metrics or `fontVariationSettings` demand it. NO `@apply` mixed with utilities on the same surface.

- **D-34:** **W-03 (Fraunces SOFT/WONK inline) is enforced verbatim.** All Fraunces consumers in Phase 5 declare `fontVariationSettings` inline at the usage site:
  - GreetingBlock h1: `'"SOFT" 80, "WONK" 1'` (matches prototype `.t-display`)
  - Hero stage numeral: `'"SOFT" 60, "WONK" 1'` (matches prototype `.t-numeral`)
  - "/6" companion: `'"SOFT" 60, "WONK" 0'` (locked verbatim from prototype `05bee446.js:43`)
  - "In progress" numeral: `'"SOFT" 60, "WONK" 1'` (matches `.t-numeral`)
  - Stage name (20px Fraunces): no SOFT/WONK in prototype source (`05bee446.js:45` does not declare them); inherits Fraunces defaults

### Phase 5 Principles

- **P-1 (REDO) — Strict read-only chrome posture.** No surface in Phase 5 navigates. StageTimeline pills, AttentionCard ActionRows, TeamCard "Message James" button, ActivityFeed rows — all inert. Visual interactivity (hover/focus styles per W-01) is allowed where the surface is meant to be interactive in a future phase (TeamCard's button); explicitly NOT allowed where the surface is purely informational (ActivityFeed rows, ActionRows). Routes deferred to Phase 6 (`/messages`) and Phase 7 (`/stage/N`). The prototype's clickable surfaces are explicitly overridden. **This is the user-approved replacement for archive P-1; the new posture is stricter and reflects the W-01 carryforward without exception.**

- **P-2' (REDO) — 縁 watermark weight 300 is a chrome-metric exception, not a typography token.** Noto Sans JP weight 300 is loaded for the single off-canvas decorative glyph at 0.035 opacity. It MUST NOT be used in any typographic context (body, label, numeral, heading), referenced by any Tailwind class, or surface as a font-weight class on any element other than the watermark. The `next/font` weight addition in `app/layout.tsx` is annotated `// Phase 5 watermark exception — single-glyph decorative use only`. Replaces archive P-2 (which incorrectly cited weight 200). The 4-family + 3-weight (400/500/600) typography matrix is unchanged. **Bundle hygiene — weight 200 explicit decision:** The current `app/layout.tsx` Noto Sans JP config does NOT load weight 200 (it currently passes no `weight` argument because Noto Sans JP is variable on Google Fonts; the Phase 5 plan task verifies whether variable-mode covers weight 300 or whether `weight: ['300']` must be passed explicitly). **The redo MUST NOT add weight 200.** No Phase 5 surface needs it; the archive's weight-200 was sourced from `docs/ORIGIN_JOURNEY_DOC.html` which is no longer the primary source. If a previous Phase 4 or Phase 5 archive change had introduced weight 200 into the next/font config, the Phase 5 plan removes it (bundle hygiene). The only Phase 5 Noto Sans JP weight exception is **300, exclusively**.

- **P-3 (REDO retired)** — the archive's "Hero AI StatusChip is explicitly absent" principle no longer applies. The redo's Hero card (ApplicationCard) is not an AI surface; the AI presence on the dashboard lives in the WorkingOnYourBehalfCard, which is a separate card with its own AI surfaces (AIBadge, AIPulseDot, fresh-green tints). No "explicit absence" needed — the AI surfaces are explicitly present where they belong.

- **P-4 (NEW) — Prototype is the primary source for dashboard-specific values.** Per W-04 posture #1. When a dashboard value (dimension, color, copy, structure) is found in `docs/ORIGIN_PROTOTYPE.html`, that value wins. Where the prototype is silent and the value is brand-system inheritance (palette, typography family, voice register), `CLAUDE.md` and Phase 4 inheritance apply. `docs/ORIGIN_DESIGN.md` and `docs/ORIGIN_JOURNEY_DOC.html` are secondary references for brand-system inheritance only — they DO NOT override prototype-specific values.

- **P-5 (NEW) — Fresh-green allowlist surfaces are AI-output or AI-presence only.** The watermark (trad-green), the hero card bottom gradient (skipped, OD5R-01), and the global focus ring (overridden to trad-green) are all NOT fresh-green in the redo. Allowlist entries are reserved for: (1) AIBadge fresh-green text + dot, (2) AIPulseDot fresh-green dot, (3) `.card--ai` fresh-green tint background + 35% border (WorkingOnYourBehalfCard), (4) AILaneRow fresh-green border + pending-state dot, (5) ActivityFeed AI-actor indicator dot, (6) TeamCard Origin avatar fresh-green background.

### Claude's Discretion

- Plan granularity (how many atomic plans, how compositions are bundled) — planner decides per dependency analysis. The redo wave proposal in `REDO-SURVEY.md` is a strawman.
- Exact function signatures in `lib/cjd.ts` (D-31 sets the module surface and minimum function list; planner picks final TypeScript signatures).
- Whether to define `--color-warm-amber: #8a5e0a` as a new `@theme` token (consistent with palette discipline) or use the literal hex inline (Priya avatar). UI-SPEC default: define the token.
- Whether to define `--color-signal-info` Avatar background variant (it's already a `--color-signal-info` token; the question is whether to add the corresponding `bg-signal-info` Tailwind utility). UI-SPEC default: yes — the Avatar primitive needs the `BG_BY_COLOR` map entry.
- Whether the Origin quote uses `<blockquote>` or `<div>` semantically. UI-SPEC default: `<div>` (the prototype uses div; semantically the quote is decorative, not source-attribution).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Primary source — prototype (W-04 posture)
- **`docs/ORIGIN_PROTOTYPE.html`** — The 9.5 MB self-contained bundle. Reading guidance: the file is a base64-encoded, gzip-compressed multi-asset bundle. Plan-phase agents reading this file must extract the relevant module(s) — `05bee446.js` is the `ClientDashboard` source (233 lines uncompressed); `77ddc8bb.js` is the shared primitives module (215 lines); `0a3f3e90.js` is the seed data (161 lines); `4c54d558.js` is the app shell + router (275 lines); the `template.html` `<style>` block (lines 4515-4770) holds the CSS variables and class definitions. The redo extraction tooling and source line references are documented inline in `05-UI-SPEC.md` for verifiability.

### Requirements and scope
- `.planning/ROADMAP.md` §Phase 5 — Goal, success criteria, dependencies
- `.planning/REQUIREMENTS.md` §CJD-01..CJD-07 — The 7 surface-level requirements this phase closes (note: CJD-04's "Your turn / Our turn" wording is from the older `docs/ORIGIN_JOURNEY_DOC.html` mockup; the redo interprets CJD-04 as paired-card narrative pattern — see UI-SPEC §Coverage and OD5R-07)

### Design contract
- `.planning/phases/05-client-journey-dashboard/05-UI-SPEC.md` (this redo) — The complete design, typography, spacing, color, component, copywriting, and interaction contract. MUST read before planning.

### Brand-system inheritance (secondary references — DO NOT use for dashboard-specific values)
- `docs/ORIGIN_DESIGN.md` §8.1 typography family, §8.2 weight matrix, §8.5 motion baseline, §8.6 voice register
- `docs/ORIGIN_JOURNEY_DOC.html` — older mockup, superseded by prototype for dashboard scope. Used only for cross-checking that the brand palette is consistent (it is). Explicitly NOT consulted for any value in this UI-SPEC.

### Data and API layer
- `data/seed.ts` — Kaisei application (`app-kaisei`), 13 Activity events with `eventType` / `actorType` / `payload` / timestamps, James persona (`rm-james`), Yuki persona (`client-yuki`)
- `lib/api.mock.ts` — `getApplicationDetail` return shape (`ApplicationDetail`), `LATENCY_MS.getApplicationDetail = 150`. Phase 5 page calls `apiClient.getApplicationDetail('app-kaisei')` (single round-trip, D-08-equivalent in archive)
- `lib/api.ts` — API client interface
- `types/origin.ts` — `ApplicationDetail`, `Activity`, `User`, `Stage`, `Application`, `StageNumber`, `StageStatus` types; shared boundary with Evan's scope. Phase 5 does NOT modify this file (the AvatarColor extension is in `components/primitives/Avatar.tsx`, not `types/origin.ts`).

### Constants and utilities
- `lib/stages.ts` — `STAGE_NAMES` (stage names MUST be sourced from this constant, not hard-coded in JSX), `deriveStages()` (StageTimeline wires this output)
- `lib/persona.ts` — `PERSONAS.client` (Yuki), `PERSONAS.rm` (James), `PERSONA_HOME.client = '/journey'`

### Shell and primitives
- `app/(client)/layout.tsx` — wraps Phase 5 page in `<ClientShell>`
- `components/shell/ClientShell.tsx` — `max-w-[1200px] mx-auto pt-9 px-10 pb-20` container; **matches prototype values verbatim** (1200 / 36 / 40 / 80)
- `components/primitives/` — All 8 Phase 4 primitives (barrel). Import via `components/primitives/index.ts` only — no deep imports.
- `components/primitives/Avatar.tsx` — Phase 5 plan extends the `AvatarColor` closed enum (D-24) and adds a `textColor` prop (D-25). This file moves into `.freshgreen-allowlist` for the new fresh-green Avatar variant.
- `app/globals.css` — `@theme` block (all design tokens); `@source not "../.planning/**"` exclusion (EG-01 mitigation). Phase 5 plan adds `--color-warm-amber: #8a5e0a` (or equivalent token) for Priya's avatar.
- `app/layout.tsx` — `next/font` config; Phase 5 plan adds Noto Sans JP weight 300 to the `Noto_Sans_JP({ weight: ... })` array (currently the call has no `weight` because Noto Sans JP is variable on Google Fonts; the plan must verify that variable mode loads weight 300, or pass `weight: ['300', '400']` explicitly).

### Enforcement
- `.freshgreen-allowlist` — Existing Phase 4 entries (7 files); Phase 5 adds:
  - `components/journey/WorkingOnYourBehalfCard.tsx` (card--ai surface)
  - `components/journey/ActivityFeed.tsx` (AI-actor indicator dot)
  - `components/journey/TeamCard.tsx` (Origin avatar)
  - `components/primitives/Avatar.tsx` (the new fresh-green AvatarColor variant)
  - `lib/cjd.ts` (the `TEAM_MEMBERS` array contains `color: 'fresh-green'` and the `STAGE_3_AI_TASKS` constant contains references)

  **The 縁 watermark surface (`components/journey/GreetingBlock.tsx`) is NOT added** — the watermark is trad-green (D-04), not fresh-green.

- `scripts/check-fresh-green.sh` — SHELL-05 enforcement script; must pass at 0 violations in Phase 5 PR
- `CLAUDE.md` §Cross-phase watch items — W-01, W-02, W-03 enforced on Phase 5 surfaces; W-04 posture applied (Pre-Population Receipt explicit, prototype consultation explicit; this CONTEXT carries the explicit "Prototype consulted: yes — `docs/ORIGIN_PROTOTYPE.html`" field per W-04 posture #4)

### Archive references (for redo salvage)
- `phase-5-spec-divergence-archive` branch — preserves the divergent Phase 5 implementation. `REDO-SURVEY.md` (just-written) classifies each archive item as SURVIVES / REVISES / RETIRES / NEW. Reusable archive code: `lib/cjd.ts` core helpers (most), `ActivityFeed` test patterns, `StageTimeline` connector logic, `eventToCopy` map.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable assets (Phase 4 primitives — composed unchanged)
- **`Eyebrow`** — IBM Plex Mono 10.5px, 500 weight, ink-muted, 0.16em tracking. Used in every card header and inline meta surface.
- **`StatusChip`** — closed `kind` enum. Phase 5 consumes `kind="amber"` (AttentionCard header). The "Due this week" copy is supplied as `children`.
- **`StagePill`** — `{ n, state, size? }`. Renders ✓ for done, numeral otherwise. State colors locked. Phase 5 passes `size={34}`. **Inert in Phase 5 (D-16).**
- **`AIPulseDot`** — CSS-animated fresh-green dot, allowlisted. Used adjacent to current stage pill (D-18) AND inside AILaneRow live state (D-22). Phase 4 default `ariaLabel="AI active"` is overridden where context demands (`"AI is processing your documents"` for the StageTimeline; `"AI live task"` for the AILaneRow).
- **`AIBadge`** — rounded pill, fresh-green-allowlisted. Phase 5 uses default `children="Origin"` in WorkingOnYourBehalfCard header.
- **`Icon`** — closed `IconName` union. Phase 5 consumes: `chevron-right`, `mail`, `check`. All present in Phase 4 union — no new icon names.
- **`Avatar`** — `{ initials, size?, color, textColor? }`. **Phase 5 extends the `AvatarColor` closed enum** (D-24) with `signal-info`, `warm-amber`, `fresh-green`. The `textColor` prop is also a Phase 5 addition (D-25).
- **`ActionCard`** — Phase 4 primitive for interactive rows. **NOT used directly in Phase 5** — the AttentionCard's `ActionRow` is a Phase-5-local sub-component matching the prototype's exact ActionRow shape (which differs from `ActionCard`'s API and is inert per D-20). The redo composes a bespoke row rather than coercing `ActionCard` to inert mode.

### Established patterns (carryforward from Phase 4)
- **D-89 hybrid styling (W-02):** Tailwind utilities for structure/typography; `@theme` tokens for design-system values; `@keyframes` carve-out for animations only. `fontVariationSettings` and chrome-metric `font-size` via inline `style=` only. No `@apply`. No half-in/half-out per surface.
- **W-01 interaction language:** `transition-colors duration-200 ease-out` on interactive surfaces; `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-trad-green` (trad-green per D-07). Substrate paper → outline trad-green.
- **W-03 Fraunces axis declarations:** `fontVariationSettings` inline at usage site. See D-34 above for the per-surface axis values.

### Integration points
- **`app/(client)/journey/page.tsx`** — Currently the Phase 2 placeholder. Phase 5 FULLY REPLACES this with a Server Component:
  ```tsx
  export default async function ClientJourneyPage(): Promise<ReactElement> {
    const detail = await api.getApplicationDetail('app-kaisei')
    const daysIn = computeDaysIn(detail.application.openedAt, SERVER_DEMO_DATE)
    return (
      <div className="relative">
        <GreetingBlock />
        <ApplicationCard application={detail.application} stages={detail.stages} daysIn={daysIn} />
        <div className="grid mb-6" style={{ gridTemplateColumns: '1.2fr 1.2fr 0.9fr', gap: 20 }}>
          <AttentionCard />
          <WorkingOnYourBehalfCard />
          <TeamCard rm={detail.rm} />
        </div>
        <ActivityFeed activities={detail.recentActivities} />
      </div>
    )
  }
  ```
- **`app/(client)/layout.tsx`** — ClientShell wraps content. Phase 5 page renders inside without modifying the layout.
- **`lib/api.mock.ts`** — `getApplicationDetail('app-kaisei')` returns `ApplicationDetail` synchronously (150ms simulated). Single fetch the page makes.

### Files that change in Phase 5
- **NEW**: `components/journey/GreetingBlock.tsx`, `ApplicationCard.tsx`, `StageTimeline.tsx`, `AttentionCard.tsx`, `WorkingOnYourBehalfCard.tsx`, `TeamCard.tsx`, `ActivityFeed.tsx`, `index.ts` (barrel)
- **NEW**: `lib/cjd.ts`
- **MODIFIED**: `components/primitives/Avatar.tsx` (D-24 + D-25 — closed enum extension + textColor prop)
- **MODIFIED**: `app/layout.tsx` (D-05 — Noto Sans JP weight 300 added to next/font config)
- **MODIFIED**: `app/globals.css` (define `--color-warm-amber` token; the `bg-warm-amber` utility is generated by Tailwind v4 from the `@theme` block)
- **MODIFIED**: `app/(client)/journey/page.tsx` (replaces Phase 2 placeholder)
- **MODIFIED**: `.freshgreen-allowlist` (5 new entries — see Enforcement section above)
- **NEW (test files)**: corresponding `*.test.tsx` for each new/modified component + `lib/cjd.test.ts`

### Files that do NOT change in Phase 5
- `types/origin.ts` — no shared-boundary changes (the AvatarColor extension is local to the primitive)
- `lib/api.ts`, `lib/api.mock.ts`, `lib/api.real.ts` — no API surface changes
- `lib/stages.ts`, `lib/persona.ts` — no changes
- `data/seed.ts` — no changes (the prototype's per-stage AI tasks and attention items live in `lib/cjd.ts` constants, not in the seed; see OD5R-03, OD5R-06)
- `components/primitives/{Eyebrow,StatusChip,StagePill,AIPulseDot,AIBadge,ActionCard,Icon}.tsx` — composed unchanged
- `components/shell/ClientShell.tsx`, `TopStrip.tsx` — composed unchanged
- `app/(client)/layout.tsx` — wraps Phase 5 page unchanged

</code_context>

<specifics>
## Specific Locked Values

- **縁 watermark CSS contract:** `<div className="watermark-en" style={{ position: 'absolute', top: '-40px', right: '-60px', fontSize: '360px', fontWeight: 300, color: 'var(--color-trad-green)', opacity: 0.035, lineHeight: 0.8, pointerEvents: 'none', userSelect: 'none' }}>縁</div>`. Source: prototype `template.html:4715-4724` + `05bee446.js:15`.

- **`SERVER_DEMO_DATE`:** `new Date('2026-04-27T00:00:00Z')`. The redo locks the demo to this date so Reiwa formatting, Gregorian formatting, "In progress: N days", and "29 April 2026" ETA are all stable.

- **`daysIn` computation:** `Math.round((SERVER_DEMO_DATE.getTime() - Date.parse(application.openedAt)) / 86400000)`. For Kaisei (`openedAt: '2026-03-25T08:00:00Z'`): ≈33 days.

- **Reiwa formatting:** `formatReiwa(SERVER_DEMO_DATE)` → `"令和8年4月27日"`. Algorithm: Reiwa year = year - 2018; format `令和${year}年${month}月${day}日`. Source: prototype `77ddc8bb.js:154-160`.

- **Gregorian formatting:** `new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(SERVER_DEMO_DATE)` → `"Monday, 27 April 2026"`. Source: prototype `05bee446.js:7`.

- **AvatarColor enum (post-Phase-5):** `'trad-green' | 'trad-green-soft' | 'trad-green-deep' | 'ink' | 'ink-muted' | 'paper' | 'mist' | 'signal-info' | 'warm-amber' | 'fresh-green'`. The 3 new values are AI presence (`fresh-green`) plus team accent palette (`signal-info`, `warm-amber`).

- **`ActivityFeed` adapter inputs:** the `ActivityRow` props `{ t, actor, kind, text, dotColor }` are computed via `lib/cjd.ts` adapters from each `Activity`. Direct event-type → indicator chain: `actorType === 'ai'` → fresh-green dot; `actorType === 'rm'` → signal-info dot; `actorType === 'client' | 'system'` → ink-muted dot.

- **AttentionCard count display:** the eyebrow renders `"For your attention · ${STAGE_3_ATTENTION_ITEMS.length}"`. The `.t-eyebrow` CSS uppercases the text, producing `"FOR YOUR ATTENTION · 3"`.

- **Origin avatar specifics:** `<Avatar initials="◉" color="fresh-green" textColor="trad-green-deep" size={34} />`. The `◉` glyph is a fisheye character (U+25C9) from the prototype seed `0a3f3e90.js:114`.

</specifics>

<deferred>
## Deferred Ideas

### Hero card bottom-edge gradient (OD5R-01)
The prototype's `.card--hero::after` 2px linear gradient (`var(--trad-green)` → `var(--fresh-green)` → `transparent`) is NOT shipped per D-08. If the user prefers prototype fidelity, ship the gradient with a 5th allowlist entry on `components/journey/ApplicationCard.tsx` and a brand-iconographic-accent rationale. Tracked as OD5R-01 — pre-plan-phase decision.

### Per-stage ETA derivation (OD5R-02)
Static `"29 April 2026 · 5 business days"` ships in Phase 5 (D-09). A future phase can extend the `Stage` type with an `eta: string | null` field (cross-GSD type change) and add a `formatStageETA(stage, now): string` helper that produces the locked copy dynamically.

### "47 fields" greeting summary derivation (OD5R-03)
Static `"47 fields of document extraction"` ships in Phase 5 (D-15). A future phase can extend `Activity.payload` with a `fieldCount: number` for AI extraction events and derive the headline from the most recent extraction event in the seed.

### Stage screen routes (`/stage/N`) — Phase 7
StageTimeline pills and AttentionCard ActionRows render inert in Phase 5 (D-16, D-20). When Phase 7 ships stage screens, the redo's plan files for these components will need updating to add navigation: pills become `<Link href={`/stage/${n}`}>` wrappers; ActionRows become `<button onClick>` or `<Link>` per the action's intent.

### Messages route (`/messages`) — Phase 6
TeamCard "Message James" button renders disabled in Phase 5 (D-26). Phase 6 lifts the disabled flag and wires the route. The button text and icon are unchanged at Phase 6 lift.

### Time-of-day greeting variants
`"Good morning, Yuki-san."` is locked for v1 (D-13). A future phase can introduce time-of-day variants (afternoon/evening) wired to the user's local timezone — but the SSR hydration constraint (D-12) means a static demo date is preferred for the demo.

### JP timestamp variant (carryforward from archive)
**OD-JP-TIMESTAMP:** When locale switching is implemented (future phase), the activity feed timestamp format requires a Japanese equivalent. Current English: `"09:14 UTC"` (same-day) / `"Yesterday"` / `"Apr 22"`. Japanese candidates: `"09:14 UTC"` / `"昨日"` / `"4月22日"`. Defer to the locale-switching phase's discuss-phase.

### CJD-04 wording amendment (OD5R-07)
REQUIREMENTS.md CJD-04 currently reads "Paired narrative row renders using the 'Your turn / Our turn' pattern from the existing HTML mockup." The redo interprets this as paired-card narrative pattern (AttentionCard + WorkingOnYourBehalfCard) per OD5R-07 and marks CJD-04 satisfied. Recommend a follow-up REQUIREMENTS.md amendment to update the wording to reflect the prototype's two-card composition. Tracked as a Phase-5-adjacent task; out of Phase 5 plan scope.

### CJD-02 wording amendment (OD5R-09)
REQUIREMENTS.md CJD-02 currently reads "Hero section shows bilingual greeting (English + Japanese), 縁 (en) watermark, and an ETA hero number drawn from mock seed." The redo interprets this as stage-numeral hero (per prototype) with ETA *date* as supporting text below — see OD5R-09. Recommend a follow-up REQUIREMENTS.md amendment to read: "Hero section shows bilingual greeting (English + Japanese), 縁 (en) watermark, and a stage numeral with ETA date as supporting text" reflecting the prototype's design intent. Pair this amendment with the CJD-04 amendment above; ship both as a single follow-up PR after Phase 5 lands.

### Akiko/Priya seed migration (OD5R-06 v1 escape hatch)
`TEAM_MEMBERS` lives in `lib/cjd.ts` as a constant for v1 (D-23). If Phase 6 RM Cockpit needs Akiko Sato (Credit Analyst) and Priya Nair (KYC Operations Lead) as first-class `User` objects (e.g., visible in cockpit search, attached to other applications, addressable in the messages route), migrate the constant to `seedUsers` rows with a new `UserRole` value. Migration cost: cross-GSD review (touches `types/origin.ts`); benefit: dashboard team aligns with the broader user model. Revisit when Phase 6 scope firms up.

### Phase 5 → REQUIREMENTS.md follow-ups (paired amendment PR)
Two amendments to REQUIREMENTS.md, to be shipped together after Phase 5 lands:
1. **CJD-04**: "paired narrative row Your turn / Our turn" → "paired-card narrative pattern (action card + AI activity card)" reflecting the prototype.
2. **CJD-02**: "ETA hero number" → "stage numeral with ETA date as supporting text" reflecting the prototype.
Out of Phase 5 plan scope; flagged here so they're not lost. The amendment PR is also the right place to add a brief paragraph explaining the W-04 process change so future readers understand why the wording shifted.

</deferred>

---

*Phase: 05-client-journey-dashboard (REDO)*
*Context gathered: 2026-04-27*
*Prototype consulted: yes — `docs/ORIGIN_PROTOTYPE.html`*
*Other design docs consulted as secondary references for brand-system inheritance only; prototype is the primary source for all dashboard-specific values.*
