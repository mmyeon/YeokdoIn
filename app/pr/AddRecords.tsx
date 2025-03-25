"use client";

import { useState } from "react";
import { StorageKey, useLocalStorage } from "../hooks/useLocalStorage";

const INPUT_ERROR_MESSAGE = "숫자만 입력해 주세요.";

export default function AddRecords({
  changeViewMode,
}: {
  changeViewMode: () => void;
}) {
  const { getLocalStorageItem, setLocalStorageItem } = useLocalStorage();
  const [cleanRecord, setCleanRecord] = useState<string>(
    getLocalStorageItem("cleanRecord"),
  );
  const [snatchRecord, setSnatchRecord] = useState<string>(
    getLocalStorageItem("snatchRecord"),
  );
  const selectedLift = getLocalStorageItem("selectedLift");

  const hasClean = selectedLift === "clean-and-jerk";
  const hasSnatch = selectedLift === "snatch";

  function handleInputValue(e: React.ChangeEvent<HTMLInputElement>) {
    const { id, value } = e.target;

    if (id === "snatchRecord") {
      setSnatchRecord(value.replace(/\D/g, ""));
    } else {
      setCleanRecord(value.replace(/\D/g, ""));
    }
  }

  function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
    const { id, value } = e.target;
    setLocalStorageItem(id as StorageKey, value);
  }

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
                htmlFor="cleanRecord"
              >
                Clean & Jerk PR (kg)
              </label>

              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                id="cleanRecord"
                type="text"
                value={cleanRecord}
                placeholder="Clean & Jerk PR 입력해 주세요."
                onBlur={handleBlur}
                onChange={handleInputValue}
              />

              <span className="text-xs text-red-600 w-full block">
                {!cleanRecord ? INPUT_ERROR_MESSAGE : "\u00A0"}
              </span>
            </div>

            <div className="mb-6">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="snatchRecord"
              >
                Snatch PR (kg)
              </label>

              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                id="snatchRecord"
                type="text"
                value={snatchRecord}
                placeholder="Snatch PR 입력해주세요."
                onBlur={handleBlur}
                onChange={handleInputValue}
              />

              <span className="text-xs text-red-600 w-full block">
                {!snatchRecord ? INPUT_ERROR_MESSAGE : "\u00A0"}
              </span>
            </div>
          </>
        )}

        {hasSnatch && (
          <div className="mb-6">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="snatchRecord"
            >
              Snatch PR (kg)
            </label>

            {/* TODO: select로 바꿀 지 고민해보기. 가능 무게 : 바벨 무게 중 clean, snatch 무게 중 적은 무게에서 플레이트 무게인 5kg 뺀 무게. 완전 초보인 경우 처리 방법 고민 */}
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              id="snatchRecord"
              type="text"
              value={snatchRecord}
              placeholder="Snatch PR 입력해주세요."
              onBlur={handleBlur}
              onChange={handleInputValue}
            />

            <span className="text-xs text-red-600 w-full block">
              {!snatchRecord ? INPUT_ERROR_MESSAGE : "\u00A0"}
            </span>
          </div>
        )}

        {hasClean && (
          <div className="mb-6">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="cleanRecord"
            >
              Clean & Jerk PR (kg)
            </label>

            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              id="cleanRecord"
              type="text"
              value={cleanRecord}
              placeholder="Clean & Jerk PR 입력해 주세요."
              onBlur={handleBlur}
              onChange={handleInputValue}
            />

            <span className="text-xs text-red-600 w-full block">
              {!cleanRecord ? INPUT_ERROR_MESSAGE : "\u00A0"}
            </span>
          </div>
        )}

        <div className="mt-6 flex justify-center">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-blue-100 w-full"
            type="button"
            disabled={
              (hasSnatch && snatchRecord === "") ||
              (hasClean && cleanRecord === "")
            }
            onClick={changeViewMode}
          >
            다음
          </button>
        </div>
      </div>
    </div>
  );
}
