import {
  FilesetResolver,
  Landmark,
  PoseLandmarker,
  ObjectDetector,
  DrawingUtils,
} from "@mediapipe/tasks-vision";
import { RefObject, useCallback, useEffect, useRef, useState } from "react";
import {
  SMOOTHING_WINDOW,
  MAX_MOVEMENT,
  VISIBILITY_THRESHOLD_FOR_AVERAGING,
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
  // 애니메이션 루프 제어
  const animationFrameId = useRef<number | null>(null);
  // 바벨의 이전 프레임 위치 (궤적 그리기용)
  const previousBarbellPos = useRef<{ x: number; y: number } | null>(null);
  // 기준 바벨 원판 정보 (크기 및 위치 추적용)
  const referencePlate = useRef<ReferencePlate | null>(null);

  // WebGL2 기반 세그멘테이션 마스크 렌더링 유틸리티
  const drawingUtils = useRef<DrawingUtils>(null);

  const [smoothedLandmarks, setSmoothedLandmarks] = useState<Landmark[]>([]);

  useEffect(() => {
    const createPoseLandmarker = async () => {
      try {
        // MediaPipe Vision Tasks 초기화
        const vision = await FilesetResolver.forVisionTasks(MEDIAPIPE_WASM_URL);

        // Pose Landmarker 모델 생성 및 설정
        poseLandmarkerRef.current = await PoseLandmarker.createFromOptions(
          vision,
          {
            baseOptions: {
              modelAssetPath: POSE_MODEL_URL,
              delegate: "GPU", // GPU 가속 사용
            },
            runningMode: "VIDEO", // 비디오 모드로 설정
            numPoses: 1, // 한 명의 포즈만 감지
            outputSegmentationMasks: true, // 세그멘테이션 마스크 출력 활성화
            canvas: maskCanvasRef?.current || undefined, // 세그멘테이션 마스크를 그릴 캔버스
          }
        );

        // Object Detector 모델 생성 및 설정
        objectDetectorRef.current = await ObjectDetector.createFromOptions(
          vision,
          {
            baseOptions: {
              modelAssetPath: OBJECT_MODEL_URL,
              delegate: "GPU",
            },
            scoreThreshold: OBJECT_DETECTION_SCORE_THRESHOLD,
            runningMode: "VIDEO",
            // 바벨 원판이 frisbee로 인식되어서 frisbee 카테고리만 허용
            categoryAllowlist: ["frisbee"],
          }
        );

        if (maskCanvasRef?.current) {
          const glContext = maskCanvasRef.current.getContext("webgl2");
          if (glContext) {
            drawingUtils.current = new DrawingUtils(glContext);
          } else {
            console.warn("WebGL2 not supported, fallback may be needed");
          }
        }
      } catch (error) {
        console.error("Failed to load PoseLandmarker:", error);
        console.error("Failed to load AI model. Please try again.");
      }
    };

    createPoseLandmarker();

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

  // 랜드마크 히스토리 (스무딩용)
  const landmarkHistory = useRef<Landmark[][]>([]);

  const detectPoseInVideo = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const poseLandmarker = poseLandmarkerRef.current;
    const objectDetector = objectDetectorRef.current;

    if (!video || !canvas || !poseLandmarker || !objectDetector) return;

    const canvasCtx = canvas.getContext("2d");
    if (!canvasCtx) return;

    const performDetection = async () => {
      if (video.paused || video.ended) {
        if (animationFrameId.current) {
          cancelAnimationFrame(animationFrameId.current);
        }
        return;
      }

      try {
        const nowInMs = performance.now();
        const poseResults = poseLandmarker.detectForVideo(video, nowInMs);
        const objectDetectionResults = objectDetector.detectForVideo(
          video,
          nowInMs
        );

        // 캔버스 초기화
        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

        // Segmentation mask 렌더링
        renderSegmentationMask(poseResults.segmentationMasks, drawingUtils);

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

        if (poseResults.landmarks) {
          for (const poseLandmarks of poseResults.landmarks) {
            // 관절 위치 스무딩 및 안정화 적용
            const smoothingResult = smoothLandmarks(
              poseLandmarks,
              landmarkHistory.current,
              {
                smoothingWindow: SMOOTHING_WINDOW,
                visibilityThreshold: VISIBILITY_THRESHOLD_FOR_AVERAGING,
              }
            );
            landmarkHistory.current = smoothingResult.newHistory;

            const stabilizedLandmark = stabilizeLandmarks(
              smoothingResult.smoothed,
              smoothedLandmarks,
              MAX_MOVEMENT
            );
            setSmoothedLandmarks(stabilizedLandmark);

            // 바벨 궤적 렌더링
            renderTrajectory(
              barbellPosition,
              previousBarbellPos,
              trajectoryCanvasRef.current?.getContext("2d") ?? null
            );

            // 기본 MediaPipe 관절점과 연결선 그리기 제거
            // drawingUtils.drawLandmarks(landmark, {
            //   radius: 5,
            //   color: "blue",
            // });

            // 기본 MediaPipe 관절 연결선 그리기 제거
            // drawingUtils.drawConnectors(
            //   landmark,
            //   PoseLandmarker.POSE_CONNECTIONS,
            //   { color: "white", lineWidth: 2 },
            // );

            // 스켈레톤 렌더링 (관절점 + 연결선)
            renderSkeleton(stabilizedLandmark, canvasCtx, canvas);
          }
        }
      } catch (error) {
        console.error("Error detecting pose:", error);
      }

      // 다음 프레임 감지를 위해 requestAnimationFrame 호출
      animationFrameId.current = requestAnimationFrame(performDetection);
    };

    // 감지 루프 시작
    animationFrameId.current = requestAnimationFrame(performDetection);

    return () => {
      // 진행 중인 애니메이션 프레임 취소
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  return {
    detectPoseInVideo,
  };
};

export default useMediaPipe;
