# Tasks: 유저별 PR(개인 최고 기록) 관리

**Feature**: `001-pr-management` | **Branch**: `mmyeon/pr-list` | **Date**: 2026-08-31

**Input**: [spec.md](./spec.md) · [plan.md](./plan.md) · [research.md](./research.md) · [data-model.md](./data-model.md) · [contracts/server-actions.md](./contracts/server-actions.md) · [quickstart.md](./quickstart.md)

**Tests**: 포함한다. 헌법 V(TDD)가 NON-NEGOTIABLE이며 quickstart 게이트 1이 `validatePRInput`
단위 테스트와 서버 액션 테스트의 존재·통과를 완료 기준으로 명시한다.

**Organization**: 태스크는 user story 단위로 묶여 각 스토리가 독립적으로 구현·검증된다.

---

## 이 기능의 성격 (읽고 시작할 것)

PR 등록·수정·목록·이력조회는 **이미 구현되어 동작한다**. 이 작업은 신규 구축이 아니라
**명세와 현행 구현의 갭을 메우는 것**이다. 따라서 대부분의 태스크는 "새로 만들기"가 아니라
"기존 파일 수정"이며, `research.md` 하단의 갭 목록이 작업의 실제 범위다.

**단위 결정 (2026-08-31 확정)**: PR 무게는 **정수 kg만 허용**한다. `spec.md`(FR-010, 엣지케이스)가
진실이며, 설계 문서 4개에 남아 있는 0.5kg 기술은 Phase 1에서 명세에 맞춰 고친다.
근거: 대회 무게가 1kg 단위이고 PR은 1RM 성격의 단일 최고 무게다.

---

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 병렬 실행 가능 (다른 파일, 선행 태스크 의존 없음)
- **[Story]**: 해당 태스크가 속한 user story (US1~US4)
- 모든 태스크에 정확한 파일 경로를 포함한다

## Path Conventions

Next.js 15 App Router 단일 앱. 저장소 루트 기준 경로를 쓴다.
`plan.md`의 Structure Decision에 따라 **기존 코드는 이동하지 않는다.** 신설은
`features/personal-records/model/` 과 마이그레이션 1개뿐이다.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 명세와 설계 문서의 단위 불일치를 먼저 제거하고(헌법 I: 명세 우선), 작업 환경을 연다

- [x] T001 [P] `specs/001-pr-management/research.md` R1의 0.5kg 근거를 1kg 기준으로 교체 — CHECK 표현식을 `weight = trunc(weight)` 로, 검증표의 통과/거부 예시를 정수 기준(`100` ✅ / `52.5` ❌ / `62.25` ❌)으로 고치고, R2의 "0.5 배수 아님" 열을 "정수 아님"으로 바꾼다
- [x] T002 [P] `specs/001-pr-management/data-model.md` 의 CHECK 제약 3종과 검증 규칙 표를 정수 기준으로 수정 — `pr_history_new_weight_half_kg` → `pr_history_new_weight_integer CHECK (new_weight = trunc(new_weight))`, `personal_records_weight_half_kg` → `personal_records_weight_integer CHECK (weight = trunc(weight))`, 메시지는 "무게는 1kg 단위로 입력해주세요."
- [x] T003 [P] `specs/001-pr-management/contracts/server-actions.md` 의 model 계약 표를 정수 기준으로 수정 — `{ weight: 52.5 }` 통과 예시를 `{ weight: 100 }` 으로, `{ weight: 52.4 }` 거부 예시를 `{ weight: 52.5 }` 로 교체하고 메시지를 "무게는 1kg 단위로 입력해주세요." 로 통일
- [x] T004 [P] `specs/001-pr-management/plan.md` 와 `specs/001-pr-management/quickstart.md` 의 0.5kg 언급을 1kg로 수정 — plan.md Summary·Constitution Re-Check의 "0.5kg 단위", quickstart 게이트 2의 `52.4`/`52.5` SQL 예시와 게이트 3 US1-4행
- [x] T005 로컬 개발 환경 기동 — `npx supabase status` 로 로컬 스택 확인 후 `npm run dev`. Docker Desktop이 먼저 떠 있어야 한다 (CLAUDE.md)
- [x] T006 `features/personal-records/model/` 및 `features/personal-records/model/__tests__/` 디렉토리 생성 — 이 feature의 순수 로직 거처 (plan.md Structure Decision)

