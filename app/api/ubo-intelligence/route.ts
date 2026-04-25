/**
 * POST /api/ubo-intelligence
 *
 * Streams the UBO structure analysis for an application.
 * Events: status | entity | ubo | analysis | done | error
 *
 * Mock mode: scripted Kaisei tree with realistic delays (no Claude call).
 * Real mode: fetches entities + UBOs from Supabase, Claude writes the narrative.
 */

import { NextRequest } from 'next/server'
import { anthropic, CLAUDE_MODEL, SYSTEM_BASE } from '@/lib/claude'
import { createServiceClient } from '@/lib/supabase'
import { sseResponse, delay } from '@/lib/sse'
import type { Entity, UBO } from '@/types/origin'

export async function POST(req: NextRequest) {
  const { applicationId } = (await req.json()) as { applicationId: string }

  if (!applicationId) {
    return Response.json({ error: 'applicationId required' }, { status: 400 })
  }

  return process.env.NEXT_PUBLIC_USE_MOCK !== 'false'
    ? sseResponse(mockStream())
    : sseResponse(realStream(applicationId))
}

// ---------------------------------------------------------------------------
// Mock stream — scripted Kaisei tree, no external calls
// ---------------------------------------------------------------------------

async function* mockStream() {
  yield* delay({ type: 'status', message: 'Querying Japan corporate registry...' }, 600)

  yield* delay({
    type: 'entity',
    entity: {
      legalName: 'Kaisei Manufacturing KK',
      jurisdiction: 'JP',
      entityType: 'Kabushiki Kaisha',
      isShell: false,
      confidenceScore: 0.99,
      parentEntityId: null,
    },
  }, 400)

  yield* delay({
    type: 'status',
    message: 'Found 4 subsidiary entities. Querying ACRA, Companies Registry HK, Companies House UK...',
  }, 900)

  const subsidiaries = [
    { legalName: 'Kaisei Asia Pacific Pte Ltd', jurisdiction: 'SG', isShell: false, confidenceScore: 0.98 },
    { legalName: 'Kaisei Trading HK Ltd',       jurisdiction: 'HK', isShell: false, confidenceScore: 0.97 },
    { legalName: 'Kaisei Europe Ltd',            jurisdiction: 'UK', isShell: false, confidenceScore: 0.97 },
    { legalName: 'Kaisei Technology KK',         jurisdiction: 'JP', isShell: false, confidenceScore: 0.95 },
  ]

  for (const entity of subsidiaries) {
    yield* delay({ type: 'entity', entity: { ...entity, entityType: 'Subsidiary', parentEntityId: 'kaisei-parent' } }, 350)
  }

  yield* delay({ type: 'status', message: 'Detected holding company in BVI. Unwrapping...' }, 700)

  yield* delay({
    type: 'entity',
    entity: {
      legalName: 'Morita Holdings Ltd',
      jurisdiction: 'VG',
      entityType: 'International Business Company',
      isShell: true,
      confidenceScore: 0.82,
      parentEntityId: 'kaisei-tech',
    },
  }, 500)

  yield* delay({ type: 'status', message: 'Resolving natural persons at top of structure...' }, 600)

  const ubos = [
    { fullName: 'Hiroshi Kaisei', ownershipPct: 42, isPep: false, confidenceScore: 0.97 },
    { fullName: 'Yuki Kaisei',    ownershipPct: 18, isPep: false, confidenceScore: 0.96 },
    { fullName: 'Kenji Morita',   ownershipPct: 12, isPep: false, confidenceScore: 0.85 },
    { fullName: 'Tanaka Haruki',  ownershipPct: 3.5, isPep: false, confidenceScore: 0.78 },
    { fullName: 'Tanaka Michiko', ownershipPct: 3.5, isPep: false, confidenceScore: 0.78 },
  ]

  for (const ubo of ubos) {
    yield* delay({ type: 'ubo', ubo }, 250)
  }

  yield* delay({
    type: 'analysis',
    narrative:
      'Structure analysis complete. I found 6 legal entities across 4 jurisdictions — Japan, Singapore, Hong Kong, and the UK. ' +
      'Morita Holdings (BVI) is a holding entity with no operational substance; it has been flagged as a shell and unwrapped to its beneficial owners. ' +
      '5 natural persons identified at the top of the structure. ' +
      'Kenji Morita (12% via BVI) and the Tanaka Family Trust beneficiaries require additional documentation before UBO verification is complete. ' +
      'Overall structure confidence: 94%.',
  }, 800)

  yield { type: 'done', entityCount: 6, uboCount: 5, confidenceScore: 0.94 }
}

