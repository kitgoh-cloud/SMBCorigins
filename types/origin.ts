/**
 * types/origin.ts — Cross-GSD shared boundary types
 *
 * CO-OWNED: Kit (@kitgoh-cloud) + Evan (@evangohAIO)
 * Every change requires a cross-review PR — see CONTRACT.md and .github/CODEOWNERS.
 * Never edit this file without telling the other person (CLAUDE.md working principles).
 * Type changes are breaking changes by default — author migrates their side, reviewer migrates theirs.
 *
 * These 8 exports (Application, Entity, UBO, Document, ScreeningHit, CreditMemo, Stage, User)
 * satisfy BOUND-01. Both lib/api.mock.ts and lib/api.real.ts must return objects matching
 * these shapes exactly.
 */

// ---------------------------------------------------------------------------
// Primitive enums — mirrored from the Supabase postgres enums in migration 001
// ---------------------------------------------------------------------------

export type UserRole = 'rm' | 'client_admin' | 'client_user'

export type ApplicationStatus =
  | 'invited'
  | 'in_progress'
  | 'in_review'
  | 'approved'
  | 'activated'
  | 'on_hold'

export type EntitySource = 'registry' | 'document' | 'manual'

export type DocumentStatus =
  | 'uploaded'
  | 'extracting'
  | 'extracted'
  | 'verified'
  | 'rejected'

export type ScreeningSubjectType = 'entity' | 'ubo'

export type ScreeningDisposition = 'cleared' | 'escalated' | 'blocked'

export type ProductStatus = 'draft' | 'submitted' | 'approved' | 'provisioned'

export type CreditMemoStatus = 'drafting' | 'drafted' | 'reviewed' | 'approved'

export type ActorType = 'client' | 'rm' | 'ai' | 'system'

export type StageNumber = 1 | 2 | 3 | 4 | 5 | 6

export type StageStatus = 'not_started' | 'in_progress' | 'complete' | 'blocked'

// ---------------------------------------------------------------------------
// 1. User  (profile row — extends auth.users)
// ---------------------------------------------------------------------------

export interface User {
  id: string
  role: UserRole
  displayName: string
  email: string
  avatarUrl: string | null
  orgId: string | null
  createdAt: string
  updatedAt: string
}

// ---------------------------------------------------------------------------
// 2. Application  (one onboarding case)
// ---------------------------------------------------------------------------

export interface Application {
  id: string
  organizationId: string
  rmUserId: string
  status: ApplicationStatus
  currentStage: StageNumber
  targetJurisdictions: string[]
  productsRequested: ProductType[]
  openedAt: string
  targetCloseDate: string | null
  closedAt: string | null
}

// Allowed product codes — kept in sync with DB `products_requested` text[] convention
export type ProductType =
  | 'accounts'
  | 'cash_management'
  | 'fx'
  | 'trade_finance'
  | 'credit'

// ---------------------------------------------------------------------------
// 3. Entity  (legal entity in the corporate tree)
// ---------------------------------------------------------------------------

export interface Entity {
  id: string
  applicationId: string
  parentEntityId: string | null
  legalName: string
  registrationNumber: string | null
  jurisdiction: string | null
  entityType: string | null
  registeredAddress: EntityAddress | null
  ownershipPct: number | null
  confidenceScore: number | null    // 0–1
  isShell: boolean
  source: EntitySource
  createdAt: string
}

export interface EntityAddress {
  street?: string
  city?: string
  postcode?: string
  country: string
}

// ---------------------------------------------------------------------------
// 4. UBO  (natural person at the top of the structure)
// ---------------------------------------------------------------------------

export interface UBO {
  id: string
  applicationId: string
  fullName: string
  nationality: string | null
  dob: string | null                // ISO date string YYYY-MM-DD
  ownershipPct: number | null
  controlType: string | null
  isPep: boolean
  screeningStatus: string | null
  confidenceScore: number | null    // 0–1
  createdAt: string
}

