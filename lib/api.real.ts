/**
 * lib/api.real.ts — Real Supabase implementation
 *
 * OWNED: Evan (@evangohAIO). Kit reviews on PR (CODEOWNERS).
 * Must export a default object satisfying OriginAPI (lib/api.ts).
 * All function signatures must match lib/api.mock.ts exactly.
 *
 * Active when NEXT_PUBLIC_USE_MOCK=false.
 */

import { supabase } from '@/lib/supabase'
import { STAGE_NAMES } from '@/types/origin'
import type {
  Application,
  ApplicationDetail,
  CreditMemo,
  Document,
  Entity,
  Organization,
  PortfolioItem,
  Product,
  ScreeningHit,
  Stage,
  StageNumber,
  UBO,
  User,
} from '@/types/origin'
import type { OriginAPI } from './api'

// ---------------------------------------------------------------------------
// Row → domain type mappers
// Supabase returns snake_case; our types use camelCase (D-05).
// ---------------------------------------------------------------------------

function toUser(row: Record<string, unknown>): User {
  return {
    id:          row.id as string,
    role:        row.role as User['role'],
    displayName: row.display_name as string,
    email:       row.email as string,
    avatarUrl:   (row.avatar_url as string | null) ?? null,
    orgId:       (row.org_id as string | null) ?? null,
    createdAt:   row.created_at as string,
    updatedAt:   row.updated_at as string,
  }
}

function toOrganization(row: Record<string, unknown>): Organization {
  return {
    id:              row.id as string,
    legalName:       row.legal_name as string,
    displayName:     row.display_name as string,
    hqJurisdiction: (row.hq_jurisdiction as string | null) ?? null,
    industry:       (row.industry as string | null) ?? null,
    sizeBand:       (row.size_band as string | null) ?? null,
    createdAt:       row.created_at as string,
    updatedAt:       row.updated_at as string,
  }
}

function toApplication(row: Record<string, unknown>): Application {
  return {
    id:                   row.id as string,
    organizationId:       row.organization_id as string,
    rmUserId:             row.rm_user_id as string,
    status:               row.status as Application['status'],
    currentStage:         row.current_stage as Application['currentStage'],
    targetJurisdictions:  row.target_jurisdictions as string[],
    productsRequested:    row.products_requested as Application['productsRequested'],
    openedAt:             row.opened_at as string,
    targetCloseDate:     (row.target_close_date as string | null) ?? null,
    closedAt:            (row.closed_at as string | null) ?? null,
  }
}

function toEntity(row: Record<string, unknown>): Entity {
  return {
    id:                 row.id as string,
    applicationId:      row.application_id as string,
    parentEntityId:    (row.parent_entity_id as string | null) ?? null,
    legalName:          row.legal_name as string,
    registrationNumber:(row.registration_number as string | null) ?? null,
    jurisdiction:      (row.jurisdiction as string | null) ?? null,
    entityType:        (row.entity_type as string | null) ?? null,
    registeredAddress: (row.registered_address as Entity['registeredAddress']) ?? null,
    ownershipPct:      (row.ownership_pct as number | null) ?? null,
    confidenceScore:   (row.confidence_score as number | null) ?? null,
    isShell:            row.is_shell as boolean,
    source:             row.source as Entity['source'],
    createdAt:          row.created_at as string,
  }
}

function toUBO(row: Record<string, unknown>): UBO {
  return {
    id:              row.id as string,
    applicationId:   row.application_id as string,
    fullName:        row.full_name as string,
    nationality:    (row.nationality as string | null) ?? null,
    dob:            (row.dob as string | null) ?? null,
    ownershipPct:   (row.ownership_pct as number | null) ?? null,
    controlType:    (row.control_type as string | null) ?? null,
    isPep:           row.is_pep as boolean,
    screeningStatus:(row.screening_status as string | null) ?? null,
    confidenceScore:(row.confidence_score as number | null) ?? null,
    createdAt:       row.created_at as string,
  }
}

