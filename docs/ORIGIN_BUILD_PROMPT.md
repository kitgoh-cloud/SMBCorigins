# BUILD: SMBC Origin — Clickable Prototype

You are building a desktop-first, fully clickable HTML prototype of **SMBC Origin** — an AI-native corporate banking onboarding experience. This is a high-fidelity showpiece for SMBC leadership and client workshops, not a production system. Your job: ship a single cohesive prototype a stakeholder can open in a browser and walk through end-to-end, covering both client and Relationship Manager perspectives across all six stages of a corporate client's onboarding journey.

Build with HTML, CSS, and vanilla JS. Desktop-only (assume 1440px viewport). Self-contained files with CDN dependencies only — no build tooling, no backend, no database. All state is hard-coded or held in memory.

---

## 1 · What "good" looks like

After a 15-minute stakeholder walkthrough, at least 3 of these 5 reactions should land:

1. *"That feels five years ahead of where we are today."*
2. *"The UBO agent is magic."*
3. *"I want the credit memo drafter yesterday."*
4. *"The RM cockpit is a tool I'd actually use."*
5. *"The client experience is consumer-grade."*

Bias every decision toward these outcomes. If a feature doesn't serve one of these reactions, cut it.

---

## 2 · Product context

**SMBC Origin** reimagines corporate banking onboarding — the process by which a multinational corporate client gets their entities, documents, and credit facilities set up with a new bank. Today at SMBC and peers, this takes 90–180 days of manual work, repeated document uploads, and fragmented tooling across KYC, credit, product, and activation systems. Origin collapses this into a single AI-orchestrated journey where the client and RM share visibility into a continuously updating state, and AI agents handle the repetitive work underneath (structure analysis, document extraction, screening, memo drafting).

The prototype showcases what onboarding looks like when AI is the connective tissue — not a bolted-on chatbot, but the layer that orchestrates the whole experience. Japanese heritage is core to SMBC's brand — the prototype honors this through type, color, and restrained bilingual detail.

---

## 3 · Personas

### Yuki Tanaka — Treasurer, Kaisei Manufacturing KK
Sophisticated corporate user. Manages treasury for a Japanese MNC expanding into Southeast Asia and Europe. Wants visibility, predictability, and to never upload the same document twice. Comfortable with tech but not a banker. Values efficiency, clarity, and respect for her time. Checks Origin a few times a day to see status.

### James Lee — Relationship Manager, Japanese Corporates desk, SMBC Singapore
Portfolio of ~25 multi-jurisdictional Japanese corporate clients. His day is currently 40% admin (chasing docs, copying data between systems, drafting memos) and 60% relationship. Origin's promise to him: flip that ratio. Wants one cockpit, intelligent prioritization, and AI that does the work rather than theater.

---

## 4 · Hero scenario: Kaisei Manufacturing KK

A Japanese precision engineering firm (fictional, but archetypal) expanding from Japan into Singapore, Hong Kong, and the United Kingdom. Applying for a full-service relationship with SMBC: cash management, trade finance, and a **USD 50M revolving credit facility**.

**Entity tree**
```
Kaisei Manufacturing KK (parent) — Japan
├── Kaisei Asia Pacific Pte Ltd — Singapore (100%)
├── Kaisei Trading HK Ltd — Hong Kong (100%)
├── Kaisei Europe Ltd — UK (100%)
└── Kaisei Technology KK — Japan (80%; 20% held by Morita Holdings)
    └── Morita Holdings — BVI (shell — unwrapped to Tanaka Family Trust)
```

