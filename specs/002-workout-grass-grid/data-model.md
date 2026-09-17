# Phase 1: Data Model & Interfaces — 운동 잔디 그리드

DB 스키마 변경이 없다. 여기 적는 것은 **model 레이어가 만들어내는 값의 형태**와 그 경계다.
`contracts/` 를 따로 두지 않는 이유는 plan.md 의 Project Structure 참조.

## 입력

`ProgramRow[]` (`features/programs/api/programs.ts`). 이 기능이 읽는 필드는 둘뿐이다.

| 필드 | 타입 | 쓰임 |
|---|---|---|
| `created_at` | `string` (ISO timestamptz) | 활동일 판정의 유일한 소스 (FR-002) |
| `title`, `lines` | `string \| null`, `string[] \| null` | 선택한 날 요약 문구 (FR-008) |

`updated_at` 은 쓰지 않는다 — FR-002 가 **생성 시각**을 기준으로 못 박았다. 프로그램을 나중에
고쳤다고 칸이 다른 날로 옮겨가면 안 된다.

## 타입

```ts
/** 한 칸의 상태. FR-004 — 중간 단계는 없다. */
type CellState = 'active' | 'inactive' | 'future';

/** 창 안의 하루. 창 밖 요일 자리는 셀 자체가 없다(`null`). */
interface DayCell {
  dateKey: string;      // 'YYYY-MM-DD', 사용자 로컬 달력 기준
  state: CellState;
  isToday: boolean;     // FR-007
}

/** 한 열 = 한 주. 길이는 항상 7, 창 밖 자리는 null (spec 경계: 잘린 주). */
type WeekColumn = ReadonlyArray<DayCell | null>;

/** 한 날의 활동 요약. FR-001 — 하루 여러 건이어도 칸은 하나. */
interface DayActivity {
  dateKey: string;
  count: number;             // 그날 기록 건수
  titles: readonly string[]; // 표시용, 생성 시각 오름차순
}
```

`CellState` 를 문자열 리터럴 유니온으로 두는 이유: UI 의 분기 누락을 컴파일러가 잡는다.
`boolean` 두 개(`isActive`, `isFuture`)로 두면 `true/true` 같은 불가능한 조합이 타입에 남는다.

## 함수 (model 레이어의 전부)

세 함수 모두 순수하다. I/O 없음, React 없음, 전역 `Date.now()`·로컬 타임존 암묵 참조 없음.

```ts
// local-date-key.ts
function localDateKey(isoInstant: string, timeZone: string): string;
```
ISO 시각을 주어진 타임존의 달력 날짜로 접는다. 근거와 실측은 research R2.

```ts
// activity-index.ts
function buildActivityIndex(
  programs: readonly ProgramRow[],
  timeZone: string,
): ReadonlyMap<string, DayActivity>;
```
날짜별로 접는다. 같은 날 여러 건은 한 항목으로 합쳐지고 `count` 만 늘어난다 (FR-001).

```ts
// grid-window.ts
const WEEKS = 26;

function buildGridWindow(
  nowMs: number,
  timeZone: string,
  index: ReadonlyMap<string, DayActivity>,
): readonly WeekColumn[];
```
`nowMs` 를 주입받는다 (`pr-date-bounds.ts` 와 같은 방식). 반환 배열의 길이는 항상 26이며
**마지막 원소가 이번 주**다 (FR-005 — 최신 주가 오른쪽 끝).

## 판정 규칙

한 자리의 상태는 이 순서로 정해진다.

1. 26주 창 밖 → **셀 없음** (`null`). 첫 열의 이번 주 이전 요일이 여기 해당한다.
2. `dateKey > 오늘` → `'future'`. 이번 주 남은 요일이다. **꺼짐이 아니다** (spec 경계).
3. `index.has(dateKey)` → `'active'`.
4. 그 외 → `'inactive'`.

`isToday` 는 `dateKey === localDateKey(now, timeZone)` 이며 상태와 독립이다 — 오늘은
`'active'` 일 수도 `'inactive'` 일 수도 있다.

## 경계 밖

- 그리드는 **쓰기 경로가 없다**. 훈련을 기록·수정하지 않는다.
- 26주 이전 기록은 `buildActivityIndex` 에는 들어오지만 창에 걸리지 않아 그려지지 않는다.
  인덱스에서 미리 잘라내지 않는 이유는, 자르는 기준이 곧 창 계산과 같은 일의 중복이기 때문이다.
