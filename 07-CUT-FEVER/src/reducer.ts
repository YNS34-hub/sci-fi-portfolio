import { memoryShotIndex, shots } from './data/shots'
import type { Action, Ending, MemoryId, SessionState } from './types'

export const initialState: SessionState = {
  phase: 'EMPTY',
  beat: 0,
  speed: 1,
  fever: 0,
  colorGrade: 'cold',
  mode: 1,
  shotIndex: 0,
  userCuts: 0,
  systemInserts: 0,
  feverTicks: 0,
  beatCuts: 0,
  freezeCount: 0,
  visited: [],
  choices: {},
  revealed: [],
  scrub: 0,
  reverseArmed: false,
  frozen: false,
  easterWitness: false,
}

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value))

export function deriveEnding(choices: SessionState['choices']): Ending {
  const score = (['M01', 'M02', 'M03'] as MemoryId[]).reduce(
    (sum, id) => sum + (choices[id] === 'keep' ? 1 : choices[id] === 'delete' ? -1 : 0),
    0,
  )
  if (score >= 2) return 'WITNESS'
  if (score <= -2) return 'CLEAN_CUT'
  return 'COUNTERCUT'
}

function shotCeiling(phase: SessionState['phase']) {
  if (phase === 'NORMAL') return 4
  if (phase === 'INTRUSION') return 12
  if (phase === 'FEVER') return 15
  if (phase === 'RECOVERY') return 15
  return shots.length
}

function remember(state: SessionState, shotIndex: number) {
  const id = shots[shotIndex]?.id
  if (!id || state.visited.includes(id)) return state.visited
  return [...state.visited, id].slice(-48)
}

function advance(state: SessionState, amount = 1) {
  const ceiling = shotCeiling(state.phase)
  const next = (state.shotIndex + amount + ceiling) % ceiling
  return { shotIndex: next, scrub: next / (shots.length - 1), visited: remember(state, next) }
}

function promote(state: SessionState): SessionState {
  if (state.phase === 'NORMAL' && (state.userCuts >= 4 || state.beat >= 10 || state.fever >= 0.38)) {
    return { ...state, phase: 'INTRUSION', mode: Math.max(2, state.mode) as SessionState['mode'] }
  }
  if (state.phase === 'INTRUSION' && (state.systemInserts >= 3 || (state.systemInserts >= 2 && state.fever >= 0.62) || state.beat >= 22)) {
    return { ...state, phase: 'FEVER', mode: Math.max(3, state.mode) as SessionState['mode'], fever: Math.min(.78, Math.max(.64, state.fever)), feverTicks: 0 }
  }
  if (state.phase === 'FEVER' && state.feverTicks >= 4 && (state.fever >= .92 || state.beat >= 28 || (state.freezeCount >= 1 && state.visited.length >= 8))) {
    return { ...state, phase: 'RECOVERY', mode: 1, shotIndex: 14, scrub: 14 / (shots.length - 1), speed: Math.min(1.15, state.speed), frozen: false }
  }
  return state
}

function canReveal(state: SessionState, id: MemoryId) {
  if (state.phase !== 'RECOVERY' || state.revealed.includes(id)) return false
  if (id === 'M01') return state.mode === 2 && state.shotIndex === 14
  if (id === 'M02') return Boolean(state.choices.M01 && state.shotIndex === 0)
  return Boolean(state.choices.M02 && state.reverseArmed)
}

