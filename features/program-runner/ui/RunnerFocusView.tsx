"use client";

import { Check, ChevronLeft, ChevronRight } from "lucide-react";

import { Barbell } from "@/components/ui/barbell";
import { SetDot } from "@/components/ui/set-dot";

import type { ExercisePosition, SetRecord } from "../model/types";
import { formatMovementName, formatReps } from "../model/format";

interface RunnerFocusViewProps {
  position: ExercisePosition;
  records: SetRecord[];
  currentSetIdx: number;
  barWeight: number;
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onLogSet: () => void;
}

export function RunnerFocusView({
  position,
  records,
  currentSetIdx,
  barWeight,
  canPrev,
  canNext,
  onPrev,
  onNext,
  onLogSet,
}: RunnerFocusViewProps) {
  const { movement, sets } = position;
  const { name, before, after } = formatMovementName(movement);
  const current = sets[currentSetIdx];
  const currentRecord = records[currentSetIdx];
  const displayKg: number | null = currentRecord?.kg ?? current?.prescribedKg ?? null;

  const displayName = [
    before.join(" "),
    name,
    after.length > 0 ? `(${after.join(", ")})` : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col justify-center gap-[18px] px-5">
        <div className="text-center">
          <span className="text-[24px] font-semibold uppercase tracking-wide text-yd-text-muted">
            세트 {current?.setNumber ?? 0}/{current?.totalSets ?? 0}
          </span>
        </div>

        <div className="text-center leading-none">
          <span className="text-[22px] font-semibold text-yd-text">
            {displayName}
          </span>
        </div>

        <div className="text-center leading-none">
          <div className="text-[96px] font-extrabold leading-[0.9] tracking-[-3px] text-yd-text">
            {displayKg ?? "—"}
          </div>
          <div className="mt-1 flex items-baseline justify-center gap-2">
            <span className="text-[18px] font-semibold text-yd-text-muted">
              kg {current ? `· ${formatReps(current.reps)} reps` : ""}
            </span>
            {current?.percentage != null && (
              <span className="text-[16px] font-semibold text-yd-primary">
                {current.percentage}%
              </span>
            )}
          </div>
        </div>

        <div className="flex justify-center gap-3.5">
          {sets.map((plan, i) => (
            <SetDot
              key={i}
              done={records[i]?.done ?? false}
              size={22}
              aria-current={i === currentSetIdx ? "step" : undefined}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-center px-4 pb-3">
        <Barbell totalKg={displayKg ?? 0} barWeight={barWeight} width={320} />
      </div>

      <div className="flex gap-2.5 px-4 pb-[var(--tab-bar-height)]">
        <button
          type="button"
          onClick={onPrev}
          disabled={!canPrev}
          aria-label="이전"
          className="flex h-[52px] w-[52px] items-center justify-center rounded-[var(--yd-r-md)] border border-yd-line text-yd-text disabled:opacity-40"
        >
          <ChevronLeft className="h-[18px] w-[18px]" />
        </button>
        <button
          type="button"
          onClick={onLogSet}
          disabled={!current}
          className="flex h-[52px] flex-1 items-center justify-center gap-1.5 rounded-[var(--yd-r-md)] bg-yd-primary text-[16px] font-bold text-yd-on-primary shadow-[0_8px_24px_var(--yd-primary-soft)] disabled:opacity-40"
        >
          <Check className="h-4 w-4" />
          세트 완료
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!canNext}
          aria-label="다음"
          className="flex h-[52px] w-[52px] items-center justify-center rounded-[var(--yd-r-md)] border border-yd-line text-yd-text disabled:opacity-40"
        >
          <ChevronRight className="h-[18px] w-[18px]" />
        </button>
      </div>
    </div>
  );
}
