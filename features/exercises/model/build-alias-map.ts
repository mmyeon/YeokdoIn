import type { Tables } from "@/types_db";

export type ExerciseRow = Tables<"exercises">;

/**
 * exercises 행 배열을 resolver가 사용하는 aliasMap(소문자 이름 → id)으로 변환한다.
 * 순수 함수: 입력을 변형하지 않는다.
 *
 * 규칙:
 * - key 는 name 을 trim + lowercase
 * - 빈 key(공백만) 는 무시
 * - 동일 key 가 여러 행에 있을 경우 더 작은 id 가 이긴다 (결정적 결과)
 */
export function buildAliasMap(
  exercises: ReadonlyArray<Pick<ExerciseRow, "id" | "name">>,
): Record<string, number> {
  const map: Record<string, number> = {};
  for (const row of exercises) {
    const key = row.name.trim().toLowerCase();
    if (!key) continue;
    const existing = map[key];
    if (existing === undefined || row.id < existing) {
      map[key] = row.id;
    }
  }
  return map;
}
