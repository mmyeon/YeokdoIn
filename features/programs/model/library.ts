import type { Program } from '@/features/notation/model/types';
import type { ProgramRow } from '@/features/programs/api/programs';
import { serializeProgram } from '@/features/programs/model/serialize';

export interface LibraryItem {
  id: number;
  createdAt: string;
  lines: string[];
  movementNames: string[];
}

export type LibraryFilter = 'all' | 'week' | 'snatch' | 'cj' | 'squat';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export function toLibraryItem(row: ProgramRow): LibraryItem {
  const program = row.parsed_data as unknown as Program;
  const lines = serializeProgram(program)
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  const movementNames = program.blocks.flatMap((b) =>
    b.movements.map((m) => m.name.toLowerCase()),
  );
  return {
    id: row.id,
    createdAt: row.created_at,
    lines,
    movementNames,
  };
}

export function matchesFilter(item: LibraryItem, filter: LibraryFilter): boolean {
  if (filter === 'all') return true;
  if (filter === 'week') {
    const diff = Date.now() - new Date(item.createdAt).getTime();
    return diff >= 0 && diff < WEEK_MS;
  }
  const haystack = item.movementNames.join(' ');
  if (filter === 'snatch') return /snatch/.test(haystack);
  if (filter === 'cj') return /clean|jerk/.test(haystack);
  if (filter === 'squat') return /squat/.test(haystack);
  return true;
}

export function matchesQuery(item: LibraryItem, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  if (item.movementNames.some((m) => m.includes(q))) return true;
  return item.lines.some((l) => l.toLowerCase().includes(q));
}

export function formatAbsoluteDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}.`;
}
