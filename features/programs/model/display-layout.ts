/**
 * 표시 전용 배치. 저장 형태에는 영향을 주지 않는다 (FR-026a).
 *
 * 문자를 바꾸거나 버리지 않는다. 어디서 줄을 나눌지만 정한다.
 * 나누는 기준은 괄호 밖의 쉼표다 — 괄호 안의 쉼표는 구분자가 아니다
 * (`docs/gym-program-notation.md` 3.8).
 */

/** 강도 표기. 범위(`80~90%`)까지 한 덩어리로 본다. */
const INTENSITY = /[0-9]+(?:~[0-9]+)?\s*%/;

export interface ItemLayout {
  /** 종목명과 modifier. 상속 줄에서는 빈 문자열이다. */
  head: string;
  /** 강도 조각들. 원문 문자를 그대로 담는다. */
  pieces: string[];
}

/**
 * 괄호 밖 쉼표의 위치.
 * `2-Pause Snatch (under knee, Midthigh)` 의 괄호 안 쉼표는 구분자가 아니다.
 */
export function topLevelCommaIndexes(text: string): number[] {
  const found: number[] = [];
  let depth = 0;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (char === '(') depth += 1;
    else if (char === ')') depth = Math.max(0, depth - 1);
    else if (char === ',' && depth === 0) found.push(i);
  }
  return found;
}

/** 괄호 밖의 쉼표로만 나눈다. */
function splitTopLevel(text: string): string[] {
  const pieces: string[] = [];
  let start = 0;

  for (const at of topLevelCommaIndexes(text)) {
    pieces.push(text.slice(start, at));
    start = at + 1;
  }
  pieces.push(text.slice(start));
  return pieces.map((p) => p.trim()).filter((p) => p.length > 0);
}

/**
 * 편집용 버퍼. 최상위 쉼표를 줄바꿈으로 바꾼다.
 *
 * 문자 하나를 문자 하나로 바꾸는 치환이라 길이와 오프셋이 보존되고,
 * `fromEditBuffer` 로 원문이 정확히 복원된다.
 */
export function toEditBuffer(text: string): string {
  const breaks = new Set(topLevelCommaIndexes(text));
  return [...text].map((c, i) => (breaks.has(i) ? '\n' : c)).join('');
}

/** 편집 버퍼를 저장 형태로 되돌린다. 줄바꿈은 전부 쉼표다. */
export function fromEditBuffer(buffer: string): string {
  return buffer.replace(/\r\n|\r|\n/g, ',');
}

/**
 * 강도가 둘 이상인 항목을 종목명 한 줄 + 강도 조각 여러 줄로 가른다.
 * 가를 수 없으면 `null` 을 돌려주고 호출부는 한 줄로 그린다.
 */
export function splitForDisplay(text: string): ItemLayout | null {
  const pieces = splitTopLevel(text);
  if (pieces.length < 2) return null;

  const match = pieces[0].match(INTENSITY);
  if (!match || match.index === undefined) return null;

  return {
    head: pieces[0].slice(0, match.index).trim(),
    pieces: [pieces[0].slice(match.index).trim(), ...pieces.slice(1)],
  };
}
