#!/usr/bin/env node
import { existsSync, mkdirSync, writeFileSync, mkdtempSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { spawnSync } from 'node:child_process'
import { deflateSync } from 'node:zlib'

function usage() {
  return `Usage: node scripts/acceptance-browser.mjs --url <production-url> [--out output/playwright] [--session final-qa]\n\nRuns browser acceptance evidence with Playwright CLI run-code in an isolated session.\nArtifacts: JSON evidence, run-code file, screenshots, downloads under --out.`
}

function parseArgs(argv) {
  const args = { out: 'output/playwright', session: 'final-qa', headed: false }
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    if (arg === '--help' || arg === '-h') args.help = true
    else if (arg === '--headed') args.headed = true
    else if (arg === '--url') args.url = argv[++index]
    else if (arg.startsWith('--url=')) args.url = arg.slice('--url='.length)
    else if (arg === '--out') args.out = argv[++index]
    else if (arg.startsWith('--out=')) args.out = arg.slice('--out='.length)
    else if (arg === '--session') args.session = argv[++index]
    else if (arg.startsWith('--session=')) args.session = arg.slice('--session='.length)
    else throw new Error(`Unknown argument: ${arg}`)
  }
  return args
}

const args = parseArgs(process.argv.slice(2))
if (args.help || !args.url) {
  console.log(usage())
  process.exit(args.help ? 0 : 2)
}

const url = new URL(args.url).toString()
if (!['http:', 'https:'].includes(new URL(url).protocol)) throw new Error('Use an HTTP(S) preview URL.')
if (!/^[a-zA-Z0-9_-]+$/.test(args.session)) throw new Error('Invalid session name.')
const outDir = resolve(args.out)
mkdirSync(outDir, { recursive: true })
mkdirSync(join(outDir, 'downloads'), { recursive: true })
mkdirSync(join(outDir, 'screenshots'), { recursive: true })

const runCodePath = join(outDir, 'acceptance-browser.run-code.mjs')
const stdoutPath = join(outDir, 'acceptance-browser.stdout.log')
const stderrPath = join(outDir, 'acceptance-browser.stderr.log')
const finalJsonPath = join(outDir, 'acceptance-browser-final-qa.json')
const screenshotPath = join(outDir, 'screenshots', 'final-qa-workspace.png')
const downloadDir = join(outDir, 'downloads')
const tempDir = mkdtempSync(join(tmpdir(), 'adcraft-final-qa-'))
const pngPath = join(tempDir, 'qa-asset.png')

// Generate an asymmetric PNG with valid chunk CRCs so crop and decode are real.
function pngChunk(type, data) {
  const content = Buffer.concat([Buffer.from(type), data])
  let crc = 0xffffffff
  for (const byte of content) {
    crc ^= byte
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0)
  }
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length)
  const checksum = Buffer.alloc(4)
  checksum.writeUInt32BE((crc ^ 0xffffffff) >>> 0)
  return Buffer.concat([length, content, checksum])
}
const width = 320
const height = 160
const header = Buffer.alloc(13)
header.writeUInt32BE(width, 0)
header.writeUInt32BE(height, 4)
header[8] = 8
header[9] = 2
const pixels = Buffer.alloc(height * (width * 3 + 1))
for (let y = 0; y < height; y += 1) {
  for (let x = 0; x < width; x += 1) {
    const offset = y * (width * 3 + 1) + 1 + x * 3
    pixels[offset] = x < width / 2 ? 220 : 30
    pixels[offset + 1] = y < height / 2 ? 70 : 180
    pixels[offset + 2] = x < width / 2 ? 40 : 220
  }
}
writeFileSync(pngPath, Buffer.concat([
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
  pngChunk('IHDR', header), pngChunk('IDAT', deflateSync(pixels)), pngChunk('IEND', Buffer.alloc(0)),
]))