export function reducer(state: SessionState, action: Action): SessionState {
  switch (action.type) {
    case 'START':
      if (state.phase !== 'EMPTY') return state
      return { ...state, phase: 'NORMAL', beat: 1, visited: [shots[0].id] }

    case 'TICK': {
      if (state.phase === 'EMPTY' || state.phase === 'EXPORT' || state.frozen) return state
      if (state.phase === 'RECOVERY' && state.choices.M01 && state.choices.M02 && state.choices.M03) return state
      const beat = state.beat + 1
      let systemInserts = state.systemInserts
      let fever = state.fever
      const feverTicks = state.feverTicks + (state.phase === 'FEVER' ? 1 : 0)
      let next = { ...state, beat, feverTicks }
      const cadence = state.phase === 'NORMAL' ? 3 : state.phase === 'INTRUSION' ? 2 : state.phase === 'FEVER' ? 1 : 4
      if (beat % cadence === 0) next = { ...next, ...advance(next, state.phase === 'FEVER' && beat % 4 === 0 ? 2 : 1) }
      if ((state.phase === 'INTRUSION' || state.phase === 'FEVER') && beat % 3 === 0) {
        systemInserts += 1
        fever = clamp(fever + (state.phase === 'FEVER' ? .055 : .075))
        const systemStart = state.phase === 'INTRUSION' ? 6 : 9
        const systemCount = state.phase === 'INTRUSION' ? 6 : 6
        const inserted = systemStart + (systemInserts % systemCount)
        next = { ...next, shotIndex: inserted, scrub: inserted / (shots.length - 1), visited: remember(next, inserted) }
      }
      return promote({ ...next, systemInserts, fever })
    }

    case 'CUT': {
      if (state.phase === 'EMPTY' || state.phase === 'EXPORT' || state.frozen) return state
      const next = {
        ...state,
        ...advance(state, action.beatCut ? 2 : 1),
        userCuts: state.userCuts + 1,
        fever: clamp(state.fever + (action.beatCut ? .095 : .055)),
      }
      return promote(next)
    }

    case 'BEAT_UPGRADE': {
      if (state.phase === 'EMPTY' || state.phase === 'EXPORT' || state.frozen) return state
      return promote({ ...state, beat: state.beat + 1, beatCuts: state.beatCuts + 1, fever: clamp(state.fever + .095) })
    }

    case 'SET_SPEED': {
      if (state.phase === 'EXPORT') return state
      const speed = clamp(action.value, .45, 2.35)
      const fever = clamp(state.fever + (speed > 1.55 ? (speed - 1.55) * .09 : -.012))
      return promote({ ...state, speed, fever })
    }

    case 'SCRUB': {
      const value = clamp(action.value)
      const ceiling = shotCeiling(state.phase)
      const preview = Math.min(ceiling - 1, Math.round(value * (shots.length - 1)))
      const canonicalScrub = preview / (shots.length - 1)
      const backMarker = 10 / (shots.length - 1)
      const crossedBackMarker = Boolean(
        action.reverse
        && state.phase === 'RECOVERY'
        && state.choices.M02
        && state.scrub >= backMarker
        && canonicalScrub < backMarker,
      )
      return {
        ...state,
        scrub: canonicalScrub,
        shotIndex: state.pendingMemory || state.frozen ? state.shotIndex : preview,
        visited: state.pendingMemory || state.frozen ? state.visited : remember(state, preview),
        reverseArmed: state.reverseArmed || crossedBackMarker,
      }
    }

    case 'SET_MODE':
      if (state.phase === 'EMPTY' || state.phase === 'EXPORT') return state
      return { ...state, mode: action.mode, fever: clamp(state.fever + (action.mode === 4 ? .04 : 0)) }

    case 'SET_GRADE':
      if (state.phase === 'EMPTY' || state.phase === 'EXPORT') return state
      return { ...state, colorGrade: action.grade, fever: clamp(state.fever + (action.grade === 'warm' ? .025 : 0)) }

    case 'FREEZE_START':
      if (state.phase === 'EMPTY' || state.phase === 'EXPORT') return state
      return { ...state, frozen: true }

    case 'FREEZE_END': {
      let next: SessionState = { ...state, frozen: false }
      if (action.heldMs >= 300) next.freezeCount += 1
      if (state.phase === 'FEVER' && state.feverTicks >= 4 && action.heldMs >= 650) next = { ...next, phase: 'RECOVERY', mode: 1, shotIndex: 14, scrub: 14 / (shots.length - 1), speed: Math.min(1.15, state.speed) }
      if (state.phase === 'RECOVERY' && action.heldMs >= 900 && state.choices.M01 && !state.revealed.includes('M02')) {
        next = reducer(next, { type: 'REVEAL_MEMORY', id: 'M02' })
      }
      if (state.phase === 'RECOVERY' && action.heldMs >= 1200 && state.scrub <= .035 && state.choices.M01 && state.choices.M02 && state.choices.M03) {
        next.easterWitness = true
      }
      return next
    }

    case 'REVEAL_MEMORY':
      if (!canReveal(state, action.id)) return state
      return {
        ...state,
        revealed: [...state.revealed, action.id],
        pendingMemory: action.id,
        shotIndex: memoryShotIndex[action.id],
        scrub: memoryShotIndex[action.id] / (shots.length - 1),
        frozen: true,
      }

    case 'DECIDE': {
      if (!state.revealed.includes(action.id)) return state
      const choices = { ...state.choices, [action.id]: action.choice }
      const nextShot = action.id === 'M01' ? 0 : action.id === 'M02' ? 11 : 14
      return {
        ...state,
        choices,
        pendingMemory: undefined,
        frozen: false,
        mode: action.id === 'M01' ? 1 : state.mode,
        shotIndex: nextShot,
        scrub: nextShot / (shots.length - 1),
      }
    }

    case 'EXPORT':
      if (!state.choices.M01 || !state.choices.M02 || !state.choices.M03) return state
      return { ...state, phase: 'EXPORT', ending: deriveEnding(state.choices), frozen: true }

    case 'TEST_TO_RECOVERY':
      return { ...initialState, phase: 'RECOVERY', beat: 28, feverTicks: 4, mode: 1, shotIndex: 14, scrub: 14 / (shots.length - 1), fever: .82, visited: shots.slice(0, 15).map((shot) => shot.id) }

    case 'RESET':
      return { ...initialState }
  }
}
