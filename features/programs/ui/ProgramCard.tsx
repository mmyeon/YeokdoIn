'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { MoreHorizontal, Play } from 'lucide-react';
import { ROUTES } from '@/routes';
import type { LibraryItem } from '@/features/programs/model/library';
import { formatRelativeDate } from '@/features/programs/model/library';

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

  return (
    <div ref={ref} className="relative">
      <div className="flex items-center gap-2.5 rounded-xl border border-yd-line bg-yd-surface px-3 py-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-semibold text-yd-text">
            {item.title}
          </p>
          <div className="mt-0.5 flex items-center gap-1.5">
            <span className="font-mono text-[11px] text-yd-text-muted">
              {formatRelativeDate(item.createdAt)}
            </span>
            <span className="text-[9px] text-yd-text-dim">•</span>
            <span className="min-w-0 flex-1 truncate text-[11px] text-yd-text-muted">
              {item.lines[0] ?? ''}
            </span>
          </div>
        </div>
        <Link
          href={ROUTES.TRAINING.PROGRAM_RUNNER(item.id)}
          aria-label={`${item.title} 실행`}
          className="flex h-[38px] shrink-0 items-center gap-1 rounded-[10px] bg-yd-primary px-3 text-[13px] font-bold text-yd-on-primary"
        >
          <Play className="size-3 fill-current" />
          실행
        </Link>
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="더 보기"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          className="flex size-8 shrink-0 items-center justify-center rounded-lg text-yd-text-dim hover:bg-yd-elevated"
        >
          <MoreHorizontal className="size-4" />
        </button>
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
