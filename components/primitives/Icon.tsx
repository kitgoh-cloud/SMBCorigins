// components/primitives/Icon.tsx — Phase 4 SHELL-04 icon primitive (D-79).
// 35-name closed union; SVG paths verbatim from prototype's primitives.js Icon
// component (RESEARCH §5.1, §5.2). No path/SVG-children slot — additions are
// deliberate, reviewed in PR. Phase 5/6/7 extend the union additively.
// No fresh-green tokens — Icon is not an AI-presence surface; XSS safe per
// RESEARCH §"Security Domain" (paths are static literals, no user input).

import type { CSSProperties, ReactElement } from 'react'

export type IconName =
  | 'app-folder'
  | 'arrow-right'
  | 'arrow-up-right'
  | 'bank'
  | 'bell'
  | 'bolt'
  | 'calendar'
  | 'check'
  | 'chevron-down'
  | 'chevron-right'
  | 'clock'
  | 'close'
  | 'cockpit'
  | 'copilot'
  | 'credit'
  | 'docs'
  | 'dot'
  | 'edit'
  | 'external'
  | 'filter'
  | 'globe'
  | 'help'
  | 'mail'
  | 'paperclip'
  | 'pipeline'
  | 'refresh'
  | 'rocket'
  | 'search'
  | 'send'
  | 'shield'
  | 'sparkle'
  | 'stack'
  | 'tree'
  | 'upload'
  | 'users'
  | 'yen'

export type IconProps = {
  name: IconName
  size?: number
  stroke?: number
  color?: string
  ariaLabel?: string
  style?: CSSProperties
}

