// components/primitives/Avatar.tsx — Phase 4 SHELL-04 + Phase 5 D-24 enum extension.
// Phase 4 D-78 closed enum (7 members) extended in Phase 5 to 10 members
// (+signal-info, +warm-amber, +fresh-green). The fresh-green variant is
// reserved for the AI Origin team member; allowlisted via .freshgreen-allowlist.
// SHELL-05 still applies: callers cannot pass arbitrary fresh-green family
// values — the closed union limits to `'fresh-green'` only (NOT mute, NOT glow).

import type { CSSProperties, ReactElement } from 'react'

export type AvatarColor =
  | 'trad-green'
  | 'trad-green-soft'
  | 'trad-green-deep'
  | 'ink'
  | 'ink-muted'
  | 'paper'
  | 'mist'
  | 'signal-info' // Phase 5 — D-24 (Akiko Sato avatar)
  | 'warm-amber' // Phase 5 — D-24 (Priya Nair avatar)
  | 'fresh-green' // Phase 5 — D-24, OD5R-05 (Origin AI avatar; allowlisted)

const BG_BY_COLOR: Record<AvatarColor, string> = {
  'trad-green': 'bg-trad-green',
  'trad-green-soft': 'bg-trad-green-soft',
  'trad-green-deep': 'bg-trad-green-deep',
  ink: 'bg-ink',
  'ink-muted': 'bg-ink-muted',
  paper: 'bg-paper',
  mist: 'bg-mist',
  'signal-info': 'bg-signal-info',
  'warm-amber': 'bg-warm-amber',
  'fresh-green': 'bg-fresh-green',
}

const TEXT_BY_COLOR: Record<AvatarColor, string> = {
  'trad-green': 'text-trad-green',
  'trad-green-soft': 'text-trad-green-soft',
  'trad-green-deep': 'text-trad-green-deep',
  ink: 'text-ink',
  'ink-muted': 'text-ink-muted',
  paper: 'text-paper',
  mist: 'text-mist',
  'signal-info': 'text-signal-info',
  'warm-amber': 'text-warm-amber',
  'fresh-green': 'text-fresh-green',
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
