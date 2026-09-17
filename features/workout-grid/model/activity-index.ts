/**
 * 프로그램 기록을 **날짜별로 접은** 인덱스. 순수 함수 — I/O 도 React 도 없다.
 *
 * 읽는 필드는 `created_at`·`title`·`lines` 셋뿐이다. `updated_at` 은 쓰지 않는다 —
 * FR-002 가 판정 기준을 **생성 시각**으로 못 박았고, 프로그램을 나중에 고쳤다고
 * 칸이 다른 날로 옮겨가면 안 되기 때문이다. 타입을 `ProgramRow` 전체가 아니라
 * `Pick` 으로 좁혀둔 것이 그 규칙을 컴파일러 쪽에 남기는 장치다.
 *
 * 26주보다 오래된 기록도 그대로 들어온다. 여기서 미리 자르지 않는 이유는,
 * 자르는 기준이 곧 창 계산과 같은 일의 중복이기 때문이다(data-model.md).
 */

import type { ProgramRow } from '@/features/programs/api/programs';

import { localDateKey } from './local-date-key';
import type { DayActivity, DayProgram } from './types';

/** 이 기능이 프로그램에서 읽는 전부. */
export type ProgramActivitySource = Pick<
  ProgramRow,
  'created_at' | 'title' | 'lines'
>;

/**
 * 상세에 펼칠 형태로 다듬는다.
 *
 * 제목은 대부분 `null` 이다(`saveTextProgram` 의 `title` 이 optional 이다).
 * 그래서 첫 줄만 이름으로 남기는 방식은 쓰지 않는다 — 그 줄이 'Day 1' 같은
 * 머리글이면 "그날 뭘 했나"에 답하지 못한다. 줄 전체를 들고 가고, 무엇을
 * 보여줄지는 UI 가 정한다(FR-008).
 *
 * `null` 을 UI 까지 밀지 않는다: `lines` 가 없으면 빈 배열, 빈 제목은 `null` 이다.
 */
function toDayProgram(program: ProgramActivitySource): DayProgram {
  return {
    title: program.title?.trim() || null,
    lines: program.lines?.map((line) => line.trim()).filter(Boolean) ?? [],
  };
}

/**
 * @param programs 사용자의 프로그램 기록. 순서는 상관없다
 * @param timeZone IANA 타임존 이름 — 날짜 경계를 정한다 (FR-002)
 * @returns `YYYY-MM-DD` → 그날 요약. 같은 날 여러 건은 한 항목으로 접힌다 (FR-001)
 */
export function buildActivityIndex(
  programs: readonly ProgramActivitySource[],
  timeZone: string,
): ReadonlyMap<string, DayActivity> {
  // programs 의 순서를 정의대로 보장하려면 접기 전에 생성 시각으로 정렬해야 한다.
  // 입력 배열을 건드리지 않는다.
  const sorted = [...programs].sort((a, b) =>
    a.created_at < b.created_at ? -1 : a.created_at > b.created_at ? 1 : 0,
  );

  const index = new Map<string, DayActivity>();

  for (const program of sorted) {
    const dateKey = localDateKey(program.created_at, timeZone);
    const previous = index.get(dateKey);

    index.set(dateKey, {
      dateKey,
      count: (previous?.count ?? 0) + 1,
      programs: [...(previous?.programs ?? []), toDayProgram(program)],
    });
  }

  return index;
}
