'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ProgramItemRow } from '@/features/programs/ui/ProgramItemRow';
import { useDraftItems } from '@/features/programs/ui/useDraftItems';
import type { DraftItem } from '@/features/programs/model/text-program';

interface ConfirmStepProps {
  initialItems: DraftItem[];
  isSaving: boolean;
  /** 저장 실패 메시지. 편집 상태는 그대로 유지된다. */
  error: string | null;
  onSave: (lines: string[]) => void;
  /** 편집 여부. 이탈 경고 판단에 쓴다. */
  onDirtyChange?: (dirty: boolean) => void;
}

/**
 * 확인 단계. 분해된 항목을 그대로 보여주고 고친 뒤 저장한다.
 * 항목 텍스트를 재구성하지 않는다. 의심 구간이 남아 있어도 저장을 막지 않는다.
 */
export function ConfirmStep({
  initialItems,
  isSaving,
  error,
  onSave,
  onDirtyChange,
}: ConfirmStepProps) {
  const draft = useDraftItems(initialItems);
  const [warned, setWarned] = useState(false);

  const notifyDirty = () => onDirtyChange?.(true);

  const handleSave = () => {
    if (draft.items.length === 0) {
      setWarned(true);
      return;
    }
    if (isSaving) return;
    onSave(draft.items.map((item) => item.text));
  };

  const canSave = draft.items.length > 0 && !isSaving;

  return (
    <div className="flex flex-1 flex-col gap-3 px-4 pb-6">
      <div className="flex items-baseline justify-between">
        <div>
          <h2 className="text-[20px] font-bold -tracking-[0.3px]">확인</h2>
          <p className="mt-1 text-[12px] text-yd-text-muted">
            숫자 자리에 문자가 들어온 곳을 표시했습니다. 저장 전에 확인해
            주세요.
          </p>
        </div>
        <span className="shrink-0 font-mono text-[12px] text-yd-text-muted">
          {draft.items.length}개 항목
        </span>
      </div>

      {draft.items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-yd-line px-4 py-10 text-center text-[13px] text-yd-text-muted">
          항목이 없습니다.
        </p>
      ) : (
        <ul className="flex flex-col rounded-xl border border-yd-line bg-yd-surface px-2 py-1">
          {draft.items.map((item, index) => (
            <ProgramItemRow
              key={item.key}
              text={item.text}
              canMergeUp={index > 0}
              onChange={(text) => {
                draft.change(index, text);
                notifyDirty();
              }}
              onDelete={() => {
                draft.remove(index);
                notifyDirty();
              }}
              onAddBelow={() => {
                draft.addBelow(index);
                notifyDirty();
              }}
              onMergeUp={() => {
                draft.mergeUp(index);
                notifyDirty();
              }}
              onSplit={(at) => {
                draft.split(index, at);
                notifyDirty();
              }}
            />
          ))}
        </ul>
      )}

      {warned && draft.items.length === 0 && (
        <p role="alert" className="text-[12px] text-yd-error">
          항목이 하나도 없어 저장할 수 없습니다.
        </p>
      )}

      {error && (
        <p role="alert" className="text-[12px] text-yd-error">
          {error} 편집한 내용은 그대로 남아 있습니다. 다시 시도해 주세요.
        </p>
      )}

      <button
        type="button"
        onClick={handleSave}
        aria-disabled={!canSave}
        className={cn(
          'mt-auto h-[52px] w-full rounded-2xl text-[15px] font-extrabold -tracking-[0.2px] transition-all',
          canSave
            ? 'bg-yd-primary text-yd-on-primary shadow-[0_8px_24px_var(--yd-primary-soft)]'
            : 'border border-yd-line bg-yd-elevated text-yd-text-dim',
        )}
      >
        {isSaving ? '저장 중...' : error ? '다시 저장' : '저장'}
      </button>
    </div>
  );
}
