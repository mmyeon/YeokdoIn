import { findSuspectSpans } from '@/features/programs/model/suspect-spans';

function marked(line: string): string[] {
  return findSuspectSpans(line).map((s) => line.slice(s.start, s.end));
}

describe('findSuspectSpans — 검출 (docs/gym-program-notation.md 4.2)', () => {
  it('곱셈 기호 x 뒤의 l 을 검출한다', () => {
    expect(marked('90% 2xl')).toEqual(['l']);
  });

  it('곱셈 기호 x 뒤의 I 를 검출한다', () => {
    expect(marked('3xI')).toEqual(['I']);
  });

  it('곱셈 기호 × 뒤의 O 를 검출한다', () => {
    expect(marked('3×O')).toEqual(['O']);
  });

  it('% 바로 앞의 O 를 검출한다', () => {
    expect(marked('8O%')).toEqual(['O']);
  });

  it('% 바로 앞의 l 을 검출한다', () => {
    expect(marked('l00%')).toEqual(['l']);
  });

  it('숫자와 숫자 사이에 낀 문자를 검출한다', () => {
    expect(marked('1l0%')).toEqual(['l']);
  });

  it('숫자 뒤 마침표 다음에 강도가 이어지면 검출한다', () => {
    expect(marked('S. Pull up 100% 3x2. 105% 3x2')).toEqual(['.']);
  });

  it('한 줄에 여러 건이면 start 오름차순으로 겹치지 않게 돌려준다', () => {
    const line = 'Back Squat 80% 4x2,85% 3x2,90% 2xl,95% 1xl';
    const spans = findSuspectSpans(line);
    expect(spans).toHaveLength(2);
    expect(spans[0].start).toBeLessThan(spans[1].start);
    expect(spans[0].end).toBeLessThanOrEqual(spans[1].start);
    expect(marked(line)).toEqual(['l', 'l']);
  });

  it('규칙 이름을 함께 돌려준다', () => {
    expect(findSuspectSpans('90% 2xl')[0].rule).toBe('digit-slot-letter');
    expect(findSuspectSpans('3x2. 105%')[0].rule).toBe('period-separator');
  });
});

describe('findSuspectSpans — 정상 표기는 검출하지 않는다 (문서 3장)', () => {
  it('범위 표기 ~ 를 검출하지 않는다', () => {
    expect(marked('s.balance & ohs 80~90% (3+2)×3')).toEqual([]);
  });

  it('× 와 x 혼용을 검출하지 않는다', () => {
    expect(marked('clean 80% 2x2, 85% 2×2, 90% 1x2')).toEqual([]);
  });

  it('% 뒤 공백 없는 표기를 검출하지 않는다', () => {
    expect(marked('power clean & push jerk 65% (2+2)×2, 70%(2+2)x2')).toEqual([]);
  });

  it('괄호 복합 렙을 검출하지 않는다', () => {
    expect(marked('Squat Clean & FSQ 70% (1+2)x3,75%(1+2)x1,')).toEqual([]);
  });

  it('괄호 modifier 를 검출하지 않는다', () => {
    expect(marked('Rack Jerk (Pause Dip) 70% 3x2,75% 2x1,80% 2x1')).toEqual([]);
    expect(marked('2-Pause Snatch (under knee, Midthigh) 65% 3x3')).toEqual([]);
  });

  it('종목명의 마침표를 검출하지 않는다', () => {
    expect(marked('c.d.l 85% 3×3')).toEqual([]);
    expect(marked('low hang s.pull up 90% 4x4')).toEqual([]);
    expect(marked('C. Pull up (Pause midthigh) 80% 3×4')).toEqual([]);
  });

  it('줄 끝 쉼표를 검출하지 않는다', () => {
    expect(marked('80% (1+2)x1, 85%(1+1)x3')).toEqual([]);
  });

  it('괄호 없는 복합 렙을 검출하지 않는다', () => {
    expect(marked('S.Balance & OHS 70% 2+1×4')).toEqual([]);
  });

  it('빈 문자열에서 아무것도 검출하지 않는다', () => {
    expect(findSuspectSpans('')).toEqual([]);
  });
});

