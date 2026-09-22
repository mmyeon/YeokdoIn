# Tasks: PR 기록 낙관적 반영

**Input**: `/specs/004-pr-optimistic-update/` 의 spec.md · plan.md · research.md · data-model.md · quickstart.md

**Tests**: **필수**다. 헌법 V(TDD). 예측·역연산은 순수 함수고, 훅은 실제 `QueryClient` + 서버 액션 목으로
캐시 상태를 직접 검사할 수 있어 Red-Green-Refactor 가 그대로 성립한다.

## 이 기능의 성격 (읽고 시작할 것)

**DB 를 건드리지 않는다.** 마이그레이션·`generate-types`·`db push` 전부 없음. 서버 액션 시그니처도 그대로다.
다루는 것은 React Query 캐시 두 개(`[PERSONAL_RECORDS]`, `[PR_HISTORY, exerciseId]`)뿐이다.

위험은 **조작이 겹칠 때**에 있다. 스냅샷 복원(공식 예제)을 쓰면 연속 삭제에서 틀린다 — 역연산만 쓴다(research R2).
콜백 시그니처는 설치본 5.81.5 기준이다. 공식 문서 최신 예제의 `onMutate(variables, context)` 를 옮기지 말 것(R4).

spec.md 에 user story 절이 없다(100줄 상한). 아래 US1~US3 은 **조작 종류별**로 자른 것이다 — 각각 따로 배포해도
나머지 조작은 기존(비낙관적) 동작으로 성립한다. 삭제를 MVP 로 둔 이유: 폼 재오픈이 없어 가장 작고,
연속 조작·마지막 조작 재조회라는 이 기능의 핵심 위험을 전부 검증한다.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 서로 다른 파일 → 병렬 가능
- **[US#]**: user story phase 전용 라벨

## Path Conventions

- model: `features/personal-records/model/optimistic-history.ts` (+ `__tests__/`)
- 훅: `features/personal-records/ui/use-pr-history-mutations.ts` (+ `__tests__/`)
- 화면: `app/settings/personal-records/[id]/page.tsx`

---

## Phase 1: Setup

- [X] T001 `jest.config.js` 의 `testMatch` 에 `'**/features/**/__tests__/**/*.test.tsx'` 를 추가한다. **지금은 없어서** 계획대로 `features/personal-records/ui/__tests__/*.test.tsx` 를 만들면 테스트가 실행되지 않고 조용히 통과한 것처럼 보인다. 추가 후 `npx jest --listTests | grep features/` 로 기존 목록이 바뀌지 않았는지 확인한다

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 예측·역연산 순수 함수와 세 훅이 공유하는 캐시 조작. US1~US3 전부가 의존한다.

**⚠️ CRITICAL**: 이 Phase 가 끝나기 전에는 어떤 user story 도 시작할 수 없다.

- [X] T002 `features/personal-records/model/__tests__/optimistic-history.test.ts` 를 먼저 작성하고 **실패를 확인한다**. 케이스:
      `applyHistoryChange` — 과거 날짜 `add` 가 맨 위가 아니라 날짜 순 자리에 들어감, 같은 날짜면 `createdAt` 내림차순, `update` 로 날짜를 바꾸면 자리 이동, `remove`, 입력 배열이 변하지 않음(불변);
      `deriveCurrentPR` — 최대 무게 행 삭제 후 다음 최대, 동점 시 무게가 같음, 0건 → `null`;
      `applyCurrentPR` — `null` 이면 `base.exerciseId` 행 제거, 제거된 상태에 `base` 로 되살리면 `id`·`exerciseName` 복원, 다른 종목 행은 그대로;
      역연산 왕복 — `add`→`remove`, `remove`→`add`, `update`→`update(before)` 후 원래 배열과 `toEqual`
- [X] T003 `features/personal-records/model/optimistic-history.ts` 에 `HistoryChange` 타입과 `applyHistoryChange`·`deriveCurrentPR`·`applyCurrentPR` 를 data-model.md 정의 그대로 구현한다. 정렬은 서버 `getPRHistory` 와 같은 `prDate` 내림차순 → `createdAt` 내림차순. 현재 PR 규칙은 서버 `recomputeCache` 와 동일(research R8)하다는 것을 상단 주석에 남긴다. React·I/O 를 import 하지 않는다(헌법 IV)
- [X] T004 `hooks/usePersonalRecords.ts` 의 `FAIL_FAST_WHEN_OFFLINE` 를 `export` 한다(주석은 그 자리에 둔다 — 근거가 두 벌이 되면 안 된다). `features/personal-records/ui/use-pr-history-mutations.ts` 를 만들고 세 훅이 공유할 것만 넣는다:
      `PR_HISTORY_MUTATION_KEY`(세 훅 공통 `mutationKey`, R3);
      `applyOptimistic(queryClient, exerciseId, change, base)` — 이력 캐시에 `applyHistoryChange` → 결과로 `deriveCurrentPR` → 레코드 캐시에 `applyCurrentPR`. **현재 PR 캐시를 직접 고치지 않는다**(data-model "캐시 두 개");
      `prepare(queryClient, exerciseId)` — 두 쿼리 `cancelQueries` 후 레코드 캐시에서 `base` 를 찾아 반환;
      `settleIfLast(queryClient, exerciseId)` — `isMutating({ mutationKey }) === 1` 일 때만 두 쿼리 invalidate

**Checkpoint**: 예측·역연산이 테스트로 고정됐다. user story 진입 가능.

---

## Phase 3: User Story 1 — 삭제가 즉시 반영된다 (Priority: P1) 🎯 MVP

**Covers**: FR-001·002·003·005·007 (삭제), 경계 "연속 조작"·"현재 PR 기록을 삭제", research R7

**Goal**: 기록을 삭제하면 확인창을 닫는 순간 목록·현재 PR·그래프가 바뀌고, 실패하면 그 행만 돌아온다.

**Independent Test**: 느린 네트워크에서 최대 무게 기록 삭제 → 즉시 행이 사라지고 헤더가 다음 무게로. 오프라인 삭제 → 행이 돌아오고 실패 토스트.

### Tests for User Story 1 ⚠️ 먼저 작성하고 실패를 확인할 것

- [X] T005 [US1] `features/personal-records/ui/__tests__/use-pr-history-mutations.test.tsx` 를 만든다(상단 `@jest-environment jsdom` docblock, `useAuth`·`@/actions/personalRecords` 목은 `hooks/__tests__/usePersonalRecords.offline.test.tsx` 방식). 테스트마다 새 `QueryClient` 에 두 캐시를 `setQueryData` 로 심고, `deletePRHistoryEntry` 를 **직접 resolve/reject 하는 지연 promise** 로 목한다. 케이스:
      응답 전에 이력에서 행이 빠지고 헤더 무게가 다음 최대로 내려가 있다;
      실패하면 두 캐시가 직전 값과 `toEqual` 이고 `onError` 가 `(error, id)` 를 받는다;
      **삭제 A·B 연달아, A만 실패** → B는 빠진 채, A만 돌아온다;
      A·B 겹침 → `getPRHistory` 재조회가 B가 끝난 뒤 **한 번만** 일어난다;
      마지막 1건 삭제 → 레코드 캐시에서 그 종목 행이 빠지고, 실패하면 `exerciseName` 까지 되살아난다;
      오프라인(`onlineManager.setOnline(false)`) → `isPending` 이 false 로 끝나고 `onError` 호출

### Implementation for User Story 1

- [X] T006 [US1] `use-pr-history-mutations.ts` 에 `useOptimisticDeletePRHistory(exerciseId, onError)` 를 구현한다. `onMutate(id)` → `prepare` → 지운 행을 이력 캐시에서 찾아 context 에 담고 `remove` 적용. `onError(err, id, context)` → `add(context.removed)` 역연산 후 `onError(err, id)`. `onSettled` → `settleIfLast`. **`exerciseId` 는 context 에 담아 쓴다** — 마지막 1건을 지우면 화면의 `record` 가 사라져 인자로 받은 `exerciseId` 가 `null` 이 되고, v5 는 진행 중 mutation 에 최신 옵션을 넣으므로 클로저 값을 쓰면 되돌릴 캐시 키를 잃는다. 성공 콜백 인자는 받지 않는다(FR-005)
- [X] T007 [US1] `app/settings/personal-records/[id]/page.tsx` 의 삭제를 새 훅으로 바꾸고 성공 토스트를 없앤다. 실패 토스트 문구 "기록 삭제에 실패했습니다." 는 유지. `HistoryRow` 의 `isDeleting` prop 과 삭제 버튼 `disabled` 를 제거한다(R7 — 이 잠금은 연속 삭제를 막기만 한다)
- [X] T008 [US1] `hooks/usePersonalRecords.ts` 에서 `useDeletePRHistoryEntry` 를 제거한다(사용처는 상세 화면뿐, R5)
- [ ] T009 [US1] quickstart 수동 #1(삭제만)·#2·#6 을 수행한다

**Checkpoint**: 삭제만 낙관적이고 추가·수정은 기존 동작. 이대로 배포해도 성립한다.

---

## Phase 4: User Story 2 — 수정이 즉시 반영되고 실패해도 입력값이 남는다 (Priority: P2)

**Covers**: FR-001~005 (수정), 경계 "정렬 위치"(날짜 수정), data-model "입력 폼 상태"

**Goal**: 수정 버튼을 누르면 폼이 닫히며 바로 바뀐 값이 보이고, 실패하면 수정하려던 값으로 폼이 다시 열린다.

**Independent Test**: 오프라인에서 무게·날짜를 바꿔 수정 → 잠깐 반영 → 되돌아감 → 실패 토스트 → 수정 폼이 바꾸려던 값으로 열림.

### Tests for User Story 2 ⚠️ 먼저 작성하고 실패를 확인할 것

- [X] T010 [US2] `use-pr-history-mutations.test.tsx` 에 수정 케이스를 추가한다: 날짜를 바꾸면 응답 전에 행이 새 날짜 자리로 옮겨가 있다, 무게를 최대보다 올리면 헤더가 즉시 오른다, 실패하면 수정 전 행으로 돌아오고 `onError` 가 `(error, { id, patch })` 를 받는다. `hooks/__tests__/usePersonalRecords.offline.test.tsx` 의 오프라인 케이스를 새 훅 대상으로 **옮긴다**(spec 검증 절이 유지를 요구)

### Implementation for User Story 2

- [X] T011 [US2] `useOptimisticUpdatePRHistory(exerciseId, onError)` 를 구현한다. 예측 행은 `{ ...before, ...patch }`, 역연산은 `update(before)`. 나머지는 T006 과 같은 구조(context 의 `exerciseId`, `settleIfLast`)
- [X] T012 [US2] 상세 화면에 data-model 의 `RetryForm` 타입(`add`·`edit` 둘 다 선언)과 `retryForm` 상태를 둔다. 수정 제출 시 `mutate` 직후 **즉시** `setEditingId(null)`. `onError(err, { id, patch })` → 실패 토스트 + `editingId = id` + `patch` 를 draft 로 복원해 에디터 `initial` 로 넘긴다. `PRHistoryEntryEditor` 는 `initial` 을 마운트 때만 읽으므로 **`key` 를 바꿔 재마운트**한다(재오픈마다 증가하는 카운터). 에디터의 `isPending` 은 넘기지 않는다 — 폼이 이미 닫혔다. 성공 토스트 제거
- [X] T013 [US2] `hooks/usePersonalRecords.ts` 에서 `useUpdatePRHistoryEntry` 를 제거하고 `hooks/__tests__/usePersonalRecords.offline.test.tsx` 를 삭제한다(T010 으로 이관 완료)
- [ ] T014 [US2] quickstart 수동 #1(수정)·#5 를 수행한다

**Checkpoint**: 삭제·수정이 낙관적. 추가는 기존 동작.

---

## Phase 5: User Story 3 — 추가가 즉시 제자리에 들어간다 (Priority: P3)

**Covers**: FR-001~005 (추가), 경계 "새 기록의 정렬 위치", research R6

**Goal**: 추가 버튼을 누르면 새 기록이 날짜 순 최종 자리에 바로 보이고, 확정 전에는 그 행을 조작할 수 없다.

**Independent Test**: 과거 날짜로 추가 → 맨 위가 아니라 제자리에 즉시, 응답 후 점프 없음. 응답 전 그 행 메뉴는 비활성.

### Tests for User Story 3 ⚠️ 먼저 작성하고 실패를 확인할 것

- [X] T015 [US3] `use-pr-history-mutations.test.tsx` 에 추가 케이스를 넣는다: 응답 전에 **음수 id** 행이 날짜 순 자리에 있다, 임시 행 `previousWeight` 가 추가 직전 현재 PR 무게다, 최대보다 무거우면 헤더가 즉시 오른다, 실패하면 임시 행만 빠지고 `onError` 가 입력값을 받는다. `useAddPRHistoryEntry`(목록 화면용)는 이 파일에서 테스트하지 않는다

### Implementation for User Story 3

- [X] T016 [US3] `useOptimisticAddPRHistory(exerciseId, onError)` 를 구현한다. 임시 행: `id = -Date.now()`, `previousWeight = base.weight`, `source: "manual"`, `createdAt = new Date().toISOString()`. 역연산 `remove(tempId)`. 성공 후 재조회가 임시 행을 실제 행으로 바꾼다
- [X] T017 [US3] 상세 화면의 추가를 새 훅으로 바꾼다. 제출 즉시 `setIsAdding(false)`, 실패 시 `RetryForm` `add` 모드로 재오픈(T012 의 `key` 방식), 성공 토스트 제거. `HistoryRow` 에 임시 행(`entry.id < 0`)이면 메뉴 버튼을 `disabled` 로 두는 prop 을 추가한다(R6 — 없는 id 삭제가 서버에서 조용히 성공해 행이 되살아난다)
- [ ] T018 [US3] quickstart 수동 #1(추가)·#3·#4·#7·#8 을 수행한다. #8 은 목록 화면 등록이 **바뀌지 않았음**을 확인하는 것이다(FR-006)

**Checkpoint**: 상세 화면의 세 조작이 전부 낙관적.

---

## Phase 6: Polish & Cross-Cutting

- [X] T019 `grep -rn "useUpdatePRHistoryEntry\|useDeletePRHistoryEntry" app components features hooks` 가 0건이고, `useAddPRHistoryEntry` 는 `RecordAddDialog.tsx` 에서만 쓰이는지 확인한다. `git diff main -- components/PersonalRecords/RecordAddDialog.tsx` 는 비어 있어야 한다
- [X] T020 quickstart 자동 검증을 실행한다: `npx jest features/personal-records`, `npx tsc --noEmit`, `npm run build` — **dev 서버를 내리고 빌드한다**(`.next` 공유 충돌). 셋 다 통과해야 커밋한다
- [X] T021 `git diff main --stat` 로 구현(테스트·문서 제외)이 400줄 이내인지 확인한다. 넘으면 멈추고 사용자에게 분할을 묻는다

---

## Dependencies & Execution Order

```
Phase 1 (Setup: testMatch)
   └→ Phase 2 (Foundational: model + 공유 캐시 조작)
         └→ Phase 3 (US1 삭제, P1) ← MVP
               └→ Phase 4 (US2 수정, P2)
                     └→ Phase 5 (US3 추가, P3)
                           └→ Phase 6 (Polish)
```

- US1~US3 은 **논리적으로 독립**이다(어느 하나만 빼도 나머지는 기존 동작으로 성립). 그러나 셋 다
  `use-pr-history-mutations.ts`·그 테스트 파일·`page.tsx` 를 수정하므로 **순서대로 진행한다**. 병렬로 하면 충돌한다.
- US3 의 폼 재오픈(T017)은 US2 가 만든 `RetryForm`·`key` 방식(T012)을 재사용한다. US3 를 먼저 하려면 T012 의 상태 부분을 가져와야 한다.

### Parallel Opportunities

- T001 과 T002 (서로 다른 파일)
- T004 의 `FAIL_FAST_WHEN_OFFLINE` export 는 T002·T003 과 독립

## Implementation Strategy

### MVP First (Phase 1~3)

T001~T009 까지가 출하 가능한 최소 단위다. 삭제만 즉시 반영되지만, 역연산·겹친 조작의 재조회 억제·
0건 복구라는 이 기능의 위험 요소가 전부 이 단계에서 검증된다. US2·US3 는 같은 틀에 조작만 더한다.

### Incremental Delivery

US1 → US2 → US3 순으로 각각 독립 커밋한다. PR 은 한 번에 올린다 — 구현 예상 약 250줄(plan)로 쪼갤 크기가 아니다.

### 이 브랜치의 범위 밖 (건드리지 말 것)

- `RecordAddDialog`(목록 화면 신규 등록)의 낙관적 반영 — FR-006, spec 결정 기록
- 삭제 되돌리기(undo) 토스트, 오프라인 대기열 — spec 결정 기록
- `actions/personalRecords.ts` 를 feature `api/` 로 옮기는 일 — plan Structure Decision
- 레거시 `useAddPersonalRecord` / `useDeletePersonalRecord` — spec 가정
- 0건 삭제 후 뒤로가기 유도 — plan 위험 절

## Notes

- 커밋 prefix `[feat]`·`[test]`·`[refactor]`, 메시지 한국어 (CLAUDE.md)
- 토스트 문구는 한국어. 기존 실패 문구 세 개("기록 추가/수정/삭제에 실패했습니다.")를 그대로 쓴다
- 입력 검증(0 이하·소수·미래 날짜)은 에디터의 `canSubmit` 이 이미 막는다. 훅에서 다시 검증하지 않는다(spec 경계)
- 테스트를 먼저 쓰고 **실패를 눈으로 확인한 뒤** 구현한다. 헌법 V 의 비협상 조항이다
