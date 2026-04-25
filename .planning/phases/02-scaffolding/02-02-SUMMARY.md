---
id: 02-02
phase: 02-scaffolding
plan: 02
status: complete
completed_at: 2026-04-25
commit: e420c32
---

# 02-02 SUMMARY — Tighten config: tsconfig + eslint flat + prettier + scripts

## What landed
- `tsconfig.json`: added `"noUncheckedIndexedAccess": true` immediately after `"strict": true`. `exactOptionalPropertyTypes` deliberately NOT added (D-05).
- `next.config.ts`: replaced create-next-app default with single-quote / no-semi style and `typedRoutes: true`.
- `package.json`:
  - added `engines.node = ">=24.0.0 <25.0.0"` (D-02)
  - `scripts.dev = "next dev --turbopack"`
  - `scripts.lint = "eslint ."` (replaces removed `next lint`)
  - added `scripts.typecheck = "tsc --noEmit"`
- `eslint.config.mjs`: appended `prettier` from `eslint-config-prettier/flat` AFTER `nextVitals` and `nextTs` (order-sensitive). NO `eslint-plugin-prettier` (RESEARCH §Surprises #4).
- `.prettierrc` (A1 assumption applied): `semi: false`, `singleQuote: true`, `trailingComma: "all"`, `printWidth: 100`, `tabWidth: 2`, `arrowParens: "always"`.
- `.prettierignore`: `.next/`, `out/`, `build/`, `node_modules/`, `package-lock.json`, `*.min.js`, `*.min.css`.
- `.gitignore`: replaced create-next-app's `.env*` with explicit `.env*.local` + `.env` (D-35); `.vercel` → `.vercel/`.
- `npm install -D eslint-config-prettier prettier` added both to devDependencies.

## Deviations from plan
1. **`.prettierignore` extended beyond plan spec.** Plan listed only build/output ignore patterns. After running `prettier --check .`, 36 author-curated files (`.planning/`, `docs/`, `CLAUDE.md`, `CONTRACT.md`, `DECISIONS.md`, `README.md`) were flagged. Phase 1 closure prohibits reformatting CLAUDE.md (byte-identical preservation) and the .planning/ artifacts are GSD outputs, not source. Extended `.prettierignore` to scope auto-format to source code only. Final state: `prettier --check .` clean across all matched files.
2. **`prettier --write` scope.** Applied only to `app/` and `postcss.config.mjs` (4 files), NOT the whole repo (Phase 1 docs preserved).

## Verification
- `npm run typecheck` → exit 0 ✓
- `npm run lint` → exit 0 ✓
- `npm run build` → "Compiled successfully" ✓
- `npx prettier --check .` → "All matched files use Prettier code style!" ✓
- `cat .nvmrc | tr -d '[:space:]'` → `24` ✓
- `grep '"noUncheckedIndexedAccess": true' tsconfig.json` → matches ✓
- `grep '"engines"' package.json` → matches ✓
- `grep 'typedRoutes: true' next.config.ts` → matches ✓
- `grep -c 'eslint-plugin-prettier' eslint.config.mjs package.json` → 0 ✓

## eslint.config.mjs final shape
```js
import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import prettier from 'eslint-config-prettier/flat'

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
])

export default eslintConfig
```

## Versions
- `eslint-config-prettier`: ^10.1.8
- `prettier`: ^3.8.3 (newly added; needed for `prettier --check` script invocation)

## Next
- 02-03: Tailwind tokens + four fonts + token showcase page on `/`
