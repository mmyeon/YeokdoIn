import type { RawFrame } from "./types";
import { midpoint, angleDeg } from "./angleUtils";

const SECOND_PULL_WINDOW_MS = 600;
const MAX_RISE_NORM = 0.15;

function kneeAngleOf(frame: RawFrame): number {
  const hipMid = midpoint(frame.landmarks[23], frame.landmarks[24]);
  const kneeMid = midpoint(frame.landmarks[25], frame.landmarks[26]);
  const ankleMid = midpoint(frame.landmarks[27], frame.landmarks[28]);
  return angleDeg(hipMid, kneeMid, ankleMid);
}

function computeBaseline(frames: RawFrame[], liftoffIndex: number) {
  const baselineEnd = Math.min(liftoffIndex + 5, frames.length);
  const valid = frames.slice(liftoffIndex, baselineEnd).filter(f => f.landmarks.length >= 33);
  if (valid.length === 0) return null;
  const heelY = valid.reduce((s, f) => s + midpoint(f.landmarks[29], f.landmarks[30]).y, 0) / valid.length;
  const hipY = valid.reduce((s, f) => s + midpoint(f.landmarks[23], f.landmarks[24]).y, 0) / valid.length;
  return { heelY, hipY };
}

export function findFrameA(frames: RawFrame[]): number | null {
  let minDiff = Infinity;
  let result: number | null = null;

  for (let i = 0; i < frames.length; i++) {
    const { landmarks } = frames[i];
    if (landmarks.length < 33) continue;

    const wristMid = midpoint(landmarks[15], landmarks[16]);
    const kneeMid = midpoint(landmarks[25], landmarks[26]);
    const diff = Math.abs(wristMid.y - kneeMid.y);

    if (diff < minDiff) {
      minDiff = diff;
      result = i;
    }
  }

  return result;
}

// Frame B: 세컨드풀 컨택
// Frame A 이후 SECOND_PULL_WINDOW_MS 구간에서 정규화된 합산 점수가 가장 높은 프레임 선정
// score = (kneeAngle/180)*0.5 + (hipRise/MAX_RISE)*1.2 + (heelRise/MAX_RISE)*0.8
export function findFrameB(
  frames: RawFrame[],
  frameAIndex: number | null,
  liftoffIndex = 0
): number | null {
  if (frames.length < 2) return null;

  const baseline = computeBaseline(frames, liftoffIndex);
  if (!baseline) return null;

  const { heelY: baselineHeelY, hipY: baselineHipY } = baseline;
  const startIndex = (frameAIndex ?? 0) + 1;
  const windowEndMs = frames[frameAIndex ?? 0].timeMs + SECOND_PULL_WINDOW_MS;

  let bestIndex: number | null = null;
  let bestScore = -Infinity;

  for (let i = startIndex; i < frames.length; i++) {
    const curr = frames[i];
    if (curr.landmarks.length < 33) continue;
    if (curr.timeMs > windowEndMs) break;

    const kneeAngle = kneeAngleOf(curr);
    const heelRise = baselineHeelY - midpoint(curr.landmarks[29], curr.landmarks[30]).y;
    const hipRise = baselineHipY - midpoint(curr.landmarks[23], curr.landmarks[24]).y;

    const score =
      (kneeAngle / 180) * 0.5 +
      (hipRise / MAX_RISE_NORM) * 1.2 +
      (heelRise / MAX_RISE_NORM) * 0.8;

    if (score > bestScore) {
      bestScore = score;
      bestIndex = i;
    }
  }

  return bestIndex;
}

// Frame C: 캐치 바닥 (스내치 전용)
// Filter: wristY < shoulderY (바가 오버헤드 = 어깨보다 손목이 위)
// Selector: filter 통과 프레임 중 무릎 각도가 가장 작은(가장 깊이 앉은) 프레임
export function findFrameC(frames: RawFrame[], frameBIndex: number | null = null): number | null {
  const startIndex = frameBIndex !== null ? frameBIndex + 1 : 0;

  let bestIndex: number | null = null;
  let minKneeAngle = Infinity;

  for (let i = startIndex; i < frames.length; i++) {
    const curr = frames[i];
    if (curr.landmarks.length < 33) continue;

    const wristY = midpoint(curr.landmarks[15], curr.landmarks[16]).y;
    const shoulderY = midpoint(curr.landmarks[11], curr.landmarks[12]).y;

    if (wristY >= shoulderY) continue; // 바가 오버헤드가 아니면 스킵

    const kneeAngle = kneeAngleOf(curr);
    if (kneeAngle < minKneeAngle) {
      minKneeAngle = kneeAngle;
      bestIndex = i;
    }
  }

  return bestIndex;
}

export function findLiftoffFrame(frames: RawFrame[]): number | null {
  for (let i = 0; i < frames.length; i++) {
    if (frames[i].landmarks.length >= 33) return i;
  }
  return null;
}

export { computeBaseline };
