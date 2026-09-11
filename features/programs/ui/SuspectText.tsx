'use client';

import { Fragment, useMemo } from 'react';
import { findSuspectSpans } from '@/features/programs/model/suspect-spans';

interface SuspectTextProps {
  text: string;
}

/** 강도 표기. 범위(`80~90%`)까지 한 덩어리로 본다. */
const INTENSITY = /[0-9]+(?:~[0-9]+)?\s*%/g;

type Kind = 'plain' | 'suspect' | 'intensity';

interface Segment {
  text: string;
  kind: Kind;
}

/**
 * 항목 텍스트 한 줄을 그린다. 내용을 바꾸지 않고 표시만 손댄다.
 *
 * - 오인식 의심 구간을 구분해 보여준다. 자동으로 고치지 않고,
 *   표시가 남아 있다는 이유로 저장을 막지도 않는다.
 * - 강도(`65%`, `80~90%`)를 강조해 종목명과 시각적으로 가른다.
 * - 쉼표 뒤에 줄바꿈 기회를 준다. 텍스트를 쪼개는 것이 아니라
 *   브라우저에 「여기서 접어도 된다」고 알리는 것뿐이다.
 *
 * 쉼표로 항목을 나누거나 강도를 값으로 해석하지 않는다 — 괄호 안 쉼표
 * (`(under knee, Midthigh)`)가 있어 단순 분할은 성립하지 않는다.
 */
export function SuspectText({ text }: SuspectTextProps) {
  const segments = useMemo(() => toSegments(text), [text]);

  return (
    <>
      {segments.map((segment, i) => (
        <Fragment key={i}>{renderSegment(segment, i)}</Fragment>
      ))}
    </>
  );
}

function renderSegment(segment: Segment, index: number) {
  if (segment.kind === 'suspect') {
    return (
      <mark
        title="숫자 자리에 문자가 들어왔습니다"
        className="rounded-[3px] bg-yd-error-soft px-[2px] font-bold text-yd-error"
      >
        {segment.text}
      </mark>
    );
  }
  if (segment.kind === 'intensity') {
    return <span className="font-semibold text-yd-primary">{segment.text}</span>;
  }
  return <>{withCommaBreaks(segment.text, index)}</>;
}

/** 쉼표 뒤에 `<wbr>` 을 넣어 그 자리에서 접히게 한다. 문자는 그대로다. */
function withCommaBreaks(text: string, segmentIndex: number) {
  const pieces = text.split(',');
  return pieces.map((piece, i) => (
    <Fragment key={`${segmentIndex}-${i}`}>
      {piece}
      {i < pieces.length - 1 && (
        <>
          ,<wbr />
        </>
      )}
    </Fragment>
  ));
}

/**
 * 의심 구간이 강도 강조보다 우선한다.
 * `7o%` 처럼 겹치면 강조가 아니라 의심으로 보여야 한다.
 */
function toSegments(text: string): Segment[] {
  const suspects = findSuspectSpans(text).map((s) => ({
    start: s.start,
    end: s.end,
    kind: 'suspect' as const,
  }));

  const intensities = [...text.matchAll(INTENSITY)]
    .map((m) => ({
      start: m.index,
      end: m.index + m[0].length,
      kind: 'intensity' as const,
    }))
    .filter((i) => !suspects.some((s) => s.start < i.end && i.start < s.end));

  const marked = [...suspects, ...intensities].sort((a, b) => a.start - b.start);

  const segments: Segment[] = [];
  let cursor = 0;
  for (const span of marked) {
    if (span.start > cursor) {
      segments.push({ text: text.slice(cursor, span.start), kind: 'plain' });
    }
    segments.push({ text: text.slice(span.start, span.end), kind: span.kind });
    cursor = span.end;
  }
  if (cursor < text.length) {
    segments.push({ text: text.slice(cursor), kind: 'plain' });
  }
  return segments;
}
