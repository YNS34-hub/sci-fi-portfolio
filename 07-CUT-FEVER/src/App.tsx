import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import type { CSSProperties, PointerEvent as ReactPointerEvent, WheelEvent as ReactWheelEvent } from 'react'
import { shots, phaseLabels } from './data/shots'
import { initialState, reducer } from './reducer'
import type { AccessSettings, Choice, ColorGrade, CompositionMode, Ending, MemoryId, SessionState } from './types'
import audioEngine from './audioEngine'
import { createPosterBlob } from './poster'

declare global {
  interface Window {
    __CUT_FEVER_TEST__?: {
      getState: () => SessionState
    }
  }
}

const phaseIndex = { EMPTY: 0, NORMAL: 1, INTRUSION: 2, FEVER: 3, RECOVERY: 4, EXPORT: 5 } as const
const memoryIds: MemoryId[] = ['M01', 'M02', 'M03']
const phaseMaxIndex = { EMPTY: 0, NORMAL: 3, INTRUSION: 11, FEVER: 14, RECOVERY: 14, EXPORT: 17 } as const

const endingCopy: Record<Ending, { label: string; title: string; en: string; body: string }> = {
  WITNESS: {
    label: 'ENDING A / 留证',
    title: '保留不是原谅，是承认。',
    en: 'I LEFT. I REMEMBER.',
    body: '你没有修复那一晚。你只是终于允许另一个人留在画面里。',
  },
  CLEAN_CUT: {
    label: 'ENDING B / 删净',
    title: '导出成功：无人同行。',
    en: 'CLEAN CUT. FALSE MEMORY.',
    body: '时间线变得完美，机器却仍在空白处检测到两次呼吸。',
  },
  COUNTERCUT: {
    label: 'ENDING C / 留下切口',
    title: '这一版不再假装完整。',
    en: 'KEEP THE SEAM VISIBLE.',
    body: '保留与删除并排存在。真相不是原片，而是你承认剪过的接缝。',
  },
}

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value))

function formatTimecode(position: number) {
  return formatSeconds(clamp(position) * 34.8)
}

function formatSeconds(seconds: number) {
  const whole = Math.floor(seconds)
  const frames = Math.floor((seconds - whole) * 30)
  const ss = whole % 60
  const mm = Math.floor(whole / 60) % 60
  const hh = Math.floor(whole / 3600)
  return [hh, mm, ss, frames].map((part) => String(part).padStart(2, '0')).join(':')
}

function formatExportTimecode(state: SessionState) {
  const values = Object.values(state.choices)
  const kept = values.filter((choice) => choice === 'keep').length
  const deleted = values.filter((choice) => choice === 'delete').length
  const seconds = 28 + Math.min(5, state.beat * .12) + kept * .55 - deleted * .35 + (state.easterWitness ? .4 : 0)
  return formatSeconds(seconds)
}

function useNoiseCanvas(enabled: boolean) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return
    let frame = 0
    let timer = 0
    const paint = () => {
      const scale = .22
      const width = Math.max(64, Math.floor(canvas.clientWidth * scale))
      const height = Math.max(36, Math.floor(canvas.clientHeight * scale))
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
      }
      const image = ctx.createImageData(width, height)
      for (let i = 0; i < image.data.length; i += 4) {
        const x = (i / 4) % width
        const y = Math.floor(i / 4 / width)
        const deterministic = (x * 17 + y * 31 + frame * 13) % 61
        const value = deterministic < 4 ? 208 : deterministic < 17 ? 82 : 18
        image.data[i] = value
        image.data[i + 1] = value + 9
        image.data[i + 2] = value + 11
        image.data[i + 3] = deterministic < 9 ? 34 : 12
      }
      ctx.putImageData(image, 0, 0)
      frame += 1
    }
    paint()
    if (enabled) timer = window.setInterval(paint, 110)
    return () => window.clearInterval(timer)
  }, [enabled])
  return ref
}

