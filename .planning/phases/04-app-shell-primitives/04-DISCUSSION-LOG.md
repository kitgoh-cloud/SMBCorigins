# Phase 4: App Shell & Primitives - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in `04-CONTEXT.md` — this log preserves the alternatives considered.

**Date:** 2026-04-26
**Phase:** 04-app-shell-primitives
**Areas discussed:** Shell layout & placement, Primitives API shape, Fresh Green enforcement (SHELL-05). Dev-mode switcher mechanism + UX folded into Shell layout. Demo page strategy folded into Primitives API shape. Port strategy raised as an addendum after the main discussion (see end of file).
**Visual source of truth (per user):** `docs/Origin Prototype.html` — assets extracted to `/tmp/proto_*.js` during this discussion.

---

## Area selection (multi-select)

| Option | Description | Selected |
|---|---|---|
| Shell layout & placement | Top strip in App Router, persona/context badge content, demo page placement | ✓ |
| Dev mode switcher mechanism | NODE_ENV vs env var, where it sits, UX shape | (folded into Shell layout) |
| Primitives API shape | StatusChip variants, StagePill shape, AIPulseDot scope, ActionCard scope | ✓ |
| Fresh Green enforcement | ESLint vs grep vs stylelint vs visual audit | ✓ |

**User notes:** "Pick 1, 3, 4. Before discussing primitive API shape, read `docs/Origin Prototype.html` (or wherever the prototype lives) and treat it as the visual source of truth — specifically: which states StatusChip needs to express, what the 6-stage timeline looks like, where AI surfaces appear (informs Fresh Green scope and AIPulseDot behavior), and what the paired Your turn/Our turn ActionCard pattern actually contains."

---

## Shell layout & placement

### Q1: Where does the shared chrome live in the App Router tree?

| Option | Description | Selected |
|---|---|---|
| Top strip in root layout; inner shells in route-group layouts | Top strip in `app/layout.tsx` (every route inherits). Inner ClientShell in `app/(client)/layout.tsx`; inner RMShell in `app/(rm)/layout.tsx`. Self-contained route groups. | ✓ (recommended) |
| Everything in root layout, branch by pathname | Root layout uses `usePathname()` to pick ClientShell vs RMShell. Single file; root becomes a client component; less customizable. | |
| Everything in route-group layouts; no root layout chrome | Top strip duplicated. Visual drift risk. | |

**User's choice:** Top strip in root layout; inner shells in route-group layouts (recommended).

### Q2: What does the top strip render in Phase 4?

| Option | Description | Selected |
|---|---|---|
| Full prototype shape with Phase 4 stubs | Brand lockup + divider + context badge + flex spacer + dev-only mode switcher + EN/JP toggle + mail+help icons + divider + name+role+avatar. Persona/context strings come from a stub source; Phase 5/6 swap to real data without restructuring chrome. | ✓ (recommended) |
| Minimal Phase 4: brand + lang toggle + mode switcher only | Defer context badge, mail/help, persona avatar to Phase 5/6. Cleaner Phase 4 boundary; more rework later. | |
| Full prototype shape, all data hard-coded inline | Hard-code "Yuki Tanaka / TREASURER / Kaisei Manufacturing KK" etc. directly in TopStrip JSX. Visually complete but duplicates seed data into chrome. | |

**User's choice:** Full prototype shape with Phase 4 stubs (recommended).

### Q3: How is the dev-only mode switcher made dev-only?

| Option | Description | Selected |
|---|---|---|
| `process.env.NODE_ENV !== 'production'` guard, tree-shaken | Component renders null in production. Zero bytes shipped. Vercel previews use NODE_ENV=production by default — switcher would not show in preview. | |
| `NEXT_PUBLIC_SHOW_MODE_SWITCHER` env var | Explicit env var. Default true; set 'false' in Vercel Production env. Aligns with `NEXT_PUBLIC_USE_MOCK` pattern from D-35. Works in both preview and dev. | ✓ |
| Both: NODE_ENV guard + NEXT_PUBLIC override | Belt-and-suspenders. More complex. | |

**User's choice:** `NEXT_PUBLIC_SHOW_MODE_SWITCHER` env var.

### Q4: Mode switcher persistence and routing behavior

