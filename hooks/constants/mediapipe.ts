/**
 * MediaPipe 포즈 감지 및 렌더링 관련 상수
 */

// ============================================
// 랜드마크 처리 설정
// ============================================

/** 스무딩에 사용할 프레임 수 (시간축 평균 계산) */
export const SMOOTHING_WINDOW = 5;

/** 랜드마크 최대 허용 이동 거리 (화면 대비 비율, 5%) */
export const MAX_MOVEMENT = 0.05;

/** 평균 계산에 포함할 최소 신뢰도 (0-1) */
export const VISIBILITY_THRESHOLD_FOR_AVERAGING = 0.3;

/** 관절점 표시 최소 신뢰도 (0-1) */
export const VISIBILITY_THRESHOLD_FOR_DISPLAY = 0.3;

/** 연결선 표시 최소 신뢰도 (0-1) */
export const VISIBILITY_THRESHOLD_FOR_CONNECTION = 0.4;

// ============================================
// 객체 감지 설정
// ============================================

/** 객체 감지 최소 신뢰도 점수 (0-1) */
export const OBJECT_DETECTION_SCORE_THRESHOLD = 0.5;

/** 기준 플레이트와 크기 비교 허용 오차 (±10%) */
export const PLATE_SIZE_TOLERANCE = 0.1;

// ============================================
// MediaPipe 모델 URL
// ============================================

/** MediaPipe WASM 파일 베이스 URL */
export const MEDIAPIPE_WASM_URL =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm";

/** PoseLandmarker 모델 파일 URL */
export const POSE_MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task";

/** ObjectDetector 모델 파일 URL */
export const OBJECT_MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/float16/1/efficientdet_lite0.tflite";
