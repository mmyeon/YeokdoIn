import type { RawFrame } from "./types";
import { midpoint, angleDeg } from "./angleUtils";

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

export function findFrameB(frames: RawFrame[]): number | null {
  let maxAngle = -Infinity;
  let result: number | null = null;

  for (let i = 0; i < frames.length; i++) {
    const { landmarks } = frames[i];
    if (landmarks.length < 33) continue;

    const hipMid = midpoint(landmarks[23], landmarks[24]);
    const kneeMid = midpoint(landmarks[25], landmarks[26]);
    const ankleMid = midpoint(landmarks[27], landmarks[28]);
    const angle = angleDeg(hipMid, kneeMid, ankleMid);

    if (angle > maxAngle) {
      maxAngle = angle;
      result = i;
    }
  }

  return result;
}

export function findLiftoffFrame(frames: RawFrame[]): number | null {
  for (let i = 0; i < frames.length; i++) {
    if (frames[i].landmarks.length >= 33) return i;
  }
  return null;
}
