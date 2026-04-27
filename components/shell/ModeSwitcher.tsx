// components/shell/ModeSwitcher.tsx — Phase 4 SHELL-02 dev-only mode switcher.
//
// Gated by NEXT_PUBLIC_SHOW_MODE_SWITCHER env var (D-68). Renders null in
// production builds where the env var is unset/false. Two <Link>s per D-69 —
// active determined by activeMode prop (TopStrip computes via modeForPathname).
//
// SHELL-05 retrofits applied at authorship time per D-88 — this code uses the
// replacement tokens directly, so the SHELL-05 grep script (Plan 04-11) sees no
// AI-reserved brand tokens here. Retrofits:
//   #3 dashed border tint: prototype bad value → border-ink-muted/30
//   #4 DEMO eyebrow color: prototype bad value → text-signal-amber
//
// No 'use client' — Link from next/link works in RSC; activeMode is passed by
// the parent (TopStrip) which holds the only client boundary in the chrome.

import type { ReactElement } from 'react'
import Link from 'next/link'
import { Eyebrow } from '@/components/primitives/Eyebrow'
import { PERSONA_HOME, type Mode } from '@/lib/persona'

export type ModeSwitcherProps = {
  activeMode: Mode
}

export function ModeSwitcher({ activeMode }: ModeSwitcherProps): ReactElement | null {
  if (process.env.NEXT_PUBLIC_SHOW_MODE_SWITCHER !== 'true') {
    return null
  }

  const baseSegment =
    'px-3 py-1 rounded-full text-[14px] font-medium transition-colors duration-200 ease-out focus-visible:outline-2 focus-visible:outline-paper focus-visible:outline-offset-2'
  const activeSegment = `${baseSegment} bg-paper text-trad-green-deep`
  const inactiveSegment = `${baseSegment} bg-trad-green-deep text-paper hover:bg-trad-green`

  const clientActive = activeMode === 'client'
  const rmActive = activeMode === 'rm'

  return (
    <span className="inline-flex items-center gap-1 px-1 py-1 rounded-full bg-black/30 border border-dashed border-ink-muted/30">
      <Eyebrow className="text-signal-amber px-2">DEMO</Eyebrow>
      <Link
        href={PERSONA_HOME.client}
        className={clientActive ? activeSegment : inactiveSegment}
        aria-current={clientActive ? 'page' : undefined}
      >
        Client · Yuki
      </Link>
      <Link
        href={PERSONA_HOME.rm}
        className={rmActive ? activeSegment : inactiveSegment}
        aria-current={rmActive ? 'page' : undefined}
      >
        RM · James
      </Link>
    </span>
  )
}
