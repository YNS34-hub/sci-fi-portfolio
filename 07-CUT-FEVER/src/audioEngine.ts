const LOOK_AHEAD_SECONDS = 0.12
const SCHEDULER_INTERVAL_MS = 25
const STEPS_PER_BEAT = 4
const STEPS_PER_BAR = 16
const MIN_GAIN = 0.0001

export interface AudioEngineStatus {
  started: boolean
  muted: boolean
  volume: number
  tempoPressure: number
  failed: boolean
  error: string | null
}

export class AudioEngineError extends Error {
  override readonly name = 'AudioEngineError'

  constructor(message: string, readonly cause?: unknown) {
    super(message)
  }
}

/**
 * Original procedural sound engine for CUT//FEVER.
 *
 * Nothing is created until start() is called. Call start() directly from a
 * click/touch handler so browser autoplay rules can be satisfied.
 */
export class CutFeverAudioEngine {
  private context: AudioContext | null = null
  private mixBus: GainNode | null = null
  private outputGain: GainNode | null = null
  private tapeGain: GainNode | null = null
  private ambienceGain: GainNode | null = null
  private noiseBuffer: AudioBuffer | null = null
  private continuousSources: AudioScheduledSourceNode[] = []
  private schedulerId: number | null = null
  private nextStepTime = 0
  private step = 0
  private starting: Promise<void> | null = null
  private failure: AudioEngineError | null = null
  private muted = false
  private volume = 0.72
  private tempoPressure = 0

  get started(): boolean {
    return this.context?.state === 'running'
  }

  get failed(): boolean {
    return this.failure !== null
  }

  get error(): AudioEngineError | null {
    return this.failure
  }

  get status(): AudioEngineStatus {
    return {
      started: this.started,
      muted: this.muted,
      volume: this.volume,
      tempoPressure: this.tempoPressure,
      failed: this.failed,
      error: this.failure?.message ?? null,
    }
  }

  start(): Promise<void> {
    if (this.started) return Promise.resolve()
    if (this.starting) return this.starting

    const operation = this.initialize()
    this.starting = operation
    operation.then(
      () => {
        if (this.starting === operation) this.starting = null
      },
      () => {
        if (this.starting === operation) this.starting = null
      },
    )
    return operation
  }

  setMuted(muted: boolean): void {
    this.muted = muted
    this.applyOutputGain()
  }

  setVolume(volume: number): void {
    this.volume = clamp(volume, 0, 1)
    this.applyOutputGain()
  }

  /** 0 = restrained edit, 1 = maximum safe fever. */
  setTempoPressure(pressure: number): void {
    this.tempoPressure = clamp(pressure, 0, 1)
    const context = this.context

    if (!context) return

    const now = context.currentTime
    if (this.tapeGain) {
      rampParam(this.tapeGain.gain, 0.009 + this.tempoPressure * 0.014, now, 0.18)
    }
    if (this.ambienceGain) {
      rampParam(this.ambienceGain.gain, 0.018 + this.tempoPressure * 0.011, now, 0.24)
    }
  }

  /** Plays a user-action mechanical cut. Returns false before audio is started. */
  hit(intensity = 1): boolean {
    const context = this.context
    const mixBus = this.mixBus
    if (!context || !mixBus || context.state !== 'running') return false

    const safeIntensity = clamp(intensity, 0.15, 1)
    const time = context.currentTime + 0.006
    this.scheduleMechanicalClick(time, 0.55 + safeIntensity * 0.45)

    if (safeIntensity > 0.82) {
      this.scheduleKick(time, 0.42)
    }
    return true
  }

  async stop(): Promise<void> {
    const pendingStart = this.starting
    if (pendingStart) {
      try {
        await pendingStart
      } catch {
        // initialize() has already recorded the useful failure.
      }
    }
    await this.teardown()
  }

  private async initialize(): Promise<void> {
    this.failure = null

    try {
      if (this.context && this.context.state !== 'closed') {
        await this.context.resume()
        this.startScheduler()
        this.applyOutputGain(true)
        return
      }

      const AudioContextClass = getAudioContextConstructor()
      if (!AudioContextClass) {
        throw new AudioEngineError('此浏览器不支持 Web Audio，已保持静音视觉体验。')
      }

      const context = new AudioContextClass({ latencyHint: 'interactive' })
      this.context = context
      this.buildOutputGraph(context)
      this.noiseBuffer = createNoiseBuffer(context, 2.5)
      this.startTapeNoise(context)
      this.startAmbience(context)

      await context.resume()
      if (context.state !== 'running') {
        throw new AudioEngineError('浏览器未允许音频启动，请再次点击声音按钮。')
      }

      this.nextStepTime = context.currentTime + 0.055
      this.step = 0
      this.startScheduler()
      this.applyOutputGain(true)
      this.setTempoPressure(this.tempoPressure)
    } catch (reason) {
      const error = this.recordFailure(reason)
      await this.teardown()
      throw error
    }
  }

