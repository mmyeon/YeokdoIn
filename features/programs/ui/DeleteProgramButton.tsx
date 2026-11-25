'use client';

import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ROUTES } from '@/routes';
import { useDeleteProgram } from '@/hooks/usePrograms';

export function DeleteProgramButton({ id }: { id: number }) {
  const router = useRouter();
  const { mutate: remove, isPending } = useDeleteProgram({
    onSuccess: () => {
      toast.success('삭제했습니다.');
      router.push(ROUTES.TRAINING.PROGRAMS);
    },
    onError: (e) => toast.error(e.message || '삭제에 실패했습니다.'),
  });

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (confirm('이 프로그램을 삭제할까요?')) remove(id);
      }}
      className="flex h-[46px] w-full items-center justify-center gap-2 rounded-2xl border border-yd-line text-[14px] font-semibold text-yd-error disabled:opacity-50"
    >
      <Trash2 className="size-4" />
      삭제
    </button>
  );
}
