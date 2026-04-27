// components/primitives/AIBadge.tsx — Phase 4 SHELL-04 AI presence primitive (D-75).
// Trad-green-deep rounded-full pill containing AIPulseDot + label (default "Origin").
// ALLOWLISTED in .freshgreen-allowlist (D-85, Plan 04-11) — composes AIPulseDot
// (fresh-green dot) and uses text-fresh-green for the label, by design.

import type { ReactElement } from 'react'
import { AIPulseDot } from './AIPulseDot'

export type AIBadgeProps = {
  label?: string
}

export function AIBadge({ label = 'Origin' }: AIBadgeProps): ReactElement {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-trad-green-deep text-fresh-green px-3 py-1 text-[11px] font-medium">
      <AIPulseDot />
      <span>{label}</span>
    </span>
  )
}
