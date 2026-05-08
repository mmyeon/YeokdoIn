"use client";

import { useRouter } from "next/navigation";
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
  { kg: 20, label: "Men's standard", barWidth: 60 },
  { kg: 15, label: "Women's standard", barWidth: 52 },
  { kg: 7, label: "Training bar", barWidth: 40 },
];

function BarbellWeightPage() {
  const router = useRouter();
  const { data: currentWeight, isLoading } = useBarbellWeight();
  const { mutate: saveWeight, isPending: isSaving } = useSaveBarbellWeight();

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(ROUTES.SETTINGS.ROOT);
    }
  };

  const handleSelect = (kg: number) => {
    if (kg === currentWeight || isSaving) return;
    saveWeight(kg, {
      onSuccess: () => toast.success(`Saved ${kg}kg.`),
      onError: () => toast.error("Failed to save."),
    });
  };

  return (
    <main className="flex flex-col gap-4 max-w-md mx-auto pb-24 pt-2 px-0">
      <div className="flex items-center justify-between px-4 pt-2 pb-1">
        <button
          type="button"
          onClick={handleBack}
          aria-label="Back"
          className="-ml-1 flex items-center gap-1 rounded-md px-2 py-1.5 text-yd-text-muted text-[14px] font-medium hover:bg-yd-elevated"
        >
          <ChevronLeft className="size-4" aria-hidden />
          Settings
        </button>
      </div>

      <header className="px-5">
        <h1 className="text-h1">Bar Weight</h1>
        <p className="mt-1.5 text-caption text-yd-text-muted">
          Used for plate calculation.
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
        Reflected in plate calculations for the program runner and PR day.
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
