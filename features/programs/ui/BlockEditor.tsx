'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input/input';
import { X } from 'lucide-react';
import type { Block, Movement, RepScheme } from '@/features/notation/model/types';
import {
  addMovement,
  addSetEntry,
  removeMovementAt,
  removeSetEntryAt,
  setEntryPercentage,
  setEntryReps,
  setEntryRepsAt,
  setEntrySets,
  setMovementName,
  toggleMovementModifier,
} from '@/features/programs/model/update';
import { MOVEMENT_MODIFIERS } from '@/features/programs/model/movements';
import { cn } from '@/lib/utils';
import { StepLabel } from './StepLabel';
import { ChipGroup } from './ChipGroup';
import { PctChip } from './PctChip';
import { BigStepper } from './BigStepper';
import { MovementPickerSheet } from './MovementPickerSheet';

const MAX_MOVEMENTS_PER_BLOCK = 2;
const REPS_MIN = 1;
const REPS_MAX = 12;
const SETS_MIN = 1;
const SETS_MAX = 20;

function movementLabel(m: Movement): string {
  const before = m.modifiers
    .filter((x) => x.position === 'before')
    .map((x) => x.name);
  const after = m.modifiers
    .filter((x) => x.position === 'after')
    .map((x) => x.name);
  return [...before, m.name, ...after].filter(Boolean).join(' ');
}

function modifiersFor(m: Movement, position: 'before' | 'after'): string[] {
  return m.modifiers.filter((x) => x.position === position).map((x) => x.name);
}

function simpleReps(r: RepScheme): number {
  return r.type === 'simple' ? r.reps : r.reps[0];
}

function gridTemplate(movementCount: number): string {
  const repsCols = Math.max(movementCount, 1);
  return `88px repeat(${repsCols}, 1fr) 1fr 28px`;
}

function repsForMovement(r: RepScheme, movementIndex: number): number {
  if (r.type === 'simple') return r.reps;
  return r.reps[movementIndex] ?? r.reps[r.reps.length - 1] ?? 1;
}

interface BlockEditorProps {
  block: Block;
  index: number;
  totalBlocks: number;
  onChange: (next: Block) => void;
  onRemove: () => void;
}

