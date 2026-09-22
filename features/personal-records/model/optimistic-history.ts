import type {
  PersonalRecordInfo,
  PRHistoryEntry,
} from "@/types/personalRecords";

/**
 * PR 기록 낙관적 반영의 예측·역연산.
 *
 * 현재 PR 은 서버 `recomputeCache` 와 같은 규칙으로 계산한다: 남은 기록 중 최대
 * `newWeight`, 0건이면 `personal-records` 행이 없다. 예측은 이력 → 현재 PR 방향으로만
 * 흐르고, 현재 PR 을 직접 고치지 않는다.
 */
export type HistoryChange =
  | { type: "add"; entry: PRHistoryEntry }
  | { type: "update"; entry: PRHistoryEntry }
  | { type: "remove"; id: number };

export type CurrentPR = Pick<PersonalRecordInfo, "weight" | "prDate">;

// 서버 getPRHistory 정렬과 같다: prDate 내림차순 → createdAt 내림차순.
function byDateDesc(a: PRHistoryEntry, b: PRHistoryEntry): number {
  if (a.prDate !== b.prDate) return a.prDate < b.prDate ? 1 : -1;
  if (a.createdAt !== b.createdAt) return a.createdAt < b.createdAt ? 1 : -1;
  return 0;
}

export function applyHistoryChange(
  history: readonly PRHistoryEntry[],
  change: HistoryChange
): PRHistoryEntry[] {
  switch (change.type) {
    case "add":
      return [...history, change.entry].sort(byDateDesc);
    case "update":
      return history
        .map((e) => (e.id === change.entry.id ? change.entry : e))
        .sort(byDateDesc);
    case "remove":
      return history.filter((e) => e.id !== change.id);
  }
}

export function deriveCurrentPR(
  history: readonly PRHistoryEntry[]
): CurrentPR | null {
  if (history.length === 0) return null;
  const top = history.reduce((acc, e) => (e.newWeight > acc.newWeight ? e : acc));
  return { weight: top.newWeight, prDate: top.prDate };
}

/**
 * `base` 는 조작 직전의 레코드다. 0건이 돼 행이 빠졌다가 되돌릴 때 사라진
 * `id`·`exerciseName` 을 되살리는 데 쓴다.
 */
export function applyCurrentPR(
  records: readonly PersonalRecordInfo[],
  base: PersonalRecordInfo,
  current: CurrentPR | null
): PersonalRecordInfo[] {
  const others = records.filter((r) => r.exerciseId !== base.exerciseId);
  if (current === null) return others;

  const existing = records.find((r) => r.exerciseId === base.exerciseId);
  const next = { ...(existing ?? base), ...current };
  return existing
    ? records.map((r) => (r === existing ? next : r))
    : [...records, next];
}
