"use client";

import Link from "next/link";
import { ReactNode } from "react";

interface SectionLabelProps {
  children: ReactNode;
  actionLabel?: string;
  actionHref?: string;
}

export function SectionLabel({
  children,
  actionLabel,
  actionHref,
}: SectionLabelProps) {
  return (
    <div className="flex items-baseline justify-between px-5 pt-[14px] pb-2">
      <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--yd-text-muted)]">
        {children}
      </span>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="text-[11px] font-semibold text-[var(--yd-primary)]"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
