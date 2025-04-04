"use client";

import { useState } from "react";
import {
  personalRecordAtom,
  selectedLiftAtom,
} from "@/entities/training/atoms/liftsAtom";
import { useAtom, useAtomValue } from "jotai";
import Link from "next/link";
import { ROUTES } from "@/routes";
import { numericStringSchema } from "@/shared/form/validationSchemas";
import { Input } from "@/components/ui/input/input";
import { Label } from "@radix-ui/react-label";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRouter } from "next/navigation";
import { Lift } from "@/types/training";
import { LIFT_INFO_MAP } from "@/shared/constants";

export default function AddRecords() {
  const router = useRouter();
  const [personalRecord, setPersonalRecord] = useAtom(personalRecordAtom);
  const [snatchError, setSnatchError] = useState<string | null>(null);
  const [cleanError, setCleanError] = useState<string | null>(null);
  // TODO: 화면 그려진 뒤 값 가져와서 flash 발생함.
  const selectedLift = useAtomValue(selectedLiftAtom);

  const handleInputChange = (key: Lift, value: string) => {
    const numericValidation = numericStringSchema.safeParse(value);

    if (!numericValidation.success) {
      if (key === "cleanAndJerk") {
        setCleanError(numericValidation.error.errors[0]?.message);
      } else if (key === "snatch") {
        setSnatchError(numericValidation.error.errors[0]?.message);
      }
      return;
    }

    if (key === "cleanAndJerk") {
      setCleanError(null);
    } else if (key === "snatch") {
      setSnatchError(null);
    }

    setPersonalRecord((prev) => ({
      ...prev,
      [key]: value === "" ? undefined : Number(value),
    }));
  };

  const isButtonDisabled =
    selectedLift === "cleanAndJerk"
      ? !personalRecord.cleanAndJerk
      : selectedLift === "snatch"
        ? !personalRecord.snatch
        : selectedLift === "both"
          ? !(personalRecord.cleanAndJerk && personalRecord.snatch)
          : true;

  return (
    <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-2 flex items-center">
          <Link href={ROUTES.TRAINING.SELECT_LIFT}>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:font-bold bg-none"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              뒤로
            </Button>
          </Link>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">개인 기록을 알려주세요.</h1>
          <p className="text-muted-foreground">
            개인 기록을 바탕으로 훈련 중량을 계산해 드릴게요.
          </p>
        </div>

        <Card className="toss-card">
          <CardContent className="p-6 space-y-6">
            {(selectedLift === "cleanAndJerk" || selectedLift === "both") && (
              <div className="space-y-2">
                <Label htmlFor="clean-and-jerk-pr" className="toss-label">
                  {LIFT_INFO_MAP[selectedLift]} 개인 기록 (kg)
                </Label>

                <Input
                  id="clean-and-jerk-pr"
                  type="number"
                  value={personalRecord.cleanAndJerk ?? ""}
                  placeholder="무게를 kg 단위로 입력하세요."
                  onChange={(e) => {
                    handleInputChange("cleanAndJerk", e.target.value);

                    if (cleanError) setCleanError(null);
                  }}
                />

                {/* TODO: border 컬러 적용안되는 이슈 개선 */}
                {cleanError && (
                  <Alert variant="destructive" className="mt-2 rounded-xl">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{cleanError}</AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {(selectedLift === "snatch" || selectedLift === "both") && (
              <div className="space-y-2">
                <Label htmlFor="snatch-pr" className="toss-label">
                  {LIFT_INFO_MAP[selectedLift]} 개인 기록 (kg)
                </Label>
                <Input
                  id="snatch-pr"
                  type="number"
                  placeholder="무게를 kg 단위로 입력하세요"
                  value={personalRecord.snatch ?? ""}
                  onChange={(e) => {
                    handleInputChange("snatch", e.target.value);

                    if (snatchError) setSnatchError(null);
                  }}
                />

                {snatchError && (
                  <Alert variant="destructive" className="mt-2 rounded-xl">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{snatchError}</AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            <Button
              type="button"
              // TODO: bg-primary 적용 안됨
              className="w-full h-12 rounded-xl text-base font-semibold bg-primary"
              disabled={isButtonDisabled}
              onClick={() => router.push(ROUTES.TRAINING.PROGRAM_INPUT)}
            >
              다음
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
