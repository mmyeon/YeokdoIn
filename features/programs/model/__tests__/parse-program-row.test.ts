import { parseProgramRow } from '@/features/programs/model/parse-program-row';
import type { ProgramRow } from '@/features/programs/api/programs';

const VALID_PARSED = {
  blocks: [
    {
      movements: [{ exerciseId: 1, name: 'Snatch' }],
      setEntries: [{ percentage: 70, reps: { type: 'simple', reps: 2 }, sets: 3 }],
    },
  ],
};

function row(overrides: Partial<ProgramRow> = {}): ProgramRow {
  return {
    id: 7,
    user_id: 'user-1',
    title: null,
    parsed_data: VALID_PARSED,
    lines: null,
    source_text: null,
    created_at: '2026-11-20T00:00:00.000Z',
    updated_at: '2026-11-20T00:00:00.000Z',
    ...overrides,
  };
}

describe('parseProgramRow', () => {
  it('parsed_data 가 스키마를 통과하면 구조화 프로그램이다', () => {
    const view = parseProgramRow(row());
    expect(view.kind).toBe('structured');
    if (view.kind === 'structured') {
      expect(view.program.blocks[0].movements[0].name).toBe('Snatch');
    }
  });

  it('lines 가 있으면 텍스트 프로그램이고 줄을 그대로 돌려준다', () => {
    const view = parseProgramRow(row({ parsed_data: null, lines: ['back squat 5x5'] }));
    expect(view).toMatchObject({ kind: 'text', lines: ['back squat 5x5'] });
  });

  it('lines 가 있으면 parsed_data 가 유효해도 텍스트로 본다', () => {
    expect(parseProgramRow(row({ lines: ['a'] })).kind).toBe('text');
  });

  it('lines 가 없고 parsed_data 가 비었으면 읽을 수 없는 프로그램이다', () => {
    expect(parseProgramRow(row({ parsed_data: null })).kind).toBe('unreadable');
  });

  it('parsed_data 가 스키마를 어기면 읽을 수 없는 프로그램이다', () => {
    expect(parseProgramRow(row({ parsed_data: { blocks: [] } })).kind).toBe('unreadable');
    expect(parseProgramRow(row({ parsed_data: { blocks: 'x' } })).kind).toBe('unreadable');
  });

  it('어느 상태든 id, 제목, 생성일을 함께 돌려준다', () => {
    const view = parseProgramRow(row({ title: '월요일', parsed_data: null }));
    expect(view).toMatchObject({
      id: 7,
      title: '월요일',
      createdAt: '2026-11-20T00:00:00.000Z',
    });
  });
});
