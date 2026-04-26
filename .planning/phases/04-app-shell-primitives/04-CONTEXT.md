# Phase 4: App Shell & Primitives - Context

**Gathered:** 2026-04-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Ship the durable chrome and the small set of reusable primitives that every Phase 5–8 screen will compose. Specifically:

- **Chrome (SHELL-01..03):** A persistent top strip with the Rising Mark logo + brand wordmark, a visual-only EN / 日本語 language toggle, and a dev-only mode switcher that flips between `/(client)` and `/(rm)` route groups. Plus the inner shell layouts that wrap each route group's content (single-column ClientShell; sidebar + workspace + copilot-sidecar-slot RMShell).
- **Primitives (SHELL-04, with documented drift per D-72):** `components/primitives/` exports **8** primitives — the 5 named in REQUIREMENTS (`Eyebrow`, `StatusChip`, `StagePill`, `AIPulseDot`, `ActionCard`) plus **3 derived/infrastructure additions discovered during prototype port** (`AIBadge`, `Icon`, `Avatar`). All eight are exercised on a primitives demo page that doubles as the SHELL-04 acceptance surface.
- **Fresh Green enforcement (SHELL-05):** A CI grep script + `.freshgreen-allowlist` mechanically polices that `#BFD730` (in any form) only appears on AI-output surfaces and AI presence indicators. Same PR that introduces enforcement also retrofits the prototype's known SHELL-05 violations so the script passes from day one.

Visual source of truth for everything in this phase is `docs/Origin Prototype.html` (a Claude artifact bundle — its actual JSX assets unpack to ~14 ES modules; the four most relevant for Phase 4 are extracted and read during this discussion). Phase 4 ports the **shell + primitives subset** of that prototype; Phases 5–8 port screen content + hero moments.

**Out of scope for Phase 4** — these belong to later phases:
- Wiring chrome to `lib/api.mock.ts` (Phase 4 chrome reads from `lib/persona.ts` plain TS constants per D-66; Phase 5/6 may swap to api.mock at their discretion)
- The Copilot itself (Phase 8) — RMShell ships in Phase 4 with an **empty copilot-sidecar slot** and no trigger button (or a placeholder trigger that no-ops; see D-77 / Specifics)
- Real i18n / next-intl — language toggle is visual-only per CLAUDE.md "Language: English only in UI body"
- Bilingual greeting helper, `formatReiwa`, `KanjiWatermark`, `ConfidenceMeter`, `BrandLockup` — prototype primitives that consuming phases (5, 8) add when needed
- Mobile responsiveness (desktop-only at 1440px per CLAUDE.md)
- Authentication flows (mocked logged-in state per PROJECT.md Out of Scope)
- 6-stage timeline, dashboards, kanban, AI hero surfaces — Phases 5–8

</domain>

<decisions>
## Implementation Decisions

Decision numbering continues from Phase 3 (D-63 → Phase 4 starts at D-64).

### Shell layout & placement (SHELL-01..03)

- **D-64:** Top strip lives in `app/layout.tsx` (rendered above `{children}`); **inner shells live in route-group layouts** — `app/(client)/layout.tsx` renders the single-column ClientShell, `app/(rm)/layout.tsx` renders sidebar + workspace + copilot-sidecar slot. Single render of TopStrip across all routes; no drift risk; Phase 5/6 customize their inner shell without touching root.
- **D-65:** TopStrip renders the **full prototype shape with Phase 4 stubs** for everything that downstream phases will eventually wire. Layout (left → right): brand lockup (RisingMark + "Origin" wordmark + "BY SMBC" eyebrow) → vertical divider → context badge (mode-conditional: Kaisei / 開成製造 in client mode, Japanese Corporates · 25 clients · Singapore desk in RM mode) → flex spacer → dev-only mode switcher (DEMO eyebrow + segmented "Client · Yuki" / "RM · James" pill, gated per D-68) → EN / 日本語 toggle → mail icon (with notification dot — see D-88 retrofit) → help icon → vertical divider → name + role + Avatar.
- **D-66:** Persona stubs live in `lib/persona.ts` as **plain TS constants** — `PERSONAS = { client: { name: 'Yuki Tanaka', role: 'TREASURER', context: 'Kaisei Manufacturing KK', contextJp: '開成製造' }, rm: { name: 'James Lee', role: 'RELATIONSHIP MGR', context: 'Japanese Corporates', contextJp: null, contextSub: '25 clients · Singapore desk' } }`. Phase 4 chrome does **NOT** consume `lib/api.mock.ts` — chrome stays decoupled from the data layer. Phase 5/6 may swap to api.mock at their discretion.
- **D-67:** TopStrip is a `'use client'` component using `usePathname()` + a route-to-mode map exported from `lib/persona.ts` (e.g., `export function modeForPathname(p: string): 'client' | 'rm'` — pathname starts with `/journey`, `/messages`, `/stage-*` → client; pathname starts with `/cockpit`, `/portfolio`, `/application/*`, `/copilot-log` → rm; default → client). Phase 5/6/7 PRs extend the map additively as new routes land.
- **D-68:** Dev-only mode switcher is gated by **`NEXT_PUBLIC_SHOW_MODE_SWITCHER` env var** (renders `null` when not `'true'`). Aligns with the existing `NEXT_PUBLIC_USE_MOCK` convention from D-35. Default: `true` in Vercel Preview + local dev; `false` in Vercel Production. Plan-phase decides exact env-var scoping at the Vercel dashboard.
- **D-69:** Mode switcher renders as **two `<Link>`s** (not buttons + JS): client → `PERSONA_HOME.client` (= `/journey`), rm → `PERSONA_HOME.rm` (= `/cockpit`). Constants exported from `lib/persona.ts`. Phase 5/6 may retarget if a different landing screen becomes the home.
- **D-70:** **URL-driven mode only** — no `localStorage`, no auto-redirect on mode change. Mode is a function of the active route group. Page refresh keeps you on the route you're on. Diverges from the prototype's `localStorage.setItem('origin-mode', mode)` pattern; chosen for hydration simplicity (Next.js SSR + persistent state is a known gotcha) and because URL is already the source of truth.
- **D-71:** Components organized as `components/shell/` for chrome (TopStrip, RisingMark, LanguageToggle, ModeSwitcher, ClientShell, RMShell) and `components/primitives/` for the 8 primitives (D-72). Folder names are not load-bearing; could rename to `components/chrome/` if planner prefers — pick one and stick with it.

