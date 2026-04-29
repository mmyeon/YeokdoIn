import * as React from "react";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

interface SetDotProps extends React.ComponentProps<"div"> {
  done?: boolean;
  size?: number;
}

function SetDot({ done = false, size = 28, className, style, ...props }: SetDotProps) {
  return (
    <div
      data-slot="set-dot"
      data-state={done ? "done" : "pending"}
      aria-label={done ? "completed set" : "pending set"}
      className={cn(
        "flex items-center justify-center rounded-full border-2 transition-colors",
        done ? "border-yd-success bg-yd-success text-yd-on-success" : "border-yd-line bg-transparent",
        className
      )}
      style={{ width: size, height: size, ...style }}
      {...props}
    >
      {done && <Check strokeWidth={3} style={{ width: size * 0.5, height: size * 0.5 }} />}
    </div>
  );
}

export { SetDot };
export type { SetDotProps };
