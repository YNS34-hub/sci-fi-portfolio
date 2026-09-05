import type { DiveMetrics, DiveRecord, ResponseMode } from '../types'

function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, value))
}

function hashMetrics(metrics: DiveMetrics): number {
  let value = 2166136261
  const pieces = [
    Math.round(metrics.pointerDistance * 10000),
    metrics.clickCount,
    Math.round(metrics.wheelDistance),
    metrics.keyActions,
    Math.round(metrics.holdMs),
    Math.round(metrics.stillMs),
    Math.round(metrics.coreMoves * 1000),
    Math.round(metrics.endedAt - metrics.startedAt),
  ]
  pieces.forEach((piece) => {
    value ^= piece
    value = Math.imul(value, 16777619)
  })
  return value >>> 0
}

export function createDiveRecord(metrics: DiveMetrics): DiveRecord {
  const durationMs = Math.max(1000, metrics.endedAt - metrics.startedAt)
  const durationSeconds = Math.round(durationMs / 1000)
  const holdSeconds = Math.round(metrics.holdMs / 100) / 10
  const stillSeconds = Math.round(metrics.stillMs / 100) / 10
  const stillnessRatio = clamp(metrics.stillMs / durationMs)
  const movementRatio = clamp(metrics.pointerDistance / Math.max(0.7, durationSeconds * 0.055))

  let responseMode: ResponseMode
  let responseLine: string
  if (stillnessRatio > 0.42 && metrics.holdMs > 1800) {
    responseMode = '停留'
    responseLine = '你让水先停下，碎片才找到彼此。'
  } else if (metrics.clickCount >= 7) {
    responseMode = '触碰'
    responseLine = '你一次次确认，它才从回声里显形。'
  } else if (movementRatio > 0.68) {
    responseMode = '游移'
    responseLine = '你沿着水流寻找，直到沉默有了边缘。'
  } else {
    responseMode = '往返'
    responseLine = '你在靠近与退开之间，给它留下出口。'
  }

  return {
    durationSeconds,
    holdSeconds,
    stillSeconds,
    responseMode,
    responseLine,
    behaviorExplanation: `你在深处停住了 ${stillSeconds.toFixed(1)} 秒，按住 ${holdSeconds.toFixed(1)} 秒，${metrics.clickCount} 次短触碰留下水痕。`,
    seed: hashMetrics(metrics),
    stillnessRatio,
    movementRatio,
    clicks: metrics.clickCount,
    completedAt: new Intl.DateTimeFormat('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(new Date()),
  }
}

function seededRandom(seed: number): () => number {
  let state = seed || 1
  return () => {
    state = Math.imul(state ^ (state >>> 15), 1 | state)
    state ^= state + Math.imul(state ^ (state >>> 7), 61 | state)
    return ((state ^ (state >>> 14)) >>> 0) / 4294967296
  }
}

function drawSpacedText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  spacing: number,
): void {
  let cursor = x
  for (const character of text) {
    context.fillText(character, cursor, y)
    cursor += context.measureText(character).width + spacing
  }
}