function EmptyTimeline({ onStart, onAudio, audioOn, access, setAccess }: {
  onStart: () => void
  onAudio: () => void
  audioOn: boolean
  access: AccessSettings
  setAccess: (patch: Partial<AccessSettings>) => void
}) {
  const noise = useNoiseCanvas(!access.reducedMotion && !access.reducedFlash)
  return (
    <main className="empty-stage" aria-label="CUT//FEVER 空时间线">
      <canvas ref={noise} className="noise-field" aria-hidden="true" />
      <div className="empty-index">CUT//FEVER <span>MEMORY MACHINE / 00</span></div>
      <div className="empty-copy" aria-hidden="true">
        <span>NO</span><span>FOOT</span><span>AGE</span>
      </div>
      <p className="empty-question">我们剪掉的究竟是废片，还是不敢面对的自己？</p>
      <div className="empty-rail" aria-label="空时间线">
        {Array.from({ length: 22 }, (_, index) => <i key={index} style={{ '--h': `${18 + (index * 29) % 74}%` } as CSSProperties} />)}
        <button className="unknown-clip" onClick={onStart} data-control>
          <span>UNKNOWN_000</span>
          <strong>点击未知片段</strong>
          <small>00:00:00:00</small>
        </button>
      </div>
      <div className="consent-row" data-control>
        <button onClick={onAudio}>{audioOn ? '声音已就绪' : '启用程序声音'}</button>
        <span>声音只会在你点击后启动；也可全程静音体验。</span>
      </div>
      <fieldset className="opening-safety" data-control>
        <legend>视觉安全</legend>
        <label><input type="checkbox" checked={access.reducedFlash} onChange={(e) => setAccess({ reducedFlash: e.target.checked })} /> 减少闪烁</label>
        <label><input type="checkbox" checked={access.reducedMotion} onChange={(e) => setAccess({ reducedMotion: e.target.checked })} /> 减少动态</label>
      </fieldset>
      <div className="opening-note">原创影像 · 程序声音 · 本地运行</div>
    </main>
  )
}

function Typography({ state }: { state: SessionState }) {
  let id = 'T_CUT_ECHO'
  let primary = '剪'
  let secondary = 'CUT / REPEAT'
  if (state.phase === 'NORMAL') {
    secondary = `${shots[state.shotIndex].no} / BEAT ${String(state.beat).padStart(2, '0')}`
  }
  if (state.phase === 'INTRUSION') {
    id = 'T_NOT_YOURS'; primary = '此镜头不属于你'; secondary = `${shots[state.shotIndex].no} / NOT IN YOUR BIN`
  }
  if (state.phase === 'FEVER' && state.speed > 1.5) {
    id = 'T_TOO_FAST'; primary = '太快 太快 太快'; secondary = `${state.speed.toFixed(2)}× / MACHINE PRESSURE`
  } else if (state.phase === 'FEVER') {
    id = 'T_MACHINE_LINE'; primary = '你删掉了谁'; secondary = `${shots[state.shotIndex].no} / THE CUT REMEMBERS`
  }
  if (state.phase === 'RECOVERY' && !state.choices.M01) {
    id = 'T_TWO_UP'; primary = '两格'; secondary = 'TWO UP / 找到第二张票'
  } else if (state.phase === 'RECOVERY' && !state.choices.M02) {
    id = 'T_HOLD_FRAME'; primary = state.choices.M01 === 'keep' ? '留下的那格还在转' : '空白里还有声音'; secondary = 'HOLD THE FRAME'
  } else if (state.phase === 'RECOVERY' && !state.choices.M03) {
    id = 'T_BACK_SEAT'; primary = state.choices.M02 === 'keep' ? '有人坐过后座' : '你删不掉后座的重量'; secondary = 'SCRATCH BACK / LOOK AGAIN'
  } else if (state.phase === 'RECOVERY') {
    id = 'T_MACHINE_LINE'; primary = '我只学习你每一次删除'; secondary = 'EVERY CUT TAUGHT ME'
  }
  const echoes = state.phase === 'FEVER' ? 4 : state.phase === 'INTRUSION' ? 3 : 2
  return (
    <div className={`kinetic-type ${id.toLowerCase()}`} data-type={id} aria-hidden="true">
      {Array.from({ length: echoes }, (_, index) => (
        <span className="type-echo" style={{ '--echo': index } as CSSProperties} aria-hidden={index !== 0} key={index}>{primary}</span>
      ))}
      <small>{secondary}</small>
    </div>
  )
}

