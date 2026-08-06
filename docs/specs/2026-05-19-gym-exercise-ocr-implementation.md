# Gym Exercise OCR Parsing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** gym_exercises/base_exercises 테이블 추가 및 OCR Gemini 파싱을 root exercise + typed modifiers 구조로 변경한다.

**Architecture:**
- `base_exercises`: 정식 운동 마스터 (계층, PR 상속 기준)
- `gym_exercises`: raw_text → base_exercise_id 약어/줄임말 딕셔너리
- OCR 호출 시 `base_exercises.name` 목록을 Gemini 프롬프트에 주입 → Gemini가 약어를 정식 명칭으로 정규화하고 modifier를 분리해 반환

**Tech Stack:** Supabase, Next.js App Router API Route, Google Generative AI SDK, TypeScript

---

## File Map

| File | 변경 유형 | 역할 |
|------|-----------|------|
| `supabase/migrations/20260518000000_create_gym_exercises.sql` | 기존 (완성) | 테이블 생성 + 씨드 |
| `features/programs/model/ocr-types.ts` | 수정 | OcrModifier, OcrItem 타입 + Gemini 스키마 |
| `features/programs/model/ocr-mapper.ts` | 수정 | exercise_name + modifiers 처리, null 핸들링 |
| `features/programs/model/__tests__/ocr-mapper.test.ts` | 수정 | 기존 테스트 업데이트 + 신규 케이스 추가 |
| `app/api/ocr-parse/route.ts` | 수정 | base_exercises 조회 + 프롬프트 주입 |

---

## Task 1: ocr-types.ts — OcrModifier + OcrItem 타입 변경

**Files:**
- Modify: `features/programs/model/ocr-types.ts`

- [ ] **Step 1: 파일 전체를 아래 내용으로 교체**

```typescript
// features/programs/model/ocr-types.ts
import { SchemaType } from '@google/generative-ai';

export interface OcrModifier {
  pos: 'before' | 'after';
  type: 'tempo' | 'position' | 'apparatus' | 'execution';
  text: string;
}

export interface OcrItem {
  raw_text: string;
  exercise_name: string | null;
  modifiers: OcrModifier[];
  percentage: number | null;
  sets: number | null;
  reps: string | null;
  note: string | null;
}

const ocrModifierSchema = {
  type: SchemaType.OBJECT,
  properties: {
    pos:  { type: SchemaType.STRING, description: '"before" = exercise name 앞, "after" = 뒤' },
    type: { type: SchemaType.STRING, description: 'tempo | position | apparatus | execution' },
    text: { type: SchemaType.STRING, description: '예: "무릎정지 3초", "행", "박스 2칸", "발붙"' },
  },
  required: ['pos', 'type', 'text'],
};

export const ocrItemArraySchema = {
  type: SchemaType.ARRAY,
  items: {
    type: SchemaType.OBJECT,
    properties: {
      raw_text:      { type: SchemaType.STRING, description: '이미지에서 복사한 원문' },
      exercise_name: { type: SchemaType.STRING, nullable: true, description: '정식 root 운동명. 목록에 없으면 null' },
      modifiers:     { type: SchemaType.ARRAY, items: ocrModifierSchema },
      percentage:    { type: SchemaType.NUMBER, nullable: true },
      sets:          { type: SchemaType.NUMBER, nullable: true },
      reps:          { type: SchemaType.STRING, nullable: true, description: 'e.g. "3", "3+2", "3+1+2"' },
      note:          { type: SchemaType.STRING, nullable: true, description: '분류 불가 정보' },
    },
    required: ['raw_text', 'modifiers'],
  },
};
```

- [ ] **Step 2: TypeScript 타입 오류 확인**

```bash
npx tsc --noEmit 2>&1 | grep "ocr-types\|ocr-mapper\|ocr-parse"
```

Expected: `exercise` 필드 참조 오류가 `ocr-mapper.ts`, `ocr-parse/route.ts` 에서 나옴 (다음 task에서 수정)

