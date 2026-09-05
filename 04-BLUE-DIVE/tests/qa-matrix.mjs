import { chromium, devices } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const evidenceRoot = process.env.BLUE_DIVE_EVIDENCE || join(projectRoot, 'evidence', 'qa-matrix')
const baseUrl = process.env.BLUE_DIVE_URL || 'http://127.0.0.1:4361/'
await mkdir(evidenceRoot, { recursive: true })

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const results = []

function observe(page, name) {
  const diagnostics = { name, console: [], pageErrors: [], failedRequests: [], badResponses: [] }
  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') {
      diagnostics.console.push({ type: message.type(), text: message.text() })
    }
  })
  page.on('pageerror', (error) => diagnostics.pageErrors.push(error.message))
  page.on('requestfailed', (request) => {
    diagnostics.failedRequests.push({ url: request.url(), reason: request.failure()?.errorText ?? 'unknown' })
  })
  page.on('response', (response) => {
    if (response.status() >= 400) diagnostics.badResponses.push({ url: response.url(), status: response.status() })
  })
  return diagnostics
}

async function waitForAttribute(page, attribute, value, timeout = 15000) {
  await page.waitForFunction(
    ([name, expected]) => document.querySelector('.experience')?.getAttribute(name) === expected,
    [attribute, value],
    { timeout },
  )
}

async function waitForStage(page, stage, timeout = 15000) {
  await waitForAttribute(page, 'data-stage', stage, timeout)
}

async function enter(page) {
  await page.getByRole('button', { name: '触碰水滴，进入蓝色世界' }).click()
  await waitForStage(page, 'surface')
}

async function wheelPulse(page, count) {
  for (let index = 0; index < count; index += 1) {
    await page.mouse.wheel(0, 180)
    await page.waitForTimeout(75)
  }
  await page.waitForTimeout(720)
}

async function touchDrag(cdp, page, from, to, steps = 14) {
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x: from.x, y: from.y, radiusX: 5, radiusY: 5, force: 0.42 }],
  })
  for (let index = 1; index <= steps; index += 1) {
    const progress = index / steps
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{
        x: from.x + (to.x - from.x) * progress,
        y: from.y + (to.y - from.y) * progress,
        radiusX: 5,
        radiusY: 5,
        force: 0.5,
      }],
    })
    await page.waitForTimeout(22)
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await page.waitForTimeout(620)
}

async function readState(page) {
  return page.evaluate(() => {
    const root = document.querySelector('.experience')
    const recordView = document.querySelector('.record-view')
    return {
      stage: root?.getAttribute('data-stage'),
      webgl: root?.getAttribute('data-webgl'),
      asset: root?.getAttribute('data-asset'),
      audio: root?.getAttribute('data-audio-state'),
      motion: root?.getAttribute('data-motion-mode'),
      depth: root?.getAttribute('data-depth'),
      cohesion: root?.getAttribute('data-cohesion'),
      signature: root?.getAttribute('data-dive-signature'),
      viewport: { width: window.innerWidth, height: window.innerHeight, dpr: window.devicePixelRatio },
      coarsePointer: matchMedia('(pointer: coarse)').matches,
      touchPoints: navigator.maxTouchPoints,
      documentOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      recordOverflow: recordView ? recordView.scrollWidth - recordView.clientWidth : 0,
    }
  })
}

// Mobile touch path
{
  const context = await browser.newContext({ ...devices['iPhone 13'], colorScheme: 'dark' })
  const page = await context.newPage()
  const diagnostics = observe(page, 'mobile-touch')
  await page.goto(baseUrl, { waitUntil: 'networkidle' })
  await waitForAttribute(page, 'data-webgl', 'ready')
  await page.screenshot({ path: join(evidenceRoot, 'mobile-01-entry.png') })
  await enter(page)
  const cdp = await context.newCDPSession(page)
  await touchDrag(cdp, page, { x: 202, y: 565 }, { x: 185, y: 145 })
  await waitForStage(page, 'echo')
  await page.screenshot({ path: join(evidenceRoot, 'mobile-02-echo.png') })
  await touchDrag(cdp, page, { x: 260, y: 575 }, { x: 185, y: 145 })
  await touchDrag(cdp, page, { x: 115, y: 500 }, { x: 255, y: 275 }, 10)
  await waitForStage(page, 'core')
  await page.screenshot({ path: join(evidenceRoot, 'mobile-03-core.png') })
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x: 205, y: 334, radiusX: 6, radiusY: 6, force: 0.5 }],
  })
  await waitForStage(page, 'ascent', 10000)
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await waitForStage(page, 'record', 10000)
  await page.waitForTimeout(1000)
  await page.screenshot({ path: join(evidenceRoot, 'mobile-04-record.png'), fullPage: true })
  const state = await readState(page)
  results.push({ ...diagnostics, state })
  await context.close()
}

