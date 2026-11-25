'use client';

import { useReducer } from 'react';
import {
  createDraftReducer,
  type ProgramDraft,
} from '@/features/programs/model/program-draft';

// 비보안 컨텍스트(LAN 의 http 개발 서버)에서는 randomUUID 가 없다.
export function newDraftKey(): string {
  return globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
}

const reducer = createDraftReducer(newDraftKey);
const EMPTY_DRAFT: ProgramDraft = { blocks: [] };

export function useProgramDraft(initial: ProgramDraft = EMPTY_DRAFT) {
  return useReducer(reducer, initial);
}
