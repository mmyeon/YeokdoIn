"use client";

import Link from "next/link";
import { ROUTES } from "@/routes";

export interface PRItem {
  name: string;
  kg: number;
  trend?: string | null;
  fresh?: boolean;
}

interface PRBoardProps {
  items: PRItem[];
}

const DEFAULT_SLOTS = ["인상", "용상", "백스쿼트"] as const;

export function PRBoard({ items }: PRBoardProps) {
  const byName = new Map(items.map((i) => [i.name, i]));

  return (
    <div className="flex gap-2 px-4">
      {DEFAULT_SLOTS.map((name) => {
        const pr = byName.get(name);
        return pr ? <FilledSlot key={name} pr={pr} /> : <EmptySlot key={name} name={name} />;
      })}
    </div>
  );
}

function FilledSlot({ pr }: { pr: PRItem }) {
  return (
    <div className="relative flex flex-1 flex-col gap-1 overflow-hidden rounded-[14px] border border-[var(--yd-line)] bg-[var(--yd-surface)] p-3">
      {pr.fresh && (
        <div
          className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[var(--yd-pr)]"
          style={{ boxShadow: "0 0 8px var(--yd-pr)" }}
        />
      )}
      <span className="text-[10px] font-semibold text-[var(--yd-text-muted)]">
        {pr.name}
      </span>
      <div className="flex items-baseline gap-[3px]">
        <span className="text-[22px] font-bold -tracking-[0.023em] text-[var(--yd-text)]">
          {pr.kg}
        </span>
        <span className="text-[10px] text-[var(--yd-text-muted)]">kg</span>
      </div>
      {pr.trend && (
        <span className="font-mono text-[10px] font-semibold text-[var(--yd-pr)]">
          ▲ {pr.trend}
        </span>
      )}
    </div>
  );
}

function EmptySlot({ name }: { name: string }) {
  return (
    <Link
      href={ROUTES.SETTINGS.PERSONAL_RECORD}
      className="flex flex-1 flex-col gap-1.5 rounded-[14px] border border-dashed border-[var(--yd-line)] bg-[var(--yd-surface)] px-3 py-4"
    >
      <span className="text-[10px] font-semibold text-[var(--yd-text-muted)]">
        {name}
      </span>
      <div className="flex items-baseline gap-[3px]">
        <span className="text-[22px] font-bold -tracking-[0.023em] text-[var(--yd-text-dim)]">
          —
        </span>
        <span className="text-[10px] text-[var(--yd-text-dim)]">kg</span>
      </div>
      <span className="text-[10px] font-semibold text-[var(--yd-primary)]">
        + 기록
      </span>
    </Link>
  );
}
