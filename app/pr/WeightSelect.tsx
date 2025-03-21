"use client";

import Link from "next/link";
import { useState } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";

export type WeightPercentage = {
  id: number;
  percent: number;
};

export const BARBEL_OPTIONS = [15, 20, 25, 30]; // 바 무게 옵션
const PERCENTAGES = [50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100]; // 퍼센트 옵션

const WeightSelection = () => {
  const [selectedPercentage, setSelectedPercentage] = useState<string>("");
  const [selectedPercentageList, setSelectedPercentageList] = useState<
    WeightPercentage[]
  >([]);
  const { setLocalStorageItem } = useLocalStorage();

  const handleSelect = (percent: string) => {
    setSelectedPercentage(percent);
  };

  const updateSelectedPercentageList = () => {
    setSelectedPercentageList((prev) => [
      ...prev,
      { id: Date.now(), percent: Number(selectedPercentage) },
    ]);
  };

  const handleDeletePercentage = (id: number) => {
    setSelectedPercentageList((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="p-4 flex flex-col gap-4 justify-center items-center h-screen">
      <div>
        <h1 className="text-lg font-bold">훈련 프로그램을 설정해볼까요?</h1>
        <span>바벨 무게와 훈련 강도를 입력해 주세요.</span>
      </div>

      <div className="flex flex-col gap-4 max-w-md w-full">
        <div className="flex flex-col">
          <label className="font-semibold">바벨 무게(kg)</label>

          <input
            type="number"
            className="border p-2 rounded mt-2"
            onBlur={(e) => setLocalStorageItem("barbelWeight", e.target.value)}
            placeholder="바벨 무게를 입력해 주세요."
          />
        </div>

        <div className="flex flex-col gap-4">
          <label htmlFor="percentage-select" className="font-semibold">
            훈련 강도(%)
          </label>

          <div className="flex gap-4 justify-center">
            <select
              className="border flex-1"
              id="percentage-select"
              onChange={(e) => handleSelect(e.target.value)}
            >
              <option value="">훈련 강도를 선택해 주세요.</option>

              {PERCENTAGES.map((percent) => (
                <option key={percent} value={percent}>
                  {percent}%
                </option>
              ))}
            </select>

            <button
              className="px-4 py-2 bg-blue-500 text-white rounded"
              onClick={updateSelectedPercentageList}
              disabled={!selectedPercentage}
            >
              추가
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <span className="font-semibold">선택된 훈련 강도</span>

          <div className="flex gap-2 flex-wrap">
            {selectedPercentageList.map((item) => (
              <div
                key={item.id}
                className="w-fit bg-gray-600 px-3.5 py-1  text-white rounded-xl text-sm flex gap-2 font-bold"
              >
                {item.percent}%{" "}
                <button onClick={() => handleDeletePercentage(item.id)}>
                  X
                </button>
              </div>
            ))}
          </div>
        </div>

        <Link
          href="/pr/calculate"
          className="w-full"
          onClick={() =>
            setLocalStorageItem(
              "programWeights",
              JSON.stringify(selectedPercentageList),
            )
          }
        >
          <button
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded disabled:bg-blue-100 w-full"
            disabled={selectedPercentageList.length == 0}
          >
            다음
          </button>
        </Link>
      </div>
    </div>
  );
};

export default WeightSelection;
