// app/(client)/journey/page.tsx — Phase 5 redo Client Journey Dashboard (CJD-01..07).
//
// Server Component. Replaces Phase 2 placeholder. Composes the 4-section
// dashboard from the components/journey/ barrel.
//
// Decisions covered: D-01 (renders directly inside ClientShell — no own
// max-width or padding), D-02 (relative wrapper for watermark clipping),
// D-03 (no space-y band stack — explicit per-section margins), D-08 (single
// api round-trip), D-31 (lib/cjd module).
//
// OD5R resolutions: OD5R-01 (no hero card gradient), OD5R-02 (slide-the-window
// ETA), OD5R-03 (47 fields static), OD5R-04 (strict inert nav surfaces),
// OD5R-05 (Avatar closed enum extension), OD5R-06 (TEAM_MEMBERS constant),
// OD5R-07 (paired-card narrative), OD5R-09 (stage numeral hero).

import type { ReactElement } from 'react'
import { api } from '@/lib/api'
import {
  ActivityFeed,
  ApplicationCard,
  AttentionCard,
  GreetingBlock,
  TeamCard,
  WorkingOnYourBehalfCard,
} from '@/components/journey'
import { SERVER_DEMO_DATE, computeDaysIn } from '@/lib/cjd'

export default async function ClientJourneyPage(): Promise<ReactElement> {
  const detail = await api.getApplicationDetail('app-kaisei')
  const daysIn = computeDaysIn(detail.application.openedAt, SERVER_DEMO_DATE)

  return (
    <div className="relative">
      <GreetingBlock />
      <ApplicationCard
        application={detail.application}
        stages={detail.stages}
        daysIn={daysIn}
      />
      <div
        className="grid mb-6"
        style={{ gridTemplateColumns: '1.2fr 1.2fr 0.9fr', gap: 20 }}
      >
        <AttentionCard />
        <WorkingOnYourBehalfCard />
        <TeamCard rm={detail.rm} />
      </div>
      <ActivityFeed activities={detail.recentActivities} />
    </div>
  )
}
