import {
  isTextProgram,
  toTextProgram,
} from '@/features/programs/model/text-program';
import type { ProgramRow } from '@/features/programs/api/programs';

function textRow(overrides: Partial<ProgramRow> = {}): ProgramRow {
  return {
    id: 1,
    user_id: 'user-1',
    title: null,
    parsed_data: null,
    lines: ['back press 5x3', 'back squat 80% 5×5'],
    source_text: 'back press 5x3\nback squat 80% 5×5',
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
    parsed_data: { blocks: [] },
    lines: null,
    source_text: null,
    created_at: '2026-09-08T00:00:00.000Z',
    updated_at: '2026-09-08T00:00:00.000Z',
    ...overrides,
  };
}

describe('isTextProgram', () => {
  it('lines 가 있으면 텍스트 프로그램이다', () => {
    expect(isTextProgram(textRow())).toBe(true);
  });

  it('lines 가 null 이면 레거시 구조화 프로그램이다', () => {
    expect(isTextProgram(legacyRow())).toBe(false);
  });

  it('parsed_data 의 존재로 판별하지 않는다', () => {
    expect(isTextProgram(textRow({ parsed_data: { blocks: [] } }))).toBe(true);
  });
});

describe('toTextProgram', () => {
  it('행을 그대로 옮긴다', () => {
    expect(toTextProgram(textRow())).toEqual({
      id: 1,
      title: null,
      lines: ['back press 5x3', 'back squat 80% 5×5'],
      sourceText: 'back press 5x3\nback squat 80% 5×5',
      createdAt: '2026-09-08T00:00:00.000Z',
      updatedAt: '2026-09-08T00:00:00.000Z',
    });
  });

  it('항목 순서를 바꾸지 않는다', () => {
    const lines = ['a', 'b', 'c'];
    expect(toTextProgram(textRow({ lines })).lines).toEqual(['a', 'b', 'c']);
  });

  it('source_text 가 null 이면 빈 문자열로 둔다', () => {
    expect(toTextProgram(textRow({ source_text: null })).sourceText).toBe('');
  });

  it('레거시 행에서는 오류를 던진다', () => {
    expect(() => toTextProgram(legacyRow())).toThrow();
  });
});
