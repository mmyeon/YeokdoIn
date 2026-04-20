import { parseNotation } from '../parser';
import { NotationParseError } from '../errors';

describe('parseNotation', () => {
  it('단일 동작과 퍼센트가 있는 간단 표기를 파싱한다', () => {
    const program = parseNotation('back squat 70% 5x3');
    expect(program).toEqual({
      blocks: [
        {
          movements: [{ name: 'back squat', modifiers: [] }],
          percentage: 70,
          reps: { type: 'simple', reps: 5 },
          sets: 3,
          modifiers: [],
        },
      ],
    });
  });

  it('콤플렉스(앰퍼샌드)와 복합 reps 표기를 파싱한다', () => {
    const program = parseNotation('snatch pull & power snatch 60% (3+1)x3');
    expect(program.blocks).toHaveLength(1);
    const block = program.blocks[0];
    expect(block.movements.map((m) => m.name)).toEqual(['snatch pull', 'power snatch']);
    expect(block.percentage).toBe(60);
    expect(block.reps).toEqual({ type: 'complex', reps: [3, 1] });
    expect(block.sets).toBe(3);
  });

  it('콤마로 구분된 여러 블록을 각각 파싱한다', () => {
    const program = parseNotation('squat snatch & ohs 75% (3+1)x2, 80% (2+1)x2');
    expect(program.blocks).toHaveLength(2);
    expect(program.blocks[0].percentage).toBe(75);
    expect(program.blocks[0].reps).toEqual({ type: 'complex', reps: [3, 1] });
    expect(program.blocks[0].sets).toBe(2);
    expect(program.blocks[1].percentage).toBe(80);
    expect(program.blocks[1].reps).toEqual({ type: 'complex', reps: [2, 1] });
    expect(program.blocks[1].sets).toBe(2);
    expect(program.blocks[1].movements.map((m) => m.name)).toEqual([
      'squat snatch',
      'ohs',
    ]);
  });

  it('퍼센트가 없는 절대 중량 표기를 파싱한다', () => {
    const program = parseNotation('sots press 5x3');
    expect(program.blocks[0].percentage).toBeNull();
    expect(program.blocks[0].movements[0].name).toBe('sots press');
  });

  it('점이 포함된 약어(P.Sn)를 하나의 이름으로 유지한다', () => {
    const program = parseNotation('P.Sn 80% 3x3');
    expect(program.blocks[0].movements[0].name).toBe('P.Sn');
    expect(program.blocks[0].percentage).toBe(80);
  });

  it('여러 점이 포함된 약어(S.D.L)를 파싱한다', () => {
    const program = parseNotation('S.D.L 100% 5x1');
    expect(program.blocks[0].movements[0].name).toBe('S.D.L');
  });

  it('인라인 괄호 모디파이어는 해당 동작의 modifiers로 들어간다', () => {
    const program = parseNotation('back squat (slow) 70% 5x3');
    const movement = program.blocks[0].movements[0];
    expect(movement.name).toBe('back squat');
    expect(movement.modifiers).toEqual(['slow']);
  });

  it('앞쪽에 오는 prefix 모디파이어(low hang)를 이름에서 분리한다', () => {
    const program = parseNotation('low hang snatch 60% 3x3');
    const movement = program.blocks[0].movements[0];
    expect(movement.name).toBe('snatch');
    expect(movement.modifiers).toEqual(['low hang']);
  });

  it('한글 모디파이어(발붙이기)를 보존한다', () => {
    const program = parseNotation('clean & jerk (발붙이기) 75% (2+1)x3');
    const movements = program.blocks[0].movements;
    expect(movements.map((m) => m.name)).toEqual(['clean', 'jerk']);
    expect(movements[1].modifiers).toEqual(['발붙이기']);
    expect(program.blocks[0].percentage).toBe(75);
  });

  it('공백과 대소문자 차이를 무시하고 파싱한다', () => {
    const program = parseNotation('  BACK SQUAT   70%  5x3  ');
    expect(program.blocks[0].movements[0].name).toBe('BACK SQUAT');
    expect(program.blocks[0].percentage).toBe(70);
    expect(program.blocks[0].reps).toEqual({ type: 'simple', reps: 5 });
    expect(program.blocks[0].sets).toBe(3);
  });

  it('잘못된 표기는 NotationParseError를 던진다', () => {
    expect(() => parseNotation('back squat x3')).toThrow(NotationParseError);
  });

  it('콤플렉스에서 %는 두 번째 동작 기준이라는 의미를 유지한다 (파서는 퍼센트 값만 보존)', () => {
    const program = parseNotation('snatch pull & power snatch 60% (3+1)x3');
    expect(program.blocks[0].percentage).toBe(60);
    expect(program.blocks[0].movements).toHaveLength(2);
  });

  it('빈 문자열은 NotationParseError를 던진다', () => {
    expect(() => parseNotation('')).toThrow(NotationParseError);
  });

  it('공백만 있는 입력은 NotationParseError를 던진다', () => {
    expect(() => parseNotation('   ')).toThrow(NotationParseError);
  });

  it('reps 없이 세트 마커만 있는 입력은 NotationParseError를 던진다', () => {
    expect(() => parseNotation('back squat x3')).toThrow(NotationParseError);
  });

  it('0 또는 음수 reps는 Zod 검증에서 거부된다', () => {
    expect(() => parseNotation('back squat 70% 0x3')).toThrow();
    expect(() => parseNotation('back squat 70% 5x0')).toThrow();
  });

  it('절대 중량 블록에도 퍼센트가 있으면 파싱한다', () => {
    const program = parseNotation('sots press 50% 5x3');
    expect(program.blocks[0].percentage).toBe(50);
    expect(program.blocks[0].movements[0].name).toBe('sots press');
  });

  it('콤마 이후 블록이 이전 블록의 동작을 상속한다', () => {
    const program = parseNotation('back squat 75% 3x3, 80% 2x2');
    expect(program.blocks).toHaveLength(2);
    expect(program.blocks[1].movements.map((m) => m.name)).toEqual(['back squat']);
    expect(program.blocks[1].percentage).toBe(80);
  });

  it('상속된 동작의 modifiers는 원본과 독립적이다', () => {
    const program = parseNotation('back squat (slow) 75% 3x3, 80% 2x2');
    const first = program.blocks[0].movements[0];
    const second = program.blocks[1].movements[0];
    expect(second.modifiers).toEqual(['slow']);
    expect(second.modifiers).not.toBe(first.modifiers);
  });

  it('reps 뒤에 오는 블록 단위 modifier를 수집한다', () => {
    const program = parseNotation('back squat 70% 5x3 (heavy)');
    expect(program.blocks[0].modifiers).toEqual(['heavy']);
  });
});
