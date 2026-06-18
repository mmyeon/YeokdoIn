export interface Point2D {
  x: number;
  y: number;
}

export interface Landmark extends Point2D {
  visibility?: number;
}

export interface RawFrame {
  timeMs: number;
  frameIndex: number;
  landmarks: Landmark[];
}

export interface FrameAMetrics {
  shoulderHipAngleDeg: number;
  liftoffAngleDeg: number;
  angleDeltaDeg: number;
}

export interface FrameBMetrics {
  kneeAngleDeg: number;
  hipRiseNorm: number;
  heelRiseNorm: number;
}

export interface FrameCMetrics {
  armAngleDeg: number;
  wristToHeadNorm: number;
}

export interface KeyFrameData<T> {
  timeMs: number;
  frameIndex: number;
  metrics: T;
}

export interface KeyFrameResult {
  frameA: KeyFrameData<FrameAMetrics> | null;
  frameB: KeyFrameData<FrameBMetrics> | null;
  frameC: KeyFrameData<FrameCMetrics> | null;
}
