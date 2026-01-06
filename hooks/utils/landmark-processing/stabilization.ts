import { MAX_MOVEMENT } from "@/hooks/constants";
import type { Landmark } from "@mediapipe/tasks-vision";

export function stabilizeLandmarks(
  currentLandmarks: Landmark[],
  previousLandmarks: Landmark[]
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
    if (dx > MAX_MOVEMENT || dy > MAX_MOVEMENT) {
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