**Checkpoint**: 설계 문서가 명세와 한 단위를 말한다. 이 상태에서만 구현을 시작한다

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 모든 스토리가 의존하는 검증 계층. model(순수 함수) → DB CHECK(최종 방어) 순으로 세운다

**⚠️ CRITICAL**: US1~US4 어느 것도 이 단계 완료 전에 시작할 수 없다. 서버 액션·UI가 전부
`validatePRInput` 을 호출하기 때문이다

- [x] T007 `features/personal-records/model/__tests__/validate-pr-input.test.ts` 에 `validatePRInput` 단위 테스트 작성 — contracts의 model 계약 표 전 항목: 정상 통과, 무게 `null`, 무게 `0`, 무게 음수, 정수 아닌 무게(`52.5`), 무게 `1001`, 무게 `1000`(경계 통과), 빈 `prDate`, 미래 날짜, 오늘 날짜(경계 통과), 위반 다건 동시 반환. `today` 를 인자로 주입해 시간에 의존하지 않게 한다
- [x] T008 `npx jest features/personal-records` 실행해 **실패를 눈으로 확인** — 헌법 V의 RED 단계. 실패를 보지 않고 T009로 넘어가면 위반이다
- [x] T009 `features/personal-records/model/validate-pr-input.ts` 에 `PRInputDraft`·`ValidationError`·`validatePRInput` 구현 (GREEN) — 순수 함수, I/O·React·`new Date()` 금지. 정수 판정은 `Number.isInteger(weight)`. 위반 시 첫 건에서 멈추지 않고 전부 반환
- [x] T010 `supabase/migrations/<timestamp>_pr_constraints.sql` 작성 — `pr_history` 에 `new_weight > 0` / `<= 1000` / `= trunc(new_weight)` 3종, `public."personal-records"` 에 `weight > 0` / `<= 1000` / `= trunc(weight)` 3종. `pr_date` 미래 방지 CHECK는 **넣지 않는다** (research.md R3: 덤프·복원 실패 위험)
- [x] T011 마이그레이션 적용 전 로컬 위반 데이터 확인 후 `npx supabase migration up` 실행 — quickstart "원격 배포 전 필수 확인"의 count 질의를 로컬에 먼저 돌려 0건임을 확인한다. 위반 행이 있으면 진행하지 말고 정리 방침을 사용자와 정한다. **`db reset`을 쓰지 않는다** — 로컬 Supabase는 워크트리 전체가 공유하며, DB에는 이 브랜치에 파일이 없는 마이그레이션 4개(`feat/ocr-program-input`의 `gym_exercises`, `recovered/training-hub-v1`의 `training_notes` 등)가 적용돼 있다. reset하면 그 브랜치들의 로컬 스키마가 사라진다
- [x] T012 `npm run generate-types` 재실행 — **결과: PR 관련 타입 변경 0건**(CHECK 제약은 컬럼 타입을 바꾸지 않음). 재생성 산출물에는 다른 브랜치 테이블 4개(`base_exercises`, `gym_exercises`, `training_notes`, `training_programs`)가 딸려와 이 브랜치에 넣을 수 없으므로 `types_db.ts` 를 되돌렸다. 절차는 수행했고 결과가 무변경임을 확인. 원래 지시: `types_db.ts` 를 마이그레이션과 **같은 커밋에** 포함 — 헌법 II 스키마 동기화 규약. CHECK 제약은 컬럼 타입을 바꾸지 않으므로 산출물이 동일할 수 있으나 절차는 생략하지 않는다
- [x] T013 quickstart 게이트 2 수행 — `psql -h 127.0.0.1 -p 54322` 로 `pr_history` 에 무게 `0` / `52.5` / `1500` INSERT가 전부 `violates check constraint` 로 거부되고 `100` 은 통과하는지 확인. 미래 날짜가 DB를 통과하는 것은 **정상**이다

