// components/shell/RisingMark.tsx — Phase 4 SHELL-03 brand mark.
//
// Renders the SMBC Origin brand mark: a circle + center dot + clock-hand stroke
// rising to ~1 o'clock + tiny serif tick at 12. The clock hand is fresh-green
// by design — brand-iconographic exception per D-85 + UI-SPEC "Color > Accent
// reserved for" (line 173). The brand mark predates the AI rule; SHELL-05's
// spirit is "don't dilute the AI signal," and the brand mark IS the SMBC signal.
//
// ALLOWLISTED in .freshgreen-allowlist (Plan 04-11). Rationale documented in
// the allowlist comment header per D-86.
//
// Default size 24 matches UI-SPEC OD-3 (TopStrip use); the prototype's default
// 28 is overridden so callers don't have to pass size={24} for the common case.
// BrandLockup-style consumers (Phase 5+) pass size={26}.

import type { CSSProperties, ReactElement } from 'react'

export type RisingMarkProps = {
  size?: number
  color?: string
  hand?: string
  style?: CSSProperties
}

export function RisingMark({
  size = 24,
  color = 'var(--color-trad-green)',
  hand = 'var(--color-fresh-green)',
  style,
}: RisingMarkProps): ReactElement {
  const svgStyle: CSSProperties = {
    display: 'block',
    flexShrink: 0,
    ...style,
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      style={svgStyle}
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="20" cy="20" r="17" fill="none" stroke={color} strokeWidth="2" />
      <circle cx="20" cy="20" r="2.2" fill={color} />
      {/* clock-hand stroke rising to ~1 o'clock */}
      <line x1="20" y1="20" x2="29.2" y2="12" stroke={hand} strokeWidth="2.4" strokeLinecap="round" />
      {/* tiny serif tick at 12 */}
      <line x1="20" y1="4" x2="20" y2="7" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}
