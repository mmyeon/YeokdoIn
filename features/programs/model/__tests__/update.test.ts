import {
  addBlock,
  addMovement,
  addSetEntry,
  createEmptyBlock,
  createEmptySetEntry,
  removeBlockAt,
  removeMovementAt,
  removeSetEntryAt,
  setEntryPercentage,
  setEntryReps,
  setEntryRepsAt,
  setEntrySets,
  setMovementName,
  toggleMovementModifier,
  updateBlockAt,
} from '../update';
import type { Block, Program } from '@/features/notation/model/types';

function makeBlock(name: string): Block {
  return {
    movements: [{ name, modifiers: [] }],
    setEntries: [createEmptySetEntry()],
  };
}

function makeProgram(): Program {
  return { blocks: [makeBlock('a'), makeBlock('b')] };
}

describe('updateBlockAt', () => {
  it('해당 인덱스 블록만 교체한 새 Program 을 반환한다', () => {
    const p = makeProgram();
    const next = updateBlockAt(p, 0, (b) => setEntryPercentage(b, 0, 80));
    expect(next).not.toBe(p);
    expect(next.blocks[0].setEntries[0].percentage).toBe(80);
    expect(next.blocks[1]).toBe(p.blocks[1]);
    expect(p.blocks[0].setEntries[0].percentage).toBeNull();
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

describe('setEntryReps/setEntrySets/setEntryPercentage', () => {
  it('해당 set-entry 필드만 수정하고 원본은 보존한다', () => {
    const block = makeBlock('a');
    const a = setEntrySets(block, 0, 5);
    const b = setEntryReps(block, 0, { type: 'complex', reps: [3, 1] });
    const c = setEntryPercentage(block, 0, 75);
    expect(a.setEntries[0].sets).toBe(5);
    expect(b.setEntries[0].reps).toEqual({ type: 'complex', reps: [3, 1] });
    expect(c.setEntries[0].percentage).toBe(75);
    expect(block.setEntries[0].sets).toBe(3);
    expect(block.setEntries[0].percentage).toBeNull();
  });
});

describe('addSetEntry', () => {
  it('기존 setEntries 끝에 새 entry 를 추가한다', () => {
    const block = makeBlock('a');
    const next = addSetEntry(block);
    expect(next.setEntries).toHaveLength(2);
    expect(block.setEntries).toHaveLength(1);
  });
});

describe('removeSetEntryAt', () => {
  it('해당 entry 만 제거한다', () => {
    const block = addSetEntry(makeBlock('a'));
    const next = removeSetEntryAt(block, 0);
    expect(next.setEntries).toHaveLength(1);
  });

  it('entry 가 1개뿐이면 원본을 반환한다', () => {
    const block = makeBlock('a');
    expect(removeSetEntryAt(block, 0)).toBe(block);
  });

  it('범위 밖 인덱스는 원본을 반환한다', () => {
    const block = addSetEntry(makeBlock('a'));
    expect(removeSetEntryAt(block, 99)).toBe(block);
  });
});

describe('addMovement', () => {
  it('블록 끝에 movement 를 추가한다', () => {
    const block = makeBlock('a');
    const next = addMovement(block, { name: 'b', modifiers: [] });
    expect(next.movements).toHaveLength(2);
    expect(next.movements[1].name).toBe('b');
    expect(block.movements).toHaveLength(1);
  });
});

describe('removeMovementAt', () => {
  it('해당 movement 만 제거한다', () => {
    const block = {
      ...makeBlock('a'),
      movements: [
        { name: 'a', modifiers: [] },
        { name: 'b', modifiers: [] },
      ],
    };
    const next = removeMovementAt(block, 0);
    expect(next.movements).toHaveLength(1);
    expect(next.movements[0].name).toBe('b');
  });

  it('movement 가 1개뿐이면 원본을 반환한다', () => {
    const block = makeBlock('a');
    expect(removeMovementAt(block, 0)).toBe(block);
  });

  it('범위 밖 인덱스는 원본을 반환한다', () => {
    const block = makeBlock('a');
    expect(removeMovementAt(block, 99)).toBe(block);
  });
});

describe('toggleMovementModifier', () => {
  it('같은 name+position 이 없으면 추가한다', () => {
    const block = makeBlock('snatch');
    const next = toggleMovementModifier(block, 0, {
      name: 'pause',
      position: 'before',
    });
    expect(next.movements[0].modifiers).toEqual([
      { name: 'pause', position: 'before' },
    ]);
  });

  it('같은 name+position 조합이 있으면 제거한다', () => {
    const block = makeBlock('snatch');
    const added = toggleMovementModifier(block, 0, {
      name: 'pause',
      position: 'before',
    });
    const removed = toggleMovementModifier(added, 0, {
      name: 'pause',
      position: 'before',
    });
    expect(removed.movements[0].modifiers).toEqual([]);
  });

  it('같은 name 이어도 position 이 다르면 둘 다 공존한다', () => {
    const block = makeBlock('snatch');
    const a = toggleMovementModifier(block, 0, {
      name: 'pause',
      position: 'before',
    });
    const b = toggleMovementModifier(a, 0, {
      name: 'pause',
      position: 'after',
    });
    expect(b.movements[0].modifiers).toEqual([
      { name: 'pause', position: 'before' },
      { name: 'pause', position: 'after' },
    ]);
  });

  it('추가 순서가 보존된다', () => {
    const block = makeBlock('snatch');
    const a = toggleMovementModifier(block, 0, {
      name: 'no foot',
      position: 'before',
    });
    const b = toggleMovementModifier(a, 0, {
      name: 'pause',
      position: 'before',
    });
    expect(b.movements[0].modifiers.map((m) => m.name)).toEqual([
      'no foot',
      'pause',
    ]);
  });

  it('범위 밖 movementIndex 는 원본을 반환한다', () => {
    const block = makeBlock('snatch');
    expect(
      toggleMovementModifier(block, 99, {
        name: 'pause',
        position: 'before',
      }),
    ).toBe(block);
  });
});

describe('setEntryRepsAt (per-movement reps)', () => {
  function twoMovementBlock(): Block {
    return {
      movements: [
        { name: 'snatch pull', modifiers: [] },
        { name: 'squat snatch', modifiers: [] },
      ],
      setEntries: [createEmptySetEntry()],
    };
  }

  it('movement 1개 블록에서는 simple reps 로 저장한다', () => {
    const block = makeBlock('back squat');
    const next = setEntryRepsAt(block, 0, 0, 5);
    expect(next.setEntries[0].reps).toEqual({ type: 'simple', reps: 5 });
  });

  it('movement 2개 블록에서 첫 운동 reps 를 바꾸면 complex 배열의 첫 값만 갱신된다', () => {
    const block = twoMovementBlock();
    const next = setEntryRepsAt(block, 0, 0, 1);
    expect(next.setEntries[0].reps).toEqual({ type: 'complex', reps: [1, 3] });
  });

  it('simple 상태에서 두 번째 운동 reps 를 바꾸면 기존 값으로 broadcast 후 갱신한다', () => {
    const block = twoMovementBlock();
    const next = setEntryRepsAt(block, 0, 1, 2);
    expect(next.setEntries[0].reps).toEqual({ type: 'complex', reps: [3, 2] });
  });

  it('범위 밖 movementIndex 는 원본을 반환한다', () => {
    const block = twoMovementBlock();
    expect(setEntryRepsAt(block, 0, 99, 5)).toBe(block);
  });
});

describe('addMovement reps 동기화', () => {
  it('simple reps 블록에 movement 를 추가하면 같은 값으로 broadcast 된 complex reps 가 된다', () => {
    const block = makeBlock('snatch pull');
    const next = addMovement(block, { name: 'squat snatch', modifiers: [] });
    expect(next.setEntries[0].reps).toEqual({ type: 'complex', reps: [3, 3] });
  });

  it('complex reps 배열은 마지막 값으로 패딩된다', () => {
    const block = setEntryReps(makeBlock('a'), 0, {
      type: 'complex',
      reps: [3, 1],
    });
    // movements 는 1 개이므로 먼저 2 개로 늘린다
    const two = addMovement(block, { name: 'b', modifiers: [] });
    // 위에서 simple(3) -> complex [3,3] 로 broadcast 되었을 것 (block 의 초기 reps 는 complex 였음)
    // 그래서 complex([3,1]) -> [3,1] 그대로 유지 (길이 맞음)
    expect(two.setEntries[0].reps).toEqual({ type: 'complex', reps: [3, 1] });
    const three = addMovement(two, { name: 'c', modifiers: [] });
    expect(three.setEntries[0].reps).toEqual({ type: 'complex', reps: [3, 1, 1] });
  });
});

describe('removeMovementAt reps 동기화', () => {
  it('complex reps 에서 해당 인덱스 값이 제거된다', () => {
    const block = setEntryReps(
      {
        movements: [
          { name: 'a', modifiers: [] },
          { name: 'b', modifiers: [] },
          { name: 'c', modifiers: [] },
        ],
        setEntries: [createEmptySetEntry()],
      },
      0,
      { type: 'complex', reps: [1, 2, 3] },
    );
    const next = removeMovementAt(block, 1);
    expect(next.setEntries[0].reps).toEqual({ type: 'complex', reps: [1, 3] });
  });

  it('제거 후 movement 가 1개가 되면 simple 로 축약된다', () => {
    const block = setEntryReps(
      {
        movements: [
          { name: 'a', modifiers: [] },
          { name: 'b', modifiers: [] },
        ],
        setEntries: [createEmptySetEntry()],
      },
      0,
      { type: 'complex', reps: [1, 2] },
    );
    const next = removeMovementAt(block, 1);
    expect(next.setEntries[0].reps).toEqual({ type: 'simple', reps: 1 });
  });
});

describe('updateBlockAt 범위 내 인덱스 체크', () => {
  it('음수 인덱스는 원본을 반환한다', () => {
    const p = { blocks: [makeBlock('a')] };
    expect(updateBlockAt(p, -1, (b) => b)).toBe(p);
  });
});

describe('removeBlockAt 범위 체크', () => {
  it('범위 밖 인덱스는 원본을 반환한다', () => {
    const p = { blocks: [makeBlock('a')] };
    expect(removeBlockAt(p, 99)).toBe(p);
    expect(removeBlockAt(p, -1)).toBe(p);
  });
});
