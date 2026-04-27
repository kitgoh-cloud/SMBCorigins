'use client'

// components/primitives/ActionCard.tsx — Phase 4 SHELL-04 row primitive (D-76).
// ActionCard is a row primitive (NOT container card). Indicator and cta are
// slot-shaped ReactNodes — composers pass <AIPulseDot/>, <StatusChip kind="amber" dot/>,
// an inline priority bar div, etc. The 4 prototype row variants (ActionRow, NeedsYouRow,
// AILaneRow, OvernightRow) become composition recipes — consuming phases assemble.
//
// 'use client' directive at top: ActionCard ships ready for onClick callers per
// RESEARCH Pitfall 3. Cost is small for a single primitive; alternative is two
// versions (server+client) which adds maintenance.
//
// Interaction states locked per UI-SPEC Interaction States table:
//   - default (no onClick): cursor-default, no hover/focus
//   - default + onClick: cursor-pointer
//   - hover (onClick): bg-paper-deep (subtle bg lift)
//   - focus-visible (onClick): 2px outline trad-green, 2px offset
//   - active (onClick): bg-mist
//   - faint=true: text-ink-muted text, indicator wrapped in opacity-60
//   - disabled / loading: N/A in Phase 4 (no consumer; UI-SPEC line 381-382)
//
// No fresh-green tokens (ActionCard is not an AI-presence primitive; AI rows
// compose ActionCard + AIBadge in their own card header).

import type { ReactNode, ReactElement } from 'react'

export type ActionCardProps = {
  title: string
  meta?: string
  indicator?: ReactNode
  cta?: ReactNode
  onClick?: () => void
  faint?: boolean
}

export function ActionCard({
  title,
  meta,
  indicator,
  cta,
  onClick,
  faint = false,
}: ActionCardProps): ReactElement {
  const isInteractive = typeof onClick === 'function'

  const baseClasses = [
    'flex items-center gap-3 w-full',
    'bg-paper border border-mist rounded-card',
    'px-4 py-3 text-left',
    'transition-colors duration-200 ease-out',
  ]
  const interactiveClasses = isInteractive
    ? [
        'cursor-pointer',
        'hover:bg-paper-deep',
        'focus-visible:outline-2 focus-visible:outline-trad-green focus-visible:outline-offset-2',
        'active:bg-mist',
      ]
    : ['cursor-default']
  const className = [...baseClasses, ...interactiveClasses].join(' ')

  const titleClass = faint ? 'text-ink-muted' : 'text-ink'
  const metaClass = faint ? 'text-ink-muted/70' : 'text-ink-soft'
  const wrappedIndicator =
    faint && indicator ? <span className="opacity-60">{indicator}</span> : indicator

  const inner = (
    <>
      {wrappedIndicator ? (
        <span className="flex-shrink-0">{wrappedIndicator}</span>
      ) : null}
      <span className="flex flex-col flex-1 min-w-0">
        <span className={`font-body text-[14px] leading-tight ${titleClass}`}>{title}</span>
        {meta ? (
          <span className={`font-mono text-[10px] mt-1 leading-tight ${metaClass}`}>{meta}</span>
        ) : null}
      </span>
      {cta ? <span className="flex-shrink-0">{cta}</span> : null}
    </>
  )

  if (isInteractive) {
    return (
      <button type="button" className={className} onClick={onClick}>
        {inner}
      </button>
    )
  }
  return <div className={className}>{inner}</div>
}