**Checkpoint**: 검증 계층 완성. UI를 거치지 않는 경로도 막힌다. 여기서부터 스토리 작업 가능

---

## Phase 3: User Story 1 - PR 등록 (Priority: P1) 🎯 MVP

**Goal**: 종목 카탈로그 전체에서 종목을 골라 무게·날짜로 PR을 등록하고 목록에서 확인한다.
잘못된 입력은 브라우저를 거치지 않는 호출까지 서버 경계에서 막힌다

**Independent Test**: PR이 하나도 없는 계정으로 Snatch 80kg / 2026-08-20을 등록하고
목록에 `Snatch · 80kg · 2026. 8. 20.` 이 나타나는지 확인 (spec.md US1)

### Tests for User Story 1 ⚠️ 먼저 작성하고 실패를 확인할 것

- [x] T014 [US1] `actions/__tests__/personalRecords.test.ts` 에 `addPRHistoryEntry` 검증 거부 케이스 추가 — 무게 `0`, 정수 아닌 무게, `1001`, 미래 `prDate` 각각에서 **DB 접근 전에** throw하는지. Supabase 목의 `from` 이 호출되지 않았음을 함께 단언해 "DB 접근 전 차단"을 증명한다
- [x] T015 [US1] 위 테스트 실행해 실패 확인 (RED)

### Implementation for User Story 1

- [x] T016 [US1] `actions/personalRecords.ts` 의 `addPRHistoryEntry` 본문 첫 줄에서 `validatePRInput({ weight: input.newWeight, prDate: input.prDate }, todayISO())` 호출 — 위반이 있으면 첫 메시지로 throw. `supabaseServerClient()` 보다 먼저 실행한다 (FR-003, FR-004, FR-008, FR-009, FR-010)
- [x] T017 [US1] `actions/personalRecords.ts` 의 `addRecord` 가 `addPRHistoryEntry` 로 위임하므로 검증을 **중복 구현하지 않음**을 확인하고, 위임 경로에도 거부가 전파되는 테스트 1건 추가
- [x] T018 [US1] `components/PersonalRecords/PRHistoryEntryEditor.tsx` 의 인라인 `canSubmit` 조건(45행)을 `validatePRInput` 호출로 교체 — 반환된 `ValidationError[]` 가 비어야 저장 버튼 활성. 필드별 메시지를 무게·날짜 입력 아래에 노출한다 (contracts UI 계약)
- [x] T019 [P] [US1] `components/PersonalRecords/RecordAddDialog.tsx` 가 `getExercises()` 결과 전체를 선택지로 제공하는지 확인 — 7개 종목으로 하드코딩된 제한이 있으면 제거한다 (FR-002, US1 시나리오 2) — **확인 결과**: `WorkoutSelect` 가 `useExercises()` 결과를 그대로 `map` 하므로 하드코딩 제한 없음. 코드 변경 없음
- [x] T020 [P] [US1] `components/PersonalRecords/PRHistoryEntryEditor.tsx` 무게 input의 `step` 을 `1` 로, `min` 을 `1`, `max` 를 `1000` 으로 설정 — 브라우저 힌트일 뿐이므로 T016·T010의 강제 검증을 대체하지 않는다
- [x] T021 [US1] 이미 등록된 종목으로 다시 추가 시 새 행이 생기지 않고 기존 PR이 갱신되는지 확인 — `UNIQUE (user_id, exercise_id)` 와 `recomputeCache` 가 이미 보장하므로 코드 변경 없이 quickstart 게이트 3 US1-6으로 검증한다 (FR-006) — **확인 결과**: `personal_records_user_id_exercise_id_unique` 제약이 `supabase/migrations/20250626045747_remote_schema.sql:275` 에 존재하고, `addPRHistoryEntry` 재등록 시 캐시가 UPDATE되는 단위 테스트가 이미 통과한다. 코드 변경 없음. 수동 검증은 T022에서 함께 수행
- [x] T022 [US1] quickstart 게이트 3 US1 시나리오 1~7 수동 실행 — 특히 3(무게 0), 4(무게 52.5), 5(미래 날짜)에서 명세 문구가 그대로 노출되는지 확인 — **완료 (2026-09-02)**. 수동 검증 중 발견해 함께 고친 것: (a) UI 문구 영어 혼재 → 한국어 통일 + `CLAUDE.md`에 규약 명시(헌법은 언어 규정을 의도적으로 제외하므로 CLAUDE.md가 유일한 기준), (b) 이력 행의 `이전무게 → 새무게` 표기가 이전 기록이 없을 때 `34 → 34`로 보이던 문제 → 해당 날짜의 무게만 표시, (c) 목록의 `Recent` 태그 제거, (d) 종목 드롭다운을 스내치/클린/저크/스쿼트/프레스/기타로 그룹화, (e) `components/ui/select.tsx` Viewport의 `h-[var(--radix-select-trigger-height)]` 제거 — 목록 영역이 한 줄 높이로 눌려 있던 기존 버그, (f) 스파크라인에 점별 무게 숫자(kg) 표시

