// components/journey/TeamCard.tsx — Phase 5 redo CJD-06 team list (revised).
//
// Server Component. Multi-member card: James Lee (RM), Akiko Sato (Credit
// Analyst), Priya Nair (KYC Ops Lead), Origin (AI). Origin avatar uses
// fresh-green — the only fresh-green Avatar in the dashboard.
//
// Decisions covered: D-23 (TEAM_MEMBERS constant), D-24 (AvatarColor enum
// extension), D-25 (textColor prop), D-26 (Message James inert).
// OD5R resolutions: OD5R-04 (button inert), OD5R-05 (closed enum), OD5R-06
// (constant for v1 — migration path documented in CONTEXT.md).

import type { ReactElement } from 'react'
import type { User } from '@/types/origin'
import { Avatar, Eyebrow, Icon } from '@/components/primitives'
import { TEAM_MEMBERS, type TeamMember } from '@/lib/cjd'

export type TeamCardProps = {
  rm: User
}

export function TeamCard({ rm: _rm }: TeamCardProps): ReactElement {
  // The `rm` prop is currently unused — TEAM_MEMBERS is the canonical source
  // for v1 (OD5R-06). Kept in the signature for the seed migration path.
  return (
    <section className="relative bg-paper border border-mist rounded-[12px] p-6">
      <Eyebrow className="mb-4">Your team</Eyebrow>
      {TEAM_MEMBERS.map((member) => (
        <TeamMemberRow key={member.name} member={member} />
      ))}
      <button
        type="button"
        disabled
        aria-disabled="true"
        className="w-full mt-1.5 flex items-center justify-center gap-2 rounded-md border border-mist-deep px-4 py-1.5 text-[12px] font-medium text-ink transition-colors duration-200 ease-out hover:bg-paper-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-trad-green disabled:cursor-not-allowed"
      >
        <Icon name="mail" size={14} />
        Message James
      </button>
    </section>
  )
}

function TeamMemberRow({ member }: { member: TeamMember }): ReactElement {
  return (
    <div className="flex items-center" style={{ gap: 12, marginBottom: 14 }}>
      <Avatar
        initials={member.initials}
        color={member.color}
        textColor={member.textColor}
        size={34}
      />
      <div>
        <div style={{ fontSize: 13, color: 'var(--color-ink)', fontWeight: 500 }}>
          {member.name}
        </div>
        <div style={{ fontSize: 11, color: 'var(--color-ink-muted)' }}>
          {`${member.role} · ${member.location}`}
        </div>
      </div>
    </div>
  )
}
