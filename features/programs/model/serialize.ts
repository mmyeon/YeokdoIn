import type { Block, Program, RepScheme } from '@/features/notation/model/types';

function serializeReps(reps: RepScheme): string {
  if (reps.type === 'simple') return String(reps.reps);
  return `(${reps.reps.join('+')})`;
}

function serializeBlock(block: Block): string {
  const names = block.movements
    .map((m) => m.name.trim())
    .filter((n) => n.length > 0)
    .join(' & ');
  const modifiers = block.modifiers.length > 0 ? ` (${block.modifiers.join(', ')})` : '';
  const percent = block.percentage !== null ? ` ${block.percentage}%` : '';
  const reps = serializeReps(block.reps);
  return `${names}${modifiers}${percent} ${reps}x${block.sets}`.trim();
}

/**
 * Program 블록 배열을 사람이 읽을 수 있는 노테이션 문자열로 역직렬화한다.
 * DB `programs.raw_notation` 컬럼 저장용. 표시/백업 목적이며 파싱되지 않는다.
 */
export function serializeProgram(program: Program): string {
  return program.blocks.map(serializeBlock).join('\n');
}
