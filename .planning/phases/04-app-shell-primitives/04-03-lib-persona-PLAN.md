---
phase: 04-app-shell-primitives
plan: 03
type: execute
wave: 1
depends_on: [04-01]
files_modified:
  - lib/persona.ts
  - lib/persona.test.ts
autonomous: true
requirements: [SHELL-01, SHELL-02]
tags: [persona, route-map, plain-ts-constants, lib]

must_haves:
  truths:
    - "lib/persona.ts exports PERSONAS as a Record<'client' | 'rm', Persona> typed constant — TopStrip can index by mode without noUncheckedIndexedAccess undefined-narrowing pain"
    - "lib/persona.ts exports PERSONA_HOME with /journey for client and /cockpit for RM"
    - "modeForPathname returns 'client' | 'rm' | 'demo' (3-arm union per RESEARCH §8.2 — /dev/* paths return 'demo')"
    - "lib/persona.test.ts verifies the route-mapping table at minimum: 6 representative paths × 3 modes = canonical case coverage"
  artifacts:
    - path: "lib/persona.ts"
      provides: "PERSONAS, PERSONA_HOME, modeForPathname, type Mode, type Persona"
      exports: ["PERSONAS", "PERSONA_HOME", "modeForPathname", "Mode", "Persona"]
    - path: "lib/persona.test.ts"
      provides: "modeForPathname coverage tests"
      contains: "modeForPathname"
  key_links:
    - from: "lib/persona.ts"
      to: "Mode union type"
      via: "string-literal export"
      pattern: "'client' \\| 'rm' \\| 'demo'"
---

<objective>
Create the persona stub module that TopStrip and ModeSwitcher consume in Wave 3+. This is plain TS (D-66) — chrome stays decoupled from the data layer (`lib/api.mock.ts`). Apply the strongest analog in the repo: `lib/stages.ts` (named `Record<KeyUnion, Value>` const + pure helper function — exact-shape match per PATTERNS.md line 58).

Per RESEARCH §8.2, `modeForPathname` returns a 3-arm union including `'demo'` so the `/dev/primitives` page can suppress persona-context UI per OD-A1 in Open Questions. The 3-arm shape is locked at this plan; consumers (TopStrip in Plan 04-10) use it.

Purpose: Single source of truth for the two personas + their home routes + the URL→mode mapping. Phase 5+ adds new routes additively (e.g., `/messages`, `/portfolio`, `/application/*`) by extending the helper's match table.

Output:
- `lib/persona.ts` (~30–40 lines, mirrors `lib/stages.ts` shape verbatim)
- `lib/persona.test.ts` (~50–80 lines, mirrors `lib/stages.test.ts` shape; covers the route-map table with 9+ canonical cases)
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/04-app-shell-primitives/04-CONTEXT.md
@.planning/phases/04-app-shell-primitives/04-RESEARCH.md
@.planning/phases/04-app-shell-primitives/04-PATTERNS.md
@.planning/phases/04-app-shell-primitives/04-UI-SPEC.md
@lib/stages.ts
@lib/stages.test.ts