| Option | Description | Selected |
|---|---|---|
| localStorage + auto-redirect on mismatch (matches prototype) | Mode persists in localStorage. On change, redirect to that mode's home if current pathname doesn't match. | |
| URL-driven only, no persistence | Mode is implicit from route group. Switcher = two `<Link>`s. No localStorage, no redirect. | ✓ |
| Per-tab session state, no localStorage | React context or cookie. Persists within session, not across restarts. | |

**User's choice:** URL-driven only, no persistence.

---

## Shell layout — follow-up batch (resolving the URL-driven + root-layout-chrome interaction)

### Q5: How does TopStrip in root layout know the active mode/persona when URL-driven?

| Option | Description | Selected |
|---|---|---|
| Client component + `usePathname()` + route map | TopStrip is `'use client'`; `lib/persona.ts` maps pathname → mode/persona. One source of truth, no context plumbing. | ✓ (recommended) |
| React Context provider in each route-group layout | Provider wraps children; TopStrip reads via `useContext`. Forces TopStrip out of root layout (provider must be ABOVE consumer). Effectively breaks Q1's choice. | |
| Pass persona as a prop from each route-group layout | Means root layout doesn't render TopStrip; route-group layouts each render TopStrip with persona prop. Reverts Q1. | |

**User's choice:** Client component + `usePathname()` + route map (recommended).

### Q6: Mode-switcher link targets

| Option | Description | Selected |
|---|---|---|
| Hard-coded `/journey ↔ /cockpit` | Centralize in `lib/persona.ts` as `PERSONA_HOME`. | ✓ (recommended) |
| Configurable per-mode home | Same end result; easier to retarget in Phase 5/6. Minor over-engineering for two routes. | |

**User's choice:** Hard-coded `/journey ↔ /cockpit` (recommended) — centralized in `lib/persona.ts`.

### Q7: Where do the stubbed persona names/roles/context strings live?

| Option | Description | Selected |
|---|---|---|
| `lib/persona.ts` as plain TS constants | `PERSONAS = { client: {...}, rm: {...} }`. Phase 4 chrome decoupled from data layer. | ✓ (recommended) |
| Read from `data/seed.ts` for Yuki/James | Reuse seed; couple chrome to seed shape. | |
| Read via `lib/api.mock.ts` | Most realistic; complicates root-layout placement (async/Suspense). Defer. | |

**User's choice:** `lib/persona.ts` as plain TS constants (recommended).

---

## Primitives API shape

### Q8: StatusChip variant set

| Option | Description | Selected |
|---|---|---|
| Adopt prototype's 6 visual-intent kinds: `ok | ai | amber | ghost | red | info` | Caller maps domain → intent. Prop type: `kind`, `children`, `dot?`. `kind='ai'` is the only fresh-green-allowed chip. | ✓ (recommended) |
| Replace with domain-tied closed enums per surface | `<DocStatusChip>`, `<ScreeningChip>`, etc. Type-safe; multiplies primitives. | |
| Generic intent prop + orthogonal `ai?: boolean` flag | Cleaner naming; same end result with rename cost. | |

**User's choice:** Adopt prototype's 6 visual-intent kinds (recommended).

### Q9: StagePill shape and data contract

| Option | Description | Selected |
|---|---|---|
| StagePill = numbered disc (rename of StageNumeral); takes `{n, state}` | Single primitive. `state: 'done' \| 'current' \| 'upcoming'`. Renders ✓ for done. STAGE_NAMES rendered by consumer. | ✓ (recommended) |
| StagePill = labeled rounded-rect pill; StageNumeral added as 2nd primitive | Two primitives. Pushes count to 6 named. | |
| StagePill consumes `Application` directly (calls deriveStages) | Couples primitive to domain type. Hard to test. | |

**User's choice:** StagePill = numbered disc; takes `{n, state}` (recommended).

### Q10: AIPulseDot surface area in `components/primitives/`

| Option | Description | Selected |
|---|---|---|
| Three primitives: AIPulseDot + AIPulse + AIBadge | Match prototype's full set. 7 primitives total. | |
| Just AIPulseDot, callers compose label themselves | Stays at 5 primitives. Loses AIBadge's dark-pill shape. | |
| AIPulseDot + AIBadge only; skip the bare AIPulse wrapper | Most-used shapes. 6 primitives. | ✓ |

