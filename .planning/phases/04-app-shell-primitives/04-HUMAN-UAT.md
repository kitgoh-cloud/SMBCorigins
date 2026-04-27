---
status: resolved
phase: 04-app-shell-primitives
source: [04-VERIFICATION.md]
started: 2026-04-27T10:20:00Z
updated: 2026-04-27T11:30:00Z
---

## Current Test

Human UAT approved 2026-04-27. One issue surfaced and resolved during UAT: ModeSwitcher not visible with wrong env var (`NEXT_PUBLIC_DEV_MODE=1`); confirmed no code defect — correct var is `NEXT_PUBLIC_SHOW_MODE_SWITCHER=true`. Root-page footer stale copy also fixed.

## Tests

### 1. TopStrip Visual Rendering
expected: 56px chrome bar at top of every page; Rising Mark SVG visible; language toggle shows EN / 日本語 segments (non-interactive); wordmark "Origin" renders with Fraunces SOFT/WONK axes at 1440px viewport
result: approved

### 2. ModeSwitcher Production Safety
expected: ModeSwitcher absent without env var; when NEXT_PUBLIC_SHOW_MODE_SWITCHER=true, dashed border is paper-toned/muted (not fresh-green), DEMO eyebrow label is amber/signal color
result: approved — env var name confirmed as NEXT_PUBLIC_SHOW_MODE_SWITCHER (not NEXT_PUBLIC_DEV_MODE)

### 3. /dev/primitives Demo Page
expected: all 8 primitive sections render; AIPulseDot visibly pulses; only kind='ai' StatusChips are green
result: approved

### 4. Retrofit Visual Accuracy
expected: Avatar background is dark teal, mail dot is amber, RMShell sidebar active dot is dark green
result: approved

## Summary

total: 4
passed: 4
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps
