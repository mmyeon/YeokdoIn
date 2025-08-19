"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  saveBarbellWeight,
  getUserDefaultBarbelWeight,
} from "@/actions/personalRecords";
import { QUERY_KEYS } from "@/lib/queryKeys";

// 바벨 무게 조회
export const useBarbellWeight = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.BARBELL_WEIGHT],
    queryFn: getUserDefaultBarbelWeight,
  });
};

// 바벨 무게 저장
export const useSaveBarbellWeight = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveBarbellWeight,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.BARBELL_WEIGHT],
      });
    },
  });
};
