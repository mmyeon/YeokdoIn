/**
 * 월 라벨을 **어느 열에 달지** 정하는 순수 함수.
 *
 * 열마다 달면 375px 에서 글자가 겹친다(한 열이 ~10px 인데 '9월'은 그보다 넓다).
 * 그래서 월이 바뀌는 열에만 단다. 첫 열에는 월이 바뀌지 않아도 다는데,
 * 기준점이 없으면 뒤에 붙은 라벨이 어느 구간을 가리키는지 읽을 수 없기 때문이다.
 */

import type { WeekColumn } from './types';

export interface MonthLabel {
  /** 라벨이 붙는 열 번호 */
  weekIndex: number;
  /** 한국어 표기 (CLAUDE.md UI 문구 규약) */
  label: string;
}

/** 열을 대표하는 달 = 그 열의 월요일이 속한 달. */
function columnMonth(week: WeekColumn): string | null {
  return week[0]?.dateKey.slice(0, 7) ?? null;
}

export function buildMonthLabels(
  weeks: readonly WeekColumn[],
): readonly MonthLabel[] {
  const labels: MonthLabel[] = [];
  let previous: string | null = null;

  for (const [weekIndex, week] of weeks.entries()) {
    const month = columnMonth(week);
    if (month === null || month === previous) continue;

    labels.push({ weekIndex, label: `${Number(month.slice(5, 7))}월` });
    previous = month;
  }

  return labels;
}
