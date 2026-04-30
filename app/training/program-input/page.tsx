'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Pill } from '@/components/ui/pill';
import { cn } from '@/lib/utils';
import { ProgramForm } from '@/features/programs/ui/ProgramForm';
import { useSaveProgram } from '@/hooks/usePrograms';
import type { Program } from '@/features/notation/model/types';
import { createEmptyBlock } from '@/features/programs/model/update';
import { serializeProgram } from '@/features/programs/model/serialize';
import { programSchema } from '@/features/notation/model/schemas';

const SAVED_PILL_MS = 1800;

function createInitialProgram(): Program {
  return { blocks: [createEmptyBlock()] };
}

export default function ProgramInputPage() {
  const router = useRouter();
  const [program, setProgram] = useState<Program>(createInitialProgram);
  const [justSaved, setJustSaved] = useState(false);

  const { mutate: save, isPending } = useSaveProgram({
    onSuccess: () => {
      toast.success('프로그램이 저장되었습니다.');
      setProgram(createInitialProgram());
      setJustSaved(true);
    },
    onError: (e) => toast.error(e.message ?? '저장에 실패했습니다.'),
  });

  useEffect(() => {
    if (!justSaved) return;
    const id = window.setTimeout(() => setJustSaved(false), SAVED_PILL_MS);
    return () => window.clearTimeout(id);
  }, [justSaved]);

  const hasMovement = program.blocks.some((b) =>
    b.movements.some((m) => m.name.trim().length > 0),
  );
  const validation = programSchema.safeParse(program);
  const canSave = !isPending && hasMovement && validation.success;

  const handleSave = () => {
    if (!canSave) return;
    save({ parsed: program });
  };

  const handleBack = () => {
    if (window.history.length > 1) router.back();
    else router.push('/training');
  };

  const notation = serializeProgram(program).replace(/\n/g, ' / ');

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col bg-yd-bg text-yd-text">
      <header className="flex items-center gap-3 px-4 pb-1 pt-3">
        <button
          type="button"
          onClick={handleBack}
          aria-label="뒤로가기"
          className="-ml-1 flex h-8 w-8 items-center justify-center rounded-md text-yd-text-muted hover:bg-yd-elevated"
        >
          <ChevronLeft className="size-5" />
        </button>
        <h1 className="text-[18px] font-bold">프로그램 입력</h1>
      </header>

      <section className="px-3.5 pb-44 pt-2">
        <div className="flex items-baseline justify-between px-0.5 pb-2.5 pt-1">
          <div>
            <h2 className="text-[20px] font-bold -tracking-[0.3px]">
              새 프로그램
            </h2>
            <p className="mt-0.5 text-[11px] text-yd-text-muted">
              블록 단위로 만드세요
            </p>
          </div>
          {justSaved && (
            <Pill tone="success" variant="solid" size="sm">
              ✓ 저장됨
            </Pill>
          )}
        </div>

        <ProgramForm program={program} onChange={setProgram} />
      </section>

      <div
        className="pointer-events-none fixed inset-x-0 bottom-16 z-40"
        aria-hidden={!canSave}
      >
        <div className="pointer-events-auto mx-auto max-w-md bg-gradient-to-t from-yd-bg from-70% to-transparent px-3.5 pb-2.5 pt-3.5">
          {canSave && notation && (
            <div className="mb-2 flex items-center gap-2 rounded-[10px] border border-yd-line bg-yd-elevated px-3 py-2">
              <span className="text-[10px] text-yd-primary">●</span>
              <span className="min-w-0 flex-1 truncate font-mono text-[11px] font-medium text-yd-primary">
                {notation}
              </span>
            </div>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className={cn(
              'h-[52px] w-full rounded-2xl text-[15px] font-extrabold -tracking-[0.2px] transition-all',
              canSave
                ? 'bg-yd-primary text-yd-on-primary shadow-[0_8px_24px_var(--yd-primary-soft)]'
                : 'border border-yd-line bg-yd-elevated text-yd-text-dim',
            )}
          >
            {isPending
              ? '저장 중...'
              : canSave
                ? '프로그램 저장'
                : '동작을 선택하세요'}
          </button>
        </div>
      </div>
    </main>
  );
}
