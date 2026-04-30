'use client';

import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  deleteProgram,
  listPrograms,
  saveProgram,
  type ProgramRow,
  type SaveProgramInput,
} from '@/features/programs/api/programs';
import { QUERY_KEYS } from '@/lib/queryKeys';
import useAuth from '@/features/auth/model/useAuth';

export function usePrograms() {
  const { user } = useAuth();
  return useQuery({
    queryKey: [QUERY_KEYS.PROGRAMS],
    queryFn: async (): Promise<ProgramRow[]> => {
      const rows = await listPrograms();
      return rows ?? [];
    },
    enabled: !!user,
  });
}

interface SaveProgramHookOptions {
  onSuccess?: (row: ProgramRow) => void;
  onError?: (error: Error) => void;
}

export function useSaveProgram({
  onSuccess,
  onError,
}: SaveProgramHookOptions = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SaveProgramInput) => saveProgram(input),
    onSuccess: (row) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PROGRAMS] });
      onSuccess?.(row);
    },
    onError: (error: Error) => {
      onError?.(error);
    },
  });
}

interface DeleteProgramHookOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useDeleteProgram({
  onSuccess,
  onError,
}: DeleteProgramHookOptions = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteProgram(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PROGRAMS] });
      onSuccess?.();
    },
    onError: (error: Error) => {
      onError?.(error);
    },
  });
}