function toDocument(row: Record<string, unknown>): Document {
  return {
    id:               row.id as string,
    applicationId:    row.application_id as string,
    entityId:        (row.entity_id as string | null) ?? null,
    docType:          row.doc_type as Document['docType'],
    fileUrl:         (row.file_url as string | null) ?? null,
    status:           row.status as Document['status'],
    extractionResult:(row.extraction_result as Document['extractionResult']) ?? null,
    uploadedBy:       row.uploaded_by as string,
    uploadedAt:       row.uploaded_at as string,
  }
}

function toScreeningHit(row: Record<string, unknown>): ScreeningHit {
  return {
    id:               row.id as string,
    applicationId:    row.application_id as string,
    subjectType:      row.subject_type as ScreeningHit['subjectType'],
    subjectId:        row.subject_id as string,
    sanctionsHit:     row.sanctions_hit as boolean,
    pepHit:           row.pep_hit as boolean,
    adverseMediaHit:  row.adverse_media_hit as boolean,
    riskScore:       (row.risk_score as number | null) ?? null,
    aiNarrative:     (row.ai_narrative as string | null) ?? null,
    disposition:     (row.disposition as ScreeningHit['disposition']) ?? null,
    dispositionNote: (row.disposition_note as string | null) ?? null,
    disposedBy:      (row.disposed_by as string | null) ?? null,
    disposedAt:      (row.disposed_at as string | null) ?? null,
    createdAt:        row.created_at as string,
  }
}

function toProduct(row: Record<string, unknown>): Product {
  return {
    id:            row.id as string,
    applicationId: row.application_id as string,
    productType:   row.product_type as Product['productType'],
    config:        row.config as Record<string, unknown>,
    status:        row.status as Product['status'],
    createdAt:     row.created_at as string,
  }
}

function toCreditMemo(row: Record<string, unknown>): CreditMemo {
  return {
    id:                 row.id as string,
    applicationId:      row.application_id as string,
    facilityAmountUsd: (row.facility_amount_usd as number | null) ?? null,
    facilityType:      (row.facility_type as string | null) ?? null,
    tenorMonths:       (row.tenor_months as number | null) ?? null,
    sections:           row.sections as CreditMemo['sections'],
    status:             row.status as CreditMemo['status'],
    draftedAt:         (row.drafted_at as string | null) ?? null,
    approvedAt:        (row.approved_at as string | null) ?? null,
    approvedBy:        (row.approved_by as string | null) ?? null,
  }
}

// Derives Stage[] from an Application's currentStage.
// Both mock and real use this same logic — single source of truth here.
export function deriveStages(app: Application): Stage[] {
  return ([1, 2, 3, 4, 5, 6] as StageNumber[]).map((n) => ({
    number: n,
    name: STAGE_NAMES[n],
    status:
      n < app.currentStage ? 'complete'
      : n === app.currentStage ? 'in_progress'
      : 'not_started',
    completedAt: null,   // populated from activities if needed
  }))
}

// ---------------------------------------------------------------------------
// Error helper
// ---------------------------------------------------------------------------

function assertData<T>(
  data: T | null,
  error: unknown,
  context: string,
): T {
  if (error) throw new Error(`[api.real] ${context}: ${String(error)}`)
  if (!data) throw new Error(`[api.real] ${context}: no data returned`)
  return data
}

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