export function drawRecordCard(canvas: HTMLCanvasElement, record: DiveRecord): void {
  const width = 900
  const height = 1200
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) return

  const random = seededRandom(record.seed)
  const background = context.createLinearGradient(0, 0, 0, height)
  background.addColorStop(0, '#06162a')
  background.addColorStop(0.46, '#020a15')
  background.addColorStop(1, '#01050b')
  context.fillStyle = background
  context.fillRect(0, 0, width, height)

  const waterGlow = context.createRadialGradient(460, 90, 0, 460, 90, 520)
  waterGlow.addColorStop(0, 'rgba(124, 203, 235, 0.24)')
  waterGlow.addColorStop(0.38, 'rgba(20, 88, 142, 0.12)')
  waterGlow.addColorStop(1, 'rgba(0, 0, 0, 0)')
  context.fillStyle = waterGlow
  context.fillRect(0, 0, width, 630)

  context.save()
  context.globalCompositeOperation = 'screen'
  for (let line = 0; line < 16; line += 1) {
    const y = 86 + line * (11 + random() * 9)
    context.beginPath()
    context.moveTo(100 + random() * 160, y)
    for (let x = 160; x < 820; x += 24) {
      const wave = Math.sin(x * 0.032 + line * 0.8) * (2 + random() * 6)
      context.lineTo(x, y + wave)
    }
    context.strokeStyle = `rgba(111, 196, 232, ${0.015 + random() * 0.05})`
    context.lineWidth = 1 + random() * 2
    context.stroke()
  }
  context.restore()

  const coreX = 450 + (record.movementRatio - 0.5) * 116
  const coreY = 550
  context.save()
  context.translate(coreX, coreY)
  context.globalCompositeOperation = 'screen'
  const shardTotal = 13 + Math.round(record.movementRatio * 11)
  for (let shard = 0; shard < shardTotal; shard += 1) {
    const angle = random() * Math.PI * 2
    const radius = 38 + random() * 176
    const x = Math.cos(angle) * radius * 0.62
    const y = Math.sin(angle) * radius
    const size = 18 + random() * 54
    context.beginPath()
    context.moveTo(x, y - size)
    context.lineTo(x + size * (0.25 + random() * 0.8), y + size * 0.72)
    context.lineTo(x - size * (0.22 + random() * 0.55), y + size * 0.36)
    context.closePath()
    context.fillStyle = `rgba(${42 + Math.floor(random() * 35)}, ${105 + Math.floor(random() * 70)}, ${150 + Math.floor(random() * 70)}, ${0.08 + random() * 0.16})`
    context.fill()
    context.strokeStyle = `rgba(168, 223, 241, ${0.06 + random() * 0.14})`
    context.lineWidth = 1
    context.stroke()
  }
  context.restore()

  context.save()
  context.globalCompositeOperation = 'screen'
  const ringTotal = Math.min(10, record.clicks)
  for (let ring = 0; ring < ringTotal; ring += 1) {
    const x = 142 + random() * 610
    const y = 290 + random() * 420
    const radius = 10 + random() * 34
    context.beginPath()
    context.ellipse(x, y, radius * 1.7, radius * 0.42, random() * 0.2, 0, Math.PI * 2)
    context.strokeStyle = `rgba(136, 211, 235, ${0.05 + random() * 0.08})`
    context.lineWidth = 1
    context.stroke()
  }
  context.restore()

  context.strokeStyle = 'rgba(185, 225, 239, 0.22)'
  context.lineWidth = 1
  context.beginPath()
  context.moveTo(74, 86)
  context.lineTo(74, 1112)
  context.moveTo(826, 86)
  context.lineTo(826, 1112)
  context.stroke()

  context.fillStyle = '#d3e5eb'
  context.font = '600 30px "Segoe UI", "Microsoft YaHei", sans-serif'
  drawSpacedText(context, 'BLUE//DIVE', 108, 132, 7)
  context.fillStyle = 'rgba(198, 220, 229, 0.58)'
  context.font = '400 18px "Microsoft YaHei", sans-serif'
  context.fillText('本次潜航记录', 111, 174)

  context.save()
  context.translate(792, 192)
  context.rotate(Math.PI / 2)
  context.fillStyle = 'rgba(195, 220, 230, 0.48)'
  context.font = '400 18px "Microsoft YaHei", sans-serif'
  drawSpacedText(context, '坠入蓝色世界', 0, 0, 9)
  context.restore()

  context.fillStyle = '#dcecf1'
  context.font = '500 54px "Microsoft YaHei", sans-serif'
  context.fillText(record.responseMode, 112, 792)
  context.fillStyle = 'rgba(220, 236, 242, 0.74)'
  context.font = '400 24px "Microsoft YaHei", sans-serif'
  context.fillText(record.responseLine, 112, 846)

  context.fillStyle = 'rgba(184, 213, 224, 0.5)'
  context.font = '400 17px "Segoe UI", "Microsoft YaHei", sans-serif'
  context.fillText(`全程 ${record.durationSeconds} 秒`, 112, 946)
  context.fillText(`静止 ${record.stillSeconds.toFixed(1)} 秒`, 300, 946)
  context.fillText(`按住 ${record.holdSeconds.toFixed(1)} 秒`, 502, 946)

  context.fillStyle = 'rgba(164, 198, 211, 0.38)'
  context.font = '400 14px "Segoe UI", sans-serif'
  context.fillText(`触碰 ${record.clicks} 次  ·  ${record.seed.toString(16).toUpperCase().padStart(8, '0')}`, 112, 987)

  context.fillStyle = 'rgba(207, 230, 237, 0.72)'
  context.font = '400 21px "Microsoft YaHei", sans-serif'
  context.fillText('无法表达的情绪没有离开。', 112, 1045)
  context.fillText('它只是在更深的地方，等一次不急着解释的注视。', 112, 1081)

  context.fillStyle = 'rgba(161, 196, 211, 0.42)'
  context.font = '400 15px "Segoe UI", "Microsoft YaHei", sans-serif'
  context.fillText(record.completedAt, 112, 1140)
}

export function downloadRecordCard(canvas: HTMLCanvasElement, record: DiveRecord): void {
  canvas.toBlob((blob) => {
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `BLUE-DIVE-${record.seed.toString(16).toUpperCase()}.png`
    link.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }, 'image/png')
}
