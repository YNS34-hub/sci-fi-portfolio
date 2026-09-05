import type { Choice, Ending, MemoryId } from './types'

export const POSTER_WIDTH = 1350
export const POSTER_HEIGHT = 1800

const MEMORY_IDS: readonly MemoryId[] = ['M01', 'M02', 'M03']
const DISPLAY_FONT = '"CF Display", "Microsoft YaHei UI", sans-serif'
const UTILITY_FONT = '"CF Mono", "CF Text", monospace'

export interface PosterInput {
  ending: Ending
  /** The first three URLs are used. Missing or failed images become authored graphic frames. */
  assets: readonly string[]
  choices: Partial<Record<MemoryId, Choice>>
  timecode: string
  easterWitness: boolean
}

export interface PosterExportOptions extends PosterInput {
  /** Defaults to true. Set false in automated tests or use createPosterBlob(). */
  download?: boolean
  filename?: string
}

type LoadedFrame = HTMLImageElement | null
type PosterContext = CanvasRenderingContext2D

interface FrameStyle {
  angle?: number
  filter?: string
  wash?: string
  stroke?: string
  lineWidth?: number
  label?: string
}

interface EndingCopy {
  index: string
  title: string
  english: string
  statement: readonly [string, string]
}

const ENDING_COPY: Record<Ending, EndingCopy> = {
  WITNESS: {
    index: '01',
    title: '见证',
    english: 'WITNESS',
    statement: ['你保留了缺口。', '记忆终于拥有证人。'],
  },
  CLEAN_CUT: {
    index: '02',
    title: '净切',
    english: 'CLEAN CUT',
    statement: ['你导出了无瑕的空白。', '但空白仍保留剪痕。'],
  },
  COUNTERCUT: {
    index: '03',
    title: '反剪',
    english: 'COUNTERCUT',
    statement: ['你让被删除者重新剪辑。', '这一次，画外也拥有声音。'],
  },
}

/** Render the finished 1350 x 1800 cover without causing a download. */
export async function createPosterBlob(input: PosterInput): Promise<Blob> {
  if ('fonts' in document) {
    await Promise.all([
      document.fonts.load('700 64px "CF Display"'),
      document.fonts.load('700 18px "CF Mono"'),
    ])
  }
  const canvas = createCanvas()
  const context = canvas.getContext('2d')
  if (!context) throw new Error('CUT//FEVER：浏览器无法初始化封面画布。')

  const urls = [input.assets[0] ?? '', input.assets[1] ?? '', input.assets[2] ?? '']
  const frames = await Promise.all(urls.map(loadFrame))

  context.imageSmoothingEnabled = true
  context.imageSmoothingQuality = 'high'

  if (input.ending === 'WITNESS') drawWitness(context, frames, input)
  else if (input.ending === 'CLEAN_CUT') drawCleanCut(context, frames, input)
  else drawCountercut(context, frames, input)

  drawChoiceLedger(context, input)
  if (input.easterWitness) drawFourthWitness(context, input.ending)

  return canvasToBlob(canvas)
}

/** Render, download, and return the same Blob for logging or later reuse. */
export async function downloadPoster(
  input: PosterInput,
  filename = defaultPosterFilename(input),
): Promise<Blob> {
  const blob = await createPosterBlob(input)
  triggerBlobDownload(blob, filename)
  return blob
}

/** Main UI API: downloads by default; pass download:false for non-mutating tests. */
export async function exportPoster(options: PosterExportOptions): Promise<Blob> {
  const blob = await createPosterBlob(options)
  if (options.download !== false) {
    triggerBlobDownload(blob, options.filename ?? defaultPosterFilename(options))
  }
  return blob
}

export function defaultPosterFilename(input: Pick<PosterInput, 'ending' | 'timecode'>): string {
  const timecode = normaliseTimecode(input.timecode).replace(/[^0-9A-Z]+/gi, '-')
  return `CUT-FEVER_${input.ending}_${timecode || 'SESSION'}.png`
}

function createCanvas(): HTMLCanvasElement {
  if (typeof document === 'undefined') {
    throw new Error('CUT//FEVER：封面导出需要浏览器 Canvas 环境。')
  }
  const canvas = document.createElement('canvas')
  canvas.width = POSTER_WIDTH
  canvas.height = POSTER_HEIGHT
  return canvas
}

