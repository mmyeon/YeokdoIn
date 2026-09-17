# Tasks: 운동 잔디 그리드

**Input**: `/specs/002-workout-grass-grid/` 의 plan.md · research.md · data-model.md · quickstart.md

**Tests**: **필수**다. 헌법 V(TDD)가 선택지를 남기지 않았고, 이 기능은 로직이 전부 순수 함수라
Red-Green-Refactor 가 그대로 성립한다.

## 이 기능의 성격 (읽고 시작할 것)

**DB 를 건드리지 않는다.** 마이그레이션 0개, `generate-types` 재실행 없음, `db push` 없음.
**신규 쿼리도 없다** — 홈이 이미 부르는 `usePrograms()` 의 결과를 그대로 쓴다(research R1).

그래서 이 기능의 위험은 데이터가 아니라 **날짜 계산과 폭**에 있다. 작업 순서도 거기에 맞춰
순수 함수 → 렌더 → 표현 순이다.

spec.md 에 번호 붙은 user story 절이 없다(100줄 상한 규약). 아래 US1~US4 는 FR 을 **독립적으로
배포 가능한 단위**로 자른 것이며, 각 Phase 제목에 커버하는 FR 번호를 달았다.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 서로 다른 파일 → 병렬 가능
- **[US#]**: user story phase 전용 라벨. Setup·Foundational·Polish 에는 붙지 않는다

## Path Conventions

- model(순수 로직): `features/workout-grid/model/`
- UI: `features/workout-grid/ui/`
- 테스트: `features/workout-grid/model/__tests__/` (jest `testMatch` 가 이미 잡는 경로)

---

## Phase 1: Setup

- [x] T001 `git checkout -b 002-workout-grass-grid` 로 브랜치를 판다 (현재 워크트리는 `mmyeon/exercise-routine` 이며, Branch Scope Rule 상 이 이슈 전용 브랜치가 필요하다)
- [x] T002 [P] `features/workout-grid/model/` 과 `features/workout-grid/ui/` 디렉토리를 만든다
- [x] T003 [P] `jest.config.js` 의 `collectCoverageFrom` 에 `'features/workout-grid/model/**/*.ts'` 와 제외 패턴 `'!features/workout-grid/model/**/__tests__/**'` 를 추가한다

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 날짜 판정의 기반. US1~US4 전부가 여기에 의존한다.

**⚠️ CRITICAL**: 이 Phase 가 끝나기 전에는 어떤 user story 도 시작할 수 없다.

- [x] T004 `features/workout-grid/model/__tests__/local-date-key.test.ts` 를 먼저 작성하고 **실패를 확인한다**. 케이스: `Asia/Seoul` 에서 `2026-09-16T15:30:00Z` → `'2026-09-17'`, `2026-09-16T14:50:00Z` → `'2026-09-16'`, 같은 입력을 `'UTC'` 로 넣으면 결과가 갈린다 (research R2 표)
- [x] T005 `features/workout-grid/model/local-date-key.ts` 에 `localDateKey(isoInstant: string, timeZone: string): string` 를 구현한다. `Intl.DateTimeFormat('en-CA', { timeZone, year:'numeric', month:'2-digit', day:'2-digit' })` 를 쓰고, `toISOString().slice(0,10)` 은 **항상 UTC 라서 쓸 수 없다**는 이유를 파일 상단 주석에 남긴다 (`pr-date-bounds.ts` 와 같은 서술 형식)
- [x] T006 `features/workout-grid/model/types.ts` 에 `CellState`·`DayCell`·`WeekColumn`·`DayActivity` 를 data-model.md 정의 그대로 선언한다. `CellState` 는 문자열 리터럴 유니온이어야 한다 — UI 분기 누락을 컴파일러가 잡는 장치다

**Checkpoint**: 타임존 판정이 테스트로 고정됐다. user story 진입 가능.

---

## Phase 3: User Story 1 — 26주 그리드가 홈에 보인다 (Priority: P1) 🎯 MVP

**Covers**: FR-001 ~ FR-006

**Goal**: 홈 최상단에서 최근 26주의 훈련한 날/쉰 날을 가로 스크롤 없이 한눈에 본다.

**Independent Test**: 로그인 후 홈 진입 → 26열 그리드가 보이고, 프로그램을 입력한 날짜의 칸이
켜져 있다. 375px 에서 좌우로 밀리지 않는다.

### Tests for User Story 1 ⚠️ 먼저 작성하고 실패를 확인할 것

- [x] T007 [P] [US1] `features/workout-grid/model/__tests__/activity-index.test.ts` — 같은 날 3건 → 항목 1개이고 `count === 3` (FR-001), 서로 다른 날은 서로 다른 항목, 빈 배열 → 빈 Map
- [x] T008 [P] [US1] `features/workout-grid/model/__tests__/grid-window.test.ts` — 반환 길이가 항상 26이고 **마지막 원소가 이번 주**(FR-005), 각 열의 길이가 7이고 첫 행이 월요일(research R3), 이번 주 미래 요일이 `'future'` 이며 `'inactive'` 가 아님, 첫 열의 창 밖 자리가 `null`, 26주보다 오래된 기록은 어떤 칸도 켜지 않음, `isToday` 가 정확히 한 칸에만 참
- [x] T009 [US1] `grid-window.test.ts` 에 **100건 대조** 케이스를 추가한다 (quickstart 게이트 2). 시드 고정 난수로 시각 100건을 만들고, 켜진 칸의 `dateKey` 집합을 `buildGridWindow` 를 쓰지 않은 독립 계산과 비교한다. 로컬 자정 직전·직후 시각을 표본에 반드시 포함한다

### Implementation for User Story 1

- [x] T010 [P] [US1] `features/workout-grid/model/activity-index.ts` 에 `buildActivityIndex(programs, timeZone): ReadonlyMap<string, DayActivity>` 를 구현한다. `created_at` 만 읽는다 — `updated_at` 을 쓰면 프로그램 수정 시 칸이 다른 날로 옮겨간다(FR-002). `titles` 는 생성 시각 오름차순
- [x] T011 [US1] `features/workout-grid/model/grid-window.ts` 에 `WEEKS = 26` 과 `buildGridWindow(nowMs, timeZone, index): readonly WeekColumn[]` 를 구현한다. `nowMs` 를 주입받는다(`pr-date-bounds.ts` 방식). 창의 끝은 **오늘이 속한 주의 월요일**이고 거기서 25주를 되짚는다. 상태 판정은 data-model.md 의 4단계 순서 그대로: 창 밖 → `null`, 오늘 이후 → `'future'`, 인덱스에 있음 → `'active'`, 그 외 → `'inactive'`
- [x] T012 [US1] `features/workout-grid/ui/GridCell.tsx` 를 만든다. `<button type="button">` 이며 `CellState` 별 스타일만 분기한다. **계산하지 않는다**
- [x] T013 [US1] `features/workout-grid/ui/WorkoutGrid.tsx` 를 만든다. `usePrograms()` 를 부르고 `useMemo` 한 번으로 `buildActivityIndex` → `buildGridWindow` 를 돌린다. 타임존은 `Intl.DateTimeFormat().resolvedOptions().timeZone` 로 얻어 주입한다. 그리드는 `repeat(26, minmax(0,1fr))` + `gap: 2px` + 셀 `aspect-square` — 폭이 컨테이너에서 나와야 가로 스크롤이 **구조적으로** 불가능하다(research R4)
- [x] T014 [US1] `app/page.tsx` 의 `HomeHeader` 바로 아래, `IdleHero` 위에 `<WorkoutGrid />` 를 배치한다 (FR: 홈 최상단)
- [ ] T015 [US1] 375px 에서 `scrollWidth === clientWidth` 를 개발자도구로 확인한다 (quickstart 게이트 3)

**Checkpoint**: 그리드가 실제 데이터로 켜지고 꺼진다. 여기까지가 MVP 다.

---

## Phase 4: User Story 2 — 그리드를 읽을 수 있다 (Priority: P2)

**Covers**: FR-007, FR-010

**Goal**: 어느 칸이 언제인지 알 수 있고, 색을 못 봐도 켜짐/꺼짐이 구별된다.

**Independent Test**: 흑백(Achromatopsia) 에뮬레이션에서 켜짐·꺼짐·미래가 서로 구별되고,
월 경계와 요일을 라벨로 짚을 수 있다.

- [x] T016 [P] [US2] `features/workout-grid/model/axis-labels.ts` 에 월 경계 라벨 위치를 계산하는 순수 함수를 만들고, `__tests__/axis-labels.test.ts` 를 먼저 작성해 실패를 확인한다. 열마다 라벨을 달면 375px 에서 겹치므로 **월이 바뀌는 열에만** 단다
- [x] T017 [US2] `WorkoutGrid.tsx` 에 요일 라벨 열(약 14px)과 월 라벨 행을 추가한다 (FR-007). 라벨 열을 추가해도 T013 의 `1fr` 구조 덕에 스크롤이 생기지 않아야 한다 — 추가 후 게이트 3 을 다시 확인한다
- [x] T018 [US2] `GridCell.tsx` 에서 오늘 칸을 테두리로 구별한다 (FR-007). 색만 바꾸지 않는다
- [x] T019 [US2] `GridCell.tsx` 의 켜짐/꺼짐을 **채움 vs 테두리만**으로 구분하도록 확정한다 (FR-010). 색상 차이가 사라져도 명도 대비로 남아야 한다
- [x] T020 [US2] `GridCell.tsx` 의 `<button>` 에 `aria-label` 로 날짜와 활동 여부를 **한국어 문장**으로 싣는다 (FR-010, CLAUDE.md UI 문구 규약). 창 밖 `null` 자리는 버튼이 아니라 빈 칸으로 렌더한다
- [ ] T021 [US2] quickstart 게이트 4 를 라이트·다크 테마 양쪽에서 수행한다

**Checkpoint**: 그리드가 색 없이도 읽힌다.

---

## Phase 5: User Story 3 — 빈 상태와 오류 상태 (Priority: P2)

**Covers**: FR-009

**Goal**: 기록이 0건인 사용자가 무엇을 해야 칸이 켜지는지 알고, 조회가 실패했을 때 그 사실을 안다.

**Independent Test**: 기록 0건 계정에서 안내가 보이고, 네트워크를 끊으면 빈 그리드가 아니라
오류 + 재시도가 보인다.

- [x] T022 [US3] `WorkoutGrid.tsx` 에서 `usePrograms()` 의 `isLoading` 분기를 추가한다. 홈의 기존 `HomeSkeleton` 톤과 맞춘다
- [x] T023 [US3] 기록 0건일 때 빈 그리드와 함께 **칸을 켜는 방법**(프로그램 입력하러 가기)을 안내한다 (FR-009). 오류처럼 보이면 안 된다
- [x] T024 [US3] `isError` 일 때 오류 안내와 `refetch()` 재시도 버튼을 렌더한다 (FR-009). **빈 그리드로 위장하지 않는다** — 이 분기가 빈 상태와 같은 화면을 그리면 안 된다
- [ ] T025 [US3] quickstart 게이트 5 를 수행한다. 문구가 전부 한국어인지 함께 확인한다

**Checkpoint**: 세 상태(로딩·빈·오류)가 서로 구별된다.

---

## Phase 6: User Story 4 — 칸을 선택해 그날을 본다 (Priority: P3)

**Covers**: FR-008

**Goal**: 칸을 눌러 그날 날짜와 무엇을 입력했는지 확인한다. 홈의 다른 조작은 막히지 않는다.

**Independent Test**: 켜진 칸을 누르면 날짜와 프로그램 요약이, 꺼진 칸을 누르면 날짜와 활동
없음이 나온다. 그 상태에서 홈을 스크롤하고 다른 버튼을 누를 수 있다.

- [x] T026 [US4] `features/workout-grid/ui/GridDayDetail.tsx` 를 만든다. 그리드 바깥 **고정 자리**에 렌더한다. Dialog·Popover 를 쓰지 않는다 — 이유는 research R5 (FR-008 의 "다른 조작을 막지 않는다", 신규 의존성 0)
- [x] T027 [US4] `WorkoutGrid.tsx` 에 선택 상태(`selectedDateKey`)를 두고 `GridCell` 의 클릭과 연결한다. 선택 전 기본값은 **오늘**이다 — 자리를 비워두면 선택할 때마다 레이아웃이 튄다(R5)
- [x] T028 [US4] 활동이 없는 날도 날짜와 활동 없음을 안내한다 (FR-008). 빈 문자열이나 미표시로 처리하지 않는다
- [ ] T029 [US4] 상세 표시 중에도 홈 세로 스크롤과 하단 탭 조작이 되는지 확인한다 (FR-008)

**Checkpoint**: 네 user story 전부 동작한다.

---

## Phase 7: Polish & Cross-Cutting

- [x] T030 [P] 그리드가 읽기 전용임을 `WorkoutGrid.tsx` 상단 주석으로 못 박는다. 나중에 여기서 훈련을 기록하려는 시도를 막는 장치다 (spec: "그리드는 읽기 전용이다")
- [x] T031 quickstart 게이트 6 을 실행한다: `npx tsc --noEmit`, `npx jest`, `npm run build` — 셋 다 통과해야 커밋한다 (헌법 Quality Standards)
- [x] T032 ~~실기기에서 칸 터치를 확인한다~~ — **구현 전 스파이크로 완료 (2026-09-17)**. 26열에서 20회 중 13회 적중(65%), 26주 유지로 판정. 실측과 판정 근거는 plan.md 「스파이크 실측」 참조
- [x] T034 ~~`app/spike-grass-grid/` 삭제~~ — **완료 (2026-09-17)**. 커밋된 적 없는 미추적 파일이라 히스토리에 남지 않았다
- [x] T033 plan.md 의 「남은 판단 사항」 1번(상세 패널 위치)에 실측 결과를 적어 닫는다

---

## Phase 8: 상세 요약 축소 (dogfooding 후속, 2026-09-17)

**Covers**: FR-008 (개정)

**왜**: 구현 후 실사용에서 하루 3건인 날의 상세가 그리드보다 길어져 PR 보드와 라이브러리가
화면 밖으로 밀렸다. 홈은 글랜스 화면이고 이 기능의 질문은 "꾸준했나"지 "그날 뭘 했나"가
아니다. 본문은 기록 상세 화면에 이미 온전히 있다 — 근거와 재검토 트리거는 spec 결정 기록.

**하지 않기로 한 것**: 내부 스크롤(세로 스크롤 화면 안의 세로 스크롤은 제스처가 충돌한다 —
spec 이 가로 스크롤을 같은 이유로 기각했다), 접기/펼치기 토글(상세로 넘어가면 필요 없다).

- [ ] T035 `activity-index.test.ts` 를 먼저 고쳐 실패를 확인한다. `DayProgram` 이 `{ id, label }`
      이고 `label` 은 `title` → `lines` 첫 줄 순, 둘 다 없으면 `null` 이다
- [ ] T036 `types.ts` 의 `DayProgram` 을 `{ id: number; label: string | null }` 로 바꾸고,
      `activity-index.ts` 의 `ProgramActivitySource` 에 `id` 를 더한다
- [ ] T037 `GridDayDetail.tsx` 를 링크 목록으로 바꾼다. 한 건당 한 줄(`truncate`), 각 줄은
      `ROUTES.TRAINING.PROGRAM_DETAIL(id)` 로 간다. `label` 이 `null` 인 줄도 링크는 살린다 —
      이름을 못 찾은 것이지 기록이 없는 게 아니다
- [ ] T038 게이트 6 을 다시 실행한다. **dev 서버를 내리고 빌드한다** — 켜둔 채 `npm run build`
      하면 `.next` 가 덮여 CSS·JS 가 404 난다

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup)
   └→ Phase 2 (Foundational) ← 모든 story 의 차단 선행
         ├→ Phase 3 (US1, P1) ← MVP
         │     ├→ Phase 4 (US2, P2)
         │     ├→ Phase 5 (US3, P2)
         │     └→ Phase 6 (US4, P3)
         └→ Phase 7 (Polish)
