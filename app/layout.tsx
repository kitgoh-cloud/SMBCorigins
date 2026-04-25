import type { Metadata } from 'next'
import { Fraunces, Inter_Tight, Noto_Sans_JP, IBM_Plex_Mono } from 'next/font/google'
import './globals.css'

// D-31: Fraunces — wght-only is the default (no opsz/SOFT/WONK in v1; deferred per CONTEXT §"Deferred Ideas").
// next/font@16's Fraunces type only accepts opsz/SOFT/WONK as `axes` (wght is implicit/always-on),
// so we pass no `axes` to keep wght-only behavior.
const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
})

// Inter Tight — variable font on Google Fonts; no weight specification needed.
const interTight = Inter_Tight({
  subsets: ['latin'],
  variable: '--font-inter-tight',
  display: 'swap',
})

// D-32: Noto Sans JP — subsets: ['latin'] only. JP characters auto-load via unicode-range.
const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  variable: '--font-noto-sans-jp',
  display: 'swap',
})

// IBM Plex Mono — NOT a variable font on Google Fonts; weights must be explicit.
const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'SMBC Origin',
  description: 'AI-native corporate banking onboarding — prototype',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${interTight.variable} ${notoSansJP.variable} ${ibmPlexMono.variable}`}
    >
      <body>{children}</body>
    </html>
  )
}
