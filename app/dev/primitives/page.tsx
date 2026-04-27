'use client'

// app/dev/primitives/page.tsx — Phase 4 SHELL-04 acceptance demo page (D-80, D-85).
//
// Lives outside both route groups (no ClientShell, no RMShell wraps it).
// ALLOWLISTED in .freshgreen-allowlist (D-85, Plan 04-11) because it renders
// the AI-presence primitives (AIPulseDot, AIBadge, StatusChip kind="ai").
//
// 'use client' required: ActionCard onClick handlers cannot be serialized as
// RSC props during static prerender (Next.js prerender constraint).
// Static JSX content (UI-SPEC OD-11) — copy-paste-friendly; each primitive in every
// state. Plan-phase decided static over iteration for grep-ability.

import type { ReactNode } from 'react'
import {
  Eyebrow,
  StatusChip,
  StagePill,
  AIPulseDot,
  AIBadge,
  ActionCard,
  Icon,
  Avatar,
  type AvatarColor,
  type IconName,
  type StatusChipKind,
  type StagePillState,
} from '@/components/primitives'

const ALL_AVATAR_COLORS: ReadonlyArray<AvatarColor> = [
  'trad-green', 'trad-green-soft', 'trad-green-deep', 'ink', 'ink-muted', 'paper', 'mist',
]

const ALL_ICON_NAMES: ReadonlyArray<IconName> = [
  'app-folder', 'arrow-right', 'arrow-up-right', 'bank', 'bell', 'bolt',
  'calendar', 'check', 'chevron-down', 'chevron-right', 'clock', 'close',
  'cockpit', 'copilot', 'credit', 'docs', 'dot', 'edit', 'external',
  'filter', 'globe', 'help', 'mail', 'paperclip', 'pipeline', 'refresh',
  'rocket', 'search', 'send', 'shield', 'sparkle', 'stack', 'tree',
  'upload', 'users', 'yen',
]

const ALL_STATUS_KINDS: ReadonlyArray<StatusChipKind> = [
  'ok', 'ai', 'amber', 'ghost', 'red', 'info',
]

const ALL_STAGE_STATES: ReadonlyArray<StagePillState> = [
  'done', 'current', 'upcoming',
]

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="mb-12 pb-8 border-b border-mist last:border-b-0">
      <h2 className="font-display text-[16px] font-semibold mb-1">{title}</h2>
      {hint ? <p className="font-mono text-[10px] text-ink-muted mb-4">{hint}</p> : null}
      <div className="flex flex-wrap items-center gap-4">{children}</div>
    </section>
  )
}

export default function PrimitivesDemoPage() {
  return (
    <main className="bg-paper min-h-[calc(100vh-56px)] px-12 py-12 max-w-[1200px] mx-auto">
      <header className="mb-12">
        <h1 className="font-display text-[16px] font-semibold mb-2">Primitives — SHELL-04</h1>
        <p className="font-body text-[14px] text-ink-soft">
          Phase 4 design contract — every primitive in every state. Allowlisted for SHELL-05.
        </p>
      </header>

      {/* 1. Eyebrow */}
      <Section title="1. Eyebrow" hint="<Eyebrow>BY SMBC</Eyebrow>">
        <Eyebrow>BY SMBC</Eyebrow>
        <Eyebrow>DEMO</Eyebrow>
        <Eyebrow>TREASURER</Eyebrow>
        <Eyebrow>RELATIONSHIP MGR</Eyebrow>
      </Section>

      {/* 2. StatusChip */}
      <Section title="2. StatusChip" hint='<StatusChip kind="ai">Origin</StatusChip>'>
        {ALL_STATUS_KINDS.map((kind) => (
          <StatusChip key={kind} kind={kind}>
            {kind}
          </StatusChip>
        ))}
        {ALL_STATUS_KINDS.map((kind) => (
          <StatusChip key={`${kind}-nodot`} kind={kind} dot={false}>
            {kind} (no dot)
          </StatusChip>
        ))}
      </Section>

      {/* 3. StagePill */}
      <Section title="3. StagePill" hint='<StagePill n={1} state="done" />'>
        {ALL_STAGE_STATES.map((state) => (
          <div key={state} className="flex flex-col items-center gap-2">
            <Eyebrow>{state}</Eyebrow>
            <div className="flex gap-2">
              {([1, 2, 3, 4, 5, 6] as const).map((n) => (
                <StagePill key={`${state}-${n}`} n={n} state={state} />
              ))}
            </div>
          </div>
        ))}
      </Section>

      {/* 4. AIPulseDot */}
      <Section title="4. AIPulseDot" hint="<AIPulseDot />">
        <AIPulseDot />
        <AIPulseDot ariaLabel="Origin is reviewing" />
      </Section>

      {/* 5. AIBadge */}
      <Section title="5. AIBadge" hint="<AIBadge />">
        <AIBadge />
        <AIBadge label="Origin · ready" />
        <AIBadge label="reviewing" />
      </Section>

      {/* 6. ActionCard */}
      <Section title="6. ActionCard" hint="<ActionCard title=... onClick=... />">
        <div className="flex flex-col gap-3 w-full max-w-[600px]">
          <ActionCard
            title="Submit beneficial-owner attestation"
            meta="2026-04-25 14:30 · Yuki"
            indicator={<StatusChip kind="amber" dot>Action</StatusChip>}
            cta={<Icon name="arrow-right" size={16} ariaLabel="open" />}
            onClick={() => {}}
          />
          <ActionCard
            title="Origin compiled the credit memo"
            meta="2026-04-25 13:14"
            indicator={<AIBadge />}
            onClick={() => {}}
          />
          <ActionCard
            title="Older entry — reduced visual weight"
            meta="2026-04-20 09:00"
            indicator={<StatusChip kind="ghost" dot>archived</StatusChip>}
            faint
          />
        </div>
      </Section>

      {/* 7. Icon */}
      <Section title="7. Icon (35 names)" hint='<Icon name="check" />'>
        {ALL_ICON_NAMES.map((name) => (
          <div key={name} className="flex flex-col items-center gap-1 w-20">
            <Icon name={name} ariaLabel={name} />
            <span className="font-mono text-[10px] text-ink-muted">{name}</span>
          </div>
        ))}
      </Section>

      {/* 8. Avatar */}
      <Section title="8. Avatar (7 colors, no fresh-green family)" hint='<Avatar initials="YT" color="trad-green-soft" />'>
        {ALL_AVATAR_COLORS.map((color, idx) => (
          <div key={color} className="flex flex-col items-center gap-1">
            <Avatar
              initials={String.fromCharCode(65 + idx) + String.fromCharCode(65 + ((idx + 7) % 26))}
              color={color}
              textColor={color === 'paper' || color === 'mist' ? 'trad-green-deep' : 'paper'}
            />
            <span className="font-mono text-[10px] text-ink-muted">{color}</span>
          </div>
        ))}
      </Section>
    </main>
  )
}
