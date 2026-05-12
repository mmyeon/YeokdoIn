import {
  FilesetResolver,
  PoseLandmarker,
} from "@mediapipe/tasks-vision";
import { RefObject, useCallback, useEffect, useRef } from "react";
import {
  MEDIAPIPE_WASM_URL,
  POSE_MODEL_URL,
} from "./constants";
import {} from // smoothLandmarks,
// stabilizeLandmarks,
"./utils/landmark-processing";
import { renderSkeleton } from "./utils/rendering";

const useMediaPipe = ({
  videoRef,
  canvasRef,
}: {
  videoRef: RefObject<HTMLVideoElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
}) => {
  // MediaPipe Pose Landmarker 인스턴스 참조
  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);
  // // 랜드마크 히스토리 (스무딩용)
  // const landmarkHistory = useRef<Landmark[][]>([]);
  // const smoothedLandmarksRef = useRef<Landmark[]>([]);
  // 애니메이션 루프 제어
  const animationFrameId = useRef<number | null>(null);

  // MediaPipe 모델 초기화
  useEffect(() => {
    let isMounted = true;

    const initializeMediaPipe = async () => {
      try {
        // Vision Tasks 초기화
        const vision = await FilesetResolver.forVisionTasks(MEDIAPIPE_WASM_URL);

        if (!isMounted) {
          console.log("Component unmounted during initialization");
          return;
        }

        // PoseLandmarker 생성
        const poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: POSE_MODEL_URL,
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numPoses: 1,
        });

        if (!isMounted) {
          console.log("Component unmounted, cleaning up PoseLandmarker");
          poseLandmarker.close();
          return;
        }

        poseLandmarkerRef.current = poseLandmarker;
      } catch (error) {
        console.error("Failed to load MediaPipe models:", error);
      }
    };

    initializeMediaPipe();

    // 컴포넌트 언마운트 시 정리
    return () => {
      isMounted = false;

      // PoseLandmarker 정리
      if (poseLandmarkerRef.current) {
        try {
          poseLandmarkerRef.current.close();
          poseLandmarkerRef.current = null;
        } catch (error) {
          console.error("Error closing PoseLandmarker:", error);
        }
      }

      // AnimationFrame 정리
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }

      // Canvas context 정리
      [canvasRef].forEach((ref) => {
        if (ref?.current) {
          const canvas = ref.current;

          // 2D context 정리
          const ctx2d = canvas.getContext("2d");
          if (ctx2d) {
            ctx2d.clearRect(0, 0, canvas.width, canvas.height);
          }

          // WebGL context 정리
          const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
          if (gl) {
            // 화면 지우기
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            // Context 강제 해제
            const loseContext = gl.getExtension("WEBGL_lose_context");
            if (loseContext) {
              loseContext.loseContext();
            }
          }

          // 크기 초기화
          canvas.width = 0;
          canvas.height = 0;
        }
      });
    };
  }, []);

  // 프레임별 감지 및 렌더링 처리
  const processFrame = useCallback(
    (
      video: HTMLVideoElement,
      canvas: HTMLCanvasElement,
      poseLandmarker: PoseLandmarker
    ) => {
      const canvasCtx = canvas.getContext("2d");
      if (!canvasCtx) return;
      const nowInMs = performance.now();
      const poseResults = poseLandmarker.detectForVideo(video, nowInMs);

      // 캔버스 초기화
      canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

      if (poseResults) {
        for (const poseLandmarks of poseResults.landmarks) {
          // 관절 위치 스무딩 및 안정화 적용
          // const smoothingResult = smoothLandmarks(
          //   poseLandmarks,
          //   landmarkHistory.current
          // );
          // landmarkHistory.current = smoothingResult.newHistory;

          // const stabilizedLandmark = stabilizeLandmarks(
          //   smoothingResult.smoothed,
          //   smoothedLandmarksRef.current
          // );
          // smoothedLandmarksRef.current = stabilizedLandmark;

          // 스켈레톤 렌더링 (관절점 + 연결선)
          // renderSkeleton(stabilizedLandmark, canvasCtx, canvas);
          renderSkeleton(poseLandmarks, canvasCtx, canvas);
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

    if (!video || !canvas || !poseLandmarker) return;

    const performDetection = async () => {
      if (shouldStopDetection(video)) return;

      try {
        processFrame(video, canvas, poseLandmarker);
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
