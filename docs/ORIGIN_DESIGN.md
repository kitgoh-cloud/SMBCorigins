# SMBC Origin — Design & Scoping Brief

<!-- mockup note: all mockups force 1440px viewport for mobile review -->

> **"Where the relationship begins."**
> A future-state corporate banking onboarding experience for Japanese MNCs expanding globally.

**Version**: 0.1 (scoping complete, pre-build)
**Owner**: Kit
**Stack**: Next.js 14 · TypeScript · Supabase · Tailwind · shadcn/ui
**Status**: Ready for Claude Code build

---

## 1. Product Vision

### 1.1 What it is
SMBC Origin is the onboarding front-door that sits upstream of SMBC Connect (the transaction banking portal SMBC Americas launched April 2026). It takes a Japanese MNC from "we want to open accounts across five jurisdictions" to "you're live and transacting" in under five days — a journey that today takes three to six months.

### 1.2 Positioning
A **dual-facing future-state showpiece** demonstrating how agentic AI, embedded intelligence, and radical UX clarity transform what is historically the most painful phase of a corporate banking relationship.

### 1.3 Audience for this prototype
- SMBC stakeholders (internal showpiece)
- Client workshop playback
- Future-state reference during AI transformation engagements

### 1.4 Core narrative (30-second pitch)
> "Today, a Japanese MNC opening accounts across Singapore, Hong Kong, and the UK waits 3+ months, submits the same documents five times, and chases their RM weekly. With SMBC Origin, the RM sends one invite. AI unwraps the corporate structure, extracts data from uploaded documents, screens every entity against global watchlists, configures products across every jurisdiction, and drafts the credit memo. The client is live in days, not months — and their RM spent their time on relationship, not paperwork."

---

## 2. Hero Scenario

### 2.1 The customer
**Kaisei Manufacturing KK** (架星製造株式会社)
- Tokyo-HQ'd automotive components manufacturer, founded 1962
- Revenue: ¥380B (~USD 2.5B)
- 4,200 employees globally
- Current banking: MUFG (Japan domestic only)
- **Onboarding trigger**: Expanding into three new markets
  - **Singapore** — new regional HQ (Kaisei Asia Pacific Pte Ltd)
  - **Hong Kong** — trading entity (Kaisei Trading HK Ltd)
  - **United Kingdom** — European R&D hub (Kaisei Europe Ltd)

### 2.2 Products being onboarded
1. **Accounts** — operating + FCY accounts across SG, HK, UK, and a Japan treasury account
2. **Cash Management** — multi-entity liquidity, sweep structures, payment limits
3. **FX** — JPY/USD/SGD/HKD/GBP pairs; forward and spot
4. **Trade Finance** — LCs and SBLCs for component imports
5. **Credit** — USD 50M revolving credit facility (regional working capital)

### 2.3 Why this scenario
- Realistic SMBC core customer (Japanese MNC expanding in APAC + EMEA)
- Multi-jurisdiction showcases the "Passport" / multi-country intelligence story
- Full product bundle shows orchestration
- Credit facility unlocks the Credit Memo hero moment

---

## 3. Personas

### 3.1 The Client — Yuki Tanaka
- **Role**: Group Treasurer, Kaisei Manufacturing
- **Location**: Tokyo
- **Age**: 48
- **Tech comfort**: High — expects Bloomberg Terminal + consumer-grade polish
- **Goals**: Get regional ops banking live before Q2 close; consolidate relationships; prove ROI of SMBC switch
- **Pain points (current state)**:
  - "We upload the same M&A document five times to five different teams."
  - "I have no idea what stage my application is actually in."
  - "Every jurisdiction asks for different things — nobody told us upfront."
- **Success looks like**: Single portal. Clear progress. Answers in the portal, not email. No surprises.

