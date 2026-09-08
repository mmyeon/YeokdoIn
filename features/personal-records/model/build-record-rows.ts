/**
 * 종목 카탈로그와 등록된 PR을 한 목록으로 병합 — 순수 함수.
 *
 * 목록이 등록된 PR만 보여주면 "무엇을 아직 안 쟀는지" 알 길이 없다(FR-012).
 * 카탈로그 전체를 깔고 등록 여부를 표시해 미등록 종목이 등록 진입점이 되게 한다.
 *
 * 등록된 종목을 앞에 두는 이유: 자주 보는 값이 위에 있어야 한다. 그 안의 순서는
 * `records` 인자 순서를 그대로 쓴다 — 서버가 `pr_date` 내림차순으로 정렬해 준다.
 *
 * I/O·React 의존 없음.
 */

export type CatalogExercise = {
  id: number;
  name: string;
};

export type PersonalRecordRow<R> = {
  id: number;
  name: string;
  /** 미등록이면 `null` */
  record: R | null;
};

export function buildPersonalRecordRows<R extends { exerciseId: number }>(
  exercises: readonly CatalogExercise[],
  records: readonly R[]
): PersonalRecordRow<R>[] {
  const byExerciseId = new Map(records.map((r) => [r.exerciseId, r]));

  // 카탈로그에 없는 종목의 기록은 렌더하지 않는다. 종목이 지워졌는데 기록만
  // 남은 경우 이름을 못 붙이므로, 화면을 깨뜨리는 대신 조용히 뺀다.
  const registered = records
    .map((record) => exercises.find((e) => e.id === record.exerciseId))
    .filter((e): e is CatalogExercise => e !== undefined)
    .map((e) => ({ id: e.id, name: e.name, record: byExerciseId.get(e.id)! }));

  const registeredIds = new Set(registered.map((row) => row.id));

  const unregistered = exercises
    .filter((e) => !registeredIds.has(e.id))
    .map((e) => ({ id: e.id, name: e.name, record: null }));

  return [...registered, ...unregistered];
}
