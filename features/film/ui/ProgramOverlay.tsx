"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import type { ExercisePosition } from "@/features/program-runner/model/types";
import { formatOverlayLabel } from "../model/overlay-label";

interface ProgramOverlayProps {
  position: ExercisePosition;
  setIdx: number;
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
}

const FADE_DELAY_MS = 3000;

export function ProgramOverlay({
  position,
  setIdx,
  canPrev,
  canNext,
  onPrev,
  onNext,
}: ProgramOverlayProps) {
  const [visible, setVisible] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // ref로 현재 가시 상태 추적 — handleTap이 visible 상태에 의존하지 않도록
  const visibleRef = useRef(true);

  const scheduleHide = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      visibleRef.current = false;
      setVisible(false);
    }, FADE_DELAY_MS);
  }, []);

  const handleTap = useCallback(() => {
    if (!visibleRef.current) {
      visibleRef.current = true;
      setVisible(true);
      scheduleHide();
    } else {
      if (timerRef.current) clearTimeout(timerRef.current);
      visibleRef.current = false;
      setVisible(false);
    }
  }, [scheduleHide]);

  useEffect(() => {
    scheduleHide();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [scheduleHide]);

  const set = position.sets[setIdx];
  const label = set ? formatOverlayLabel(position.movement, set) : "";

  return (
    <div
      className={[
        "absolute inset-x-0 bottom-0 flex items-center gap-3 px-4 py-3",
        "bg-black/50 backdrop-blur-sm transition-opacity duration-300",
        visible ? "opacity-100" : "opacity-0 pointer-events-none",
      ].join(" ")}
      role="region"
      aria-label="현재 세트 정보"
      onClick={handleTap}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onPrev();
        }}
        disabled={!canPrev}
        aria-label="이전 세트"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white disabled:opacity-30"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <span className="flex-1 text-center text-sm font-semibold text-white">
        {label}
      </span>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onNext();
        }}
        disabled={!canNext}
        aria-label="다음 세트"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white disabled:opacity-30"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
