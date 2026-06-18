import type { RawFrame, FrameAMetrics, FrameBMetrics, FrameCMetrics } from "./types";
import { midpoint, angleDeg } from "./angleUtils";

function computeShoulderHipAngle(frame: RawFrame): number {
  const shoulderMid = midpoint(frame.landmarks[11], frame.landmarks[12]);
  const hipMid = midpoint(frame.landmarks[23], frame.landmarks[24]);
  return Math.atan2(shoulderMid.x - hipMid.x, hipMid.y - shoulderMid.y) * (180 / Math.PI);
}

export function computeFrameAMetrics(
  frame: RawFrame,
  liftoffFrame: RawFrame
): FrameAMetrics {
  const shoulderHipAngleDeg = computeShoulderHipAngle(frame);
  const liftoffAngleDeg = computeShoulderHipAngle(liftoffFrame);
  return {
    shoulderHipAngleDeg,
    liftoffAngleDeg,
    angleDeltaDeg: shoulderHipAngleDeg - liftoffAngleDeg,
  };
}

export function computeFrameBMetrics(
  frame: RawFrame,
  baselineHeelY: number,
  baselineHipY: number
): FrameBMetrics {
  const hipMid = midpoint(frame.landmarks[23], frame.landmarks[24]);
  const kneeMid = midpoint(frame.landmarks[25], frame.landmarks[26]);
  const ankleMid = midpoint(frame.landmarks[27], frame.landmarks[28]);
  const kneeAngleDeg = angleDeg(hipMid, kneeMid, ankleMid);
  const hipRiseNorm = baselineHipY - hipMid.y;
  const heelRiseNorm = baselineHeelY - midpoint(frame.landmarks[29], frame.landmarks[30]).y;

  return { kneeAngleDeg, hipRiseNorm, heelRiseNorm };
}

export function computeFrameCMetrics(frame: RawFrame): FrameCMetrics {
  const shoulderMid = midpoint(frame.landmarks[11], frame.landmarks[12]);
  const elbowMid = midpoint(frame.landmarks[13], frame.landmarks[14]);
  const wristMid = midpoint(frame.landmarks[15], frame.landmarks[16]);
  const armAngleDeg = angleDeg(shoulderMid, elbowMid, wristMid);
  const wristToHeadNorm = frame.landmarks[0].y - wristMid.y;

  return { armAngleDeg, wristToHeadNorm };
}
