"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { ROUTES } from "@/routes";
import type { Program } from "@/features/notation/model/types";
import { useBarbellWeight } from "@/hooks/useBarbellWeight";

import { flattenProgram } from "../model/flatten";
import type { SetRecord } from "../model/types";
import { RunnerHeader } from "./RunnerHeader";
import { RunnerStandardView } from "./RunnerStandardView";
import { RunnerFocusView } from "./RunnerFocusView";

interface ProgramRunnerProps {
  program: Program;
  aliasMap: Readonly<Record<string, number>>;
  prMap: Readonly<Record<number, number>>;
}

type ViewMode = "standard" | "focus";

/** Build initial record state: records[posIdx][setIdx] = { kg, done } */
function buildInitialRecords(
  positions: ReturnType<typeof flattenProgram>,
): SetRecord[][] {
  return positions.map((pos) =>
    pos.sets.map((plan) => ({
      kg: plan.prescribedKg,
      done: false,
    })),
  );
}

const DEFAULT_BAR_WEIGHT = 20;

export function ProgramRunner({ program, aliasMap, prMap }: ProgramRunnerProps) {
  const router = useRouter();
  const { data: savedBarWeight } = useBarbellWeight();
  const barWeight = savedBarWeight ?? DEFAULT_BAR_WEIGHT;

  const positions = useMemo(
    () => flattenProgram({ program, aliasMap, prMap }),
    [program, aliasMap, prMap],
  );

  const [records, setRecords] = useState<SetRecord[][]>(() =>
    buildInitialRecords(positions),
  );
  const [posIdx, setPosIdx] = useState(0);
  const [setIdx, setSetIdx] = useState(0);
  const [view, setView] = useState<ViewMode>("standard");

  if (positions.length === 0) {
    return (
      <EmptyState onClose={() => router.push(ROUTES.HOME)} />
    );
  }

  const position = positions[posIdx];
  const totalSets = position.sets.length;

  const goToPos = (nextPosIdx: number) => {
    setPosIdx(nextPosIdx);
    setSetIdx(0);
  };

  const handlePrev = () => {
    if (setIdx > 0) {
      setSetIdx(setIdx - 1);
      return;
    }
    if (posIdx > 0) {
      const prev = positions[posIdx - 1];
      setPosIdx(posIdx - 1);
      setSetIdx(prev.sets.length - 1);
    }
  };

  const handleNext = () => {
    if (setIdx < totalSets - 1) {
      setSetIdx(setIdx + 1);
      return;
    }
    if (posIdx < positions.length - 1) {
      goToPos(posIdx + 1);
    }
  };

  const canPrev = posIdx > 0 || setIdx > 0;
  const canNext =
    posIdx < positions.length - 1 || setIdx < totalSets - 1;

  const handleLogSet = () => {
    setRecords((prev) => {
      const nextPosRecords = prev[posIdx].map((r, i) =>
        i === setIdx ? { ...r, done: true } : r,
      );
      return prev.map((posRecs, i) => (i === posIdx ? nextPosRecords : posRecs));
    });
    handleNext();
  };

  const handleSetKg = (targetSetIdx: number, kg: number) => {
    setRecords((prev) => {
      const nextPosRecords = prev[posIdx].map((r, i) =>
        i === targetSetIdx ? { ...r, kg } : r,
      );
      return prev.map((posRecs, i) => (i === posIdx ? nextPosRecords : posRecs));
    });
  };

  const currentRecords = records[posIdx];

  return (
    <div
      className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col bg-yd-bg text-yd-text"
      data-slot="program-runner"
    >
      <RunnerHeader
        blockIdx={position.blockIdx}
        totalBlocks={position.totalBlocks}
        exerciseIdx={position.exerciseIdx}
        totalExercises={position.totalExercises}
        onClose={() => router.push(ROUTES.HOME)}
      />

      <ViewToggle view={view} onChange={setView} />

      {view === "standard" ? (
        <RunnerStandardView
          position={position}
          records={currentRecords}
          currentSetIdx={setIdx}
          barWeight={barWeight}
          canPrev={canPrev}
          canNext={canNext}
          onPrev={handlePrev}
          onNext={handleNext}
          onLogSet={handleLogSet}
          onSelectSet={setSetIdx}
          onSetKg={handleSetKg}
        />
      ) : (
        <RunnerFocusView
          position={position}
          records={currentRecords}
          currentSetIdx={setIdx}
          barWeight={barWeight}
          canPrev={canPrev}
          canNext={canNext}
          onPrev={handlePrev}
          onNext={handleNext}
          onLogSet={handleLogSet}
        />
      )}
    </div>
  );
}

interface ViewToggleProps {
  view: ViewMode;
  onChange: (view: ViewMode) => void;
}

function ViewToggle({ view, onChange }: ViewToggleProps) {
  const options: Array<{ id: ViewMode; label: string }> = [
    { id: "standard", label: "상세" },
    { id: "focus", label: "집중" },
  ];
  return (
    <div
      role="tablist"
      aria-label="러너 보기 모드"
      className="mx-4 mb-1 inline-flex self-center rounded-[var(--yd-r-full)] border border-yd-line bg-yd-surface p-[3px]"
    >
      {options.map((opt) => {
        const active = view === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.id)}
            className={cn(
              "rounded-[var(--yd-r-full)] px-3.5 py-1 text-[12px] font-semibold transition-colors",
              active
                ? "bg-yd-primary text-yd-on-primary"
                : "text-yd-text-muted",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function EmptyState({ onClose }: { onClose: () => void }) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col items-center justify-center gap-3 bg-yd-bg p-6 text-center text-yd-text">
      <p className="text-[16px] font-semibold">실행할 블록이 없습니다.</p>
      <p className="text-[13px] text-yd-text-muted">
        프로그램에 블록을 추가한 뒤 다시 시작해 주세요.
      </p>
      <button
        type="button"
        onClick={onClose}
        className="mt-2 rounded-[var(--yd-r-md)] bg-yd-primary px-4 py-2 text-[13px] font-bold text-yd-on-primary"
      >
        홈으로
      </button>
    </div>
  );
}