function loadFrame(url: string): Promise<LoadedFrame> {
  if (!url || typeof Image === 'undefined') return Promise.resolve(null)

  return new Promise((resolve) => {
    const image = new Image()
    let finished = false
    const settle = (value: LoadedFrame) => {
      if (finished) return
      finished = true
      clearTimeout(timeout)
      image.onload = null
      image.onerror = null
      resolve(value)
    }
    const timeout = setTimeout(() => settle(null), 4500)

    image.decoding = 'async'
    image.crossOrigin = 'anonymous'
    image.onload = () => settle(image.naturalWidth > 0 && image.naturalHeight > 0 ? image : null)
    image.onerror = () => settle(null)
    image.src = url
  })
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob)
        else reject(new Error('CUT//FEVER：PNG 编码失败。'))
      }, 'image/png')
    } catch (error) {
      reject(error instanceof Error ? error : new Error('CUT//FEVER：PNG 编码失败。'))
    }
  })
}

function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename.toLowerCase().endsWith('.png') ? filename : `${filename}.png`
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function drawWitness(ctx: PosterContext, frames: readonly LoadedFrame[], input: PosterInput): void {
  const ink = '#100f0c'
  const paper = '#efe4cf'
  const orange = '#f04d26'

  ctx.fillStyle = ink
  ctx.fillRect(0, 0, POSTER_WIDTH, POSTER_HEIGHT)

  ctx.fillStyle = paper
  ctx.fillRect(54, 52, 1242, 9)
  label(ctx, 'CUT//FEVER  /  MEMORY EXPORT', 60, 104, 26, orange, 800)
  label(ctx, `ENDING ${ENDING_COPY.WITNESS.index}  /  ${normaliseTimecode(input.timecode)}`, 1290, 104, 24, paper, 700, 'right')

  drawFrame(ctx, frames[0], 60, 178, 390, 1080, 0, {
    stroke: paper,
    lineWidth: 3,
    filter: 'grayscale(1) sepia(.16) contrast(1.38)',
    wash: 'rgba(16,15,12,.10)',
    label: 'X001 / RETAINED',
  })
  drawFrame(ctx, frames[1], 480, 178, 390, 1080, 1, {
    stroke: orange,
    lineWidth: 3,
    filter: 'grayscale(1) sepia(.18) contrast(1.42)',
    wash: 'rgba(240,77,38,.08)',
    label: 'X002 / AUDIBLE',
  })
  drawFrame(ctx, frames[2], 900, 178, 390, 1080, 2, {
    stroke: paper,
    lineWidth: 3,
    filter: 'grayscale(1) sepia(.16) contrast(1.38)',
    wash: 'rgba(16,15,12,.10)',
    label: 'X003 / NOT GONE',
  })

  label(ctx, ENDING_COPY.WITNESS.title, 60, 1465, 250, paper, 900)
  trackedText(ctx, `${ENDING_COPY.WITNESS.english}  /  DELETED ≠ GONE`, 68, 1528, 33, orange, 900, 7)
  paragraph(ctx, ENDING_COPY.WITNESS.statement, 790, 1375, 47, paper, 1.32)

  ctx.strokeStyle = orange
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(60, 1578)
  ctx.lineTo(1290, 1578)
  ctx.stroke()

  // The witness seam: the export visibly keeps the cut instead of hiding it.
  ctx.strokeStyle = orange
  ctx.lineWidth = 10
  ctx.beginPath()
  ctx.moveTo(870, 164)
  ctx.lineTo(870, 1272)
  ctx.stroke()
  ctx.fillStyle = paper
  for (let y = 230; y < 1230; y += 84) ctx.fillRect(863, y, 15, 5)

  drawCornerMarks(ctx, 38, 35, 1274, 1730, orange)
  label(ctx, 'CF/MEMORY-MANIFEST  /  KEEP THE GAP', 1290, 1762, 21, paper, 700, 'right')
}

