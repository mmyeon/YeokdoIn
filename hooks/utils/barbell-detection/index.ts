import type { Detection } from "@mediapipe/tasks-vision";
import type {
  BarbellPlate,
  ReferencePlate,
  BarbellPosition,
} from "./types";

export type { BarbellPlate, ReferencePlate, BarbellPosition };

/**
 * 객체 감지 결과에서 바벨 위치를 계산하는 함수
 *
 * @description
 * MediaPipe Object Detection 결과를 기반으로 바벨 원판의 위치를 추적합니다.
 * - 감지된 모든 원판의 위치를 캔버스 좌표로 변환
 * - 기준 원판(가장 큰 원판)을 기준으로 바벨 위치 추적
 * - 기준 원판과 비슷한 크기(±tolerance)의 원판만 추적
 * - 다른 원판만 감지되면 Y축만 업데이트, X축은 기준 유지
 *
 * @param detections - MediaPipe 객체 감지 결과
 * @param currentReference - 현재 기준 원판 (없으면 null)
 * @param config - 감지 설정
 * @param config.plateSizeTolerance - 원판 크기 허용 오차 (기본값: 0.1 = 10%)
 * @param canvasScale - 캔버스 스케일 정보
 * @param canvasScale.scaleX - 비디오 대비 캔버스 너비 비율
 * @param canvasScale.scaleY - 비디오 대비 캔버스 높이 비율
 *
 * @returns 바벨 위치와 업데이트된 기준 원판
 *
 * @example
 * ```typescript
 * const result = detectBarbellPosition(
 *   objectDetectionResults.detections,
 *   referencePlate.current,
 *   { plateSizeTolerance: 0.1 },
 *   { scaleX: 1.5, scaleY: 1.5 }
 * );
 *
 * if (result) {
 *   referencePlate.current = result.newReference;
 *   const barbellPos = result.position;
 * }
 * ```
 */
export function detectBarbellPosition(
  detections: Detection[] | undefined,
  currentReference: ReferencePlate | null,
  config: {
    plateSizeTolerance: number;
  },
  canvasScale: {
    scaleX: number;
    scaleY: number;
  }
): { position: BarbellPosition; newReference: ReferencePlate } | null {
  if (!detections || detections.length === 0) {
    return null;
  }

  // 1단계: 감지된 모든 바벨 원판 위치 수집
  const barbellPlates: BarbellPlate[] = [];

  for (const detection of detections) {
    if (detection.boundingBox) {
      const { originX, originY, width, height } = detection.boundingBox;
      barbellPlates.push({
        x: (originX + width / 2) * canvasScale.scaleX,
        y: (originY + height / 2) * canvasScale.scaleY,
        height: height,
        originX,
        originY,
        width,
      });
    }
  }

  if (barbellPlates.length === 0) {
    return null;
  }

  // 2단계: 바벨 위치 계산
  // 가장 큰 플레이트 찾기 - 기준 플레이트로 사용
  const detectedPlate = barbellPlates.reduce((max, current) =>
    current.height > max.height ? current : max
  );

  // 기준 플레이트 설정 또는 업데이트
  if (!currentReference) {
    // 첫 감지: 가장 큰 것을 기준으로 설정
    const newReference: ReferencePlate = {
      x: detectedPlate.x,
      y: detectedPlate.y,
      height: detectedPlate.height,
    };

    return {
      position: {
        x: detectedPlate.x,
        y: detectedPlate.y,
      },
      newReference,
    };
  } else {
    // 기준 플레이트와 비슷한 크기의 플레이트 찾기 (±tolerance 범위)
    const similarPlate = barbellPlates.find(
      (plate) =>
        Math.abs(plate.height - currentReference.height) /
          currentReference.height <
        config.plateSizeTolerance
    );

    if (similarPlate) {
      // 기준 플레이트와 비슷한 것 감지 → 기준 업데이트
      const newReference: ReferencePlate = {
        x: similarPlate.x,
        y: similarPlate.y,
        height: similarPlate.height,
      };

      return {
        position: {
          x: similarPlate.x,
          y: similarPlate.y,
        },
        newReference,
      };
    } else {
      // 다른 플레이트만 감지됨 → Y만 사용, X는 기준 유지
      return {
        position: {
          x: currentReference.x,
          y: detectedPlate.y,
        },
        newReference: currentReference, // 기준은 유지
      };
    }
  }
}
