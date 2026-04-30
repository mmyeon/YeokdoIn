"use client";

import { ROUTES } from "@/routes";
import { Dumbbell, Settings, Video } from "lucide-react";
import { usePathname } from "next/navigation";

import { TabBar, type TabBarItem } from "@/components/ui/tab-bar";

const ITEMS: ReadonlyArray<TabBarItem> = [
  { key: "workout", label: "운동", href: ROUTES.HOME, icon: Dumbbell },
  {
    key: "video",
    label: "영상 분석",
    href: ROUTES.TRAINING.MOVEMENT_ANALYSIS,
    icon: Video,
  },
  { key: "settings", label: "설정", href: ROUTES.SETTINGS.ROOT, icon: Settings },
];

const resolveActiveKey = (pathname: string | null): string | undefined => {
  if (!pathname) return undefined;
  if (pathname === ROUTES.TRAINING.MOVEMENT_ANALYSIS) return "video";
  if (pathname.startsWith(ROUTES.SETTINGS.ROOT)) return "settings";
  if (pathname === ROUTES.HOME || pathname.startsWith("/training")) return "workout";
  return undefined;
};

const Menu = () => {
  const pathname = usePathname();

  if (
    pathname === "/login" ||
    pathname?.startsWith(`${ROUTES.SETTINGS.ROOT}/`) ||
    pathname?.startsWith("/training/program-runner/")
  ) {
    return null;
  }

  return <TabBar items={ITEMS} activeKey={resolveActiveKey(pathname)} />;
};

export default Menu;
