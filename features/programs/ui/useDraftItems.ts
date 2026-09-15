'use client';

import { useCallback, useState } from 'react';
import type { DraftItem } from '@/features/programs/model/text-program';

let keySeq = 0;
function nextKey(): string {
  keySeq += 1;
  return `item-${keySeq}`;
}

export function toDraftItems(lines: string[]): DraftItem[] {
  return lines.map((text) => ({ key: nextKey(), text }));
}

export interface DraftItemsApi {
  items: DraftItem[];
  change: (index: number, text: string) => void;
  remove: (index: number) => void;
  addBelow: (index: number) => void;
  mergeUp: (index: number) => void;
  split: (index: number, at: number) => void;
}

/**
 * 확인 단계와 저장본 수정 화면이 공유하는 항목 편집 상태.
 * 모든 연산이 새 배열을 만든다 — 한 항목의 편집이 다른 항목에 닿지 않는다.
 */
export function useDraftItems(initial: DraftItem[]): DraftItemsApi {
  const [items, setItems] = useState<DraftItem[]>(initial);

  const change = useCallback((index: number, text: string) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, text } : item)),
    );
  }, []);

  const remove = useCallback((index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const addBelow = useCallback((index: number) => {
    setItems((prev) => [
      ...prev.slice(0, index + 1),
      { key: nextKey(), text: '' },
      ...prev.slice(index + 1),
    ]);
  }, []);

  const mergeUp = useCallback((index: number) => {
    setItems((prev) => {
      if (index <= 0 || index >= prev.length) return prev;
      const merged: DraftItem = {
        ...prev[index - 1],
        text: `${prev[index - 1].text} ${prev[index].text}`.trim(),
      };
      return [...prev.slice(0, index - 1), merged, ...prev.slice(index + 1)];
    });
  }, []);

  const split = useCallback((index: number, at: number) => {
    setItems((prev) => {
      const target = prev[index];
      if (!target) return prev;
      const head = target.text.slice(0, at).trim();
      const tail = target.text.slice(at).trim();
      if (head.length === 0 || tail.length === 0) return prev;
      return [
        ...prev.slice(0, index),
        { ...target, text: head },
        { key: nextKey(), text: tail },
        ...prev.slice(index + 1),
      ];
    });
  }, []);

  return { items, change, remove, addBelow, mergeUp, split };
}
