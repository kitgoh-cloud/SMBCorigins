import { describe, it, expect } from 'vitest'
import { deriveStages, STAGE_NAMES } from '@/lib/stages'
import type { Application } from '@/types/origin'

/**
 * Test fixture: a minimal Application stub.
 * Note: Application requires id, organizationId, rmUserId, status, currentStage,
 * targetJurisdictions, productsRequested, openedAt, targetCloseDate, closedAt.
 * deriveStages only reads `currentStage` — but TypeScript strict mode requires
 * a fully-typed object, so we provide a sane default.
 */
function makeApp(currentStage: 1 | 2 | 3 | 4 | 5 | 6): Application {
  return {
    id: 'test-app',
    organizationId: 'test-org',
    rmUserId: 'test-rm',
    status: 'in_progress',
    currentStage,
    targetJurisdictions: [],
    productsRequested: [],
    openedAt: '2026-01-01T00:00:00Z',
    targetCloseDate: null,
    closedAt: null,
  }
}

describe('lib/stages — STAGE_NAMES canonical 6-stage list (CLAUDE.md `## The six stages`)', () => {
  it('STAGE_NAMES has exactly 6 entries', () => {
    const keys = Object.keys(STAGE_NAMES)
    expect(keys.length).toBe(6)
    expect(keys.sort()).toEqual(['1', '2', '3', '4', '5', '6'])
  })

  it('STAGE_NAMES matches the canon verbatim', () => {
    expect(STAGE_NAMES[1]).toBe('Invite & Intent')
    expect(STAGE_NAMES[2]).toBe('Entity & Structure')
    expect(STAGE_NAMES[3]).toBe('Documentation')
    expect(STAGE_NAMES[4]).toBe('Screening')
    expect(STAGE_NAMES[5]).toBe('Products & Credit')
    expect(STAGE_NAMES[6]).toBe('Activation')
  })
})

describe('lib/stages — deriveStages status mapping', () => {
  it('app at currentStage=3 (Kaisei seeded state per D-47): stages 1-2 complete, 3 in_progress, 4-6 not_started', () => {
    const stages = deriveStages(makeApp(3))
    expect(stages.length).toBe(6)
    expect(stages.map((s) => s.status)).toEqual([
      'complete',
      'complete',
      'in_progress',
      'not_started',
      'not_started',
      'not_started',
    ])
  })

  it('app at currentStage=1 (Hayashi Foods invited): stage 1 in_progress, 2-6 not_started', () => {
    const stages = deriveStages(makeApp(1))
    expect(stages.map((s) => s.status)).toEqual([
      'in_progress',
      'not_started',
      'not_started',
      'not_started',
      'not_started',
      'not_started',
    ])
  })

  it('app at currentStage=6 (Nakamura activating): stages 1-5 complete, 6 in_progress', () => {
    const stages = deriveStages(makeApp(6))
    expect(stages.map((s) => s.status)).toEqual([
      'complete',
      'complete',
      'complete',
      'complete',
      'complete',
      'in_progress',
    ])
  })

  it('every Stage.number matches its 1-indexed position in the array', () => {
    const stages = deriveStages(makeApp(3))
    for (let i = 0; i < 6; i++) {
      expect(stages[i]?.number).toBe(i + 1)
    }
  })

  it('every Stage.name matches STAGE_NAMES[stage.number]', () => {
    const stages = deriveStages(makeApp(3))
    for (const stage of stages) {
      expect(stage.name).toBe(STAGE_NAMES[stage.number])
    }
  })
})

describe('lib/stages — deriveStages purity contract (D-64)', () => {
  // CRITICAL — D-64 contract: deriveStages MUST return completedAt: null for all stages.
  // The mock (lib/api.mock.ts) post-processes via deriveStagesWithTimestamps to fill in
  // ISO timestamps from stageCompletionTimes. If a future contributor populates
  // completedAt inside deriveStages directly, this test fails AND the post-processor
  // becomes redundant (or worse, double-processes a non-null value).

  it('deriveStages returns completedAt: null for ALL stages regardless of status (currentStage=1)', () => {
    const stages = deriveStages(makeApp(1))
    for (const s of stages) {
      expect(s.completedAt).toBeNull()
    }
  })

  it('deriveStages returns completedAt: null for ALL stages regardless of status (currentStage=3)', () => {
    const stages = deriveStages(makeApp(3))
    for (const s of stages) {
      expect(s.completedAt).toBeNull()
    }
  })

  it('deriveStages returns completedAt: null for ALL stages regardless of status (currentStage=6)', () => {
    const stages = deriveStages(makeApp(6))
    for (const s of stages) {
      expect(s.completedAt).toBeNull()
    }
  })
})