**User's choice:** AIPulseDot + AIBadge only; skip the bare AIPulse wrapper.

### Q11: ActionCard scope and shape

| Option | Description | Selected |
|---|---|---|
| ActionCard = the row primitive with tone variants | Props include `indicator: 'amber' \| 'red' \| 'priority-bar' \| 'ai-live' \| ...` (string union). | (replaced — see notes) |
| ActionCard = container card + ActionRow as separate primitive | Two primitives; thin shared wrapper. | |
| ActionCard = compound `ActionCard + ActionCard.Row` | Idiomatic React; same end result with cleaner ergonomics. | |

**User's notes (overrides Option 1's enum):** "ActionCard is the row primitive. But replace `indicator: <string union>` with `indicator?: ReactNode` slot. Composers pass `<AIPulseDot/>`, `<StatusChip kind='amber' dot/>`, or a small `<PriorityBar/>` primitive. Same for `cta` — slot, not enumerated. Container-level cards (For-your-attention, Needs you, AI lane, Overnight) stay screen-specific in Phase 5/6, no shared wrapper. The four prototype row variants become composition recipes, not props variants. Confirm whether PriorityBar deserves a 7th primitive — it's the only new visual element not already covered."

**Effective decision:** ActionCard = row primitive with **slot-shaped `indicator?: ReactNode` and `cta?: ReactNode`**. NOT enumerated unions. Container-level cards stay screen-specific.

---

## Primitives — supplementary batch (PriorityBar, Icon/Avatar, demo page)

### Q12: PriorityBar — primitive or inline?

| Option | Description | Selected |
|---|---|---|
| Inline helper, NOT a primitive | 4×36 colored div with 3 fixed colors used in one place (NeedsYouRow). `priorityColor()` helper in `lib/priority.ts` if reused. | ✓ (recommended) |
| Promote to primitive | `<PriorityBar priority={...}/>` as 7th primitive. | |

**User's choice:** Inline helper, NOT a primitive (recommended).

### Q13: Icon and Avatar — primitives or shell-internal?

| Option | Description | Selected |
|---|---|---|
| Lift both into `components/primitives/` | Used by chrome + every Phase 5–8 screen. 8 primitives total. | ✓ |
| Keep in `components/shell/`; copy where Phase 5/6 need them | Pure-to-spec at 6 primitives. | |
| Icon to primitives/, Avatar stays in shell/ | Half-and-half. | |

