import {
  createDraftReducer,
  toProgramInput,
  type DraftAction,
  type ProgramDraft,
} from '@/features/programs/model/program-draft';
import type { Movement } from '@/features/notation/model/types';

const SNATCH: Movement = { exerciseId: 1, name: 'Snatch' };
const CLEAN: Movement = { exerciseId: 2, name: 'Power Clean' };
const JERK: Movement = { exerciseId: 3, name: 'Split Jerk' };

function makeReducer() {
  let n = 0;
  return createDraftReducer(() => `k${(n += 1)}`);
}

function run(actions: DraftAction[], start: ProgramDraft = { blocks: [] }) {
  const reducer = makeReducer();
  return actions.reduce(reducer, start);
}

function expectInvariant(draft: ProgramDraft) {
  for (const block of draft.blocks) {
    expect(block.movements.length).toBeGreaterThanOrEqual(1);
    expect(block.entries.length).toBeGreaterThanOrEqual(1);
    for (const entry of block.entries) {
      expect(entry.reps).toHaveLength(block.movements.length);
    }
  }
}

function firstEntry(draft: ProgramDraft, block = 0, entry = 0) {
  return draft.blocks[block].entries[entry];
}

describe('program-draft reducer', () => {
  it('addBlock 은 빈 줄 하나를 가진 블록을 만든다', () => {
    const draft = run([{ type: 'addBlock', movement: SNATCH }]);
    expect(draft.blocks).toHaveLength(1);
    expect(draft.blocks[0].movements).toEqual([SNATCH]);
    expect(draft.blocks[0].entries).toEqual([
      { key: expect.any(String), percentage: '', reps: [''], sets: '' },
    ]);
    expectInvariant(draft);
  });

  it('키는 주입한 생성기에서 나온다', () => {
    const draft = run([{ type: 'addBlock', movement: SNATCH }]);
    expect(draft.blocks[0].key).toBe('k1');
    expect(firstEntry(draft).key).toBe('k2');
  });

  it('addMovement 는 모든 줄의 reps 를 늘린다', () => {
    const base = run([
      { type: 'addBlock', movement: SNATCH },
      { type: 'addEntry', blockKey: 'k1' },
    ]);
    const draft = run([{ type: 'addMovement', blockKey: 'k1', movement: CLEAN }], base);
    expect(draft.blocks[0].movements).toEqual([SNATCH, CLEAN]);
    expect(draft.blocks[0].entries.map((e) => e.reps)).toEqual([
      ['', ''],
      ['', ''],
    ]);
    expectInvariant(draft);
  });

  it('removeMovement 는 해당 위치의 reps 를 지운다', () => {
    const draft = run([
      { type: 'addBlock', movement: SNATCH },
      { type: 'addMovement', blockKey: 'k1', movement: CLEAN },
      { type: 'addMovement', blockKey: 'k1', movement: JERK },
      { type: 'changeEntry', blockKey: 'k1', entryKey: 'k2', field: 'reps', index: 0, value: '1' },
      { type: 'changeEntry', blockKey: 'k1', entryKey: 'k2', field: 'reps', index: 1, value: '2' },
      { type: 'changeEntry', blockKey: 'k1', entryKey: 'k2', field: 'reps', index: 2, value: '3' },
      { type: 'removeMovement', blockKey: 'k1', index: 1 },
    ]);
    expect(draft.blocks[0].movements).toEqual([SNATCH, JERK]);
    expect(firstEntry(draft).reps).toEqual(['1', '3']);
    expectInvariant(draft);
  });

  it('마지막 동작을 지우면 블록이 사라진다', () => {
    const draft = run([
      { type: 'addBlock', movement: SNATCH },
      { type: 'addBlock', movement: CLEAN },
      { type: 'removeMovement', blockKey: 'k1', index: 0 },
    ]);
    expect(draft.blocks.map((b) => b.movements[0])).toEqual([CLEAN]);
    expectInvariant(draft);
  });

  it('replaceMovement 는 reps 를 건드리지 않는다', () => {
    const draft = run([
      { type: 'addBlock', movement: SNATCH },
      { type: 'changeEntry', blockKey: 'k1', entryKey: 'k2', field: 'reps', index: 0, value: '2' },
      { type: 'replaceMovement', blockKey: 'k1', index: 0, movement: CLEAN },
    ]);
    expect(draft.blocks[0].movements).toEqual([CLEAN]);
    expect(firstEntry(draft).reps).toEqual(['2']);
    expectInvariant(draft);
  });

  it('addEntry 는 위 줄의 reps 와 sets 를 복사하고 percentage 는 비운다', () => {
    const draft = run([
      { type: 'addBlock', movement: SNATCH },
      { type: 'addMovement', blockKey: 'k1', movement: CLEAN },
      { type: 'changeEntry', blockKey: 'k1', entryKey: 'k2', field: 'percentage', value: '70' },
      { type: 'changeEntry', blockKey: 'k1', entryKey: 'k2', field: 'reps', index: 0, value: '1' },
      { type: 'changeEntry', blockKey: 'k1', entryKey: 'k2', field: 'reps', index: 1, value: '2' },
      { type: 'changeEntry', blockKey: 'k1', entryKey: 'k2', field: 'sets', value: '3' },
      { type: 'addEntry', blockKey: 'k1' },
    ]);
    const added = draft.blocks[0].entries[1];
    expect(added).toMatchObject({ percentage: '', reps: ['1', '2'], sets: '3' });
    expect(added.key).not.toBe(firstEntry(draft).key);
    expectInvariant(draft);
  });

  it('복사한 reps 는 원본과 배열을 공유하지 않는다', () => {
    const draft = run([
      { type: 'addBlock', movement: SNATCH },
      { type: 'addEntry', blockKey: 'k1' },
    ]);
    expect(draft.blocks[0].entries[1].reps).not.toBe(firstEntry(draft).reps);
  });

  it('마지막 줄은 지울 수 없다', () => {
    const base = run([{ type: 'addBlock', movement: SNATCH }]);
    const draft = run([{ type: 'removeEntry', blockKey: 'k1', entryKey: 'k2' }], base);
    expect(draft).toEqual(base);
  });

  it('removeEntry 는 줄이 둘 이상이면 해당 줄을 지운다', () => {
    const draft = run([
      { type: 'addBlock', movement: SNATCH },
      { type: 'addEntry', blockKey: 'k1' },
      { type: 'removeEntry', blockKey: 'k1', entryKey: 'k2' },
    ]);
    expect(draft.blocks[0].entries.map((e) => e.key)).toEqual(['k3']);
    expectInvariant(draft);
  });

  it('removeBlock 은 블록을 지운다', () => {
    const draft = run([
      { type: 'addBlock', movement: SNATCH },
      { type: 'addBlock', movement: CLEAN },
      { type: 'removeBlock', blockKey: 'k1' },
    ]);
    expect(draft.blocks).toHaveLength(1);
    expect(draft.blocks[0].movements).toEqual([CLEAN]);
  });

  it('알 수 없는 키나 범위 밖 인덱스는 상태를 바꾸지 않는다', () => {
    const base = run([{ type: 'addBlock', movement: SNATCH }]);
    const actions: DraftAction[] = [
      { type: 'removeBlock', blockKey: 'nope' },
      { type: 'addEntry', blockKey: 'nope' },
      { type: 'removeMovement', blockKey: 'k1', index: 5 },
      { type: 'replaceMovement', blockKey: 'k1', index: 5, movement: CLEAN },
      { type: 'changeEntry', blockKey: 'k1', entryKey: 'k2', field: 'reps', index: 5, value: '1' },
    ];
    for (const action of actions) {
      expect(run([action], base)).toEqual(base);
    }
  });

  it('입력 상태를 변경하지 않는다', () => {
    const base = run([{ type: 'addBlock', movement: SNATCH }]);
    const snapshot = JSON.stringify(base);
    run([
      { type: 'addMovement', blockKey: 'k1', movement: CLEAN },
      { type: 'addEntry', blockKey: 'k1' },
      { type: 'changeEntry', blockKey: 'k1', entryKey: 'k2', field: 'sets', value: '3' },
    ], base);
    expect(JSON.stringify(base)).toBe(snapshot);
  });
});

