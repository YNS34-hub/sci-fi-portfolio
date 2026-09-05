import { chromium } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const evidenceRoot = process.env.BLUE_DIVE_EVIDENCE || join(projectRoot, 'evidence', 'runtime')
const baseUrl = process.env.BLUE_DIVE_URL || 'http://127.0.0.1:4361/'
const browserChannel = process.env.BLUE_DIVE_BROWSER_CHANNEL || 'chrome'

await mkdir(evidenceRoot, { recursive: true })

const browser = await chromium.launch({ channel: browserChannel, headless: true })
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  colorScheme: 'dark',
  reducedMotion: 'no-preference',
  acceptDownloads: true,
})
const page = await context.newPage()
const consoleProblems = []
const pageErrors = []
const failedRequests = []
const badResponses = []

page.on('console', (message) => {
  if (message.type() === 'error' || message.type() === 'warning') {
    consoleProblems.push({ type: message.type(), text: message.text() })
  }
})
page.on('pageerror', (error) => pageErrors.push(error.message))
page.on('requestfailed', (request) => {
  failedRequests.push({ url: request.url(), reason: request.failure()?.errorText ?? 'unknown' })
})
page.on('response', (response) => {
  if (response.status() >= 400) badResponses.push({ url: response.url(), status: response.status() })
})

async function screenshot(name) {
  await page.screenshot({ path: join(evidenceRoot, `${name}.png`), fullPage: true })
}

async function waitForStage(stage, timeout = 12000) {
  await page.locator('.experience').waitFor({ state: 'visible' })
  await page.waitForFunction(
    (expected) => document.querySelector('.experience')?.getAttribute('data-stage') === expected,
    stage,
    { timeout },
  )
}

async function diveByWheel(amount, pause = 760) {
  const direction = Math.sign(amount) || 1
  const pulses = Math.max(1, Math.ceil(Math.abs(amount) / 180))
  for (let index = 0; index < pulses; index += 1) {
    await page.mouse.wheel(0, direction * 180)
    await page.waitForTimeout(80)
  }
  await page.waitForTimeout(pause)
}

await page.goto(baseUrl, { waitUntil: 'networkidle' })
await page.waitForFunction(() => document.querySelector('.experience')?.getAttribute('data-webgl') !== 'loading')
await screenshot('01-entry')

await page.getByRole('button', { name: '触碰水滴，进入蓝色世界' }).click()
await waitForStage('surface')
await page.waitForTimeout(900)
await screenshot('02-surface')

await diveByWheel(720)
await waitForStage('echo')
await page.mouse.move(280, 260)
await page.mouse.move(940, 610, { steps: 18 })
await page.mouse.move(650, 390, { steps: 12 })
await page.waitForTimeout(700)
await screenshot('03-echo')

await diveByWheel(620)
await waitForStage('unsaid')
await page.mouse.click(890, 440)
await page.waitForTimeout(700)
await screenshot('04-unsaid')

await diveByWheel(620)
await waitForStage('core')
await page.mouse.move(340, 250)
await page.mouse.move(1110, 560, { steps: 24 })
await page.mouse.move(710, 420, { steps: 18 })
await page.waitForTimeout(1000)
await screenshot('05-core-scattered')

await page.mouse.down()
await waitForStage('ascent', 10000)
await page.mouse.up()
await page.waitForTimeout(1100)
await screenshot('06-ascent')
await waitForStage('record', 10000)
await page.waitForTimeout(1100)
await screenshot('07-record')

const downloadPromise = page.waitForEvent('download')
await page.getByRole('button', { name: '保存记录' }).click()
const download = await downloadPromise
await download.saveAs(join(evidenceRoot, 'dive-record.png'))

const runtime = await page.evaluate(() => {
  const root = document.querySelector('.experience')
  const canvas = document.querySelector('.world-canvas')
  const gl = canvas instanceof HTMLCanvasElement
    ? canvas.getContext('webgl2') || canvas.getContext('webgl')
    : null
  const bodyOverflow = document.documentElement.scrollWidth - document.documentElement.clientWidth
  return {
    stage: root?.getAttribute('data-stage'),
    webgl: root?.getAttribute('data-webgl'),
    asset: root?.getAttribute('data-asset'),
    audio: root?.getAttribute('data-audio-state'),
    motion: root?.getAttribute('data-motion-mode'),
    depth: root?.getAttribute('data-depth'),
    cohesion: root?.getAttribute('data-cohesion'),
    signature: root?.getAttribute('data-dive-signature'),
    webglContext: gl ? (gl instanceof WebGL2RenderingContext ? 'webgl2' : 'webgl') : 'none',
    contextLost: gl ? gl.isContextLost() : null,
    horizontalOverflow: bodyOverflow,
    canvasSize: canvas instanceof HTMLCanvasElement
      ? { width: canvas.width, height: canvas.height, clientWidth: canvas.clientWidth, clientHeight: canvas.clientHeight }
      : null,
  }
})

await page.getByRole('button', { name: '再潜一次' }).click()
await waitForStage('entry')
runtime.restartStage = await page.locator('.experience').getAttribute('data-stage')

const report = {
  url: baseUrl,
  generatedAt: new Date().toISOString(),
  runtime,
  consoleProblems,
  pageErrors,
  failedRequests,
  badResponses,
}

await writeFile(join(evidenceRoot, 'runtime-report.json'), JSON.stringify(report, null, 2), 'utf8')
await context.close()
await browser.close()

if (
  runtime.stage !== 'record' ||
  runtime.webgl !== 'ready' ||
  runtime.asset !== 'loaded' ||
  runtime.webglContext === 'none' ||
  runtime.contextLost ||
  runtime.horizontalOverflow !== 0 ||
  !runtime.signature ||
  runtime.restartStage !== 'entry' ||
  consoleProblems.length ||
  pageErrors.length ||
  failedRequests.length ||
  badResponses.length
) {
  console.error(JSON.stringify(report, null, 2))
  process.exit(1)
}

console.log(JSON.stringify(report, null, 2))
