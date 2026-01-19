import {
  CONNECTION_LINE_STYLE,
  JOINT_STYLE,
  VISIBILITY_THRESHOLD_FOR_CONNECTION,
  VISIBILITY_THRESHOLD_FOR_DISPLAY,
} from "@/hooks/constants";
import {
  JOINTS_TO_DISPLAY,
  SKELETON_CONNECTIONS,
} from "@/hooks/constants/pose-landmarks";
import type { Landmark } from "@mediapipe/tasks-vision";

export function renderSkeleton(
  poseLandmarks: Landmark[],
  canvasCtx: CanvasRenderingContext2D,
  dimensions: { width: number; height: number }
): void {
  // 관절점 그리기 (신뢰도 필터링 적용)
  JOINTS_TO_DISPLAY.forEach((index) => {
    const point = poseLandmarks[index];
    if (
      point &&
      point.visibility &&
      point.visibility > VISIBILITY_THRESHOLD_FOR_DISPLAY
    ) {
      // 관절점 그리기
      canvasCtx.beginPath();
      canvasCtx.arc(
        point.x * dimensions.width,
        point.y * dimensions.height,
        JOINT_STYLE.RADIUS,
        0,
        2 * Math.PI
      );

      canvasCtx.fillStyle = JOINT_STYLE.FILL_COLOR;
      canvasCtx.fill();

      canvasCtx.strokeStyle = JOINT_STYLE.STROKE_COLOR;
      canvasCtx.lineWidth = JOINT_STYLE.STROKE_WIDTH;
      canvasCtx.stroke();
    }
  });

  // 관절 연결선 그리기 (신뢰도 필터링 적용)
  SKELETON_CONNECTIONS.forEach(([start, end]) => {
    const startPoint = poseLandmarks[start];
    const endPoint = poseLandmarks[end];

    // 두 관절점 모두 신뢰도가 높을 때만 연결선 그리기
    if (
      startPoint &&
      endPoint &&
      startPoint.visibility &&
      startPoint.visibility > VISIBILITY_THRESHOLD_FOR_CONNECTION &&
      endPoint.visibility &&
      endPoint.visibility > VISIBILITY_THRESHOLD_FOR_CONNECTION
    ) {
      canvasCtx.beginPath();
      canvasCtx.moveTo(
        startPoint.x * dimensions.width,
        startPoint.y * dimensions.height
      );
      canvasCtx.lineTo(
        endPoint.x * dimensions.width,
        endPoint.y * dimensions.height
      );
      canvasCtx.strokeStyle = CONNECTION_LINE_STYLE.COLOR;
      canvasCtx.lineWidth = CONNECTION_LINE_STYLE.WIDTH;
      canvasCtx.stroke();
    }
  });
}
