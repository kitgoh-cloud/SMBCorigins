# Phase 5 Redo Survey — Client Journey Dashboard

**Produced:** 2026-04-27
**Purpose:** Classify each piece of work from the archive branch against the prototype (`docs/ORIGIN_PROTOTYPE.html`) before re-spec. This survey is INPUT to the new UI-SPEC — it is not the spec itself.

**Archive branch:** `phase-5-spec-divergence-archive`
**Prototype consulted:** `docs/ORIGIN_PROTOTYPE.html` (9.5 MB self-contained bundle; `ClientDashboard` component + `window.ORIGIN_DATA.kaisei` fully extracted and read)

---

## Prototype Summary — What the Prototype Actually Shows

**`ClientDashboard` page structure (top to bottom):**

1. **縁 watermark** — `KanjiWatermark ch="縁" top={-40} right={-60} size={360}` — at the page level, same decorative element.

2. **Greeting block** (free-floating, not inside a card):
   - Eyebrow: Reiwa date · Gregorian date (e.g., `令和8年4月27日 · Sunday, 27 April 2026`)
   - H1: "Good morning, Yuki-san." (fontSize 44, `t-display`, weight 400)
   - JP: "おはようございます" (fontSize 22, `ink-muted`)
   - Summary paragraph: "Your onboarding with SMBC is on track. Origin handled **47 fields of document extraction** overnight — two items need your attention today."

3. **Hero status card** (`card card--hero`, full-width, 2-column grid `1.4fr 1fr`):
   - **Left column:** Application ID eyebrow · stage number (76px Fraunces) `/6` · stage name (Documentation) · ETA date ("Estimated completion · 29 April 2026 · 5 business days") · **6-stage pill strip** (inline, clickable, inside the card)
   - **Right column:** (behind a vertical hairline divider) "What you're applying for" list of products with detail lines · jurisdictions flag row · "In progress: N days" counter

4. **Three-column grid** (`1.2fr 1.2fr 0.9fr`, gap 20):
   - **Col 1 — "For your attention · 2"** card: amber StatusChip "Due this week" + 3 `ActionRow` items (clickable, navigate to stage-3)
   - **Col 2 — "Working on your behalf"** card (`card--ai`): `AIBadge "Origin"` + "Working on your behalf" eyebrow + `AIPulse` dot + 3 `AILaneRow` items (live / in-progress / done) + Origin quote ("I'll flag anything you need to decide — otherwise the work just moves forward.")
   - **Col 3 — "Your team"** card: 4 members (James Lee, Akiko Sato, Priya Nair, Origin) each with 34px avatar + name + role + location; "Message James" button (navigates to `client-messages`)

5. **Activity feed** (`card`, full-width): "Recent activity" eyebrow + "LAST 72H" meta tag + list of `ActivityRow` items.

**Team data from `window.ORIGIN_DATA.kaisei.team`:**
| Name | Role | Location | Initials | Color |
|------|------|----------|----------|-------|
| James Lee | Relationship Manager | SMBC Singapore | JL | `#1A5F48` (trad-green variant) |
| Akiko Sato | Credit Analyst | SMBC Tokyo | AS | `#2A6F97` (signal-info) |
| Priya Nair | KYC Operations Lead | SMBC Singapore | PN | `#8a5e0a` (warm amber) |
| Origin | AI orchestrator | — | ◉ | `#BFD730` (**fresh-green** — requires new allowlist entry) |

---

## A — `lib/cjd.ts` — helper module

**Verdict:** REVISES

