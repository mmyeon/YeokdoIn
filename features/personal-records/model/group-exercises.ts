/**
 * 종목 카탈로그를 드롭다운용 카테고리로 묶는 순수 함수.
 *
 * 카탈로그가 17종목이라 평면 목록은 스크롤 부담이 크다. 종목의 진실은 DB에
 * 있으므로(CLAUDE.md) 목록을 복제하지 않고 **이름 패턴**으로 분류한다.
 * 새 종목이 DB에 추가돼도 규칙에 걸리면 자동으로 제자리에, 안 걸리면 `기타`로
 * 떨어져 화면에서 사라지지 않는다.
 *
 * I/O·React 의존 없음.
 */

export type Categorizable = {
  id: number;
  name: string;
};

export type ExerciseGroup<T extends Categorizable> = {
  label: string;
  exercises: T[];
};

/**
 * 위에서부터 먼저 걸리는 규칙이 이긴다. 순서가 곧 명세다.
 * `Clean and Jerk` 는 `클린` 보다 `저크` 가 앞서면 저크로 빠지므로 클린을 먼저 둔다.
 */
const CATEGORY_RULES: ReadonlyArray<{ label: string; pattern: RegExp }> = [
  { label: "스내치", pattern: /snatch/ },
  { label: "클린", pattern: /clean/ },
  { label: "저크", pattern: /jerk/ },
  { label: "스쿼트", pattern: /squat/ },
  { label: "프레스", pattern: /press/ },
];

/** 어느 규칙에도 걸리지 않은 종목의 거처. 항상 마지막에 온다. */
const FALLBACK_LABEL = "기타";

function labelFor(name: string): string {
  const normalized = name.toLowerCase();
  return (
    CATEGORY_RULES.find((rule) => rule.pattern.test(normalized))?.label ??
    FALLBACK_LABEL
  );
}

/**
 * 비어 있는 그룹은 반환하지 않는다. 그룹 순서는 `CATEGORY_RULES` 순서를 따르고,
 * 그룹 안의 순서는 입력 순서를 유지한다.
 */
export function groupExercisesByCategory<T extends Categorizable>(
  exercises: readonly T[]
): ExerciseGroup<T>[] {
  const labelOrder = [...CATEGORY_RULES.map((rule) => rule.label), FALLBACK_LABEL];

  return labelOrder
    .map((label) => ({
      label,
      exercises: exercises.filter((exercise) => labelFor(exercise.name) === label),
    }))
    .filter((group) => group.exercises.length > 0);
}
