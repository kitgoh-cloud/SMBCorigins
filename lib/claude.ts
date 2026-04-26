import Anthropic from '@anthropic-ai/sdk'

let _client: Anthropic | null = null

// Lazy singleton — instantiated on first call, not at module load.
// Prevents crashes when ANTHROPIC_API_KEY is absent (e.g., mock-only CI).
export function getAnthropic(): Anthropic {
  if (!_client) {
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  }
  return _client
}

// Default model for all hero moment routes.
// claude-sonnet-4-6 balances capability and latency for streaming responses.
export const CLAUDE_MODEL = 'claude-sonnet-4-6' as const

// Shared system prompt context injected into every hero moment call.
export const SYSTEM_BASE = `You are an AI assistant embedded in SMBC Origin,
a corporate banking onboarding platform for Japanese multinationals.
You assist Relationship Managers (RMs) and corporate clients with onboarding tasks.
Be concise, precise, and professional. Use banking terminology correctly.
Never fabricate regulatory or compliance information.`
