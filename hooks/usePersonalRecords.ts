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
import { QUERY_KEYS } from "@/routes";
import { toast } from "sonner";

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
export const useUpdatePersonalRecord = () => {
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
      toast.success("개인 기록이 수정되었습니다.");
    },
    onError: (error) => {
      toast.error(error.message || "개인 기록 수정 중 오류가 발생했습니다.");
    },
  });
};

// 개인 기록 삭제
export const useDeletePersonalRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PERSONAL_RECORDS] });
      toast.success("개인 기록이 삭제되었습니다.");
    },
    onError: () => {
      toast.error("개인 기록 삭제 중 오류가 발생했습니다.");
    },
  });
};

// 개인 기록 추가
export const useAddPersonalRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PERSONAL_RECORDS] });
      toast.success("개인 기록이 추가되었습니다.");
    },
    onError: () => {
      toast.error("개인 기록 추가 중 오류가 발생했습니다.");
    },
  });
}; 