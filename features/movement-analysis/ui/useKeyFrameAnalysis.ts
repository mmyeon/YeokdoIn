"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FilesetResolver, PoseLandmarker } from "@mediapipe/tasks-vision";
import {
  MEDIAPIPE_WASM_URL,
  POSE_MODEL_URL,
} from "@/hooks/constants/mediapipe";
import { extractFrames } from "../model/frameExtractor";
import {
  findFrameA,
  findFrameB,
  findLiftoffFrame,
} from "../model/keyFrameFinder";
import {
  computeFrameAMetrics,
  computeFrameBMetrics,
} from "../model/keyFrameMetrics";
import type { KeyFrameResult, RawFrame } from "../model/types";

type AnalysisStatus = "idle" | "extracting" | "detecting" | "done" | "error";

interface UseKeyFrameAnalysisReturn {
  analyze: (blob: Blob, startSec: number, endSec: number) => Promise<void>;
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
    async (blob: Blob, startSec: number, endSec: number): Promise<void> => {
      setStatus("extracting");
      setProgress(0);
      setResult(null);
      setError(null);

      try {
        const canvases = await extractFrames(blob, {
          startSec,
          endSec,
          fps: 30,
          onProgress: (p) => setProgress(p * 0.5),
        });

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
          const detected = poseLandmarkerRef.current.detect(canvases[i]);
          rawFrames.push({
            timeMs: (startSec + i / 30) * 1000,
            frameIndex: i,
            landmarks: detected.landmarks[0] ?? [],
          });
          setProgress(0.5 + ((i + 1) / total) * 0.5);
        }

        const liftoffIndex = findLiftoffFrame(rawFrames);
        const frameAIndex = findFrameA(rawFrames);
        const frameBIndex = findFrameB(rawFrames);

        const liftoffFrame = liftoffIndex !== null ? rawFrames[liftoffIndex] : null;
        const frameAData = frameAIndex !== null ? rawFrames[frameAIndex] : null;
        const frameBData = frameBIndex !== null ? rawFrames[frameBIndex] : null;

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
                  metrics: computeFrameBMetrics(frameBData),
                }
              : null,
        });

        setStatus("done");
        setProgress(1);
      } catch (err: unknown) {
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