**Checkpoint**: US1 단독으로 완결된다. 여기까지가 MVP

---

## Phase 4: User Story 2 - PR 수정 (Priority: P1)

**Goal**: 현재 PR의 **무게와 날짜를 모두** 수정한다.

> ⚠️ **2026-09-08 정정 — 이 스토리의 전제가 틀렸다.**
> 계획 당시 "`updateRecordWeight` 가 `pr_date` 를 오늘로 강제해 FR-007의 절반이 빠져 있다"고
> 판단했으나, 실제로는 **`updateRecordWeight` 와 그 훅 `useUpdatePersonalRecord` 를 호출하는
> UI가 하나도 없었다**(테스트 이름부터 `(legacy)` 였다). 화면의 실제 수정 경로는
> `updatePRHistoryEntry` 이고 이건 처음부터 `newWeight` 와 `prDate` 를 **둘 다** 받으며,
> `PRHistoryEntryEditor` 도 무게·날짜 입력을 이미 노출하고 있었다. 즉 **FR-007은 이미 충족돼
> 있었다.**
>
> 그래서 T023·T026·T027·T029·T030·T031은 **죽은 코드에 파라미터를 더하는 작업**이라 폐기하고,
> 죽은 `updateRecordWeight`/`useUpdatePersonalRecord`/legacy 테스트를 삭제했다. 남겨두면 다음
> 사람도 같은 착각을 한다.
>
> 실제 갭은 **T028 하나** 였다 — `updatePRHistoryEntry` 에 검증이 전혀 없었다. 무게는 DB CHECK가
> 막아주지만(메시지가 raw Postgres 에러로 노출) **미래 날짜는 R3에 따라 DB 제약이 없어 코드가
> 유일한 방어선**이었고, 실측 결과 `pr_date = '2099-12-31'` UPDATE가 그대로 성공했다.

**Independent Test**: `Back Squat 120kg` 이 등록된 계정에서 `130kg / 2026-08-25` 로 수정한 뒤
목록과 상세에 무게와 날짜가 **둘 다** 반영되는지 확인 (spec.md US2)

### Tests for User Story 2 ⚠️ 먼저 작성하고 실패를 확인할 것

- [~] T023 [US2] **폐기** (위 정정 참조 — `updateRecordWeight` 는 삭제됐다) `actions/__tests__/personalRecords.test.ts` 에 `updateRecordWeight` 의 `prDate` 인자 테스트 추가 — `prDate` 를 주면 그 값이 `pr_history.pr_date` 로 INSERT되고, 생략하면 종전대로 오늘이 쓰이는지
- [x] T024 [P] [US2] `actions/__tests__/personalRecords.test.ts` 에 `updatePRHistoryEntry` 부분 검증 테스트 추가 — `newWeight` 만 준 patch는 무게만, `prDate` 만 준 patch는 날짜만 검증하고, 주지 않은 필드의 값 때문에 거부되지 않는지
- [x] T025 [US2] 위 두 테스트 실행해 실패 확인 (RED)

