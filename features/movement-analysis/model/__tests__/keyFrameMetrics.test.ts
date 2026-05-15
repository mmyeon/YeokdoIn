import { computeFrameAMetrics, computeFrameBMetrics, computeFrameCMetrics } from "../keyFrameMetrics";
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
  it("kneeAngleDeg, hipRiseNorm, heelRiseNorm을 반환한다", () => {
    const frame = makeFrame({
      23: { x: 0.5, y: 0.4 }, 24: { x: 0.5, y: 0.4 },
      25: { x: 0.5, y: 0.5 }, 26: { x: 0.5, y: 0.5 },
      27: { x: 0.5, y: 0.75 }, 28: { x: 0.5, y: 0.75 },
      29: { x: 0.5, y: 0.84 }, 30: { x: 0.5, y: 0.84 },
    });
    const result = computeFrameBMetrics(frame, 0.9, 0.6);
    expect(result.kneeAngleDeg).toBeGreaterThan(0);
    expect(result.hipRiseNorm).toBeCloseTo(0.2, 5);  // 0.6 - 0.4
    expect(result.heelRiseNorm).toBeCloseTo(0.06, 5); // 0.9 - 0.84
  });

  it("골반이 baseline보다 낮으면 hipRiseNorm이 음수이다", () => {
    const frame = makeFrame({ 23: { x: 0.5, y: 0.7 }, 24: { x: 0.5, y: 0.7 } });
    const result = computeFrameBMetrics(frame, 0.9, 0.5);
    expect(result.hipRiseNorm).toBeLessThan(0); // 0.5 - 0.7 = -0.2
  });
});

describe("computeFrameCMetrics", () => {
  it("armAngleDeg와 wristToHeadNorm을 반환한다", () => {
    const frame = makeFrame({
      0:  { x: 0.5, y: 0.1 },
      11: { x: 0.5, y: 0.3 }, 12: { x: 0.5, y: 0.3 },
      13: { x: 0.5, y: 0.2 }, 14: { x: 0.5, y: 0.2 },
      15: { x: 0.5, y: 0.1 }, 16: { x: 0.5, y: 0.1 },
    });
    const result = computeFrameCMetrics(frame);
    expect(typeof result.armAngleDeg).toBe("number");
    expect(result.wristToHeadNorm).toBeCloseTo(0, 5); // nose Y - wrist Y = 0.1 - 0.1 = 0
  });

  it("손목이 머리 위에 있으면 wristToHeadNorm이 양수이다", () => {
    const frame = makeFrame({
      0:  { x: 0.5, y: 0.2 },
      11: { x: 0.5, y: 0.4 }, 12: { x: 0.5, y: 0.4 },
      13: { x: 0.5, y: 0.3 }, 14: { x: 0.5, y: 0.3 },
      15: { x: 0.5, y: 0.05 }, 16: { x: 0.5, y: 0.05 }, // wrist above head
    });
    const result = computeFrameCMetrics(frame);
    expect(result.wristToHeadNorm).toBeGreaterThan(0);
  });
});
