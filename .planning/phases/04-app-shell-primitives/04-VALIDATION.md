---
phase: 4
slug: app-shell-primitives
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-26
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution. Seeded from `04-RESEARCH.md` §"Validation Architecture" (lines 601–656). The planner consumes this when writing PLAN.md tasks; the post-plan auditor (`/gsd-validate-phase`) fills the per-task task-ID column once plans assign IDs.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.5 (existing per D-61) + **jsdom 25.x** + **@testing-library/react 16.x** + **@testing-library/jest-dom 6.x** (NEW devDeps in Wave 0) |
| **Config file** | `vitest.config.ts` (existing — Wave 0 modifies `environment: 'jsdom'` and `include: ['**/*.test.{ts,tsx}']`); **NEW** `vitest.setup.ts` for jest-dom matchers |
| **Quick run command** | `npm run test -- --run <touched test files>` (single-file feedback during execution) |
| **Full suite command** | `npm run test` (Vitest run) |
| **Estimated runtime** | ~10–25 seconds full suite (small test count, jsdom is fast for DOM-light primitives) |
| **Cross-cutting check** | `bash scripts/check-fresh-green.sh` (also runs as Vitest fixtures via `scripts/check-fresh-green.test.ts` per D-84) |

---

## Sampling Rate

- **After every task commit:** `npm run typecheck && npm run lint && npm run test -- <touched files>` (fast feedback). Fresh-green script runs locally on demand: `bash scripts/check-fresh-green.sh`.
- **After every plan wave:** `npm run test` (full Vitest suite) + `bash scripts/check-fresh-green.sh`.
- **Before `/gsd-verify-work` (phase gate):** `npm run typecheck && npm run lint && npm run test && npm run build && bash scripts/check-fresh-green.sh` — all must pass. Plus manual: open `npm run dev` and verify (a) TopStrip renders on `/`, `/journey`, `/cockpit`, `/dev/primitives`; (b) ModeSwitcher present with `NEXT_PUBLIC_SHOW_MODE_SWITCHER=true`, hidden when unset; (c) `/dev/primitives` renders all 8 primitives in all states.
- **Max feedback latency:** ~30s for the full suite — acceptable for the prototype velocity bar.

---

## Per-Requirement Verification Map

> Task-ID column populated by `/gsd-validate-phase` after planner generates task IDs. `Threat Ref` column references the planner's `<threat_model>` block.

