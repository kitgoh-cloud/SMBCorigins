/**
 * data/seed.ts — Frozen mock dataset (BOUND-03)
 *
 * Source-of-truth for the demo's three-act flow:
 *   Act 1: Cockpit cold open (Kaisei + 6 background portfolio + Act 3 org).
 *   Act 2: Kaisei Stage 3 deep-dive (this file holds Stages 1-2 historical state).
 *   Act 3: Live new-client submission (uses `demoNewClientTemplate` + the 8th
 *          organization which has NO seeded Application — `createApplication`
 *          materializes one at runtime in plan 04).
 *
 * Every export is FROZEN (Object.freeze) and typed against `@/types/origin`.
 * Composite views (ApplicationDetail, PortfolioItem) and Stage[] arrays are
 * NOT seeded — assembled at call time inside `lib/api.mock.ts` (D-64, D-65).
 *
 * UBO ownership totals are intentionally < 100% for Kaisei to model the
 * public-float case (~12% non-named per ORIGIN_DESIGN.md §11.2).
 */

import type {
  Activity,
  Application,
  CreditMemo,
  Document,
  Entity,
  IntakeToken,
  Organization,
  Product,
  ScreeningHit,
  StageNumber,
  UBO,
  User,
} from '@/types/origin'

// ---------------------------------------------------------------------------
// ISO-3166-1 alpha-2 list (D-60 invariant test surface — vendored, no dep)
// ---------------------------------------------------------------------------

export const ISO_3166_ALPHA2: ReadonlyArray<string> = Object.freeze([
  'JP', 'SG', 'HK', 'GB', 'VG', 'US', 'CN', 'AU',
  'MY', 'ID', 'PH', 'VN', 'TH', 'KR', 'TW', 'IN',
  'DE', 'FR', 'CH', 'LU', 'BM', 'KY', 'BS',
])

// ---------------------------------------------------------------------------
// stageCompletionTimes (D-64) — per-Application map of completed-stage ISO timestamps.
// `lib/api.mock.ts` post-processes Stage[] from `lib/stages.ts:deriveStages`,
// reading `completedAt` from this map for stages whose status is 'complete'.
// ---------------------------------------------------------------------------

export const stageCompletionTimes: Readonly<
  Record<string, Partial<Record<StageNumber, string>>>
> = Object.freeze({
  'app-kaisei': Object.freeze({
    1: '2026-04-01T09:30:00Z',
    2: '2026-04-08T14:00:00Z',
    // Stage 3 in_progress — no completedAt
  }),
  'app-fujiwara': Object.freeze({
    1: '2026-03-20T08:00:00Z',
    2: '2026-04-05T11:00:00Z',
  }),
  'app-sato': Object.freeze({
    1: '2026-03-10T08:00:00Z',
    2: '2026-03-25T13:00:00Z',
    3: '2026-04-12T16:30:00Z',
  }),
  'app-ishikawa': Object.freeze({
    1: '2026-02-28T08:00:00Z',
    2: '2026-03-15T10:00:00Z',
    3: '2026-04-02T15:00:00Z',
    4: '2026-04-18T11:30:00Z',
  }),
  'app-hayashi': Object.freeze({
    // Stage 1 in_progress (just invited) — no completedAt yet
  }),
  'app-nakamura': Object.freeze({
    1: '2026-01-15T09:00:00Z',
    2: '2026-02-02T14:00:00Z',
    3: '2026-02-25T10:00:00Z',
    4: '2026-03-15T13:00:00Z',
    5: '2026-04-10T16:00:00Z',
  }),
  'app-ota': Object.freeze({
    1: '2026-03-05T08:00:00Z',
    2: '2026-03-22T12:00:00Z',
    // on_hold mid-Stage 3 (regulatory clarification)
  }),
})

// ---------------------------------------------------------------------------
// Users (RM, client_admins, system actor for Activity records)
// ---------------------------------------------------------------------------

