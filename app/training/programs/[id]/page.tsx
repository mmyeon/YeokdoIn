'use client';

import { use, useMemo, useState } from 'react';
import { ChevronLeft, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ROUTES } from '@/routes';
import { cn } from '@/lib/utils';
import { ProgramItemRow } from '@/features/programs/ui/ProgramItemRow';
import { toDraftItems, useDraftItems } from '@/features/programs/ui/useDraftItems';
import { formatAbsoluteDate } from '@/features/programs/model/library';
import { isTextProgram, toTextProgram } from '@/features/programs/model/text-program';
import {
  useDeleteProgram,
  useProgram,
  useUpdateTextProgram,
} from '@/hooks/usePrograms';
import type { ProgramRow } from '@/features/programs/api/programs';

interface ProgramDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ProgramDetailPage({ params }: ProgramDetailPageProps) {
  const { id: idStr } = use(params);
  const id = Number(idStr);
  const router = useRouter();
  const { data: row, isLoading } = useProgram(id);

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
        <p className="px-4 py-10 text-center text-[13px] text-yd-text-muted">
          불러오는 중...
        </p>
      ) : !row ? (
        <p className="px-4 py-10 text-center text-[13px] text-yd-text-muted">
          프로그램을 찾을 수 없습니다.
        </p>
      ) : isTextProgram(row) ? (
        <TextProgramDetail key={row.updated_at} row={row} />
      ) : (
        <LegacyProgramNotice id={row.id} createdAt={row.created_at} />
      )}
    </main>
  );
}

interface TextProgramDetailProps {
  row: ProgramRow;
}

function TextProgramDetail({ row }: TextProgramDetailProps) {
  const router = useRouter();
  const program = useMemo(() => toTextProgram(row), [row]);
  const draft = useDraftItems(toDraftItems(program.lines));
  const [error, setError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  const { mutate: update, isPending } = useUpdateTextProgram({
    onSuccess: () => {
      setError(null);
      setDirty(false);
      toast.success('수정했습니다.');
    },
    onError: (e) => setError(e.message || '수정에 실패했습니다.'),
  });

  const { mutate: remove } = useDeleteProgram({
    onSuccess: () => {
      toast.success('삭제했습니다.');
      router.push(ROUTES.TRAINING.PROGRAMS);
    },
    onError: (e) => toast.error(e.message || '삭제에 실패했습니다.'),
  });

  const canSave = draft.items.length > 0 && dirty && !isPending;

  const touch = () => {
    setDirty(true);
    setError(null);
  };

  return (
    <section className="flex flex-1 flex-col gap-3 px-4 pb-6">
      <div className="flex items-baseline justify-between">
        <div>
          <h2 className="text-[20px] font-bold -tracking-[0.3px]">
            {program.title ?? formatAbsoluteDate(program.createdAt)}
          </h2>
          <p className="mt-1 text-[12px] text-yd-text-muted">
            {formatAbsoluteDate(program.createdAt)}
          </p>
        </div>
        <span className="shrink-0 font-mono text-[12px] text-yd-text-muted">
          {draft.items.length}개 항목
        </span>
      </div>

      {draft.items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-yd-line px-4 py-10 text-center text-[13px] text-yd-text-muted">
          항목이 없습니다. 하나 이상 남겨야 저장할 수 있습니다.
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
                touch();
              }}
              onDelete={() => {
                draft.remove(index);
                touch();
              }}
              onAddBelow={() => {
                draft.addBelow(index);
                touch();
              }}
              onMergeUp={() => {
                draft.mergeUp(index);
                touch();
              }}
              onSplit={(at) => {
                draft.split(index, at);
                touch();
              }}
            />
          ))}
        </ul>
      )}

      {error && (
        <p role="alert" className="text-[12px] text-yd-error">
          {error} 편집한 내용은 그대로 남아 있습니다.
        </p>
      )}

      <div className="mt-auto flex flex-col gap-2">
        <button
          type="button"
          onClick={() => {
            if (!canSave) return;
            update({
              id: program.id,
              lines: draft.items.map((i) => i.text),
              title: program.title,
            });
          }}
          aria-disabled={!canSave}
          className={cn(
            'h-[52px] w-full rounded-2xl text-[15px] font-extrabold -tracking-[0.2px] transition-all',
            canSave
              ? 'bg-yd-primary text-yd-on-primary shadow-[0_8px_24px_var(--yd-primary-soft)]'
              : 'border border-yd-line bg-yd-elevated text-yd-text-dim',
          )}
        >
          {isPending ? '저장 중...' : dirty ? '수정 저장' : '변경 없음'}
        </button>
        <button
          type="button"
          onClick={() => {
            if (confirm('이 프로그램을 삭제할까요?')) remove(program.id);
          }}
          className="flex h-[46px] w-full items-center justify-center gap-2 rounded-2xl border border-yd-line text-[14px] font-semibold text-yd-error"
        >
          <Trash2 className="size-4" />
          삭제
        </button>
      </div>
    </section>
  );
}

interface LegacyProgramNoticeProps {
  id: number;
  createdAt: string;
}

/** 레거시 구조화 프로그램은 읽기 전용이다. 러너로만 진입한다. */
function LegacyProgramNotice({ id, createdAt }: LegacyProgramNoticeProps) {
  const router = useRouter();
  return (
    <section className="flex flex-col gap-3 px-4 py-6">
      <h2 className="text-[20px] font-bold -tracking-[0.3px]">
        {formatAbsoluteDate(createdAt)}
      </h2>
      <p className="text-[13px] text-yd-text-muted">
        예전 형식으로 저장된 프로그램입니다. 텍스트로 수정할 수 없습니다.
      </p>
      <button
        type="button"
        onClick={() => router.push(ROUTES.TRAINING.PROGRAM_RUNNER(id))}
        className="h-[52px] w-full rounded-2xl bg-yd-primary text-[15px] font-extrabold text-yd-on-primary"
      >
        운동 시작 →
      </button>
    </section>
  );
}
