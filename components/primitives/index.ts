// components/primitives/index.ts — Phase 4 SHELL-04 barrel export.
//
// Re-exports the 8 primitives + their public types so consumers can import
// from a single path: `import { Eyebrow, StatusChip, ... } from '@/components/primitives'`.
//
// Explicit named re-exports (NOT `export *`) — keeps the barrel self-documenting
// and tree-shake friendly. Alphabetical ordering for readability.

// Components (alphabetical)
export { ActionCard } from './ActionCard'
export { AIBadge } from './AIBadge'
export { AIPulseDot } from './AIPulseDot'
export { Avatar } from './Avatar'
export { Eyebrow } from './Eyebrow'
export { Icon } from './Icon'
export { StagePill } from './StagePill'
export { StatusChip } from './StatusChip'

// Public types (alphabetical)
export type { ActionCardProps } from './ActionCard'
export type { AIBadgeProps } from './AIBadge'
export type { AIPulseDotProps } from './AIPulseDot'
export type { AvatarColor, AvatarProps } from './Avatar'
export type { EyebrowProps } from './Eyebrow'
export type { IconName, IconProps } from './Icon'
export type { StagePillProps, StagePillState } from './StagePill'
export type { StatusChipKind, StatusChipProps } from './StatusChip'
