---
description: "Task list for 화이트보드 프로그램 입력"
---

# Tasks: 화이트보드 프로그램 입력

**Input**: `specs/001-program-photo-input/` 의 설계 문서

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: 포함한다. 헌법 V(TDD)가 테스트 선행을 요구한다. 모델 계층은 Red-Green-Refactor를 지킨다.

**Organization**: 사용자 스토리별로 묶어 각 스토리를 독립적으로 구현·검증할 수 있게 한다.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 병렬 가능 (다른 파일, 선행 의존 없음)
- **[Story]**: 대응하는 사용자 스토리 (US1, US2, US3)

## Path Conventions

feature 기반 3계층. `features/programs/{model,api,ui}`, 화면은 `app/training/`,
훅은 `hooks/`, 스키마는 `supabase/migrations/`. 상세는 plan.md의 Source Code 참조.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 스키마 확장과 타입 동기화

- [X] T001 `supabase/migrations/<timestamp>_programs_text_lines.sql` 작성 — `lines text[]`, `source_text text`, `updated_at timestamptz NOT NULL DEFAULT now()` 추가, `parsed_data`의 NOT NULL 해제, `programs_content_shape` CHECK 제약, `updated_at` 갱신 트리거. DDL 전문은 data-model.md 참조. **`DROP COLUMN` 사용 금지**(헌법 Guardrails)
- [X] T002 로컬 DB에 마이그레이션 적용 후 `npm run generate-types`로 `types_db.ts` 재생성 — 마이그레이션과 생성 타입을 같은 커밋에 포함(헌법 II). 원격 `db push`는 이 단계에서 하지 않는다

**Checkpoint**: `ProgramRow`에 `lines`, `source_text`, `updated_at`이 포함되고 `parsed_data`가 nullable이 된다

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 두 저장 형태(텍스트 / 레거시 구조화)를 구분하는 공통 기반. 모든 스토리가 이것에 의존한다

**⚠️ CRITICAL**: 이 단계가 끝나기 전에는 어떤 사용자 스토리도 시작할 수 없다

- [X] T003 [P] `features/programs/model/text-program.ts`에 `TextProgram`, `DraftItem`, `SuspectSpan`, `SuspectRule` 타입 정의 (data-model.md의 애플리케이션 타입 절)
- [X] T004 [P] `features/programs/model/__tests__/text-program.test.ts` 작성 — `isTextProgram(row)`가 `lines`의 존재로 두 형태를 가르는지, `toTextProgram(row)`가 레거시 행에서 오류를 내는지. **실패 확인 후 다음 단계로**
- [X] T005 `features/programs/model/text-program.ts`에 `isTextProgram`, `toTextProgram` 구현 (T004를 통과시킨다)
- [X] T006 `features/programs/model/__tests__/library.test.ts` 작성 — 텍스트 행은 `lines` 직접 사용, 레거시 행은 `serializeProgram` 경유, 종목 필터가 항목 텍스트에 매칭, `isRunnable`이 레거시에서만 `true`. **실패 확인 후 다음 단계로**
- [X] T007 `features/programs/model/library.ts` 수정 — `toLibraryItem`이 두 형태를 처리하고, `matchesFilter`가 `movementNames` 대신 항목 텍스트에 매칭하며, `LibraryItem`에 `isRunnable: boolean` 추가 (research.md R4)
- [X] T008 `npm run type-check`를 실행해 `parsed_data` nullable 전환으로 드러난 호출부를 전부 해소 — 최소 `app/training/program-runner/[id]/page.tsx`(레거시만 진입)와 `features/programs/api/programs.ts`

**Checkpoint**: 두 저장 형태가 타입 수준에서 구분되고 목록이 양쪽을 모두 표시한다

---

## Phase 3: User Story 1 - 텍스트를 붙여넣어 프로그램을 등록한다 (Priority: P1) 🎯 MVP

**Goal**: 붙여넣기 → 「다음」 → 불릿 확인 → 저장까지 서버 왕복 없이 완주한다

**Independent Test**: `docs/gym-program-notation.md` 2장 판1을 클립보드에 넣고 붙여넣어 저장한 뒤, 목록에서 같은 7개 항목을 다시 본다

### Tests for User Story 1 ⚠️

> 먼저 작성하고 실패를 확인한 뒤 구현에 착수한다

