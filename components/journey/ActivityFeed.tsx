// components/journey/ActivityFeed.tsx — Phase 5 redo CJD-05 activity feed (revised).
//
// Server Component. Adopts prototype row shape: <Time · 8px Indicator · **Actor** — text>.
// Top-6 truncation (D-29). LAST 72H header tag (D-27 prototype addition).
// AI-row dots use fresh-green via eventToDotColor — fresh-green allowlist coverage.
//
// Decisions covered: D-27 (prototype row shape), D-28 (eventToCopy carryforward),
// D-29 (top-6 truncation), D-30 (relative timestamp format), D-31 (lib/cjd module).

import type { ReactElement } from 'react'
import type { Activity } from '@/types/origin'
import { Eyebrow } from '@/components/primitives'
import {
  SERVER_DEMO_DATE,
  topNActivities,
  eventToCopy,
  eventToActorDisplay,
  eventToDotColor,
  formatActivityRelativeTime,
} from '@/lib/cjd'

export type ActivityFeedProps = {
  activities: readonly Activity[]
}

export function ActivityFeed({ activities }: ActivityFeedProps): ReactElement {
  const rows = topNActivities(activities, 6)
  return (
    <section className="relative bg-paper border border-mist rounded-[12px] p-6">
      <div className="flex items-center justify-between" style={{ marginBottom: 18 }}>
        <Eyebrow>Recent activity</Eyebrow>
        <span
          className="font-mono"
          style={{ fontSize: 11, color: 'var(--color-ink-muted)' }}
        >
          LAST 72H
        </span>
      </div>
      {rows.map((activity) => (
        <ActivityRow key={activity.id} activity={activity} />
      ))}
    </section>
  )
}

function ActivityRow({ activity }: { activity: Activity }): ReactElement {
  const t = formatActivityRelativeTime(activity.createdAt, SERVER_DEMO_DATE)
  const actor = eventToActorDisplay(activity)
  const text = eventToCopy(activity)
  const dotColor = eventToDotColor(activity)

  return (
    <div
      className="flex items-start py-2.5 border-b border-mist"
      style={{ gap: 14 }}
    >
      <div
        className="font-mono flex-shrink-0"
        style={{
          fontSize: 11,
          color: 'var(--color-ink-muted)',
          width: 80,
          paddingTop: 2,
        }}
      >
        {t}
      </div>
      <span
        className="rounded-full flex-shrink-0"
        style={{
          width: 8,
          height: 8,
          background: dotColor,
          marginTop: 6,
        }}
        aria-hidden="true"
      />
      <div className="flex-1">
        <span style={{ fontSize: 13, color: 'var(--color-ink)' }}>
          <strong style={{ fontWeight: 500 }}>{actor}</strong>
          <span style={{ color: 'var(--color-ink-soft)' }}>
            {` — ${text}`}
          </span>
        </span>
      </div>
    </div>
  )
}
