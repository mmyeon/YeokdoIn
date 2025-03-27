"use client";

import Link from "next/link";
import { useState } from "react";
import {
  barWeightAtom,
  programPercentagesAtom,
} from "@/entities/training/atoms/liftsAtom";
import { useAtom, useSetAtom } from "jotai";
import { ROUTES } from "@/routes";
import { WeightPercentage } from "@/types/training";
import {
  barWeightSchema,
  numericStringSchema,
} from "@/shared/form/validationSchemas";

const PERCENTAGES = [50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100]; // 퍼센트 옵션

const ProgramInput = () => {
  const [selectedPercentage, setSelectedPercentage] = useState<string>("");
  const [selectedPercentageList, setSelectedPercentageList] = useState<
    WeightPercentage[]
  >([]);
  const [barWeightError, setBarWeightError] = useState<string | null>(null); // 에러 상태 추가

  const [barWeight, setBarWeight] = useAtom(barWeightAtom);
  const setProgramPercentages = useSetAtom(programPercentagesAtom);

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
            className="border p-2 rounded mt-2"
            type="text"
            value={barWeight ?? ""}
            onChange={(e) => handleBarWeightChange(e.target.value)}
            placeholder="바벨 무게를 입력해 주세요."
          />

          {barWeightError && (
            <span className="text-red-500 text-sm mt-1">{barWeightError}</span>
          )}
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
          href={ROUTES.TRAINING.WEIGHT_CALCULATOR}
          className="w-full"
          onClick={() => setProgramPercentages(selectedPercentageList)}
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

export default ProgramInput;
