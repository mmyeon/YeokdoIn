import { buildProgram } from '@/features/programs/model/build-program';
import type { ProgramInput } from '@/features/programs/model/program-input';

const EXERCISES = [
  { id: 1, name: 'Snatch' },
  { id: 2, name: 'Power Clean' },
  { id: 3, name: 'Front Squat' },
];

const simple = (reps: number) => ({ type: 'simple' as const, reps });
const complex = (reps: number[]) => ({ type: 'complex' as const, reps });

function input(blocks: ProgramInput['blocks']): ProgramInput {
  return { blocks };
}

describe('buildProgram', () => {
  it('DB 이름을 movement 에 찍는다', () => {
    const result = buildProgram(
      input([
        { exerciseIds: [1], setEntries: [{ percentage: 70, reps: simple(2), sets: 3 }] },
      ]),
      EXERCISES,
    );
    expect(result).toEqual({
      ok: true,
      program: {
        blocks: [
          {
            movements: [{ exerciseId: 1, name: 'Snatch' }],
            setEntries: [{ percentage: 70, reps: simple(2), sets: 3 }],
          },
        ],
      },
    });
  });

  it('블록 안과 블록 사이의 순서를 보존한다', () => {
    const entry = { percentage: null, reps: complex([1, 2]), sets: 1 };
    const result = buildProgram(
      input([
        { exerciseIds: [3, 2], setEntries: [entry] },
        { exerciseIds: [1], setEntries: [{ ...entry, reps: simple(1) }] },
      ]),
      EXERCISES,
    );
    if (!result.ok) throw new Error(result.error);
    expect(result.program.blocks.map((b) => b.movements.map((m) => m.name))).toEqual([
      ['Front Squat', 'Power Clean'],
      ['Snatch'],
    ]);
  });

  it('없는 종목 id 는 오류로 돌려준다', () => {
    const result = buildProgram(
      input([
        { exerciseIds: [1, 999], setEntries: [{ percentage: 70, reps: complex([1, 1]), sets: 1 }] },
      ]),
      EXERCISES,
    );
    expect(result.ok).toBe(false);
  });

  it('단일 동작 블록에 complex 렙을 허용하지 않는다', () => {
    const result = buildProgram(
      input([
        { exerciseIds: [1], setEntries: [{ percentage: 70, reps: complex([2]), sets: 1 }] },
      ]),
      EXERCISES,
    );
    expect(result.ok).toBe(false);
  });

  it('복합 블록에 simple 렙을 허용하지 않는다', () => {
    const result = buildProgram(
      input([
        { exerciseIds: [1, 2], setEntries: [{ percentage: 70, reps: simple(2), sets: 1 }] },
      ]),
      EXERCISES,
    );
    expect(result.ok).toBe(false);
  });

  it('복합 블록의 렙 개수가 동작 수와 다르면 오류다', () => {
    const result = buildProgram(
      input([
        { exerciseIds: [1, 2], setEntries: [{ percentage: 70, reps: complex([1, 1, 1]), sets: 1 }] },
      ]),
      EXERCISES,
    );
    expect(result.ok).toBe(false);
  });
});