export function BlockEditor({
  block,
  index,
  totalBlocks,
  onChange,
  onRemove,
}: BlockEditorProps) {
  const primary = block.movements[0];
  const compound = block.movements[1];
  const hasPrimary = !!primary?.name;

  const [picker, setPicker] = useState<null | { side: 'primary' | 'compound' }>(
    null,
  );
  const totalMods = primary
    ? primary.modifiers.length + (compound?.modifiers.length ?? 0)
    : 0;
  const [modsOpen, setModsOpen] = useState(totalMods > 0);

  useEffect(() => {
    if (totalMods > 0) setModsOpen(true);
  }, [totalMods]);

  const canRemove = totalBlocks > 1;
  const canRemoveSet = block.setEntries.length > 1;

  return (
    <div className="overflow-hidden rounded-2xl border border-yd-line bg-yd-surface">
      <div className="flex items-center justify-between border-b border-yd-line bg-yd-elevated px-3.5 py-2.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-[7px] bg-yd-primary font-mono text-[12px] font-extrabold text-yd-on-primary">
            {index + 1}
          </div>
          <span className="text-[12px] font-semibold uppercase tracking-[1px] text-yd-text-muted">
            블록 {index + 1}
            {totalBlocks > 1 ? ` / ${totalBlocks}` : ''}
          </span>
        </div>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            aria-label={`블록 ${index + 1} 삭제`}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-yd-text-dim hover:text-yd-text"
          >
            ×
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3.5 p-3.5">
        <div>
          <StepLabel n="①" label="동작" />
          <button
            type="button"
            onClick={() => setPicker({ side: 'primary' })}
            className={cn(
              'mt-2 flex w-full items-center gap-2.5 rounded-xl border-[1.5px] px-3.5 py-3.5',
              hasPrimary
                ? 'border-yd-primary bg-yd-primary-subtle'
                : 'border-yd-line bg-yd-bg',
            )}
          >
            <div className="min-w-0 flex-1 text-left">
              {hasPrimary ? (
                <span className="block truncate text-[16px] font-bold text-yd-primary">
                  {movementLabel(primary)}
                </span>
              ) : (
                <span className="text-[14px] text-yd-text-muted">
                  동작을 선택하세요
                </span>
              )}
            </div>
            <span
              className={cn(
                'text-[16px]',
                hasPrimary ? 'text-yd-primary' : 'text-yd-text-dim',
              )}
            >
              ›
            </span>
          </button>

          {hasPrimary && (
            <div className="mt-2">
              <button
                type="button"
                onClick={() => setModsOpen((v) => !v)}
                className="inline-flex items-center gap-1.5 rounded-full border border-yd-line bg-transparent px-2.5 py-1.5"
              >
                <span className="text-[11px] font-semibold text-yd-text-muted">
                  {modsOpen ? '−' : '+'}
                </span>
                <span className="text-[11px] font-medium text-yd-text-muted">
                  수식어
                  {totalMods > 0 && (
                    <span className="ml-1 font-bold text-yd-primary">
                      {totalMods}
                    </span>
                  )}
                </span>
              </button>

              {modsOpen && (
                <div className="mt-2 flex flex-col gap-2.5 rounded-[10px] border border-yd-line bg-yd-bg p-2.5">
                  <ChipGroup
                    label="앞에 붙이기"
                    options={MOVEMENT_MODIFIERS}
                    selected={modifiersFor(primary, 'before')}
                    onToggle={(mod) =>
                      onChange(
                        toggleMovementModifier(block, 0, {
                          name: mod,
                          position: 'before',
                        }),
                      )
                    }
                  />
                  <ChipGroup
                    label="뒤에 붙이기"
                    options={MOVEMENT_MODIFIERS}
                    selected={modifiersFor(primary, 'after')}
                    onToggle={(mod) =>
                      onChange(
                        toggleMovementModifier(block, 0, {
                          name: mod,
                          position: 'after',
                        }),
                      )
                    }
                  />
                </div>
              )}
            </div>
          )}

          {hasPrimary && !compound && block.movements.length < MAX_MOVEMENTS_PER_BLOCK && (
            <button
              type="button"
              onClick={() => {
                onChange(addMovement(block, { name: '', modifiers: [] }));
                setPicker({ side: 'compound' });
              }}
              className="mt-2 flex h-9 w-full items-center justify-center rounded-lg border border-dashed border-yd-line"
            >
              <span className="text-[12px] text-yd-text-muted">
                + 복합 동작 추가
              </span>
            </button>
          )}

          {hasPrimary && compound && (
            <div className="mt-2 border-l-2 border-yd-primary pl-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-[1px] text-yd-text-muted">
                  + 복합
                </span>
                <button
                  type="button"
                  onClick={() => onChange(removeMovementAt(block, 1))}
                  className="text-[11px] text-yd-text-dim"
                >
                  × 제거
                </button>
              </div>
              <button
                type="button"
                onClick={() => setPicker({ side: 'compound' })}
                className={cn(
                  'mt-1.5 flex w-full items-center gap-2 rounded-[10px] border px-3 py-2.5',
                  compound.name
                    ? 'border-yd-primary bg-yd-primary-subtle'
                    : 'border-yd-line bg-yd-bg',
                )}
              >
                <span
                  className={cn(
                    'flex-1 truncate text-left text-[13px] font-semibold',
                    compound.name ? 'text-yd-primary' : 'text-yd-text-muted',
                  )}
                >
                  {movementLabel(compound) || '동작 선택'}
                </span>
                <span className="text-[14px] text-yd-text-dim">›</span>
              </button>
            </div>
          )}
        </div>

        {hasPrimary && (
          <div>
            <StepLabel n="②" label="부하 · 세트" />
            <div className="mt-2 flex flex-col gap-2">
              <div
                className="grid gap-2.5 px-1"
                style={{ gridTemplateColumns: gridTemplate(block.movements.length) }}
              >
                <span className="text-[10px] uppercase tracking-[0.8px] text-yd-text-muted">
                  % (선택)
                </span>
                {block.movements.length <= 1 ? (
                  <span className="text-center text-[10px] uppercase tracking-[0.8px] text-yd-text-muted">
                    Reps
                  </span>
                ) : (
                  block.movements.map((m, mi) => (
                    <span
                      key={mi}
                      className="truncate text-center text-[10px] uppercase tracking-[0.8px] text-yd-text-muted"
                      title={movementLabel(m)}
                    >
                      {movementLabel(m) || `운동 ${mi + 1}`}
                    </span>
                  ))
                )}
                <span className="text-center text-[10px] uppercase tracking-[0.8px] text-yd-text-muted">
                  Sets
                </span>
                <span />
              </div>
              {block.setEntries.map((entry, ei) => (
                <SetEntryRow
                  key={ei}
                  block={block}
                  entryIndex={ei}
                  canRemove={canRemoveSet}
                  onChange={onChange}
                />
              ))}
              <button
                type="button"
                onClick={() => onChange(addSetEntry(block))}
                className="flex h-9 items-center justify-center rounded-lg border border-dashed border-yd-line"
              >
                <span className="text-[12px] text-yd-text-muted">
                  + 세트 스킴 추가
                </span>
              </button>
            </div>
          </div>
        )}
      </div>

      <MovementPickerSheet
        open={picker !== null}
        onClose={() => {
          if (picker?.side === 'compound' && compound && !compound.name) {
            onChange(removeMovementAt(block, 1));
          }
          setPicker(null);
        }}
        onPick={(name) => {
          if (!picker) return;
          const mi = picker.side === 'primary' ? 0 : 1;
          onChange(setMovementName(block, mi, name));
          setPicker(null);
        }}
      />
    </div>
  );
}

