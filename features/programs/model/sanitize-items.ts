/**
 * C0/C1 제어문자. 줄바꿈(`\n`, `\r`)과 탭(`\t`)도 여기에 포함된다.
 * 항목은 한 줄이므로 제거 대상이다.
 */
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\u0000-\u001F\u007F-\u009F]/g;

/**
 * 저장 직전 위생 처리.
 *
 * 앞뒤 공백 제거, 제어문자 제거, 결과가 빈 문자열인 항목 제외만 수행한다.
 * 그 외의 내용은 변형하지 않는다 — 오인식 자동 수정, 표기 정규화,
 * 중복 제거를 하지 않는다.
 *
 * 반환이 `[]` 면 호출부가 저장을 거부한다.
 */
export function sanitizeItems(items: string[]): string[] {
  return items
    .map((item) => item.replace(CONTROL_CHARS, '').trim())
    .filter((item) => item.length > 0);
}
