// components/primitives/AIPulseDot.tsx — Phase 4 SHELL-04 AI presence primitive (D-75).
// Bare 8px fresh-green dot with the animate-ai-pulse keyframe (Plan 04-04 → globals.css).
// ALLOWLISTED in .freshgreen-allowlist (D-85, Plan 04-11) — fresh-green is the AI signal here.
// Default aria-label = "AI active"; overridable for context-specific labels.

import type { ReactElement } from 'react'

export type AIPulseDotProps = {
  ariaLabel?: string
}

export function AIPulseDot({ ariaLabel = 'AI active' }: AIPulseDotProps): ReactElement {
  return (
    <span
      role="img"
      aria-label={ariaLabel}
      className="block w-2 h-2 rounded-full bg-fresh-green animate-ai-pulse"
    />
  )
}