/**
 * SC-005 골든 케이스.
 * docs/gym-program-notation.md 2장 원문 6판 전량.
 * 원문 그대로 옮긴다 — 고치면 근거로서의 가치가 사라진다.
 *
 * 계약 문서는 39줄이라고 적었으나 실제로 옮겨 세면 40줄이다.
 * 문서 5.3의 「6판 40줄」이 맞다. 판6의 이어지는 줄(`80% (1+2)x1, ...`)이
 * 한 줄로 세어진다.
 */
const BOARDS: string[] = [
  // 판1
  'back press 5x3',
  'hang power snatch 65% 3×2, 70% 3×2, 75% 3×2',
  'hang squat snatch 75% 3×2, 80% 2x2',
  'squat snatch 80% 2x2, 85% 2x2, 90% 1x2',
  'low hang s.pull up 90% 4x4',
  's.balance & ohs 80~90% (3+2)×3',
  'back squat 80% 5×5',
  // 판2
  'm.press 5x3',
  'hang power clean 65% 3×2, 70% 3×2, 75% 3×2',
  'hang squat clean 75% 3×2, 80% 2×2',
  'clean 80% 2x2, 85% 2×2, 90% 1x2',
  'hsoc & push jerk 70% (2+2)×3',
  'split jerk 75% 2×2, 80% 2×2, 85% 1×2',
  'front squat 80% 3×3',
  // 판3
  'sots press 5×3',
  'power snatch 65% 3×2, 70% 3×2',
  'squat snatch 75% 2x3, 80% 2x2',
  'power clean 65% 3×2, 70% 3×2',
  'squat clean 75% 2x3, 80% 2×2',
  'clean pull up 95% 3×3',
  'back squat 75% 5×4',
  // 판4
  'back press 5×3',
  'power snatch 65% 3x2, 70% 2x2',
  'snatch 75% 2x2, 80% 2x2, 85% 1x2 ',
  'power clean & push jerk 65% (2+2)×2, 70%(2+2)x2',
  'clean 75% 2×2, 80% 2×2, 85% 1×2',
  'c.d.l 85% 3×3',
  // 판5
  'Back Press 10x3',
  '2-Pause Snatch (under knee, Midthigh) 65% 3x3',
  'Low Hang Power Snatch 70% 3×3',
  'Power Snatch 75% 2x3, Snatch 80% 2x2',
  'S.Pull up 100% 3x2. 105% 3x2',
  'S.Balance & OHS 70% 2+1×4',
  'Back Squat 80% 4x2,85% 3x2,90% 2xl,95% 1xl',
  // 판6
  'M Press 10x3',
  'Squat Clean & FSQ 70% (1+2)x3,75%(1+2)x1,',
  '80% (1+2)x1, 85%(1+1)x3',
  'C. Pull up (Pause midthigh) 80% 3×4',
  'Rack Jerk (Pause Dip) 70% 3x2,75% 2x1,80% 2x1',
  'Front Squat (Pause Bottom) 80% 3x3, 85% 2x2',
];

describe('findSuspectSpans — SC-005 골든 케이스', () => {
  it('원문은 40줄이다', () => {
    expect(BOARDS).toHaveLength(40);
  });

  it('4.1의 3건 외 검출이 0건이다', () => {
    const detected = BOARDS.flatMap((line) =>
      findSuspectSpans(line).map((s) => ({
        line,
        text: line.slice(s.start, s.end),
      })),
    );

    expect(detected).toEqual([
      { line: 'S.Pull up 100% 3x2. 105% 3x2', text: '.' },
      { line: 'Back Squat 80% 4x2,85% 3x2,90% 2xl,95% 1xl', text: 'l' },
      { line: 'Back Squat 80% 4x2,85% 3x2,90% 2xl,95% 1xl', text: 'l' },
    ]);
  });
});
