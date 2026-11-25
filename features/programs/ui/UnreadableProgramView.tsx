import { DeleteProgramButton } from '@/features/programs/ui/DeleteProgramButton';
import { ProgramHeading } from '@/features/programs/ui/ProgramHeading';
import type { ProgramView } from '@/features/programs/model/parse-program-row';

type Unreadable = Extract<ProgramView, { kind: 'unreadable' }>;

export function UnreadableProgramView({ view }: { view: Unreadable }) {
  return (
    <section className="flex flex-1 flex-col gap-3 px-4 pb-6">
      <ProgramHeading title={view.title} createdAt={view.createdAt} />
      <p className="text-[13px] text-yd-text-muted">
        저장된 내용을 읽을 수 없는 프로그램입니다. 삭제하고 새로 등록해 주세요.
      </p>
      <div className="mt-auto">
        <DeleteProgramButton id={view.id} />
      </div>
    </section>
  );
}
