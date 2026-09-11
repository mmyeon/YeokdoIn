import {
  fromEditBuffer,
  splitForDisplay,
  toEditBuffer,
  topLevelCommaIndexes,
} from '@/features/programs/model/display-layout';

describe('topLevelCommaIndexes', () => {
  it('괄호 밖의 쉼표만 찾는다', () => {
    expect(topLevelCommaIndexes('a,b')).toEqual([1]);
  });

  it('괄호 안의 쉼표는 구분자가 아니다', () => {
    const line = '2-Pause Snatch (under knee, Midthigh) 65% 3x3';
    expect(topLevelCommaIndexes(line)).toEqual([]);
  });

  it('닫는 괄호가 남아도 깨지지 않는다', () => {
    expect(topLevelCommaIndexes('a),b')).toEqual([2]);
  });

  it('쉼표가 없으면 빈 배열이다', () => {
    expect(topLevelCommaIndexes('back press 5x3')).toEqual([]);
  });
});

describe('splitForDisplay', () => {
  it('강도가 둘 이상이면 종목명과 강도 조각으로 가른다', () => {
    expect(splitForDisplay('hang power snatch 65% 3×2, 70% 3×2, 75% 3×2')).toEqual({
      head: 'hang power snatch',
      pieces: ['65% 3×2', '70% 3×2', '75% 3×2'],
    });
  });

  it('괄호 modifier 를 종목명 쪽에 남긴다', () => {
    expect(splitForDisplay('Rack Jerk (Pause Dip) 70% 3x2,75% 2x1,80% 2x1')).toEqual({
      head: 'Rack Jerk (Pause Dip)',
      pieces: ['70% 3x2', '75% 2x1', '80% 2x1'],
    });
  });

  it('상속 줄은 종목명이 빈 문자열이다', () => {
    expect(splitForDisplay('80% (1+2)x1, 85%(1+1)x3')).toEqual({
      head: '',
      pieces: ['80% (1+2)x1', '85%(1+1)x3'],
    });
  });

  it('줄 끝 쉼표는 빈 조각을 만들지 않는다', () => {
    expect(splitForDisplay('Squat Clean & FSQ 70% (1+2)x3,75%(1+2)x1,')).toEqual({
      head: 'Squat Clean & FSQ',
      pieces: ['70% (1+2)x3', '75%(1+2)x1'],
    });
  });

  it('강도가 하나면 가르지 않는다', () => {
    expect(splitForDisplay('s.balance & ohs 80~90% (3+2)×3')).toBeNull();
  });

  it('괄호 안 쉼표만 있으면 가르지 않는다', () => {
    expect(
      splitForDisplay('2-Pause Snatch (under knee, Midthigh) 65% 3x3'),
    ).toBeNull();
  });

  it('강도가 없으면 가르지 않는다', () => {
    expect(splitForDisplay('back press 5x3')).toBeNull();
  });

  it('첫 조각에 강도가 없으면 가르지 않는다', () => {
    expect(splitForDisplay('hang, squat')).toBeNull();
  });

  it('문자를 잃지 않는다', () => {
    const line = 'Back Squat 80% 4x2,85% 3x2,90% 2xl,95% 1xl';
    const layout = splitForDisplay(line);
    const strip = (s: string) => s.replace(/[\s,]/g, '');
    const joined = [layout?.head, ...(layout?.pieces ?? [])]
      .filter(Boolean)
      .join('');
    expect(strip(joined)).toBe(strip(line));
  });
});

describe('편집 버퍼', () => {
  const LINES = [
    'back press 5x3',
    'hang power snatch 65% 3×2, 70% 3×2, 75% 3×2',
    '2-Pause Snatch (under knee, Midthigh) 65% 3x3',
    'Back Squat 80% 4x2,85% 3x2,90% 2xl,95% 1xl',
    'Squat Clean & FSQ 70% (1+2)x3,75%(1+2)x1,',
    'Rack Jerk (Pause Dip) 70% 3x2,75% 2x1,80% 2x1',
  ];

  it('최상위 쉼표를 줄바꿈으로 바꾼다', () => {
    expect(toEditBuffer('Back Squat 80% 4x2,85% 3x2')).toBe(
      'Back Squat 80% 4x2\n85% 3x2',
    );
  });

  it('괄호 안의 쉼표는 그대로 둔다', () => {
    const line = '2-Pause Snatch (under knee, Midthigh) 65% 3x3';
    expect(toEditBuffer(line)).toBe(line);
  });

  it('길이가 보존된다', () => {
    for (const line of LINES) {
      expect(toEditBuffer(line)).toHaveLength(line.length);
    }
  });

  it('원문을 정확히 복원한다', () => {
    for (const line of LINES) {
      expect(fromEditBuffer(toEditBuffer(line))).toBe(line);
    }
  });

  it('사용자가 넣은 줄바꿈도 쉼표가 된다', () => {
    expect(fromEditBuffer('a\r\nb\rc\nd')).toBe('a,b,c,d');
  });
});