function drawCleanCut(ctx: PosterContext, frames: readonly LoadedFrame[], input: PosterInput): void {
  const paper = '#eeeade'
  const ink = '#11100e'
  const red = '#ea4b2b'
  const grey = '#807d75'

  ctx.fillStyle = paper
  ctx.fillRect(0, 0, POSTER_WIDTH, POSTER_HEIGHT)

  label(ctx, 'CUT//FEVER', 62, 102, 31, ink, 900)
  trackedText(ctx, 'PERFECTLY EMPTY EXPORT', 1288, 100, 21, grey, 800, 4, 'right')
  ctx.fillStyle = ink
  ctx.fillRect(60, 137, 1228, 3)

  label(ctx, ENDING_COPY.CLEAN_CUT.english, 58, 316, 128, ink, 900)
  label(ctx, ENDING_COPY.CLEAN_CUT.title, 1010, 302, 183, red, 900)
  label(ctx, `ENDING / ${ENDING_COPY.CLEAN_CUT.index}`, 64, 362, 23, grey, 800)
  label(ctx, normaliseTimecode(input.timecode), 1287, 362, 23, ink, 800, 'right')

  const strips = [
    { y: 460, h: 156, x: 60, w: 1228 },
    { y: 651, h: 122, x: 215, w: 1073 },
    { y: 808, h: 188, x: 60, w: 1050 },
  ]
  strips.forEach((strip, index) => {
    drawFrame(ctx, frames[index], strip.x, strip.y, strip.w, strip.h, index, {
      filter: 'grayscale(1) contrast(1.5) brightness(.86)',
      wash: index === 1 ? 'rgba(234,75,43,.22)' : 'rgba(238,234,222,.05)',
      stroke: ink,
      lineWidth: 2,
      label: `X00${index + 1} / ${choiceWord(input.choices[MEMORY_IDS[index]])}`,
    })
    ctx.strokeStyle = red
    ctx.lineWidth = index === 1 ? 18 : 9
    ctx.beginPath()
    ctx.moveTo(strip.x - 14, strip.y + strip.h * 0.78)
    ctx.lineTo(strip.x + strip.w + 22, strip.y + strip.h * 0.19)
    ctx.stroke()
  })

  ctx.fillStyle = paper
  ctx.fillRect(1110, 788, 178, 228)
  ctx.strokeStyle = ink
  ctx.lineWidth = 3
  ctx.strokeRect(1110, 788, 178, 228)
  label(ctx, '0', 1132, 960, 192, ink, 900)
  trackedText(ctx, 'FRAMES', 1188, 989, 18, red, 900, 3)

  ctx.fillStyle = ink
  ctx.fillRect(60, 1084, 1228, 22)
  label(ctx, 'NOTHING TO RECOVER', 61, 1195, 79, ink, 900)
  ctx.fillStyle = red
  ctx.fillRect(60, 1227, 683, 20)
  ctx.fillStyle = paper
  ctx.fillRect(358, 1218, 248, 37)
  trackedText(ctx, 'OR SO IT SAYS', 372, 1247, 24, red, 900, 4)

  paragraph(ctx, ENDING_COPY.CLEAN_CUT.statement, 62, 1383, 49, ink, 1.4)
  label(ctx, '删除不是消失。', 1288, 1468, 31, red, 900, 'right')

  ctx.strokeStyle = ink
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(60, 1576)
  ctx.lineTo(1288, 1576)
  ctx.stroke()
  drawCornerMarks(ctx, 38, 35, 1274, 1730, ink)
  label(ctx, 'CF / SANITISED MASTER / TRACE REMAINS', 1288, 1762, 21, grey, 700, 'right')
}

