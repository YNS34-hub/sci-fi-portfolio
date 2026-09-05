import { describe, expect, it } from "vitest";
import {
  buildFieldSignature,
  createMinuteLayers,
  mapPointerToImpulse,
  sampleLayerDisplacement,
} from "../../src/core/time-field.js";

describe("createMinuteLayers", () => {
  it("creates exactly 180 deterministic minute fibres", () => {
    const first = createMinuteLayers("after-three-hours", 180);
    const second = createMinuteLayers("after-three-hours", 180);

    expect(first).toHaveLength(180);
    expect(second).toEqual(first);
    expect(first[0]).toMatchObject({ index: 0, minute: 1 });
    expect(first[179]).toMatchObject({ index: 179, minute: 180 });
    expect(first.every((layer) => layer.phase >= 0 && layer.phase <= 1)).toBe(true);
  });

  it("clamps unsafe counts to a bounded field", () => {
    expect(createMinuteLayers("x", 0)).toHaveLength(1);
    expect(createMinuteLayers("x", 9999)).toHaveLength(720);
  });
});

describe("mapPointerToImpulse", () => {
  it("maps pressure and position into a bounded minute impulse", () => {
    expect(
      mapPointerToImpulse({ x: 500, y: 250, width: 1000, height: 500, pressure: 0.5 }),
    ).toEqual({ x: 0.5, y: 0.5, minuteIndex: 90, radius: 13, energy: 0.6 });
  });

  it("stays safe for invalid dimensions and out-of-range input", () => {
    expect(mapPointerToImpulse({ x: -4, y: 9, width: 0, height: -1, pressure: 9 })).toEqual({
      x: 0,
      y: 0,
      minuteIndex: 0,
      radius: 20,
      energy: 1,
    });
  });
});

describe("sampleLayerDisplacement", () => {
  const layer = createMinuteLayers("sample", 180)[70];
  const impulse = { x: 0.5, y: 70 / 179, minuteIndex: 70, radius: 16, energy: 0.8 };

  it("gives the three acts distinct physical responses", () => {
    const hold = sampleLayerDisplacement(layer, 0.5, 1.2, [impulse], "hold", false);
    const drift = sampleLayerDisplacement(layer, 0.5, 1.2, [impulse], "drift", false);
    const leave = sampleLayerDisplacement(layer, 0.5, 1.2, [impulse], "leave", false);

    expect(hold).not.toBe(drift);
    expect(drift).not.toBe(leave);
    expect([hold, drift, leave].every(Number.isFinite)).toBe(true);
  });

  it("substantially quiets movement when reduced motion is requested", () => {
    const full = sampleLayerDisplacement(layer, 0.5, 1.2, [impulse], "drift", false);
    const reduced = sampleLayerDisplacement(layer, 0.5, 1.2, [impulse], "drift", true);
    expect(Math.abs(reduced)).toBeLessThan(Math.abs(full) * 0.5);
  });

  it("handles missing layers, invalid time, non-array impulses, and distant pressure", () => {
    const safe = sampleLayerDisplacement(null, Number.NaN, Number.NaN, null, "hold", false);
    const distant = sampleLayerDisplacement(
      layer,
      0.1,
      2,
      [{ x: 0.9, minuteIndex: 179, radius: 1, energy: 1 }],
      "hold",
      false,
    );
    expect(safe).toBeTypeOf("number");
    expect(distant).toBeTypeOf("number");
  });
});

describe("buildFieldSignature", () => {
  it("is stable for the same bounded set of marks", () => {
    const marks = [
      { x: 0.2, y: 0.4, force: 0.3, t: 2 },
      { x: 0.7, y: 0.6, force: 0.8, t: 4 },
    ];
    expect(buildFieldSignature(marks)).toBe(buildFieldSignature([...marks]));
    expect(buildFieldSignature(marks)).not.toBe(buildFieldSignature(marks.slice(0, 1)));
    expect(buildFieldSignature([])).toMatch(/^0000-/);
    expect(buildFieldSignature(null)).toMatch(/^0000-/);
    expect(buildFieldSignature([{ x: 0, y: 0, force: 0, t: Number.NaN }])).toMatch(/^0001-/);
  });
});