### 3.2 The RM — James Lee
- **Role**: Senior RM, Japanese Corporates Desk, SMBC Singapore
- **Location**: Singapore (Jurong office)
- **Portfolio**: 25 Japanese MNC clients in various lifecycle stages
- **Tech comfort**: High — bilingual JP/EN, lives in spreadsheets and CRM
- **Goals**: Close onboarding fast, minimise manual work, spot risk early, keep client warm
- **Pain points (current state)**:
  - "I spend 40% of my week chasing docs and copying data between systems."
  - "I don't know what's blocking onboarding until the client emails me angry."
  - "Credit memo takes me three days of manual spreading."
- **Success looks like**: Pipeline visible at a glance. AI handles the copying. I spend my time on the relationship and the complex judgment calls.

---

## 4. End-to-End Journey — 6 Stages

Journey shown below is from a **single application's** perspective, with both personas in parallel.

### Stage 1 — Invite & Intent
| | Customer (Yuki) | RM (James) | AI |
|---|---|---|---|
| **Trigger** | Receives magic-link email from James | RM creates new application | — |
| **Actions** | Click link, land on branded welcome | Selects jurisdictions (JP/SG/HK/UK), products (A/C/FX/T/Credit), estimated size | Pre-fills org header from Japanese corporate registry (hōjin bangō) |
| **Output** | Portal access established | Application created in RM cockpit | Seed entity & hierarchy guess |
| **Screens** | `/client/welcome` | `/rm/applications/new` | — |

### Stage 2 — Entity & Structure
| | Customer | RM | AI |
|---|---|---|---|
| **Actions** | Confirms entity tree, adds/edits subsidiaries, identifies UBOs | Monitors progress, approves structure | **UBO Intelligence Agent**: recursively queries ACRA (SG), Companies House (UK), Companies Registry (HK), Japan corporate registry. Unwraps shell layers. Surfaces natural persons. |
| **Output** | Full group structure captured + validated | Structure approved | UBO confidence score per person |
| **Screens** | `/client/entity` | `/rm/applications/[id]/structure` | — |
| **Hero moment** | — | — | Animated UBO tree building itself in real-time |

### Stage 3 — Documentation
| | Customer | RM | AI |
|---|---|---|---|
| **Actions** | Drags & drops docs (COI, M&A, board resolutions, signatory IDs, audited financials) | Reviews extracted data, requests missing | **Doc Extraction Agent**: OCR + LLM reads docs, populates fields, flags inconsistencies. **Smart Doc Requests**: asks ONLY for what's actually missing per jurisdiction. |
| **Output** | All jurisdictional requirements satisfied | Doc package approved | Structured data extracted from unstructured docs |
| **Screens** | `/client/documents` | `/rm/applications/[id]/documents` | — |
| **Hero moment** | Fields populating as PDF is parsed | — | — |

### Stage 4 — KYC / AML / Screening
| | Customer | RM | AI |
|---|---|---|---|
| **Actions** | Views progress ("we're checking 12 entities and 7 individuals") | Reviews screening hits, clears false positives, escalates true positives | Runs entity + UBO names through sanctions, PEP, adverse media. Computes composite risk score. Writes justification memo per hit. |
| **Output** | Green-light or request-for-more-info | Risk rating finalised | Audit trail + narrative |
| **Screens** | `/client/screening` | `/rm/applications/[id]/screening` | — |

### Stage 5 — Product Configuration
| | Customer | RM | AI |
|---|---|---|---|
| **Actions** | Configures accounts (currencies, signatories, payment limits), FX pairs, trade lines | Approves config vs. policy, sets pricing | Suggests optimal account structure based on entity tree + expected flows. **Credit Memo Drafter** auto-builds credit memo from financials + structure + screening |
| **Output** | All products configured | All products approved, credit approved | Draft memo ready for RM review |
| **Screens** | `/client/products`, `/client/products/credit` | `/rm/applications/[id]/products`, `/rm/applications/[id]/credit-memo` | — |
| **Hero moment** | — | Credit memo drafting visibly in-progress | — |

