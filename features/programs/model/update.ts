import type {
  Block,
  ModifierPosition,
  Movement,
  Program,
  RepScheme,
  SetEntry,
} from '@/features/notation/model/types';

/**
 * Program / Block / Movement 에 대한 불변 업데이트 헬퍼.
 *
 * 모든 함수는 입력을 변형하지 않고 새 객체를 반환한다.
 */

export function updateBlockAt(
  program: Program,
  index: number,
  updater: (block: Block) => Block,
): Program {
  if (index < 0 || index >= program.blocks.length) return program;
  const next = program.blocks.map((b, i) => (i === index ? updater(b) : b));
  return { ...program, blocks: next };
}

export function removeBlockAt(program: Program, index: number): Program {
  if (index < 0 || index >= program.blocks.length) return program;
  return {
    ...program,
    blocks: program.blocks.filter((_, i) => i !== index),
  };
}

export function addBlock(program: Program, block: Block): Program {
  return { ...program, blocks: [...program.blocks, block] };
}

export function createEmptySetEntry(): SetEntry {
  return {
    percentage: null,
    reps: { type: 'simple', reps: 3 },
    sets: 3,
  };
}

export function createEmptyBlock(): Block {
  return {
    movements: [{ name: '', modifiers: [] }],
    setEntries: [createEmptySetEntry()],
  };
}

export function updateMovementAt(
  block: Block,
  index: number,
  updater: (m: Movement) => Movement,
): Block {
  if (index < 0 || index >= block.movements.length) return block;
  return {
    ...block,
    movements: block.movements.map((m, i) => (i === index ? updater(m) : m)),
  };
}

export function setMovementName(
  block: Block,
  index: number,
  name: string,
): Block {
  return updateMovementAt(block, index, (m) => ({ ...m, name }));
}

export function updateSetEntryAt(
  block: Block,
  index: number,
  updater: (entry: SetEntry) => SetEntry,
): Block {
  if (index < 0 || index >= block.setEntries.length) return block;
  return {
    ...block,
    setEntries: block.setEntries.map((e, i) => (i === index ? updater(e) : e)),
  };
}

export function addSetEntry(block: Block, entry?: SetEntry): Block {
  return {
    ...block,
    setEntries: [...block.setEntries, entry ?? createEmptySetEntry()],
  };
}

export function removeSetEntryAt(block: Block, index: number): Block {
  if (index < 0 || index >= block.setEntries.length) return block;
  if (block.setEntries.length <= 1) return block;
  return {
    ...block,
    setEntries: block.setEntries.filter((_, i) => i !== index),
  };
}

export function setEntryPercentage(
  block: Block,
  index: number,
  percentage: number | null,
): Block {
  return updateSetEntryAt(block, index, (e) => ({ ...e, percentage }));
}

export function setEntryReps(
  block: Block,
  index: number,
  reps: RepScheme,
): Block {
  return updateSetEntryAt(block, index, (e) => ({ ...e, reps }));
}

export function setEntrySets(block: Block, index: number, sets: number): Block {
  return updateSetEntryAt(block, index, (e) => ({ ...e, sets }));
}

export function addMovement(block: Block, movement: Movement): Block {
  return { ...block, movements: [...block.movements, movement] };
}

export function removeMovementAt(block: Block, index: number): Block {
  if (index < 0 || index >= block.movements.length) return block;
  if (block.movements.length <= 1) return block;
  return {
    ...block,
    movements: block.movements.filter((_, i) => i !== index),
  };
}

/**
 * 특정 movement 의 특정 position 에서 modifier 를 토글한다.
 * 같은 name + position 조합이 이미 있으면 제거, 없으면 배열 끝에 추가한다.
 * position 은 직렬화 순서에 영향을 주므로 보존된다.
 */
export function toggleMovementModifier(
  block: Block,
  movementIndex: number,
  modifier: { name: string; position: ModifierPosition },
): Block {
  return updateMovementAt(block, movementIndex, (m) => {
    const exists = m.modifiers.some(
      (x) => x.name === modifier.name && x.position === modifier.position,
    );
    return {
      ...m,
      modifiers: exists
        ? m.modifiers.filter(
            (x) => !(x.name === modifier.name && x.position === modifier.position),
          )
        : [...m.modifiers, modifier],
    };
  });
}
