'use client';

import { Trash2, X } from 'lucide-react';
import { EntryRow } from '@/features/programs/ui/EntryRow';
import type { DraftAction, DraftBlock, EntryErrors } from '@/features/programs/model/program-draft';
import { MAX_MOVEMENTS_PER_BLOCK } from '@/features/programs/model/program-input';

export type PickerTarget =
  | { kind: 'addBlock' }
  | { kind: 'addMovement'; blockKey: string }
  | { kind: 'replaceMovement'; blockKey: string; index: number };

interface ProgramBlockCardProps {
  block: DraftBlock;
  errors: Record<string, EntryErrors>;
  dispatch: (action: DraftAction) => void;
  onPick: (target: PickerTarget) => void;
}

const SMALL_BUTTON =
  'flex h-11 items-center rounded-lg px-3 text-[13px] font-semibold text-yd-text-muted hover:bg-yd-elevated';

export function ProgramBlockCard({ block, errors, dispatch, onPick }: ProgramBlockCardProps) {
  const isComplex = block.movements.length > 1;

  return (
    <section className="flex flex-col gap-2 rounded-xl border border-yd-line bg-yd-surface p-3">
      <div className="flex items-start gap-1">
        <div className="flex min-w-0 flex-1 flex-wrap gap-1.5">
          {block.movements.map((movement, index) => (
            <div
              key={`${movement.exerciseId}-${index}`}
              className="flex min-h-11 max-w-full items-center rounded-full border border-yd-line bg-yd-elevated"
            >
              <button
                type="button"
                onClick={() =>
                  onPick({ kind: 'replaceMovement', blockKey: block.key, index })
                }
                aria-label={`${movement.name} 종목 바꾸기`}
                className="min-h-11 min-w-0 truncate pl-3.5 pr-3 text-[14px] font-semibold"
              >
                {movement.name}
              </button>
              {isComplex && (
                <button
                  type="button"
                  onClick={() => dispatch({ type: 'removeMovement', blockKey: block.key, index })}
                  aria-label={`${movement.name} 빼기`}
                  className="flex size-11 shrink-0 items-center justify-center text-yd-text-muted"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
          ))}
          {block.movements.length < MAX_MOVEMENTS_PER_BLOCK && (
            <button
              type="button"
              onClick={() => onPick({ kind: 'addMovement', blockKey: block.key })}
              className={SMALL_BUTTON}
            >
              + 복합 동작
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={() => dispatch({ type: 'removeBlock', blockKey: block.key })}
          aria-label="종목 삭제"
          className="flex size-11 shrink-0 items-center justify-center rounded-lg text-yd-text-muted hover:bg-yd-elevated"
        >
          <Trash2 className="size-4" />
        </button>
      </div>

      <ul className="flex flex-col gap-1">
        {block.entries.map((entry) => (
          <EntryRow
            key={entry.key}
            block={block}
            entry={entry}
            errors={errors[entry.key]}
            canRemove={block.entries.length > 1}
            dispatch={dispatch}
          />
        ))}
      </ul>

      <button
        type="button"
        onClick={() => dispatch({ type: 'addEntry', blockKey: block.key })}
        className={`${SMALL_BUTTON} self-start`}
      >
        + 줄 추가
      </button>
    </section>
  );
}