function drawCountercut(ctx: PosterContext, frames: readonly LoadedFrame[], input: PosterInput): void {
  const orange = '#f05a2c'
  const cream = '#f2ead8'
  const ink = '#11100d'

  ctx.fillStyle = orange
  ctx.fillRect(0, 0, POSTER_WIDTH, POSTER_HEIGHT)
  drawGrid(ctx, 'rgba(17,16,13,.16)', 72)

  ctx.save()
  ctx.translate(675, 875)
  ctx.rotate(-0.095)
  ctx.fillStyle = ink
  ctx.fillRect(-910, -185, 1820, 376)
  ctx.restore()

  for (let row = 0; row < 5; row += 1) {
    trackedText(ctx, 'CUT BACK / CUT BACK /', -26 + row * 14, 205 + row * 76, 54, ink, 900, 1)
  }

  drawFrame(ctx, frames[0], 55, 318, 660, 622, 0, {
    angle: -0.055,
    filter: 'grayscale(1) contrast(1.75) brightness(.8)',
    wash: 'rgba(240,90,44,.26)',
    stroke: cream,
    lineWidth: 13,
    label: 'X001 / TAKES THE FRAME',
  })
  drawFrame(ctx, frames[1], 762, 244, 512, 684, 1, {
    angle: 0.075,
    filter: 'grayscale(1) contrast(1.8) brightness(.85)',
    wash: 'rgba(240,90,44,.18)',
    stroke: ink,
    lineWidth: 18,
    label: 'X002 / TAKES THE VOICE',
  })
  drawFrame(ctx, frames[2], 185, 1006, 1010, 486, 2, {
    angle: -0.035,
    filter: 'grayscale(1) contrast(1.85) brightness(.83)',
    wash: 'rgba(240,90,44,.22)',
    stroke: cream,
    lineWidth: 14,
    label: 'X003 / CUTS BACK',
  })

  ctx.save()
  ctx.translate(51, 1020)
  ctx.rotate(-0.065)
  label(ctx, ENDING_COPY.COUNTERCUT.title, 0, 0, 280, cream, 900)
  ctx.restore()

  ctx.save()
  ctx.translate(1010, 978)
  ctx.rotate(Math.PI / 2)
  trackedText(ctx, ENDING_COPY.COUNTERCUT.english, 0, 0, 43, orange, 900, 7)
  ctx.restore()

  ctx.fillStyle = ink
  ctx.fillRect(0, 1518, POSTER_WIDTH, 282)
  paragraph(ctx, ENDING_COPY.COUNTERCUT.statement, 60, 1620, 47, cream, 1.35)
  label(ctx, `ENDING ${ENDING_COPY.COUNTERCUT.index}`, 1290, 1584, 27, orange, 900, 'right')
  label(ctx, normaliseTimecode(input.timecode), 1290, 1641, 57, cream, 900, 'right')

  ctx.strokeStyle = cream
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.moveTo(930, 1670)
  ctx.lineTo(1290, 1670)
  ctx.stroke()
  trackedText(ctx, 'THE OUTTAKE EDITS BACK', 1290, 1719, 20, orange, 800, 3, 'right')
  drawCornerMarks(ctx, 38, 35, 1274, 1730, cream)
}

function drawChoiceLedger(ctx: PosterContext, input: PosterInput): void {
  const isClean = input.ending === 'CLEAN_CUT'
  const isCounter = input.ending === 'COUNTERCUT'
  const x = isClean ? 62 : isCounter ? 60 : 62
  const y = isClean ? 1635 : isCounter ? 1684 : 1641
  const ink = isClean ? '#11100e' : isCounter ? '#f2ead8' : '#efe4cf'
  const accent = isClean ? '#ea4b2b' : isCounter ? '#f05a2c' : '#f04d26'

  label(ctx, 'MEMORY DECISIONS', x, y, 18, accent, 900)
  MEMORY_IDS.forEach((id, index) => {
    const choice = input.choices[id]
    const itemX = x + index * 220
    ctx.fillStyle = choice === 'delete' ? accent : ink
    ctx.fillRect(itemX, y + 20, 18, 18)
    label(ctx, `${id} ${choiceWord(choice)}`, itemX + 30, y + 37, 19, ink, 800)
  })

  const kept = MEMORY_IDS.filter((id) => input.choices[id] === 'keep').length
  const deleted = MEMORY_IDS.filter((id) => input.choices[id] === 'delete').length
  // Countercut already owns the far-right baseline with its closing slogan.
  // Keep the decision tally beside the ledger so the two narrative labels
  // remain readable instead of painting over one another.
  const tallyX = isCounter ? 930 : 1290
  label(ctx, `KEEP ${kept}  /  DELETE ${deleted}`, tallyX, y + 37, 19, ink, 800, 'right')
}

function drawFourthWitness(ctx: PosterContext, ending: Ending): void {
  const palette = ending === 'WITNESS'
    ? { fill: '#f04d26', ink: '#efe4cf' }
    : ending === 'CLEAN_CUT'
      ? { fill: '#ea4b2b', ink: '#eeeade' }
      : { fill: '#f2ead8', ink: '#11100d' }
  const x = ending === 'CLEAN_CUT' ? 902 : 905
  const y = ending === 'COUNTERCUT' ? 80 : ending === 'WITNESS' ? 1125 : 1280

  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(ending === 'COUNTERCUT' ? 0.04 : -0.035)
  ctx.fillStyle = palette.fill
  ctx.fillRect(0, 0, 360, 105)
  ctx.strokeStyle = palette.ink
  ctx.lineWidth = 3
  ctx.strokeRect(10, 10, 340, 85)

  // A constructed eye avoids relying on a font glyph and makes the secret mark export-safe.
  ctx.beginPath()
  ctx.moveTo(27, 53)
  ctx.quadraticCurveTo(58, 21, 90, 53)
  ctx.quadraticCurveTo(58, 84, 27, 53)
  ctx.stroke()
  ctx.fillStyle = palette.ink
  ctx.beginPath()
  ctx.arc(58, 53, 9, 0, Math.PI * 2)
  ctx.fill()

  label(ctx, 'X004 / 第四个证人：你', 108, 48, 21, palette.ink, 900)
  trackedText(ctx, 'YOU WERE IN THE FRAME', 108, 76, 13, palette.ink, 800, 1.6)
  ctx.restore()
}

