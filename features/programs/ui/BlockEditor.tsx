'use client';

import { useEffect, useState } from 'react';
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
  const [repsDraft, setRepsDraft] = useState(() => repsToString(block.reps));

  // 외부에서 block.reps가 바뀌면 드래프트를 동기화한다.
  // 사용자가 입력 중인 값이 현재 block.reps와 이미 일치한다면 덮어쓰지 않는다.
  useEffect(() => {
    const canonical = repsToString(block.reps);
    const parsedDraft = parseRepsInput(repsDraft);
    if (!parsedDraft || repsToString(parsedDraft) !== canonical) {
      setRepsDraft(canonical);
    }
    // repsDraft는 의도적으로 의존성에서 제외 (사용자 입력 중 클로버 방지)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [block.reps]);

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
              if (v === '') {
                onChange(setPercentage(block, null));
                return;
              }
              const n = Number(v);
              if (Number.isFinite(n) && n >= 0 && n <= 100) {
                onChange(setPercentage(block, n));
              }
            }}
            placeholder="%"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Reps</Label>
          <Input
            value={repsDraft}
            onChange={(e) => {
              const next = e.target.value;
              setRepsDraft(next);
              const parsed = parseRepsInput(next);
              if (parsed) onChange(setReps(block, parsed));
            }}
            onBlur={() => {
              const parsed = parseRepsInput(repsDraft);
              if (parsed) {
                onChange(setReps(block, parsed));
              } else {
                // 잘못된 입력이면 마지막 유효 값으로 되돌린다.
                setRepsDraft(repsToString(block.reps));
              }
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
