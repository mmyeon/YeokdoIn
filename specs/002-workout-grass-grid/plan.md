# Implementation Plan: 운동 잔디 그리드

**Branch**: `002-workout-grass-grid` | **Date**: 2026-09-17 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-workout-grass-grid/spec.md`

## Summary

홈 최상단에 최근 26주 × 7일 읽기 전용 그리드를 추가한다. 활동 판정의 소스는 `programs.created_at`
하나뿐이다(spec 결정 기록: `workout_sessions`/`workout_sets` 는 앱 참조 0건).

접근은 **신규 데이터 접근 없음 + 순수 model 레이어 + 표현 전용 UI** 세 겹이다.

- **api 레이어를 만들지 않는다.** 홈은 이미 `usePrograms()` 로 전체 `programs` 를 읽고 있고,
  그리드가 더 필요로 하는 필드는 `created_at` 하나뿐이다. 새 쿼리는 같은 데이터를 두 번 받는
  일이다 (근거·재검토 트리거는 research R1).
- **날짜 판정은 전부 model 레이어의 순수 함수**다. 로컬 자정 경계(FR-002)는 서버가 알 수 없는
  값이므로 — `pr-date-bounds.ts` 가 이미 같은 벽에 부딪혔다 — 타임존을 인자로 주입받아
  클라이언트에서 버킷팅한다(R2).
- **UI 는 계산하지 않는다.** model 이 뱉은 셀 배열을 그리는 일만 한다.

## Technical Context

**Language/Version**: TypeScript 5 (strict), React 19, Next.js 15 App Router

**Primary Dependencies**: TanStack React Query v5(기존 `usePrograms` 재사용), Tailwind v4.
**신규 의존성 0개** — 상세 표시에 Popover 를 쓰지 않는 이유는 R5

**Storage**: Supabase Postgres `programs` 테이블. **스키마 변경 없음**, 마이그레이션 없음

**Testing**: Jest (`preset: ts-jest`, `testEnvironment: node`). model 순수 단위 테스트.
`collectCoverageFrom` 에 신규 model 경로를 추가한다

**Target Platform**: 모바일 우선 웹, 인증 사용자 전용

**Project Type**: Web application (Next.js 단일 앱)

**Performance Goals**: 홈 첫 페인트에 이미 있는 데이터로 그리므로 추가 네트워크 왕복 0회.
그리드 계산은 182셀 + 기록 수백 건 → 1회 `useMemo` 로 충분

**Constraints**: **폭이 유일한 하드 제약**이다. 375px 에서 26열이 가로 스크롤 없이 들어가야
하고(FR-006), 그 결과 셀이 약 10px 가 되어 터치 타깃 기준과 충돌한다 — Complexity Tracking 참조

**Scale/Scope**: 신규 model 모듈 3개, 신규 UI 컴포넌트 1개(+하위), 수정 파일 `app/page.tsx` 1개

## Constitution Check

*GATE: Phase 0 이전 통과 필수. Phase 1 이후 재확인.*

| 원칙 | 판정 | 근거 |
|---|---|---|
| I. SDD | ✅ PASS | spec.md 확정(NEEDS CLARIFICATION 0건) 후 수립. 명세가 정하지 않은 것(주 시작 요일)은 계획에서 결정하고 근거를 남겼다(R3) |
| II. Type Safety | ✅ PASS | strict 유지, `any` 없음. 스키마 변경이 없으므로 `generate-types` 재실행 대상이 아니다 |
| III. Validated Inputs | ✅ PASS | 신규 사용자 입력이 없다(읽기 전용). 읽는 값은 자체 스키마에서 생성된 타입이 형태를 보장하므로 헌법 III의 "검증 불필요 대상" |
| IV. Separation of Concerns | ✅ PASS | model 은 I/O·React 없음, UI 는 계산 없음, api 는 신설하지 않고 기존 경로 경유. 역방향 참조 없음 |
| V. TDD | ✅ PASS (계획) | 로직 전부가 순수 함수 + 주입된 시각/타임존이라 Red-Green-Refactor 가 그대로 성립한다 |
| VI. Documentation First | ✅ PASS | `Intl.DateTimeFormat` 의 `timeZone` 동작과 WCAG 타깃 크기 기준을 추측하지 않고 확인해 R2·R4 에 남긴다 |
| VII. YAGNI | ✅ PASS | 농도·streak·1년 보기를 spec 이 이미 기각했다. 여기서는 **api 레이어와 Popover 의존성**을 추가로 기각한다 |

**Guardrails**: DB 를 건드리지 않는다. 마이그레이션·`db push`·파괴적 명령 모두 해당 없음.

**게이트 결과**: PASS. 위반 없음. 단 FR-006 ↔ FR-010 의 물리적 충돌은 Complexity Tracking 에 기록.

## Project Structure

### Documentation (this feature)

```text
specs/002-workout-grass-grid/
├── plan.md              # 이 파일
├── research.md          # Phase 0 산출물
├── data-model.md        # Phase 1 산출물
├── quickstart.md        # Phase 1 산출물
└── tasks.md             # /speckit-tasks 산출물 (여기서 만들지 않음)
```

`contracts/` 는 만들지 않는다. 외부에 노출하는 인터페이스가 없고(서버 액션 신설 0개),
내부 경계는 model 함수 시그니처가 전부이므로 data-model.md 에 함께 둔다.

### Source Code (repository root)

**신설**

```text
features/workout-grid/
├── model/
│   ├── local-date-key.ts        # ISO 시각 + 타임존 → 'YYYY-MM-DD'
│   ├── grid-window.ts           # 오늘 → 26주 셀 배열 (on/off/n-a)
│   ├── activity-index.ts        # programs[] → 날짜별 요약 Map
│   └── __tests__/               # 셋 모두
└── ui/
    ├── WorkoutGrid.tsx          # 그리드 + 축 라벨 + 상태 분기
    ├── GridCell.tsx
    └── GridDayDetail.tsx        # 선택한 날 요약 (인라인, 모달 아님)
