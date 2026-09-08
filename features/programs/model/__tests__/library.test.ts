import {
  matchesFilter,
  matchesQuery,
  toLibraryItem,
  type LibraryItem,
} from '@/features/programs/model/library';
import type { ProgramRow } from '@/features/programs/api/programs';

function textRow(lines: string[], overrides: Partial<ProgramRow> = {}): ProgramRow {
  return {
    id: 1,
    user_id: 'user-1',
    title: null,
    parsed_data: null,
    lines,
    source_text: lines.join('\n'),
    created_at: '2026-09-08T00:00:00.000Z',
    updated_at: '2026-09-08T00:00:00.000Z',
    ...overrides,
  };
}

function legacyRow(overrides: Partial<ProgramRow> = {}): ProgramRow {
  return {
    id: 2,
    user_id: 'user-1',
    title: null,
    parsed_data: {
      blocks: [
        {
          movements: [{ name: 'Back Squat', modifiers: [] }],
          setEntries: [
            { percentage: 80, reps: { type: 'simple', reps: 5 }, sets: 5 },
          ],
        },
      ],
    },
    lines: null,
    source_text: null,
    created_at: '2026-09-08T00:00:00.000Z',
    updated_at: '2026-09-08T00:00:00.000Z',
    ...overrides,
  };
}

describe('toLibraryItem', () => {
  it('텍스트 행은 lines 를 그대로 쓴다', () => {
    const lines = ['back press 5x3', 'hang power snatch 65% 3×2'];
    expect(toLibraryItem(textRow(lines)).lines).toEqual(lines);
  });

  it('텍스트 행의 항목을 재구성하지 않는다', () => {
    const item = toLibraryItem(textRow(['clean 80% 2x2, 85% 2×2']));
    expect(item.lines).toEqual(['clean 80% 2x2, 85% 2×2']);
  });

  it('레거시 행은 serializeProgram 을 거쳐 줄로 만든다', () => {
    expect(toLibraryItem(legacyRow()).lines).toEqual(['Back Squat 80% 5x5']);
  });

  it('텍스트 행은 isRunnable 이 false 다', () => {
    expect(toLibraryItem(textRow(['back press 5x3'])).isRunnable).toBe(false);
  });

  it('레거시 행만 isRunnable 이 true 다', () => {
    expect(toLibraryItem(legacyRow()).isRunnable).toBe(true);
  });
});

describe('matchesFilter', () => {
  const item = (lines: string[], createdAt = '2020-01-01T00:00:00.000Z'): LibraryItem =>
    toLibraryItem(textRow(lines, { created_at: createdAt }));

  it('all 은 항상 통과한다', () => {
    expect(matchesFilter(item(['anything']), 'all')).toBe(true);
  });

  it('종목 필터가 텍스트 행의 항목 텍스트에 매칭된다', () => {
    expect(matchesFilter(item(['hang power snatch 65% 3×2']), 'snatch')).toBe(true);
    expect(matchesFilter(item(['squat clean 75% 2x3']), 'cj')).toBe(true);
    expect(matchesFilter(item(['back squat 80% 5×5']), 'squat')).toBe(true);
  });

  it('대소문자를 구분하지 않는다', () => {
    expect(matchesFilter(item(['Back Squat 80% 4x2']), 'squat')).toBe(true);
  });

  it('해당 종목이 없으면 걸리지 않는다', () => {
    expect(matchesFilter(item(['back press 5x3']), 'snatch')).toBe(false);
  });

  it('레거시 행도 같은 기준으로 걸린다', () => {
    expect(matchesFilter(toLibraryItem(legacyRow()), 'squat')).toBe(true);
  });

  it('week 은 최근 7일만 통과한다', () => {
    expect(matchesFilter(item(['a'], new Date().toISOString()), 'week')).toBe(true);
    expect(matchesFilter(item(['a']), 'week')).toBe(false);
  });
});

describe('matchesQuery', () => {
  it('빈 질의는 항상 통과한다', () => {
    expect(matchesQuery(toLibraryItem(textRow(['a'])), '  ')).toBe(true);
  });

  it('항목 텍스트에 매칭된다', () => {
    expect(matchesQuery(toLibraryItem(textRow(['hang power snatch'])), 'SNATCH')).toBe(true);
    expect(matchesQuery(toLibraryItem(textRow(['back press'])), 'snatch')).toBe(false);
  });
});
