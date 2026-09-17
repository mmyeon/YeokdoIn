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

  it('titles 는 생성 시각 오름차순이다', () => {
    const index = buildActivityIndex(
      [
        program('2026-09-17T09:00:00Z', '저녁'),
        program('2026-09-17T01:00:00Z', '아침'),
        program('2026-09-17T05:00:00Z', '점심'),
      ],
      SEOUL,
    );

    expect(index.get('2026-09-17')?.titles).toEqual(['아침', '점심', '저녁']);
  });

  /**
   * 화이트보드 입력은 대부분 제목 없이 저장된다. 제목이 없다고 "프로그램 1건"만
   * 보여주면 그날 뭘 했는지 알 수 없어 FR-008 이 요구한 요약이 성립하지 않는다.
   * 그래서 이름의 대체 소스가 `lines` 첫 줄이다.
   */
  it('제목이 없으면 lines 첫 줄을 이름으로 쓴다', () => {
    const index = buildActivityIndex(
      [program('2026-09-17T01:00:00Z', null, ['Snatch 5x3', 'Back Squat 5x5'])],
      SEOUL,
    );

    expect(index.get('2026-09-17')?.titles).toEqual(['Snatch 5x3']);
  });

  it('제목이 있으면 lines 보다 제목이 우선한다', () => {
    const index = buildActivityIndex(
      [program('2026-09-17T01:00:00Z', '월요일 세션', ['Snatch 5x3'])],
      SEOUL,
    );

    expect(index.get('2026-09-17')?.titles).toEqual(['월요일 세션']);
  });

  it('lines 앞쪽의 빈 줄은 건너뛴다', () => {
    const index = buildActivityIndex(
      [program('2026-09-17T01:00:00Z', null, ['', '   ', 'Clean & Jerk'])],
      SEOUL,
    );

    expect(index.get('2026-09-17')?.titles).toEqual(['Clean & Jerk']);
  });

  it('제목도 lines 도 없으면 count 에는 들어가지만 titles 에는 남지 않는다', () => {
    const index = buildActivityIndex(
      [
        program('2026-09-17T01:00:00Z', null, null),
        program('2026-09-17T05:00:00Z', '오후'),
      ],
      SEOUL,
    );

    const day = index.get('2026-09-17');
    expect(day?.count).toBe(2);
    expect(day?.titles).toEqual(['오후']);
  });

  it('dateKey 는 키와 항목 양쪽에 같은 값으로 들어간다', () => {
    const index = buildActivityIndex([program('2026-09-17T01:00:00Z')], SEOUL);

    expect(index.get('2026-09-17')?.dateKey).toBe('2026-09-17');
  });
});