<interfaces>
<!-- lib/stages.ts (exact analog — copy this template's shape verbatim) -->
```ts
import type { Application, Stage, StageNumber } from '@/types/origin'

export const STAGE_NAMES: Record<StageNumber, string> = {
  1: 'Invite & Intent',
  2: 'Entity & Structure',
  3: 'Documentation',
  4: 'Screening',
  5: 'Products & Credit',
  6: 'Activation',
}

export function deriveStages(app: Application): Stage[] {
  return ([1, 2, 3, 4, 5, 6] as StageNumber[]).map((n) => ({
    number: n,
    name: STAGE_NAMES[n],
    status: ...
  }))
}
```

Persona shape from CONTEXT.md D-66 (verbatim):
```
PERSONAS = {
  client: { name: 'Yuki Tanaka', role: 'TREASURER', context: 'Kaisei Manufacturing KK', contextJp: '開成製造' },
  rm:     { name: 'James Lee',  role: 'RELATIONSHIP MGR', context: 'Japanese Corporates', contextJp: null, contextSub: '25 clients · Singapore desk' },
}
```

PERSONA_HOME from CONTEXT.md D-69 (verbatim):
```
PERSONA_HOME = { client: '/journey', rm: '/cockpit' }
```

modeForPathname spec from CONTEXT.md D-67 + RESEARCH §8.2 (extended union):
```ts
function modeForPathname(p: string): 'client' | 'rm' | 'demo' {
  if (p.startsWith('/dev'))                                                           return 'demo'
  if (p.startsWith('/cockpit') || p.startsWith('/portfolio') || p.startsWith('/application') || p.startsWith('/copilot-log')) return 'rm'
  // /journey, /messages, /stage-*, /, anything else → client
  return 'client'
}
```
</interfaces>
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: Create lib/persona.ts — PERSONAS, PERSONA_HOME, modeForPathname, types</name>
  <read_first>
    - /Users/wyekitgoh/Projects/SMBCorigins/lib/stages.ts (verbatim 22-line analog template — file-header style, named-export discipline, `Record<KeyUnion, Value>` typing)
    - /Users/wyekitgoh/Projects/SMBCorigins/lib/api.mock.ts (lines 1–22 — file-header JSDoc convention)
    - .planning/phases/04-app-shell-primitives/04-RESEARCH.md §"Pitfall 2: noUncheckedIndexedAccess breaks naive map lookups" (lines 457–466) — narrowing pattern for PERSONAS lookup
    - .planning/phases/04-app-shell-primitives/04-RESEARCH.md §8.2 (lines 1356–1410) — `'demo'` arm rationale; modeForPathname Option A locked
    - .planning/phases/04-app-shell-primitives/04-UI-SPEC.md §"Component Inventory" (lines 273–283) — confirms `as const` + single-file shape (OD-13)
  </read_first>
  <files>lib/persona.ts</files>
  <action>
    Create `lib/persona.ts` at repo root with this exact content (preserve formatting; single quotes per Prettier; 2-space indent):

    ```ts
    // lib/persona.ts — Phase 4 chrome persona stubs (D-66, D-67, D-69)
    // Plain TS constants; chrome decoupled from lib/api.mock.ts (D-66).
    // modeForPathname returns 'client' | 'rm' | 'demo' per RESEARCH §8.2 — /dev/*
    // routes render the demo-page chrome variant. Phase 5/6/7 extend the route
    // table additively as new routes land.

    export type Mode = 'client' | 'rm' | 'demo'

    export type Persona = {
      readonly name: string
      readonly role: string
      readonly context: string
      readonly contextJp: string | null
      readonly contextSub?: string
    }

    export const PERSONAS: Record<'client' | 'rm', Persona> = {
      client: {
        name: 'Yuki Tanaka',
        role: 'TREASURER',
        context: 'Kaisei Manufacturing KK',
        contextJp: '開成製造',
      },
      rm: {
        name: 'James Lee',
        role: 'RELATIONSHIP MGR',
        context: 'Japanese Corporates',
        contextJp: null,
        contextSub: '25 clients · Singapore desk',
      },
    } as const

    export const PERSONA_HOME = {
      client: '/journey',
      rm: '/cockpit',
    } as const

    export function modeForPathname(pathname: string): Mode {
      if (pathname.startsWith('/dev')) return 'demo'
      if (
        pathname.startsWith('/cockpit') ||
        pathname.startsWith('/portfolio') ||
        pathname.startsWith('/application') ||
        pathname.startsWith('/copilot-log')
      ) {
        return 'rm'
      }
      return 'client'
    }
    ```

    Conventions:
    - **Named exports only** — no default export (matches `lib/stages.ts`)
    - `Record<'client' | 'rm', Persona>` typing — narrow keys avoid `noUncheckedIndexedAccess` undefined pain (per RESEARCH Pitfall 2)
    - `as const` on `PERSONAS` and `PERSONA_HOME` — preserves narrow literal types
    - `PERSONA_HOME` is keyed by `'client' | 'rm'` only (NOT 'demo' — there is no "home" for the demo page)
    - `modeForPathname` accepts the parameter name `pathname` (matches Next.js `usePathname()` semantics; reads more naturally than `p`)
    - The `/dev` prefix MUST come first in the match cascade — otherwise a path like `/cockpit-dev` (hypothetical future) would mismatch
    - The default fall-through is `'client'` (matches D-67 prose: "default → client"); covers `/`, `/journey`, `/messages`, `/stage-*`, and any unmapped path
    - `contextSub?: string` is optional in the type because Yuki has no contextSub; James does
    - File-header comment: 5 lines, references D-66/D-67/D-69 + RESEARCH §8.2 (mirrors `lib/stages.ts:1` brevity)

    Do NOT import from `@/types/origin` — persona is frontend-internal (CONTEXT.md "Specifics" line 280). `Mode` and `Persona` are local-to-this-file types. Do NOT export anything else (no default, no namespace).
  </action>
  <verify>
    <automated>
    grep -q "export type Mode = 'client' | 'rm' | 'demo'" lib/persona.ts && grep -q "export const PERSONAS:" lib/persona.ts && grep -q "export const PERSONA_HOME =" lib/persona.ts && grep -q "export function modeForPathname" lib/persona.ts && npm run typecheck && npm run lint
    </automated>
  </verify>
  <acceptance_criteria>
    - File `lib/persona.ts` exists at repo root
    - Exports `Mode` type as the literal union `'client' | 'rm' | 'demo'`
    - Exports `Persona` type with fields `name`, `role`, `context`, `contextJp` (nullable), `contextSub` (optional)
    - Exports `PERSONAS` typed `Record<'client' | 'rm', Persona>` with keys `client` and `rm` only
    - `PERSONAS.client.name === 'Yuki Tanaka'` and `PERSONAS.client.role === 'TREASURER'` and `PERSONAS.client.context === 'Kaisei Manufacturing KK'` and `PERSONAS.client.contextJp === '開成製造'` (verifiable via test in Task 2 OR via `grep`)
    - `PERSONAS.rm.name === 'James Lee'` and `PERSONAS.rm.role === 'RELATIONSHIP MGR'` and `PERSONAS.rm.context === 'Japanese Corporates'` and `PERSONAS.rm.contextJp === null` and `PERSONAS.rm.contextSub === '25 clients · Singapore desk'`
    - Exports `PERSONA_HOME` with literal `{ client: '/journey', rm: '/cockpit' } as const`
    - Exports `modeForPathname(pathname: string): Mode`
    - The match cascade in `modeForPathname` checks `/dev` BEFORE `/cockpit|/portfolio|/application|/copilot-log` (cascade order matters — verifiable by reading the function source)
    - File uses `as const` on both `PERSONAS` and `PERSONA_HOME` literal-objects
    - File has NO default export (`grep -q "export default" lib/persona.ts` returns no match)
    - File has NO `import` from `@/types/origin` or `@/lib/api*` (chrome stays decoupled per D-66)
    - `npm run typecheck` exits 0 (closed-enum mode return type type-checks)
    - `npm run lint` exits 0 (matches Prettier conventions: single quotes, 2-space indent, trailing commas where applicable)
  </acceptance_criteria>
  <done>lib/persona.ts exists with the exact exports + typing per the action; typecheck + lint green.</done>
</task>

<task type="auto" tdd="false">
  <name>Task 2: Create lib/persona.test.ts — modeForPathname coverage table</name>
  <read_first>
    - /Users/wyekitgoh/Projects/SMBCorigins/lib/stages.test.ts (analog: explicit `import { describe, it, expect } from 'vitest'` per Phase 3 D-63 globals:false; `describe` block names follow file-path + decision-ID idiom)
    - /Users/wyekitgoh/Projects/SMBCorigins/lib/api.mock.test.ts (lines 1–25) — file-header JSDoc style for tests
    - .planning/phases/04-app-shell-primitives/04-RESEARCH.md §"Pitfall 2" (lines 457–466) — narrowing pattern verifies `PERSONAS[mode]` works without `| undefined`
  </read_first>
  <files>lib/persona.test.ts</files>
  <action>
    Create `lib/persona.test.ts` at repo root with this exact content:

    ```ts
    /**
     * lib/persona.test.ts — Tests for the chrome persona stubs (D-66, D-67, D-69).
     *
     * Covers:
     *   - PERSONAS literal-data fidelity (8 fields × 2 personas)
     *   - PERSONA_HOME literal paths
     *   - modeForPathname route-table cascade for the 3-arm 'client' | 'rm' | 'demo' union
     *
     * Test isolation: persona module exports are read-only constants + a pure
     * function — no module-scoped state, no beforeEach reset needed.
     */

    import { describe, it, expect } from 'vitest'
    import {
      PERSONAS,
      PERSONA_HOME,
      modeForPathname,
      type Mode,
      type Persona,
    } from '@/lib/persona'

    describe('lib/persona — PERSONAS constant (D-66)', () => {
      it('client persona has the locked Yuki shape', () => {
        const yuki: Persona = PERSONAS.client
        expect(yuki.name).toBe('Yuki Tanaka')
        expect(yuki.role).toBe('TREASURER')
        expect(yuki.context).toBe('Kaisei Manufacturing KK')
        expect(yuki.contextJp).toBe('開成製造')
        expect(yuki.contextSub).toBeUndefined()
      })

      it('rm persona has the locked James shape', () => {
        const james: Persona = PERSONAS.rm
        expect(james.name).toBe('James Lee')
        expect(james.role).toBe('RELATIONSHIP MGR')
        expect(james.context).toBe('Japanese Corporates')
        expect(james.contextJp).toBeNull()
        expect(james.contextSub).toBe('25 clients · Singapore desk')
      })

      it('PERSONAS contains exactly two keys (client + rm)', () => {
        expect(Object.keys(PERSONAS).sort()).toEqual(['client', 'rm'])
      })
    })

    describe('lib/persona — PERSONA_HOME constant (D-69)', () => {
      it('client home is /journey', () => {
        expect(PERSONA_HOME.client).toBe('/journey')
      })

      it('rm home is /cockpit', () => {
        expect(PERSONA_HOME.rm).toBe('/cockpit')
      })

      it('PERSONA_HOME does NOT include a demo entry (demo has no canonical home)', () => {
        expect(Object.keys(PERSONA_HOME).sort()).toEqual(['client', 'rm'])
      })
    })

    describe('lib/persona — modeForPathname (D-67 + RESEARCH §8.2)', () => {
      it('returns "demo" for /dev/primitives', () => {
        expect(modeForPathname('/dev/primitives')).toBe('demo')
      })

      it('returns "demo" for any /dev/* path', () => {
        expect(modeForPathname('/dev')).toBe('demo')
        expect(modeForPathname('/dev/storybook/anything')).toBe('demo')
      })

      it('returns "rm" for /cockpit', () => {
        expect(modeForPathname('/cockpit')).toBe('rm')
      })

      it('returns "rm" for /portfolio, /application/*, /copilot-log', () => {
        expect(modeForPathname('/portfolio')).toBe('rm')
        expect(modeForPathname('/application/abc-123')).toBe('rm')
        expect(modeForPathname('/copilot-log')).toBe('rm')
      })

      it('returns "client" for /journey', () => {
        expect(modeForPathname('/journey')).toBe('client')
      })

      it('returns "client" for unmapped paths (default fall-through)', () => {
        expect(modeForPathname('/')).toBe('client')
        expect(modeForPathname('/messages')).toBe('client')
        expect(modeForPathname('/stage-2')).toBe('client')
      })

      it('cascade order: /dev wins over hypothetical longer paths', () => {
        // If /dev appears as a path prefix, it always returns "demo" — never falls through to client/rm
        const result: Mode = modeForPathname('/dev')
        expect(result).toBe('demo')
      })
    })
    ```

    Conventions:
    - **Explicit imports** of `describe`, `it`, `expect` (Phase 3 D-63 `globals: false`)
    - Use `it`, NOT `test` (Phase 3 convention from `lib/stages.test.ts`)
    - Multi-line JSDoc file header with covered-decision IDs (matches `lib/api.mock.test.ts:1–13`)
    - `describe` block messages use the format `'lib/persona — <SUBJECT> (<DECISION ID>)'` (mirrors `lib/stages.test.ts:27`)
    - Type-only imports use `type` keyword: `type Mode`, `type Persona` (matches Phase 3 patterns; preserves erasure)
    - 9 `it` blocks total, ≥3 in each describe block — guarantees the route-map table is well-covered
    - The Mode-typed assignment in the last `it` block is the type-level test (compile-time): if `modeForPathname` ever changed return type, this would error
  </action>
  <verify>
    <automated>
    grep -q "from '@/lib/persona'" lib/persona.test.ts && grep -q "describe('lib/persona — PERSONAS" lib/persona.test.ts && grep -q "describe('lib/persona — modeForPathname" lib/persona.test.ts && npm run test -- lib/persona.test.ts
    </automated>
  </verify>
  <acceptance_criteria>
    - File `lib/persona.test.ts` exists at repo root (co-located with `lib/persona.ts`)
    - File imports `PERSONAS`, `PERSONA_HOME`, `modeForPathname` from `@/lib/persona`
    - File imports types `Mode` and `Persona` (using `type` keyword for type-only imports)
    - File has 3 `describe` blocks: PERSONAS, PERSONA_HOME, modeForPathname
    - Total `it` cases ≥9 (verifiable: `grep -c "it(" lib/persona.test.ts` ≥ 9)
    - Each persona's name + role + context + contextJp + contextSub asserted (Yuki has no contextSub; James does)
    - All 7 representative path inputs to `modeForPathname` have explicit cases: `/dev/primitives`, `/dev`, `/cockpit`, `/portfolio`, `/application/*`, `/copilot-log`, `/journey`, `/`, `/messages`, `/stage-2`
    - `npm run test -- lib/persona.test.ts` exits 0 with all assertions passing
    - `npm run typecheck` exits 0
    - `npm run lint` exits 0
  </acceptance_criteria>
  <done>lib/persona.test.ts exists with 9+ assertions covering PERSONAS data fidelity + PERSONA_HOME paths + modeForPathname route table; all assertions pass.</done>
</task>

</tasks>

<threat_model>
Plan 04-03 introduces persona literal data (no PII — Yuki and James are fictional demo personas) + a pure routing-table function (no user input, no SQL, no eval). The applicable ASVS category is V5 Input Validation; risk = none for the function (input is a pathname string, output is a 3-arm enum).

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-04-03-01 | V5 Input Validation | modeForPathname | accept | Function returns a closed enum (`'client' | 'rm' | 'demo'`); no string interpolation, no SQL, no eval, no DOM. Pathname is read-only input from `usePathname()`. Worst case: a malformed pathname falls to the default `'client'` arm — graceful, no crash. |
| T-04-03-02 | V14 Configuration | PERSONAS literal | accept | No PII (Yuki Tanaka and James Lee are demo personas per CLAUDE.md "Personas"). The `contextSub: '25 clients · Singapore desk'` string is illustrative, not real-world client data. |

No active threats requiring mitigation.
</threat_model>

<verification>
After both tasks land:
1. `npm run typecheck && npm run lint && npm run test` all exit 0
2. `npm run test -- lib/persona.test.ts` shows 9+ passing assertions
3. `git diff --stat` shows two new files: `lib/persona.ts` and `lib/persona.test.ts`
4. Wave 3+ chrome plans (TopStrip, ModeSwitcher) can `import { PERSONAS, PERSONA_HOME, modeForPathname } from '@/lib/persona'` without further setup
</verification>

<success_criteria>
- [ ] `lib/persona.ts` exists with PERSONAS, PERSONA_HOME, modeForPathname, Mode, Persona exports
- [ ] PERSONAS literal data matches CONTEXT.md D-66 verbatim (8 fields × 2 personas)
- [ ] modeForPathname returns 3-arm union ('client' | 'rm' | 'demo') with /dev cascade-first ordering
- [ ] `lib/persona.test.ts` exists with ≥9 assertions covering all three exports
- [ ] All tests pass; typecheck + lint green; no boundary file imports (chrome stays decoupled per D-66)
</success_criteria>

<output>
After completion, create `.planning/phases/04-app-shell-primitives/04-03-SUMMARY.md`
</output>
