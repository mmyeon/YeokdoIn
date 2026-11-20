import type { ProgramRow } from '@/features/programs/api/programs';
import { programSchema } from '@/features/notation/model/schemas';
import type { Program } from '@/features/notation/model/types';

interface ProgramViewBase {
  id: number;
  title: string | null;
  createdAt: string;
}

export type ProgramView =
  | (ProgramViewBase & { kind: 'structured'; program: Program })
  | (ProgramViewBase & { kind: 'text'; lines: string[] })
  | (ProgramViewBase & { kind: 'unreadable' });

/**
 * DB 행을 화면이 그릴 세 상태 중 하나로 옮긴다.
 * 텍스트 판별은 `isTextProgram` 과 같이 `lines` 만 본다. 목록의 실행 가능 여부와 어긋나지 않게 하려는 것이다.
 */
export function parseProgramRow(row: ProgramRow): ProgramView {
  const base: ProgramViewBase = {
    id: row.id,
    title: row.title,
    createdAt: row.created_at,
  };

  if (row.lines !== null) return { ...base, kind: 'text', lines: row.lines };

  const parsed = programSchema.safeParse(row.parsed_data);
  if (parsed.success) return { ...base, kind: 'structured', program: parsed.data };

  return { ...base, kind: 'unreadable' };
}
