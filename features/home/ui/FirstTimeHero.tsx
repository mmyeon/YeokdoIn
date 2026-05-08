"use client";

import { useRouter } from "next/navigation";
import { ROUTES, REDIRECT_TO_KEY } from "@/routes";

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
    title: "Add Program",
    sub: "Paste · Scan · Blank",
    href: ROUTES.TRAINING.PROGRAM_INPUT,
    primary: true,
  },
  {
    n: "02",
    title: "Enter Personal Records",
    sub: "Snatch · Clean & Jerk · Squat",
    href: ROUTES.SETTINGS.PERSONAL_RECORD,
  },
  {
    n: "03",
    title: "Record Video",
    sub: "Bar path · Tempo analysis",
    href: ROUTES.TRAINING.MOVEMENT_ANALYSIS,
  },
];

interface FirstTimeHeroProps {
  isAuthenticated: boolean;
}

export function FirstTimeHero({ isAuthenticated }: FirstTimeHeroProps) {
  const router = useRouter();

  function navigate(href: string) {
    if (!isAuthenticated) {
      router.push(`${ROUTES.AUTH.LOGIN}?${REDIRECT_TO_KEY}=${encodeURIComponent(href)}`);
      return;
    }
    router.push(href);
  }

  return (
    <div className="px-4 pt-[14px] pb-[6px]">
      <div className="flex flex-col gap-[14px] rounded-[18px] border border-[var(--yd-line)] bg-[var(--yd-surface)] p-[18px]">
        <div className="flex items-center gap-2.5">
          <span
            className="h-2 w-2 rounded-full bg-[var(--yd-primary)]"
            style={{ boxShadow: "0 0 10px var(--yd-primary)" }}
          />
          <span className="text-[10px] font-bold tracking-[0.14em] text-[var(--yd-primary)]">
            Get Started
          </span>
        </div>

        <div>
          <div className="text-[22px] font-bold leading-[1.15] -tracking-[0.027em] text-[var(--yd-text)]">
            Start with any of these
          </div>
          <div className="mt-1.5 text-xs leading-[1.5] text-[var(--yd-text-muted)]">
            Add a program, log PRs, or analyze video — start with one
          </div>
        </div>

        <div className="mt-0.5 flex flex-col gap-2">
          {STEPS.map((s) => (
            <button
              key={s.n}
              onClick={() => navigate(s.href)}
              className="flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left"
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
            </button>
          ))}
        </div>

        <button
          onClick={() => navigate(ROUTES.TRAINING.PROGRAM_INPUT)}
          className="mt-0.5 flex items-center justify-between rounded-xl bg-[var(--yd-primary)] px-4 py-[13px] text-[var(--yd-on-primary)]"
        >
          <span className="text-sm font-bold">+ Add First Program</span>
          <span className="text-sm">›</span>
        </button>
      </div>
    </div>
  );
}
