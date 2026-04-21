/**
 * @jest-environment node
 */

const USER_ID = "user-1";

type Row = Record<string, unknown>;

type TableState = {
  rows: Row[];
};

type Store = Record<string, TableState>;

function createStore(initial: Store = {}): Store {
  return {
    "personal-records": { rows: [] },
    pr_history: { rows: [] },
    ...initial,
  };
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

/**
 * Minimal chainable Supabase mock. Matches the surface used by
 * `actions/personalRecords.ts`: `.from(t).select/insert/update/upsert/delete` +
 * `.eq().order().maybeSingle()` + promise resolution with `{ data, error }`.
 */
function createSupabaseMock(store: Store) {
  function tableState(name: string): TableState {
    if (!store[name]) store[name] = { rows: [] };
    return store[name];
  }

  function buildQuery(table: string) {
    let operation: "select" | "insert" | "update" | "upsert" | "delete" =
      "select";
    const filters: Array<(row: Row) => boolean> = [];
    let payload: Row | Row[] | null = null;
    let updatePayload: Row | null = null;
    let orderColumn: string | null = null;
    let orderAsc = true;

    const api: Record<string, (...args: unknown[]) => unknown> = {};

    function applyFilters(rows: Row[]) {
      return rows.filter((r) => filters.every((f) => f(r)));
    }

    function resolve(): { data: unknown; error: null } {
      const state = tableState(table);
      if (operation === "select") {
        let rows = applyFilters(state.rows);
        if (orderColumn) {
          rows = [...rows].sort((a, b) => {
            const av = a[orderColumn!] as number | string | null;
            const bv = b[orderColumn!] as number | string | null;
            if (av === bv) return 0;
            if (av === null || av === undefined) return 1;
            if (bv === null || bv === undefined) return -1;
            if (av < bv) return orderAsc ? -1 : 1;
            return orderAsc ? 1 : -1;
          });
        }
        return { data: clone(rows), error: null };
      }

      if (operation === "insert") {
        const items = Array.isArray(payload) ? payload : [payload!];
        const inserted: Row[] = [];
        for (const item of items) {
          const row = {
            id: state.rows.length + 1,
            created_at: new Date().toISOString(),
            ...item,
          };
          state.rows.push(row);
          inserted.push(row);
        }
        return { data: clone(inserted), error: null };
      }

      if (operation === "upsert") {
        const items = Array.isArray(payload) ? payload : [payload!];
        const inserted: Row[] = [];
        for (const item of items) {
          const existing = state.rows.find(
            (r) =>
              r.user_id === item.user_id && r.exercise_id === item.exercise_id
          );
          if (existing) {
            Object.assign(existing, item);
            inserted.push(existing);
          } else {
            const row = {
              id: state.rows.length + 1,
              created_at: new Date().toISOString(),
              ...item,
            };
            state.rows.push(row);
            inserted.push(row);
          }
        }
        return { data: clone(inserted), error: null };
      }

      if (operation === "update") {
        const matched = applyFilters(state.rows);
        for (const row of matched) Object.assign(row, updatePayload);
        return { data: clone(matched), error: null };
      }

      if (operation === "delete") {
        const matched = applyFilters(state.rows);
        state.rows = state.rows.filter((r) => !matched.includes(r));
        return { data: clone(matched), error: null };
      }
      return { data: null, error: null };
    }

    api.select = () => api;
    api.insert = (rows: unknown) => {
      operation = "insert";
      payload = rows as Row | Row[];
      return api;
    };
    api.upsert = (rows: unknown) => {
      operation = "upsert";
      payload = rows as Row | Row[];
      return api;
    };
    api.update = (row: unknown) => {
      operation = "update";
      updatePayload = row as Row;
      return api;
    };
    api.delete = () => {
      operation = "delete";
      return api;
    };
    api.eq = (col: unknown, value: unknown) => {
      filters.push((r) => r[col as string] === value);
      return api;
    };
    api.order = (col: unknown, opts: unknown) => {
      orderColumn = col as string;
      orderAsc = !(opts && (opts as { ascending?: boolean }).ascending === false);
      return api;
    };
    api.maybeSingle = () => {
      const res = resolve();
      const rows = (res.data as Row[]) ?? [];
      return Promise.resolve({ data: rows[0] ?? null, error: null });
    };
    api.single = () => {
      const res = resolve();
      const rows = (res.data as Row[]) ?? [];
      return Promise.resolve({ data: rows[0] ?? null, error: null });
    };
    // thenable to act like a promise for terminal ops
    (api as unknown as { then: unknown }).then = (onResolve: (v: unknown) => unknown) => {
      return Promise.resolve(resolve()).then(onResolve);
    };
    return api;
  }

  return {
    from: (name: string) => buildQuery(name),
    auth: {
      getUser: async () => ({ data: { user: { id: USER_ID } }, error: null }),
    },
  };
}

// Hoisted mock storage so jest.mock factory can see it.
const mockState: { store: Store } = { store: createStore() };

jest.mock("@/features/auth/supabase/ServerClient", () => ({
  supabaseServerClient: jest.fn(async () => createSupabaseMock(mockState.store)),
}));

import {
  addPRHistoryEntry,
  updatePRHistoryEntry,
  deletePRHistoryEntry,
  getPRHistory,
  addRecord,
  updateRecordWeight,
  deleteRecord,
} from "@/actions/personalRecords";

beforeEach(() => {
  mockState.store = createStore();
});

describe("addPRHistoryEntry", () => {
  it("새 PR이면 personal-records에 INSERT하고 pr_history에 previous_weight=NULL로 INSERT한다", async () => {
    await addPRHistoryEntry({
      exerciseId: 10,
      newWeight: 50,
      prDate: "2026-04-20",
      note: "처음 기록",
    });

    const pr = mockState.store["personal-records"].rows;
    const hist = mockState.store["pr_history"].rows;

    expect(pr).toHaveLength(1);
    expect(pr[0]).toMatchObject({
      user_id: USER_ID,
      exercise_id: 10,
      weight: 50,
    });

    expect(hist).toHaveLength(1);
    expect(hist[0]).toMatchObject({
      user_id: USER_ID,
      exercise_id: 10,
      previous_weight: null,
      new_weight: 50,
      pr_date: "2026-04-20",
      note: "처음 기록",
      source: "manual",
    });
  });

  it("기존 PR이 있으면 previous_weight를 채우고 personal-records를 UPDATE한다", async () => {
    mockState.store["personal-records"].rows.push({
      id: 1,
      user_id: USER_ID,
      exercise_id: 10,
      weight: 48,
      pr_date: "2026-04-10",
    });

    await addPRHistoryEntry({
      exerciseId: 10,
      newWeight: 52,
      prDate: "2026-04-20",
      note: null,
    });

    const pr = mockState.store["personal-records"].rows;
    const hist = mockState.store["pr_history"].rows;

    expect(pr).toHaveLength(1);
    expect(pr[0].weight).toBe(52);

    expect(hist).toHaveLength(1);
    expect(hist[0]).toMatchObject({
      previous_weight: 48,
      new_weight: 52,
      source: "manual",
    });
  });
});

describe("updatePRHistoryEntry", () => {
  it("현재 PR 행의 무게를 수정하면 personal-records 캐시가 갱신된다", async () => {
    mockState.store["personal-records"].rows.push({
      id: 1,
      user_id: USER_ID,
      exercise_id: 10,
      weight: 52,
      pr_date: "2026-04-20",
    });
    mockState.store["pr_history"].rows.push(
      {
        id: 100,
        user_id: USER_ID,
        exercise_id: 10,
        previous_weight: null,
        new_weight: 48,
        pr_date: "2026-04-10",
        note: null,
        source: "manual",
      },
      {
        id: 101,
        user_id: USER_ID,
        exercise_id: 10,
        previous_weight: 48,
        new_weight: 52,
        pr_date: "2026-04-20",
        note: null,
        source: "manual",
      }
    );

    await updatePRHistoryEntry(101, { newWeight: 55 });

    const pr = mockState.store["personal-records"].rows;
    const hist = mockState.store["pr_history"].rows.find((r) => r.id === 101);

    expect(hist).toMatchObject({ new_weight: 55 });
    expect(pr[0].weight).toBe(55);
  });

  it("과거 기록의 note만 수정하면 personal-records는 변하지 않는다", async () => {
    mockState.store["personal-records"].rows.push({
      id: 1,
      user_id: USER_ID,
      exercise_id: 10,
      weight: 52,
      pr_date: "2026-04-20",
    });
    mockState.store["pr_history"].rows.push(
      {
        id: 100,
        user_id: USER_ID,
        exercise_id: 10,
        previous_weight: null,
        new_weight: 48,
        pr_date: "2026-04-10",
        note: null,
        source: "manual",
      },
      {
        id: 101,
        user_id: USER_ID,
        exercise_id: 10,
        previous_weight: 48,
        new_weight: 52,
        pr_date: "2026-04-20",
        note: null,
        source: "manual",
      }
    );

    await updatePRHistoryEntry(100, { note: "폼 좋았음" });

    const pr = mockState.store["personal-records"].rows;
    const hist = mockState.store["pr_history"].rows.find((r) => r.id === 100);

    expect(hist).toMatchObject({ note: "폼 좋았음" });
    expect(pr[0].weight).toBe(52);
  });
});

describe("deletePRHistoryEntry", () => {
  it("현재 PR을 삭제하면 남은 history의 MAX로 캐시를 재계산한다", async () => {
    mockState.store["personal-records"].rows.push({
      id: 1,
      user_id: USER_ID,
      exercise_id: 10,
      weight: 52,
      pr_date: "2026-04-20",
    });
    mockState.store["pr_history"].rows.push(
      {
        id: 100,
        user_id: USER_ID,
        exercise_id: 10,
        previous_weight: null,
        new_weight: 48,
        pr_date: "2026-04-10",
        note: null,
        source: "manual",
      },
      {
        id: 101,
        user_id: USER_ID,
        exercise_id: 10,
        previous_weight: 48,
        new_weight: 52,
        pr_date: "2026-04-20",
        note: null,
        source: "manual",
      }
    );

    await deletePRHistoryEntry(101);

    const pr = mockState.store["personal-records"].rows;
    const hist = mockState.store["pr_history"].rows;

    expect(hist).toHaveLength(1);
    expect(hist[0].id).toBe(100);
    expect(pr).toHaveLength(1);
    expect(pr[0].weight).toBe(48);
  });

  it("history가 모두 사라지면 personal-records 행도 삭제된다", async () => {
    mockState.store["personal-records"].rows.push({
      id: 1,
      user_id: USER_ID,
      exercise_id: 10,
      weight: 48,
      pr_date: "2026-04-10",
    });
    mockState.store["pr_history"].rows.push({
      id: 100,
      user_id: USER_ID,
      exercise_id: 10,
      previous_weight: null,
      new_weight: 48,
      pr_date: "2026-04-10",
      note: null,
      source: "manual",
    });

    await deletePRHistoryEntry(100);

    expect(mockState.store["pr_history"].rows).toHaveLength(0);
    expect(mockState.store["personal-records"].rows).toHaveLength(0);
  });

  it("현재 PR이 아닌 과거 행을 삭제하면 캐시는 변하지 않는다", async () => {
    mockState.store["personal-records"].rows.push({
      id: 1,
      user_id: USER_ID,
      exercise_id: 10,
      weight: 52,
      pr_date: "2026-04-20",
    });
    mockState.store["pr_history"].rows.push(
      {
        id: 100,
        user_id: USER_ID,
        exercise_id: 10,
        previous_weight: null,
        new_weight: 48,
        pr_date: "2026-04-10",
        note: null,
        source: "manual",
      },
      {
        id: 101,
        user_id: USER_ID,
        exercise_id: 10,
        previous_weight: 48,
        new_weight: 52,
        pr_date: "2026-04-20",
        note: null,
        source: "manual",
      }
    );

    await deletePRHistoryEntry(100);

    expect(mockState.store["pr_history"].rows).toHaveLength(1);
    expect(mockState.store["personal-records"].rows[0].weight).toBe(52);
  });
});

describe("addRecord (legacy)", () => {
  it("addPRHistoryEntry 경로로 위임되어 두 테이블에 모두 기록된다", async () => {
    await addRecord({ exerciseId: 10, weight: 50 });

    expect(mockState.store["personal-records"].rows).toHaveLength(1);
    expect(mockState.store["pr_history"].rows).toHaveLength(1);
    expect(mockState.store["pr_history"].rows[0]).toMatchObject({
      previous_weight: null,
      new_weight: 50,
      source: "manual",
    });
  });
});

describe("updateRecordWeight (legacy)", () => {
  it("캐시 무게를 업데이트하고 pr_history에도 dual-write한다", async () => {
    mockState.store["personal-records"].rows.push({
      id: 1,
      user_id: USER_ID,
      exercise_id: 10,
      weight: 48,
      pr_date: "2026-04-10",
    });

    await updateRecordWeight(1, 55);

    expect(mockState.store["personal-records"].rows[0].weight).toBe(55);
    expect(mockState.store["pr_history"].rows).toHaveLength(1);
    expect(mockState.store["pr_history"].rows[0]).toMatchObject({
      previous_weight: 48,
      new_weight: 55,
      source: "manual",
    });
  });
});

describe("deleteRecord (legacy)", () => {
  it("캐시와 해당 exercise의 pr_history 전부를 삭제한다", async () => {
    mockState.store["personal-records"].rows.push({
      id: 1,
      user_id: USER_ID,
      exercise_id: 10,
      weight: 52,
      pr_date: "2026-04-20",
    });
    mockState.store["pr_history"].rows.push(
      {
        id: 100,
        user_id: USER_ID,
        exercise_id: 10,
        previous_weight: null,
        new_weight: 48,
        pr_date: "2026-04-10",
        note: null,
        source: "manual",
      },
      {
        id: 101,
        user_id: USER_ID,
        exercise_id: 10,
        previous_weight: 48,
        new_weight: 52,
        pr_date: "2026-04-20",
        note: null,
        source: "manual",
      },
      {
        id: 200,
        user_id: USER_ID,
        exercise_id: 99,
        previous_weight: null,
        new_weight: 100,
        pr_date: "2026-04-01",
        note: null,
        source: "manual",
      }
    );

    await deleteRecord(1);

    expect(mockState.store["personal-records"].rows).toHaveLength(0);
    const remaining = mockState.store["pr_history"].rows;
    expect(remaining).toHaveLength(1);
    expect(remaining[0].exercise_id).toBe(99);
  });
});

describe("getPRHistory", () => {
  it("해당 exercise의 history를 pr_date 내림차순으로 반환한다", async () => {
    mockState.store["pr_history"].rows.push(
      {
        id: 100,
        user_id: USER_ID,
        exercise_id: 10,
        previous_weight: null,
        new_weight: 48,
        pr_date: "2026-04-10",
        note: null,
        source: "manual",
      },
      {
        id: 101,
        user_id: USER_ID,
        exercise_id: 10,
        previous_weight: 48,
        new_weight: 52,
        pr_date: "2026-04-20",
        note: null,
        source: "manual",
      },
      {
        id: 200,
        user_id: USER_ID,
        exercise_id: 99,
        previous_weight: null,
        new_weight: 100,
        pr_date: "2026-04-01",
        note: null,
        source: "manual",
      }
    );

    const result = await getPRHistory(10);

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe(101);
    expect(result[1].id).toBe(100);
  });
});
