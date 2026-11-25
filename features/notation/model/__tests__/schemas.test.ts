import {
  MAX_PERCENTAGE,
  MAX_REPS,
  MAX_SETS,
  blockSchema,
  movementSchema,
  programSchema,
  repSchemeSchema,
  setEntrySchema,
} from '../schemas';

const simpleEntry = {
  percentage: 70,
  reps: { type: 'simple', reps: 3 },
  sets: 4,
};

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

  it('상한을 넘거나 정수가 아닌 reps 를 거부한다', () => {
    expect(
      repSchemeSchema.safeParse({ type: 'simple', reps: MAX_REPS }).success,
    ).toBe(true);
    expect(
      repSchemeSchema.safeParse({ type: 'simple', reps: MAX_REPS + 1 }).success,
    ).toBe(false);
    expect(
      repSchemeSchema.safeParse({ type: 'complex', reps: [3, 100] }).success,
    ).toBe(false);
    expect(
      repSchemeSchema.safeParse({ type: 'simple', reps: 2.5 }).success,
    ).toBe(false);
  });
});

describe('setEntrySchema', () => {
  it('퍼센트가 null 이어도 허용한다', () => {
    expect(
      setEntrySchema.safeParse({ ...simpleEntry, percentage: null }).success,
    ).toBe(true);
  });

  it('퍼센트는 0 초과 상한 이하만 허용한다', () => {
    expect(
      setEntrySchema.safeParse({ ...simpleEntry, percentage: MAX_PERCENTAGE })
        .success,
    ).toBe(true);
    expect(
      setEntrySchema.safeParse({ ...simpleEntry, percentage: 0 }).success,
    ).toBe(false);
    expect(
      setEntrySchema.safeParse({ ...simpleEntry, percentage: -5 }).success,
    ).toBe(false);
    expect(
      setEntrySchema.safeParse({
        ...simpleEntry,
        percentage: MAX_PERCENTAGE + 1,
      }).success,
    ).toBe(false);
  });

  it('sets 는 1 이상 상한 이하 정수만 허용한다', () => {
    expect(
      setEntrySchema.safeParse({ ...simpleEntry, sets: MAX_SETS }).success,
    ).toBe(true);
    expect(setEntrySchema.safeParse({ ...simpleEntry, sets: 0 }).success).toBe(
      false,
    );
    expect(
      setEntrySchema.safeParse({ ...simpleEntry, sets: MAX_SETS + 1 }).success,
    ).toBe(false);
    expect(
      setEntrySchema.safeParse({ ...simpleEntry, sets: 1.5 }).success,
    ).toBe(false);
  });
});

describe('movementSchema', () => {
  it('종목 id 와 비어 있지 않은 이름을 요구한다', () => {
    expect(
      movementSchema.safeParse({ exerciseId: 58, name: 'Snatch' }).success,
    ).toBe(true);
    expect(
      movementSchema.safeParse({ exerciseId: 58, name: '' }).success,
    ).toBe(false);
    expect(movementSchema.safeParse({ name: 'Snatch' }).success).toBe(false);
  });

  it('양의 정수가 아닌 종목 id 를 거부한다', () => {
    expect(
      movementSchema.safeParse({ exerciseId: 0, name: 'Snatch' }).success,
    ).toBe(false);
    expect(
      movementSchema.safeParse({ exerciseId: 1.5, name: 'Snatch' }).success,
    ).toBe(false);
  });
});

describe('blockSchema', () => {
  it('최소 1개 이상의 movement 를 요구한다', () => {
    expect(
      blockSchema.safeParse({ movements: [], setEntries: [simpleEntry] })
        .success,
    ).toBe(false);
  });

  it('최소 1개 이상의 setEntry 를 요구한다', () => {
    expect(
      blockSchema.safeParse({
        movements: [{ exerciseId: 58, name: 'Snatch' }],
        setEntries: [],
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
            movements: [{ exerciseId: 58, name: 'Snatch' }],
            setEntries: [simpleEntry],
          },
        ],
      }).success,
    ).toBe(true);
  });
});
