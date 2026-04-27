/**
 * lib/persona.test.ts — Tests for the chrome persona stubs (D-66, D-67, D-69).
 *
 * Covers:
 *   - PERSONAS literal-data fidelity (8 fields × 2 personas)
 *   - PERSONA_HOME literal paths
 *   - modeForPathname route-table cascade for the 3-arm 'client' | 'rm' | 'demo' union
 *
 * Test isolation: persona module exports are read-only constants + a pure
 * function — no module-scoped state, no beforeEach reset needed.
 */

import { describe, it, expect } from 'vitest'
import {
  PERSONAS,
  PERSONA_HOME,
  modeForPathname,
  type Mode,
  type Persona,
} from '@/lib/persona'

describe('lib/persona — PERSONAS constant (D-66)', () => {
  it('client persona has the locked Yuki shape', () => {
    const yuki: Persona = PERSONAS.client
    expect(yuki.name).toBe('Yuki Tanaka')
    expect(yuki.role).toBe('TREASURER')
    expect(yuki.context).toBe('Kaisei Manufacturing KK')
    expect(yuki.contextJp).toBe('開成製造')
    expect(yuki.contextSub).toBeUndefined()
  })

  it('rm persona has the locked James shape', () => {
    const james: Persona = PERSONAS.rm
    expect(james.name).toBe('James Lee')
    expect(james.role).toBe('RELATIONSHIP MGR')
    expect(james.context).toBe('Japanese Corporates')
    expect(james.contextJp).toBeNull()
    expect(james.contextSub).toBe('25 clients · Singapore desk')
  })

  it('PERSONAS contains exactly two keys (client + rm)', () => {
    expect(Object.keys(PERSONAS).sort()).toEqual(['client', 'rm'])
  })
})

describe('lib/persona — PERSONA_HOME constant (D-69)', () => {
  it('client home is /journey', () => {
    expect(PERSONA_HOME.client).toBe('/journey')
  })

  it('rm home is /cockpit', () => {
    expect(PERSONA_HOME.rm).toBe('/cockpit')
  })

  it('PERSONA_HOME does NOT include a demo entry (demo has no canonical home)', () => {
    expect(Object.keys(PERSONA_HOME).sort()).toEqual(['client', 'rm'])
  })
})

describe('lib/persona — modeForPathname (D-67 + RESEARCH §8.2)', () => {
  it('returns "demo" for /dev/primitives', () => {
    expect(modeForPathname('/dev/primitives')).toBe('demo')
  })

  it('returns "demo" for any /dev/* path', () => {
    expect(modeForPathname('/dev')).toBe('demo')
    expect(modeForPathname('/dev/storybook/anything')).toBe('demo')
  })

  it('returns "rm" for /cockpit', () => {
    expect(modeForPathname('/cockpit')).toBe('rm')
  })

  it('returns "rm" for /portfolio, /application/*, /copilot-log', () => {
    expect(modeForPathname('/portfolio')).toBe('rm')
    expect(modeForPathname('/application/abc-123')).toBe('rm')
    expect(modeForPathname('/copilot-log')).toBe('rm')
  })

  it('returns "client" for /journey', () => {
    expect(modeForPathname('/journey')).toBe('client')
  })

  it('returns "client" for unmapped paths (default fall-through)', () => {
    expect(modeForPathname('/')).toBe('client')
    expect(modeForPathname('/messages')).toBe('client')
    expect(modeForPathname('/stage-2')).toBe('client')
  })

  it('cascade order: /dev wins over hypothetical longer paths', () => {
    // If /dev appears as a path prefix, it always returns "demo" — never falls through to client/rm
    const result: Mode = modeForPathname('/dev')
    expect(result).toBe('demo')
  })
})