| Task ID | Plan | Wave | Requirement | Behavior | Threat Ref | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|----------|------------|-----------|-------------------|-------------|--------|
| TBD | TBD | TBD | SHELL-01 | TopStrip renders on every route | T-04-* / V14 | smoke + snapshot | `npm run test -- components/shell/TopStrip.test.tsx` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | SHELL-01 | TopStrip context badge switches by route | — | unit | `npm run test -- components/shell/TopStrip.test.tsx -t "context badge"` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | SHELL-01 | LanguageToggle is non-interactive (visual-only) | V5 | unit | `npm run test -- components/shell/LanguageToggle.test.tsx` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | SHELL-02 | ModeSwitcher renders null when env=false (production) | T-04-config / V14 | unit | `npm run test -- components/shell/ModeSwitcher.test.tsx -t "env gate"` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | SHELL-02 | ModeSwitcher renders two `<Link>`s when env=true | — | unit | `npm run test -- components/shell/ModeSwitcher.test.tsx -t "two links"` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | SHELL-02 | Mode switcher absent in production build (Vercel Production) | T-04-config / V14 | manual | post-deploy: visit `https://smbcorigins.vercel.app` and confirm no mode switcher | n/a (manual) | ⬜ pending |
| TBD | TBD | TBD | SHELL-03 | RisingMark renders SVG with locked `hand` color | — | snapshot | `npm run test -- components/shell/RisingMark.test.tsx` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | SHELL-04 | Each of the 8 primitives renders without error | — | smoke | `npm run test -- components/primitives/` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | SHELL-04 | StatusChip per-kind tokens (D-87) — 6 kinds × correct token | — | unit | `npm run test -- components/primitives/StatusChip.test.tsx` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | SHELL-04 | StagePill per-state visuals (done ✓ / current numeral / upcoming numeral) | — | unit | `npm run test -- components/primitives/StagePill.test.tsx` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | SHELL-04 | AIPulseDot renders with default `aria-label="AI active"` | — | unit | `npm run test -- components/primitives/AIPulseDot.test.tsx` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | SHELL-04 | AIBadge renders dot + label (default "Origin") | — | unit | `npm run test -- components/primitives/AIBadge.test.tsx` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | SHELL-04 | Icon renders correct SVG path for each name | — | unit | `npm run test -- components/primitives/Icon.test.tsx` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | SHELL-04 | Avatar refuses fresh-green family (closed enum) | — | typecheck | `npm run typecheck` (compile fails on fresh-green token) | n/a (compile-time) | ⬜ pending |
| TBD | TBD | TBD | SHELL-04 | Avatar renders correct background per `color` prop | — | unit | `npm run test -- components/primitives/Avatar.test.tsx` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | SHELL-04 | ActionCard wires `onClick`, applies `faint` prop, renders slots | — | unit | `npm run test -- components/primitives/ActionCard.test.tsx` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | SHELL-04 | Icon name union is closed (no string drift) | — | typecheck | `npm run typecheck` | n/a (compile-time) | ⬜ pending |
| TBD | TBD | TBD | SHELL-04 | All 8 primitives discoverable on `/dev/primitives` demo page | — | manual | `npm run dev` then visit `http://localhost:3000/dev/primitives` | n/a (manual) | ⬜ pending |
| TBD | TBD | TBD | SHELL-05 | Grep flags hex literals (`#BFD730` + 2 case variants) | — | unit | `npm run test -- scripts/check-fresh-green.test.ts -t "hex"` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | SHELL-05 | Grep flags Tailwind utilities (`bg-fresh-green`, suffix variants) | — | unit | same `-t "utility"` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | SHELL-05 | Grep flags arbitrary-values (`bg-[#BFD730]`, `bg-[var(--color-fresh-green)]`, `bg-[rgba(191,215,48,...)]`) | — | unit | same `-t "arbitrary"` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | SHELL-05 | Grep flags rgba inline (`rgba(191,215,48,0.3)`) | — | unit | same `-t "rgba"` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | SHELL-05 | Grep flags opacity modifiers (`bg-fresh-green/30`) — RESEARCH §3 extension | — | unit | same `-t "opacity"` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | SHELL-05 | Grep flags `via-*`, `decoration-*`, `ring-offset-*`, `inset-shadow-*` — RESEARCH §3 extension | — | unit | same `-t "extended-prefixes"` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | SHELL-05 | Allowlist exempts the 5 known files | — | integration | `bash scripts/check-fresh-green.sh` (exit 0 with allowlist active) | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | SHELL-05 | After 5 retrofits, grep produces 0 unallowlisted hits | — | integration | same | ❌ W0 (depends on retrofit completion) | ⬜ pending |
| TBD | TBD | TBD | SHELL-05 | CI `fresh-green` job passes on PR | — | CI | GitHub Actions check run | n/a (CI) | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Wave 0 (test infrastructure) must complete BEFORE Wave 1 (primitive implementation) to keep the sampling rate honest — otherwise primitives ship with ❌ MISSING test references.

- [ ] `npm install --save-dev jsdom@^25 @testing-library/react@^16 @testing-library/jest-dom@^6` (versions to be re-verified at task time; pin majors per RESEARCH §6)
- [ ] `vitest.config.ts` — modify `environment: 'jsdom'` + `include: ['**/*.test.{ts,tsx}']`
- [ ] `vitest.setup.ts` — NEW file, imports `@testing-library/jest-dom`
- [ ] `tsconfig.json` — verify `vitest.setup.ts` is included (or `vitest/globals` types are referenced)
- [ ] `package.json` — verify `npm run test` still works after the env switch

After Wave 0: every primitive `.test.tsx` and the `scripts/check-fresh-green.test.ts` can reference `screen`, `render`, `expect(...).toHaveAttribute(...)` etc. without setup boilerplate per file.

---

## Manual-Only Verifications

