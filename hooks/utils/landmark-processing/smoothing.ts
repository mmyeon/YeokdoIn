import {
  SMOOTHING_WINDOW,
  VISIBILITY_THRESHOLD_FOR_AVERAGING,
} from "@/hooks/constants";
import type { Landmark } from "@mediapipe/tasks-vision";

export function smoothLandmarks(
  currentLandmarks: Landmark[],
  history: Landmark[][]
): { smoothed: Landmark[]; newHistory: Landmark[][] } {
  // 현재 랜드마크를 히스토리에 추가
  const newHistory = [...history, currentLandmarks];

  // 히스토리 크기 제한
  if (newHistory.length > SMOOTHING_WINDOW) {
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
        frame[index].visibility! > VISIBILITY_THRESHOLD_FOR_AVERAGING
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