### Implementation for User Story 2

- [~] T026 [US2] **폐기** `actions/personalRecords.ts:280` `updateRecordWeight` 시그니처를 `(recordId, newWeight, prDate?)` 로 확장 — `pr_history` INSERT의 `pr_date` 에 `prDate ?? new Date().toISOString().slice(0, 10)` 를 쓴다 (FR-007)
- [~] T027 [US2] **폐기** `actions/personalRecords.ts` 의 `updateRecordWeight` 본문 첫 줄에 `validatePRInput` 호출 추가 — 검증 규칙은 `addPRHistoryEntry` 와 동일
- [x] T028 [US2] `actions/personalRecords.ts:175` `updatePRHistoryEntry` 에 **부분 검증** 추가 — `patch.newWeight`/`patch.prDate` 가 `undefined` 가 아닌 필드만 `validatePRInput` 결과에서 골라 검사한다. 부분 수정이므로 미제공 필드를 이유로 거부하면 안 된다 (FR-007, FR-011)
- [~] T029 [US2] **폐기** `hooks/usePersonalRecords.ts:38` `useUpdatePersonalRecord` 가 `prDate` 를 서버 액션까지 전달하도록 mutation 인자 타입 확장 — 성공 시 `personalRecords`·`prHistory` 쿼리 무효화가 유지되는지 확인
- [~] T030 [US2] **폐기** — 날짜 입력은 이미 노출돼 있었다 `app/settings/personal-records/[id]/page.tsx` 의 현재 PR 수정 흐름에 날짜 입력을 노출하고 T029의 훅에 전달 — 수정이 3번 이하 조작(선택 → 값 변경 → 저장)으로 끝나야 한다 (SC-002)
- [~] T031 [US2] **폐기** — `onError` → 토스트 경로가 이미 있다 저장 실패 시 기존 값이 손상되지 않고 실패가 토스트로 알려지는지 확인 — 서버 액션이 예외를 던지고 React Query `onError` 가 이를 받는 경로를 점검한다 (FR-011)
- [ ] T032 [US2] quickstart 게이트 3 US2 시나리오 1~3 수동 실행 (범위 축소 — 1·2는 기존 동작 확인, 3만 실질 검증) — 특히 1(무게+날짜 동시 반영)과 3(DevTools Offline에서 실패 토스트)

### 이 Phase에서 발견해 함께 고친 것

- **타임존 버그 (T016이 만든 것)**: UI는 `getFullYear/getMonth/getDate`(로컬), 서버는
  `toISOString()`(UTC)으로 "오늘"을 계산해 기준이 갈렸다. KST 00:00~09:00 사이엔 UTC가 아직
  전날이라, 사용자가 오늘 날짜로 등록하면 **UI는 통과시키고 서버가 "미래 날짜"로 거부**했다.
  새벽 훈련 기록이 매일 9시간 동안 막히는 문제였다.
- **결정**: `pr_date` 는 시각이 아니라 **사용자 달력의 날짜**다. 따라서 판정 기준은 사용자
  로컬 날짜여야 하고 UI는 지금 그대로 둔다(브라우저 타임존을 쓰므로 이미 위치 기반이다).
  서버는 요청자의 타임존을 알 수 없으므로 **"지구 어디서도 미래일 수 없는 날짜"만 거부**한다 —
  상한은 UTC+14(키리바시). `features/personal-records/model/pr-date-bounds.ts`.
  클라이언트가 자기 타임존을 보내게 하지 않은 이유: 그 값을 서버가 믿으면 서버 검증이
  클라이언트 검증과 같아진다. 대가로 API 직접 호출 시 "내일" 날짜는 서버가 못 막지만,
  FR-009의 목적인 오타 방어(연도·월 실수)는 그대로 걸린다.

