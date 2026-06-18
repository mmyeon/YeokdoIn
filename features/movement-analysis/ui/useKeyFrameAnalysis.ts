"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FilesetResolver, PoseLandmarker } from "@mediapipe/tasks-vision";
import {
  MEDIAPIPE_WASM_URL,
  POSE_MODEL_URL,
} from "@/hooks/constants/mediapipe";
import { extractFrames } from "./frameExtractor";
import {
  computeBaseline,
  findFrameA,
  findFrameB,
  findFrameC,
  findLiftoffFrame,
} from "../model/keyFrameFinder";
import {
  computeFrameAMetrics,
  computeFrameBMetrics,
  computeFrameCMetrics,
} from "../model/keyFrameMetrics";
import type { KeyFrameResult, RawFrame } from "../model/types";

/** 프레임 추출·타임스탬프 계산에 사용하는 분석 프레임레이트. */
const ANALYSIS_FPS = 30;

/** baseline 프레임이 없을 때 사용하는 발뒤꿈치/엉덩이 Y 기본값. */
const DEFAULT_BASELINE_HEEL_Y = 0.9;
const DEFAULT_BASELINE_HIP_Y = 0.5;

type AnalysisStatus = "idle" | "extracting" | "detecting" | "done" | "error";

async function createPoseLandmarker(): Promise<PoseLandmarker> {
  const vision = await FilesetResolver.forVisionTasks(MEDIAPIPE_WASM_URL);
  return PoseLandmarker.createFromOptions(vision, {
    baseOptions: { modelAssetPath: POSE_MODEL_URL },
    runningMode: "IMAGE",
    numPoses: 1,
  });
}

interface UseKeyFrameAnalysisReturn {
  analyze: (
    blob: Blob,
    startSec: number,
    endSec: number,
    signal?: AbortSignal
  ) => Promise<void>;
  status: AnalysisStatus;
  progress: number;
  result: KeyFrameResult | null;
  error: string | null;
}

export function useKeyFrameAnalysis(): UseKeyFrameAnalysisReturn {
  const [status, setStatus] = useState<AnalysisStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<KeyFrameResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);
  const poseLandmarkerPromiseRef = useRef<Promise<PoseLandmarker> | null>(null);

  // 동시 호출 시 PoseLandmarker가 중복 생성되지 않도록 init Promise를 캐싱한다.
  const getPoseLandmarker = useCallback((): Promise<PoseLandmarker> => {
    if (!poseLandmarkerPromiseRef.current) {
      poseLandmarkerPromiseRef.current = createPoseLandmarker().then(
        (landmarker) => {
          poseLandmarkerRef.current = landmarker;
          return landmarker;
        },
        (err) => {
          poseLandmarkerPromiseRef.current = null; // 실패 시 다음 호출에서 재시도
          throw err;
        }
      );
    }
    return poseLandmarkerPromiseRef.current;
  }, []);

  const analyze = useCallback(
    async (
      blob: Blob,
      startSec: number,
      endSec: number,
      signal?: AbortSignal
    ): Promise<void> => {
      setStatus("extracting");
      setProgress(0);
      setResult(null);
      setError(null);

      const throwIfAborted = () => {
        if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
      };

      try {
        const canvases = await extractFrames(blob, {
          startSec,
          endSec,
          fps: ANALYSIS_FPS,
          onProgress: (p) => setProgress(p * 0.5),
        });

        // 프레임 추출은 중단을 지원하지 않으므로 완료 직후 취소 여부를 확인한다.
        throwIfAborted();

        setStatus("detecting");

        const poseLandmarker = await getPoseLandmarker();

        const rawFrames: RawFrame[] = [];
        const total = canvases.length;

        for (let i = 0; i < total; i++) {
          throwIfAborted();
          const detected = poseLandmarker.detect(canvases[i]);
          rawFrames.push({
            timeMs: (startSec + i / ANALYSIS_FPS) * 1000,
            frameIndex: i,
            landmarks: detected.landmarks[0] ?? [],
          });
          setProgress(0.5 + ((i + 1) / total) * 0.5);
          // 브라우저에 제어권을 넘겨 React가 progress 상태를 렌더링할 수 있게 함
          await new Promise<void>((resolve) => setTimeout(resolve, 0));
        }

        const liftoffIndex = findLiftoffFrame(rawFrames) ?? 0;
        const frameAIndex = findFrameA(rawFrames);
        const frameBIndex = findFrameB(rawFrames, frameAIndex, liftoffIndex);
        const frameCIndex = findFrameC(rawFrames, frameBIndex);

        const liftoffFrame = rawFrames[liftoffIndex] ?? null;
        const frameAData = frameAIndex !== null ? rawFrames[frameAIndex] : null;
        const frameBData = frameBIndex !== null ? rawFrames[frameBIndex] : null;
        const frameCData = frameCIndex !== null ? rawFrames[frameCIndex] : null;

        // findFrameB와 동일한 baseline 로직을 재사용한다(중복 제거).
        const baseline = computeBaseline(rawFrames, liftoffIndex);
        const baselineHeelY = baseline?.heelY ?? DEFAULT_BASELINE_HEEL_Y;
        const baselineHipY = baseline?.hipY ?? DEFAULT_BASELINE_HIP_Y;

        setResult({
          frameA:
            frameAData !== null && liftoffFrame !== null
              ? {
                  timeMs: frameAData.timeMs,
                  frameIndex: frameAData.frameIndex,
                  metrics: computeFrameAMetrics(frameAData, liftoffFrame),
                }
              : null,
          frameB:
            frameBData !== null
              ? {
                  timeMs: frameBData.timeMs,
                  frameIndex: frameBData.frameIndex,
                  metrics: computeFrameBMetrics(frameBData, baselineHeelY, baselineHipY),
                }
              : null,
          frameC:
            frameCData !== null
              ? {
                  timeMs: frameCData.timeMs,
                  frameIndex: frameCData.frameIndex,
                  metrics: computeFrameCMetrics(frameCData),
                }
              : null,
        });

        setStatus("done");
        setProgress(1);
      } catch (err: unknown) {
        // 취소된 실행은 오류로 표시하지 않고 종료한다. 상태를 건드리지 않아
        // 곧바로 시작된 새 분석의 status/progress를 덮어쓰지 않게 한다.
        if (signal?.aborted) return;
        setStatus("error");
        setError(
          err instanceof Error ? err.message : "분석 중 오류가 발생했습니다"
        );
      }
    },
    [getPoseLandmarker]
  );

  useEffect(() => {
    return () => {
      poseLandmarkerRef.current?.close();
      poseLandmarkerRef.current = null;
      poseLandmarkerPromiseRef.current = null;
    };
  }, []);

  return { analyze, status, progress, result, error };
}
