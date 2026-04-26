/**
 * lib/api.mock.ts — Mock implementation of OriginAPI
 *
 * OWNED: Kit (@kitgoh-cloud). Evan reviews on PR (CODEOWNERS).
 *
 * State model: lazy-cloned in-memory mutable store (Pattern G).
 *   - seed.ts exports are frozen templates.
 *   - On first method call, structuredClone() deep-copies the seed into _store.
 *   - Mutations (createApplication, submitIntake) write to _store only.
 *   - Page refresh re-evaluates this module = _store reset = clean demo.
 *
 * Reactivity: tiny event-emitter (Pattern H).
 *   - Mutations call emit() after writing.
 *   - subscribeToPortfolio returns Promise<() => void>; onUpdate is an
 *     invalidation signal — caller re-fetches via getPortfolio.
 *
 * Error surface: bounded to intake flow (D-54).
 *   - IntakeTokenError extends Error with reason: 'expired' | 'unknown' | 'consumed'.
 *   - All other methods are happy-path. No random failures.
 *
 * Latency: per-method map (D-53). No jitter — predictable demo run-throughs.
 */

import type {
  Activity,
  Application,
  ApplicationCreated,
  ApplicationDetail,
  CreateApplicationInput,
  CreditMemo,
  Document,
  Entity,
  IntakePayload,
  IntakeToken,
  Organization,
  PortfolioItem,
  Product,
  ScreeningHit,
  Stage,
  UBO,
  User,
} from '@/types/origin'
import type { OriginAPI } from './api'
import { deriveStages } from '@/lib/stages'
import {
  demoNewClientTemplate,
  seedActivities,
  seedApplications,
  seedCreditMemos,
  seedDocuments,
  seedEntities,
  seedIntakeTokens,
  seedOrganizations,
  seedProducts,
  seedScreeningHits,
  seedUBOs,
  seedUsers,
  stageCompletionTimes,
} from '@/data/seed'

// ---------------------------------------------------------------------------
// IntakeTokenError — bounded error surface for the intake flow (D-54).
// ---------------------------------------------------------------------------

export class IntakeTokenError extends Error {
  readonly reason: 'expired' | 'unknown' | 'consumed'

  constructor(reason: 'expired' | 'unknown' | 'consumed') {
    super(`Intake token ${reason}`)
    this.name = 'IntakeTokenError'
    this.reason = reason
  }
}

// ---------------------------------------------------------------------------
// Latency map (D-53) — predictable, no jitter.
// ---------------------------------------------------------------------------

const LATENCY_MS = {
  getApplication: 120,
  getClientApplication: 120,
  getApplicationDetail: 150,
  getPortfolio: 100,
  getEntities: 80,
  getUBOs: 80,
  getDocuments: 90,
  getScreeningHits: 90,
  getProducts: 80,
  getCreditMemo: 120,
  createApplication: 250,
  submitIntake: 1800, // AI moment — entity discovery (D-53)
  getIntakeByToken: 100,
} as const

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms))

// ---------------------------------------------------------------------------
// must<T> — Pattern J: explicit narrow instead of non-null assertion.
// ---------------------------------------------------------------------------

/** Narrow `T | undefined` to `T` with an explicit "seed integrity" error.
 *  Use instead of `!` non-null assertion (Pattern J). */
function must<T>(x: T | undefined, label: string): T {
  if (x === undefined) throw new Error(`seed integrity: ${label} missing`)
  return x
}

// ---------------------------------------------------------------------------
// In-memory mutable store (Pattern G).
// ---------------------------------------------------------------------------

interface Store {
  organizations: Organization[]
  applications: Application[]
  entities: Entity[]
  ubos: UBO[]
  documents: Document[]
  screeningHits: ScreeningHit[]
  creditMemos: CreditMemo[]
  activities: Activity[]
  products: Product[]
  users: User[]
  intakeTokens: IntakeToken[]
}

let _store: Store | null = null

