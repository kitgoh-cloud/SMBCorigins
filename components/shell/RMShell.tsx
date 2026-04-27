// components/shell/RMShell.tsx — Phase 4 SHELL-01 RM route-group inner shell.
//
// 3-zone layout: sidebar 220px + workspace flex-1 + empty copilot-sidecar slot
// (Phase 8 owns the actual copilot per D-77; Phase 4 ships the empty slot only).
//
// SHELL-05 retrofit #5 applied at authorship per D-88: the active sidebar item's
// indicator dot uses bg-trad-green, NOT bg-fresh-green. The fresh-green dot was
// semantically wrong (active state = brand color, not AI signal); the existing
// bg-paper-deep row background already signals "selected".
//
// Sidebar nav items are <span> placeholders (NOT live <Link>s). Phase 6 wires
// navigation when the cockpit/pipeline/applications/copilot routes land. The
// <span> choice keeps the visual surface honest about wiring state — UI-SPEC
// Interaction States line 409 grants this discretion.

import type { ReactNode, ReactElement } from 'react'
import { Icon, type IconName } from '@/components/primitives/Icon'
import { Eyebrow } from '@/components/primitives/Eyebrow'

export type RMShellProps = {
  children: ReactNode
}

type NavItem = {
  readonly label: string
  readonly icon: IconName
  readonly active: boolean
}

const NAV_ITEMS: ReadonlyArray<NavItem> = [
  { label: 'Cockpit', icon: 'cockpit', active: true },
  { label: 'Pipeline', icon: 'pipeline', active: false },
  { label: 'Applications', icon: 'app-folder', active: false },
  { label: 'Copilot', icon: 'sparkle', active: false },
]

export function RMShell({ children }: RMShellProps): ReactElement {
  return (
    <div className="flex bg-paper-deep min-h-[calc(100vh-56px)]">
      <aside className="w-[220px] flex-shrink-0 bg-paper border-r border-mist sticky top-14 h-[calc(100vh-56px)] flex flex-col px-3.5 py-5">
        <Eyebrow className="px-2.5 pb-3">Workspace</Eyebrow>
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const itemClass = item.active
              ? 'flex items-center gap-2.5 px-2.5 py-2 rounded-md bg-paper-deep text-ink font-medium text-[13px]'
              : 'flex items-center gap-2.5 px-2.5 py-2 rounded-md bg-transparent text-ink-soft font-normal text-[13px]'
            return (
              <span key={item.label} className={itemClass} aria-current={item.active ? 'page' : undefined}>
                <Icon name={item.icon} size={16} />
                <span>{item.label}</span>
                {item.active ? (
                  <span
                    aria-hidden="true"
                    className="ml-auto block w-1.5 h-1.5 rounded-full bg-trad-green"
                  />
                ) : null}
              </span>
            )
          })}
        </nav>
        <div className="mt-auto px-2.5 pt-3 border-t border-mist">
          <Eyebrow>Portfolio</Eyebrow>
        </div>
      </aside>
      <main className="flex-1 px-8 py-7 min-w-0 relative">
        {children}
      </main>
      {/* Copilot sidecar slot: Phase 4 ships this empty per D-77. Phase 8 will
          add the actual copilot at this position; the flex-1 workspace handles
          available space without explicit slot reservation. */}
    </div>
  )
}