### Stage 6 — Activation & Go-Live
| | Customer | RM | AI |
|---|---|---|---|
| **Actions** | Receives credentials + welcome pack, walkthrough of SMBC Connect | Hands to service team, sets up relationship dashboard | — |
| **Output** | Live on SMBC Connect | Application closed, lifecycle monitoring begun | Perpetual KYC teaser ("we'll keep watching") |
| **Screens** | `/client/activation` | `/rm/applications/[id]/handover` | — |

---

## 5. AI Hero Moments (Detailed Specs)

### 5.1 UBO Structure Intelligence Agent
- **Where**: Stage 2, both RM cockpit and client portal
- **Trigger**: RM clicks "Run structure analysis"
- **Behaviour**: Animated tree that builds itself, layer by layer, with narration:
  - "Querying Japan corporate registry..." → Parent entity appears
  - "Found 4 subsidiary entities. Querying ACRA, Companies Registry HK, Companies House UK..." → children appear
  - "Detected holding company in BVI. Unwrapping..." → shell company appears as dashed node
  - "Resolved 7 natural persons at top of structure. Confidence: 94%."
- **Visual**: D3 or React Flow directed graph, nodes pulse in as they're resolved, colour-coded by confidence
- **Mock backing**: Seed data returned with realistic delays to feel agentic

### 5.2 Document Extraction Agent
- **Where**: Stage 3, client portal primarily
- **Trigger**: Customer drops a PDF
- **Behaviour**: Right-hand panel shows "Reading document...", fields on left populate one by one as extracted:
  - Entity name, registration number, date of incorporation, registered address, directors, share capital, shareholders
  - Flags inconsistencies ("Address in this doc differs from ACRA record — please clarify")
- **Visual**: PDF preview left, extraction log centre (streaming text), structured fields right
- **Mock backing**: Pre-mapped extractions for specific seed PDFs

### 5.3 RM Copilot
- **Where**: Persistent sidecar across `/rm/*`, collapsible
- **Behaviour**: Chat panel. Natural language. Example prompts:
  - "What's outstanding on Kaisei?"
  - "Draft the KYC memo summarising screening results"
  - "Compare Kaisei's risk profile against my portfolio average"
  - "Who else in my portfolio is expanding to Singapore? Any parallels?"
  - "Summarise this application in 3 bullets for my Monday call"
- **Visual**: Right-dock panel, Fresh Green #BFD730 accent when active, can be expanded to full-screen
- **Backing**: Claude API, with tool-calling into the application's Supabase data

### 5.4 Credit Memo Drafter
- **Where**: Stage 5, RM cockpit
- **Trigger**: RM clicks "Draft credit memo"
- **Behaviour**: Memo template fills in section by section (visible progress):
  - Executive summary
  - Client overview (pulled from entity + structure data)
  - Financial analysis (spread from uploaded audited financials)
  - Proposed facility structure
  - Risk rating + key risks (pulled from screening)
  - Covenants & conditions (suggested)
  - Recommendation
- **Visual**: Document-style layout, sections highlighted as AI writes into them, "Accept / Edit / Regenerate" per section
- **Backing**: Claude API with structured prompts per section, pulling Supabase context

---

## 6. Screen Inventory

### 6.1 Public / Auth
- `/` — Public landing (optional; low priority)
- `/login` — Email/password auth
- `/demo` — Dev-only role switcher (client vs RM)

### 6.2 Customer Portal (`/client/*`)
- `/client` — Journey dashboard (6 stages, current status, next action)
- `/client/welcome` — Post-invite welcome & scoping confirmation
- `/client/entity` — Entity & structure (Stage 2)
- `/client/documents` — Document upload + extraction feedback (Stage 3)
- `/client/screening` — Screening progress (Stage 4)
- `/client/products` — Product configuration hub (Stage 5)
- `/client/products/accounts` — Account setup (currencies, signatories, limits)
- `/client/products/credit` — Credit facility application
- `/client/activation` — Go-live confirmation + SMBC Connect handover (Stage 6)
- `/client/messages` — Thread with RM

