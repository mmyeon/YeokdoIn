"use client";

import { useRef, useState } from "react";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";

import { Barbell } from "@/components/ui/barbell";
import { Pill } from "@/components/ui/pill";
import { SetDot } from "@/components/ui/set-dot";
import { cn } from "@/lib/utils";

import type { ExercisePosition, SetRecord } from "../model/types";
import {
  formatMovementName,
  formatReps,
  formatSetsBySchemeLabel,
} from "../model/format";
import { formatPlateSummary } from "../model/plate-summary";

interface RunnerStandardViewProps {
  position: ExercisePosition;
  records: SetRecord[];
  currentSetIdx: number;
  barWeight: number;
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onLogSet: () => void;
  onSelectSet: (setIdx: number) => void;
  onSetKg: (setIdx: number, kg: number) => void;
}

export function RunnerStandardView({
  position,
  records,
  currentSetIdx,
  barWeight,
  canPrev,
  canNext,
  onPrev,
  onNext,
  onLogSet,
  onSelectSet,
  onSetKg,
}: RunnerStandardViewProps) {
  const { movement, sets } = position;
  const { name, before, after } = formatMovementName(movement);
  const current = sets[currentSetIdx];
  const currentRecord = records[currentSetIdx];
  const displayKg: number | null = currentRecord?.kg ?? current?.prescribedKg ?? null;

  const [isEditingKg, setIsEditingKg] = useState(false);
  const kgInputRef = useRef<HTMLInputElement>(null);

  const prevRecord =
    currentSetIdx > 0 && records[currentSetIdx - 1]?.done
      ? records[currentSetIdx - 1]
      : null;
  const delta =
    prevRecord?.kg != null && displayKg != null
      ? displayKg - prevRecord.kg
      : null;

  return (
    <div className="flex flex-1 flex-col">
      <div className="px-5 pb-1 pt-2">
        <h1 className="text-[28px] font-bold leading-[1.05] tracking-tight text-yd-text">
          {before.length > 0 && (
            <span className="text-yd-text-muted">{before.join(" ")} </span>
          )}
          {name}
        </h1>
        {after.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1.5">
            {after.map((m) => (
              <Pill key={m} size="sm" variant="outlined">
                ({m})
              </Pill>
            ))}
          </div>
        )}
      </div>

      {/* Big kg number for CURRENT set */}
      <div className="flex items-baseline gap-2 px-5 pt-1">
        {isEditingKg ? (
          <input
            ref={kgInputRef}
            type="number"
            min={0}
            step={0.5}
            defaultValue={displayKg ?? ""}
            autoFocus
            onChange={(e) => {
              const parsed = parseFloat(e.target.value);
              if (!Number.isNaN(parsed) && parsed >= 0) {
                onSetKg(currentSetIdx, parsed);
              }
            }}
            onBlur={() => setIsEditingKg(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter") setIsEditingKg(false);
              if (e.key === "Escape") setIsEditingKg(false);
            }}
            className="w-36 border-b-2 border-yd-primary bg-transparent text-[64px] font-extrabold leading-none tracking-[-2px] text-yd-text outline-none"
          />
        ) : (
          <button
            type="button"
            onClick={() => setIsEditingKg(true)}
            className="text-[64px] font-extrabold leading-none tracking-[-2px] text-yd-text"
          >
            {displayKg ?? "—"}
          </button>
        )}
        <span className="text-[22px] font-semibold text-yd-text-muted">kg</span>
        {current?.percentage != null && (
          <span className="text-[18px] font-semibold text-yd-primary">
            {current.percentage}%
          </span>
        )}
        <div className="flex-1" />
        <div className="flex flex-col items-end gap-1">
          <span className="text-[10px] uppercase tracking-widest text-yd-text-muted">
            세트 {current?.setNumber ?? 0}/{current?.totalSets ?? 0}
          </span>
          {delta !== null && delta !== 0 && (
            <Pill tone="primary" variant="outlined" size="sm">
              {delta > 0 ? `+${delta}` : delta} kg 직전 대비
            </Pill>
          )}
        </div>
      </div>

      {/* Barbell viz */}
      <div className="flex justify-center px-4 pt-2">
        <Barbell totalKg={displayKg ?? 0} barWeight={barWeight} width={340} />
      </div>

      {/* Plate breakdown text — derived via calculatePlates */}
      <div className="px-5 text-center">
        <span className="text-[11px] text-yd-text-muted">
          {displayKg != null ? formatPlateSummary(displayKg, barWeight) : "kg를 입력하세요"}
        </span>
      </div>

      {/* Section label */}
      <div className="px-5 pt-1">
        <span className="text-[11px] uppercase tracking-widest text-yd-text-muted">
          세트 · {current ? formatSetsBySchemeLabel(current.reps, current.totalSets) : "—"}
        </span>
      </div>

      {/* Per-set list */}
      <div className="flex flex-col gap-1.5 px-4 pb-2 pt-1.5">
        {sets.map((plan, i) => {
          const rec = records[i];
          const isCurrent = i === currentSetIdx;
          const kg: number | null = rec?.kg ?? plan.prescribedKg ?? null;
          return (
            <button
              type="button"
              key={i}
              onClick={() => onSelectSet(i)}
              className={cn(
                "flex h-10 items-center justify-between rounded-[var(--yd-r-md)] border px-3 text-left transition-colors",
                isCurrent
                  ? "border-yd-primary bg-yd-primary-soft"
                  : "border-yd-line bg-transparent",
              )}
            >
              <div className="flex items-center gap-2.5">
                <SetDot done={rec?.done ?? false} size={20} />
                <span className="text-[12px] text-yd-text-muted">
                  #{plan.setNumber}
                </span>
                <span className="text-[15px] font-bold text-yd-text">{kg ?? "—"} kg</span>
                {plan.percentage != null && (
                  <span className="text-[11px] font-semibold text-yd-primary">
                    {plan.percentage}%
                  </span>
                )}
                <span className="text-[11px] text-yd-text-muted">
                  × {formatReps(plan.reps)}
                </span>
                {isCurrent && (
                  <Pill size="sm" tone="primary" variant="outlined">
                    현재
                  </Pill>
                )}
              </div>
              <span className="text-[11px] text-yd-text-muted">
                {rec?.done ? "✓" : "기록"}
              </span>
            </button>
          );
        })}
      </div>

      {/* Nav + primary CTA */}
      <div className="mt-auto flex gap-2.5 px-4 pb-3">
        <button
          type="button"
          onClick={onPrev}
          disabled={!canPrev}
          aria-label="이전"
          className="flex h-[52px] w-[52px] items-center justify-center rounded-[var(--yd-r-md)] border border-yd-line text-yd-text disabled:opacity-40"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={onLogSet}
          disabled={!current}
          className="flex h-[52px] flex-1 items-center justify-center gap-1.5 rounded-[var(--yd-r-md)] bg-yd-primary text-[14px] font-bold text-yd-on-primary shadow-[0_8px_24px_var(--yd-primary-soft)] disabled:opacity-40"
        >
          <Check className="h-4 w-4" />
          세트 기록
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!canNext}
          aria-label="다음"
          className="flex h-[52px] w-[52px] items-center justify-center rounded-[var(--yd-r-md)] border border-yd-line text-yd-text disabled:opacity-40"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
