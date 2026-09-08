'use client';

import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PasteStep } from '@/features/programs/ui/PasteStep';
import { ConfirmStep } from '@/features/programs/ui/ConfirmStep';
import { ProgramSavedSheet } from '@/features/programs/ui/ProgramSavedSheet';
import { toDraftItems } from '@/features/programs/ui/useDraftItems';
import { splitIntoItems } from '@/features/programs/model/split-items';
import type { DraftItem } from '@/features/programs/model/text-program';
import { useSaveTextProgram } from '@/hooks/usePrograms';

const LEAVE_WARNING = '등록을 그만두면 입력한 내용이 사라집니다. 나가시겠습니까?';

interface ConfirmState {
  /** 확인 단계 진입 시점의 입력 원문. 이후 편집에 영향받지 않는다. */
  sourceText: string;
  items: DraftItem[];
}

/**
 * 입력 → 확인 단방향 2단계 호스트.
 * 확인 단계에서 입력 단계로 돌아가는 경로를 만들지 않는다 —
 * 그래야 원문이 `source_text` 로 한 번만 고정된다.
 * 확인 단계를 벗어나는 것은 등록 폐기다.
 */
export default function ProgramInputPage() {
  const router = useRouter();
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);
  const [savedId, setSavedId] = useState<number | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const isDiscardable = confirm !== null && savedId === null;

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

  const { mutate: save, isPending } = useSaveTextProgram({
    onSuccess: (row) => {
      setSaveError(null);
      setConfirm(null);
      setSavedId(row.id);
    },
    // 실패해도 확인 단계의 편집 상태를 그대로 두고 재시도하게 한다.
    onError: (e) => setSaveError(e.message || '저장에 실패했습니다.'),
  });

  const handleNext = useCallback((text: string) => {
    setConfirm({ sourceText: text, items: toDraftItems(splitIntoItems(text)) });
  }, []);

  const handleSave = useCallback(
    (lines: string[]) => {
      if (!confirm) return;
      setSaveError(null);
      save({ sourceText: confirm.sourceText, lines, title: null });
    },
    [confirm, save],
  );

  const handleBack = () => {
    if (isDiscardable && !window.confirm(LEAVE_WARNING)) return;
    if (window.history.length > 1) router.back();
    else router.push('/training');
  };

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col bg-yd-bg text-yd-text">
      <header className="flex items-center gap-3 px-4 pb-1 pt-3">
        <button
          type="button"
          onClick={handleBack}
          aria-label="뒤로"
          className="-ml-1 flex h-8 w-8 items-center justify-center rounded-md text-yd-text-muted hover:bg-yd-elevated"
        >
          <ChevronLeft className="size-5" />
        </button>
        <h1 className="text-[18px] font-bold">새 프로그램</h1>
      </header>

      {confirm === null ? (
        <PasteStep onNext={handleNext} />
      ) : (
        <ConfirmStep
          key={confirm.sourceText}
          initialItems={confirm.items}
          isSaving={isPending}
          error={saveError}
          onSave={handleSave}
        />
      )}

      {savedId !== null && (
        <ProgramSavedSheet savedId={savedId} onDismiss={handleSheetDismiss} />
      )}
    </main>
  );
}
