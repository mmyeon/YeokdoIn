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
        setEntries: [
          { percentage: null, reps: { type: 'simple', reps: 1 }, sets: 1 },
        ],
      }).success,
    ).toBe(false);
  });

  it('최소 1개 이상의 setEntry 를 요구한다', () => {
    expect(
      blockSchema.safeParse({
        movements: [{ name: 'snatch', modifiers: [] }],
        setEntries: [],
      }).success,
    ).toBe(false);
  });
});

describe('movementSchema modifiers', () => {
  it('position 을 가진 modifier 객체 배열을 허용한다', () => {
    expect(
      movementSchema.safeParse({
        name: 'snatch',
        modifiers: [
          { name: 'pause', position: 'before' },
          { name: 'hold', position: 'after' },
        ],
      }).success,
    ).toBe(true);
  });

  it('position 이 before/after 외면 거부한다', () => {
    expect(
      movementSchema.safeParse({
        name: 'snatch',
        modifiers: [{ name: 'pause', position: 'middle' }],
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
            movements: [
              {
                name: 'snatch',
                modifiers: [{ name: 'pause', position: 'before' }],
              },
            ],
            setEntries: [
              { percentage: 70, reps: { type: 'simple', reps: 3 }, sets: 4 },
            ],
          },
        ],
      }).success,
    ).toBe(true);
  });
});
