"use client";

import { useState } from "react";
import {
  personalRecordAtom,
  selectedLiftAtom,
} from "@/entities/training/atoms/liftsAtom";
import { useAtom, useAtomValue } from "jotai";
import Link from "next/link";
import { ROUTES } from "@/routes";
import {
  numericStringSchema,
  recordSchema,
} from "@/shared/form/validationSchemas";
import { Input } from "@/components/ui/input/input";
import { Label } from "@radix-ui/react-label";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRouter } from "next/navigation";

export default function AddRecords() {
  const router = useRouter();
  const [personalRecord, setPersonalRecord] = useAtom(personalRecordAtom);
  const [record, setRecord] = useState(personalRecord);
  const [errors, setErrors] = useState<{ clean?: string; snatch?: string }>({});
  // TODO: 화면 그려진 뒤 값 가져와서 flash 발생함.
  const selectedLift = useAtomValue(selectedLiftAtom);

  const validateAllInputs = () => {
    const { success, error } = recordSchema.safeParse(record);

    if (!success) {
      const newErrors: { clean?: string; snatch?: string } = {};
      error.issues.forEach((issue) => {
        const key = issue.path[0] as "clean" | "snatch";
        newErrors[key] = issue.message;
      });
      setErrors(newErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleInputChange = (key: "clean" | "snatch", value: string) => {
    const numericValidation = numericStringSchema.safeParse(value);
    if (!numericValidation.success) {
      setErrors((prev) => ({
        ...prev,
        [key]: numericValidation.error.errors[0]?.message,
      }));
      return;
    }

    setRecord((prev) => ({
      ...prev,
      [key]: value === "" ? undefined : Number(value),
    }));
  };

  const handleNext = () => {
    if (!validateAllInputs()) return;
    setPersonalRecord(record);
    router.push(ROUTES.TRAINING.PROGRAM_INPUT);
  };

  return (
    <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-2 flex items-center">
          <Link href={ROUTES.TRAINING.SELECT_LIFT}>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground !px-1"
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
            {(selectedLift === "clean-and-jerk" || selectedLift === "both") && (
              <div className="space-y-2">
                <Label htmlFor="clean-and-jerk-pr" className="toss-label">
                  클린 앤 저크 개인 기록 (kg)
                </Label>

                <Input
                  id="clean-and-jerk-pr"
                  type="number"
                  value={record.clean}
                  placeholder="무게를 kg 단위로 입력하세요."
                  onChange={(e) => {
                    handleInputChange("clean", e.target.value);

                    if (errors.clean)
                      setErrors((prev) => ({
                        ...prev,
                        clean: undefined,
                      }));
                  }}
                />

                {/* TODO: border 컬러 적용안되는 이슈 개선 */}
                {errors.clean && (
                  <Alert variant="destructive" className="mt-2 rounded-xl">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errors.clean}</AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {(selectedLift === "snatch" || selectedLift === "both") && (
              <div className="space-y-2">
                <Label htmlFor="snatch-pr" className="toss-label">
                  스내치 개인 기록 (kg)
                </Label>
                <Input
                  id="snatch-pr"
                  type="number"
                  placeholder="무게를 kg 단위로 입력하세요"
                  value={record.snatch}
                  onChange={(e) => {
                    handleInputChange("snatch", e.target.value);

                    if (errors.snatch)
                      setErrors((prev) => ({
                        ...prev,
                        snatch: undefined,
                      }));
                  }}
                />

                {errors.snatch && (
                  <Alert variant="destructive" className="mt-2 rounded-xl">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errors.snatch}</AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            <Button
              type="button"
              // TODO: bg-primary 적용 안됨
              className="w-full h-12 rounded-xl text-base font-semibold bg-primary"
              disabled={!!errors.clean || !!errors.snatch}
              onClick={handleNext}
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
