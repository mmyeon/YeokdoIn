"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type StorageKey = "cleanRecord" | "snatchRecord";

const getStorageItem = (key: StorageKey) => {
  const value = localStorage.getItem(key);
  return value ? JSON.parse(value) : null;
};

const setStorageItem = (key: StorageKey, value: unknown) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const removeStorageItem = (key: StorageKey) => {
  localStorage.removeItem(key);
};

function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
  const { id, value } = e.target;
  setStorageItem(id as StorageKey, value);
}

function deleteStorageItems(keys: string[]) {
  keys.forEach((key) => {
    const itemKey = `${key}Record`;
    removeStorageItem(itemKey as StorageKey);
  });
}

export default function AddRecords() {
  const cleanJerkPRRef = useRef<HTMLInputElement>(null);
  const snatchPRRef = useRef<HTMLInputElement>(null);
  const [cleanRecordError, setCleanRecordError] = useState<string>("");
  const [snatchRecordError, setSnatchRecordError] = useState<string>("");
  const searchParams = useSearchParams();
  const selected = searchParams.get("selected");
  const selectedList = selected ? selected.split(",") : [];

  const hasClean = selectedList.includes("clean");
  const hasSnatch = selectedList.includes("snatch");

  useEffect(() => {
    if (cleanJerkPRRef.current) {
      cleanJerkPRRef.current.value = getStorageItem("cleanRecord") || "";
    }

    if (snatchPRRef.current) {
      snatchPRRef.current.value = getStorageItem("snatchRecord") || "";
    }
  }, []);

  function resetInputFields() {
    cleanJerkPRRef.current!.value = "";
    snatchPRRef.current!.value = "";
  }

  function handleDelete(keys: string[]) {
    deleteStorageItems(keys);
    resetInputFields();
  }

  function handleInputValue(e: React.ChangeEvent<HTMLInputElement>) {
    const { id, value } = e.target;
    const isNumber = /^\d+$/.test(value);

    if (id === "snatchRecord") {
      setSnatchRecordError(isNumber ? "" : "숫자만 입력해 주세요.");
    } else {
      setCleanRecordError(isNumber ? "" : "숫자만 입력해 주세요.");
    }

    e.target.value = value.replace(/\D/g, "");
  }

  return (
    <div className="flex justify-center items-center h-screen">
      <form
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4  max-w-xs"
        onSubmit={(e) => e.preventDefault()}
      >
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
              ref={snatchPRRef}
              placeholder="Snatch PR 입력해 주세요."
              onBlur={handleBlur}
              onChange={handleInputValue}
            />

            <span className="text-xs text-red-600 w-full block">
              {snatchRecordError || "\u00A0"}
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
              placeholder="Clean & Jerk PR 입력해 주세요."
              ref={cleanJerkPRRef}
              onBlur={handleBlur}
              onChange={handleInputValue}
            />

            <span className="text-xs text-red-600 w-full block">
              {cleanRecordError || "\u00A0"}
            </span>
          </div>
        )}

        <div className="flex flex-row gap-4 w-full">
          <button
            className="bg-red-400 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="button"
            onClick={() => handleDelete(selectedList)}
          >
            기록 삭제
          </button>

          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="button"
          >
            훈련 중량 선택
          </button>
        </div>
      </form>
    </div>
  );
}