function Timeline({ state }: { state: SessionState }) {
  return (
    <div className="timeline" data-control aria-label="记忆时间线">
      <div className="timeline-markers"><span>00</span><span>06</span><span>12</span><span>18</span><span>24</span><span>30</span></div>
      <div className="timeline-viewport">
        <div className="timeline-track">
          {shots.map((shot, index) => {
            const hidden = shot.origin === 'hidden' && !state.revealed.includes(`M0${index - 14}` as MemoryId)
            return (
              <div
                className={`timeline-cell ${index === state.shotIndex ? 'is-active' : ''} ${shot.origin === 'system' ? 'is-system' : ''} ${hidden ? 'is-hidden' : ''}`}
                key={shot.id}
                title={hidden ? '已删除片段' : `${shot.no} ${shot.title}`}
              >
                {Array.from({ length: 6 }, (_, bar) => <i key={bar} style={{ '--bar': `${20 + ((index + 3) * (bar + 5) * 11) % 72}%` } as CSSProperties} />)}
                <b>{hidden ? '///' : shot.no}</b>
              </div>
            )
          })}
          <div className="playhead" style={{ left: `${clamp(state.scrub) * 100}%` }}><i /></div>
          {state.phase === 'RECOVERY' && state.choices.M02 && !state.choices.M03 && <div className="reverse-marker" style={{ left: `${(10 / 17) * 100}%` }}><span>BACK SEAT</span></div>}
        </div>
      </div>
    </div>
  )
}

function ModeRail({ mode, setMode }: { mode: CompositionMode; setMode: (mode: CompositionMode) => void }) {
  const labels = ['全屏', '双联', '三联', '碎片']
  return (
    <div className="mode-rail" data-control aria-label="构图模式">
      {labels.map((label, index) => {
        const value = (index + 1) as CompositionMode
        return <button className={mode === value ? 'active' : ''} aria-pressed={mode === value} onClick={() => setMode(value)} key={label}><kbd>{value}</kbd><span>{label}</span></button>
      })}
    </div>
  )
}

function GradeRail({ grade, setGrade }: { grade: ColorGrade; setGrade: (grade: ColorGrade) => void }) {
  const grades: Array<{ value: ColorGrade; label: string; swatch: string }> = [
    { value: 'cold', label: '冷青', swatch: '#93e4e7' },
    { value: 'mono', label: '冷白', swatch: '#e9e5d8' },
    { value: 'warm', label: '橙红', swatch: '#f04d26' },
  ]
  return <div className="grade-rail" data-control aria-label="画面色彩">
    <span>COLOR</span>
    {grades.map((item) => <button className={grade === item.value ? 'active' : ''} aria-pressed={grade === item.value} onClick={() => setGrade(item.value)} key={item.value} aria-label={`色彩：${item.label}`}><i style={{ background: item.swatch }} /><b>{item.label}</b></button>)}
  </div>
}

