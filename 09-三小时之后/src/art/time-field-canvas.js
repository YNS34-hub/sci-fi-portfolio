import {
  createMinuteLayers,
  mapPointerToImpulse,
  sampleLayerDisplacement,
} from "../core/time-field.js";

const COLORS = {
  paper: "#e7e9e4",
  ink: [24, 32, 34],
  mist: [104, 117, 114],
  blue: [49, 93, 112],
};

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

function rgba([red, green, blue], alpha) {
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function calculateFieldBounds(width, height) {
  const landscape = width >= 760;
  return {
    left: landscape ? Math.max(118, width * 0.16) : 26,
    right: landscape ? width - Math.max(118, width * 0.12) : width - 24,
    top: landscape ? Math.max(104, height * 0.13) : 92,
    bottom: landscape ? height - Math.max(118, height * 0.15) : height - 154,
  };
}

export class TimeFieldCanvas {
  constructor(canvas) {
    this.canvas = canvas;
    this.context = canvas.getContext("2d", { alpha: false, desynchronized: true });
    this.layers = createMinuteLayers("after-three-hours:2026-08-20", 180);
    this.state = {
      act: "hold",
      marks: [],
      pointer: null,
      reducedMotion: false,
      entered: false,
    };
    this.size = { width: 0, height: 0, dpr: 1 };
    this.startedAt = performance.now();
    this.dirty = true;
    this.frame = null;
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(canvas);
    this.resize();
    this.loop = this.loop.bind(this);
    this.frame = requestAnimationFrame(this.loop);
  }

  resize() {
    const bounds = this.canvas.getBoundingClientRect();
    const width = Math.max(1, Math.round(bounds.width));
    const height = Math.max(1, Math.round(bounds.height));
    const dpr = clamp(window.devicePixelRatio || 1, 1, 2);
    if (width === this.size.width && height === this.size.height && dpr === this.size.dpr) return;
    this.size = { width, height, dpr };
    this.canvas.width = Math.round(width * dpr);
    this.canvas.height = Math.round(height * dpr);
    this.dirty = true;
  }

  setState(nextState) {
    this.state = { ...this.state, ...nextState };
    this.dirty = true;
  }

  pointerFromEvent(event) {
    const bounds = this.canvas.getBoundingClientRect();
    const field = calculateFieldBounds(bounds.width, bounds.height);
    return mapPointerToImpulse({
      x: event.clientX - bounds.left - field.left,
      y: event.clientY - bounds.top - field.top,
      width: field.right - field.left,
      height: field.bottom - field.top,
      pressure: event.pressure || (event.buttons ? 0.62 : 0.08),
    });
  }

  loop(timestamp) {
    if (!this.state.reducedMotion || this.dirty) {
      this.draw((timestamp - this.startedAt) / 1000);
      this.dirty = false;
    }
    this.frame = requestAnimationFrame(this.loop);
  }

  draw(elapsedSeconds) {
    const { context: ctx } = this;
    const { width, height, dpr } = this.size;
    if (!ctx || width <= 1 || height <= 1) return;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = COLORS.paper;
    ctx.fillRect(0, 0, width, height);

    const landscape = width >= 760;
    const field = calculateFieldBounds(width, height);
    const fieldWidth = Math.max(1, field.right - field.left);
    const fieldHeight = Math.max(1, field.bottom - field.top);

    const storedImpulses = this.state.marks.slice(-90).map((mark) => ({
      x: mark.x,
      y: mark.y,
      minuteIndex: Math.round(mark.y * 179),
      radius: 5 + mark.force * 14,
      energy: 0.18 + mark.force * 0.58,
    }));
    const impulses = this.state.pointer
      ? [...storedImpulses, this.state.pointer]
      : storedImpulses;
    const segmentCount = landscape ? 52 : 32;

    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    for (const layer of this.layers) {
      const ratio = layer.index / (this.layers.length - 1);
      const baseY = field.top + ratio * fieldHeight;
      const major = layer.minute === 1 || layer.minute === 180 || layer.minute % 30 === 0;
      const actAlpha = this.state.act === "leave" ? 0.17 : this.state.act === "drift" ? 0.14 : 0.12;
      ctx.beginPath();
      for (let segment = 0; segment <= segmentCount; segment += 1) {
        const normalizedX = segment / segmentCount;
        const x = field.left + normalizedX * fieldWidth;
        const displacement = sampleLayerDisplacement(
          layer,
          normalizedX,
          elapsedSeconds,
          impulses,
          this.state.act,
          this.state.reducedMotion,
        );
        const y = baseY + displacement;
        if (segment === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = rgba(major ? COLORS.blue : COLORS.ink, major ? 0.42 : actAlpha + layer.grain * 0.07);
      ctx.lineWidth = major ? 1.05 : 0.58 + layer.grain * 0.34;
      ctx.stroke();
    }

    ctx.font = "9px Cascadia Mono, Consolas, monospace";
    ctx.textBaseline = "middle";
    ctx.fillStyle = rgba(COLORS.mist, 0.74);
    ctx.strokeStyle = rgba(COLORS.ink, 0.32);
    ctx.lineWidth = 1;
    for (const minute of [1, 30, 60, 90, 120, 150, 180]) {
      const ratio = (minute - 1) / 179;
      const y = field.top + ratio * fieldHeight;
      ctx.beginPath();
      ctx.moveTo(field.left - 8, y);
      ctx.lineTo(field.left - 2, y);
      ctx.stroke();
      if (minute !== 1 && minute !== 180 && landscape) {
        ctx.fillText(String(minute).padStart(3, "0"), field.left - 38, y);
      }
    }

    const nowTime = this.state.reducedMotion ? 0.5 : (elapsedSeconds % 180) / 180;
    const nowX = field.left + nowTime * fieldWidth;
    ctx.strokeStyle = rgba(COLORS.blue, this.state.entered ? 0.92 : 0.55);
    ctx.lineWidth = 1.25;
    ctx.beginPath();
    ctx.moveTo(nowX, field.top - 12);
    ctx.lineTo(nowX, field.bottom + 12);
    ctx.stroke();
    ctx.fillStyle = rgba(COLORS.blue, 0.92);
    ctx.font = "8px Cascadia Mono, Consolas, monospace";
    ctx.fillText("NOW", clamp(nowX + 6, field.left, field.right - 24), field.top - 18);

    if (this.state.act === "leave" || this.state.marks.length > 0) {
      for (const [index, mark] of this.state.marks.slice(-120).entries()) {
        const x = field.left + mark.x * fieldWidth;
        const y = field.top + mark.y * fieldHeight;
        const alpha = this.state.act === "leave" ? 0.25 + mark.force * 0.48 : 0.09 + mark.force * 0.12;
        ctx.strokeStyle = rgba(COLORS.blue, alpha);
        ctx.lineWidth = 0.55 + mark.force * 0.8;
        ctx.beginPath();
        ctx.moveTo(x, y - 2 - mark.force * 5);
        ctx.lineTo(x + Math.sin(index * 1.7) * 2, y + 3 + mark.force * 8);
        ctx.stroke();
      }
    }

    if (this.state.pointer && this.state.entered) {
      const x = field.left + this.state.pointer.x * fieldWidth;
      const y = field.top + this.state.pointer.y * fieldHeight;
      const radius = 7 + this.state.pointer.energy * 10;
      ctx.strokeStyle = rgba(COLORS.blue, 0.55);
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x - radius - 5, y);
      ctx.lineTo(x - radius + 1, y);
      ctx.moveTo(x + radius - 1, y);
      ctx.lineTo(x + radius + 5, y);
      ctx.stroke();
    }
  }

  destroy() {
    if (this.frame) cancelAnimationFrame(this.frame);
    this.resizeObserver.disconnect();
  }
}
