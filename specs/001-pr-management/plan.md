# Implementation Plan: 유저별 PR(개인 최고 기록) 관리

**Branch**: `mmyeon/pr-list` (feature id: `001-pr-management`) | **Date**: 2026-08-31 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-pr-management/spec.md`

## Summary

PR 등록·수정·목록·이력조회는 **이미 구현되어 동작한다**. 따라서 이 계획은 신규 구축이 아니라
**명세와 현행 구현의 갭을 메우는 작업**이다. 갭은 두 종류다.

1. **검증이 클라이언트에만 있다** — 무게 하한, 미래 날짜, 0.5kg 단위, 무게 상한이 서버 액션과
   DB 어디에도 없다. 브라우저를 거치지 않는 호출은 전부 통과한다. 헌법 III(시스템 경계에서 검증)
   위반이며 이번 작업의 핵심이다.
2. **현재 PR의 날짜를 수정할 수 없다** — `updateRecordWeight`가 `pr_date`를 오늘로 강제한다.
   FR-007이 요구하는 "무게와 날짜 수정"의 절반이 빠져 있다.

접근은 **검증 로직을 순수 함수로 분리(model 레이어) → 서버 액션이 경계에서 호출 → DB CHECK로
최종 방어**의 3중 구조다. model 레이어는 I/O가 없어 TDD로 먼저 작성한다.

## Technical Context

**Language/Version**: TypeScript 5 (strict), React 19, Next.js 15 App Router

**Primary Dependencies**: Supabase (auth + Postgres), TanStack React Query v5, Jotai, shadcn/ui, sonner

**Storage**: Supabase Postgres — `personal-records`(현재 PR 캐시), `pr_history`(시계열 진실), `exercises`(종목 카탈로그). 로컬 `127.0.0.1:54322`

**Testing**: Jest. 기존 `actions/__tests__/personalRecords.test.ts`가 체이너블 Supabase 목으로 서버 액션을 커버한다. 신규 model 레이어는 순수 단위 테스트

**Target Platform**: 모바일 우선 웹 (PWA), 인증 사용자 전용

**Project Type**: Web application (Next.js 단일 앱, 별도 백엔드 없음)

**Performance Goals**: PR 목록·상세 진입 시 체감 지연 없음. React Query 캐시로 재방문 즉시 렌더

**Constraints**: 데이터 규모가 작다(사용자당 종목 16개 × 이력 수십 건). 성능이 아니라 **정합성**이 제약이다 — `personal-records`는 `pr_history`에서 파생된 캐시이므로 둘이 어긋나면 안 된다

**Scale/Scope**: 화면 2개(목록, 상세), 서버 액션 9개, 신규 model 모듈 1개. 사용자 규모 소수(dogfooding 단계)

## Constitution Check

*GATE: Phase 0 이전 통과 필수. Phase 1 이후 재확인.*

| 원칙 | 판정 | 근거 |
|---|---|---|
| I. SDD | ✅ PASS | spec.md 확정(NEEDS CLARIFICATION 0건) 후 계획 수립. 이력 조회 누락을 발견해 명세를 먼저 고쳤다 |
| II. Type Safety | ✅ PASS | strict 유지, `any` 미사용. 스키마 변경(CHECK 제약)은 컬럼 타입을 바꾸지 않으므로 `generate-types` 재실행해도 산출물 동일하나, 규약대로 재실행해 확인한다 |
| III. Validated Inputs | ⚠️ **현행 위반 → 이번 작업의 대상** | 검증이 `PRHistoryEntryEditor`의 `canSubmit`과 `useUpdatePersonalRecord` 훅에만 존재. 서버 액션 9개 전부 무검증. `max={todayISO()}`는 브라우저 힌트일 뿐 강제력이 없다 |
| IV. Separation of Concerns | ⚠️ **현행 위반 → 아래 Structure Decision 참조** | PR 코드가 `actions/`, `hooks/`, `components/PersonalRecords/`, `types/`에 흩어져 있고 `features/` 밖이다. 순수 로직을 둘 model 레이어가 없다 |
| V. TDD | ✅ PASS (계획) | 신규 검증 로직은 순수 함수이므로 Red-Green-Refactor가 자연스럽다. 서버 액션은 기존 목 인프라 재사용 |
| VI. Documentation First | ✅ PASS | Postgres CHECK 제약, Supabase RLS 동작은 공식 문서로 확인 후 확정(research.md) |
| VII. YAGNI | ✅ PASS | 이력 항목 직접 편집 UI의 존폐를 이번에 정하지 않고 현행 유지. 자동 PR 감지·단위 변환·종목 추가 모두 범위 밖 |

**Guardrails**: 원격 DB 파괴적 명령 없음. 신규 마이그레이션은 CHECK 제약 **추가**만 하며 컬럼·행을
지우지 않는다. 로컬 검증 후 `db push`는 사용자 승인 시에만.

**게이트 결과**: PASS. III·IV의 현행 위반은 이번 작업이 해소 대상으로 삼으므로 차단 사유가 아니다.

## Project Structure

### Documentation (this feature)

```text
specs/001-pr-management/
├── plan.md              # 이 파일
├── research.md          # Phase 0 산출물
├── data-model.md        # Phase 1 산출물
├── quickstart.md        # Phase 1 산출물
├── contracts/
│   └── server-actions.md
├── checklists/
│   └── requirements.md
└── tasks.md             # /speckit-tasks 산출물 (여기서 만들지 않음)
```

### Source Code (repository root)

**현재 위치 (헌법 IV 위반 상태)**

```text
actions/personalRecords.ts              # 서버 액션 9개, 364줄
actions/__tests__/personalRecords.test.ts
hooks/usePersonalRecords.ts             # React Query 훅 9개, 167줄
components/PersonalRecords/             # RecordAddDialog, PRHistoryEntryEditor,
                                        # PRSparkline, WorkoutSelect
