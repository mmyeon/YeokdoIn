"use client";

import { useState } from "react";
import {
  personalRecordAtom,
  selectedLiftAtom,
} from "@/entities/training/atoms/liftsAtom";
import { useAtom, useAtomValue } from "jotai";
import Link from "next/link";
import { ROUTES } from "@/routes";

const INPUT_ERROR_MESSAGE = "숫자만 입력해 주세요.";

export default function AddRecords() {
  const [personalRecord, setPersonalRecord] = useAtom(personalRecordAtom);
  const [record, setRecord] = useState(personalRecord);
  const selectedLift = useAtomValue(selectedLiftAtom);

  const hasClean = selectedLift === "clean-and-jerk";
  const hasSnatch = selectedLift === "snatch";

  const handleInputChange = (key: "clean" | "snatch", value: string) => {
    setRecord((prev) => ({
      ...prev,
      [key]: value === "" ? "" : Number(value),
    }));
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4  max-w-xs">
        <h1 className="mb-4 text-lg font-bold">당신의 PR을 알려주세요!</h1>
        <span>PR을 기준으로 훈련 중량을 계산해드려요.</span>

        {selectedLift === "both" && (
          <>
            <div className="mb-6">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="cleanPR"
              >
                Clean & Jerk PR (kg)
              </label>

              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                id="cleanPR"
                type="text"
                value={record.clean ?? ""}
                placeholder="Clean & Jerk PR 입력해 주세요."
                onChange={(e) => handleInputChange("clean", e.target.value)}
              />

              <span className="text-xs text-red-600 w-full block">
                {!record.clean ? INPUT_ERROR_MESSAGE : "\u00A0"}
              </span>
            </div>

            <div className="mb-6">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="snatchPR"
              >
                Snatch PR (kg)
              </label>

              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                id="snatchPR"
                type="text"
                value={record.snatch ?? ""}
                placeholder="Snatch PR 입력해주세요."
                onChange={(e) => handleInputChange("snatch", e.target.value)}
              />

              <span className="text-xs text-red-600 w-full block">
                {!record.snatch ? INPUT_ERROR_MESSAGE : "\u00A0"}
              </span>
            </div>
          </>
        )}

        {hasSnatch && (
          <div className="mb-6">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="snatchPR"
            >
              Snatch PR (kg)
            </label>

            {/* TODO: select로 바꿀 지 고민해보기. 가능 무게 : 바벨 무게 중 clean, snatch 무게 중 적은 무게에서 플레이트 무게인 5kg 뺀 무게. 완전 초보인 경우 처리 방법 고민 */}
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              id="snatchPR"
              type="text"
              value={record.snatch ?? ""}
              placeholder="Snatch PR 입력해주세요."
              onChange={(e) => handleInputChange("snatch", e.target.value)}
            />

            <span className="text-xs text-red-600 w-full block">
              {!record.snatch ? INPUT_ERROR_MESSAGE : "\u00A0"}
            </span>
          </div>
        )}

        {hasClean && (
          <div className="mb-6">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="cleanPR"
            >
              Clean & Jerk PR (kg)
            </label>

            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              id="cleanPR"
              type="text"
              value={record.clean ?? ""}
              placeholder="Clean & Jerk PR 입력해 주세요."
              onChange={(e) => handleInputChange("clean", e.target.value)}
            />

            <span className="text-xs text-red-600 w-full block">
              {!record.clean ? INPUT_ERROR_MESSAGE : "\u00A0"}
            </span>
          </div>
        )}

        <div className="mt-6 flex justify-center">
          <Link href={ROUTES.TRAINING.PROGRAM_INPUT}>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-blue-100 w-full"
              type="button"
              disabled={
                (hasSnatch && record.clean === 0) ||
                (hasClean && record.snatch === 0)
              }
              onClick={() => setPersonalRecord(record)}
            >
              다음
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