### 6.3 RM Cockpit (`/rm/*`)
- `/rm` — Dashboard (pipeline kanban, activity feed, AI insights cards)
- `/rm/pipeline` — All applications, filter/sort
- `/rm/applications/new` — Create new application
- `/rm/applications/[id]` — Application detail (tabs below)
  - Overview
  - Structure (UBO tree)
  - Documents
  - Screening
  - Products
  - Credit Memo
  - Activity
- `/rm/messages` — Client threads
- `/rm/settings` — Profile + preferences
- RM Copilot — sidecar (not a route; component)

### 6.4 Total: ~18 unique screens

---

## 7. Data Model — Supabase Schema

10 tables, kept lean. Enable RLS everywhere.

```sql
-- 1. profiles (extends auth.users)
profiles (
  id uuid PK references auth.users,
  role enum('rm','client_admin','client_user'),
  display_name text,
  email text,
  avatar_url text,
  org_id uuid references organizations nullable,
  created_at, updated_at
)

-- 2. organizations (the corporate customer parent)
organizations (
  id uuid PK,
  legal_name text,
  display_name text,
  hq_jurisdiction text,
  industry text,
  size_band text,
  created_at, updated_at
)

-- 3. applications (one onboarding case)
applications (
  id uuid PK,
  organization_id uuid FK,
  rm_user_id uuid FK profiles,
  status enum('invited','in_progress','in_review','approved','activated','on_hold'),
  current_stage int (1-6),
  target_jurisdictions text[],
  products_requested text[] (accounts/cash/fx/trade/credit),
  opened_at, target_close_date, closed_at
)

-- 4. entities (legal entities under the application)
entities (
  id uuid PK,
  application_id uuid FK,
  parent_entity_id uuid FK nullable (self-ref for tree),
  legal_name text,
  registration_number text,
  jurisdiction text,
  entity_type text,
  registered_address jsonb,
  ownership_pct numeric,
  confidence_score numeric,
  is_shell boolean,
  source enum('registry','document','manual')
)

-- 5. ubos (natural persons)
ubos (
  id uuid PK,
  application_id uuid FK,
  full_name text,
  nationality text,
  dob date,
  ownership_pct numeric,
  control_type text,
  is_pep boolean,
  screening_status text,
  confidence_score numeric
)

-- 6. documents (uploads + extracted data)
documents (
  id uuid PK,
  application_id uuid FK,
  entity_id uuid FK nullable,
  doc_type text (coi/moa/board_res/signatory_id/financials/...),
  file_url text,
  status enum('uploaded','extracting','extracted','verified','rejected'),
  extraction_result jsonb,
  uploaded_by uuid FK profiles,
  uploaded_at
)

-- 7. screening_results
screening_results (
  id uuid PK,
  application_id uuid FK,
  subject_type enum('entity','ubo'),
  subject_id uuid,
  sanctions_hit boolean,
  pep_hit boolean,
  adverse_media_hit boolean,
  risk_score numeric,
  ai_narrative text,
  disposition enum('cleared','escalated','blocked'),
  disposition_note text,
  disposed_by uuid FK profiles,
  disposed_at timestamp
)

-- 8. products (products requested with config)
products (
  id uuid PK,
  application_id uuid FK,
  product_type text,
  config jsonb (flexible per product type),
  status enum('draft','submitted','approved','provisioned')
)

-- 9. credit_memos
credit_memos (
  id uuid PK,
  application_id uuid FK,
  facility_amount_usd numeric,
  facility_type text,
  tenor_months int,
  sections jsonb (exec_summary, client_overview, financials, risk, recommendation),
  status enum('drafting','drafted','reviewed','approved'),
  drafted_at, approved_at, approved_by
)

-- 10. activities (unified timeline)
activities (
  id uuid PK,
  application_id uuid FK,
  actor_type enum('client','rm','ai','system'),
  actor_id uuid nullable,
  event_type text,
  payload jsonb,
  created_at
)
```

---

## 8. Design System

