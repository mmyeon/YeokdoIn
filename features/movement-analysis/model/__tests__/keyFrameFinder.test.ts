import { findFrameA, findFrameB, findLiftoffFrame } from "../keyFrameFinder";
import type { RawFrame } from "../types";

function lm33(overrides: Record<number, { x: number; y: number }> = {}): { x: number; y: number }[] {
  const lm = Array.from({ length: 33 }, () => ({ x: 0.5, y: 0.5 }));
  for (const [i, v] of Object.entries(overrides)) lm[Number(i)] = v;
  return lm;
}

function makeFrame(index: number, landmarks: { x: number; y: number }[]): RawFrame {
  return { timeMs: index * 100, frameIndex: index, landmarks };
}

describe("findFrameA", () => {
  it("손목과 무릎 Y 좌표 차이가 가장 작은 프레임 인덱스를 반환한다", () => {
    const frames: RawFrame[] = [
      makeFrame(0, lm33({ 15: { x: 0.5, y: 0.3 }, 16: { x: 0.5, y: 0.3 }, 25: { x: 0.5, y: 0.7 }, 26: { x: 0.5, y: 0.7 } })),
      makeFrame(1, lm33({ 15: { x: 0.5, y: 0.5 }, 16: { x: 0.5, y: 0.5 }, 25: { x: 0.5, y: 0.5 }, 26: { x: 0.5, y: 0.5 } })),
      makeFrame(2, lm33({ 15: { x: 0.5, y: 0.6 }, 16: { x: 0.5, y: 0.6 }, 25: { x: 0.5, y: 0.5 }, 26: { x: 0.5, y: 0.5 } })),
    ];
    expect(findFrameA(frames)).toBe(1);
  });

  it("landmarks가 33개 미만인 프레임을 무시한다", () => {
    const frames: RawFrame[] = [
      makeFrame(0, []),
      makeFrame(1, lm33({ 15: { x: 0.5, y: 0.5 }, 16: { x: 0.5, y: 0.5 }, 25: { x: 0.5, y: 0.5 }, 26: { x: 0.5, y: 0.5 } })),
    ];
    expect(findFrameA(frames)).toBe(1);
  });

  it("유효한 프레임이 없으면 null을 반환한다", () => {
    expect(findFrameA([makeFrame(0, [])])).toBeNull();
  });
});

describe("findFrameB", () => {
  it("hip-knee-ankle 각도가 가장 큰 프레임 인덱스를 반환한다", () => {
    const bent = lm33({
      23: { x: 0.5, y: 0.3 }, 24: { x: 0.5, y: 0.3 },
      25: { x: 0.6, y: 0.5 }, 26: { x: 0.6, y: 0.5 },
      27: { x: 0.5, y: 0.7 }, 28: { x: 0.5, y: 0.7 },
    });
    const straight = lm33({
      23: { x: 0.5, y: 0.2 }, 24: { x: 0.5, y: 0.2 },
      25: { x: 0.5, y: 0.5 }, 26: { x: 0.5, y: 0.5 },
      27: { x: 0.5, y: 0.8 }, 28: { x: 0.5, y: 0.8 },
    });
    const frames = [makeFrame(0, bent), makeFrame(1, straight)];
    expect(findFrameB(frames)).toBe(1);
  });

  it("유효한 프레임이 없으면 null을 반환한다", () => {
    expect(findFrameB([makeFrame(0, [])])).toBeNull();
  });
});

describe("findLiftoffFrame", () => {
  it("landmarks가 33개 이상인 첫 번째 프레임의 인덱스를 반환한다", () => {
    const frames = [makeFrame(0, []), makeFrame(1, lm33()), makeFrame(2, lm33())];
    expect(findLiftoffFrame(frames)).toBe(1);
  });

  it("유효한 프레임이 없으면 null을 반환한다", () => {
    expect(findLiftoffFrame([makeFrame(0, [])])).toBeNull();
  });
});
