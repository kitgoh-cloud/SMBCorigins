// lib/persona.ts — Phase 4 chrome persona stubs (D-66, D-67, D-69)
// Plain TS constants; chrome decoupled from lib/api.mock.ts (D-66).
// modeForPathname returns 'client' | 'rm' | 'demo' per RESEARCH §8.2 — /dev/*
// routes render the demo-page chrome variant. Phase 5/6/7 extend the route
// table additively as new routes land.

export type Mode = 'client' | 'rm' | 'demo'

export type Persona = {
  readonly name: string
  readonly role: string
  readonly context: string
  readonly contextJp: string | null
  readonly contextSub?: string
}

export const PERSONAS: Record<'client' | 'rm', Persona> = {
  client: {
    name: 'Yuki Tanaka',
    role: 'TREASURER',
    context: 'Kaisei Manufacturing KK',
    contextJp: '開成製造',
  },
  rm: {
    name: 'James Lee',
    role: 'RELATIONSHIP MGR',
    context: 'Japanese Corporates',
    contextJp: null,
    contextSub: '25 clients · Singapore desk',
  },
} as const

export const PERSONA_HOME = {
  client: '/journey',
  rm: '/cockpit',
} as const

export function modeForPathname(pathname: string): Mode {
  if (pathname.startsWith('/dev')) return 'demo'
  if (
    pathname.startsWith('/cockpit') ||
    pathname.startsWith('/portfolio') ||
    pathname.startsWith('/application') ||
    pathname.startsWith('/copilot-log')
  ) {
    return 'rm'
  }
  return 'client'
}
