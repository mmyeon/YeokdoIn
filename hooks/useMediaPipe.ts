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
  VISIBILITY_THRESHOLD_FOR_DISPLAY,
  VISIBILITY_THRESHOLD_FOR_CONNECTION,
  OBJECT_DETECTION_SCORE_THRESHOLD,
  PLATE_SIZE_TOLERANCE,
  MEDIAPIPE_WASM_URL,
  POSE_MODEL_URL,
  OBJECT_MODEL_URL,
  SEGMENTATION_MASK_COLOR,
  TRAJECTORY_LINE_STYLE,
  JOINT_STYLE,
  CONNECTION_LINE_STYLE,
  JOINTS_TO_DISPLAY,
  SKELETON_CONNECTIONS,
} from "./constants";

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
  const referencePlate = useRef<{
    x: number;
    y: number;
    height: number;
  } | null>(null);

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

  const landmarkHistory = useRef<Landmark[][]>([]);

  const smoothLandmarks = (currentLandmarks: Landmark[]) => {
    // 현재 랜드마크를 히스토리에 추가
    landmarkHistory.current.push(currentLandmarks);

    // 히스토리 크기 제한
    if (landmarkHistory.current.length > SMOOTHING_WINDOW) {
      landmarkHistory.current.shift();
    }

    // 충분한 프레임이 쌓이지 않았으면 현재 랜드마크 반환
    if (landmarkHistory.current.length < 3) {
      return currentLandmarks;
    }

    // 각 관절점에 대해 평균 위치 계산
    const smoothed = currentLandmarks.map((landmark, index) => {
      if (!landmark) return landmark;

      let sumX = 0,
        sumY = 0,
        sumZ = 0,
        sumVisibility = 0;
      let validCount = 0;

      // 히스토리에서 유효한 값들의 평균 계산
      landmarkHistory.current.forEach((frame) => {
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

    return smoothed;
  };

  // 관절 위치 안정화 함수 (이동 거리 기반)
  const stabilizeLandmarks = (
    currentLandmarks: Landmark[],
    previousLandmarks: Landmark[]
  ) => {
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
  };

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

        // Segmentation mask 그리기
        if (
          poseResults.segmentationMasks &&
          poseResults.segmentationMasks.length > 0
        ) {
          const mask = poseResults.segmentationMasks[0];

          if (drawingUtils.current) {
            drawingUtils.current.drawConfidenceMask(
              mask,
              [0, 0, 0, 0], // 1. backgroundTexture: 배경 -> 투명
              [88, 125, 205, 179] // 2. overlayTexture: 사람(확률 높은 곳) -> 파란색 반투명 (179 = 0.7 Alpha)
            );
          }
        }

        let barbellPosition: { x: number; y: number } | null = null;
        const scaleX = canvas.width / video.videoWidth;
        const scaleY = canvas.height / video.videoHeight;

        // 객체 감지 결과 그리기
        if (objectDetectionResults.detections) {
          // TODO: 바벨 원판 위치 수집 로직 배열이어야 하는지 검토 필요
          const barbellPlates: Array<{
            x: number;
            y: number;
            height: number;
            originX: number;
            originY: number;
            width: number;
          }> = [];

          for (const detection of objectDetectionResults.detections) {
            if (detection.boundingBox) {
              const { originX, originY, width, height } = detection.boundingBox;
              barbellPlates.push({
                x: (originX + width / 2) * scaleX,
                y: (originY + height / 2) * scaleY,
                height: height,
                originX,
                originY,
                width,
              });
            }
          }

          // 2단계: 바벨 위치 계산
          if (barbellPlates.length > 0) {
            // 가장 큰 플레이트 찾기 - 기준 플레이트로 사용
            const detectedPlate = barbellPlates.reduce((max, current) =>
              current.height > max.height ? current : max
            );

            // 기준 플레이트 설정 또는 업데이트
            if (!referencePlate.current) {
              // 첫 감지: 가장 큰 것을 기준으로 설정
              referencePlate.current = {
                x: detectedPlate.x,
                y: detectedPlate.y,
                height: detectedPlate.height,
              };
              barbellPosition = {
                x: detectedPlate.x,
                y: detectedPlate.y,
              };
            } else {
              // 기준 플레이트와 비슷한 크기의 플레이트 찾기 (±10% 범위)
              const similarPlate = barbellPlates.find(
                (f) =>
                  Math.abs(f.height - referencePlate.current!.height) /
                    referencePlate.current!.height <
                  PLATE_SIZE_TOLERANCE
              );

              if (similarPlate) {
                // 기준 플레이트와 비슷한 것 감지 → 기준 업데이트
                referencePlate.current = {
                  x: similarPlate.x,
                  y: similarPlate.y,
                  height: similarPlate.height,
                };
                barbellPosition = {
                  x: similarPlate.x,
                  y: similarPlate.y,
                };
              } else {
                // 다른 플레이트만 감지됨 → Y만 사용, X는 기준 유지
                barbellPosition = {
                  x: referencePlate.current.x,
                  y: detectedPlate.y,
                };
              }
            }
          }
        }

        if (poseResults.landmarks) {
          for (const poseLandmarks of poseResults.landmarks) {
            // 관절 위치 스무딩 및 안정화 적용
            const smoothedLandmark = smoothLandmarks(poseLandmarks);
            const stabilizedLandmark = stabilizeLandmarks(
              smoothedLandmark,
              smoothedLandmarks
            );
            setSmoothedLandmarks(stabilizedLandmark);

            // 궤적 그리기 (별도 캔버스)
            if (barbellPosition && trajectoryCanvasRef.current) {
              const trajectoryCtx =
                trajectoryCanvasRef.current.getContext("2d");

              if (trajectoryCtx && previousBarbellPos.current) {
                // 이전 위치 → 현재 위치 선 그리기
                trajectoryCtx.strokeStyle = TRAJECTORY_LINE_STYLE.COLOR;
                trajectoryCtx.lineWidth = TRAJECTORY_LINE_STYLE.WIDTH;
                trajectoryCtx.lineCap = "round";
                trajectoryCtx.beginPath();
                trajectoryCtx.moveTo(
                  previousBarbellPos.current.x,
                  previousBarbellPos.current.y
                );
                trajectoryCtx.lineTo(barbellPosition.x, barbellPosition.y);
                trajectoryCtx.stroke();
              }

              // 현재 위치를 다음 프레임을 위해 저장
              previousBarbellPos.current = barbellPosition;
            }
            // 손목 안 보이면: previousBarbellPos 유지 (다음에 보일 때 직선으로 연결됨)

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

            // 사용자가 지정한 관절점만 그리기 (신뢰도 필터링 적용)
            JOINTS_TO_DISPLAY.forEach((index) => {
              const point = stabilizedLandmark[index];
              if (
                point &&
                point.visibility &&
                point.visibility > VISIBILITY_THRESHOLD_FOR_DISPLAY
              ) {
                // 신뢰도 30% 이상만 표시
                // 관절점 그리기
                canvasCtx.beginPath();
                canvasCtx.arc(
                  point.x * canvas.width,
                  point.y * canvas.height,
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

            // 사용자가 지정한 관절 연결선 그리기 (신뢰도 필터링 적용)
            SKELETON_CONNECTIONS.forEach(([start, end]) => {
              const startPoint = stabilizedLandmark[start];
              const endPoint = stabilizedLandmark[end];

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
                  startPoint.x * canvas.width,
                  startPoint.y * canvas.height
                );
                canvasCtx.lineTo(
                  endPoint.x * canvas.width,
                  endPoint.y * canvas.height
                );
                canvasCtx.strokeStyle = CONNECTION_LINE_STYLE.COLOR;
                canvasCtx.lineWidth = CONNECTION_LINE_STYLE.WIDTH;
                canvasCtx.stroke();
              }
            });
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