**Reasoning:** The core helper suite (stageStatusToPillState, eventToCopy, eventToIcon, eventToStatusChipKind, topNActivities, formatActivityTimestamp, currentStageActor) maps cleanly to the prototype's data needs. The prototype's activity feed uses the same event taxonomy, the same indicator logic (AI vs RM vs client actors), and the same 72h/recent-N truncation pattern. However, two helpers need revision or addition: `etaContextEyebrow` was designed for the 96px days-countdown numeral (archive D-09), which is gone — the prototype shows a date-based ETA string ("Estimated completion · 29 April 2026 · 5 business days"), making `etaContextEyebrow` misspecified. Additionally, the greeting block needs a `formatReiwa(date)` helper that produces the Reiwa year/date string. The `currentStageActor` mapping still drives the AI card's conditional rendering but feeds a different component.

**Pointer:** `phase-5-spec-divergence-archive:lib/cjd.ts`

**Caveats:**
- `etaContextEyebrow` — keep the function, but the redo UI-SPEC must redefine what "ETA" means on the dashboard (date-based vs day-count). The 96px ETA numeral concept is gone; the hero now shows stage number (current stage, 76px) not days.
- `formatReiwa` — new helper needed; pure function, easy to add.
- `currentStageActor` — still valid; now drives whether the AI card shows `AIPulse` (always present per prototype) vs conditional rendering. The redo spec needs to clarify.
- The `COPY_BY_STAGE` lookup inside `NarrativeRow.tsx` moves into the redo's `AttentionCard` and `AILaneCard` components — the stage-specific copy data is still needed, but resides in the component files or a new `cjd-copy.ts` sub-module.

---

## B — Noto Sans JP weight 200 + 4 fresh-green allowlist entries

**Verdict:** SURVIVES (font config); REVISES (allowlist entries)

