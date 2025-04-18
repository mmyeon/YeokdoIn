"use client";

import { ROUTES } from "@/routes";
import { AlignJustify, Dumbbell, Home, PersonStanding } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const BUTTONS = [
  {
    icon: <Home />,
    text: "홈",
    route: ROUTES.HOME,
  },
  {
    icon: <Dumbbell />,
    text: "훈련",
    route: ROUTES.TRAINING.WEIGHT_CALCULATOR,
  },
  {
    icon: <PersonStanding />,
    text: "자세 분석",
    route: ROUTES.TRAINING.POSTURE_ANALYSIS,
  },
  {
    icon: <AlignJustify />,
    text: "전체",
    route: ROUTES.HOME,
  },
];

const Menu = () => {
  const pathname = usePathname();

  return (
    <div className="absolute bottom-0 left-0 right-0 max-w-md w-full bg-white rounded-t-3xl border-2 border-gray-100 border-b-0 mx-auto">
      <div className="flex items-center justify-between p-2 ml-10 mr-10">
        {BUTTONS.map((button, index) => (
          <Link
            key={index}
            className={`flex flex-col items-center justify-center gap-1 cursor-pointer ${pathname === button.route ? "text-black" : "text-gray-500"}`}
            href={button.route}
          >
            {button.icon}

            <span className="text-xs font-bold">{button.text}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Menu;
