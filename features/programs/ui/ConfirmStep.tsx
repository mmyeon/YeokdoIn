'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ProgramItemRow } from '@/features/programs/ui/ProgramItemRow';
import type { DraftItem } from '@/features/programs/model/text-program';

interface ConfirmStepProps {
  items: DraftItem[];
  isSaving: boolean;
  onSave: (lines: string[]) => void;
}

/**
 * 확인 단계. 분해된 항목을 그대로 보여주고 저장한다.
 * 항목 텍스트를 재구성하지 않는다.
 */
export function ConfirmStep({ items, isSaving, onSave }: ConfirmStepProps) {
  const [warned, setWarned] = useState(false);

  const canSave = items.length > 0 && !isSaving;

  const handleSave = () => {
    if (items.length === 0) {
      setWarned(true);
      return;
    }
    if (isSaving) return;
    onSave(items.map((item) => item.text));
  };

  return (
    <div className="flex flex-1 flex-col gap-3 px-4 pb-6">
      <div className="flex items-baseline justify-between">
        <h2 className="text-[20px] font-bold -tracking-[0.3px]">확인</h2>
        <span className="font-mono text-[12px] text-yd-text-muted">
          {items.length}개 항목
        </span>
      </div>

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-yd-line px-4 py-10 text-center text-[13px] text-yd-text-muted">
          항목이 없습니다.
        </p>
      ) : (
        <ul className="flex flex-col rounded-xl border border-yd-line bg-yd-surface px-2 py-1">
          {items.map((item) => (
            <ProgramItemRow key={item.key} text={item.text} />
          ))}
        </ul>
      )}

      {warned && (
        <p role="alert" className="text-[12px] text-yd-error">
          항목이 하나도 없어 저장할 수 없습니다.
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
        {isSaving ? '저장 중...' : '저장'}
      </button>
    </div>
  );
}