**Reasoning:** The 縁 watermark survives in the redo — same character, same sizing, same positioning. Noto Sans JP weight 200 is still needed for this single decorative surface. The existing 4 allowlist entries cover `HeroBlock`, `ActivityFeed`, `StageTimeline`, and `NarrativeRow`. Of those, `HeroBlock` and `NarrativeRow` are being replaced by new components; `StageTimeline` moves inside `ApplicationCard`; `ActivityFeed` survives. The redo will need updated allowlist entries for the new component files, plus a **new entry for `TeamCard`** (Origin's avatar uses `#BFD730` = fresh-green per the prototype data). The Noto Sans JP weight-200 addition in `app/layout.tsx` is untouched.

**Pointer:** `phase-5-spec-divergence-archive:app/layout.tsx`, `.freshgreen-allowlist`

**Caveats:**
- Origin avatar (`color="#BFD730"`) in TeamCard is a new fresh-green surface not in the archive at all. The redo MUST add `components/journey/TeamCard.tsx` to `.freshgreen-allowlist`.
- `NarrativeRow.tsx` allowlist entry must be removed and replaced with `AttentionCard.tsx` + `AILaneCard.tsx`.
- `HeroBlock.tsx` allowlist entry must be replaced with `GreetingBlock.tsx` (watermark stays there) + `ApplicationCard.tsx` if that file uses fresh-green.
- W-04 posture: the fresh-green audit must be re-verified against the new component surface map.

---

## C — `HeroBlock` — bilingual greeting + 96px ETA numeral + 縁 watermark

**Verdict:** RETIRES

**Reasoning:** The archive's `HeroBlock` wraps three distinct concerns into one component: (1) the 縁 watermark, (2) the bilingual greeting ("Welcome, Yuki." / "ゆきさん、ようこそ。"), and (3) the 96px ETA numeral. The prototype separates these completely. The 縁 watermark lives at the page level (not inside a card section). The greeting is "Good morning, Yuki-san." / "おはようございます" — different copy, different greeting register (time-of-day vs welcome), different eyebrow (Reiwa + Gregorian date, not meta/app eyebrow). The 96px ETA numeral is gone entirely; the hero numeral is now the current stage number (76px) inside `ApplicationCard`. `HeroBlock` as a component does not map to any single surface in the prototype.

**Pointer:** `phase-5-spec-divergence-archive:components/journey/HeroBlock.tsx`, `HeroBlock.test.tsx`

**Caveats:**
- The W-03 Fraunces axis patterns (inline `fontVariationSettings`) from `HeroBlock.tsx` are reusable patterns — the redo's `GreetingBlock` and `ApplicationCard` will need to apply the same pattern.
- The 縁 watermark CSS values (360px, `rgba(191,215,48,0.06)`, `top:-40px`, `right:-60px` in prototype vs `right:-20px` in archive — note the right offset differs slightly) should be confirmed against the prototype source when building `GreetingBlock`.
- D-02 (no hero AI chip) was an archive decision that loses its meaning — the redo spec needs to address AI presence at the page level differently.
- The bilingual greeting copy lock changes: archive used "Welcome, Yuki." + "ゆきさん、ようこそ。"; prototype uses time-of-day "Good morning, Yuki-san." + "おはようございます". The redo UI-SPEC must decide whether to use a static time-of-day string or make it dynamic.

---

## D — `StageTimeline` — 6 pills + 5 connectors

**Verdict:** REVISES

**Reasoning:** The 6-stage strip is present in the prototype in the same visual form: 6 pills with done/current/upcoming states, connectors between them, stage names below each pill, and `AIPulseDot` adjacent to the current stage. The core logic (`stageStatusToPillState`, stage names from `STAGE_NAMES`, connector color logic) is identical. The structural change is that the strip now lives **inside** `ApplicationCard`'s left column rather than as a standalone `<section>`. This means: the outer `<section>` wrapper and the "YOUR JOURNEY" eyebrow disappear from `StageTimeline` itself — those concerns move to `ApplicationCard`. Additionally, the prototype's stage pills are **clickable** (`onClick={() => go('client-stage-N')}`), which conflicts with archive D-07 (inert pills). The redo spec must decide whether to restore pill navigation.

**Pointer:** `phase-5-spec-divergence-archive:components/journey/StageTimeline.tsx`, `StageTimeline.test.tsx`

**Caveats:**
- The component still exists and is still exported, but it loses its standalone `<section>` wrapper. `ApplicationCard` becomes its host — the eyebrow label ("YOUR JOURNEY") disappears; `ApplicationCard` provides its own "Application · APP-KAISEI" eyebrow.
- Clickable pills: the prototype navigates to `client-stage-N` routes. Those routes exist as `ClientStage1..6` in the prototype but don't exist in the Next.js app yet (Phase 7 scope per CONTEXT.md). The redo spec must decide: keep P-1 inert posture (archive D-07) or accept stage routes are out of scope and render pills as disabled-interactive.
- AIPulseDot is adjacent to the current pill in both archive and prototype — this test pattern from `StageTimeline.test.tsx` is directly reusable.
- The CSS Grid 11-track layout for pill + connector interleaving can survive unchanged.

---

## E — `NarrativeRow` — 2-lane "YOUR TURN" / "OUR TURN" composition

**Verdict:** RETIRES

**Reasoning:** `NarrativeRow` is the most-wrong component in the archive relative to the prototype. The prototype does not have a 2-lane YOUR TURN / OUR TURN composition at all. Instead, it has two entirely separate cards: "For your attention · N" (action queue with `ActionRow` items and amber status chip) and "Working on your behalf" (AI lane card with `AILaneRow` items and live progress). The data in `COPY_BY_STAGE` (8 copy strings covering yourTurnBody, yourTurnCta, ourTurnBody per stage) does not map to the prototype's richer content (which shows 3 specific action items and 3 specific AI task rows, dynamically from seed data). The component shape, grid layout, CTA button, and lane-eyebrow pattern are all wrong.

**Pointer:** `phase-5-spec-divergence-archive:components/journey/NarrativeRow.tsx`, `NarrativeRow.test.tsx`

**Caveats:**
- The stage-specific copy strings inside `COPY_BY_STAGE` have editorial value — particularly the OUR TURN body copy (what AI is doing per stage) — and should be reviewed as reference material when writing `AILaneCard` copy. They are not directly reusable.
- The archive's `AIBadge` conditional logic (D-12: badge on OUR TURN when AI-active) partially maps to `AILaneCard`, which always shows `AIBadge "Origin"` in the prototype. The conditional logic simplifies (AI card is always AI-branded).
- `NarrativeRow.test.tsx` is fully retired — no reusable test patterns.
- The W-01 CTA classes (transition + focus) from the archive CTA button are directly reusable in `AttentionCard`'s action items.

---

## F — `ActivityFeed` — list of activity rows

**Verdict:** SURVIVES (minor revision)

**Reasoning:** The prototype has an activity feed card in the same visual position (full-width, below the 3-column grid) with the same "Recent activity" eyebrow and activity rows. The archive's implementation (top-6 truncation, `topNActivities` sort, AI/StatusChip/Icon indicator selection, IBM Plex Mono timestamp) is more refined than the prototype's simpler `{ t, actor, kind, text }` row — the archive implementation is strictly better and should be kept, not regressed to the prototype's plain-text actor rows. The one addition needed is the "LAST 72H" secondary label visible in the prototype's card header.

**Pointer:** `phase-5-spec-divergence-archive:components/journey/ActivityFeed.tsx`, `ActivityFeed.test.tsx`

**Caveats:**
- Add "LAST 72H" label (IBM Plex Mono 11px, `ink-muted`) to the header alongside the "RECENT ACTIVITY" eyebrow — this is the only structural change.
- The archive uses `eventToCopy` with hard-coded `COPY_BY_ACTIVITY_ID` keyed by event ID. This should survive the redo unchanged — the Kaisei seed event IDs are stable.
- Test patterns are fully reusable: top-6 truncation, sort order, AI row indicator, inert rows, fresh-green negative.
- The 6-row limit (D-04) and inert row posture (D-05) carry forward unchanged.

---

## G — `TeamCard` — single James Lee with avatar + mailto

**Verdict:** REVISES

**Reasoning:** The prototype shows a multi-member "Your team" card with 4 members: James Lee (RM), Akiko Sato (Credit Analyst, SMBC Tokyo), Priya Nair (KYC Operations Lead, SMBC Singapore), and Origin (AI orchestrator, fresh-green avatar with "◉" initials). The archive's single-member card with 48px avatar and mailto link is a wrong composition. The component shape survives — it's still an avatar list with a CTA — but needs expanding: 4 members, smaller avatars (34px per prototype), fresh-green avatar for Origin, eyebrow changes from "YOUR RM" to "Your team", and CTA changes from `<a href="mailto:...">Email James</a>` to `<button>Message James</button>` (navigating to a `client-messages` route).

**Pointer:** `phase-5-spec-divergence-archive:components/journey/TeamCard.tsx`, `TeamCard.test.tsx`

**Caveats:**
- Origin's avatar color `#BFD730` is fresh-green — `components/journey/TeamCard.tsx` needs a new `.freshgreen-allowlist` entry.
- The archive's `deriveInitials()` helper survives but Origin's initials are fixed to "◉" (not derived from a name), requiring a special case or a pre-computed initials field in the data.
- D-11 (synthetic mailto) retires — the "Message James" CTA routes to `/(client)/messages` which does not exist yet. P-1 read-only posture means the button should either be inert or route to the messages screen if it's within Phase 5 scope. The redo spec must decide.
- Akiko Sato and Priya Nair are NEW personas not in `types/origin.ts` or `data/seed.ts` yet. The redo spec must decide whether to add them to the seed or hardcode them in the component (demo-convenience).
- W-01 interaction classes on the CTA button are directly reusable.
- Avatar size decreases from 48px to 34px — the `Avatar` primitive accepts `size?: number` so this is a prop change only.

---

## H — Components in prototype NOT in the archive

**Verdict:** NEW (4 components)

**Reasoning:** The prototype's page composition requires four entirely new components that do not exist in the archive's `components/journey/` directory.

### H-1: `GreetingBlock` — NEW
The free-floating greeting header: 縁 watermark, date eyebrow (Reiwa · Gregorian), bilingual h1 ("Good morning, Yuki-san." / "おはようございます"), summary paragraph ("Your onboarding with SMBC is on track…"). This is a Server Component with no interactive surfaces. It replaces the greeting portion of the retired `HeroBlock` but with substantially different copy, structure, and data needs (needs current date → `formatReiwa(date)` helper).

**Caveats:** The summary paragraph in the prototype is dynamic ("47 fields extracted overnight") — the redo spec must decide whether to make this dynamic from seed data or use a static copy variant. The Fraunces axis declarations (W-03) apply to the h1. The 縁 watermark values should be verified against prototype source (`right: -60px` in prototype vs `-20px` in archive).

### H-2: `ApplicationCard` — NEW
The hero status card (`card card--hero`): 2-column grid (1.4fr 1fr), left column contains Application ID eyebrow + stage numeral (76px, trad-green-deep) + "/6" + stage name + ETA date string + `StageTimeline` (inline). Right column (after hairline divider) contains "What you're applying for" product list + jurisdiction flags + "In progress: N days". This is a Server Component. It absorbs what archive `HeroBlock` had for ETA display and what archive `StageTimeline` had as standalone context, and adds the "applying for" panel entirely new.

**Caveats:** The stage numeral (76px, `trad-green-deep`) has `"/6"` beside it in a different Fraunces style (`fontSize 28, fontVariationSettings: '"SOFT" 60, "WONK" 0'`). The archive's 96px ETA numeral is retired; this is a stage-progress numeral. Products and jurisdictions data comes from `ApplicationDetail.application.productsRequested` and `targetJurisdictions` — both already in `types/origin.ts`. The ETA date ("29 April 2026") comes from `application.targetCloseDate`.

### H-3: `AttentionCard` — NEW
The "For your attention · N" action-queue card: amber `StatusChip "Due this week"` header, list of `ActionRow` items (clickable, navigate to stage screen). This card uses `AIBadge` only indirectly (none — it's a client-action surface, not an AI-output surface). The action items are drawn from seed data (documents with `status: 'pending'` or `status: 'rejected'` that require client action). The "N" count is dynamic.

**Caveats:** The `ActionRow` sub-component already exists as `components/primitives/ActionCard` — the redo should compose from `ActionCard` rather than introducing a new primitive. P-1 read-only posture question: the prototype's `ActionRow` items navigate to `client-stage-3`, which doesn't exist yet. The redo spec must decide whether to ship live navigation or keep inert (P-1). This card has no fresh-green surfaces.

### H-4: `AILaneCard` — NEW
The "Working on your behalf" card (`card--ai`): `AIBadge "Origin"` + "Working on your behalf" eyebrow + `AIPulse` dot in header, list of `AILaneRow` items (each showing a task + progress/confidence meta + live/done state), Origin quote at bottom. The `card--ai` background uses a subtle fresh-green tint in the prototype (`border: 1px solid rgba(191,215,48,0.2)` on `AILaneRow` dividers). This is the primary fresh-green surface in the 3-column grid.

**Caveats:** `AILaneRow` is a new sub-component needed inside `AILaneCard`. The "live" state (animated progress dot) requires either `AIPulseDot` (Phase 4 primitive) or a new inline animation. The fresh-green tint on the card background/borders needs a `.freshgreen-allowlist` entry. The AI task rows in the prototype are hard-coded to the Stage 3 (Documentation) scenario — the redo spec must decide whether these are static demo copy or derived from seed data.

---

## I — `components/journey/index.ts` barrel

**Verdict:** REVISES

**Reasoning:** The barrel's shape (named re-exports for all journey compositions) is correct and the pattern survives. However, the export set changes completely: `HeroBlock` and `NarrativeRow` retire; `GreetingBlock`, `ApplicationCard`, `AttentionCard`, and `AILaneCard` are added. `StageTimeline` may become internal to `ApplicationCard` (and therefore unexported from the barrel) or remain exported for testing purposes — the redo spec decides. `ActivityFeed` and `TeamCard` remain exported.

**Pointer:** `phase-5-spec-divergence-archive:components/journey/index.ts`

**Caveats:** The barrel comment currently describes "5 compositions used by page.tsx" — the redo will have 6+ compositions. The barrel header should be updated to reflect the new count and note the `ApplicationCard` contains `StageTimeline` as an inner composition.

---

## J — `app/(client)/journey/page.tsx` — page composition

**Verdict:** RETIRES (composition)

**Reasoning:** The archive page uses a `space-y-8` vertical band stack of 5 sequential `<section>`-like components. The prototype composition is structurally different: free-floating greeting → full-width hero card → 3-column grid (attention + AI + team) → full-width activity card. The CSS Grid for the 3-column section (`gridTemplateColumns: "1.2fr 1.2fr 0.9fr"`) is entirely new. The page.tsx must be rewritten. However, some plumbing survives: the `api.getApplicationDetail()` call (D-08), the `computeEtaDays()` helper, and the `max-w-[1280px] mx-auto px-8` container are all reusable.

**Pointer:** `phase-5-spec-divergence-archive:app/(client)/journey/page.tsx`

**Caveats:** The `computeEtaDays` function remains useful (the "In progress: N days" counter needs `daysIn = Math.round((now - startDate) / 86400000)` — same math, different display). The `space-y-8` class must be removed from the outer container; the redo uses explicit margin/gap per the prototype's `marginBottom: 24` and `gap: 20` values, which should map to `mb-6` and `gap-5` in Tailwind v4 tokens (or declared as chrome metrics in the new UI-SPEC).

---

## K — Tests

**Verdict summary:** HeroBlock.test.tsx → RETIRES; StageTimeline.test.tsx → REVISES; NarrativeRow.test.tsx → RETIRES; ActivityFeed.test.tsx → SURVIVES; TeamCard.test.tsx → REVISES.

### HeroBlock.test.tsx — RETIRES
Component retires. The W-03 inline `fontVariationSettings` test pattern (testing that `h1` has `'"SOFT" 50, "WONK" 0'` and the numeral span has `'"SOFT" 100, "WONK" 1'`) is directly reusable in the new `GreetingBlock.test.tsx` and `ApplicationCard.test.tsx`. The D-02 skip invariant ("no AI chip") and CJD-07 fresh-green negative grep are also reusable as templates.

### StageTimeline.test.tsx — REVISES
The core test patterns survive: 6 pills, state mapping (Kaisei: done/done/current/upcoming×3), AIPulseDot adjacency with overridden ariaLabel, 5 connectors with `bg-mist`/`bg-trad-green` only, `bg-fresh-green` negative grep, P-1 inert (no `<a>`). Revisions: if the redo makes pills clickable (removing P-1 for this surface), the P-1 inert test retires; if kept inert, it survives unchanged. The `<section>` wrapper test (if any) needs updating if `StageTimeline` loses its section wrapper inside `ApplicationCard`.

### NarrativeRow.test.tsx — RETIRES
Component retires. No reusable patterns; the D-12 AIBadge conditional logic moves to `AILaneCard.test.tsx`.

### ActivityFeed.test.tsx — SURVIVES
All test patterns reusable: top-6 truncation, descending sort order, AI indicator rows, inert rows (D-05), timestamp format, fresh-green negative. The only addition: test that the "LAST 72H" label is present in the header.

### TeamCard.test.tsx — REVISES
Partial reuse: D-11 mailto test retires (replaced by Message James button route check); Avatar non-interactive (P-1) test for James survives. New tests needed: 4-member render, Origin avatar has fresh-green `color`, "Your team" eyebrow (not "YOUR RM"), initials derivation for each member (including Origin's fixed "◉").

---

## L — Phase 5 plans 05-01..05-08

| Plan | Title | Disposition | Notes |
|------|-------|-------------|-------|
| 05-01 | lib-cjd-helpers | REVISES | Add `formatReiwa()`, revise `etaContextEyebrow()` to produce date-string (or clarify its new role), add helpers for `daysIn` computation |
| 05-02 | fonts-allowlist | REVISES | Noto Sans JP weight 200 survives; allowlist entries change — remove `NarrativeRow`, remove `HeroBlock`, add `GreetingBlock`, `ApplicationCard`, `AILaneCard`, `TeamCard` |
| 05-03 | hero-block | RETIRES | Replaced by 2 new plans: `GreetingBlock` + `ApplicationCard` |
| 05-04 | stage-timeline | REVISES | StageTimeline no longer standalone section; lives inside ApplicationCard; plan scope shifts to "StageTimeline as inner composition + ApplicationCard integration" |
| 05-05 | narrative-row | RETIRES | Replaced by 2 new plans: `AttentionCard` + `AILaneCard` |
| 05-06 | activity-feed | SURVIVES | Minor: add LAST 72H label; test update |
| 05-07 | team-card | REVISES | Expand to 4-member, Origin fresh-green avatar, Message James button |
| 05-08 | barrel-page-test | REVISES | New barrel exports, new 3-section page composition, test updates |

**Net plan delta:** 8 plans → 10 plans (5 survive/revise, 2 retire and become 4 new plans). See Redo Wave Proposal.

---

## M — UI-SPEC and CONTEXT.md

**Verdict:** REVISES (both documents need re-generation from prototype)

**Reusable from archive 05-UI-SPEC.md:**
- Phase 4 inheritance receipt (entire table) — spacing scale, typography scale, 3-weight matrix, color split, interaction-state language, 8 primitives — all survive.
- Chrome metric exceptions: 縁 watermark values (360px, rgba(191,215,48,0.06)) survive verbatim. ETA numeral (96px) retires and is replaced by stage numeral (76px) + Fraunces "/6" companion. Hero EN greeting (40px) becomes 44px (prototype). Team-card avatar (48px) becomes 34px.
- Typography: Eyebrow, mono, body — unchanged. Display exceptions update: 44px greeting h1 (not 40px), 76px stage numeral (not 96px), 20px stage name (new surface).
- D-03 縁 watermark: SURVIVES. D-04 top-6 truncation: SURVIVES. D-05 inert rows: SURVIVES. D-06 timestamp format: SURVIVES. D-08 single api roundtrip: SURVIVES. D-13 no skeleton: SURVIVES. D-14 lib/cjd module: SURVIVES.

**Decisions that need re-opening or revising:**
- D-01 (AIPulseDot adjacent to stage pill): REVISES — AIPulse also appears in AI card header (prototype shows both; redo spec must enumerate both surfaces).
- D-02 (no hero AI chip): RETIRES — replaced by AI card's always-on AIBadge + AIPulse.
- D-07 (StagePills inert): REVISES — prototype makes pills clickable; redo spec decides P-1 posture explicitly.
- D-09 (ETA fallback days-numeral): REVISES — prototype shows ETA as a date string inside ApplicationCard, not a hero numeral.
- D-10 (JP greeting hiragana): REVISES — archive "ゆきさん、ようこそ。" → prototype "おはようございます" (different register, time-of-day).
- D-11 (synthetic mailto): RETIRES — replaced by Message James button routing to client-messages.
- D-12 (AIBadge conditional): REVISES — AILaneCard always shows AIBadge "Origin"; the conditional is gone.
- P-1 (read-only chrome posture): REVISES — prototype has clickable pills + Message James route. Redo spec must explicitly enumerate which surfaces remain inert vs live.
- P-3 (hero AI chip absent): RETIRES with D-02.

**Reusable from archive 05-CONTEXT.md:**
- D-08..D-14 decision rationales survive almost verbatim.
- P-2 (weight 200 exception) survives.
- Canonical references section (ROADMAP.md, REQUIREMENTS.md, data/seed.ts, lib/api.mock.ts, lib/stages.ts) survive.
- **Prototype consulted field:** "prototype consulted: `docs/ORIGIN_PROTOTYPE.html`" must be added explicitly (the archive CONTEXT.md had `null` for this field — W-04 failure mode).

---

## Redo Wave Proposal

Strawman 3-wave structure for the redo. This is input to re-spec and re-planning, not a committed plan.

### Wave 1 — Foundation (sequential, no component deps)
**Goal:** All data helpers and font/allowlist config ready before any component work begins.

| Plan | Scope |
|------|-------|
| R-05-01 | `lib/cjd.ts` revisions — add `formatReiwa()`, revise `etaContextEyebrow()` to support date-string ETA, add `computeDaysIn()` or inline in page; keep all surviving helpers unchanged |
| R-05-02 | Font + allowlist — Noto Sans JP weight 200 (no change), update `.freshgreen-allowlist` for new component file paths |

### Wave 2 — Components (can be parallelized after Wave 1)
**Goal:** All journey composition components built and individually tested.

| Plan | Component | Disposition |
|------|-----------|-------------|
| R-05-03 | `GreetingBlock` | NEW — bilingual greeting, date eyebrow, summary paragraph, 縁 watermark |
| R-05-04 | `ApplicationCard` | NEW — hero card: stage numeral, stage name, ETA date, `StageTimeline` inside, products/jurisdictions/daysIn right column |
| R-05-05 | `AttentionCard` | NEW — action queue card: "For your attention · N", amber chip, `ActionCard` row list |
| R-05-06 | `AILaneCard` | NEW — AI lane card: "Working on your behalf", `AILaneRow` list, Origin quote, fresh-green card borders |
| R-05-07 | `ActivityFeed` | REVISES — add LAST 72H label; update tests |
| R-05-08 | `TeamCard` | REVISES — 4-member list, Origin fresh-green avatar, Message James button |
| R-05-09 | `StageTimeline` | REVISES — remove standalone `<section>` wrapper for use inside `ApplicationCard`; update tests |

### Wave 3 — Integration (requires all Wave 2 components)
**Goal:** Barrel, page composition, and integration tests complete.

| Plan | Scope |
|------|-------|
| R-05-10 | Barrel (`index.ts`) + page (`app/(client)/journey/page.tsx`) + integration tests — new 3-section composition, remove `space-y-8` band stack, wire 3-column grid |

**Note on R-05-09 / R-05-04 dependency:** `StageTimeline` must be revised (R-05-09) before `ApplicationCard` (R-05-04) can compose it. If parallelizing Wave 2, `ApplicationCard` depends on `StageTimeline` completing first. All other Wave 2 plans are independent of each other.

---

## Survey Counts

| Verdict | Count | Items |
|---------|-------|-------|
| SURVIVES | 2 | lib/cjd.ts core helpers (within A); ActivityFeed (F) |
| REVISES | 6 | lib/cjd.ts overall (A), font/allowlist (B), StageTimeline (D), ActivityFeed minor (F), TeamCard (G), barrel/index.ts (I) |
| RETIRES | 5 | HeroBlock (C), NarrativeRow (E), HeroBlock.test.tsx (K), NarrativeRow.test.tsx (K), page.tsx composition (J) |
| NEW | 4 | GreetingBlock (H-1), ApplicationCard (H-2), AttentionCard (H-3), AILaneCard (H-4) |

**Proposed redo plan count:** 10 plans across 3 waves (vs 8 plans in the archive).