function drawFrame(
  ctx: PosterContext,
  image: LoadedFrame,
  x: number,
  y: number,
  width: number,
  height: number,
  frameIndex: number,
  style: FrameStyle = {},
): void {
  ctx.save()
  ctx.translate(x + width / 2, y + height / 2)
  ctx.rotate(style.angle ?? 0)
  ctx.beginPath()
  ctx.rect(-width / 2, -height / 2, width, height)
  ctx.clip()

  if (image) {
    ctx.filter = style.filter ?? 'none'
    drawImageCover(ctx, image, -width / 2, -height / 2, width, height)
    ctx.filter = 'none'
  } else {
    drawFallbackFrame(ctx, -width / 2, -height / 2, width, height, frameIndex)
  }

  if (style.wash) {
    ctx.fillStyle = style.wash
    ctx.fillRect(-width / 2, -height / 2, width, height)
  }

  if (style.label) {
    const stripHeight = Math.max(32, Math.min(54, height * 0.1))
    ctx.fillStyle = 'rgba(8,9,8,.82)'
    ctx.fillRect(-width / 2, height / 2 - stripHeight, width, stripHeight)
    label(ctx, style.label, -width / 2 + 16, height / 2 - 13, Math.max(15, stripHeight * 0.4), '#f3eee0', 900)
  }
  ctx.restore()

  if (style.stroke && (style.lineWidth ?? 0) > 0) {
    ctx.save()
    ctx.translate(x + width / 2, y + height / 2)
    ctx.rotate(style.angle ?? 0)
    ctx.strokeStyle = style.stroke
    ctx.lineWidth = style.lineWidth ?? 2
    ctx.strokeRect(-width / 2, -height / 2, width, height)
    ctx.restore()
  }
}

function drawImageCover(
  ctx: PosterContext,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
): void {
  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight)
  const sourceWidth = width / scale
  const sourceHeight = height / scale
  const sourceX = (image.naturalWidth - sourceWidth) / 2
  const sourceY = (image.naturalHeight - sourceHeight) / 2
  ctx.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height)
}

function drawFallbackFrame(
  ctx: PosterContext,
  x: number,
  y: number,
  width: number,
  height: number,
  index: number,
): void {
  const palettes = [
    ['#123644', '#82d0cd', '#e9f0e7'],
    ['#251820', '#d8494b', '#e8c7a2'],
    ['#171612', '#f05a2c', '#eee8d7'],
  ] as const
  const [background, accent, pale] = palettes[index % palettes.length]
  ctx.fillStyle = background
  ctx.fillRect(x, y, width, height)

  ctx.strokeStyle = pale
  ctx.globalAlpha = 0.25
  ctx.lineWidth = Math.max(1, width / 360)
  for (let offset = -height; offset < width + height; offset += Math.max(26, width / 16)) {
    ctx.beginPath()
    ctx.moveTo(x + offset, y)
    ctx.lineTo(x + offset - height * 0.32, y + height)
    ctx.stroke()
  }
  ctx.globalAlpha = 1

  if (index === 0) {
    // Two ticket-shaped absences, one slightly outside the registered frame.
    ctx.fillStyle = accent
    ctx.fillRect(x + width * 0.17, y + height * 0.35, width * 0.43, height * 0.2)
    ctx.strokeStyle = pale
    ctx.setLineDash([14, 12])
    ctx.strokeRect(x + width * 0.25, y + height * 0.46, width * 0.43, height * 0.2)
    ctx.setLineDash([])
  } else if (index === 1) {
    // Interrupted waveform: the silence is an authored shape, not a generic error card.
    ctx.strokeStyle = accent
    ctx.lineWidth = Math.max(5, height / 38)
    ctx.beginPath()
    for (let step = 0; step <= 12; step += 1) {
      const px = x + width * (0.08 + step * 0.07)
      const py = y + height * (0.5 + Math.sin(step * 2.2) * 0.17)
      if (step === 0) ctx.moveTo(px, py)
      else if (step !== 7 && step !== 8) ctx.lineTo(px, py)
      else ctx.moveTo(px, py)
    }
    ctx.stroke()
    ctx.fillStyle = pale
    ctx.fillRect(x + width * 0.58, y + height * 0.31, width * 0.025, height * 0.38)
  } else {
    // Rear-view ellipse and two diverging roads recall the third memory without copying a shot.
    ctx.strokeStyle = accent
    ctx.lineWidth = Math.max(6, width / 70)
    ctx.beginPath()
    ctx.ellipse(x + width * 0.5, y + height * 0.38, width * 0.23, height * 0.18, -0.15, 0, Math.PI * 2)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(x + width * 0.44, y + height * 0.56)
    ctx.lineTo(x + width * 0.25, y + height)
    ctx.moveTo(x + width * 0.56, y + height * 0.56)
    ctx.lineTo(x + width * 0.82, y + height)
    ctx.stroke()
  }

  label(ctx, `LOCAL FRAME / X00${index + 1}`, x + 18, y + 30, Math.max(13, width / 34), pale, 800)
  trackedText(ctx, 'SIGNAL RECONSTRUCTED', x + 18, y + height - 19, Math.max(11, width / 52), pale, 700, 1.4)
}

