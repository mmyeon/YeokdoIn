"use client";

import { ROUTES } from "@/routes";
import { Dumbbell, Home, PersonStanding, Settings } from "lucide-react";
import { usePathname } from "next/navigation";

import { TabBar, type TabBarItem } from "@/components/ui/tab-bar";

const ITEMS: ReadonlyArray<TabBarItem> = [
  { key: "home", label: "홈", href: ROUTES.HOME, icon: Home },
  {
    key: "training",
    label: "훈련",
    href: ROUTES.TRAINING.WEIGHT_CALCULATOR,
    icon: Dumbbell,
  },
  {
    key: "analysis",
    label: "움직임 분석",
    href: ROUTES.TRAINING.MOVEMENT_ANALYSIS,
    icon: PersonStanding,
  },
  { key: "settings", label: "설정", href: ROUTES.SETTINGS.ROOT, icon: Settings },
];

const resolveActiveKey = (pathname: string | null): string | undefined => {
  if (!pathname) return undefined;
  if (pathname === ROUTES.HOME) return "home";
  if (pathname === ROUTES.TRAINING.MOVEMENT_ANALYSIS) return "analysis";
  if (pathname.startsWith("/training")) return "training";
  if (pathname.startsWith(ROUTES.SETTINGS.ROOT)) return "settings";
  return undefined;
};

const Menu = () => {
  const pathname = usePathname();

  if (pathname?.startsWith(`${ROUTES.SETTINGS.ROOT}/`)) {
    return null;
  }

  return <TabBar items={ITEMS} activeKey={resolveActiveKey(pathname)} />;
};

export default Menu;
