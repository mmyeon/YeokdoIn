import { buildPersonalRecordRows } from "../build-record-rows";

const CATALOG = [
  { id: 10, name: "Snatch" },
  { id: 1, name: "Power Snatch" },
  { id: 11, name: "Clean" },
  { id: 15, name: "Back Squat" },
  { id: 16, name: "Deadlift" },
];

type Rec = { exerciseId: number; weight: number };

const REGISTERED: Rec[] = [
  { exerciseId: 15, weight: 140 },
  { exerciseId: 10, weight: 80 },
];

function names(rows: ReturnType<typeof buildPersonalRecordRows<Rec>>) {
  return rows.map((r) => r.name);
}

describe("buildPersonalRecordRows", () => {
  it("카탈로그의 모든 종목이 한 번씩 나온다", () => {
    const rows = buildPersonalRecordRows(CATALOG, REGISTERED);

    expect(rows).toHaveLength(CATALOG.length);
    expect(new Set(rows.map((r) => r.id)).size).toBe(CATALOG.length);
  });

  it("등록된 종목에는 기록을, 미등록 종목에는 null을 붙인다", () => {
    const rows = buildPersonalRecordRows(CATALOG, REGISTERED);
    const byId = new Map(rows.map((r) => [r.id, r]));

    expect(byId.get(15)?.record).toEqual({ exerciseId: 15, weight: 140 });
    expect(byId.get(10)?.record).toEqual({ exerciseId: 10, weight: 80 });
    expect(byId.get(11)?.record).toBeNull();
    expect(byId.get(16)?.record).toBeNull();
  });

  it("등록된 종목이 미등록보다 먼저 온다", () => {
    const rows = buildPersonalRecordRows(CATALOG, REGISTERED);
    const lastRegistered = rows.findLastIndex((r) => r.record !== null);
    const firstUnregistered = rows.findIndex((r) => r.record === null);

    expect(lastRegistered).toBeLessThan(firstUnregistered);
  });

  it("등록된 종목의 순서는 records 인자 순서를 따른다 (서버가 정렬해 준다)", () => {
    const rows = buildPersonalRecordRows(CATALOG, REGISTERED);

    expect(names(rows).slice(0, 2)).toEqual(["Back Squat", "Snatch"]);
  });

  it("미등록 종목의 순서는 카탈로그 순서를 따른다", () => {
    const rows = buildPersonalRecordRows(CATALOG, REGISTERED);

    expect(names(rows).slice(2)).toEqual(["Power Snatch", "Clean", "Deadlift"]);
  });

  it("기록이 하나도 없으면 전부 미등록으로 나온다", () => {
    const rows = buildPersonalRecordRows(CATALOG, []);

    expect(rows.every((r) => r.record === null)).toBe(true);
    expect(names(rows)).toEqual(CATALOG.map((e) => e.name));
  });

  it("카탈로그가 비면 빈 배열을 반환한다", () => {
    expect(buildPersonalRecordRows([], REGISTERED)).toEqual([]);
  });

  it("카탈로그에 없는 종목의 기록은 무시한다", () => {
    // 종목이 삭제됐는데 기록이 남은 경우. 화면이 깨지면 안 된다.
    const rows = buildPersonalRecordRows(CATALOG, [
      { exerciseId: 999, weight: 60 },
    ]);

    expect(rows).toHaveLength(CATALOG.length);
    expect(rows.every((r) => r.record === null)).toBe(true);
  });
});
