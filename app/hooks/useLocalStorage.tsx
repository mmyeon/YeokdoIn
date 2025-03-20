import { useEffect, useState } from "react";

export type StorageKey =
  | "cleanRecord"
  | "snatchRecord"
  | "selectedLift"
  | "barbelWeight"
  | "programWeights";

export function useLocalStorage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  function getLocalStorageItem(key: StorageKey): string {
    if (!isClient) return "";
    return window.localStorage.getItem(key) || "";
  }

  function setLocalStorageItem(key: StorageKey, value: string): void {
    if (!isClient) return;
    window.localStorage.setItem(key, value);
  }

  function removeLocalStorageItem(key: StorageKey): void {
    if (!isClient) return;
    window.localStorage.removeItem(key);
  }

  return {
    getLocalStorageItem,
    setLocalStorageItem,
    removeLocalStorageItem,
  };
}
