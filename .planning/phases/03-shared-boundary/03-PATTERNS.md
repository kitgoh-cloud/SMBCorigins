# Phase 3: Shared Boundary — Pattern Map

**Mapped:** 2026-04-26
**Files in scope:** 13 (7 created, 4 modified, 2 informational/temporary)
**Analogs found:** 7 / 11 source files have in-repo analogs (the four test/seed/config files are greenfield)

## State change since Phase 2

Phase 2 was a documented greenfield (`02-PATTERNS.md` line 22: "no `package.json`, no `app/`, no `node_modules/`, no source code"). Phase 3 is the **first phase with real in-repo TypeScript analogs**:

- `types/origin.ts` (Evan, 322 lines) — typed shapes including `Application`, `Entity`, `UBO`, `Document`, `ScreeningHit`, `CreditMemo`, `Stage`, `User` AND the supporting types (`Organization`, `Activity`, `Product`, `ApplicationDetail`, `PortfolioItem`, `IntakeToken`, `CreateApplicationInput`, `IntakePayload`).
- `lib/api.ts` (Evan, 102 lines) — `OriginAPI` interface (13 methods: 10 reads + 3 mutations) + lazy-loading proxy switch on `NEXT_PUBLIC_USE_MOCK`.
- `lib/api.mock.ts` (Evan placeholder, 29 lines) — **26-line stub of `OriginAPI` returning `Promise.reject(new Error('mock not implemented yet'))` for all 13 methods. This is the file Kit REPLACES (not extends) in Phase 3.**
- `lib/api.real.ts` (Evan placeholder, 30 lines) — structurally identical stub using a `todo` thrower. Useful as a structural twin for the mock.
- `lib/stages.ts` (Evan, 22 lines, co-owned per Kit's architectural push D-57/D-58) — `STAGE_NAMES` + `deriveStages()`. Returns `completedAt: null` hardcoded; Kit's mock post-processes this per D-64.

Phase 2's `02-PATTERNS.md` "Patterns A–F" remain in force. Phase 3 adds **Patterns G–K** (see Shared Patterns section).

---

## File Classification

### Files Kit creates (7)

| New file | Role | Data Flow | Closest analog | Match quality |
|----------|------|-----------|----------------|---------------|
| `data/seed.ts` | data fixtures (frozen module exports) | build-time → in-memory hydration | `types/origin.ts` (shape source); ORIGIN_DESIGN.md §11 (content source) | role-match (no in-repo data fixture analog yet) |
| `lib/api.mock.ts` (REPLACE) | service / in-memory backend implementation | request-response + pub-sub (subscribe) + CRUD | `lib/api.real.ts` (structural twin); `lib/api.ts` (interface contract) | exact-shape (interface), greenfield (implementation) |
| `lib/types-pending.ts` (TEMP — deleted on rebase) | type stub | build-time | `types/origin.ts` lines 295–322 (mutation input types — same idiom) | role-match |
| `lib/stages.test.ts` | unit test (co-located) | test-time | none in repo | greenfield |
| `lib/api.mock.test.ts` | unit test (co-located) | test-time | none in repo | greenfield |
| `data/seed.test.ts` | unit test (co-located, invariants) | test-time | none in repo | greenfield |
| `vitest.config.ts` | config (test runner) | test-time | `next.config.ts` (TypeScript config-as-module idiom) | role-match |

### Files Kit modifies (4)

| Modified file | Role | Data Flow | Modification | Source-of-truth |
|---------------|------|-----------|--------------|-----------------|
| `.github/CODEOWNERS` | governance | event-driven (PR open) | Append `lib/stages.ts @kitgoh-cloud @evangohAIO` grouped with co-owned contract surfaces (NOT alphabetically) | existing CODEOWNERS lines 14–17 (the co-owned block); D-58 |
| `.github/workflows/ci.yml` | CI workflow | event-driven (push/PR) | Add third top-level `test` job parallel to `typecheck` and `lint` | existing `ci.yml` lines 14–37 (Pattern D from `02-PATTERNS.md`); D-63 |
| `package.json` | config (manifest) | build-time | Add `vitest` to `devDependencies`; add `test` and `test:watch` to `scripts` | existing `package.json` lines 8–14 (scripts) + lines 20–31 (devDeps); D-61, D-63 |
| `CLAUDE.md` | docs | n/a | Append `npm run test` to "How to run" pre-PR validation line | existing `CLAUDE.md` line 106; D-63 |

### Files Kit reads but does NOT modify (informational)

| File | Why mentioned |
|------|--------------|
| `types/origin.ts` | Imported by every Phase 3 file. **Kit MUST NOT edit this** without a Slack ping per CONTRACT.md §"Announcement convention" — this is the cross-GSD co-owned contract surface. Two type additions on `evan/api-routes` (`ApplicationCreated` composite + `subscribeToPortfolio` signature) are pending; Kit shims them via `lib/types-pending.ts` until Evan's sub-PR merges. |
| `lib/api.ts` | Imported by `lib/api.mock.ts` for the `OriginAPI` interface. Kit MUST NOT touch (co-owned). |
| `tsconfig.json` | Already correct (`strict: true` + `noUncheckedIndexedAccess: true`). Vitest reads it at test-time; no edit needed. |

---

## Pattern Assignments (per file)

### `data/seed.ts` — fixtures module (NEW, BOUND-03)

**Classification:** data fixtures · build-time export · greenfield (no prior data file in repo)

**Shape source:** `types/origin.ts` is the **only authority** for the typed shape of every record. Every export from `data/seed.ts` MUST satisfy a type from `@/types/origin`. Type drift is a compile-time failure.

**Content source:** `docs/ORIGIN_DESIGN.md` §11 (`docs/ORIGIN_DESIGN.md:492-518`) is the **only authority** for the named entities, UBOs, and 6 background portfolio clients. Verbatim names per D-46/D-47.

**Imports pattern** (establish — no analog):
```typescript
import type {
  Application,
  Entity,
  UBO,
  Document,
  ScreeningHit,
  CreditMemo,
  Activity,
  Organization,
  User,
  Product,
} from '@/types/origin'
```

**Frozen-export idiom** (Pattern G — see Shared Patterns):
```typescript
export const seedOrganizations: ReadonlyArray<Organization> = Object.freeze([...])
export const seedApplications:  ReadonlyArray<Application>  = Object.freeze([...])
// ...one frozen array per table-shaped seed group...
export const demoNewClientTemplate: Readonly<{ ... }> = Object.freeze({ ... })
```

Why frozen: D-52/D-56 require seed exports to be immutable templates; the mock store deep-clones on first read so mutations write only to the cloned store. Freezing surfaces accidental mutation as a runtime error.

**Pre-existing 8th organization (Act 3 seed)** per CONTEXT addendum D-50 refinement:
The CreateApplicationInput requires `organizationId`. Seed an 8th `Organization` (Singapore-based, plausibly different from Kaisei) with no `Application` attached. `demoNewClientTemplate` references this org's id. At runtime, `createApplication({ organizationId: '<that-org-id>', ... })` consumes it.

**Country-code invariant test surface** (D-60):
Seed metadata MUST include or be cross-checked against an ISO-3166-1 alpha-2 list. CONTEXT.md `<canonical_refs>` directs vendoring a small constant list inline (no dependency). Suggested colocation: `data/seed.ts` exports an internal `ISO_3166_ALPHA2` constant OR `data/seed.test.ts` defines its own inline expected-set.

**Composite-view non-storage** (D-65):
**Do NOT** seed `ApplicationDetail` or `PortfolioItem` records. Both are computed at call time inside `lib/api.mock.ts` from the flat seed tables (one record per row).

**`Stage.completedAt` is NOT seeded** (D-64):
The seed never emits a `Stage[]` array. `lib/stages.ts:deriveStages` returns the array; `lib/api.mock.ts` post-processes the result to fill `completedAt` from `Application.openedAt + per-stage offset` for stages whose status is `'complete'`.

---

### `lib/api.mock.ts` — full implementation (REPLACE Evan's stub, BOUND-04)

**Classification:** service / in-memory backend · request-response + pub-sub + CRUD · structural-twin to `lib/api.real.ts`

**Analog (structural):** `lib/api.real.ts` (`/Users/wyekitgoh/Projects/SMBCorigins/lib/api.real.ts:1-30`)
**Analog (interface):** `lib/api.ts` lines 32–74 (`OriginAPI` definition)
**Analog (file currently being replaced):** `lib/api.mock.ts` lines 1–29 (Evan's stub)

**Default-export pattern** (copy from `lib/api.real.ts:14` and Evan's stub `lib/api.mock.ts:13`):
```typescript
const mockAPI: OriginAPI = {
  getApplication:       async (id) => { /* ... */ },
  getClientApplication: async (userId) => { /* ... */ },
  // ... all 13 methods of OriginAPI ...
}

export default mockAPI
```

The default-export name `mockAPI` matches Evan's stub on line 13. Keep this name — `lib/api.ts` line 84 imports as `m.default`.

**Interface conformance excerpt** (copy from `lib/api.ts:32-74`):
```typescript
export interface OriginAPI {
  // 10 reads (all required)
  getApplication(id: string): Promise<Application>
  getClientApplication(userId: string): Promise<Application>
  getApplicationDetail(id: string): Promise<ApplicationDetail>
  getPortfolio(rmUserId: string): Promise<PortfolioItem[]>
  getEntities(applicationId: string): Promise<Entity[]>
  getUBOs(applicationId: string): Promise<UBO[]>
  getDocuments(applicationId: string): Promise<Document[]>
  getScreeningHits(applicationId: string): Promise<ScreeningHit[]>
  getProducts(applicationId: string): Promise<Product[]>
  getCreditMemo(applicationId: string): Promise<CreditMemo | null>
  // 3 mutations (all required)
  createApplication(input: CreateApplicationInput): Promise<Application>
  submitIntake(applicationId: string, payload: IntakePayload): Promise<Application>
  getIntakeByToken(token: string): Promise<IntakeToken>
}
```

**CRITICAL — interface drift between mainline and pending sub-PR (CONTEXT addendum):**
- On `main`: `createApplication(input) → Promise<Application>`, no `subscribeToPortfolio`.
- On `evan/api-routes` (pending): `createApplication(input) → Promise<ApplicationCreated>` (composite type at `types/origin.ts:325-329` on that branch); `subscribeToPortfolio(rmUserId, onUpdate): Promise<() => void>` added.
- **Kit's mock implements the pending shape** so the Act 3 demo flow works. The temporary `lib/types-pending.ts` (D-51 refinement) shims `ApplicationCreated` and the subscribe signature until the sub-PR merges. On rebase, Kit deletes `lib/types-pending.ts` and updates the import to `@/types/origin`.

**In-memory mutable store pattern** (Pattern G — establish):
```typescript
import { /* frozen seed exports */ } from '@/data/seed'

interface Store {
  organizations: Organization[]
  applications:  Application[]
  entities:      Entity[]
  ubos:          UBO[]
  documents:     Document[]
  screeningHits: ScreeningHit[]
  creditMemos:   CreditMemo[]
  activities:    Activity[]
  products:      Product[]
  users:         User[]
  intakeTokens:  IntakeToken[]
}

let _store: Store | null = null

function getStore(): Store {
  if (!_store) {
    _store = structuredClone({
      organizations: [...seedOrganizations],
      applications:  [...seedApplications],
      // ... etc
    })
  }
  return _store
}
```

`structuredClone` is built-in in Node 18+ / browsers (Node 24 LTS per D-02 has it). No dependency.

**Per-method latency map** (D-53):
```typescript
const LATENCY_MS = {
  getApplication:        120,
  getApplicationDetail:  150,
  getPortfolio:          100,
  getEntities:            80,
  getUBOs:                80,
  getDocuments:           90,
  getScreeningHits:       90,
  getProducts:            80,
  getCreditMemo:         120,
  createApplication:     250,    // write
  submitIntake:         1800,    // AI moment — entity discovery
  getIntakeByToken:      100,
} as const

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
```

No random jitter (D-53 explicit: predictable demo run-throughs).

**`IntakeTokenError` class** (D-54 + addendum D-54 mapping):
```typescript
export class IntakeTokenError extends Error {
  readonly reason: 'expired' | 'unknown' | 'consumed'
  constructor(reason: 'expired' | 'unknown' | 'consumed') {
    super(`Intake token ${reason}`)
    this.name = 'IntakeTokenError'
    this.reason = reason
  }
}
```

Reason mapping (CONTEXT addendum D-54):
- `'unknown'` ← `store.intakeTokens.find(t => t.token === token)` returns `undefined`
- `'expired'` ← record exists AND `Date.now() > Date.parse(record.expiresAt)`
- `'consumed'` ← record exists AND `record.isUsed === true`

Idempotency contract (D-54): `submitIntake` checks `isUsed` BEFORE mutating state. First successful call sets `isUsed = true` AND mutates `application.status`/`currentStage`. Second call throws `IntakeTokenError('consumed')` and performs zero mutations.

**Event-emitter for reactive reads** (Pattern H — establish):
```typescript
type Listener = () => void
const listeners = new Set<Listener>()

function emit(): void {
  for (const l of listeners) l()
}

function subscribe(listener: Listener): () => void {
  listeners.add(listener)
  return () => { listeners.delete(listener) }
}
```

**`subscribeToPortfolio` (Promise-returning subscribe)** per CONTEXT addendum D-55 refinement:
```typescript
async subscribeToPortfolio(
  rmUserId: string,
  onUpdate: (items: PortfolioItem[]) => void,
): Promise<() => void> {
  // Initial emission
  const initial = computePortfolio(rmUserId, getStore())
  onUpdate(initial)
  // Subscribe to subsequent mutations
  const unsubscribe = subscribe(() => {
    onUpdate(computePortfolio(rmUserId, getStore()))
  })
  return unsubscribe
}
```

Mutations (`createApplication`, `submitIntake`) call `emit()` after writing the store.

**Composite-view assembly** (D-65 — assemble at call time, not stored):
```typescript
async getApplicationDetail(id: string): Promise<ApplicationDetail> {
  await sleep(LATENCY_MS.getApplicationDetail)
  const store = getStore()
  const application = store.applications.find(a => a.id === id)
  if (!application) throw new Error(`Application ${id} not found`)
  const organization = store.organizations.find(o => o.id === application.organizationId)
  const rm           = store.users.find(u => u.id === application.rmUserId)
  if (!organization || !rm) throw new Error('seed integrity violation')
  // D-64: post-process Stage.completedAt
  const stages = deriveStages(application).map(stage =>
    stage.status === 'complete'
      ? { ...stage, completedAt: stageCompletedAt(application.openedAt, stage.number) }
      : stage,
  )
  const recentActivities = store.activities
    .filter(a => a.applicationId === id)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    .slice(0, 20)
  return { application, organization, rm, stages, recentActivities }
}
```

**`noUncheckedIndexedAccess` discipline** (Pattern J — establish; required by D-05 in `tsconfig.json:8`):
Every `.find(...)` returns `T | undefined`. Either narrow explicitly (`if (!x) throw`) OR use a typed seed-integrity helper:
```typescript
function must<T>(x: T | undefined, label: string): T {
  if (x === undefined) throw new Error(`seed integrity: ${label} missing`)
  return x
}
```

Never use non-null assertions (`x!`) — undermines the strict-mode safety net D-05 invests in.

**Default export at file end** (mirror `lib/api.real.ts:30`):
```typescript
export default mockAPI
```

---

### `lib/types-pending.ts` — TEMPORARY shim (NEW, deleted on rebase)

**Classification:** type stub · build-time · greenfield (deletion-on-rebase pattern is new)

**Why this file exists:** The two pending type additions (`ApplicationCreated`, `subscribeToPortfolio` signature) live on `evan/api-routes`, NOT on `main`. Kit's mock implementation needs these to compile before the sub-PR merges. This file is the **named, intentional, deletable** shim.

**Analog (idiom only):** `types/origin.ts:295-322` — the existing "Mutation input types" block uses the same documented-block-of-types pattern.

**Required exports** (CONTEXT addendum D-51):
```typescript
/**
 * lib/types-pending.ts — TEMPORARY shim for types pending on evan/api-routes
 *
 * DELETE this file in the rebase that follows Evan's sub-PR merge.
 * Once that PR lands, ApplicationCreated and the subscribeToPortfolio signature
 * live in @/types/origin, and lib/api.mock.ts imports them from there.
 */
import type { Application, IntakeToken, PortfolioItem } from '@/types/origin'

export interface ApplicationCreated {
  application: Application
  intakeToken: IntakeToken
  intakeUrl: string
}

export type SubscribeToPortfolio = (
  rmUserId: string,
  onUpdate: (items: PortfolioItem[]) => void,
) => Promise<() => void>
```

**Rebase deletion checklist** (Kit MUST execute on rebase):
1. Delete `lib/types-pending.ts`.
2. Update `lib/api.mock.ts` imports: change `from '@/lib/types-pending'` → `from '@/types/origin'`.
3. Re-run `npm run typecheck` — passes only if Evan's sub-PR successfully merged the shapes.

---

### `vitest.config.ts` — test runner config (NEW, D-61)

**Classification:** config · test-time · greenfield

**Analog (idiom):** `next.config.ts` (Phase 2 file, not in current scope) — TypeScript-config-as-module idiom; `tsconfig.json` for path-alias parity.

**Minimal config** (CONTEXT.md "Claude's Discretion" line 84-86: keep minimal):
```typescript
import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],   // resolves @/* same as tsconfig.json
  test: {
    environment: 'node',         // no jsdom — no React component tests in Phase 3
    globals: false,              // explicit imports of describe/it/expect
    include: ['**/*.test.ts'],
  },
})
```

**Why `vite-tsconfig-paths`:** Vitest does not natively read `tsconfig.json` `paths` (`tsconfig.json:22-24`). Without this plugin, `import { ... } from '@/types/origin'` inside test files breaks at test-time but compiles fine at typecheck-time. Add to `devDependencies` alongside `vitest`.

**Why `environment: 'node'`:** Phase 3 tests are pure data/API logic. No React component tests in Phase 3 (deferred per Phase 2 deferred ideas). Adding `jsdom` is unnecessary noise.

**Why `globals: false`:** Forces `import { describe, it, expect } from 'vitest'` at the top of every test file. Surfaces explicit dependency in code review and dovetails with strict-mode TS.

---

### `data/seed.test.ts` — invariant tests (NEW, D-60)

**Classification:** unit test (co-located) · test-time · greenfield

**Analog:** none in repo. Pattern I (test colocation) established here.

**Required test cases** (D-60 enumerates exactly six, plus the country-code one D-60 line 71-72):

```typescript
import { describe, it, expect } from 'vitest'
import {
  seedOrganizations,
  seedApplications,
  seedEntities,
  seedUBOs,
  seedDocuments,
} from '@/data/seed'

describe('seed invariants — Kaisei + 6 portfolio + Act 3 org', () => {
  it('total document count = 22 (BOUND-03)', () => {
    expect(seedDocuments.length).toBe(22)
  })

  it('UBO ownership_pct sum is plausible per Application', () => {
    // Per CONTEXT.md §"Specifics": Kaisei is 42 + 18 + 12 + (4× <5%) + ~12% public float.
    // Test compares named-UBO sum to an explicit "total accounted for" annotation,
    // NOT a naive sum-equals-100% check.
    for (const app of seedApplications) {
      const ubos = seedUBOs.filter(u => u.applicationId === app.id)
      const namedSum = ubos.reduce((s, u) => s + (u.ownershipPct ?? 0), 0)
      expect(namedSum).toBeGreaterThan(0)
      expect(namedSum).toBeLessThanOrEqual(100)
    }
  })

  it('every EntityAddress.country is a valid ISO-3166-1 alpha-2', () => {
    const ISO_3166_ALPHA2 = new Set(['JP','SG','HK','GB','VG','US','CN','AU','MY','ID','PH','VN','TH','KR','TW','IN','DE','FR','CH','LU','BM','KY','BS' /* ...vendored list */])
    for (const e of seedEntities) {
      if (e.registeredAddress) {
        expect(ISO_3166_ALPHA2.has(e.registeredAddress.country)).toBe(true)
      }
    }
  })

  it('every Application has a non-empty entity tree', () => {
    for (const app of seedApplications) {
      const entities = seedEntities.filter(e => e.applicationId === app.id)
      expect(entities.length).toBeGreaterThan(0)
      const roots = entities.filter(e => e.parentEntityId === null)
      expect(roots.length).toBeGreaterThan(0)
    }
  })

  it('Kaisei has the 5-entity tree per ORIGIN_DESIGN.md §11.1', () => {
    // Kaisei Manufacturing KK + 3 wholly-owned subs + Kaisei Technology + Morita Holdings
    const kaisei = seedApplications.find(a => /* match Kaisei */ true)!
    const entities = seedEntities.filter(e => e.applicationId === kaisei.id)
    const names = entities.map(e => e.legalName).sort()
    expect(names).toEqual([
      'Kaisei Asia Pacific Pte Ltd',
      'Kaisei Europe Ltd',
      'Kaisei Manufacturing KK',
      'Kaisei Technology KK',
      'Kaisei Trading HK Ltd',
      'Morita Holdings',
    ].sort())
  })

  it('6 background portfolio clients exist with names per ORIGIN_DESIGN.md §11.3', () => {
    const expectedNames = [
      'Fujiwara Pharma',
      'Sato Trading',
      'Ishikawa Logistics',
      'Hayashi Foods',
      'Nakamura Electronics',
      'Ota Robotics',
    ]
    const orgNames = seedOrganizations.map(o => o.displayName)
    for (const name of expectedNames) {
      expect(orgNames).toContain(name)
    }
  })
})
```

**Note on the 8th organization (CONTEXT addendum D-50):** total `seedOrganizations.length` is 8 (Kaisei + 6 background + 1 pre-existing for Act 3). Don't over-assert this count if it would mask drift; assert that named clients exist instead.

---

### `lib/api.mock.test.ts` — mock behavior tests (NEW, D-60)

**Classification:** unit test (co-located) · test-time · greenfield

**Analog:** none. Tests Pattern G (in-memory store), Pattern H (subscribe), and the IntakeTokenError surface.

**Required test cases** (D-60 + CONTEXT addendum D-54/D-55):

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import mockAPI, { IntakeTokenError } from '@/lib/api.mock'

describe('lib/api.mock — IntakeTokenError reason mapping (D-54)', () => {
  it('throws IntakeTokenError({ reason: "unknown" }) for nonexistent token', async () => {
    await expect(mockAPI.getIntakeByToken('does-not-exist'))
      .rejects.toThrow(expect.objectContaining({ reason: 'unknown' }))
  })

  it('throws IntakeTokenError({ reason: "expired" }) for past expiresAt', async () => {
    // Setup: tamper a seeded token's expiresAt to past
    // ... or use a seeded test fixture
  })

  it('throws IntakeTokenError({ reason: "consumed" }) on second submitIntake', async () => {
    const token = '<seeded-fresh-token>'
    await mockAPI.submitIntake(token, { /* valid payload */ })
    await expect(mockAPI.submitIntake(token, { /* valid payload */ }))
      .rejects.toThrow(expect.objectContaining({ reason: 'consumed' }))
  })

  it('idempotent: failed second submitIntake does NOT mutate store', async () => {
    const token = '<seeded-fresh-token>'
    const first = await mockAPI.submitIntake(token, { /* valid payload */ })
    const portfolioBefore = await mockAPI.getPortfolio('<rm-id>')
    try { await mockAPI.submitIntake(token, { /* valid payload */ }) } catch {}
    const portfolioAfter = await mockAPI.getPortfolio('<rm-id>')
    expect(portfolioAfter.length).toBe(portfolioBefore.length)
  })
})

describe('lib/api.mock — createApplication composite return (D-51 refinement)', () => {
  it('returns { application, intakeToken, intakeUrl }', async () => {
    const result = await mockAPI.createApplication({
      organizationId: '<pre-existing-8th-org-id>',
      rmUserId: '<rm-id>',
      targetJurisdictions: ['SG'],
      productsRequested: ['accounts'],
    })
    expect(result.application.status).toBe('invited')
    expect(result.application.currentStage).toBe(1)
    expect(result.intakeToken).toBeTruthy()
    expect(result.intakeUrl).toMatch(/^https?:\/\//)
  })
})

describe('lib/api.mock — subscribe lifecycle (D-55 + addendum)', () => {
  it('emits initial value on subscribe', async () => {
    const onUpdate = vi.fn()
    const unsubscribe = await mockAPI.subscribeToPortfolio('<rm-id>', onUpdate)
    expect(onUpdate).toHaveBeenCalledTimes(1)
    unsubscribe()
  })

  it('emits on store mutation', async () => {
    const onUpdate = vi.fn()
    const unsubscribe = await mockAPI.subscribeToPortfolio('<rm-id>', onUpdate)
    await mockAPI.createApplication({ /* ... */ })
    expect(onUpdate).toHaveBeenCalledTimes(2) // initial + post-mutation
    unsubscribe()
  })

  it('unsubscribe stops emissions', async () => {
    const onUpdate = vi.fn()
    const unsubscribe = await mockAPI.subscribeToPortfolio('<rm-id>', onUpdate)
    unsubscribe()
    await mockAPI.createApplication({ /* ... */ })
    expect(onUpdate).toHaveBeenCalledTimes(1) // only the initial
  })
})
```

**Test-isolation note:** The in-memory store is module-scoped (Pattern G). Tests that mutate state should either reset the store between tests (export a `__resetStore` test-only hook) OR scope all mutations to a single `describe` block. Vitest does not auto-reset module state between tests.

---

### `lib/stages.test.ts` — derive-stages tests (NEW, D-60 + D-64)

**Classification:** unit test (co-located) · test-time · greenfield

**Analog:** `lib/stages.ts:12-22` is the function under test.

**Required test cases:**

```typescript
import { describe, it, expect } from 'vitest'
import { deriveStages, STAGE_NAMES } from '@/lib/stages'
import type { Application } from '@/types/origin'

describe('lib/stages — STAGE_NAMES + deriveStages', () => {
  it('STAGE_NAMES has exactly 6 entries matching ORIGIN_DESIGN.md §11.x', () => {
    expect(STAGE_NAMES[1]).toBe('Invite & Intent')
    expect(STAGE_NAMES[2]).toBe('Entity & Structure')
    expect(STAGE_NAMES[3]).toBe('Documentation')
    expect(STAGE_NAMES[4]).toBe('Screening')
    expect(STAGE_NAMES[5]).toBe('Products & Credit')
    expect(STAGE_NAMES[6]).toBe('Activation')
  })

  it('deriveStages returns Kaisei state: Stages 1-2 complete, 3 in_progress, 4-6 not_started (D-47)', () => {
    const kaiseiAt3: Application = { /* currentStage: 3, ... */ } as Application
    const stages = deriveStages(kaiseiAt3)
    expect(stages.map(s => s.status)).toEqual([
      'complete',     // 1
      'complete',     // 2
      'in_progress',  // 3
      'not_started',  // 4
      'not_started',  // 5
      'not_started',  // 6
    ])
  })

  it('deriveStages returns completedAt: null for all stages (D-64 — mock post-processes)', () => {
    const app: Application = { /* currentStage: 4 */ } as Application
    const stages = deriveStages(app)
    for (const s of stages) {
      expect(s.completedAt).toBeNull()
    }
  })
})
```

**Why test `completedAt: null`:** D-64 explicitly notes that `lib/stages.ts:20` hardcodes `completedAt: null` and the mock post-processes the array. The test ENFORCES that contract — if a future contributor "helpfully" populates `completedAt` inside `deriveStages`, the test catches it and the post-processor stops being needed (or worse, double-processes).

---

### `.github/CODEOWNERS` (MODIFY) — add `lib/stages.ts` (D-58)

**Analog:** existing `.github/CODEOWNERS:14-23` (already has the boundary block).

**Current state** (`.github/CODEOWNERS:14-23`):
```
# Co-owned: typed boundary surface — both must review every change
types/origin.ts          @kitgoh-cloud @evangohAIO
lib/api.ts               @kitgoh-cloud @evangohAIO

# Kit-owned: mock implementation — Evan reviews
lib/api.mock.ts          @kitgoh-cloud @evangohAIO

# Evan-owned: real implementation — Kit reviews
lib/api.real.ts          @evangohAIO @kitgoh-cloud
```

**Modification** (D-58 explicit: group with co-owned contract surfaces, NOT alphabetically):
Add `lib/stages.ts` immediately after `lib/api.ts` line 17:
```
# Co-owned: typed boundary surface — both must review every change
types/origin.ts          @kitgoh-cloud @evangohAIO
lib/api.ts               @kitgoh-cloud @evangohAIO
lib/stages.ts            @kitgoh-cloud @evangohAIO
```

**Why grouping matters:** GitHub matches CODEOWNERS patterns top-to-bottom, last-match-wins (`.github/CODEOWNERS:11-13`). Position is signal: this group is the contract surface. Alphabetical ordering would put `lib/api.mock.ts` between `lib/api.ts` and `lib/stages.ts`, which obscures the "this is the contract" grouping.

**File-end newline:** Confirm trailing newline after the new line — GitHub's CODEOWNERS parser tolerates missing trailing newline but lint tools and editors don't agree on it.

---

### `.github/workflows/ci.yml` (MODIFY) — add third `test` job (D-63, Pattern D)

**Analog:** existing `ci.yml:14-37` (Pattern D from `02-PATTERNS.md`).

**Existing structure** (`.github/workflows/ci.yml:14-37`):
```yaml
jobs:
  typecheck:
    name: typecheck
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: '.nvmrc'
          cache: 'npm'
      - run: npm ci
      - run: npm run typecheck

  lint:
    name: lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: '.nvmrc'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
```

**Add as third top-level job** (NOT a matrix step — `02-PATTERNS.md` Pattern D explicit):
```yaml
  test:
    name: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: '.nvmrc'
          cache: 'npm'
      - run: npm ci
      - run: npm run test
```

**Where to insert:** After the `lint` job (line 37). Same indentation as `typecheck:` and `lint:` (two spaces).

**No `permissions:` override** — workflow-level `permissions: contents: read` (lines 11-12) already covers this job; `npm test` needs no elevated scope.

**Status check name** = `test` (matches `name: test` field). After first run, branch protection on `main` requires this as a fourth status check (`typecheck`, `lint`, `test`, `Vercel`) per `02-PATTERNS.md` Pattern D's "sequence" note (manual UI step, not in-repo).

---

### `package.json` (MODIFY) — add vitest devDep + test scripts (D-61, D-63)

**Analog:** existing `package.json:8-14` (scripts) and `:20-31` (devDependencies).

**Modifications:**

1. **Add to `scripts`** (after line 13 `"typecheck": "tsc --noEmit"`):
```json
"test": "vitest run",
"test:watch": "vitest"
```

`vitest run` is the non-watch mode required for CI (per CONTEXT.md `<canonical_refs>`: "CI invocation (`vitest run` non-watch mode)").

2. **Add to `devDependencies`** (alphabetical order would put `vitest` between `typescript` and end-of-block; but the existing devDeps block is alphabetical — keep alphabetical):
```json
"vite-tsconfig-paths": "^5.x",
"vitest": "^2.x"
```

The exact version-pin major number must be confirmed at install time (`npm install --save-dev vitest vite-tsconfig-paths` will write the resolved range). Do NOT hand-pick; let npm pick.

3. **No new top-level fields.** Don't add `"jest": ...` or `"vitest": ...` config blocks — `vitest.config.ts` is the config home.

---

### `CLAUDE.md` (MODIFY) — add `npm run test` to pre-PR validation (D-63)

**Analog:** existing `CLAUDE.md:106`.

**Current line 106:**
```
Pre-PR validation: `npm run typecheck && npm run lint && npm run build`.
```

**New line 106** (insert `npm run test` between `npm run lint` and `npm run build`):
```
Pre-PR validation: `npm run typecheck && npm run lint && npm run test && npm run build`.
```

**CRITICAL: do NOT modify any other section of CLAUDE.md** — Phase 2's pattern note (`02-PATTERNS.md` line 412): "Stack contract / Scaffolding ownership / Design system / Personas are Phase 1 closure content — overwriting them is the failure mode that `--no-agents-md`...is specifically designed to prevent."

The single-line edit pattern was already established in Phase 2 (filling in the "How to run" section); Phase 3 inherits it.

---

## Shared Patterns (NEW — Phase 3 establishes these)

Phase 2 introduced Patterns A–F. Phase 3 introduces Patterns G–K. Future phases inherit all eleven.

### Pattern G: Frozen seed exports + lazy deep-cloned in-memory store

**Source files (after Phase 3):** `data/seed.ts` (frozen exports) + `lib/api.mock.ts` (cloned store).
**Established by:** D-52, D-56.
**Apply to:** Any future phase that needs additional seeded data OR a runtime mutation surface (e.g., Phase 5 doc-upload mutations, Phase 6 RM action mutations).

**Idiom (seed side):**
```typescript
export const seedThing: ReadonlyArray<T> = Object.freeze([...])
```

**Idiom (store side):**
```typescript
let _store: Store | null = null
function getStore(): Store {
  if (!_store) _store = structuredClone({ thing: [...seedThing] })
  return _store
}
```

**Reviewer test:** Mutating a member of `seedThing` at runtime throws (frozen). Mutating a member of `_store.thing` succeeds. Page refresh resets `_store` to `null` (module re-evaluation).

---

### Pattern H: Promise-returning subscribe + useEffect-based hook wrapper

**Source files (after Phase 3):** `lib/api.mock.ts` (`subscribeToPortfolio` returning `Promise<() => void>`).
**Established by:** D-55 + CONTEXT addendum D-55 refinement.
**Apply to:** Any future reactive read surface in the mock layer (and later, the real Supabase realtime adapter).

**Why NOT `useSyncExternalStore`:** The CONTEXT.md original (D-55) specified `useSyncExternalStore`, but the addendum corrects this: `subscribeToPortfolio` returns `Promise<() => void>`, not `() => void`. `useSyncExternalStore` requires a synchronous subscribe function. The right pattern is `useEffect` + `setState`.

**Idiom (consumer hook in Phase 5+):**
```typescript
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

export function usePortfolio(rmUserId: string) {
  const [items, setItems] = useState<PortfolioItem[]>([])
  useEffect(() => {
    let cancelled = false
    let unsubscribe: (() => void) | null = null
    api.subscribeToPortfolio(rmUserId, (next) => {
      if (!cancelled) setItems(next)
    }).then((u) => { if (cancelled) u(); else unsubscribe = u })
    return () => {
      cancelled = true
      unsubscribe?.()
    }
  }, [rmUserId])
  return items
}
```

The "cancelled" sentinel handles the race where the component unmounts before the subscribe Promise resolves. **Mock's internal emitter remains synchronous** (only the API surface is Promise-returning).

**Note for the planner:** This pattern's CONSUMER lives in Phase 5/6 (kanban screen). Phase 3 only delivers the producer side. The example above is included so the planner has the full picture.

---

### Pattern I: Co-located Vitest tests with `node` environment

**Source files (after Phase 3):** `vitest.config.ts` + `data/seed.test.ts` + `lib/api.mock.test.ts` + `lib/stages.test.ts`.
**Established by:** D-61, D-62.
**Apply to:** Any future unit test in any phase. Component tests (React) will require a separate addition (`environment: 'jsdom'` per-file via `// @vitest-environment jsdom` magic comment OR a separate config block) when Phase 5+ adds component tests.

**Idiom:**
- Test file lives next to source file: `lib/foo.ts` → `lib/foo.test.ts`.
- File header: `import { describe, it, expect } from 'vitest'` (globals: false).
- Run via `npm run test` (CI) or `npm run test:watch` (local TDD).
- Path alias `@/*` works thanks to `vite-tsconfig-paths`.

---

### Pattern J: `noUncheckedIndexedAccess` discipline — explicit narrowing or typed `must<T>` helper

**Source files (after Phase 3):** `lib/api.mock.ts`.
**Established by:** `tsconfig.json:8` (D-05) — strict mode in force since Phase 2.
**Apply to:** Every Phase 3+ file that does `seed.find(...)`, `array[i]`, or any indexed access on a typed collection.

**Idiom:**
```typescript
// BAD — non-null assertion undermines the safety net
const org = store.organizations.find(o => o.id === id)!

// GOOD — explicit narrow
const org = store.organizations.find(o => o.id === id)
if (!org) throw new Error('seed integrity: org missing')

// GOOD — typed helper for repeated lookups
function must<T>(x: T | undefined, label: string): T {
  if (x === undefined) throw new Error(`seed integrity: ${label} missing`)
  return x
}
const org = must(store.organizations.find(o => o.id === id), `org ${id}`)
```

**Reviewer test:** Grep for `!` after `.find(` in any new TS file = pattern violation. Phase 3 establishes that ESLint flat config (D-07, `eslint.config.mjs` from Phase 2) does NOT yet enforce this — discipline is human-review until a Phase 4+ ESLint rule lands.

---

### Pattern K: Temporary type shim for cross-GSD timing dependencies

**Source files (after Phase 3):** `lib/types-pending.ts` (deleted on rebase).
**Established by:** CONTEXT addendum D-51 refinement; backed by D-43 (contract baseline + pending pushes) and D-15 (first-PR-wins; second rebases).
**Apply to:** Any future Kit-or-Evan PR that depends on type additions still on a peer's in-flight branch.

**Idiom:**
1. Create `lib/types-pending.ts` (or `types/<area>-pending.ts`) with a header comment naming the source branch (`evan/api-routes`) and the deletion trigger (post-merge rebase).
2. Import the temp types into the dependent file.
3. On rebase post-source-merge: delete the file, retarget imports to the canonical location.
4. Add the deletion to the PR description's "Rebase TODO" so review catches it.

**Why this is preferable to alternatives:**
- Branching off the peer's PR branch (rejected by D-42 "review trees stay disentangled").
- Inlining the types in the consumer file (loses the deletion signal; risk of permanence).
- Blocking on the peer's PR (loses Phase 3's day-3 schedule per ROADMAP).

**Reviewer test:** PR description mentions `lib/types-pending.ts` as scheduled-for-deletion. Post-merge, the Kit rebase MUST delete the file in the same commit that retargets imports.

---

## Out-of-Repo Conventions Worth Noting (for Phase 4+ planners)

These extend Phase 2's "Out-of-Repo Conventions" table (`02-PATTERNS.md:537-547`):

| Phase 4+ scenario | Look at this Phase 3 file as the analog |
|-------------------|------------------------------------------|
| Adding a new typed shape to the cross-GSD contract | `types/origin.ts` — add to `@/types/origin` only with Slack-ping per CONTRACT.md §"Announcement convention" |
| Adding a new mock API method | `lib/api.mock.ts` — extend `OriginAPI` first in `lib/api.ts` (co-owned, Slack-ping), then implement in mock + real |
| Adding a new seeded entity / portfolio client / document | `data/seed.ts` — append to the relevant frozen export, update tests in `data/seed.test.ts` |
| Adding a new reactive read surface | `lib/api.mock.ts:subscribeToPortfolio` — same Promise-returning subscribe pattern; consumer uses Pattern H |
| Adding a new component test (Phase 5+) | `lib/api.mock.test.ts` (co-location idiom) + `vitest.config.ts` (add a per-file `// @vitest-environment jsdom` magic comment OR a separate config block for component tests) |
| Adding an ESLint rule that catches non-null assertions on `.find(...)` | `eslint.config.mjs` (Phase 2 file) — append to the `defineConfig([...])` array, before `prettier`; Pattern J becomes machine-enforced |
| Cross-GSD timing dependency (Kit needs Evan's not-yet-merged shape, or vice versa) | `lib/types-pending.ts` (Pattern K) — temporary shim, deleted on rebase |
| Adding a third required CI status check beyond `test` | `.github/workflows/ci.yml` (Pattern D from `02-PATTERNS.md`) — third top-level job, NOT a matrix step |

---

## Files with No Analog (greenfield within Phase 3)

| File | Role | Reason no analog |
|------|------|------------------|
| `data/seed.ts` | data fixtures | First fixtures file in repo. Shape is constrained by `types/origin.ts`; content is constrained by `docs/ORIGIN_DESIGN.md §11`. Pattern G establishes the frozen-export idiom. |
| `lib/types-pending.ts` | type shim | First temporary-shim file in repo. Pattern K establishes the deletion-on-rebase idiom. |
| `vitest.config.ts` | test config | First test framework config in repo. CONTEXT.md §"Claude's Discretion" line 84-86: keep minimal. |
| `data/seed.test.ts` | unit test (invariants) | First test file in repo. Pattern I establishes co-location + node environment + explicit imports. |
| `lib/api.mock.test.ts` | unit test (behavior) | First behavior test in repo. Tests Patterns G + H + IntakeTokenError surface. |
| `lib/stages.test.ts` | unit test (pure function) | First pure-function test in repo. Validates D-64 contract (`completedAt: null`). |

The other source files (`lib/api.mock.ts` proper, the four modified files) all have in-repo analogs as detailed above.

---

## Cross-references back to Phase 2

For convenience, Phase 3 inherits these Phase 2 patterns intact (no modification):

| Phase 2 pattern | Where Phase 3 uses it |
|-----------------|----------------------|
| Pattern A (CSS-first `@theme {}`) | Not touched — Phase 3 ships no styling |
| Pattern B (next/font/google → variable → utility) | Not touched — Phase 3 ships no fonts |
| Pattern C (route groups via nested folders) | Not touched — Phase 3 ships no routes |
| Pattern D (two-job CI → distinct status checks) | **Extended** — Phase 3 adds a third top-level `test` job, same idiom |
| Pattern E (Vercel env-var scoping) | Inherited — `NEXT_PUBLIC_USE_MOCK=true` already in place from Phase 2 |
| Pattern F (persona placeholder layout) | Not touched — Phase 3 ships no pages |

---

## Metadata

**Analog search scope:** `/Users/wyekitgoh/Projects/SMBCorigins/` — `lib/`, `types/`, `.github/`, repo root, `docs/ORIGIN_DESIGN.md` §7 + §11.
**Files scanned:** 10 source/governance files (full read), 1 doc file (targeted sections).
**Source-of-truth files cited verbatim:** `types/origin.ts:32-322`, `lib/api.ts:32-102`, `lib/api.mock.ts:1-29`, `lib/api.real.ts:1-30`, `lib/stages.ts:1-22`, `.github/workflows/ci.yml:14-37`, `.github/CODEOWNERS:14-23`, `package.json:8-31`, `CLAUDE.md:106`, `tsconfig.json:8`, `docs/ORIGIN_DESIGN.md:492-518`.
**Pattern extraction date:** 2026-04-26
**Greenfield status:** transitioned from full greenfield (Phase 2) to mostly-analoged (Phase 3); 6/13 files greenfield within Phase 3 itself, all establishing reusable patterns G–K.
