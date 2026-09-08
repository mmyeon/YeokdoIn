'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface PasteStepProps {
  /** 「다음」을 눌렀을 때, 그 시점의 입력 원문을 넘긴다. */
  onNext: (text: string) => void;
}

/**
 * 입력 단계. 붙여넣은 텍스트를 그대로 보여주기만 한다.
 * 분해 결과(불릿)를 미리 보여주지 않는다 — 확인 단계에서만 나타난다.
 */
export function PasteStep({ onNext }: PasteStepProps) {
  const [text, setText] = useState('');
  const [warned, setWarned] = useState(false);

  const canProceed = text.trim().length > 0;

  const handleNext = () => {
    if (!canProceed) {
      setWarned(true);
      return;
    }
    onNext(text);
  };

  return (
    <div className="flex flex-1 flex-col gap-3 px-4 pb-6">
      <div>
        <h2 className="text-[20px] font-bold -tracking-[0.3px]">
          프로그램 붙여넣기
        </h2>
        <p className="mt-1 text-[12px] text-yd-text-muted">
          칠판 사진에서 인식한 텍스트를 그대로 붙여넣으세요. 다음 단계에서 줄
          단위로 확인합니다.
        </p>
      </div>

      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          if (warned) setWarned(false);
        }}
        placeholder={'back press 5x3\nhang power snatch 65% 3×2, 70% 3×2'}
        aria-label="프로그램 텍스트"
        aria-invalid={warned}
        spellCheck={false}
        autoCorrect="off"
        autoCapitalize="off"
        autoComplete="off"
        className={cn(
          'min-h-[240px] flex-1 resize-none rounded-xl border bg-yd-surface px-3.5 py-3 font-mono text-[14px] leading-[1.7] text-yd-text outline-none placeholder:text-yd-text-dim',
          warned ? 'border-yd-error' : 'border-yd-line',
        )}
      />

      {warned && (
        <p role="alert" className="text-[12px] text-yd-error">
          붙여넣은 내용이 없습니다.
        </p>
      )}

      <button
        type="button"
        onClick={handleNext}
        aria-disabled={!canProceed}
        className={cn(
          'h-[52px] w-full rounded-2xl text-[15px] font-extrabold -tracking-[0.2px] transition-all',
          canProceed
            ? 'bg-yd-primary text-yd-on-primary shadow-[0_8px_24px_var(--yd-primary-soft)]'
            : 'border border-yd-line bg-yd-elevated text-yd-text-dim',
        )}
      >
        다음
      </button>
    </div>
  );
}