**User's notes (additional constraints):** "Pick 1 — Icon and Avatar both lift into primitives/. Three constraints to bake in:
1. Avatar's `color` prop must be a **closed token enum** (e.g., `'sand' | 'sage' | 'navy' | whatever the brand palette's avatar-eligible tokens are`). **Explicitly exclude fresh-green.** Same closed-enum discipline as `StatusChip.kind`. Open string would let Phase 5/6 pass fresh-green and SHELL-05 enforcement couldn't catch it.
2. Icon's `name` prop must be a **closed string union** of the ~40 icons we ship in Phase 4. No generic path/SVG slot. Phase 5/6 can extend the union additively, but each new icon is a deliberate addition, not arbitrary inline SVG.
3. **SHELL-04 drift needs to be recorded.** Spec says 5 primitives; we're shipping 8 (Eyebrow, StatusChip, StagePill, AIPulseDot, AIBadge, ActionCard, Icon, Avatar). Update REQUIREMENTS.md SHELL-04 as part of Phase 4's PR — either amend to '5 brand primitives + 3 infrastructure primitives = 8' or split into SHELL-04 (brand) and SHELL-04a (infrastructure). Pick one in plan, but record the change explicitly. Same discipline as warning-list drift — silent scope extension is worse than wrong decision."

### Q14: Primitives demo page

| Option | Description | Selected |
|---|---|---|
| `/dev/primitives`, dev-only via NEXT_PUBLIC_SHOW_MODE_SWITCHER gate | Hidden in prod. Dev/preview only. | |
| `/_dev/primitives`, always shipped (also in production) | Public scratchpad. Tiny prod-bundle cost. | ✓ (with App Router private-folder caveat — see CONTEXT.md D-80) |
| Storybook | Heaviest. Defer. | |

**User's choice:** `/_dev/primitives`, always shipped.

**Note recorded in CONTEXT.md (D-80):** App Router treats `_`-prefix folders as **non-routable private folders**, so the literal URL `/_dev/primitives` will not resolve. Plan-phase coerces to `/dev/primitives` (no underscore) unless an alternative is chosen. The intent — public, always-shipped, scratchpad — is preserved.

---

## Fresh Green enforcement (SHELL-05)

### Q15: Enforcement mechanism

| Option | Description | Selected |
|---|---|---|
| CI grep script + `.freshgreen-allowlist` file | Greps for fresh-green tokens; fails on matches outside allowlist. Allowlist is checked-in; PR-visible diffs. Zero tooling deps. | ✓ |
| Custom ESLint rule + `/* eslint-disable */` allowlist | Idiomatic for JS/TS; AST work; doesn't natively cover inline styles or globals.css. | |
| Stylelint (CSS) + ESLint (JSX) | Most complete; highest tooling overhead. | |
| Visual audit only | No mechanical guarantee. | |

**User's notes:** "Pick 1 — CI grep script + `.freshgreen-allowlist`. Two refinements:
1. Lock the grep match-list in the script as an explicit array. Cover: token name, CSS var (`--color-fresh-green`), Tailwind utility variations (`bg/text/border/ring/from/to-fresh-green`), arbitrary-value forms (`bg-[var(--color-fresh-green)]`), hex value defense-in-depth, and the rgba form used in the prototype's mode-switcher dashed border. Single source of truth, reviewed once.
2. Add a self-documenting comment header at the top of `.freshgreen-allowlist` explaining SHELL-05's reservation rule. Phase 5/6/7 reviewers may not know the rule by name; the file should teach what editing it commits to.
3. The four prototype SHELL-05 violations get retrofitted in Phase 4 (top-strip avatar bg, mail-dot, mode-switcher dashed border, sidebar active dot). **Confirm the retrofit lands in this phase's PR — same PR introduces enforcement AND zeroes out existing violations, so the script passes from day one rather than starting with a known-failing state.**"

### Q16: What forms of fresh-green does the check inspect?

| Option | Description | Selected |
|---|---|---|
| All four: hex `#BFD730`, `var(--color-fresh-green)`, Tailwind utilities, `rgba(191,215,48,*)` | Comprehensive. | ✓ |
| Tailwind classes + CSS var only | Skip hex/rgba; risks letting inline rgba slip through. | |
| CSS var only | Easiest; weakest. | |

**User's notes:** "Pick 1 — all four forms. Two confirmations to lock in script:
1. CSS-var regex covers token base name AND any suffix variants present in `@theme` — pattern like `--color-fresh-green(-[a-z0-9]+)?`. Confirm the variant suffixes match Phase 2's actual tokens; comment in script noting TODO if `@theme` adds new fresh-green variants (additive token = silent bypass otherwise).
2. Script's test fixtures explicitly include arbitrary-value Tailwind bypass attempts — `bg-[#BFD730]`, `bg-[var(--color-fresh-green)]`, `bg-[rgba(191,215,48,0.3)]` — to prove the hex/var/rgba greps catch them transitively. **Don't assume; test.**
3. Case-insensitivity on hex is already in the agent's spec — keep it. **Word-boundary `\b` on the hex grep is critical** (avoid false positives if `#BFD730` appears inside a longer hex string)."

### Q17: Allowlist source-of-truth

| Option | Description | Selected |
|---|---|---|
| `.freshgreen-allowlist` file at repo root | Plain-text, glob-supported, PR-visible diffs. | ✓ |
| Inline comment marker (`// SHELL-05-ALLOW: ...`) | Distributed; risk of thoughtless markers. | |
| Both | Belt-and-suspenders. | |

