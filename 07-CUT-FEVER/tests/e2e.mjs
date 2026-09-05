import { chromium } from 'playwright'
import fs from 'node:fs/promises'
import path from 'node:path'

const baseURL = process.env.CUT_FEVER_URL || 'http://127.0.0.1:4371/'
const evidenceDir = path.resolve(process.env.EVIDENCE_DIR || 'evidence/v2')
await fs.mkdir(evidenceDir, { recursive: true })

const browser = await chromium.launch({ headless: true, channel: 'chrome' }).catch(() => chromium.launch({ headless: true }))
const report = {
  baseURL,
  startedAt: new Date().toISOString(),
  endings: [],
  mobile: {},
  consoleErrors: [],
  pageErrors: [],
  failedRequests: [],
  httpErrors: [],
  coldStart: {},
  peakPerformance: {},
  interactionPerformance: {},
  posterExportPerformance: {},
  accessibility: {},
  stress: {},
}

function wireDiagnostics(page, label) {
  page.on('console', (message) => {
    if (message.type() === 'error') report.consoleErrors.push({ label, text: message.text(), location: message.location() })
  })
  page.on('pageerror', (error) => report.pageErrors.push({ label, text: error.message }))
  page.on('requestfailed', (request) => report.failedRequests.push({ label, url: request.url(), error: request.failure()?.errorText }))
  page.on('response', (response) => {
    if (response.status() >= 400) report.httpErrors.push({ label, status: response.status(), url: response.url() })
  })
}

async function waitForPhase(page, phase, timeout = 12000) {
  await page.waitForFunction((expected) => window.__CUT_FEVER_TEST__?.getState().phase === expected, phase, { timeout })
}

async function enterRecovery(page, screenshotPrefix, keyboardOnly = false) {
  if (keyboardOnly) {
    await page.locator('.unknown-clip').focus()
    await page.keyboard.press('Enter')
  } else {
    await page.locator('.unknown-clip').click()
  }
  await waitForPhase(page, 'NORMAL')
  if (screenshotPrefix) await page.screenshot({ path: path.join(evidenceDir, `${screenshotPrefix}-normal.png`) })
  for (let index = 0; index < 12; index += 1) {
    if (keyboardOnly) await page.keyboard.press('Space')
    else await page.mouse.click(790, 390)
    await page.waitForTimeout(370)
    if (await page.evaluate(() => window.__CUT_FEVER_TEST__?.getState().phase !== 'NORMAL')) break
  }
  await waitForPhase(page, 'INTRUSION')
  if (screenshotPrefix) await page.screenshot({ path: path.join(evidenceDir, `${screenshotPrefix}-intrusion.png`) })
  await page.waitForFunction(() => window.__CUT_FEVER_TEST__?.getState().systemInserts >= 3)
  await waitForPhase(page, 'FEVER')
  await page.keyboard.press('4')
  if (!keyboardOnly) await page.mouse.wheel(0, 840)
  await page.waitForFunction(() => window.__CUT_FEVER_TEST__?.getState().feverTicks >= 4)
  if (screenshotPrefix) await page.screenshot({ path: path.join(evidenceDir, `${screenshotPrefix}-fever.png`) })
  if (keyboardOnly) {
    await page.keyboard.down('h')
    await page.waitForTimeout(760)
    await page.keyboard.up('h')
  } else {
    await page.mouse.move(760, 400)
    await page.mouse.down()
    await page.waitForTimeout(760)
    await page.mouse.up()
  }
  await waitForPhase(page, 'RECOVERY', 9000)
  if (screenshotPrefix) await page.screenshot({ path: path.join(evidenceDir, `${screenshotPrefix}-recovery.png`) })
}

async function chooseMemory(page, choice, keyboardOnly = false) {
  const label = choice === 'keep' ? '保留这一帧' : '删除这一帧'
  if (keyboardOnly) {
    await page.waitForSelector('.memory-decision')
    if (choice === 'delete') await page.keyboard.press('Tab')
    await page.keyboard.press('Enter')
  } else {
    await page.locator('.memory-decision button').filter({ hasText: label }).click()
  }
  await page.waitForTimeout(130)
}

async function activate(page, locator, keyboardOnly) {
  if (keyboardOnly) {
    await locator.focus()
    await page.keyboard.press('Enter')
  } else {
    await locator.click()
  }
}

