type BrowserAudioContext = typeof AudioContext

declare global {
  interface Window {
    webkitAudioContext?: BrowserAudioContext
  }
}

export class Soundscape {
  private context: AudioContext | null = null
  private master: GainNode | null = null
  private waterFilter: BiquadFilterNode | null = null
  private waterGain: GainNode | null = null
  private droneGain: GainNode | null = null
  private sources: AudioScheduledSourceNode[] = []
  private dropTimer: number | null = null
  private muted = false
  private disposed = false

  async start(): Promise<boolean> {
    if (this.disposed) return false
    if (this.context) {
      try {
        if (this.context.state === 'suspended') await this.context.resume()
        return this.context.state === 'running'
      } catch {
        return false
      }
    }

    const Context = window.AudioContext ?? window.webkitAudioContext
    if (!Context) return false

    try {
      const context = new Context()
      const master = context.createGain()
      master.gain.value = 0.0001
      master.connect(context.destination)

      const waterFilter = context.createBiquadFilter()
      waterFilter.type = 'lowpass'
      waterFilter.frequency.value = 520
      waterFilter.Q.value = 0.8

      const waterGain = context.createGain()
      waterGain.gain.value = 0.035
      waterFilter.connect(waterGain).connect(master)

      const noiseBuffer = context.createBuffer(1, context.sampleRate * 6, context.sampleRate)
      const noiseData = noiseBuffer.getChannelData(0)
      let brown = 0
      for (let i = 0; i < noiseData.length; i += 1) {
        const white = Math.random() * 2 - 1
        brown = (brown + 0.018 * white) / 1.018
        noiseData[i] = brown * 2.7
      }
      const noise = context.createBufferSource()
      noise.buffer = noiseBuffer
      noise.loop = true
      noise.connect(waterFilter)
      noise.start()
      this.sources.push(noise)

      const droneFilter = context.createBiquadFilter()
      droneFilter.type = 'lowpass'
      droneFilter.frequency.value = 180
      const droneGain = context.createGain()
      droneGain.gain.value = 0.0001
      droneFilter.connect(droneGain).connect(master)

      ;[43.65, 65.41, 98].forEach((frequency, index) => {
        const oscillator = context.createOscillator()
        const gain = context.createGain()
        oscillator.type = index === 0 ? 'sine' : 'triangle'
        oscillator.frequency.value = frequency
        oscillator.detune.value = index === 2 ? -7 : index * 4
        gain.gain.value = index === 0 ? 0.025 : 0.008
        oscillator.connect(gain).connect(droneFilter)
        oscillator.start()
        this.sources.push(oscillator)
      })

      this.context = context
      this.master = master
      this.waterFilter = waterFilter
      this.waterGain = waterGain
      this.droneGain = droneGain
      if (context.state === 'suspended') await context.resume()
      if (context.state !== 'running') throw new Error('Audio context did not enter the running state.')
      master.gain.exponentialRampToValueAtTime(this.muted ? 0.0001 : 0.38, context.currentTime + 2.8)
      droneGain.gain.exponentialRampToValueAtTime(0.75, context.currentTime + 6)
      this.scheduleDrop()
      return true
    } catch {
      this.stop()
      return false
    }
  }

  setMuted(muted: boolean): void {
    this.muted = muted
    if (!this.context || !this.master) return
    const now = this.context.currentTime
    this.master.gain.cancelScheduledValues(now)
    this.master.gain.setTargetAtTime(muted ? 0.0001 : 0.38, now, 0.08)
  }

  update(depth: number, energy: number, coherence: number): void {
    if (!this.context || !this.waterFilter || !this.waterGain || !this.droneGain) return
    const now = this.context.currentTime
    const cutoff = 720 - depth * 510 + Math.min(energy * 1300, 180)
    this.waterFilter.frequency.cancelScheduledValues(now)
    this.waterGain.gain.cancelScheduledValues(now)
    this.droneGain.gain.cancelScheduledValues(now)
    this.waterFilter.frequency.setTargetAtTime(cutoff, now, 0.3)
    this.waterGain.gain.setTargetAtTime(0.025 + depth * 0.045 + energy * 0.03, now, 0.35)
    this.droneGain.gain.setTargetAtTime(0.45 + depth * 0.55 - coherence * 0.2, now, 0.5)
  }

  breathGap(durationMs = 620): void {
    if (!this.context || !this.master) return
    const now = this.context.currentTime
    const returnAt = now + Math.max(0.18, durationMs / 1000)
    this.master.gain.cancelScheduledValues(now)
    this.master.gain.setTargetAtTime(0.002, now, 0.035)
    this.master.gain.setTargetAtTime(this.muted ? 0.0001 : 0.38, returnAt, 0.16)
  }

  triggerDrop(position = 0.5): void {
    if (!this.context || !this.master || this.muted) return
    const context = this.context
    const now = context.currentTime
    const pan = context.createStereoPanner()
    const filter = context.createBiquadFilter()
    const gain = context.createGain()
    const oscillator = context.createOscillator()

    pan.pan.value = Math.max(-0.72, Math.min(0.72, position * 1.44 - 0.72))
    filter.type = 'bandpass'
    filter.frequency.value = 730 + Math.random() * 520
    filter.Q.value = 5
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(620 + Math.random() * 240, now)
    oscillator.frequency.exponentialRampToValueAtTime(165, now + 0.8)
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(0.06, now + 0.018)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.15)

    oscillator.connect(filter).connect(gain).connect(pan).connect(this.master)
    oscillator.addEventListener('ended', () => {
      oscillator.disconnect()
      filter.disconnect()
      gain.disconnect()
      pan.disconnect()
    }, { once: true })
    oscillator.start(now)
    oscillator.stop(now + 1.2)
  }

  private scheduleDrop(): void {
    if (this.disposed) return
    const delay = 4200 + Math.random() * 6200
    this.dropTimer = window.setTimeout(() => {
      this.triggerDrop(Math.random())
      this.scheduleDrop()
    }, delay)
  }

  stop(): void {
    this.disposed = true
    if (this.dropTimer !== null) window.clearTimeout(this.dropTimer)
    this.dropTimer = null
    this.sources.forEach((source) => {
      try {
        source.stop()
      } catch {
        // The source may already have ended.
      }
    })
    this.sources = []
    if (this.context && this.context.state !== 'closed') void this.context.close()
    this.context = null
    this.master = null
    this.waterFilter = null
    this.waterGain = null
    this.droneGain = null
  }
}