- [ ] **Step 3: 커밋**

```bash
git add features/programs/model/ocr-types.ts
git commit -m "[feat] ocr-types: OcrModifier 타입 추가, OcrItem exercise → exercise_name + modifiers 변경"
```

---

## Task 2: ocr-mapper.test.ts — 테스트 먼저 업데이트 (TDD)

**Files:**
- Modify: `features/programs/model/__tests__/ocr-mapper.test.ts`

- [ ] **Step 1: 파일 전체를 아래 내용으로 교체**

```typescript
import { parseReps, mapOcrToProgram } from '../ocr-mapper';
import type { OcrItem } from '../ocr-types';

describe('parseReps', () => {
  it('null 이면 simple reps 1을 반환한다', () => {
    expect(parseReps(null)).toEqual({ type: 'simple', reps: 1 });
  });

  it('단순 숫자 문자열이면 simple reps를 반환한다', () => {
    expect(parseReps('3')).toEqual({ type: 'simple', reps: 3 });
  });

  it('"3+2" 형태면 complex reps를 반환한다', () => {
    expect(parseReps('3+2')).toEqual({ type: 'complex', reps: [3, 2] });
  });

  it('"3+1+2" 형태면 3개 요소의 complex reps를 반환한다', () => {
    expect(parseReps('3+1+2')).toEqual({ type: 'complex', reps: [3, 1, 2] });
  });

  it('숫자로 파싱할 수 없으면 simple reps 1을 반환한다', () => {
    expect(parseReps('abc')).toEqual({ type: 'simple', reps: 1 });
  });
});

describe('mapOcrToProgram', () => {
  it('빈 배열이면 블록이 없는 프로그램을 반환한다', () => {
    expect(mapOcrToProgram([])).toEqual({ blocks: [] });
  });

  it('단순 OcrItem을 Program Block으로 변환한다', () => {
    const items: OcrItem[] = [
      {
        raw_text: 'Snatch 80% 3x3',
        exercise_name: 'Snatch',
        modifiers: [],
        percentage: 80,
        sets: 3,
        reps: '3',
        note: null,
      },
    ];

    expect(mapOcrToProgram(items)).toEqual({
      blocks: [
        {
          movements: [{ name: 'Snatch', modifiers: [] }],
          setEntries: [
            { percentage: 80, sets: 3, reps: { type: 'simple', reps: 3 } },
          ],
        },
      ],
    });
  });

  it('modifier가 있으면 Movement.modifiers에 매핑된다', () => {
    const items: OcrItem[] = [
      {
        raw_text: '무릎정지 행 스내치 hold 80% 2x3',
        exercise_name: 'Snatch',
        modifiers: [
          { pos: 'before', type: 'tempo',    text: '무릎정지' },
          { pos: 'before', type: 'position', text: '행' },
          { pos: 'after',  type: 'tempo',    text: 'hold' },
        ],
        percentage: 80,
        sets: 2,
        reps: '3',
        note: null,
      },
    ];

    const result = mapOcrToProgram(items);
    expect(result.blocks[0].movements[0].modifiers).toEqual([
      { name: '무릎정지', position: 'before' },
      { name: '행',       position: 'before' },
      { name: 'hold',     position: 'after' },
    ]);
  });

  it('exercise_name이 null이면 name이 "UNKNOWN"인 블록을 만든다', () => {
    const items: OcrItem[] = [
      {
        raw_text: '알수없는운동 80% 3x3',
        exercise_name: null,
        modifiers: [],
        percentage: 80,
        sets: 3,
        reps: '3',
        note: null,
      },
    ];

    const result = mapOcrToProgram(items);
    expect(result.blocks[0].movements[0].name).toBe('UNKNOWN');
  });

  it('exercise_name이 null인 항목은 연속이어도 병합하지 않는다', () => {
    const items: OcrItem[] = [
      { raw_text: 'a', exercise_name: null, modifiers: [], percentage: null, sets: 1, reps: '3', note: null },
      { raw_text: 'b', exercise_name: null, modifiers: [], percentage: null, sets: 1, reps: '3', note: null },
    ];

    const result = mapOcrToProgram(items);
    expect(result.blocks).toHaveLength(2);
  });

  it('percentage가 null이면 setEntry에 null로 저장된다', () => {
    const items: OcrItem[] = [
      {
        raw_text: 'SDL 4x5',
        exercise_name: 'Slow Deadlift',
        modifiers: [],
        percentage: null,
        sets: 4,
        reps: '5',
        note: null,
      },
    ];

    const result = mapOcrToProgram(items);
    expect(result.blocks[0].setEntries[0].percentage).toBeNull();
  });

  it('sets가 null이면 1로 기본값이 적용된다', () => {
    const items: OcrItem[] = [
      {
        raw_text: 'PS 70%',
        exercise_name: 'Power Snatch',
        modifiers: [],
        percentage: 70,
        sets: null,
        reps: '3',
        note: null,
      },
    ];

    const result = mapOcrToProgram(items);
    expect(result.blocks[0].setEntries[0].sets).toBe(1);
  });

  it('같은 exercise_name이 연속으로 나오면 하나의 블록으로 병합한다', () => {
    const items: OcrItem[] = [
      { raw_text: 'Snatch 80% 3x3', exercise_name: 'Snatch', modifiers: [], percentage: 80, sets: 3, reps: '3', note: null },
      { raw_text: 'Snatch 85% 1x3', exercise_name: 'Snatch', modifiers: [], percentage: 85, sets: 1, reps: '3', note: null },
    ];

    const result = mapOcrToProgram(items);
    expect(result.blocks).toHaveLength(1);
    expect(result.blocks[0].setEntries).toHaveLength(2);
  });

  it('다른 운동이 사이에 있으면 같은 이름이어도 별도 블록으로 처리한다', () => {
    const items: OcrItem[] = [
      { raw_text: '', exercise_name: 'Snatch', modifiers: [], percentage: 80, sets: 3, reps: '3', note: null },
      { raw_text: '', exercise_name: 'Clean',  modifiers: [], percentage: 80, sets: 3, reps: '3', note: null },
      { raw_text: '', exercise_name: 'Snatch', modifiers: [], percentage: 85, sets: 1, reps: '3', note: null },
    ];

    const result = mapOcrToProgram(items);
    expect(result.blocks).toHaveLength(3);
  });

  it('여러 OcrItem을 각각 독립된 Block으로 변환한다', () => {
    const items: OcrItem[] = [
      { raw_text: 'Snatch 80% 3x3', exercise_name: 'Snatch', modifiers: [], percentage: 80, sets: 3, reps: '3', note: null },
      { raw_text: 'Clean 85% 2x3',  exercise_name: 'Clean',  modifiers: [], percentage: 85, sets: 2, reps: '3', note: null },
    ];

    const result = mapOcrToProgram(items);
    expect(result.blocks).toHaveLength(2);
    expect(result.blocks[1].movements[0].name).toBe('Clean');
  });
});
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

```bash
npx jest features/programs/model/__tests__/ocr-mapper.test.ts --no-coverage
```

Expected: `exercise` property 관련 타입/런타임 오류로 FAIL

- [ ] **Step 3: 커밋**

```bash
git add features/programs/model/__tests__/ocr-mapper.test.ts
git commit -m "[test] ocr-mapper: exercise_name + modifiers 기반으로 테스트 업데이트"
```

---

## Task 3: ocr-mapper.ts — 구현 업데이트

**Files:**
- Modify: `features/programs/model/ocr-mapper.ts`

- [ ] **Step 1: 파일 전체를 아래 내용으로 교체**

```typescript
import type { OcrItem } from './ocr-types';
import type { Block, Program, RepScheme } from '@/features/notation/model/types';

