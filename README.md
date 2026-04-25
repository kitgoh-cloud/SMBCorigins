# SMBCorigins

AI-native corporate banking onboarding prototype — a clickable desktop-first showpiece for SMBC stakeholder demos and workshops. See [`CLAUDE.md`](./CLAUDE.md) for the working stack contract, scaffolding ownership, and design system.

## How to run

```bash
nvm use 24    # Node 24 LTS per D-02 (uses .nvmrc)
npm install
npm run dev   # → http://localhost:3000
```

Pre-PR validation:

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # eslint .
npm run build       # production build smoke test
```

## Live URL

Production: <https://smbcorigins.vercel.app> (Vercel-assigned project URL — see Vercel dashboard for the exact production hostname).
Each PR produces a unique preview URL via the Vercel GitHub App — see PR comments.

## Repo structure

- `app/` — Next.js 16 App Router (root `/` token showcase, `(client)/journey`, `(rm)/cockpit`)
- `docs/` — `ORIGIN_DESIGN.md`, product brief, journey doc, build prompt
- `.planning/` — Get-Shit-Done planning artifacts (Kit-only per D-21)
- `CLAUDE.md`, `DECISIONS.md`, `CONTRACT.md`, `.github/CODEOWNERS` — cross-GSD canonical
