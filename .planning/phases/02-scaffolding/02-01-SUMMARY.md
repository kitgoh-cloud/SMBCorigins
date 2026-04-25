---
id: 02-01
phase: 02-scaffolding
plan: 01
status: complete
completed_at: 2026-04-25
commit: 1a83f62
---

# 02-01 SUMMARY — Vercel link + Node 24 + create-next-app scaffold

## What landed
- Local Node switched to v24.15.0 via nvm (was v25.6.1 — D-02).
- Branch `kit/scaffold` created off `main` (D-12).
- Vercel project linked by Kit to GitHub repo with `NEXT_PUBLIC_USE_MOCK=true` on Production AND Preview (D-34, D-35, D-37).
- Vercel project URL: **https://smbcorigins.vercel.app** (D-36 auto URL).
- `create-next-app@16.2.4` scaffold landed: Next.js 16.2.4 App Router, Tailwind v4, TypeScript, ESLint flat config, no src/, npm, import alias `@/*`, Turbopack, `--no-agents-md`.
- Phase 1 CLAUDE.md preserved byte-identical (5244 bytes, md5 `bf9e98cb3bdb0eb98bbbe1450f694939`).
- Scaffold commit `1a83f62` pushed to `origin/kit/scaffold`.

## Flags applied to create-next-app@16.2.4
`--typescript --tailwind --eslint --app --no-src-dir --use-npm --import-alias "@/*" --no-react-compiler --no-agents-md --turbopack`

## Versions in package.json
- next: `16.2.4`
- react / react-dom: `19.2.4`
- tailwindcss / @tailwindcss/postcss: `^4`
- eslint-config-next: `16.2.4`
- typescript: `^5`
- @types/node: `^20`
- @types/react / @types/react-dom: `^19`

## Verification
- `node --version` → `v24.15.0` ✓
- `git branch --show-current` → `kit/scaffold` ✓
- `diff CLAUDE.md /tmp/CLAUDE.md.phase1-backup` → empty (exit 0) ✓
- `npm run build` → "Compiled successfully" ✓
- `curl http://localhost:3000` (during `npm run dev`) → HTTP 200 ✓
- `git push -u origin kit/scaffold` → success, upstream tracking set ✓

## Deviations from plan
1. **create-next-app `.` invocation rejected.** create-next-app@16.2.4 enforces npm package-name rules (lowercase) and refused to scaffold into `SMBCorigins` (capital letters). Workaround: scaffolded into `/tmp/smbcorigins-scaffold`, then `rsync -a --exclude='.git' --exclude='.next' --exclude='node_modules'` into the repo, then renamed package.json `name` from `smbcorigins-scaffold` to `smbcorigins`. CLAUDE.md and all Phase 1 artifacts preserved byte-identical. Behavior contract with D-01..D-10, D-38 unchanged.
2. **`.nvmrc` added in 02-01 (was implied for 02-02).** Plan listed `.nvmrc` in `files_modified` so this is consistent; just noting the pin landed in this commit rather than 02-02.
3. **Vercel preview verification deferred.** Plan expected a Vercel preview URL on first push. The git remote is `kitgoh-cloud/SMBCorigins`, but DECISIONS / plan references `evangohAIO/SMBCorigins`. If the Vercel project is linked to the wrong repo, the preview won't fire. **Action for user**: confirm Vercel is watching `kitgoh-cloud/SMBCorigins` (or re-import). Will be re-checked at 02-05.

## Vercel preview URL
TBD — verify after confirming repo link. Expected pattern: `https://smbcorigins-<hash>-<scope>.vercel.app` posted by Vercel bot on the kit/scaffold branch.

## Next
- 02-02: tighten config (tsconfig strictness, prettier, scripts, .gitignore additions, typedRoutes)
- 02-03: Tailwind tokens, four fonts, root token showcase page
