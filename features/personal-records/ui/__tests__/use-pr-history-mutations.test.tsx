/**
 * @jest-environment jsdom
 */
import { ReactNode } from "react";
import {
  QueryClient,
  QueryClientProvider,
  onlineManager,
} from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";

import type {
  PersonalRecordInfo,
  PRHistoryEntry,
} from "@/types/personalRecords";

jest.mock("@/features/auth/model/useAuth", () => ({
  __esModule: true,
  default: () => ({ user: { id: "user-1" } }),
}));

const getPRHistory = jest.fn();
const getUserPersonalRecords = jest.fn();
const deletePRHistoryEntry = jest.fn();
const updatePRHistoryEntry = jest.fn();

jest.mock("@/actions/personalRecords", () => ({
  __esModule: true,
  getUserPersonalRecords: (...args: unknown[]) => getUserPersonalRecords(...args),
  getExercises: jest.fn(),
  getPRHistory: (...args: unknown[]) => getPRHistory(...args),
  addRecord: jest.fn(),
  deleteRecord: jest.fn(),
  addPRHistoryEntry: jest.fn(),
  updatePRHistoryEntry: (...args: unknown[]) => updatePRHistoryEntry(...args),
  deletePRHistoryEntry: (...args: unknown[]) => deletePRHistoryEntry(...args),
}));

import { usePersonalRecords, usePRHistory } from "@/hooks/usePersonalRecords";
import {
  useOptimisticDeletePRHistory,
  useOptimisticUpdatePRHistory,
} from "../use-pr-history-mutations";
import { QUERY_KEYS } from "@/lib/queryKeys";

const EXERCISE_ID = 10;
const RECORDS_KEY = [QUERY_KEYS.PERSONAL_RECORDS];
const HISTORY_KEY = [QUERY_KEYS.PR_HISTORY, EXERCISE_ID];

function entry(id: number, newWeight: number, prDate: string): PRHistoryEntry {
  return {
    id,
    exerciseId: EXERCISE_ID,
    previousWeight: null,
    newWeight,
    prDate,
    note: null,
    source: "manual",
    createdAt: `${prDate}T00:00:00.000Z`,
  };
}

const HISTORY = [
  entry(3, 90, "2026-09-10"),
  entry(2, 100, "2026-08-01"),
  entry(1, 80, "2026-07-01"),
];

const SNATCH: PersonalRecordInfo = {
  id: 7,
  exerciseId: EXERCISE_ID,
  weight: 100,
  prDate: "2026-08-01",
  updatedAt: "2026-08-01T00:00:00.000Z",
  exerciseName: "Snatch",
};

const CLEAN: PersonalRecordInfo = {
  id: 8,
  exerciseId: 11,
  weight: 120,
  prDate: "2026-06-01",
  updatedAt: "2026-06-01T00:00:00.000Z",
  exerciseName: "Clean",
};

type Deferred = { resolve: () => void; reject: (error: Error) => void };

/** 호출될 때마다 직접 resolve/reject 할 수 있는 promise 를 돌려주는 목. */
function deferEach(mock: jest.Mock): Deferred[] {
  const calls: Deferred[] = [];
  mock.mockImplementation(
    () =>
      new Promise<void>((resolve, reject) => {
        calls.push({ resolve, reject });
      })
  );
  return calls;
}

function setup(
  history: PRHistoryEntry[] = HISTORY,
  records: PersonalRecordInfo[] = [SNATCH, CLEAN]
) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  });
  client.setQueryData(RECORDS_KEY, records);
  client.setQueryData(HISTORY_KEY, history);

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );

  const history$ = () => client.getQueryData<PRHistoryEntry[]>(HISTORY_KEY);
  const records$ = () => client.getQueryData<PersonalRecordInfo[]>(RECORDS_KEY);
  return { client, wrapper, history$, records$ };
}

const ids = (history: PRHistoryEntry[] | undefined) =>
  (history ?? []).map((e) => e.id);
const snatchWeight = (records: PersonalRecordInfo[] | undefined) =>
  records?.find((r) => r.exerciseId === EXERCISE_ID)?.weight;

beforeEach(() => {
  jest.clearAllMocks();
  getPRHistory.mockResolvedValue(HISTORY);
  getUserPersonalRecords.mockResolvedValue([SNATCH, CLEAN]);
});

