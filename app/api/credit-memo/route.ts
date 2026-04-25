/**
 * POST /api/credit-memo
 *
 * Drafts a credit memo section by section, streaming progress to the RM.
 * Events: status | section_start | section_chunk | section_done | done | error
 *
 * Mock mode: scripted Kaisei memo content with streaming delays.
 * Real mode: fetches application context, Claude drafts each section in sequence,
 *            persists each section to credit_memos.sections as it completes.
 */

import { NextRequest } from 'next/server'
import { anthropic, CLAUDE_MODEL, SYSTEM_BASE } from '@/lib/claude'
import { createServiceClient } from '@/lib/supabase'
import { sseResponse, delay } from '@/lib/sse'
import type { CreditMemoSections } from '@/types/origin'

export async function POST(req: NextRequest) {
  const { applicationId } = (await req.json()) as { applicationId: string }

  if (!applicationId) {
    return Response.json({ error: 'applicationId required' }, { status: 400 })
  }

  return process.env.NEXT_PUBLIC_USE_MOCK !== 'false'
    ? sseResponse(mockStream())
    : sseResponse(realStream(applicationId))
}

const SECTIONS = [
  'exec_summary',
  'client_overview',
  'financials',
  'risk',
  'recommendation',
] as const

type SectionKey = (typeof SECTIONS)[number]

// ---------------------------------------------------------------------------
// Mock stream — scripted Kaisei memo
// ---------------------------------------------------------------------------

const MOCK_CONTENT: Record<SectionKey, string> = {
  exec_summary:
    'SMBC Singapore recommends approval of a USD 50,000,000 Revolving Credit Facility for ' +
    'Kaisei Manufacturing KK, a leading Japanese automotive components manufacturer with ' +
    'revenue of ¥380B and a 60-year operating history. The facility supports Kaisei\'s ' +
    'expansion into Singapore, Hong Kong, and the UK. Risk is assessed as Low–Medium, ' +
    'underpinned by strong cash generation, conservative leverage, and an established ' +
    'SMBC relationship. Recommended tenor: 36 months.',

  client_overview:
    'Kaisei Manufacturing KK (架星製造株式会社) is a Nagoya-headquartered automotive components ' +
    'manufacturer founded in 1962. The group employs 4,200 staff globally and supplies ' +
    'Tier-1 components to Toyota, Honda, and Stellantis. FY2025 consolidated revenue was ' +
    '¥380B (USD ~2.5B). The group is expanding into three new markets — Singapore (regional HQ), ' +
    'Hong Kong (trading), and the UK (R&D hub) — requiring multi-currency operating accounts, ' +
    'FX hedging, and a revolving working-capital facility. Current banking is exclusively with ' +
    'MUFG (Japan domestic). SMBC Singapore is the lead bank for the international expansion.',

  financials:
    'FY2025 Highlights (consolidated, audited by KPMG Japan):\n' +
    '• Revenue: ¥380.0B (+8.2% YoY)\n' +
    '• EBITDA: ¥42.8B (margin: 11.3%)\n' +
    '• Net Income: ¥21.3B\n' +
    '• Total Assets: ¥520.0B\n' +
    '• Total Debt: ¥95.0B | Net Debt: ¥72.4B\n' +
    '• Net Debt / EBITDA: 1.7x (covenant threshold: 3.5x)\n' +
    '• Interest Coverage: 8.2x\n' +
    '• Free Cash Flow: ¥18.7B\n\n' +
    'Financial performance is consistent and improving. Leverage is conservative. ' +
    'The group has maintained a dividend payout ratio of ~35% over the past five years, ' +
    'demonstrating capital discipline. No material off-balance-sheet exposures identified.',

  risk:
    'Risk Rating: BB+ (Low–Medium)\n\n' +
    'Key Risks:\n' +
    '1. FX Exposure — 60% of revenue in JPY vs. multi-currency cost base. ' +
    'Mitigated by proposed FX hedging programme.\n' +
    '2. Customer Concentration — Top 3 customers represent ~45% of revenue. ' +
    'Partially mitigated by long-term supply agreements (avg. 7-year tenure).\n' +
    '3. BVI Holding Structure (Morita Holdings) — 20% of Kaisei Technology KK ' +
    'held via a BVI entity. UBO verification for Kenji Morita is in progress; ' +
    '1 adverse media hit (2019, tax restructuring article) under RM review. ' +
    'Not a sanctions match. Recommend clearing before drawdown.\n' +
    '4. New Market Execution Risk — First APAC/EMEA expansion; no track record ' +
    'in target jurisdictions. Mitigated by experienced management team.',

  recommendation:
    'APPROVE subject to:\n' +
    '1. Completion of UBO verification for Kenji Morita (Morita Holdings BVI)\n' +
    '2. Execution of ISDA Master Agreement for FX programme\n' +
    '3. Receipt of FY2025 audited consolidated financial statements\n\n' +
    'Facility Terms:\n' +
    '• Type: Revolving Credit Facility\n' +
    '• Amount: USD 50,000,000\n' +
    '• Tenor: 36 months (with annual review)\n' +
    '• Pricing: SOFR + 185bps\n' +
    '• Financial Covenant: Net Debt/EBITDA ≤ 3.5x (tested semi-annually)\n' +
    '• Governing Law: Singapore\n\n' +
    'Prepared by: James Lee, Senior RM, Japanese Corporates Desk',
}