- [X] T009 [P] [US1] `features/programs/model/__tests__/split-items.test.ts` 작성 — `\r\n`/`\r`/`\n` 동일 처리(FR-010), 빈 줄 제외(FR-007), 앞뒤 공백 제거(FR-008), 줄 내부 문자 보존(FR-008·FR-011), 순서 유지(FR-009), 예외 미발생(FR-011). 입력은 문서 2장 판1
- [X] T010 [P] [US1] `features/programs/model/__tests__/sanitize-items.test.ts` 작성 — 앞뒤 공백 제거·제어문자 제거·빈 항목 제외만 수행하고 그 외 변형이 없는지, 결과가 `[]`가 되는 경우(FR-028, FR-032)

### Implementation for User Story 1

- [X] T011 [P] [US1] `features/programs/model/split-items.ts`에 `splitIntoItems(text): string[]` 구현 — 계약은 contracts/model.md
- [X] T012 [P] [US1] `features/programs/model/sanitize-items.ts`에 `sanitizeItems(items): string[]` 구현 — 계약은 contracts/model.md
- [X] T013 [US1] `features/programs/api/programs.ts`에 `saveTextProgram` 추가 — 인증 확인, Zod 검증, `sanitizeItems` 적용, 빈 결과 거부(FR-032), `parsed_data`는 `NULL`로 INSERT (contracts/server-actions.md)
- [X] T014 [US1] `hooks/usePrograms.ts`에 `useSaveTextProgram` 추가 — 성공 시 `QUERY_KEYS.PROGRAMS` 무효화
- [X] T015 [P] [US1] `features/programs/ui/PasteStep.tsx` 신규 — textarea 입력, 분해 결과 미표시(FR-002), 공백뿐이면 진행 차단(FR-004)
- [X] T016 [P] [US1] `features/programs/ui/ProgramItemRow.tsx` 신규 — 불릿 한 행의 읽기 표시. 항목당 높이를 절제한다(FR-023). 편집은 US2에서 추가
- [X] T017 [US1] `features/programs/ui/ConfirmStep.tsx` 신규 — 항목 목록 렌더, 전체 항목 수 표시(FR-025), 저장 실행. 항목 텍스트를 재구성하지 않는다(FR-026)
- [X] T018 [US1] `app/training/program-input/page.tsx` 교체 — 입력→확인 단방향 2단계 호스트. 되돌아가기 경로를 만들지 않는다(FR-001, FR-006). 확인 단계 진입 시점의 텍스트를 `sourceText`로 고정한다(FR-031)
- [X] T019 [US1] `features/programs/ui/ProgramSavedSheet.tsx` 수정 — 러너 이동을 제거하고 목록 또는 저장본 상세로 이동

**Checkpoint**: US1만으로 등록·저장·재조회가 완결된다. 여기서 멈추고 검증할 수 있다

---

## Phase 4: User Story 2 - 인식된 내용의 오타를 고친다 (Priority: P1)

**Goal**: 숫자 자리에 문자가 들어온 곳을 표시하고, 그 자리에서 고치게 한다

**Independent Test**: `Back Squat 80% 4x2,85% 3x2,90% 2xl,95% 1xl` 를 붙여넣어 `2xl`·`1xl`만 표시되는지 확인하고, 수정·추가·삭제·병합·분할을 거쳐 저장한다

### Tests for User Story 2 ⚠️

- [X] T020 [P] [US2] `features/programs/model/__tests__/suspect-spans.test.ts` 작성 — 문서 4.2의 규칙 4종 각각에 대한 검출 케이스와, 문서 3장의 정상 표기(`80~90%`, `70%(1+2)x1`, `c.d.l`, `×`/`x` 혼용, 줄 끝 쉼표)가 검출되지 않는 케이스. **실패 확인 후 다음 단계로**
- [X] T021 [US2] 같은 파일에 SC-005 골든 케이스 추가 — `docs/gym-program-notation.md` 2장 원문 6판 40줄 전량을 입력해 4.1의 4건(`2xl`, `1xl`, `3x2. 105%`, `2+1`) 외 검출이 0건임을 단정

### Implementation for User Story 2

