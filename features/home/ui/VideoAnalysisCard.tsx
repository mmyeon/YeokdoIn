"use client";

import Link from "next/link";
import { ROUTES } from "@/routes";

interface VideoAnalysisCardProps {
  usedThisMonth?: number;
}

export function VideoAnalysisCard({
  usedThisMonth = 0,
}: VideoAnalysisCardProps) {
  return (
    <div className="px-4 pb-4">
      <Link
        href={ROUTES.TRAINING.MOVEMENT_ANALYSIS}
        className="flex items-center gap-3 rounded-[14px] border border-[var(--yd-line)] bg-[var(--yd-surface)] p-3.5"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-[var(--yd-line)] bg-[var(--yd-elevated)] text-base text-[var(--yd-primary)]">
          ▶
        </div>
        <div className="flex flex-1 flex-col gap-0.5">
          <span className="text-[13px] font-semibold text-[var(--yd-text)]">
            리프트 분석
          </span>
          <span className="text-[10px] text-[var(--yd-text-muted)]">
            바 경로 · 템포 · 이달 {usedThisMonth}회 사용
          </span>
        </div>
        <span className="text-sm text-[var(--yd-text-muted)]">›</span>
      </Link>
    </div>
  );
}
