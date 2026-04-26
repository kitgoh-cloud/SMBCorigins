/**
 * lib/api.mock.test.ts — Behavior tests for the mock API surface (D-60).
 *
 * Covers the contract surface added in Plan 04:
 *   - IntakeTokenError reason mapping (D-54)
 *   - submitIntake idempotency (D-54)
 *   - _createApplicationFull composite return (CONTEXT addendum A-02)
 *   - subscribeToPortfolio lifecycle (D-55 + Pattern H)
 *   - Composite views: ApplicationDetail with D-64 timestamps, getCreditMemo null/non-null
 *
 * Test isolation: the in-memory store is module-scoped (Pattern G). beforeEach
 * resets _store and clears listeners so cases don't bleed.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import mockAPI, {
  IntakeTokenError,
  _createApplicationFull,
  __resetStoreForTests,
  __clearListenersForTests,
} from '@/lib/api.mock'

beforeEach(() => {
  __resetStoreForTests()
  __clearListenersForTests()
})

describe('lib/api.mock — IntakeTokenError reason mapping (D-54)', () => {
  it('throws IntakeTokenError({ reason: "unknown" }) for nonexistent token', async () => {
    try {
      await mockAPI.getIntakeByToken('does-not-exist-anywhere')
      throw new Error('expected throw, got resolution')
    } catch (e) {
      expect(e).toBeInstanceOf(IntakeTokenError)
      expect((e as IntakeTokenError).reason).toBe('unknown')
    }
  })

  it('throws IntakeTokenError({ reason: "expired" }) for past expiresAt token', async () => {
    try {
      await mockAPI.getIntakeByToken('tok-expired-test-002')
      throw new Error('expected throw')
    } catch (e) {
      expect(e).toBeInstanceOf(IntakeTokenError)
      expect((e as IntakeTokenError).reason).toBe('expired')
    }
  })

  it('throws IntakeTokenError({ reason: "consumed" }) for already-used token', async () => {
    try {
      await mockAPI.getIntakeByToken('tok-consumed-test-003')
      throw new Error('expected throw')
    } catch (e) {
      expect(e).toBeInstanceOf(IntakeTokenError)
      expect((e as IntakeTokenError).reason).toBe('consumed')
    }
  })

  it('returns IntakeToken for a fresh, valid, unused token', async () => {
    const result = await mockAPI.getIntakeByToken('tok-fresh-test-001')
    expect(result.token).toBe('tok-fresh-test-001')
    expect(result.isUsed).toBe(false)
    expect(Date.parse(result.expiresAt)).toBeGreaterThan(Date.now())
  })
})

describe('lib/api.mock — submitIntake idempotency (D-54)', () => {
  it('first submitIntake succeeds and transitions Stage 1 -> Stage 2', async () => {
    const fresh = await mockAPI.getIntakeByToken('tok-fresh-test-001')
    const updated = await mockAPI.submitIntake(fresh.applicationId, {
      targetJurisdictions: ['SG'],
      productsRequested: ['accounts'],
    })
    expect(updated.currentStage).toBe(2)
    expect(updated.status).toBe('in_progress')
  })

  it('second submitIntake throws IntakeTokenError({ reason: "consumed" }) and does NOT mutate', async () => {
    const fresh = await mockAPI.getIntakeByToken('tok-fresh-test-001')
    await mockAPI.submitIntake(fresh.applicationId, {
      targetJurisdictions: ['SG'],
      productsRequested: ['accounts'],
    })

    // Capture state BEFORE attempting second submit
    const portfolioBefore = await mockAPI.getPortfolio('rm-james')

    try {
      await mockAPI.submitIntake(fresh.applicationId, {
        targetJurisdictions: ['SG'],
        productsRequested: ['accounts'],
      })
      throw new Error('expected throw on second submit')
    } catch (e) {
      expect(e).toBeInstanceOf(IntakeTokenError)
      expect((e as IntakeTokenError).reason).toBe('consumed')
    }

    const portfolioAfter = await mockAPI.getPortfolio('rm-james')
    expect(portfolioAfter.length).toBe(portfolioBefore.length)
  })
})

describe('lib/api.mock — _createApplicationFull composite return (CONTEXT addendum A-02)', () => {
  it('returns { application, intakeToken } with correct initial state', async () => {
    const result = await _createApplicationFull({
      organizationId: 'org-maritime', // 8th seeded org per D-50 refinement
      rmUserId: 'rm-james',
      targetJurisdictions: ['SG'],
      productsRequested: ['accounts', 'cash_management'],
    })
    expect(result.application.status).toBe('invited')
    expect(result.application.currentStage).toBe(1)
    expect(result.application.organizationId).toBe('org-maritime')
    expect(result.intakeToken.token).toBeTruthy()
    expect(result.intakeToken.isUsed).toBe(false)
    // Token expiresAt should be ~7 days from now
    const ttlDays =
      (Date.parse(result.intakeToken.expiresAt) - Date.now()) /
      (24 * 60 * 60 * 1000)
    expect(ttlDays).toBeGreaterThan(6.9)
    expect(ttlDays).toBeLessThan(7.1)
  })

  it('createApplication (default OriginAPI shape) returns just the Application', async () => {
    const app = await mockAPI.createApplication({
      organizationId: 'org-maritime',
      rmUserId: 'rm-james',
      targetJurisdictions: ['SG'],
      productsRequested: ['accounts'],
    })
    expect(app.status).toBe('invited')
    expect(app.currentStage).toBe(1)
    // Result shape matches Application, not ApplicationCreated.
    expect(
      (app as unknown as { intakeToken?: unknown }).intakeToken,
    ).toBeUndefined()
  })
})

describe('lib/api.mock — subscribeToPortfolio lifecycle (D-55 + Pattern H)', () => {
  it('emits initial value on subscribe', async () => {
    const onUpdate = vi.fn()
    const unsubscribe = await mockAPI.subscribeToPortfolio('rm-james', onUpdate)
    expect(onUpdate).toHaveBeenCalledTimes(1)
    unsubscribe()
  })

  it('emits on store mutation (createApplication)', async () => {
    const onUpdate = vi.fn()
    const unsubscribe = await mockAPI.subscribeToPortfolio('rm-james', onUpdate)
    // initial = call 1
    await _createApplicationFull({
      organizationId: 'org-maritime',
      rmUserId: 'rm-james',
      targetJurisdictions: ['SG'],
      productsRequested: ['accounts'],
    })
    // mutation = call 2
    expect(onUpdate).toHaveBeenCalledTimes(2)
    unsubscribe()
  })

  it('unsubscribe stops emissions', async () => {
    const onUpdate = vi.fn()
    const unsubscribe = await mockAPI.subscribeToPortfolio('rm-james', onUpdate)
    unsubscribe()
    await _createApplicationFull({
      organizationId: 'org-maritime',
      rmUserId: 'rm-james',
      targetJurisdictions: ['SG'],
      productsRequested: ['accounts'],
    })
    expect(onUpdate).toHaveBeenCalledTimes(1) // only the initial; no post-mutation call
  })
})

describe('lib/api.mock — read methods return seeded data', () => {
  it('getPortfolio returns seeded applications for rm-james', async () => {
    const items = await mockAPI.getPortfolio('rm-james')
    expect(items.length).toBeGreaterThanOrEqual(7) // Kaisei + 6 background
    const kaisei = items.find(
      (i) => i.organization.displayName === 'Kaisei Manufacturing KK',
    )
    expect(kaisei).toBeDefined()
  })

  it('getApplicationDetail returns composite view with stages array (D-65 + D-64)', async () => {
    const portfolio = await mockAPI.getPortfolio('rm-james')
    const kaisei = portfolio.find(
      (i) => i.organization.displayName === 'Kaisei Manufacturing KK',
    )
    if (!kaisei) throw new Error('Kaisei missing from seeded portfolio')
    const detail = await mockAPI.getApplicationDetail(kaisei.application.id)
    expect(detail.application.id).toBe(kaisei.application.id)
    expect(detail.organization.displayName).toBe('Kaisei Manufacturing KK')
    expect(detail.stages.length).toBe(6)
    // Stages 1+2 should have completedAt populated (D-64); stage 3 in_progress
    expect(detail.stages[0]?.status).toBe('complete')
    expect(detail.stages[0]?.completedAt).not.toBeNull()
    expect(detail.stages[1]?.status).toBe('complete')
    expect(detail.stages[1]?.completedAt).not.toBeNull()
    expect(detail.stages[2]?.status).toBe('in_progress')
    expect(detail.stages[2]?.completedAt).toBeNull()
  })

  it('getCreditMemo returns null for an Application with no memo', async () => {
    // Hayashi Foods is at Stage 1 — no credit memo (memo lives in Stage 5+)
    const portfolio = await mockAPI.getPortfolio('rm-james')
    const hayashi = portfolio.find(
      (i) => i.organization.displayName === 'Hayashi Foods',
    )
    if (!hayashi) throw new Error('Hayashi missing')
    const memo = await mockAPI.getCreditMemo(hayashi.application.id)
    expect(memo).toBeNull()
  })

  it('getCreditMemo returns the Kaisei $50M revolver memo', async () => {
    const portfolio = await mockAPI.getPortfolio('rm-james')
    const kaisei = portfolio.find(
      (i) => i.organization.displayName === 'Kaisei Manufacturing KK',
    )
    if (!kaisei) throw new Error('Kaisei missing')
    const memo = await mockAPI.getCreditMemo(kaisei.application.id)
    expect(memo).not.toBeNull()
    expect(memo?.facilityAmountUsd).toBe(50_000_000)
    // All 5 sections populated (D-45)
    expect(memo?.sections.exec_summary).toBeDefined()
    expect(memo?.sections.client_overview).toBeDefined()
    expect(memo?.sections.financials).toBeDefined()
    expect(memo?.sections.risk).toBeDefined()
    expect(memo?.sections.recommendation).toBeDefined()
  })
})