```

**수정**

```text
app/page.tsx                     # 홈 최상단에 <WorkoutGrid /> 배치
jest.config.js                   # collectCoverageFrom 에 features/workout-grid/model 추가
```

**Structure Decision**

`features/workout-grid/` 를 새 feature 로 둔다. 헌법의 **삭제 테스트**를 통과한다 — 이 폴더를
지우면 "최근 훈련 이력을 한눈에 본다"는 능력 하나만 사라지고 프로그램 입력·PR·러너는 멀쩡하다.

`features/home/` 안에 넣지 않는 이유: `features/home/ui/` 는 홈의 **화면 조합** 조각들(PRBoard,
IdleHero)이고 자체 로직이 없다. 그리드는 날짜 판정 로직을 가지므로 능력 단위이지 배치 단위가
아니다. 홈은 이 feature 를 **부르는 쪽**이다.

`app/page.tsx` 는 그대로 client component 다. 그리드가 `usePrograms()` 의 캐시를 그대로 쓰므로
서버 컴포넌트로 바꿀 이유가 없고, 그 변경은 이 이슈 범위 밖이다(Branch Scope Rule).

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| **FR-006(가로 스크롤 금지) ↔ FR-010(선택 가능한 크기) 충돌**: 375px 에서 26열이면 셀이 ~10px 라 WCAG 2.5.8 의 24px 최소 타깃을 만족할 수 없다 | 두 요구가 모두 명세에 있고, 26주는 spec 결정 기록이 근거와 함께 확정한 값이다 | 열을 줄이는 안 — 명세가 정한 창을 계획이 뒤집는 일이다. 히트 영역을 `::after` 로 넓히는 안 — 12px 피치에서 인접 셀과 겹쳐 오탭이 **늘어난다**. 채택한 완화책: 셀을 실수형 폭으로 최대화(~9.7px), 각 셀을 실제 `<button>` 으로 만들어 키보드·스크린리더 경로를 정확히 열어두고, 오탭이 무해하도록(읽기 전용, 상세 패널만 갱신) 설계한다. 실사용에서 못 견디면 그때 26주 결정을 다시 연다 |

### 스파이크 실측 (2026-09-17)

구현 전에 던져버릴 스파이크(`app/spike-grass-grid/`, 커밋하지 않고 판정 후 삭제)로 26열
그리드를 실기기에 띄우고 조준 연습 20회를 돌렸다.

| 열 수 | 적중 | 한 칸 빗나감 |
|---|---|---|
| 26주 | **13 / 20 (65%)** | — |

**판정: 26주로 간다.** 35% 오탭은 낮은 수치가 아니지만, 이 그리드는 읽기 전용이고 오탭의
결과가 "상세 패널이 다른 날을 보여준다" 뿐이라 다시 누르면 복구된다. 파괴적 동작이 없다는
것이 이 수치를 감당 가능하게 만드는 유일한 이유다 — **나중에 그리드에 쓰기 동작을 붙이려는
시도가 나오면 이 줄을 근거로 막아야 한다.**

## Constitution Re-Check (Phase 1 이후)

| 원칙 | 판정 | 설계가 어떻게 만족시키는가 |
|---|---|---|
| I. SDD | ✅ PASS | data-model 의 모든 필드가 FR 번호를 역참조한다. 명세에 없는 동작을 넣지 않았다 |
| II. Type Safety | ✅ PASS | model 세 모듈의 시그니처가 `any` 없이 닫힌다. 셀 상태는 문자열 리터럴 유니온이라 UI 분기 누락을 컴파일러가 잡는다 |
| III. Validated Inputs | ✅ PASS | 입력이 없다. 조회 실패는 FR-009 대로 오류 + 재시도로 드러내며 빈 그리드로 위장하지 않는다 |
| IV. Separation of Concerns | ✅ PASS | `grid-window` 는 `now`·`timeZone` 을 주입받아 I/O 가 0이다. UI 는 `buildGrid` 결과를 그리기만 한다. api 레이어를 우회하지 않고 아예 거치지 않는다(기존 훅 경유) |
| V. TDD | ✅ PASS | quickstart 게이트 1이 "실패를 먼저 확인"을 절차로 박아뒀다. 검증 기준의 "임의 100건 대조"가 그대로 테스트가 된다 |
| VI. Documentation First | ✅ PASS | 타임존 처리와 접근성 기준을 확인 후 확정(research R2·R4) |
| VII. YAGNI | ✅ PASS | 전용 쿼리·Popover·사전 집계를 모두 보류하고 각각 재검토 트리거를 남겼다 |

**게이트 결과**: PASS.

**남은 판단 사항** (tasks 단계에서 확정)

1. ~~상세 패널을 그리드 위에 띄울지 아래에 붙일지~~ — **그리드 아래로 확정 (2026-09-17)**.
   위에 두면 월 라벨 행과 그리드 사이를 갈라 축을 읽는 흐름이 끊긴다. 아래는 구분선 하나로
   분리되고, `min-h` 로 자리를 고정해두면 선택을 바꿔도 그리드 위치가 움직이지 않는다.
2. ~~`jest.config.js` 의 `collectCoverageFrom` 추가~~ — 완료. model 커버리지 stmts 100% / branch 97%.
