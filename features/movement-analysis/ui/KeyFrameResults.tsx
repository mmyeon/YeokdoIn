"use client";

import { KeyFrameCard } from "./KeyFrameCard";
import type { KeyFrameResult } from "../model/types";

interface KeyFrameResultsProps {
  result: KeyFrameResult;
  onSeek: (timeMs: number) => void;
}

export function KeyFrameResults({ result, onSeek }: KeyFrameResultsProps) {
  const { frameA, frameB } = result;

  return (
    <div className="space-y-3">
      <h2 className="text-base font-semibold">Key Frames</h2>

      {frameA !== null && (
        <KeyFrameCard
          label="Frame A — 무릎 통과 시점"
          timeMs={frameA.timeMs}
          metricsLines={[
            `상체 기울기: ${Math.round(frameA.metrics.shoulderHipAngleDeg)}°`,
            `시작 대비: ${frameA.metrics.angleDeltaDeg > 0 ? "+" : ""}${Math.round(frameA.metrics.angleDeltaDeg)}° ${frameA.metrics.angleDeltaDeg > 0 ? "(더 세워짐)" : "(더 앞으로 기울어짐)"}`,
          ]}
          onClick={() => onSeek(frameA.timeMs)}
        />
      )}

      {frameB !== null && (
        <KeyFrameCard
          label="Frame B — 최대 신전 시점"
          timeMs={frameB.timeMs}
          metricsLines={[
            `몸통 수직도: ${Math.round(frameB.metrics.trunkVerticalityDeg)}° ${frameB.metrics.isGood ? "✓ Good" : "✗ Bad"}`,
          ]}
          onClick={() => onSeek(frameB.timeMs)}
        />
      )}
    </div>
  );
}
