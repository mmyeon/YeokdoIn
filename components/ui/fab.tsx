import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const fabVariants = cva(
  "fixed z-40 inline-flex items-center justify-center rounded-full font-medium shadow-lg transition-transform hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yd-focus disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      tone: {
        primary: "bg-yd-primary text-yd-on-primary shadow-yd-primary/30",
        pr: "bg-yd-pr text-yd-on-pr shadow-yd-pr/30",
      },
      size: {
        md: "h-14 w-14 text-2xl",
        sm: "h-12 w-12 text-xl",
      },
      position: {
        "bottom-right": "right-5 bottom-24",
        "bottom-center": "left-1/2 -translate-x-1/2 bottom-24",
      },
    },
    defaultVariants: {
      tone: "primary",
      size: "md",
      position: "bottom-right",
    },
  }
);

interface FabProps
  extends Omit<React.ComponentProps<"button">, "size">,
    VariantProps<typeof fabVariants> {
  asChild?: boolean;
}

function Fab({ className, tone, size, position, asChild = false, children, ...props }: FabProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="fab"
      type={asChild ? undefined : "button"}
      className={cn(fabVariants({ tone, size, position }), className)}
      {...props}
    >
      {children ?? "+"}
    </Comp>
  );
}

export { Fab, fabVariants };
export type { FabProps };
