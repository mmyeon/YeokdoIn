"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  listAliases,
  upsertAlias,
  deleteAlias,
} from "@/features/aliases/api/aliases";

const ALIASES_KEY = "movementAliases";

export function useAliases() {
  return useQuery({
    queryKey: [ALIASES_KEY],
    queryFn: listAliases,
  });
}

export function useUpsertAlias(
  onSuccess: () => void,
  onError: (error: Error) => void
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      alias,
      exerciseId,
    }: {
      id?: number;
      alias: string;
      exerciseId: number;
    }) => upsertAlias(alias, exerciseId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ALIASES_KEY] });
      onSuccess();
    },
    onError: (error) => onError(error),
  });
}

export function useDeleteAlias(
  onSuccess: () => void,
  onError: (error: Error) => void
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAlias,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ALIASES_KEY] });
      onSuccess();
    },
    onError: (error) => onError(error),
  });
}
