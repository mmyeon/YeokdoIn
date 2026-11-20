'use client';

import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  deleteProgram,
  listPrograms,
  getProgram,
  saveProgram,
  updateProgram,
  type UpdateProgramInput,
  type ProgramRow,
  type ProgramInput,
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
    mutationFn: (input: ProgramInput) => saveProgram(input),
    onSuccess: (row) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PROGRAMS] });
      onSuccess?.(row);
    },
    onError: (error: Error) => {
      onError?.(error);
    },
  });
}

export function useProgram(id: number) {
  const { user } = useAuth();
  return useQuery({
    queryKey: [QUERY_KEYS.PROGRAMS, id],
    queryFn: (): Promise<ProgramRow | null> => getProgram(id),
    enabled: !!user && Number.isFinite(id),
  });
}

export function useUpdateProgram({
  onSuccess,
  onError,
}: SaveProgramHookOptions = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateProgramInput) => updateProgram(input),
    onSuccess: (row) => {
      // 보기 모드로 돌아갈 때 낡은 내용이 비치지 않게 먼저 채운다.
      queryClient.setQueryData([QUERY_KEYS.PROGRAMS, row.id], row);
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
