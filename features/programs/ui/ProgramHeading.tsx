import { formatAbsoluteDate } from '@/features/programs/model/library';

interface ProgramHeadingProps {
  title: string | null;
  createdAt: string;
}

export function ProgramHeading({ title, createdAt }: ProgramHeadingProps) {
  return (
    <div>
      <h2 className="text-[20px] font-bold -tracking-[0.3px]">
        {title ?? formatAbsoluteDate(createdAt)}
      </h2>
      {title !== null && (
        <p className="mt-1 text-[12px] text-yd-text-muted">{formatAbsoluteDate(createdAt)}</p>
      )}
    </div>
  );
}