function SetEntryRow({
  block,
  entryIndex,
  canRemove,
  onChange,
}: {
  block: Block;
  entryIndex: number;
  canRemove: boolean;
  onChange: (next: Block) => void;
}) {
  const entry = block.setEntries[entryIndex];
  const movementCount = block.movements.length;
  const isMulti = movementCount > 1;
  const [repsDraft, setRepsDraft] = useState(() =>
    entry.reps.type === 'simple' ? String(entry.reps.reps) : entry.reps.reps.join('+'),
  );
  const isComplex = entry.reps.type === 'complex';

  useEffect(() => {
    const canonical =
      entry.reps.type === 'simple'
        ? String(entry.reps.reps)
        : entry.reps.reps.join('+');
    setRepsDraft(canonical);
  }, [entry.reps]);

  return (
    <div
      className="grid items-center gap-2.5"
      style={{ gridTemplateColumns: gridTemplate(movementCount) }}
    >
      <PctChip
        value={entry.percentage}
        onChange={(v) => onChange(setEntryPercentage(block, entryIndex, v))}
        ariaLabel={`세트 ${entryIndex + 1} %`}
      />
      {isMulti ? (
        block.movements.map((_, mi) => (
          <BigStepper
            key={mi}
            value={repsForMovement(entry.reps, mi)}
            onChange={(n) =>
              onChange(setEntryRepsAt(block, entryIndex, mi, n))
            }
            min={REPS_MIN}
            max={REPS_MAX}
            ariaLabel={`세트 ${entryIndex + 1} 운동 ${mi + 1} reps`}
          />
        ))
      ) : isComplex ? (
        <Input
          value={repsDraft}
          onChange={(e) => {
            const next = e.target.value;
            setRepsDraft(next);
            const parts = next.split('+').map((s) => Number(s.trim()));
            if (parts.every((n) => Number.isInteger(n) && n > 0)) {
              onChange(
                setEntryReps(block, entryIndex, { type: 'complex', reps: parts }),
              );
            }
          }}
          className="h-11 rounded-[10px] border-yd-line bg-yd-bg text-center font-mono text-[17px] font-bold"
          aria-label={`세트 ${entryIndex + 1} reps`}
        />
      ) : (
        <BigStepper
          value={simpleReps(entry.reps)}
          onChange={(n) =>
            onChange(setEntryReps(block, entryIndex, { type: 'simple', reps: n }))
          }
          min={REPS_MIN}
          max={REPS_MAX}
          ariaLabel={`세트 ${entryIndex + 1} reps`}
        />
      )}
      <BigStepper
        value={entry.sets}
        onChange={(n) => onChange(setEntrySets(block, entryIndex, n))}
        min={SETS_MIN}
        max={SETS_MAX}
        ariaLabel={`세트 ${entryIndex + 1} sets`}
      />
      <button
        type="button"
        onClick={() => onChange(removeSetEntryAt(block, entryIndex))}
        disabled={!canRemove}
        aria-label={`세트 ${entryIndex + 1} 삭제`}
        className="flex h-7 w-7 items-center justify-center rounded-md text-yd-text-dim disabled:opacity-0"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
