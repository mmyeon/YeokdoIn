export type StorageKey =
  | "cleanRecord"
  | "snatchRecord"
  | "selectedLift"
  | "barWeight"
  | "programWeights";

export function useLocalStorage() {
  function getLocalStorageItem(key: StorageKey): string {
    return window.localStorage.getItem(key) || "";
  }

  function setLocalStorageItem(key: StorageKey, value: string): void {
    window.localStorage.setItem(key, value);
  }

  function removeLocalStorageItem(key: StorageKey): void {
    window.localStorage.removeItem(key);
  }

  return {
    getLocalStorageItem,
    setLocalStorageItem,
    removeLocalStorageItem,
  };
}
