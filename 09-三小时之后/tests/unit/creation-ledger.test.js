import { describe, expect, it } from "vitest";
import {
  calculateCreationState,
  formatDuration,
  normalizeMilestones,
} from "../../src/core/creation-ledger.js";

const ledger = {
  startedAt: "2026-08-20T19:32:52+08:00",
  targetMinutes: 180,
  milestones: [
    { at: "2026-08-20T20:02:52+08:00", label: "field" },
    { at: "invalid", label: "discard" },
    { at: "2026-08-20T19:42:52+08:00", label: "concept" },
  ],
};

describe("creation ledger", () => {
  it("calculates honest elapsed progress without exceeding the target", () => {
    expect(calculateCreationState(ledger, new Date("2026-08-20T20:02:52+08:00"))).toMatchObject({
      elapsedSeconds: 1800,
      elapsedMinutes: 30,
      remainingSeconds: 9000,
      ratio: 1 / 6,
      complete: false,
    });
    expect(calculateCreationState(ledger, new Date("2026-08-20T23:00:00+08:00"))).toMatchObject({
      elapsedSeconds: 10800,
      elapsedMinutes: 180,
      remainingSeconds: 0,
      ratio: 1,
      complete: true,
    });
  });

  it("sorts milestones and discards invalid entries", () => {
    expect(normalizeMilestones(ledger.milestones).map((entry) => entry.label)).toEqual([
      "concept",
      "field",
    ]);
    expect(normalizeMilestones(null)).toEqual([]);
    expect(normalizeMilestones([{ at: ledger.startedAt, label: null, detail: 4 }])).toEqual([]);
  });

  it("formats durations as a stable local readout", () => {
    expect(formatDuration(0)).toBe("00:00:00");
    expect(formatDuration(3723.9)).toBe("01:02:03");
    expect(formatDuration(-1)).toBe("00:00:00");
  });

  it("falls back safely when ledger dates and targets are malformed", () => {
    const state = calculateCreationState(
      { startedAt: "bad", targetMinutes: 0 },
      "also bad",
    );
    expect(state.startedAt.getTime()).toBe(0);
    expect(state.targetMinutes).toBe(180);
    expect(state.elapsedSeconds).toBe(0);
  });
});
