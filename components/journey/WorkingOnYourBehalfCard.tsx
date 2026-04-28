// components/journey/WorkingOnYourBehalfCard.tsx — Phase 5 redo CJD-04 + CJD-07 AI lane.
//
// Server Component. Renamed from archive AILaneCard / NarrativeRow to drop
// the 2-lane mental model. Stage 3 lock with static demo data from
// STAGE_3_AI_TASKS.
//
// Decisions covered: D-21 (Stage 3 lock), D-22 (AILaneRow live uses AIPulseDot
// primitive instead of inline ai-pulse class), D-31 (lib/cjd module),
// D-32 (paired-card narrative pattern), W-01 (Phase 4 interaction-state
// timing — N/A here, card is inert), P-5 (primary AI-presence surface).
//
// File IS in .freshgreen-allowlist (added by Plan 05-02). The card is the
// dashboard's primary AI-presence surface and uses fresh-green-tinted
// background + 35%-opacity fresh-green border. AILaneRow has fresh-green-20%
// bottom borders + a 6×6 fresh-green pending dot. The "— Origin" attribution
// in the quote uses var(--color-trad-green) (NOT fresh-green) — tested
// defensively against fresh-green leak (T-05R-20).

import type { ReactElement } from 'react'
import { AIBadge, AIPulseDot, Eyebrow, Icon } from '@/components/primitives'
import { STAGE_3_AI_TASKS, type AILaneState } from '@/lib/cjd'

export function WorkingOnYourBehalfCard(): ReactElement {
  return (
    <section
      className="relative bg-paper border rounded-[12px] p-6"
      style={{
        background:
          'linear-gradient(180deg, var(--color-fresh-green-glow), transparent 60%), var(--color-paper)',
        borderColor: 'rgba(191, 215, 48, 0.35)',
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center" style={{ gap: 10 }}>
          <AIBadge label="Origin" />
          <Eyebrow>Working on your behalf</Eyebrow>
        </div>
        <AIPulseDot ariaLabel="AI activity" />
      </div>
      {STAGE_3_AI_TASKS.map((task) => (
        <AILaneRow
          key={task.id}
          text={task.text}
          meta={task.meta}
          state={task.state}
        />
      ))}
      <hr
        className="border-0 h-px bg-mist"
        style={{ margin: '14px 0 12px' }}
        aria-hidden="true"
      />
      <div
        className="italic"
        style={{ fontSize: 12, color: 'var(--color-ink-muted)' }}
      >
        {"I'll flag anything you need to decide — otherwise the work just moves forward."}
        <span
          style={{
            color: 'var(--color-trad-green)',
            fontStyle: 'normal',
            marginLeft: 6,
          }}
        >
          {'— Origin'}
        </span>
      </div>
    </section>
  )
}

type AILaneRowProps = {
  text: string
  meta: string
  state: AILaneState
}

function AILaneRow({ text, meta, state }: AILaneRowProps): ReactElement {
  return (
    <div
      className="flex items-start py-2.5"
      style={{ gap: 10, borderBottom: '1px solid rgba(191, 215, 48, 0.2)' }}
    >
      <div className="flex-shrink-0" style={{ marginTop: 5 }}>
        {state === 'live' ? (
          <AIPulseDot ariaLabel="AI live task" />
        ) : state === 'done' ? (
          <Icon
            name="check"
            size={14}
            style={{ color: 'var(--color-trad-green)' }}
          />
        ) : (
          <span
            className="inline-block rounded-full"
            style={{
              width: 6,
              height: 6,
              background: 'var(--color-fresh-green)',
            }}
            aria-hidden="true"
          />
        )}
      </div>
      <div className="flex-1">
        <div style={{ fontSize: 13, color: 'var(--color-ink)' }}>{text}</div>
        <div
          className="font-mono"
          style={{
            fontSize: 11,
            color: 'var(--color-ink-muted)',
            marginTop: 3,
          }}
        >
          {meta}
        </div>
      </div>
    </div>
  )
}
