'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { ProgramForm } from '@/features/programs/ui/ProgramForm';
import { ProgramHeading } from '@/features/programs/ui/ProgramHeading';
import { newDraftKey, useProgramDraft } from '@/features/programs/ui/useProgramDraft';
import { draftFromProgram } from '@/features/programs/model/program-draft';
import type { ProgramView } from '@/features/programs/model/parse-program-row';
import { useUpdateProgram } from '@/hooks/usePrograms';

type Structured = Extract<ProgramView, { kind: 'structured' }>;

const DISCARD_WARNING = '수정한 내용이 사라집니다. 취소할까요?';

interface StructuredProgramEditProps {
  view: Structured;
  /** 저장 성공과 취소 모두 보기 모드로 돌아간다. */
  onDone: () => void;
}

export function StructuredProgramEdit({ view, onDone }: StructuredProgramEditProps) {
  const [initial] = useState(() => draftFromProgram(view.program, newDraftKey));
  const [draft, dispatch] = useProgramDraft(initial);
  const [saveError, setSaveError] = useState<string | null>(null);

  const { mutate: update, isPending } = useUpdateProgram({
    onSuccess: () => {
      toast.success('수정했습니다.');
      onDone();
    },
    onError: (e) => setSaveError(e.message || '수정에 실패했습니다.'),
  });

  // 키는 초안을 만들 때 한 번만 정해지므로 구조 비교로 충분하다.
  const isDirty = JSON.stringify(draft) !== JSON.stringify(initial);

  const handleCancel = () => {
    if (isDirty && !window.confirm(DISCARD_WARNING)) return;
    onDone();
  };

  return (
    <>
      <div className="flex items-start justify-between gap-3 px-4 pb-3">
        <ProgramHeading title={view.title} createdAt={view.createdAt} />
        <button
          type="button"
          onClick={handleCancel}
          className="flex h-11 shrink-0 items-center rounded-lg px-3 text-[14px] font-semibold text-yd-text-muted hover:bg-yd-elevated"
        >
          취소
        </button>
      </div>
      <ProgramForm
        draft={draft}
        dispatch={dispatch}
        isSaving={isPending}
        saveError={saveError}
        onSubmit={(input) => {
          setSaveError(null);
          update({ id: view.id, ...input });
        }}
      />
    </>
  );
}
