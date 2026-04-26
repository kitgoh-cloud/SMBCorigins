/**
 * lib/api.real.ts — Real Supabase implementation
 *
 * OWNED: Evan (@evangohAIO). Kit reviews on PR (CODEOWNERS).
 * Stub only — full implementation ships in PR #4b (evan/api-routes).
 */

import type { OriginAPI } from './api'

const todo = (): never => {
  throw new Error('[api.real] not implemented — PR #4b pending')
}

const realAPI: OriginAPI = {
  getApplication:       todo,
  getClientApplication: todo,
  getApplicationDetail: todo,
  getPortfolio:         todo,
  getEntities:          todo,
  getUBOs:              todo,
  getDocuments:         todo,
  getScreeningHits:     todo,
  getProducts:          todo,
  getCreditMemo:        todo,
  createApplication:    todo,
  submitIntake:         todo,
  getIntakeByToken:     todo,
  subscribeToPortfolio: todo,
}

export default realAPI
