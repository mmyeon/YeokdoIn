"use client";

import { useMemo, useState } from "react";
import { WeightPercentage } from "../WeightSelect";
import { useLocalStorage } from "@/app/hooks/useLocalStorage";

type TabInfo = {
  type: "clean" | "snatch";
  label: string;
};

const tabInfo: TabInfo[] = [
  { type: "clean", label: "Clean And Jerk" },
  { type: "snatch", label: "Snatch" },
]; // 탭 정보

interface WeightList extends WeightPercentage {
  totalWeight: number;
  plates: PlateOption[];
}

type PlateOption = {
  weight: number;
  color: string;
};

const getSizeFromWeight = (weight: number) => {
  if (weight >= 2.5) return 18;
  if (weight === 1.5) return 13;
  if (weight === 1) return 12;
  return 10;
};

const getPlateFontSize = (weight: number) => {
  if (weight >= 2.5) return "lg";
  return "xs";
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
  const tabItems = selectedLift ? selectedLift.split(",") : [];
  const [activeTab, setActiveTab] = useState<"clean" | "snatch">(
    tabItems.includes("snatch") ? "snatch" : "clean",
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
      <div className="flex border-b mb-4">
        {tabItems.map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 ${activeTab === tab ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-500"}`}
            onClick={() => setActiveTab(tab as "clean" | "snatch")}
          >
            {tabInfo.find((info) => info.type === tab)?.label}
          </button>
        ))}
      </div>

      {/* 결과 테이블 */}
      <table className="w-full border-collapse border border-gray-300 mt-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">중량 비율</th>
            <th className="border p-2">계산된 중량</th>
            <th className="border p-2">필요한 플레이트 무게</th>
          </tr>
        </thead>
        <tbody>
          {weightList.map((item, index) => (
            <tr key={index} className="text-center">
              <td className="border p-2">{item.percent}%</td>
              <td className="border p-2">
                {item.totalWeight}kg{" "}
                {index >= 1 && (
                  <span className="bg-gray-200 text-gray-800 font-bold text-sm rounded-xl px-2 py-1 inline-block mx-1">
                    {item.totalWeight - weightList[index - 1].totalWeight > 0
                      ? "+"
                      : ""}
                    {item.totalWeight - weightList[index - 1].totalWeight}
                    kg
                  </span>
                )}
              </td>

              <td className="flex -space-x-5 overflow-hidden  justify-center items-center border-r border-b">
                {item.plates.map((plateInfo, i) => {
                  return (
                    <div
                      key={i}
                      className="text-white rounded-full items-center justify-center inline-block size-10  ring-1 ring-white relative"
                      style={{
                        backgroundColor: plateInfo?.color,
                        width: `${0.25 * getSizeFromWeight(plateInfo.weight)}rem`,
                        height: `${0.25 * getSizeFromWeight(plateInfo.weight)}rem`,
                      }}
                    >
                      <div className="flex items-center justify-center flex-col">
                        <span
                          className={`text-${getPlateFontSize(plateInfo.weight)} font-bold absolute top-1/2 left-1 transform -translate-y-1/2`}
                        >
                          {plateInfo.weight}
                        </span>
                        <span
                          className={`text-${getPlateFontSize(plateInfo.weight)} font-bold rotate-180 absolute top-1/2 right-1 transform -translate-y-1/2`}
                        >
                          {plateInfo.weight}
                        </span>
                        <span className="w-3 h-3 bg-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></span>
                      </div>
                    </div>
                  );
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PRWeightCalculator;