**Ultimate beneficial owners**
- Hiroshi Kaisei (founder's grandson, 42% via holding)
- Yuki Kaisei (sister, 18%)
- Kenji Morita (investor, 12% via BVI entity — the shell that Origin unwraps)
- Tanaka Family Trust (beneficiaries: 4 natural persons, each <5%)
- Public float (balance)

**James's other portfolio (for cockpit texture — 6 background applications in varied stages)**
- Fujiwara Pharma — Stage 3, doc review
- Sato Trading — Stage 4, screening (1 amber hit)
- Ishikawa Logistics — Stage 5, credit memo drafting
- Hayashi Foods — Stage 1, invited
- Nakamura Electronics — Stage 6, activating
- Ota Robotics — on hold (regulatory clarification)

Seed data should be deep enough that a reviewer poking at any corner finds plausible detail — real-feeling company names, dates in sequence, jurisdictional flavor.

---

## 5 · The six stages

All application journeys flow through the same sequence. For the prototype, assume Kaisei is **currently in Stage 3** (Documentation), with Stages 1–2 completed and 4–6 upcoming.

| # | Stage | What happens |
|---|---|---|
| 1 | **Invite & Intent** | RM creates application; client receives invite, confirms scope, products of interest, jurisdictions |
| 2 | **Entity & Structure** | Client declares group; AI unwraps the tree, identifies UBOs across filings — *UBO Intelligence hero moment* |
| 3 | **Documentation** | Client uploads required docs per jurisdiction; AI extracts and cross-references — *Doc Extraction hero moment* |
| 4 | **Screening** | Sanctions, PEP, adverse media across all entities and UBOs; agentic clearance of low-risk hits |
| 5 | **Products & Credit** | Configure cash / trade / credit; AI drafts the credit memo — *Credit Memo Drafter hero moment* |
| 6 | **Activation** | Accounts open, facilities live, handoff to servicing; Perpetual KYC teaser |

---

## 6 · Four AI hero moments

These are the demo-defining moments. Each needs to land as "magic" visually, not just "there's some AI here." Build them with care.

### Hero 1 — UBO Intelligence (Stage 2)
**What it does:** Client declares entity scope. AI pulls filings (mocked) from registries across Japan, BVI, Singapore, UK. It builds the ownership tree automatically — including unwrapping the BVI shell to reveal Kenji Morita as beneficial owner. Surfaces 1 item for RM review (the trust).

**UX:** An interactive tree diagram (SVG or React Flow-style) that builds progressively — nodes appear with staggered animation, edges draw in, percentages populate. A sidebar shows "Origin's reasoning" — 4–6 plain-language lines like *"Unwrapped Morita Holdings (BVI) → identified Kenji Morita as indirect UBO via 12% stake in Kaisei Technology KK."* Confidence chips on each node. Green for resolved, amber for "needs review." A single amber node draws attention.

### Hero 2 — Doc Extraction (Stage 3)
**What it does:** Client drops a PDF (e.g., Certificate of Incorporation). AI extracts structured fields live — entity name, registration number, directors, registered address, share capital, filing dates.

**UX:** Split pane. Left: the rendered PDF with fields highlighting as they're found (yellow glow sweep). Right: a structured form populating in real time — each field appearing with a brief typewriter/streaming effect, then a green check and a confidence score. A running counter ticks upward: "17 fields extracted… 31… 47." At the end: "Pre-filled your Singapore and Hong Kong applications" — making the cross-jurisdictional reuse explicit.

### Hero 3 — Credit Memo Drafter (Stage 5)
**What it does:** RM clicks "Draft memo." AI drafts a full credit memo section by section — executive summary, financial spreading, risk assessment, covenant proposal, recommendation — streaming in real time. The RM can accept / edit / regenerate each section.

**UX:** Document-style view. Each section streams in with typewriter effect (use real Claude API if possible — specify `claude-sonnet-4-5` via the Anthropic API endpoint; if not available, fake the streaming with setTimeout). Section headers appear first, then content fills. Citations in margins linking back to source documents. Editable inline. A "Regenerate section" button per section. Fresh Green progress indicator tracks sections as they complete. Final state: full memo ready for RM review, timestamp showing total draft time (e.g., "Drafted in 47 seconds — typical manual draft: 3 days").

### Hero 4 — RM Copilot (cross-cutting)
**What it does:** A persistent sidecar on every RM screen. James can ask natural language questions — *"What's blocking Kaisei?"* or *"Show me all Stage 4 applications with amber screening hits"* or *"Draft a status update email to Yuki."* Copilot answers with tool-calling into the prototype's data.

**UX:** Collapsible right sidecar, Fresh Green glow when active. Chat interface with example prompts pinned on first open. Responses cite screens/data in the prototype and can generate quick-action chips (e.g., "Open application" / "Copy email draft"). Use real Claude API if feasible with a system prompt scoped to the prototype's data.

---

## 7 · Screens to build

The prototype has two modes — Client and RM — toggleable via a dev-only mode switcher in the top bar. Total 16 primary screens:

**Client mode (Yuki's view)**
1. Journey dashboard (home) — status, ETA, action queue, AI lane, activity, team
2. Stage 1 — Invite confirmation: accept invite, confirm scope, products of interest, jurisdictions
3. Stage 2 — Entity & Structure: declare group + see AI-built UBO tree
4. Stage 3 — Documentation: upload zone, per-jurisdiction requirements, extraction views
5. Stage 4 — Screening: status-only view ("checks in progress across 5 entities")
6. Stage 5 — Products & Credit: see proposed bundle, review draft terms
7. Stage 6 — Activation: accounts live, next steps, Perpetual KYC teaser
8. Messages — thread with James

**RM mode (James's view)**
9. Cockpit home — KPIs, "Needs you" queue, "AI has been busy" overnight summary, portfolio kanban (6 stages × N apps)
10. Application detail — Kaisei: tabbed view across the 6 stages, timeline, all client activity
11. Stage 2 RM view — UBO tree review + approve/flag
12. Stage 3 RM view — document index + extraction review
13. Stage 4 RM view — screening hit disposition (amber/red hits, agentic clearance of greens)
14. Stage 5 RM view — product configuration + Credit Memo Drafter hero
15. Stage 6 RM view — activation checklist
16. Copilot panel — accessible from anywhere in RM mode

---

## 8 · Design system (locked — don't deviate)

### Typography
- **Fraunces** — display, headlines, numerals (serif, characterful, institutional-but-warm). Use font variation settings `"SOFT" 50–100, "WONK" 0–1` for display numerals.
- **Inter Tight** — UI body, buttons, labels
- **Noto Sans JP** — Japanese characters
- **IBM Plex Mono** — data, timestamps, IDs, labels, eyebrow text

Display numerals should be Fraunces with tight negative letter-spacing (-0.045 to -0.065em). Eyebrow labels are Plex Mono, 10–11px, uppercase, letter-spacing 0.12–0.18em.

### Color palette (CSS variables)
```css
--trad-green: #004832;         /* Traditional SMBC green */
--trad-green-deep: #00301F;    /* Darker surfaces, top bars */
--trad-green-soft: #1A5F48;    /* Hover states */
--fresh-green: #BFD730;        /* SMBC Fresh Green — RESERVED FOR AI */
--fresh-green-mute: #D4E566;
--fresh-green-soft: #E5EFBE;
--fresh-green-glow: rgba(191, 215, 48, 0.08);
--ink: #0A1410;                /* Primary text */
--ink-soft: #3C4540;           /* Secondary text */
--ink-muted: #7A827D;          /* Tertiary, meta */
--paper: #FAFBF7;              /* Page background */
--paper-deep: #F3F5EE;         /* Card backgrounds */
--mist: #E8EDE4;               /* Borders, dividers */
--mist-deep: #D9E0D4;
--signal-amber: #E8A317;       /* Warnings, due dates */
--signal-red: #C73E1D;         /* Errors, high-risk hits */
--signal-info: #2A6F97;        /* Info states */
```

**Critical rule: Fresh Green is reserved exclusively for AI outputs, AI presence, and AI-contributed content.** When a stakeholder sees Fresh Green on screen, they should know something intelligent just happened. Do not use it for generic accents, primary buttons, or non-AI visual emphasis.

### Visual signatures
- **Rising Mark** — circular logo with a clock-hand-like stroke in Fresh Green; use as brand lockup
- **縁 watermark** — Japanese character meaning "connection/bond," ghosted at ~3% opacity in hero cards
- **Pulsing AI dots** — 8px Fresh Green dots with expanding glow (2s ease-in-out), indicating AI working
- **Bilingual greetings & dates** — `"Good morning, Yuki-san."` paired with `"おはようございます"`; Reiwa-era date alongside Gregorian
- **Gradient underlines on hero cards** — thin 2px bleed from `--trad-green` → `--fresh-green` → transparent across card bottoms, foreshadowing AI as connective tissue

### Motion
- Subtle, purposeful. Page loads stagger reveals (100–200ms delays). AI moments feel "alive" via pulsing, streaming text, progressive tree building.
- Never animate for its own sake. Every animation earns its pixel.

### Density
- Client side: calm, editorial, generous whitespace, max content width ~1200px centered
- RM side: denser, dashboard-like, full 1440px canvas with sidebar + workspace layout, information-rich but never chaotic

---

## 9 · Navigation pattern

- **Top strip** — persistent across all screens. Origin brand mark + current entity/portfolio badge, language toggle (EN / 日本語 — visual only, non-functional), messages, help, avatar
- **Mode switcher** — dev-only toggle in the top strip to flip between Yuki's view and James's view. Clearly labeled as a demo tool.
- **Client mode** — single-column flow, journey dashboard as home, stage screens accessed from the timeline
- **RM mode** — left sidebar with nav (Cockpit, Applications, Pipeline, Copilot), workspace on right. Copilot sidecar slides in from the right edge.
- **Linking** — all stage cards, action buttons, kanban tiles, activity rows are clickable and lead to the right screen. No dead ends.

---

## 10 · Tech constraints

- **Pure HTML / CSS / vanilla JS.** No frameworks unless a hero moment genuinely needs it (React Flow or D3 acceptable for the UBO tree).
- **CDN dependencies only** — Tailwind via CDN is fine for rapid layout; Google Fonts for type; lucide-icons via CDN for icons.
- **No backend, no database, no auth.** All state in JS variables or localStorage.
- **Claude API for AI moments where possible** — Hero 3 (Credit Memo) and Hero 4 (Copilot) are ideal candidates. If API access isn't available in the build environment, fake the streaming convincingly with `setTimeout` and pre-written content. Never mock in a way that feels hollow — pre-written content should be rich and specific.
- **Optimize for Chrome desktop at 1440px.** Don't worry about mobile or other browsers.

---

## 11 · Explicit non-goals

Do not build:
- Login or authentication flows (assume logged in)
- Account creation
- Real KYC, AML, or sanctions provider integrations — all mocked
- Multi-language UI beyond the bilingual surface details in the design system
- Email delivery, notifications
- Settings, profile, admin pages
- Accessibility certification-level compliance (basic practices only)
- Compliance officer or ops persona views (RM + Client only)

Resist scope creep. If a screen isn't in Section 7, don't build it.

---

## 12 · Suggested build order

1. **Design system foundations** — CSS variables, font loading, typography utility classes, shared components (buttons, cards, eyebrow labels, status chips, AI pulse)
2. **Shells** — top strip + mode switcher, client single-column shell, RM sidebar + workspace shell
3. **Client journey dashboard** (Screen 1) — the heartbeat; sets tone for every other client screen
4. **RM cockpit home** (Screen 9) — the heartbeat on the RM side
5. **Stage-by-stage** — build both sides of each stage in parallel (Stage 1 → 6)
6. **Hero moments** — UBO tree, Doc Extraction, Credit Memo Drafter, Copilot — in that order
7. **Polish pass** — empty states, loading states, activity feed depth, seed data realism, micro-interactions

Each stage should be a working clickable flow before moving on. Don't save polish for the end — build every screen at near-final fidelity.

---

## 13 · Voice & copy

- Warm, clear, lightly institutional. The tone of a trusted advisor, not a software product.
- Avoid jargon where plain language works. When jargon is needed (KYC, UBO, screening), use it confidently.
- Bilingual detail sparingly and meaningfully — honor Japanese heritage without costume.
- AI narration in first-person Origin voice: *"Origin built your UBO tree from 3 filings."* Not: *"The AI has completed processing."*
- Numbers matter — specific counts ("47 fields extracted"), real durations ("Drafted in 47 seconds"), concrete comparisons ("vs 90–180d industry average").

---

## How to start

Read this brief end-to-end before writing any code. Then propose a brief implementation plan — file structure, which screen you'll build first, any clarifying questions — before diving in. Ship screens at near-final fidelity; don't build scaffolding and circle back to polish. When in doubt, bias toward the five stakeholder reactions in Section 1.

Good luck. Build something memorable.
