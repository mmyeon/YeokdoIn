import type { RawFrame, FrameAMetrics, FrameBMetrics } from "./types";
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

export function computeFrameBMetrics(frame: RawFrame): FrameBMetrics {
  const ankleMid = midpoint(frame.landmarks[27], frame.landmarks[28]);
  const hipMid = midpoint(frame.landmarks[23], frame.landmarks[24]);
  const shoulderMid = midpoint(frame.landmarks[11], frame.landmarks[12]);
  const trunkVerticalityDeg = angleDeg(ankleMid, hipMid, shoulderMid);
  return {
    trunkVerticalityDeg,
    isGood: trunkVerticalityDeg >= 150,
  };
}
