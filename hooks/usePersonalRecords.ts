"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  deleteRecord,
  addRecord,
  getExercises,
  getUserPersonalRecords,
  getPRHistory,
  addPRHistoryEntry,
  updatePRHistoryEntry,
  deletePRHistoryEntry,
} from "@/actions/personalRecords";
import { QUERY_KEYS } from "@/lib/queryKeys";
import useAuth from "@/features/auth/model/useAuth";

/**
 * React Query 기본값(`networkMode: "online"`)은 오프라인일 때 mutation을 실행하지
 * 않고 **일시정지**한다. 그러면 `isPending` 이 계속 true라 저장 버튼이 '저장중'에서
 * 멈추고 `onError` 가 불리지 않아 실패를 알릴 방법이 없다.
 *
 * spec.md 엣지케이스는 "네트워크 실패로 저장이 끊긴 경우 → 부분 저장 없이 실패로
 * 처리하고 재시도 가능"(FR-011)을 요구하므로, 연결 상태와 무관하게 실행해 즉시
 * 실패시키고 사용자가 다시 시도하게 한다. 대기열에 쌓아 나중에 보내지 않는다 —
 * 사용자가 저장됐다고 착각한 채 자리를 뜨는 편이 더 나쁘다.
 */
const FAIL_FAST_WHEN_OFFLINE = { networkMode: "always" } as const;

// 개인 기록 조회
export const usePersonalRecords = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: [QUERY_KEYS.PERSONAL_RECORDS],
    queryFn: getUserPersonalRecords,
    enabled: !!user,
  });
};

// 운동 종목 조회
export const useExercises = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.EXERCISES],
    queryFn: getExercises,
  });
};

// 개인 기록 삭제
export const useDeletePersonalRecord = (
  onSuccess: () => void,
  onError: (error: Error) => void
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...FAIL_FAST_WHEN_OFFLINE,
    mutationFn: deleteRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PERSONAL_RECORDS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PR_HISTORY] });
      onSuccess();
    },
    onError: (error) => onError(error),
  });
};

// 개인 기록 추가
export const useAddPersonalRecord = (
  onSuccess: () => void,
  onError: (error: Error) => void
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...FAIL_FAST_WHEN_OFFLINE,
    mutationFn: addRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PERSONAL_RECORDS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PR_HISTORY] });
      onSuccess();
    },
    onError: (error) => onError(error),
  });
};

// PR 이력 조회
export const usePRHistory = (exerciseId: number | null) => {
  return useQuery({
    queryKey: [QUERY_KEYS.PR_HISTORY, exerciseId],
    queryFn: () => getPRHistory(exerciseId as number),
    enabled: exerciseId !== null,
  });
};

// PR 이력 추가 (dual-write 진입점)
export const useAddPRHistoryEntry = (
  onSuccess: () => void,
  onError: (error: Error) => void
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...FAIL_FAST_WHEN_OFFLINE,
    mutationFn: addPRHistoryEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PERSONAL_RECORDS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PR_HISTORY] });
      onSuccess();
    },
    onError: (error) => onError(error),
  });
};

export const useUpdatePRHistoryEntry = (
  onSuccess: () => void,
  onError: (error: Error) => void
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...FAIL_FAST_WHEN_OFFLINE,
    mutationFn: ({
      id,
      patch,
    }: {
      id: number;
      patch: { newWeight?: number; prDate?: string; note?: string | null };
    }) => updatePRHistoryEntry(id, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PERSONAL_RECORDS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PR_HISTORY] });
      onSuccess();
    },
    onError: (error) => onError(error),
  });
};

export const useDeletePRHistoryEntry = (
  onSuccess: () => void,
  onError: (error: Error) => void
) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...FAIL_FAST_WHEN_OFFLINE,
    mutationFn: deletePRHistoryEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PERSONAL_RECORDS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PR_HISTORY] });
      onSuccess();
    },
    onError: (error) => onError(error),
  });
};