describe("useOptimisticDeletePRHistory", () => {
  function renderDelete(ctx: ReturnType<typeof setup>, onError = jest.fn()) {
    const view = renderHook(
      () => ({
        mutation: useOptimisticDeletePRHistory(EXERCISE_ID, onError),
        // 재조회가 실제로 일어나려면 활성 쿼리가 있어야 한다.
        history: usePRHistory(EXERCISE_ID),
        records: usePersonalRecords(),
      }),
      { wrapper: ctx.wrapper }
    );
    return { ...view, onError };
  }

  it("응답 전에 행이 빠지고 헤더가 다음 최대로 내려간다", async () => {
    deferEach(deletePRHistoryEntry);
    const ctx = setup();
    const { result } = renderDelete(ctx);

    act(() => result.current.mutation.mutate(2));

    await waitFor(() => expect(ids(ctx.history$())).toEqual([3, 1]));
    expect(snatchWeight(ctx.records$())).toBe(90);
  });

  it("실패하면 두 캐시가 직전 값으로 돌아오고 onError 가 (error, id) 를 받는다", async () => {
    const calls = deferEach(deletePRHistoryEntry);
    const ctx = setup();
    const { result, onError } = renderDelete(ctx);

    act(() => result.current.mutation.mutate(2));
    await waitFor(() => expect(calls).toHaveLength(1));

    const error = new Error("boom");
    await act(async () => calls[0].reject(error));

    await waitFor(() => expect(onError).toHaveBeenCalledWith(error, 2));
    expect(ctx.history$()).toEqual(HISTORY);
    expect(ctx.records$()).toEqual([SNATCH, CLEAN]);
  });

  it("A·B 를 연달아 지우고 A 만 실패하면 A 만 돌아온다", async () => {
    const calls = deferEach(deletePRHistoryEntry);
    const ctx = setup();
    const { result } = renderDelete(ctx);

    act(() => result.current.mutation.mutate(2));
    act(() => result.current.mutation.mutate(3));
    await waitFor(() => expect(calls).toHaveLength(2));
    expect(ids(ctx.history$())).toEqual([1]);

    await act(async () => calls[0].reject(new Error("A 실패")));

    await waitFor(() => expect(ids(ctx.history$())).toEqual([2, 1]));
    expect(snatchWeight(ctx.records$())).toBe(100);
  });

  it("조작이 겹치면 마지막 조작이 끝난 뒤 한 번만 재조회한다", async () => {
    const calls = deferEach(deletePRHistoryEntry);
    const ctx = setup();
    const { result } = renderDelete(ctx);

    act(() => result.current.mutation.mutate(2));
    act(() => result.current.mutation.mutate(3));
    await waitFor(() => expect(calls).toHaveLength(2));

    await act(async () => calls[0].resolve());
    expect(getPRHistory).not.toHaveBeenCalled();

    await act(async () => calls[1].resolve());
    await waitFor(() => expect(getPRHistory).toHaveBeenCalledTimes(1));
  });

  it("마지막 1건을 지우면 레코드 행이 빠지고, 실패하면 종목명까지 되살아난다", async () => {
    const calls = deferEach(deletePRHistoryEntry);
    const only = [entry(2, 100, "2026-08-01")];
    getPRHistory.mockResolvedValue(only);
    const ctx = setup(only);
    const { result } = renderDelete(ctx);

    act(() => result.current.mutation.mutate(2));
    await waitFor(() => expect(ctx.records$()).toEqual([CLEAN]));

    await act(async () => calls[0].reject(new Error("boom")));

    await waitFor(() => expect(ctx.records$()).toContainEqual(SNATCH));
    expect(ctx.history$()).toEqual(only);
  });

  describe("오프라인", () => {
    beforeEach(() => onlineManager.setOnline(false));
    afterEach(() => onlineManager.setOnline(true));

    it("멈추지 않고 실패를 알린다", async () => {
      deletePRHistoryEntry.mockRejectedValue(new Error("Failed to fetch"));
      const ctx = setup();
      const { result, onError } = renderDelete(ctx);

      act(() => result.current.mutation.mutate(2));

      await waitFor(() => expect(onError).toHaveBeenCalled(), {
        timeout: 2000,
      });
      await waitFor(() => expect(result.current.mutation.isPending).toBe(false));
      expect(ctx.history$()).toEqual(HISTORY);
    });
  });
});

describe("useOptimisticUpdatePRHistory", () => {
  function renderUpdate(ctx: ReturnType<typeof setup>, onError = jest.fn()) {
    const view = renderHook(
      () => ({
        mutation: useOptimisticUpdatePRHistory(EXERCISE_ID, onError),
        history: usePRHistory(EXERCISE_ID),
        records: usePersonalRecords(),
      }),
      { wrapper: ctx.wrapper }
    );
    return { ...view, onError };
  }

  it("날짜를 바꾸면 응답 전에 새 날짜 자리로 옮겨간다", async () => {
    deferEach(updatePRHistoryEntry);
    const ctx = setup();
    const { result } = renderUpdate(ctx);

    act(() =>
      result.current.mutation.mutate({ id: 1, patch: { prDate: "2026-09-15" } })
    );

    await waitFor(() => expect(ids(ctx.history$())).toEqual([1, 3, 2]));
  });

  it("무게를 최대보다 올리면 헤더가 즉시 오른다", async () => {
    deferEach(updatePRHistoryEntry);
    const ctx = setup();
    const { result } = renderUpdate(ctx);

    act(() =>
      result.current.mutation.mutate({ id: 1, patch: { newWeight: 130 } })
    );

    await waitFor(() => expect(snatchWeight(ctx.records$())).toBe(130));
  });

  it("실패하면 수정 전 행으로 돌아오고 onError 가 (error, { id, patch }) 를 받는다", async () => {
    const calls = deferEach(updatePRHistoryEntry);
    const ctx = setup();
    const { result, onError } = renderUpdate(ctx);
    const variables = {
      id: 1,
      patch: { newWeight: 130, prDate: "2026-09-15", note: "메모" },
    };

    act(() => result.current.mutation.mutate(variables));
    await waitFor(() => expect(calls).toHaveLength(1));

    const error = new Error("boom");
    await act(async () => calls[0].reject(error));

    await waitFor(() => expect(onError).toHaveBeenCalledWith(error, variables));
    expect(ctx.history$()).toEqual(HISTORY);
    expect(ctx.records$()).toEqual([SNATCH, CLEAN]);
  });

  describe("오프라인", () => {
    beforeEach(() => onlineManager.setOnline(false));
    afterEach(() => onlineManager.setOnline(true));

    it("저장이 멈추지 않고 실패를 알린다", async () => {
      updatePRHistoryEntry.mockRejectedValue(new Error("Failed to fetch"));
      const ctx = setup();
      const { result, onError } = renderUpdate(ctx);

      act(() =>
        result.current.mutation.mutate({ id: 1, patch: { newWeight: 130 } })
      );

      await waitFor(() => expect(onError).toHaveBeenCalled(), {
        timeout: 2000,
      });
      await waitFor(() => expect(result.current.mutation.isPending).toBe(false));
    });
  });
});