```

### User Story Dependencies

- **US1** 은 US2~US4 의 선행이다. 셋 다 `WorkoutGrid.tsx` 를 수정하는데 그 파일이 US1 에서 태어난다.
- **US2·US3·US4 는 서로 독립**이다. 논리적 의존이 없어 어느 순서로 붙여도 되고, 하나만 빼고
  배포해도 앱이 성립한다.

### 파일 충돌 주의

`features/workout-grid/ui/WorkoutGrid.tsx` 를 US1·US2·US3·US4 가 전부 건드린다.
US2~US4 를 **동시에 진행하지 말 것** — 병렬로 보이지만 같은 파일이라 충돌한다.
`GridCell.tsx` 도 US1·US2 공용이다.

### Parallel Opportunities

- T002·T003 (Setup, 서로 다른 파일)
- T007·T008 (US1 테스트 2개, 서로 다른 테스트 파일)
- T010 과 T008 (구현과 다른 모듈의 테스트)
- T016 (US2 의 순수 함수)은 UI 작업과 독립이라 US1 완료 직후 바로 착수 가능

## Parallel Example: Phase 3 테스트

```
# 서로 다른 파일이므로 동시에 작성하고 함께 RED 를 확인한다:
T007 model/__tests__/activity-index.test.ts
T008 model/__tests__/grid-window.test.ts
```

## Implementation Strategy

### MVP First (Phase 1~3)

T001~T015 까지가 출하 가능한 최소 단위다. 라벨도 상세도 없지만 **"최근에 꾸준했는지"라는
이 기능의 유일한 질문에 답한다**. 여기서 멈춰도 앱이 성립한다.

### Incremental Delivery

US1 → US2(읽기 쉽게) → US3(빈·오류) → US4(상세) 순으로 각각 독립 커밋한다.
PR 은 한 번에 올린다 — 구현 총량이 400줄 내외라 Phase 단위로 쪼갤 크기가 아니다.

### 이 브랜치의 범위 밖 (건드리지 말 것)

- `app/page.tsx` 를 서버 컴포넌트로 바꾸는 일 — 별개 관심사다 (plan.md Structure Decision)
- `features/programs/api/programs.ts` 에 전용 쿼리 추가 — research R1 이 기각했다. 재검토
  트리거(홈 초기 로드 체감 지연)가 실제로 발생하면 **별도 이슈**로 연다
- `workout_sessions` / `workout_sets` 관련 작업 일체 — spec 결정 기록이 범위 밖으로 확정했다
- 26주를 다른 값으로 바꾸는 일 — 명세 변경이 선행이다 (T032)

## Notes

- 커밋 prefix 는 `[feat]`·`[test]`·`[refactor]`, 메시지는 한국어 (CLAUDE.md)
- UI 문구는 전부 한국어. 이 기능에는 종목 이름이 등장하지 않으므로 영문 예외가 없다
- 테스트를 먼저 쓰고 **실패를 눈으로 확인한 뒤** 구현한다. 헌법 V 의 비협상 조항이다
