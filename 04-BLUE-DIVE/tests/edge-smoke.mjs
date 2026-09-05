import { chromium } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const evidenceRoot = join(projectRoot, 'evidence', 'browser-smoke')
const baseUrl = process.env.BLUE_DIVE_URL || 'http://127.0.0.1:4361/'
await mkdir(evidenceRoot, { recursive: true })

const browser = await chromium.launch({ channel: 'msedge', headless: true })
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' })
const page = await context.newPage()
const consoleProblems = []
const pageErrors = []
const failedRequests = []
const badResponses = []

page.on('console', (message) => {
  if (message.type() === 'error' || message.type() === 'warning') consoleProblems.push(message.text())
})
page.on('pageerror', (error) => pageErrors.push(error.message))
page.on('requestfailed', (request) => failedRequests.push(request.url()))
page.on('response', (response) => {
  if (response.status() >= 400) badResponses.push({ url: response.url(), status: response.status() })
})

await page.goto(baseUrl, { waitUntil: 'networkidle' })
await page.waitForFunction(() => document.querySelector('.experience')?.getAttribute('data-webgl') !== 'loading')
await page.getByRole('button', { name: '触碰水滴，进入蓝色世界' }).click()
await page.waitForFunction(() => document.querySelector('.experience')?.getAttribute('data-stage') === 'surface')

const viewports = [
  { width: 1024, height: 768 },
  { width: 390, height: 844 },
  { width: 1920, height: 1080 },
]
const resizeChecks = []
for (const viewport of viewports) {
  await page.setViewportSize(viewport)
  await page.waitForTimeout(220)
  resizeChecks.push(await page.evaluate(() => {
    const root = document.querySelector('.experience')
    const canvas = document.querySelector('.world-canvas')
    const controls = [...document.querySelectorAll('.experience-controls button')]
    return {
      viewport: { width: innerWidth, height: innerHeight },
      stage: root?.getAttribute('data-stage'),
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      canvas: canvas ? { width: canvas.clientWidth, height: canvas.clientHeight } : null,
      controlsVisible: controls.every((button) => {
        const rect = button.getBoundingClientRect()
        return rect.left >= 0 && rect.right <= innerWidth && rect.top >= 0 && rect.bottom <= innerHeight
      }),
    }
  }))
}

await page.setViewportSize({ width: 1440, height: 900 })
await page.getByRole('button', { name: '声音 开' }).click()
await page.waitForFunction(() => document.querySelector('.experience')?.getAttribute('data-audio-state') === 'muted')
await page.getByRole('button', { name: '动态 标准' }).click()
await page.waitForFunction(() => document.querySelector('.experience')?.getAttribute('data-motion-mode') === 'reduced')
await page.screenshot({ path: join(evidenceRoot, 'edge-surface-reduced.png') })

const report = {
  generatedAt: new Date().toISOString(),
  browser: 'Microsoft Edge',
  resizeChecks,
  consoleProblems,
  pageErrors,
  failedRequests,
  badResponses,
}
await writeFile(join(evidenceRoot, 'edge-smoke-report.json'), JSON.stringify(report, null, 2), 'utf8')
await context.close()
await browser.close()

const invalidResize = resizeChecks.some((check) =>
  check.stage !== 'surface' || check.overflow !== 0 || !check.canvas || !check.controlsVisible,
)
if (invalidResize || consoleProblems.length || pageErrors.length || failedRequests.length || badResponses.length) {
  console.error(JSON.stringify(report, null, 2))
  process.exit(1)
}
console.log(JSON.stringify(report, null, 2))
