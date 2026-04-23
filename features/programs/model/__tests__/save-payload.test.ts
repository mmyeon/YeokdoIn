import { buildProgramSavePayload } from '../save-payload';
import type { Program } from '@/features/notation/model/types';

const program: Program = {
  blocks: [
    {
      movements: [{ name: 'back squat', modifiers: [] }],
      percentage: 70,
      reps: { type: 'simple', reps: 5 },
      sets: 3,
      modifiers: [],
    },
  ],
};

describe('buildProgramSavePayload', () => {
  it('정상 입력으로 programs 테이블 insert payload 를 만든다', () => {
    const payload = buildProgramSavePayload({
      userId: 'u1',
      rawNotation: 'back squat 70% 5x3',
      parsed: program,
    });
    expect(payload).toEqual({
      user_id: 'u1',
      title: null,
      raw_notation: 'back squat 70% 5x3',
      parsed_data: program,
    });
  });

  it('rawNotation 의 앞뒤 공백을 제거한다', () => {
    const payload = buildProgramSavePayload({
      userId: 'u1',
      rawNotation: '   back squat 70% 5x3   ',
      parsed: program,
    });
    expect(payload.raw_notation).toBe('back squat 70% 5x3');
  });

  it('rawNotation 이 비어 있으면 에러를 던진다', () => {
    expect(() =>
      buildProgramSavePayload({
        userId: 'u1',
        rawNotation: '   ',
        parsed: program,
      }),
    ).toThrow('노테이션이 비어 있습니다.');
  });

  it('userId 가 비어 있으면 에러를 던진다', () => {
    expect(() =>
      buildProgramSavePayload({
        userId: '',
        rawNotation: 'back squat 70% 5x3',
        parsed: program,
      }),
    ).toThrow('사용자 ID가 필요합니다.');
  });

  it('입력 parsed 객체를 변형하지 않는다', () => {
    const copy = JSON.parse(JSON.stringify(program));
    buildProgramSavePayload({
      userId: 'u1',
      rawNotation: 'back squat 70% 5x3',
      parsed: program,
    });
    expect(program).toEqual(copy);
  });
});
