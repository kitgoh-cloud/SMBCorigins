// components/journey/AttentionCard.test.tsx — Phase 5 redo CJD-04 tests.
//
// Verifies: locked header copy + amber chip; 3 ActionRows with locked titles +
// metas (D-19); 3rd row faint (opacity 0.7); indicator dot colors (signal-amber
// vs ink-faint, no fresh-green); strict P-1 inert (no <button>, no <a>,
// no cursor-pointer per D-20 / OD5R-04); fresh-green negative grep.

import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { AttentionCard } from '@/components/journey/AttentionCard'

describe('AttentionCard — header', () => {
  it('renders FOR YOUR ATTENTION · 3 eyebrow + Due this week amber chip', () => {
    const { container } = render(<AttentionCard />)
    expect(container.textContent).toContain('For your attention · 3')
    expect(container.textContent).toContain('Due this week')
    // StatusChip kind="amber" applies signal-amber tokens — verify the chip is
    // present by detecting the amber-tinted background utility.
    const chip = container.querySelector('[class*="bg-signal-amber"]')
    expect(chip).not.toBeNull()
  })
})

describe('AttentionCard — locked content (Stage 3 lock, D-19)', () => {
  it('renders the 3 locked titles and metas verbatim', () => {
    const { container } = render(<AttentionCard />)
    expect(container.textContent).toContain('Upload Kaisei Europe — Certificate of Incorporation')
    expect(container.textContent).toContain('Required · UK jurisdiction · due Apr 28')
    expect(container.textContent).toContain('Attest source-of-wealth — Tanaka Family Trust')
    expect(container.textContent).toContain('Template ready · 4 beneficiaries')
    expect(container.textContent).toContain('Confirm directors on HK application')
    expect(container.textContent).toContain('Pre-filled by Origin from Singapore — review and submit')
  })

  it('renders 3 ActionRow divs (border-b border-mist)', () => {
    const { container } = render(<AttentionCard />)
    const rows = container.querySelectorAll('[class*="border-b"][class*="border-mist"]')
    expect(rows.length).toBe(3)
  })
})

describe('AttentionCard — faint flag (3rd row opacity)', () => {
  it('3rd ActionRow has opacity 0.7; 1st and 2nd have opacity 1', () => {
    const { container } = render(<AttentionCard />)
    const rows = Array.from(
      container.querySelectorAll('[class*="border-b"][class*="border-mist"]'),
    ) as HTMLElement[]
    expect(String(rows[0]!.style.opacity)).toBe('1')
    expect(String(rows[1]!.style.opacity)).toBe('1')
    expect(String(rows[2]!.style.opacity)).toBe('0.7')
  })
})

describe('AttentionCard — indicator dot colors', () => {
  it('1st + 2nd dots use signal-amber; 3rd dot uses ink-faint', () => {
    const { container } = render(<AttentionCard />)
    const dots = Array.from(
      container.querySelectorAll('[aria-hidden="true"][class*="rounded-full"]'),
    ) as HTMLElement[]
    // Filter to just the ActionRow indicator dots (8x8 with flex-shrink-0).
    const rowDots = dots.filter((d) => d.className.includes('w-2') && d.className.includes('h-2'))
    expect(rowDots.length).toBe(3)
    expect(rowDots[0]!.style.background).toBe('var(--color-signal-amber)')
    expect(rowDots[1]!.style.background).toBe('var(--color-signal-amber)')
    expect(rowDots[2]!.style.background).toBe('var(--color-ink-faint)')
  })
})

describe('AttentionCard — chevron icon size', () => {
  it('renders 3 chevron-right icons at 16px', () => {
    const { container } = render(<AttentionCard />)
    const svgs = Array.from(container.querySelectorAll('svg')) as SVGElement[]
    // 3 chevron icons; each rendered at width:16 height:16 via inline style.
    const chevrons = svgs.filter(
      (s) => (s as unknown as HTMLElement).style.width === '16px',
    )
    expect(chevrons.length).toBe(3)
  })
})

describe('AttentionCard — strict P-1 inert (D-20 / OD5R-04)', () => {
  it('contains no <button> elements', () => {
    const { container } = render(<AttentionCard />)
    expect(container.querySelectorAll('button').length).toBe(0)
  })

  it('contains no <a> elements', () => {
    const { container } = render(<AttentionCard />)
    expect(container.querySelectorAll('a').length).toBe(0)
  })

  it('does not apply cursor-pointer to any element', () => {
    const { container } = render(<AttentionCard />)
    expect(container.innerHTML).not.toMatch(/cursor-pointer/)
  })

  it('has no onClick handlers (innerHTML carries no inline handler attribute)', () => {
    const { container } = render(<AttentionCard />)
    // React does not serialize onClick to DOM attributes; this is a defensive
    // check that no `onclick=` string leaked into the markup.
    expect(container.innerHTML.toLowerCase()).not.toMatch(/onclick=/)
  })
})

describe('AttentionCard — fresh-green negative', () => {
  it('outerHTML has no bg-fresh-green / text-fresh-green tokens', () => {
    const { container } = render(<AttentionCard />)
    expect(container.innerHTML).not.toMatch(/\bbg-fresh-green\b/)
    expect(container.innerHTML).not.toMatch(/\btext-fresh-green\b/)
  })

  it('outerHTML has no var(--color-fresh-green) inline tokens', () => {
    const { container } = render(<AttentionCard />)
    expect(container.innerHTML).not.toMatch(/var\(--color-fresh-green/)
  })
})
