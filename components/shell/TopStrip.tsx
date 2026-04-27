'use client'

// components/shell/TopStrip.tsx — Phase 4 SHELL-01 chrome top strip.
//
// Renders the full prototype shape with Phase 4 retrofits applied at authorship:
//   #1 Avatar bg = 'trad-green-soft' (NOT 'fresh-green')
//   #2 Mail-icon notification dot bg = 'bg-signal-amber' (NOT 'bg-fresh-green')
//
// 'use client' because usePathname() is a client-only hook (RESEARCH §Pattern 1).
// Mode is computed from pathname per modeForPathname (D-67 + RESEARCH §8.2 'demo'
// arm). Demo mode suppresses persona block + context badge — visual cue that the
// user is on a meta page, not a persona view.
//
// OD-12 strategy (b): "Origin" wordmark uses inline fontVariationSettings.
// No font import change in app/layout.tsx (Plan 04-02 left Fraunces wght-only).

import type { ReactElement } from 'react'
import { usePathname } from 'next/navigation'
import { RisingMark } from './RisingMark'
import { LanguageToggle } from './LanguageToggle'
import { ModeSwitcher } from './ModeSwitcher'
import { Eyebrow, Icon, Avatar } from '@/components/primitives'
import { PERSONAS, modeForPathname, type Mode } from '@/lib/persona'

export function TopStrip(): ReactElement {
  const pathname = usePathname()
  const mode: Mode = modeForPathname(pathname ?? '/')

  return (
    <header className="sticky top-0 z-[100] h-14 bg-trad-green-deep text-paper border-b border-paper/[0.06] flex items-center px-6 gap-6">
      {/* Brand cluster */}
      <div className="flex items-center gap-2.5">
        <RisingMark size={24} color="var(--color-paper)" hand="var(--color-fresh-green)" />
        <span className="flex items-baseline gap-2">
          <span
            className="font-display text-[19px] font-semibold leading-tight tracking-[-0.02em]"
            style={{ fontVariationSettings: '"SOFT" 80, "WONK" 1' }}
          >
            Origin
          </span>
          <Eyebrow className="text-paper/50">BY SMBC</Eyebrow>
        </span>
      </div>

      {/* Vertical divider */}
      <span aria-hidden="true" className="block w-px h-6 bg-paper/[0.12]" />

      {/* Context badge — mode-conditional */}
      <ContextBadge mode={mode} />

      {/* Spacer */}
      <span className="flex-1" />

      {/* Mode switcher (env-gated) */}
      <ModeSwitcher activeMode={mode} />

      {/* Language toggle */}
      <LanguageToggle />

      {/* Mail icon + notification dot (client mode only) */}
      <span className="relative inline-flex">
        <Icon name="mail" size={18} ariaLabel="Mail" color="var(--color-paper)" />
        {mode === 'client' ? (
          <span
            aria-hidden="true"
            className="absolute -top-0.5 -right-0.5 block w-2 h-2 rounded-full bg-signal-amber"
          />
        ) : null}
      </span>

      {/* Help icon */}
      <Icon name="help" size={18} ariaLabel="Help" color="var(--color-paper)" />

      {/* Vertical divider */}
      <span aria-hidden="true" className="block w-px h-6 bg-paper/[0.12]" />

      {/* Persona block (suppressed in demo mode) */}
      <PersonaBlock mode={mode} />
    </header>
  )
}

function ContextBadge({ mode }: { mode: Mode }): ReactElement | null {
  if (mode === 'demo') {
    return (
      <Eyebrow className="text-paper/50">DEV · Primitives Demo</Eyebrow>
    )
  }
  if (mode === 'client') {
    return (
      <span className="flex items-center gap-2.5 text-paper/80">
        <Icon name="bank" size={14} ariaLabel="Client" color="currentColor" />
        <span className="font-body text-[13px] font-medium">{PERSONAS.client.context}</span>
        <span className="text-paper/40">·</span>
        <span className="font-jp text-[12px] font-medium text-paper/50">{PERSONAS.client.contextJp}</span>
      </span>
    )
  }
  // mode === 'rm'
  return (
    <span className="flex items-center gap-2.5 text-paper/80">
      <Icon name="users" size={14} ariaLabel="RM portfolio" color="currentColor" />
      <span className="font-body text-[13px] font-medium">{PERSONAS.rm.context}</span>
      {PERSONAS.rm.contextSub ? (
        <>
          <span className="text-paper/40">·</span>
          <span className="font-body text-[12px] font-medium text-paper/50">{PERSONAS.rm.contextSub}</span>
        </>
      ) : null}
    </span>
  )
}

function PersonaBlock({ mode }: { mode: Mode }): ReactElement | null {
  if (mode === 'demo') {
    return null
  }
  const persona = mode === 'client' ? PERSONAS.client : PERSONAS.rm
  const initials = mode === 'client' ? 'YT' : 'JL'
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex flex-col items-end leading-tight">
        <span className="font-body text-[13px] text-paper">{persona.name}</span>
        <Eyebrow className="text-paper/55">{persona.role}</Eyebrow>
      </div>
      <Avatar initials={initials} size={30} color="trad-green-soft" textColor="paper" />
    </div>
  )
}
