import type { Landmark } from "@mediapipe/tasks-vision";

/**
 * 포즈 랜드마크의 시간적 스무딩을 수행하는 순수 함수
 *
 * @description
 * 여러 프레임의 랜드마크 데이터를 평균하여 떨림을 줄이고 부드러운 움직임을 생성합니다.
 * - 최소 3프레임 이상 쌓여야 스무딩 시작
 * - visibility가 임계값 이상인 프레임만 평균 계산에 포함
 * - 히스토리 크기를 smoothingWindow로 제한
 *
 * @param currentLandmarks - 현재 프레임의 랜드마크 배열
 * @param history - 이전 프레임들의 랜드마크 히스토리
 * @param config - 스무딩 설정
 * @param config.smoothingWindow - 평균 계산에 사용할 최대 프레임 수 (기본값: 5)
 * @param config.visibilityThreshold - 평균 계산에 포함할 최소 신뢰도 (기본값: 0.3)
 *
 * @returns 스무딩된 랜드마크 배열과 업데이트된 히스토리
 *
 * @example
 * ```typescript
 * const result = smoothLandmarks(
 *   currentLandmarks,
 *   landmarkHistory,
 *   { smoothingWindow: 5, visibilityThreshold: 0.3 }
 * );
 *
 * const smoothedLandmarks = result.smoothed;
 * landmarkHistory = result.newHistory;
 * ```
 */
export function smoothLandmarks(
  currentLandmarks: Landmark[],
  history: Landmark[][],
  config: {
    smoothingWindow: number;
    visibilityThreshold: number;
  }
): { smoothed: Landmark[]; newHistory: Landmark[][] } {
  // 현재 랜드마크를 히스토리에 추가
  const newHistory = [...history, currentLandmarks];

  // 히스토리 크기 제한
  if (newHistory.length > config.smoothingWindow) {
    newHistory.shift();
  }

  // 충분한 프레임이 쌓이지 않았으면 현재 랜드마크 반환
  if (newHistory.length < 3) {
    return { smoothed: currentLandmarks, newHistory };
  }

  // 각 관절점에 대해 평균 위치 계산
  const smoothed = currentLandmarks.map((landmark, index) => {
    if (!landmark) return landmark;

    let sumX = 0;
    let sumY = 0;
    let sumZ = 0;
    let sumVisibility = 0;
    let validCount = 0;

    // 히스토리에서 유효한 값들의 평균 계산
    newHistory.forEach((frame) => {
      if (
        frame[index] &&
        frame[index].visibility &&
        frame[index].visibility! > config.visibilityThreshold
      ) {
        sumX += frame[index].x;
        sumY += frame[index].y;
        sumZ += frame[index].z;
        sumVisibility += frame[index].visibility!;
        validCount++;
      }
    });

    if (validCount === 0) return landmark;

    return {
      x: sumX / validCount,
      y: sumY / validCount,
      z: sumZ / validCount,
      visibility: sumVisibility / validCount,
    };
  });

  return { smoothed, newHistory };
}
