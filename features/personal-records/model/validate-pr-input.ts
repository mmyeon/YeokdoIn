/**
 * PR 입력 검증 — 순수 함수.
 *
 * I/O·React·시스템 시계에 의존하지 않는다. `today`를 인자로 받는 이유는
 * 함수 안에서 `new Date()`를 부르면 순수성이 깨지고 테스트가 자정 근처에서
 * 깨지기 때문이다.
 *
 * UI(즉시 피드백)와 서버 액션(경계 강제)이 같은 함수를 호출하므로 규칙이
 * 갈라질 수 없다. 무게 규칙은 DB CHECK 제약이 한 겹 더 받친다.
 *
 * @see specs/001-pr-management/contracts/server-actions.md
 */

/** 무게 상한. 이보다 크면 오입력으로 본다. */
const MAX_WEIGHT_KG = 1000;

/** `YYYY-MM-DD` */
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export type PRInputDraft = {
  weight: number | null;
  prDate: string;
};

export type ValidationError = {
  field: "weight" | "prDate";
  /** 사용자에게 그대로 보여줄 한국어 문구 */
  message: string;
};

function validateWeight(weight: number | null): ValidationError | null {
  const invalid = (message: string): ValidationError => ({
    field: "weight",
    message,
  });

  if (weight === null || !Number.isFinite(weight)) {
    return invalid("무게를 입력해주세요.");
  }
  if (weight <= 0) {
    return invalid("무게는 0보다 커야 합니다.");
  }
  if (!Number.isInteger(weight)) {
    return invalid("무게는 1kg 단위로 입력해주세요.");
  }
  if (weight > MAX_WEIGHT_KG) {
    return invalid("무게가 너무 큽니다. 다시 확인해주세요.");
  }
  return null;
}

function validatePRDate(prDate: string, today: string): ValidationError | null {
  const invalid = (message: string): ValidationError => ({
    field: "prDate",
    message,
  });

  if (!DATE_PATTERN.test(prDate)) {
    return invalid("날짜를 입력해주세요.");
  }
  // ISO 8601 날짜는 사전순 비교가 시간순 비교와 일치한다.
  if (prDate > today) {
    return invalid("미래 날짜는 기록할 수 없습니다.");
  }
  return null;
}

/**
 * 위반이 없으면 빈 배열을 반환한다. 첫 위반에서 멈추지 않고 필드별로 모아
 * 반환하므로 사용자가 한 번에 모든 문제를 볼 수 있다.
 *
 * @param today `YYYY-MM-DD` — 호출자가 주입한다
 */
export function validatePRInput(
  draft: PRInputDraft,
  today: string
): ValidationError[] {
  return [
    validateWeight(draft.weight),
    validatePRDate(draft.prDate, today),
  ].filter((error): error is ValidationError => error !== null);
}
