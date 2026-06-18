import { findFrameA, findFrameB, findFrameC, findLiftoffFrame } from "../keyFrameFinder";
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
  // [baseline x5 @ 0-400ms] [rising @ 500ms] [peak @ 600ms] [falling @ 700ms]
  //   bent  (136°): hip(0.5,0.3), knee(0.6,0.55), ankle(0.5,0.8)
  //   peak  (171°): hip(0.5,0.3), knee(0.52,0.55), ankle(0.5,0.8), heel risen
  function makeFrames(): RawFrame[] {
    const baseline = lm33({
      23: { x: 0.5, y: 0.6 },  24: { x: 0.5, y: 0.6 },
      25: { x: 0.6, y: 0.7 },  26: { x: 0.6, y: 0.7 },
      27: { x: 0.5, y: 0.8 },  28: { x: 0.5, y: 0.8 },
      29: { x: 0.5, y: 0.9 },  30: { x: 0.5, y: 0.9 },
    });
    const rising = lm33({
      23: { x: 0.5, y: 0.3 },  24: { x: 0.5, y: 0.3 },
      25: { x: 0.6, y: 0.55 }, 26: { x: 0.6, y: 0.55 },
      27: { x: 0.5, y: 0.8 },  28: { x: 0.5, y: 0.8 },
      29: { x: 0.5, y: 0.88 }, 30: { x: 0.5, y: 0.88 },
    });
    const peak = lm33({
      23: { x: 0.5, y: 0.3 },   24: { x: 0.5, y: 0.3 },
      25: { x: 0.52, y: 0.55 }, 26: { x: 0.52, y: 0.55 },
      27: { x: 0.5, y: 0.8 },   28: { x: 0.5, y: 0.8 },
      29: { x: 0.5, y: 0.82 },  30: { x: 0.5, y: 0.82 },
    });
    const falling = lm33({
      23: { x: 0.5, y: 0.45 },  24: { x: 0.5, y: 0.45 },
      25: { x: 0.6, y: 0.62 },  26: { x: 0.6, y: 0.62 },
      27: { x: 0.5, y: 0.8 },   28: { x: 0.5, y: 0.8 },
      29: { x: 0.5, y: 0.88 },  30: { x: 0.5, y: 0.88 },
    });

    return [
      ...Array.from({ length: 5 }, (_, i) => makeFrame(i, baseline)),
      makeFrame(5, rising),
      makeFrame(6, peak),
      makeFrame(7, falling),
    ];
  }

  it("Frame A 이후 600ms 윈도우 안에서 정규화 합산 점수가 가장 높은 프레임을 반환한다", () => {
    const frames = makeFrames();
    expect(findFrameB(frames, 4, 0)).toBe(6);
  });

  it("프레임이 2개 미만이면 null을 반환한다", () => {
    expect(findFrameB([makeFrame(0, lm33())], null, 0)).toBeNull();
  });

  it("유효한 landmarks가 없으면 null을 반환한다", () => {
    const frames = Array.from({ length: 4 }, (_, i) => makeFrame(i, []));
    expect(findFrameB(frames, 0, 0)).toBeNull();
  });

  it("600ms 윈도우 밖의 프레임은 선택하지 않는다", () => {
    // frameA at index 0 (timeMs=0), windowEnd=600ms
    // only frame 1 (100ms) is inside window with valid landmarks
    // frame 2 (700ms) is outside window and has higher knee angle
    const insideWindow = lm33({
      23: { x: 0.5, y: 0.3 }, 24: { x: 0.5, y: 0.3 },
      25: { x: 0.52, y: 0.55 }, 26: { x: 0.52, y: 0.55 },
      27: { x: 0.5, y: 0.8 }, 28: { x: 0.5, y: 0.8 },
      29: { x: 0.5, y: 0.82 }, 30: { x: 0.5, y: 0.82 },
    });
    const outsideWindow = lm33({
      23: { x: 0.5, y: 0.2 }, 24: { x: 0.5, y: 0.2 },
      25: { x: 0.51, y: 0.55 }, 26: { x: 0.51, y: 0.55 },
      27: { x: 0.5, y: 0.8 }, 28: { x: 0.5, y: 0.8 },
      29: { x: 0.5, y: 0.75 }, 30: { x: 0.5, y: 0.75 },
    });
    const baseline = lm33({
      23: { x: 0.5, y: 0.6 }, 24: { x: 0.5, y: 0.6 },
      25: { x: 0.6, y: 0.7 }, 26: { x: 0.6, y: 0.7 },
      27: { x: 0.5, y: 0.8 }, 28: { x: 0.5, y: 0.8 },
      29: { x: 0.5, y: 0.9 }, 30: { x: 0.5, y: 0.9 },
    });
    const frames = [
      { timeMs: 0, frameIndex: 0, landmarks: baseline },
      { timeMs: 100, frameIndex: 1, landmarks: insideWindow },
      { timeMs: 700, frameIndex: 2, landmarks: outsideWindow },
    ];
    expect(findFrameB(frames, 0, 0)).toBe(1);
  });
});

