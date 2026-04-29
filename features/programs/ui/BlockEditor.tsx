'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2, X } from 'lucide-react';
import type { Block, RepScheme } from '@/features/notation/model/types';
import {
  addMovement,
  addSetEntry,
  removeMovementAt,
  removeSetEntryAt,
  setEntryPercentage,
  setEntryReps,
  setEntrySets,
  setMovementName,
  toggleMovementModifier,
} from '@/features/programs/model/update';
import { MOVEMENT_MODIFIERS } from '@/features/programs/model/movements';
import { MovementCombobox } from './MovementCombobox';

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

const PERCENTAGE_OPTIONS = Array.from({ length: 11 }, (_, i) => 50 + i * 5);
const PERCENTAGE_NONE_VALUE = 'none';

interface SetEntryRowProps {
  block: Block;
  entryIndex: number;
  canRemove: boolean;
  onChange: (next: Block) => void;
}

function SetEntryRow({
  block,
  entryIndex,
  canRemove,
  onChange,
}: SetEntryRowProps) {
  const entry = block.setEntries[entryIndex];
  const [repsDraft, setRepsDraft] = useState(() => repsToString(entry.reps));

  useEffect(() => {
    const canonical = repsToString(entry.reps);
    const parsedDraft = parseRepsInput(repsDraft);
    if (!parsedDraft || repsToString(parsedDraft) !== canonical) {
      setRepsDraft(canonical);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry.reps]);

  return (
    <div className="flex items-end gap-2">
      <div className="flex-1 grid grid-cols-3 gap-2">
        <div className="space-y-1">
          {entryIndex === 0 && <Label className="text-xs">% (선택)</Label>}
          <Select
            value={
              entry.percentage == null
                ? PERCENTAGE_NONE_VALUE
                : String(entry.percentage)
            }
            onValueChange={(v) => {
              if (v === PERCENTAGE_NONE_VALUE) {
                onChange(setEntryPercentage(block, entryIndex, null));
                return;
              }
              const n = Number(v);
              if (Number.isFinite(n)) {
                onChange(setEntryPercentage(block, entryIndex, n));
              }
            }}
          >
            <SelectTrigger aria-label={`세트 ${entryIndex + 1} %`}>
              <SelectValue placeholder="%" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={PERCENTAGE_NONE_VALUE}>—</SelectItem>
              {PERCENTAGE_OPTIONS.map((p) => (
                <SelectItem key={p} value={String(p)}>
                  {p}%
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          {entryIndex === 0 && <Label className="text-xs">Reps</Label>}
          <Input
            value={repsDraft}
            onChange={(e) => {
              const next = e.target.value;
              setRepsDraft(next);
              const parsed = parseRepsInput(next);
              if (parsed) onChange(setEntryReps(block, entryIndex, parsed));
            }}
            onKeyDown={(e) => {
              if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
              if (entry.reps.type !== 'simple') return;
              e.preventDefault();
              const delta = e.key === 'ArrowUp' ? 1 : -1;
              const nextReps = entry.reps.reps + delta;
              if (nextReps <= 0) return;
              const nextScheme: RepScheme = { type: 'simple', reps: nextReps };
              setRepsDraft(repsToString(nextScheme));
              onChange(setEntryReps(block, entryIndex, nextScheme));
            }}
            onBlur={() => {
              const parsed = parseRepsInput(repsDraft);
              if (parsed) {
                onChange(setEntryReps(block, entryIndex, parsed));
              } else {
                setRepsDraft(repsToString(entry.reps));
              }
            }}
            placeholder="5 또는 3+1"
            aria-label={`세트 ${entryIndex + 1} reps`}
          />
        </div>
        <div className="space-y-1">
          {entryIndex === 0 && <Label className="text-xs">Sets</Label>}
          <Input
            type="number"
            inputMode="numeric"
            value={entry.sets}
            onChange={(e) => {
              const n = Number(e.target.value);
              if (Number.isInteger(n) && n > 0) {
                onChange(setEntrySets(block, entryIndex, n));
              }
            }}
            aria-label={`세트 ${entryIndex + 1} sets`}
          />
        </div>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-9 w-9 shrink-0 text-muted-foreground"
        onClick={() => onChange(removeSetEntryAt(block, entryIndex))}
        disabled={!canRemove}
        aria-label={`세트 ${entryIndex + 1} 삭제`}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function BlockEditor({
  block,
  index,
  onChange,
  onRemove,
  canRemove,
}: BlockEditorProps) {
  const canAddMovement = block.movements.length < MAX_MOVEMENTS_PER_BLOCK;
  const canRemoveSetEntry = block.setEntries.length > 1;

  return (
    <div className="relative rounded-lg border p-4 space-y-3 bg-card">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-8 w-8 text-destructive"
        onClick={onRemove}
        disabled={!canRemove}
        aria-label={`블록 ${index + 1} 삭제`}
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <div className="space-y-2">
        <Label className="text-xs">동작</Label>
        {block.movements.map((m, mi) => {
          const isActive = (name: string, position: 'before' | 'after') =>
            m.modifiers.some(
              (x) => x.name === name && x.position === position,
            );
          return (
            <div key={mi} className="space-y-2 rounded-md border p-2">
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">
                  앞 modifier
                </Label>
                <div className="flex flex-wrap gap-1">
                  {MOVEMENT_MODIFIERS.map((mod) => {
                    const active = isActive(mod, 'before');
                    return (
                      <Button
                        key={`before-${mod}`}
                        type="button"
                        variant={active ? 'default' : 'outline'}
                        size="sm"
                        className="h-6 px-2 text-[11px]"
                        onClick={() =>
                          onChange(
                            toggleMovementModifier(block, mi, {
                              name: mod,
                              position: 'before',
                            }),
                          )
                        }
                        aria-pressed={active}
                      >
                        {mod}
                      </Button>
                    );
                  })}
                </div>
              </div>
              <div className="flex gap-2">
                <MovementCombobox
                  value={m.name}
                  onChange={(value) =>
                    onChange(setMovementName(block, mi, value))
                  }
                  ariaLabel={`동작 ${mi + 1}`}
                />
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
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">
                  뒤 modifier
                </Label>
                <div className="flex flex-wrap gap-1">
                  {MOVEMENT_MODIFIERS.map((mod) => {
                    const active = isActive(mod, 'after');
                    return (
                      <Button
                        key={`after-${mod}`}
                        type="button"
                        variant={active ? 'default' : 'outline'}
                        size="sm"
                        className="h-6 px-2 text-[11px]"
                        onClick={() =>
                          onChange(
                            toggleMovementModifier(block, mi, {
                              name: mod,
                              position: 'after',
                            }),
                          )
                        }
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
        })}
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

      <div className="space-y-2">
        {block.setEntries.map((_, ei) => (
          <SetEntryRow
            key={ei}
            block={block}
            entryIndex={ei}
            canRemove={canRemoveSetEntry}
            onChange={onChange}
          />
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => onChange(addSetEntry(block))}
        >
          <Plus className="h-4 w-4 mr-1" />
          세트 추가
        </Button>
      </div>
    </div>
  );
}