### 8.1 Color tokens
```css
/* Primary — SMBC brand */
--trad-green:       #004832;  /* Primary dark, nav, headers */
--trad-green-deep:  #00301F;  /* Hover, depth */
--trad-green-soft:  #1A5F48;  /* Hover lighter */
--fresh-green:      #BFD730;  /* CTA, success, Rising Mark */
--fresh-green-mute: #D4E566;  /* Tints, pills */
--fresh-green-glow: #BFD73022; /* AI moments background glow */

/* Neutrals */
--ink:              #0A1410;  /* Body text */
--ink-soft:         #3C4540;  /* Secondary text */
--ink-muted:        #7A827D;  /* Tertiary */
--paper:            #FAFBF7;  /* Warm off-white workspace */
--paper-deep:       #F3F5EE;  /* Card elevation */
--mist:             #E8EDE4;  /* Dividers, borders */

/* Signals */
--signal-amber:     #E8A317;  /* Attention, pending */
--signal-red:       #C73E1D;  /* Alerts, blocked */
--signal-info:      #2A6F97;  /* Info, neutral status */

/* Dark mode (RM cockpit option) */
--dark-bg:          #0B1F17;  /* Deep green-black */
--dark-surface:     #112820;  /* Cards */
--dark-text:        #E8EDE4;  /* Body on dark */
```

### 8.2 Typography
- **Display / headings / stat numerals**: **Fraunces** (variable serif, opsz + SOFT + WONK axes). Sculptural, editorial, distinctive. Used for `<h1>`, big stat numbers, hero moments.
- **UI body**: **Inter Tight** — tightened modern grotesque. Slightly more character than Inter, still institutional.
- **Japanese characters**: **Noto Sans JP** (weight 500 default). Clean, neutral, pairs well with Inter Tight.
- **Data / IDs / timestamps / code**: **IBM Plex Mono**.

All four fonts are free and open-source on Google Fonts.

### 8.3 Spacing
8px base. Scale: 4, 8, 12, 16, 24, 32, 48, 64, 96.

### 8.4 Radius
- Buttons / inputs: `6px`
- Cards: `12px`
- Modals: `16px`
- Avatars: fully round

### 8.5 Motion
- **Default**: 200ms ease-out
- **AI moments**: 400–600ms, easeInOutCubic, staggered children
- Use Framer Motion for the UBO tree build, doc extraction stream, memo section fills

### 8.6 Voice & tone
- **Customer-facing**: Reassuring, clear, low-jargon, progress-confident. "Here's what we need next" not "Submit required documentation."
- **RM-facing**: Dense, information-rich, professional. Abbreviations OK (KYC, UBO, PEP).
- **AI-facing**: First-person, calm, concise. "I found 7 beneficial owners. 2 need your review." Never overclaim.

### 8.7 Component inventory (shadcn/ui + custom)
From shadcn: Button, Input, Select, Dialog, Sheet, Tabs, Card, Badge, Avatar, Dropdown, Toast, Progress, Tooltip, Accordion, Command (for copilot), Form.

Custom:
- `<JourneyStepper>` — 6-stage progress indicator
- `<EntityTree>` — recursive tree (D3 or React Flow)
- `<DocDropzone>` — upload with extraction preview
- `<AiStreamText>` — streaming text with cursor
- `<ScreeningCard>` — individual screening result
- `<MemoEditor>` — sectioned credit memo view
- `<CopilotSidecar>` — persistent RM assistant

---

## 9. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 14 App Router | Server components, RSC streaming (great for AI moments) |
| Language | TypeScript strict | Non-negotiable |
| Styling | Tailwind CSS | Fast, matches your Progr workflow |
| Components | shadcn/ui | Copy-paste, customisable |
| Motion | Framer Motion | AI moment animations |
| Forms | React Hook Form + Zod | Structured validation |
| Backend | Supabase (Postgres + Auth + Storage) | Single service, RLS, fast to build |
| AI | Anthropic Claude API (server-side route handlers) | RM Copilot, Credit Memo Drafter |
| Charts | Recharts | Financial spreads in credit memo |
| Tree viz | React Flow | UBO structure |
| Deploy | Vercel | Same as HealthOS |
| Icons | Lucide | Consistent |