export const seedUsers: ReadonlyArray<User> = Object.freeze([
  {
    id: 'rm-james',
    role: 'rm',
    displayName: 'James Lee',
    email: 'james.lee@smbc.com',
    avatarUrl: null,
    orgId: null,
    createdAt: '2025-01-15T08:00:00Z',
    updatedAt: '2025-01-15T08:00:00Z',
  },
  {
    id: 'client-yuki',
    role: 'client_admin',
    displayName: 'Yuki Tanaka',
    email: 'yuki.tanaka@kaisei.co.jp',
    avatarUrl: null,
    orgId: 'org-kaisei',
    createdAt: '2026-03-25T08:00:00Z',
    updatedAt: '2026-03-25T08:00:00Z',
  },
  {
    id: 'client-fujiwara-admin',
    role: 'client_admin',
    displayName: 'Akira Fujiwara',
    email: 'akira.fujiwara@fujiwara-pharma.co.jp',
    avatarUrl: null,
    orgId: 'org-fujiwara',
    createdAt: '2026-03-18T08:00:00Z',
    updatedAt: '2026-03-18T08:00:00Z',
  },
  {
    id: 'client-sato-admin',
    role: 'client_admin',
    displayName: 'Mei Sato',
    email: 'mei.sato@sato-trading.co.jp',
    avatarUrl: null,
    orgId: 'org-sato',
    createdAt: '2026-03-08T08:00:00Z',
    updatedAt: '2026-03-08T08:00:00Z',
  },
  {
    id: 'client-ishikawa-admin',
    role: 'client_admin',
    displayName: 'Ren Ishikawa',
    email: 'ren.ishikawa@ishikawa-logistics.co.jp',
    avatarUrl: null,
    orgId: 'org-ishikawa',
    createdAt: '2026-02-26T08:00:00Z',
    updatedAt: '2026-02-26T08:00:00Z',
  },
  {
    id: 'client-hayashi-admin',
    role: 'client_admin',
    displayName: 'Sora Hayashi',
    email: 'sora.hayashi@hayashi-foods.co.jp',
    avatarUrl: null,
    orgId: 'org-hayashi',
    createdAt: '2026-04-22T08:00:00Z',
    updatedAt: '2026-04-22T08:00:00Z',
  },
  {
    id: 'client-nakamura-admin',
    role: 'client_admin',
    displayName: 'Haruto Nakamura',
    email: 'haruto.nakamura@nakamura-electronics.co.jp',
    avatarUrl: null,
    orgId: 'org-nakamura',
    createdAt: '2026-01-12T08:00:00Z',
    updatedAt: '2026-01-12T08:00:00Z',
  },
  {
    id: 'client-ota-admin',
    role: 'client_admin',
    displayName: 'Kaori Ota',
    email: 'kaori.ota@ota-robotics.co.jp',
    avatarUrl: null,
    orgId: 'org-ota',
    createdAt: '2026-03-03T08:00:00Z',
    updatedAt: '2026-03-03T08:00:00Z',
  },
  {
    id: 'client-maritime-admin',
    role: 'client_admin',
    displayName: 'Wei Lim',
    email: 'wei.lim@maritime-robotics.com.sg',
    avatarUrl: null,
    orgId: 'org-maritime',
    createdAt: '2026-04-20T08:00:00Z',
    updatedAt: '2026-04-20T08:00:00Z',
  },
  // System actor — uses 'rm' role (mock-only convention since UserRole has no
  // 'system' value; Activity.actorId may also be null for system events).
  {
    id: 'system',
    role: 'rm',
    displayName: 'System',
    email: 'system@smbc.local',
    avatarUrl: null,
    orgId: null,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
])

// ---------------------------------------------------------------------------
// Organizations — exactly 8 (Kaisei + 6 background + 1 Act 3 pre-existing)
// ---------------------------------------------------------------------------

export const seedOrganizations: ReadonlyArray<Organization> = Object.freeze([
  {
    id: 'org-kaisei',
    legalName: 'Kaisei Manufacturing KK',
    displayName: 'Kaisei Manufacturing KK',
    hqJurisdiction: 'JP',
    industry: 'Manufacturing',
    sizeBand: 'Large',
    createdAt: '2026-03-25T08:00:00Z',
    updatedAt: '2026-03-25T08:00:00Z',
  },
  {
    id: 'org-fujiwara',
    legalName: 'Fujiwara Pharmaceutical Co., Ltd.',
    displayName: 'Fujiwara Pharma',
    hqJurisdiction: 'JP',
    industry: 'Pharmaceuticals',
    sizeBand: 'Mid',
    createdAt: '2026-03-18T08:00:00Z',
    updatedAt: '2026-03-18T08:00:00Z',
  },
  {
    id: 'org-sato',
    legalName: 'Sato Trading Co., Ltd.',
    displayName: 'Sato Trading',
    hqJurisdiction: 'JP',
    industry: 'Trading',
    sizeBand: 'Mid',
    createdAt: '2026-03-08T08:00:00Z',
    updatedAt: '2026-03-08T08:00:00Z',
  },
  {
    id: 'org-ishikawa',
    legalName: 'Ishikawa Logistics KK',
    displayName: 'Ishikawa Logistics',
    hqJurisdiction: 'JP',
    industry: 'Logistics',
    sizeBand: 'Mid',
    createdAt: '2026-02-26T08:00:00Z',
    updatedAt: '2026-02-26T08:00:00Z',
  },
  {
    id: 'org-hayashi',
    legalName: 'Hayashi Foods KK',
    displayName: 'Hayashi Foods',
    hqJurisdiction: 'JP',
    industry: 'Food & Beverage',
    sizeBand: 'Small',
    createdAt: '2026-04-22T08:00:00Z',
    updatedAt: '2026-04-22T08:00:00Z',
  },
  {
    id: 'org-nakamura',
    legalName: 'Nakamura Electronics KK',
    displayName: 'Nakamura Electronics',
    hqJurisdiction: 'JP',
    industry: 'Electronics',
    sizeBand: 'Large',
    createdAt: '2026-01-12T08:00:00Z',
    updatedAt: '2026-01-12T08:00:00Z',
  },
  {
    id: 'org-ota',
    legalName: 'Ota Robotics KK',
    displayName: 'Ota Robotics',
    hqJurisdiction: 'JP',
    industry: 'Industrial Automation',
    sizeBand: 'Mid',
    createdAt: '2026-03-03T08:00:00Z',
    updatedAt: '2026-03-03T08:00:00Z',
  },
  // Act 3 pre-existing organization — has NO seeded Application.
  // `createApplication` in plan 04 consumes this org id at runtime.
  {
    id: 'org-maritime',
    legalName: 'Maritime Robotics Pte Ltd',
    displayName: 'Maritime Robotics',
    hqJurisdiction: 'SG',
    industry: 'Marine Robotics',
    sizeBand: 'Mid',
    createdAt: '2026-04-20T08:00:00Z',
    updatedAt: '2026-04-20T08:00:00Z',
  },
])

// ---------------------------------------------------------------------------
// Applications — 7 (Kaisei + 6 background; Maritime has NO seeded Application)
// ---------------------------------------------------------------------------

export const seedApplications: ReadonlyArray<Application> = Object.freeze([
  {
    id: 'app-kaisei',
    organizationId: 'org-kaisei',
    rmUserId: 'rm-james',
    status: 'in_progress',
    currentStage: 3,
    targetJurisdictions: ['SG', 'HK', 'GB'],
    productsRequested: ['accounts', 'cash_management', 'trade_finance', 'credit'],
    openedAt: '2026-03-25T08:00:00Z',
    targetCloseDate: '2026-06-15',
    closedAt: null,
  },
  {
    id: 'app-fujiwara',
    organizationId: 'org-fujiwara',
    rmUserId: 'rm-james',
    status: 'in_progress',
    currentStage: 3,
    targetJurisdictions: ['SG'],
    productsRequested: ['accounts', 'cash_management'],
    openedAt: '2026-03-18T08:00:00Z',
    targetCloseDate: '2026-06-30',
    closedAt: null,
  },
  {
    id: 'app-sato',
    organizationId: 'org-sato',
    rmUserId: 'rm-james',
    status: 'in_review',
    currentStage: 4,
    targetJurisdictions: ['SG', 'HK'],
    productsRequested: ['accounts', 'trade_finance'],
    openedAt: '2026-03-08T08:00:00Z',
    targetCloseDate: '2026-05-30',
    closedAt: null,
  },
  {
    id: 'app-ishikawa',
    organizationId: 'org-ishikawa',
    rmUserId: 'rm-james',
    status: 'in_review',
    currentStage: 5,
    targetJurisdictions: ['SG'],
    productsRequested: ['accounts', 'credit'],
    openedAt: '2026-02-26T08:00:00Z',
    targetCloseDate: '2026-05-15',
    closedAt: null,
  },
  {
    id: 'app-hayashi',
    organizationId: 'org-hayashi',
    rmUserId: 'rm-james',
    status: 'invited',
    currentStage: 1,
    targetJurisdictions: ['SG'],
    productsRequested: ['accounts'],
    openedAt: '2026-04-22T08:00:00Z',
    targetCloseDate: '2026-07-15',
    closedAt: null,
  },
  {
    id: 'app-nakamura',
    organizationId: 'org-nakamura',
    rmUserId: 'rm-james',
    status: 'activated',
    currentStage: 6,
    targetJurisdictions: ['SG', 'HK', 'GB'],
    productsRequested: ['accounts', 'cash_management', 'fx', 'trade_finance'],
    openedAt: '2026-01-12T08:00:00Z',
    targetCloseDate: '2026-04-30',
    closedAt: null,
  },
  {
    id: 'app-ota',
    organizationId: 'org-ota',
    rmUserId: 'rm-james',
    status: 'on_hold',
    currentStage: 2,
    targetJurisdictions: ['SG'],
    productsRequested: ['accounts'],
    openedAt: '2026-03-03T08:00:00Z',
    targetCloseDate: '2026-06-01',
    closedAt: null,
  },
])

// ---------------------------------------------------------------------------
// Entities
//   Kaisei: 6 entities — parent KK + 4 direct subs + Morita Holdings (BVI shell
//   nested under Kaisei Technology KK per ORIGIN_DESIGN.md §11.1).
//   Background portfolio: 1 lightweight root entity per app (D-46).
//   Total: 6 + 6 = 12 entities.
// ---------------------------------------------------------------------------

export const seedEntities: ReadonlyArray<Entity> = Object.freeze([
  // ----- Kaisei tree -----
  {
    id: 'entity-kaisei-parent',
    applicationId: 'app-kaisei',
    parentEntityId: null,
    legalName: 'Kaisei Manufacturing KK',
    registrationNumber: '0100-01-123456',
    jurisdiction: 'JP',
    entityType: 'Kabushiki Kaisha',
    registeredAddress: { street: '3-1-1 Marunouchi, Chiyoda-ku', city: 'Tokyo', postcode: '100-0005', country: 'JP' },
    ownershipPct: null,
    confidenceScore: 0.99,
    isShell: false,
    source: 'registry',
    createdAt: '2026-03-26T10:00:00Z',
  },
  {
    id: 'entity-kaisei-sg',
    applicationId: 'app-kaisei',
    parentEntityId: 'entity-kaisei-parent',
    legalName: 'Kaisei Asia Pacific Pte Ltd',
    registrationNumber: '202300042K',
    jurisdiction: 'SG',
    entityType: 'Private Limited',
    registeredAddress: { street: '1 Marina Boulevard', city: 'Singapore', postcode: '018989', country: 'SG' },
    ownershipPct: 100,
    confidenceScore: 0.98,
    isShell: false,
    source: 'registry',
    createdAt: '2026-03-26T10:05:00Z',
  },
  {
    id: 'entity-kaisei-hk',
    applicationId: 'app-kaisei',
    parentEntityId: 'entity-kaisei-parent',
    legalName: 'Kaisei Trading HK Ltd',
    registrationNumber: '2876543',
    jurisdiction: 'HK',
    entityType: 'Limited Company',
    registeredAddress: { street: '2 IFC, 8 Finance Street', city: 'Central', country: 'HK' },
    ownershipPct: 100,
    confidenceScore: 0.97,
    isShell: false,
    source: 'registry',
    createdAt: '2026-03-26T10:10:00Z',
  },
  {
    id: 'entity-kaisei-uk',
    applicationId: 'app-kaisei',
    parentEntityId: 'entity-kaisei-parent',
    legalName: 'Kaisei Europe Ltd',
    registrationNumber: '14872310',
    jurisdiction: 'GB',
    entityType: 'Private Limited Company',
    registeredAddress: { street: '20 Fenchurch Street', city: 'London', postcode: 'EC3M 3BY', country: 'GB' },
    ownershipPct: 100,
    confidenceScore: 0.96,
    isShell: false,
    source: 'registry',
    createdAt: '2026-03-26T10:15:00Z',
  },
  {
    id: 'entity-kaisei-tech',
    applicationId: 'app-kaisei',
    parentEntityId: 'entity-kaisei-parent',
    legalName: 'Kaisei Technology KK',
    registrationNumber: '0100-01-789012',
    jurisdiction: 'JP',
    entityType: 'Kabushiki Kaisha',
    registeredAddress: { street: '6-10-1 Roppongi, Minato-ku', city: 'Tokyo', postcode: '106-6108', country: 'JP' },
    ownershipPct: 80,
    confidenceScore: 0.95,
    isShell: false,
    source: 'registry',
    createdAt: '2026-03-26T10:20:00Z',
  },
  {
    id: 'entity-morita-bvi',
    applicationId: 'app-kaisei',
    parentEntityId: 'entity-kaisei-tech',
    legalName: 'Morita Holdings',
    registrationNumber: 'BVI-1989432',
    jurisdiction: 'VG',
    entityType: 'BVI Business Company',
    registeredAddress: { street: 'Akara Building, 24 De Castro Street, Wickhams Cay 1', city: 'Road Town, Tortola', country: 'VG' },
    ownershipPct: 20,
    confidenceScore: 0.78,
    isShell: true,
    source: 'document',
    createdAt: '2026-04-08T13:45:00Z',
  },
  // ----- Background portfolio (1 lightweight root per app) -----
  {
    id: 'entity-fujiwara-root',
    applicationId: 'app-fujiwara',
    parentEntityId: null,
    legalName: 'Fujiwara Pharmaceutical Co., Ltd.',
    registrationNumber: '0100-01-334455',
    jurisdiction: 'JP',
    entityType: 'Kabushiki Kaisha',
    registeredAddress: { street: '2-3-3 Otemachi, Chiyoda-ku', city: 'Tokyo', postcode: '100-0004', country: 'JP' },
    ownershipPct: null,
    confidenceScore: 0.97,
    isShell: false,
    source: 'registry',
    createdAt: '2026-03-19T09:00:00Z',
  },
  {
    id: 'entity-sato-root',
    applicationId: 'app-sato',
    parentEntityId: null,
    legalName: 'Sato Trading Co., Ltd.',
    registrationNumber: '0100-01-556677',
    jurisdiction: 'JP',
    entityType: 'Kabushiki Kaisha',
    registeredAddress: { street: '1-5-1 Otemachi, Chiyoda-ku', city: 'Tokyo', postcode: '100-0004', country: 'JP' },
    ownershipPct: null,
    confidenceScore: 0.96,
    isShell: false,
    source: 'registry',
    createdAt: '2026-03-09T09:00:00Z',
  },
  {
    id: 'entity-ishikawa-root',
    applicationId: 'app-ishikawa',
    parentEntityId: null,
    legalName: 'Ishikawa Logistics KK',
    registrationNumber: '0100-01-778899',
    jurisdiction: 'JP',
    entityType: 'Kabushiki Kaisha',
    registeredAddress: { street: '5-2-1 Atago, Minato-ku', city: 'Tokyo', postcode: '105-0002', country: 'JP' },
    ownershipPct: null,
    confidenceScore: 0.97,
    isShell: false,
    source: 'registry',
    createdAt: '2026-02-27T09:00:00Z',
  },
  {
    id: 'entity-hayashi-root',
    applicationId: 'app-hayashi',
    parentEntityId: null,
    legalName: 'Hayashi Foods KK',
    registrationNumber: '0100-01-990011',
    jurisdiction: 'JP',
    entityType: 'Kabushiki Kaisha',
    registeredAddress: { street: '4-1-1 Nihonbashi, Chuo-ku', city: 'Tokyo', postcode: '103-0027', country: 'JP' },
    ownershipPct: null,
    confidenceScore: 0.94,
    isShell: false,
    source: 'manual',
    createdAt: '2026-04-22T09:00:00Z',
  },
  {
    id: 'entity-nakamura-root',
    applicationId: 'app-nakamura',
    parentEntityId: null,
    legalName: 'Nakamura Electronics KK',
    registrationNumber: '0100-01-112233',
    jurisdiction: 'JP',
    entityType: 'Kabushiki Kaisha',
    registeredAddress: { street: '1-1-2 Otemachi, Chiyoda-ku', city: 'Tokyo', postcode: '100-0004', country: 'JP' },
    ownershipPct: null,
    confidenceScore: 0.99,
    isShell: false,
    source: 'registry',
    createdAt: '2026-01-13T09:00:00Z',
  },
  {
    id: 'entity-ota-root',
    applicationId: 'app-ota',
    parentEntityId: null,
    legalName: 'Ota Robotics KK',
    registrationNumber: '0100-01-445566',
    jurisdiction: 'JP',
    entityType: 'Kabushiki Kaisha',
    registeredAddress: { street: '3-2-3 Marunouchi, Chiyoda-ku', city: 'Tokyo', postcode: '100-0005', country: 'JP' },
    ownershipPct: null,
    confidenceScore: 0.93,
    isShell: false,
    source: 'registry',
    createdAt: '2026-03-04T09:00:00Z',
  },
])

// ---------------------------------------------------------------------------
// UBOs
//   Kaisei: 7 named UBOs (Hiroshi, Yuki, Kenji, plus 4 Tanaka Family Trust
//   beneficiaries treated as separate records per ORIGIN_DESIGN.md §11.2).
//   Named UBO sum ≈ 88%; remaining ~12% = public float (NOT a named UBO record).
//   Background portfolio: 1 UBO per app.
//   Total: 7 + 6 = 13 named UBO records.
// ---------------------------------------------------------------------------

export const seedUBOs: ReadonlyArray<UBO> = Object.freeze([
  // ----- Kaisei -----
  {
    id: 'ubo-kaisei-hiroshi',
    applicationId: 'app-kaisei',
    fullName: 'Hiroshi Kaisei',
    nationality: 'JP',
    dob: '1981-07-12',
    ownershipPct: 42,
    controlType: 'beneficial',
    isPep: false,
    screeningStatus: 'cleared',
    confidenceScore: 0.96,
    createdAt: '2026-04-08T13:50:00Z',
  },
  {
    id: 'ubo-kaisei-yuki',
    applicationId: 'app-kaisei',
    fullName: 'Yuki Kaisei',
    nationality: 'JP',
    dob: '1985-02-03',
    ownershipPct: 18,
    controlType: 'beneficial',
    isPep: false,
    screeningStatus: 'cleared',
    confidenceScore: 0.95,
    createdAt: '2026-04-08T13:51:00Z',
  },
  {
    id: 'ubo-kaisei-kenji',
    applicationId: 'app-kaisei',
    fullName: 'Kenji Morita',
    nationality: 'JP',
    dob: '1968-11-22',
    ownershipPct: 12,
    controlType: 'beneficial via BVI',
    isPep: false,
    screeningStatus: 'cleared',
    confidenceScore: 0.88,
    createdAt: '2026-04-08T13:52:00Z',
  },
  // 4 Tanaka Family Trust beneficiaries — names invented per CONTEXT.md
  // ## Claude's Discretion bullet 7 (Japanese naming conventions).
  {
    id: 'ubo-kaisei-tanaka-1',
    applicationId: 'app-kaisei',
    fullName: 'Aiko Tanaka',
    nationality: 'JP',
    dob: '1975-05-14',
    ownershipPct: 4.5,
    controlType: 'trust beneficiary',
    isPep: false,
    screeningStatus: 'cleared',
    confidenceScore: 0.83,
    createdAt: '2026-04-08T13:53:00Z',
  },
  {
    id: 'ubo-kaisei-tanaka-2',
    applicationId: 'app-kaisei',
    fullName: 'Daichi Tanaka',
    nationality: 'JP',
    dob: '1978-09-30',
    ownershipPct: 4.0,
    controlType: 'trust beneficiary',
    isPep: false,
    screeningStatus: 'cleared',
    confidenceScore: 0.82,
    createdAt: '2026-04-08T13:54:00Z',
  },
  {
    id: 'ubo-kaisei-tanaka-3',
    applicationId: 'app-kaisei',
    fullName: 'Mika Tanaka',
    nationality: 'JP',
    dob: '1982-01-19',
    ownershipPct: 4.0,
    controlType: 'trust beneficiary',
    isPep: false,
    screeningStatus: 'cleared',
    confidenceScore: 0.82,
    createdAt: '2026-04-08T13:55:00Z',
  },
  {
    id: 'ubo-kaisei-tanaka-4',
    applicationId: 'app-kaisei',
    fullName: 'Sho Tanaka',
    nationality: 'JP',
    dob: '1986-08-08',
    ownershipPct: 3.5,
    controlType: 'trust beneficiary',
    isPep: false,
    screeningStatus: 'cleared',
    confidenceScore: 0.81,
    createdAt: '2026-04-08T13:56:00Z',
  },
  // ----- Background portfolio (1 UBO per app) -----
  {
    id: 'ubo-fujiwara-1',
    applicationId: 'app-fujiwara',
    fullName: 'Akira Fujiwara',
    nationality: 'JP',
    dob: '1972-04-09',
    ownershipPct: 65,
    controlType: 'beneficial',
    isPep: false,
    screeningStatus: 'cleared',
    confidenceScore: 0.94,
    createdAt: '2026-03-22T10:00:00Z',
  },
  {
    id: 'ubo-sato-1',
    applicationId: 'app-sato',
    fullName: 'Mei Sato',
    nationality: 'JP',
    dob: '1969-12-01',
    ownershipPct: 55,
    controlType: 'beneficial',
    isPep: true,
    screeningStatus: 'escalated',
    confidenceScore: 0.91,
    createdAt: '2026-03-12T10:00:00Z',
  },
  {
    id: 'ubo-ishikawa-1',
    applicationId: 'app-ishikawa',
    fullName: 'Ren Ishikawa',
    nationality: 'JP',
    dob: '1965-06-18',
    ownershipPct: 70,
    controlType: 'beneficial',
    isPep: false,
    screeningStatus: 'cleared',
    confidenceScore: 0.93,
    createdAt: '2026-03-02T10:00:00Z',
  },
  {
    id: 'ubo-hayashi-1',
    applicationId: 'app-hayashi',
    fullName: 'Sora Hayashi',
    nationality: 'JP',
    dob: '1980-03-25',
    ownershipPct: 80,
    controlType: 'beneficial',
    isPep: false,
    screeningStatus: null,
    confidenceScore: 0.7,
    createdAt: '2026-04-22T10:00:00Z',
  },
  {
    id: 'ubo-nakamura-1',
    applicationId: 'app-nakamura',
    fullName: 'Haruto Nakamura',
    nationality: 'JP',
    dob: '1958-10-04',
    ownershipPct: 48,
    controlType: 'beneficial',
    isPep: false,
    screeningStatus: 'cleared',
    confidenceScore: 0.97,
    createdAt: '2026-01-18T10:00:00Z',
  },
  {
    id: 'ubo-ota-1',
    applicationId: 'app-ota',
    fullName: 'Kaori Ota',
    nationality: 'JP',
    dob: '1974-07-21',
    ownershipPct: 60,
    controlType: 'beneficial',
    isPep: true,
    screeningStatus: 'escalated',
    confidenceScore: 0.89,
    createdAt: '2026-03-08T10:00:00Z',
  },
])

// ---------------------------------------------------------------------------
// Documents — EXACTLY 22 (BOUND-03 acceptance)
//   Kaisei: 16 documents across the 6 entities (status mix per D-49)
//   Background portfolio: 6 documents (1 per app)
// ---------------------------------------------------------------------------

export const seedDocuments: ReadonlyArray<Document> = Object.freeze([
  // ----- Kaisei (16) -----
  // Verified — Stages 1-2 docs (7)
  {
    id: 'doc-kaisei-coi-parent',
    applicationId: 'app-kaisei',
    entityId: 'entity-kaisei-parent',
    docType: 'coi',
    fileUrl: '/mock/docs/kaisei-coi-parent.pdf',
    status: 'verified',
    extractionResult: {
      entityName: 'Kaisei Manufacturing KK',
      registrationNumber: '0100-01-123456',
      dateOfIncorporation: '1962-04-01',
      registeredAddress: '3-1-1 Marunouchi, Chiyoda-ku, Tokyo 100-0005',
      directors: ['Hiroshi Kaisei', 'Yuki Kaisei', 'Tetsuya Mori'],
    },
    uploadedBy: 'client-yuki',
    uploadedAt: '2026-03-26T11:30:00Z',
  },
  {
    id: 'doc-kaisei-moa-parent',
    applicationId: 'app-kaisei',
    entityId: 'entity-kaisei-parent',
    docType: 'moa',
    fileUrl: '/mock/docs/kaisei-moa-parent.pdf',
    status: 'verified',
    extractionResult: {
      objects: 'Manufacturing of precision industrial components and machinery',
      authorisedCapital: 'JPY 5,000,000,000',
      sharesIssued: 50_000_000,
    },
    uploadedBy: 'client-yuki',
    uploadedAt: '2026-03-26T11:35:00Z',
  },
  {
    id: 'doc-kaisei-board-resolution',
    applicationId: 'app-kaisei',
    entityId: 'entity-kaisei-parent',
    docType: 'board_resolution',
    fileUrl: '/mock/docs/kaisei-board-resolution.pdf',
    status: 'verified',
    extractionResult: {
      resolutionDate: '2026-03-20',
      resolutionType: 'Authorisation to open banking facilities with SMBC',
      authorisedSignatories: ['Hiroshi Kaisei (CEO)', 'Yuki Kaisei (Treasurer)'],
    },
    uploadedBy: 'client-yuki',
    uploadedAt: '2026-03-26T11:40:00Z',
  },
  {
    id: 'doc-kaisei-signatory-yuki',
    applicationId: 'app-kaisei',
    entityId: 'entity-kaisei-parent',
    docType: 'signatory_id',
    fileUrl: '/mock/docs/kaisei-signatory-yuki.pdf',
    status: 'verified',
    extractionResult: {
      idType: 'Passport',
      idNumber: 'TR1234567',
      fullName: 'Yuki Kaisei',
      dob: '1985-02-03',
      issuingCountry: 'JP',
      expiry: '2031-02-02',
    },
    uploadedBy: 'client-yuki',
    uploadedAt: '2026-04-02T09:15:00Z',
  },
  {
    id: 'doc-kaisei-signatory-hiroshi',
    applicationId: 'app-kaisei',
    entityId: 'entity-kaisei-parent',
    docType: 'signatory_id',
    fileUrl: '/mock/docs/kaisei-signatory-hiroshi.pdf',
    status: 'verified',
    extractionResult: {
      idType: 'Passport',
      idNumber: 'TR7654321',
      fullName: 'Hiroshi Kaisei',
      dob: '1981-07-12',
      issuingCountry: 'JP',
      expiry: '2029-09-15',
    },
    uploadedBy: 'client-yuki',
    uploadedAt: '2026-04-02T09:20:00Z',
  },
  {
    id: 'doc-kaisei-shareholder-register',
    applicationId: 'app-kaisei',
    entityId: 'entity-kaisei-parent',
    docType: 'shareholder_register',
    fileUrl: '/mock/docs/kaisei-shareholder-register.pdf',
    status: 'verified',
    extractionResult: {
      asOf: '2026-03-31',
      shareholders: [
        { name: 'Hiroshi Kaisei', pct: 42 },
        { name: 'Yuki Kaisei', pct: 18 },
        { name: 'Kenji Morita (via Morita Holdings BVI)', pct: 12 },
        { name: 'Tanaka Family Trust', pct: 16 },
        { name: 'Public float (Tokyo PSE)', pct: 12 },
      ],
    },
    uploadedBy: 'client-yuki',
    uploadedAt: '2026-04-04T10:00:00Z',
  },
  {
    id: 'doc-kaisei-trust-deed',
    applicationId: 'app-kaisei',
    entityId: 'entity-kaisei-parent',
    docType: 'trust_deed',
    fileUrl: '/mock/docs/kaisei-trust-deed.pdf',
    status: 'verified',
    extractionResult: {
      trustName: 'Tanaka Family Trust',
      settledOn: '2009-06-15',
      trustees: ['Tetsuya Mori', 'Kana Watanabe'],
      beneficiaries: ['Aiko Tanaka', 'Daichi Tanaka', 'Mika Tanaka', 'Sho Tanaka'],
      governingLaw: 'Japan',
    },
    uploadedBy: 'client-yuki',
    uploadedAt: '2026-04-04T10:30:00Z',
  },
  // Extracted — Stage 3 in progress (4)
  {
    id: 'doc-kaisei-financials-2024',
    applicationId: 'app-kaisei',
    entityId: 'entity-kaisei-parent',
    docType: 'audited_financials',
    fileUrl: '/mock/docs/kaisei-financials-2024.pdf',
    status: 'extracted',
    extractionResult: {
      fiscalYear: 2024,
      auditor: 'Deloitte Tohmatsu LLC',
      revenue: { jpy: 218_400_000_000, usd: 1_456_000_000 },
      ebitda: { jpy: 38_400_000_000, usd: 256_000_000 },
      netIncome: { jpy: 22_100_000_000, usd: 147_300_000 },
      cashAndEquivalents: { jpy: 41_900_000_000, usd: 279_300_000 },
      totalDebt: { jpy: 28_500_000_000, usd: 190_000_000 },
      auditOpinion: 'Unqualified',
    },
    uploadedBy: 'client-yuki',
    uploadedAt: '2026-04-15T14:20:00Z',
  },
  {
    id: 'doc-kaisei-coi-sg',
    applicationId: 'app-kaisei',
    entityId: 'entity-kaisei-sg',
    docType: 'coi',
    fileUrl: '/mock/docs/kaisei-coi-sg.pdf',
    status: 'extracted',
    extractionResult: {
      entityName: 'Kaisei Asia Pacific Pte Ltd',
      registrationNumber: '202300042K',
      dateOfIncorporation: '2023-01-12',
      registeredAddress: '1 Marina Boulevard, Singapore 018989',
      directors: ['Hiroshi Kaisei', 'Yuki Kaisei', 'Tan Wei Ming'],
    },
    uploadedBy: 'client-yuki',
    uploadedAt: '2026-04-16T09:00:00Z',
  },
  {
    id: 'doc-kaisei-registry-hk',
    applicationId: 'app-kaisei',
    entityId: 'entity-kaisei-hk',
    docType: 'registry_extract',
    fileUrl: '/mock/docs/kaisei-registry-hk.pdf',
    status: 'extracted',
    extractionResult: {
      entityName: 'Kaisei Trading HK Ltd',
      crNumber: '2876543',
      brNumber: '74129630',
      registeredAddress: '2 IFC, 8 Finance Street, Central, Hong Kong',
      directors: ['Hiroshi Kaisei', 'Cheung Ka-Wai'],
      shareCapitalHkd: 1_000_000,
    },
    uploadedBy: 'client-yuki',
    uploadedAt: '2026-04-17T11:30:00Z',
  },
  {
    id: 'doc-kaisei-coi-uk',
    applicationId: 'app-kaisei',
    entityId: 'entity-kaisei-uk',
    docType: 'coi',
    fileUrl: '/mock/docs/kaisei-coi-uk.pdf',
    status: 'extracted',
    extractionResult: {
      entityName: 'Kaisei Europe Ltd',
      companiesHouseNumber: '14872310',
      dateOfIncorporation: '2023-03-21',
      registeredAddress: '20 Fenchurch Street, London EC3M 3BY',
      directors: ['Hiroshi Kaisei', 'Sarah Whitfield'],
    },
    uploadedBy: 'client-yuki',
    uploadedAt: '2026-04-18T08:45:00Z',
  },
  // Extracting — in-progress (2)
  {
    id: 'doc-kaisei-financials-tech',
    applicationId: 'app-kaisei',
    entityId: 'entity-kaisei-tech',
    docType: 'audited_financials',
    fileUrl: '/mock/docs/kaisei-tech-financials.pdf',
    status: 'extracting',
    extractionResult: null,
    uploadedBy: 'client-yuki',
    uploadedAt: '2026-04-25T15:10:00Z',
  },
  {
    id: 'doc-kaisei-board-resolution-tech',
    applicationId: 'app-kaisei',
    entityId: 'entity-kaisei-tech',
    docType: 'board_resolution',
    fileUrl: '/mock/docs/kaisei-tech-board-resolution.pdf',
    status: 'extracting',
    extractionResult: null,
    uploadedBy: 'client-yuki',
    uploadedAt: '2026-04-25T15:15:00Z',
  },
  // Uploaded — still to-process (2)
  {
    id: 'doc-kaisei-mandate-cm',
    applicationId: 'app-kaisei',
    entityId: 'entity-kaisei-parent',
    docType: 'product_mandate',
    fileUrl: '/mock/docs/kaisei-mandate-cm.pdf',
    status: 'uploaded',
    extractionResult: null,
    uploadedBy: 'client-yuki',
    uploadedAt: '2026-04-26T07:00:00Z',
  },
  {
    id: 'doc-kaisei-mandate-tf',
    applicationId: 'app-kaisei',
    entityId: 'entity-kaisei-parent',
    docType: 'product_mandate',
    fileUrl: '/mock/docs/kaisei-mandate-tf.pdf',
    status: 'uploaded',
    extractionResult: null,
    uploadedBy: 'client-yuki',
    uploadedAt: '2026-04-26T07:05:00Z',
  },
  // Rejected — narrative texture (1)
  {
    id: 'doc-kaisei-coi-bvi-rejected',
    applicationId: 'app-kaisei',
    entityId: 'entity-morita-bvi',
    docType: 'coi',
    fileUrl: '/mock/docs/kaisei-bvi-coi-old.pdf',
    status: 'rejected',
    extractionResult: {
      rejectionReason: 'Document expired (issued 2018-04-01); BVI registry requires re-issuance for KYC purposes.',
      issuedAt: '2018-04-01',
    },
    uploadedBy: 'client-yuki',
    uploadedAt: '2026-04-09T10:00:00Z',
  },
  // ----- Background portfolio (6) -----
  {
    id: 'doc-fujiwara-coi',
    applicationId: 'app-fujiwara',
    entityId: 'entity-fujiwara-root',
    docType: 'coi',
    fileUrl: '/mock/docs/fujiwara-coi.pdf',
    status: 'extracted',
    extractionResult: {
      entityName: 'Fujiwara Pharmaceutical Co., Ltd.',
      registrationNumber: '0100-01-334455',
      dateOfIncorporation: '1998-09-12',
    },
    uploadedBy: 'client-fujiwara-admin',
    uploadedAt: '2026-04-10T10:00:00Z',
  },
  {
    id: 'doc-sato-financials',
    applicationId: 'app-sato',
    entityId: 'entity-sato-root',
    docType: 'audited_financials',
    fileUrl: '/mock/docs/sato-financials.pdf',
    status: 'verified',
    extractionResult: { fiscalYear: 2024, auditor: 'KPMG AZSA LLC', auditOpinion: 'Unqualified' },
    uploadedBy: 'client-sato-admin',
    uploadedAt: '2026-04-08T11:00:00Z',
  },
  {
    id: 'doc-ishikawa-credit-app',
    applicationId: 'app-ishikawa',
    entityId: 'entity-ishikawa-root',
    docType: 'credit_application',
    fileUrl: '/mock/docs/ishikawa-credit-app.pdf',
    status: 'verified',
    extractionResult: { facilityRequestedUsd: 12_000_000, purpose: 'Working capital' },
    uploadedBy: 'client-ishikawa-admin',
    uploadedAt: '2026-04-12T13:00:00Z',
  },
  {
    id: 'doc-hayashi-aof',
    applicationId: 'app-hayashi',
    entityId: 'entity-hayashi-root',
    docType: 'account_opening_form',
    fileUrl: '/mock/docs/hayashi-aof.pdf',
    status: 'uploaded',
    extractionResult: null,
    uploadedBy: 'client-hayashi-admin',
    uploadedAt: '2026-04-25T16:00:00Z',
  },
  {
    id: 'doc-nakamura-mandate',
    applicationId: 'app-nakamura',
    entityId: 'entity-nakamura-root',
    docType: 'product_mandate',
    fileUrl: '/mock/docs/nakamura-mandate.pdf',
    status: 'verified',
    extractionResult: { products: ['accounts', 'cash_management', 'fx', 'trade_finance'] },
    uploadedBy: 'client-nakamura-admin',
    uploadedAt: '2026-04-12T09:00:00Z',
  },
  {
    id: 'doc-ota-coi',
    applicationId: 'app-ota',
    entityId: 'entity-ota-root',
    docType: 'coi',
    fileUrl: '/mock/docs/ota-coi.pdf',
    status: 'extracted',
    extractionResult: {
      entityName: 'Ota Robotics KK',
      registrationNumber: '0100-01-445566',
      regulatoryNote: 'Pending METI export-control clarification (regulated end-use).',
    },
    uploadedBy: 'client-ota-admin',
    uploadedAt: '2026-03-25T11:00:00Z',
  },
])

// ---------------------------------------------------------------------------
// ScreeningHits
// ---------------------------------------------------------------------------

export const seedScreeningHits: ReadonlyArray<ScreeningHit> = Object.freeze([
  // Kaisei — 2 cleared + 1 escalated (resolved)
  {
    id: 'hit-kaisei-hiroshi-cleared',
    applicationId: 'app-kaisei',
    subjectType: 'ubo',
    subjectId: 'ubo-kaisei-hiroshi',
    sanctionsHit: false,
    pepHit: false,
    adverseMediaHit: false,
    riskScore: 0.05,
    aiNarrative: 'No matches against OFAC, UN, EU, or Japanese MoF sanctions lists. Adverse-media sweep returned only confirmed corporate-news mentions (Nikkei coverage of FY2024 results). PEP databases clean.',
    disposition: 'cleared',
    dispositionNote: 'Auto-cleared on confidence > 0.95.',
    disposedBy: 'system',
    disposedAt: '2026-04-08T15:00:00Z',
    createdAt: '2026-04-08T14:30:00Z',
  },
  {
    id: 'hit-kaisei-yuki-cleared',
    applicationId: 'app-kaisei',
    subjectType: 'ubo',
    subjectId: 'ubo-kaisei-yuki',
    sanctionsHit: false,
    pepHit: false,
    adverseMediaHit: false,
    riskScore: 0.04,
    aiNarrative: 'Yuki Kaisei screened across all primary sanctions and PEP lists with no matches. Adverse-media noise was business-as-usual coverage of corporate treasury appointments.',
    disposition: 'cleared',
    dispositionNote: 'Auto-cleared.',
    disposedBy: 'system',
    disposedAt: '2026-04-08T15:01:00Z',
    createdAt: '2026-04-08T14:31:00Z',
  },
  {
    id: 'hit-kaisei-morita-escalated-resolved',
    applicationId: 'app-kaisei',
    subjectType: 'entity',
    subjectId: 'entity-morita-bvi',
    sanctionsHit: false,
    pepHit: false,
    adverseMediaHit: true,
    riskScore: 0.42,
    aiNarrative: 'Morita Holdings BVI matched a 2017 adverse-media item referencing a different "Morita Holdings" entity in Macau. Manual review confirmed name collision only — registration numbers, jurisdictions, and beneficial-owner profiles do not match.',
    disposition: 'cleared',
    dispositionNote: 'Name-collision false positive; resolved against beneficial-owner discrepancy.',
    disposedBy: 'rm-james',
    disposedAt: '2026-04-09T10:30:00Z',
    createdAt: '2026-04-08T14:35:00Z',
  },
  // Sato — 1 amber hit per ORIGIN_DESIGN.md §11.3
  {
    id: 'hit-sato-mei-pep',
    applicationId: 'app-sato',
    subjectType: 'ubo',
    subjectId: 'ubo-sato-1',
    sanctionsHit: false,
    pepHit: true,
    adverseMediaHit: false,
    riskScore: 0.58,
    aiNarrative: 'Mei Sato matched a domestic PEP list as the spouse of a former Diet member (Lower House, 2012-2017). Status: family member of a politically exposed person, mid-tier exposure. No adverse-media or sanctions matches.',
    disposition: 'escalated',
    dispositionNote: 'Awaiting compliance review of source of funds for trade-finance facility.',
    disposedBy: null,
    disposedAt: null,
    createdAt: '2026-04-13T09:15:00Z',
  },
  // Ota — escalated (regulatory hold)
  {
    id: 'hit-ota-kaori-pep',
    applicationId: 'app-ota',
    subjectType: 'ubo',
    subjectId: 'ubo-ota-1',
    sanctionsHit: false,
    pepHit: true,
    adverseMediaHit: false,
    riskScore: 0.52,
    aiNarrative: 'Kaori Ota flagged as the daughter of a former METI deputy minister. Application separately on hold pending METI export-control clarification (industrial-automation end-use review).',
    disposition: 'escalated',
    dispositionNote: 'Hold pending METI clarification; PEP status separately documented.',
    disposedBy: null,
    disposedAt: null,
    createdAt: '2026-03-23T11:00:00Z',
  },
])

// ---------------------------------------------------------------------------
// CreditMemos
//   Kaisei: $50M revolver — all 5 sections drafted with prose (D-45).
//   Ishikawa: Stage 5 in progress; 3 sections drafted, 2 sections content: null.
// ---------------------------------------------------------------------------

export const seedCreditMemos: ReadonlyArray<CreditMemo> = Object.freeze([
  {
    id: 'memo-kaisei',
    applicationId: 'app-kaisei',
    facilityAmountUsd: 50_000_000,
    facilityType: 'revolving credit facility',
    tenorMonths: 36,
    sections: {
      exec_summary: {
        content: 'Kaisei Manufacturing KK ("Kaisei") seeks a USD 50,000,000 committed revolving credit facility with a 36-month tenor to support working-capital needs alongside its expansion into Singapore, Hong Kong, and the United Kingdom. Kaisei is a 60-year-old precision-components manufacturer publicly listed on the Tokyo Stock Exchange, with FY2024 revenue of USD 1.46Bn and EBITDA margin of 17.6%. The facility complements paired cash-management and trade-finance products forming a four-product onboarding package. Recommendation: APPROVE on standard pricing.',
        status: 'drafted',
        confidence: 0.91,
      },
      client_overview: {
        content: 'Founded 1962, headquartered in Marunouchi, Tokyo. Listed on TSE Prime since 1996. FY2024 group revenue JPY 218.4Bn (USD 1.46Bn). Four wholly-owned regional subsidiaries (Kaisei Asia Pacific Pte Ltd — Singapore, Kaisei Trading HK Ltd, Kaisei Europe Ltd) plus 80%-owned Kaisei Technology KK. Beneficial ownership concentrated in the Kaisei founding family (60% combined: Hiroshi 42%, Yuki 18%) with Tanaka Family Trust (16%), Morita Holdings BVI (12% via Kaisei Technology), and public float (~12%).',
        status: 'drafted',
        confidence: 0.92,
      },
      financials: {
        content: 'FY2024: revenue USD 1,456M (+8.2% YoY), EBITDA USD 256M (17.6% margin), net income USD 147M. Net debt USD -89M (net cash position). Liquidity: USD 279M cash and equivalents. Coverage ratios strong: interest coverage 14.2x, net debt / EBITDA -0.35x. Capex guidance USD 95M FY2026 (regional fit-out). Audit opinion: unqualified (Deloitte Tohmatsu LLC).',
        status: 'drafted',
        confidence: 0.89,
      },
      risk: {
        content: 'Concentration risk: top 5 customers represent ~32% of FY2024 revenue (automotive OEMs). FX exposure mitigated by USD/JPY natural hedge from regional subsidiary cash flows. Morita Holdings BVI shell warrants enhanced due diligence — name-collision adverse-media item resolved as false positive; underlying ownership lineage (Tanaka Family Trust) cleared. Regulatory: no sanctions or PEP exposure on named UBOs. Trust beneficiaries (4 individuals each <5%) confirmed via signed trust deed (governing law: Japan).',
        status: 'drafted',
        confidence: 0.85,
      },
      recommendation: {
        content: 'APPROVE USD 50M committed revolver, 36-month tenor, SOFR + 110bps, 25bps undrawn fee. Negative pledge over Kaisei Asia Pacific Pte Ltd, joint-and-several guarantee from Kaisei Manufacturing KK and Kaisei Asia Pacific. Standard financial covenants: net debt / EBITDA ≤ 2.5x, interest coverage ≥ 4.0x. Conditional on completion of standard CP and final compliance sign-off on Morita Holdings BVI structure.',
        status: 'drafted',
        confidence: 0.88,
      },
    },
    status: 'drafting',
    draftedAt: '2026-04-22T16:00:00Z',
    approvedAt: null,
    approvedBy: null,
  },
  {
    id: 'memo-ishikawa',
    applicationId: 'app-ishikawa',
    facilityAmountUsd: 12_000_000,
    facilityType: 'term loan',
    tenorMonths: 60,
    sections: {
      exec_summary: {
        content: 'Ishikawa Logistics KK seeks a USD 12,000,000 term loan to finance Singapore warehouse capex and working-capital expansion.',
        status: 'drafted',
        confidence: 0.82,
      },
      client_overview: {
        content: 'Mid-size Japanese logistics firm, founded 1985, single-jurisdiction operator with active Singapore expansion.',
        status: 'drafted',
        confidence: 0.84,
      },
      financials: {
        content: 'FY2024 revenue JPY 28.5Bn, EBITDA margin 11.2%. Leverage modest pre-facility.',
        status: 'drafted',
        confidence: 0.78,
      },
      risk: {
        content: null,
        status: 'drafting',
        confidence: null,
      },
      recommendation: {
        content: null,
        status: 'drafting',
        confidence: null,
      },
    },
    status: 'drafting',
    draftedAt: '2026-04-23T14:00:00Z',
    approvedAt: null,
    approvedBy: null,
  },
])

// ---------------------------------------------------------------------------
// Activities — 18 events spanning all 6 stages with mixed actor types
// ---------------------------------------------------------------------------

export const seedActivities: ReadonlyArray<Activity> = Object.freeze([
  // Kaisei — Stage 1
  {
    id: 'act-kaisei-001',
    applicationId: 'app-kaisei',
    actorType: 'rm',
    actorId: 'rm-james',
    eventType: 'invite_sent',
    payload: { recipient: 'yuki.tanaka@kaisei.co.jp' },
    createdAt: '2026-03-25T08:00:00Z',
  },
  {
    id: 'act-kaisei-002',
    applicationId: 'app-kaisei',
    actorType: 'client',
    actorId: 'client-yuki',
    eventType: 'intake_submitted',
    payload: { jurisdictions: ['SG', 'HK', 'GB'], products: ['accounts', 'cash_management', 'trade_finance', 'credit'] },
    createdAt: '2026-03-26T09:45:00Z',
  },
  // Kaisei — Stage 2 (UBO discovery moment)
  {
    id: 'act-kaisei-003',
    applicationId: 'app-kaisei',
    actorType: 'ai',
    actorId: null,
    eventType: 'entity_discovered',
    payload: { count: 5, source: 'registry' },
    createdAt: '2026-04-04T11:00:00Z',
  },
  {
    id: 'act-kaisei-004',
    applicationId: 'app-kaisei',
    actorType: 'ai',
    actorId: null,
    eventType: 'ubo_discovered',
    payload: { entity: 'entity-morita-bvi', shellUnwrapped: true, beneficiariesFound: 4 },
    createdAt: '2026-04-08T13:45:00Z',
  },
  {
    id: 'act-kaisei-005',
    applicationId: 'app-kaisei',
    actorType: 'rm',
    actorId: 'rm-james',
    eventType: 'structure_approved',
    payload: { entityCount: 6, uboCount: 7 },
    createdAt: '2026-04-08T14:00:00Z',
  },
  // Kaisei — Stage 3 (doc upload bursts)
  {
    id: 'act-kaisei-006',
    applicationId: 'app-kaisei',
    actorType: 'client',
    actorId: 'client-yuki',
    eventType: 'doc_uploaded',
    payload: { docId: 'doc-kaisei-financials-2024', docType: 'audited_financials' },
    createdAt: '2026-04-15T14:20:00Z',
  },
  {
    id: 'act-kaisei-007',
    applicationId: 'app-kaisei',
    actorType: 'ai',
    actorId: null,
    eventType: 'doc_extracted',
    payload: { docId: 'doc-kaisei-financials-2024', confidence: 0.94 },
    createdAt: '2026-04-15T14:24:00Z',
  },
  {
    id: 'act-kaisei-008',
    applicationId: 'app-kaisei',
    actorType: 'client',
    actorId: 'client-yuki',
    eventType: 'doc_uploaded',
    payload: { docId: 'doc-kaisei-coi-sg', docType: 'coi' },
    createdAt: '2026-04-16T09:00:00Z',
  },
  {
    id: 'act-kaisei-009',
    applicationId: 'app-kaisei',
    actorType: 'system',
    actorId: 'system',
    eventType: 'doc_rejected',
    payload: { docId: 'doc-kaisei-coi-bvi-rejected', reason: 'expired' },
    createdAt: '2026-04-09T10:05:00Z',
  },
  // Kaisei — Stage 4 (screening) — pre-emptive activity for completed screening prep
  {
    id: 'act-kaisei-010',
    applicationId: 'app-kaisei',
    actorType: 'ai',
    actorId: null,
    eventType: 'screening_complete',
    payload: { subjectsCleared: 6, escalated: 1 },
    createdAt: '2026-04-09T10:30:00Z',
  },
  // Kaisei — Stage 5 (memo drafting)
  {
    id: 'act-kaisei-011',
    applicationId: 'app-kaisei',
    actorType: 'ai',
    actorId: null,
    eventType: 'memo_section_drafted',
    payload: { memoId: 'memo-kaisei', section: 'exec_summary', confidence: 0.91 },
    createdAt: '2026-04-22T16:00:00Z',
  },
  {
    id: 'act-kaisei-012',
    applicationId: 'app-kaisei',
    actorType: 'ai',
    actorId: null,
    eventType: 'memo_section_drafted',
    payload: { memoId: 'memo-kaisei', section: 'recommendation', confidence: 0.88 },
    createdAt: '2026-04-22T16:08:00Z',
  },
  // Kaisei — Stage 6 (anticipatory)
  {
    id: 'act-kaisei-013',
    applicationId: 'app-kaisei',
    actorType: 'system',
    actorId: 'system',
    eventType: 'activation_pending',
    payload: { stage: 6, blockedBy: ['memo_approval'] },
    createdAt: '2026-04-26T07:00:00Z',
  },
  // Background portfolio events
  {
    id: 'act-fujiwara-001',
    applicationId: 'app-fujiwara',
    actorType: 'ai',
    actorId: null,
    eventType: 'doc_extracted',
    payload: { docId: 'doc-fujiwara-coi', confidence: 0.92 },
    createdAt: '2026-04-10T10:05:00Z',
  },
  {
    id: 'act-sato-001',
    applicationId: 'app-sato',
    actorType: 'ai',
    actorId: null,
    eventType: 'screening_complete',
    payload: { subjectId: 'ubo-sato-1', disposition: 'escalated', reason: 'pep' },
    createdAt: '2026-04-13T09:15:00Z',
  },
  {
    id: 'act-ishikawa-001',
    applicationId: 'app-ishikawa',
    actorType: 'ai',
    actorId: null,
    eventType: 'memo_section_drafted',
    payload: { memoId: 'memo-ishikawa', section: 'exec_summary', confidence: 0.82 },
    createdAt: '2026-04-23T14:00:00Z',
  },
  {
    id: 'act-nakamura-001',
    applicationId: 'app-nakamura',
    actorType: 'rm',
    actorId: 'rm-james',
    eventType: 'application_activated',
    payload: { activatedAt: '2026-04-12T09:30:00Z', products: 4 },
    createdAt: '2026-04-12T09:30:00Z',
  },
  {
    id: 'act-ota-001',
    applicationId: 'app-ota',
    actorType: 'rm',
    actorId: 'rm-james',
    eventType: 'application_held',
    payload: { reason: 'METI export-control clarification pending' },
    createdAt: '2026-03-23T11:30:00Z',
  },
])

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

export const seedProducts: ReadonlyArray<Product> = Object.freeze([
  // Kaisei — 4 products
  {
    id: 'prod-kaisei-accounts',
    applicationId: 'app-kaisei',
    productType: 'accounts',
    config: { jurisdictions: ['SG', 'HK', 'GB'], baseCurrency: 'USD' },
    status: 'submitted',
    createdAt: '2026-04-22T16:30:00Z',
  },
  {
    id: 'prod-kaisei-cash-management',
    applicationId: 'app-kaisei',
    productType: 'cash_management',
    config: { liquidityStructure: 'multi-jurisdiction sweep', notionalUsd: 100_000_000 },
    status: 'submitted',
    createdAt: '2026-04-22T16:32:00Z',
  },
  {
    id: 'prod-kaisei-trade-finance',
    applicationId: 'app-kaisei',
    productType: 'trade_finance',
    config: { lcLimitUsd: 25_000_000, sblcLimitUsd: 10_000_000 },
    status: 'submitted',
    createdAt: '2026-04-22T16:35:00Z',
  },
  {
    id: 'prod-kaisei-credit',
    applicationId: 'app-kaisei',
    productType: 'credit',
    config: { facilityType: 'revolving credit facility', amountUsd: 50_000_000, tenorMonths: 36 },
    status: 'submitted',
    createdAt: '2026-04-22T16:40:00Z',
  },
  // Background portfolio (1 product per app)
  {
    id: 'prod-fujiwara-cm',
    applicationId: 'app-fujiwara',
    productType: 'cash_management',
    config: { liquidityStructure: 'single-jurisdiction sweep' },
    status: 'draft',
    createdAt: '2026-04-10T10:00:00Z',
  },
  {
    id: 'prod-sato-tf',
    applicationId: 'app-sato',
    productType: 'trade_finance',
    config: { lcLimitUsd: 8_000_000 },
    status: 'draft',
    createdAt: '2026-04-08T10:00:00Z',
  },
  {
    id: 'prod-ishikawa-credit',
    applicationId: 'app-ishikawa',
    productType: 'credit',
    config: { facilityType: 'term loan', amountUsd: 12_000_000, tenorMonths: 60 },
    status: 'submitted',
    createdAt: '2026-04-12T13:00:00Z',
  },
  {
    id: 'prod-hayashi-accounts',
    applicationId: 'app-hayashi',
    productType: 'accounts',
    config: { jurisdictions: ['SG'] },
    status: 'draft',
    createdAt: '2026-04-22T08:30:00Z',
  },
  {
    id: 'prod-nakamura-fx',
    applicationId: 'app-nakamura',
    productType: 'fx',
    config: { hedgingProgramUsd: 50_000_000, currencyPairs: ['USD/JPY', 'EUR/JPY', 'GBP/JPY'] },
    status: 'provisioned',
    createdAt: '2026-04-12T09:00:00Z',
  },
  {
    id: 'prod-ota-accounts',
    applicationId: 'app-ota',
    productType: 'accounts',
    config: { jurisdictions: ['SG'] },
    status: 'draft',
    createdAt: '2026-03-08T08:00:00Z',
  },
])

// ---------------------------------------------------------------------------
// Intake tokens — 3 fixtures for IntakeTokenError tests in plan 04 + plan 04 tests
// ---------------------------------------------------------------------------

const HAYASHI_ORG = seedOrganizations.find((o) => o.id === 'org-hayashi')
if (!HAYASHI_ORG) throw new Error('seed integrity: org-hayashi missing for intake token fixtures')
const KAISEI_ORG = seedOrganizations.find((o) => o.id === 'org-kaisei')
if (!KAISEI_ORG) throw new Error('seed integrity: org-kaisei missing for intake token fixtures')
const FUJIWARA_ORG = seedOrganizations.find((o) => o.id === 'org-fujiwara')
if (!FUJIWARA_ORG) throw new Error('seed integrity: org-fujiwara missing for intake token fixtures')

export const seedIntakeTokens: ReadonlyArray<IntakeToken> = Object.freeze([
  {
    token: 'tok-fresh-test-001',
    applicationId: 'app-hayashi',
    organization: HAYASHI_ORG,
    expiresAt: '2026-05-03T00:00:00Z',
    isUsed: false,
  },
  {
    token: 'tok-expired-test-002',
    applicationId: 'app-fujiwara',
    organization: FUJIWARA_ORG,
    expiresAt: '2026-03-01T00:00:00Z',
    isUsed: false,
  },
  {
    token: 'tok-consumed-test-003',
    applicationId: 'app-kaisei',
    organization: KAISEI_ORG,
    expiresAt: '2026-05-15T00:00:00Z',
    isUsed: true,
  },
])

// ---------------------------------------------------------------------------
// demoNewClientTemplate (D-50) — canned enrichment for the Act 3 live flow
// `submitIntake` (plan 04) merges form payload + this template to materialize
// Entity + UBO records for Maritime Robotics Pte Ltd.
// ---------------------------------------------------------------------------

export const demoNewClientTemplate: Readonly<{
  organizationId: string
  entities: ReadonlyArray<Omit<Entity, 'id' | 'applicationId' | 'createdAt'>>
  ubos: ReadonlyArray<Omit<UBO, 'id' | 'applicationId' | 'createdAt'>>
  suggestedDocuments: ReadonlyArray<{ docType: string; description: string }>
  jurisdictionRiskFlags: ReadonlyArray<{ jurisdiction: string; flag: string }>
}> = Object.freeze({
  organizationId: 'org-maritime',
  entities: Object.freeze([
    {
      parentEntityId: null,
      legalName: 'Maritime Robotics Pte Ltd',
      registrationNumber: '202412345W',
      jurisdiction: 'SG',
      entityType: 'Private Limited',
      registeredAddress: { street: '80 Robinson Road', city: 'Singapore', postcode: '068898', country: 'SG' },
      ownershipPct: null,
      confidenceScore: 0.94,
      isShell: false,
      source: 'registry' as const,
    },
    {
      parentEntityId: null, // resolved at runtime by submitIntake to the parent's id
      legalName: 'Maritime Robotics Operations Sdn Bhd',
      registrationNumber: '202401230456',
      jurisdiction: 'MY',
      entityType: 'Sendirian Berhad',
      registeredAddress: { street: 'Level 18, Menara IMC, 8 Jalan Sultan Ismail', city: 'Kuala Lumpur', postcode: '50250', country: 'MY' },
      ownershipPct: 100,
      confidenceScore: 0.9,
      isShell: false,
      source: 'registry' as const,
    },
  ]),
  ubos: Object.freeze([
    {
      fullName: 'Wei Lim',
      nationality: 'SG',
      dob: '1979-11-08',
      ownershipPct: 70,
      controlType: 'beneficial',
      isPep: false,
      screeningStatus: null,
      confidenceScore: 0.92,
    },
    {
      fullName: 'Priya Raman',
      nationality: 'SG',
      dob: '1982-06-22',
      ownershipPct: 30,
      controlType: 'beneficial',
      isPep: false,
      screeningStatus: null,
      confidenceScore: 0.9,
    },
  ]),
  suggestedDocuments: Object.freeze([
    { docType: 'coi', description: 'ACRA Certificate of Incorporation (Singapore parent)' },
    { docType: 'moa', description: 'Constitution / Memorandum of Association' },
    { docType: 'board_resolution', description: 'Board resolution authorising banking relationship' },
    { docType: 'audited_financials', description: 'FY2024 audited financial statements' },
    { docType: 'signatory_id', description: 'Signatory passport / NRIC scans' },
    { docType: 'shareholder_register', description: 'Current shareholder register' },
  ]),
  jurisdictionRiskFlags: Object.freeze([
    { jurisdiction: 'SG', flag: 'low' },
    { jurisdiction: 'MY', flag: 'standard — enhanced due diligence on cross-border transfers' },
  ]),
})
