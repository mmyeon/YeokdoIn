'use client';

import type { Program } from '@/features/notation/model/types';
import {
  addBlock,
  createEmptyBlock,
  removeBlockAt,
  updateBlockAt,
} from '@/features/programs/model/update';
import { BlockEditor } from './BlockEditor';

interface ProgramFormProps {
  program: Program;
  onChange: (next: Program) => void;
}

export function ProgramForm({ program, onChange }: ProgramFormProps) {
  return (
    <div className="flex flex-col gap-3">
      {program.blocks.map((block, i) => (
        <BlockEditor
          key={i}
          block={block}
          index={i}
          totalBlocks={program.blocks.length}
          onChange={(next) => onChange(updateBlockAt(program, i, () => next))}
          onRemove={() => onChange(removeBlockAt(program, i))}
        />
      ))}
      <button
        type="button"
        onClick={() => onChange(addBlock(program, createEmptyBlock()))}
        className="flex h-[46px] items-center justify-center gap-1.5 rounded-xl border-[1.5px] border-dashed border-yd-line"
      >
        <span className="text-[15px] font-bold text-yd-primary">+</span>
        <span className="text-[13px] font-semibold text-yd-text-muted">
          블록 추가
        </span>
      </button>
    </div>
  );
}
