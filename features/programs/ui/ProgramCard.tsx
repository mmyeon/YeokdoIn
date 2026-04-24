'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { MoreHorizontal, Play } from 'lucide-react';
import { ROUTES } from '@/routes';
import type { LibraryItem } from '@/features/programs/model/library';
import { formatAbsoluteDate } from '@/features/programs/model/library';

interface ProgramCardProps {
  item: LibraryItem;
  onDelete: () => void;
}

export function ProgramCard({ item, onDelete }: ProgramCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const dateLabel = formatAbsoluteDate(item.createdAt);

  return (
    <div ref={ref} className="relative">
      <div className="flex flex-col gap-2.5 rounded-xl border border-yd-line bg-yd-surface px-3.5 py-3">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[12px] text-yd-text-muted">
            {dateLabel}
          </span>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="더 보기"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            className="-mr-1 flex size-8 shrink-0 items-center justify-center rounded-lg text-yd-text-dim hover:bg-yd-elevated"
          >
            <MoreHorizontal className="size-4" />
          </button>
        </div>

        {item.lines.length > 0 && (
          <ul className="flex flex-col gap-1">
            {item.lines.map((line, i) => (
              <li key={i} className="flex items-baseline gap-1.5">
                <span className="text-[10px] text-yd-primary">▸</span>
                <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-yd-text/95">
                  {line}
                </span>
              </li>
            ))}
          </ul>
        )}

        <Link
          href={ROUTES.TRAINING.PROGRAM_RUNNER(item.id)}
          aria-label={`${dateLabel} 프로그램 실행`}
          className="mt-1 flex h-11 items-center justify-center gap-2 rounded-[10px] bg-yd-primary text-yd-on-primary"
        >
          <Play className="size-3.5 fill-current" />
          <span className="text-[14px] font-bold -tracking-[0.2px]">실행</span>
        </Link>
      </div>
      {menuOpen && (
        <div
          role="menu"
          className="absolute right-1.5 top-11 z-10 min-w-[150px] rounded-[10px] border border-yd-line bg-yd-elevated p-1 shadow-3"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setMenuOpen(false);
              if (confirm('이 프로그램을 삭제하시겠습니까?')) onDelete();
            }}
            className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-[13px] text-yd-error hover:bg-yd-error-soft"
          >
            <span className="w-4 text-center opacity-80">🗑</span>
            삭제
          </button>
        </div>
      )}
    </div>
  );
}
