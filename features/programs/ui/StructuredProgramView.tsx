'use client';

import { useRouter } from 'next/navigation';
import { ROUTES } from '@/routes';
import { DeleteProgramButton } from '@/features/programs/ui/DeleteProgramButton';
import { ProgramHeading } from '@/features/programs/ui/ProgramHeading';
import { serializeProgram } from '@/features/programs/model/serialize';
import type { ProgramView } from '@/features/programs/model/parse-program-row';

type Structured = Extract<ProgramView, { kind: 'structured' }>;

interface StructuredProgramViewProps {
  view: Structured;
  onEdit: () => void;
}

export function StructuredProgramView({ view, onEdit }: StructuredProgramViewProps) {
  const router = useRouter();
  // serializeProgram 은 블록당 한 줄이다.
  const rows = serializeProgram(view.program).split('\n');

  return (
    <section className="flex flex-1 flex-col gap-3 px-4 pb-6">
      <ProgramHeading title={view.title} createdAt={view.createdAt} />

      <ul className="flex flex-col divide-y divide-yd-line rounded-xl border border-yd-line bg-yd-surface">
        {rows.map((row, index) => (
          <li key={index} className="px-3 py-3 font-mono text-[14px] text-yd-text">
            {row}
          </li>
        ))}
      </ul>

      <div className="mt-auto flex flex-col gap-2">
        <button
          type="button"
          onClick={() => router.push(ROUTES.TRAINING.PROGRAM_RUNNER(view.id))}
          className="h-[52px] w-full rounded-2xl bg-yd-primary text-[15px] font-extrabold -tracking-[0.2px] text-yd-on-primary shadow-[0_8px_24px_var(--yd-primary-soft)]"
        >
          운동 시작 →
        </button>
        <button
          type="button"
          onClick={onEdit}
          className="h-[46px] w-full rounded-2xl border border-yd-line text-[14px] font-semibold text-yd-text"
        >
          수정
        </button>
        <DeleteProgramButton id={view.id} />
      </div>
    </section>
  );
}
