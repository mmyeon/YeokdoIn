"use client";

import Link from "next/link";
import { ROUTES } from "@/routes";

export interface ProgramLibraryItem {
  id: number | string;
  title: string;
  meta: string;
  pct: number;
  active: boolean;
}

interface ProgramLibraryPreviewProps {
  items: ProgramLibraryItem[];
}

export function ProgramLibraryPreview({ items }: ProgramLibraryPreviewProps) {
  return (
    <div className="flex flex-col gap-1.5 px-4">
      {items.map((p) => (
        <Link
          key={p.id}
          href={ROUTES.TRAINING.PROGRAM_RUNNER(p.id)}
          className="flex items-center gap-3 rounded-xl border border-[var(--yd-line)] bg-[var(--yd-surface)] px-3.5 py-3"
        >
          <div className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--yd-line)] bg-[var(--yd-elevated)]">
            <span
              className="font-mono text-[10px] font-bold"
              style={{
                color: p.active
                  ? "var(--yd-primary)"
                  : "var(--yd-text-muted)",
              }}
            >
              {p.pct}%
            </span>
          </div>
          <div className="flex flex-1 flex-col gap-0.5">
            <span className="text-[13px] font-semibold text-[var(--yd-text)]">
              {p.title}
            </span>
            <span className="text-[10px] text-[var(--yd-text-muted)]">
              {p.meta}
            </span>
          </div>
          {p.active && (
            <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-[var(--yd-primary)] px-2.5 py-[3px] text-[11px] font-medium text-[var(--yd-primary)]">
              이어서 ›
            </span>
          )}
        </Link>
      ))}

      <Link
        href={ROUTES.TRAINING.PROGRAM_INPUT}
        className="flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-[var(--yd-line)] px-3.5 py-2.5"
      >
        <span className="text-[13px] font-semibold text-[var(--yd-primary)]">
          + 프로그램 추가
        </span>
      </Link>
    </div>
  );
}
