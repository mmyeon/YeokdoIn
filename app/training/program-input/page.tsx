'use client';

import { useCallback, useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ProgramForm } from '@/features/programs/ui/ProgramForm';
import { ProgramSavedSheet } from '@/features/programs/ui/ProgramSavedSheet';
import { useSaveProgram } from '@/hooks/usePrograms';
import type { Program } from '@/features/notation/model/types';
import { createEmptyBlock } from '@/features/programs/model/update';
import { serializeProgram } from '@/features/programs/model/serialize';
import { programSchema } from '@/features/notation/model/schemas';

function createInitialProgram(): Program {
  return { blocks: [createEmptyBlock()] };
}

export default function ProgramInputPage() {
  const router = useRouter();
  const [program, setProgram] = useState<Program>(createInitialProgram);
  const [savedId, setSavedId] = useState<number | null>(null);

  const handleSheetDismiss = useCallback(() => setSavedId(null), []);

  const { mutate: save, isPending } = useSaveProgram({
    onSuccess: (row) => {
      setProgram(createInitialProgram());
      setSavedId(row.id);
    },
    onError: (e) => toast.error(e.message ?? 'Failed to save.'),
  });

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
          aria-label="Back"
          className="-ml-1 flex h-8 w-8 items-center justify-center rounded-md text-yd-text-muted hover:bg-yd-elevated"
        >
          <ChevronLeft className="size-5" />
        </button>
        <h1 className="text-[18px] font-bold">New Program</h1>
      </header>

      <section className="px-3.5 pb-44 pt-2">
        <div className="flex items-baseline justify-between px-0.5 pb-2.5 pt-1">
          <div>
            <h2 className="text-[20px] font-bold -tracking-[0.3px]">New Program</h2>
            <p className="mt-0.5 text-[11px] text-yd-text-muted">Build it block by block</p>
          </div>
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
            {isPending ? 'Saving...' : canSave ? 'Save Program' : 'Select a movement'}
          </button>
        </div>
      </div>

      {savedId !== null && (
        <ProgramSavedSheet
          savedId={savedId}
          onDismiss={handleSheetDismiss}
        />
      )}
    </main>
  );
}
