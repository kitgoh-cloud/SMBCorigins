// components/journey/StageTimeline.tsx — Phase 5 redo CJD-03 (revised).
//
// Server Component (no 'use client'). Renders the 6-stage pill strip + 5
// connectors + 1 AIPulseDot adjacent to the current pill. Consumed by
// ApplicationCard (Plan 05-05); does NOT have its own <section> wrapper or
// eyebrow — those concerns live in ApplicationCard's left column.
//
// Decisions covered:
//   D-16 (P-1 strict inert, OD5R-04): pills are inert — no <a>, no <Link>, no onClick.
//   D-17: StagePill size={34} (chrome-metric exception from prototype 05bee446.js:61).
//   D-18: AIPulseDot adjacent to current pill, ariaLabel override.
//   D-32 (W-01): no transition/focus styles since pills are inert (nothing to transition).
//   RESEARCH §3.5: stageStatusToPillState adapter from lib/cjd.ts.

import type { CSSProperties, ReactElement } from 'react'
import { Fragment } from 'react'
import type { Stage } from '@/types/origin'
import { AIPulseDot, StagePill } from '@/components/primitives'
import { stageStatusToPillState } from '@/lib/cjd'
import { STAGE_NAMES } from '@/lib/stages'

export type StageTimelineProps = {
  stages: readonly Stage[]
}

const GRID_TEMPLATE: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'auto 1fr auto 1fr auto 1fr auto 1fr auto 1fr auto',
  alignItems: 'center',
}

export function StageTimeline({ stages }: StageTimelineProps): ReactElement {
  return (
    <ol className="list-none p-0 m-0 w-full" style={GRID_TEMPLATE}>
      {stages.map((stage, idx) => {
        const pillState = stageStatusToPillState(stage.status)
        const isLast = idx === stages.length - 1
        const next = isLast ? null : stages[idx + 1]
        const connectorComplete =
          stage.status === 'complete' && next != null && next.status === 'complete'
        const connectorClass = connectorComplete ? 'bg-trad-green' : 'bg-mist'
        const isCurrent = pillState === 'current'
        return (
          <Fragment key={stage.number}>
            <li className="flex flex-col items-center">
              <div className="relative flex items-center">
                <StagePill n={stage.number} state={pillState} size={34} />
                {isCurrent && (
                  <span className="ml-2">
                    <AIPulseDot ariaLabel="AI is processing your documents" />
                  </span>
                )}
              </div>
              <div
                data-stage-label
                className="mt-2 text-center"
                style={{
                  fontSize: 11,
                  fontWeight: isCurrent ? 500 : 400,
                  color: isCurrent ? 'var(--color-ink)' : 'var(--color-ink-muted)',
                  maxWidth: 80,
                  minHeight: '2.4em',
                  lineHeight: 1.2,
                }}
              >
                {STAGE_NAMES[stage.number]}
              </div>
            </li>
            {!isLast && (
              <li className="flex items-center" style={{ marginTop: -18 }}>
                <span
                  aria-hidden="true"
                  className={`h-[2px] w-full block mx-1 ${connectorClass}`}
                />
              </li>
            )}
          </Fragment>
        )
      })}
    </ol>
  )
}
