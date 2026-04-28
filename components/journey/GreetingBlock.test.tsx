import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { GreetingBlock } from '@/components/journey/GreetingBlock'

describe('GreetingBlock — Reiwa·Gregorian eyebrow (D-12)', () => {
  it('renders "令和8年4月27日 · Monday, 27 April 2026"', () => {
    const { container } = render(<GreetingBlock />)
    expect(container.textContent).toContain(
      '令和8年4月27日 · Monday, 27 April 2026',
    )
  })
})

describe('GreetingBlock — bilingual greeting (D-13, D-14)', () => {
  it('renders EN h1 "Good morning, Yuki-san."', () => {
    const { container } = render(<GreetingBlock />)
    const h1 = container.querySelector('h1')
    expect(h1?.textContent).toBe('Good morning, Yuki-san.')
  })

  it('renders JP greeting "おはようございます"', () => {
    const { container } = render(<GreetingBlock />)
    expect(container.textContent).toContain('おはようございます')
  })

  it('h1 has inline fontVariationSettings "SOFT" 80, "WONK" 1', () => {
    const { container } = render(<GreetingBlock />)
    const h1 = container.querySelector('h1') as HTMLElement
    expect(h1.style.fontVariationSettings).toContain('SOFT')
    expect(h1.style.fontVariationSettings).toContain('80')
    expect(h1.style.fontVariationSettings).toContain('WONK')
    expect(h1.style.fontVariationSettings).toContain('1')
  })
})

describe('GreetingBlock — 縁 watermark (D-04, D-05, D-06)', () => {
  it('renders watermark span with content 縁 and aria-hidden', () => {
    const { container } = render(<GreetingBlock />)
    const wm = Array.from(container.querySelectorAll('span')).find(
      (el) => el.textContent === '縁' && el.getAttribute('aria-hidden') === 'true',
    ) as HTMLElement | undefined
    expect(wm).toBeDefined()
  })

  it('watermark CSS is trad-green at opacity 0.035, weight 300, 360px', () => {
    const { container } = render(<GreetingBlock />)
    const wm = Array.from(container.querySelectorAll('span')).find(
      (el) => el.textContent === '縁',
    ) as HTMLElement
    expect(wm.style.position).toBe('absolute')
    expect(wm.style.top).toBe('-40px')
    expect(wm.style.right).toBe('-60px')
    expect(wm.style.fontSize).toBe('360px')
    expect(String(wm.style.fontWeight)).toBe('300')
    expect(wm.style.color).toBe('var(--color-trad-green)')
    expect(String(wm.style.opacity)).toBe('0.035')
    expect(String(wm.style.lineHeight)).toBe('0.8')
  })

  it('watermark has pointer-events-none and select-none', () => {
    const { container } = render(<GreetingBlock />)
    const wm = Array.from(container.querySelectorAll('span')).find(
      (el) => el.textContent === '縁',
    ) as HTMLElement
    expect(wm.className).toContain('pointer-events-none')
    expect(wm.className).toContain('select-none')
  })
})

describe('GreetingBlock — summary paragraph (D-15, OD5R-03)', () => {
  it('renders the full paragraph with "47 fields of document extraction" in <strong>', () => {
    const { container } = render(<GreetingBlock />)
    const p = container.querySelector('p')
    expect(p).not.toBeNull()
    expect(p!.textContent).toBe(
      'Your onboarding with SMBC is on track. Origin handled 47 fields of document extraction overnight — two items need your attention today.',
    )
    const strong = container.querySelector('strong')
    expect(strong?.textContent).toBe('47 fields of document extraction')
  })

  it('<strong> uses trad-green color (NOT fresh-green)', () => {
    const { container } = render(<GreetingBlock />)
    const strong = container.querySelector('strong') as HTMLElement
    expect(strong.style.color).toBe('var(--color-trad-green)')
  })
})

describe('GreetingBlock — fresh-green negative (CJD-07 / W-04 correction)', () => {
  it('outerHTML contains no bg-fresh-green or text-fresh-green tokens', () => {
    const { container } = render(<GreetingBlock />)
    expect(container.innerHTML).not.toMatch(/\bbg-fresh-green\b/)
    expect(container.innerHTML).not.toMatch(/\btext-fresh-green\b/)
  })

  it("outerHTML contains no rgba(191, 215, 48 ...) literal (the archive's incorrect watermark color)", () => {
    const { container } = render(<GreetingBlock />)
    expect(container.innerHTML).not.toMatch(/rgba\s*\(\s*191\s*,\s*215\s*,\s*48/)
  })
})