function MemoryGuide({ state, reveal, exportCut }: { state: SessionState; reveal: (id: MemoryId) => void; exportCut: () => void }) {
  if (state.phase !== 'RECOVERY' || state.pendingMemory) return null
  if (!state.choices.M01) {
    return (
      <div className="memory-guide guide-one" data-control>
        <span>DELETED 01 / 03</span>
        <p>{state.shotIndex !== 14 ? '橙色门光之后，有一格被切得过短。' : state.mode === 2 ? '第二张票从画幅接缝露出来了。' : '把最后一格放进“两格”。'}</p>
        {state.mode === 2 && state.shotIndex === 14 && <button onClick={() => reveal('M01')}>揭开橙色票边</button>}
      </div>
    )
  }
  if (!state.choices.M02) {
    return (
      <div className="memory-guide guide-two" data-control>
        <span>DELETED 02 / 03</span>
        <p>{state.shotIndex === 0 ? '不要再切。让这一格停留得比记忆更久。' : '刮回剪辑室里那台仍在转的磁带机。'}</p>
        <i className="hold-meter" aria-hidden="true" />
      </div>
    )
  }
  if (!state.choices.M03) {
    return (
      <div className="memory-guide guide-three" data-control>
        <span>DELETED 03 / 03</span>
        <p>{state.reverseArmed ? '后视镜边缘出现了一个人。' : '向左刮擦，越过 BACK SEAT 标记。'}</p>
        {state.reverseArmed && <button onClick={() => reveal('M03')}>看清后座</button>}
      </div>
    )
  }
  return (
    <div className="memory-guide guide-export" data-control>
      <span>3 / 3 MEMORY FRAGMENTS DECIDED</span>
      <p className="egg-hint">一切结束后，回到零帧。</p>
      {state.easterWitness && <p className="egg-found">FRAME_0000 // 我替被删掉的那一帧作证。</p>}
      <button onClick={exportCut}>导出本次记忆</button>
    </div>
  )
}

function MemoryDecision({ state, decide }: { state: SessionState; decide: (id: MemoryId, choice: Choice) => void }) {
  const id = state.pendingMemory
  if (!id) return null
  const shot = shots[state.shotIndex]
  return (
    <section className="memory-decision" data-control role="dialog" aria-modal="true" aria-labelledby={`memory-title-${id}`} aria-label={`被删片段 ${id}`} onKeyDown={(event) => {
      if (event.key !== 'Tab') return
      const buttons = [...event.currentTarget.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')]
      const active = document.activeElement
      const index = buttons.indexOf(active as HTMLButtonElement)
      const next = event.shiftKey ? (index <= 0 ? buttons.length - 1 : index - 1) : (index >= buttons.length - 1 ? 0 : index + 1)
      event.preventDefault()
      buttons[next]?.focus()
    }}>
      <div className="memory-still"><img src={shot.asset} alt={shot.alt} /></div>
      <div className="memory-number"><span>DELETED MEMORY</span><strong>{id.slice(-2)}</strong><em>/ 03</em></div>
      <div className="memory-copy">
        <p>{shot.no} · {shot.title}</p>
        <h2 id={`memory-title-${id}`}>{shot.subtitle}</h2>
        <div className="decision-actions">
          <button autoFocus onClick={() => decide(id, 'keep')}><span>KEEP</span>保留这一帧</button>
          <button onClick={() => decide(id, 'delete')}><span>DELETE</span>删除这一帧</button>
        </div>
      </div>
    </section>
  )
}

function TransportControls({ audioOn, muted, volume, access, onAudio, onMute, onVolume, setAccess, audioError }: {
  audioOn: boolean
  muted: boolean
  volume: number
  access: AccessSettings
  onAudio: () => void
  onMute: () => void
  onVolume: (value: number) => void
  setAccess: (patch: Partial<AccessSettings>) => void
  audioError?: string
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`transport-controls ${open ? 'open' : ''}`} data-control>
      <button className="settings-toggle" onClick={() => setOpen((value) => !value)} aria-expanded={open}>声音 / 安全</button>
      {open && <div className="settings-sheet">
        <div className="sound-row">
          <button onClick={onAudio}>{audioOn ? '声音已启用' : '启用声音'}</button>
          <button onClick={onMute} disabled={!audioOn}>{muted ? '取消静音' : '静音'}</button>
        </div>
        <label>音量 <input type="range" min="0" max="1" step="0.01" value={volume} onChange={(event) => onVolume(Number(event.target.value))} /></label>
        <label><input type="checkbox" checked={access.reducedFlash} onChange={(event) => setAccess({ reducedFlash: event.target.checked })} /> 减少闪烁</label>
        <label><input type="checkbox" checked={access.reducedMotion} onChange={(event) => setAccess({ reducedMotion: event.target.checked })} /> 减少动态</label>
        <p>性能层级：{access.lowPerformance ? '简化多画幅' : '完整'}</p>
        {audioError && <p className="audio-error">声音初始化失败，视觉节拍仍可完整体验。{audioError}</p>}
      </div>}
    </div>
  )
}

function FinalPoster({ state, timecode, onReset }: { state: SessionState; timecode: string; onReset: () => void }) {
  const ending = state.ending ?? 'COUNTERCUT'
  const copy = endingCopy[ending]
  const [status, setStatus] = useState('')
  const [exporting, setExporting] = useState(false)
  const selected = shots.slice(15, 18)
  const download = async () => {
    if (exporting) return
    setExporting(true)
    setStatus('正在冲洗封面…')
    try {
      const blob = await createPosterBlob({
        ending,
        assets: selected.map((shot) => shot.asset),
        choices: state.choices,
        timecode,
        easterWitness: state.easterWitness,
      })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `CUT-FEVER-${ending}-${Date.now()}.png`
      anchor.click()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
      setStatus('静态封面已下载')
    } catch (error) {
      setStatus(`导出失败：${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setExporting(false)
    }
  }
  return (
    <main className={`final-stage ending-${ending.toLowerCase()}`} data-ending={ending}>
      <div className="poster-kicker">CUT//FEVER · FINAL ASSEMBLY · {timecode}</div>
      <div className="poster-images">
        {selected.map((shot, index) => <figure key={shot.id} data-choice={state.choices[memoryIds[index]]}><img src={shot.asset} alt={shot.alt} /><figcaption>{shot.no} / {state.choices[memoryIds[index]] === 'keep' ? '保留' : '删除'}</figcaption></figure>)}
      </div>
      <div className="poster-title" aria-label="CUT FEVER"><span>CUT</span><i>//</i><span>FEVER</span></div>
      <section className="ending-copy">
        <span>{copy.label}</span>
        <h1>{copy.title}</h1>
        <h2>{copy.en}</h2>
        <p>{copy.body}</p>
        {state.easterWitness && <em>FRAME_0000 // WITNESS</em>}
      </section>
      <div className="poster-actions" data-control>
        <button onClick={download} disabled={exporting}>{exporting ? '正在冲洗…' : '下载本次静态封面'}</button>
        <button onClick={onReset}>重新剪一版</button>
        <span role="status">{status}</span>
      </div>
    </main>
  )
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState)
  const stateRef = useRef(state)
  const [access, setAccessState] = useState<AccessSettings>(() => ({
    reducedFlash: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false,
    reducedMotion: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false,
    lowPerformance: (navigator.hardwareConcurrency || 8) <= 4 || ((navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8) <= 4,
  }))
  const [audioOn, setAudioOn] = useState(false)
  const [muted, setMuted] = useState(false)
  const [volume, setVolume] = useState(.58)
  const [audioError, setAudioError] = useState<string>()
  const stageRef = useRef<HTMLElement>(null)
  const hoverX = useRef(0)
  const pointer = useRef<{ id: number; at: number; x: number; y: number; lastX: number; lastY: number; moved: boolean; freezeTimer?: number; freezeStarted: boolean; pointerType: string } | undefined>(undefined)
  const lastTap = useRef(0)
  const lastVisualAt = useRef(0)
  const holdKeyAt = useRef(0)
  const wheelDelta = useRef(0)
  const wheelFrame = useRef(0)
  const interactionUntil = useRef(0)
  const [isNarrow, setIsNarrow] = useState(() => window.matchMedia?.('(max-width: 720px), (max-height: 500px)').matches ?? false)

  stateRef.current = state
  const timecode = formatTimecode(state.scrub)
  const setAccess = (patch: Partial<AccessSettings>) => setAccessState((current) => ({ ...current, ...patch }))

  useEffect(() => {
    const query = window.matchMedia('(max-width: 720px), (max-height: 500px)')
    const update = () => setIsNarrow(query.matches)
    update()
    query.addEventListener?.('change', update)
    return () => query.removeEventListener?.('change', update)
  }, [])

  const enableAudio = useCallback(async () => {
    if (audioOn) return
    try {
      await audioEngine.start()
      audioEngine.setVolume(volume)
      audioEngine.setMuted(false)
      setMuted(false)
      setAudioOn(true)
      setAudioError(undefined)
    } catch (error) {
      setAudioError(error instanceof Error ? error.message : 'Web Audio 不可用')
      setAudioOn(false)
    }
  }, [audioOn, volume])

  const hit = useCallback((strong = false) => {
    if (audioOn) audioEngine.hit(strong ? 1 : .56)
  }, [audioOn])

  useEffect(() => {
    const speedPressure = clamp((state.speed - .45) / 1.9)
    const phasePressure = state.phase === 'FEVER' ? .82 : state.phase === 'INTRUSION' ? .5 : .18
    audioEngine.setTempoPressure(clamp(speedPressure * .55 + phasePressure))
  }, [state.speed, state.phase])

  useEffect(() => {
    if (state.phase === 'EMPTY' || state.phase === 'EXPORT') return
    const safeGap = access.reducedFlash ? 560 : 340
    const interval = window.setInterval(() => {
      const now = performance.now()
      if (now < interactionUntil.current) return
      if (now - lastVisualAt.current < safeGap) return
      lastVisualAt.current = now
      dispatch({ type: 'TICK' })
    }, Math.max(safeGap, 490 / state.speed))
    return () => window.clearInterval(interval)
  }, [access.reducedFlash, state.phase, state.speed])

  useEffect(() => () => {
    if (wheelFrame.current) window.cancelAnimationFrame(wheelFrame.current)
    void audioEngine.stop()
  }, [])

  const cut = useCallback((beatCut = false) => {
    const now = performance.now()
    const safeGap = access.reducedFlash ? 560 : 340
    if (now - lastVisualAt.current < safeGap) return
    lastVisualAt.current = now
    dispatch({ type: 'CUT', beatCut })
    hit(beatCut)
  }, [access.reducedFlash, hit])

  const commitScrub = useCallback((value: number, reverse: boolean) => {
    const now = performance.now()
    const safeGap = access.reducedFlash ? 560 : 340
    if (now - lastVisualAt.current < safeGap) return false
    lastVisualAt.current = now
    dispatch({ type: 'SCRUB', value: clamp(value), reverse })
    return true
  }, [access.reducedFlash])

  useEffect(() => {
    if (audioOn && state.beat > 0 && state.beat % 4 === 0) audioEngine.hit(.66)
  }, [audioOn, state.beat])

  const setMode = useCallback((mode: CompositionMode) => {
    dispatch({ type: 'SET_MODE', mode })
    hit(false)
  }, [hit])

  const setGrade = useCallback((grade: ColorGrade) => {
    dispatch({ type: 'SET_GRADE', grade })
    hit(false)
  }, [hit])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLElement && event.target.matches('input, button, textarea, select')) return
      if (['1', '2', '3', '4'].includes(event.key)) setMode(Number(event.key) as CompositionMode)
      if (event.code === 'Space' && !event.repeat) { event.preventDefault(); cut(true) }
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault()
        const step = (event.shiftKey ? 3 : 1) / (shots.length - 1)
        const reverse = event.key === 'ArrowLeft'
        commitScrub(stateRef.current.scrub + (reverse ? -step : step), reverse)
      }
      if (event.key === 'Home') { event.preventDefault(); commitScrub(0, true) }
      if (event.key === 'End') {
        event.preventDefault()
        commitScrub(phaseMaxIndex[stateRef.current.phase] / (shots.length - 1), false)
      }
      if (event.key.toLowerCase() === 'h' && !event.repeat) {
        event.preventDefault()
        holdKeyAt.current = performance.now()
        dispatch({ type: 'FREEZE_START' })
      }
      if (event.key.toLowerCase() === 'c') {
        const order: ColorGrade[] = ['cold', 'mono', 'warm']
        setGrade(order[(order.indexOf(stateRef.current.colorGrade) + 1) % order.length])
      }
      if (event.key.toLowerCase() === 'm' && audioOn) {
        const next = !muted; setMuted(next); audioEngine.setMuted(next)
      }
    }
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'h' && stateRef.current.frozen) {
        const heldMs = holdKeyAt.current ? performance.now() - holdKeyAt.current : 0
        holdKeyAt.current = 0
        dispatch({ type: 'FREEZE_END', heldMs })
      }
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [audioOn, commitScrub, cut, muted, setGrade, setMode])

  useEffect(() => {
    window.__CUT_FEVER_TEST__ = {
      getState: () => stateRef.current,
    }
    return () => { delete window.__CUT_FEVER_TEST__ }
  }, [])

  const queueSpeedDelta = useCallback((delta: number) => {
    wheelDelta.current += delta
    if (wheelFrame.current) return
    wheelFrame.current = window.requestAnimationFrame(() => {
      const delta = wheelDelta.current
      wheelDelta.current = 0
      wheelFrame.current = 0
      dispatch({ type: 'SET_SPEED', value: stateRef.current.speed + delta })
    })
  }, [])

  const onWheel = (event: ReactWheelEvent) => {
    if (state.phase === 'EXPORT') return
    queueSpeedDelta(event.deltaY > 0 ? .12 : -.12)
  }

  const onPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    if ((event.target as HTMLElement).closest('[data-control]') || state.phase === 'EXPORT') return
    interactionUntil.current = performance.now() + 360
    try {
      event.currentTarget.setPointerCapture(event.pointerId)
    } catch {
      // Synthetic or partially supported touch events still retain the fallback gesture path.
    }
    const entry: NonNullable<typeof pointer.current> = { id: event.pointerId, at: performance.now(), x: event.clientX, y: event.clientY, lastX: event.clientX, lastY: event.clientY, moved: false, freezeStarted: false, pointerType: event.pointerType }
    entry.freezeTimer = window.setTimeout(() => {
      entry.freezeStarted = true
      dispatch({ type: 'FREEZE_START' })
    }, 300)
    pointer.current = entry
  }

  const onPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if ((event.target as HTMLElement).closest('[data-control]')) return
    const rect = stageRef.current?.getBoundingClientRect()
    interactionUntil.current = performance.now() + 120
    if (!pointer.current) {
      if (event.pointerType === 'mouse' && rect && state.phase !== 'EXPORT') {
        const raw = clamp((event.clientX - rect.left) / rect.width)
        const value = raw * phaseMaxIndex[state.phase] / (shots.length - 1)
        const reverse = value < hoverX.current
        if (commitScrub(value, reverse)) hoverX.current = value
      }
      return
    }
    if (pointer.current.id !== event.pointerId || !rect) return
    const dx = event.clientX - pointer.current.x
    const dy = event.clientY - pointer.current.y
    const stepX = event.clientX - pointer.current.lastX
    const stepY = event.clientY - pointer.current.lastY
    pointer.current.moved ||= Math.abs(dx) + Math.abs(dy) > 9
    if (pointer.current.moved && pointer.current.freezeTimer && !pointer.current.freezeStarted) {
      window.clearTimeout(pointer.current.freezeTimer)
      pointer.current.freezeTimer = undefined
    }
    if (event.pointerType === 'touch' && Math.abs(dy) > Math.abs(dx) * 1.15) {
      queueSpeedDelta(-stepY / 92)
    } else {
      const raw = clamp((event.clientX - rect.left) / rect.width)
      const value = raw * phaseMaxIndex[state.phase] / (shots.length - 1)
      commitScrub(value, stepX < -2)
    }
    pointer.current.lastX = event.clientX
    pointer.current.lastY = event.clientY
  }

  const finishPointer = (event: ReactPointerEvent<HTMLElement>) => {
    const entry = pointer.current
    if (!entry || entry.id !== event.pointerId) return
    if (entry.freezeTimer) window.clearTimeout(entry.freezeTimer)
    const heldMs = performance.now() - entry.at
    if (entry.freezeStarted) {
      dispatch({ type: 'FREEZE_END', heldMs })
      if (heldMs >= 900) hit(true)
    } else if (!entry.moved) {
      const now = performance.now()
      const double = entry.pointerType === 'touch' && now - lastTap.current < 320
      if (double) {
        dispatch({ type: 'BEAT_UPGRADE' })
        hit(true)
        lastTap.current = 0
      } else {
        cut(false)
        lastTap.current = now
      }
    }
    pointer.current = undefined
  }

  const reveal = (id: MemoryId) => { dispatch({ type: 'REVEAL_MEMORY', id }); hit(true) }
  const decide = (id: MemoryId, choice: Choice) => { dispatch({ type: 'DECIDE', id, choice }); hit(choice === 'keep') }

  const panelIndices = useMemo(() => {
    if (state.pendingMemory) return [state.shotIndex]
    const count = state.mode === 1 ? 1 : state.mode === 2 ? 2 : state.mode === 3 ? 3 : isNarrow ? (state.phase === 'NORMAL' ? 2 : 3) : access.lowPerformance ? 4 : 8
    const ceiling = state.phase === 'RECOVERY' ? 15 : state.phase === 'NORMAL' ? 4 : state.phase === 'INTRUSION' ? 12 : 15
    const step = state.mode === 4 && ceiling > 4 ? 2 : 1
    return Array.from({ length: count }, (_, index) => (state.shotIndex + index * step) % ceiling)
  }, [access.lowPerformance, isNarrow, state.mode, state.pendingMemory, state.phase, state.shotIndex])

  if (state.phase === 'EMPTY') {
    return <EmptyTimeline onStart={() => dispatch({ type: 'START' })} onAudio={enableAudio} audioOn={audioOn} access={access} setAccess={setAccess} />
  }

  if (state.phase === 'EXPORT') return <FinalPoster state={state} timecode={formatExportTimecode(state)} onReset={() => dispatch({ type: 'RESET' })} />

  const current = shots[state.shotIndex]
  const latestChoice = state.choices.M03 ?? state.choices.M02 ?? state.choices.M01
  const bodyClass = [
    `phase-${state.phase.toLowerCase()}`,
    `palette-${state.phase === 'NORMAL' ? 'cold' : state.phase === 'RECOVERY' ? 'print' : 'heated'}`,
    `grade-${state.colorGrade}`,
    access.reducedFlash ? 'reduced-flash' : '',
    access.reducedMotion ? 'reduced-motion' : '',
    access.lowPerformance ? 'low-performance' : '',
    state.frozen ? 'is-frozen' : '',
    latestChoice ? `last-choice-${latestChoice}` : '',
    state.systemInserts > 0 && state.beat % 3 === 0 ? 'structural-glitch' : '',
  ].filter(Boolean).join(' ')

  return (
    <main
      ref={stageRef}
      className={`machine-stage ${bodyClass}`}
      data-phase={state.phase}
      onWheel={onWheel}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={finishPointer}
      onPointerCancel={finishPointer}
      tabIndex={0}
      aria-keyshortcuts="1 2 3 4 Space ArrowLeft ArrowRight Home End H C M"
    >
      <header className="machine-header">
        <div className="machine-brand">CUT//FEVER <span>LIVE MEMORY ASSEMBLY</span></div>
        <div className="phase-readout"><b>0{phaseIndex[state.phase]}</b><span>{phaseLabels[state.phase]}</span></div>
        <time>{timecode}</time>
        <div className="pressure"><span>PRESSURE</span><i><b style={{ width: `${state.fever * 100}%` }} /></i><em>{Math.round(state.fever * 100)}</em></div>
      </header>

      <section className={`frame-field mode-${state.mode}`}>
        {panelIndices.map((shotIndex, panel) => {
          const shot = shots[shotIndex]
          return (
            <figure className={`shot-panel panel-${panel}`} key={`${shot.id}-${panel}`} data-shot={shot.id}>
              <img
                src={shot.asset}
                alt={panel === 0 ? shot.alt : ''}
                draggable={false}
                decoding="async"
                loading={panel === 0 ? 'eager' : 'lazy'}
                fetchPriority={panel === 0 ? 'high' : 'low'}
                style={{ objectPosition: `${shot.focal[0]}% ${shot.focal[1]}%`, '--scratch': state.scrub } as CSSProperties}
              />
              <figcaption><b>{shot.no}</b><span>{shot.title}</span><em>{shot.origin === 'system' ? 'SYSTEM INSERT' : shot.origin === 'hidden' ? 'DELETED' : 'USER BIN'}</em></figcaption>
            </figure>
          )
        })}
        <Typography state={state} />
        <div className="frame-crosshair" aria-hidden="true"><i /><i /></div>
        {state.frozen && <div className="freeze-slate"><span>FRAME HELD</span><b>机器仍在读取</b></div>}
      </section>

      <p className="sr-only" role="status">阶段：{phaseLabels[state.phase]}。</p>

      <div className="shot-ledger">
        <span>{current.no}</span>
        <strong>{current.title}</strong>
        <p>{current.subtitle}</p>
      </div>

      <div className="choice-ledger" aria-label="记忆决定">
        {memoryIds.map((id, index) => <span key={id} data-choice={state.choices[id] ?? 'none'}><b>0{index + 1}</b>{state.choices[id] === 'keep' ? '保留' : state.choices[id] === 'delete' ? '删除' : '未找到'}</span>)}
      </div>

      <ModeRail mode={state.mode} setMode={setMode} />
      <GradeRail grade={state.colorGrade} setGrade={setGrade} />
      <MemoryGuide state={state} reveal={reveal} exportCut={() => dispatch({ type: 'EXPORT' })} />
      <MemoryDecision state={state} decide={decide} />
      <TransportControls
        audioOn={audioOn}
        muted={muted}
        volume={volume}
        access={access}
        onAudio={enableAudio}
        onMute={() => { const next = !muted; setMuted(next); audioEngine.setMuted(next) }}
        onVolume={(value) => { setVolume(value); audioEngine.setVolume(value) }}
        setAccess={setAccess}
        audioError={audioError}
      />
      <div className="speed-readout"><span>SCROLL / SWIPE</span><b>{state.speed.toFixed(2)}×</b></div>
      <div className="interaction-legend desktop-legend">滚轮调速 · 横移刮擦 · 点击切镜 · 长按冻结 · 1—4 构图 · 空格节拍切镜</div>
      <div className="interaction-legend mobile-legend">上下滑调速 · 横滑刮擦 · 点击切镜 · 双击节拍 · 长按冻结</div>
      <Timeline state={state} />
    </main>
  )
}
