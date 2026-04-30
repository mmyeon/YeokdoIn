'use client';

interface BigStepperProps {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  ariaLabel?: string;
}

export function BigStepper({
  value,
  onChange,
  min = 1,
  max = 20,
  ariaLabel,
}: BigStepperProps) {
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max, value + 1));

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="flex h-11 items-center rounded-[10px] border border-yd-line bg-yd-bg"
    >
      <button
        type="button"
        aria-label="감소"
        onClick={dec}
        disabled={value <= min}
        className="flex h-full w-9 items-center justify-center text-[18px] font-medium text-yd-text-muted select-none disabled:opacity-40"
      >
        −
      </button>
      <div className="flex-1 text-center font-mono text-[17px] font-bold text-yd-text">
        {value}
      </div>
      <button
        type="button"
        aria-label="증가"
        onClick={inc}
        disabled={value >= max}
        className="flex h-full w-9 items-center justify-center text-[18px] font-semibold text-yd-primary select-none disabled:opacity-40"
      >
        +
      </button>
    </div>
  );
}
