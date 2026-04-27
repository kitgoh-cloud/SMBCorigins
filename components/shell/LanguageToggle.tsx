// components/shell/LanguageToggle.tsx — Phase 4 SHELL-01 language toggle.
//
// VISUAL-ONLY per CLAUDE.md "Language: English only in UI body". Both segments
// render as <span> (NOT button, NOT Link) so they never receive focus per
// UI-SPEC Interaction States table line 405. Real i18n is deferred (CONTEXT
// "Deferred Ideas" — out of scope for v1).
//
// Active segment "EN" gets a subtle paper-tinted background (8% opacity) on
// the trad-green-deep chrome substrate so sighted users can read "EN is active"
// without thinking it's a button. The 日本語 segment is the inactive variant.
// No AI-reserved brand tokens used.

import type { ReactElement } from 'react'

export function LanguageToggle(): ReactElement {
  return (
    <span className="inline-flex items-center gap-1 text-[14px] font-medium" aria-label="Language">
      <span className="font-body text-paper bg-paper/8 px-2 py-0.5 rounded">
        EN
      </span>
      <span className="font-jp text-paper/70 px-2 py-0.5">
        日本語
      </span>
    </span>
  )
}
