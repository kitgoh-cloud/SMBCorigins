// components/primitives/Eyebrow.tsx — Phase 4 SHELL-04 typography primitive.
// Mono / uppercase / 0.18em tracked label; per UI-SPEC Typography 10/500.
// No fresh-green tokens (this primitive is non-AI surface).

import type { CSSProperties, ReactNode } from 'react'

export type EyebrowProps = {
  children: ReactNode
  className?: string
  style?: CSSProperties // Phase 5 — additive (StageTimeline current-pill weight; GreetingBlock 10px margin)
}

const baseClasses =
  'font-mono uppercase tracking-[0.18em] text-ink-muted text-[10px] font-medium leading-tight'

export function Eyebrow({ children, className, style }: EyebrowProps) {
  const composed = className ? `${baseClasses} ${className}` : baseClasses
  return (
    <span className={composed} style={style}>
      {children}
    </span>
  )
}
