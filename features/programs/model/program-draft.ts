import {
  MAX_PERCENTAGE,
  MAX_REPS,
  MAX_SETS,
} from '@/features/notation/model/schemas';
import type { Movement, Program, SetEntry } from '@/features/notation/model/types';
import type { ProgramInput } from '@/features/programs/model/program-input';

/** 입력칸이 들고 있는 값이라 숫자도 문자열이다. 숫자 변환은 저장 직전 한 번만 한다. */
export interface DraftEntry {
  key: string;
  percentage: string;
  reps: string[];
  sets: string;
}

export interface DraftBlock {
  key: string;
  movements: Movement[];
  entries: DraftEntry[];
}

export interface ProgramDraft {
  blocks: DraftBlock[];
}

export type DraftAction =
  | { type: 'addBlock'; movement: Movement }
  | { type: 'removeBlock'; blockKey: string }
  | { type: 'addMovement'; blockKey: string; movement: Movement }
  | { type: 'replaceMovement'; blockKey: string; index: number; movement: Movement }
  | { type: 'removeMovement'; blockKey: string; index: number }
  | { type: 'addEntry'; blockKey: string }
  | { type: 'removeEntry'; blockKey: string; entryKey: string }
  | {
      type: 'changeEntry';
      blockKey: string;
      entryKey: string;
      field: 'percentage' | 'sets';
      value: string;
    }
  | {
      type: 'changeEntry';
      blockKey: string;
      entryKey: string;
      field: 'reps';
      index: number;
      value: string;
    };

/**
 * 키 생성기를 주입받는다. 블록과 줄의 키는 렌더링 식별자일 뿐이라
 * 테스트에서 결정적인 생성기를 넣을 수 있어야 한다.
 */
export function createDraftReducer(newKey: () => string) {
  const emptyEntry = (repCount: number): DraftEntry => ({
    key: newKey(),
    percentage: '',
    reps: Array.from({ length: repCount }, () => ''),
    sets: '',
  });

  const mapBlock = (
    draft: ProgramDraft,
    blockKey: string,
    update: (block: DraftBlock) => DraftBlock | null,
  ): ProgramDraft => {
    const target = draft.blocks.find((b) => b.key === blockKey);
    if (!target) return draft;
    const next = update(target);
    if (next === target) return draft;
    return {
      blocks: draft.blocks.flatMap((b) => {
        if (b !== target) return [b];
        return next ? [next] : [];
      }),
    };
  };

  return (draft: ProgramDraft, action: DraftAction): ProgramDraft => {
    switch (action.type) {
      case 'addBlock':
        return {
          blocks: [
            ...draft.blocks,
            { key: newKey(), movements: [action.movement], entries: [emptyEntry(1)] },
          ],
        };
      case 'removeBlock':
        return { blocks: draft.blocks.filter((b) => b.key !== action.blockKey) };
      case 'addMovement':
        return mapBlock(draft, action.blockKey, (block) => ({
          ...block,
          movements: [...block.movements, action.movement],
          entries: block.entries.map((e) => ({ ...e, reps: [...e.reps, ''] })),
        }));
      case 'replaceMovement':
        return mapBlock(draft, action.blockKey, (block) =>
          block.movements[action.index] === undefined
            ? block
            : {
                ...block,
                movements: block.movements.map((m, i) =>
                  i === action.index ? action.movement : m,
                ),
              },
        );
      case 'removeMovement':
        return mapBlock(draft, action.blockKey, (block) => {
          if (block.movements[action.index] === undefined) return block;
          if (block.movements.length === 1) return null;
          return {
            ...block,
            movements: block.movements.filter((_, i) => i !== action.index),
            entries: block.entries.map((e) => ({
              ...e,
              reps: e.reps.filter((_, i) => i !== action.index),
            })),
          };
        });
      case 'addEntry':
        return mapBlock(draft, action.blockKey, (block) => {
          const above = block.entries[block.entries.length - 1];
          // 칠판 한 줄은 보통 같은 렙 구성에 퍼센트만 오른다.
          const added: DraftEntry = {
            ...emptyEntry(block.movements.length),
            reps: [...above.reps],
            sets: above.sets,
          };
          return { ...block, entries: [...block.entries, added] };
        });
      case 'removeEntry':
        return mapBlock(draft, action.blockKey, (block) =>
          block.entries.length <= 1 ||
          !block.entries.some((e) => e.key === action.entryKey)
            ? block
            : { ...block, entries: block.entries.filter((e) => e.key !== action.entryKey) },
        );
      case 'changeEntry':
        return mapBlock(draft, action.blockKey, (block) => {
          const entry = block.entries.find((e) => e.key === action.entryKey);
          if (!entry) return block;
          let changed: DraftEntry;
          if (action.field === 'reps') {
            if (entry.reps[action.index] === undefined) return block;
            changed = {
              ...entry,
              reps: entry.reps.map((r, i) => (i === action.index ? action.value : r)),
            };
          } else {
            changed = { ...entry, [action.field]: action.value };
          }
          return {
            ...block,
            entries: block.entries.map((e) => (e === entry ? changed : e)),
          };
        });
    }
  };
}

