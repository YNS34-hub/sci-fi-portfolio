import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from 'react'
import { Soundscape } from './audio/Soundscape'
import { STAGE_COPY } from './content'
import type { DiveMetrics, DiveRecord, EngineState, StageId } from './types'
import { createDiveRecord, downloadRecordCard, drawRecordCard } from './utils/recordCard'

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value))

const WebGLWorld = lazy(() =>
  import('./components/WebGLWorld').then((module) => ({ default: module.WebGLWorld })),
)

function stageFromDepth(depth: number): StageId {
  if (depth < 0.28) return 'surface'
  if (depth < 0.5) return 'echo'
  if (depth < 0.72) return 'unsaid'
  return 'core'
}

function createInitialEngine(reducedMotion: boolean): EngineState {
  return {
    entered: false,
    depth: 0,
    stage: 'entry',
    pointer: { x: 0.5, y: 0.48, vx: 0, vy: 0, down: false },
    energy: 0,
    coherence: 0,
    coreWake: 0,
    coreCalm: 0,
    ascent: 0,
    reducedMotion,
    ripple: { x: 0.5, y: 0.42, startedAt: -1, strength: 0 },
  }
}

function createInitialMetrics(): DiveMetrics {
  const now = performance.now()
  return {
    startedAt: now,
    endedAt: now,
    pointerDistance: 0,
    clickCount: 0,
    wheelDistance: 0,
    keyActions: 0,
    holdMs: 0,
    stillMs: 0,
    coreMoves: 0,
    horizontalBias: 0,
  }
}

function detectWebGL(): boolean {
  if (new URLSearchParams(window.location.search).get('fallback') === '1') return false
  try {
    const canvas = document.createElement('canvas')
    const context =
      canvas.getContext('webgl2', { failIfMajorPerformanceCaveat: true }) ??
      canvas.getContext('webgl', { failIfMajorPerformanceCaveat: true })
    const supported = Boolean(context)
    context?.getExtension('WEBGL_lose_context')?.loseContext()
    return supported
  } catch {
    return false
  }
}

function RecordView({ record, onRestart }: { record: DiveRecord; onRestart: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current) drawRecordCard(canvasRef.current, record)
  }, [record])

  return (
    <section className="record-view" aria-labelledby="record-heading">
      <div className="record-copy">
        <p className="record-kicker">潜航记录</p>
        <h1 id="record-heading">
          <span>水面恢复了</span>
          <span>安静。</span>
        </h1>
        <p>{record.responseLine}</p>
        <p className="record-explanation">
          {record.behaviorExplanation}<br />
          你没有消除那份情绪，只给了它一次被看见的机会。
        </p>
        <div className="record-actions">
          <button
            type="button"
            onClick={() => canvasRef.current && downloadRecordCard(canvasRef.current, record)}
          >
            保存记录
          </button>
          <button type="button" onClick={onRestart}>
            再潜一次
          </button>
        </div>
      </div>
      <div className="record-canvas-wrap">
        <canvas
          ref={canvasRef}
          className="record-canvas"
          aria-label={`BLUE//DIVE 潜航记录。回应方式：${record.responseMode}。停留 ${record.durationSeconds} 秒。`}
        />
      </div>
    </section>
  )
}

function StageTypography({ stage }: { stage: StageId }) {
  if (stage === 'record') return null
  const copy = STAGE_COPY[stage]
  return (
    <div className={`stage-typography stage-typography-${stage}`} key={stage}>
      <span className="stage-label">{copy.label}</span>
      <p className="stage-primary" data-text={copy.primary}>{copy.primary}</p>
      <p className="stage-secondary" data-text={copy.secondary}>{copy.secondary}</p>
      {copy.cue && stage !== 'entry' ? <p className="stage-cue">{copy.cue}</p> : null}
    </div>
  )
}

