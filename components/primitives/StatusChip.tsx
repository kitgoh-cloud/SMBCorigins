// components/primitives/StatusChip.tsx — Phase 4 SHELL-04 chip primitive (D-73).
// 6-kind closed enum; ALLOWLISTED in .freshgreen-allowlist (D-85) for the kind='ai'
// branch only. D-87 mandates per-kind unit tests as the second line of defense
// for whole-file allowlisting — see StatusChip.test.tsx.
//
// Per RESEARCH §5.5 the per-kind token mapping is locked; kind='ai' is the ONLY
// kind that uses fresh-green tokens. Any future PR that swaps another kind's
// tokens to fresh-green will pass the file-level allowlist but FAIL the per-kind
// unit test — the test catches what the allowlist cannot.

import type { ReactNode, ReactElement } from 'react'

export type StatusChipKind = 'ok' | 'ai' | 'amber' | 'ghost' | 'red' | 'info'

export type StatusChipProps = {
  kind: StatusChipKind
  children: ReactNode
  dot?: boolean
}

type ChipStyles = {
  readonly bg: string
  readonly text: string
  readonly dotBg: string
}

const STYLES_BY_KIND: Record<StatusChipKind, ChipStyles> = {
  ok:    { bg: 'bg-mist',              text: 'text-trad-green',      dotBg: 'bg-trad-green' },
  ai:    { bg: 'bg-fresh-green-glow',  text: 'text-trad-green-deep', dotBg: 'bg-fresh-green' },
  amber: { bg: 'bg-signal-amber/15',   text: 'text-signal-amber',    dotBg: 'bg-signal-amber' },
  ghost: { bg: 'bg-paper-deep',        text: 'text-ink-muted',       dotBg: 'bg-ink-muted' },
  red:   { bg: 'bg-signal-red/15',     text: 'text-signal-red',      dotBg: 'bg-signal-red' },
  info:  { bg: 'bg-signal-info/15',    text: 'text-signal-info',     dotBg: 'bg-signal-info' },
}

export function StatusChip({ kind, children, dot = true }: StatusChipProps): ReactElement {
  const styles = STYLES_BY_KIND[kind]
  const className = [
    'inline-flex items-center gap-2 rounded-full px-3 py-1',
    'text-[11px] font-medium',
    styles.bg,
    styles.text,
  ].join(' ')
  return (
    <span className={className}>
      {dot ? <span className={`block w-1.5 h-1.5 rounded-full ${styles.dotBg}`} aria-hidden="true" /> : null}
      {children}
    </span>
  )
}
