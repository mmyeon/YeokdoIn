"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type StorageKey = "cleanRecord" | "snatchRecord";

const INPUT_ERROR_MESSAGE = "숫자만 입력해 주세요.";

const getStorageItem = (key: StorageKey) => {
  const value = localStorage.getItem(key);
  return value ? JSON.parse(value) : "";
};

const setStorageItem = (key: StorageKey, value: unknown) => {
  if (value === "") return;
  localStorage.setItem(key, JSON.stringify(value));
};

const removeStorageItem = (key: StorageKey) => {
  localStorage.removeItem(key);
};

export default function AddRecords({
  changeViewMode,
}: {
  changeViewMode: () => void;
}) {
  const [cleanRecord, setCleanRecord] = useState<string>("");
  const [snatchRecord, setSnatchRecord] = useState<string>("");
  const searchParams = useSearchParams();
  const selected = searchParams.get("selected");
  const selectedList = selected ? selected.split(",") : [];

  const hasClean = selectedList.includes("clean");
  const hasSnatch = selectedList.includes("snatch");

  useEffect(() => {
    setCleanRecord(getStorageItem("cleanRecord"));
    setSnatchRecord(getStorageItem("snatchRecord"));
  }, []);

  function handleDelete(keys: string[]) {
    keys.forEach((key) => {
      const itemKey = `${key}Record` as StorageKey;
      removeStorageItem(itemKey);
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
    setStorageItem(id as StorageKey, value);
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
            onClick={() => handleDelete(selectedList)}
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
