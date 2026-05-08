"use client";

import Link from "next/link";
import { ROUTES } from "@/routes";

interface IdleHeroProps {
  savedProgramsCount: number;
}

export function IdleHero({ savedProgramsCount }: IdleHeroProps) {
  return (
    <div className="px-4 pt-[14px] pb-1">
      <div className="flex flex-col gap-2.5 rounded-[18px] border border-[var(--yd-line)] bg-[var(--yd-surface)] p-[18px]">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--yd-text-muted)]">
            No program today
          </span>
          <span className="text-[11px] text-[var(--yd-text-muted)]">
            Open session
          </span>
        </div>

        <div className="text-[22px] font-bold leading-[1.15] -tracking-[0.027em] text-[var(--yd-text)]">
          What are you doing today?
        </div>

        <div className="mt-1 flex gap-2">
          <Link
            href={ROUTES.TRAINING.PROGRAM_INPUT}
            className="flex flex-[2] flex-col gap-0.5 rounded-xl bg-[var(--yd-primary)] px-3.5 py-[13px] text-[var(--yd-on-primary)]"
          >
            <span className="text-sm font-bold">▶ Start from library</span>
            <span className="text-[10px] opacity-75">
              {savedProgramsCount} saved programs
            </span>
          </Link>
          <Link
            href={ROUTES.TRAINING.WEIGHT_CALCULATOR}
            className="flex flex-1 flex-col justify-center gap-0.5 rounded-xl border border-[var(--yd-line)] bg-[var(--yd-elevated)] px-3.5 py-[13px]"
          >
            <span className="text-[13px] font-semibold text-[var(--yd-text)]">
              ✎ Free
            </span>
            <span className="text-[10px] text-[var(--yd-text-muted)]">
              Blank session
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