types/personalRecords.ts
app/settings/personal-records/          # 목록 + [id] 상세 화면
```

**목표 위치**

```text
features/personal-records/
├── ui/
│   ├── RecordAddDialog.tsx
│   ├── PRHistoryEntryEditor.tsx
│   ├── PRSparkline.tsx
│   ├── WorkoutSelect.tsx
│   └── usePersonalRecords.ts           # React Query 훅
├── model/                              # ★ 신설 — 순수 검증 로직, I/O·React 없음
│   ├── validate-pr-input.ts
│   └── __tests__/validate-pr-input.test.ts
├── api/
│   ├── personalRecords.ts              # 서버 액션
│   └── __tests__/personalRecords.test.ts
└── types/
    └── index.ts

app/settings/personal-records/          # 화면은 그대로 (라우트는 app/ 소속)
supabase/migrations/<new>_pr_constraints.sql
```

**Structure Decision**

PR 코드 전체를 `features/personal-records/` 로 옮긴다. 근거:

- **삭제 테스트 통과** — 이 폴더를 지우면 "내 최고 기록을 기록·조회한다"는 능력 하나만 사라지고
  나머지는 멀쩡하다. 헌법이 정의하는 feature다.
- **model 레이어를 만들려면 어차피 feature 디렉토리가 필요하다.** 검증 함수만 `features/`에 두고
  액션·훅·컴포넌트를 밖에 남기면 한 기능이 두 곳에 살게 되어 배치 규칙(Single Source of Truth)을
  더 심하게 어긴다. 절반만 옮기는 쪽이 안 옮기는 쪽보다 나쁘다.
- **비용이 작다** — 대상 파일 8개, 총 958줄. 로직 변경 없는 경로 이동이며 타입 체커가 누락을 잡는다.

`app/settings/personal-records/`의 라우트 파일은 그 자리에 둔다. Next.js App Router에서 라우트
위치는 URL이 결정하므로 feature로 옮길 수 없다. 화면은 feature의 `ui`를 조합만 한다.

**한 가지 판단이 필요한 지점**: 이 이동은 명세가 요구한 동작이 아니라 헌법 준수를 위한
리팩토링이다. Branch Scope Rule(하나의 브랜치 = 하나의 이슈)에 비추면 별도 브랜치 후보다.
다만 model 레이어 없이는 검증 로직을 헌법에 맞게 배치할 수 없으므로 "구현에 필수적인 의존성
수정"에 해당한다고 판단했다. 이동을 별도 브랜치로 빼길 원하면 tasks 단계에서 분리한다.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| 검증을 model·서버 액션·DB CHECK 3중으로 배치 | 헌법 III은 경계에서의 검증을 요구하고, `pr_history`는 서버 액션 외 경로로도 쓰기가 가능하다. DB 제약은 마지막 방어선 | 서버 액션 검증만으로 끝내는 안 — 액션을 우회하는 쓰기(수동 SQL, 향후 자동 감지 경로)를 막지 못한다. CHECK 제약은 한 줄이고 비용이 사실상 0 |
| 기존 코드의 feature 디렉토리 이동 | 헌법 IV와 배치 규칙 준수. model 레이어의 거처 확보 | 검증 함수를 `utils/`에 두는 안 — 한 feature에서만 쓰이는 로직을 공유 디렉토리에 두는 것이라 배치 규칙 위반이고, 나중에 더 큰 정리 비용을 남긴다 |

## Constitution Re-Check (Phase 1 이후)

설계 산출물을 만든 뒤 재평가한 결과다.

| 원칙 | 판정 | 설계가 어떻게 만족시키는가 |
|---|---|---|
| I. SDD | ✅ PASS | 모든 산출물이 FR 번호를 역참조한다. 명세에 없는 동작을 설계에 넣지 않았다 |
| II. Type Safety | ✅ PASS | `validatePRInput` 시그니처가 `any` 없이 닫혀 있다. CHECK 제약은 컬럼 타입을 바꾸지 않으므로 `types_db.ts` 산출물이 동일하나, 규약대로 재생성해 확인하고 커밋에 포함한다 |
| III. Validated Inputs | ✅ PASS (해소) | model → 서버 액션 → DB CHECK 3중. 미래 날짜만 2중이며 그 근거를 research.md R3에 실측과 함께 남겼다 |
| IV. Separation of Concerns | ✅ PASS (해소) | `model`은 순수 함수뿐이고 `today`를 주입받아 I/O가 없다. `ui`·`api`가 같은 model을 참조하며 역방향 참조는 없다 |
| V. TDD | ✅ PASS | quickstart 게이트 1이 "실패를 먼저 확인"을 명시적 절차로 박아뒀다 |
| VI. Documentation First | ✅ PASS | 0.5kg 부동소수점 안전성과 CHECK의 `current_date` 허용 여부를 **추측하지 않고 로컬 Postgres에서 실행해** 확인했다. 후자는 최초 가정이 틀렸음이 드러나 근거를 교체했다 |
| VII. YAGNI | ✅ PASS | 이력 편집 UI 존폐, dual-write 원자성(RPC), 자동 PR 감지를 모두 보류하고 보류 이유를 남겼다 |

**게이트 결과**: PASS. Phase 0에서 위반이던 III·IV가 설계로 해소됐다.

**남은 판단 사항** (tasks 단계에서 확정)

1. `features/personal-records/` 이동을 이 브랜치에 포함할지, 별도 브랜치로 뺄지 — Structure Decision 참조
2. `db push` 시점 — 원격 위반 데이터 확인 후 사용자 승인 필요
