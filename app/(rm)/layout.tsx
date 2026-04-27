// app/(rm)/layout.tsx — Phase 4 RM route-group layout (D-64).
//
// Wraps all /(rm)/* pages in <RMShell> (sidebar + workspace + empty copilot
// sidecar slot) below the root <TopStrip />. Phase 6 (RMC-01..07) consumes
// this layout when populating the cockpit.

import type { ReactNode } from 'react'
import { RMShell } from '@/components/shell/RMShell'

export default function RMGroupLayout({ children }: { children: ReactNode }) {
  return <RMShell>{children}</RMShell>
}
