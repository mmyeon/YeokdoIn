"use client";

import Link from "next/link";
import { ROUTES } from "@/routes";

interface Step {
  n: string;
  title: string;
  sub: string;
  href: string;
  primary?: boolean;
}

const STEPS: Step[] = [
  {
    n: "01",
    title: "프로그램 추가",
    sub: "붙여넣기 · 스캔 · 빈 프로그램",
    href: ROUTES.TRAINING.PROGRAM_INPUT,
    primary: true,
  },
  {
    n: "02",
    title: "자기 기록 입력",
    sub: "인상 · 용상 · 스쿼트",
    href: ROUTES.SETTINGS.PERSONAL_RECORD,
  },
  {
    n: "03",
    title: "영상 촬영",
    sub: "바 경로 · 템포 분석",
    href: ROUTES.TRAINING.MOVEMENT_ANALYSIS,
  },
];

export function FirstTimeHero() {
  return (
    <div className="px-4 pt-[14px] pb-[6px]">
      <div className="flex flex-col gap-[14px] rounded-[18px] border border-[var(--yd-line)] bg-[var(--yd-surface)] p-[18px]">
        <div className="flex items-center gap-2.5">
          <span
            className="h-2 w-2 rounded-full bg-[var(--yd-primary)]"
            style={{ boxShadow: "0 0 10px var(--yd-primary)" }}
          />
          <span className="text-[10px] font-bold tracking-[0.14em] text-[var(--yd-primary)]">
            시작하기
          </span>
        </div>

        <div>
          <div className="text-[22px] font-bold leading-[1.15] -tracking-[0.027em] text-[var(--yd-text)]">
            세 가지 방법으로 시작하세요
          </div>
          <div className="mt-1.5 text-xs leading-[1.5] text-[var(--yd-text-muted)]">
            프로그램 추가, PR 기록, 영상 분석 — 하나부터 시작하세요
          </div>
        </div>

        <div className="mt-0.5 flex flex-col gap-2">
          {STEPS.map((s) => (
            <Link
              key={s.n}
              href={s.href}
              className="flex items-center gap-3 rounded-xl border px-3 py-2.5"
              style={{
                background: s.primary
                  ? "var(--yd-primary-subtle)"
                  : "var(--yd-elevated)",
                borderColor: s.primary
                  ? "color-mix(in srgb, var(--yd-primary) 27%, transparent)"
                  : "var(--yd-line)",
              }}
            >
              <span
                className="w-5 font-mono text-[11px] font-bold"
                style={{
                  color: s.primary
                    ? "var(--yd-primary)"
                    : "var(--yd-text-muted)",
                }}
              >
                {s.n}
              </span>
              <div className="flex flex-1 flex-col gap-px">
                <span className="text-[13px] font-semibold text-[var(--yd-text)]">
                  {s.title}
                </span>
                <span className="text-[10px] text-[var(--yd-text-muted)]">
                  {s.sub}
                </span>
              </div>
              <span
                className="text-sm"
                style={{
                  color: s.primary
                    ? "var(--yd-primary)"
                    : "var(--yd-text-dim)",
                }}
              >
                ›
              </span>
            </Link>
          ))}
        </div>

        <Link
          href={ROUTES.TRAINING.PROGRAM_INPUT}
          className="mt-0.5 flex items-center justify-between rounded-xl bg-[var(--yd-primary)] px-4 py-[13px] text-[var(--yd-on-primary)]"
        >
          <span className="text-sm font-bold">+ 첫 프로그램 추가</span>
          <span className="text-sm">›</span>
        </Link>
      </div>
    </div>
  );
}
