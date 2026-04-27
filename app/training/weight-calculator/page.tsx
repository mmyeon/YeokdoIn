"use client";

import { useMemo, useState } from "react";
import { useAtomValue } from "jotai";
import {
  personalRecordAtom,
  programPercentagesAtom,
} from "@/entities/training/atoms/liftsAtom";
import { Lift, WeightPercentage } from "@/types/training";
import CalculationCards from "./CalculationCards";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LIFT_INFO } from "@/shared/constants";
import { useBarbellWeight } from "@/hooks/useBarbellWeight";
import { calculatePlates } from "@/features/programs/model/plates";

/**
 * 프로그램 퍼센트와 개인 기록(PR)을 기반으로 각 프로그램의 중량과 플레이트 조합을 계산합니다.
 *
 * @param pr - 개인 기록(PR, Personal Record) 값 (예: Snatch 또는 Clean & Jerk)
 * @param percentages - 프로그램 퍼센트 배열 (각 퍼센트 값과 ID 포함)
 * @param barWeight - 바벨의 기본 무게 (예: 20kg, 15kg 등)
 * @returns {WeightList[]} - 각 프로그램 퍼센트에 대한 중량(totalWeight)과 플레이트 조합(plates)을 포함한 객체
 */
const calculateProgramWeight = (
  pr: number,
  percentages: WeightPercentage[],
  barWeight: number
) => {
  return percentages.map((program) => {
    const totalWeight = Math.ceil((pr * program.percent) / 100);
    const remainingWeight = totalWeight - barWeight;

    return {
      ...program,
      totalWeight,
      plates: calculatePlates(remainingWeight),
    };
  });
};

const WeightCalculator = () => {
  const { data: barbellData } = useBarbellWeight();

  const personalRecord = useAtomValue(personalRecordAtom);
  const programPercentages = useAtomValue(programPercentagesAtom);

  const [currentLift, setCurrentLift] = useState<Lift>("cleanAndJerk");

  const allWeights = useMemo(() => {
    return {
      cleanAndJerk: calculateProgramWeight(
        Number(personalRecord.cleanAndJerk) ?? 0,
        programPercentages,
        barbellData ?? 0
      ),
      snatch: calculateProgramWeight(
        Number(personalRecord.snatch) ?? 0,
        programPercentages,
        barbellData ?? 0
      ),
    };
  }, [barbellData, personalRecord, programPercentages]);

  return (
    <main className="p-4 mt-6">
      <div className="w-full max-w-md mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">훈련 시작할 준비되셨나요?</h1>
          <p className="text-muted-foreground">
            개인 기록을 바탕으로 계산된 훈련 중량을 확인하세요.
          </p>
        </div>

        <Tabs
          value={currentLift}
          onValueChange={(value) => setCurrentLift(value as Lift)}
        >
          <TabsList className="grid grid-cols-2 h-12 mb-6 w-full">
            {LIFT_INFO.map((liftInfo) => (
              <TabsTrigger
                key={liftInfo.value}
                value={liftInfo.value}
                className="text-base"
              >
                {liftInfo.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="cleanAndJerk">
            <CalculationCards
              weightList={allWeights[currentLift]}
              lift={currentLift}
            />
          </TabsContent>

          <TabsContent value="snatch">
            <CalculationCards
              weightList={allWeights[currentLift]}
              lift={currentLift}
            />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
};

export default WeightCalculator;
