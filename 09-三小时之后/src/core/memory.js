const MEMORY_VERSION = 1;
const MAX_MARKS = 240;
const MAX_SECONDS = 315_576_000;
const ACTS = new Set(["hold", "drift", "leave"]);

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, Number.isFinite(value) ? value : minimum));
}

export function createEmptyMemory() {
  return {
    version: MEMORY_VERSION,
    secondsSeen: 0,
    visits: 0,
    lastAct: "hold",
    totalGestures: 0,
    marks: [],
  };
}

function sanitizeMark(mark) {
  if (!mark || typeof mark !== "object") return null;
  const x = Number(mark.x);
  const y = Number(mark.y);
  const force = Number(mark.force);
  const t = Number(mark.t);
  if (![x, y, force, t].every(Number.isFinite)) return null;
  return {
    x: Number(clamp(x, 0, 1).toFixed(4)),
    y: Number(clamp(y, 0, 1).toFixed(4)),
    force: Number(clamp(force, 0, 1).toFixed(3)),
    t: Number(Math.max(0, t).toFixed(2)),
  };
}

export function sanitizeMemory(input) {
  if (!input || typeof input !== "object" || input.version !== MEMORY_VERSION) {
    return createEmptyMemory();
  }

  const marks = (Array.isArray(input.marks) ? input.marks : [])
    .map(sanitizeMark)
    .filter(Boolean)
    .slice(-MAX_MARKS);

  return {
    version: MEMORY_VERSION,
    secondsSeen: Math.floor(clamp(Number(input.secondsSeen), 0, MAX_SECONDS)),
    visits: Math.floor(clamp(Number(input.visits), 0, 1_000_000)),
    lastAct: ACTS.has(input.lastAct) ? input.lastAct : "hold",
    totalGestures: Math.floor(clamp(Number(input.totalGestures), 0, 1_000_000_000)),
    marks,
  };
}

export function addMark(memory, mark) {
  const safeMemory = sanitizeMemory(memory);
  const safeMark = sanitizeMark(mark);
  if (!safeMark) return safeMemory;
  return {
    ...safeMemory,
    totalGestures: Math.min(1_000_000_000, safeMemory.totalGestures + 1),
    marks: [...safeMemory.marks, safeMark].slice(-MAX_MARKS),
  };
}

export function loadMemory(storage, key) {
  try {
    const raw = storage?.getItem?.(key);
    return raw ? sanitizeMemory(JSON.parse(raw)) : createEmptyMemory();
  } catch {
    return createEmptyMemory();
  }
}

export function saveMemory(storage, key, memory) {
  try {
    if (!storage || typeof storage.setItem !== "function") return false;
    storage.setItem(key, JSON.stringify(sanitizeMemory(memory)));
    return true;
  } catch {
    return false;
  }
}

export { MAX_MARKS, MEMORY_VERSION };
