import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const pillVariants = cva(
  "inline-flex items-center gap-1 whitespace-nowrap rounded-full font-medium transition-colors",
  {
    variants: {
      tone: {
        neutral: "",
        primary: "",
        success: "",
        warn: "",
        error: "",
        info: "",
        pr: "",
      },
      variant: {
        outlined: "border bg-transparent",
        solid: "border-transparent",
        subtle: "border-transparent",
      },
      size: {
        sm: "px-2.5 py-[3px] text-[11px]",
        md: "px-3 py-[5px] text-xs",
      },
    },
    compoundVariants: [
      { tone: "neutral", variant: "outlined", class: "border-yd-line text-yd-text" },
      { tone: "primary", variant: "outlined", class: "border-yd-primary text-yd-primary" },
      { tone: "success", variant: "outlined", class: "border-yd-success text-yd-success" },
      { tone: "warn", variant: "outlined", class: "border-yd-warn text-yd-warn" },
      { tone: "error", variant: "outlined", class: "border-yd-error text-yd-error" },
      { tone: "info", variant: "outlined", class: "border-yd-info text-yd-info" },
      { tone: "pr", variant: "outlined", class: "border-yd-pr text-yd-pr" },

      { tone: "primary", variant: "solid", class: "bg-yd-primary text-yd-on-primary" },
      { tone: "success", variant: "solid", class: "bg-yd-success text-yd-on-success" },
      { tone: "warn", variant: "solid", class: "bg-yd-warn text-white" },
      { tone: "error", variant: "solid", class: "bg-yd-error text-yd-on-error" },
      { tone: "info", variant: "solid", class: "bg-yd-info text-white" },
      { tone: "pr", variant: "solid", class: "bg-yd-pr text-yd-on-pr" },
      { tone: "neutral", variant: "solid", class: "bg-yd-surface text-yd-text" },

      { tone: "primary", variant: "subtle", class: "bg-yd-primary-subtle text-yd-primary" },
      { tone: "success", variant: "subtle", class: "bg-yd-success-subtle text-yd-success" },
      { tone: "warn", variant: "subtle", class: "bg-yd-warn-subtle text-yd-warn" },
      { tone: "error", variant: "subtle", class: "bg-yd-error-subtle text-yd-error" },
      { tone: "info", variant: "subtle", class: "bg-yd-info-subtle text-yd-info" },
      { tone: "pr", variant: "subtle", class: "bg-yd-pr-subtle text-yd-pr" },
    ],
    defaultVariants: {
      tone: "neutral",
      variant: "outlined",
      size: "md",
    },
  }
);

interface PillProps
  extends React.ComponentProps<"span">,
    VariantProps<typeof pillVariants> {
  asChild?: boolean;
}

function Pill({ className, tone, variant, size, asChild = false, ...props }: PillProps) {
  const Comp = asChild ? Slot : "span";
  return (
    <Comp
      data-slot="pill"
      className={cn(pillVariants({ tone, variant, size }), className)}
      {...props}
    />
  );
}

export { Pill, pillVariants };
export type { PillProps };
