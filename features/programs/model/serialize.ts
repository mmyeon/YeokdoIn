import type {
  Block,
  Movement,
  Program,
  RepScheme,
} from '@/features/notation/model/types';

function serializeReps(reps: RepScheme): string {
  if (reps.type === 'simple') return String(reps.reps);
  return `(${reps.reps.join('+')})`;
}

function serializeMovement(movement: Movement): string {
  const before = movement.modifiers
    .filter((m) => m.position === 'before')
    .map((m) => m.name);
  const after = movement.modifiers
    .filter((m) => m.position === 'after')
    .map((m) => m.name);
  return [...before, movement.name.trim(), ...after]
    .filter((s) => s.length > 0)
    .join(' ');
}

function serializeBlock(block: Block): string {
  const names = block.movements
    .filter((m) => m.name.trim().length > 0)
    .map(serializeMovement)
    .join(' & ');
  const percent = block.percentage !== null ? ` ${block.percentage}%` : '';
  const reps = serializeReps(block.reps);
  return `${names}${percent} ${reps}x${block.sets}`.trim();
}

/**
 * Program 블록 배열을 사람이 읽을 수 있는 노테이션 문자열로 역직렬화한다.
 * Modifier 는 각 movement 에 속하며, position 에 따라 name 앞/뒤에 배치된다.
 * DB `programs.raw_notation` 컬럼 저장용. 표시/백업 목적이며 파싱되지 않는다.
 */
export function serializeProgram(program: Program): string {
  return program.blocks.map(serializeBlock).join('\n');
}
