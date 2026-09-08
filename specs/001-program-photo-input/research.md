# Phase 0 Research: 화이트보드 프로그램 입력

Technical Context에 `NEEDS CLARIFICATION` 없음. 아래는 코드베이스 조사로 확정한 결정이다.

---

## R1. 저장 형태 — 기존 `programs` 테이블 확장

**Decision**: `programs`에 `lines text[]`(확정 항목)와 `source_text text`(붙여넣기 원문)를 추가하고,
`parsed_data`의 NOT NULL을 해제한다. `lines IS NOT NULL`이면 텍스트 프로그램, 아니면 레거시다.

**Rationale**: 항목은 순서와 텍스트만 가진다(spec Key Entities). 별도 식별자도, 항목 단위 조회도,
항목 단위 갱신도 요구되지 않는다. 프로그램은 항상 통째로 읽고 통째로 쓴다.
`text[]`는 순서를 보존하고 생성 타입이 `string[]`로 떨어져 컴파일러가 형태를 보장한다.

**Alternatives considered**:
- `program_items` 별도 테이블 — 항목에 식별자와 조인 비용을 부여한다. 요구되지 않은 구조이며 헌법 VII 위반.
- `parsed_data`에 판별 필드를 넣어 재사용 — 한 컬럼이 두 의미를 갖게 되고, 레거시 행을 읽는
  `programSchema.safeParse`가 새 형태에서 실패하는 것에 의존하게 된다. 판별을 컬럼 존재로 하는 편이 명시적이다.

**Guardrail**: `parsed_data` 컬럼을 삭제하지 않는다. 레거시 행의 유일한 내용이다.

---

## R2. 원문 보존 — 삭제된 컬럼의 부활

**Decision**: `source_text` 컬럼을 새로 만든다. 과거 `raw_notation`을 되살리지 않는다.

**Rationale**: `20260424062808_drop_programs_raw_notation.sql`이 컬럼을 삭제하며 남긴 주석이
「추후 노테이션 입력 기능을 다시 제공하게 되면 새 마이그레이션으로 컬럼을 복구한다」이다.
복구가 예정된 삭제였다. 다만 `raw_notation`은 직렬화된 노테이션 문자열이었고 `source_text`는
사용자 편집 이전의 붙여넣기 원문(FR-031)이라 의미가 다르므로 이름을 재사용하지 않는다.

---

## R3. 오인식 검출의 소재지

**Decision**: 검출 규칙은 `features/programs/model/suspect-spans.ts`에 구현하고, 규칙의 근거는
`docs/gym-program-notation.md` 4.2를 참조한다. 규칙 변경은 문서를 먼저 고친다.

**Rationale**: FR-012가 문서를 단일 출처로 지정했다. 검출은 순수 문자열 함수이므로 `model`에 속하며,
서버 왕복 없이(FR-003) 편집마다 재계산(FR-016)할 수 있다.

**구현 대상 규칙 (문서 4.2)**:

| 규칙 | 예 |
| --- | --- |
| 곱셈 기호(`x`/`×`) 뒤 `l` `I` `O` | `2xl` |
| `%` 바로 앞 `O` `l` `I` | `8O%` |
| 숫자와 숫자 사이에 낀 문자 | `1l0%` |
| 숫자 뒤 마침표 다음에 강도가 이어짐 | `3x2. 105%` |

**표시하지 않을 것 (문서 3장, 정상 표기)**: `~`, `×`/`x` 혼용, `%` 뒤 공백 없음,
괄호 modifier, 줄 끝 쉼표로 이어지는 상속. SC-005의 오탐 0건 기준이 이것이다.

---

## R4. 기존 폼 입력의 처리 — 대체

**Decision**: 폼 기반 입력을 제거하고 `/training/program-input`을 붙여넣기 흐름으로 교체한다.
기존에 저장된 구조화 프로그램 행은 마이그레이션하지 않고 그대로 둔다.

**Rationale**: 사용자 결정(2026-09-08). 스펙의 「텍스트 붙여넣기 단일 경로」와 일치하며
유지보수 대상이 하나로 준다.

**제거 대상**: `ProgramForm`, `BlockEditor`, `BigStepper`, `ChipGroup`, `MovementCombobox`,
`MovementPickerSheet`, `PctChip`, `StepLabel`, 그리고 이들만 쓰는 `model/update.ts`.
`serialize.ts`는 레거시 행 표시에 계속 필요하므로 남긴다.

**연쇄 영향** (모두 이번 범위에서 처리):

| 지점 | 현재 | 조치 |
| --- | --- | --- |
| `app/training/program-runner/[id]` | `parsed_data` 파싱 실패 시 `notFound()` | 그대로 둔다. 텍스트 프로그램은 자연히 진입 불가 |
| `ProgramCard` 재생 버튼 | 모든 행에 러너 링크 노출 | 텍스트 프로그램에서는 숨긴다 (404 유도 금지) |
| `ProgramSavedSheet` | 저장 후 러너로 이동 | 저장본 상세로 이동하도록 변경 |
| `ProgramLibraryPreview`, `ProgramList` | 러너 링크 | 위와 동일 기준 적용 |
| `library.ts` 종목 필터 | `parsed_data`의 종목명으로 매칭 | 항목 텍스트에 대해 매칭. 안 그러면 새 프로그램이 필터에서 사라진다 |

필터를 텍스트 매칭으로 바꾸는 것은 표시용 검색이며 저장 형태나 규약 검사와 무관하다
(FR-013·FR-029에 저촉되지 않는다).

---

## R5. 확인 단계 이탈 처리

**Decision**: 확인 단계에서 입력 단계로 돌아가는 경로를 만들지 않는다(FR-006). 화면 이탈 시
`beforeunload`와 앱 내 네비게이션 가로채기로 폐기를 경고한다.

**Rationale**: 되돌아가기를 허용하면 「입력 원문」과 「편집된 항목」 중 무엇이 진실인지 두 개가 된다.
단방향이면 원문은 `source_text`로 한 번만 고정된다.

---

## R6. 맞춤법 검사 비활성화

**Decision**: 입력·편집 요소에 `spellCheck={false}`, `autoCorrect="off"`,
`autoCapitalize="off"`, `autoComplete="off"`를 지정한다.

**Rationale**: FR-015. 일반 언어 사전은 `hsoc`, `c.d.l`, `3×2`를 전부 오류로 표시해
의심 구간 하이라이트를 가린다. `autoCapitalize`는 문서 3.7의 대소문자 혼용 원문을 변형한다.

---

## R7. 테스트 전략

**Decision**: `model` 3개 함수(`split-items`, `sanitize-items`, `suspect-spans`)를 TDD로 먼저 작성한다.
골든 케이스는 `docs/gym-program-notation.md` 2장의 칠판 원문 6판 전체다.

**Rationale**: 헌법 V. jest 설정이 `features/**/__tests__/**/*.test.ts`만 수집하고
`testEnvironment: node`이므로, 순수 함수로 두면 그대로 대상이 된다.
`features/programs/model/` 커버리지 임계 80%가 이미 걸려 있다.

**SC-005 검증**: 원문 6판 39줄을 `suspect-spans`에 넣어 4.1의 3건 외 검출이 0인지 단정한다.
