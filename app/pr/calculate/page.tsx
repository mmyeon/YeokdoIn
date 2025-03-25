"use client";

import { useLocalStorage } from "@/app/hooks/useLocalStorage";
import { useMemo, useState } from "react";
import { WeightPercentage } from "../WeightSelect";
import CalculateCard from "@/app/components/CalculateCard";

type TabInfo = {
  value: "clean" | "snatch";
  label: string;
};

const tabInfo: TabInfo[] = [
  { value: "clean", label: "Clean And Jerk" },
  { value: "snatch", label: "Snatch" },
]; // 탭 정보

export interface WeightList extends WeightPercentage {
  totalWeight: number;
  plates: PlateOption[];
}

type PlateOption = {
  weight: number;
  color: string;
};

const PLATES_OPTIONS: PlateOption[] = [
  { weight: 25, color: "rgb(126, 50, 55)" },
  { weight: 20, color: "rgb(7, 73, 114)" },
  { weight: 15, color: "rgb(208, 183, 85)" },
  { weight: 10, color: "rgb(65, 104, 78)" },
  { weight: 5, color: "rgb(120, 54, 45)" },
  { weight: 2.5, color: "rgb(147, 54, 45)" },
  { weight: 2, color: "rgb(3, 72, 131)" },
  { weight: 1.5, color: "rgb(183, 165, 77)" },
  { weight: 1, color: "rgb(63, 106, 51)" },
  { weight: 0.5, color: "purple" },
];

function getPlateCombination(
  totalWeight: number,
  barbellWeight: number,
): PlateOption[] {
  let remainingWeight = totalWeight - barbellWeight;
  if (remainingWeight <= 0) return []; // 바벨 무게보다 가벼우면 계산할 필요 없음

  // 내림차순 정렬 (무거운 플레이트부터 사용)
  PLATES_OPTIONS.sort((a, b) => b.weight - a.weight);

  const plates: PlateOption[] = [];

  // 남은 무게를 가장 큰 플레이트부터 반복적으로 채우기
  for (const plate of PLATES_OPTIONS) {
    while (remainingWeight >= plate.weight * 2) {
      plates.push(plate);
      remainingWeight -= plate.weight * 2;
    }
  }

  return plates;
}

const PRWeightCalculator = () => {
  const { getLocalStorageItem } = useLocalStorage();
  const selectedLift = getLocalStorageItem("selectedLift");
  const barbelWeight = getLocalStorageItem("barbelWeight");
  const weightPercents = JSON.parse(
    getLocalStorageItem("programWeights") || "[]",
  ) as WeightPercentage[];

  const [activeTab, setActiveTab] = useState<"clean" | "snatch">(
    selectedLift !== "snatch" ? "clean" : "snatch",
  );

  const weightList: WeightList[] = useMemo(
    () =>
      weightPercents.map((weightPercent) => ({
        ...weightPercent,
        totalWeight: Math.ceil(
          (Number(JSON.parse(getLocalStorageItem(`${activeTab}Record`)!)) *
            Number(weightPercent.percent)) /
            100,
        ),
        plates: getPlateCombination(
          Math.ceil(
            (Number(JSON.parse(getLocalStorageItem(`${activeTab}Record`)!)) *
              Number(weightPercent.percent)) /
              100,
          ),
          Number(barbelWeight),
        ),
      })),
    [activeTab, barbelWeight, weightPercents, getLocalStorageItem],
  );

  return (
    <div className="p-4">
      <h2>훈련 중량</h2>

      {selectedLift === "both" && (
        <div className="flex border-b mb-4">
          {tabInfo.map((tab) => (
            <button
              key={tab.value}
              className={`px-4 py-2 ${activeTab === tab.value ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-500"}`}
              onClick={() =>
                setActiveTab(tab.value === "snatch" ? "snatch" : "clean")
              }
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Clean and Jerk (PR: 55kg) */}
      <h1 className="text-lg font-bold">{`${tabInfo.find((tab) => tab.value === activeTab)?.label} (PR: ${getLocalStorageItem(`${activeTab}Record`)}kg)`}</h1>

      <CalculateCard weightList={weightList} />
    </div>
  );
};

export default PRWeightCalculator;
