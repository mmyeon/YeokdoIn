'use client';

import { cn } from '@/lib/utils';

interface ChipGroupProps {
  label: string;
  options: readonly string[];
  selected: readonly string[];
  onToggle: (value: string) => void;
}

export function ChipGroup({ label, options, selected, onToggle }: ChipGroupProps) {
  return (
    <div>
      <span className="mb-1.5 block text-[10px] uppercase tracking-[0.8px] text-yd-text-muted">
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5">
        {options.map((m) => {
          const on = selected.includes(m);
          return (
            <button
              key={m}
              type="button"
              onClick={() => onToggle(m)}
              aria-pressed={on}
              className={cn(
                'rounded-full border px-3 py-1.5 text-[12px] font-medium whitespace-nowrap transition-colors',
                on
                  ? 'border-yd-primary bg-yd-primary text-yd-on-primary font-semibold'
                  : 'border-yd-line bg-transparent text-yd-text-muted',
              )}
            >
              {m}
            </button>
          );
        })}
      </div>
    </div>
  );
}
