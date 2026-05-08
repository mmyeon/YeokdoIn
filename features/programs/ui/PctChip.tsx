'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

const PCT_OPTIONS: (number | null)[] = [
  null, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 110, 115, 120,
];

interface PctChipProps {
  value: number | null;
  onChange: (next: number | null) => void;
  ariaLabel?: string;
}

export function PctChip({ value, onChange, ariaLabel }: PctChipProps) {
  const [open, setOpen] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [customDraft, setCustomDraft] = useState('');
  const customInputRef = useRef<HTMLInputElement>(null);
  const committedRef = useRef(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      setShowCustom(false);
      setCustomDraft('');
    }
  }, [open]);

  useEffect(() => {
    if (showCustom) customInputRef.current?.focus();
  }, [showCustom]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  useEffect(() => {
    if (!showCustom) committedRef.current = false;
  }, [showCustom]);

  const commitCustom = () => {
    if (committedRef.current) return;
    committedRef.current = true;
    const parsed = parseInt(customDraft, 10);
    if (Number.isInteger(parsed) && parsed >= 1 && parsed <= 200) {
      onChange(parsed);
    }
    setShowCustom(false);
    setOpen(false);
  };

  const displayText = value == null ? '—' : `${value}%`;
  const isLarge = value !== null && value >= 100;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex h-11 w-full items-center justify-center gap-1 rounded-[10px] border border-yd-line bg-yd-bg px-2.5 font-mono font-bold',
          isLarge ? 'text-[13px]' : 'text-[15px]',
          value == null ? 'text-yd-text-dim' : 'text-yd-primary',
        )}
      >
        {displayText}
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
          {showCustom ? (
            <div className="border-t border-yd-line px-3.5 py-2">
              <input
                ref={customInputRef}
                type="number"
                min={1}
                max={200}
                value={customDraft}
                onChange={(e) => setCustomDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitCustom();
                  if (e.key === 'Escape') setOpen(false);
                }}
                onBlur={commitCustom}
                placeholder="e.g. 125"
                className="w-full bg-transparent font-mono text-[14px] font-semibold text-yd-text outline-none placeholder:text-yd-text-dim"
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowCustom(true)}
              className="block w-full border-t border-yd-line px-3.5 py-2.5 text-left font-mono text-[13px] text-yd-text-muted"
            >
              Custom...
            </button>
          )}
        </div>
      )}
    </div>
  );
}
