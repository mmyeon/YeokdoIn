'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ProgramForm } from '@/features/programs/ui/ProgramForm';
import { ProgramSavedSheet } from '@/features/programs/ui/ProgramSavedSheet';
import { useProgramDraft } from '@/features/programs/ui/useProgramDraft';
import { useSaveProgram } from '@/hooks/usePrograms';
import { ROUTES } from '@/routes';

const LEAVE_WARNING = '등록을 그만두면 입력한 내용이 사라집니다. 나가시겠습니까?';

export default function ProgramInputPage() {
  const router = useRouter();
  const [draft, dispatch] = useProgramDraft();
  const [savedId, setSavedId] = useState<number | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  // isPending 은 다음 렌더에야 바뀌어서 연타 두 번이 모두 통과한다.
  const submitting = useRef(false);

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

  const { mutate: save, isPending } = useSaveProgram({
    onSuccess: (row) => {
      setSaveError(null);
      setSavedId(row.id);
    },
    onError: (e) => {
      submitting.current = false;
      setSaveError(e.message || '저장에 실패했습니다.');
    },
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
          if (submitting.current) return;
          submitting.current = true;
          setSaveError(null);
          save(input);
        }}
      />

      {savedId !== null && (
        // 저장된 초안이 남은 폼으로 돌아가면 같은 프로그램을 또 저장할 수 있다.
        <ProgramSavedSheet
          savedId={savedId}
          onDismiss={() => router.push(ROUTES.TRAINING.PROGRAMS)}
        />
      )}
    </main>
  );
}
