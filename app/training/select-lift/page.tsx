"use client";

import Link from "next/link";
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
    <main className="p-4 flex items-center justify-center min-h-dvh">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold mb-1">
            오늘 어떤 종목을 훈련하실 건가요?
          </h1>

          <p>훈련할 종목을 선택해 주세요!</p>
        </div>

        <Card className="toss-card overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4">
              {LIFT_OPTIONS.map(({ value, label }) => (
                <Button
                  className="w-full flex items-center space-x-3 p-4 rounded-xl bg-secondary/50 cursor-pointer hover:bg-secondary transition-colors text-primary font-bold"
                  key={value}
                  asChild
                >
                  <Link
                    href={ROUTES.TRAINING.PERSONAL_RECORD}
                    onClick={() => setSelectedLift(value)}
                  >
                    {label}
                  </Link>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
