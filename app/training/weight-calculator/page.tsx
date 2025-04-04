"use client";

import { useMemo, useState } from "react";
import { useAtomValue } from "jotai";
import {
  barWeightAtom,
  personalRecordAtom,
  programPercentagesAtom,
  selectedLiftAtom,
} from "@/entities/training/atoms/liftsAtom";
import {
  Lift,
  PersonalRecord,
  Plates,
  WeightPercentage,
} from "@/types/training";
import CalculationCards from "./CalculationCards";
import { ArrowLeft, Home } from "lucide-react";
import { ROUTES } from "@/routes";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LIFT_INFO, LIFT_INFO_MAP } from "@/shared/constants";

const AVAILABLE_PLATES: Plates = [0.5, 1, 1.5, 2, 2.5, 5, 10, 15, 20, 25];

function calculatePlates(totalWeight: number, barbellWeight: number): Plates {
  let remainingWeight = totalWeight - barbellWeight;
  if (remainingWeight <= 0) return []; // 바벨 무게보다 가벼우면 계산할 필요 없음

  const plates: Plates = [];

  // 남은 무게를 가장 큰 플레이트부터 반복적으로 채우기
  for (const plate of AVAILABLE_PLATES) {
    const doublePlate = plate * 2; // 양쪽에 같은 무게의 플레이트를 사용하므로 두 배로 계산
    while (remainingWeight >= doublePlate) {
      plates.push(plate);
      remainingWeight -= plate * 2;
    }
  }

  return plates;
}

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
  barWeight: number,
) => {
  return percentages.map((program) => {
    const totalWeight = Math.ceil((pr * program.percent) / 100);

    return {
      ...program,
      totalWeight,
      plates: calculatePlates(totalWeight, barWeight),
    };
  });
};

const getCardTitle = (lift: Lift, pr: PersonalRecord) => {
  return `${
    lift === "cleanAndJerk" ? "클린 앤 저크" : "스내치"
  } (개인 기록: ${pr[lift]}kg)`;
};

const WeightCalculator = () => {
  const selectedLift = useAtomValue(selectedLiftAtom);
  const barWeight = useAtomValue(barWeightAtom);
  const personalRecord = useAtomValue(personalRecordAtom);

  const programPercentages = useAtomValue(programPercentagesAtom);

  const [activeTab, setActiveTab] = useState<Lift>(
    selectedLift !== "snatch" ? "cleanAndJerk" : "snatch",
  );

  const allWeights = useMemo(() => {
    return {
      cleanAndJerk: calculateProgramWeight(
        Number(personalRecord.cleanAndJerk) ?? 0,
        programPercentages,
        barWeight ?? 0,
      ),
      snatch: calculateProgramWeight(
        Number(personalRecord.snatch) ?? 0,
        programPercentages,
        barWeight ?? 0,
      ),
    };
  }, [barWeight, personalRecord, programPercentages]);

  return (
    <>
      <main className="container mx-auto flex min-h-screen flex-col items-center p-4">
        <div className="w-full max-w-3xl ">
          <div className="mb-2 flex items-center">
            <Link href={ROUTES.TRAINING.PROGRAM_INPUT}>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground p-0 h-auto"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                뒤로
              </Button>
            </Link>
          </div>

          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-1">
              훈련 시작할 준비되셨나요?
            </h1>
            <p className="text-muted-foreground">
              개인 기록을 바탕으로 계산된 훈련 중량을 확인하세요.
            </p>
          </div>

          {selectedLift === "both" ? (
            <Tabs
              value={activeTab}
              onValueChange={(value) => setActiveTab(value as Lift)}
              className="w-full"
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
                  weightList={allWeights[activeTab]}
                  title={`${LIFT_INFO_MAP[activeTab]} (개인 기록: ${personalRecord[activeTab]}kg)`}
                />
              </TabsContent>

              <TabsContent value="snatch">
                <CalculationCards
                  weightList={allWeights[activeTab]}
                  title={`${LIFT_INFO_MAP[activeTab]} (개인 기록: ${personalRecord[activeTab]}kg)`}
                />
              </TabsContent>
            </Tabs>
          ) : (
            <CalculationCards
              weightList={allWeights[activeTab]}
              title={getCardTitle(activeTab, personalRecord)}
            />
          )}

          <div className="flex justify-end mt-8">
            <Link href={ROUTES.TRAINING.SELECT_LIFT}>
              <Button>
                <Home className="h-4 w-4 mr-2" />
                홈으로
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
};

export default WeightCalculator;