- [X] T022 [US2] `features/programs/model/suspect-spans.ts`에 `findSuspectSpans(line): SuspectSpan[]` 구현 — 구간 비중첩·`start` 오름차순, 표기 규약 적합성은 검사하지 않음(FR-013). 계약은 contracts/model.md
- [X] T023 [P] [US2] `features/programs/ui/SuspectText.tsx` 신규 — 구간 하이라이트 전용. 자동 수정하지 않는다(FR-014)
- [X] T024 [US2] `features/programs/ui/ProgramItemRow.tsx` 확장 — 인라인 편집 진입(FR-024), 항목 추가·삭제(FR-018), 병합·분할(FR-019). 한 항목 편집이 다른 항목에 영향을 주지 않아야 한다(FR-017)
- [X] T025 [US2] `features/programs/ui/ConfirmStep.tsx` 수정 — 편집마다 `findSuspectSpans` 재계산(FR-016), 표시가 남아 있어도 저장 허용(FR-014), 항목이 0개면 저장 거부(FR-032)
- [X] T026 [P] [US2] `PasteStep.tsx`와 `ProgramItemRow.tsx`의 입력 요소에 `spellCheck={false}`, `autoCorrect="off"`, `autoCapitalize="off"`, `autoComplete="off"` 지정 (FR-015, research.md R6)
- [X] T027 [US2] `app/training/program-input/page.tsx`에 확인 단계 이탈 경고 추가 — `beforeunload`와 앱 내 네비게이션 가로채기. 이탈은 등록 폐기로 취급한다(FR-006)
- [X] T028 [US2] 저장 실패 시 편집 상태를 유지한 채 재시도 가능하게 처리 — `ConfirmStep.tsx`의 오류 경로 (FR-020, FR-036, SC-008)

**Checkpoint**: US1 + US2로 등록 흐름이 완결된다

---

## Phase 5: User Story 3 - 저장한 프로그램을 다시 보고 고친다 (Priority: P2)

**Goal**: 저장본을 열어 수정·갱신하고 삭제한다

**Independent Test**: 저장된 프로그램을 목록에서 열어 항목을 고쳐 갱신하고(새 행이 생기지 않음), 삭제까지 수행한다

### Implementation for User Story 3

- [X] T029 [US3] `features/programs/api/programs.ts`에 `updateTextProgram` 추가 — 기존 행 갱신, `source_text` 미변경, 레거시 행 호출 시 오류 (contracts/server-actions.md, FR-021)
- [X] T030 [US3] `hooks/usePrograms.ts`에 `useUpdateTextProgram` 추가 — 성공 시 목록과 상세 쿼리 무효화
- [X] T031 [US3] `app/training/programs/[id]/page.tsx` 신규 — 저장본 열람과 항목 수정. `ProgramItemRow`와 `SuspectText`를 재사용한다
- [X] T032 [P] [US3] `features/programs/ui/ProgramCard.tsx` 수정 — `isRunnable`인 행에서만 러너 링크를 노출하고, 텍스트 프로그램은 상세로 이동 (research.md R4)
- [X] T033 [P] [US3] `features/home/ui/ProgramLibraryPreview.tsx` 수정 — 러너 링크에 동일 기준 적용
- [X] T034 [P] [US3] `features/programs/ui/ProgramList.tsx` 수정 — 러너 링크에 동일 기준 적용
- [X] T035 [US3] `routes.ts`에 프로그램 상세 경로 추가하고 목록 카드에서 진입을 연결

**Checkpoint**: 세 스토리가 모두 독립적으로 동작한다

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: 대체된 폼 입력 제거와 품질 게이트

