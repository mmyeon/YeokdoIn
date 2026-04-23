import * as React from "react";

import { cn } from "@/lib/utils";

interface SectionBannerProps extends Omit<React.ComponentProps<"div">, "title"> {
  letter: React.ReactNode;
  title: React.ReactNode;
  sub?: React.ReactNode;
}

function SectionBanner({
  letter,
  title,
  sub,
  className,
  ...props
}: SectionBannerProps) {
  return (
    <div
      data-slot="section-banner"
      className={cn(
        "mb-6 flex items-center gap-4 border-b border-yd-line px-2 py-5",
        className
      )}
      {...props}
    >
      <div
        aria-hidden
        className="flex h-12 w-12 items-center justify-center rounded-[10px] bg-yd-primary-subtle text-[22px] font-bold text-yd-primary"
      >
        {letter}
      </div>
      <div>
        <div className="text-[22px] font-bold leading-none tracking-[-0.4px] text-yd-text">
          {title}
        </div>
        {sub && (
          <div className="mt-1.5 text-xs uppercase tracking-[0.4px] text-yd-text-muted">
            {sub}
          </div>
        )}
      </div>
    </div>
  );
}

export { SectionBanner };
export type { SectionBannerProps };
