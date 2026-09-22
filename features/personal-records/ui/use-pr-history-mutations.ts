"use client";

import {
  QueryClient,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  addPRHistoryEntry,
  deletePRHistoryEntry,
  updatePRHistoryEntry,
} from "@/actions/personalRecords";
import { FAIL_FAST_WHEN_OFFLINE } from "@/hooks/usePersonalRecords";

import { QUERY_KEYS } from "@/lib/queryKeys";
import {
  applyCurrentPR,
  applyHistoryChange,
  deriveCurrentPR,
  type HistoryChange,
} from "@/features/personal-records/model/optimistic-history";
import type {
  PersonalRecordInfo,
  PRHistoryEntry,
} from "@/types/personalRecords";

/**
 * 상세 화면의 추가·수정·삭제가 공유하는 키. 조작이 겹칠 때 마지막 조작이 끝난
 * 뒤에만 재조회하려고 진행 중인 개수를 이 키로 센다(`settleIfLast`).
 */
export const PR_HISTORY_MUTATION_KEY = ["prHistoryMutation"] as const;

const recordsKey = [QUERY_KEYS.PERSONAL_RECORDS];
const historyKey = (exerciseId: number) => [QUERY_KEYS.PR_HISTORY, exerciseId];

/**
 * 진행 중인 조회가 예측을 덮어쓰지 않게 취소하고, 되돌릴 때 필요한 조작 직전
 * 레코드를 돌려준다.
 */
async function prepare(
  queryClient: QueryClient,
  exerciseId: number
): Promise<PersonalRecordInfo | undefined> {
  await Promise.all([
    queryClient.cancelQueries({ queryKey: recordsKey }),
    queryClient.cancelQueries({ queryKey: historyKey(exerciseId) }),
  ]);
  return queryClient
    .getQueryData<PersonalRecordInfo[]>(recordsKey)
    ?.find((r) => r.exerciseId === exerciseId);
}

/**
 * 이력을 고치고, 현재 PR 은 고친 이력에서 계산한다. 반영했으면 true.
 *
 * 이력이 아직 로딩 중이면 반영하지 않는다 — 빈 목록으로 보고 계산하면 현재 PR 이
 * 새 행 하나로 정해지고, 되돌릴 때 0건이 돼 레코드 행까지 캐시에서 빠진다.
 */
function applyOptimistic(
  queryClient: QueryClient,
  exerciseId: number,
  change: HistoryChange,
  base: PersonalRecordInfo | undefined
): boolean {
  const cached = queryClient.getQueryData<PRHistoryEntry[]>(
    historyKey(exerciseId)
  );
  if (!cached) return false;

  const history = applyHistoryChange(cached, change);
  queryClient.setQueryData(historyKey(exerciseId), history);

  if (!base) return true;
  queryClient.setQueryData<PersonalRecordInfo[]>(recordsKey, (records = []) =>
    applyCurrentPR(records, base, deriveCurrentPR(history))
  );
  return true;
}

/**
 * `onSettled` 는 자기 자신이 아직 진행 중으로 세어지는 시점에 불린다(설치본
 * 5.81.5). 1 이면 겹친 조작이 없다는 뜻이다.
 */
function settleIfLast(queryClient: QueryClient): void {
  if (queryClient.isMutating({ mutationKey: PR_HISTORY_MUTATION_KEY }) !== 1) {
    return;
  }
  queryClient.invalidateQueries({ queryKey: recordsKey });
  queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PR_HISTORY] });
}

/**
 * `exerciseId` 를 context 에 담는 이유: 마지막 1건을 지우면 화면의 레코드가
 * 사라져 훅 인자가 `null` 이 되고, v5 는 진행 중 mutation 에 최신 옵션을 넣는다.
 * 클로저 값을 쓰면 되돌릴 캐시 키를 잃는다.
 */
type DeleteContext = {
  exerciseId: number;
  base: PersonalRecordInfo | undefined;
  removed: PRHistoryEntry | undefined;
};

