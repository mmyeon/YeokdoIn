"use client";

import Link from "next/link";
import { useState } from "react";
import { programPercentagesAtom } from "@/entities/training/atoms/liftsAtom";
import { useAtom } from "jotai";
import { ROUTES } from "@/routes";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/input/label";
import { ArrowRight, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import FormAlert from "@/components/FormAlert";

const PERCENTAGES = [50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100]; // 퍼센트 옵션

const ProgramInput = () => {
  const [percentages, setPercentages] = useAtom(programPercentagesAtom);

  const [percentageError, setPercentageError] = useState<string | null>(null);

  const addPercentage = (value: number) => {
    setPercentages((prev) => [
      ...prev,
      { id: Date.now(), percent: Number(value) },
    ]);
    setPercentageError(null);
  };

  const handleDeletePercentage = (id: number) => {
    const updatedPercentages = percentages.filter((item) => item.id !== id);
    setPercentages(updatedPercentages);

    if (updatedPercentages.length === 0) {
      setPercentageError("최소 1개의 프로그램을 선택하세요.");
    }
  };

  return (
    <main className="flex flex-col p-4 mt-6 gap-6">
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">
            훈련 프로그램을 설정해볼까요?
          </h1>
          <p className="text-muted-foreground">훈련 강도를 입력해 주세요.</p>
        </div>

        <Card className="toss-card">
          <CardContent className="p-6 space-y-6">
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
                    </Button>
                  </Badge>
                ))
              )}
            </div>

            {percentageError && <FormAlert errorMessage={percentageError} />}

            <Button
              type="button"
              className="w-full h-12 rounded-xl text-base font-semibold bg-primary"
              disabled={percentages.length == 0}
              asChild
            >
              <Link href={ROUTES.TRAINING.WEIGHT_CALCULATOR} className="w-full">
                다음
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default ProgramInput;
