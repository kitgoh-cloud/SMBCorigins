/**
 * lib/sse.ts — Server-Sent Events helpers for streaming API routes
 * Used by all four AI hero moment routes.
 */

const encoder = new TextEncoder()

/** Wraps an async generator into an SSE Response. */
export function sseResponse(
  generator: AsyncGenerator<Record<string, unknown>>,
): Response {
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of generator) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(event)}\n\n`),
          )
        }
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

/** Emits a single SSE event and waits `ms` milliseconds — used in mock generators. */
export async function* delay<T extends Record<string, unknown>>(
  event: T,
  ms: number,
): AsyncGenerator<T> {
  await new Promise((r) => setTimeout(r, ms))
  yield event
}