### Primitives — set, drift, and shape (SHELL-04)

- **D-72:** **REQUIREMENTS.md SHELL-04 drift is recorded as a Phase 4 PR deliverable.** SHELL-04 currently lists 5 named primitives; Phase 4 ships **8** (Eyebrow, StatusChip, StagePill, AIPulseDot, AIBadge, ActionCard, Icon, Avatar). Phase 4 PR amends `.planning/REQUIREMENTS.md` SHELL-04 in the same commit set — either (a) reword to "5 brand primitives + 3 infrastructure primitives = 8" or (b) split into SHELL-04 (brand: Eyebrow, StatusChip, StagePill, AIPulseDot, AIBadge, ActionCard) and SHELL-04a (infrastructure: Icon, Avatar). Plan-phase picks the exact wording. **Silent scope extension is worse than wrong decision** — the drift is recorded regardless.
- **D-73:** **`StatusChip`** — props `{ kind: 'ok' | 'ai' | 'amber' | 'ghost' | 'red' | 'info', children: ReactNode, dot?: boolean }`. Closed visual-intent enum (NOT tied to domain status enums). Caller maps domain → intent (e.g., `doc.status === 'verified'` → `<StatusChip kind="ok">Verified</StatusChip>`). The **`kind='ai'` branch is the only chip variant allowed to use fresh-green** — file-level allowlisted per D-85; per-kind unit tests verify each kind's rendered token per D-87.
- **D-74:** **`StagePill`** — the numbered disc (rename of prototype's `StageNumeral`). Props `{ n: 1 | 2 | 3 | 4 | 5 | 6, state: 'done' | 'current' | 'upcoming', size?: number }`. Renders ✓ for `done`, the number otherwise. **Stage NAMES are rendered by the consumer** (Phase 5 timeline composes `<StagePill n={s.n} state={s.state} />` + label below from `STAGE_NAMES[s.n]`). Pure presentational — does NOT consume `Application` or call `deriveStages` itself; that decoupling makes the primitive testable in isolation and renderable for hypothetical/preview states. (Despite the "Pill" name in REQUIREMENTS, it is a circular numeral disc — matches the prototype's actual shape.)
- **D-75:** **`AIPulseDot`** — bare CSS-animated fresh-green dot (~6–8px), no children, no label. `aria-label` defaults to `"AI active"`, overridable. **`AIBadge`** — separate primitive: `<span>` styled as a `--trad-green-deep` rounded-full pill with the dot + a label (default `"Origin"`), used to mark AI-authored card headers. The lonely `AIPulse` middle-ground wrapper from the prototype (dot + eyebrow label) is **NOT** shipped — callers who want that shape compose `<AIPulseDot/>` + `<Eyebrow>{label}</Eyebrow>` inline.
- **D-76:** **`ActionCard`** — the **row primitive** (NOT a container card). Props `{ title: string, meta?: string, indicator?: ReactNode, cta?: ReactNode, onClick?: () => void, faint?: boolean }`. **`indicator` and `cta` are slot-shaped (`ReactNode`), NOT enumerated unions** — composers pass `<AIPulseDot/>`, `<StatusChip kind="amber" dot/>`, an inline `<div className="..."/>` (e.g., the priority bar), or `<Icon name="check"/>` as needed. The prototype's 4 row variants (`ActionRow`, `NeedsYouRow`, `AILaneRow`, `OvernightRow`) become **composition recipes** — not props variants — kept as reference snippets in DISCUSSION-LOG.md.
- **D-77:** **Container-level cards stay screen-specific.** No shared "card with title + count + slot" wrapper primitive in Phase 4. The four prototype container cards (For-your-attention, AI lane, Needs you, Overnight) live in Phase 5/6/7 screen files because their headers (eyebrow vs. AIBadge + display-font heading vs. timestamp meta) and behaviors differ enough that abstracting them yields a thin shared wrapper with too many escape hatches.
- **D-78:** **`Avatar`** — props `{ initials: string, size?: number, color: AvatarColor, textColor?: AvatarColor }` where `AvatarColor` is a **closed token enum** drawn from the @theme palette **explicitly excluding the fresh-green family**. Plan-phase picks the exact members from the available tokens (likely subset of: `'trad-green' | 'trad-green-deep' | 'trad-green-soft' | 'ink' | 'ink-soft' | 'ink-muted' | 'paper' | 'paper-deep' | 'mist' | 'signal-amber' | 'signal-info' | 'signal-red'`). Same closed-enum discipline as `StatusChip.kind` — open string would let Phase 5/6 pass fresh-green and SHELL-05's grep couldn't catch it (since the grep flags raw token usage, not prop strings).
- **D-79:** **`Icon`** — props `{ name: IconName, size?: number, stroke?: number, color?: string, style?: CSSProperties }` where `IconName` is a **closed string union** of the ~40 names ported from prototype's `primitives.js` (`'arrow-right' | 'arrow-up-right' | 'check' | 'dot' | 'chevron-right' | 'chevron-down' | 'close' | 'tree' | 'docs' | 'shield' | 'credit' | 'rocket' | 'mail' | 'help' | 'bell' | 'search' | 'sparkle' | 'cockpit' | 'pipeline' | 'app-folder' | 'copilot' | 'upload' | 'paperclip' | 'calendar' | 'clock' | 'globe' | 'yen' | 'filter' | 'edit' | 'refresh' | 'send' | 'external' | 'stack' | 'users' | 'bolt' | 'bank'` — exact final list locked at plan-phase by reading `/tmp/proto_primitives.js` Icon component, which the discussion already extracted). **No path/SVG-children slot** — additions are deliberate, reviewed in PR. Phase 5/6/7 extend the union additively per their PR.
- **D-80:** **Primitives demo page** — public, always shipped, intent path `/dev/primitives` (the user's stated `/_dev/primitives` is non-routable in App Router because `_`-prefix marks private folders; plan-phase coerces to `/dev/primitives` unless an alternative is chosen). Lives outside route groups (`app/dev/primitives/page.tsx`), so it has no top-strip mode quirks. Renders every primitive in every state with Tailwind class hints. Allowlisted for SHELL-05 since it renders AIPulseDot/AIBadge/StatusChip kind='ai' demos.
- **D-81:** **`PriorityBar` is NOT a primitive in Phase 4.** When Phase 6 builds NeedsYouRow on the RM cockpit, it inlines a 4×36 colored `<div>` + a `priorityColor(p)` helper (in `lib/priority.ts` if reused, otherwise co-located). Promote to primitive only if a third surface adopts it.

### Fresh Green enforcement (SHELL-05)

- **D-82:** **Mechanism = CI grep script + `.freshgreen-allowlist` file at repo root.** The script (`scripts/check-fresh-green.sh` or `.ts` — plan-phase picks language) runs in CI either as a fourth top-level job or as a step inside the existing `test` job (D-63 third job). Allowlist is a checked-in plain-text file; widening requires a PR (visible in git history; reviewable). Zero new tooling deps. Aligns with the closed-enum discipline applied to primitive props.
- **D-83:** **Grep match-list is locked in the script as an explicit array.** Coverage:
  - Hex literal: `\b#[Bb][Ff][Dd]7[3]0\b` (case-insensitive on letters; word-boundary `\b` to avoid false positives inside longer hex).
  - CSS-var: `--color-fresh-green(-[a-z0-9]+)?` (covers token base + any suffix variants in `app/globals.css` `@theme` block — currently `-mute`, `-glow`; pattern is additive-safe). Comment in the script: TODO if `@theme` adds new fresh-green variants → confirm regex still covers them.
  - Tailwind utility classes: `(bg|text|border|ring|from|to|outline|fill|stroke|divide|placeholder|caret|accent|shadow)-fresh-green(-[a-z0-9]+)?` (covers every Tailwind v4 utility prefix that can take a color token).
  - Arbitrary-value forms: `\[(#[Bb][Ff][Dd]7[3]0|var\(--color-fresh-green|rgba\(\s*191\s*,\s*215\s*,\s*48)` (catches `bg-[#BFD730]`, `bg-[var(--color-fresh-green)]`, `bg-[rgba(191,215,48,0.3)]`).
  - rgba form: `rgba\(\s*191\s*,\s*215\s*,\s*48` (catches the prototype's mode-switcher dashed border tint and any other inline rgba use).
- **D-84:** **Test fixtures for the script** (`scripts/check-fresh-green.test.ts` — Vitest, per D-61/62) explicitly include arbitrary-value bypass attempts: `bg-[#BFD730]`, `bg-[var(--color-fresh-green)]`, `bg-[rgba(191,215,48,0.3)]`, `bg-[var(--color-fresh-green-glow)]`, plus the case-variants `#bfd730` / `#BFD730` / `#bFd730`. Script must flag every fixture; tests fail otherwise. Don't assume coverage — prove it.
- **D-85:** **Initial allowlist contains only files that exist in Phase 4 PR**:
  - `components/primitives/AIPulseDot.tsx`
  - `components/primitives/AIBadge.tsx`
  - `components/primitives/StatusChip.tsx` (whole-file, mitigated by D-87)
  - `components/shell/RisingMark.tsx` (the brand mark's clock-hand stroke is fresh-green by design — see Specifics for the brand-vs-AI tension; plan-phase confirms allowlist OR retrofits hand color)
  - `app/dev/primitives/page.tsx` (renders all primitives including AI ones)
  No speculative globs (no `components/screens/**/Hero*.tsx` or `AILane*.tsx`) — those files don't exist yet. Phase 5/6/7 PRs add their own entries when they ship AI surfaces. Preserves the "every widening is a reviewable PR" property.
- **D-86:** **`.freshgreen-allowlist` has a self-documenting comment header:**
  ```
  # SHELL-05 reserves Fresh Green (#BFD730) for AI-authored output and
  # AI presence indicators only. CSS var: --color-fresh-green (and -mute, -glow).
  # Adding a path here requires architectural review, not just code review.
  # Per-file allowlist is coarse — for files where only some branches use
  # fresh-green (e.g., StatusChip's kind='ai'), unit tests verify each branch
  # renders the expected token as a second line of defense.
  # See .planning/phases/04-app-shell-primitives/04-CONTEXT.md D-82..D-88.
  ```
- **D-87:** **StatusChip unit tests verify each kind's rendered token** (`components/primitives/StatusChip.test.tsx`) — `kind='ok'` renders the trad-green-soft (or chosen) token, `kind='ai'` renders fresh-green, `kind='amber'` renders signal-amber, `kind='ghost'` renders ink-muted, `kind='red'` renders signal-red, `kind='info'` renders signal-info. **Test-as-second-line-of-defense for whole-file allowlisting.** If a future PR accidentally swaps `kind='ok'` to use fresh-green, the lint passes (file is allowlisted) but the unit test fails. Same pattern recommended for any future allowlisted file with mixed branches.
- **D-88:** **Phase 4 PR retrofits the prototype's known SHELL-05 violations IN THE SAME PR that introduces enforcement** — script passes from day one rather than starting with a known-failing state. Confirmed violations from prototype's `app shell` and primitives modules:
  1. **Top-strip user Avatar bg** = `var(--fresh-green)` (in `<Avatar initials="YT" color="var(--fresh-green)" .../>`) → retrofit to a non-fresh-green `Avatar.color` token (plan-phase picks; recommend `'trad-green-soft'` or `'mist'`).
  2. **Mail-icon notification dot** = `var(--fresh-green)` → retrofit to `var(--signal-amber)` (semantic: "you have unread messages" = attention, not AI).
  3. **Mode-switcher dashed border tint** = `rgba(191,215,48,0.3)` → retrofit to a paper-toned or ink-muted dashed border for the "DEMO" affordance (e.g., `rgba(122,130,125,0.3)` from `--ink-muted`).
  4. **Mode-switcher "DEMO" eyebrow text color** = `var(--fresh-green)` → retrofit to `var(--signal-amber)` or `var(--paper)` (preserves the "this is a dev affordance" eyebrow without breaking SHELL-05).
  5. **Sidebar active-route indicator dot** = `var(--fresh-green)` → retrofit to `var(--trad-green)` or remove dot (rely on the active item's `var(--paper-deep)` background already signaling state).
  Plan-phase locks the exact replacement tokens; the principle is "retrofit + enforce together so the script is green when it lands."

### Port strategy — flagged for plan-phase (must be picked explicitly)

- **D-89:** **Plan-phase MUST pick one of three port strategies for the prototype's non-Tailwind class names.** The prototype uses CSS classes that don't exist in Phase 2's `app/globals.css`: `card`, `card--hero`, `card--ai`, `chip chip--{kind}`, `chip--dot`, `btn`, `btn--ghost`, `btn--sm`, `t-display`, `t-eyebrow`, `t-numeral`, `t-jp`, `t-mono`, `ai-pulse`, `reveal`, `hr`, `watermark-en`. Pattern A (Phase 2) forbids inline hex / raw CSS but does **not** prescribe a strategy; all three options below satisfy Pattern A. Plan-phase records the chosen strategy + rationale in PLAN.md — **do not default silently**. Each option shifts the SHELL-05 grep target differently:
  - **(a) Utility soup at call sites** — Tailwind utilities in primitive `className` directly; nothing in `globals.css` beyond Phase 2's `@theme` tokens. SHELL-05 grep targets call-site utility class strings; allowlist is the primitive files. Pros: one source of truth, easiest for Phase 5/6 to mirror. Cons: long className strings, possible duplication.
  - **(b) `@apply` directives in `globals.css` preserving the prototype's class names** — `.t-eyebrow { @apply font-mono uppercase tracking-[0.18em] text-ink-muted text-[10px]; }` etc. Primitives use `className="t-eyebrow"`. SHELL-05 grep walks into `@apply` blocks (already covered by D-83 since `@apply` contents are Tailwind utilities); but a single `@apply` rule applies transitively to many call sites — `globals.css` becomes a coarse allowlist node. Pros: short class names, semantic naming, fewer grep matches per surface. Cons: another abstraction layer.
  - **(c) Component-prop-driven styling, no shared class names** — Each primitive owns its style; consumers call `<Eyebrow>2026 · Apr 26</Eyebrow>` and never write Tailwind for typography idioms. SHELL-05 grep targets primitive component files only — most granular. Pros: cleanest API, lowest drift, smallest grep surface. Cons: every typography variant needs a prop or component.
  - Plan-phase researcher should consult Tailwind v4 `@apply` docs (composes with `@theme`-defined utilities; some plugin utilities don't compose) before recommending (b).

### Claude's Discretion

- Exact size defaults (e.g., `StagePill size=34` vs `36`; `RisingMark size=24` for top strip vs `26` for BrandLockup; Avatar default `size=30` for top strip).
- AIPulseDot animation duration / easing — pick whatever feels alive but not flashing (prototype uses a CSS class `.ai-pulse`; specific timing not yet pinned).
- Exact `Avatar.color` enum members within the constraint of "no fresh-green family" (D-78).
- Exact icon name list in `IconName` — final ~40 names locked by reading the prototype's `Icon` component during plan-phase.
- Exact replacement tokens for the 4 retrofit sites (D-88) within the recommendations given.
- Folder name `components/shell/` vs `components/chrome/` (D-71).
- Whether `lib/persona.ts` exports a single `PERSONAS` object + helpers, or split into `lib/persona/index.ts` + `lib/persona/route-map.ts` etc. — keep narrow.
- Whether the SHELL-05 grep script is bash or TypeScript (script + Vitest test fixtures coexist regardless).
- Whether the demo page renders every state via static JSX (~150 LOC) or via an iteration over a primitive-state matrix (more compact, more meta).
- Exact `Fraunces` variation-axis handling for the "Origin" wordmark — the prototype uses inline `fontVariationSettings: '"SOFT" 80, "WONK" 1'`, but Phase 2's `next/font` import (D-31) is wght-only (SOFT/WONK deferred). Plan-phase decides: (a) revisit D-31 deferred and add SOFT/WONK to the Fraunces import's `axes`; (b) inline-style the variation on the wordmark only; (c) drop the variation (purist).

### Folded Todos

*(none — `gsd-sdk query todo.match-phase 4` returned 0 matches)*

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project planning (frontend GSD)
- `.planning/PROJECT.md` — vision, locked design system, working principles, mock-first stance, **Fresh Green is reserved exclusively for AI outputs and AI presence**.
- `.planning/REQUIREMENTS.md` — `SHELL-01..05`. **Note:** SHELL-04 lists 5 primitives; Phase 4 ships 8 — drift recorded in this PR per D-72.
- `.planning/ROADMAP.md` §"Phase 4: App Shell & Primitives" — phase goal + 4 success criteria. SC #4 is SHELL-05's mechanical check.
- `.planning/STATE.md` — current project status; Phase 3 merged (PR #8), Vercel production live at <https://smbcorigins.vercel.app>.
- `.planning/phases/01-setup-alignment/01-CONTEXT.md` — D-01..D-25 (stack contract, scaffolding ownership, cross-GSD governance, **D-28: Fresh Green AI-only**).
- `.planning/phases/02-scaffolding/02-CONTEXT.md` — D-26..D-41 (design tokens in `@theme`, four `next/font` wirings, Vercel link, CI baseline). Especially **D-31** (Fraunces wght-only — Phase 4 may need to revisit for SOFT/WONK on the "Origin" wordmark).
- `.planning/phases/02-scaffolding/02-PATTERNS.md` §"Pattern A" (CSS-first `@theme` + Tailwind utilities; never inline hex — applies to Phase 4's primitive port), §"Pattern D" (CI third-job pattern — Phase 4 either appends fresh-green check to the existing `test` job or adds a fourth top-level job).
- `.planning/phases/03-shared-boundary/03-CONTEXT.md` — D-42..D-63. Especially **D-57** (`lib/stages.ts` exports `STAGE_NAMES` + `deriveStages` — Phase 5 timeline consumer; Phase 4's `StagePill` does NOT consume per D-74), **D-61..D-63** (Vitest co-located + third CI job).

### Cross-GSD canonical (boundary governance)
- `DECISIONS.md` (repo root) — append-only canonical log; **per D-20, on conflict with any other doc, this file wins**. Phase 4 does not modify boundary files (`types/origin.ts`, `lib/api.ts`, `lib/api.mock.ts`, `lib/api.real.ts`, `lib/stages.ts`) so no CODEOWNERS / CONTRACT.md auto-review fires.
- `CONTRACT.md` (repo root) — boundary co-ownership rules. **Phase 4 does NOT trigger the Slack-ping-on-contract-PR convention** because no boundary files change.
- `.github/CODEOWNERS` — auto-review rules. **Phase 4 does NOT modify** unless plan-phase decides to add chrome/primitives co-ownership entries (not currently planned).

### Product context
- `CLAUDE.md` — repo-root brief read at every Claude session start. **"Design system" section is the source of the Fresh Green AI-only rule** Phase 4 enforces. Stack contract (D-01..D-08) and Scaffolding ownership (D-09..D-12) summary.
- **`docs/Origin Prototype.html`** — **VISUAL SOURCE OF TRUTH for Phase 4 (per user)**. A Claude artifact bundle (~9 MB) with 170 assets in a base64+gzip manifest. Relevant assets for Phase 4 (uuids extracted during this discussion):
  - **App shell** (uuid `4c54d558*`) — `TopStrip`, `useRoute`, `ClientShell`, `RMShell`, `App` root. Defines top-strip layout, mode switcher visual, sidebar shape, copilot trigger button.
  - **Primitives** (uuid `77ddc8bb*`) — `RisingMark`, `BrandLockup`, `Eyebrow`, `AIPulse`, `AIBadge`, `StatusChip`, `Icon` (full ~40-name set), `Avatar`, `Bilingual`, `formatReiwa`, `ConfidenceMeter`, `KanjiWatermark`, `StageNumeral`. **Phase 4 ports a subset (8 primitives); the rest defer to Phases 5/8.**
  - **Client dashboard** (uuid `05bee446*`) — Phase 5 reference; here primarily for `ActionRow`, `AILaneRow`, `ActivityRow` recipes that inform `ActionCard` composition (D-76).
  - **RM cockpit** (uuid `ae2ba9f2*`) — Phase 6 reference; here primarily for `NeedsYouRow`, `OvernightRow`, `KpiCell` recipes.
  Plan-phase researcher reads these via the Python extraction script demonstrated in this discussion (the bundle is too large to read directly).
- `docs/ORIGIN_DESIGN.md` §8 (Design System) — token list, typography (Fraunces / Inter Tight / Noto Sans JP / IBM Plex Mono), spacing 8px scale, radius (button 6, card 12, modal 16), motion (200ms default, 400–600ms AI moments). Phase 4 must cohere with these.
- `docs/ORIGIN_DESIGN.md` §8.7 (Component inventory) — names `<JourneyStepper>`, `<EntityTree>`, `<DocDropzone>`, `<AiStreamText>`, `<ScreeningCard>`, `<MemoEditor>`, `<CopilotSidecar>` as custom components. **Phase 4 does NOT ship any of these** — they are Phase 5–8 deliverables that compose Phase 4's primitives.
- `docs/ORIGIN_DESIGN.md` §5 (AI hero moments) — informs which Phase 8 surfaces will need fresh-green allowlist entries (UBO Intelligence, Doc Extraction, Credit Memo Drafter, RM Copilot).
- `docs/ORIGIN_PRODUCT_BRIEF.html`, `docs/ORIGIN_JOURNEY_DOC.html`, `docs/ORIGIN_BUILD_PROMPT.md` — additional product context.

### Files Phase 3 ships (Phase 4 may import from)
- `types/origin.ts` (Evan, merged via PR #4) — typed shapes; Phase 4 chrome does NOT import (lib/persona.ts is plain TS constants); future phases will.
- `lib/api.ts` (Evan, merged via PR #4) — `OriginAPI` interface + `NEXT_PUBLIC_USE_MOCK` switch. Phase 4 chrome does NOT consume.
- `lib/stages.ts` (Kit, Phase 3) — `STAGE_NAMES` + `deriveStages`. Phase 4's `StagePill` does NOT consume per D-74; Phase 5 timeline composes `StagePill + STAGE_NAMES[n]`.
- `data/seed.ts` (Kit, Phase 3) — Phase 4 chrome does NOT consume per D-66.
- `lib/api.mock.ts` (Kit, Phase 3) — Phase 4 chrome does NOT consume.

### Files this phase creates
- `app/(client)/layout.tsx` (new — ClientShell wrapper)
- `app/(rm)/layout.tsx` (new — RMShell wrapper with sidebar + workspace + empty copilot-sidecar slot)
- `app/dev/primitives/page.tsx` (new — public demo page; URL `/dev/primitives` per D-80, coercing from user's `/_dev/primitives` due to App Router private-folder convention)
- `components/shell/TopStrip.tsx` (new, `'use client'`)
- `components/shell/RisingMark.tsx` (new — SHELL-03)
- `components/shell/LanguageToggle.tsx` (new — visual-only EN / 日本語)
- `components/shell/ModeSwitcher.tsx` (new — gated by `NEXT_PUBLIC_SHOW_MODE_SWITCHER`)
- `components/shell/ClientShell.tsx` (new — single-column wrapper)
- `components/shell/RMShell.tsx` (new — sidebar 220 + workspace + empty sidecar slot)
- `components/primitives/Eyebrow.tsx`
- `components/primitives/StatusChip.tsx`
- `components/primitives/StagePill.tsx`
- `components/primitives/AIPulseDot.tsx`
- `components/primitives/AIBadge.tsx`
- `components/primitives/ActionCard.tsx`
- `components/primitives/Icon.tsx`
- `components/primitives/Avatar.tsx`
- `components/primitives/index.ts` (barrel export)
- `lib/persona.ts` (new — `PERSONAS`, `PERSONA_HOME`, `modeForPathname()`)
- `lib/priority.ts` (optional — `priorityColor()` helper; Phase 6 may move there)
- `scripts/check-fresh-green.{sh,ts}` (new — SHELL-05 grep script per D-82..D-84)
- `scripts/check-fresh-green.test.ts` (new — Vitest fixtures per D-84)
- `.freshgreen-allowlist` (new — comment header + 5 initial allowlisted files per D-85, D-86)
- Co-located primitive tests per D-62: `*.test.tsx` for each primitive that has logic (StatusChip per D-87 minimum; others if they have branching logic).

### Files this phase modifies
- `app/layout.tsx` — add `<TopStrip />` above `{children}`.
- `app/globals.css` — possibly adds `@apply` directives if port strategy (b) is picked at plan-phase per D-89; otherwise unchanged.
- `app/(client)/journey/page.tsx`, `app/(rm)/cockpit/page.tsx` — placeholders may be untouched (route-group layouts now wrap them); plan-phase confirms.
- `.github/workflows/ci.yml` — adds the SHELL-05 check (4th top-level job, OR a step inside the existing `test` job — plan-phase picks per D-82).
- **`.planning/REQUIREMENTS.md`** — SHELL-04 amended per D-72 (drift from 5 → 8 primitives recorded).
- `package.json` — possibly adds a `check:fresh-green` script invoked by CI (no new runtime deps; the script is bash or vanilla TS).

### External docs (verify current best practices at planning time)
- **Next.js 16 App Router docs** — root `layout.tsx` vs route-group `layout.tsx`, private folders (`_`-prefix means non-routable — confirms D-80 path correction), `usePathname()` from `next/navigation`, `Link` semantics for the mode switcher (D-69).
- **Tailwind v4 docs** — `@apply` composition rules with `@theme`-defined utilities (relevant if D-89 picks strategy (b)), arbitrary-value class syntax (relevant for D-83's grep coverage of `bg-[var(...)]`).
- **React 19 client/server component boundary** — TopStrip is `'use client'` per D-67; root `layout.tsx` stays a server component and renders `<TopStrip />` (a client child); pattern is standard.
- **Fraunces variable-font axes** (Google Fonts) — `opsz`, `SOFT`, `WONK` axes if plan-phase revisits D-31 deferred for the "Origin" wordmark variation settings.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets (Phase 2 / 3 baseline Phase 4 builds on)
- **`@theme` tokens in `app/globals.css`** (Phase 2, D-27) — full Trad Green / Fresh Green / neutral / signal palette is already defined as Tailwind v4 utilities (`bg-trad-green`, `text-fresh-green`, `bg-paper`, etc.). Phase 4 consumes these via utilities (or `@apply` if D-89 picks strategy (b)).
- **Four `next/font` imports in `app/layout.tsx`** (Phase 2, D-31, D-32) — Fraunces (display, wght-only — SOFT/WONK deferred), Inter Tight (UI body), Noto Sans JP (latin subset only; JP via unicode-range), IBM Plex Mono (weights 400/700). CSS variables `--font-fraunces`, `--font-inter-tight`, `--font-noto-sans-jp`, `--font-ibm-plex-mono` exposed on `<html>`. Phase 4 typography primitives (`Eyebrow`) consume the mono family; the "Origin" wordmark in TopStrip needs Fraunces — verify the variable name in `app/layout.tsx` matches what plan-phase uses.
- **TypeScript path alias `@/*` → repo root** (Phase 2, D-38) — `import { mockApi } from '@/lib/api.mock'`, `import { Eyebrow } from '@/components/primitives'`, etc.
- **Vitest co-located testing** (Phase 3, D-61, D-62, D-63) — `*.test.ts(x)` files alongside source; `vitest run` in CI as third job. Phase 4's primitive tests (D-87) and the fresh-green script test (D-84) inherit this setup.
- **CI workflow** (`.github/workflows/ci.yml`) — three jobs: `typecheck`, `lint`, `test`. Phase 4 adds the SHELL-05 fresh-green check.
- **Branch protection** on `main` — typecheck + lint + test + Vercel are required status checks (D-08, Phase 2 + D-63 Phase 3 added test). Plan-phase decides whether the fresh-green check is a separate required check or rolled into the existing `test` job.
- **Phase 2 placeholder pages** at `app/(client)/journey/page.tsx` and `app/(rm)/cockpit/page.tsx` — currently return bare `<main>` with bilingual greeting. Phase 4's route-group layouts wrap these; the page contents stay untouched until Phases 5 / 6.

### Established Patterns (inherit from prior phases)
- Branch `kit/<area>` per CLAUDE.md and D-12 — Phase 4 work goes on `kit/phase-4-app-shell-primitives`.
- Single-PR-per-phase per Phase 1/2/3 cadence.
- Commit message style: `feat(NN-MM): ...`, `docs(NN-MM): ...`, `chore(NN): ...` per `git log`.
- GSD planning artifacts stay in `.planning/` (Kit-only per D-21). Evan never touches `.planning/`.
- CSS-first `@theme` tokens via Tailwind utilities (Pattern A) — Phase 4 honors; never inline hex.
- Three-job CI (Pattern D) — Phase 4 either adds a 4th job or appends a step to `test`.
- TypeScript `strict: true` + `noUncheckedIndexedAccess: true` (D-05) — Phase 4 component props use closed unions (D-73, D-78, D-79); Map/Record lookups need explicit narrowing.

### Integration Points
- **`app/layout.tsx`** — Phase 4 modifies to render `<TopStrip />` above `{children}`. Stays a server component; TopStrip is the client child.
- **`app/(client)/journey/page.tsx` and `app/(rm)/cockpit/page.tsx`** — Phase 5 / 6 own the page content. Phase 4 only adds the wrapping route-group layout.
- **`app/globals.css`** — Phase 4 may add `@apply` directives if D-89 strategy (b); otherwise no change.
- **`.github/CODEOWNERS`** — Phase 4 does NOT touch (no boundary files change).
- **`.github/workflows/ci.yml`** — Phase 4 adds the SHELL-05 check.
- **`.planning/REQUIREMENTS.md`** — SHELL-04 amended for the 5→8 primitive drift (D-72).

### Tooling baseline (already in place)
- TypeScript strict (D-05).
- ESLint flat config + Prettier (D-07, D-39) — Phase 4 source files match existing rules.
- npm (D-06) — fresh-green script adds no runtime deps; if implemented in TS, runs via `tsx` or compiled to JS during the test job.
- Vitest (D-61) — used for primitive tests (D-87) and script tests (D-84).

</code_context>

<specifics>
## Specific Ideas

- **Visual source of truth = `docs/Origin Prototype.html`** (per user). The bundle is a Claude artifact archive; assets unpack via Python:
  ```python
  import re, base64, gzip, json
  html = open("docs/Origin Prototype.html","rb").read().decode("utf-8","replace")
  m = re.search(r'<script type="__bundler/manifest">\s*(.+?)\s*</script>', html, re.S)
  manifest = json.loads(m.group(1))
  for u, e in manifest.items():
      if "javascript" in e.get("mime",""):
          raw = base64.b64decode(e["data"])
          if e.get("compressed"): raw = gzip.decompress(raw)
          # write to /tmp/proto_<u[:8]>.js
  ```
  Plan-phase researcher reads `proto_4c54d558.js` (shell), `proto_77ddc8bb.js` (primitives), and the row-recipe sources (`proto_05bee446.js`, `proto_ae2ba9f2.js`) for shape-of-truth.

- **Closed-enum discipline runs through the primitives** — `StatusChip.kind`, `Avatar.color`, `Icon.name` are all closed string unions. Open string props would let callers pass fresh-green and bypass the SHELL-05 grep (which checks raw token usage, not prop values). Same discipline that makes contract types in `types/origin.ts` safe.

- **The Rising Mark brand-vs-AI tension is a real Phase 4 decision.** The prototype's RisingMark logo uses `hand="var(--fresh-green)"` for the clock-hand stroke — fresh-green by design. ORIGIN_DESIGN.md §8.1 originally listed "Rising Mark" as a fresh-green-allowed surface; CLAUDE.md "Design system" later narrowed it to "AI outputs and AI presence". Phase 4 plan-phase resolves:
  - **Option (a):** Allowlist `components/shell/RisingMark.tsx` (D-85 already includes it). Brand-iconographic exception, rationale documented in the allowlist comment header.
  - **Option (b):** Retrofit the hand stroke to a non-fresh-green token — loss of brand identity. The prototype leans heavily on the green clock-hand as the brand signal.
  - Recommended: (a) — the brand mark is a brand mark; SHELL-05's spirit is "don't dilute the AI signal," and the brand mark predates the AI rule.

- **Confirmed SHELL-05 violations in the prototype that Phase 4 retrofits** (5 sites, per D-88) — top-strip user Avatar bg, mail-icon notification dot, mode-switcher dashed border tint, mode-switcher "DEMO" eyebrow text, sidebar active-route indicator dot. Replacement tokens picked at plan-phase from non-fresh-green palette.

- **`StatusChip kind='ai'` is the only chip kind allowed to use fresh-green.** Whole-file allowlist (D-85) is coarse; D-87's per-kind unit tests are the second line of defense. Same pattern recommended for any future allowlisted file with mixed branches.

- **The "Your turn / Our turn" paired pattern is a screen-level layout, NOT a primitive.** In the prototype, the client dashboard pairs **For-your-attention** (amber-dot rows) with **Working-on-your-behalf** (`card--ai`, fresh-green pulse rows) in a 3-column grid alongside a Team card. The RM cockpit pairs **Needs you** with **Origin has been busy overnight** in a 2-column grid. The pairing is composition, not abstraction — Phase 5/6 build it from primitives + screen-specific containers.

- **`AIBadge` is the dark trad-green-deep pill with a fresh-green dot + "Origin" label**, used to mark AI-authored card headers (e.g., "Origin · has been busy overnight" on RM cockpit, or as the "Working on your behalf" header on client dashboard). It's a primitive (D-75) because it composes both a brand mark and an AI presence indicator and is reused across multiple AI surfaces.

- **The Copilot trigger button** in prototype's RMShell (`background: var(--trad-green-deep), color: var(--fresh-green)`, fixed bottom-right) is fresh-green-correct (it IS the AI trigger). **Phase 4 does NOT ship the trigger button** — the copilot itself is Phase 8, and the trigger is its companion. RMShell in Phase 4 ships with an empty copilot-sidecar slot; no trigger. Plan-phase may decide to ship a placeholder no-op trigger if visual completeness matters for the demo page.

- **The "Origin" wordmark uses Fraunces with `fontVariationSettings: '"SOFT" 80, "WONK" 1'`** in the prototype (line 38–39 of `proto_shell.js`). Phase 2's D-31 deferred SOFT/WONK as a "Phase X loop-back when there's a real consumer." Phase 4 IS that consumer. Plan-phase decides:
  - (a) Revisit D-31; add `axes: ['SOFT', 'WONK']` to the Fraunces import (next/font@16 supports these).
  - (b) Use inline `style={{ fontVariationSettings: '...' }}` on the wordmark only — no font-import change.
  - (c) Drop the variation; ship default Fraunces wght. Loss of brand voice.
  - Recommended: (a) — small loop-back, consistent across all display headings, prevents inline-style drift.

- **`useSyncExternalStore` from React 19** (Phase 3 D-55) is NOT consumed by Phase 4 chrome — chrome uses `usePathname()` only. Persona/route-map are plain TS constants in `lib/persona.ts`.

- **`lib/persona.ts` is intentionally NOT in `.github/CODEOWNERS`** — it's a frontend-internal helper, not a shared boundary file. Stays Kit-owned; doesn't trigger cross-GSD review. Same precedent as `lib/stages.ts` initially being a frontend file before Phase 3 moved it to the boundary (D-57, D-58).

- **The fresh-green check should run BEFORE typecheck/lint** in CI for fast-fail UX, OR after them as the most-expensive-last. Plan-phase decides; the check is fast either way (grep over a small tree).

- **Tailwind v4 utility names for fresh-green tokens** — Phase 2's `@theme` defines `--color-fresh-green`, `--color-fresh-green-mute`, `--color-fresh-green-glow`. Tailwind v4 generates utilities `*-fresh-green`, `*-fresh-green-mute`, `*-fresh-green-glow` (every prefix in D-83's regex covers all suffix variants). The `--color-fresh-green-soft` pseudo-token referenced in `proto_rm_cockpit.js` line 140 is NOT in Phase 2's `@theme` — either add it (additive `@theme` change is safe) or use a different token in the OvernightRow icon-tile background. Plan-phase resolves.

</specifics>

<deferred>
## Deferred Ideas

### Re-deferred from prior phases
- **Custom Vercel domain** (Phase 2 deferral) — still deferred. `*.vercel.app` is the demo URL until pre-stakeholder polish.
- **Husky / lint-staged** (Phase 2 deferral) — still deferred. CI is the safety net.
- **Storybook** — deferred. Phase 4 ships a single `/dev/primitives` demo page; Storybook only if the primitive count grows past ~15 components.
- **Real entity enrichment / external registry queries** (Phase 3 confirmed deferred) — still deferred.
- **LocalStorage / sessionStorage persistence** (Phase 3 deferral) — applied to mode persistence too; D-70 chose URL-driven over `localStorage.setItem('origin-mode', ...)`.

### Newly deferred from Phase 4 discussion
- **Wiring chrome to `lib/api.mock.ts`** — Phase 4 chrome reads from `lib/persona.ts` plain constants per D-66. Phase 5/6 may swap to api.mock at their discretion. Phase 4 does not block on this.
- **Container-level cards as a primitive** (For-your-attention, AI lane, Needs you, Overnight) — screen-specific in Phase 5/6/7 per D-77.
- **`BrandLockup` primitive** — top strip uses inline brand markup, not a separate BrandLockup component. Defer if any future screen wants the full logo + name + tagline composition (e.g., a marketing surface).
- **`Bilingual`, `formatReiwa`, `KanjiWatermark`, `ConfidenceMeter`** — prototype primitives Phase 4 does NOT ship; consuming phases (5 dashboard / 8 hero moments) add them.
- **`AIPulse` (the bare dot + eyebrow label wrapper)** — not shipped as a primitive per D-75; callers compose `<AIPulseDot/>` + `<Eyebrow>{label}</Eyebrow>` if they want that shape.
- **`PriorityBar`** — D-81 deferred to Phase 6 (RM cockpit Needs You) as inline + helper; promote to primitive only if a third surface adopts.
- **The Copilot trigger button + Copilot sidecar itself** — RMShell ships with empty sidecar slot; trigger + copilot are Phase 8. Plan-phase may ship a placeholder no-op trigger for visual completeness on the demo page.
- **i18n framework (next-intl or similar)** — language toggle is visual-only per CLAUDE.md "Language: English only in UI body". Real i18n would be its own phase if scope expands.
- **Icon system extensions** — filled vs outline variants, multi-size scaling beyond the `size` prop, animated icons. Phase 4 ships line icons at default stroke 1.6, single `size` prop.
- **`ActionCard` indicator-slot rendering conventions** — `indicator?: ReactNode` is intentionally unconstrained per D-76. If drift (different surfaces using different shapes for similar semantics) becomes an issue in Phase 7+, codify via a small registry of named indicators.
- **Demo page as a full design-system "kit"** (color swatches, typography ramp, spacing scale, motion examples) — Phase 4 ships only "render every primitive in every state". Kit-page expansion deferred.
- **Vercel env-var dashboard configuration for `NEXT_PUBLIC_SHOW_MODE_SWITCHER`** — exact scoping (true in Preview, false in Production) is plan-phase + manual Vercel UI work.
- **GitHub Action that auto-detects new fresh-green allowlist additions and pings a reviewer** — could automate D-86's "architectural review" requirement. Manual review is sufficient for now.
- **Branch-protection update to add the SHELL-05 check as a 5th required status** — depends on whether plan-phase makes it a separate CI job or rolls into `test`. If separate, manual GitHub UI step after the first CI run.

</deferred>

---

*Phase: 04-app-shell-primitives*
*Context gathered: 2026-04-26*
