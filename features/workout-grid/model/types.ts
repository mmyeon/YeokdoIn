/**
 * 그리드 model 레이어가 만들어내는 값의 형태. DB 스키마 변경은 없다.
 */

/**
 * 한 칸의 상태. FR-004 — 농도 같은 중간 단계는 없다.
 *
 * `boolean` 두 개(`isActive`, `isFuture`)로 두지 않는 이유: `true/true` 같은
 * 불가능한 조합이 타입에 남는다. 문자열 리터럴 유니온이라야 UI 의 분기 누락을
 * 컴파일러가 잡는다.
 */
export type CellState = 'active' | 'inactive' | 'future';

/** 창 안의 하루. 창 밖 요일 자리는 셀 자체가 없다(`null`). */
export interface DayCell {
  /** `YYYY-MM-DD`, 사용자 로컬 달력 기준 */
  dateKey: string;
  state: CellState;
  /** FR-007. 상태와 독립이다 — 오늘도 `'inactive'` 일 수 있다 */
  isToday: boolean;
}

/** 한 열 = 한 주. 길이는 항상 7, 창 밖 자리는 `null` (spec 경계: 잘린 주). */
export type WeekColumn = ReadonlyArray<DayCell | null>;

/** 그날 입력한 프로그램 하나. 선택한 날 상세에 그대로 펼친다 (FR-008). */
export interface DayProgram {
  /** 대부분 `null` — 화이트보드 입력은 제목 없이 저장된다 */
  title: string | null;
  /** 빈 줄이 제거되고 앞뒤 공백이 다듬어진 상태. 없으면 빈 배열이다 */
  lines: readonly string[];
}

/** 한 날의 활동 요약. FR-001 — 하루 여러 건이어도 칸은 하나다. */
export interface DayActivity {
  dateKey: string;
  /** 그날 기록 건수 */
  count: number;
  /** 생성 시각 오름차순 */
  programs: readonly DayProgram[];
}