describe("findFrameC", () => {
  // wristY < shoulderY = 오버헤드, kneeAngle이 가장 작은 프레임 = 캐치 바닥
  function makeLm(wristY: number, shoulderY: number, kneeConfig: { hipY: number; kneeY: number; ankleY: number }) {
    return lm33({
      11: { x: 0.5, y: shoulderY }, 12: { x: 0.5, y: shoulderY },
      15: { x: 0.5, y: wristY },    16: { x: 0.5, y: wristY },
      23: { x: 0.5, y: kneeConfig.hipY },   24: { x: 0.5, y: kneeConfig.hipY },
      25: { x: 0.5, y: kneeConfig.kneeY },  26: { x: 0.5, y: kneeConfig.kneeY },
      27: { x: 0.5, y: kneeConfig.ankleY }, 28: { x: 0.5, y: kneeConfig.ankleY },
    });
  }

  it("오버헤드 프레임 중 무릎이 가장 많이 접힌 프레임을 반환한다", () => {
    // 무릎 각도는 knee의 x 오프셋으로 조정: x 오프셋 클수록 더 접힘(작은 각도)
    // frame 1: knee x=0.52 → 거의 일직선 (~170°)
    // frame 2: knee x=0.65 → 크게 접힘 (~110°) ← 최소각도 = 캐치
    // frame 3: knee x=0.55 → 중간 접힘 (~140°)
    const frames = [
      makeFrame(0, lm33({ // frameBIndex
        11: { x: 0.5, y: 0.4 }, 12: { x: 0.5, y: 0.4 },
        15: { x: 0.5, y: 0.1 }, 16: { x: 0.5, y: 0.1 },
        23: { x: 0.5, y: 0.3 }, 24: { x: 0.5, y: 0.3 },
        25: { x: 0.52, y: 0.55 }, 26: { x: 0.52, y: 0.55 },
        27: { x: 0.5, y: 0.8 }, 28: { x: 0.5, y: 0.8 },
      })),
      makeFrame(1, lm33({ // overhead, knee barely bent (~170°)
        11: { x: 0.5, y: 0.4 }, 12: { x: 0.5, y: 0.4 },
        15: { x: 0.5, y: 0.2 }, 16: { x: 0.5, y: 0.2 },
        23: { x: 0.5, y: 0.4 }, 24: { x: 0.5, y: 0.4 },
        25: { x: 0.52, y: 0.6 }, 26: { x: 0.52, y: 0.6 },
        27: { x: 0.5, y: 0.8 }, 28: { x: 0.5, y: 0.8 },
      })),
      makeFrame(2, lm33({ // overhead, knee deeply bent (~110°) ← min
        11: { x: 0.5, y: 0.4 }, 12: { x: 0.5, y: 0.4 },
        15: { x: 0.5, y: 0.2 }, 16: { x: 0.5, y: 0.2 },
        23: { x: 0.5, y: 0.5 }, 24: { x: 0.5, y: 0.5 },
        25: { x: 0.65, y: 0.62 }, 26: { x: 0.65, y: 0.62 },
        27: { x: 0.5, y: 0.8 }, 28: { x: 0.5, y: 0.8 },
      })),
      makeFrame(3, lm33({ // overhead, knee moderately bent (~140°)
        11: { x: 0.5, y: 0.4 }, 12: { x: 0.5, y: 0.4 },
        15: { x: 0.5, y: 0.2 }, 16: { x: 0.5, y: 0.2 },
        23: { x: 0.5, y: 0.45 }, 24: { x: 0.5, y: 0.45 },
        25: { x: 0.55, y: 0.6 }, 26: { x: 0.55, y: 0.6 },
        27: { x: 0.5, y: 0.8 }, 28: { x: 0.5, y: 0.8 },
      })),
    ];
    expect(findFrameC(frames, 0)).toBe(2);
  });

  it("손목이 어깨보다 아래인 프레임은 건너뛴다", () => {
    // 모든 프레임에서 wristY >= shoulderY → null
    const frames = [
      makeFrame(0, makeLm(0.5, 0.4, { hipY: 0.5, kneeY: 0.6, ankleY: 0.8 })), // frameBIndex
      makeFrame(1, makeLm(0.5, 0.4, { hipY: 0.6, kneeY: 0.65, ankleY: 0.8 })), // wrist at shoulder level
      makeFrame(2, makeLm(0.6, 0.4, { hipY: 0.5, kneeY: 0.6, ankleY: 0.8 })), // wrist below shoulder
    ];
    expect(findFrameC(frames, 0)).toBeNull();
  });

  it("Frame B 이후 프레임만 탐색한다", () => {
    const frames = [
      makeFrame(0, makeLm(0.2, 0.4, { hipY: 0.6, kneeY: 0.65, ankleY: 0.8 })), // overhead + min knee (before B)
      makeFrame(1, makeLm(0.5, 0.4, { hipY: 0.5, kneeY: 0.6, ankleY: 0.8 })), // frameBIndex
      makeFrame(2, makeLm(0.2, 0.4, { hipY: 0.5, kneeY: 0.58, ankleY: 0.8 })), // overhead, knee less bent
    ];
    expect(findFrameC(frames, 1)).toBe(2);
  });

  it("유효한 landmarks가 없으면 null을 반환한다", () => {
    const frames = Array.from({ length: 5 }, (_, i) => makeFrame(i, []));
    expect(findFrameC(frames, null)).toBeNull();
  });

  it("frameBIndex가 null이면 0번 프레임부터 탐색한다", () => {
    // 0번이 유일한 오버헤드 프레임 → off-by-one이면 0번을 놓쳐 null이 된다
    const frames = [
      makeFrame(0, makeLm(0.2, 0.4, { hipY: 0.5, kneeY: 0.6, ankleY: 0.8 })), // 오버헤드
      makeFrame(1, makeLm(0.5, 0.4, { hipY: 0.5, kneeY: 0.6, ankleY: 0.8 })), // 비오버헤드
    ];
    expect(findFrameC(frames, null)).toBe(0);
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
