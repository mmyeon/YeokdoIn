import {
  SEGMENTATION_MASK_BACKGROUND_COLOR,
  SEGMENTATION_MASK_COLOR,
} from "@/hooks/constants";
import type { MPMask, DrawingUtils } from "@mediapipe/tasks-vision";
import type { RefObject } from "react";

export function renderSegmentationMask(
  masks: MPMask[] | undefined,
  drawingUtilsRef: RefObject<DrawingUtils | null>
): void {
  if (!masks || masks.length === 0 || !drawingUtilsRef.current) {
    return;
  }

  const mask = masks[0];
  drawingUtilsRef.current.drawConfidenceMask(
    mask,
    SEGMENTATION_MASK_BACKGROUND_COLOR,
    SEGMENTATION_MASK_COLOR
  );
}
