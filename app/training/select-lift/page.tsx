"use client";

import Link from "next/link";
import Image from "next/image";
import "jotai-devtools/styles.css";
import { useSetAtom } from "jotai";
import { selectedLiftAtom } from "@/entities/training/atoms/liftsAtom";
import { ROUTES } from "@/routes";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LiftOptions } from "@/types/training";

const LIFT_OPTIONS: { label: string; value: LiftOptions }[] = [
  { label: "Clean And Jerk", value: "cleanAndJerk" },
  { label: "Snatch", value: "snatch" },
  { label: "Both (Snatch + Clean)", value: "both" },
];

export default function LiftSelection() {
  const setSelectedLift = useSetAtom(selectedLiftAtom);

  return (
    <main className="container min-h-screen p-4  flex items-center justify-center m-auto">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-6 w-50 h-50 rounded-full flex items-center justify-center">
            <Image
              src="/logo.svg"
              alt="YeokdoIn logo"
              width={300}
              height={300}
              priority
            />
          </div>

          <h1 className="text-2xl font-bold mb-1">
            오늘 어떤 종목을 훈련하실 건가요?
          </h1>

          <p>훈련할 종목을 선택해 주세요!</p>
        </div>

        <Card className="toss-card overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4">
              {LIFT_OPTIONS.map(({ value, label }) => (
                <Link
                  key={value}
                  href={ROUTES.TRAINING.PERSONAL_RECORD}
                  onClick={() => setSelectedLift(value)}
                >
                  <Button className="w-full flex items-center space-x-3 p-4 rounded-xl bg-secondary/50 cursor-pointer hover:bg-secondary transition-colors text-primary font-bold">
                    {label}
                  </Button>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
