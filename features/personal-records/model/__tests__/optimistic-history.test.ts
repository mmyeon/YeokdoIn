import {
  applyCurrentPR,
  applyHistoryChange,
  deriveCurrentPR,
} from "../optimistic-history";
import type {
  PersonalRecordInfo,
  PRHistoryEntry,
} from "@/types/personalRecords";

function entry(
  id: number,
  newWeight: number,
  prDate: string,
  createdAt = `${prDate}T00:00:00.000Z`
): PRHistoryEntry {
  return {
    id,
    exerciseId: 10,
    previousWeight: null,
    newWeight,
    prDate,
    note: null,
    source: "manual",
    createdAt,
  };
}

// 서버 getPRHistory 순서: prDate 내림차순 → createdAt 내림차순
const HISTORY: PRHistoryEntry[] = [
  entry(3, 90, "2026-09-10"),
  entry(2, 100, "2026-08-01"),
  entry(1, 80, "2026-07-01"),
];

const SNATCH: PersonalRecordInfo = {
  id: 7,
  exerciseId: 10,
  weight: 100,
  prDate: "2026-08-01",
  updatedAt: "2026-08-01T00:00:00.000Z",
  exerciseName: "Snatch",
};

const CLEAN: PersonalRecordInfo = {
  id: 8,
  exerciseId: 11,
  weight: 120,
  prDate: "2026-06-01",
  updatedAt: "2026-06-01T00:00:00.000Z",
  exerciseName: "Clean",
};

const ids = (history: PRHistoryEntry[]) => history.map((e) => e.id);

describe("applyHistoryChange", () => {
  it("과거 날짜 add 는 맨 위가 아니라 날짜 순 자리에 들어간다", () => {
    const next = applyHistoryChange(HISTORY, {
      type: "add",
      entry: entry(-1, 85, "2026-08-15"),
    });

    expect(ids(next)).toEqual([3, -1, 2, 1]);
  });

  it("같은 날짜면 createdAt 내림차순이다", () => {
    const next = applyHistoryChange(HISTORY, {
      type: "add",
      entry: entry(-1, 85, "2026-08-01", "2026-09-22T10:00:00.000Z"),
    });

    expect(ids(next)).toEqual([3, -1, 2, 1]);
  });

  it("update 로 날짜를 바꾸면 자리를 옮긴다", () => {
    const next = applyHistoryChange(HISTORY, {
      type: "update",
      entry: { ...HISTORY[2], prDate: "2026-09-15" },
    });

    expect(ids(next)).toEqual([1, 3, 2]);
    expect(next[0].prDate).toBe("2026-09-15");
  });

  it("remove 는 그 id 행만 뺀다", () => {
    expect(ids(applyHistoryChange(HISTORY, { type: "remove", id: 2 }))).toEqual(
      [3, 1]
    );
  });

  it("입력 배열을 바꾸지 않는다", () => {
    const frozen = Object.freeze([...HISTORY]);

    applyHistoryChange(frozen, { type: "add", entry: entry(-1, 85, "2026-09-20") });
    applyHistoryChange(frozen, { type: "remove", id: 3 });

    expect(ids([...frozen])).toEqual([3, 2, 1]);
  });
});

describe("deriveCurrentPR", () => {
  it("최대 무게 기록의 무게와 날짜를 준다", () => {
    expect(deriveCurrentPR(HISTORY)).toEqual({
      weight: 100,
      prDate: "2026-08-01",
    });
  });

  it("최대 무게 행을 지우면 다음 최대가 된다", () => {
    const next = applyHistoryChange(HISTORY, { type: "remove", id: 2 });

    expect(deriveCurrentPR(next)).toEqual({ weight: 90, prDate: "2026-09-10" });
  });

  it("동점이면 무게는 같다", () => {
    const tied = [entry(5, 100, "2026-09-01"), ...HISTORY];

    expect(deriveCurrentPR(tied)?.weight).toBe(100);
  });

  it("기록이 0건이면 null 이다", () => {
    expect(deriveCurrentPR([])).toBeNull();
  });
});

describe("applyCurrentPR", () => {
  const records = [SNATCH, CLEAN];

  it("현재 PR 무게와 날짜를 base 종목 행에 덮어쓴다", () => {
    const next = applyCurrentPR(records, SNATCH, {
      weight: 90,
      prDate: "2026-09-10",
    });

    expect(next).toEqual([
      { ...SNATCH, weight: 90, prDate: "2026-09-10" },
      CLEAN,
    ]);
  });

  it("null 이면 base 종목 행을 뺀다", () => {
    expect(applyCurrentPR(records, SNATCH, null)).toEqual([CLEAN]);
  });

  it("빠진 상태에 base 로 되살리면 id·exerciseName 이 돌아온다", () => {
    const removed = applyCurrentPR(records, SNATCH, null);
    const restored = applyCurrentPR(removed, SNATCH, {
      weight: 100,
      prDate: "2026-08-01",
    });

    expect(restored).toContainEqual(SNATCH);
    expect(restored).toContainEqual(CLEAN);
  });

  it("입력 배열을 바꾸지 않는다", () => {
    const frozen = Object.freeze([...records]);

    applyCurrentPR(frozen, SNATCH, { weight: 1, prDate: "2026-01-01" });

    expect([...frozen]).toEqual([SNATCH, CLEAN]);
  });
});

describe("역연산 왕복", () => {
  it("add → remove 는 원래 배열로 돌아온다", () => {
    const added = applyHistoryChange(HISTORY, {
      type: "add",
      entry: entry(-1, 85, "2026-08-15"),
    });

    expect(applyHistoryChange(added, { type: "remove", id: -1 })).toEqual(
      HISTORY
    );
  });

  it("remove → add 는 원래 배열로 돌아온다", () => {
    const removed = applyHistoryChange(HISTORY, { type: "remove", id: 2 });

    expect(
      applyHistoryChange(removed, { type: "add", entry: HISTORY[1] })
    ).toEqual(HISTORY);
  });

  it("update → update(before) 는 원래 배열로 돌아온다", () => {
    const before = HISTORY[2];
    const updated = applyHistoryChange(HISTORY, {
      type: "update",
      entry: { ...before, newWeight: 120, prDate: "2026-09-20" },
    });

    expect(
      applyHistoryChange(updated, { type: "update", entry: before })
    ).toEqual(HISTORY);
  });
});
