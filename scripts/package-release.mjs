#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { createHash } from 'node:crypto'
import { zipSync, unzipSync } from 'fflate'

const date = process.argv[2] ?? new Date().toISOString().slice(0, 10)
if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('Use release date YYYY-MM-DD.')
const revision = process.argv[3]
if (revision && !/^[a-z0-9][a-z0-9-]{0,31}$/.test(revision))
  throw new Error('Use a lowercase release revision with letters, digits or hyphens.')
const acceptancePath = process.argv[4] ?? 'output/playwright/acceptance-browser-final-qa.json'
if (process.argv.length > 5) throw new Error('Usage: package-release.mjs [YYYY-MM-DD] [revision] [acceptance-report]')
const name = `adcraft-local-mvp-${date}${revision ? `-${revision}` : ''}`
const outDir = 'output/releases'
const archivePath = join(outDir, `${name}.zip`)
if (existsSync(archivePath)) throw new Error(`Preserve existing release: ${archivePath}`)

const entries = {}
function addFile(path, archivePath = path) {
  entries[archivePath.replaceAll('\\', '/')] = new Uint8Array(readFileSync(path))
}
function addDirectory(path) {
  for (const item of readdirSync(path, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const child = join(path, item.name)
    if (item.isSymbolicLink()) throw new Error(`Release symlink not supported: ${child}`)
    if (item.isDirectory()) addDirectory(child)
    else if (item.isFile()) addFile(child)
  }
}
for (const directory of ['dist', 'src', 'docs', 'scripts', 'public']) addDirectory(directory)
for (const file of [
  'README.md', 'AD_PREVIEW_SPEC.md', 'PLATFORM_MATRIX.md', 'design.md', 'UI_UX_SPEC.md',
  'ACCEPTANCE_TESTS.md', 'VISUAL_QA.md', 'index.html', 'package.json', 'package-lock.json',
  'tsconfig.json', 'tsconfig.app.json', 'tsconfig.node.json', 'vite.config.ts', 'vitest.config.ts', '.gitignore',
]) addFile(file)

// Preserve compact acceptance evidence; original synthetic media stays outside the release.
for (const file of [
  'media-current-qa.json', 'export-qa-result.json',
  'package-current-checks.json', 'video-pixel-check.json',
  'screenshots/final-qa-compare.png',
]) addFile(`output/playwright/${file}`)
addFile(acceptancePath, 'output/playwright/acceptance-browser-final-qa.json')
const acceptance = JSON.parse(readFileSync(acceptancePath, 'utf8'))
if (!acceptance.meta.passed || acceptance.failures.length) throw new Error('Browser acceptance must pass before packaging.')

const hash = (bytes) => createHash('sha256').update(bytes).digest('hex')
const manifest = {
  release: name, scope: 'local browser MVP', createdAt: new Date().toISOString(),
  files: Object.fromEntries(Object.entries(entries).map(([path, bytes]) => [path, { bytes: bytes.length, sha256: hash(bytes) }])),
}
entries['release-manifest.json'] = new TextEncoder().encode(JSON.stringify(manifest, null, 2))
const archive = zipSync(entries, { level: 6 })
const restored = unzipSync(archive)
for (const [path, bytes] of Object.entries(entries)) {
  if (!restored[path] || hash(restored[path]) !== hash(bytes)) throw new Error(`Archive verification failed: ${path}`)
}
mkdirSync(outDir, { recursive: true })
writeFileSync(archivePath, archive, { flag: 'wx' })
const sha256 = hash(archive)
writeFileSync(join(outDir, `${name}.sha256`), `${sha256}  ${name}.zip\n`, { flag: 'wx' })
console.log(JSON.stringify({ archivePath, bytes: archive.length, files: Object.keys(entries).length, sha256, archiveVerified: true }, null, 2))