export function parseReps(reps: string | null): RepScheme {
  if (!reps) return { type: 'simple', reps: 1 };
  const parts = reps.split('+').map(Number).filter((n) => !isNaN(n) && n > 0);
  if (parts.length > 1) return { type: 'complex', reps: parts };
  return { type: 'simple', reps: parts[0] ?? 1 };
}

export function mapOcrToProgram(items: OcrItem[]): Program {
  const blocks: Block[] = [];

  for (const item of items) {
    const exerciseName = item.exercise_name ?? 'UNKNOWN';
    const lastBlock = blocks[blocks.length - 1];
    const isContinuation =
      item.exercise_name !== null &&
      lastBlock !== undefined &&
      lastBlock.movements[0].name === exerciseName;

    const setEntry = {
      percentage: item.percentage,
      sets: item.sets ?? 1,
      reps: parseReps(item.reps),
    };

    if (isContinuation) {
      blocks[blocks.length - 1] = {
        ...lastBlock,
        setEntries: [...lastBlock.setEntries, setEntry],
      };
    } else {
      blocks.push({
        movements: [{
          name: exerciseName,
          modifiers: item.modifiers.map((m) => ({
            name: m.text,
            position: m.pos,
          })),
        }],
        setEntries: [setEntry],
      });
    }
  }

  return { blocks };
}
```

- [ ] **Step 2: 테스트 실행 — 전체 통과 확인**

```bash
npx jest features/programs/model/__tests__/ocr-mapper.test.ts --no-coverage
```

Expected: 모든 테스트 PASS

- [ ] **Step 3: 커밋**

```bash
git add features/programs/model/ocr-mapper.ts
git commit -m "[feat] ocr-mapper: exercise_name + modifiers 처리, null → UNKNOWN 폴백"
```

---

## Task 4: ocr-parse/route.ts — base_exercises 조회 + 프롬프트 주입

**Files:**
- Modify: `app/api/ocr-parse/route.ts`

- [ ] **Step 1: 파일 전체를 아래 내용으로 교체**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ocrItemArraySchema } from '@/features/programs/model/ocr-types';
import type { OcrItem } from '@/features/programs/model/ocr-types';
import { supabaseServerClient } from '@/features/auth/supabase/ServerClient';

function buildPrompt(exerciseNames: string[]): string {
  const list = exerciseNames.join(', ');
  return `You are an expert weightlifting coach. Extract all exercises from this whiteboard program image.