const qaCode = `async () => {
  const evidence = {
    meta: {
      url: ${JSON.stringify(url)},
      session: ${JSON.stringify(args.session)},
      startedAt: new Date().toISOString(),
      userAgent: await page.evaluate(() => navigator.userAgent).catch(() => 'unavailable'),
    },
    assertions: [],
    failures: [],
    consoleErrors: [],
    pageErrors: [],
    cspViolations: [],
    failedRequests: [],
    externalRequests: [],
    downloads: [],
    screenshots: [],
    reducedMotion: {},
    c01: {},
    c09: {},
    a04: {},
    a01: {},
    a06: {},
    r02: {},
  }
  const mark = (name, passed, details = {}) => {
    evidence.assertions.push({ name, passed: Boolean(passed), details })
    if (!passed) evidence.failures.push({ name, details })
  }
  const textOf = async (locator) => (await locator.textContent().catch(() => '') || '').replace(/\\s+/g, ' ').trim()
  const activeInfo = async () => page.evaluate(() => {
    const el = document.activeElement
    if (!el) return null
    return {
      tag: el.tagName,
      id: el.id || '',
      role: el.getAttribute('role') || '',
      ariaLabel: el.getAttribute('aria-label') || '',
      text: (el.textContent || '').replace(/\\s+/g, ' ').trim().slice(0, 120),
      value: 'value' in el ? el.value : undefined,
    }
  })
  const selectByText = async (selector, pattern) => {
    const handle = page.locator(selector)
    await handle.waitFor({ state: 'visible', timeout: 10000 })
    const options = await handle.locator('option').evaluateAll((items) =>
      items.map((option) => ({ value: option.value, text: option.textContent || '' })),
    )
    const found = options.find((option) => pattern.test(option.text))
    if (!found) throw new Error('Missing option for ' + pattern + ': ' + options.map((option) => option.text.trim()).join(' | '))
    await handle.selectOption(found.value)
    await page.waitForTimeout(150)
    return found
  }
  const setRange = async (selector, value) => {
    const locator = page.locator(selector)
    await locator.waitFor({ state: 'visible', timeout: 10000 })
    await locator.evaluate((el, next) => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, String(next))
      el.dispatchEvent(new Event('input', { bubbles: true }))
      el.dispatchEvent(new Event('change', { bubbles: true }))
    }, value)
    await page.waitForTimeout(100)
  }
  const targetState = async (name) => {
    const placement = await page.locator('#placement').inputValue().catch(() => '')
    const placementText = await page.locator('#placement option:checked').textContent().catch(() => '')
    const focalX = await page.locator('#focal-x').inputValue().catch(() => '')
    const focalY = await page.locator('#focal-y').inputValue().catch(() => '')
    const assetRows = await page.locator('.asset-row').count().catch(() => 0)
    const previewText = await textOf(page.locator('.preview-panel'))
    const imageStyles = await page.locator('.preview-panel img').evaluateAll((imgs) =>
      imgs.map((img) => ({ src: img.currentSrc || img.src, objectPosition: getComputedStyle(img).objectPosition, objectFit: getComputedStyle(img).objectFit })),
    ).catch(() => [])
    return { name, placement, placementText: (placementText || '').trim(), focalX, focalY, assetRows, previewText, imageStyles }
  }

  page.on('pageerror', (error) => evidence.pageErrors.push({ message: error.message, stack: error.stack }))
  page.on('console', (message) => {
    if (['error', 'warning'].includes(message.type())) evidence.consoleErrors.push({ type: message.type(), text: message.text() })
  })
  page.on('requestfailed', (request) => evidence.failedRequests.push({ url: request.url(), failure: request.failure()?.errorText || '' }))
  page.on('request', (request) => {
    try {
      const reqUrl = new URL(request.url())
      const appUrl = new URL(${JSON.stringify(url)})
      const loopback = ['127.0.0.1', 'localhost', '[::1]'].includes(reqUrl.hostname)
      if (reqUrl.origin !== appUrl.origin && !['data:', 'blob:'].includes(reqUrl.protocol) && !loopback) {
        evidence.externalRequests.push({ url: request.url(), method: request.method(), resourceType: request.resourceType() })
      }
    } catch {}
  })
  page.on('download', async (download) => {
    const suggested = download.suggestedFilename()
    const path = ${JSON.stringify(downloadDir)} + '/' + suggested.replace(/[^a-zA-Z0-9._-]+/g, '-')
    await download.saveAs(path).catch(() => undefined)
    evidence.downloads.push({ suggestedFilename: suggested, path })
  })

  await page.addInitScript(() => {
    window.__qaCspViolations = []
    document.addEventListener('securitypolicyviolation', (event) => {
      window.__qaCspViolations.push({
        blockedURI: event.blockedURI,
        violatedDirective: event.violatedDirective,
        effectiveDirective: event.effectiveDirective,
        disposition: event.disposition,
        sourceFile: event.sourceFile,
        lineNumber: event.lineNumber,
      })
    })
  })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto(${JSON.stringify(url)}, { waitUntil: 'domcontentloaded', timeout: 45000 })
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => undefined)
  await page.locator('main#main').waitFor({ state: 'visible', timeout: 15000 })
  evidence.reducedMotion.matches = await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)
  mark('A06 reduced-motion media query active', evidence.reducedMotion.matches === true, evidence.reducedMotion)

  // Upload one real PNG through the app input so C01 can prove target switches keep asset state.
  await page.locator('input[type="file"][accept*="image/png"]').setInputFiles(${JSON.stringify(pngPath)})
  await page
    .waitForFunction(
      () =>
        document.querySelectorAll('.asset-row').length > 0 ||
        /Tệp rỗng|Chỉ nhận|Không đọc|Vượt ngân sách|metadata|PNG|SVG\\/HTML/i.test(
          document.body.innerText,
        ),
      null,
      { timeout: 15000 },
    )
    .catch(() => undefined)
  evidence.c01.uploadedAssetText = await textOf(page.locator('.asset-row').first())
  evidence.c01.uploadNotice = await textOf(page.locator('[role="status"]').first()).catch(() => '')
  evidence.c01.assetRowCountAfterUpload = await page.locator('.asset-row').count().catch(() => 0)
  mark(
    'C01 uploaded asset visible before target changes',
    evidence.c01.assetRowCountAfterUpload > 0 && /qa-asset\\.png/.test(evidence.c01.uploadedAssetText),
    {
      assetText: evidence.c01.uploadedAssetText,
      notice: evidence.c01.uploadNotice,
      rowCount: evidence.c01.assetRowCountAfterUpload,
    },
  )

  await page.getByRole('button', { name: /Facebook/i }).click()
  await page.waitForTimeout(200)
  const feedOption = await selectByText('#placement', /feed/i)
  await page.getByRole('button', { name: 'Chỉnh crop target' }).click().catch(async () => {})
  if (await page.locator('#focal-x').isHidden().catch(() => true)) await page.getByRole('button', { name: 'Chỉnh crop target' }).click()
  await setRange('#focal-x', 23)
  await setRange('#focal-y', 76)
  evidence.c01.feed = await targetState('feed')

  const storiesOption = await selectByText('#placement', /stor/i).catch((error) => ({ error: error.message }))
  await setRange('#focal-x', 76)
  await setRange('#focal-y', 23)
  evidence.c01.stories = await targetState('stories')
  const reelsOption = await selectByText('#placement', /reels?/i).catch((error) => ({ error: error.message }))
  evidence.c01.reels = await targetState('reels')
  await selectByText('#placement', /feed/i).catch(() => undefined)
  evidence.c01.feedAfterReturn = await targetState('feedAfterReturn')
  evidence.c01.options = { feedOption, storiesOption, reelsOption }
  mark('C01 Feed focal 23/76 retained after Stories/Reels target changes', evidence.c01.feedAfterReturn.focalX === '23' && evidence.c01.feedAfterReturn.focalY === '76', evidence.c01.feedAfterReturn)
  mark('C01 asset retained across Feed->Stories->Reels', [evidence.c01.feed, evidence.c01.stories, evidence.c01.reels, evidence.c01.feedAfterReturn].every((item) => item.assetRows >= 1), {
    assetRows: [evidence.c01.feed.assetRows, evidence.c01.stories.assetRows, evidence.c01.reels.assetRows, evidence.c01.feedAfterReturn.assetRows],
  })
  mark('C01 Stories/Reels reachable or reported with explicit option evidence', !storiesOption.error && !reelsOption.error, { storiesOption, reelsOption })
  mark('C01 target crops are independent', evidence.c01.stories.focalX === '76' && evidence.c01.reels.focalX === '50' && evidence.c01.feedAfterReturn.focalX === '23', evidence.c01)
  mark('C01 original blob URL retained', evidence.c01.feed.imageStyles[0]?.src?.startsWith('blob:') && [evidence.c01.stories, evidence.c01.reels, evidence.c01.feedAfterReturn].every((state) => state.imageStyles[0]?.src === evidence.c01.feed.imageStyles[0].src), evidence.c01)

  await page.getByRole('button', { name: 'So sánh', exact: true }).click()
  for (const id of ['facebook.stories', 'facebook.reels']) {
    await page.locator('#compare-target').selectOption(id)
    await page.locator('.compare-picker').getByRole('button', { name: 'Thêm', exact: true }).click()
  }
  evidence.r02.cards = await page.locator('.compare-card').evaluateAll((cards) => cards.map((card) => ({
    heading: card.querySelector('.compare-card-heading').textContent.trim(),
    footer: card.querySelector('.compare-card-footer').textContent.trim(),
    images: Array.from(card.querySelectorAll('img')).map((img) => ({ src: img.src, position: getComputedStyle(img).objectPosition })),
  })))
  const facebookCards = evidence.r02.cards.filter((card) => card.heading.includes('Facebook'))
  mark('R02 four compare cards retain independent crop and issue summary', evidence.r02.cards.length === 4 && facebookCards.length === 3 && ['23% 76%', '76% 23%', '50% 50%'].every((position) => facebookCards.some((card) => card.images.some((img) => img.position === position))) && evidence.r02.cards.every((card) => /lỗi.*chưa/.test(card.footer)), evidence.r02)
  await page.screenshot({ path: ${JSON.stringify(join(outDir, 'screenshots', 'final-qa-compare.png'))}, fullPage: true })
  await page.getByRole('button', { name: 'Workspace', exact: true }).click()

  // C09: Google Search headline clear mode removes textarea/input and resolves preview/validation to empty headline.
  await page.getByRole('button', { name: /Google Search/i }).click()
  await page.waitForTimeout(200)
  await selectByText('#placement', /mobile|search/i).catch(() => undefined)
  await page.getByRole('button', { name: /Copy riêng/i }).click()
  const headlineMode = page.getByLabel('Chế độ Tiêu đề')
  await headlineMode.selectOption('clear')
  await page.waitForTimeout(200)
  evidence.c09.modeValue = await headlineMode.inputValue()
  evidence.c09.overrideTextareaCount = await page.locator('#override-headline').count()
  evidence.c09.clearText = await textOf(page.locator('.override-field').filter({ has: page.getByLabel('Chế độ Tiêu đề') }).first())
  evidence.c09.previewText = await textOf(page.locator('.preview-panel'))
  evidence.c09.validationText = await textOf(page.locator('.validation-panel'))
  mark('C09 clear mode selected for headline', evidence.c09.modeValue === 'clear', evidence.c09)
  mark('C09 clear removes override headline input', evidence.c09.overrideTextareaCount === 0, evidence.c09)
  mark('C09 resolved UI indicates intentional empty headline', /Trống chủ ý/.test(evidence.c09.clearText) && /Tiêu đề RSA không được để trống|không được để trống/i.test(evidence.c09.validationText), evidence.c09)
  await selectByText('#placement', /desktop/i)
  evidence.c09.otherTargetMode = await headlineMode.inputValue()
  await selectByText('#placement', /mobile/i)
  evidence.c09.modeAfterReturn = await headlineMode.inputValue()
  mark('C09 clear retained after target switch and return; other target inherits', evidence.c09.otherTargetMode === 'inherit' && evidence.c09.modeAfterReturn === 'clear', evidence.c09)

  // A04: composition issue focuses exact composition select.
  await page.locator('#composition').selectOption('single_image')
  await page.waitForTimeout(250)
  const compositionIssue = page.locator('.check-item').filter({ hasText: /Bố cục|Profile .*chưa hỗ trợ|Target chưa ghi nhận/i }).first()
  await compositionIssue.click()
  await page.waitForTimeout(100)
  evidence.a04.afterCompositionIssueClick = await activeInfo()
  mark('A04 focusCheck sends composition issue to #composition select', evidence.a04.afterCompositionIssueClick?.id === 'composition', evidence.a04.afterCompositionIssueClick)

  // A01: keyboard traversal hits core regions and source drawer close returns focus.
  await page.keyboard.press('Home').catch(() => undefined)
  await page.locator('body').click({ position: { x: 8, y: 8 } }).catch(() => undefined)
  const tabStops = []
  for (let index = 0; index < 60; index += 1) {
    await page.keyboard.press('Tab')
    tabStops.push(await activeInfo())
  }
  evidence.a01.tabStops = tabStops
  const tabText = JSON.stringify(tabStops)
  mark('A01 keyboard traverses header controls', /Nhập nháp|Xuất JSON|Gói review/.test(tabText), { sample: tabStops.slice(0, 12) })
  mark('A01 keyboard reaches target/editor/preview/issues/export controls', ['placement', 'composition', 'Chỉnh crop target', 'Xuất PNG', 'Gói review ZIP', 'Nguồn rule'].every((text) => tabText.includes(text)), { tabStops })
  evidence.reducedMotion.durations = await page.locator('.workbench, .preview-panel').evaluateAll((elements) => elements.map((el) => ({ animation: getComputedStyle(el).animationDuration, transition: getComputedStyle(el).transitionDuration })))
  mark('A06 reduced-motion has no spatial animation', evidence.reducedMotion.durations.length > 0 && evidence.reducedMotion.durations.every((item) => item.animation === '0s' && item.transition === '0s'), evidence.reducedMotion)

  const sourceTrigger = page.locator('.source-button').first()
  await sourceTrigger.waitFor({ state: 'visible', timeout: 10000 })
  const sourceTriggerLabel = await sourceTrigger.getAttribute('aria-label')
  await sourceTrigger.click()
  await page.locator('aside[role="dialog"][aria-labelledby="source-drawer-title"]').waitFor({ state: 'visible', timeout: 10000 })
  evidence.a01.sourceDialogInitialFocus = await activeInfo()
  await page.getByRole('button', { name: 'Đóng nguồn' }).click()
  await page.waitForTimeout(150)
  evidence.a01.sourceReturnFocus = await activeInfo()
  mark('A01 source drawer close returns focus to trigger', evidence.a01.sourceReturnFocus?.ariaLabel === sourceTriggerLabel, { trigger: sourceTriggerLabel, focus: evidence.a01.sourceReturnFocus })

  // Normal export/download path to prove CSP does not false-positive during actual export.
  const exportTrigger = page.getByRole('button', { name: /^Xuất PNG$/ }).first()
  await exportTrigger.click()
  await page.locator('aside[role="dialog"][aria-labelledby="review-drawer-title"]').waitFor({ state: 'visible', timeout: 15000 })
  evidence.a01.exportDialogInitialFocus = await activeInfo()
  for (let index = 0; index < 12; index += 1) await page.keyboard.press('Tab')
  mark('A01 export drawer traps keyboard focus', await page.evaluate(() => document.querySelector('aside[aria-labelledby="review-drawer-title"]').contains(document.activeElement)))
  await page.keyboard.press('Escape')
  await page.waitForFunction(() => !document.querySelector('aside[aria-labelledby="review-drawer-title"]') && document.activeElement.textContent.trim() === 'Xuất PNG', null, { timeout: 3000 }).catch(() => undefined)
  evidence.a01.exportReturnFocus = await activeInfo()
  mark('A01 Escape closes export drawer and returns focus', await page.locator('aside[aria-labelledby="review-drawer-title"]').count() === 0 && evidence.a01.exportReturnFocus?.text === 'Xuất PNG', evidence.a01.exportReturnFocus)
  await exportTrigger.press('Enter')
  await page.locator('aside[aria-labelledby="review-drawer-title"]').waitFor({ state: 'visible' })
  const downloadPromise = page.waitForEvent('download', { timeout: 45000 }).catch((error) => ({ error: error.message }))
  await page.getByRole('button', { name: /^Xuất PNG$/ }).last().click()
  const download = await downloadPromise
  if (download && !download.error && typeof download.suggestedFilename === 'function') {
    const suggested = download.suggestedFilename()
    const path = ${JSON.stringify(downloadDir)} + '/' + suggested.replace(/[^a-zA-Z0-9._-]+/g, '-')
    await download.saveAs(path).catch(() => undefined)
    evidence.downloads.push({ suggestedFilename: suggested, path, source: 'explicit-wait' })
  } else if (download?.error) {
    evidence.a01.downloadError = download.error
  }
  await page.waitForTimeout(300)
  mark('Export/download produced a local artifact', evidence.downloads.length > 0, { downloads: evidence.downloads, error: evidence.a01.downloadError })

  await page.screenshot({ path: ${JSON.stringify(screenshotPath)}, fullPage: true })
  evidence.screenshots.push(${JSON.stringify(screenshotPath)})
  evidence.cspViolations = await page.evaluate(() => window.__qaCspViolations || []).catch(() => [])
  evidence.a06.consoleErrorCount = evidence.consoleErrors.length
  evidence.a06.pageErrorCount = evidence.pageErrors.length
  evidence.a06.cspViolationCount = evidence.cspViolations.length
  evidence.meta.finishedAt = new Date().toISOString()
  mark('A06 no pageerror during acceptance flow', evidence.pageErrors.length === 0, { pageErrors: evidence.pageErrors })
  mark('CSP no securitypolicyviolation during normal flow/export', evidence.cspViolations.length === 0, { cspViolations: evidence.cspViolations })
  mark('MVP no external requests during upload/preview/export', evidence.externalRequests.length === 0, { externalRequests: evidence.externalRequests })
  mark('MVP no failed requests or console errors', evidence.failedRequests.length === 0 && evidence.consoleErrors.length === 0, { failedRequests: evidence.failedRequests, consoleErrors: evidence.consoleErrors })
  evidence.meta.passed = evidence.failures.length === 0
  return evidence
}`

