"use client";

import { useState } from "react";
import { personalRecordAtom } from "@/entities/training/atoms/liftsAtom";
import { useAtom } from "jotai";
import { ROUTES } from "@/routes";
import { numericStringSchema } from "@/shared/form/schemas";
import { Input } from "@/components/ui/input/input";
import { Label } from "@radix-ui/react-label";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { Lift } from "@/types/training";
import { LIFT_INFO_MAP } from "@/shared/constants";
import FormAlert from "@/components/FormAlert";

export default function AddRecords() {
  const router = useRouter();
  const [personalRecord, setPersonalRecord] = useAtom(personalRecordAtom);
  const [snatchError, setSnatchError] = useState<string | null>(null);
  const [cleanError, setCleanError] = useState<string | null>(null);

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
    !personalRecord.cleanAndJerk || !personalRecord.snatch;

  return (
    <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">개인 기록을 알려주세요.</h1>
          <p className="text-muted-foreground">
            개인 기록을 바탕으로 훈련 중량을 계산해 드릴게요.
          </p>
        </div>

        <Card className="toss-card">
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="clean-and-jerk-pr" className="toss-label">
                {LIFT_INFO_MAP["cleanAndJerk"]} 개인 기록 (kg)
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
              {cleanError && <FormAlert errorMessage={cleanError} />}
            </div>

            <div className="space-y-2">
              <Label htmlFor="snatch-pr" className="toss-label">
                {LIFT_INFO_MAP["snatch"]} 개인 기록 (kg)
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

              {snatchError && <FormAlert errorMessage={snatchError} />}
            </div>

            <Button
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
