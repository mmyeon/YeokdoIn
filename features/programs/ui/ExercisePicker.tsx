'use client';

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { useExercises } from '@/features/exercises/ui/useExercises';
import { searchExercises } from '@/features/exercises/model/search-exercises';
import type { Movement } from '@/features/notation/model/types';

const RESULT_LIMIT = 50;

interface ExercisePickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (movement: Movement) => void;
}

export function ExercisePicker({ open, onOpenChange, onSelect }: ExercisePickerProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="top-0 left-0 flex h-dvh max-w-none translate-x-0 translate-y-0 flex-col gap-0 rounded-none border-0 bg-yd-bg p-0 text-yd-text sm:max-w-none"
        aria-describedby={undefined}
      >
        <DialogTitle className="px-4 pb-2 pt-4 text-[18px] font-bold">
          종목 선택
        </DialogTitle>
        <DialogDescription className="sr-only">
          이름으로 검색해서 종목을 고릅니다.
        </DialogDescription>
        <PickerBody
          onSelect={(movement) => {
            onSelect(movement);
            onOpenChange(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

function PickerBody({ onSelect }: { onSelect: (movement: Movement) => void }) {
  const { data: exercises, isLoading, isError } = useExercises();
  const [query, setQuery] = useState('');

  const results = useMemo(
    () => searchExercises(exercises ?? [], query, RESULT_LIMIT),
    [exercises, query],
  );

  return (
    <>
      <div className="px-4 pb-3">
        <label className="flex h-11 items-center gap-2 rounded-xl border border-yd-line bg-yd-surface px-3 focus-within:border-yd-primary">
          <Search className="size-4 shrink-0 text-yd-text-dim" aria-hidden="true" />
          <input
            autoFocus
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="종목 이름 검색 (예: power sn)"
            aria-label="종목 검색"
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
            autoComplete="off"
            className="min-w-0 flex-1 bg-transparent text-[15px] text-yd-text outline-none placeholder:text-yd-text-dim"
          />
        </label>
      </div>

      <div className="flex-1 overflow-y-auto border-t border-yd-line">
        {isLoading ? (
          <p className="px-4 py-10 text-center text-[13px] text-yd-text-muted">
            종목을 불러오는 중...
          </p>
        ) : isError ? (
          <p role="alert" className="px-4 py-10 text-center text-[13px] text-yd-error">
            종목을 불러오지 못했습니다.
          </p>
        ) : results.length === 0 ? (
          <p className="px-4 py-10 text-center text-[13px] text-yd-text-muted">
            일치하는 종목이 없습니다.
          </p>
        ) : (
          <ul>
            {results.map((exercise) => (
              <li key={exercise.id} className="border-b border-yd-line">
                <button
                  type="button"
                  onClick={() => onSelect({ exerciseId: exercise.id, name: exercise.name })}
                  className="flex min-h-12 w-full items-center px-4 text-left text-[15px] active:bg-yd-elevated"
                >
                  {exercise.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