writeFileSync(runCodePath, qaCode)

const npxCli = join(dirname(process.execPath), 'node_modules', 'npm', 'bin', 'npx-cli.js')
if (process.platform === 'win32' && !existsSync(npxCli)) throw new Error('npm npx-cli.js missing beside Node.js.')
const npxBin = process.platform === 'win32' ? process.execPath : 'npx'
const baseCliArgs = ['--yes', '--package', '@playwright/cli', 'playwright-cli', `-s=${args.session}`]
const spawnOptions = {
  cwd: process.cwd(),
  encoding: 'utf8',
  maxBuffer: 1024 * 1024 * 20,
  shell: false,
  env: process.env,
}
const runCli = (commandArgs) => {
  console.log(`Running: ${npxBin} ${commandArgs.join(' ')}`)
  return spawnSync(npxBin, process.platform === 'win32' ? [npxCli, ...commandArgs] : commandArgs, spawnOptions)
}
const openResult = runCli([...baseCliArgs, 'open', url, ...(args.headed ? ['--headed'] : [])])
writeFileSync(join(outDir, 'acceptance-browser.open.stdout.log'), openResult.stdout ?? '')
writeFileSync(join(outDir, 'acceptance-browser.open.stderr.log'), openResult.stderr ?? '')
if (openResult.error || openResult.status !== 0) {
  const message = openResult.error?.stack || openResult.error?.message || openResult.stderr || openResult.stdout
  console.error(message)
  process.exit(openResult.status ?? 1)
}