export default function App() {
  const systemReduced = useMemo(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  )
  const [reducedMotion, setReducedMotion] = useState(systemReduced)
  const [stage, setStage] = useState<StageId>('entry')
  const [entered, setEntered] = useState(false)
  const [muted, setMuted] = useState(false)
  const [audioAvailable, setAudioAvailable] = useState(true)
  const [instructionsVisible, setInstructionsVisible] = useState(false)
  const [webglMode, setWebglMode] = useState<'loading' | 'ready' | 'fallback'>(() =>
    detectWebGL() ? 'loading' : 'fallback',
  )
  const [assetLoaded, setAssetLoaded] = useState<boolean | null>(null)
  const [record, setRecord] = useState<DiveRecord | null>(null)

  const rootRef = useRef<HTMLDivElement>(null)
  const recordRef = useRef<DiveRecord | null>(null)
  const stageRef = useRef<StageId>('entry')
  const enteredRef = useRef(false)
  const completedRef = useRef(false)
  const recordShownRef = useRef(false)
  const targetDepthRef = useRef(0)
  const engineRef = useRef<EngineState>(createInitialEngine(systemReduced))
  const metricsRef = useRef<DiveMetrics>(createInitialMetrics())
  const pressedKeysRef = useRef(new Set<string>())
  const lastPointerRef = useRef({ x: 0.5, y: 0.48, clientY: 0, time: performance.now() })
  const soundRef = useRef<Soundscape | null>(null)
  const instructionTimerRef = useRef<number | null>(null)
  const activeGestureRef = useRef<{ pointerId: number; x: number; y: number; startedAt: number } | null>(null)

  useEffect(() => {
    engineRef.current.reducedMotion = reducedMotion
    rootRef.current?.setAttribute('data-motion-mode', reducedMotion ? 'reduced' : 'full')
  }, [reducedMotion])

  useEffect(() => {
    soundRef.current?.setMuted(muted)
  }, [muted])

  useEffect(() => {
    const releaseInput = () => {
      pressedKeysRef.current.clear()
      engineRef.current.pointer.down = false
      activeGestureRef.current = null
      lastPointerRef.current.clientY = 0
    }
    window.addEventListener('blur', releaseInput)
    return () => {
      window.removeEventListener('blur', releaseInput)
      if (instructionTimerRef.current !== null) window.clearTimeout(instructionTimerRef.current)
      soundRef.current?.stop()
      soundRef.current = null
    }
  }, [])

  const changeStage = useCallback((nextStage: StageId) => {
    if (stageRef.current === nextStage) return
    stageRef.current = nextStage
    engineRef.current.stage = nextStage
    if (nextStage === 'echo') soundRef.current?.breathGap(360)
    if (nextStage === 'unsaid') soundRef.current?.breathGap(760)
    if (nextStage === 'core') soundRef.current?.breathGap(520)
    if (nextStage === 'ascent') soundRef.current?.breathGap(920)
    setStage(nextStage)
  }, [])

  useEffect(() => {
    let frame = 0
    let previous = performance.now()
    let lastSoundUpdate = 0

    const tick = (now: number) => {
      const delta = Math.min(0.05, Math.max(0.001, (now - previous) / 1000))
      previous = now
      const engine = engineRef.current

      if (engine.entered && stageRef.current !== 'record') {
        const keys = pressedKeysRef.current
        let keyAxis = 0
        if (keys.has('arrowdown') || keys.has('s')) keyAxis += 1
        if (keys.has('arrowup') || keys.has('w')) keyAxis -= 1
        if (!completedRef.current && keyAxis !== 0) {
          targetDepthRef.current = clamp(targetDepthRef.current + keyAxis * delta * 0.18, 0.035, 0.82)
          engine.energy = clamp(engine.energy + delta * 0.28)
        }

        engine.energy = Math.max(0, engine.energy - delta * (engine.reducedMotion ? 1.25 : 0.7))
        engine.pointer.vx *= Math.pow(0.06, delta)
        engine.pointer.vy *= Math.pow(0.06, delta)

        if (!completedRef.current) {
          engine.depth += (targetDepthRef.current - engine.depth) * Math.min(1, delta * 3.1)
          const nextStage = stageFromDepth(engine.depth)
          changeStage(nextStage)

          if (nextStage === 'core') {
            if (engine.energy > 0.018) {
              engine.coreWake = clamp(engine.coreWake + delta * (0.38 + engine.energy * 2.6))
              metricsRef.current.coreMoves += delta * clamp(engine.energy / 0.22)
            } else if (engine.coreWake > 0.18) {
              engine.coreCalm = clamp(engine.coreCalm + delta * (0.18 + engine.coreWake * 0.28))
            }

            if (engine.energy < 0.012) metricsRef.current.stillMs += delta * 1000
            if (engine.pointer.down && engine.coreWake > 0.16) {
              metricsRef.current.holdMs += delta * 1000
              const holdRate = 0.27 + engine.coreWake * 0.23 + engine.coreCalm * 0.34
              engine.coherence = clamp(engine.coherence + delta * holdRate)
            }

            if (engine.coherence >= 0.999) {
              completedRef.current = true
              engine.coherence = 1
              engine.pointer.down = false
              targetDepthRef.current = 1
              metricsRef.current.endedAt = now
              recordRef.current = createDiveRecord(metricsRef.current)
              changeStage('ascent')
            }
          }
        } else {
          engine.ascent = clamp(engine.ascent + delta / (engine.reducedMotion ? 2.4 : 5.4))
          engine.depth = 0.82 + engine.ascent * 0.18
          if (engine.ascent >= 0.995 && !recordShownRef.current) {
            recordShownRef.current = true
            changeStage('record')
            setRecord(recordRef.current)
          }
        }

        if (now - lastSoundUpdate > 85) {
          lastSoundUpdate = now
          soundRef.current?.update(engine.depth, engine.energy, engine.coherence)
        }

        const root = rootRef.current
        if (root) {
          root.style.setProperty('--depth', engine.depth.toFixed(4))
          root.style.setProperty('--coherence', engine.coherence.toFixed(4))
          root.style.setProperty('--px', engine.pointer.x.toFixed(4))
          root.style.setProperty('--py', engine.pointer.y.toFixed(4))
          root.style.setProperty('--pointer-x', `${(engine.pointer.x * 100).toFixed(2)}%`)
          root.style.setProperty('--pointer-y', `${(engine.pointer.y * 100).toFixed(2)}%`)
          root.style.setProperty('--pointer-dx', `${((engine.pointer.x - 0.5) * 4).toFixed(3)}vw`)
          root.style.setProperty('--pointer-dx-neg', `${((0.5 - engine.pointer.x) * 4).toFixed(3)}vw`)
          root.style.setProperty('--pointer-dy', `${((engine.pointer.y - 0.5) * 4).toFixed(3)}vh`)
          root.style.setProperty('--depth-pct', `${(engine.depth * 100).toFixed(2)}%`)
          root.style.setProperty('--core-glow-alpha', (0.08 + engine.coherence * 0.2).toFixed(3))
          root.style.setProperty('--coherence-border', (0.12 + engine.coherence * 0.45).toFixed(3))
          root.style.setProperty('--fissure-opacity', ((1 - engine.coherence) * 0.34).toFixed(3))
          root.dataset.depth = engine.depth.toFixed(2)
          root.dataset.cohesion = engine.coherence.toFixed(2)
          root.dataset.coreReady = engine.coreWake > 0.16 ? 'true' : 'false'
        }
      }

      frame = window.requestAnimationFrame(tick)
    }

    frame = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frame)
  }, [changeStage])

  const startExperience = useCallback(async () => {
    if (enteredRef.current) return
    if (!soundRef.current) soundRef.current = new Soundscape()
    const soundStarted = await soundRef.current?.start()
    soundRef.current?.setMuted(muted)
    if (soundStarted === false) setAudioAvailable(false)

    const now = performance.now()
    metricsRef.current = { ...createInitialMetrics(), startedAt: now, endedAt: now }
    completedRef.current = false
    recordShownRef.current = false
    recordRef.current = null
    targetDepthRef.current = 0.055
    const engine = engineRef.current
    engine.entered = true
    engine.depth = 0.025
    engine.stage = 'surface'
    engine.energy = 0.12
    engine.coherence = 0
    engine.coreWake = 0
    engine.coreCalm = 0
    engine.ascent = 0
    engine.pointer.down = false
    engine.ripple = { x: 0.5, y: 0.42, startedAt: now, strength: 1 }
    enteredRef.current = true
    setEntered(true)
    setRecord(null)
    changeStage('surface')
    setInstructionsVisible(true)
    if (instructionTimerRef.current !== null) window.clearTimeout(instructionTimerRef.current)
    instructionTimerRef.current = window.setTimeout(() => setInstructionsVisible(false), 7600)
    window.setTimeout(() => rootRef.current?.focus({ preventScroll: true }), 0)
  }, [changeStage, muted])

  const restart = useCallback(() => {
    pressedKeysRef.current.clear()
    completedRef.current = false
    recordShownRef.current = false
    enteredRef.current = false
    recordRef.current = null
    targetDepthRef.current = 0
    engineRef.current = createInitialEngine(reducedMotion)
    stageRef.current = 'entry'
    setEntered(false)
    setRecord(null)
    setStage('entry')
    rootRef.current?.style.setProperty('--depth', '0')
    rootRef.current?.style.setProperty('--coherence', '0')
    rootRef.current?.style.setProperty('--depth-pct', '0%')
  }, [reducedMotion])

  const updatePointer = useCallback((event: ReactPointerEvent<HTMLDivElement>, allowDepth: boolean) => {
    if (!enteredRef.current || stageRef.current === 'record') return
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = clamp((event.clientX - bounds.left) / bounds.width)
    const y = clamp((event.clientY - bounds.top) / bounds.height)
    const now = performance.now()
    const previous = lastPointerRef.current
    const deltaX = x - previous.x
    const deltaY = y - previous.y
    const deltaTime = Math.max(8, now - previous.time)
    const pixelDistance = Math.hypot(deltaX * bounds.width, deltaY * bounds.height)
    const normalizedDistance = pixelDistance / Math.max(1, Math.hypot(bounds.width, bounds.height))
    const energy = clamp((pixelDistance / deltaTime) * 0.17, 0, 0.42)
    const engine = engineRef.current
    engine.pointer.x = x
    engine.pointer.y = y
    engine.pointer.vx = deltaX / (deltaTime / 1000)
    engine.pointer.vy = deltaY / (deltaTime / 1000)
    engine.energy = clamp(engine.energy + energy)
    if (stageRef.current === 'core') {
      engine.coreWake = clamp(engine.coreWake + normalizedDistance * 2.8 + energy * 0.035)
    }
    metricsRef.current.pointerDistance += normalizedDistance
    metricsRef.current.horizontalBias += deltaX

    if (allowDepth && engine.pointer.down && previous.clientY !== 0 && !completedRef.current) {
      const drag = (previous.clientY - event.clientY) / Math.max(bounds.height, 1)
      targetDepthRef.current = clamp(targetDepthRef.current + drag * 0.54, 0.035, 0.82)
    }

    lastPointerRef.current = { x, y, clientY: event.clientY, time: now }
  }, [])

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!enteredRef.current || stageRef.current === 'record') return
      if (!event.isPrimary) return
      const target = event.target
      if (target instanceof HTMLElement && target.closest('button, a, input, select, textarea')) return
      event.currentTarget.setPointerCapture(event.pointerId)
      updatePointer(event, false)
      const engine = engineRef.current
      engine.pointer.down = true
      engine.energy = clamp(engine.energy + 0.1)
      engine.ripple = {
        x: engine.pointer.x,
        y: engine.pointer.y,
        startedAt: performance.now(),
        strength: 0.65 + Math.min(engine.energy, 0.35),
      }
      activeGestureRef.current = {
        pointerId: event.pointerId,
        x: engine.pointer.x,
        y: engine.pointer.y,
        startedAt: performance.now(),
      }
      soundRef.current?.triggerDrop(engine.pointer.x)
    },
    [updatePointer],
  )

  const handlePointerUp = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (!event.isPrimary) return
    const gesture = activeGestureRef.current
    if (gesture?.pointerId === event.pointerId) {
      const moved = Math.hypot(engineRef.current.pointer.x - gesture.x, engineRef.current.pointer.y - gesture.y)
      const heldFor = performance.now() - gesture.startedAt
      if (moved < 0.025 && heldFor < 520) metricsRef.current.clickCount += 1
      activeGestureRef.current = null
    }
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    engineRef.current.pointer.down = false
    lastPointerRef.current.clientY = 0
  }, [])

  const handleLostPointerCapture = useCallback(() => {
    engineRef.current.pointer.down = false
    activeGestureRef.current = null
    lastPointerRef.current.clientY = 0
  }, [])

  const handleWheel = useCallback((event: ReactWheelEvent<HTMLDivElement>) => {
    if (!enteredRef.current || completedRef.current || stageRef.current === 'record') return
    const normalized = clamp(event.deltaY, -180, 180)
    targetDepthRef.current = clamp(targetDepthRef.current + normalized * 0.00042, 0.035, 0.82)
    metricsRef.current.wheelDistance += Math.abs(normalized)
    engineRef.current.energy = clamp(engineRef.current.energy + Math.abs(normalized) * 0.00055)
  }, [])

  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      const key = event.key.toLowerCase()
      const target = event.target
      if (target instanceof HTMLElement && target.closest('button') && (key === ' ' || key === 'enter')) {
        return
      }
      if (!enteredRef.current && (key === 'enter' || key === ' ')) {
        event.preventDefault()
        void startExperience()
        return
      }
      if (!enteredRef.current) return
      if (['arrowdown', 'arrowup', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd', ' '].includes(key)) {
        event.preventDefault()
      }
      if (!pressedKeysRef.current.has(key)) metricsRef.current.keyActions += 1
      pressedKeysRef.current.add(key)
      if (key === ' ') engineRef.current.pointer.down = true
      if (key === 'arrowleft' || key === 'a') {
        engineRef.current.pointer.x = clamp(engineRef.current.pointer.x - 0.04)
        engineRef.current.energy = clamp(engineRef.current.energy + 0.08)
        if (stageRef.current === 'core') engineRef.current.coreWake = clamp(engineRef.current.coreWake + 0.12)
      }
      if (key === 'arrowright' || key === 'd') {
        engineRef.current.pointer.x = clamp(engineRef.current.pointer.x + 0.04)
        engineRef.current.energy = clamp(engineRef.current.energy + 0.08)
        if (stageRef.current === 'core') engineRef.current.coreWake = clamp(engineRef.current.coreWake + 0.12)
      }
      if (key === 'm') setMuted((value) => !value)
      if (key === 'r') setReducedMotion((value) => !value)
      if (key === 'escape') setInstructionsVisible(false)
    },
    [startExperience],
  )

  const handleKeyUp = useCallback((event: ReactKeyboardEvent<HTMLDivElement>) => {
    const key = event.key.toLowerCase()
    pressedKeysRef.current.delete(key)
    if (key === ' ') engineRef.current.pointer.down = false
  }, [])

  const handleWebGLReady = useCallback(() => setWebglMode('ready'), [])
  const handleWebGLFailure = useCallback(() => setWebglMode('fallback'), [])
  const handleAssetState = useCallback((loaded: boolean) => setAssetLoaded(loaded), [])

  const audioState = !entered ? 'waiting' : !audioAvailable ? 'unavailable' : muted ? 'muted' : 'playing'
  const signature = record ? record.seed.toString(16).toUpperCase().padStart(8, '0') : ''

  return (
    <div
      ref={rootRef}
      className={`experience ${webglMode === 'fallback' ? 'fallback-mode' : ''}`}
      tabIndex={-1}
      data-stage={stage}
      data-depth="0.00"
      data-cohesion="0.00"
      data-core-ready="false"
      data-webgl={webglMode}
      data-asset={assetLoaded === null ? 'pending' : assetLoaded ? 'loaded' : 'fallback'}
      data-audio-state={audioState}
      data-motion-mode={reducedMotion ? 'reduced' : 'full'}
      data-dive-signature={signature}
      onPointerDown={handlePointerDown}
      onPointerMove={(event) => updatePointer(event, true)}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onLostPointerCapture={handleLostPointerCapture}
      onWheel={handleWheel}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      aria-label="BLUE//DIVE 坠入蓝色世界互动作品"
    >
      {webglMode !== 'fallback' ? (
        <Suspense fallback={null}>
          <WebGLWorld
            engineRef={engineRef}
            onReady={handleWebGLReady}
            onFailure={handleWebGLFailure}
            onAssetState={handleAssetState}
          />
        </Suspense>
      ) : (
        <div className="fallback-water" aria-hidden="true" />
      )}

      <div className="water-film" aria-hidden="true" />
      <div className="rain-field" aria-hidden="true" />
      <div className="red-fissure" aria-hidden="true" />
      <div className="stage-cut" key={`cut-${stage}`} aria-hidden="true" />

      {webglMode === 'loading' ? (
        <div className="loading-state" role="status">
          <span>正在把水变暗</span>
          <i aria-hidden="true" />
        </div>
      ) : null}

      <header className="identity" aria-label="作品名称">
        <span>BLUE//DIVE</span>
        <span>坠入蓝色世界</span>
      </header>

      {stage !== 'record' ? (
        <div className="experience-controls" aria-label="体验设置">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              setMuted((value) => !value)
            }}
            disabled={!audioAvailable}
            aria-pressed={muted}
          >
            声音 {!audioAvailable ? '不可用' : !entered ? '待启' : muted ? '关' : '开'}
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              setReducedMotion((value) => !value)
            }}
            aria-pressed={reducedMotion}
          >
            动态 {reducedMotion ? '减少' : '标准'}
          </button>
        </div>
      ) : null}

      <div className="depth-axis" aria-hidden="true">
        <span />
      </div>

      {!entered ? (
        <section className="entry-layer" aria-labelledby="entry-title">
          <div className="entry-copy">
            <p>静水入口</p>
            <h1 id="entry-title">夜已经很深。</h1>
            <span>水还没有开口。</span>
          </div>
          <button
            type="button"
            className="water-drop"
            onClick={(event) => {
              event.stopPropagation()
              void startExperience()
            }}
            aria-label="触碰水滴，进入蓝色世界"
          >
            <i aria-hidden="true" />
            <span>触碰水滴</span>
          </button>
        </section>
      ) : stage === 'record' && record ? (
        <RecordView record={record} onRestart={restart} />
      ) : (
        <StageTypography stage={stage} />
      )}

      {instructionsVisible && stage !== 'record' ? (
        <aside className="instructions" aria-label="操作提示">
          <p>滚轮或上下拖动，改变深度</p>
          <p>移动，扰动文字与轮廓</p>
          <p>最深处先移动，再按住</p>
          <p>方向键与 W A S D 可替代</p>
        </aside>
      ) : null}

      {webglMode === 'fallback' ? (
        <p className="fallback-note" role="status">
          WebGL 不可用，已切换为静态水层。叙事与操作仍可继续。
        </p>
      ) : assetLoaded === false ? (
        <p className="fallback-note" role="status">
          记忆底片未载入，已使用程序水层继续。
        </p>
      ) : null}

      <p className="sr-only" aria-live="polite">
        当前层级：{STAGE_COPY[stage].label}
      </p>
    </div>
  )
}