async function completeEnding({ name, choices, audio = false, easter = false, keyboardOnly = false }) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true, reducedMotion: 'no-preference' })
  const page = await context.newPage()
  wireDiagnostics(page, name)
  await page.addInitScript(() => {
    window.__longTasks = []
    try {
      new PerformanceObserver((list) => window.__longTasks.push(...list.getEntries().map((entry) => entry.duration))).observe({ entryTypes: ['longtask'] })
    } catch { /* unsupported is an acceptable fallback */ }
  })
  await page.goto(baseURL, { waitUntil: 'networkidle' })
  if (name === 'witness') await page.screenshot({ path: path.join(evidenceDir, '00-empty-timeline.png') })
  if (audio) {
    await page.getByRole('button', { name: '启用程序声音' }).click()
    await page.waitForTimeout(350)
    const audioReady = await page.getByRole('button', { name: /声音已就绪|启用程序声音/ }).textContent()
    report.audioConsentButton = audioReady
  }
  if (name === 'witness') await page.evaluate(() => { window.__longTasks = [] })
  await enterRecovery(page, name === 'witness' ? '01' : undefined, keyboardOnly)
  if (name === 'witness') {
    report.interactionPerformance = await page.evaluate(() => {
      const tasks = window.__longTasks || []
      return { longTasks: tasks, maxLongTask: Math.max(0, ...tasks), totalBlockingTime: Math.round(tasks.reduce((sum, duration) => sum + Math.max(0, duration - 50), 0)) }
    })
  }

  for (let index = 0; index < 5; index += 1) {
    await page.waitForTimeout(370)
    await page.keyboard.press('End')
    if (await page.evaluate(() => window.__CUT_FEVER_TEST__?.getState().shotIndex === 14)) break
  }
  await page.keyboard.press('2')
  await activate(page, page.locator('.guide-one button'), keyboardOnly)
  await chooseMemory(page, choices[0], keyboardOnly)

  await page.locator('.machine-stage').focus()
  for (let index = 0; index < 10; index += 1) {
    await page.waitForTimeout(370)
    await page.keyboard.press('Home')
    if (await page.evaluate(() => window.__CUT_FEVER_TEST__?.getState().shotIndex === 0)) break
  }
  await page.waitForFunction(() => window.__CUT_FEVER_TEST__?.getState().shotIndex === 0)
  await page.keyboard.down('h')
  await page.waitForTimeout(1020)
  await page.keyboard.up('h')
  await page.waitForTimeout(120)
  const secondMemoryState = await page.evaluate(() => window.__CUT_FEVER_TEST__?.getState())
  if (secondMemoryState?.pendingMemory !== 'M02') throw new Error(`M02_NOT_REVEALED ${JSON.stringify(secondMemoryState)}`)
  await page.waitForSelector('.memory-decision')
  await chooseMemory(page, choices[1], keyboardOnly)

  await page.locator('.machine-stage').focus()
  // M03 is a true reverse-crossing interaction. Establish a position beyond
  // the BACK SEAT marker first instead of depending on an auto-tick racing
  // the previous M02 decision.
  await page.waitForTimeout(370)
  await page.keyboard.press('End')
  await page.waitForFunction(() => window.__CUT_FEVER_TEST__?.getState().scrub >= 10 / 17)
  // Freeze the auto-editor while performing the deliberate reverse scrape;
  // otherwise its own visual tick can repeatedly consume the shared safety
  // gate at the same phase as a synthetic key press.
  await page.keyboard.down('h')
  await page.waitForFunction(() => window.__CUT_FEVER_TEST__?.getState().frozen === true)
  try {
    for (let index = 0; index < 6; index += 1) {
      await page.waitForTimeout(370)
      await page.keyboard.press('Shift+ArrowLeft')
      if (await page.evaluate(() => window.__CUT_FEVER_TEST__?.getState().reverseArmed)) break
    }
  } finally {
    await page.keyboard.up('h')
  }
  await page.waitForFunction(() => window.__CUT_FEVER_TEST__?.getState().reverseArmed === true)
  await activate(page, page.locator('.guide-three button'), keyboardOnly)
  await chooseMemory(page, choices[2], keyboardOnly)

  if (easter) {
    await page.locator('.machine-stage').focus()
    for (let index = 0; index < 5; index += 1) {
      await page.waitForTimeout(370)
      await page.keyboard.press('Home')
      if (await page.evaluate(() => window.__CUT_FEVER_TEST__?.getState().shotIndex === 0)) break
    }
    await page.waitForFunction(() => window.__CUT_FEVER_TEST__?.getState().shotIndex === 0)
    await page.mouse.move(1, 390)
    await page.mouse.down()
    await page.waitForTimeout(1320)
    await page.mouse.up()
    await page.waitForFunction(() => window.__CUT_FEVER_TEST__?.getState().easterWitness === true)
  }

  await activate(page, page.locator('.guide-export button'), keyboardOnly)
  await page.waitForSelector('.final-stage')
  const ending = await page.locator('.final-stage').getAttribute('data-ending')
  const finalTimecode = (await page.locator('.poster-kicker').textContent())?.match(/\d{2}:\d{2}:\d{2}:\d{2}/)?.[0]
  await page.screenshot({ path: path.join(evidenceDir, `ending-${name}.png`) })
  if (name === 'witness') await page.evaluate(() => { window.__longTasks = []; window.__posterStartedAt = performance.now() })
  const downloadPromise = page.waitForEvent('download')
  await activate(page, page.getByRole('button', { name: '下载本次静态封面' }), keyboardOnly)
  const download = await downloadPromise
  const posterPath = path.join(evidenceDir, `poster-${name}.png`)
  await download.saveAs(posterPath)
  if (name === 'witness') {
    report.posterExportPerformance = await page.evaluate(() => {
      const tasks = window.__longTasks || []
      return {
        duration: Math.round(performance.now() - (window.__posterStartedAt || performance.now())),
        longTasks: tasks,
        maxLongTask: Math.max(0, ...tasks),
        totalBlockingTime: Math.round(tasks.reduce((sum, duration) => sum + Math.max(0, duration - 50), 0)),
      }
    })
  }
  const posterStat = await fs.stat(posterPath)
  const state = await page.evaluate(() => window.__CUT_FEVER_TEST__?.getState())

  if (name === 'witness') {
    report.peakPerformance = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0]
      const paints = Object.fromEntries(performance.getEntriesByType('paint').map((entry) => [entry.name, Math.round(entry.startTime)]))
      return {
        domInteractive: Math.round(nav?.domInteractive || 0),
        loadEventEnd: Math.round(nav?.loadEventEnd || 0),
        paints,
        resources: performance.getEntriesByType('resource').length,
        transferBytes: performance.getEntriesByType('resource').reduce((sum, entry) => sum + (entry.transferSize || 0), 0),
        longTasks: window.__longTasks || [],
        domNodes: document.querySelectorAll('*').length,
        horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        decodedShots: [...document.images].filter((image) => image.naturalWidth > 0).length,
      }
    })
  }
  report.endings.push({ name, expected: name === 'witness' ? 'WITNESS' : name === 'clean-cut' ? 'CLEAN_CUT' : 'COUNTERCUT', actual: ending, finalTimecode, posterBytes: posterStat.size, choices, easter, keyboardOnly, state, systemInterventionVerified: state.systemInserts >= 3, feverDwellVerified: state.feverTicks >= 4 })
  await context.close()
}

