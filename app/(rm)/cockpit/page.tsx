// app/(rm)/cockpit/page.tsx
// Phase 2 placeholder for SCAFF-06 RM route group.
// Phase 6 (RMC-01..07) replaces this content but keeps the route path.

import Link from 'next/link'

export default function RMCockpitPlaceholder() {
  return (
    <main className="bg-paper text-trad-green min-h-screen p-8">
      <h1 className="font-display text-4xl">James Lee · RM Cockpit</h1>
      <p className="font-mono text-ink-soft mt-2">ID: RM-0001</p>
      <p className="font-body mt-4">
        Phase 6 placeholder — full cockpit lands in RMC-01..07 (sidebar, top bar, stats row,
        &quot;Needs You&quot; queue, &quot;AI Has Been Busy&quot; panel, 6-column portfolio kanban).
      </p>
      <Link href="/" className="font-mono text-signal-info underline mt-8 inline-block">
        ← back to /
      </Link>
    </main>
  )
}