**Checkpoint**: US1과 US2가 각각 독립적으로 동작한다. P1 완료

---

## Phase 5: User Story 3 - PR 목록 조회 (Priority: P2)

**Goal**: 등록된 PR과 **아직 등록하지 않은 종목**을 한 화면에서 구분해 본다.
현재 목록은 등록된 것만 렌더하므로 미등록 종목 표시가 이 스토리의 갭이다

**Independent Test**: 3개 종목만 등록된 계정으로 목록을 열어 등록 3개가 값·날짜와 함께
표시되고 미등록 종목과 시각적으로 구분되는지 확인 (spec.md US3)

- [ ] T033 [US3] `app/settings/personal-records/page.tsx` 에서 `usePersonalRecords()` 와 `useExercises()` 를 함께 읽어, 카탈로그 종목 중 PR이 없는 것을 **미등록 상태로 렌더**한다 — 등록된 항목은 무게·날짜, 미등록 항목은 빈 값과 등록 유도 표시 (FR-012)
- [ ] T034 [US3] 미등록 종목 행을 탭하면 해당 종목이 선택된 상태로 등록 흐름(`RecordAddDialog`)이 열리도록 연결 — 첫 등록까지 30초 이내 도달 (SC-001)
- [ ] T035 [P] [US3] `app/settings/personal-records/page.tsx` 의 PR 0건 상태에서 빈 상태 안내와 첫 등록 경로가 제공되는지 확인·보강 (US3 시나리오 2)
- [ ] T036 [US3] quickstart 게이트 3 US3 시나리오 1~2 수동 실행

**Checkpoint**: US1~US3이 각각 독립적으로 동작한다

---

## Phase 6: User Story 4 - 종목별 과거 기록·추이 조회 (Priority: P3)

**Goal**: 종목을 선택해 과거 기록을 날짜순으로 보고 추이를 파악한다. 기록이 0~1건이어도
오류 없이 현재 상태를 보여준다

**Independent Test**: `Back Squat` 에 서로 다른 날짜의 기록 3건이 쌓인 계정에서 해당 종목을
선택해 3건이 날짜순으로 보이고 추이가 함께 표시되는지 확인 (spec.md US4)

### Tests for User Story 4 ⚠️ 먼저 작성하고 실패를 확인할 것

- [ ] T037 [P] [US4] **선행 완료 있음** — 좌표·라벨 로직을 `features/personal-records/model/sparkline-plot.ts` 로 분리하고 무게 동일·날짜 동일 등 0 나눗셈 경계 테스트 8건을 `__tests__/sparkline-plot.test.ts` 에 이미 확보했다(T022 과정에서). 남은 것은 컴포넌트 렌더 테스트뿐이다. `components/PersonalRecords/__tests__/PRSparkline.test.tsx` 신규 — 기록 0건, 1건, 2건, 같은 날짜 2건, 무게가 모두 동일한 3건(`wSpan` 0 경계)에서 오류 없이 렌더되는지 (FR-017, 엣지케이스 "같은 날짜에 기록이 여러 건")
- [ ] T038 [US4] 위 테스트 실행해 실패 또는 통과를 확인 — `PRSparkline` 은 이미 `points.length < 2` 를 처리하므로 통과할 수 있다. 그 경우 테스트는 **회귀 방지 자산**으로 남기고 T039는 건너뛴다

### Implementation for User Story 4

- [ ] T039 [US4] T038에서 드러난 경계 결함만 `components/PersonalRecords/PRSparkline.tsx` 에서 수정 — 빈 그래프나 예외를 내지 않고 현재 기록만 표시 (FR-017)
- [x] T040 [P] [US4] **완료 (T022 과정에서 선행)** — `components/PersonalRecords/PRSparkline.tsx` 의 안내 문구 `"Graph appears with 2 or more records."` 를 한국어로 교체 — 화면의 나머지 사용자 문구가 한국어이고 검증 메시지도 한국어다
- [ ] T041 [US4] `app/settings/personal-records/[id]/page.tsx` 가 `getPRHistory` 결과를 `pr_date` 기준으로 표시하고 각 기록의 무게·날짜를 보여주는지 확인 (FR-014, FR-015)
- [ ] T042 [US4] `actions/__tests__/personalRecords.test.ts` 에 `getPRHistory` 소유자 검증 테스트 추가 — 타 사용자의 `exerciseId`/`recordId` 로 접근 시 `.eq("user_id", userId)` 가 걸려 결과가 비는지 (FR-018, SC-005)
- [ ] T043 [US4] quickstart 게이트 3 US4 시나리오 1~5 수동 실행 — 특히 2(이력 1건), 3(이력 0건 직접 URL), 5(타인 record id URL 접근 거부)

