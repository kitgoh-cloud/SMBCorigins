/**
 * components/shell/LanguageToggle.test.tsx — Tests for LanguageToggle (SHELL-01).
 */

import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { LanguageToggle } from '@/components/shell/LanguageToggle'

describe('components/shell/LanguageToggle (SHELL-01)', () => {
  it('renders wrapper span with two segment children', () => {
    const { container } = render(<LanguageToggle />)
    const wrapper = container.firstElementChild as HTMLElement
    expect(wrapper.tagName.toLowerCase()).toBe('span')
    expect(wrapper.children.length).toBe(2)
  })

  it('first segment is "EN" using font-body (Inter Tight)', () => {
    const { container } = render(<LanguageToggle />)
    const segments = container.querySelectorAll('span > span')
    expect(segments[0]?.textContent).toBe('EN')
    expect(segments[0]?.className).toContain('font-body')
  })

  it('second segment is "日本語" using font-jp (Noto Sans JP)', () => {
    const { container } = render(<LanguageToggle />)
    const segments = container.querySelectorAll('span > span')
    expect(segments[1]?.textContent).toBe('日本語')
    expect(segments[1]?.className).toContain('font-jp')
  })

  it('active "EN" segment has bg-paper/8 (subtle white-tint)', () => {
    const { container } = render(<LanguageToggle />)
    const segments = container.querySelectorAll('span > span')
    expect(segments[0]?.className).toContain('bg-paper/8')
  })

  it('inactive "日本語" segment has text-paper/70 (70% opacity)', () => {
    const { container } = render(<LanguageToggle />)
    const segments = container.querySelectorAll('span > span')
    expect(segments[1]?.className).toContain('text-paper/70')
  })

  it('wrapper is inline-flex items-center gap-1', () => {
    const { container } = render(<LanguageToggle />)
    const wrapper = container.firstElementChild as HTMLElement
    expect(wrapper.className).toContain('inline-flex')
    expect(wrapper.className).toContain('items-center')
    expect(wrapper.className).toContain('gap-1')
  })

  it('wrapper is NOT a button or anchor (no focus, no click)', () => {
    const { container } = render(<LanguageToggle />)
    const wrapper = container.firstElementChild as HTMLElement
    expect(wrapper.tagName.toLowerCase()).not.toBe('button')
    expect(wrapper.tagName.toLowerCase()).not.toBe('a')
    // segments also are spans, not buttons/anchors
    const segments = container.querySelectorAll('span > span')
    for (const seg of Array.from(segments)) {
      expect(seg.tagName.toLowerCase()).toBe('span')
    }
  })

  it('wrapper has aria-label="Language" for screen readers', () => {
    const { container } = render(<LanguageToggle />)
    const wrapper = container.firstElementChild as HTMLElement
    expect(wrapper.getAttribute('aria-label')).toBe('Language')
  })
})
