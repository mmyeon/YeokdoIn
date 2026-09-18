import { isSameLocalDay, localDateKey } from '../local-date-key';

/**
 * 이 함수의 존재 이유는 "서버는 요청자의 타임존을 모른다"는 것 하나다.
 * 그래서 테스트도 **같은 시각이 타임존에 따라 다른 날로 접힌다**는 것을 증명하는 데
 * 집중한다. 그게 깨지면 자정을 넘긴 훈련의 칸이 하루 밀린다.
 */
describe('localDateKey', () => {
  describe('로컬 자정 경계', () => {
    it('서울에서 자정을 넘긴 시각은 다음 날로 접힌다', () => {
      // 15:30Z = 서울 다음 날 00:30
      expect(localDateKey('2026-09-16T15:30:00Z', 'Asia/Seoul')).toBe(
        '2026-09-17',
      );
    });

    it('서울에서 자정 직전 시각은 같은 날로 남는다', () => {
      // 14:50Z = 서울 23:50 — spec 경계의 "23:50에 입력한 훈련"
      expect(localDateKey('2026-09-16T14:50:00Z', 'Asia/Seoul')).toBe(
        '2026-09-16',
      );
    });
  });

  it('같은 시각이라도 타임존이 다르면 다른 날이 된다', () => {
    const instant = '2026-09-16T15:30:00Z';
    expect(localDateKey(instant, 'Asia/Seoul')).toBe('2026-09-17');
    expect(localDateKey(instant, 'UTC')).toBe('2026-09-16');
  });

  it('UTC 를 기준으로 접으면 안 된다는 것을 고정한다', () => {
    // toISOString().slice(0,10) 으로 구현하면 이 케이스가 깨진다.
    const instant = '2026-09-16T15:30:00Z';
    expect(localDateKey(instant, 'Asia/Seoul')).not.toBe(
      instant.slice(0, 10),
    );
  });

  it('음수 오프셋 타임존에서는 전날로 접힌다', () => {
    // 2026-09-16T02:00Z = 뉴욕 2026-09-15 22:00 (EDT, UTC-4)
    expect(localDateKey('2026-09-16T02:00:00Z', 'America/New_York')).toBe(
      '2026-09-15',
    );
  });

  it('YYYY-MM-DD 형식을 지킨다 — 한 자리 월·일도 0 으로 채운다', () => {
    expect(localDateKey('2026-01-05T03:00:00Z', 'Asia/Seoul')).toBe(
      '2026-01-05',
    );
  });
});

/**
 * 그리드가 "오늘"을 다시 계산할지 정하는 판정. 하루가 지났는데 같은 날이라고
 * 답하면 어제 칸에 오늘 표시가 남는다.
 */
describe('isSameLocalDay', () => {
  const SEOUL = 'Asia/Seoul';
  const noon = Date.parse('2026-09-17T03:00:00Z'); // 서울 12:00

  it('같은 날의 다른 시각은 같은 날이다', () => {
    expect(isSameLocalDay(noon, noon + 6 * 3_600_000, SEOUL)).toBe(true);
  });

  it('로컬 자정을 넘기면 다른 날이다', () => {
    // 서울 12:00 → 다음 날 00:30
    const afterMidnight = Date.parse('2026-09-17T15:30:00Z');
    expect(isSameLocalDay(noon, afterMidnight, SEOUL)).toBe(false);
  });

  it('판정 기준은 UTC 가 아니라 주어진 타임존이다', () => {
    // 두 시각은 UTC 로는 같은 날(09-17)이지만 서울로는 17일과 18일이다
    const a = Date.parse('2026-09-17T03:00:00Z');
    const b = Date.parse('2026-09-17T16:00:00Z');
    expect(isSameLocalDay(a, b, 'UTC')).toBe(true);
    expect(isSameLocalDay(a, b, SEOUL)).toBe(false);
  });
});
