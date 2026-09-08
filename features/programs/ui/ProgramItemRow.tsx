'use client';

interface ProgramItemRowProps {
  text: string;
}

/**
 * 불릿 한 행. 항목 텍스트를 재구성하지 않고 그대로 보여준다.
 * 항목당 높이를 절제해 한 화면에 여러 항목이 들어오게 한다.
 */
export function ProgramItemRow({ text }: ProgramItemRowProps) {
  return (
    <li className="flex items-baseline gap-2 border-b border-yd-line/60 px-1 py-2 last:border-b-0">
      <span aria-hidden className="text-[10px] text-yd-primary">
        ▸
      </span>
      <span className="min-w-0 flex-1 break-words font-mono text-[13px] leading-[1.6] text-yd-text">
        {text}
      </span>
    </li>
  );
}