  private buildOutputGraph(context: AudioContext): void {
    const mixBus = context.createGain()
    mixBus.gain.value = 0.82

    const compressor = context.createDynamicsCompressor()
    compressor.threshold.value = -20
    compressor.knee.value = 8
    compressor.ratio.value = 8
    compressor.attack.value = 0.004
    compressor.release.value = 0.16

    // A second, fast compressor behaves as a conservative final limiter.
    const limiter = context.createDynamicsCompressor()
    limiter.threshold.value = -5
    limiter.knee.value = 0
    limiter.ratio.value = 20
    limiter.attack.value = 0.001
    limiter.release.value = 0.075

    const outputGain = context.createGain()
    outputGain.gain.value = 0

    mixBus.connect(compressor)
    compressor.connect(limiter)
    limiter.connect(outputGain)
    outputGain.connect(context.destination)

    this.mixBus = mixBus
    this.outputGain = outputGain
  }

  private startTapeNoise(context: AudioContext): void {
    const mixBus = this.requireMixBus()
    const noiseBuffer = this.requireNoiseBuffer()
    const source = context.createBufferSource()
    const highpass = context.createBiquadFilter()
    const lowpass = context.createBiquadFilter()
    const tapeGain = context.createGain()
    const flutter = context.createOscillator()
    const flutterDepth = context.createGain()

    source.buffer = noiseBuffer
    source.loop = true
    highpass.type = 'highpass'
    highpass.frequency.value = 1_600
    lowpass.type = 'lowpass'
    lowpass.frequency.value = 7_200
    tapeGain.gain.value = 0.009 + this.tempoPressure * 0.014
    flutter.type = 'sine'
    flutter.frequency.value = 0.31
    flutterDepth.gain.value = 0.0025

    source.connect(highpass)
    highpass.connect(lowpass)
    lowpass.connect(tapeGain)
    tapeGain.connect(mixBus)
    flutter.connect(flutterDepth)
    flutterDepth.connect(tapeGain.gain)

    source.start()
    flutter.start()
    this.tapeGain = tapeGain
    this.continuousSources.push(source, flutter)
  }

  private startAmbience(context: AudioContext): void {
    const mixBus = this.requireMixBus()
    const ambienceGain = context.createGain()
    const lowpass = context.createBiquadFilter()
    const fundamental = context.createOscillator()
    const undertone = context.createOscillator()
    const drift = context.createOscillator()
    const driftDepth = context.createGain()

    fundamental.type = 'sine'
    fundamental.frequency.value = 48
    undertone.type = 'triangle'
    undertone.frequency.value = 32
    lowpass.type = 'lowpass'
    lowpass.frequency.value = 118
    lowpass.Q.value = 0.4
    ambienceGain.gain.value = 0.018 + this.tempoPressure * 0.011

    drift.type = 'sine'
    drift.frequency.value = 0.085
    driftDepth.gain.value = 3.5

    fundamental.connect(lowpass)
    undertone.connect(lowpass)
    lowpass.connect(ambienceGain)
    ambienceGain.connect(mixBus)
    drift.connect(driftDepth)
    driftDepth.connect(fundamental.detune)
    driftDepth.connect(undertone.detune)

    fundamental.start()
    undertone.start()
    drift.start()
    this.ambienceGain = ambienceGain
    this.continuousSources.push(fundamental, undertone, drift)
  }

  private startScheduler(): void {
    if (this.schedulerId !== null) return
    this.schedulerId = window.setInterval(() => {
      try {
        this.scheduleAhead()
      } catch (reason) {
        this.recordFailure(reason)
        this.stopScheduler()
        if (this.outputGain && this.context) {
          rampParam(this.outputGain.gain, 0, this.context.currentTime, 0.03)
        }
      }
    }, SCHEDULER_INTERVAL_MS)
  }

  private stopScheduler(): void {
    if (this.schedulerId === null) return
    window.clearInterval(this.schedulerId)
    this.schedulerId = null
  }

