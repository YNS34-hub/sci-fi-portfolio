export type Phase = 'EMPTY' | 'NORMAL' | 'INTRUSION' | 'FEVER' | 'RECOVERY' | 'EXPORT'
export type CompositionMode = 1 | 2 | 3 | 4
export type Choice = 'keep' | 'delete'
export type MemoryId = 'M01' | 'M02' | 'M03'
export type Ending = 'WITNESS' | 'CLEAN_CUT' | 'COUNTERCUT'
export type ColorGrade = 'cold' | 'mono' | 'warm'

export interface ShotDef {
  id: string
  no: string
  title: string
  subtitle: string
  asset: string
  alt: string
  tags: string[]
  palette: 'cold' | 'heated' | 'print'
  truthWeight: 0 | 1 | 2
  origin: 'user' | 'system' | 'hidden'
  focal: [number, number]
}

export interface SessionState {
  phase: Phase
  beat: number
  speed: number
  fever: number
  colorGrade: ColorGrade
  mode: CompositionMode
  shotIndex: number
  userCuts: number
  systemInserts: number
  feverTicks: number
  beatCuts: number
  freezeCount: number
  visited: string[]
  choices: Partial<Record<MemoryId, Choice>>
  revealed: MemoryId[]
  pendingMemory?: MemoryId
  scrub: number
  reverseArmed: boolean
  frozen: boolean
  easterWitness: boolean
  ending?: Ending
}

export type Action =
  | { type: 'START' }
  | { type: 'TICK' }
  | { type: 'CUT'; beatCut?: boolean }
  | { type: 'BEAT_UPGRADE' }
  | { type: 'SET_SPEED'; value: number }
  | { type: 'SCRUB'; value: number; reverse?: boolean }
  | { type: 'SET_MODE'; mode: CompositionMode }
  | { type: 'SET_GRADE'; grade: ColorGrade }
  | { type: 'FREEZE_START' }
  | { type: 'FREEZE_END'; heldMs: number }
  | { type: 'REVEAL_MEMORY'; id: MemoryId }
  | { type: 'DECIDE'; id: MemoryId; choice: Choice }
  | { type: 'EXPORT' }
  | { type: 'RESET' }
  | { type: 'TEST_TO_RECOVERY' }

export interface AccessSettings {
  reducedFlash: boolean
  reducedMotion: boolean
  lowPerformance: boolean
}
