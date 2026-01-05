import type { Landmark } from "@mediapipe/tasks-vision";

/**
 * 포즈 랜드마크의 떨림을 방지하는 안정화 함수
 *
 * @description
 * 이전 프레임과 현재 프레임의 랜드마크 위치를 비교하여, 이동 거리가 임계값을 초과하면
 * 이전 위치를 유지함으로써 급격한 떨림을 방지합니다.
 * - 이전 랜드마크가 없으면 현재 랜드마크를 그대로 반환
 * - 각 랜드마크의 x, y 이동 거리를 계산
 * - maxMovement(기본 5%)를 초과하면 이전 위치 유지
 *
 * @param currentLandmarks - 현재 프레임의 랜드마크 배열
 * @param previousLandmarks - 이전 프레임의 랜드마크 배열
 * @param maxMovement - 최대 허용 이동 거리 (기본값: 0.05 = 5%)
 *
 * @returns 안정화된 랜드마크 배열
 *
 * @example
 * ```typescript
 * const stabilized = stabilizeLandmarks(
 *   currentLandmarks,
 *   previousLandmarks,
 *   0.05
 * );
 * ```
 */
export function stabilizeLandmarks(
  currentLandmarks: Landmark[],
  previousLandmarks: Landmark[],
  maxMovement: number = 0.05
): Landmark[] {
  if (!previousLandmarks || previousLandmarks.length === 0) {
    return currentLandmarks;
  }

  return currentLandmarks.map((landmark, index) => {
    if (!landmark || !previousLandmarks[index]) return landmark;

    const prev = previousLandmarks[index];
    const dx = Math.abs(landmark.x - prev.x);
    const dy = Math.abs(landmark.y - prev.y);

    // 이동 거리가 너무 크면 이전 위치 유지
    if (dx > maxMovement || dy > maxMovement) {
      return {
        ...landmark,
        x: prev.x,
        y: prev.y,
        z: prev.z,
      };
    }

    return landmark;
  });
}
