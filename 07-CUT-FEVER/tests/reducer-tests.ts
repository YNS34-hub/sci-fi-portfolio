import assert from 'node:assert/strict'
import { deriveEnding, initialState, reducer } from '../src/reducer'
import { shots } from '../src/data/shots'
import type { Choice, SessionState } from '../src/types'

const apply = (state: SessionState, ...actions: Parameters<typeof reducer>[1][]) => actions.reduce(reducer, state)

assert.equal(shots.length, 18, '素材池必须保持18个镜头')
assert.equal(new Set(shots.map((shot) => shot.id)).size, 18, '镜头ID必须唯一')

const choiceCases: Array<[[Choice, Choice, Choice], ReturnType<typeof deriveEnding>]> = [
  [['keep', 'keep', 'keep'], 'WITNESS'],
  [['keep', 'keep', 'delete'], 'COUNTERCUT'],
  [['keep', 'delete', 'keep'], 'COUNTERCUT'],
  [['delete', 'keep', 'keep'], 'COUNTERCUT'],
  [['delete', 'delete', 'delete'], 'CLEAN_CUT'],
  [['delete', 'delete', 'keep'], 'COUNTERCUT'],
  [['delete', 'keep', 'delete'], 'COUNTERCUT'],
  [['keep', 'delete', 'delete'], 'COUNTERCUT'],
]
for (const [choices, ending] of choiceCases) {
  assert.equal(deriveEnding({ M01: choices[0], M02: choices[1], M03: choices[2] }), ending)
}
assert.equal(deriveEnding({ M01: 'keep', M02: 'delete' }), 'COUNTERCUT')

let state = reducer(initialState, { type: 'START' })
state = reducer(state, { type: 'SCRUB', value: .95, reverse: false })
assert.equal(state.shotIndex, 3, 'NORMAL刮擦不得越过用户素材窗')
assert.equal(state.scrub, 3 / 17, '播放头必须与预览镜头使用同一真值')

for (let index = 0; index < 4; index += 1) state = reducer(state, { type: 'CUT' })
assert.equal(state.phase, 'INTRUSION')
for (let guard = 0; guard < 40 && state.phase !== 'FEVER'; guard += 1) state = reducer(state, { type: 'TICK' })
assert.equal(state.phase, 'FEVER')
assert.ok(state.systemInserts >= 3, '进入失控前必须经历真实系统插片')

const earlyFreeze = apply(state, { type: 'FREEZE_START' }, { type: 'FREEZE_END', heldMs: 1000 })
assert.equal(earlyFreeze.phase, 'FEVER', '失控阶段不能被刚进入时的长按跳过')
state = earlyFreeze
while (state.feverTicks < 4) state = reducer(state, { type: 'TICK' })
state = apply(state, { type: 'FREEZE_START' }, { type: 'FREEZE_END', heldMs: 1000 })
assert.equal(state.phase, 'RECOVERY')
assert.equal(state.shotIndex, 14)

let recovery = reducer(initialState, { type: 'TEST_TO_RECOVERY' })
assert.equal(reducer(recovery, { type: 'REVEAL_MEMORY', id: 'M01' }).pendingMemory, undefined)
recovery = reducer(recovery, { type: 'SET_MODE', mode: 2 })
recovery = reducer(recovery, { type: 'REVEAL_MEMORY', id: 'M01' })
assert.equal(recovery.pendingMemory, 'M01')
recovery = reducer(recovery, { type: 'DECIDE', id: 'M01', choice: 'keep' })
assert.equal(recovery.shotIndex, 0)

recovery = reducer(recovery, { type: 'REVEAL_MEMORY', id: 'M02' })
assert.equal(recovery.pendingMemory, 'M02')
recovery = reducer(recovery, { type: 'DECIDE', id: 'M02', choice: 'delete' })
assert.equal(recovery.shotIndex, 11)
assert.equal(reducer(recovery, { type: 'REVEAL_MEMORY', id: 'M03' }).pendingMemory, undefined)
recovery = reducer(recovery, { type: 'SCRUB', value: 9 / 17, reverse: true })
assert.equal(recovery.reverseArmed, true)
recovery = reducer(recovery, { type: 'REVEAL_MEMORY', id: 'M03' })
assert.equal(recovery.pendingMemory, 'M03')
recovery = reducer(recovery, { type: 'DECIDE', id: 'M03', choice: 'keep' })
assert.equal(deriveEnding(recovery.choices), 'COUNTERCUT')

const beatBefore = recovery.beat
const frozenAfterChoices = reducer(recovery, { type: 'TICK' })
assert.equal(frozenAfterChoices.beat, beatBefore, '三次决定后自动时间线必须冻结')
const beatUpgrade = reducer(recovery, { type: 'BEAT_UPGRADE' })
assert.equal(beatUpgrade.beatCuts, recovery.beatCuts + 1)
assert.equal(beatUpgrade.shotIndex, recovery.shotIndex, '双击升级强拍不得绕过视觉切镜安全门')

recovery = reducer(recovery, { type: 'SCRUB', value: 0, reverse: true })
recovery = reducer(recovery, { type: 'FREEZE_END', heldMs: 1300 })
assert.equal(recovery.easterWitness, true, '零帧证人彩蛋必须可达')
recovery = reducer(recovery, { type: 'EXPORT' })
assert.equal(recovery.phase, 'EXPORT')
assert.equal(recovery.ending, 'COUNTERCUT')

console.log(JSON.stringify({
  passed: true,
  shots: shots.length,
  choiceMappings: choiceCases.length + 1,
  systemInsertsBeforeFever: state.systemInserts,
  feverTicksBeforeRecovery: state.feverTicks,
  memories: recovery.revealed,
  ending: recovery.ending,
  easterWitness: recovery.easterWitness,
}, null, 2))
