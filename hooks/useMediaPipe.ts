import {
  FilesetResolver,
  Landmark,
  PoseLandmarker,
  ObjectDetector,
  DrawingUtils,
} from "@mediapipe/tasks-vision";
import { RefObject, useCallback, useEffect, useRef } from "react";
import {
  OBJECT_DETECTION_SCORE_THRESHOLD,
  PLATE_SIZE_TOLERANCE,
  MEDIAPIPE_WASM_URL,
  POSE_MODEL_URL,
  OBJECT_MODEL_URL,
} from "./constants";
import {
  smoothLandmarks,
  stabilizeLandmarks,
} from "./utils/landmark-processing";
import {
  detectBarbellPosition,
  type ReferencePlate,
} from "./utils/barbell-detection";
import {
  renderSkeleton,
  renderTrajectory,
  renderSegmentationMask,
} from "./utils/rendering";

const useMediaPipe = ({
  videoRef,
  canvasRef,
  trajectoryCanvasRef,
  maskCanvasRef,
}: {
  videoRef: RefObject<HTMLVideoElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  trajectoryCanvasRef: RefObject<HTMLCanvasElement | null>;
  maskCanvasRef?: RefObject<HTMLCanvasElement | null>;
}) => {
  // MediaPipe Pose Landmarker 인스턴스 참조
  const poseLandmarkerRef = useRef<PoseLandmarker>(null);
  // MediaPipe Object Detector 인스턴스 참조
  const objectDetectorRef = useRef<ObjectDetector>(null);
  // 랜드마크 히스토리 (스무딩용)
  const landmarkHistory = useRef<Landmark[][]>([]);
  const smoothedLandmarksRef = useRef<Landmark[]>([]);
  // 애니메이션 루프 제어
  const animationFrameId = useRef<number | null>(null);
  // 바벨의 이전 프레임 위치 (궤적 그리기용)
  const previousBarbellPos = useRef<{ x: number; y: number } | null>(null);
  // 기준 바벨 원판 정보 (크기 및 위치 추적용)
  const referencePlate = useRef<ReferencePlate | null>(null);

  // WebGL2 기반 세그멘테이션 마스크 렌더링 유틸리티
  const drawingUtils = useRef<DrawingUtils>(null);

  // MediaPipe 모델 초기화
  useEffect(() => {
    const initializeMediaPipe = async () => {
      try {
        // Vision Tasks 초기화
        const vision = await FilesetResolver.forVisionTasks(MEDIAPIPE_WASM_URL);

        // PoseLandmarker 생성
        poseLandmarkerRef.current = await PoseLandmarker.createFromOptions(
          vision,
          {
            baseOptions: {
              modelAssetPath: POSE_MODEL_URL,
              delegate: "GPU",
            },
            runningMode: "VIDEO",
            numPoses: 1,
            outputSegmentationMasks: true,
            canvas: maskCanvasRef?.current || undefined,
          }
        );

        // ObjectDetector 생성
        objectDetectorRef.current = await ObjectDetector.createFromOptions(
          vision,
          {
            baseOptions: {
              modelAssetPath: OBJECT_MODEL_URL,
              delegate: "GPU",
            },
            scoreThreshold: OBJECT_DETECTION_SCORE_THRESHOLD,
            runningMode: "VIDEO",
            categoryAllowlist: ["frisbee"],
          }
        );

        // DrawingUtils 초기화
        if (maskCanvasRef?.current) {
          const glContext = maskCanvasRef.current.getContext("webgl2");
          if (glContext) {
            drawingUtils.current = new DrawingUtils(glContext);
          } else {
            console.warn("WebGL2 not supported, fallback may be needed");
          }
        }
      } catch (error) {
        console.error("Failed to load MediaPipe models:", error);
      }
    };

    initializeMediaPipe();

    // 컴포넌트 언마운트 시 정리
    return () => {
      if (poseLandmarkerRef.current) {
        poseLandmarkerRef.current.close();
      }
      if (objectDetectorRef.current) {
        objectDetectorRef.current.close();
      }
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      if (drawingUtils.current) {
        drawingUtils.current.close();
      }
    };
  }, []);

  // 프레임별 감지 및 렌더링 처리
  const processFrame = useCallback(
    (
      video: HTMLVideoElement,
      canvas: HTMLCanvasElement,
      poseLandmarker: PoseLandmarker,
      objectDetector: ObjectDetector
    ) => {
      const canvasCtx = canvas.getContext("2d");
      if (!canvasCtx) return;
      const nowInMs = performance.now();
      const poseResults = poseLandmarker.detectForVideo(video, nowInMs);
      const objectDetectionResults = objectDetector.detectForVideo(
        video,
        nowInMs
      );

      // 캔버스 초기화
      canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

      // 바벨 위치 감지
      let barbellPosition: { x: number; y: number } | null = null;
      const scaleX = canvas.width / video.videoWidth;
      const scaleY = canvas.height / video.videoHeight;

      const barbellDetectionResult = detectBarbellPosition(
        objectDetectionResults.detections,
        referencePlate.current,
        { plateSizeTolerance: PLATE_SIZE_TOLERANCE },
        { scaleX, scaleY }
      );

      if (barbellDetectionResult) {
        barbellPosition = barbellDetectionResult.position;
        referencePlate.current = barbellDetectionResult.newReference;
      }

      if (poseResults) {
        for (const poseLandmarks of poseResults.landmarks) {
          // 관절 위치 스무딩 및 안정화 적용
          const smoothingResult = smoothLandmarks(
            poseLandmarks,
            landmarkHistory.current
          );
          landmarkHistory.current = smoothingResult.newHistory;

          const stabilizedLandmark = stabilizeLandmarks(
            smoothingResult.smoothed,
            smoothedLandmarksRef.current
          );
          smoothedLandmarksRef.current = stabilizedLandmark;

          // Segmentation mask 렌더링
          renderSegmentationMask(poseResults.segmentationMasks, drawingUtils);

          // 바벨 궤적 렌더링
          renderTrajectory(
            barbellPosition,
            previousBarbellPos,
            trajectoryCanvasRef.current?.getContext("2d") ?? null
          );

          // 스켈레톤 렌더링 (관절점 + 연결선)
          renderSkeleton(stabilizedLandmark, canvasCtx, canvas);
        }
      }
    },
    []
  );

  // 비디오 재생 상태 확인 (일시정지/종료 시 애니메이션 중단)
  const shouldStopDetection = useCallback((video: HTMLVideoElement) => {
    return video.paused || video.ended;
  }, []);

  const detectPoseInVideo = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const poseLandmarker = poseLandmarkerRef.current;
    const objectDetector = objectDetectorRef.current;

    if (!video || !canvas || !poseLandmarker || !objectDetector) return;

    const performDetection = async () => {
      if (shouldStopDetection(video)) return;

      try {
        processFrame(video, canvas, poseLandmarker, objectDetector);
      } catch (error) {
        console.error("Error detecting pose:", error);
      }

      // 다음 프레임 감지를 위해 requestAnimationFrame 호출
      animationFrameId.current = requestAnimationFrame(performDetection);
    };

    // 감지 루프 시작
    animationFrameId.current = requestAnimationFrame(performDetection);
  }, [processFrame, shouldStopDetection]);

  return {
    detectPoseInVideo,
  };
};

export default useMediaPipe;