// 성공 콜백은 받지 않는다 — 화면이 바뀐 것이 곧 피드백이다(FR-005).
export const useOptimisticDeletePRHistory = (
  exerciseId: number | null,
  onError: (error: Error, id: number) => void
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...FAIL_FAST_WHEN_OFFLINE,
    mutationKey: PR_HISTORY_MUTATION_KEY,
    mutationFn: deletePRHistoryEntry,
    onMutate: async (id: number): Promise<DeleteContext | undefined> => {
      if (exerciseId === null) return undefined;
      const base = await prepare(queryClient, exerciseId);
      const removed = queryClient
        .getQueryData<PRHistoryEntry[]>(historyKey(exerciseId))
        ?.find((e) => e.id === id);
      applyOptimistic(queryClient, exerciseId, { type: "remove", id }, base);
      return { exerciseId, base, removed };
    },
    onError: (error, id, context) => {
      if (context?.removed) {
        applyOptimistic(
          queryClient,
          context.exerciseId,
          { type: "add", entry: context.removed },
          context.base
        );
      }
      onError(error, id);
    },
    onSettled: () => settleIfLast(queryClient),
  });
};

export type PRHistoryUpdate = {
  id: number;
  patch: Partial<Pick<PRHistoryEntry, "newWeight" | "prDate" | "note">>;
};

type UpdateContext = {
  exerciseId: number;
  base: PersonalRecordInfo | undefined;
  before: PRHistoryEntry | undefined;
};

export const useOptimisticUpdatePRHistory = (
  exerciseId: number | null,
  onError: (error: Error, variables: PRHistoryUpdate) => void
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...FAIL_FAST_WHEN_OFFLINE,
    mutationKey: PR_HISTORY_MUTATION_KEY,
    mutationFn: ({ id, patch }: PRHistoryUpdate) =>
      updatePRHistoryEntry(id, patch),
    onMutate: async ({
      id,
      patch,
    }: PRHistoryUpdate): Promise<UpdateContext | undefined> => {
      if (exerciseId === null) return undefined;
      const base = await prepare(queryClient, exerciseId);
      const before = queryClient
        .getQueryData<PRHistoryEntry[]>(historyKey(exerciseId))
        ?.find((e) => e.id === id);
      if (before) {
        applyOptimistic(
          queryClient,
          exerciseId,
          { type: "update", entry: { ...before, ...patch } },
          base
        );
      }
      return { exerciseId, base, before };
    },
    onError: (error, variables, context) => {
      if (context?.before) {
        applyOptimistic(
          queryClient,
          context.exerciseId,
          { type: "update", entry: context.before },
          context.base
        );
      }
      onError(error, variables);
    },
    onSettled: () => settleIfLast(queryClient),
  });
};

export type PRHistoryAddInput = Parameters<typeof addPRHistoryEntry>[0];

type AddContext = {
  exerciseId: number;
  base: PersonalRecordInfo | undefined;
  tempId: number;
};

/**
 * 임시 행의 id 는 음수라 실제 행과 겹치지 않는다. 성공 후 재조회가 임시 행을
 * 실제 행으로 바꾼다. 확정 전 임시 행은 화면에서 조작할 수 없게 막아야 한다 —
 * 없는 id 삭제는 서버에서 조용히 성공해 재조회 후 행이 되살아난다.
 */
export const useOptimisticAddPRHistory = (
  exerciseId: number | null,
  onError: (error: Error, variables: PRHistoryAddInput) => void
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...FAIL_FAST_WHEN_OFFLINE,
    mutationKey: PR_HISTORY_MUTATION_KEY,
    mutationFn: addPRHistoryEntry,
    onMutate: async (
      input: PRHistoryAddInput
    ): Promise<AddContext | undefined> => {
      if (exerciseId === null) return undefined;
      const base = await prepare(queryClient, exerciseId);
      const tempId = -Date.now();
      const applied = applyOptimistic(
        queryClient,
        exerciseId,
        {
          type: "add",
          entry: {
            id: tempId,
            exerciseId,
            // 서버도 추가 직전 현재 PR 무게를 previous_weight 로 넣는다.
            previousWeight: base?.weight ?? null,
            newWeight: input.newWeight,
            prDate: input.prDate,
            note: input.note,
            source: "manual",
            createdAt: new Date().toISOString(),
          },
        },
        base
      );
      // 반영하지 않았으면 되돌릴 것도 없다.
      return applied ? { exerciseId, base, tempId } : undefined;
    },
    onError: (error, variables, context) => {
      if (context) {
        applyOptimistic(
          queryClient,
          context.exerciseId,
          { type: "remove", id: context.tempId },
          context.base
        );
      }
      onError(error, variables);
    },
    onSettled: () => settleIfLast(queryClient),
  });
};
