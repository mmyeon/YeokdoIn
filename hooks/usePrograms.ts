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
  saveTextProgram,
  updateTextProgram,
  type ProgramRow,
  type SaveTextProgramInput,
  type UpdateTextProgramInput,
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

interface SaveTextProgramHookOptions {
  onSuccess?: (row: ProgramRow) => void;
  onError?: (error: Error) => void;
}

export function useSaveTextProgram({
  onSuccess,
  onError,
}: SaveTextProgramHookOptions = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SaveTextProgramInput) => saveTextProgram(input),
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

interface UpdateTextProgramHookOptions {
  onSuccess?: (row: ProgramRow) => void;
  onError?: (error: Error) => void;
}

export function useUpdateTextProgram({
  onSuccess,
  onError,
}: UpdateTextProgramHookOptions = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateTextProgramInput) => updateTextProgram(input),
    onSuccess: (row) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PROGRAMS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PROGRAMS, row.id] });
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
