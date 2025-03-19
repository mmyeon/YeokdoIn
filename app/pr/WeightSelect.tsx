"use client";

import Link from "next/link";
import { useState } from "react";

export type WeightPercentage = {
  id: number;
  percent: number;
};

const BABEL_WEIGHTS = [15, 20, 25, 30]; // 바 무게 옵션
const PERCENTAGES = [50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100]; // 퍼센트 옵션
const DEFAULT_PERCENTAGES = 65;

const WeightSelection = () => {
  const [selectedPercentages, setSelectedPercentages] = useState<
    WeightPercentage[]
  >([]);

  const handleAddPercentage = () => {
    setSelectedPercentages([
      ...selectedPercentages,
      { id: Date.now(), percent: DEFAULT_PERCENTAGES },
    ]);
  };

  const handlePercentageChange = (id: number, value: number) => {
    setSelectedPercentages((prev) =>
      prev.map((item) => (item.id === id ? { ...item, percent: value } : item)),
    );
  };

  const handleDeletePercentage = (id: number) => {
    setSelectedPercentages((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="p-4 flex flex-col gap-4 justify-center items-center">
      <div>
        <div className="flex gap-4 items-center">
          <span className="block text-lg font-semibold">바벨 무게</span>
          <select
            name="barWeight"
            id="barWeight"
            className="border p-2 rounded mt-2"
            defaultValue={15}
            onChange={(e) => {
              localStorage.setItem("barWeight", e.target.value);
            }}
          >
            <>
              {BABEL_WEIGHTS.map((weight) => (
                <option key={weight} value={weight}>
                  {weight}kg
                </option>
              ))}
            </>
          </select>
        </div>

        <div className="mt-4">
          <span className="block text-lg font-semibold">
            프로그램 중량 설정 (%)
          </span>
          {selectedPercentages.map((item) => (
            <div key={item.id} className="flex items-center mt-2">
              <span className="w-12">
                {selectedPercentages.indexOf(item) + 1}
              </span>
              <select
                className="border p-2 rounded w-24"
                value={item.percent}
                onChange={(e) =>
                  handlePercentageChange(item.id, Number(e.target.value))
                }
              >
                {PERCENTAGES.map((percent) => (
                  <option key={percent} value={percent}>
                    {percent}%
                  </option>
                ))}
              </select>
              <button
                className="ml-2 text-red-500 font-bold"
                onClick={() => handleDeletePercentage(item.id)}
              >
                ❌
              </button>
            </div>
          ))}
        </div>

        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded w-full"
          onClick={handleAddPercentage}
        >
          + 추가
        </button>
      </div>

      <Link
        href="/pr/calculate"
        onClick={() =>
          localStorage.setItem(
            "programWeights",
            JSON.stringify(selectedPercentages),
          )
        }
      >
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded disabled:bg-blue-100"
          disabled={selectedPercentages.length == 0}
        >
          무게 계산하기
        </button>
      </Link>
    </div>
  );
};

export default WeightSelection;
