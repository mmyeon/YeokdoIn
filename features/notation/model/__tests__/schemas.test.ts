import {
  blockSchema,
  movementSchema,
  programSchema,
  repSchemeSchema,
} from '../schemas';

describe('repSchemeSchema', () => {
  it('simple 과 complex reps 를 허용한다', () => {
    expect(repSchemeSchema.safeParse({ type: 'simple', reps: 5 }).success).toBe(
      true,
    );
    expect(
      repSchemeSchema.safeParse({ type: 'complex', reps: [3, 1] }).success,
    ).toBe(true);
  });

  it('0 이하 reps 를 거부한다', () => {
    expect(repSchemeSchema.safeParse({ type: 'simple', reps: 0 }).success).toBe(
      false,
    );
    expect(
      repSchemeSchema.safeParse({ type: 'complex', reps: [] }).success,
    ).toBe(false);
  });
});

describe('movementSchema', () => {
  it('비어 있지 않은 이름을 요구한다', () => {
    expect(
      movementSchema.safeParse({ name: 'snatch', modifiers: [] }).success,
    ).toBe(true);
    expect(movementSchema.safeParse({ name: '', modifiers: [] }).success).toBe(
      false,
    );
  });
});

describe('blockSchema', () => {
  it('최소 1개 이상의 movement 를 요구한다', () => {
    expect(
      blockSchema.safeParse({
        movements: [],
        percentage: null,
        reps: { type: 'simple', reps: 1 },
        sets: 1,
        modifiers: [],
      }).success,
    ).toBe(false);
  });
});

describe('programSchema', () => {
  it('최소 1개 이상의 블록을 요구한다', () => {
    expect(programSchema.safeParse({ blocks: [] }).success).toBe(false);
  });

  it('정상 프로그램을 수락한다', () => {
    expect(
      programSchema.safeParse({
        blocks: [
          {
            movements: [{ name: 'snatch', modifiers: [] }],
            percentage: 70,
            reps: { type: 'simple', reps: 3 },
            sets: 4,
            modifiers: ['slow'],
          },
        ],
      }).success,
    ).toBe(true);
  });
});
