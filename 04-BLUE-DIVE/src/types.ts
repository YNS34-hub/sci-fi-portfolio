export type StageId =
  | 'entry'
  | 'surface'
  | 'echo'
  | 'unsaid'
  | 'core'
  | 'ascent'
  | 'record'

export interface PointerState {
  x: number
  y: number
  vx: number
  vy: number
  down: boolean
}

export interface RippleState {
  x: number
  y: number
  startedAt: number
  strength: number
}

export interface EngineState {
  entered: boolean
  depth: number
  stage: StageId
  pointer: PointerState
  energy: number
  coherence: number
  coreWake: number
  coreCalm: number
  ascent: number
  reducedMotion: boolean
  ripple: RippleState
}

export interface DiveMetrics {
  startedAt: number
  endedAt: number
  pointerDistance: number
  clickCount: number
  wheelDistance: number
  keyActions: number
  holdMs: number
  stillMs: number
  coreMoves: number
  horizontalBias: number
}

export type ResponseMode = '停留' | '触碰' | '游移' | '往返'

export interface DiveRecord {
  durationSeconds: number
  holdSeconds: number
  stillSeconds: number
  responseMode: ResponseMode
  responseLine: string
  behaviorExplanation: string
  seed: number
  stillnessRatio: number
  movementRatio: number
  clicks: number
  completedAt: string
}
