"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import type { ExercisePosition } from "@/features/program-runner/model/types";
import { formatOverlayLabel } from "../model/overlay-label";

interface ProgramOverlayProps {
  position: ExercisePosition;
  setIdx: number;
  kg: number | null;
  canPrev: boolean;
  canNext: boolean;
  /** 녹화 중에는 세트 이동을 잠근다 */
  locked: boolean;
  onPrev: () => void;
  onNext: () => void;
}

export function ProgramOverlay({
  position,
  setIdx,
  kg,
  canPrev,
  canNext,
  locked,
  onPrev,
  onNext,
}: ProgramOverlayProps) {
  const set = position.sets[setIdx];
  const label = set ? formatOverlayLabel(position.movement, set, kg) : "";

  return (
    <div
      className="absolute inset-x-0 bottom-0 flex items-center gap-3 bg-black/50 px-4 py-3 backdrop-blur-sm"
      role="region"
      aria-label="Current set info"
    >
      <button
        type="button"
        onClick={onPrev}
        disabled={locked || !canPrev}
        aria-label="Previous set"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white disabled:opacity-30"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <span className="flex-1 text-center text-sm font-semibold text-white">
        {label}
      </span>

      <button
        type="button"
        onClick={onNext}
        disabled={locked || !canNext}
        aria-label="Next set"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white disabled:opacity-30"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
