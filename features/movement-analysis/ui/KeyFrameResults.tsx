"use client";

import { KeyFrameCard } from "./KeyFrameCard";
import type { KeyFrameResult } from "../model/types";

interface KeyFrameResultsProps {
  result: KeyFrameResult;
  activeFrameId: "A" | "B" | "C" | null;
  onSeek: (timeMs: number) => void;
  onFrameSelect: (id: "A" | "B" | "C") => void;
}

export function KeyFrameResults({
  result,
  activeFrameId,
  onSeek,
  onFrameSelect,
}: KeyFrameResultsProps) {
  const { frameA, frameB, frameC } = result;

  return (
    <div className="flex flex-col gap-1.5">
      {frameA !== null && (
        <KeyFrameCard
          frameId="A"
          label="Knee Pass"
          timeMs={frameA.timeMs}
          metrics={[
            {
              key: "Torso angle",
              value: `${Math.round(frameA.metrics.shoulderHipAngleDeg)}°`,
            },
            {
              key: "vs start",
              value: `${frameA.metrics.angleDeltaDeg > 0 ? "+" : ""}${Math.round(frameA.metrics.angleDeltaDeg)}°`,
              accent: true,
              note:
                frameA.metrics.angleDeltaDeg > 0 ? "more upright" : "more leaned",
            },
          ]}
          isActive={activeFrameId === "A"}
          onClick={() => {
            onFrameSelect("A");
            onSeek(frameA.timeMs);
          }}
        />
      )}

      {frameB !== null && (
        <KeyFrameCard
          frameId="B"
          label="Bar Contact"
          timeMs={frameB.timeMs}
          metrics={[
            {
              key: "Knee angle",
              value: `${Math.round(frameB.metrics.kneeAngleDeg)}°`,
            },
            {
              key: "Heel rise",
              value: `${(frameB.metrics.heelRiseNorm * 100).toFixed(1)}%`,
            },
          ]}
          isActive={activeFrameId === "B"}
          onClick={() => {
            onFrameSelect("B");
            onSeek(frameB.timeMs);
          }}
        />
      )}

      {frameC !== null && (
        <KeyFrameCard
          frameId="C"
          label="Catch"
          timeMs={frameC.timeMs}
          metrics={[
            {
              key: "Arm extension",
              value: `${Math.round(frameC.metrics.armAngleDeg)}°`,
            },
          ]}
          isActive={activeFrameId === "C"}
          onClick={() => {
            onFrameSelect("C");
            onSeek(frameC.timeMs);
          }}
        />
      )}
    </div>
  );
}
