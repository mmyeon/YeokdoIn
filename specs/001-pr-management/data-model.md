# Phase 1 Data Model: 유저별 PR 관리

**Date**: 2026-08-31 | **Plan**: [plan.md](./plan.md) | **Research**: [research.md](./research.md)

스키마는 이미 존재한다. 이 문서는 **현행 스키마 + 이번에 추가할 제약**을 기술한다.
컬럼 추가·삭제·타입 변경은 없다.

---

## Entity: Exercise (종목)

테이블 `public.exercises` — **읽기 전용**. 이 기능은 조회만 한다.

| 필드 | 타입 | 비고 |
|---|---|---|
| `id` | bigint PK | |
| `name` | text | 영문 canonical name. `buildAliasMap`이 lowercase 키로 쓰므로 표기가 어긋나면 조용히 매칭 실패 |
| `created_at` / `updated_at` | timestamptz | |

**규칙**: 종목의 진실은 이 테이블이다. 명세도 코드도 종목 목록을 복제하지 않는다.
이번 작업은 행을 추가·개명·삭제하지 않는다.

---

## Entity: PR History Entry (과거 기록) — 진실의 원천

테이블 `public.pr_history`

| 필드 | 타입 | 제약 | 비고 |
|---|---|---|---|
| `id` | bigint PK | identity | |
| `user_id` | uuid | FK → `auth.users` ON DELETE CASCADE, NOT NULL | |
| `exercise_id` | bigint | FK → `exercises` ON DELETE **RESTRICT**, NOT NULL | 참조된 종목은 삭제 불가 |
| `previous_weight` | numeric | nullable | 기록 당시의 직전 PR. 최초 기록이면 NULL |
| `new_weight` | numeric | NOT NULL | **★ 신규 CHECK 대상** |
| `pr_date` | date | NOT NULL, default `current_date` | |
| `note` | text | nullable | |
| `source` | text | NOT NULL, CHECK IN (`manual`, `auto_detected_from_workout`) | 현재는 `manual`만 기록됨 |
| `created_at` | timestamptz | NOT NULL default now() | |

**인덱스**: `(user_id, exercise_id, pr_date DESC)` — 종목 상세의 이력 조회 경로와 일치한다.

**RLS**: 활성. 4개 정책 모두 `auth.uid() = user_id`.

### 추가할 제약

```sql
ALTER TABLE public.pr_history
  ADD CONSTRAINT pr_history_new_weight_positive   CHECK (new_weight > 0),
  ADD CONSTRAINT pr_history_new_weight_max        CHECK (new_weight <= 1000),
  ADD CONSTRAINT pr_history_new_weight_half_kg    CHECK (new_weight * 2 = trunc(new_weight * 2));
```

`previous_weight`에는 제약을 걸지 않는다. 파생 스냅샷이고 NULL이 정상 값이다.
`pr_date`의 미래 방지는 CHECK로 걸지 않는다 — 근거는 [research.md R3](./research.md).

---

## Entity: Personal Record (현재 PR) — 파생 캐시

테이블 `public."personal-records"` (하이픈 포함 이름이므로 인용 필요)

| 필드 | 타입 | 제약 | 비고 |
|---|---|---|---|
| `id` | bigint PK | identity | |
| `user_id` | uuid | NOT NULL | |
| `exercise_id` | bigint | FK → `exercises`, NOT NULL | |
| `weight` | double precision | NOT NULL | **★ 신규 CHECK 대상** |
| `pr_date` | date | NOT NULL | |
| `created_at` | timestamptz | default now() | |
| `updated_at` | timestamptz | nullable | |

**유니크**: `UNIQUE (user_id, exercise_id)` — FR-006(사용자·종목당 1건)을 DB가 강제한다.

**RLS**: 활성. 4개 정책 모두 `auth.uid() = user_id`.

### 추가할 제약

```sql
ALTER TABLE public."personal-records"
  ADD CONSTRAINT personal_records_weight_positive CHECK (weight > 0),
  ADD CONSTRAINT personal_records_weight_max      CHECK (weight <= 1000),
  ADD CONSTRAINT personal_records_weight_half_kg  CHECK (weight * 2 = trunc(weight * 2));
```

`double precision`에서 이 표현식이 안전한 이유는 [research.md R1](./research.md) 참조 (0.5는 이진
부동소수점에서 정확히 표현된다).

---

## 관계와 파생 규칙

```
auth.users 1 ──< pr_history >── 1 exercises
     │                                │
     └──< personal-records >──────────┘
              (UNIQUE user_id, exercise_id)
```

**핵심 불변식**: `personal-records`는 `pr_history`의 파생물이다.

```
personal-records(u, e).weight   = MAX(pr_history(u, e).new_weight)
personal-records(u, e).pr_date  = 그 최대 무게 행의 pr_date
pr_history(u, e) 가 비면        → personal-records(u, e) 행도 삭제
```

이 재계산은 `recomputeCache()`가 담당하며 모든 쓰기 경로가 이를 거친다.
비원자성의 한계는 [research.md R4](./research.md)에 기록했다.

---

## 검증 규칙 (model 레이어)

`features/personal-records/model/validate-pr-input.ts` — 순수 함수, I/O·React 없음.

| 규칙 | 조건 | 위반 시 메시지 | 근거 |
|---|---|---|---|
| 무게 필수 | 값이 존재하고 숫자 | "무게를 입력해주세요." | FR-008 |
| 무게 하한 | `weight > 0` | "무게는 0보다 커야 합니다." | FR-008 |
| 무게 상한 | `weight <= 1000` | "무게가 너무 큽니다. 다시 확인해주세요." | Edge case |
| 0.5kg 단위 | `weight * 2 === Math.trunc(weight * 2)` | "무게는 0.5kg 단위로 입력해주세요." | FR-010 |
| 날짜 필수 | `YYYY-MM-DD` 형식 | "날짜를 입력해주세요." | FR-003 |
| 미래 금지 | `prDate <= 오늘` | "미래 날짜는 기록할 수 없습니다." | FR-009 |

**호출 지점**: UI(즉시 피드백) → 서버 액션(경계 강제) → DB CHECK(최종 방어, 날짜 제외).
같은 순수 함수를 UI와 서버 액션이 공유하므로 규칙이 갈라지지 않는다.

---

## 상태 전이

PR은 종목별로 다음 상태를 갖는다.

```
[미등록] ──(첫 기록 추가)──> [등록됨]
[등록됨] ──(더 무거운 기록 추가)──> [등록됨, 무게 갱신]
[등록됨] ──(더 가벼운 기록 추가)──> [등록됨, 무게 유지 · 이력만 증가]
[등록됨] ──(현재 PR 수정)──────> [등록됨, 재계산]
[등록됨] ──(이력 전부 삭제)────> [미등록]
```

"더 가벼운 기록 추가"가 현재 PR을 낮추지 않는 것은 캐시가 `MAX`로 정의되기 때문이다.
명세의 "새 값이 기존보다 낮아도 저장을 허용한다"는 이력에 남는다는 뜻이며,
현재 PR 자체를 낮추려면 기존 최고 기록 항목을 수정·삭제해야 한다.
