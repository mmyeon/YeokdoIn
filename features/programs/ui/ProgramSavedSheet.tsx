'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/routes';

interface ProgramSavedSheetProps {
  savedId: number;
  onDismiss: () => void;
}

export function ProgramSavedSheet({ savedId, onDismiss }: ProgramSavedSheetProps) {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDismiss();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onDismiss]);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40"
        onClick={onDismiss}
        aria-hidden="true"
      />
      {/* Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="saved-sheet-title"
        className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-[480px] rounded-t-2xl bg-yd-surface px-4 pb-8 pt-3"
      >
        <div className="mx-auto mb-4 h-1 w-9 rounded-full bg-yd-line" aria-hidden="true" />
        <p
          id="saved-sheet-title"
          className="mb-4 text-center text-[17px] font-bold text-yd-text"
        >
          Program saved!
        </p>
        <div className="flex flex-col gap-3">
          <button
            type="button"
            autoFocus
            onClick={() => router.push(ROUTES.TRAINING.PROGRAM_RUNNER(savedId))}
            className="flex h-[52px] w-full items-center justify-center rounded-2xl bg-yd-primary text-[15px] font-extrabold text-yd-on-primary shadow-[0_8px_24px_var(--yd-primary-soft)]"
          >
            Start Workout Now →
          </button>
          <button
            type="button"
            onClick={() => router.push(ROUTES.TRAINING.PROGRAMS)}
            className="flex h-[48px] w-full items-center justify-center rounded-2xl border border-yd-line text-[14px] font-semibold text-yd-text"
          >
            Back to Library
          </button>
        </div>
      </div>
    </>
  );
}
