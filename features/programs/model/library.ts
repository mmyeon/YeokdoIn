import type { Program } from '@/features/notation/model/types';
import type { ProgramRow } from '@/features/programs/api/programs';
import { serializeProgram } from '@/features/programs/model/serialize';
import { isTextProgram } from '@/features/programs/model/text-program';

export interface LibraryItem {
  id: number;
  createdAt: string;
  lines: string[];
  /** 레거시 구조화 프로그램만 러너로 진입할 수 있다. */
  isRunnable: boolean;
}

export type LibraryFilter = 'all' | 'week' | 'snatch' | 'cj' | 'squat';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function legacyLines(row: ProgramRow): string[] {
  const program = row.parsed_data as unknown as Program;
  return serializeProgram(program)
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
}

/**
 * 두 저장 형태를 모두 목록 표시용 항목으로 옮긴다.
 * 텍스트 프로그램은 `lines` 를 그대로 쓴다 — 재구성하지 않는다.
 */
export function toLibraryItem(row: ProgramRow): LibraryItem {
  const isText = isTextProgram(row);
  return {
    id: row.id,
    createdAt: row.created_at,
    lines: isText ? (row.lines ?? []) : legacyLines(row),
    isRunnable: !isText,
  };
}

/**
 * 종목 필터는 항목 텍스트에 매칭한다.
 * 표시용 검색이며 표기 규약 적합성 검사가 아니다.
 */
export function matchesFilter(item: LibraryItem, filter: LibraryFilter): boolean {
  if (filter === 'all') return true;
  if (filter === 'week') {
    const diff = Date.now() - new Date(item.createdAt).getTime();
    return diff >= 0 && diff < WEEK_MS;
  }
  const haystack = item.lines.join(' ').toLowerCase();
  if (filter === 'snatch') return /snatch/.test(haystack);
  if (filter === 'cj') return /clean|jerk/.test(haystack);
  if (filter === 'squat') return /squat/.test(haystack);
  return true;
}

export function matchesQuery(item: LibraryItem, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return item.lines.some((l) => l.toLowerCase().includes(q));
}

export function formatAbsoluteDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}.`;
}