export function Icon({
  name,
  size = 16,
  stroke = 1.6,
  color = 'currentColor',
  ariaLabel,
  style,
}: IconProps): ReactElement {
  const svgStyle: CSSProperties = {
    width: size,
    height: size,
    display: 'block',
    flexShrink: 0,
    ...style,
  }
  const common = {
    fill: 'none',
    stroke: color,
    strokeWidth: stroke,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }
  const a11y = ariaLabel
    ? { role: 'img' as const, 'aria-label': ariaLabel }
    : { 'aria-hidden': true as const }

  switch (name) {
    case 'arrow-right':
      return <svg viewBox="0 0 24 24" style={svgStyle} {...a11y}><path d="M5 12h14M13 6l6 6-6 6" {...common} /></svg>
    case 'arrow-up-right':
      return <svg viewBox="0 0 24 24" style={svgStyle} {...a11y}><path d="M7 17L17 7M8 7h9v9" {...common} /></svg>
    case 'check':
      return <svg viewBox="0 0 24 24" style={svgStyle} {...a11y}><path d="M5 12l5 5L20 7" {...common} /></svg>
    case 'dot':
      return <svg viewBox="0 0 24 24" style={svgStyle} {...a11y}><circle cx="12" cy="12" r="4" fill={color} /></svg>
    case 'chevron-right':
      return <svg viewBox="0 0 24 24" style={svgStyle} {...a11y}><path d="M9 6l6 6-6 6" {...common} /></svg>
    case 'chevron-down':
      return <svg viewBox="0 0 24 24" style={svgStyle} {...a11y}><path d="M6 9l6 6 6-6" {...common} /></svg>
    case 'close':
      return <svg viewBox="0 0 24 24" style={svgStyle} {...a11y}><path d="M6 6l12 12M18 6L6 18" {...common} /></svg>
    case 'tree':
      return <svg viewBox="0 0 24 24" style={svgStyle} {...a11y}><path d="M12 3v6m0 0H7v4m5-4h5v4M7 13H5v4h4v-4H7zm10 0h-2v4h4v-4h-2zm-7 0h-2v4h4v-4h-2zM12 13h0" {...common} /></svg>
    case 'docs':
      return <svg viewBox="0 0 24 24" style={svgStyle} {...a11y}><path d="M8 3h8l4 4v14H8V3zM8 8h8M8 12h8M8 16h5" {...common} /></svg>
    case 'shield':
      return <svg viewBox="0 0 24 24" style={svgStyle} {...a11y}><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" {...common} /></svg>
    case 'credit':
      return <svg viewBox="0 0 24 24" style={svgStyle} {...a11y}><path d="M3 7h18v10H3V7zm0 4h18M7 15h4" {...common} /></svg>
    case 'rocket':
      return <svg viewBox="0 0 24 24" style={svgStyle} {...a11y}><path d="M5 19l3-3m6-10c3 0 5 2 5 5l-6 6-5-5 6-6zm-1 5a1 1 0 100-2 1 1 0 000 2z" {...common} /></svg>
    case 'mail':
      return <svg viewBox="0 0 24 24" style={svgStyle} {...a11y}><path d="M3 6h18v12H3V6zm0 0l9 7 9-7" {...common} /></svg>
    case 'help':
      return <svg viewBox="0 0 24 24" style={svgStyle} {...a11y}><circle cx="12" cy="12" r="9" {...common} /><path d="M9.5 9.5a2.5 2.5 0 015 0c0 1.5-2.5 2-2.5 3.5M12 17h.01" {...common} /></svg>
    case 'bell':
      return <svg viewBox="0 0 24 24" style={svgStyle} {...a11y}><path d="M6 16V11a6 6 0 1112 0v5l2 2H4l2-2zM10 20a2 2 0 004 0" {...common} /></svg>
    case 'search':
      return <svg viewBox="0 0 24 24" style={svgStyle} {...a11y}><circle cx="11" cy="11" r="7" {...common} /><path d="M20 20l-4-4" {...common} /></svg>
    case 'sparkle':
      return <svg viewBox="0 0 24 24" style={svgStyle} {...a11y}><path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6zM19 14l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z" {...common} /></svg>
    case 'cockpit':
      return <svg viewBox="0 0 24 24" style={svgStyle} {...a11y}><path d="M3 4h7v9H3V4zm11 0h7v5h-7V4zm0 9h7v7h-7v-7zM3 15h7v5H3v-5z" {...common} /></svg>
    case 'pipeline':
      return <svg viewBox="0 0 24 24" style={svgStyle} {...a11y}><path d="M3 7h4l3 4-3 4H3M10 7h4l3 4-3 4h-4" {...common} /></svg>
    case 'app-folder':
      return <svg viewBox="0 0 24 24" style={svgStyle} {...a11y}><path d="M3 7a2 2 0 012-2h5l2 3h7a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" {...common} /></svg>
    case 'copilot':
      return <svg viewBox="0 0 24 24" style={svgStyle} {...a11y}><circle cx="12" cy="12" r="9" {...common} /><path d="M8 12l3 3 5-6" {...common} /></svg>
    case 'upload':
      return <svg viewBox="0 0 24 24" style={svgStyle} {...a11y}><path d="M4 17v3h16v-3M12 15V4m0 0l-5 5m5-5l5 5" {...common} /></svg>
    case 'paperclip':
      return <svg viewBox="0 0 24 24" style={svgStyle} {...a11y}><path d="M20 12l-8 8a5 5 0 01-7-7l9-9a3 3 0 014 4l-9 9a1 1 0 01-1-1l8-8" {...common} /></svg>
    case 'calendar':
      return <svg viewBox="0 0 24 24" style={svgStyle} {...a11y}><rect x="3" y="5" width="18" height="16" rx="2" {...common} /><path d="M3 10h18M8 3v4M16 3v4" {...common} /></svg>
    case 'clock':
      return <svg viewBox="0 0 24 24" style={svgStyle} {...a11y}><circle cx="12" cy="12" r="9" {...common} /><path d="M12 7v5l3 2" {...common} /></svg>
    case 'globe':
      return <svg viewBox="0 0 24 24" style={svgStyle} {...a11y}><circle cx="12" cy="12" r="9" {...common} /><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18-3-3.5-3-14.5 0-18z" {...common} /></svg>
    case 'yen':
      return <svg viewBox="0 0 24 24" style={svgStyle} {...a11y}><path d="M6 4l6 8 6-8M6 13h12M6 17h12M12 12v8" {...common} /></svg>
    case 'filter':
      return <svg viewBox="0 0 24 24" style={svgStyle} {...a11y}><path d="M4 5h16l-6 8v6l-4-2v-4L4 5z" {...common} /></svg>
    case 'edit':
      return <svg viewBox="0 0 24 24" style={svgStyle} {...a11y}><path d="M4 20h4L20 8l-4-4L4 16v4z" {...common} /></svg>
    case 'refresh':
      return <svg viewBox="0 0 24 24" style={svgStyle} {...a11y}><path d="M4 4v6h6M20 20v-6h-6M5 14a8 8 0 0014 4M19 10A8 8 0 005 6" {...common} /></svg>
    case 'send':
      return <svg viewBox="0 0 24 24" style={svgStyle} {...a11y}><path d="M4 20l17-8L4 4v6l11 2-11 2v6z" {...common} /></svg>
    case 'external':
      return <svg viewBox="0 0 24 24" style={svgStyle} {...a11y}><path d="M14 3h7v7M21 3l-9 9M10 5H5a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-5" {...common} /></svg>
    case 'stack':
      return <svg viewBox="0 0 24 24" style={svgStyle} {...a11y}><path d="M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5M3 18l9 5 9-5" {...common} /></svg>
    case 'users':
      return <svg viewBox="0 0 24 24" style={svgStyle} {...a11y}><circle cx="9" cy="8" r="3" {...common} /><circle cx="17" cy="9" r="2" {...common} /><path d="M3 19c0-3 3-5 6-5s6 2 6 5M15 19c0-2 2-4 4-4s2 2 2 4" {...common} /></svg>
    case 'bolt':
      return <svg viewBox="0 0 24 24" style={svgStyle} {...a11y}><path d="M13 3L5 14h6l-1 7 8-11h-6l1-7z" {...common} /></svg>
    case 'bank':
      return <svg viewBox="0 0 24 24" style={svgStyle} {...a11y}><path d="M3 10l9-6 9 6M5 10v9h14v-9M8 12v5M12 12v5M16 12v5M3 21h18" {...common} /></svg>
  }
}