const rawCliArgs = ['--yes', '--package', '@playwright/cli', 'playwright-cli', '--raw', `-s=${args.session}`, 'run-code', '--filename', runCodePath]
const result = runCli(rawCliArgs)
const stdout = result.stdout ?? ''
const stderr = result.stderr ?? ''
if (result.error) {
  writeFileSync(stdoutPath, stdout)
  writeFileSync(stderrPath, `${stderr}\n${result.error.stack || result.error.message}\n`)
  console.error(result.error.stack || result.error.message)
  process.exit(1)
}
writeFileSync(stdoutPath, stdout)
writeFileSync(stderrPath, stderr)

if (stdout.trim().startsWith('{')) {
  const jsonText = stdout.trim()
  writeFileSync(finalJsonPath, jsonText + '\n')
  const evidence = JSON.parse(jsonText)
  console.log(`Evidence: ${finalJsonPath}`)
  console.log(`Assertions: ${evidence.assertions.filter((item) => item.passed).length}/${evidence.assertions.length}`)
  console.log(`Failures: ${evidence.failures.length}`)
  if (evidence.failures.length) console.log(JSON.stringify(evidence.failures, null, 2))
  if (evidence.pageErrors.length || evidence.cspViolations.length) {
    console.log(JSON.stringify({ pageErrors: evidence.pageErrors, cspViolations: evidence.cspViolations }, null, 2))
  }
} else {
  console.error('Could not parse evidence JSON. See logs:')
  console.error(stdoutPath)
  console.error(stderrPath)
  process.exit(1)
}

if (result.status !== 0) {
  console.error(stderr || stdout)
  process.exit(result.status ?? 1)
}

const evidence = JSON.parse(stdout.trim())
process.exit(evidence.failures.length || evidence.pageErrors.length || evidence.cspViolations.length ? 1 : 0)

