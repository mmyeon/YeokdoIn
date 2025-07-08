"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getUserGoals,
  saveUserGoal,
  deleteUserGoal,
  updateUserGoal,
} from "@/actions/goals";
import { QUERY_KEYS } from "@/lib/queryKeys";
import { Tables } from "@/types_db";

type Goal = Tables<"goals">;

// 목표 조회
export const useGoals = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.GOALS],
    queryFn: async () => {
      const goals = await getUserGoals();
      return goals ?? []; 
    },
  });
};

// 목표 추가
export const useAddGoal = ( {
  onSuccess,
  onError,
}: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
} = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveUserGoal,
    onMutate: (newGoalContent) => {
      queryClient.cancelQueries({ queryKey: [QUERY_KEYS.GOALS] });

      const previousGoals = queryClient.getQueryData([QUERY_KEYS.GOALS]) as Goal[];
      
      queryClient.setQueryData([QUERY_KEYS.GOALS], (oldGoals : Goal[]) => [
        ...oldGoals,
        { id: Date.now().toString(), content: newGoalContent, created_at: new Date().toISOString() },
      ]);

      return { previousGoals };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GOALS] });
      onSuccess?.();
    },
    onError: (error, variables, context) => {
      onError?.(error);

      if(context?.previousGoals) {
      queryClient.setQueryData([QUERY_KEYS.GOALS], (previousGoals: Goal[]) => previousGoals);
      }
    },
  });
};

// 목표 삭제
export const useDeleteGoal = (
  onSuccess?: () => void,
  onError?: (error: Error) => void
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUserGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GOALS] });
      onSuccess?.();
    },
    onError: (error) => {
      onError?.(error);
    },
  });
};

// 목표 수정
export const useUpdateGoal = (
  onSuccess?: () => void,
  onError?: (error: Error) => void
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      goalId,
      goal,
    }: {
      goalId: Goal["id"];
      goal: string;
    }) => {
      if (!goal.trim()) {
        throw new Error("목표 내용을 입력해주세요.");
      }
      return updateUserGoal(goalId, goal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GOALS] });
      onSuccess?.();
    },
    onError: (error) => {
      onError?.(error);
    },
  });
}; 