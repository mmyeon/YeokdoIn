"use client";

import Link from "next/link";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import { ROUTES } from "@/routes";

interface RunnerHeaderProps {
  blockIdx: number;
  totalBlocks: number;
  exerciseIdx: number;
  totalExercises: number;
  onClose?: () => void;
}

export function RunnerHeader({
  blockIdx,
  totalBlocks,
  exerciseIdx,
  totalExercises,
  onClose,
}: RunnerHeaderProps) {
  const currentEx = exerciseIdx + 1;

  return (
    <div className="flex items-center justify-between px-4 py-2">
      {onClose ? (
        <button
          type="button"
          onClick={onClose}
          aria-label="운동 종료"
          className="flex h-8 w-8 items-center justify-center text-yd-text-muted"
        >
          <X className="h-5 w-5" />
        </button>
      ) : (
        <Link
          href={ROUTES.HOME}
          aria-label="홈으로"
          className="flex h-8 w-8 items-center justify-center text-yd-text-muted"
        >
          <X className="h-5 w-5" />
        </Link>
      )}

      <div className="flex flex-col items-center gap-1">
        <span className="text-[11px] uppercase tracking-wider text-yd-text-muted">
          블록 {blockIdx + 1}/{totalBlocks} · 운동 {currentEx}/{totalExercises}
        </span>
        <div className="flex gap-[3px]">
          {Array.from({ length: totalExercises }).map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-[3px] w-[22px] rounded-[2px]",
                i < currentEx ? "bg-yd-primary" : "bg-yd-line",
              )}
            />
          ))}
        </div>
      </div>

      {/* Right slot kept visible as a reserved affordance (PR shortcut) */}
      <span className="w-8" aria-hidden />
    </div>
  );
}
