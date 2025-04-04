"use client";

import Link from "next/link";
import { useState } from "react";
import {
  barWeightAtom,
  programPercentagesAtom,
} from "@/entities/training/atoms/liftsAtom";
import { useAtom } from "jotai";
import { ROUTES } from "@/routes";
import {
  barWeightSchema,
  numericStringSchema,
} from "@/shared/form/validationSchemas";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/input/label";
import { Input } from "@/components/ui/input/input";
import { AlertCircle, ArrowLeft, ArrowRight, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const PERCENTAGES = [50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100]; // 퍼센트 옵션

const ProgramInput = () => {
  const [percentages, setPercentages] = useAtom(programPercentagesAtom);

  const [barWeightError, setBarWeightError] = useState<string | null>(null);
  const [percentageError, setPercentageError] = useState<string | null>(null);

  const [barWeight, setBarWeight] = useAtom(barWeightAtom);

  const handleBarWeightChange = (value: string) => {
    const numericValidation = numericStringSchema.safeParse(value);

    if (!numericValidation.success) {
      setBarWeightError(numericValidation.error.errors[0].message);
      return;
    }

    const parsedValue = value === "" ? undefined : Number(value);

    setBarWeight(parsedValue);

    const { success, error } = barWeightSchema.safeParse(parsedValue);

    if (success) {
      setBarWeightError(null);
    } else {
      setBarWeightError(error.errors[0].message);
    }
  };

  const addPercentage = (value: number) => {
    setPercentages((prev) => [
      ...prev,
      { id: Date.now(), percent: Number(value) },
    ]);
  };

  const handleDeletePercentage = (id: number) => {
    const updatedPercentages = percentages.filter((item) => item.id !== id);
    setPercentages(updatedPercentages);

    if (updatedPercentages.length === 0) {
      setPercentageError("최소 1개의 프로그램을 선택하세요.");
    }
  };

  return (
    <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-2 flex items-center">
          <Link href={ROUTES.TRAINING.PERSONAL_RECORD}>
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <ArrowLeft className="h-4 w-4 mr-1" />
              뒤로
            </Button>
          </Link>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">
            훈련 프로그램을 설정해볼까요?
          </h1>
          <p className="text-muted-foreground">
            바벨 무게와 훈련 강도를 입력해 주세요.
          </p>
        </div>

        <Card className="toss-card">
          <CardContent className="p-6 space-y-6">
            <Label htmlFor="clean-and-jerk-pr" className="toss-label">
              바벨 무게 (kg)
            </Label>

            <Input
              id="clean-and-jerk-pr"
              type="number"
              value={barWeight ?? ""}
              placeholder="무게를 kg 단위로 입력하세요."
              onChange={(e) => {
                handleBarWeightChange(e.target.value);

                if (barWeightError) setBarWeightError(null);
              }}
            />

            {/* TODO: border 컬러 적용안되는 이슈 개선 */}
            {barWeightError && (
              <Alert variant="destructive" className="mt-2 rounded-xl">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{barWeightError}</AlertDescription>
              </Alert>
            )}

            <Label htmlFor="clean-and-jerk-pr" className="toss-label">
              훈련 강도 (%)
            </Label>

            <Select
              onValueChange={(value) => {
                addPercentage(Number(value));
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={"프로그램 %를 입력하세요."} />
              </SelectTrigger>
              <SelectContent>
                {PERCENTAGES.map((percent) => (
                  <SelectItem key={percent} value={String(percent)}>
                    {percent}%
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Label htmlFor="clean-and-jerk-pr" className="toss-label">
              선택된 프로그램 강도 (%)
            </Label>

            <div className="flex flex-wrap gap-2 p-4 bg-secondary/50 rounded-xl">
              {percentages.length === 0 ? (
                <p className="text-sm text-gray-500">
                  선택된 프로그램이 없습니다.
                </p>
              ) : (
                percentages.map(({ percent, id }) => (
                  <Badge
                    key={`${percent}-${id}`}
                    className="toss-badge toss-badge-blue flex items-center gap-1 py-1.5 px-3"
                  >
                    {percent}%
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 hover:bg-transparent ml-1"
                      onClick={() => handleDeletePercentage(id)}
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">제거</span>
                    </Button>
                  </Badge>
                  // <div
                  //   key={item.id}
                  //   className="w-fit bg-gray-600 px-3.5 py-1  text-white rounded-xl text-sm flex gap-2 font-bold"
                  // >
                  //   {item.percent}%{" "}
                  //   <button onClick={() => handleDeletePercentage(item.id)}>
                  //     X
                  //   </button>
                  // </div>
                ))
              )}
            </div>

            {percentageError && (
              <Alert variant="destructive" className="mt-2 rounded-xl">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{percentageError}</AlertDescription>
              </Alert>
            )}

            <Link href={ROUTES.TRAINING.WEIGHT_CALCULATOR} className="w-full">
              <Button
                type="button"
                className="w-full h-12 rounded-xl text-base font-semibold bg-primary"
                disabled={percentages.length == 0}
              >
                다음
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default ProgramInput;
