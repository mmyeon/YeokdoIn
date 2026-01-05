/**
 * 바벨 원판 정보
 */
export interface BarbellPlate {
  x: number; // 캔버스 좌표계의 중심 x
  y: number; // 캔버스 좌표계의 중심 y
  height: number; // 원본 높이
  originX: number; // 원본 bounding box x
  originY: number; // 원본 bounding box y
  width: number; // 원본 너비
}

/**
 * 기준 바벨 원판 정보 (추적용)
 */
export interface ReferencePlate {
  x: number;
  y: number;
  height: number;
}

/**
 * 바벨 위치
 */
export interface BarbellPosition {
  x: number;
  y: number;
}
