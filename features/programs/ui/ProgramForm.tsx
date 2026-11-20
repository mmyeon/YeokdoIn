'use client';

import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { ExercisePicker } from '@/features/programs/ui/ExercisePicker';
import {
  ProgramBlockCard,
  type PickerTarget,
} from '@/features/programs/ui/ProgramBlockCard';
import {
  toProgramInput,
  type DraftAction,
  type ProgramDraft,
} from '@/features/programs/model/program-draft';
import type { ProgramInput } from '@/features/programs/model/program-input';
import type { Movement } from '@/features/notation/model/types';

interface ProgramFormProps {
  draft: ProgramDraft;
  dispatch: (action: DraftAction) => void;
  isSaving: boolean;
  /** 저장 실패 메시지. 초안은 그대로 유지된다. */
  saveError: string | null;
  onSubmit: (input: ProgramInput) => void;
}

export function ProgramForm({ draft, dispatch, isSaving, saveError, onSubmit }: ProgramFormProps) {
  const [pickerTarget, setPickerTarget] = useState<PickerTarget | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const result = useMemo(() => toProgramInput(draft), [draft]);
  const errors = submitted && !result.ok ? result.errors : {};
  const message = submitted && !result.ok ? result.message : null;

  const handlePick = (movement: Movement) => {
    if (!pickerTarget) return;
    switch (pickerTarget.kind) {
      case 'addBlock':
        dispatch({ type: 'addBlock', movement });
        break;
      case 'addMovement':
        dispatch({ type: 'addMovement', blockKey: pickerTarget.blockKey, movement });
        break;
      case 'replaceMovement':
        dispatch({
          type: 'replaceMovement',
          blockKey: pickerTarget.blockKey,
          index: pickerTarget.index,
          movement,
        });
        break;
    }
  };

  const handleSave = () => {
    if (isSaving) return;
    setSubmitted(true);
    if (result.ok) onSubmit(result.input);
  };

  return (
    <>
      <div className="flex flex-1 flex-col gap-3 px-4 pb-4">
        <p className="text-[12px] text-yd-text-muted">
          칠판의 종목을 고르고 퍼센트, 렙, 세트를 숫자로 입력하세요.
        </p>

        {draft.blocks.length === 0 && (
          <p className="rounded-xl border border-dashed border-yd-line px-4 py-10 text-center text-[13px] text-yd-text-muted">
            아직 종목이 없습니다. 아래에서 첫 종목을 추가하세요.
          </p>
        )}

        {draft.blocks.map((block) => (
          <ProgramBlockCard
            key={block.key}
            block={block}
            errors={errors}
            dispatch={dispatch}
            onPick={setPickerTarget}
          />
        ))}

        <button
          type="button"
          onClick={() => setPickerTarget({ kind: 'addBlock' })}
          className="h-12 w-full rounded-xl border border-dashed border-yd-line-strong text-[14px] font-semibold text-yd-text"
        >
          + 종목 추가
        </button>
      </div>

      <div className="sticky bottom-[var(--tab-bar-height)] flex flex-col gap-2 border-t border-yd-line bg-yd-bg/95 px-4 py-3 backdrop-blur">
        {message && (
          <p role="alert" className="text-[12px] text-yd-error">
            {message}
          </p>
        )}
        {submitted && !result.ok && !message && (
          <p role="alert" className="text-[12px] text-yd-error">
            표시된 칸을 고친 뒤 다시 저장하세요.
          </p>
        )}
        {saveError && (
          <p role="alert" className="text-[12px] text-yd-error">
            {saveError} 입력한 내용은 그대로 남아 있습니다. 다시 시도해 주세요.
          </p>
        )}
        <button
          type="button"
          onClick={handleSave}
          aria-disabled={isSaving || draft.blocks.length === 0}
          className={cn(
            'h-[52px] w-full rounded-2xl text-[15px] font-extrabold -tracking-[0.2px] transition-all',
            !isSaving && draft.blocks.length > 0
              ? 'bg-yd-primary text-yd-on-primary shadow-[0_8px_24px_var(--yd-primary-soft)]'
              : 'border border-yd-line bg-yd-elevated text-yd-text-dim',
          )}
        >
          {isSaving ? '저장 중...' : saveError ? '다시 저장' : '저장'}
        </button>
      </div>

      <ExercisePicker
        open={pickerTarget !== null}
        onOpenChange={(open) => {
          if (!open) setPickerTarget(null);
        }}
        onSelect={handlePick}
      />
    </>
  );
}
