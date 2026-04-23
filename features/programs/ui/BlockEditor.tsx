'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2, X } from 'lucide-react';
import type { Block, RepScheme } from '@/features/notation/model/types';
import {
  addMovement,
  removeMovementAt,
  setMovementName,
  setPercentage,
  setReps,
  setSets,
  toggleBlockModifier,
} from '@/features/programs/model/update';
import {
  MOVEMENT_GROUPS,
  MOVEMENT_MODIFIERS,
} from '@/features/programs/model/movements';

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

const MAX_MOVEMENTS_PER_BLOCK = 2;

export function BlockEditor({
  block,
  index,
  onChange,
  onRemove,
  canRemove,
}: BlockEditorProps) {
  const [repsDraft, setRepsDraft] = useState(() => repsToString(block.reps));

  useEffect(() => {
    const canonical = repsToString(block.reps);
    const parsedDraft = parseRepsInput(repsDraft);
    if (!parsedDraft || repsToString(parsedDraft) !== canonical) {
      setRepsDraft(canonical);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [block.reps]);

  const canAddMovement = block.movements.length < MAX_MOVEMENTS_PER_BLOCK;

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
          <div key={mi} className="flex gap-2">
            <Select
              value={m.name || undefined}
              onValueChange={(value) =>
                onChange(setMovementName(block, mi, value))
              }
            >
              <SelectTrigger className="w-full" aria-label={`동작 ${mi + 1}`}>
                <SelectValue placeholder="동작 선택" />
              </SelectTrigger>
              <SelectContent>
                {MOVEMENT_GROUPS.map((group) => (
                  <SelectGroup key={group.category}>
                    <SelectLabel>{group.category}</SelectLabel>
                    {group.items.map((name) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
            {block.movements.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 shrink-0 text-muted-foreground"
                onClick={() => onChange(removeMovementAt(block, mi))}
                aria-label={`동작 ${mi + 1} 삭제`}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
        {canAddMovement && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() =>
              onChange(addMovement(block, { name: '', modifiers: [] }))
            }
          >
            <Plus className="h-4 w-4 mr-1" />
            복합 동작 추가
          </Button>
        )}
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

      <div className="space-y-2">
        <Label className="text-xs">수행 조건 (중복 선택)</Label>
        <div className="flex flex-wrap gap-1.5">
          {MOVEMENT_MODIFIERS.map((mod) => {
            const active = block.modifiers.includes(mod);
            return (
              <Button
                key={mod}
                type="button"
                variant={active ? 'default' : 'outline'}
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => onChange(toggleBlockModifier(block, mod))}
                aria-pressed={active}
              >
                {mod}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
