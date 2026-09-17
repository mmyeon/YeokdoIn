/**
 * 오늘로부터 거슬러 26주치 셀 배열을 만든다. 순수 함수 — `Date.now()` 도
 * 암묵적 로컬 타임존 참조도 없다. `nowMs` 와 `timeZone` 을 모두 주입받는다
 * (`pr-date-bounds.ts` 와 같은 방식). 그래야 테스트가 실행 환경에 안 걸린다.
 *
 * **열은 주, 행은 요일이고 첫 행은 월요일이다**(research R3). 마지막 열이 이번
 * 주이므로 최신 주가 오른쪽 끝에 온다(FR-005).
 *
 * 창의 범위는 `[오늘 − 25주, 오늘]` 이다. 이 정의라야 열 수가 요일과 무관하게
 * 항상 26으로 고정되고, 창의 시작이 첫 열 안에 떨어져 spec 경계의 「잘린 주」가
 * 성립한다. 첫 열에서 창 시작 이전 자리는 셀을 그리지 않고(`null`), 마지막 열의
 * 오늘 이후 자리는 `null` 이 아니라 `'future'` 다 — 아직 판정할 수 없는 날을
 * 실패(꺼짐)로 보이게 하지 않는다(FR-004, spec 경계).
 *
 * 날짜 산술은 `YYYY-MM-DD` 를 UTC 자정으로 올려 ±1일씩 옮기는 방식이다.
 * 이미 로컬 달력으로 접힌 키를 다루므로 이 공간에는 DST 도 오프셋도 없다.
 */

import { localDateKey } from './local-date-key';
import type { CellState, DayActivity, DayCell, WeekColumn } from './types';

/** 표시하는 주 수. 바꾸려면 명세 변경이 선행이다 (spec 결정 기록). */
export const WEEKS = 26;

const DAYS_PER_WEEK = 7;
const DAY_MS = 86_400_000;

function toUtcMs(dateKey: string): number {
  return Date.parse(`${dateKey}T00:00:00Z`);
}

function toDateKey(utcMs: number): string {
  return new Date(utcMs).toISOString().slice(0, 10);
}

/** 월요일을 0 으로 두는 요일 번호. 열 안의 행 번호와 같다. */
function mondayBasedWeekday(dateKey: string): number {
  return (new Date(toUtcMs(dateKey)).getUTCDay() + 6) % DAYS_PER_WEEK;
}

/**
 * @param nowMs 현재 시각 (epoch ms). 호출자가 주입한다
 * @param timeZone IANA 타임존 이름 — 날짜 경계를 정한다
 * @param index `buildActivityIndex` 의 결과
 * @returns 길이 26의 열 배열. 마지막 원소가 이번 주다
 */
export function buildGridWindow(
  nowMs: number,
  timeZone: string,
  index: ReadonlyMap<string, DayActivity>,
): readonly WeekColumn[] {
  const todayKey = localDateKey(new Date(nowMs).toISOString(), timeZone);
  const todayMs = toUtcMs(todayKey);

  const windowStartMs = todayMs - (WEEKS - 1) * DAYS_PER_WEEK * DAY_MS;
  const firstMondayMs =
    todayMs -
    (mondayBasedWeekday(todayKey) + (WEEKS - 1) * DAYS_PER_WEEK) * DAY_MS;

  const columns: WeekColumn[] = [];

  for (let week = 0; week < WEEKS; week += 1) {
    const column: (DayCell | null)[] = [];

    for (let row = 0; row < DAYS_PER_WEEK; row += 1) {
      const dayMs = firstMondayMs + (week * DAYS_PER_WEEK + row) * DAY_MS;

      // 판정 순서는 data-model.md 그대로다. 순서를 바꾸면 이번 주 미래 요일이
      // 꺼짐으로 떨어지거나 창 밖 자리가 칸으로 그려진다.
      if (dayMs < windowStartMs) {
        column.push(null);
        continue;
      }

      const dateKey = toDateKey(dayMs);
      const state: CellState =
        dayMs > todayMs
          ? 'future'
          : index.has(dateKey)
            ? 'active'
            : 'inactive';

      column.push({ dateKey, state, isToday: dateKey === todayKey });
    }

    columns.push(column);
  }

  return columns;
}
