import { DeleteProgramButton } from '@/features/programs/ui/DeleteProgramButton';
import { ProgramHeading } from '@/features/programs/ui/ProgramHeading';
import type { ProgramView } from '@/features/programs/model/parse-program-row';

type Text = Extract<ProgramView, { kind: 'text' }>;

export function TextProgramView({ view }: { view: Text }) {
  return (
    <section className="flex flex-1 flex-col gap-3 px-4 pb-6">
      <ProgramHeading title={view.title} createdAt={view.createdAt} />
      <p className="text-[13px] text-yd-text-muted">
        예전 텍스트 프로그램이라 무게를 계산하거나 수정할 수 없습니다.
      </p>
      <ul className="flex flex-col divide-y divide-yd-line rounded-xl border border-yd-line bg-yd-surface">
        {view.lines.map((line, index) => (
          <li key={index} className="px-3 py-3 text-[14px] text-yd-text">
            {line}
          </li>
        ))}
      </ul>
      <div className="mt-auto">
        <DeleteProgramButton id={view.id} />
      </div>
    </section>
  );
}
