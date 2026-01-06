import { TRAJECTORY_LINE_STYLE } from "@/hooks/constants/rendering";
import type { RefObject } from "react";

export function renderTrajectory(
  currentPosition: { x: number; y: number } | null,
  previousPositionRef: RefObject<{ x: number; y: number } | null>,
  trajectoryCtx: CanvasRenderingContext2D | null
): void {
  if (!currentPosition || !trajectoryCtx) {
    return;
  }

  // 이전 위치가 있을 때만 선 그리기
  if (previousPositionRef.current) {
    trajectoryCtx.strokeStyle = TRAJECTORY_LINE_STYLE.COLOR;
    trajectoryCtx.lineWidth = TRAJECTORY_LINE_STYLE.WIDTH;
    trajectoryCtx.lineCap = "round";
    trajectoryCtx.beginPath();
    trajectoryCtx.moveTo(
      previousPositionRef.current.x,
      previousPositionRef.current.y
    );
    trajectoryCtx.lineTo(currentPosition.x, currentPosition.y);
    trajectoryCtx.stroke();
  }

  // 현재 위치를 다음 프레임을 위해 저장
  previousPositionRef.current = currentPosition;
}
