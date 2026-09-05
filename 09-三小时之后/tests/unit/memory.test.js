import { describe, expect, it } from "vitest";
import {
  addMark,
  createEmptyMemory,
  loadMemory,
  sanitizeMemory,
  saveMemory,
} from "../../src/core/memory.js";

function createStorage(seed = {}) {
  const values = new Map(Object.entries(seed));
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
}

describe("memory normalization", () => {
  it("returns a private, bounded empty record for malformed input", () => {
    expect(sanitizeMemory(null)).toEqual(createEmptyMemory());
    expect(
      sanitizeMemory({
        version: 99,
        secondsSeen: -20,
        visits: "many",
        lastAct: "unknown",
        totalGestures: Infinity,
        marks: "bad",
      }),
    ).toEqual(createEmptyMemory());
  });

  it("clamps values and keeps only the newest 240 valid marks", () => {
    const marks = Array.from({ length: 260 }, (_, index) => ({
      x: index / 100,
      y: -index,
      force: 2,
      t: index,
    }));
    const result = sanitizeMemory({
      version: 1,
      secondsSeen: 999_999_999,
      visits: 4.9,
      lastAct: "leave",
      totalGestures: 260,
      marks,
    });

    expect(result.marks).toHaveLength(240);
    expect(result.marks[0]).toEqual({ x: 0.2, y: 0, force: 1, t: 20 });
    expect(result.marks.at(-1)).toEqual({ x: 1, y: 0, force: 1, t: 259 });
    expect(result.visits).toBe(4);
    expect(result.secondsSeen).toBe(315_576_000);
  });

  it("filters invalid marks and repairs optional fields on a versioned record", () => {
    const result = sanitizeMemory({
      version: 1,
      secondsSeen: Number.NaN,
      visits: 2,
      lastAct: "elsewhere",
      totalGestures: 3,
      marks: [null, { x: "bad", y: 0, force: 0.2, t: 1 }],
    });
    expect(result).toMatchObject({ secondsSeen: 0, lastAct: "hold", marks: [] });
    expect(sanitizeMemory({ version: 1, marks: null }).marks).toEqual([]);
  });
});

describe("memory storage", () => {
  it("recovers from corrupted local data without throwing", () => {
    const storage = createStorage({ witness: "{not json" });
    expect(loadMemory(storage, "witness")).toEqual(createEmptyMemory());
    expect(loadMemory(createStorage(), "missing")).toEqual(createEmptyMemory());
  });

  it("round-trips a mark while incrementing the gesture count", () => {
    const storage = createStorage();
    const marked = addMark(createEmptyMemory(), { x: 0.25, y: 0.75, force: 0.5, t: 12.34 });
    expect(marked.totalGestures).toBe(1);
    expect(marked.marks).toEqual([{ x: 0.25, y: 0.75, force: 0.5, t: 12.34 }]);
    expect(saveMemory(storage, "witness", marked)).toBe(true);
    expect(loadMemory(storage, "witness")).toEqual(marked);
  });

  it("reports storage refusal without breaking the artwork", () => {
    const storage = { getItem: () => null, setItem: () => { throw new Error("blocked"); } };
    expect(saveMemory(storage, "witness", createEmptyMemory())).toBe(false);
    expect(saveMemory(null, "witness", createEmptyMemory())).toBe(false);
  });

  it("ignores an invalid mark without mutating the safe record", () => {
    const memory = createEmptyMemory();
    expect(addMark(memory, null)).toEqual(memory);
  });
});
