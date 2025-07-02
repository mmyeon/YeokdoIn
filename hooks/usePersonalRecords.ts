"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateRecordWeight,
  deleteRecord,
  addRecord,
  PersonalRecordInfo,
  getExercises,
  getUserPersonalRecords,
} from "@/actions/user-settings-actions";
import { QUERY_KEYS } from "@/lib/queryKeys";

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
      onSuccess();
    },
    onError: (error) => {
      onError(error);
    },
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
      onSuccess();
    },
    onError: (error) => {
      onError(error);
    },
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
      onSuccess();
    },
    onError: (error) => {
      onError(error);
    },
  });
}; 