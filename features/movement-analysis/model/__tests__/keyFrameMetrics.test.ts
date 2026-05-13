import { computeFrameAMetrics, computeFrameBMetrics } from "../keyFrameMetrics";
import type { RawFrame } from "../types";

function lm33(overrides: Record<number, { x: number; y: number }> = {}): { x: number; y: number }[] {
  const lm = Array.from({ length: 33 }, () => ({ x: 0.5, y: 0.5 }));
  for (const [i, v] of Object.entries(overrides)) lm[Number(i)] = v;
  return lm;
}

function makeFrame(overrides: Record<number, { x: number; y: number }> = {}): RawFrame {
  return { timeMs: 0, frameIndex: 0, landmarks: lm33(overrides) };
}

describe("computeFrameAMetrics", () => {
  it("shoulderHipAngleDeg, liftoffAngleDeg, angleDeltaDeg를 반환한다", () => {
    const vertical = { 11: { x: 0.5, y: 0.2 }, 12: { x: 0.5, y: 0.2 }, 23: { x: 0.5, y: 0.5 }, 24: { x: 0.5, y: 0.5 } };
    const frame = makeFrame(vertical);
    const liftoff = makeFrame(vertical);
    const result = computeFrameAMetrics(frame, liftoff);
    expect(result.angleDeltaDeg).toBeCloseTo(0, 1);
    expect(typeof result.shoulderHipAngleDeg).toBe("number");
    expect(typeof result.liftoffAngleDeg).toBe("number");
  });

  it("Frame A와 liftoff의 각도 차이를 정확히 계산한다", () => {
    const liftoff = makeFrame({ 11: { x: 0.5, y: 0.2 }, 12: { x: 0.5, y: 0.2 }, 23: { x: 0.5, y: 0.5 }, 24: { x: 0.5, y: 0.5 } });
    const frameA = makeFrame({ 11: { x: 0.4, y: 0.3 }, 12: { x: 0.4, y: 0.3 }, 23: { x: 0.5, y: 0.5 }, 24: { x: 0.5, y: 0.5 } });
    const result = computeFrameAMetrics(frameA, liftoff);
    expect(result.angleDeltaDeg).not.toBeCloseTo(0, 0);
  });
});

describe("computeFrameBMetrics", () => {
  it("발목-고관절-어깨가 일직선이면 isGood이 true이다", () => {
    const frame = makeFrame({
      11: { x: 0.5, y: 0.1 }, 12: { x: 0.5, y: 0.1 },
      23: { x: 0.5, y: 0.5 }, 24: { x: 0.5, y: 0.5 },
      27: { x: 0.5, y: 0.9 }, 28: { x: 0.5, y: 0.9 },
    });
    const result = computeFrameBMetrics(frame);
    expect(result.trunkVerticalityDeg).toBeGreaterThan(150);
    expect(result.isGood).toBe(true);
  });

  it("어깨가 옆으로 무너지면 isGood이 false이다", () => {
    const frame = makeFrame({
      11: { x: 0.1, y: 0.5 }, 12: { x: 0.1, y: 0.5 },
      23: { x: 0.5, y: 0.5 }, 24: { x: 0.5, y: 0.5 },
      27: { x: 0.5, y: 0.9 }, 28: { x: 0.5, y: 0.9 },
    });
    const result = computeFrameBMetrics(frame);
    expect(result.isGood).toBe(false);
  });
});
