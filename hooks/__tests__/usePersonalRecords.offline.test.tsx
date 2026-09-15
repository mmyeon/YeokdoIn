/**
 * @jest-environment jsdom
 */
import { ReactNode } from "react";
import { QueryClient, QueryClientProvider, onlineManager } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

/**
 * spec.md 엣지케이스: "네트워크 실패로 저장이 끊긴 경우 → 부분 저장 없이 실패로
 * 처리하고 재시도 가능" (FR-011).
 *
 * React Query의 기본 `networkMode: 'online'` 은 오프라인일 때 mutation을 실행하지
 * 않고 **일시정지**한다. 그러면 `isPending` 이 계속 true라 버튼이 '저장중'에서
 * 멈추고 `onError` 가 영영 불리지 않아 실패 토스트도 뜨지 않는다.
 */

jest.mock("@/features/auth/model/useAuth", () => ({
  __esModule: true,
  default: () => ({ user: { id: "user-1" } }),
}));

const updatePRHistoryEntry = jest.fn();

jest.mock("@/actions/personalRecords", () => ({
  __esModule: true,
  getUserPersonalRecords: jest.fn(),
  getExercises: jest.fn(),
  getPRHistory: jest.fn(),
  addRecord: jest.fn(),
  deleteRecord: jest.fn(),
  addPRHistoryEntry: jest.fn(),
  updatePRHistoryEntry: (...args: unknown[]) => updatePRHistoryEntry(...args),
  deletePRHistoryEntry: jest.fn(),
}));

import { useUpdatePRHistoryEntry } from "@/hooks/usePersonalRecords";

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe("useUpdatePRHistoryEntry — 오프라인", () => {
  beforeEach(() => {
    updatePRHistoryEntry.mockReset();
    onlineManager.setOnline(false);
  });

  afterEach(() => {
    onlineManager.setOnline(true);
  });

  it("오프라인이면 저장이 멈추지 않고 실패를 알린다", async () => {
    updatePRHistoryEntry.mockRejectedValue(new Error("Failed to fetch"));
    const onError = jest.fn();

    const { result } = renderHook(
      () => useUpdatePRHistoryEntry(jest.fn(), onError),
      { wrapper }
    );

    result.current.mutate({ id: 1, patch: { newWeight: 130 } });

    await waitFor(() => expect(onError).toHaveBeenCalled(), { timeout: 2000 });
    await waitFor(() => expect(result.current.isPending).toBe(false));
  });
});
