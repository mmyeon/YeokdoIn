import type { ProgramRow } from '@/features/programs/api/programs';

/** 저장된 텍스트 프로그램. `lines` 의 순서가 표시 순서다. */
export interface TextProgram {
  id: number;
  title: string | null;
  lines: string[];
  sourceText: string;
  createdAt: string;
  updatedAt: string;
}

/** 확인 단계의 편집 중 항목. 저장되지 않는다. */
export interface DraftItem {
  /** React 키 전용. 영속되지 않는다. */
  key: string;
  text: string;
}

/** 오인식 의심 구간. 화면에만 존재한다. */
export interface SuspectSpan {
  /** 항목 텍스트 내 문자 오프셋 */
  start: number;
  /** 배타적 */
  end: number;
  rule: SuspectRule;
}

/**
 * 검출 규칙의 단일 출처는 `docs/gym-program-notation.md` 4.2 다.
 * 규칙이 늘면 문서를 먼저 고치고 이 유니온을 넓힌다.
 */
export type SuspectRule =
  /** 곱셈 기호 뒤, % 앞, 숫자 사이의 문자 */
  | 'digit-slot-letter'
  /** 숫자 뒤 마침표 다음에 강도가 이어짐 */
  | 'period-separator';

/**
 * 행이 텍스트 프로그램인지 판별한다.
 * 판별 기준은 `lines` 의 존재뿐이다 — `parsed_data` 를 보지 않는다.
 */
export function isTextProgram(row: ProgramRow): boolean {
  return row.lines !== null;
}

/**
 * 텍스트 프로그램 행을 표시용 형태로 옮긴다.
 * 내용을 해석하거나 재구성하지 않는다.
 */
export function toTextProgram(row: ProgramRow): TextProgram {
  if (row.lines === null) {
    throw new Error('Not a text program.');
  }
  return {
    id: row.id,
    title: row.title,
    lines: row.lines,
    sourceText: row.source_text ?? '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
