/** `\r\n`, `\r`, `\n` 을 모두 줄 경계로 취급한다. */
const LINE_BREAK = /\r\n|\r|\n/;

/**
 * 붙여넣은 텍스트를 항목 목록으로 분해한다.
 *
 * 줄 경계로만 나누고, 각 줄의 앞뒤 공백을 제거한 뒤 빈 줄을 버린다.
 * 줄 내부 문자는 원문 그대로 보존한다 — 종목·강도·렙·세트를 분해하지 않고,
 * 줄을 병합하지 않으며, 표기를 정규화하지 않는다(`×` → `x` 포함).
 *
 * 빈 문자열이나 공백뿐인 입력은 `[]` 를 반환한다.
 * 진행 차단은 호출부의 책임이다.
 */
export function splitIntoItems(text: string): string[] {
  return text
    .split(LINE_BREAK)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}
