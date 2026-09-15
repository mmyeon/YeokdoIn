import { splitIntoItems } from '@/features/programs/model/split-items';

/** docs/gym-program-notation.md 2장 판1 원문 */
const BOARD_1 = [
  'back press 5x3',
  'hang power snatch 65% 3×2, 70% 3×2, 75% 3×2',
  'hang squat snatch 75% 3×2, 80% 2x2',
  'squat snatch 80% 2x2, 85% 2x2, 90% 1x2',
  'low hang s.pull up 90% 4x4',
  's.balance & ohs 80~90% (3+2)×3',
  'back squat 80% 5×5',
];

describe('splitIntoItems', () => {
  it('판1 원문을 7개 항목으로 분해한다', () => {
    expect(splitIntoItems(BOARD_1.join('\n'))).toEqual(BOARD_1);
  });

  it('\\r\\n, \\r, \\n 을 모두 줄 경계로 취급한다', () => {
    expect(splitIntoItems('a\r\nb\rc\nd')).toEqual(['a', 'b', 'c', 'd']);
  });

  it('빈 줄은 항목으로 만들지 않는다', () => {
    expect(splitIntoItems('a\n\n\nb')).toEqual(['a', 'b']);
  });

  it('공백뿐인 줄도 항목으로 만들지 않는다', () => {
    expect(splitIntoItems('a\n   \n\t\nb')).toEqual(['a', 'b']);
  });

  it('각 줄의 앞뒤 공백을 제거한다', () => {
    expect(splitIntoItems('  back press 5x3  \n\t squat 80% 5×5\t')).toEqual([
      'back press 5x3',
      'squat 80% 5×5',
    ]);
  });

  it('줄 내부 문자는 원문 그대로 보존한다', () => {
    const line = 's.balance & ohs 80~90% (3+2)×3';
    expect(splitIntoItems(line)).toEqual([line]);
  });

  it('× 를 x 로 정규화하지 않는다', () => {
    expect(splitIntoItems('clean 80% 2x2, 85% 2×2')).toEqual([
      'clean 80% 2x2, 85% 2×2',
    ]);
  });

  it('줄 안쪽의 연속 공백을 줄이지 않는다', () => {
    expect(splitIntoItems('  back    press  5x3  ')).toEqual([
      'back    press  5x3',
    ]);
  });

  it('입력 순서를 유지한다', () => {
    expect(splitIntoItems('c\nb\na')).toEqual(['c', 'b', 'a']);
  });

  it('줄 끝 쉼표로 이어지는 줄을 병합하지 않는다', () => {
    expect(
      splitIntoItems('Squat Clean & FSQ 70% (1+2)x3,75%(1+2)x1,\n80% (1+2)x1'),
    ).toEqual(['Squat Clean & FSQ 70% (1+2)x3,75%(1+2)x1,', '80% (1+2)x1']);
  });

  it('쉼표로 나뉜 조각을 항목으로 쪼개지 않는다', () => {
    expect(splitIntoItems('clean 80% 2x2, 85% 2×2, 90% 1x2')).toEqual([
      'clean 80% 2x2, 85% 2×2, 90% 1x2',
    ]);
  });

  it('빈 문자열은 빈 배열이다', () => {
    expect(splitIntoItems('')).toEqual([]);
  });

  it('공백뿐인 입력은 빈 배열이다', () => {
    expect(splitIntoItems('  \n\t\r\n ')).toEqual([]);
  });

  it('어떤 문자에도 예외를 던지지 않는다', () => {
    const weird = '💪 한글 <script> \\ " \' ` ${}   %%%';
    expect(() => splitIntoItems(weird)).not.toThrow();
  });
});
