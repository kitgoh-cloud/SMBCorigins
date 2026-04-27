---
status: partial
phase: 04-app-shell-primitives
source: [04-VERIFICATION.md]
started: 2026-04-27T10:20:00Z
updated: 2026-04-27T10:20:00Z
---

## Current Test

[awaiting human testing]

## Tests

### 1. TopStrip Visual Rendering
expected: 56px chrome bar at top of every page; Rising Mark SVG visible; language toggle shows EN / 日本語 segments (non-interactive); wordmark "Origin" renders with Fraunces SOFT/WONK axes at 1440px viewport
result: [pending]

### 2. ModeSwitcher Production Safety
expected: ModeSwitcher is completely absent without NEXT_PUBLIC_DEV_MODE env var; when present, dashed border is paper-toned/muted (not fresh-green), DEMO eyebrow label is amber/signal color
result: [pending]

### 3. /dev/primitives Demo Page
expected: http://localhost:3000/dev/primitives renders all 8 primitive sections (Eyebrow, Icon, Avatar, AIPulseDot, AIBadge, StatusChip, StagePill, ActionCard); AIPulseDot visibly pulses; only kind='ai' StatusChips are green — all other kinds are non-green
result: [pending]

### 4. Retrofit Visual Accuracy
expected: Avatar background in TopStrip is dark teal (bg-trad-green-soft), NOT #BFD730; notification dot on mail icon is amber/signal color; RMShell sidebar active item dot is dark green (bg-trad-green), NOT fresh-green
result: [pending]

## Summary

total: 4
passed: 0
issues: 0
pending: 4
skipped: 0
blocked: 0

## Gaps
