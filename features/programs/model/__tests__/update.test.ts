import {
  addBlock,
  createEmptyBlock,
  removeBlockAt,
  setMovementName,
  setPercentage,
  setReps,
  setSets,
  updateBlockAt,
} from '../update';
import type { Block, Program } from '@/features/notation/model/types';

function makeBlock(name: string): Block {
  return {
    movements: [{ name, modifiers: [] }],
    percentage: null,
    reps: { type: 'simple', reps: 1 },
    sets: 1,
    modifiers: [],
  };
}

function makeProgram(): Program {
  return { blocks: [makeBlock('a'), makeBlock('b')] };
}

describe('updateBlockAt', () => {
  it('해당 인덱스 블록만 교체한 새 Program 을 반환한다', () => {
    const p = makeProgram();
    const next = updateBlockAt(p, 0, (b) => setPercentage(b, 80));
    expect(next).not.toBe(p);
    expect(next.blocks[0].percentage).toBe(80);
    expect(next.blocks[1]).toBe(p.blocks[1]);
    expect(p.blocks[0].percentage).toBeNull();
  });

  it('범위 밖 인덱스는 원본을 그대로 반환한다', () => {
    const p = makeProgram();
    expect(updateBlockAt(p, 99, (b) => b)).toBe(p);
  });
});

describe('removeBlockAt', () => {
  it('해당 블록만 제거한다', () => {
    const p = makeProgram();
    const next = removeBlockAt(p, 0);
    expect(next.blocks).toHaveLength(1);
    expect(next.blocks[0].movements[0].name).toBe('b');
    expect(p.blocks).toHaveLength(2);
  });
});

describe('addBlock', () => {
  it('기존 blocks 끝에 블록을 추가한다', () => {
    const p = makeProgram();
    const next = addBlock(p, createEmptyBlock());
    expect(next.blocks).toHaveLength(3);
    expect(p.blocks).toHaveLength(2);
  });
});

describe('setMovementName', () => {
  it('해당 movement 이름만 변경한다', () => {
    const block = {
      ...makeBlock('a'),
      movements: [
        { name: 'a', modifiers: [] },
        { name: 'b', modifiers: [] },
      ],
    };
    const next = setMovementName(block, 1, 'c');
    expect(next.movements[1].name).toBe('c');
    expect(next.movements[0]).toBe(block.movements[0]);
  });
});

describe('setReps/setSets/setPercentage', () => {
  it('각각 해당 필드만 수정하고 원본은 보존한다', () => {
    const block = makeBlock('a');
    const a = setSets(block, 5);
    const b = setReps(block, { type: 'complex', reps: [3, 1] });
    const c = setPercentage(block, 75);
    expect(a.sets).toBe(5);
    expect(b.reps).toEqual({ type: 'complex', reps: [3, 1] });
    expect(c.percentage).toBe(75);
    expect(block.sets).toBe(1);
    expect(block.percentage).toBeNull();
  });
});
