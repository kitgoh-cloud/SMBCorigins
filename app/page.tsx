// Phase 2 verification surface (D-41) — token showcase for SCAFF-04 + SCAFF-05.
// Reviewers confirm Phase 2 done by opening this page and scanning swatches + fonts.
// Phase 4 (app shell) supersedes this content.

type Swatch = {
  readonly token: string
  readonly hex: string
  readonly utilityBg: string
  readonly note?: string
}

type FontSample = {
  readonly name: string
  readonly utilityFont: string
  readonly sampleEn: string
  readonly sampleAlt?: string
}

const brandGreens: ReadonlyArray<Swatch> = [
  { token: '--color-trad-green', hex: '#004832', utilityBg: 'bg-trad-green' },
  { token: '--color-trad-green-deep', hex: '#00301F', utilityBg: 'bg-trad-green-deep' },
  { token: '--color-trad-green-soft', hex: '#1A5F48', utilityBg: 'bg-trad-green-soft' },
  {
    token: '--color-fresh-green',
    hex: '#BFD730',
    utilityBg: 'bg-fresh-green',
    note: 'AI-only (D-28)',
  },
  {
    token: '--color-fresh-green-mute',
    hex: '#D4E566',
    utilityBg: 'bg-fresh-green-mute',
    note: 'AI-only (D-28)',
  },
  {
    token: '--color-fresh-green-glow',
    hex: '#BFD73022',
    utilityBg: 'bg-fresh-green-glow',
    note: 'AI-only (D-28)',
  },
]

const neutrals: ReadonlyArray<Swatch> = [
  { token: '--color-ink', hex: '#0A1410', utilityBg: 'bg-ink' },
  { token: '--color-ink-soft', hex: '#3C4540', utilityBg: 'bg-ink-soft' },
  { token: '--color-ink-muted', hex: '#7A827D', utilityBg: 'bg-ink-muted' },
  { token: '--color-paper', hex: '#FAFBF7', utilityBg: 'bg-paper' },
  { token: '--color-paper-deep', hex: '#F3F5EE', utilityBg: 'bg-paper-deep' },
  { token: '--color-mist', hex: '#E8EDE4', utilityBg: 'bg-mist' },
]

const signals: ReadonlyArray<Swatch> = [
  { token: '--color-signal-amber', hex: '#E8A317', utilityBg: 'bg-signal-amber' },
  { token: '--color-signal-red', hex: '#C73E1D', utilityBg: 'bg-signal-red' },
  { token: '--color-signal-info', hex: '#2A6F97', utilityBg: 'bg-signal-info' },
]

const darkMode: ReadonlyArray<Swatch> = [
  { token: '--color-dark-bg', hex: '#0B1F17', utilityBg: 'bg-dark-bg' },
  { token: '--color-dark-surface', hex: '#112820', utilityBg: 'bg-dark-surface' },
  { token: '--color-dark-text', hex: '#E8EDE4', utilityBg: 'bg-dark-text' },
]

const fontSamples: ReadonlyArray<FontSample> = [
  {
    name: 'Fraunces',
    utilityFont: 'font-display',
    sampleEn: 'Fraunces — display, headings, stat numerals',
  },
  {
    name: 'Inter Tight',
    utilityFont: 'font-body',
    sampleEn: 'Inter Tight — UI body. The quick brown fox jumps over the lazy dog.',
  },
  {
    name: 'Noto Sans JP',
    utilityFont: 'font-jp',
    sampleEn: 'Noto Sans JP — Japanese coverage',
    sampleAlt: '縁 · 海星製造株式会社 · Yukiさん、ようこそ',
  },
  {
    name: 'IBM Plex Mono',
    utilityFont: 'font-mono',
    sampleEn: 'IBM Plex Mono — data, IDs, timestamps',
    sampleAlt: 'RM-0001 / 2026-04-25T14:30:00Z',
  },
]

function SwatchGrid({ title, items }: { title: string; items: ReadonlyArray<Swatch> }) {
  return (
    <section className="mb-12">
      <h2 className="font-display text-2xl mb-4">{title}</h2>
      <div className="grid grid-cols-3 gap-4">
        {items.map((swatch) => (
          <article key={swatch.token} className="rounded-card overflow-hidden border border-mist">
            <div className={`${swatch.utilityBg} h-24 w-full`} />
            <div className="p-3 bg-paper-deep">
              <p className="font-mono text-sm text-ink">{swatch.token}</p>
              <p className="font-mono text-xs text-ink-soft">{swatch.hex}</p>
              {swatch.note ? (
                <p className="font-mono text-xs text-signal-amber mt-1">{swatch.note}</p>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default function TokenShowcase() {
  return (
    <main className="bg-paper text-trad-green min-h-screen p-12">
      <header className="mb-12">
        <h1 className="font-display text-5xl">SMBC Origin — Phase 2 Token Showcase</h1>
        <p className="font-body text-lg mt-2 text-ink-soft">
          Verification surface for SCAFF-04 (palette) and SCAFF-05 (typography). Source of truth:
          docs/ORIGIN_DESIGN.md §8.
        </p>
      </header>

      <SwatchGrid title="Brand greens" items={brandGreens} />
      <SwatchGrid title="Neutrals" items={neutrals} />
      <SwatchGrid title="Signals" items={signals} />
      <SwatchGrid
        title="Dark mode (RM cockpit option — tokens only, not wired in v1)"
        items={darkMode}
      />

      <section className="mb-12">
        <h2 className="font-display text-2xl mb-4">Typography</h2>
        <div className="grid grid-cols-1 gap-6">
          {fontSamples.map((font) => (
            <article key={font.name} className="border border-mist rounded-card p-6 bg-paper-deep">
              <p className={`${font.utilityFont} text-3xl text-trad-green`}>{font.name}</p>
              <p className={`${font.utilityFont} text-base text-ink mt-2`}>{font.sampleEn}</p>
              {font.sampleAlt ? (
                <p className={`${font.utilityFont} text-base text-ink mt-1`}>{font.sampleAlt}</p>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <footer className="mt-16 pt-8 border-t border-mist">
        <p className="font-mono text-xs text-ink-muted">
          Phase 2 placeholder — Phase 4 (app shell) will supersede this root route.
        </p>
        <nav className="mt-4 flex gap-4">
          <a href="/journey" className="font-mono text-signal-info underline">
            → /journey (client placeholder)
          </a>
          <a href="/cockpit" className="font-mono text-signal-info underline">
            → /cockpit (RM placeholder)
          </a>
        </nav>
      </footer>
    </main>
  )
}