try {
  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
    const page = await context.newPage()
    wireDiagnostics(page, 'cold-start')
    await page.addInitScript(() => {
      window.__longTasks = []
      try {
        new PerformanceObserver((list) => window.__longTasks.push(...list.getEntries().map((entry) => entry.duration))).observe({ entryTypes: ['longtask'] })
      } catch { /* optional metric */ }
    })
    await page.goto(baseURL, { waitUntil: 'networkidle' })
    report.coldStart = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0]
      const paints = Object.fromEntries(performance.getEntriesByType('paint').map((entry) => [entry.name, Math.round(entry.startTime)]))
      return {
        domInteractive: Math.round(nav?.domInteractive || 0),
        loadEventEnd: Math.round(nav?.loadEventEnd || 0),
        paints,
        resources: performance.getEntriesByType('resource').length,
        transferBytes: performance.getEntriesByType('resource').reduce((sum, entry) => sum + (entry.transferSize || 0), 0),
        longTasks: window.__longTasks || [],
        domNodes: document.querySelectorAll('*').length,
      }
    })
    await context.close()
  }

  await completeEnding({ name: 'witness', choices: ['keep', 'keep', 'keep'], audio: true, easter: true })
  await completeEnding({ name: 'clean-cut', choices: ['delete', 'delete', 'delete'], keyboardOnly: true })
  await completeEnding({ name: 'countercut', choices: ['keep', 'delete', 'keep'] })

  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 })
  const page = await context.newPage()
  wireDiagnostics(page, 'mobile')
  await page.goto(baseURL, { waitUntil: 'networkidle' })
  await page.locator('.unknown-clip').tap()
  await page.locator('.mode-rail button').nth(3).tap()
  await page.waitForTimeout(600)
  const beforeGesture = await page.evaluate(() => window.__CUT_FEVER_TEST__?.getState())
  const stageBox = await page.locator('.machine-stage').boundingBox()
  if (stageBox) {
    await page.touchscreen.tap(stageBox.x + stageBox.width * .5, stageBox.y + stageBox.height * .45)
    await page.waitForTimeout(380)
    await page.dispatchEvent('.machine-stage', 'pointerdown', { pointerId: 9, pointerType: 'touch', clientX: 300, clientY: 410, bubbles: true })
    await page.dispatchEvent('.machine-stage', 'pointermove', { pointerId: 9, pointerType: 'touch', clientX: 90, clientY: 410, bubbles: true })
    await page.dispatchEvent('.machine-stage', 'pointerup', { pointerId: 9, pointerType: 'touch', clientX: 90, clientY: 410, bubbles: true })
    await page.waitForTimeout(50)
    const speedBeforeVertical = await page.evaluate(() => window.__CUT_FEVER_TEST__?.getState().speed)
    await page.dispatchEvent('.machine-stage', 'pointerdown', { pointerId: 10, pointerType: 'touch', clientX: 200, clientY: 480, bubbles: true })
    await page.dispatchEvent('.machine-stage', 'pointermove', { pointerId: 10, pointerType: 'touch', clientX: 200, clientY: 390, bubbles: true })
    await page.dispatchEvent('.machine-stage', 'pointerup', { pointerId: 10, pointerType: 'touch', clientX: 200, clientY: 390, bubbles: true })
    await page.waitForTimeout(50)
    const speedAfterVertical = await page.evaluate(() => window.__CUT_FEVER_TEST__?.getState().speed)
    await page.dispatchEvent('.machine-stage', 'pointerdown', { pointerId: 11, pointerType: 'touch', clientX: 205, clientY: 410, bubbles: true })
    await page.waitForTimeout(360)
    const frozenDuringHold = await page.evaluate(() => window.__CUT_FEVER_TEST__?.getState().frozen)
    await page.dispatchEvent('.machine-stage', 'pointerup', { pointerId: 11, pointerType: 'touch', clientX: 205, clientY: 410, bubbles: true })
    await page.waitForTimeout(380)
    const frozenAfterHold = await page.evaluate(() => window.__CUT_FEVER_TEST__?.getState().frozen)
    const beatCutsBeforeDouble = await page.evaluate(() => window.__CUT_FEVER_TEST__?.getState().beatCuts)
    await page.dispatchEvent('.machine-stage', 'pointerdown', { pointerId: 12, pointerType: 'touch', clientX: 205, clientY: 410, bubbles: true })
    await page.dispatchEvent('.machine-stage', 'pointerup', { pointerId: 12, pointerType: 'touch', clientX: 205, clientY: 410, bubbles: true })
    await page.waitForTimeout(150)
    await page.dispatchEvent('.machine-stage', 'pointerdown', { pointerId: 13, pointerType: 'touch', clientX: 205, clientY: 410, bubbles: true })
    await page.dispatchEvent('.machine-stage', 'pointerup', { pointerId: 13, pointerType: 'touch', clientX: 205, clientY: 410, bubbles: true })
    const beatCutsAfterDouble = await page.evaluate(() => window.__CUT_FEVER_TEST__?.getState().beatCuts)
    await page.waitForTimeout(380)
    await page.keyboard.press('End')
    await page.waitForTimeout(50)
    await page.evaluate(() => { const viewport = document.querySelector('.timeline-viewport'); if (viewport) viewport.scrollLeft = 80 })
    const timelineAlignmentPx = await page.evaluate(() => {
      const active = document.querySelector('.timeline-cell.is-active')?.getBoundingClientRect()
      const playhead = document.querySelector('.playhead')?.getBoundingClientRect()
      return active && playhead ? Math.abs((active.left + active.width / 2) - playhead.left) : null
    })
    report.mobileGestureProof = { speedBeforeVertical, speedAfterVertical, frozenDuringHold, frozenAfterHold, beatCutsBeforeDouble, beatCutsAfterDouble, timelineAlignmentPx }
  }
  await page.screenshot({ path: path.join(evidenceDir, 'mobile-390x844.png') })
  report.mobile = await page.evaluate(() => ({
    viewport: [innerWidth, innerHeight],
    horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    mode: window.__CUT_FEVER_TEST__?.getState().mode,
    phase: window.__CUT_FEVER_TEST__?.getState().phase,
    mobileLegendVisible: getComputedStyle(document.querySelector('.mobile-legend')).display,
    desktopLegendVisible: getComputedStyle(document.querySelector('.desktop-legend')).display,
    visiblePanels: [...document.querySelectorAll('.shot-panel')].filter((node) => getComputedStyle(node).display !== 'none').length,
    renderedPanels: document.querySelectorAll('.shot-panel').length,
    decodedImages: [...document.images].filter((image) => image.complete && image.naturalWidth > 0).length,
    visibleTimelineCells: [...document.querySelectorAll('.timeline-cell')].filter((node) => getComputedStyle(node).display !== 'none').length,
    touchAction: getComputedStyle(document.querySelector('.machine-stage')).touchAction,
    afterGesture: window.__CUT_FEVER_TEST__?.getState(),
  }))
  report.mobile.beforeGesture = beforeGesture
  await context.close()

  report.responsive = []
  for (const viewport of [{ width: 320, height: 568 }, { width: 844, height: 390 }, { width: 768, height: 1024 }, { width: 1920, height: 1080 }]) {
    const context = await browser.newContext({ viewport })
    const page = await context.newPage()
    const label = `resize-${viewport.width}x${viewport.height}`
    wireDiagnostics(page, label)
    await page.goto(baseURL, { waitUntil: 'networkidle' })
    await page.locator('.unknown-clip').click()
    await page.locator('.mode-rail button').nth(3).click()
    await page.waitForTimeout(180)
    if (viewport.width <= 844 && viewport.height <= 568) await page.screenshot({ path: path.join(evidenceDir, `${label}.png`) })
    report.responsive.push(await page.evaluate((expected) => {
      const focusables = [...document.querySelectorAll('.mode-rail button, .settings-toggle')]
      const boxes = focusables.map((node) => node.getBoundingClientRect())
      const timeline = document.querySelector('.timeline')?.getBoundingClientRect()
      return {
        expected,
        actual: [innerWidth, innerHeight],
        horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        visiblePanels: [...document.querySelectorAll('.shot-panel')].filter((node) => getComputedStyle(node).display !== 'none').length,
        controlsInside: boxes.every((box) => box.left >= -1 && box.right <= innerWidth + 1 && box.top >= -1 && box.bottom <= innerHeight + 1),
        timelineInside: Boolean(timeline && timeline.top >= 0 && timeline.bottom <= innerHeight + 1),
      }
    }, [viewport.width, viewport.height]))
    await context.close()
  }

  {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } })
    const page = await context.newPage()
    wireDiagnostics(page, 'accessibility-stress')
    await page.goto(baseURL, { waitUntil: 'networkidle' })
    await page.locator('.unknown-clip').click()
    const cutsBeforeRepeat = await page.evaluate(() => window.__CUT_FEVER_TEST__?.getState().userCuts)
    await page.evaluate(() => window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', code: 'Space', repeat: true, bubbles: true })))
    const cutsAfterRepeat = await page.evaluate(() => window.__CUT_FEVER_TEST__?.getState().userCuts)
    await page.getByRole('button', { name: '声音 / 安全' }).click()
    await page.getByRole('checkbox', { name: '减少闪烁' }).check()
    await page.getByRole('checkbox', { name: '减少动态' }).check()
    await page.locator('input[type="range"]').fill('0.25')
    await page.getByRole('button', { name: '启用声音' }).click()
    await page.getByRole('button', { name: '静音' }).click()
    report.accessibility = await page.evaluate(({ cutsBeforeRepeat, cutsAfterRepeat }) => ({
      cutsBeforeRepeat,
      cutsAfterRepeat,
      repeatIgnored: cutsBeforeRepeat === cutsAfterRepeat,
      reducedFlashClass: document.querySelector('.machine-stage')?.classList.contains('reduced-flash'),
      reducedMotionClass: document.querySelector('.machine-stage')?.classList.contains('reduced-motion'),
      stageTabIndex: document.querySelector('.machine-stage')?.getAttribute('tabindex'),
      shortcuts: document.querySelector('.machine-stage')?.getAttribute('aria-keyshortcuts'),
      volume: document.querySelector('input[type="range"]')?.value,
      muteButton: [...document.querySelectorAll('button')].find((node) => node.textContent?.includes('取消静音'))?.textContent,
    }), { cutsBeforeRepeat, cutsAfterRepeat })

    await page.evaluate(async () => {
      const stage = document.querySelector('.machine-stage')
      stage?.focus()
      const anchors = [1100, 180, 960, 320]
      for (let batch = 0; batch < anchors.length; batch += 1) {
        await new Promise((resolve) => setTimeout(resolve, 620))
        for (let event = 0; event < 100; event += 1) {
          stage?.dispatchEvent(new PointerEvent('pointermove', { pointerId: 90, pointerType: 'mouse', clientX: anchors[batch] + (event % 7), clientY: 360, bubbles: true }))
        }
        stage?.dispatchEvent(new WheelEvent('wheel', { deltaY: batch % 2 === 0 ? 520 : -360, bubbles: true }))
        stage?.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', code: 'Space', repeat: false, bubbles: true }))
      }
    })
    await page.waitForTimeout(900)
    report.stress = await page.evaluate(() => {
      const state = window.__CUT_FEVER_TEST__?.getState()
      return {
        state,
        finite: Boolean(state && Number.isFinite(state.speed) && Number.isFinite(state.fever) && Number.isFinite(state.scrub)),
        shotInRange: Boolean(state && state.shotIndex >= 0 && state.shotIndex < 18),
        targetedStageEvents: 408,
        visitedCount: state?.visited.length || 0,
        horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      }
    })
    await context.close()
  }

  {
    const context = await browser.newContext({ viewport: { width: 1024, height: 720 } })
    const page = await context.newPage()
    wireDiagnostics(page, 'audio-fallback')
    await page.addInitScript(() => {
      Object.defineProperty(window, 'AudioContext', { configurable: true, value: undefined })
      Object.defineProperty(window, 'webkitAudioContext', { configurable: true, value: undefined })
    })
    await page.goto(baseURL, { waitUntil: 'networkidle' })
    await page.getByRole('button', { name: '启用程序声音' }).click()
    await page.locator('.unknown-clip').click()
    await page.getByRole('button', { name: '声音 / 安全' }).click()
    report.audioFallback = {
      message: await page.locator('.audio-error').textContent(),
      visualState: await page.evaluate(() => window.__CUT_FEVER_TEST__?.getState()),
    }
    await context.close()
  }
} finally {
  await browser.close()
}

