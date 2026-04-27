// components/primitives/StagePill.tsx — Phase 4 SHELL-04 stage primitive (D-74).
// Pure presentational circular numbered disc. Imports StageNumber from
// @/types/origin (cross-boundary read of the existing closed literal — the only
// primitive that consumes the contract types per PATTERNS.md exact-match analog).
// Consumer renders stage names — this primitive is name-agnostic per D-74.
// No fresh-green tokens (StagePill is not an AI surface).

import type { CSSProperties, ReactElement } from 'react'
import type { StageNumber } from '@/types/origin'

export type StagePillState = 'done' | 'current' | 'upcoming'

type StageStyles = {
  readonly bg: string
  readonly text: string
  readonly border: string
}

const STYLES_BY_STATE: Record<StagePillState, StageStyles> = {
  done: {
    bg: 'bg-trad-green',
    text: 'text-paper',
    border: '',
  },
  current: {
    bg: 'bg-paper',
    text: 'text-trad-green',
    border: 'border-2 border-trad-green',
  },
  upcoming: {
    bg: 'bg-mist',
    text: 'text-ink-muted',
    border: '',
  },
}

export type StagePillProps = {
  n: StageNumber
  state: StagePillState
  size?: number
}

export function StagePill({ n, state, size = 34 }: StagePillProps): ReactElement {
  const styles = STYLES_BY_STATE[state]
  const sizeStyle: CSSProperties = {
    width: size,
    height: size,
    fontSize: Math.round(size * 0.44),
    flexShrink: 0,
  }
  const className = [
    'inline-flex items-center justify-center rounded-full',
    'font-display font-semibold leading-none',
    styles.bg,
    styles.text,
    styles.border,
  ]
    .filter(Boolean)
    .join(' ')
  const glyph = state === 'done' ? '✓' : n
  return (
    <span className={className} style={sizeStyle} aria-label={`Stage ${n} ${state}`}>
      {glyph}
    </span>
  )
}
