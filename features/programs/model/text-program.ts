import type { ProgramRow } from '@/features/programs/api/programs';

/**
 * 행이 텍스트 프로그램인지 판별한다.
 * 판별 기준은 `lines` 의 존재뿐이다 — `parsed_data` 를 보지 않는다.
 */
export function isTextProgram(row: ProgramRow): boolean {
  return row.lines !== null;
}
