/**
 * POST /api/copilot
 *
 * RM Copilot — conversational Claude endpoint with Supabase context injection.
 * Streams text chunks back to the sidecar UI.
 *
 * Always uses Claude (even in mock mode — this is the live AI hero moment).
 * Application context is fetched server-side and injected as a cached system prompt.
 */

import { NextRequest } from 'next/server'
import { anthropic, CLAUDE_MODEL, SYSTEM_BASE } from '@/lib/claude'
import { createServiceClient } from '@/lib/supabase'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export async function POST(req: NextRequest) {
  const { messages, applicationId } = (await req.json()) as {
    messages: Message[]
    applicationId: string
  }

  if (!messages?.length || !applicationId) {
    return Response.json(
      { error: 'messages and applicationId required' },
      { status: 400 },
    )
  }

  const context = await buildApplicationContext(applicationId)

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = anthropic.messages.stream({
          model: CLAUDE_MODEL,
          max_tokens: 1024,
          system: [
            // Stable base — cached across requests
            {
              type: 'text',
              text: SYSTEM_BASE,
              cache_control: { type: 'ephemeral' },
            },
            // Per-application context — cached while the RM works on this application
            {
              type: 'text',
              text: context,
              cache_control: { type: 'ephemeral' },
            },
          ],
          messages,
        })

        for await (const event of response) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: 'chunk', text: event.delta.text })}\n\n`,
              ),
            )
          }
        }

        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`),
        )
      } catch (err) {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: 'error', message: String(err) })}\n\n`,
          ),
        )
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}

// ---------------------------------------------------------------------------
// Context builder — fetches application snapshot for the system prompt
// ---------------------------------------------------------------------------

async function buildApplicationContext(applicationId: string): Promise<string> {
  const db = createServiceClient()

  const [
    { data: app },
    { data: org },
    { data: entities },
    { data: ubos },
    { data: screening },
    { data: activities },
  ] = await Promise.all([
    db.from('applications').select('*, profiles(display_name, email)').eq('id', applicationId).single(),
    db
      .from('applications')
      .select('organization_id')
      .eq('id', applicationId)
      .single()
      .then(({ data }: { data: { organization_id: string } | null }) =>
        db.from('organizations').select('*').eq('id', data?.organization_id).single(),
      ),
    db.from('entities').select('legal_name, jurisdiction, is_shell, confidence_score').eq('application_id', applicationId),
    db.from('ubos').select('full_name, ownership_pct, is_pep, screening_status').eq('application_id', applicationId),
    db.from('screening_results').select('subject_type, sanctions_hit, pep_hit, adverse_media_hit, risk_score, disposition, ai_narrative').eq('application_id', applicationId),
    db.from('activities').select('actor_type, event_type, payload, created_at').eq('application_id', applicationId).order('created_at', { ascending: false }).limit(10),
  ])

  const lines: string[] = [
    `## Application Context`,
    `Application ID: ${applicationId}`,
    `Client: ${org?.legal_name ?? 'Unknown'} (${org?.hq_jurisdiction ?? '?'})`,
    `Status: ${app?.status ?? '?'}, Stage ${app?.current_stage ?? '?'}/6`,
    `Products: ${(app?.products_requested ?? []).join(', ')}`,
    `Jurisdictions: ${(app?.target_jurisdictions ?? []).join(', ')}`,
    ``,
    `## Corporate Structure`,
    ...(entities ?? []).map(
      (e: Record<string, unknown>) => `- ${e.legal_name} (${e.jurisdiction})${e.is_shell ? ' [SHELL]' : ''}`,
    ),
    ``,
    `## Beneficial Owners`,
    ...(ubos ?? []).map(
      (u: Record<string, unknown>) =>
        `- ${u.full_name}: ${u.ownership_pct}%${u.is_pep ? ' [PEP]' : ''} — screening: ${(u.screening_status as string | null) ?? 'pending'}`,
    ),
    ``,
    `## Screening Summary`,
    ...(screening ?? []).map(
      (s: Record<string, unknown>) =>
        `- ${s.subject_type} ${s.sanctions_hit ? '[SANCTIONS HIT]' : ''} ${s.adverse_media_hit ? '[ADVERSE MEDIA]' : ''} risk: ${(s.risk_score as number | null)?.toFixed(2) ?? '?'} — ${(s.disposition as string | null) ?? 'pending'}`,
    ),
    ``,
    `## Recent Activity`,
    ...(activities ?? []).map(
      (a: Record<string, unknown>) => `- [${a.actor_type}] ${a.event_type}: ${JSON.stringify(a.payload)}`,
    ),
  ]

  return lines.join('\n')
}
