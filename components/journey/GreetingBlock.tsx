// components/journey/GreetingBlock.tsx — Phase 5 redo CJD-02 greeting header.
//
// Server Component. Renders 縁 watermark (trad-green, weight 300 — D-04, D-05),
// Reiwa·Gregorian eyebrow (D-12), bilingual h1 (D-13, D-14), summary paragraph
// with static "47 fields" copy (D-15, OD5R-03 resolved STATIC).
//
// Hydration: SERVER_DEMO_DATE is a frozen constant — SSR and CSR identical.
//
// W-04 correction: the archive's HeroBlock used a fresh-green watermark sourced
// from docs/ORIGIN_JOURNEY_DOC.html. The prototype's actual watermark is
// trad-green at 0.035 opacity, weight 300 — corrected here. This file is
// intentionally NOT in .freshgreen-allowlist (no fresh-green surfaces).
//
// Decisions covered: D-04, D-05, D-06, D-12, D-13, D-14, D-15.
// OD5R resolution: OD5R-03 (47 fields static, editorial not metric).

import type { ReactElement } from 'react'
import { Eyebrow } from '@/components/primitives'
import { SERVER_DEMO_DATE, formatReiwa } from '@/lib/cjd'

const GREGORIAN_FORMATTER = new Intl.DateTimeFormat('en-GB', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
})

export function GreetingBlock(): ReactElement {
  const reiwa = formatReiwa(SERVER_DEMO_DATE)
  const gregorian = GREGORIAN_FORMATTER.format(SERVER_DEMO_DATE)

  return (
    <section className="reveal relative mb-7">
      {/* 縁 watermark — D-04: trad-green at opacity 0.035, NOT fresh-green */}
      <span
        aria-hidden="true"
        className="font-jp pointer-events-none select-none"
        style={{
          position: 'absolute',
          top: '-40px',
          right: '-60px',
          fontSize: '360px',
          fontWeight: 300,
          color: 'var(--color-trad-green)',
          opacity: 0.035,
          lineHeight: 0.8,
          letterSpacing: '-0.05em',
        }}
      >
        縁
      </span>

      {/* Reiwa · Gregorian eyebrow */}
      <Eyebrow className="relative" style={{ marginBottom: 10 }}>
        {`${reiwa} · ${gregorian}`}
      </Eyebrow>

      {/* Bilingual h1 row */}
      <div className="relative flex items-baseline gap-4 mb-2">
        <h1
          className="font-fraunces text-[44px] font-normal leading-[1.05] text-ink m-0"
          style={{ fontVariationSettings: '"SOFT" 80, "WONK" 1' }}
        >
          Good morning, Yuki-san.
        </h1>
        <span className="font-jp text-[22px] font-normal text-ink-muted">
          おはようございます
        </span>
      </div>

      {/* Summary paragraph */}
      <p className="relative text-[16px] text-ink-soft leading-relaxed max-w-[640px] m-0">
        Your onboarding with SMBC is on track. Origin handled{' '}
        <strong style={{ color: 'var(--color-trad-green)', fontWeight: 500 }}>
          47 fields of document extraction
        </strong>{' '}
        overnight — two items need your attention today.
      </p>
    </section>
  )
}
