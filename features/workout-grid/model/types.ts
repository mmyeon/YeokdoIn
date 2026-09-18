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

/** 그리드 한 칸 = 하루. 창이 주 단위로 떨어져서 빈 자리는 없다. */
export interface DayCell {
  /** `YYYY-MM-DD`, 사용자 로컬 달력 기준 */
  dateKey: string;
  state: CellState;
  /** FR-007. 상태와 독립이다 — 오늘도 `'inactive'` 일 수 있다 */
  isToday: boolean;
}

/** 한 열 = 한 주. 길이는 항상 7이고 모든 자리가 실제 날이다. */
export type WeekColumn = readonly DayCell[];

/** 그날 입력한 프로그램 하나. 요약 한 줄과 상세로 가는 길이 전부다 (FR-008). */
export interface DayProgram {
  /** 기록 상세 화면으로 가는 링크에 쓴다 */
  id: number;
  /**
   * 요약 한 줄. `title` → `lines` 첫 줄 순으로 고른다.
   * 둘 다 없으면 `null` — 빈 문자열로 덮으면 "이름이 없다"와 "이름이 빈칸이다"가
   * 구별되지 않는다.
   */
  label: string | null;
}

/** 한 날의 활동 요약. FR-001 — 하루 여러 건이어도 칸은 하나다. */
export interface DayActivity {
  dateKey: string;
  /** 그날 기록 건수 */
  count: number;
  /** 생성 시각 오름차순 */
  programs: readonly DayProgram[];
}