Manual checks are unavoidable for desktop-first visual fidelity at 1440px and for the env-var-gated production check.

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| TopStrip pixel-perfect at 1440px (height 56, gaps match prototype) | SHELL-01 | Visual fidelity is human judgment; pixel-snapshot tooling out of scope for prototype | Open `npm run dev`, set browser to 1440px, compare TopStrip against `/tmp/proto_shell.js` rendering side-by-side |
| `/dev/primitives` renders 8 primitives in all states | SHELL-04 | Demo page is a visual surface, not a logic surface | Open `npm run dev`, visit `http://localhost:3000/dev/primitives`, confirm each primitive section renders |
| Mode switcher absent on Vercel Production | SHELL-02 | Vercel env-var dashboard scoping is dashboard work, not code | After PR merge: visit `https://smbcorigins.vercel.app`, confirm `NEXT_PUBLIC_SHOW_MODE_SWITCHER` is unset/false in Production scope, confirm ModeSwitcher does not render |
| Fraunces "Origin" wordmark renders with SOFT/WONK variation | SHELL-03 | Variable-axis font rendering needs visual confirmation; jsdom doesn't render fonts | Open `npm run dev`, visit `/`, inspect "Origin" wordmark in DevTools and confirm `font-variation-settings` computed style includes `"SOFT" 80, "WONK" 1` (or that the axes-extended bundle is loaded if option (a) was picked) |
| ClientShell + RMShell layouts at 1440px | SHELL-01 | Layout fidelity is visual | Open `/journey` (ClientShell single-column) and `/cockpit` (RMShell sidebar 220 + workspace + empty copilot-sidecar slot) at 1440px; confirm no layout shift, sidebar width 220, copilot slot reserved |
| All 5 SHELL-05 retrofits land in same PR | SHELL-05 | Visual confirmation that retrofitted tokens render correctly (no broken UI) | After retrofit commits: visit each affected surface — TopStrip Avatar bg, mail-icon dot, mode-switcher dashed border + DEMO eyebrow, sidebar active-route dot — and confirm the new tokens render legibly |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies recorded
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify (jsdom is fast → most tasks have unit tests)
- [ ] Wave 0 covers all MISSING references (vitest.setup.ts + jsdom install + 11 test files)
- [ ] No watch-mode flags (Vitest runs with `--run` in CI per D-63)
- [ ] Feedback latency < 30s for full suite
- [ ] `nyquist_compliant: true` set in frontmatter (after `/gsd-validate-phase` audit)

**Approval:** pending — flips to `approved YYYY-MM-DD` after `/gsd-validate-phase` confirms task IDs are wired.

---

## Boundary-case map for SHELL-05 grep test fixtures

Per RESEARCH §9 — explicit list of test fixtures the `scripts/check-fresh-green.test.ts` MUST cover:

**Positive cases (regex MUST flag):**
- ✅ Explicit hex (3 case variants): `#BFD730`, `#bfd730`, `#bFd730`
- ✅ Explicit CSS-var: `var(--color-fresh-green)`
- ✅ Explicit Tailwind utility: `bg-fresh-green`
- ✅ Explicit suffix variant: `bg-fresh-green-mute`, `bg-fresh-green-glow`
- ✅ Arbitrary-value with hex: `bg-[#BFD730]`
- ✅ Arbitrary-value with var: `bg-[var(--color-fresh-green)]`
- ✅ Arbitrary-value with rgba: `bg-[rgba(191,215,48,0.3)]`
- ✅ Inline rgba: `rgba(191,215,48,0.3)`
- ✅ Opacity modifier: `bg-fresh-green/30` (RESEARCH §3 extension)
- ✅ Extended prefixes: `via-fresh-green`, `decoration-fresh-green`, `ring-offset-fresh-green`, `inset-shadow-fresh-green` (RESEARCH §3 extension)

**Negative cases (regex MUST NOT flag):**
- ❌ Unrelated string `freshly-greened` (regex word-boundary handles)
- ❌ Token in a different namespace (currently safe — no other tokens share the substring `fresh-green`; verify in test)

Comment lines containing `fresh-green` (e.g., `// fresh-green note`) WILL match by design — allowlist mitigates if it becomes noise.

---

*Phase: 04-app-shell-primitives*
*Validation strategy seeded: 2026-04-26 from 04-RESEARCH.md §Validation Architecture*
