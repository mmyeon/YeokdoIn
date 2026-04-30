'use client';

import { useEffect, useMemo, useState } from 'react';
import { Input } from '@/components/ui/input/input';
import { MOVEMENT_GROUPS } from '@/features/programs/model/movements';

interface MovementPickerSheetProps {
  open: boolean;
  onClose: () => void;
  onPick: (movement: string) => void;
}

export function MovementPickerSheet({
  open,
  onClose,
  onPick,
}: MovementPickerSheetProps) {
  const [q, setQ] = useState('');

  useEffect(() => {
    if (!open) setQ('');
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return null;
    const all = MOVEMENT_GROUPS.flatMap((g) => g.items);
    return all.filter((m) => m.toLowerCase().includes(query));
  }, [q]);

  if (!open) return null;

  return (
    <div className="fixed top-0 bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 flex flex-col">
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="absolute inset-0 bg-black/55"
      />
      <div className="relative mt-auto flex max-h-[85vh] flex-col rounded-t-[20px] border border-b-0 border-yd-line bg-yd-bg">
        <div className="flex justify-center py-2">
          <div className="h-1 w-10 rounded-full bg-yd-line" />
        </div>
        <div className="flex items-center justify-between px-4 pb-2.5">
          <button
            type="button"
            onClick={onClose}
            className="text-[14px] text-yd-text-muted"
          >
            취소
          </button>
          <h2 className="text-[15px] font-bold text-yd-text">동작 선택</h2>
          <div className="w-9" />
        </div>
        <div className="px-4 pb-2.5">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="동작 검색…"
            className="h-11 rounded-xl border-yd-line bg-yd-surface"
            autoFocus
          />
        </div>
        <div className="min-h-0 flex-1 overflow-auto px-4 pb-5">
          {filtered ? (
            <div className="flex flex-col gap-0.5">
              {filtered.map((m) => (
                <MovementRow key={m} movement={m} onClick={() => onPick(m)} />
              ))}
              {filtered.length === 0 && (
                <p className="p-5 text-center text-[13px] text-yd-text-muted">
                  일치하는 동작이 없어요
                </p>
              )}
            </div>
          ) : (
            MOVEMENT_GROUPS.map((g) => (
              <div key={g.category} className="mb-3.5">
                <span className="mb-1.5 block px-0.5 text-[10px] uppercase tracking-[1px] text-yd-text-muted">
                  {g.category}
                </span>
                <div className="flex flex-col gap-0.5">
                  {g.items.map((m) => (
                    <MovementRow
                      key={m}
                      movement={m}
                      onClick={() => onPick(m)}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function MovementRow({
  movement,
  onClick,
}: {
  movement: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-[10px] border border-yd-line bg-yd-surface px-3 py-3 text-left hover:bg-yd-elevated"
    >
      <span className="text-[14px] font-semibold text-yd-text">{movement}</span>
      <span className="text-[14px] text-yd-text-dim">›</span>
    </button>
  );
}
