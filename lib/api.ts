/**
 * lib/api.ts — Typed API surface (co-owned switch)
 *
 * CO-OWNED: Kit (@kitgoh-cloud) + Evan (@evangohAIO)
 * Cross-review required on every touching PR — see CONTRACT.md.
 * Contains NO business logic. Delegates entirely to mock or real implementation.
 *
 * D-16: NEXT_PUBLIC_USE_MOCK=true  → lib/api.mock.ts  (Kit)
 *       NEXT_PUBLIC_USE_MOCK=false → lib/api.real.ts  (Evan)
 */

import type {
  Application,
  ApplicationDetail,
  CreditMemo,
  Document,
  Entity,
  PortfolioItem,
  Product,
  ScreeningHit,
  UBO,
} from '@/types/origin'

// ---------------------------------------------------------------------------
// API contract — both implementations must satisfy this interface exactly.
// If a new function is needed, add it here first, then implement in both files.
// ---------------------------------------------------------------------------

export interface OriginAPI {
  // --- Application ---
  /** RM: get a single application by ID */
  getApplication(id: string): Promise<Application>

  /** Client: get the application associated with a client user */
  getClientApplication(userId: string): Promise<Application>

  /** Full detail view used by both heartbeat screens */
  getApplicationDetail(id: string): Promise<ApplicationDetail>

  // --- RM portfolio ---
  /** RM cockpit: all applications for the current RM */
  getPortfolio(rmUserId: string): Promise<PortfolioItem[]>

  // --- Entity tree ---
  getEntities(applicationId: string): Promise<Entity[]>

  // --- UBOs ---
  getUBOs(applicationId: string): Promise<UBO[]>

  // --- Documents ---
  getDocuments(applicationId: string): Promise<Document[]>

  // --- Screening ---
  getScreeningHits(applicationId: string): Promise<ScreeningHit[]>

  // --- Products ---
  getProducts(applicationId: string): Promise<Product[]>

  // --- Credit memo ---
  getCreditMemo(applicationId: string): Promise<CreditMemo | null>
}

// ---------------------------------------------------------------------------
// Runtime switch — resolved once at module load, not per call
// ---------------------------------------------------------------------------

// Lazy-loaded so the unused bundle is never imported on the client
const getImpl = (): Promise<OriginAPI> =>
  process.env.NEXT_PUBLIC_USE_MOCK === 'false'
    ? import('./api.real').then((m) => m.default)
    : import('./api.mock').then((m) => m.default)

let _impl: OriginAPI | null = null

async function impl(): Promise<OriginAPI> {
  if (!_impl) _impl = await getImpl()
  return _impl
}

// ---------------------------------------------------------------------------
// Public API — call these from components and server actions
// ---------------------------------------------------------------------------

export const api: OriginAPI = new Proxy({} as OriginAPI, {
  get(_target, prop: keyof OriginAPI) {
    return (...args: unknown[]) =>
      impl().then((i) => (i[prop] as (...a: unknown[]) => unknown)(...args))
  },
})
