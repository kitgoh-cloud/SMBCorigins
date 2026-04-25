---
phase: 2
slug: scaffolding
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-25
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None (no unit tests in Phase 2 per D-40 — defer test framework choice to Phase 3+ when `types/origin.ts` and `lib/api.ts` land) |
| **Config file** | None |
| **Quick run command** | `npm run typecheck && npm run lint` (alias for `tsc --noEmit && eslint .`) |
| **Full suite command** | `npm run typecheck && npm run lint && npm run build` |
| **Estimated runtime** | ~30–60 seconds |

**Validation surfaces (Phase 2 has no business logic — config + JSX only):**
1. `tsc --noEmit` — TypeScript strict + `noUncheckedIndexedAccess` compile cleanly
2. `eslint .` — flat-config rules pass (Next.js + Prettier + TS rules)
3. `npm run build` — Next.js production build succeeds
4. `npm run dev` + browser DevTools — visual verification of token utilities, font loading, route-group resolution
5. Vercel preview deploy — preview URL builds and serves the same page set

---

## Sampling Rate

- **After every task commit:** Run `npm run typecheck && npm run lint`
- **After every plan wave:** Run `npm run typecheck && npm run lint && npm run build`
- **Before `/gsd-verify-work`:** Full suite must be green AND Vercel preview URL must render correctly AND all four success criteria from ROADMAP §Phase 2 must be visually verified
- **Max feedback latency:** ~60 seconds for typecheck+lint; ~3–5 minutes for full build + Vercel preview

---

## Per-Task Verification Map

> The planner fills this table when writing PLAN.md files. Each task should map to either an automated verification command or a Wave 0 (`tsconfig.json`, `eslint.config.mjs`, `package.json` scripts) dependency.

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| _to be filled by gsd-planner_ |  |  |  |  |  |  |  |  |  |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Wave 0 in Phase 2 means "the scaffold itself is in place so subsequent task verification is meaningful":

- [ ] `package.json` exists with `typecheck` and `lint` scripts
- [ ] `tsconfig.json` exists with `strict: true` and `noUncheckedIndexedAccess: true`
- [ ] `eslint.config.mjs` exists with flat-config rules
- [ ] `app/layout.tsx`, `app/page.tsx`, `app/globals.css` exist (proves Next.js boots)

No test stubs, no fixtures, no `tests/` directory — D-40 explicitly defers a test framework. Validation is type system + lint + manual + CI/Vercel preview.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| All 6 brand color tokens render correctly on root `/` | SCAFF-04 | Tailwind utilities + CSS vars resolution requires browser DevTools | `npm run dev`, open `/`, inspect computed `background-color` on each swatch — must equal hex from ORIGIN_DESIGN.md §8 |
| All 4 fonts visibly render on root `/` and on persona pages | SCAFF-05 | Font-family loading is a runtime concern, not a type concern | `npm run dev`, open `/`, inspect computed `font-family` on each labeled paragraph — must match Fraunces / Inter Tight / Noto Sans JP / IBM Plex Mono |
| Both persona route groups return 200 with correct content | SCAFF-06 | Route group resolution is runtime | `npm run dev`, navigate to client and RM route-group URLs, confirm bilingual greeting and RM placeholder render with correct fonts |
| Vercel preview URL builds and serves on PR open | SCAFF-07 | Vercel build pipeline is external | Open PR, confirm Vercel bot posts preview URL comment, open URL, confirm same content as `npm run dev` |
| Vercel production URL deploys on merge to `main` | SCAFF-07 | Vercel production pipeline is external | After PR merge, confirm Vercel deploys to production URL, open URL, verify all four success criteria from ROADMAP §Phase 2 |
| Branch protection: typecheck + lint + Vercel preview required on `main` | D-08 | GitHub UI configuration is external | After CI workflow first-run produces check names, open repo Settings → Branches → main → require status checks; tick `typecheck`, `lint`, `Vercel`. Test by opening throwaway PR with failing typecheck — merge button must be blocked. |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify (typecheck/lint/build) OR Wave 0 dependency OR explicit manual verification entry above
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify (typecheck/lint after every commit suffices)
- [ ] Wave 0 covers all MISSING references — Phase 2 scaffolds the validation infrastructure itself, so Wave 0 = scaffold-in-place
- [ ] No watch-mode flags (`tsc --noEmit` is one-shot, `eslint .` is one-shot, `next build` is one-shot)
- [ ] Feedback latency < 60s for typecheck+lint, < 5 min for full build + Vercel preview
- [ ] `nyquist_compliant: true` set in frontmatter (only after planner fills Per-Task Verification Map and verifies above checks)

**Approval:** pending
