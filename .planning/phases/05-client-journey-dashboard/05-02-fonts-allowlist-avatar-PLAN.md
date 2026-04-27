---
phase: 5
plan: 05-02
title: Primitive infra — Noto Sans JP 300, design tokens, Avatar enum extension, Eyebrow style prop, allowlist
wave: 1
depends_on: [05-01]
files_modified:
  - app/layout.tsx
  - app/globals.css
  - components/primitives/Avatar.tsx
  - components/primitives/Avatar.test.tsx
  - components/primitives/Eyebrow.tsx
  - components/primitives/Eyebrow.test.tsx
  - .freshgreen-allowlist
  - lib/cjd.ts
autonomous: true
requirements_addressed: [CJD-02, CJD-06, CJD-07]
od5r_resolutions: [OD5R-05]
estimated_minutes: 75
---

<objective>
Land the Phase 5 primitive-infra changes that the Wave 2 components depend on:

1. **Noto Sans JP weight 300** in `app/layout.tsx` `next/font` config — the 縁 watermark requires it (P-2', D-05). Explicitly DO NOT add weight 200 (the archive's incorrect weight); explicitly remove weight 200 if any prior change added it.
2. **3 new design tokens in `app/globals.css` `@theme` block**:
   - `--color-warm-amber: #8a5e0a` (Priya Nair's avatar — D-23, D-24)
   - `--color-ink-faint: #AEB4AB` (AttentionCard 3rd-row faint indicator dot — Plan 05-06 dependency; matches prototype `:root.--ink-faint`)
   - `--color-mist-deep: #D9E0D4` (TeamCard "Message James" button border + chrome-ghost surfaces — Plan 05-09 dependency; matches prototype `:root.--mist-deep`)
3. **`AvatarColor` closed-enum extension** in `components/primitives/Avatar.tsx`: add `'signal-info'`, `'warm-amber'`, `'fresh-green'` to the union (OD5R-05). Update `BG_BY_COLOR` and `TEXT_BY_COLOR` maps with corresponding entries. Note: the `textColor` prop **already exists** in Phase 4 (defaults to `'paper'`); this plan does NOT add the prop, only extends the underlying union which the prop accepts. (D-24 covers the union extension; D-25's "textColor prop is added" wording in CONTEXT.md is informational continuity — the prop is in fact pre-existing from Phase 4 D-78.)
4. **`Eyebrow` primitive `style` prop** — additive change: forward `style?: CSSProperties` through to the underlying `<span>`. Wave 2 components (`StageTimeline`, `GreetingBlock`) need to set inline metric-exception styles (font-weight 500 on current pill name; 10px eyebrow margin in greeting) on Eyebrow instances. The Phase 4 primitive currently accepts only `{children, className}`; this plan extends it to `{children, className, style}`. Backward-compatible (no consumer change required).
5. **`.freshgreen-allowlist` entries** — 5 NEW entries (alphabetical):
   - `components/journey/ActivityFeed.tsx` — AI-actor indicator dot
   - `components/journey/TeamCard.tsx` — Origin avatar
   - `components/journey/WorkingOnYourBehalfCard.tsx` — `card--ai` background + AILaneRow surfaces
   - `components/primitives/Avatar.tsx` — new fresh-green color variant
   - `lib/cjd.ts` — `eventToDotColor` returns `var(--color-fresh-green)` literals (matches `scripts/check-fresh-green.sh` patterns 2 + 4)
   The 縁 watermark surface (`GreetingBlock.tsx`) is **NOT** added — watermark is trad-green per D-04. Hero card surface (`ApplicationCard.tsx`) is **NOT** added — bottom gradient skipped per OD5R-01.
6. **Avatar test updates**: existing Phase 4 tests at lines 68-77 of `Avatar.test.tsx` (asserting "exactly 7 members" and "excludes fresh-green family") will fail under the extension and MUST be revised, not just appended. Plus new tests for the 3 added colors. (See Task 4 — explicit modify-not-append flow.)
7. **Eyebrow test update**: add a test that inline `style` is forwarded to the rendered `<span>`.
8. **`lib/cjd.ts` cleanup**: remove the transient `as AvatarColor` casts on TEAM_MEMBERS literals introduced by Plan 05-01.

This plan unblocks every Wave 2 component. The Wave 1 sequential ordering 05-01 → 05-02 → 05-03 is load-bearing.
</objective>

<must_haves>
- `app/layout.tsx` `Noto_Sans_JP({...})` call passes `weight: ['300', '400']` (300 for watermark, 400 for normal JP body — the existing variable-mode default). The annotation comment must read: `// Phase 5 watermark exception (P-2'): weight 300 for the 縁 glyph at 0.035 opacity. NOT a typography weight — single off-canvas decorative use only. See .planning/phases/05-client-journey-dashboard/05-CONTEXT.md P-2'.` Verify the call does NOT include `'200'`.
- `app/globals.css` `@theme` block has 3 new tokens (alongside existing `--color-fresh-green-glow`):
  - `--color-warm-amber: #8a5e0a;`
  - `--color-ink-faint: #AEB4AB;`
  - `--color-mist-deep: #D9E0D4;`
  Tailwind v4 generates `bg-*`, `text-*`, `border-*` utilities for each automatically.
- `components/primitives/Avatar.tsx` `AvatarColor` union includes the 3 new values: `'signal-info'`, `'warm-amber'`, `'fresh-green'` (extends the existing 7-member union to 10 members). The `BG_BY_COLOR` map has corresponding entries: `'signal-info': 'bg-signal-info'`, `'warm-amber': 'bg-warm-amber'`, `'fresh-green': 'bg-fresh-green'`. The `TEXT_BY_COLOR` map (already present in Phase 4) gains the same 3 keys: `'signal-info': 'text-signal-info'`, `'warm-amber': 'text-warm-amber'`, `'fresh-green': 'text-fresh-green'`.
- The Phase 4 `textColor?: AvatarColor` prop is preserved unchanged (default `'paper'`). No new prop is introduced; the union extension is the only change.
- `Avatar.test.tsx` is **updated, not just appended**:
  - Existing test `'AvatarColor enum has exactly 7 members (Plan 04-05 lock)'` (line 68-70 in the current file) → updated to **10** members (the Phase 5 lock).
  - Existing test `'AvatarColor enum excludes fresh-green family (D-78)'` (line 72-77) → **inverted**: the closed enum now includes `'fresh-green'`. Renamed to `'AvatarColor enum includes fresh-green for the AI Origin avatar (D-24, OD5R-05)'`. The test asserts that `'fresh-green'` IS in the enum but `'fresh-green-mute'` and `'fresh-green-glow'` are NOT (the AI variant only — no soft/glow leakage).
  - The existing test `'default textColor is "paper"'` (line 54-58) and `'textColor prop overrides the default'` (line 60-66) remain unchanged.
  - **New tests appended** for: `color='fresh-green'` produces `bg-fresh-green`; `color='signal-info'` produces `bg-signal-info`; `color='warm-amber'` produces `bg-warm-amber`; `textColor='trad-green-deep'` produces `text-trad-green-deep` (verifying the existing prop accepts the existing union value — already covered, but re-asserted in the redo's test set for clarity).
- `components/primitives/Eyebrow.tsx` accepts a `style?: CSSProperties` prop. The prop is forwarded to the rendered `<span>`. `EyebrowProps` extended from `{children: ReactNode; className?: string}` to `{children: ReactNode; className?: string; style?: CSSProperties}`. Import `CSSProperties` from `react`.
- `components/primitives/Eyebrow.test.tsx` has a new test verifying inline style is applied — e.g., `<Eyebrow style={{ marginBottom: 10 }}>Date</Eyebrow>` renders a span with `style.marginBottom === '10px'`. Existing Eyebrow tests preserved.
- `.freshgreen-allowlist` adds these 5 file paths (alphabetical insertion):
  - `components/journey/ActivityFeed.tsx`
  - `components/journey/TeamCard.tsx`
  - `components/journey/WorkingOnYourBehalfCard.tsx`
  - `components/primitives/Avatar.tsx`
  - `lib/cjd.ts` (the `eventToDotColor` returns `var(--color-fresh-green)` literal strings; this matches `scripts/check-fresh-green.sh` patterns 2 and 4, so the allowlist entry is **load-bearing** — without it the gate fails at the Wave 1 → Wave 2 boundary)
- `.freshgreen-allowlist` does NOT add `components/journey/GreetingBlock.tsx` (watermark is trad-green per D-04; not a fresh-green surface).
- `.freshgreen-allowlist` does NOT add `components/journey/ApplicationCard.tsx` (hero card bottom gradient skipped per OD5R-01; no fresh-green surfaces).
- `lib/cjd.ts` `as AvatarColor` casts in `TEAM_MEMBERS` (added in Plan 05-01) are removed in this plan — Task 5 cleanup.
- All tests pass: `npm run test` exits 0.
- Typecheck passes: `npm run typecheck` exits 0 (the `lib/cjd.ts` literals now satisfy the extended union without casts).
- Lint passes: `npm run lint` exits 0.
- `npm run dev` starts without error (font loading verified — Noto Sans JP 300 fetched successfully via `next/font`).
- `scripts/check-fresh-green.sh` exits 0 (allowlist consistent; no leakage).

**Note on `lib/cjd.ts` allowlist entry:** The SHELL-05 grep (`scripts/check-fresh-green.sh`) has 5 patterns. Pattern 2 (`--color-fresh-green(-[a-z0-9]+)?`) and pattern 4 (`\[var\(--color-fresh-green`) both match the literal string `'var(--color-fresh-green)'` that `eventToDotColor` returns for AI rows. The allowlist entry is therefore **required**, not defensive — without it the SHELL-05 gate fails for `lib/cjd.ts` at the Wave 1 → Wave 2 boundary. The Wave 1 sequential ordering (05-01 introduces `lib/cjd.ts`, 05-02 lands the allowlist entry) is load-bearing for gate compliance.
</must_haves>

<threat_model>
**Trust boundaries:** None new. All changes are within the application's own type system or design tokens.

| Threat ID | Category | Component | Disposition | Mitigation |
|-----------|----------|-----------|-------------|------------|
| T-05R-04 | Policy bypass (closed-enum extension drift) | `AvatarColor` union | mitigate | The 3 new values are added to the closed union — TypeScript prevents callers from passing arbitrary strings. SHELL-05 grep continues to scan the file for `bg-fresh-green` token usage, which is correctly emitted by `BG_BY_COLOR['fresh-green']`. |
| T-05R-05 | Bundle hygiene (font weight bloat) | `next/font` Noto Sans JP | mitigate | Only weight 300 added; weight 200 (archive's incorrect value) NOT added or explicitly removed. Variable-mode `'400'` retained. Verifying via the explicit `weight: ['300', '400']` array. |
| T-05R-06 | Fresh-green policy bypass | `Avatar.tsx` fresh-green new value | mitigate | `Avatar.tsx` added to `.freshgreen-allowlist` in this plan. The closed-enum extension is type-system-policed. The Phase 4 D-78 invariant ("Avatar primitive cannot accept fresh-green") was the second line of defense for SHELL-05; the redo lifts it for the AI-only Origin avatar with explicit allowlist coverage. |
| T-05R-07 | XSS / token injection | `--color-warm-amber` definition | accept | Static CSS token; not a runtime value. |

</threat_model>

<tasks>

<task type="auto">
  <name>Task 1: Add Noto Sans JP weight 300 to next/font config</name>
  <read_first>
    - app/layout.tsx (current `Noto_Sans_JP({...})` call signature)
    - .planning/phases/05-client-journey-dashboard/05-CONTEXT.md P-2'
    - .planning/phases/05-client-journey-dashboard/05-CONTEXT.md D-05, D-06
  </read_first>
  <action>
Modify `app/layout.tsx`:
- The current `Noto_Sans_JP({ subsets: ['latin'], variable: '--font-noto-sans-jp', display: 'swap' })` call has no `weight` arg. Add `weight: ['300', '400']` and the documenting comment immediately above:
```ts
// D-32: Noto Sans JP — subsets: ['latin'] only. JP characters auto-load via unicode-range.
// Phase 5 watermark exception (P-2'): weight 300 for the 縁 glyph at 0.035 opacity.
// NOT a typography weight — single off-canvas decorative use only.
// See .planning/phases/05-client-journey-dashboard/05-CONTEXT.md P-2'.
const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['300', '400'],
  variable: '--font-noto-sans-jp',
  display: 'swap',
})
```
- Verify the call does NOT include `'200'`.
  </action>
  <verify>
    - File diff shows only the `weight` array addition + comment.
    - `grep -n "'200'" app/layout.tsx` returns nothing.
    - `npm run dev` starts and the page loads without console errors.
  </verify>
</task>

<task type="auto">
  <name>Task 2: Add 3 new design tokens to globals.css</name>
  <read_first>
    - app/globals.css (existing @theme block; identify where signal-* and ink-* tokens are declared)
  </read_first>
  <action>
In `app/globals.css` `@theme` block, add 3 tokens. Place each adjacent to its semantic grouping:

```css
/* Phase 5 — chrome metric expansions (D-23, D-24, AttentionCard 3rd-row faint, TeamCard ghost button) */
--color-warm-amber: #8a5e0a;     /* Priya Nair avatar (Plan 05-09) */
--color-ink-faint: #AEB4AB;      /* AttentionCard 3rd-row faint indicator dot (Plan 05-06) */
--color-mist-deep: #D9E0D4;      /* TeamCard "Message James" button border (Plan 05-09) */
```

- `--color-warm-amber` next to existing `--color-signal-amber`, `--color-signal-info` (signal-family grouping).
- `--color-ink-faint` next to existing `--color-ink`, `--color-ink-muted` (ink-family grouping; matches prototype `:root.--ink-faint` exact value).
- `--color-mist-deep` next to existing `--color-mist` (mist-family grouping; matches prototype `:root.--mist-deep`).

No change to any existing tokens.
  </action>
  <verify>
    - `grep -n "warm-amber\|ink-faint\|mist-deep" app/globals.css` returns 3 new declarations.
    - `npm run build` succeeds; Tailwind v4 generates `bg-*`, `text-*`, `border-*` utilities for each token.
  </verify>
</task>

<task type="auto">
  <name>Task 3: Extend AvatarColor closed enum + extend BG_BY_COLOR / TEXT_BY_COLOR maps</name>
  <read_first>
    - components/primitives/Avatar.tsx (current type, BG_BY_COLOR + TEXT_BY_COLOR maps, render JSX — note: `textColor?: AvatarColor` prop ALREADY exists with default `'paper'`)
    - components/primitives/Avatar.test.tsx (existing tests; lines 68-77 will break)
    - .planning/phases/05-client-journey-dashboard/05-UI-SPEC.md §Component Specs > TeamCard
  </read_first>
  <action>
**Pre-condition:** the Phase 4 `AvatarProps` already declares `textColor?: AvatarColor` (line 42 of current Avatar.tsx) with default `'paper'` (line 49). The `TEXT_BY_COLOR` map already exists. The Phase 5 plan does NOT add a new prop or a new map — it extends the existing union, BG map, and TEXT map.

Modify `components/primitives/Avatar.tsx`:

1. **Update file header comment** to reflect Phase 5 enum extension:
```ts
// components/primitives/Avatar.tsx — Phase 4 SHELL-04 + Phase 5 D-24 enum extension.
// Phase 4 D-78 closed enum (7 members) extended in Phase 5 to 10 members
// (+signal-info, +warm-amber, +fresh-green). The fresh-green variant is
// reserved for the AI Origin team member; allowlisted via .freshgreen-allowlist.
// SHELL-05 still applies: callers cannot pass arbitrary fresh-green family
// values — the closed union limits to `'fresh-green'` only (NOT mute, NOT glow).
```

2. **Extend the AvatarColor union** with 3 new values (additive — keep all 7 existing members):
```ts
export type AvatarColor =
  | 'trad-green'
  | 'trad-green-soft'
  | 'trad-green-deep'
  | 'ink'
  | 'ink-muted'
  | 'paper'
  | 'mist'
  | 'signal-info'      // Phase 5 — D-24 (Akiko Sato avatar)
  | 'warm-amber'       // Phase 5 — D-24 (Priya Nair avatar)
  | 'fresh-green'      // Phase 5 — D-24, OD5R-05 (Origin AI avatar; allowlisted)
```

3. **Extend the existing `BG_BY_COLOR` map** with 3 new entries (do NOT replace the map; keep all 7 existing entries):
```ts
const BG_BY_COLOR: Record<AvatarColor, string> = {
  'trad-green': 'bg-trad-green',
  'trad-green-soft': 'bg-trad-green-soft',
  'trad-green-deep': 'bg-trad-green-deep',
  ink: 'bg-ink',
  'ink-muted': 'bg-ink-muted',
  paper: 'bg-paper',
  mist: 'bg-mist',
  'signal-info': 'bg-signal-info',          // NEW
  'warm-amber': 'bg-warm-amber',            // NEW
  'fresh-green': 'bg-fresh-green',          // NEW
}
```

4. **Extend the existing `TEXT_BY_COLOR` map** (do NOT replace; keep all 7 existing entries):
```ts
const TEXT_BY_COLOR: Record<AvatarColor, string> = {
  'trad-green': 'text-trad-green',
  'trad-green-soft': 'text-trad-green-soft',
  'trad-green-deep': 'text-trad-green-deep',
  ink: 'text-ink',
  'ink-muted': 'text-ink-muted',
  paper: 'text-paper',
  mist: 'text-mist',
  'signal-info': 'text-signal-info',        // NEW
  'warm-amber': 'text-warm-amber',          // NEW
  'fresh-green': 'text-fresh-green',        // NEW
}
```

5. **Do NOT modify `AvatarProps` or the `Avatar` function body.** The `textColor?: AvatarColor` prop and its default `'paper'` are already correct from Phase 4 (the existing function already composes `BG_BY_COLOR[color]` + `TEXT_BY_COLOR[textColor]` correctly). No new prop, no new map name, no behavior change — the union extension is the only required change.
  </action>
  <verify>
    - `npm run typecheck` exits 0.
    - The 3 new union values are reachable from any consumer (verify by grepping `'fresh-green'` in `components/primitives/Avatar.tsx`).
  </verify>
</task>

<task type="auto">
  <name>Task 4: Update existing Avatar tests + append new color tests</name>
  <read_first>
    - components/primitives/Avatar.test.tsx (current file; pay attention to lines 54-77 — the tests that change)
  </read_first>
  <action>
Modify `components/primitives/Avatar.test.tsx`. There are TWO existing tests that will FAIL after Task 3 lands the enum extension; both must be revised in place (NOT just appended over):

**Existing test 1 (currently lines 68-70):**
```ts
it('AvatarColor enum has exactly 7 members (Plan 04-05 lock)', () => {
  expect(ALL_COLORS.length).toBe(7)
})
```
**Replace with:**
```ts
it('AvatarColor enum has exactly 10 members (Phase 5 D-24 extension; Plan 04-05 lock + Phase 5 +3)', () => {
  expect(ALL_COLORS.length).toBe(10)
})
```

**Existing test 2 (currently lines 72-77):**
```ts
it('AvatarColor enum excludes fresh-green family (D-78)', () => {
  const colors: string[] = ALL_COLORS as unknown as string[]
  expect(colors).not.toContain('fresh-green')
  expect(colors).not.toContain('fresh-green-mute')
  expect(colors).not.toContain('fresh-green-glow')
})
```
**Replace with** (the inversion: enum INCLUDES fresh-green for Origin, but NOT the soft/glow variants):
```ts
it('AvatarColor enum includes fresh-green for the AI Origin avatar (D-24, OD5R-05); excludes the -mute/-glow variants', () => {
  const colors: string[] = ALL_COLORS as unknown as string[]
  expect(colors).toContain('fresh-green')         // AI Origin avatar — allowlisted via Plan 05-02
  expect(colors).not.toContain('fresh-green-mute')
  expect(colors).not.toContain('fresh-green-glow')
})
```

**Append new tests** (do NOT modify the existing `'default textColor is "paper"'` and `'textColor prop overrides the default'` tests — they remain unchanged):

```ts
describe('Avatar — Phase 5 D-24 enum extension', () => {
  it('renders bg-fresh-green when color="fresh-green" (Origin AI avatar)', () => {
    const { container } = render(<Avatar initials="◉" color="fresh-green" size={34} />)
    const span = container.firstElementChild as HTMLElement
    expect(span.className).toContain('bg-fresh-green')
  })

  it('renders bg-signal-info when color="signal-info" (Akiko avatar)', () => {
    const { container } = render(<Avatar initials="AS" color="signal-info" size={34} />)
    const span = container.firstElementChild as HTMLElement
    expect(span.className).toContain('bg-signal-info')
  })

  it('renders bg-warm-amber when color="warm-amber" (Priya avatar)', () => {
    const { container } = render(<Avatar initials="PN" color="warm-amber" size={34} />)
    const span = container.firstElementChild as HTMLElement
    expect(span.className).toContain('bg-warm-amber')
  })

  it('Origin avatar pattern (color=fresh-green + textColor=trad-green-deep) produces both classes', () => {
    const { container } = render(
      <Avatar initials="◉" color="fresh-green" textColor="trad-green-deep" size={34} />,
    )
    const span = container.firstElementChild as HTMLElement
    expect(span.className).toContain('bg-fresh-green')
    expect(span.className).toContain('text-trad-green-deep')
  })
})
```

**Do NOT add** any test asserting "omits textColor class when prop omitted" — that would contradict the existing Phase 4 default behavior (`textColor = 'paper'` produces `text-paper` even when the prop is omitted), which is correctly tested at the existing line 54-58.
  </action>
  <verify>
    - `npm run test -- --run components/primitives/Avatar.test.tsx` exits 0.
    - The 2 modified tests pass with the new assertions.
    - The existing line 54-58 (`'default textColor is "paper"'`) and line 60-66 (`'textColor prop overrides the default'`) tests pass unchanged.
    - The 4 new tests pass.
  </verify>
</task>

<task type="auto">
  <name>Task 5: Extend Eyebrow primitive with style prop + test</name>
  <read_first>
    - components/primitives/Eyebrow.tsx (current shape: `{children, className}`)
    - components/primitives/Eyebrow.test.tsx (existing tests — additive, all preserved)
    - .planning/phases/05-client-journey-dashboard/05-UI-SPEC.md §Component Specs > StageTimeline + GreetingBlock (consumers using inline `style` on Eyebrow)
  </read_first>
  <action>
**Modify `components/primitives/Eyebrow.tsx`** — additive `style?: CSSProperties` prop. Backward-compatible.

Before:
```ts
import type { ReactNode } from 'react'

export type EyebrowProps = {
  children: ReactNode
  className?: string
}

const baseClasses =
  'font-mono uppercase tracking-[0.18em] text-ink-muted text-[10px] font-medium leading-tight'

export function Eyebrow({ children, className }: EyebrowProps) {
  const composed = className ? `${baseClasses} ${className}` : baseClasses
  return <span className={composed}>{children}</span>
}
```

After:
```ts
import type { CSSProperties, ReactNode } from 'react'

export type EyebrowProps = {
  children: ReactNode
  className?: string
  style?: CSSProperties     // Phase 5 — additive (StageTimeline current-pill weight; GreetingBlock 10px margin)
}

const baseClasses =
  'font-mono uppercase tracking-[0.18em] text-ink-muted text-[10px] font-medium leading-tight'

export function Eyebrow({ children, className, style }: EyebrowProps) {
  const composed = className ? `${baseClasses} ${className}` : baseClasses
  return <span className={composed} style={style}>{children}</span>
}
```

When `style` is omitted, the rendered span has no `style` attribute (the existing Phase 4 behavior is preserved exactly). When provided, the inline style is forwarded.

**Append a new test to `components/primitives/Eyebrow.test.tsx`** (preserve all existing tests):

```ts
describe('Eyebrow — Phase 5 style forwarding', () => {
  it('forwards inline style to the rendered span', () => {
    const { container } = render(
      <Eyebrow style={{ marginBottom: 10, fontWeight: 500 }}>Test</Eyebrow>,
    )
    const span = container.firstElementChild as HTMLElement
    expect(span.style.marginBottom).toBe('10px')
    expect(String(span.style.fontWeight)).toBe('500')
  })

  it('omits the style attribute when style prop is not provided (Phase 4 baseline)', () => {
    const { container } = render(<Eyebrow>Test</Eyebrow>)
    const span = container.firstElementChild as HTMLElement
    expect(span.getAttribute('style')).toBeNull()
  })
})
```
  </action>
  <verify>
    - `npm run typecheck` exits 0.
    - `npm run test -- --run components/primitives/Eyebrow.test.tsx` exits 0.
    - All existing Phase 4 Eyebrow tests still pass.
  </verify>
</task>

<task type="auto">
  <name>Task 6: Remove transient `as AvatarColor` casts from lib/cjd.ts TEAM_MEMBERS</name>
  <read_first>
    - lib/cjd.ts (TEAM_MEMBERS literal — the casts added in Plan 05-01)
  </read_first>
  <action>
With the AvatarColor enum extension landed in Task 3, the `as AvatarColor` casts on `'signal-info'`, `'warm-amber'`, `'fresh-green'` literals in `lib/cjd.ts` are no longer needed. Remove them. The literals now satisfy the union directly.

Before:
```ts
{ name: 'Akiko Sato', ..., color: 'signal-info' as AvatarColor, textColor: 'paper' as AvatarColor },
```

After:
```ts
{ name: 'Akiko Sato', ..., color: 'signal-info', textColor: 'paper' },
```

The `as const` assertion at the end of the array continues to provide the readonly-tuple shape.
  </action>
  <verify>
    - `grep -n "as AvatarColor" lib/cjd.ts` returns nothing.
    - `npm run typecheck` exits 0.
  </verify>
</task>

<task type="auto">
  <name>Task 7: Update .freshgreen-allowlist with 5 new entries</name>
  <read_first>
    - .freshgreen-allowlist (current entries; alphabetical sort within sections)
  </read_first>
  <action>
Add these 5 file paths to `.freshgreen-allowlist`. Maintain alphabetical ordering within the file's structure. Insert each with a brief comment explaining the surface:

```
# Phase 5 redo — fresh-green allowlist additions (per UI-SPEC §Color > Fresh-Green Allowlist)
# Note: components/journey/GreetingBlock.tsx is intentionally NOT added — the 縁
# watermark is var(--color-trad-green) at 0.035 opacity (D-04), not fresh-green.
# Note: components/journey/ApplicationCard.tsx is intentionally NOT added — the
# hero card bottom-edge gradient is SKIPPED per OD5R-01 resolution.
components/journey/ActivityFeed.tsx
components/journey/TeamCard.tsx
components/journey/WorkingOnYourBehalfCard.tsx
components/primitives/Avatar.tsx
lib/cjd.ts
```
  </action>
  <verify>
    - `cat .freshgreen-allowlist` shows the 5 new entries with comments.
    - `bash scripts/check-fresh-green.sh` exits 0 (no violations; allowlist consistent — note: at this point only `Avatar.tsx` actually emits fresh-green; the `components/journey/*.tsx` files are added pre-emptively for Wave 2 plans which DO emit fresh-green; this is fine because the allowlist tolerates listed-but-not-yet-emitting files).
  </verify>
</task>

<task type="auto">
  <name>Task 8: Atomic commit</name>
  <action>
Stage all 8 modified files (`app/layout.tsx`, `app/globals.css`, `components/primitives/Avatar.tsx`, `components/primitives/Avatar.test.tsx`, `components/primitives/Eyebrow.tsx`, `components/primitives/Eyebrow.test.tsx`, `.freshgreen-allowlist`, `lib/cjd.ts`). Commit with:
```
feat(phase-05-redo): primitive infra — font + tokens + Avatar/Eyebrow + allowlist (Plan 05-02)

Phase 5 redo Wave 1 infrastructure. Lands every prerequisite the Wave 2
components depend on:
- Noto Sans JP weight 300 added to next/font config (P-2', D-05).
  Weight 200 explicitly NOT added; archive's value was incorrect.
- 3 new design tokens in @theme (D-23, D-24, AttentionCard, TeamCard):
    --color-warm-amber: #8a5e0a       (Priya avatar)
    --color-ink-faint:  #AEB4AB       (AttentionCard 3rd-row dot)
    --color-mist-deep:  #D9E0D4       (TeamCard ghost button border)
- AvatarColor closed-enum extended 7 → 10 members: +signal-info,
  +warm-amber, +fresh-green (D-24, OD5R-05). BG_BY_COLOR + TEXT_BY_COLOR
  maps extended to match. AvatarProps and Avatar function body
  unchanged (textColor prop already existed in Phase 4).
- Existing Avatar tests revised in place (lines 68-77 of Phase 4):
    - "exactly 7 members" → "exactly 10 members"
    - "excludes fresh-green family (D-78)" → inverted to assert
      enum INCLUDES fresh-green (Origin AI) but excludes -mute/-glow.
- 4 new Avatar tests for the 3 colors + Origin pattern.
- Eyebrow primitive gains additive style?: CSSProperties prop
  (StageTimeline current-pill weight + GreetingBlock 10px margin).
  Existing Phase 4 Eyebrow tests preserved; 2 new tests for forward.
- .freshgreen-allowlist gains 5 entries (ActivityFeed, TeamCard,
  WorkingOnYourBehalfCard, Avatar, lib/cjd.ts). GreetingBlock and
  ApplicationCard intentionally excluded (D-04, OD5R-01).
- lib/cjd.ts TEAM_MEMBERS `as AvatarColor` casts removed.

OD5R resolution: OD5R-05 (extend closed enum, not escape-hatch prop).
```
  </action>
  <verify>
    - `git status` shows clean tree.
    - `git log -1 --oneline` shows the commit.
  </verify>
</task>

</tasks>

<acceptance>
- `app/layout.tsx` Noto Sans JP includes weight `'300'`; does NOT include `'200'`.
- `app/globals.css` defines `--color-warm-amber`, `--color-ink-faint`, `--color-mist-deep`.
- `components/primitives/Avatar.tsx` `AvatarColor` union has 10 members (3 new); `BG_BY_COLOR` + `TEXT_BY_COLOR` maps extended; `AvatarProps` unchanged.
- `components/primitives/Avatar.test.tsx`: 2 existing tests at lines 68-77 are revised in place (10-member count + inverted fresh-green inclusion); 4 new tests added; existing default-textColor tests at lines 54-66 preserved.
- `components/primitives/Eyebrow.tsx` accepts `style?: CSSProperties` (additive).
- `components/primitives/Eyebrow.test.tsx` has 2 new tests (style forward + omitted-when-not-provided baseline).
- `.freshgreen-allowlist` has 5 new entries; GreetingBlock and ApplicationCard intentionally excluded.
- `lib/cjd.ts` no longer has `as AvatarColor` casts.
- `npm run typecheck && npm run lint && npm run test && npm run build` all exit 0.
- `bash scripts/check-fresh-green.sh` exits 0.
- Commit message references Plan 05-02 + OD5R-05.
</acceptance>
