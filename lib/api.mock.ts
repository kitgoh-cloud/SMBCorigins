/**
 * lib/api.mock.ts — Mock implementation of OriginAPI
 *
 * OWNED: Kit (@kitgoh-cloud). Evan reviews on PR (CODEOWNERS).
 * Filled in during Phase 3 (Shared Boundary) using data/seed.ts.
 *
 * This stub satisfies the TypeScript module reference in lib/api.ts
 * until Kit's Phase 3 implementation lands.
 */

import type { OriginAPI } from './api'

const mockAPI: OriginAPI = {
  getApplication:       () => Promise.reject(new Error('mock not implemented yet')),
  getClientApplication: () => Promise.reject(new Error('mock not implemented yet')),
  getApplicationDetail: () => Promise.reject(new Error('mock not implemented yet')),
  getPortfolio:         () => Promise.reject(new Error('mock not implemented yet')),
  getEntities:          () => Promise.reject(new Error('mock not implemented yet')),
  getUBOs:              () => Promise.reject(new Error('mock not implemented yet')),
  getDocuments:         () => Promise.reject(new Error('mock not implemented yet')),
  getScreeningHits:     () => Promise.reject(new Error('mock not implemented yet')),
  getProducts:          () => Promise.reject(new Error('mock not implemented yet')),
  getCreditMemo:        () => Promise.reject(new Error('mock not implemented yet')),
  createApplication:    () => Promise.reject(new Error('mock not implemented yet')),
  submitIntake:         () => Promise.reject(new Error('mock not implemented yet')),
  getIntakeByToken:     () => Promise.reject(new Error('mock not implemented yet')),
}

export default mockAPI
