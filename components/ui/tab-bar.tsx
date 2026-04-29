import * as React from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface TabBarItem {
  key: string;
  label: string;
  href: string;
  icon: LucideIcon;
}

interface TabBarProps extends React.ComponentProps<"nav"> {
  items: ReadonlyArray<TabBarItem>;
  activeKey?: string;
}

function TabBar({ items, activeKey, className, ...props }: TabBarProps) {
  return (
    <nav
      data-slot="tab-bar"
      aria-label="Primary"
      className={cn(
        "fixed inset-x-0 bottom-0 z-30 flex h-16 items-center justify-around border-t border-yd-line bg-yd-surface pb-1",
        className
      )}
      {...props}
    >
      {items.map((item) => {
        const active = item.key === activeKey;
        const Icon = item.icon;
        return (
          <Link
            key={item.key}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex flex-col items-center gap-0.5 px-3 py-1 transition-colors",
              active ? "text-yd-primary" : "text-yd-text-muted hover:text-yd-text"
            )}
          >
            <Icon className="h-5 w-5" aria-hidden />
            <span className={cn("text-[11px]", active ? "font-semibold" : "font-medium")}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

export { TabBar };
export type { TabBarProps, TabBarItem };
