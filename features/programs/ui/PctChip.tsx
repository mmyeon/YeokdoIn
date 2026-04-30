'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

const PCT_OPTIONS: (number | null)[] = [null, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100];

interface PctChipProps {
  value: number | null;
  onChange: (next: number | null) => void;
  ariaLabel?: string;
}

export function PctChip({ value, onChange, ariaLabel }: PctChipProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex h-11 w-full items-center justify-center gap-1 rounded-[10px] border border-yd-line bg-yd-bg px-2.5 font-mono text-[15px] font-bold',
          value == null ? 'text-yd-text-dim' : 'text-yd-primary',
        )}
      >
        {value == null ? '—' : `${value}%`}
        <span className="text-[9px] text-yd-text-dim">▾</span>
      </button>
      {open && (
        <div
          role="listbox"
          className="absolute left-0 top-12 z-30 max-h-[200px] min-w-[100px] overflow-auto rounded-[10px] border border-yd-line bg-yd-elevated shadow-2"
        >
          {PCT_OPTIONS.map((o, i) => {
            const selected = o === value;
            return (
              <button
                key={i}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => {
                  onChange(o);
                  setOpen(false);
                }}
                className={cn(
                  'block w-full px-3.5 py-2.5 text-left font-mono text-[14px] font-semibold text-yd-text',
                  selected && 'bg-yd-primary-subtle',
                )}
              >
                {o == null ? '—' : `${o}%`}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
