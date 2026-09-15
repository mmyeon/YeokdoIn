import type { SuspectSpan } from '@/features/programs/model/text-program';

/**
 * 숫자 자리에 올 수 있는 문자. `1`/`l`/`I`, `0`/`O` 의 혼동에서 온다.
 * 규칙의 단일 출처는 `docs/gym-program-notation.md` 4.2 다.
 */
const SLOT_LETTER = '[OlI]';

/** 숫자와 숫자 자리 문자로만 이루어진 덩어리 */
const SLOT_RUN = /[0-9OlI]+/g;

const LETTER_RUN = new RegExp(`${SLOT_LETTER}+`, 'g');

const MULTIPLY = /[x×]/;

const DIGIT = /[0-9]/;

/**
 * 숫자 뒤 마침표 다음에 강도가 이어지는 경우.
 * 판정 조건이 「숫자 뒤」이므로 종목명의 마침표(`c.d.l`, `S. Pull up`)와
 * 충돌하지 않는다.
 */
/**
 * `+` 와 그것이 속한 덩어리. 숫자가 붙어 있지 않으면 `+` 한 글자만 잡는다.
 */
const PLUS_RUN = /[0-9]*\+[0-9+]*/g;

const PERIOD_SEPARATOR = /(?<=[0-9])\.(?=\s*[0-9]+(?:~[0-9]+)?\s*%)/g;

interface Candidate {
  start: number;
  end: number;
  rule: SuspectSpan['rule'];
}

/** 덩어리 바로 앞이 「숫자 + 곱셈 기호」인가 */
function followsMultiplication(line: string, runStart: number): boolean {
  const sign = line[runStart - 1];
  const before = line[runStart - 2];
  return (
    sign !== undefined &&
    MULTIPLY.test(sign) &&
    before !== undefined &&
    DIGIT.test(before)
  );
}

function collectDigitSlotLetters(line: string): Candidate[] {
  const found: Candidate[] = [];

  for (const run of line.matchAll(SLOT_RUN)) {
    const text = run[0];
    const runStart = run.index;
    if (!LETTER_RUN.test(text)) {
      LETTER_RUN.lastIndex = 0;
      continue;
    }
    LETTER_RUN.lastIndex = 0;

    const beforePercent = line[runStart + text.length] === '%';
    const afterMultiply = followsMultiplication(line, runStart);

    for (const letters of text.matchAll(LETTER_RUN)) {
      const offset = letters.index;
      const betweenDigits =
        offset > 0 &&
        DIGIT.test(text[offset - 1]) &&
        offset + letters[0].length < text.length &&
        DIGIT.test(text[offset + letters[0].length]);

      if (!beforePercent && !afterMultiply && !betweenDigits) continue;

      found.push({
        start: runStart + offset,
        end: runStart + offset + letters[0].length,
        rule: 'digit-slot-letter',
      });
    }
  }

  return found;
}

/**
 * 짝이 맞는 괄호 쌍 안에 있는 문자 위치. 짝이 깨진 괄호는 세지 않는다 —
 * 짝이 안 맞는 것 자체가 이미 유실 신호이므로 「괄호 안」으로 봐주지 않는다.
 */
function bracketedOffsets(line: string): Set<number> {
  const open: number[] = [];
  const inside = new Set<number>();

  for (let i = 0; i < line.length; i += 1) {
    if (line[i] === '(') {
      open.push(i);
    } else if (line[i] === ')') {
      const start = open.pop();
      if (start === undefined) continue;
      for (let j = start + 1; j < i; j += 1) inside.add(j);
    }
  }

  return inside;
}

/**
 * 괄호 밖의 `+`.
 *
 * 문서 3.6 에서 `+` 는 항상 괄호 안에 온다고 확정했으므로, 괄호 밖의 `+` 는
 * 표기가 아니라 괄호 유실이다. 복합 렙(`(2+2)×3`)과 충돌하지 않는다 —
 * 판정 조건이 「괄호 밖」이기 때문이다.
 *
 * 구간은 `+` 한 글자가 아니라 숫자와 `+` 로 이어진 덩어리 전체다.
 * 고쳐야 할 것이 `+` 자체가 아니라 `2+1` → `(2+1)` 이기 때문이다.
 */
function collectUnbracketedPluses(line: string): Candidate[] {
  const inside = bracketedOffsets(line);
  const found: Candidate[] = [];

  for (const run of line.matchAll(PLUS_RUN)) {
    const runStart = run.index;
    const runEnd = runStart + run[0].length;

    const hasOutside = [...run[0]].some(
      (char, offset) => char === '+' && !inside.has(runStart + offset),
    );
    if (!hasOutside) continue;

    found.push({ start: runStart, end: runEnd, rule: 'unbracketed-plus' });
  }

  return found;
}

function collectPeriodSeparators(line: string): Candidate[] {
  return [...line.matchAll(PERIOD_SEPARATOR)].map((match) => ({
    start: match.index,
    end: match.index + 1,
    rule: 'period-separator' as const,
  }));
}

/**
 * 오인식 의심 구간을 찾는다. 표시만을 위한 것이며 자동으로 고치지 않는다.
 *
 * 표기 규약 적합성은 검사하지 않는다 — 문서 3장에 확인된 표기(`~`, `×`/`x`
 * 혼용, `%` 뒤 공백 없음, 괄호 modifier, 줄 끝 쉼표, 종목명의 마침표)는
 * 전부 정상이므로 검출 대상이 아니다.
 *
 * 구간은 겹치지 않으며 `start` 오름차순이다.
 */
export function findSuspectSpans(line: string): SuspectSpan[] {
  const candidates = [
    ...collectDigitSlotLetters(line),
    ...collectPeriodSeparators(line),
    ...collectUnbracketedPluses(line),
  ].sort((a, b) => a.start - b.start || a.end - b.end);

  const spans: SuspectSpan[] = [];
  for (const candidate of candidates) {
    const previous = spans[spans.length - 1];
    if (previous && candidate.start < previous.end) continue;
    spans.push(candidate);
  }
  return spans;
}
