# Gym Exercise Table & OCR Modifier Parsing

**Date**: 2026-05-18  
**Branch**: feat/ocr-program-input  
**Phase**: 1 of 2

---

## Problem

현재 `exercises` 테이블은 Greg Everett(Catalyst Athletics) 기준 용어를 사용한다.
OCR로 인식된 화이트보드 텍스트(체육관 고유 용어, 약어 포함)를 어떤 운동인지 매핑하는 기준이 없다.
또한 현재 Gemini OCR 파싱은 운동명을 단일 문자열로 반환하여 "무릎정지 행 스내치 hold" 같은 modifier를 분리하지 못한다.

---

## Goals (Phase 1)

1. 체육관 기준 운동 테이블(`gym_exercises`) 추가
2. OCR → Gemini 파싱을 root exercise + modifiers 구조로 변경
3. Gemini가 체육관 정식 명칭 목록을 받아 약어/줄임말을 자동 정규화

## Out of Scope (Phase 2)

- `gym_exercises` ↔ `exercises`(Greg Everett) 연결
- parent_id 기반 PR% 계산 로직
- 매칭 결과 리뷰 UI

---

## Design

### 1. DB 스키마

**`base_exercises`** — 정식 운동 마스터 (계층, PR 상속 기준)
```sql
CREATE TABLE base_exercises (
  id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name       text NOT NULL,
  parent_id  bigint REFERENCES base_exercises(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT base_exercises_name_key   UNIQUE (name),
  CONSTRAINT base_exercises_no_self_ref CHECK (id != parent_id)
);
```

**`gym_exercises`** — raw_text → base_exercise_id 약어 딕셔너리
```sql
CREATE TABLE gym_exercises (
  id               bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  raw_text         text NOT NULL,
  base_exercise_id bigint NOT NULL REFERENCES base_exercises(id) ON DELETE CASCADE,
  created_at       timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT gym_exercises_raw_text_key UNIQUE (raw_text)
);
```

**PR% 계산 우선순위 (Phase 2에서 구현):**
1. 자기 자신 (`base_exercises.id`) PR 있으면 → 자기 자신 기준
2. 없으면 `parent_id` 기준
3. 없으면 root 까지 올라가서 기준

---

### 2. Gemini 스키마 변경

**현재 `OcrItem`:**
```typescript
interface OcrItem {
  raw_text: string;
  exercise: string;        // 단일 문자열
  percentage: number | null;
  sets: number | null;
  reps: string | null;
  note: string | null;
}
```

**변경 후:**
```typescript
interface OcrModifier {
  pos: 'before' | 'after';
  type: 'tempo' | 'position' | 'apparatus' | 'execution';
  text: string; // "무릎정지 3초", "박스 2칸", "발붙"
}

interface OcrItem {
  raw_text: string;
  exercise_name: string | null; // root 운동명. 알 수 없으면 null
  modifiers: OcrModifier[];
  percentage: number | null;
  sets: number | null;
  reps: string | null;
  note: string | null;
}
```

**modifier type 분류:**
| type | 예시 |
|------|------|
| `tempo` | 무릎정지 3초, hold 1 sec, slow |
| `position` | hang, high hang, low hang, pause midthigh |
| `apparatus` | 박스 1칸, 박스 2칸 |
| `execution` | 발붙(no feet), power, squat |

**예시:**
```
입력: "무릎정지 행 스내치 hold 80% 2×3"

출력: {
  raw_text: "무릎정지 행 스내치 hold 80% 2×3",
  exercise_name: "Snatch",
  modifiers: [
    { pos: "before", type: "tempo",    text: "무릎정지" },
    { pos: "before", type: "position", text: "행" },
    { pos: "after",  type: "tempo",    text: "hold" }
  ],
  percentage: 80,
  sets: 2,
  reps: "3",
  note: null
}
```

**복합 운동 처리:**
`&` 또는 `+`로 연결된 독립 운동은 각각 별도 OcrItem으로 분리.
단, `(3+1)×3` 처럼 reps 표기 내의 `+`는 분리하지 않음.

```
입력: "snatch pull + squat snatch 60% (3+1)×3"

출력: [
  { exercise_name: "Snatch Pull", reps: "3", sets: 3, percentage: 60, modifiers: [] },
  { exercise_name: "Squat Snatch", reps: "1", sets: 3, percentage: 60, modifiers: [] }
]
```

---

### 3. Gemini 프롬프트 변경

OCR API 호출 시:
1. `gym_exercises` 목록 조회 (DB에서 root + variants)
2. 프롬프트에 정식 명칭 목록 주입
3. Gemini가 약어 → 정식 명칭 정규화 수행

```
알려진 운동 목록:
- 스내치, 파워스내치, 행스내치, 무릎정지스내치, ...
- 클린, 파워클린, 행클린, ...
- 저크, ...

규칙:
- exercise_name은 위 목록 중 하나의 root 운동명을 반환
- 약어(HS, PS, C&J 등)는 정식 명칭으로 변환
- "무릎정지", "행", "high hang", "hold", "pause" 등은 modifiers로 분리
- pos: "before" = 운동명 앞에 위치, "after" = 운동명 뒤에 위치
- 알려진 목록에서 일치하는 root 운동명을 찾을 수 없으면 추측하지 말고 exercise_name: null 반환, raw_text 보존
- "&" 또는 "+" 로 연결된 독립 운동은 각각 별도 객체로 분리 (reps 내의 "+" 는 제외)
```

**장점:** 약어 테이블 없이 Gemini가 의미 기반으로 처리. 새 약어가 나와도 Gemini가 추론.

---

### 4. `ocr-mapper.ts` 변경

- `item.exercise` → `item.exercise_name`
- `item.exercise` → `item.exercise_name`
- `exercise_name: null` 이면 `note` 필드에 raw_text 보존, 리뷰 화면에서 수동 확인
- `modifiers` → `Movement.modifiers` 매핑 (`pos` → `position` 직접 매핑)

```typescript
// 변경 전
movements: [{ name: item.exercise, modifiers: [] }]

// 변경 후
movements: [{
  name: item.exercise_name ?? 'UNKNOWN',
  modifiers: item.modifiers.map(m => ({
    name: m.text,
    position: m.pos, // 'before' | 'after' 그대로
  })),
}]
```

---

## Implementation Order

1. `gym_exercises` 테이블 migration 작성
2. RLS 정책 추가
3. 씨드 데이터 migration (체육관 제공 목록 기준)
4. `ocr-types.ts`: `OcrModifier` 타입 + `OcrItem` 스키마 변경
5. `ocr-parse/route.ts`: DB 조회 + 프롬프트 주입 + Gemini 호출
6. `ocr-mapper.ts`: 새 포맷 처리
7. 기존 테스트 업데이트

---

## Files Affected

| File | Change |
|------|--------|
| `supabase/migrations/YYYYMMDD_gym_exercises.sql` | 신규 |
| `features/programs/model/ocr-types.ts` | `OcrItem` 변경 |
| `app/api/ocr-parse/route.ts` | DB 조회 + 프롬프트 변경 |
| `features/programs/model/ocr-mapper.ts` | `exercise` → `exercise_name + modifiers` |
| `features/programs/model/__tests__/ocr-mapper.test.ts` | 테스트 업데이트 |
