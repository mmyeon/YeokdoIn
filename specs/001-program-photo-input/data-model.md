# Phase 1 Data Model: 화이트보드 프로그램 입력

## 저장 스키마 — `public.programs`

기존 테이블을 확장한다. 새 테이블은 만들지 않는다(research.md R1).

| 컬럼 | 타입 | 상태 | 의미 |
| --- | --- | --- | --- |
| `id` | `bigint` PK | 기존 | |
| `user_id` | `uuid` NOT NULL → `auth.users` | 기존 | 소유자 (FR-030) |
| `title` | `text` NULL | 기존 | 사용자 지정 이름 (FR-033) |
| `parsed_data` | `jsonb` | **NOT NULL 해제** | 레거시 구조화 프로그램 전용. 새 행에서는 `NULL` |
| `created_at` | `timestamptz` NOT NULL | 기존 | 생성 시각 (FR-030), 기본 이름 (FR-033) |
| `lines` | `text[]` NULL | **신규** | 사용자가 확정한 항목. 배열 순서가 표시 순서 (FR-009, FR-029) |
| `source_text` | `text` NULL | **신규** | 편집 이전 붙여넣기 원문 (FR-031) |
| `updated_at` | `timestamptz` NOT NULL | **신규** | 수정 시각 (FR-030). 트리거로 갱신 |

### 행 종류 판별

```text
lines IS NOT NULL   → 텍스트 프로그램 (이번 기능)
lines IS NULL       → 레거시 구조화 프로그램 (읽기 전용)
```

두 컬럼이 동시에 채워지는 행은 만들지 않는다.

### 무결성 제약

| 제약 | 근거 |
| --- | --- |
| `lines`가 `NULL`이 아니면 길이 1 이상 | FR-032 — 빈 프로그램 저장 거부 |
| `lines`가 `NULL`이 아니면 `parsed_data`는 `NULL` | 한 행이 두 형태를 갖지 않는다 |
| `lines`가 `NULL`이면 `parsed_data`는 NOT NULL | 레거시 행의 내용 보장 |

`CHECK` 제약으로 DB에 고정한다. 애플리케이션 검증(Zod)과 이중이지만, DB 제약은
잘못된 행이 생기는 것 자체를 막으므로 유지한다.

### 유지되는 것

- RLS 4개 정책(SELECT/INSERT/UPDATE/DELETE, `auth.uid() = user_id`) — FR-030을 이미 충족한다
- 인덱스 `programs_user_created_idx (user_id, created_at DESC)` — FR-034 최신순 조회를 이미 충족한다

새 정책·인덱스가 필요하지 않다.

### 마이그레이션 개요

`supabase/migrations/<ts>_programs_text_lines.sql`

```sql
ALTER TABLE "public"."programs"
    ADD COLUMN "lines" text[],
    ADD COLUMN "source_text" text,
    ADD COLUMN "updated_at" timestamptz NOT NULL DEFAULT now();

ALTER TABLE "public"."programs" ALTER COLUMN "parsed_data" DROP NOT NULL;

ALTER TABLE "public"."programs" ADD CONSTRAINT "programs_content_shape" CHECK (
    (lines IS NOT NULL AND array_length(lines, 1) >= 1 AND parsed_data IS NULL)
    OR (lines IS NULL AND parsed_data IS NOT NULL)
);
```

`updated_at` 자동 갱신 트리거를 함께 만든다.

**금지**: `parsed_data` 컬럼 삭제(헌법 Guardrails). 원격 반영은 사용자 승인 후.
마이그레이션과 `npm run generate-types` 산출물(`types_db.ts`)은 같은 커밋에 넣는다(헌법 II).

---

## 애플리케이션 타입

`features/programs/model/text-program.ts`

```ts
/** 저장된 텍스트 프로그램 */
export interface TextProgram {
  id: number;
  title: string | null;
  lines: string[];      // 순서 = 표시 순서
  sourceText: string;
  createdAt: string;
  updatedAt: string;
}

/** 확인 단계의 편집 중 항목. 저장되지 않는다 */
export interface DraftItem {
  key: string;          // React 키 전용. 영속되지 않는다
  text: string;
}

/** 의심 구간. 화면에만 존재한다 (spec Key Entities) */
export interface SuspectSpan {
  start: number;        // 항목 텍스트 내 문자 오프셋
  end: number;          // 배타적
  rule: SuspectRule;
}

export type SuspectRule =
  | 'digit-slot-letter'   // 곱셈 기호 뒤, % 앞, 숫자 사이의 문자
  | 'period-separator';   // 숫자 뒤 마침표 다음에 강도가 이어짐
```

`SuspectRule`의 값은 `docs/gym-program-notation.md` 4.2의 규칙에 대응한다.
규칙이 늘면 문서를 먼저 고치고 이 유니온을 넓힌다.

---

## 상태 전이 — 등록 흐름

```text
[입력]  ── 「다음」(입력이 비어있지 않을 때만) ──▶  [확인]  ── 저장 ──▶  [저장됨]
                                                     │
                                                     └─ 이탈 ──▶ 폐기 (경고 후)
```

- 입력 → 확인은 단방향이다. 되돌아가는 경로가 없다 (FR-006).
- 확인 단계 진입 시점의 텍스트가 `source_text`로 고정된다. 이후 편집은 `lines`에만 반영된다.
- 저장 실패는 상태를 되돌리지 않는다. 확인 단계에 머문 채 재시도한다 (FR-020, FR-036).

## 저장된 프로그램의 수정 (FR-021)

기존 행을 갱신한다. 새 행을 만들지 않는다. `source_text`는 변경하지 않는다 —
붙여넣기 원문의 정의가 「사용자 편집 이전」이므로, 사후 수정으로 덮으면
SC-006의 편집 비율 측정 근거가 사라진다.
