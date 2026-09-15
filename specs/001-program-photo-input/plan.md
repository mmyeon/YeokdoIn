# Implementation Plan: 화이트보드 프로그램 입력

**Branch**: `mmyeon/program-input` | **Date**: 2026-09-08 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-program-photo-input/spec.md`

## Summary

OS 카메라가 인식한 칠판 텍스트를 붙여넣고, 줄 단위 항목으로 확인·수정한 뒤 텍스트 그대로 저장한다.
해석하지 않는다. 분해·위생·오인식 검출은 전부 클라이언트 순수 함수이며, 서버는 저장만 한다.

기존 폼 기반 입력(`/training/program-input`)을 대체한다. 기존에 저장된 구조화 프로그램
(`programs.parsed_data`)은 손대지 않고 읽기 전용 레거시로 남긴다.

## Technical Context

**Language/Version**: TypeScript 5 (strict)

**Primary Dependencies**: Next.js 15 (App Router), React 19, Supabase JS, React Query, Zod, Tailwind + shadcn/ui

**Storage**: Supabase Postgres — 기존 `public.programs` 테이블 확장

**Testing**: Jest + ts-jest (`testEnvironment: node`). `features/*/model` 커버리지 임계 80%

**Target Platform**: 모바일 웹 (`max-w-md` 단일 컬럼)

**Project Type**: Next.js 웹 앱, feature 기반 3계층(`ui` / `model` / `api`)

**Performance Goals**: 「다음」 → 불릿 표시 1초 이내(SC-002), 20줄 입력에서도 동일(SC-003)

**Constraints**:
- 분해 단계에 서버 왕복 없음 (FR-003) → 분해·검출은 전부 `model` 순수 함수
- 구조화된 값 저장 금지 (FR-029)
- 표기 규약 적합성 검사 금지 (FR-013)
- 오인식 검출 규칙의 단일 출처는 `docs/gym-program-notation.md` 4장 (FR-012)

**Scale/Scope**: 사용자당 수백 건. 화면 3개(입력 / 확인 / 목록·상세)

## Constitution Check

*GATE: Phase 0 이전 통과 필수. Phase 1 설계 후 재검증.*

| 원칙 | 판정 | 근거 |
| --- | --- | --- |
| I. SDD | ✅ | spec.md 확정 후 계획 수립. 금지 요구사항 4건(FR-005/013/014/029)을 뒤집으려면 spec을 먼저 고친다 |
| II. Type Safety | ✅ | 마이그레이션과 `npm run generate-types` 산출물을 같은 커밋에 포함. `any` 없음 |
| III. Validated Inputs | ✅ | 붙여넣기 텍스트는 사용자 입력 → 저장 경계에서 Zod 검증(FR-032 포함). DB 생성 타입 응답은 재검증하지 않음 |
| IV. Separation of Concerns | ✅ | 분해·위생·검출 = `model`(I/O·React 없음), 저장 = `api`, 화면 = `ui`. 역방향 참조 없음 |
| V. TDD | ✅ | `model` 3개 함수는 테스트 선행. 계약은 contracts/에 고정 |
| VI. Documentation First | ✅ | 표기 규약·오인식 목록을 명세에 복제하지 않고 `docs/gym-program-notation.md`를 참조 |
| VII. YAGNI | ✅ | `program_items` 별도 테이블을 만들지 않는다. 항목은 순서와 텍스트뿐이므로 배열 컬럼으로 충분하다. 구조화 파싱을 위한 확장 지점을 미리 두지 않는다 |

**Guardrails**: `programs.parsed_data`를 삭제하지 않는다(`DROP COLUMN` 금지). NOT NULL 해제만 수행한다.
원격 DB 반영(`supabase db push`)은 사용자 승인 후 실행한다.

위반 없음. Complexity Tracking 불필요.

## Project Structure

### Documentation (this feature)

```text
specs/001-program-photo-input/
├── plan.md              # 이 파일
├── spec.md
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
├── contracts/           # Phase 1
│   ├── model.md
│   └── server-actions.md
├── checklists/
│   └── requirements.md
└── tasks.md             # /speckit-tasks 산출물 (여기서 만들지 않음)
```

### Source Code (repository root)

```text
features/programs/
├── model/
│   ├── split-items.ts          # 신규 — 텍스트 → 항목 분해 (FR-007~011)
│   ├── sanitize-items.ts       # 신규 — 저장 위생 처리 (FR-028, FR-032)
│   ├── suspect-spans.ts        # 신규 — 오인식 구간 검출 (FR-012, 문서 4.2)
│   ├── text-program.ts         # 신규 — 행 판별 + 표시용 항목 도출
│   ├── library.ts              # 수정 — 두 저장 형태를 모두 다루도록
│   └── __tests__/              # 위 4개 모듈의 테스트
├── api/
│   └── programs.ts             # 수정 — 텍스트 프로그램 저장/갱신 액션 추가
└── ui/
    ├── PasteStep.tsx           # 신규 — 입력 단계 (FR-001~004, FR-015)
    ├── ConfirmStep.tsx         # 신규 — 확인 단계 (FR-016~026)
    ├── ProgramItemRow.tsx      # 신규 — 불릿 1행 편집·병합·분할
    ├── SuspectText.tsx         # 신규 — 의심 구간 하이라이트
    ├── ProgramCard.tsx         # 수정 — 텍스트 프로그램은 러너 진입 숨김
    ├── ProgramSavedSheet.tsx   # 수정 — 저장 후 러너 이동 제거
    └── ProgramForm.tsx 외 폼 UI # 제거 대상 (research.md R4)

app/training/program-input/page.tsx   # 교체 — 2단계 흐름 호스트
app/training/programs/[id]/page.tsx   # 신규 — 저장본 열람·수정 (FR-021)

supabase/migrations/<ts>_programs_text_lines.sql   # 신규
supabase/seed.sql                                   # 동기화
types_db.ts                                         # 재생성
```

**Structure Decision**: 새 feature를 만들지 않고 기존 `features/programs`를 확장한다.
헌법의 삭제 테스트 기준으로 「프로그램 등록」은 하나의 능력이며, 입력 수단이 폼에서
붙여넣기로 바뀌는 것은 같은 능력의 구현 교체다. `features/notation`은 이 기능이 참조하지
않는다(구조화 파싱을 하지 않으므로).

## Post-Design Constitution Re-check

*Phase 1 설계(data-model.md, contracts/) 완료 후 재검증.*

| 원칙 | 판정 | 설계에서 확인된 근거 |
| --- | --- | --- |
| I. SDD | ✅ | 모든 설계 항목이 FR/SC에 대응한다. 근거 없는 요소 없음 |
| II. Type Safety | ✅ | `parsed_data`의 nullable 전환이 두 형태를 구분하지 않는 기존 호출부를 컴파일 오류로 드러낸다 |
| III. Validated Inputs | ✅ | 붙여넣기 텍스트는 저장 액션에서 Zod 검증 + DB `CHECK` 제약. 생성 타입 응답은 재검증하지 않음 |
| IV. Separation of Concerns | ✅ | `model` 3개 함수 전부 동기 순수 함수. `ui`·`model`이 DB 클라이언트를 직접 호출하지 않음 |
| V. TDD | ✅ | contracts/model.md가 테스트 대상 계약을 고정. SC-005 골든 케이스가 필수 테스트로 지정됨 |
| VI. Documentation First | ✅ | 오인식 규칙 목록을 계약에 복제하지 않고 `docs/gym-program-notation.md` 4.2를 참조 |
| VII. YAGNI | ✅ | 새 테이블·새 feature·새 계층 없음. 컬럼 3개 추가와 제약 1개가 전부 |

**Guardrails 확인**: 마이그레이션에 `DROP COLUMN`·`DROP TABLE`·`TRUNCATE`·`DELETE` 없음.
`ALTER COLUMN DROP NOT NULL`과 `ADD COLUMN`만 사용한다. 원격 반영은 사용자 승인 후.

위반 없음. 설계 후에도 Complexity Tracking 불필요.

## Complexity Tracking

해당 없음 — Constitution Check 위반 없음.
