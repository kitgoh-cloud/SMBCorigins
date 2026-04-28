// components/journey/ApplicationCard.tsx — Phase 5 redo CJD-02 + CJD-03 hero card.
//
// Server Component. Renders the application status hero card with stage numeral
// (OD5R-09: stage numeral, NOT countdown), ETA strip (OD5R-02b: slide-the-window
// date), embedded StageTimeline, and right-column key facts (products /
// jurisdictions / days-in-progress).
//
// OD5R-01: NO .card--hero::after bottom-edge gradient. File NOT allowlisted.
// OD5R-02: ETA date via formatBusinessDaysAhead(SERVER_DEMO_DATE, 2);
//          "5 business days" stays static for v1.
// OD5R-09: 76px stage numeral over /6, NOT 96px days countdown.
//
// Decisions covered: D-09, D-10, D-11, D-31, D-34 W-03, OD5R-01/02/09.

import type { ReactElement } from 'react'
import type { Application, Stage } from '@/types/origin'
import { Eyebrow } from '@/components/primitives'
import { StageTimeline } from '@/components/journey/StageTimeline'
import {
  SERVER_DEMO_DATE,
  formatBusinessDaysAhead,
  PRODUCT_DISPLAY_LABEL,
  JURISDICTION_FLAG,
} from '@/lib/cjd'
import { STAGE_NAMES } from '@/lib/stages'

export type ApplicationCardProps = {
  application: Application
  stages: readonly Stage[]
  daysIn: number
}

export function ApplicationCard({
  application,
  stages,
  daysIn,
}: ApplicationCardProps): ReactElement {
  const etaDate = formatBusinessDaysAhead(SERVER_DEMO_DATE, 2)
  const stageName = STAGE_NAMES[application.currentStage]
  const allJurisdictions = Array.from(
    new Set(['JP', ...application.targetJurisdictions]),
  )

  return (
    <section
      className="relative mb-6 overflow-hidden rounded-[18px] border border-mist bg-paper p-8"
      style={{
        boxShadow:
          '0 1px 2px rgba(10, 20, 16, 0.04), 0 8px 24px rgba(10, 20, 16, 0.04)',
      }}
    >
      <div
        className="grid"
        style={{ gridTemplateColumns: '1.4fr 1fr', gap: 40 }}
      >
        {/* LEFT COLUMN — stage numeral + ETA + StageTimeline */}
        <div>
          <Eyebrow className="mb-4">
            {`Application · ${application.id.toUpperCase()}`}
          </Eyebrow>

          <div className="mb-1 flex items-baseline gap-3">
            <span
              className="text-trad-green-deep tabular-nums"
              style={{
                fontFamily: 'var(--font-fraunces)',
                fontSize: 76,
                lineHeight: 1,
                fontWeight: 400,
                fontVariationSettings: '"SOFT" 60, "WONK" 1',
                letterSpacing: '-0.055em',
              }}
            >
              {application.currentStage}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-fraunces)',
                fontSize: 28,
                color: 'var(--color-ink-muted)',
                fontWeight: 400,
                fontVariationSettings: '"SOFT" 60, "WONK" 0',
              }}
            >
              / 6
            </span>
          </div>

          <div
            className="mb-1 text-ink"
            style={{
              fontFamily: 'var(--font-fraunces)',
              fontSize: 20,
              fontWeight: 400,
            }}
          >
            {stageName}
          </div>

          <div className="mb-6 text-[14px] text-ink-soft">
            Estimated completion ·{' '}
            <strong className="font-medium text-ink">{etaDate}</strong> · 5
            business days
          </div>

          <StageTimeline stages={stages} />
        </div>

        {/* RIGHT COLUMN — key facts */}
        <div className="border-l border-mist pl-8">
          <Eyebrow className="mb-4">{"What you're applying for"}</Eyebrow>
          {application.productsRequested.map((p) => {
            const display = PRODUCT_DISPLAY_LABEL[p]
            return (
              <div key={p} className="mb-4">
                <div
                  style={{
                    fontSize: 14,
                    color: 'var(--color-ink)',
                    fontWeight: 500,
                  }}
                >
                  {display.label}
                </div>
                <div
                  style={{
                    fontSize: 12.5,
                    color: 'var(--color-ink-muted)',
                    marginTop: 2,
                  }}
                >
                  {display.detail}
                </div>
              </div>
            )
          })}
          <hr className="my-5 h-px border-0 bg-mist" />
          <div className="flex" style={{ gap: 24 }}>
            <div>
              <Eyebrow>Jurisdictions</Eyebrow>
              <div style={{ fontSize: 18, marginTop: 4 }}>
                {allJurisdictions
                  .map((j) => JURISDICTION_FLAG[j] ?? '')
                  .join(' ')}
              </div>
            </div>
            <div>
              <Eyebrow>In progress</Eyebrow>
              <div
                className="text-trad-green tabular-nums"
                style={{
                  fontFamily: 'var(--font-fraunces)',
                  fontSize: 20,
                  marginTop: 4,
                  fontWeight: 400,
                  fontVariationSettings: '"SOFT" 60, "WONK" 1',
                  letterSpacing: '-0.055em',
                }}
              >
                {`${daysIn} days`}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