// ---------------------------------------------------------------------------
// Real stream — Supabase + Claude
// ---------------------------------------------------------------------------

async function* realStream(applicationId: string) {
  const db = createServiceClient()

  yield { type: 'status', message: 'Fetching entity structure...' }

  const [{ data: entities, error: entErr }, { data: ubos, error: uboErr }] =
    await Promise.all([
      db.from('entities').select('*').eq('application_id', applicationId).order('created_at'),
      db.from('ubos').select('*').eq('application_id', applicationId).order('ownership_pct', { ascending: false }),
    ])

  if (entErr || uboErr) {
    yield { type: 'error', message: 'Failed to fetch structure data.' }
    return
  }

  // Stream entities back as they're "discovered"
  for (const entity of entities ?? []) {
    yield {
      type: 'entity',
      entity: {
        id: entity.id,
        legalName: entity.legal_name,
        jurisdiction: entity.jurisdiction,
        entityType: entity.entity_type,
        isShell: entity.is_shell,
        confidenceScore: entity.confidence_score,
        parentEntityId: entity.parent_entity_id,
        ownershipPct: entity.ownership_pct,
      } satisfies Partial<Entity>,
    }
    await new Promise((r) => setTimeout(r, 200))
  }

  for (const ubo of ubos ?? []) {
    yield {
      type: 'ubo',
      ubo: {
        id: ubo.id,
        fullName: ubo.full_name,
        ownershipPct: ubo.ownership_pct,
        isPep: ubo.is_pep,
        confidenceScore: ubo.confidence_score,
        screeningStatus: ubo.screening_status,
      } satisfies Partial<UBO>,
    }
    await new Promise((r) => setTimeout(r, 150))
  }

  yield { type: 'status', message: 'Generating structure analysis...' }

  const structureSummary = (entities ?? [])
    .map((e: Record<string, unknown>) => `- ${e['legal_name']} (${e['jurisdiction']}${e['is_shell'] ? ', shell' : ''})`)
    .join('\n')

  const uboSummary = (ubos ?? [])
    .map((u: Record<string, unknown>) => `- ${u['full_name']}: ${u['ownership_pct']}% ownership`)
    .join('\n')

  // Stream Claude narrative with prompt caching on the stable system context
  const stream = anthropic.messages.stream({
    model: CLAUDE_MODEL,
    max_tokens: 400,
    system: [
      {
        type: 'text',
        text: SYSTEM_BASE,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [
      {
        role: 'user',
        content:
          `Provide a concise UBO structure analysis for this corporate group.\n\n` +
          `Entities:\n${structureSummary}\n\n` +
          `Beneficial owners:\n${uboSummary}\n\n` +
          `In 3–4 sentences: summarise the structure, flag any shells or complexity, ` +
          `and note any UBOs that need additional documentation. Be direct and professional.`,
      },
    ],
  })

  let fullAnalysis = ''
  for await (const event of stream) {
    if (
      event.type === 'content_block_delta' &&
      event.delta.type === 'text_delta'
    ) {
      fullAnalysis += event.delta.text
      yield { type: 'analysis_chunk', chunk: event.delta.text }
    }
  }

  yield {
    type: 'done',
    entityCount: (entities ?? []).length,
    uboCount: (ubos ?? []).length,
    analysis: fullAnalysis,
  }
}