  private scheduleAhead(): void {
    const context = this.context
    if (!context || context.state !== 'running') return

    if (this.nextStepTime < context.currentTime - 0.2) {
      this.nextStepTime = context.currentTime + 0.025
    }

    while (this.nextStepTime < context.currentTime + LOOK_AHEAD_SECONDS) {
      this.scheduleStep(this.step, this.nextStepTime)
      this.nextStepTime += this.stepDuration()
      this.step = (this.step + 1) % STEPS_PER_BAR
    }
  }

  private stepDuration(): number {
    const bpm = 82 + this.tempoPressure * 94
    return 60 / bpm / STEPS_PER_BEAT
  }

  private scheduleStep(step: number, time: number): void {
    const pressure = this.tempoPressure

    if (step % 4 === 0) {
      const downbeat = step === 0 ? 0.92 : 0.66
      this.scheduleKick(time, downbeat + pressure * 0.08)
    }
    if (step === 4 || step === 12) {
      this.scheduleSnare(time, 0.52 + pressure * 0.12)
    }
    if (step % 2 === 0 || pressure > 0.5) {
      const accent = step % 4 === 2 ? 0.84 : 0.58
      this.scheduleHat(time, accent * (0.7 + pressure * 0.24))
    }
    if (step === 2 || step === 10 || (pressure > 0.68 && (step === 7 || step === 15))) {
      this.scheduleMechanicalClick(time, 0.45 + pressure * 0.32)
    }
    if (pressure > 0.82 && step === 14) {
      this.scheduleSnare(time, 0.34)
    }
  }

  private scheduleKick(time: number, intensity: number): void {
    const context = this.requireContext()
    const mixBus = this.requireMixBus()
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    const level = 0.2 * clamp(intensity, 0, 1)

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(118, time)
    oscillator.frequency.exponentialRampToValueAtTime(45, time + 0.115)
    gain.gain.setValueAtTime(MIN_GAIN, time)
    gain.gain.linearRampToValueAtTime(level, time + 0.004)
    gain.gain.exponentialRampToValueAtTime(MIN_GAIN, time + 0.19)

    oscillator.connect(gain)
    gain.connect(mixBus)
    oscillator.start(time)
    oscillator.stop(time + 0.205)
  }

  private scheduleSnare(time: number, intensity: number): void {
    const context = this.requireContext()
    const mixBus = this.requireMixBus()
    const source = context.createBufferSource()
    const filter = context.createBiquadFilter()
    const gain = context.createGain()
    const level = 0.105 * clamp(intensity, 0, 1)

    source.buffer = this.requireNoiseBuffer()
    filter.type = 'bandpass'
    filter.frequency.value = 1_850
    filter.Q.value = 0.72
    gain.gain.setValueAtTime(MIN_GAIN, time)
    gain.gain.linearRampToValueAtTime(level, time + 0.002)
    gain.gain.exponentialRampToValueAtTime(MIN_GAIN, time + 0.11)

    source.connect(filter)
    filter.connect(gain)
    gain.connect(mixBus)
    source.start(time, (this.step * 0.137) % this.requireNoiseBuffer().duration)
    source.stop(time + 0.125)
  }

  private scheduleHat(time: number, intensity: number): void {
    const context = this.requireContext()
    const mixBus = this.requireMixBus()
    const source = context.createBufferSource()
    const filter = context.createBiquadFilter()
    const gain = context.createGain()
    const level = 0.038 * clamp(intensity, 0, 1)

    source.buffer = this.requireNoiseBuffer()
    filter.type = 'highpass'
    filter.frequency.value = 5_400
    gain.gain.setValueAtTime(MIN_GAIN, time)
    gain.gain.linearRampToValueAtTime(level, time + 0.0015)
    gain.gain.exponentialRampToValueAtTime(MIN_GAIN, time + 0.038)

    source.connect(filter)
    filter.connect(gain)
    gain.connect(mixBus)
    source.start(time, (this.step * 0.071) % this.requireNoiseBuffer().duration)
    source.stop(time + 0.05)
  }

