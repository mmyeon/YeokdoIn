"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";

import { ROUTES } from "@/routes";
import {
  useBarbellWeight,
  useSaveBarbellWeight,
} from "@/hooks/useBarbellWeight";

interface BarbellOption {
  kg: number;
  label: string;
  barWidth: number;
}

const OPTIONS: ReadonlyArray<BarbellOption> = [
  { kg: 20, label: "남자 기준", barWidth: 60 },
  { kg: 15, label: "여자 기준", barWidth: 52 },
  { kg: 10, label: "기술 바", barWidth: 44 },
  { kg: 7, label: "유소년 바", barWidth: 36 },
];

function BarbellWeightPage() {
  const { data: currentWeight, isLoading } = useBarbellWeight();
  const { mutate: saveWeight, isPending: isSaving } = useSaveBarbellWeight();

  const handleSelect = (kg: number) => {
    if (kg === currentWeight || isSaving) return;
    saveWeight(kg, {
      onSuccess: () => toast.success(`${kg}kg로 저장했어요.`),
      onError: () => toast.error("저장 중 오류가 발생했습니다."),
    });
  };

  return (
    <main className="flex flex-col gap-4 max-w-md mx-auto pb-24 pt-2 px-0">
      <div className="flex items-center justify-between px-4 pt-2 pb-1">
        <Link
          href={ROUTES.SETTINGS.ROOT}
          className="flex items-center gap-1 text-yd-text-muted text-[14px] font-medium"
        >
          <ChevronLeft className="size-4" aria-hidden />
          설정
        </Link>
      </div>

      <header className="px-5">
        <h1 className="text-h1">바 무게</h1>
        <p className="mt-1.5 text-caption text-yd-text-muted">
          원판 계산에 사용됩니다.
        </p>
      </header>

      <section className="px-4 flex flex-col gap-2.5">
        {OPTIONS.map((option) => {
          const selected = currentWeight === option.kg;
          return (
            <button
              key={option.kg}
              type="button"
              onClick={() => handleSelect(option.kg)}
              disabled={isLoading || isSaving}
              aria-pressed={selected}
              className={`flex h-[92px] items-center justify-between rounded-md border px-4 text-left transition-colors disabled:opacity-60 ${
                selected
                  ? "border-yd-primary bg-yd-primary/10"
                  : "border-yd-line hover:bg-yd-elevated"
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <RadioDot selected={selected} />
                <div className="flex flex-col items-start gap-0.5">
                  <span className="text-[18px] font-bold">{option.kg} kg</span>
                  <span className="text-[11px] text-yd-text-muted">
                    {option.label}
                  </span>
                </div>
              </div>
              <MiniBar width={option.barWidth} />
            </button>
          );
        })}
      </section>

      <p className="px-5 pt-2 text-[11px] leading-[1.5] text-yd-text-muted">
        프로그램 러너와 PR 데이의 원판 계산에 반영됩니다.
      </p>
    </main>
  );
}

function RadioDot({ selected }: { selected: boolean }) {
  return (
    <span
      className={`flex size-[22px] shrink-0 items-center justify-center rounded-full border-2 ${
        selected ? "border-yd-primary" : "border-yd-line"
      }`}
      aria-hidden
    >
      {selected && <span className="size-[10px] rounded-full bg-yd-primary" />}
    </span>
  );
}

function MiniBar({ width }: { width: number }) {
  return (
    <span
      className="flex items-center gap-0.5 shrink-0 text-yd-text-muted"
      aria-hidden
    >
      <span className="block h-[18px] w-1 rounded-[1px] bg-current" />
      <span
        className="block h-[6px] rounded-[1px] bg-current"
        style={{ width }}
      />
      <span className="block h-[18px] w-1 rounded-[1px] bg-current" />
    </span>
  );
}

export default BarbellWeightPage;
