/**
 * POST /api/doc-extraction
 *
 * Streams field extraction for an uploaded document.
 * Events: status | field | inconsistency | done | error
 *
 * Mock mode: scripted field population with delays per doc_type.
 * Real mode: fetches document from Supabase, Claude extracts fields,
 *            updates documents.extraction_result on completion.
 */

import { NextRequest } from 'next/server'
import { anthropic, CLAUDE_MODEL, SYSTEM_BASE } from '@/lib/claude'
import { createServiceClient } from '@/lib/supabase'
import { sseResponse, delay } from '@/lib/sse'

export async function POST(req: NextRequest) {
  const { documentId, applicationId } = (await req.json()) as {
    documentId: string
    applicationId: string
  }

  if (!documentId) {
    return Response.json({ error: 'documentId required' }, { status: 400 })
  }

  return process.env.NEXT_PUBLIC_USE_MOCK !== 'false'
    ? sseResponse(mockStream(documentId))
    : sseResponse(realStream(documentId, applicationId))
}

// ---------------------------------------------------------------------------
// Mock stream — pre-scripted extractions keyed by doc_type patterns
// ---------------------------------------------------------------------------

const MOCK_EXTRACTIONS: Record<string, Array<{ field: string; value: string; confidence: number }>> = {
  coi: [
    { field: 'entity_name',        value: 'Kaisei Manufacturing KK',        confidence: 0.99 },
    { field: 'registration_number',value: '0123-01-012345',                  confidence: 0.98 },
    { field: 'date_of_incorporation',value: '1 April 1962',                  confidence: 0.97 },
    { field: 'registered_address', value: '1-1 Kaisei-cho, Nagoya 460-0001', confidence: 0.95 },
    { field: 'company_type',       value: 'Kabushiki Kaisha',                confidence: 0.99 },
  ],
  moa: [
    { field: 'directors',     value: 'Hiroshi Kaisei, Satoru Yamamoto, Akiko Sato', confidence: 0.96 },
    { field: 'share_capital', value: 'JPY 5,000,000,000',                           confidence: 0.97 },
    { field: 'objects',       value: 'Manufacture and sale of automotive components', confidence: 0.91 },
  ],
  audited_financials: [
    { field: 'revenue_jpy',   value: '¥380,000,000,000',  confidence: 0.98 },
    { field: 'ebitda_jpy',    value: '¥42,800,000,000',   confidence: 0.95 },
    { field: 'net_income_jpy',value: '¥21,300,000,000',   confidence: 0.95 },
    { field: 'total_assets',  value: '¥520,000,000,000',  confidence: 0.96 },
    { field: 'total_debt',    value: '¥95,000,000,000',   confidence: 0.94 },
    { field: 'fiscal_year',   value: 'FY2025 (ended March 2026)', confidence: 0.99 },
  ],
  signatory_id: [
    { field: 'full_name',   value: 'Hiroshi Kaisei',  confidence: 0.99 },
    { field: 'doc_type',    value: 'Passport',         confidence: 0.99 },
    { field: 'doc_number',  value: 'TK1234567',        confidence: 0.98 },
    { field: 'nationality', value: 'Japanese',         confidence: 0.99 },
    { field: 'expiry',      value: '14 March 2030',   confidence: 0.97 },
  ],
}

const MOCK_INCONSISTENCIES: Record<string, string[]> = {
  moa: ['Registered address in this document differs from ACRA record — please clarify.'],
  audited_financials: [],
}

async function* mockStream(documentId: string) {
  // Determine doc type from ID pattern for mock — default to coi
  const docTypeKey = documentId.includes('financials')
    ? 'audited_financials'
    : documentId.includes('signatory') || documentId.includes('passport')
    ? 'signatory_id'
    : documentId.includes('moa')
    ? 'moa'
    : 'coi'

  yield* delay({ type: 'status', message: 'Reading document...' }, 500)
  yield* delay({ type: 'status', message: 'Identifying document type...' }, 400)
  yield* delay({ type: 'status', message: `Detected: ${docTypeKey.replace('_', ' ').toUpperCase()}. Extracting fields...` }, 300)

  const fields = MOCK_EXTRACTIONS[docTypeKey] ?? MOCK_EXTRACTIONS.coi
  for (const f of fields) {
    yield* delay({ type: 'field', field: f.field, value: f.value, confidence: f.confidence }, 280)
  }

  const inconsistencies = MOCK_INCONSISTENCIES[docTypeKey] ?? []
  for (const msg of inconsistencies) {
    yield* delay({ type: 'inconsistency', message: msg }, 400)
  }

  yield {
    type: 'done',
    fieldCount: fields.length,
    inconsistencyCount: inconsistencies.length,
  }
}

// ---------------------------------------------------------------------------
// Real stream — Supabase + Claude
// ---------------------------------------------------------------------------

async function* realStream(documentId: string, applicationId: string) {
  const db = createServiceClient()

  yield { type: 'status', message: 'Fetching document...' }

  const { data: doc, error } = await db
    .from('documents')
    .select('*')
    .eq('id', documentId)
    .single()

  if (error || !doc) {
    yield { type: 'error', message: 'Document not found.' }
    return
  }

  // Mark as extracting
  await db
    .from('documents')
    .update({ status: 'extracting' })
    .eq('id', documentId)

  yield { type: 'status', message: `Reading ${doc.doc_type.replace('_', ' ')}...` }

  // In production this would fetch the actual file from Supabase Storage and pass
  // it to Claude. For v1 prototype we pass metadata and ask Claude to simulate extraction.
  const stream = anthropic.messages.stream({
    model: CLAUDE_MODEL,
    max_tokens: 600,
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
          `Extract structured fields from a ${doc.doc_type} document for ${applicationId}.\n` +
          `Return a JSON object with field names as keys and extracted values as strings.\n` +
          `Also return an "inconsistencies" array of any data conflicts found.\n` +
          `Format: { "fields": { "field_name": "value" }, "inconsistencies": ["..."] }\n` +
          `Respond with JSON only.`,
      },
    ],
  })

  let raw = ''
  for await (const event of stream) {
    if (
      event.type === 'content_block_delta' &&
      event.delta.type === 'text_delta'
    ) {
      raw += event.delta.text
    }
  }

  let parsed: { fields: Record<string, string>; inconsistencies: string[] } = {
    fields: {},
    inconsistencies: [],
  }

  try {
    parsed = JSON.parse(raw.trim())
  } catch {
    yield { type: 'error', message: 'Could not parse extraction result.' }
    return
  }

  for (const [field, value] of Object.entries(parsed.fields)) {
    yield { type: 'field', field, value, confidence: 0.9 }
    await new Promise((r) => setTimeout(r, 150))
  }

  for (const msg of parsed.inconsistencies) {
    yield { type: 'inconsistency', message: msg }
  }

  // Persist extraction result and update status
  await db
    .from('documents')
    .update({ extraction_result: parsed.fields, status: 'extracted' })
    .eq('id', documentId)

  yield {
    type: 'done',
    fieldCount: Object.keys(parsed.fields).length,
    inconsistencyCount: parsed.inconsistencies.length,
  }
}
