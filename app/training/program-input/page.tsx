'use client';

import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ProgramForm } from '@/features/programs/ui/ProgramForm';
import { ProgramSavedSheet } from '@/features/programs/ui/ProgramSavedSheet';
import { useProgramDraft } from '@/features/programs/ui/useProgramDraft';
import { useSaveProgram } from '@/hooks/usePrograms';

const LEAVE_WARNING = '등록을 그만두면 입력한 내용이 사라집니다. 나가시겠습니까?';

export default function ProgramInputPage() {
  const router = useRouter();
  const [draft, dispatch] = useProgramDraft();
  const [savedId, setSavedId] = useState<number | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const isDiscardable = draft.blocks.length > 0 && savedId === null;

  useEffect(() => {
    if (!isDiscardable) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = LEAVE_WARNING;
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDiscardable]);

  const handleSheetDismiss = useCallback(() => setSavedId(null), []);

  const { mutate: save, isPending } = useSaveProgram({
    onSuccess: (row) => {
      setSaveError(null);
      setSavedId(row.id);
    },
    // 실패해도 초안을 그대로 두고 재시도하게 한다.
    onError: (e) => setSaveError(e.message || '저장에 실패했습니다.'),
  });

  const handleBack = () => {
    if (isDiscardable && !window.confirm(LEAVE_WARNING)) return;
    if (window.history.length > 1) router.back();
    else router.push('/training');
  };

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col bg-yd-bg pb-[var(--tab-bar-height)] text-yd-text">
      <header className="flex items-center gap-3 px-4 pb-1 pt-3">
        <button
          type="button"
          onClick={handleBack}
          aria-label="뒤로"
          className="-ml-1 flex size-11 items-center justify-center rounded-md text-yd-text-muted hover:bg-yd-elevated"
        >
          <ChevronLeft className="size-5" />
        </button>
        <h1 className="text-[18px] font-bold">새 프로그램</h1>
      </header>

      <ProgramForm
        draft={draft}
        dispatch={dispatch}
        isSaving={isPending}
        saveError={saveError}
        onSubmit={(input) => {
          setSaveError(null);
          save(input);
        }}
      />

      {savedId !== null && (
        <ProgramSavedSheet savedId={savedId} onDismiss={handleSheetDismiss} />
      )}
    </main>
  );
}
