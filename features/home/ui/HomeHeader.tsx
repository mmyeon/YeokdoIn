"use client";

interface HomeHeaderProps {
  date: string;
  greeting: string;
  initial?: string;
  streak?: string;
}

export function HomeHeader({
  date,
  greeting,
  initial = "J",
  streak,
}: HomeHeaderProps) {
  return (
    <div className="flex items-start justify-between px-5 pt-[6px] pb-1">
      <div className="flex flex-col gap-0.5">
        <span className="text-[11px] uppercase tracking-[0.12em] text-[var(--yd-text-muted)]">
          {date}
        </span>
        <span className="text-2xl font-bold -tracking-[0.025em] text-[var(--yd-text)]">
          {greeting}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {streak && (
          <div className="flex items-center gap-1 rounded-full border border-[var(--yd-line)] bg-[var(--yd-surface)] px-[9px] py-1">
            <span className="text-[11px] font-bold text-[var(--yd-pr)]">●</span>
            <span className="font-mono text-[11px] font-semibold text-[var(--yd-text)]">
              {streak}
            </span>
          </div>
        )}
        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--yd-line)] bg-[var(--yd-surface)] text-[13px] font-bold text-[var(--yd-text)]">
          {initial}
        </div>
      </div>
    </div>
  );
}
