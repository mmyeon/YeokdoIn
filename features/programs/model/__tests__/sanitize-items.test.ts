import { sanitizeItems } from '@/features/programs/model/sanitize-items';

describe('sanitizeItems', () => {
  it('앞뒤 공백을 제거한다', () => {
    expect(sanitizeItems(['  back press 5x3  '])).toEqual(['back press 5x3']);
  });

  it('줄바꿈과 탭을 제거한다', () => {
    expect(sanitizeItems(['back\npress\t5x3'])).toEqual(['backpress5x3']);
  });

  it('제어문자를 제거한다', () => {
    expect(sanitizeItems(['back\u0007press 5x3'])).toEqual(['backpress 5x3']);
  });

  it('처리 결과가 빈 문자열인 항목은 제외한다', () => {
    expect(sanitizeItems(['a', '   ', '\n\t', 'b'])).toEqual(['a', 'b']);
  });

  it('그 외의 내용은 변형하지 않는다', () => {
    const line = 's.balance & ohs 80~90% (3+2)×3';
    expect(sanitizeItems([line])).toEqual([line]);
  });

  it('오인식을 자동으로 고치지 않는다', () => {
    expect(sanitizeItems(['Back Squat 90% 2xl, 95% 1xl'])).toEqual([
      'Back Squat 90% 2xl, 95% 1xl',
    ]);
  });

  it('중복 항목을 제거하지 않는다', () => {
    expect(sanitizeItems(['a', 'a'])).toEqual(['a', 'a']);
  });

  it('순서를 유지한다', () => {
    expect(sanitizeItems(['c', 'b', 'a'])).toEqual(['c', 'b', 'a']);
  });

  it('전부 비면 빈 배열을 반환한다', () => {
    expect(sanitizeItems(['   ', '\n'])).toEqual([]);
  });

  it('빈 배열은 빈 배열이다', () => {
    expect(sanitizeItems([])).toEqual([]);
  });

  it('입력 배열을 변형하지 않는다', () => {
    const input = ['  a  ', '  '];
    sanitizeItems(input);
    expect(input).toEqual(['  a  ', '  ']);
  });
});
