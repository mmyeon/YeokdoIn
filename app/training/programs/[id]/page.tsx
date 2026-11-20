'use client';

import { use, useMemo } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/routes';
import { StructuredProgramDetail } from '@/features/programs/ui/StructuredProgramDetail';
import { TextProgramView } from '@/features/programs/ui/TextProgramView';
import { UnreadableProgramView } from '@/features/programs/ui/UnreadableProgramView';
import { parseProgramRow, type ProgramView } from '@/features/programs/model/parse-program-row';
import { useProgram } from '@/hooks/usePrograms';

interface ProgramDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ProgramDetailPage({ params }: ProgramDetailPageProps) {
  const { id: idStr } = use(params);
  const router = useRouter();
  const { data: row, isLoading } = useProgram(Number(idStr));
  const view = useMemo(() => (row ? parseProgramRow(row) : null), [row]);

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col bg-yd-bg pb-[calc(var(--tab-bar-height)+1rem)] text-yd-text">
      <header className="flex items-center gap-3 px-4 pb-1 pt-3">
        <button
          type="button"
          onClick={() => router.push(ROUTES.TRAINING.PROGRAMS)}
          aria-label="뒤로"
          className="-ml-1 flex size-8 items-center justify-center rounded-md text-yd-text-muted hover:bg-yd-elevated"
        >
          <ChevronLeft className="size-5" />
        </button>
        <h1 className="text-[18px] font-bold">프로그램</h1>
      </header>

      {isLoading ? (
        <p className="px-4 py-10 text-center text-[13px] text-yd-text-muted">불러오는 중...</p>
      ) : view === null ? (
        <p className="px-4 py-10 text-center text-[13px] text-yd-text-muted">
          프로그램을 찾을 수 없습니다.
        </p>
      ) : (
        <ProgramBody view={view} />
      )}
    </main>
  );
}

function ProgramBody({ view }: { view: ProgramView }) {
  switch (view.kind) {
    case 'structured':
      return <StructuredProgramDetail view={view} />;
    case 'text':
      return <TextProgramView view={view} />;
    case 'unreadable':
      return <UnreadableProgramView view={view} />;
  }
}
