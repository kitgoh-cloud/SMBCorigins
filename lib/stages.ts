import type { Application, Stage, StageNumber } from '@/types/origin'

export const STAGE_NAMES: Record<StageNumber, string> = {
  1: 'Invite & Intent',
  2: 'Entity & Structure',
  3: 'Documentation',
  4: 'Screening',
  5: 'Products & Credit',
  6: 'Activation',
}

export function deriveStages(app: Application): Stage[] {
  return ([1, 2, 3, 4, 5, 6] as StageNumber[]).map((n) => ({
    number: n,
    name: STAGE_NAMES[n],
    status:
      n < app.currentStage  ? 'complete'
      : n === app.currentStage ? 'in_progress'
      : 'not_started',
    completedAt: null,
  }))
}
