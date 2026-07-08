// Baut das Widget direkt nach ../www_nuxt_next/public/widget/.
// Damit landet die Web-Component-Datei dort, wo Nuxt sie als statisches Asset
// (/widget/accountdesk-widget.js) ausliefert — kein Copy-Schritt noetig.
//
// Cross-platform (Windows/Linux/macOS) — keine extra Deps wie cross-env noetig.

import { spawnSync } from 'node:child_process'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(__dirname, '..')
const outDir = resolve(projectRoot, '../www_nuxt_next/public/widget')

console.log(`[build-nuxt] vite build → ${outDir}`)

const tsc = spawnSync('npx tsc', { cwd: projectRoot, stdio: 'inherit', shell: true })
if (tsc.status !== 0) process.exit(tsc.status ?? 1)

const build = spawnSync('npx vite build', {
  cwd: projectRoot,
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, WIDGET_OUT_DIR: outDir },
})
process.exit(build.status ?? 0)
