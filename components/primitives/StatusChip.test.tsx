/**
 * components/primitives/StatusChip.test.tsx — D-87 MANDATORY per-kind token tests.
 *
 * Per CONTEXT.md D-87: whole-file allowlist (D-85) is coarse — for files where only
 * SOME branches use fresh-green (StatusChip's kind='ai'), unit tests verify each
 * branch renders the expected token as a second line of defense.
 *
 * If a future PR swaps kind='ok' to use fresh-green, the lint passes (file is
 * allowlisted) but the unit test fails — that's what these tests are FOR.
 *
 * Coverage: every kind × (bg, text, dot) token = 6 × 3 = 18 explicit assertions,
 * plus the negative invariant: ONLY kind='ai' produces fresh-green tokens.
 */

import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { StatusChip, type StatusChipKind } from '@/components/primitives/StatusChip'

const KINDS: ReadonlyArray<StatusChipKind> = ['ok', 'ai', 'amber', 'ghost', 'red', 'info']

describe('components/primitives/StatusChip (SHELL-04, D-73, D-87)', () => {
  it('kind="ok" renders bg-mist, text-trad-green, dot bg-trad-green', () => {
    const { container } = render(<StatusChip kind="ok">Verified</StatusChip>)
    const chip = container.firstElementChild as HTMLElement
    expect(chip.className).toContain('bg-mist')
    expect(chip.className).toContain('text-trad-green')
    const dot = chip.querySelector('span[aria-hidden="true"]') as HTMLElement
    expect(dot.className).toContain('bg-trad-green')
    // negative: kind='ok' MUST NOT use fresh-green
    expect(chip.className).not.toMatch(/fresh-green/)
    expect(dot.className).not.toMatch(/fresh-green/)
  })

  it('kind="ai" renders bg-fresh-green-glow, text-trad-green-deep, dot bg-fresh-green (D-87)', () => {
    const { container } = render(<StatusChip kind="ai">Origin</StatusChip>)
    const chip = container.firstElementChild as HTMLElement
    expect(chip.className).toContain('bg-fresh-green-glow')
    expect(chip.className).toContain('text-trad-green-deep')
    const dot = chip.querySelector('span[aria-hidden="true"]') as HTMLElement
    expect(dot.className).toContain('bg-fresh-green')
  })

  it('kind="amber" renders signal-amber tokens, NO fresh-green', () => {
    const { container } = render(<StatusChip kind="amber">Pending</StatusChip>)
    const chip = container.firstElementChild as HTMLElement
    expect(chip.className).toContain('bg-signal-amber/15')
    expect(chip.className).toContain('text-signal-amber')
    const dot = chip.querySelector('span[aria-hidden="true"]') as HTMLElement
    expect(dot.className).toContain('bg-signal-amber')
    expect(chip.className).not.toMatch(/fresh-green/)
    expect(dot.className).not.toMatch(/fresh-green/)
  })

  it('kind="ghost" renders bg-paper-deep, text-ink-muted, dot bg-ink-muted, NO fresh-green', () => {
    const { container } = render(<StatusChip kind="ghost">Optional</StatusChip>)
    const chip = container.firstElementChild as HTMLElement
    expect(chip.className).toContain('bg-paper-deep')
    expect(chip.className).toContain('text-ink-muted')
    const dot = chip.querySelector('span[aria-hidden="true"]') as HTMLElement
    expect(dot.className).toContain('bg-ink-muted')
    expect(chip.className).not.toMatch(/fresh-green/)
    expect(dot.className).not.toMatch(/fresh-green/)
  })

  it('kind="red" renders signal-red tokens, NO fresh-green', () => {
    const { container } = render(<StatusChip kind="red">Blocked</StatusChip>)
    const chip = container.firstElementChild as HTMLElement
    expect(chip.className).toContain('bg-signal-red/15')
    expect(chip.className).toContain('text-signal-red')
    const dot = chip.querySelector('span[aria-hidden="true"]') as HTMLElement
    expect(dot.className).toContain('bg-signal-red')
    expect(chip.className).not.toMatch(/fresh-green/)
    expect(dot.className).not.toMatch(/fresh-green/)
  })

  it('kind="info" renders signal-info tokens, NO fresh-green', () => {
    const { container } = render(<StatusChip kind="info">Info</StatusChip>)
    const chip = container.firstElementChild as HTMLElement
    expect(chip.className).toContain('bg-signal-info/15')
    expect(chip.className).toContain('text-signal-info')
    const dot = chip.querySelector('span[aria-hidden="true"]') as HTMLElement
    expect(dot.className).toContain('bg-signal-info')
    expect(chip.className).not.toMatch(/fresh-green/)
    expect(dot.className).not.toMatch(/fresh-green/)
  })

  it('only kind="ai" produces fresh-green tokens — all 5 other kinds are clean (D-87 invariant)', () => {
    for (const kind of KINDS) {
      const { container } = render(<StatusChip kind={kind}>label</StatusChip>)
      const chip = container.firstElementChild as HTMLElement
      const fullText = chip.outerHTML // includes dot child
      if (kind === 'ai') {
        expect(fullText, `kind="ai" must contain fresh-green`).toMatch(/fresh-green/)
      } else {
        expect(fullText, `kind="${kind}" must NOT contain fresh-green`).not.toMatch(/fresh-green/)
      }
    }
  })

  it('dot=false omits the leading dot', () => {
    const { container } = render(<StatusChip kind="ok" dot={false}>Plain</StatusChip>)
    const chip = container.firstElementChild as HTMLElement
    const dot = chip.querySelector('span[aria-hidden="true"]')
    expect(dot).toBeNull()
  })

  it('dot=true (default) renders the leading dot', () => {
    const { container } = render(<StatusChip kind="ok">With dot</StatusChip>)
    const chip = container.firstElementChild as HTMLElement
    const dot = chip.querySelector('span[aria-hidden="true"]')
    expect(dot).not.toBeNull()
  })

  it('renders children inside the chip', () => {
    const { container } = render(<StatusChip kind="ai">Origin · ready</StatusChip>)
    expect(container.textContent).toContain('Origin · ready')
  })

  it('chip is inline-flex rounded-full px-3 py-1 text-[11px] font-medium', () => {
    const { container } = render(<StatusChip kind="ok">label</StatusChip>)
    const chip = container.firstElementChild as HTMLElement
    expect(chip.className).toContain('inline-flex')
    expect(chip.className).toContain('items-center')
    expect(chip.className).toContain('gap-2')
    expect(chip.className).toContain('rounded-full')
    expect(chip.className).toContain('px-3')
    expect(chip.className).toContain('py-1')
    expect(chip.className).toContain('text-[11px]')
    expect(chip.className).toContain('font-medium')
  })
})