function getStore(): Store {
  if (_store === null) {
    // Pattern J: explicit-typing the seed BEFORE structuredClone narrows the
    // generic <T>(value: T): T return without needing an `as Store` cast.
    const seed: Store = {
      organizations: [...seedOrganizations],
      applications: [...seedApplications],
      entities: [...seedEntities],
      ubos: [...seedUBOs],
      documents: [...seedDocuments],
      screeningHits: [...seedScreeningHits],
      creditMemos: [...seedCreditMemos],
      activities: [...seedActivities],
      products: [...seedProducts],
      users: [...seedUsers],
      intakeTokens: [...seedIntakeTokens],
    }
    // structuredClone preserves T per its <T>(value: T): T signature in lib.dom.
    _store = structuredClone(seed)
  }
  return _store
}

/** Test-only: reset the store to seed state. NOT exposed on default mockAPI. */
export function __resetStoreForTests(): void {
  _store = null
}

// ---------------------------------------------------------------------------
// Event emitter (Pattern H).
// ---------------------------------------------------------------------------

type Listener = () => void
const listeners = new Set<Listener>()

function emit(): void {
  for (const l of listeners) l()
}

function subscribe(listener: Listener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** Test-only: clear all listeners. */
export function __clearListenersForTests(): void {
  listeners.clear()
}

// ---------------------------------------------------------------------------
// Stage post-processor (D-64) — fills completedAt from stageCompletionTimes
// for stages whose status is 'complete'.
// ---------------------------------------------------------------------------

function deriveStagesWithTimestamps(app: Application): Stage[] {
  const baseStages = deriveStages(app)
  const completionMap = stageCompletionTimes[app.id] ?? {}
  return baseStages.map((stage) => {
    if (stage.status === 'complete') {
      const ts = completionMap[stage.number]
      return ts !== undefined ? { ...stage, completedAt: ts } : stage
    }
    return stage
  })
}

// ---------------------------------------------------------------------------
// Composite-view assemblers (D-65) — computed at call time, never stored.
// ---------------------------------------------------------------------------

function computeApplicationDetail(
  applicationId: string,
  store: Store,
): ApplicationDetail {
  const application = must(
    store.applications.find((a) => a.id === applicationId),
    `application ${applicationId}`,
  )
  const organization = must(
    store.organizations.find((o) => o.id === application.organizationId),
    `organization ${application.organizationId}`,
  )
  const rm = must(
    store.users.find((u) => u.id === application.rmUserId),
    `rm user ${application.rmUserId}`,
  )
  const stages = deriveStagesWithTimestamps(application)
  const recentActivities = store.activities
    .filter((a) => a.applicationId === applicationId)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    .slice(0, 15)
  return { application, organization, rm, stages, recentActivities }
}

function computePortfolio(rmUserId: string, store: Store): PortfolioItem[] {
  const apps = store.applications.filter((a) => a.rmUserId === rmUserId)
  return apps.map((application) => {
    const organization = must(
      store.organizations.find((o) => o.id === application.organizationId),
      `organization ${application.organizationId}`,
    )
    const entitiesForApp = store.entities.filter(
      (e) => e.applicationId === application.id,
    )
    const docsForApp = store.documents.filter(
      (d) => d.applicationId === application.id,
    )
    const verifiedDocs = docsForApp.filter((d) => d.status === 'verified')
    const screeningForApp = store.screeningHits.filter(
      (s) => s.applicationId === application.id,
    )
    return {
      application,
      organization,
      entityCount: entitiesForApp.length,
      documentsTotal: docsForApp.length,
      documentsVerified: verifiedDocs.length,
      hasScreeningHits: screeningForApp.length > 0,
      eta: application.targetCloseDate,
    }
  })
}

// ---------------------------------------------------------------------------
// Read methods.
// ---------------------------------------------------------------------------

async function getApplication(id: string): Promise<Application> {
  await sleep(LATENCY_MS.getApplication)
  const store = getStore()
  return must(
    store.applications.find((a) => a.id === id),
    `application ${id}`,
  )
}

async function getClientApplication(userId: string): Promise<Application> {
  await sleep(LATENCY_MS.getClientApplication)
  const store = getStore()
  const user = must(
    store.users.find((u) => u.id === userId),
    `user ${userId}`,
  )
  if (user.orgId === null) {
    throw new Error(`seed integrity: user ${userId} has no orgId`)
  }
  return must(
    store.applications.find((a) => a.organizationId === user.orgId),
    `application for user ${userId} (org ${user.orgId})`,
  )
}

async function getApplicationDetail(id: string): Promise<ApplicationDetail> {
  await sleep(LATENCY_MS.getApplicationDetail)
  return computeApplicationDetail(id, getStore())
}

async function getPortfolio(rmUserId: string): Promise<PortfolioItem[]> {
  await sleep(LATENCY_MS.getPortfolio)
  return computePortfolio(rmUserId, getStore())
}

async function getEntities(applicationId: string): Promise<Entity[]> {
  await sleep(LATENCY_MS.getEntities)
  const store = getStore()
  return store.entities.filter((e) => e.applicationId === applicationId)
}

async function getUBOs(applicationId: string): Promise<UBO[]> {
  await sleep(LATENCY_MS.getUBOs)
  const store = getStore()
  return store.ubos.filter((u) => u.applicationId === applicationId)
}

async function getDocuments(applicationId: string): Promise<Document[]> {
  await sleep(LATENCY_MS.getDocuments)
  const store = getStore()
  return store.documents.filter((d) => d.applicationId === applicationId)
}

async function getScreeningHits(applicationId: string): Promise<ScreeningHit[]> {
  await sleep(LATENCY_MS.getScreeningHits)
  const store = getStore()
  return store.screeningHits.filter((s) => s.applicationId === applicationId)
}

async function getProducts(applicationId: string): Promise<Product[]> {
  await sleep(LATENCY_MS.getProducts)
  const store = getStore()
  return store.products.filter((p) => p.applicationId === applicationId)
}

async function getCreditMemo(
  applicationId: string,
): Promise<CreditMemo | null> {
  await sleep(LATENCY_MS.getCreditMemo)
  const store = getStore()
  const memo = store.creditMemos.find((m) => m.applicationId === applicationId)
  return memo ?? null
}

// ---------------------------------------------------------------------------
// Mutation methods.
// ---------------------------------------------------------------------------

/**
 * createApplication — returns ApplicationCreated composite per the
 * lib/api.ts contract. RM-invite flow needs both the new Application
 * AND the freshly-minted IntakeToken in one round-trip.
 */
async function createApplication(
  input: CreateApplicationInput,
): Promise<ApplicationCreated> {
  await sleep(LATENCY_MS.createApplication)
  const store = getStore()

  const organization = must(
    store.organizations.find((o) => o.id === input.organizationId),
    `organization for createApplication (${input.organizationId})`,
  )

  // Token entropy (T-03-04-01): crypto.randomUUID provides ~122 bits — never Math.random.
  const applicationId = crypto.randomUUID()
  const tokenStr = crypto.randomUUID()
  const nowIso = new Date().toISOString()
  // 7-day TTL per D-51 refinement.
  const expiresAt = new Date(
    Date.now() + 7 * 24 * 60 * 60 * 1000,
  ).toISOString()

  const application: Application = {
    id: applicationId,
    organizationId: input.organizationId,
    rmUserId: input.rmUserId,
    status: 'invited',
    currentStage: 1,
    targetJurisdictions: [...input.targetJurisdictions],
    productsRequested: [...input.productsRequested],
    openedAt: nowIso,
    targetCloseDate: input.targetCloseDate ?? null,
    closedAt: null,
  }

  const intakeToken: IntakeToken = {
    token: tokenStr,
    applicationId,
    organization,
    expiresAt,
    isUsed: false,
  }

  store.applications.push(application)
  store.intakeTokens.push(intakeToken)
  store.activities.push({
    id: crypto.randomUUID(),
    applicationId,
    actorType: 'rm',
    actorId: input.rmUserId,
    eventType: 'application_created',
    payload: {
      organizationId: input.organizationId,
      productsRequested: input.productsRequested,
    },
    createdAt: nowIso,
  })

  emit()

  return { application, intakeToken }
}

async function submitIntake(
  applicationId: string,
  payload: IntakePayload,
): Promise<Application> {
  await sleep(LATENCY_MS.submitIntake)
  const store = getStore()

  const token = store.intakeTokens.find(
    (t) => t.applicationId === applicationId,
  )
  // Idempotency (T-03-04-03): no token OR consumed token — fail before any mutation.
  if (token === undefined || token.isUsed) {
    throw new IntakeTokenError('consumed')
  }

  const application = must(
    store.applications.find((a) => a.id === applicationId),
    `application ${applicationId}`,
  )

  // Mark token consumed BEFORE state mutation completes (atomic from caller's POV).
  token.isUsed = true

  application.status = 'in_progress'
  application.currentStage = 2
  application.targetJurisdictions = [...payload.targetJurisdictions]
  application.productsRequested = [...payload.productsRequested]
  if (payload.targetCloseDate !== undefined) {
    application.targetCloseDate = payload.targetCloseDate
  }

  // Materialize Entity + UBO records from demoNewClientTemplate (D-50).
  const nowIso = new Date().toISOString()
  const newEntityIds: string[] = []
  const templateEntities = demoNewClientTemplate.entities
  // First pass: create parents (parentEntityId === null in template).
  for (const tplEntity of templateEntities) {
    const newId = crypto.randomUUID()
    newEntityIds.push(newId)
    store.entities.push({
      ...tplEntity,
      id: newId,
      applicationId,
      // The template uses parentEntityId: null for the top-level + sub (sub
      // resolves to the parent at runtime per the template's inline comment).
      // Plan 04 keeps parents flat — leave as-is.
      parentEntityId: tplEntity.parentEntityId,
      registeredAddress: tplEntity.registeredAddress
        ? { ...tplEntity.registeredAddress }
        : null,
      createdAt: nowIso,
    })
  }
  for (const tplUbo of demoNewClientTemplate.ubos) {
    store.ubos.push({
      ...tplUbo,
      id: crypto.randomUUID(),
      applicationId,
      createdAt: nowIso,
    })
  }

  store.activities.push({
    id: crypto.randomUUID(),
    applicationId,
    actorType: 'client',
    actorId: null,
    eventType: 'intake_submitted',
    payload: {
      productsRequested: payload.productsRequested,
      targetJurisdictions: payload.targetJurisdictions,
    },
    createdAt: nowIso,
  })
  store.activities.push({
    id: crypto.randomUUID(),
    applicationId,
    actorType: 'ai',
    actorId: null,
    eventType: 'entities_discovered',
    payload: {
      entityCount: templateEntities.length,
      uboCount: demoNewClientTemplate.ubos.length,
    },
    createdAt: nowIso,
  })

  emit()

  return application
}

async function getIntakeByToken(token: string): Promise<IntakeToken> {
  await sleep(LATENCY_MS.getIntakeByToken)
  const store = getStore()
  const record = store.intakeTokens.find((t) => t.token === token)
  if (record === undefined) throw new IntakeTokenError('unknown')
  if (Date.now() > Date.parse(record.expiresAt)) {
    throw new IntakeTokenError('expired')
  }
  if (record.isUsed) throw new IntakeTokenError('consumed')
  return record
}

// ---------------------------------------------------------------------------
// subscribeToPortfolio (Pattern H — Promise-returning).
// ---------------------------------------------------------------------------

const subscribeToPortfolio: OriginAPI['subscribeToPortfolio'] = async (
  _rmUserId,
  onUpdate,
) => {
  // Invalidation signal — caller re-fetches via getPortfolio. Fire once
  // immediately so initial render gets data without waiting for a mutation.
  onUpdate()
  const unsubscribe = subscribe(() => {
    onUpdate()
  })
  return unsubscribe
}

// ---------------------------------------------------------------------------
// Default export — OriginAPI conformance.
// ---------------------------------------------------------------------------

const mockAPI: OriginAPI = {
  getApplication,
  getClientApplication,
  getApplicationDetail,
  getPortfolio,
  getEntities,
  getUBOs,
  getDocuments,
  getScreeningHits,
  getProducts,
  getCreditMemo,
  createApplication,
  submitIntake,
  getIntakeByToken,
  subscribeToPortfolio,
}

export default mockAPI
