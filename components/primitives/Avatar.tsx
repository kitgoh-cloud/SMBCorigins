// components/primitives/Avatar.tsx — Phase 4 SHELL-04 avatar primitive (D-78).
// 7-member closed AvatarColor enum (Plan 04-05 lock; Phase 5/6 add additively).
// Explicitly EXCLUDES fresh-green family per D-78 — the closed union blocks
// callers from passing fresh-green at compile time, which is the second line
// of defense for SHELL-05 (the first being scripts/check-fresh-green.sh).

import type { CSSProperties, ReactElement } from 'react'

export type AvatarColor =
  | 'trad-green'
  | 'trad-green-soft'
  | 'trad-green-deep'
  | 'ink'
  | 'ink-muted'
  | 'paper'
  | 'mist'

const BG_BY_COLOR: Record<AvatarColor, string> = {
  'trad-green': 'bg-trad-green',
  'trad-green-soft': 'bg-trad-green-soft',
  'trad-green-deep': 'bg-trad-green-deep',
  ink: 'bg-ink',
  'ink-muted': 'bg-ink-muted',
  paper: 'bg-paper',
  mist: 'bg-mist',
}

const TEXT_BY_COLOR: Record<AvatarColor, string> = {
  'trad-green': 'text-trad-green',
  'trad-green-soft': 'text-trad-green-soft',
  'trad-green-deep': 'text-trad-green-deep',
  ink: 'text-ink',
  'ink-muted': 'text-ink-muted',
  paper: 'text-paper',
  mist: 'text-mist',
}

export type AvatarProps = {
  initials: string
  size?: number
  color: AvatarColor
  textColor?: AvatarColor
}

export function Avatar({
  initials,
  size = 30,
  color,
  textColor = 'paper',
}: AvatarProps): ReactElement {
  const sizeStyle: CSSProperties = {
    width: size,
    height: size,
    fontSize: 12,
    flexShrink: 0,
  }
  const className = [
    'inline-flex items-center justify-center rounded-full',
    'font-mono font-normal leading-none',
    BG_BY_COLOR[color],
    TEXT_BY_COLOR[textColor],
  ].join(' ')
  return (
    <span className={className} style={sizeStyle}>
      {initials}
    </span>
  )
}
