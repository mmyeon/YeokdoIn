"use client";

import { useState } from "react";
import { StorageKey, useLocalStorage } from "../hooks/useLocalStorage";

const INPUT_ERROR_MESSAGE = "숫자만 입력해 주세요.";

export default function AddRecords({
  changeViewMode,
}: {
  changeViewMode: () => void;
}) {
  const { getLocalStorageItem, removeLocalStorageItem, setLocalStorageItem } =
    useLocalStorage();
  const [cleanRecord, setCleanRecord] = useState<string>(
    getLocalStorageItem("cleanRecord"),
  );
  const [snatchRecord, setSnatchRecord] = useState<string>(
    getLocalStorageItem("snatchRecord"),
  );
  const selectedLift = getLocalStorageItem("selectedLift");
  const lift = selectedLift ? selectedLift.split(",") : [];

  const hasClean = lift.includes("clean");
  const hasSnatch = lift.includes("snatch");

  function handleDelete(keys: string[]) {
    keys.forEach((key) => {
      const itemKey = `${key}Record` as StorageKey;
      removeLocalStorageItem(itemKey);
    });
    setCleanRecord("");
    setSnatchRecord("");
  }

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
        {hasSnatch && (
          <div className="mb-6">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="snatchRecord"
            >
              Snatch Record (Kg)
            </label>

            {/* TODO: 바벨 무게 최소값이 15니까, 개인 기록이 바벨 무게 이상 입력되어야 함 */}
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              id="snatchRecord"
              type="text"
              value={snatchRecord}
              placeholder="Snatch PR 입력해 주세요."
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
              Clean & Jerk Record (Kg)
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

        <div className="flex flex-row gap-4 w-full">
          <button
            className="bg-red-400 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-red-100"
            type="button"
            disabled={snatchRecord === "" && cleanRecord === ""}
            onClick={() => handleDelete(lift)}
          >
            기록 삭제
          </button>

          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-blue-100"
            type="button"
            disabled={
              (hasSnatch && snatchRecord === "") ||
              (hasClean && cleanRecord === "")
            }
            onClick={changeViewMode}
          >
            훈련 중량 선택
          </button>
        </div>
      </div>
    </div>
  );
}
