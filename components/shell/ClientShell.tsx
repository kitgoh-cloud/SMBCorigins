// components/shell/ClientShell.tsx — Phase 4 SHELL-01 client route-group inner shell.
//
// Renders a single-column workspace below the TopStrip. Consumed by
// app/(client)/layout.tsx (Plan 04-10 Wave 4). 56px chrome height supersedes
// Phase 2 placeholder pages' min-h-screen with min-h-[calc(100vh-56px)].
//
// No fresh-green tokens. Server component — no client-state.

import type { ReactNode, ReactElement } from 'react'

export type ClientShellProps = {
  children: ReactNode
}

export function ClientShell({ children }: ClientShellProps): ReactElement {
  return (
    <div className="bg-paper min-h-[calc(100vh-56px)] relative overflow-hidden">
      <div className="max-w-[1200px] mx-auto pt-9 px-10 pb-20 relative">
        {children}
      </div>
    </div>
  )
}