---

## 10. Build Phases

### Phase 0 — Foundation (Day 1)
- Next.js + TS + Tailwind setup
- Supabase project + schema migration + RLS policies
- Design tokens in `globals.css`
- Base layout with nav (customer vs RM)
- Auth (magic link) + role-based routing
- Demo role switcher (dev only)

### Phase 1 — RM cockpit skeleton (Day 2)
- `/rm` dashboard with seed pipeline
- `/rm/applications/[id]` detail shell with tabs
- Seed data: 1 hero application (Kaisei) + 6 background applications in mixed stages

### Phase 2 — Customer portal skeleton (Day 3)
- `/client` journey dashboard with stepper
- All 6 stage screens wired up, read-only from seed data
- Message thread basic implementation

### Phase 3 — AI hero: UBO + Doc Extraction (Day 4)
- UBO tree with React Flow, scripted build animation
- Doc dropzone with mocked streaming extraction
- Both sides (client and RM) show the output

### Phase 4 — AI hero: Copilot + Credit Memo (Day 5)
- RM Copilot sidecar with Claude API, tool-calling into Supabase
- Credit Memo Drafter with section-by-section streaming

### Phase 5 — Polish & seed (Day 6)
- Final seed data pass (make Kaisei deeply realistic)
- Empty states, loading states, error states
- Activity timeline across the app
- Perpetual KYC teaser on Stage 6
- Demo script / walkthrough notes

---

## 11. Seed Data — Kaisei Manufacturing

### 11.1 Entity tree
```
Kaisei Manufacturing KK (parent) — Japan
├── Kaisei Asia Pacific Pte Ltd — Singapore (100%)
├── Kaisei Trading HK Ltd — Hong Kong (100%)
├── Kaisei Europe Ltd — UK (100%)
└── Kaisei Technology KK — Japan (80%; 20% held by Morita Holdings)
    └── Morita Holdings — BVI (shell — unwrapped to Tanaka Family Trust)
```

### 11.2 UBOs
- Hiroshi Kaisei (Founder's grandson, 42% via holding)
- Yuki Kaisei (Sister, 18%)
- Kenji Morita (Investor, 12% via BVI)
- Tanaka Family Trust (beneficiaries identified: 4 natural persons, each <5%)
- Plus public float

### 11.3 RM portfolio (for cockpit texture)
6 additional applications in varied states:
- Fujiwara Pharma — Stage 3, doc review
- Sato Trading — Stage 4, screening (1 amber hit)
- Ishikawa Logistics — Stage 5, credit memo drafting
- Hayashi Foods — Stage 1, invited
- Nakamura Electronics — Stage 6, activating
- Ota Robotics — On hold (regulatory clarification)

---

## 12. Out of Scope (Explicit)

- Real KYC / AML provider integrations (all mocked)
- Real payment processing
- Multi-language UI (English only for prototype; Japanese hints in branding)
- Mobile native app (responsive web only)
- Accessibility audit (basic practices followed, not WCAG-certified)
- Production-grade RLS / security hardening
- Real email delivery (use Supabase default or mock)
- SMBC Connect integration (teaser screen only)

---

## 13. Success Criteria for the Prototype

A stakeholder watching a 15-minute walkthrough should walk away thinking:

1. **"That feels 5 years ahead of where we are today."**
2. **"The UBO agent is magic."**
3. **"I want the Credit Memo drafter yesterday."**
4. **"The RM cockpit is a tool I'd actually use."**
5. **"The client experience is consumer-grade."**

If 3/5 land, we've hit.

---

## 14. Open questions to revisit during build

- Do we want a dark-mode RM cockpit option? (Adds polish, adds scope.)
- How deep do we go on the "Perpetual KYC" teaser? (Could be its own future prototype.)
- Do we show any "current state vs. future state" split-screen anywhere, or is that cliché?
- Kanji usage — full Japanese labels anywhere, or keep to brand only?

---

*End of brief. Hand this to Claude Code as the master reference.*
