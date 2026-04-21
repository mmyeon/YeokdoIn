"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateRecordWeight,
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
import { PersonalRecordInfo } from "@/types/personalRecords";

// 개인 기록 조회
export const usePersonalRecords = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.PERSONAL_RECORDS],
    queryFn: getUserPersonalRecords,
  });
};

// 운동 종목 조회
export const useExercises = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.EXERCISES],
    queryFn: getExercises,
  });
};

// 개인 기록 수정
export const useUpdatePersonalRecord = (
  onSuccess: () => void,
  onError: (error: Error) => void
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      recordId,
      newWeight,
    }: {
      recordId: PersonalRecordInfo["id"];
      newWeight: PersonalRecordInfo["weight"];
    }) => {
      if (newWeight <= 0) {
        throw new Error("무게는 0보다 커야 합니다.");
      }
      return updateRecordWeight(recordId, newWeight);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PERSONAL_RECORDS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PR_HISTORY] });
      onSuccess();
    },
    onError: (error) => onError(error),
  });
};

// 개인 기록 삭제
export const useDeletePersonalRecord = (
  onSuccess: () => void,
  onError: (error: Error) => void
) => {
  const queryClient = useQueryClient();

  return useMutation({
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
    mutationFn: deletePRHistoryEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PERSONAL_RECORDS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PR_HISTORY] });
      onSuccess();
    },
    onError: (error) => onError(error),
  });
};
