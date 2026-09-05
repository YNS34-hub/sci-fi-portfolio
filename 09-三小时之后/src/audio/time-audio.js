export class TimeAudio {
  constructor() {
    this.context = null;
    this.master = null;
    this.filter = null;
    this.oscillators = [];
    this.noise = null;
    this.enabled = false;
  }

  initialize() {
    if (this.context) return true;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return false;

    try {
      this.context = new AudioContext();
      this.master = this.context.createGain();
      this.master.gain.value = 0;
      this.filter = this.context.createBiquadFilter();
      this.filter.type = "lowpass";
      this.filter.frequency.value = 430;
      this.filter.Q.value = 0.7;
      this.filter.connect(this.master);
      this.master.connect(this.context.destination);

      const frequencies = [43.65, 65.41];
      this.oscillators = frequencies.map((frequency, index) => {
        const oscillator = this.context.createOscillator();
        const gain = this.context.createGain();
        oscillator.type = index === 0 ? "sine" : "triangle";
        oscillator.frequency.value = frequency;
        gain.gain.value = index === 0 ? 0.62 : 0.09;
        oscillator.connect(gain);
        gain.connect(this.filter);
        oscillator.start();
        return { oscillator, gain };
      });

      const buffer = this.context.createBuffer(1, this.context.sampleRate * 2, this.context.sampleRate);
      const channel = buffer.getChannelData(0);
      let last = 0;
      for (let index = 0; index < channel.length; index += 1) {
        const white = Math.random() * 2 - 1;
        last = last * 0.985 + white * 0.015;
        channel[index] = last * 0.16;
      }
      const noise = this.context.createBufferSource();
      const noiseGain = this.context.createGain();
      noise.buffer = buffer;
      noise.loop = true;
      noiseGain.gain.value = 0.035;
      noise.connect(noiseGain);
      noiseGain.connect(this.filter);
      noise.start();
      this.noise = { source: noise, gain: noiseGain };
      return true;
    } catch {
      this.context = null;
      return false;
    }
  }

  async setEnabled(nextEnabled) {
    if (nextEnabled && !this.initialize()) return false;
    if (!this.context || !this.master) return false;
    try {
      if (nextEnabled && this.context.state === "suspended") await this.context.resume();
      const now = this.context.currentTime;
      this.master.gain.cancelScheduledValues(now);
      this.master.gain.setValueAtTime(this.master.gain.value, now);
      this.master.gain.linearRampToValueAtTime(nextEnabled ? 0.055 : 0, now + 0.7);
      this.enabled = nextEnabled;
      return this.enabled;
    } catch {
      this.enabled = false;
      return false;
    }
  }

  update({ act = "hold", pointerEnergy = 0, markCount = 0 } = {}) {
    if (!this.context || !this.filter || !this.oscillators.length) return;
    const now = this.context.currentTime;
    const actFrequency = act === "drift" ? 520 : act === "leave" ? 320 : 420;
    const energy = Math.max(0, Math.min(1, pointerEnergy));
    this.filter.frequency.setTargetAtTime(actFrequency + energy * 780, now, 0.12);
    this.oscillators[0].oscillator.detune.setTargetAtTime((markCount % 17) * 0.7, now, 0.8);
    this.oscillators[1].oscillator.detune.setTargetAtTime(act === "drift" ? 7 : act === "leave" ? -5 : 0, now, 0.4);
  }
}