// WebGL fallback path and visible settings
{
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, colorScheme: 'dark' })
  const page = await context.newPage()
  const diagnostics = observe(page, 'webgl-fallback')
  await page.goto(`${baseUrl}?fallback=1`, { waitUntil: 'networkidle' })
  await waitForAttribute(page, 'data-webgl', 'fallback')
  await enter(page)
  await page.getByRole('button', { name: '声音 开' }).click()
  await waitForAttribute(page, 'data-audio-state', 'muted')
  await page.getByRole('button', { name: '声音 关' }).click()
  await waitForAttribute(page, 'data-audio-state', 'playing')
  await page.getByRole('button', { name: '动态 标准' }).click()
  await waitForAttribute(page, 'data-motion-mode', 'reduced')
  await wheelPulse(page, 11)
  await waitForStage(page, 'core')
  await page.mouse.move(260, 240)
  await page.mouse.move(1000, 590, { steps: 20 })
  await page.mouse.move(640, 410, { steps: 16 })
  await page.mouse.down()
  await waitForStage(page, 'ascent', 10000)
  await page.mouse.up()
  await waitForStage(page, 'record', 8000)
  await page.waitForTimeout(1000)
  await page.screenshot({ path: join(evidenceRoot, 'fallback-record.png') })
  const state = await readState(page)
  results.push({ ...diagnostics, state })
  await context.close()
}

// Reduced-motion keyboard-only path
{
  const context = await browser.newContext({
    viewport: { width: 1366, height: 768 },
    colorScheme: 'dark',
    reducedMotion: 'reduce',
  })
  const page = await context.newPage()
  const diagnostics = observe(page, 'reduced-keyboard')
  await page.goto(baseUrl, { waitUntil: 'networkidle' })
  await waitForAttribute(page, 'data-webgl', 'ready')
  await page.getByRole('button', { name: '触碰水滴，进入蓝色世界' }).focus()
  await page.keyboard.press('Enter')
  await waitForStage(page, 'surface')
  await page.keyboard.down('s')
  await page.waitForTimeout(4600)
  await page.keyboard.up('s')
  await waitForStage(page, 'core')
  await page.keyboard.press('d')
  await page.keyboard.press('a')
  await page.keyboard.press('d')
  await page.keyboard.down(' ')
  await waitForStage(page, 'ascent', 10000)
  await page.keyboard.up(' ')
  await waitForStage(page, 'record', 7000)
  await page.waitForTimeout(800)
  await page.screenshot({ path: join(evidenceRoot, 'reduced-keyboard-record.png') })
  const state = await readState(page)
  results.push({ ...diagnostics, state })
  await context.close()
}

// Non-critical texture failure must not blank the work
{
  const context = await browser.newContext({ viewport: { width: 1200, height: 760 }, colorScheme: 'dark' })
  const page = await context.newPage()
  const diagnostics = observe(page, 'asset-fallback')
  await page.route('**/assets/diver-memory.webp', (route) => route.abort('failed'))
  await page.goto(baseUrl, { waitUntil: 'networkidle' })
  await waitForAttribute(page, 'data-webgl', 'ready')
  await waitForAttribute(page, 'data-asset', 'fallback')
  await page.screenshot({ path: join(evidenceRoot, 'asset-fallback-entry.png') })
  const hasEntry = await page.getByRole('button', { name: '触碰水滴，进入蓝色世界' }).isVisible()
  const state = await readState(page)
  results.push({ ...diagnostics, state, hasEntry, expectedFailedAsset: true })
  await context.close()
}