async function* mockStream() {
  yield* delay({ type: 'status', message: 'Gathering application data...' }, 600)

  for (const section of SECTIONS) {
    yield* delay({ type: 'section_start', section }, 400)

    const content = MOCK_CONTENT[section]
    const words = content.split(' ')
    const chunkSize = 6

    for (let i = 0; i < words.length; i += chunkSize) {
      const chunk = words.slice(i, i + chunkSize).join(' ') + (i + chunkSize < words.length ? ' ' : '')
      yield* delay({ type: 'section_chunk', section, chunk }, 80)
    }

    yield* delay({
      type: 'section_done',
      section,
      content,
      confidence: section === 'risk' ? 0.82 : 0.91,
    }, 300)
  }

  yield { type: 'done', sectionsCompleted: SECTIONS.length }
}

// ---------------------------------------------------------------------------
// Real stream — Supabase context + Claude
// ---------------------------------------------------------------------------

const SECTION_PROMPTS: Record<SectionKey, string> = {
  exec_summary:
    'Write the Executive Summary section of a credit memo. 3–4 sentences. ' +
    'Cover: client name, facility amount and type, recommendation, and risk rating.',

  client_overview:
    'Write the Client Overview section. Cover: business description, founding year, ' +
    'revenue, headcount, banking relationship history, and the purpose of this facility.',

  financials:
    'Write the Financial Analysis section. Use the financial data provided. ' +
    'Include key ratios: Net Debt/EBITDA, Interest Coverage, FCF. ' +
    'Comment on trend and covenant headroom.',

  risk:
    'Write the Risk Assessment section. List the top 4 risks with mitigants. ' +
    'Include the risk rating (BB+ Low–Medium). Note any open KYC/screening items.',

  recommendation:
    'Write the Recommendation section. State approval conditions, proposed facility terms ' +
    '(type, amount, tenor, pricing, covenants, governing law), and the preparing RM.',
}

async function* realStream(applicationId: string) {
  const db = createServiceClient()

  yield { type: 'status', message: 'Gathering application data...' }

  // Fetch everything needed for the memo
  const [
    { data: app },
    { data: entities },
    { data: ubos },
    { data: screening },
    { data: docs },
    { data: existingMemo },
  ] = await Promise.all([
    db.from('applications').select('*, organizations(*)').eq('id', applicationId).single(),
    db.from('entities').select('*').eq('application_id', applicationId),
    db.from('ubos').select('*').eq('application_id', applicationId),
    db.from('screening_results').select('*').eq('application_id', applicationId),
    db.from('documents').select('doc_type, extraction_result, status').eq('application_id', applicationId),
    db.from('credit_memos').select('id').eq('application_id', applicationId).maybeSingle(),
  ])

  if (!app) {
    yield { type: 'error', message: 'Application not found.' }
    return
  }

  // Upsert credit memo record
  const { data: memo } = await db
    .from('credit_memos')
    .upsert(
      {
        id: existingMemo?.id,
        application_id: applicationId,
        facility_amount_usd: 50_000_000,
        facility_type: 'revolving_credit_facility',
        tenor_months: 36,
        status: 'drafting',
        sections: Object.fromEntries(
          SECTIONS.map((s) => [s, { content: null, status: 'drafting', confidence: null }]),
        ),
      },
      { onConflict: 'application_id' },
    )
    .select('id')
    .single()

  // Build shared context block — cached across the 5 section calls
  const org = (app as Record<string, unknown>).organizations as Record<string, string>
  const contextBlock =
    `Client: ${org?.legal_name ?? 'Unknown'} | Jurisdiction: ${org?.hq_jurisdiction ?? '?'}\n` +
    `Revenue: see financials | Products: ${(app.products_requested as string[]).join(', ')}\n` +
    `Entities: ${(entities ?? []).map((e) => `${e.legal_name} (${e.jurisdiction})`).join(', ')}\n` +
    `UBOs: ${(ubos ?? []).map((u) => `${u.full_name} ${u.ownership_pct}%`).join(', ')}\n` +
    `Screening: ${(screening ?? []).map((s) => `${s.disposition ?? 'pending'} risk=${s.risk_score}`).join(', ')}\n` +
    `Extracted financials: ${JSON.stringify(
      docs?.find((d) => d.doc_type === 'audited_financials')?.extraction_result ?? {},
    )}`

  const completedSections: Partial<CreditMemoSections> = {}

  for (const section of SECTIONS) {
    yield { type: 'section_start', section }

    let sectionContent = ''

    const sectionStream = anthropic.messages.stream({
      model: CLAUDE_MODEL,
      max_tokens: 600,
      system: [
        {
          type: 'text',
          text: SYSTEM_BASE + '\nYou are writing a formal bank credit memo. Be precise and professional.',
          cache_control: { type: 'ephemeral' },
        },
        {
          type: 'text',
          text: contextBlock,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [
        {
          role: 'user',
          content: SECTION_PROMPTS[section],
        },
      ],
    })

    for await (const event of sectionStream) {
      if (
        event.type === 'content_block_delta' &&
        event.delta.type === 'text_delta'
      ) {
        sectionContent += event.delta.text
        yield { type: 'section_chunk', section, chunk: event.delta.text }
      }
    }

    const confidence = section === 'financials' && !docs?.find((d) => d.doc_type === 'audited_financials')?.extraction_result
      ? 0.65   // lower confidence if financials aren't extracted yet
      : 0.88

    completedSections[section] = {
      content: sectionContent,
      status: 'drafted',
      confidence,
    }

    // Persist this section immediately
    await db
      .from('credit_memos')
      .update({
        sections: {
          ...Object.fromEntries(
            SECTIONS.map((s) => [
              s,
              completedSections[s] ?? { content: null, status: 'drafting', confidence: null },
            ]),
          ),
        },
      })
      .eq('id', memo!.id)

    yield { type: 'section_done', section, content: sectionContent, confidence }
  }

  await db
    .from('credit_memos')
    .update({ status: 'drafted', drafted_at: new Date().toISOString() })
    .eq('id', memo!.id)

  yield { type: 'done', sectionsCompleted: SECTIONS.length }
}