Known exercise list (root names):
${list}

Rules:
- exercise_name: return the matching root name from the known list above. Use null if no match — do NOT guess.
- Abbreviations: HS → Hang Snatch, PS → Power Snatch, PC → Power Clean, SDL → Slow Deadlift, OHS → Overhead Squat
- Modifiers: separate from exercise_name into modifiers array
  - pos "before": appears before exercise name (e.g. 행, 무릎정지, high hang, 발붙, 박스 N칸, slow)
  - pos "after": appears after exercise name (e.g. hold, hold Nsec, pause)
  - type "tempo": 무릎정지 Nsec, hold, pause, slow
  - type "position": hang, high hang, low hang, pause midthigh
  - type "apparatus": 박스 1칸, 박스 2칸
  - type "execution": 발붙(no feet), power, squat
- Complex reps: (3+2)×3 → reps: "3+2", sets: 3
- Multiple intensities on one line: "Snatch 80% 2×2, 85% 1×3" → TWO separate objects
- Compound exercises with "&" or "+": split into separate objects each with their own exercise_name
  - Exception: reps notation like "(3+1)×3" must NOT be split
- raw_text: copy the exact source text from the image for this item
- Sets×Reps ambiguity: default to sets×reps (e.g. "3×5" = 3 sets of 5)