function fill(
  movements: Movement[],
  entry: { percentage: string; reps: string[]; sets: string },
): ProgramDraft {
  return {
    blocks: [
      {
        key: 'b1',
        movements,
        entries: [{ key: 'e1', ...entry }],
      },
    ],
  };
}

describe('toProgramInput', () => {
  it('빈 초안은 오류다', () => {
    const result = toProgramInput({ blocks: [] });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.message).toBeTruthy();
  });

  it('단일 동작은 simple 렙으로 만든다', () => {
    const result = toProgramInput(fill([SNATCH], { percentage: '70', reps: ['2'], sets: '3' }));
    expect(result).toEqual({
      ok: true,
      input: {
        title: null,
        blocks: [
          {
            exerciseIds: [1],
            setEntries: [{ percentage: 70, reps: { type: 'simple', reps: 2 }, sets: 3 }],
          },
        ],
      },
    });
  });

  it('복합 블록은 complex 렙으로 만든다', () => {
    const result = toProgramInput(
      fill([SNATCH, CLEAN], { percentage: '70', reps: ['1', '2'], sets: '3' }),
    );
    expect(result.ok && result.input.blocks[0].setEntries[0].reps).toEqual({
      type: 'complex',
      reps: [1, 2],
    });
  });

  it('빈 퍼센트는 null 이다', () => {
    const result = toProgramInput(fill([SNATCH], { percentage: ' ', reps: ['5'], sets: '3' }));
    expect(result.ok && result.input.blocks[0].setEntries[0].percentage).toBeNull();
  });

  it('소수 퍼센트를 받고 쉼표 소수점도 받는다', () => {
    const a = toProgramInput(fill([SNATCH], { percentage: '72.5', reps: ['1'], sets: '1' }));
    const b = toProgramInput(fill([SNATCH], { percentage: '72,5', reps: ['1'], sets: '1' }));
    expect(a.ok && a.input.blocks[0].setEntries[0].percentage).toBe(72.5);
    expect(b.ok && b.input.blocks[0].setEntries[0].percentage).toBe(72.5);
  });

  it.each(['abc', '0', '-5', '201', '7.', '1e2'])('퍼센트 %s 는 오류다', (percentage) => {
    const result = toProgramInput(fill([SNATCH], { percentage, reps: ['1'], sets: '1' }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.e1.percentage).toBeTruthy();
  });

  it.each(['', '0', '1.5', 'x', '100'])('렙 %s 는 오류다', (rep) => {
    const result = toProgramInput(fill([SNATCH], { percentage: '', reps: [rep], sets: '1' }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.e1['reps.0']).toBeTruthy();
  });

  it.each(['', '0', '2.5', 'x', '100'])('세트 %s 는 오류다', (sets) => {
    const result = toProgramInput(fill([SNATCH], { percentage: '', reps: ['1'], sets }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.e1.sets).toBeTruthy();
  });

  it('복합 블록에서 비어 있는 칸의 위치만 표시한다', () => {
    const result = toProgramInput(
      fill([SNATCH, CLEAN], { percentage: '', reps: ['1', ''], sets: '1' }),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(Object.keys(result.errors.e1)).toEqual(['reps.1']);
    }
  });

  it('여러 줄의 오류를 줄 키별로 모두 모은다', () => {
    const draft: ProgramDraft = {
      blocks: [
        {
          key: 'b1',
          movements: [SNATCH],
          entries: [
            { key: 'e1', percentage: '70', reps: ['2'], sets: '3' },
            { key: 'e2', percentage: '', reps: ['', ], sets: '' },
          ],
        },
      ],
    };
    const result = toProgramInput(draft);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.e1).toBeUndefined();
      expect(Object.keys(result.errors.e2).sort()).toEqual(['reps.0', 'sets']);
    }
  });
});
