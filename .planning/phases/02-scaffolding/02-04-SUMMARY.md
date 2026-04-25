---
id: 02-04
phase: 02-scaffolding
plan: 04
status: complete
completed_at: 2026-04-25
commit: 439123b
---

# 02-04 SUMMARY — Persona route groups (/journey, /cockpit)

## What landed
- `app/(client)/journey/page.tsx` — Yuki bilingual placeholder (Japanese line in `font-jp`, English in `font-body`).
- `app/(rm)/cockpit/page.tsx` — James RM placeholder (`font-display` header, `font-mono` ID line `RM-0001`).
- Both nested under route group folders to satisfy SCAFF-06 without triggering parallel-route URL collision (RESEARCH §Landmines #1).
- `app/(client)/page.tsx` and `app/(rm)/page.tsx` deliberately NOT created.
- Updated `app/page.tsx` footer nav to use `next/link` `<Link>`.

## Verification
- `npm run typecheck` → exit 0 ✓
- `npm run lint` → exit 0 ✓
- `npm run build` → "Compiled successfully" — output lists `/`, `/journey`, `/cockpit` ✓
- Live smoke (`npm run dev` + curl):
  - `/` → 200 ✓
  - `/journey` → 200 ✓
  - `/cockpit` → 200 ✓

## Deviation from plan
1. **Switched `<a>` → next/link `<Link>` for internal nav.** Plan originally used plain `<a>` to dodge typedRoutes warnings before /journey and /cockpit existed. By the time 02-04 lands, both routes exist, so typedRoutes accepts `<Link>` cleanly. The `@next/next/no-html-link-for-pages` ESLint rule fires on plain `<a>` for internal hrefs, so `<Link>` is the right call. Three files updated: both placeholders + root showcase page.

## Next
- 02-05: CI workflow, README/CLAUDE.md How-to-run, PR open, branch protection, Evan review/merge.