If a field is unclear, use null. Do not guess wrong values.`;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const file = formData.get('image') as File | null;
  if (!file) {
    return NextResponse.json({ error: 'No image provided' }, { status: 400 });
  }

  const validMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!validMimeTypes.includes(file.type)) {
    return NextResponse.json({ error: 'Unsupported image format' }, { status: 400 });
  }

  // Fetch canonical exercise names for prompt injection
  const supabase = await supabaseServerClient();
  const { data: exercises, error: dbError } = await supabase
    .from('base_exercises')
    .select('name')
    .order('name');

  if (dbError) {
    return NextResponse.json({ error: 'Failed to load exercise list' }, { status: 500 });
  }

  const exerciseNames = (exercises ?? []).map((e: { name: string }) => e.name);
  const prompt = buildPrompt(exerciseNames);

  const bytes = await file.arrayBuffer();
  const base64 = Buffer.from(bytes).toString('base64');

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const imagePart = {
    inlineData: {
      data: base64,
      mimeType: file.type,
    },
  };

  const MAX_RETRIES = 3;
  let lastError: unknown;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [imagePart, { text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: ocrItemArraySchema as any,
        },
      });

      const items: OcrItem[] = JSON.parse(result.response.text());
      return NextResponse.json({ items });
    } catch (error: unknown) {
      lastError = error;
      const is503 = error instanceof Error && error.message.includes('503');
      if (!is503 || attempt === MAX_RETRIES - 1) break;
      await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt));
    }
  }

  const message = lastError instanceof Error ? lastError.message : 'Gemini API error';
  return NextResponse.json({ error: message }, { status: 502 });
}
```

- [ ] **Step 2: TypeScript 타입 오류 없는지 확인**

```bash
npx tsc --noEmit 2>&1 | grep "ocr-parse\|route.ts"
```

Expected: 오류 없음

- [ ] **Step 3: 전체 테스트 통과 확인**

```bash
npx jest features/programs/model/__tests__/ocr-mapper.test.ts --no-coverage
```

Expected: 모든 테스트 PASS

- [ ] **Step 4: 커밋**

```bash
git add app/api/ocr-parse/route.ts
git commit -m "[feat] ocr-parse: base_exercises 목록 주입 + modifier 파싱 프롬프트 적용"
```

---

## Task 5: 스펙 문서 최종 업데이트

**Files:**
- Modify: `.claude/plans/2026-05-18-gym-exercise-ocr-parsing-design.md`

- [ ] **Step 1: DB 섹션을 최종 스키마로 교체**

스펙 내 "### 1. DB: `gym_exercises` 테이블" 섹션을 아래로 교체:

```markdown
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
```

- [ ] **Step 2: 커밋**

```bash
git add .claude/plans/2026-05-18-gym-exercise-ocr-parsing-design.md
git commit -m "[docs] 스펙 최종 업데이트: base_exercises/gym_exercises 분리 구조 반영"
```

---

## Task 6: 마이그레이션 적용 및 스모크 테스트

- [ ] **Step 1: Supabase 로컬 마이그레이션 적용**

Docker Desktop 실행 상태 확인 후:

```bash
npx supabase db reset
```

Expected: 오류 없이 완료, `base_exercises` 28개 rows, `gym_exercises` 13개 rows

- [ ] **Step 2: Studio에서 데이터 확인**

브라우저에서 `http://127.0.0.1:54323` 열고:
- `base_exercises` 테이블: root 8개, variants 20개 확인
- `gym_exercises` 테이블: abbreviation 매핑 13개 확인
- `base_exercises.parent_id` 제약 조건 작동 확인

- [ ] **Step 3: 타입 재생성**

```bash
npm run generate-types
```

Expected: `Database` 타입에 `base_exercises`, `gym_exercises` 추가됨

- [ ] **Step 4: 최종 빌드 확인**

```bash
npx tsc --noEmit
```

Expected: 타입 오류 없음

- [ ] **Step 5: 최종 커밋**

```bash
git add supabase/migrations/20260518000000_create_gym_exercises.sql
git commit -m "[feat] gym_exercises/base_exercises 마이그레이션 적용"
```