function drawGrid(ctx: PosterContext, colour: string, gap: number): void {
  ctx.save()
  ctx.strokeStyle = colour
  ctx.lineWidth = 1
  for (let x = gap; x < POSTER_WIDTH; x += gap) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, POSTER_HEIGHT)
    ctx.stroke()
  }
  for (let y = gap; y < POSTER_HEIGHT; y += gap) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(POSTER_WIDTH, y)
    ctx.stroke()
  }
  ctx.restore()
}

function drawCornerMarks(
  ctx: PosterContext,
  x: number,
  y: number,
  width: number,
  height: number,
  colour: string,
): void {
  const size = 34
  ctx.save()
  ctx.strokeStyle = colour
  ctx.lineWidth = 3
  const corners: readonly [number, number, number, number][] = [
    [x, y, 1, 1],
    [x + width, y, -1, 1],
    [x, y + height, 1, -1],
    [x + width, y + height, -1, -1],
  ]
  corners.forEach(([cx, cy, sx, sy]) => {
    ctx.beginPath()
    ctx.moveTo(cx + sx * size, cy)
    ctx.lineTo(cx, cy)
    ctx.lineTo(cx, cy + sy * size)
    ctx.stroke()
  })
  ctx.restore()
}

function paragraph(
  ctx: PosterContext,
  lines: readonly string[],
  x: number,
  y: number,
  size: number,
  colour: string,
  lineHeight: number,
): void {
  ctx.save()
  ctx.font = `800 ${size}px ${DISPLAY_FONT}`
  ctx.fillStyle = colour
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  lines.forEach((line, index) => ctx.fillText(line, x, y + index * size * lineHeight))
  ctx.restore()
}

function label(
  ctx: PosterContext,
  text: string,
  x: number,
  y: number,
  size: number,
  colour: string,
  weight = 700,
  align: CanvasTextAlign = 'left',
): void {
  ctx.save()
  ctx.font = `${weight} ${size}px ${DISPLAY_FONT}`
  ctx.fillStyle = colour
  ctx.textAlign = align
  ctx.textBaseline = 'alphabetic'
  ctx.fillText(text, x, y)
  ctx.restore()
}

function trackedText(
  ctx: PosterContext,
  text: string,
  x: number,
  y: number,
  size: number,
  colour: string,
  weight: number,
  tracking: number,
  align: CanvasTextAlign = 'left',
): void {
  ctx.save()
  ctx.font = `${weight} ${size}px ${UTILITY_FONT}`
  ctx.fillStyle = colour
  ctx.textBaseline = 'alphabetic'
  const glyphs = Array.from(text)
  const totalWidth = glyphs.reduce((sum, glyph) => sum + ctx.measureText(glyph).width, 0)
    + Math.max(0, glyphs.length - 1) * tracking
  let cursor = align === 'right' ? x - totalWidth : align === 'center' ? x - totalWidth / 2 : x
  glyphs.forEach((glyph) => {
    ctx.fillText(glyph, cursor, y)
    cursor += ctx.measureText(glyph).width + tracking
  })
  ctx.restore()
}

function choiceWord(choice: Choice | undefined): string {
  if (choice === 'keep') return 'KEEP / 保留'
  if (choice === 'delete') return 'DELETE / 删除'
  return 'UNDECIDED / 未决'
}

function normaliseTimecode(timecode: string): string {
  const compact = timecode.trim().replace(/\s+/g, ' ')
  return (compact || '00:00:00:00').slice(0, 24)
}
