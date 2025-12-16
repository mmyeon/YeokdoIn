import {
  FilesetResolver,
  Landmark,
  PoseLandmarker,
  ObjectDetector,
} from "@mediapipe/tasks-vision";
import { RefObject, useCallback, useEffect, useRef, useState } from "react";

const useMediaPipe = ({
  videoRef,
  canvasRef,
  trajectoryCanvasRef,
}: {
  videoRef: RefObject<HTMLVideoElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  trajectoryCanvasRef: RefObject<HTMLCanvasElement | null>;
}) => {
  // media pipe pose landmarker 객체 인스턴스 저장
  const poseLandmarkerRef = useRef<PoseLandmarker>(null);
  const objectDetectorRef = useRef<ObjectDetector>(null);
  // 애니메이션 루프 제어
  const animationFrameId = useRef<number | null>(null);
  // 이전 바벨 위치 저장 (선 연결용)
  const previousBarbellPos = useRef<{ x: number; y: number } | null>(null);
  // 기준 플레이트 정보 저장
  const referencePlate = useRef<{
    x: number;
    y: number;
    height: number;
  } | null>(null);

  const [smoothedLandmarks, setSmoothedLandmarks] = useState<Landmark[]>([]);

  useEffect(() => {
    const createPoseLandmarker = async () => {
      try {
        // MediaPipe Vision Tasks 초기화
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
        );

        // Pose Landmarker 모델 생성 및 설정
        poseLandmarkerRef.current = await PoseLandmarker.createFromOptions(
          vision,
          {
            baseOptions: {
              modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task`,
              delegate: "GPU", // GPU 가속 사용
            },
            runningMode: "VIDEO", // 비디오 모드로 설정
            numPoses: 1, // 한 명의 포즈만 감지
          }
        );

        // Object Detector 모델 생성 및 설정
        objectDetectorRef.current = await ObjectDetector.createFromOptions(
          vision,
          {
            baseOptions: {
              modelAssetPath: `https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/float16/1/efficientdet_lite0.tflite`,
              delegate: "GPU",
            },
            scoreThreshold: 0.5,
            runningMode: "VIDEO",
            // 바벨 원판이 frisbee로 인식되어서 frisbee 카테고리만 허용
            categoryAllowlist: ["frisbee"],
          }
        );
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
    };
  }, []);

  const landmarkHistory = useRef<Landmark[][]>([]);
  const smoothingWindow = 5; // 스무딩에 사용할 프레임 수

  const smoothLandmarks = (currentLandmarks: Landmark[]) => {
    // 현재 랜드마크를 히스토리에 추가
    landmarkHistory.current.push(currentLandmarks);

    // 히스토리 크기 제한
    if (landmarkHistory.current.length > smoothingWindow) {
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
          frame[index].visibility! > 0.3
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

    const maxMovement = 0.05; // 최대 허용 이동 거리 (5%)

    return currentLandmarks.map((landmark, index) => {
      if (!landmark || !previousLandmarks[index]) return landmark;

      const prev = previousLandmarks[index];
      const dx = Math.abs(landmark.x - prev.x);
      const dy = Math.abs(landmark.y - prev.y);

      // 이동 거리가 너무 크면 이전 위치 유지
      if (dx > maxMovement || dy > maxMovement) {
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

    if (!video || !canvas || !poseLandmarker || !objectDetector) {
      return;
    }

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
        const results = poseLandmarker.detectForVideo(video, nowInMs);
        const objectResults = objectDetector.detectForVideo(video, nowInMs);

        // 캔버스 초기화
        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

        // 비디오 프레임 그리기
        canvasCtx.drawImage(video, 0, 0, canvas.width, canvas.height);

        let barbellPosition: { x: number; y: number } | null = null;
        const scaleX = canvas.width / video.videoWidth;
        const scaleY = canvas.height / video.videoHeight;

        // 객체 감지 결과 그리기
        if (objectResults.detections) {
          // TODO: 바벨 원판 위치 수집 로직 배열이어야 하는지 검토 필요
          const barbellPlates: Array<{
            x: number;
            y: number;
            height: number;
            originX: number;
            originY: number;
            width: number;
          }> = [];

          for (const detection of objectResults.detections) {
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
                  0.1
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

        if (results.landmarks) {
          for (const landmark of results.landmarks) {
            // 관절 위치 스무딩 및 안정화 적용
            const smoothedLandmark = smoothLandmarks(landmark);
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
                trajectoryCtx.strokeStyle = "rgba(0, 255, 0, 0.8)";
                trajectoryCtx.lineWidth = 8;
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
            const customJoints = [
              23, 24, 25, 26, 13, 14, 11, 12, 15, 16, 27, 28, 31, 32, 29, 30,
              22, 21, 31,
            ]; // 왼쪽/오른쪽 엉덩이, 왼쪽/오른쪽 무릎 등

            customJoints.forEach((index) => {
              const point = stabilizedLandmark[index];
              if (point && point.visibility && point.visibility > 0.3) {
                // 신뢰도 30% 이상만 표시
                // 관절점 그리기
                canvasCtx.beginPath();
                canvasCtx.arc(
                  point.x * canvas.width,
                  point.y * canvas.height,
                  4, // 관절점 크기를 더 작게
                  0,
                  2 * Math.PI
                );
                canvasCtx.fillStyle = "rgba(255, 0, 0, 0.7)"; // 반투명 빨간색
                canvasCtx.fill();
                canvasCtx.strokeStyle = "rgba(255, 255, 255, 0.8)";
                canvasCtx.lineWidth = 1.5;
                canvasCtx.stroke();

                // 관절점 번호 표시 (신뢰도가 높을 때만)
                // if (point.visibility > 0.5) {
                //   canvasCtx.fillStyle = "rgba(255, 255, 255, 0.9)";
                //   canvasCtx.font = "bold 10px Arial";
                //   canvasCtx.fillText(
                //     index.toString(),
                //     point.x * canvas.width + 8,
                //     point.y * canvas.height - 8,
                //   );
                // }
              }
            });

            // 사용자가 지정한 관절 연결선 그리기 (신뢰도 필터링 적용)
            const customConnections = [
              // 왼쪽 다리 연결
              [23, 25], // 왼쪽 엉덩이 - 왼쪽 무릎
              [25, 27], // 왼쪽 무릎 - 왼쪽 발목
              // 오른쪽 다리 연결
              [24, 26], // 오른쪽 엉덩이 - 오른쪽 무릎
              [26, 28], // 오른쪽 무릎 - 오른쪽 발목
              // 어깨 연결
              [11, 12], // 왼쪽 어깨 - 오른쪽 어깨
              // 팔 연결
              [11, 13], // 왼쪽 어깨 - 왼쪽 팔꿈치
              [11, 23], // 왼쪽 어깨 - 왼쪽 팔꿈치
              [13, 15], // 왼쪽 팔꿈치 - 왼쪽 손목
              [12, 14], // 오른쪽 어깨 - 오른쪽 팔꿈치
              [12, 24], // 오른쪽 어깨 - 오른쪽 팔꿈치
              [14, 16], // 오른쪽 팔꿈치 - 오른쪽 손목
              // 왼발 3지점 연결 (발목-발뒤꿈치-발끝)
              [27, 29], // 왼쪽 발목 - 왼쪽 발뒤꿈치
              [29, 31], // 왼쪽 발뒤꿈치 - 왼쪽 발끝
              // [27, 31], // 왼쪽 발목 - 왼쪽 발끝 (삼각형 완성)
              // 오른발 3지점 연결 (발목-발뒤꿈치-발끝)
              [28, 30], // 오른쪽 발목 - 오른쪽 발뒤꿈치
              [30, 32], // 오른쪽 발뒤꿈치 - 오른쪽 발끝
              // [28, 32], // 오른쪽 발목 - 오른쪽 발끝 (삼각형 완성)
              // 고관절 연결
              [23, 24],
            ];

            customConnections.forEach(([start, end]) => {
              const startPoint = stabilizedLandmark[start];
              const endPoint = stabilizedLandmark[end];

              // 두 관절점 모두 신뢰도가 높을 때만 연결선 그리기
              if (
                startPoint &&
                endPoint &&
                startPoint.visibility &&
                startPoint.visibility > 0.4 &&
                endPoint.visibility &&
                endPoint.visibility > 0.4
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
                canvasCtx.strokeStyle = "rgba(255, 255, 0, 0.6)"; // 반투명 노란색
                canvasCtx.lineWidth = 2;
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
