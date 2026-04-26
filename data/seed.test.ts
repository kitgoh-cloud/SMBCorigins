/**
 * data/seed.test.ts — Vitest invariants for the frozen mock dataset (D-60).
 *
 * Surfaces structural drift and value-level violations that the type system
 * cannot catch (ISO-3166 codes, doc count = 22, entity-tree shape, named
 * portfolio clients, intake token fixtures, stage completion coverage).
 *
 * Vitest config has globals: false (Pattern I) — explicit imports.
 * Pattern J discipline: no non-null assertions; narrow with `if (!x)`.
 */

import { describe, it, expect } from 'vitest'
import {
  ISO_3166_ALPHA2,
  seedApplications,
  seedDocuments,
  seedEntities,
  seedIntakeTokens,
  seedOrganizations,
  seedUBOs,
  stageCompletionTimes,
} from '@/data/seed'

describe('seed invariants — Kaisei + 6 portfolio + Act 3 org', () => {
  it('total document count = 22 (BOUND-03)', () => {
    expect(seedDocuments.length).toBe(22)
  })

  it('UBO ownership_pct sum is plausible per Application (handles public-float case)', () => {
    for (const app of seedApplications) {
      const ubos = seedUBOs.filter((u) => u.applicationId === app.id)
      expect(ubos.length).toBeGreaterThan(0)
      const namedSum = ubos.reduce((s, u) => s + (u.ownershipPct ?? 0), 0)
      expect(namedSum).toBeGreaterThan(0)
      expect(namedSum).toBeLessThanOrEqual(100)
    }
  })

  it('every EntityAddress.country is a valid ISO-3166-1 alpha-2 code', () => {
    const allowed = new Set<string>(ISO_3166_ALPHA2)
    for (const e of seedEntities) {
      if (e.registeredAddress) {
        expect(allowed.has(e.registeredAddress.country)).toBe(true)
      }
    }
  })

  it('every Application has a non-empty entity tree with at least one root', () => {
    for (const app of seedApplications) {
      const entities = seedEntities.filter((e) => e.applicationId === app.id)
      expect(entities.length).toBeGreaterThan(0)
      const roots = entities.filter((e) => e.parentEntityId === null)
      expect(roots.length).toBeGreaterThan(0)
    }
  })

  it('Kaisei has the 6-entity tree per ORIGIN_DESIGN.md §11.1 (Kaisei x5 + Morita Holdings)', () => {
    const kaisei = seedApplications.find((a) => a.organizationId === 'org-kaisei')
    expect(kaisei).toBeDefined()
    if (!kaisei) return
    const entities = seedEntities.filter((e) => e.applicationId === kaisei.id)
    const names = entities.map((e) => e.legalName).sort()
    expect(names).toEqual([
      'Kaisei Asia Pacific Pte Ltd',
      'Kaisei Europe Ltd',
      'Kaisei Manufacturing KK',
      'Kaisei Technology KK',
      'Kaisei Trading HK Ltd',
      'Morita Holdings',
    ])
    const morita = entities.find((e) => e.legalName === 'Morita Holdings')
    expect(morita?.isShell).toBe(true)
    expect(morita?.jurisdiction).toBe('VG')
  })

  it('6 background portfolio clients exist with names per ORIGIN_DESIGN.md §11.3', () => {
    const expected = [
      'Fujiwara Pharma',
      'Sato Trading',
      'Ishikawa Logistics',
      'Hayashi Foods',
      'Nakamura Electronics',
      'Ota Robotics',
    ]
    const orgNames = seedOrganizations.map((o) => o.displayName)
    for (const name of expected) {
      expect(orgNames).toContain(name)
    }
  })

  it('exactly 8 organizations (Kaisei + 6 background + 1 Act 3 pre-existing)', () => {
    expect(seedOrganizations.length).toBe(8)
  })

  it('seedIntakeTokens contains the 3 fixtures needed for IntakeTokenError tests', () => {
    const tokens = seedIntakeTokens.map((t) => t.token)
    expect(tokens).toContain('tok-fresh-test-001')
    expect(tokens).toContain('tok-expired-test-002')
    expect(tokens).toContain('tok-consumed-test-003')
    const fresh = seedIntakeTokens.find((t) => t.token === 'tok-fresh-test-001')
    expect(fresh?.isUsed).toBe(false)
    const consumed = seedIntakeTokens.find((t) => t.token === 'tok-consumed-test-003')
    expect(consumed?.isUsed).toBe(true)
  })

  it('Kaisei has at least 5 named UBOs (BOUND-03)', () => {
    const kaisei = seedApplications.find((a) => a.organizationId === 'org-kaisei')
    if (!kaisei) throw new Error('Kaisei application missing')
    const ubos = seedUBOs.filter((u) => u.applicationId === kaisei.id)
    expect(ubos.length).toBeGreaterThanOrEqual(5)
  })

  it('stageCompletionTimes covers every completed stage for Kaisei', () => {
    const kaiseiTimes = stageCompletionTimes['app-kaisei']
    expect(kaiseiTimes).toBeDefined()
    expect(kaiseiTimes?.[1]).toBeDefined()
    expect(kaiseiTimes?.[2]).toBeDefined()
    expect(kaiseiTimes?.[3]).toBeUndefined()
  })
})
