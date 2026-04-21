import type {
  Block,
  Movement,
  Program,
  RepScheme,
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

export function createEmptyBlock(): Block {
  return {
    movements: [{ name: '', modifiers: [] }],
    percentage: null,
    reps: { type: 'simple', reps: 1 },
    sets: 1,
    modifiers: [],
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

export function setPercentage(
  block: Block,
  percentage: number | null,
): Block {
  return { ...block, percentage };
}

export function setSets(block: Block, sets: number): Block {
  return { ...block, sets };
}

export function setReps(block: Block, reps: RepScheme): Block {
  return { ...block, reps };
}
