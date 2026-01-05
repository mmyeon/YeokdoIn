/** 세그멘테이션 마스크 색상 (RGB + Alpha) */
export const SEGMENTATION_MASK_COLOR = {
  r: 88,
  g: 125,
  b: 205,
  alpha: 179,
} as const;

export const TRAJECTORY_LINE_STYLE = {
  WIDTH: 10,
  COLOR: "rgba(255, 50, 50, 0.9)",
};

export const JOINT_STYLE = {
  RADIUS: 12,
  FILL_COLOR: "rgba(0, 0, 0, 1)",
  STROKE_COLOR: "rgba(255, 255, 255, 1)",
  STROKE_WIDTH: 4,
};

export const CONNECTION_LINE_STYLE = {
  WIDTH: 4,
  COLOR: "rgba(255, 255, 255, 1)",
};
