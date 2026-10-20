// Prüfbericht je Release (CRA Anhang VII Nr. 6) als Markdown.
// Aufruf aus .github/workflows/release.yml; lokal mit Dummy-Werten:
//   VERSION=0.0.0 GIT_SHA=abc node scripts/pruefbericht.mjs
// Liest ausschließlich die unten genannten Umgebungsvariablen und Dateien – nie
// die gesamte Umgebung, damit kein Geheimnis in den Bericht gelangt.
import { createHash } from 'node:crypto'
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { basename, join } from 'node:path'

const env = (name, fallback = '') => process.env[name] ?? fallback

const version = env('VERSION', 'unbekannt')
const sha = env('GIT_SHA', 'unbekannt')
const server = env('SERVER_URL', 'https://github.com')
const repo = env('REPO', 'accountdesk/widget')
const runId = env('RUN_ID')
const runAttempt = env('RUN_ATTEMPT', '1')
const checksRunUrl = env('CHECKS_RUN_URL')
const checksConclusion = env('CHECKS_RUN_CONCLUSION')
const out = env('OUT', `pruefbericht-${version}.md`)
const distDir = env('DIST_DIR', 'dist')
const tarball = env('TARBALL')
const auditJson = env('AUDIT_JSON')
const signaturesTxt = env('SIGNATURES_TXT')

const repoUrl = `${server}/${repo}`
const runUrl = runId ? `${repoUrl}/actions/runs/${runId}/attempts/${runAttempt}` : ''

/** Ergebnis eines Workflow-Schritts (steps.<id>.outcome) lesbar machen. */
function outcome(name) {
  const v = env(name)
  if (v === 'success') return '✅ bestanden'
  if (v === 'failure') return '❌ fehlgeschlagen'
  if (v === 'skipped') return '⏭️ übersprungen'
  if (v === 'cancelled') return '⏹️ abgebrochen'
  return v ? v : '– nicht ermittelt'
}

function sha256(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex')
}

function auditSummary() {
  if (!auditJson || !existsSync(auditJson)) return '– nicht ermittelt'
  try {
    const data = JSON.parse(readFileSync(auditJson, 'utf8'))
    const v = data?.metadata?.vulnerabilities ?? {}
    const deps = data?.metadata?.dependencies ?? {}
    const total = v.total ?? 0
    const parts = ['critical', 'high', 'moderate', 'low', 'info'].map((k) => `${k}: ${v[k] ?? 0}`)
    const scope =
      deps.total !== undefined
        ? ` (geprüft: ${deps.total} Pakete, davon Laufzeit ${deps.prod ?? 0}, Entwicklung ${deps.dev ?? 0})`
        : ''
    return `${total === 0 ? '✅ keine bekannten Lücken' : `⚠️ ${total} bekannte Lücke(n)`} – ${parts.join(', ')}${scope}`
  } catch {
    return '– Ausgabe nicht lesbar'
  }
}

function signatures() {
  if (!signaturesTxt || !existsSync(signaturesTxt)) return '– nicht ermittelt'
  const text = readFileSync(signaturesTxt, 'utf8').trim()
  return text ? '```\n' + text + '\n```' : '– keine Ausgabe'
}

function fileHashes() {
  const rows = []
  if (existsSync(distDir)) {
    for (const name of readdirSync(distDir).sort()) {
      const p = join(distDir, name)
      if (statSync(p).isFile()) rows.push([`${distDir}/${name}`, statSync(p).size, sha256(p)])
    }
  }
  if (tarball && existsSync(tarball))
    rows.push([basename(tarball), statSync(tarball).size, sha256(tarball), ' (npm-Paket)'])
  if (rows.length === 0) return '– keine Dateien gefunden'
  return [
    '| Datei | Bytes | SHA-256 |',
    '|---|---:|---|',
    ...rows.map(([f, size, h, note = '']) => `| \`${f}\`${note} | ${size} | \`${h}\` |`),
  ].join('\n')
}

const checksLine = checksRunUrl
  ? `[checks-Lauf zum Commit](${checksRunUrl})${checksConclusion ? ` – Ergebnis: ${checksConclusion}` : ''}`
  : `nicht ermittelbar – Prüfstatus siehe [Commit-Seite](${repoUrl}/commit/${sha}) bzw. [checks.yml](${repoUrl}/actions/workflows/checks.yml)`

const date = new Date()
  .toISOString()
  .replace('T', ' ')
  .replace(/\.\d+Z$/, '')

const report = `# Prüfbericht @accountdesk/widget ${version}

Automatisch erzeugt beim Release (CRA Anhang VII Nr. 6).

| | |
|---|---|
| Version | \`${version}\` |
| Git-Commit | [\`${sha}\`](${repoUrl}/commit/${sha}) |
| Datum (UTC) | ${date} |
| Release-Workflow | ${runUrl ? `[Lauf ${runId}](${runUrl})` : '– lokal erzeugt'} |
| checks.yml | ${checksLine} |
| Node / npm | ${process.version} / ${env('NPM_VERSION', 'unbekannt')} |

## Prüfungen im Release-Lauf

| Prüfung | Ergebnis |
|---|---|
| Lint (oxlint) | ${outcome('STEP_LINT')} |
| Formatierung (oxfmt) | ${outcome('STEP_FORMAT')} |
| Unit-Tests (node --test) | ${outcome('STEP_TEST')} |
| Build (tsc + Vite) | ${outcome('STEP_BUILD')} |
| npm audit (Gate: ab high) | ${outcome('STEP_AUDIT')} |
| npm audit signatures | ${outcome('STEP_SIGNATURES')} |
| Veröffentlichung auf npm | ${outcome('STEP_PUBLISH')} |

Gitleaks (Geheimnisse), Semgrep (statische Analyse) und CodeQL laufen nicht im Release-Lauf, sondern in
\`checks.yml\` bzw. \`codeql.yml\` für denselben Commit: ${checksLine}.

### npm audit

${auditSummary()}

### npm audit signatures

${signatures()}

## Ausgelieferte Dateien

${fileHashes()}

Der npm-Tarball entsteht mit \`npm pack\` aus demselben Build wie die Veröffentlichung. Abgleich mit der Registry:
\`npm view @accountdesk/widget@${version} dist.integrity dist.shasum\`.

## Stückliste (SBOM)

Am selben GitHub-Release angehängt (CycloneDX):

- \`sbom.cdx.json\` – Laufzeit (das Widget hat keine Abhängigkeiten)
- \`sbom-build.cdx.json\` – Build-Werkzeuge

## Herkunft (Provenance)

Veröffentlicht mit \`npm publish --provenance\` aus diesem Workflow. Die Herkunftsangabe (Sigstore) verknüpft das
Paket auf npm mit Repository, Commit und Workflow-Lauf; prüfbar mit \`npm audit signatures\` in einem Projekt, das
\`@accountdesk/widget@${version}\` installiert hat, und auf der npm-Seite des Pakets („Provenance“).
`

writeFileSync(out, report)
console.log(`Prüfbericht geschrieben: ${out}`)
