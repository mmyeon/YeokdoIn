import { searchExercises } from '../search-exercises';

const row = (id: number, name: string, is_pr_tracked = false) => ({
  id,
  name,
  is_pr_tracked,
});

const EXERCISES = [
  row(1, 'Power Snatch'),
  row(2, 'Hang Snatch'),
  row(3, 'Snatch', true),
  row(4, 'Snatch Balance'),
  row(5, 'Clean & Jerk', true),
  row(6, 'Back Squat', true),
  row(7, 'Front Squat'),
];

const names = (rows: { name: string }[]) => rows.map((r) => r.name);

describe('searchExercises', () => {
  it('정확히 일치하는 이름을 맨 앞에 둔다', () => {
    expect(searchExercises(EXERCISES, 'snatch', 10)[0].name).toBe('Snatch');
  });

  it('이름이 질의로 시작하는 것을 그 다음에 둔다', () => {
    expect(names(searchExercises(EXERCISES, 'snatch', 10))).toEqual([
      'Snatch',
      'Snatch Balance',
      'Hang Snatch',
      'Power Snatch',
    ]);
  });

  it('같은 등급에서는 짧은 이름이 앞선다', () => {
    const rows = [row(1, 'Hang Power Snatch'), row(2, 'Hang Snatch')];
    expect(names(searchExercises(rows, 'snatch', 10))).toEqual([
      'Hang Snatch',
      'Hang Power Snatch',
    ]);
  });

  it('공백으로 나눈 토큰이 모두 부분 문자열로 들어 있어야 한다', () => {
    expect(names(searchExercises(EXERCISES, 'power sn', 10))).toEqual(['Power Snatch']);
    expect(searchExercises(EXERCISES, 'snatch squat', 10)).toEqual([]);
  });

  it('대소문자와 앞뒤 공백을 무시한다', () => {
    expect(names(searchExercises(EXERCISES, '  BACK  squat ', 10))).toEqual(['Back Squat']);
  });

  it('빈 질의는 PR 종목을 먼저, 나머지는 id 순으로 돌려준다', () => {
    expect(names(searchExercises(EXERCISES, '  ', 10))).toEqual([
      'Snatch',
      'Clean & Jerk',
      'Back Squat',
      'Power Snatch',
      'Hang Snatch',
      'Snatch Balance',
      'Front Squat',
    ]);
  });

  it('limit 으로 자른다', () => {
    expect(searchExercises(EXERCISES, '', 3)).toHaveLength(3);
    expect(searchExercises(EXERCISES, 'snatch', 2)).toHaveLength(2);
  });

  it('입력 배열을 바꾸지 않는다', () => {
    const copy = [...EXERCISES];
    searchExercises(EXERCISES, 'snatch', 10);
    searchExercises(EXERCISES, '', 10);
    expect(EXERCISES).toEqual(copy);
  });

  it('일치하는 것이 없으면 빈 배열이다', () => {
    expect(searchExercises(EXERCISES, 'zzz', 10)).toEqual([]);
  });
});
