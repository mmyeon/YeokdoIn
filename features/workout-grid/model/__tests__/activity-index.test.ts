import { buildActivityIndex } from '../activity-index';

/**
 * FR-001 의 핵심은 "하루에 여러 건이어도 칸은 하나"다.
 * 그리고 FR-002 가 못 박은 대로 판정 소스는 `created_at` 하나뿐이다 —
 * `updated_at` 을 섞으면 프로그램을 고칠 때마다 칸이 다른 날로 옮겨간다.
 */

const SEOUL = 'Asia/Seoul';

function program(
  createdAt: string,
  title: string | null = null,
  lines: string[] | null = null,
) {
  return { created_at: createdAt, title, lines };
}

describe('buildActivityIndex', () => {
  it('빈 배열은 빈 Map 이 된다', () => {
    expect(buildActivityIndex([], SEOUL).size).toBe(0);
  });

  it('같은 날 3건은 항목 하나로 접히고 count 만 늘어난다', () => {
    const index = buildActivityIndex(
      [
        program('2026-09-17T01:00:00Z'),
        program('2026-09-17T05:00:00Z'),
        program('2026-09-17T09:00:00Z'),
      ],
      SEOUL,
    );

    expect(index.size).toBe(1);
    expect(index.get('2026-09-17')?.count).toBe(3);
  });

  it('서로 다른 날은 서로 다른 항목이 된다', () => {
    const index = buildActivityIndex(
      [program('2026-09-16T01:00:00Z'), program('2026-09-17T01:00:00Z')],
      SEOUL,
    );

    expect(index.size).toBe(2);
    expect(index.get('2026-09-16')?.count).toBe(1);
    expect(index.get('2026-09-17')?.count).toBe(1);
  });

  it('로컬 자정을 넘긴 기록은 다음 날 항목으로 들어간다', () => {
    // 15:30Z = 서울 9/17 00:30
    const index = buildActivityIndex([program('2026-09-16T15:30:00Z')], SEOUL);

    expect([...index.keys()]).toEqual(['2026-09-17']);
  });

  it('programs 는 생성 시각 오름차순이다', () => {
    const index = buildActivityIndex(
      [
        program('2026-09-17T09:00:00Z', '저녁'),
        program('2026-09-17T01:00:00Z', '아침'),
        program('2026-09-17T05:00:00Z', '점심'),
      ],
      SEOUL,
    );

    expect(index.get('2026-09-17')?.programs.map((p) => p.title)).toEqual([
      '아침',
      '점심',
      '저녁',
    ]);
  });

  /**
   * 제목은 대부분 null 이고, 첫 줄만 남기면 그 줄이 'Day 1' 같은 머리글일 때
   * 그날 뭘 했는지에 답하지 못한다. 그래서 줄 전체를 들고 간다 (FR-008).
   */
  it('lines 를 첫 줄만이 아니라 전부 들고 간다', () => {
    const index = buildActivityIndex(
      [
        program('2026-09-17T01:00:00Z', null, [
          'Snatch 5x3',
          'Back Squat 5x5',
          'Clean Pull 3x3',
        ]),
      ],
      SEOUL,
    );

    expect(index.get('2026-09-17')?.programs).toEqual([
      {
        title: null,
        lines: ['Snatch 5x3', 'Back Squat 5x5', 'Clean Pull 3x3'],
      },
    ]);
  });

  it('빈 줄은 제거하고 앞뒤 공백을 다듬는다', () => {
    const index = buildActivityIndex(
      [program('2026-09-17T01:00:00Z', null, ['', '  Snatch 5x3  ', '   '])],
      SEOUL,
    );

    expect(index.get('2026-09-17')?.programs[0].lines).toEqual(['Snatch 5x3']);
  });

  it('lines 가 null 이면 빈 배열이 된다 — null 을 UI 까지 밀지 않는다', () => {
    const index = buildActivityIndex(
      [program('2026-09-17T01:00:00Z', '제목만', null)],
      SEOUL,
    );

    expect(index.get('2026-09-17')?.programs[0].lines).toEqual([]);
  });

  it('제목의 앞뒤 공백을 다듬고, 빈 제목은 null 로 접는다', () => {
    const index = buildActivityIndex(
      [
        program('2026-09-17T01:00:00Z', '  월요일 세션  '),
        program('2026-09-17T05:00:00Z', '   '),
      ],
      SEOUL,
    );

    expect(index.get('2026-09-17')?.programs.map((p) => p.title)).toEqual([
      '월요일 세션',
      null,
    ]);
  });

  it('내용이 전혀 없는 기록도 count 와 programs 에는 들어간다', () => {
    // 칸이 켜진 이유는 기록이 있어서다. 내용이 비었다고 없던 일이 되면 안 된다.
    const index = buildActivityIndex(
      [program('2026-09-17T01:00:00Z', null, null)],
      SEOUL,
    );

    const day = index.get('2026-09-17');
    expect(day?.count).toBe(1);
    expect(day?.programs).toEqual([{ title: null, lines: [] }]);
  });

  it('dateKey 는 키와 항목 양쪽에 같은 값으로 들어간다', () => {
    const index = buildActivityIndex([program('2026-09-17T01:00:00Z')], SEOUL);

    expect(index.get('2026-09-17')?.dateKey).toBe('2026-09-17');
  });
});
