'use client';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
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
    <div className="space-y-3">
      <h3 className="text-sm font-semibold">파싱된 블록</h3>
      <div className="space-y-3">
        {program.blocks.map((block, i) => (
          <BlockEditor
            key={i}
            block={block}
            index={i}
            canRemove={program.blocks.length > 1}
            onChange={(next) =>
              onChange(updateBlockAt(program, i, () => next))
            }
            onRemove={() => onChange(removeBlockAt(program, i))}
          />
        ))}
      </div>
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => onChange(addBlock(program, createEmptyBlock()))}
      >
        <Plus className="h-4 w-4 mr-1" />
        블록 추가
      </Button>
    </div>
  );
}
