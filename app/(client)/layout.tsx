// app/(client)/layout.tsx — Phase 4 client route-group layout (D-64).
//
// Wraps all /(client)/* pages in <ClientShell> below the root <TopStrip />.
// Phase 5 (CJD-01..07) consumes this layout when populating the dashboard.

import type { ReactNode } from 'react'
import { ClientShell } from '@/components/shell/ClientShell'

export default function ClientGroupLayout({ children }: { children: ReactNode }) {
  return <ClientShell>{children}</ClientShell>
}