// Short frame-time and resource probe on the formal build
{
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    colorScheme: 'dark',
  })
  const page = await context.newPage()
  const diagnostics = observe(page, 'performance-probe')
  await page.goto(baseUrl, { waitUntil: 'networkidle' })
  await waitForAttribute(page, 'data-webgl', 'ready')
  await enter(page)
  const fullCanvas = await page.locator('.world-canvas').evaluate((canvas) => ({ width: canvas.width, height: canvas.height }))
  await page.getByRole('button', { name: '动态 标准' }).click()
  await waitForAttribute(page, 'data-motion-mode', 'reduced')
  await page.waitForTimeout(250)
  const reducedCanvas = await page.locator('.world-canvas').evaluate((canvas) => ({ width: canvas.width, height: canvas.height }))
  await page.getByRole('button', { name: '动态 减少' }).click()
  await waitForAttribute(page, 'data-motion-mode', 'full')
  const performance = await page.evaluate(async (resolutionSwitch) => {
    const longTasks = []
    const observer = 'PerformanceObserver' in window
      ? new PerformanceObserver((list) => longTasks.push(...list.getEntries().map((entry) => entry.duration)))
      : null
    observer?.observe({ type: 'longtask', buffered: true })
    const start = performance.now()
    const canvas = document.querySelector('.world-canvas')
    const renderStart = canvas?.__blueDiveRenderFrames ?? 0
    let frames = 0
    await new Promise((resolve) => {
      const count = (time) => {
        frames += 1
        if (time - start >= 5000) resolve()
        else requestAnimationFrame(count)
      }
      requestAnimationFrame(count)
    })
    observer?.disconnect()
    const renderFrames = (canvas?.__blueDiveRenderFrames ?? renderStart) - renderStart
    const resources = performance.getEntriesByType('resource').map((entry) => ({
      name: entry.name.split('/').pop(),
      transferSize: entry.transferSize,
      duration: Number(entry.duration.toFixed(2)),
    }))
    return {
      frames,
      elapsedMs: Number((performance.now() - start).toFixed(2)),
      approximateFps: Number((frames / ((performance.now() - start) / 1000)).toFixed(1)),
      renderFrames,
      approximateRenderFps: Number((renderFrames / ((performance.now() - start) / 1000)).toFixed(1)),
      resolutionSwitch,
      longTasks,
      resources,
    }
  }, { fullCanvas, reducedCanvas })
  const state = await readState(page)
  results.push({ ...diagnostics, state, performance })
  await context.close()
}

await browser.close()

const unexpected = results.flatMap((result) => {
  const issues = []
  if (result.pageErrors.length) issues.push(`${result.name}: pageErrors`)
  if (result.badResponses.length) issues.push(`${result.name}: badResponses`)
  if (result.console.length && result.name !== 'asset-fallback') issues.push(`${result.name}: console`)
  if (
    result.name === 'asset-fallback' &&
    result.console.some((entry) => !entry.text.includes('Failed to load resource'))
  ) issues.push('asset-fallback: unexpected console')
  if (result.name !== 'asset-fallback' && result.failedRequests.length) issues.push(`${result.name}: failedRequests`)
  if (result.state.documentOverflow !== 0 || result.state.recordOverflow !== 0) issues.push(`${result.name}: overflow`)
  if (['mobile-touch', 'webgl-fallback', 'reduced-keyboard'].includes(result.name) && result.state.stage !== 'record') {
    issues.push(`${result.name}: incomplete`)
  }
  if (result.name === 'mobile-touch' && (!result.state.coarsePointer || result.state.touchPoints < 1)) {
    issues.push('mobile-touch: no touch emulation')
  }
  if (result.name === 'webgl-fallback' && result.state.webgl !== 'fallback') issues.push('webgl-fallback: wrong mode')
  if (result.name === 'reduced-keyboard' && result.state.motion !== 'reduced') issues.push('reduced-keyboard: wrong mode')
  if (result.name === 'asset-fallback' && (!result.hasEntry || result.state.asset !== 'fallback')) {
    issues.push('asset-fallback: no graceful fallback')
  }
  if (result.name === 'performance-probe') {
    if (result.performance.approximateRenderFps < 48 || result.performance.approximateRenderFps > 62) {
      issues.push('performance-probe: unstable render rate')
    }
    if (result.performance.resolutionSwitch.reducedCanvas.width >= result.performance.resolutionSwitch.fullCanvas.width) {
      issues.push('performance-probe: reduced motion did not lower resolution')
    }
  }
  return issues
})

const report = { generatedAt: new Date().toISOString(), baseUrl, results, unexpected }
await writeFile(join(evidenceRoot, 'qa-matrix-report.json'), JSON.stringify(report, null, 2), 'utf8')
console.log(JSON.stringify(report, null, 2))
if (unexpected.length) process.exit(1)
