"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import useAuth from "@/features/auth/model/useAuth";
import { ROUTES } from "@/routes";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const SETTINGS_LIST = [
  {
    title: "개인 기록",
    route: ROUTES.SETTINGS.PERSONAL_RECORD,
  },
  {
    title: "훈련 목표",
    route: ROUTES.SETTINGS.GOALS,
  },
  {
    title: "바벨 무게",
    route: ROUTES.SETTINGS.BARBELL_WEIGHT,
  },
];

const Settings = () => {
  const { user } = useAuth();

  return (
    <main className="flex flex-col p-4 mt-6 gap-4 max-w-md mx-auto">
      <div className="flex gap-4 items-center">
        <Avatar className="w-16 h-16">
          {/* TODO: 아바타 변경 기능 추가 */}
          <AvatarImage
            src={
              user?.user_metadata?.profile ?? `https://github.com/shadcn.png`
            }
            alt="avatar"
          />
          <AvatarFallback>아바타</AvatarFallback>
        </Avatar>

        <div>
          <span className="text-xl font-bold">{user?.user_metadata?.name}</span>
          <p>{user?.user_metadata?.email}</p>
        </div>
      </div>

      <Card className="toss-card mt-6 p-0">
        <CardContent className="p-4 space-y-4">
          {SETTINGS_LIST.map((item) => (
            <Link
              key={item.title}
              className="flex items-center justify-between cursor-pointer text-muted-foreground hover:bg-gray-100 p-2.5 rounded-md font-bold"
              href={item.route}
            >
              <span>{item.title}</span>
              <ArrowRight />
            </Link>
          ))}
        </CardContent>
      </Card>
    </main>
  );
};

export default Settings;
