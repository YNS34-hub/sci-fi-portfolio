const MINUTE_COUNT = 180;

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, Number.isFinite(value) ? value : minimum));
}

function hashString(value) {
  let hash = 2166136261;
  for (const character of String(value)) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seededUnit(seed, index, salt) {
  let value = hashString(`${seed}:${index}:${salt}`) || 1;
  value ^= value << 13;
  value ^= value >>> 17;
  value ^= value << 5;
  return (value >>> 0) / 4294967295;
}

export function createMinuteLayers(seed = "after-three-hours", requestedCount = MINUTE_COUNT) {
  const count = Math.round(clamp(requestedCount, 1, 720));
  return Array.from({ length: count }, (_, index) => ({
    index,
    minute: index + 1,
    phase: seededUnit(seed, index, "phase"),
    grain: seededUnit(seed, index, "grain"),
    bias: seededUnit(seed, index, "bias") * 2 - 1,
    amplitude: 0.55 + seededUnit(seed, index, "amplitude") * 0.9,
  }));
}

export function mapPointerToImpulse({ x = 0, y = 0, width = 0, height = 0, pressure = 0 } = {}) {
  const normalizedX = width > 0 ? clamp(x / width, 0, 1) : 0;
  const normalizedY = height > 0 ? clamp(y / height, 0, 1) : 0;
  const normalizedPressure = clamp(pressure, 0, 1);

  return {
    x: Number(normalizedX.toFixed(4)),
    y: Number(normalizedY.toFixed(4)),
    minuteIndex: Math.round(normalizedY * (MINUTE_COUNT - 1)),
    radius: Math.round(6 + normalizedPressure * 14),
    energy: Number((0.2 + normalizedPressure * 0.8).toFixed(3)),
  };
}

export function sampleLayerDisplacement(
  layer,
  normalizedX,
  elapsedSeconds,
  impulses = [],
  act = "hold",
  reducedMotion = false,
) {
  const x = clamp(normalizedX, 0, 1);
  const time = Number.isFinite(elapsedSeconds) ? elapsedSeconds : 0;
  const phase = layer?.phase ?? 0;
  const grain = layer?.grain ?? 0.5;
  const bias = layer?.bias ?? 0;
  const amplitude = layer?.amplitude ?? 1;
  const index = layer?.index ?? 0;

  const actGain = act === "drift" ? 1.5 : act === "leave" ? 0.92 : 0.64;
  const tempo = act === "drift" ? 0.58 : act === "leave" ? 0.22 : 0.34;
  const spatial = Math.sin(x * Math.PI * (1.7 + grain) + phase * Math.PI * 2);
  const temporal = Math.sin(time * tempo + phase * 8.2 + index * 0.021);
  let displacement = spatial * temporal * amplitude * actGain + bias * 0.16;

  for (const impulse of Array.isArray(impulses) ? impulses : []) {
    const distance = Math.abs(index - clamp(impulse.minuteIndex, 0, MINUTE_COUNT - 1));
    const radius = clamp(impulse.radius, 1, 60);
    if (distance > radius) continue;
    const verticalFalloff = Math.pow(1 - distance / radius, 2);
    const horizontalDistance = x - clamp(impulse.x, 0, 1);
    const horizontalFalloff = Math.exp(-Math.pow(horizontalDistance * 5.5, 2));
    const direction = act === "drift" ? Math.sin(horizontalDistance * Math.PI) : horizontalDistance;
    const press = (0.35 + clamp(impulse.energy, 0, 1) * 2.1) * verticalFalloff * horizontalFalloff;
    displacement += (direction * 18 + (act === "leave" ? temporal * 1.7 : 0)) * press;
  }

  return displacement * (reducedMotion ? 0.16 : 1);
}

export function buildFieldSignature(marks = []) {
  const normalized = (Array.isArray(marks) ? marks : [])
    .slice(-240)
    .map((mark) => [
      clamp(mark.x, 0, 1).toFixed(3),
      clamp(mark.y, 0, 1).toFixed(3),
      clamp(mark.force, 0, 1).toFixed(2),
      Math.max(0, Number(mark.t) || 0).toFixed(2),
    ].join(":"))
    .join("|");
  const hash = hashString(normalized).toString(36).padStart(7, "0");
  const count = String(Math.min(240, Array.isArray(marks) ? marks.length : 0)).padStart(4, "0");
  return `${count}-${hash}`;
}

export { MINUTE_COUNT };
