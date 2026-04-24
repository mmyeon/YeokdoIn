'use client';

import Link from 'next/link';
import { Play } from 'lucide-react';
import { ROUTES } from '@/routes';
import type { LibraryItem } from '@/features/programs/model/library';
import { formatRelativeDate } from '@/features/programs/model/library';

interface TodayCardProps {
  item: LibraryItem;
}

export function TodayCard({ item }: TodayCardProps) {
  return (
    <div className="relative overflow-hidden rounded-[14px] border border-yd-primary/30 bg-gradient-to-br from-yd-primary-soft to-transparent p-3.5">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-[radial-gradient(circle,var(--yd-primary-soft),transparent_70%)]"
      />
      <div className="relative mb-2 flex items-center gap-2">
        <span className="rounded-full bg-yd-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.5px] text-yd-on-primary">
          오늘
        </span>
        <span className="font-mono text-[11px] text-yd-text-muted">
          {formatRelativeDate(item.createdAt)}
        </span>
      </div>
      <h3 className="relative text-[18px] font-bold -tracking-[0.3px] text-yd-text">
        {item.title}
      </h3>
      <div className="relative mt-1.5 flex flex-col gap-1">
        {item.lines.slice(0, 3).map((line, i) => (
          <div key={i} className="flex items-baseline gap-1.5">
            <span className="text-[10px] text-yd-primary">▸</span>
            <span className="text-[12px] font-medium text-yd-text/95">
              {line}
            </span>
          </div>
        ))}
      </div>
      <Link
        href={ROUTES.TRAINING.PROGRAM_RUNNER(item.id)}
        className="relative mt-3 flex h-[52px] items-center justify-center gap-2 rounded-[10px] bg-yd-primary text-yd-on-primary shadow-[0_6px_20px_var(--yd-primary-soft)]"
      >
        <Play className="size-4 fill-current" />
        <span className="text-[15px] font-extrabold -tracking-[0.2px]">
          운동 시작
        </span>
      </Link>
    </div>
  );
}