  private scheduleMechanicalClick(time: number, intensity: number): void {
    const context = this.requireContext()
    const mixBus = this.requireMixBus()
    const oscillator = context.createOscillator()
    const filter = context.createBiquadFilter()
    const gain = context.createGain()
    const level = 0.052 * clamp(intensity, 0, 1)

    oscillator.type = 'square'
    oscillator.frequency.setValueAtTime(1_080, time)
    oscillator.frequency.exponentialRampToValueAtTime(310, time + 0.026)
    filter.type = 'bandpass'
    filter.frequency.value = 1_250
    filter.Q.value = 2.6
    gain.gain.setValueAtTime(MIN_GAIN, time)
    gain.gain.linearRampToValueAtTime(level, time + 0.001)
    gain.gain.exponentialRampToValueAtTime(MIN_GAIN, time + 0.032)

    oscillator.connect(filter)
    filter.connect(gain)
    gain.connect(mixBus)
    oscillator.start(time)
    oscillator.stop(time + 0.04)
  }

  private applyOutputGain(immediate = false): void {
    const context = this.context
    const outputGain = this.outputGain
    if (!context || !outputGain) return

    // Perceptual curve with 0.62 ceiling keeps the summed procedural mix tame.
    const target = this.muted ? 0 : Math.pow(this.volume, 1.65) * 0.62
    if (immediate) {
      outputGain.gain.cancelScheduledValues(context.currentTime)
      outputGain.gain.setValueAtTime(target, context.currentTime)
    } else {
      rampParam(outputGain.gain, target, context.currentTime, 0.035)
    }
  }

  private async teardown(): Promise<void> {
    this.stopScheduler()

    for (const source of this.continuousSources) {
      try {
        source.stop()
      } catch {
        // A source may already have ended during a failed initialization.
      }
      source.disconnect()
    }
    this.continuousSources = []

    const context = this.context
    this.context = null
    this.mixBus = null
    this.outputGain = null
    this.tapeGain = null
    this.ambienceGain = null
    this.noiseBuffer = null
    this.nextStepTime = 0
    this.step = 0

    if (context && context.state !== 'closed') {
      try {
        await context.close()
      } catch (reason) {
        if (!this.failure) this.recordFailure(reason)
      }
    }
  }

  private recordFailure(reason: unknown): AudioEngineError {
    const error =
      reason instanceof AudioEngineError
        ? reason
        : new AudioEngineError('音频引擎初始化失败，作品仍可在静音模式下使用。', reason)
    this.failure = error
    return error
  }

  private requireContext(): AudioContext {
    if (!this.context) throw new AudioEngineError('音频尚未初始化。')
    return this.context
  }

  private requireMixBus(): GainNode {
    if (!this.mixBus) throw new AudioEngineError('音频输出链尚未初始化。')
    return this.mixBus
  }

  private requireNoiseBuffer(): AudioBuffer {
    if (!this.noiseBuffer) throw new AudioEngineError('程序噪声源尚未初始化。')
    return this.noiseBuffer
  }
}

function getAudioContextConstructor(): typeof AudioContext | null {
  const audioGlobal = globalThis as typeof globalThis & {
    webkitAudioContext?: typeof AudioContext
  }
  return audioGlobal.AudioContext ?? audioGlobal.webkitAudioContext ?? null
}

function createNoiseBuffer(context: AudioContext, seconds: number): AudioBuffer {
  const frameCount = Math.max(1, Math.floor(context.sampleRate * seconds))
  const buffer = context.createBuffer(1, frameCount, context.sampleRate)
  const channel = buffer.getChannelData(0)
  let seed = 0x2f6e2b1

  // Fixed-seed noise keeps the sound identity stable across sessions.
  for (let index = 0; index < frameCount; index += 1) {
    seed = (Math.imul(seed, 1_664_525) + 1_013_904_223) >>> 0
    channel[index] = (seed / 0xffff_ffff) * 2 - 1
  }
  return buffer
}

function rampParam(param: AudioParam, target: number, now: number, seconds: number): void {
  param.cancelScheduledValues(now)
  param.setValueAtTime(param.value, now)
  param.linearRampToValueAtTime(target, now + seconds)
}

function clamp(value: number, minimum: number, maximum: number): number {
  if (!Number.isFinite(value)) return minimum
  return Math.min(maximum, Math.max(minimum, value))
}

export const audioEngine = new CutFeverAudioEngine()

export const start = (): Promise<void> => audioEngine.start()
export const setMuted = (muted: boolean): void => audioEngine.setMuted(muted)
export const setVolume = (volume: number): void => audioEngine.setVolume(volume)
export const setTempoPressure = (pressure: number): void => audioEngine.setTempoPressure(pressure)
export const hit = (intensity?: number): boolean => audioEngine.hit(intensity)
export const stop = (): Promise<void> => audioEngine.stop()

export default audioEngine