const realAPI: OriginAPI = {
  async getApplication(id) {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('id', id)
      .single()
    return toApplication(assertData(data, error, 'getApplication'))
  },

  async getClientApplication(userId) {
    // Client belongs to an org; find the application for their org
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('org_id')
      .eq('id', userId)
      .single()
    assertData(profile, profileError, 'getClientApplication/profile')

    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('organization_id', profile!.org_id)
      .order('opened_at', { ascending: false })
      .limit(1)
      .single()
    return toApplication(assertData(data, error, 'getClientApplication/application'))
  },

  async getApplicationDetail(id) {
    const [appResult, rmResult, activitiesResult] = await Promise.all([
      supabase
        .from('applications')
        .select('*, organizations(*)')
        .eq('id', id)
        .single(),
      supabase
        .from('applications')
        .select('rm_user_id')
        .eq('id', id)
        .single()
        .then(({ data }: { data: { rm_user_id: string } | null }) =>
          supabase
            .from('profiles')
            .select('*')
            .eq('id', data!.rm_user_id)
            .single()
        ),
      supabase
        .from('activities')
        .select('*')
        .eq('application_id', id)
        .order('created_at', { ascending: false })
        .limit(10),
    ])

    const appRow = assertData(appResult.data, appResult.error, 'getApplicationDetail/app')
    const rmRow  = assertData(rmResult.data,  rmResult.error,  'getApplicationDetail/rm')

    const application = toApplication(appRow as Record<string, unknown>)
    const organization = toOrganization(
      (appRow as Record<string, unknown>).organizations as Record<string, unknown>
    )
    const rm = toUser(rmRow as Record<string, unknown>)
    const stages = deriveStages(application)
    const recentActivities = (activitiesResult.data ?? []).map((row: Record<string, unknown>) => ({
      id:            row.id as string,
      applicationId: row.application_id as string,
      actorType:     row.actor_type as 'client' | 'rm' | 'ai' | 'system',
      actorId:      (row.actor_id as string | null) ?? null,
      eventType:     row.event_type as string,
      payload:       row.payload as Record<string, unknown>,
      createdAt:     row.created_at as string,
    }))

    return { application, organization, rm, stages, recentActivities }
  },

  async getPortfolio(rmUserId) {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        organizations(*),
        entities(count),
        documents(count, status)
      `)
      .eq('rm_user_id', rmUserId)
      .order('opened_at', { ascending: false })

    assertData(data, error, 'getPortfolio')

    return (data ?? []).map((row: Record<string, unknown>): PortfolioItem => {
      const application  = toApplication(row as Record<string, unknown>)
      const organization = toOrganization(
        (row as Record<string, unknown>).organizations as Record<string, unknown>
      )
      const docs = ((row as Record<string, unknown>).documents as Array<{ status: string }>) ?? []

      return {
        application,
        organization,
        entityCount:       ((row as Record<string, unknown>).entities as unknown[])?.length ?? 0,
        documentsTotal:    docs.length,
        documentsVerified: docs.filter((d) => d.status === 'verified').length,
        hasScreeningHits:  false,   // populated separately if needed by cockpit
        eta:               application.targetCloseDate,
      }
    })
  },

  async getEntities(applicationId) {
    const { data, error } = await supabase
      .from('entities')
      .select('*')
      .eq('application_id', applicationId)
      .order('created_at')
    assertData(data, error, 'getEntities')
    return (data ?? []).map((r: Record<string, unknown>) => toEntity(r))
  },

  async getUBOs(applicationId) {
    const { data, error } = await supabase
      .from('ubos')
      .select('*')
      .eq('application_id', applicationId)
      .order('ownership_pct', { ascending: false })
    assertData(data, error, 'getUBOs')
    return (data ?? []).map((r: Record<string, unknown>) => toUBO(r))
  },

  async getDocuments(applicationId) {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('application_id', applicationId)
      .order('uploaded_at', { ascending: false })
    assertData(data, error, 'getDocuments')
    return (data ?? []).map((r: Record<string, unknown>) => toDocument(r))
  },

  async getScreeningHits(applicationId) {
    const { data, error } = await supabase
      .from('screening_results')
      .select('*')
      .eq('application_id', applicationId)
      .order('created_at')
    assertData(data, error, 'getScreeningHits')
    return (data ?? []).map((r: Record<string, unknown>) => toScreeningHit(r))
  },

  async getProducts(applicationId) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('application_id', applicationId)
      .order('created_at')
    assertData(data, error, 'getProducts')
    return (data ?? []).map((r: Record<string, unknown>) => toProduct(r))
  },

  async getCreditMemo(applicationId) {
    const { data, error } = await supabase
      .from('credit_memos')
      .select('*')
      .eq('application_id', applicationId)
      .maybeSingle()
    if (error) throw new Error(`[api.real] getCreditMemo: ${String(error)}`)
    return data ? toCreditMemo(data as Record<string, unknown>) : null
  },
}

export default realAPI
