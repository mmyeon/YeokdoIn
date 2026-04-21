import type { Program } from '@/features/notation/model/types';

export interface ProgramSavePayload {
  user_id: string;
  title: string | null;
  raw_notation: string;
  parsed_data: Program;
}

export interface BuildPayloadInput {
  userId: string;
  rawNotation: string;
  parsed: Program;
  title?: string | null;
}

/**
 * 프로그램 저장용 insert payload 를 생성한다.
 * 순수 함수: 입력 객체를 변형하지 않고, DB 스키마(programs)에 맞는 새 객체를 반환한다.
 */
export function buildProgramSavePayload(
  input: BuildPayloadInput,
): ProgramSavePayload {
  const rawNotation = input.rawNotation.trim();
  if (!rawNotation) {
    throw new Error('노테이션이 비어 있습니다.');
  }
  if (!input.userId) {
    throw new Error('사용자 ID가 필요합니다.');
  }
  const rawTitle = input.title ?? null;
  const title =
    rawTitle === null ? null : rawTitle.trim() === '' ? null : rawTitle.trim();

  return {
    user_id: input.userId,
    title,
    raw_notation: rawNotation,
    parsed_data: input.parsed,
  };
}