/** `toProgramInput` 의 역변환. 저장된 Program 으로 폼 초안을 채운다. */
export function draftFromProgram(program: Program, newKey: () => string): ProgramDraft {
  return {
    blocks: program.blocks.map((block) => ({
      key: newKey(),
      movements: block.movements.map((m) => ({ ...m })),
      entries: block.setEntries.map((entry) => ({
        key: newKey(),
        percentage: entry.percentage === null ? '' : String(entry.percentage),
        reps:
          entry.reps.type === 'simple'
            ? [String(entry.reps.reps)]
            : entry.reps.reps.map(String),
        sets: String(entry.sets),
      })),
    })),
  };
}

export type FieldKey = 'percentage' | 'sets' | `reps.${number}`;
export type EntryErrors = Partial<Record<FieldKey, string>>;

export type ProgramInputResult =
  | { ok: true; input: ProgramInput }
  | { ok: false; message: string | null; errors: Record<string, EntryErrors> };

export const repsFieldKey = (index: number): FieldKey => `reps.${index}`;

const INTEGER = /^\d+$/;
const DECIMAL = /^\d+(\.\d+)?$/;

function parseCount(raw: string, max: number, emptyMessage: string): number | string {
  const text = raw.trim();
  if (text === '') return emptyMessage;
  if (!INTEGER.test(text)) return '정수로 입력하세요.';
  const value = Number(text);
  if (value < 1 || value > max) return `1~${max} 사이로 입력하세요.`;
  return value;
}

function parsePercentage(raw: string): number | null | string {
  const text = raw.trim().replace(',', '.');
  if (text === '') return null;
  if (!DECIMAL.test(text)) return '숫자로 입력하세요.';
  const value = Number(text);
  if (value <= 0 || value > MAX_PERCENTAGE) return `0 초과 ${MAX_PERCENTAGE} 이하로 입력하세요.`;
  return value;
}

/** 퍼센트가 비어 있으면 null 이다. 보조 운동은 % 없이 적는다. */
export function toProgramInput(draft: ProgramDraft): ProgramInputResult {
  if (draft.blocks.length === 0) {
    return { ok: false, message: '종목을 하나 이상 추가하세요.', errors: {} };
  }

  const errors: Record<string, EntryErrors> = {};
  const blocks: ProgramInput['blocks'] = [];

  for (const block of draft.blocks) {
    const setEntries: SetEntry[] = [];
    for (const entry of block.entries) {
      const fieldErrors: EntryErrors = {};
      const percentage = parsePercentage(entry.percentage);
      const sets = parseCount(entry.sets, MAX_SETS, '세트를 입력하세요.');
      const reps = entry.reps.map((r) => parseCount(r, MAX_REPS, '렙을 입력하세요.'));

      if (typeof percentage === 'string') fieldErrors.percentage = percentage;
      if (typeof sets === 'string') fieldErrors.sets = sets;
      reps.forEach((r, i) => {
        if (typeof r === 'string') fieldErrors[repsFieldKey(i)] = r;
      });

      if (Object.keys(fieldErrors).length > 0) {
        errors[entry.key] = fieldErrors;
        continue;
      }
      const repNumbers = reps as number[];
      setEntries.push({
        percentage: percentage as number | null,
        reps:
          repNumbers.length === 1
            ? { type: 'simple', reps: repNumbers[0] }
            : { type: 'complex', reps: repNumbers },
        sets: sets as number,
      });
    }
    blocks.push({ exerciseIds: block.movements.map((m) => m.exerciseId), setEntries });
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, message: null, errors };
  }
  return { ok: true, input: { title: null, blocks } };
}
