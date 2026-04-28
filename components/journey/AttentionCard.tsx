// components/journey/AttentionCard.tsx — Phase 5 redo CJD-04 (action queue card).
//
// Server Component. Stage 3 lock with static demo data from STAGE_3_ATTENTION_ITEMS.
// Strict P-1 inert per OD5R-04: rows are <div>, no onClick, no cursor-pointer.
//
// Decisions covered: D-19 (Stage 3 lock), D-20 (ActionRow as div).
// OD5R resolution: OD5R-04 (strict inert).
//
// NO fresh-green surfaces; file NOT in .freshgreen-allowlist. Indicator dots use
// var(--color-signal-amber) (rows 1+2) and var(--color-ink-faint) (row 3, faint).

import type { ReactElement } from 'react'
import { Eyebrow, Icon, StatusChip } from '@/components/primitives'
import { STAGE_3_ATTENTION_ITEMS } from '@/lib/cjd'

export function AttentionCard(): ReactElement {
  const count = STAGE_3_ATTENTION_ITEMS.length
  return (
    <section className="relative bg-paper border border-mist rounded-[12px] p-6">
      <div className="flex items-center justify-between mb-4">
        <Eyebrow>{`For your attention · ${count}`}</Eyebrow>
        <StatusChip kind="amber">Due this week</StatusChip>
      </div>
      {STAGE_3_ATTENTION_ITEMS.map((item, idx) => (
        <ActionRow
          key={item.id}
          title={item.title}
          meta={item.meta}
          faint={idx === 2}
        />
      ))}
    </section>
  )
}

type ActionRowProps = {
  title: string
  meta: string
  faint?: boolean
}

function ActionRow({ title, meta, faint = false }: ActionRowProps): ReactElement {
  return (
    <div
      className="flex items-center gap-3 py-3 border-b border-mist"
      style={{ opacity: faint ? 0.7 : 1 }}
    >
      <span
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{
          background: faint
            ? 'var(--color-ink-faint)'
            : 'var(--color-signal-amber)',
        }}
        aria-hidden="true"
      />
      <div className="flex-1">
        <div style={{ fontSize: 13.5, color: 'var(--color-ink)', fontWeight: 500 }}>
          {title}
        </div>
        <div style={{ fontSize: 12, color: 'var(--color-ink-muted)', marginTop: 2 }}>
          {meta}
        </div>
      </div>
      <Icon name="chevron-right" size={16} style={{ color: 'var(--color-ink-muted)' }} />
    </div>
  )
}