// ---------------------------------------------------------------------------
// 5. Document  (upload + AI extraction result)
// ---------------------------------------------------------------------------

export interface Document {
  id: string
  applicationId: string
  entityId: string | null
  docType: DocumentType
  fileUrl: string | null
  status: DocumentStatus
  extractionResult: DocumentExtraction | null
  uploadedBy: string
  uploadedAt: string
}

// Known document type codes — extensible, non-exhaustive
export type DocumentType =
  | 'coi'
  | 'moa'
  | 'board_resolution'
  | 'audited_financials'
  | 'signatory_id'
  | 'shareholder_register'
  | 'registry_extract'
  | 'trust_deed'
  | 'product_mandate'
  | 'credit_application'
  | 'account_opening_form'
  | (string & {})              // allow future types without exhaustive union errors

// Flexible extraction payload — varies by doc_type
export type DocumentExtraction = Record<string, unknown>

// ---------------------------------------------------------------------------
// 6. ScreeningHit  (KYC / AML result per subject)
// ---------------------------------------------------------------------------

export interface ScreeningHit {
  id: string
  applicationId: string
  subjectType: ScreeningSubjectType
  subjectId: string
  sanctionsHit: boolean
  pepHit: boolean
  adverseMediaHit: boolean
  riskScore: number | null          // 0–1
  aiNarrative: string | null
  disposition: ScreeningDisposition | null
  dispositionNote: string | null
  disposedBy: string | null
  disposedAt: string | null
  createdAt: string
}

// ---------------------------------------------------------------------------
// 7. Stage  (derived view of an application's 6-stage journey)
//    Not a DB table — computed from Application.currentStage.
//    Stage names and deriveStages() live in lib/stages.ts (Kit-owned).
// ---------------------------------------------------------------------------

export interface Stage {
  number: StageNumber
  name: string
  status: StageStatus
  completedAt: string | null
}

// ---------------------------------------------------------------------------
// 8. CreditMemo
// ---------------------------------------------------------------------------

export interface CreditMemoSection {
  content: string | null
  status: 'drafting' | 'drafted'
  confidence: number | null         // 0–1
}

export interface CreditMemo {
  id: string
  applicationId: string
  facilityAmountUsd: number | null
  facilityType: string | null
  tenorMonths: number | null
  sections: CreditMemoSections
  status: CreditMemoStatus
  draftedAt: string | null
  approvedAt: string | null
  approvedBy: string | null
}

export interface CreditMemoSections {
  exec_summary: CreditMemoSection
  client_overview: CreditMemoSection
  financials: CreditMemoSection
  risk: CreditMemoSection
  recommendation: CreditMemoSection
}

// ---------------------------------------------------------------------------
// Supporting types — used by both mock and real implementations
// (not in the BOUND-01 required 8, but both api.mock.ts and api.real.ts need them)
// ---------------------------------------------------------------------------

export interface Organization {
  id: string
  legalName: string
  displayName: string
  hqJurisdiction: string | null
  industry: string | null
  sizeBand: string | null
  createdAt: string
  updatedAt: string
}

export interface Product {
  id: string
  applicationId: string
  productType: ProductType
  config: Record<string, unknown>
  status: ProductStatus
  createdAt: string
}

export interface Activity {
  id: string
  applicationId: string
  actorType: ActorType
  actorId: string | null
  eventType: string
  payload: Record<string, unknown>
  createdAt: string
}

// ---------------------------------------------------------------------------
// Composite views — what the API returns for dashboard screens
// (avoids N+1 calls from components)
// ---------------------------------------------------------------------------

/** Full picture of one application — used by both heartbeat screens */
export interface ApplicationDetail {
  application: Application
  organization: Organization
  rm: User
  stages: Stage[]
  recentActivities: Activity[]
}

/** One row in the RM portfolio kanban */
export interface PortfolioItem {
  application: Application
  organization: Organization
  entityCount: number
  documentsTotal: number
  documentsVerified: number
  hasScreeningHits: boolean
  eta: string | null               // ISO date — target_close_date
}