**Checkpoint**: US1~US4 전부 독립적으로 동작한다

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: 커밋·배포 가능 상태로 만든다

- [ ] T044 quickstart 게이트 1 전부 통과 — `npm run type-check` / `npm test` / `npm run build` / `npm run lint`. 하나라도 실패하면 커밋할 수 없다 (헌법 Non-Negotiable Quality Gates)
- [ ] T045 quickstart 게이트 4 정합성 질의 2건 실행 — 캐시-이력 무게 불일치, 이력 없는 고아 캐시 행이 **모두 0행**인지 확인
- [ ] T046 [P] `specs/001-pr-management/plan.md` 의 "남은 판단 사항"에 `db push` 결정을 기록 — 원격 위반 데이터 확인 결과와 사용자 승인 여부
- [ ] T047 [P] `CLAUDE.md` Database Conventions에 PR 무게 규약 한 줄 추가 — "PR 무게는 정수 kg. `personal-records.weight` 와 `pr_history.new_weight` 에 CHECK 제약으로 강제된다"
- [ ] T048 원격 배포 — quickstart "원격 배포 전 필수 확인" 질의를 원격에 **읽기 전용으로** 돌려 위반 0건 확인 후, **사용자 승인을 받고** `npx supabase db push`. 위반 행이 있으면 push하지 말고 정리 방침을 먼저 정한다
- [ ] T049 커밋 — 한국어 커밋 메시지, `[feat]`/`[fix]` 접두사. `types_db.ts` 는 마이그레이션과 같은 커밋에 포함 (헌법 II)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 의존 없음. 즉시 시작 가능
- **Foundational (Phase 2)**: Phase 1 완료 후. **모든 스토리를 블로킹한다**
- **User Stories (Phase 3~6)**: 전부 Phase 2 완료에 의존
- **Polish (Phase 7)**: 원하는 스토리가 전부 끝난 뒤

### User Story Dependencies

- **US1 (P1)**: Phase 2 이후 시작. 다른 스토리 의존 없음 — **MVP**
- **US2 (P1)**: Phase 2 이후 시작. US1과 독립. 단 T030이 상세 화면을 건드리므로 T041과 같은 파일(`[id]/page.tsx`)을 만진다 — 순차 진행 권장
- **US3 (P2)**: Phase 2 이후 시작. 목록 파일만 만지므로 US1·US2와 완전 병렬 가능
- **US4 (P3)**: Phase 2 이후 시작. US2와 `[id]/page.tsx` 를 공유하므로 US2 이후 진행

### Within Each User Story

- 테스트를 먼저 쓰고 **실패를 확인한 뒤** 구현한다 (헌법 V, quickstart 게이트 1)
- model → 서버 액션 → 훅 → UI 순
- 스토리 완료 후 다음 우선순위로 이동

### 파일 충돌 주의

| 파일 | 만지는 태스크 | 비고 |
|---|---|---|
| `actions/personalRecords.ts` | T016, T017, T028 | 같은 파일 — 순차 (T026·T027 폐기) |
| `actions/__tests__/personalRecords.test.ts` | T014, T017, T024, T042 | 같은 파일 — 순차 (T023 폐기) |
| `components/PersonalRecords/PRHistoryEntryEditor.tsx` | T018, T020 | 같은 파일 — 순차 |
| `app/settings/personal-records/[id]/page.tsx` | T041 | T030 폐기로 충돌 해소 |
| `components/PersonalRecords/PRSparkline.tsx` | T039, T040 | 같은 파일 — 순차 |

