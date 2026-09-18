/**
 * 프로그램 기록을 **날짜별로 접은** 인덱스. 순수 함수 — I/O 도 React 도 없다.
 *
 * 읽는 필드는 `id`·`created_at`·`title`·`lines` 넷뿐이다. `updated_at` 은 쓰지 않는다 —
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
  'id' | 'created_at' | 'title' | 'lines'
>;

/**
 * 요약 한 줄로 접는다.
 *
 * 본문을 들고 오지 않는다 — 홈은 글랜스 화면이라 기록 본문을 펼치면 하루 3건에
 * 상세가 그리드보다 길어진다(spec 결정 기록). 본문은 기록 상세 화면에 이미
 * 온전히 있으므로 `id` 로 링크만 건다.
 *
 * `label` 의 소스는 `title`, 없으면 `lines` 의 첫 비어있지 않은 줄이다. 제목은
 * 대부분 `null` 이라(`saveTextProgram` 의 `title` 이 optional) 제목만 믿으면
 * 요약이 건수로 뭉개진다.
 */
function toDayProgram(program: ProgramActivitySource): DayProgram {
  const title = program.title?.trim();
  const firstLine = program.lines?.map((line) => line.trim()).find(Boolean);

  return { id: program.id, label: title || firstLine || null };
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