**User's notes:** "Pick 1 — `.freshgreen-allowlist` at repo root, central source of truth. Two refinements:
1. Initial allowlist contains **only files that exist in Phase 4's PR**. Specifically: `components/primitives/AIPulseDot.tsx`, `components/primitives/AIBadge.tsx`, `components/primitives/StatusChip.tsx`, `app/_dev/primitives/page.tsx`. **Drop the speculative globs** (`components/screens/**/Hero*.tsx`, `AILane*.tsx`) — those files don't exist yet. Phase 5/6/7 PRs add their own entries when they ship AI surfaces. Preserves the 'every widening is a reviewable PR' property; preemptive globs defeat it.
2. StatusChip is allowlisted (its `kind='ai'` branch needs fresh-green) but **whole-file allowlist is coarse** — the lint can't distinguish `kind='ai'` from `kind='ok'` inside that file. Mitigation: StatusChip's unit tests verify each kind renders the expected token. If someone accidentally swaps a non-AI kind to fresh-green, lint passes (file is allowlisted) but unit test fails. **Test-as-second-line-of-defense for allowlisted primitives.** Worth a one-line note in the allowlist comment header.
3. Allowlist comment header from earlier turn still applies — 'SHELL-05 reserves Fresh Green for AI-authored output. Adding a path here requires architectural review, not just code review.'"

---

## Final gate

| Option | Description | Selected |
|---|---|---|
| Create context | Write CONTEXT.md, DISCUSSION-LOG.md, commit. | ✓ |
| Explore more gray areas | Open additional discussion. | |

**User's choice:** Create context.

---

## Addendum — Port strategy (raised after the final gate)

After the user picked "Create context", they raised one more decision that should not default silently and asked it be captured here for plan-phase to surface explicitly. This is a real Phase 4 decision deferred to plan-phase by design — every viable approach satisfies Phase 2's Pattern A (CSS-first `@theme` tokens, no inline hex), but each shifts the SHELL-05 grep target and has different porting effort.

**Context:** the prototype (`docs/Origin Prototype.html` → `proto_*.js`) uses CSS class names that don't exist in Phase 2's `app/globals.css`:
`card`, `card--hero`, `card--ai`, `chip chip--{kind}`, `chip--dot`, `btn`, `btn--ghost`, `btn--sm`, `t-display`, `t-eyebrow`, `t-numeral`, `t-jp`, `t-mono`, `ai-pulse`, `reveal`, `hr`, `watermark-en`.

Pattern A forbids inline hex / raw CSS but does NOT prescribe a strategy. Plan-phase MUST pick one explicitly with rationale.

### Three viable strategies

| Strategy | What it looks like | SHELL-05 grep target | Pros | Cons |
|---|---|---|---|---|
| **(a) Utility soup at call sites** | Tailwind utilities directly in primitive `className`. Nothing in `globals.css` beyond Phase 2's `@theme` tokens. | Call-site class strings | One source of truth (Tailwind); easiest for Phase 5/6 to mirror; minimum tooling | Long className strings; possible duplication of common idioms (e.g., the eyebrow shape repeated 20 times) |
| **(b) `@apply` directives in `globals.css` preserving prototype class names** | `.t-eyebrow { @apply font-mono uppercase tracking-[0.18em] text-ink-muted text-[10px]; }`; primitives use `className="t-eyebrow"`. | `@apply` blocks in `globals.css` (covered by D-83's regex; `globals.css` becomes a coarse allowlist node) | Short class names; semantic naming; fewer per-call-site grep matches | Another abstraction layer; Tailwind v4's `@apply` rules constrain composition; harder to refactor a single utility without touching multiple consumers |
| **(c) Component-prop-driven styling, no shared class names** | Each primitive owns its style; consumers call `<Eyebrow>...</Eyebrow>` and never write Tailwind for typography idioms. | Primitive component files only — most granular | Cleanest API; lowest drift; smallest grep surface | Every typography variant needs a prop or component; flexibility tax for one-off needs |

### Plan-phase requirements

1. Pick one strategy explicitly in `04-PLAN.md`. Not by default. Not by silent inference from the first plan task.
2. Record rationale alongside the choice — at minimum: which fan-out is highest in Phase 5/6 (utility duplication risk), how much typography drift the primitives can tolerate, and whether the planner reviewed Tailwind v4's `@apply` composition rules (relevant to (b)).
3. Note the SHELL-05 grep implications: strategy (a) means the allowlist needs to enumerate primitive files; (b) means `app/globals.css` becomes a coarse allowlist target; (c) means only primitive files matter.
4. The chosen strategy applies uniformly across the 8 primitives **and** the chrome (TopStrip, ClientShell, RMShell). Mixed strategies are a smell.

This addendum exists because port strategy is high-leverage — picking it silently in the first plan task would lock Phase 5/6/7 into a path without rationale review.