- [X] T036 [P] 폼 UI 제거 — `features/programs/ui/`의 `ProgramForm.tsx`, `BlockEditor.tsx`, `BigStepper.tsx`, `ChipGroup.tsx`, `MovementCombobox.tsx`, `MovementPickerSheet.tsx`, `PctChip.tsx`, `StepLabel.tsx` (research.md R4)
- [X] T037 `features/programs/model/update.ts`와 `features/programs/model/__tests__/update.test.ts` 제거 — 폼 전용 모듈
- [X] T038 `features/programs/api/programs.ts`의 `saveProgram`·`SaveProgramInput`과 `hooks/usePrograms.ts`의 `useSaveProgram` 제거
- [X] T039 레거시 경로 회귀 확인 — `features/programs/model/serialize.ts`와 그 테스트를 남기고, 기존 구조화 프로그램의 목록 표시와 러너 진입이 그대로인지 검증 (quickstart.md 6절)
- [X] T040 [P] `app/training/program-input/page.tsx`에서 20줄 이상 입력의 「다음」 응답이 1초 이내인지 확인 (SC-002, SC-003)
- [ ] T041 quickstart.md의 수동 검증 1~7절 전 항목 수행
- [X] T042 `npm run test`, `npm run type-check`, `npm run build` 전부 통과 확인 — `features/programs/model/` 커버리지 임계 80% 포함 (헌법 Quality Gates)
- [X] T043 [P] `docs/specs/README.md` 인덱스에 본 기능의 구현 완료 상태 반영

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 선행 없음. 즉시 시작
- **Foundational (Phase 2)**: Phase 1 완료 후. **모든 사용자 스토리를 막는다**
- **US1 (Phase 3)**: Phase 2 완료 후
- **US2 (Phase 4)**: Phase 2 완료 후. 화면을 US1과 공유하므로 순차 진행을 권장한다
- **US3 (Phase 5)**: Phase 2 완료 후. US1·US2와 독립적으로 착수 가능
- **Polish (Phase 6)**: US1 완료 후 시작 가능(폼 제거는 화면 교체 이후). 나머지는 전 스토리 완료 후

### User Story Dependencies

- **US1 (P1)**: 다른 스토리에 의존하지 않는다. 단독으로 MVP가 된다
- **US2 (P1)**: 기능적으로 독립이나 `ProgramItemRow.tsx`와 `ConfirmStep.tsx`를 US1과 공유한다. 같은 파일을 만지므로 병렬 작업 시 충돌한다
- **US3 (P2)**: 저장된 행이 있어야 검증되지만 구현은 독립적이다. `api`·`hooks`·새 화면이 대부분이다

### Within Each User Story

- 테스트를 먼저 쓰고 실패를 확인한 뒤 구현한다 (헌법 V)
- 모델 → API → 훅 → UI → 화면 순서
- 계층 역방향 참조를 만들지 않는다 (헌법 IV)

### Parallel Opportunities

- T003과 T004는 병렬 가능
- T009·T010(테스트)을 함께, 이어서 T011·T012(구현)를 함께 진행 가능
- T015와 T016은 서로 다른 파일이라 병렬 가능
- T032·T033·T034는 서로 다른 파일이며 T007에만 의존한다

---

## Parallel Example: User Story 1

```bash
# 테스트 먼저 — 두 파일이 독립적이다
Task: "split-items 테스트 작성 (T009)"
Task: "sanitize-items 테스트 작성 (T010)"

# 실패 확인 후 구현
Task: "splitIntoItems 구현 (T011)"
Task: "sanitizeItems 구현 (T012)"

# UI 컴포넌트
Task: "PasteStep.tsx 신규 (T015)"
Task: "ProgramItemRow.tsx 신규 (T016)"
```

---

## Implementation Strategy

### MVP First (US1까지)

1. Phase 1 Setup — 스키마와 타입
2. Phase 2 Foundational — 두 형태 구분
3. Phase 3 US1 — 붙여넣기 등록
4. **멈추고 검증**: quickstart.md 1·2절과 6절(레거시 회귀)
5. 여기까지가 사용 가능한 최소 기능이다

### Incremental Delivery

1. Setup + Foundational → 기반 완료
2. US1 → 검증 → MVP
3. US2 → 검증 → 등록 흐름 완결
4. US3 → 검증 → 재조회·수정·삭제
5. Polish → 폼 제거와 품질 게이트

### 주의

- Phase 6의 폼 제거(T036~T038)를 US1 이전에 하지 않는다. 화면이 교체되기 전에 지우면 빌드가 깨진다
- 원격 DB 반영(`npx supabase db push`)은 사용자 승인 후 별도로 수행한다 (헌법 Guardrails)

---

## Notes

- [P] = 다른 파일, 선행 의존 없음
- 표기 규약과 오인식 규칙의 단일 출처는 `docs/gym-program-notation.md`다. 코드나 테스트에 목록을 복제하지 않는다
- 금지 요구사항 4건(FR-005·013·014·029)을 뒤집는 구현이 필요해지면 spec.md를 먼저 고친다 (헌법 I)
- 논리 단위마다 커밋한다
