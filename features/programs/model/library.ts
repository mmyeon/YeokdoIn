import { serializeProgram } from '@/features/programs/model/serialize';
import {
  parseProgramRow,
  type ProgramRowContent,
} from '@/features/programs/model/parse-program-row';

export interface LibraryItem {
  id: number;
  createdAt: string;
  lines: string[];
  isRunnable: boolean;
}

export type LibraryFilter = 'all' | 'week' | 'snatch' | 'cj' | 'squat';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/** 실행 가능 여부는 러너가 읽을 수 있는지와 같아야 한다. */
export function toLibraryItem(row: ProgramRowContent): LibraryItem {
  const view = parseProgramRow(row);
  const lines =
    view.kind === 'text'
      ? view.lines
      : view.kind === 'structured'
        ? serializeProgram(view.program).split('\n').filter(Boolean)
        : [];
  return {
    id: row.id,
    createdAt: row.created_at,
    lines,
    isRunnable: view.kind === 'structured',
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