report.finishedAt = new Date().toISOString()
report.passed = report.endings.every((item) => item.expected === item.actual && item.finalTimecode && item.finalTimecode !== '00:00:00:00' && item.posterBytes > 100_000 && item.systemInterventionVerified && item.feverDwellVerified)
  && report.endings.some((item) => item.keyboardOnly === true)
  && report.consoleErrors.length === 0
  && report.pageErrors.length === 0
  && report.failedRequests.length === 0
  && report.httpErrors.length === 0
  && report.mobile.horizontalOverflow === 0
  && report.mobile.visiblePanels <= 3
  && report.mobile.renderedPanels <= 3
  && report.mobile.visibleTimelineCells === 18
  && report.mobile.decodedImages >= 2
  && report.mobileGestureProof.speedAfterVertical !== report.mobileGestureProof.speedBeforeVertical
  && report.mobileGestureProof.frozenDuringHold === true
  && report.mobileGestureProof.frozenAfterHold === false
  && report.mobileGestureProof.beatCutsAfterDouble > report.mobileGestureProof.beatCutsBeforeDouble
  && report.mobileGestureProof.timelineAlignmentPx <= 24
  && report.responsive.every((item) => item.horizontalOverflow === 0 && item.visiblePanels > 0 && item.controlsInside && item.timelineInside)
  && report.accessibility.repeatIgnored === true
  && report.accessibility.reducedFlashClass === true
  && report.accessibility.reducedMotionClass === true
  && report.stress.finite === true
  && report.stress.shotInRange === true
  && report.stress.visitedCount > 1
  && Boolean(report.audioFallback?.message)
await fs.writeFile(path.join(evidenceDir, 'e2e-report.json'), `${JSON.stringify(report, null, 2)}\n`)

if (!report.passed) {
  console.error(JSON.stringify(report, null, 2))
  process.exitCode = 1
} else {
  console.log(JSON.stringify({ passed: true, endings: report.endings.map((item) => item.actual), coldStart: report.coldStart, interactionPerformance: report.interactionPerformance, posterExportPerformance: report.posterExportPerformance, mobile: report.mobile, mobileGestureProof: report.mobileGestureProof, responsive: report.responsive, accessibility: report.accessibility, stress: report.stress, audioFallback: report.audioFallback }, null, 2))
}
