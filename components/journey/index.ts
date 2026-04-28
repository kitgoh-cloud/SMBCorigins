// components/journey/index.ts — Phase 5 redo barrel (CJD-01..07).
//
// Exports the 6 dashboard compositions consumed by app/(client)/journey/page.tsx.
// Mirrors components/primitives/index.ts shape — explicit named re-exports,
// alphabetical ordering. StageTimeline is intentionally NOT exported here —
// it is internal to ApplicationCard.

export { ActivityFeed } from './ActivityFeed'
export type { ActivityFeedProps } from './ActivityFeed'

export { ApplicationCard } from './ApplicationCard'
export type { ApplicationCardProps } from './ApplicationCard'

export { AttentionCard } from './AttentionCard'

export { GreetingBlock } from './GreetingBlock'

export { TeamCard } from './TeamCard'
export type { TeamCardProps } from './TeamCard'

export { WorkingOnYourBehalfCard } from './WorkingOnYourBehalfCard'
