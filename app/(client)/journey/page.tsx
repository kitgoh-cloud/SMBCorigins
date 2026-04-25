// app/(client)/journey/page.tsx
// Phase 2 placeholder for SCAFF-06 client route group.
// Phase 5 (CJD-01) replaces this content but keeps the route path.

import Link from 'next/link'

export default function ClientJourneyPlaceholder() {
  return (
    <main className="bg-paper text-trad-green min-h-screen p-8">
      <p className="font-jp text-3xl">Yukiさん、ようこそ</p>
      <p className="font-body text-xl mt-4">Welcome, Yuki — Client Journey (Phase 5 placeholder)</p>
      <p className="font-body text-base mt-6 text-ink-soft">
        This page exists so SCAFF-06 (route groups) is provable. Phase 5 will fill in the full
        Client Journey Dashboard (bilingual greeting, 6-stage timeline, activity feed, team card) —
        the route /journey stays.
      </p>
      <Link href="/" className="font-mono text-signal-info underline mt-8 inline-block">
        ← back to /
      </Link>
    </main>
  )
}
