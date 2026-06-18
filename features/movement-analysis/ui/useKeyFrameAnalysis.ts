"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FilesetResolver, PoseLandmarker } from "@mediapipe/tasks-vision";
import {
  MEDIAPIPE_WASM_URL,
  POSE_MODEL_URL,
} from "@/hooks/constants/mediapipe";
import { extractFrames } from "./frameExtractor";
import { midpoint } from "../model/angleUtils";
import {
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

type AnalysisStatus = "idle" | "extracting" | "detecting" | "done" | "error";

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
          fps: 30,
          onProgress: (p) => setProgress(p * 0.5),
        });

        // 프레임 추출은 중단을 지원하지 않으므로 완료 직후 취소 여부를 확인한다.
        throwIfAborted();

        setStatus("detecting");

        if (!poseLandmarkerRef.current) {
          const vision = await FilesetResolver.forVisionTasks(MEDIAPIPE_WASM_URL);
          poseLandmarkerRef.current = await PoseLandmarker.createFromOptions(
            vision,
            {
              baseOptions: { modelAssetPath: POSE_MODEL_URL },
              runningMode: "IMAGE",
              numPoses: 1,
            }
          );
        }

        const rawFrames: RawFrame[] = [];
        const total = canvases.length;

        for (let i = 0; i < total; i++) {
          throwIfAborted();
          const detected = poseLandmarkerRef.current.detect(canvases[i]);
          rawFrames.push({
            timeMs: (startSec + i / 30) * 1000,
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

        const baselineEnd = Math.min(liftoffIndex + 5, rawFrames.length);
        const baselineFrames = rawFrames
          .slice(liftoffIndex, baselineEnd)
          .filter((f) => f.landmarks.length >= 33);
        const baselineHeelY =
          baselineFrames.length > 0
            ? baselineFrames.reduce((sum, f) => sum + midpoint(f.landmarks[29], f.landmarks[30]).y, 0) / baselineFrames.length
            : 0.9;
        const baselineHipY =
          baselineFrames.length > 0
            ? baselineFrames.reduce((sum, f) => sum + midpoint(f.landmarks[23], f.landmarks[24]).y, 0) / baselineFrames.length
            : 0.5;

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
    []
  );

  useEffect(() => {
    return () => {
      poseLandmarkerRef.current?.close();
      poseLandmarkerRef.current = null;
    };
  }, []);

  return { analyze, status, progress, result, error };
}
