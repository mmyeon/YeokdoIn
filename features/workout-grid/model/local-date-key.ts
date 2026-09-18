/**
 * ISO 시각을 **사용자 로컬 달력의 날짜**로 접는 순수 함수.
 *
 * 그리드의 한 칸은 시각이 아니라 날짜다. "며칠에 훈련했나"는 그 사람이 사는
 * 달력의 개념이므로, 판정 기준도 사용자 로컬 자정이어야 한다. 서버는 요청자의
 * 타임존을 모르므로(`pr-date-bounds.ts` 가 같은 벽에 부딪혔다) 이 판정은
 * 클라이언트가 하고, 타임존은 전역 참조가 아니라 **인자로 주입받는다**.
 * 그래야 테스트가 프로세스 `TZ` 에 의존하지 않고 여러 타임존을 한 파일에서 검증한다.
 *
 * `toISOString().slice(0, 10)` 은 쓸 수 없다 — 항상 UTC 로 자르기 때문이다.
 * 한국에서 23:50 에 입력한 훈련은 UTC 로 아직 같은 날이지만, 00:30 에 입력한
 * 훈련은 UTC 로 전날이라 칸이 하루 밀린다.
 *
 * `en-CA` 로케일을 쓰는 이유는 이 로케일이 `YYYY-MM-DD` 를 그대로 내주기
 * 때문이다. `formatToParts` 로 조립할 필요가 없다.
 */

/**
 * @param isoInstant ISO 시각 (예: `programs.created_at`)
 * @param timeZone IANA 타임존 이름 (예: `'Asia/Seoul'`)
 * @returns `YYYY-MM-DD` — 주어진 타임존 달력 기준의 날짜
 */
export function localDateKey(isoInstant: string, timeZone: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(isoInstant));
}

/**
 * 두 시각이 **같은 날**에 속하는지. 그리드의 "오늘"이 언제 갱신돼야 하는지를
 * 정하는 판정이다 — 시각이 흘렀다고 다시 그릴 일이 아니라, 날이 바뀌어야
 * 다시 그린다.
 *
 * @param aMs 비교할 시각 (epoch ms)
 * @param bMs 비교할 시각 (epoch ms)
 * @param timeZone IANA 타임존 이름
 */
export function isSameLocalDay(
  aMs: number,
  bMs: number,
  timeZone: string,
): boolean {
  return (
    localDateKey(new Date(aMs).toISOString(), timeZone) ===
    localDateKey(new Date(bMs).toISOString(), timeZone)
  );
}
