import type { Program } from '@/features/notation/model/types';
import type { ProgramRow } from '@/features/programs/api/programs';
import { serializeProgram } from '@/features/programs/model/serialize';

export interface LibraryItem {
  id: number;
  title: string;
  createdAt: string;
  lines: string[];
  movementNames: string[];
}

export type LibraryFilter = 'all' | 'week' | 'snatch' | 'cj' | 'squat';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function deriveTitle(program: Program, fallback: string): string {
  const names = program.blocks
    .flatMap((b) => b.movements.map((m) => m.name.trim()))
    .filter((n) => n.length > 0);
  const unique = Array.from(new Set(names));
  if (unique.length === 0) return fallback;
  return unique.slice(0, 2).join(' + ');
}

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
    title: row.title?.trim() || deriveTitle(program, '제목 없음'),
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
  if (item.title.toLowerCase().includes(q)) return true;
  return item.lines.some((l) => l.toLowerCase().includes(q));
}

export function isToday(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export function formatRelativeDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const days = Math.floor((now.getTime() - d.getTime()) / (24 * 60 * 60 * 1000));
  if (days <= 0) return '오늘';
  if (days === 1) return '어제';
  if (days < 7) return `${days}일 전`;
  return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}`;
}
