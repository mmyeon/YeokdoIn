'use client';

import { Fragment } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DraftAction, DraftBlock, DraftEntry, EntryErrors } from '@/features/programs/model/program-draft';
import { repsFieldKey } from '@/features/programs/model/program-draft';

interface EntryRowProps {
  block: DraftBlock;
  entry: DraftEntry;
  errors: EntryErrors | undefined;
  canRemove: boolean;
  dispatch: (action: DraftAction) => void;
}

const INPUT_BASE =
  'h-11 rounded-lg border bg-yd-elevated text-center font-mono text-[15px] text-yd-text outline-none focus:border-yd-primary placeholder:text-yd-text-dim';

function inputClass(invalid: boolean, width: string) {
  return cn(INPUT_BASE, width, invalid ? 'border-yd-error' : 'border-yd-line');
}

export function EntryRow({ block, entry, errors, canRemove, dispatch }: EntryRowProps) {
  const target = { blockKey: block.key, entryKey: entry.key };
  const messages = errors ? labeledMessages(errors) : [];

  return (
    <li className="flex flex-col gap-1">
      <div className="flex flex-wrap items-center gap-1.5">
        <div className="relative">
          <input
            inputMode="decimal"
            value={entry.percentage}
            onChange={(e) =>
              dispatch({ type: 'changeEntry', ...target, field: 'percentage', value: e.target.value })
            }
            aria-label="퍼센트"
            aria-invalid={errors?.percentage !== undefined}
            className={cn(inputClass(errors?.percentage !== undefined, 'w-[72px] pr-5'))}
          />
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[12px] text-yd-text-dim">
            %
          </span>
        </div>

        <div className="flex items-center gap-1">
          {entry.reps.map((rep, index) => (
            <Fragment key={index}>
              {index > 0 && <span className="text-yd-text-dim">+</span>}
              <input
                inputMode="numeric"
                value={rep}
                onChange={(e) =>
                  dispatch({ type: 'changeEntry', ...target, field: 'reps', index, value: e.target.value })
                }
                placeholder="렙"
                aria-label={block.movements.length > 1 ? `${block.movements[index].name} 렙` : '렙'}
                aria-invalid={errors?.[repsFieldKey(index)] !== undefined}
                className={inputClass(errors?.[repsFieldKey(index)] !== undefined, 'w-12')}
              />
            </Fragment>
          ))}
        </div>

        <span className="text-yd-text-dim" aria-hidden="true">
          ×
        </span>

        <input
          inputMode="numeric"
          value={entry.sets}
          onChange={(e) =>
            dispatch({ type: 'changeEntry', ...target, field: 'sets', value: e.target.value })
          }
          placeholder="세트"
          aria-label="세트"
          aria-invalid={errors?.sets !== undefined}
          className={inputClass(errors?.sets !== undefined, 'w-14')}
        />

        <button
          type="button"
          onClick={() => dispatch({ type: 'removeEntry', ...target })}
          disabled={!canRemove}
          aria-label="줄 삭제"
          className="ml-auto flex size-11 items-center justify-center rounded-lg text-yd-text-muted enabled:hover:bg-yd-elevated disabled:opacity-30"
        >
          <X className="size-4" />
        </button>
      </div>

      {messages.map((message) => (
        <p key={message} role="alert" className="text-[12px] text-yd-error">
          {message}
        </p>
      ))}
    </li>
  );
}

function labeledMessages(errors: EntryErrors): string[] {
  const messages: string[] = [];
  if (errors.percentage) messages.push(`퍼센트: ${errors.percentage}`);
  const repMessages = Object.entries(errors).filter(([key]) => key.startsWith('reps.'));
  repMessages.forEach(([, message]) => messages.push(`렙: ${message}`));
  if (errors.sets) messages.push(`세트: ${errors.sets}`);
  // 복합 블록에서 렙 칸 여러 개가 같은 오류를 내도 한 번만 보여준다.
  return [...new Set(messages)];
}