### Parallel Opportunities

- **Phase 1**: T001~T004가 전부 다른 문서 파일 — 4개 동시 가능
- **Phase 2**: 없음. T007→T008→T009→T010→T011→T012→T013이 엄격히 순차 (TDD 사이클과 마이그레이션 적용 순서)
- **Phase 3**: T019(RecordAddDialog)와 T020(PRHistoryEntryEditor)이 다른 파일 — 동시 가능
- **Phase 6**: T037(신규 테스트 파일)과 T042(액션 테스트)가 다른 파일 — 동시 가능
- **Phase 7**: T046(plan.md)과 T047(CLAUDE.md) — 동시 가능
- **스토리 간**: Phase 2 완료 후 US3(목록 파일 전용)은 US1·US2와 완전 병렬

---

## Parallel Example: Phase 1

```bash
# 설계 문서 4개를 동시에 정수 kg 기준으로 정렬:
Task: "research.md R1·R2를 1kg 기준으로 교체"
Task: "data-model.md CHECK 제약 3종과 검증 규칙 표를 정수 기준으로 수정"
Task: "contracts/server-actions.md model 계약 표를 정수 기준으로 수정"
Task: "plan.md·quickstart.md의 0.5kg 언급 수정"
```

## Parallel Example: User Story 1

```bash
# 서로 다른 컴포넌트 파일이므로 동시 진행:
Task: "RecordAddDialog가 종목 카탈로그 전체를 제공하는지 확인"
Task: "PRHistoryEntryEditor 무게 input의 step/min/max 설정"
```

---

## Implementation Strategy

### MVP First (Phase 1~3)

1. Phase 1 완료 — 명세와 설계가 한 단위를 말하게 만든다
2. Phase 2 완료 — **모든 스토리를 블로킹하므로 여기서 멈추면 안 된다**
3. Phase 3 (US1) 완료
4. **STOP & VALIDATE**: quickstart 게이트 3 US1을 단독 실행. 잘못된 무게·날짜가
   서버 경계에서 막히는 것이 이 MVP의 실질 가치다
5. 이 시점에서 헌법 III 위반이 해소된다 — 배포 가치가 있는 지점

### Incremental Delivery

1. Setup + Foundational → 검증 계층 확보
2. US1 → 등록 경로 방어 완성 → **MVP**
3. US2 → FR-007 갭(날짜 수정) 해소 → P1 완료
4. US3 → 미등록 종목 가시화 → 목록의 실사용 가치
5. US4 → 이력·추이 경계 안정화
6. Phase 7 → 게이트 통과 후 커밋·배포

### 이 브랜치의 범위 밖 (건드리지 말 것)

- `actions/personalRecords.ts` 의 바벨 무게 설정(`getUserDefaultBarbelWeight`, `saveBarbellWeight`)
  분리 — 관심사 분리 위반이 맞지만 **별도 이슈** (plan.md)
- 이력 항목 직접 추가·수정·삭제 UI의 존폐 — 현행 유지 (spec.md Assumptions, 헌법 VII)
- 종목 카탈로그 추가·개명·정리 — 범위 밖 (FR-002)
- `recomputeCache` 의 원자성 보강(RPC) — 실사용 마찰 확인 전까지 보류 (research.md R4)
- 자동 PR 감지, lb 단위 변환 — 범위 밖

---

## Notes

- [P] = 다른 파일, 의존 없음
- 각 태스크 또는 논리적 묶음마다 커밋한다 (한국어, `[feat]`/`[fix]` 접두사)
- 테스트가 실패하는 것을 먼저 확인한다 — 헌법 V는 NON-NEGOTIABLE
- 어느 체크포인트에서든 멈춰 해당 스토리를 단독 검증할 수 있다
- 파괴적 명령 금지: 원격 DB에 `db push` 는 위반 데이터 확인 + 사용자 승인 후에만
