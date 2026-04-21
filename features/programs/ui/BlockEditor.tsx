'use client';

import { Input } from '@/components/ui/input/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import type {
  Block,
  RepScheme,
} from '@/features/notation/model/types';
import {
  setMovementName,
  setPercentage,
  setReps,
  setSets,
} from '@/features/programs/model/update';

interface BlockEditorProps {
  block: Block;
  index: number;
  onChange: (next: Block) => void;
  onRemove: () => void;
  canRemove: boolean;
}

function repsToString(scheme: RepScheme): string {
  if (scheme.type === 'simple') return String(scheme.reps);
  return scheme.reps.join('+');
}

function parseRepsInput(value: string): RepScheme | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.includes('+')) {
    const parts = trimmed
      .split('+')
      .map((s) => s.trim())
      .filter(Boolean);
    const nums = parts.map((p) => Number(p));
    if (nums.some((n) => !Number.isInteger(n) || n <= 0)) return null;
    return { type: 'complex', reps: nums };
  }
  const n = Number(trimmed);
  if (!Number.isInteger(n) || n <= 0) return null;
  return { type: 'simple', reps: n };
}

export function BlockEditor({
  block,
  index,
  onChange,
  onRemove,
  canRemove,
}: BlockEditorProps) {
  return (
    <div className="rounded-lg border p-4 space-y-3 bg-card">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold">블록 {index + 1}</h4>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive"
          onClick={onRemove}
          disabled={!canRemove}
          aria-label={`블록 ${index + 1} 삭제`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-2">
        <Label className="text-xs">동작</Label>
        {block.movements.map((m, mi) => (
          <Input
            key={mi}
            value={m.name}
            onChange={(e) =>
              onChange(setMovementName(block, mi, e.target.value))
            }
            placeholder="동작 이름"
          />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="space-y-1">
          <Label className="text-xs">% (선택)</Label>
          <Input
            type="number"
            inputMode="decimal"
            value={block.percentage ?? ''}
            onChange={(e) => {
              const v = e.target.value;
              onChange(
                setPercentage(block, v === '' ? null : Number(v)),
              );
            }}
            placeholder="%"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Reps</Label>
          <Input
            value={repsToString(block.reps)}
            onChange={(e) => {
              const parsed = parseRepsInput(e.target.value);
              if (parsed) onChange(setReps(block, parsed));
            }}
            placeholder="5 또는 3+1"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Sets</Label>
          <Input
            type="number"
            inputMode="numeric"
            value={block.sets}
            onChange={(e) => {
              const n = Number(e.target.value);
              if (Number.isInteger(n) && n > 0) {
                onChange(setSets(block, n));
              }
            }}
          />
        </div>
      </div>

      {block.modifiers.length > 0 && (
        <div className="text-xs text-muted-foreground">
          제약: {block.modifiers.join(', ')}
        </div>
      )}
    </div>
  );
}
