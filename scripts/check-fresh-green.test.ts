/**
 * scripts/check-fresh-green.test.ts — Boundary-case tests for SHELL-05 grep enforcement.
 *
 * Covers Phase 4 D-84 + RESEARCH §3 audit extensions:
 *   - 16 positive fixtures (regex MUST flag)
 *   - 2 negative fixtures (regex MUST NOT flag)
 *
 * Strategy: each fixture is written to a fresh tempdir initialized as a git repo,
 * then the bash script is invoked with that tempdir as CWD and an empty allowlist
 * file (via ALLOWLIST_FILE env override). The script's exit code + stderr is the
 * assertion target.
 *
 * Why a tempdir per test: the script uses `git ls-files` to walk source files,
 * which only finds files tracked by the surrounding git repo. Test isolation
 * requires a per-test tracked-file set; `git init` + `git add` in a tempdir
 * delivers that without polluting the real repo.
 */

import { describe, it, expect, beforeAll } from 'vitest'
import { execSync, spawnSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

const SCRIPT_PATH = resolve(__dirname, 'check-fresh-green.sh')

// Helper: create an isolated tempdir-as-git-repo with a single fixture file,
// run the script with that tempdir as CWD + an empty allowlist, return result.
function runScriptOnFixture(fixtureContent: string, fixtureRelPath = 'src/fixture.ts'): {
  status: number | null
  stdout: string
  stderr: string
} {
  const dir = mkdtempSync(join(tmpdir(), 'fresh-green-test-'))
  try {
    // git init (quiet)
    execSync('git init -q', { cwd: dir })
    // configure a noop user so commits work (we don't commit, but git ls-files
    // works without a commit if files are added to the index)
    execSync('git config user.email "test@example.com"', { cwd: dir })
    execSync('git config user.name "Test"', { cwd: dir })

    // Write empty allowlist file
    writeFileSync(join(dir, '.freshgreen-allowlist'), '# empty for tests\n')

    // Write fixture file
    const fixturePath = join(dir, fixtureRelPath)
    mkdirSync(join(dir, 'src'), { recursive: true })
    writeFileSync(fixturePath, fixtureContent)

    // git add so git ls-files picks it up
    execSync(`git add ${fixtureRelPath} .freshgreen-allowlist`, { cwd: dir })

    // Run the script
    const result = spawnSync('bash', [SCRIPT_PATH], {
      cwd: dir,
      env: { ...process.env, ALLOWLIST_FILE: '.freshgreen-allowlist' },
      encoding: 'utf-8',
    })

    return {
      status: result.status,
      stdout: result.stdout,
      stderr: result.stderr,
    }
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

beforeAll(() => {
  // Sanity: the script file must exist before any test runs
  // (vitest catches this as a load-time failure, but explicit check helps debugging)
  expect(SCRIPT_PATH).toMatch(/check-fresh-green\.sh$/)
})

describe('SHELL-05 grep — positive boundary cases (regex MUST flag)', () => {
  // Group 1: hex literals (3 case variants per D-84)
  it('flags hex literal #BFD730 (uppercase)', () => {
    const r = runScriptOnFixture('const c = "#BFD730"')
    expect(r.status).toBe(1)
    expect(r.stderr).toContain('SHELL-05 violation')
  })

  it('flags hex literal #bfd730 (lowercase)', () => {
    const r = runScriptOnFixture('const c = "#bfd730"')
    expect(r.status).toBe(1)
    expect(r.stderr).toContain('SHELL-05 violation')
  })

  it('flags hex literal #bFd730 (mixed case)', () => {
    const r = runScriptOnFixture('const c = "#bFd730"')
    expect(r.status).toBe(1)
    expect(r.stderr).toContain('SHELL-05 violation')
  })

  // Group 2: CSS-var forms
  it('flags var(--color-fresh-green)', () => {
    const r = runScriptOnFixture('const c = "var(--color-fresh-green)"')
    expect(r.status).toBe(1)
    expect(r.stderr).toContain('SHELL-05 violation')
  })

  it('flags var(--color-fresh-green-mute) (suffix variant)', () => {
    const r = runScriptOnFixture('const c = "var(--color-fresh-green-mute)"')
    expect(r.status).toBe(1)
    expect(r.stderr).toContain('SHELL-05 violation')
  })

  it('flags var(--color-fresh-green-glow) (suffix variant)', () => {
    const r = runScriptOnFixture('const c = "var(--color-fresh-green-glow)"')
    expect(r.status).toBe(1)
    expect(r.stderr).toContain('SHELL-05 violation')
  })

  // Group 3: Tailwind utilities — base prefixes
  it('flags Tailwind utility bg-fresh-green', () => {
    const r = runScriptOnFixture('const c = "bg-fresh-green"')
    expect(r.status).toBe(1)
    expect(r.stderr).toContain('SHELL-05 violation')
  })

  it('flags Tailwind utility bg-fresh-green-mute (suffix variant)', () => {
    const r = runScriptOnFixture('const c = "bg-fresh-green-mute"')
    expect(r.status).toBe(1)
    expect(r.stderr).toContain('SHELL-05 violation')
  })

  it('flags Tailwind utility bg-fresh-green-glow (suffix variant)', () => {
    const r = runScriptOnFixture('const c = "bg-fresh-green-glow"')
    expect(r.status).toBe(1)
    expect(r.stderr).toContain('SHELL-05 violation')
  })

  // Group 4: arbitrary-value forms (3 sub-variants per D-84)
  it('flags arbitrary-value with hex bg-[#BFD730]', () => {
    const r = runScriptOnFixture('const c = "bg-[#BFD730]"')
    expect(r.status).toBe(1)
    expect(r.stderr).toContain('SHELL-05 violation')
  })

  it('flags arbitrary-value with var bg-[var(--color-fresh-green)]', () => {
    const r = runScriptOnFixture('const c = "bg-[var(--color-fresh-green)]"')
    expect(r.status).toBe(1)
    expect(r.stderr).toContain('SHELL-05 violation')
  })

  it('flags arbitrary-value with rgba bg-[rgba(191,215,48,0.3)]', () => {
    const r = runScriptOnFixture('const c = "bg-[rgba(191,215,48,0.3)]"')
    expect(r.status).toBe(1)
    expect(r.stderr).toContain('SHELL-05 violation')
  })

  // Group 5: inline rgba (the prototype's mode-switcher dashed border tint form)
  it('flags inline rgba(191,215,48,0.3)', () => {
    const r = runScriptOnFixture('const c = "rgba(191,215,48,0.3)"')
    expect(r.status).toBe(1)
    expect(r.stderr).toContain('SHELL-05 violation')
  })

  // Group 6: opacity modifier (RESEARCH §3 extension)
  it('flags opacity modifier bg-fresh-green/30 (RESEARCH §3 extension)', () => {
    const r = runScriptOnFixture('const c = "bg-fresh-green/30"')
    expect(r.status).toBe(1)
    expect(r.stderr).toContain('SHELL-05 violation')
  })

  // Group 7: extended Tailwind prefixes (RESEARCH §3 extension)
  it('flags via-fresh-green (RESEARCH §3 extension)', () => {
    const r = runScriptOnFixture('const c = "via-fresh-green"')
    expect(r.status).toBe(1)
    expect(r.stderr).toContain('SHELL-05 violation')
  })

  it('flags decoration-fresh-green + ring-offset-fresh-green + inset-shadow-fresh-green (combined; RESEARCH §3 extensions)', () => {
    const r = runScriptOnFixture(
      'const c = "decoration-fresh-green ring-offset-fresh-green inset-shadow-fresh-green"',
    )
    expect(r.status).toBe(1)
    expect(r.stderr).toContain('SHELL-05 violation')
  })
})

describe('SHELL-05 grep — negative cases (regex MUST NOT flag)', () => {
  it('does not flag unrelated string "freshly-greened" (word boundary)', () => {
    const r = runScriptOnFixture('const note = "freshly-greened"')
    expect(r.status).toBe(0)
    expect(r.stderr).not.toContain('SHELL-05 violation')
  })

  it('does not flag a different namespace token (bg-fresh-mint)', () => {
    const r = runScriptOnFixture('const c = "bg-fresh-mint"')
    expect(r.status).toBe(0)
    expect(r.stderr).not.toContain('SHELL-05 violation')
  })
})

describe('SHELL-05 grep — allowlist behavior', () => {
  it('exempts a file when its path is in the allowlist', () => {
    // Manually craft a tempdir with a fresh-green hit + that file allowlisted
    const dir = mkdtempSync(join(tmpdir(), 'fresh-green-allowlist-'))
    try {
      execSync('git init -q', { cwd: dir })
      execSync('git config user.email "test@example.com"', { cwd: dir })
      execSync('git config user.name "Test"', { cwd: dir })

      // Allowlist explicitly exempts src/allowed.ts
      writeFileSync(join(dir, '.freshgreen-allowlist'), 'src/allowed.ts\n')

      // src/allowed.ts contains a fresh-green hit
      mkdirSync(join(dir, 'src'), { recursive: true })
      writeFileSync(join(dir, 'src/allowed.ts'), 'const c = "#BFD730"\n')

      execSync('git add src/allowed.ts .freshgreen-allowlist', { cwd: dir })

      const result = spawnSync('bash', [SCRIPT_PATH], {
        cwd: dir,
        env: { ...process.env, ALLOWLIST_FILE: '.freshgreen-allowlist' },
        encoding: 'utf-8',
      })

      expect(result.status).toBe(0)
      expect(result.stderr).not.toContain('SHELL-05 violation')
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})
