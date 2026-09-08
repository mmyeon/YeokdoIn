'use client';

import { useMemo } from 'react';
import { findSuspectSpans } from '@/features/programs/model/suspect-spans';

interface SuspectTextProps {
  text: string;
}

/**
 * 오인식 의심 구간만 시각적으로 구분해 보여준다.
 * 자동으로 고치지 않고, 표시가 남아 있다는 이유로 저장을 막지도 않는다.
 */
export function SuspectText({ text }: SuspectTextProps) {
  const parts = useMemo(() => {
    const spans = findSuspectSpans(text);
    const result: Array<{ text: string; suspect: boolean }> = [];
    let cursor = 0;

    for (const span of spans) {
      if (span.start > cursor) {
        result.push({ text: text.slice(cursor, span.start), suspect: false });
      }
      result.push({ text: text.slice(span.start, span.end), suspect: true });
      cursor = span.end;
    }
    if (cursor < text.length) {
      result.push({ text: text.slice(cursor), suspect: false });
    }
    return result;
  }, [text]);

  return (
    <>
      {parts.map((part, i) =>
        part.suspect ? (
          <mark
            key={i}
            title="숫자 자리에 문자가 들어왔습니다"
            className="rounded-[3px] bg-yd-error-soft px-[2px] font-bold text-yd-error"
          >
            {part.text}
          </mark>
        ) : (
          <span key={i}>{part.text}</span>
        ),
      )}
    </>
  );
}
