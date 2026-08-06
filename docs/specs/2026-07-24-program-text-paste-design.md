# 프로그램 텍스트 붙여넣기 → 세트별 불렛 렌더링

**Date**: 2026-07-24
**Status**: 설계 확정 (구현 대기)
**Scope**: V1 라이트 — 만들어서 dogfooding 후 개선

---

## 문제

훈련날 프로그램 원본은 인스타 캡처나 화이트보드 사진에서 **OS 텍스트 인식(iOS Live Text 등)으로 긁은 날것의 텍스트**다. 이 텍스트를 앱에 붙여넣으면 세트마다 한 줄씩 불렛으로 펼쳐, 훈련 중 "지금 이 세트"를 화면에 띄우고 싶다.

핵심 제약:
- **입력 타이핑 0** — 붙여넣기만. OS가 OCR을 대신하므로 앱은 OCR을 짓지 않는다. `project_training_hub_v1`의 "OCR 배제" 결정과 충돌하지 않는다.
- **해석 0** — 운동명이 뭘 의미하는지, 어느 PR 기준인지, kg이 얼마인지 **일절 계산하지 않는다.** 긁힌 텍스트를 그대로 보여준다.
- 붙여넣기 결과는 날것의 OCR이라 노이즈(해시태그·이모지·오타·이상한 줄바꿈)가 섞인다 → **정확한 파싱은 불가능**, 틀렸을 때 싸게 고치는 게 핵심.

---

## 결정 요약

| # | 결정 | 근거 |
|---|------|------|
| D1 | 접근 A — 얇은 신규 feature `features/program-text/` | 기존 `Program`/alias/PR 모델의 중력에서 자유. "해석 안 함"을 타입으로 강제 |
| D2 | 원문(`raw_text`)만 저장, 파싱은 렌더 시점 매번 | 파서 개선이 과거 프로그램에 소급 적용. 파싱 결과 마이그레이션 불필요 |
| D3 | Supabase `training_programs` 테이블, 날짜별 1개 | 텍스트라 가벼워 서버 비용 0. `training_notes`의 `(user_id, date)` 패턴 재사용 |
| D4 | 세트 구분자 = **쉼표와 줄바꿈 둘 다** | 사용자 확정 |
| D5 | 파싱 실패 대응 = 원문 textarea 상시 편집 가능 | 오타·노이즈·운동종목 오탈자를 고치면 불렛 재렌더 |
| D6 | 현재 세트 = 이전/다음 수동 이동, 로컬 상태만 | 그날 훈련 중에만 의미. 저장 안 함 |
| D7 | `&`/`+`로 묶인 복합 동작은 **쪼개지 않고 한 불렛** | 복합은 한 세트로 수행하므로 "현재 세트" 표시엔 붙어 있어야 함. dogfooding 후 재검토 |
| D8 | 운동명 상속 조건 = **문자(한글/영문)가 전혀 없는 조각**일 때만 | "숫자로 시작하면 상속"은 `1 PS + 1 HS + 2 OHS`·`2-Position Power Snatch` 같은 실제 표기를 오상속시킴 |

---

## 기존 도메인 규칙 문서 (참조)

프로그램 표기 규칙의 정본은 아래에 흩어져 있다. **`main`에 없고 워크트리·삭제된 커밋에 있으므로** 찾을 때 주의.

| 위치 | 내용 |
|------|------|
| `features/notation/model/parser.ts` (커밋 `8ef76a4`에서 삭제) | **문법 정본.** `program := block ("," block)*` / `block := movement ("&" movement)* percentage? reps sets modifier*` / `reps := "(" N ("+" N)* ")" \| N` / `sets := "x" N`. 쉼표 블록의 앞 movements 상속을 `parseBlock(inheritedMovements)`로 구현 |
| `.worktrees/ocr-page-investigate/.claude/plans/2026-05-18-gym-exercise-ocr-parsing-design.md` | modifier 4분류(tempo/position/apparatus/execution), before/after 위치, `base_exercises`/`gym_exercises` alias 사전 |
| `.worktrees/ocr-page-investigate/.claude/plans/2026-05-19-gym-exercise-ocr-implementation.md` | Gemini 프롬프트의 약어표(HS/PS/PC/SDL/OHS), `pause midthigh` 등 position modifier 목록 |
| `.worktrees/ocr-page-investigate/.claude/plans/2026-05-19-exercise-vocabulary-unification-design.md` | 운동 어휘 통일(Catalyst `exercises` → `base_exercises`) |
| `.worktrees/ocr-page-investigate/docs/superpowers/specs/2026-05-15-ocr-program-input-design.md` | 복합 표기 예시 `1 PS + 1 HS + 2 OHS`, 쉼표 다중 강도 규칙 |
| `~/Workspace/catalyst_exercises.{json,csv}` | Catalyst 운동 목록 원본 데이터. 이번 작업엔 미사용(해석 0) |

**본 스펙이 위 문서와 의도적으로 다른 점:**
- OCR 문서군은 `&`/`+` 복합을 **별도 항목으로 분리**하라고 하지만, 본 스펙은 D7에 따라 **붙여둔다.** OCR 문서의 목적은 PR 매칭용 구조화였고, 본 스펙의 목적은 세트 표시이기 때문.
- 약어 정규화·modifier 분리·base_exercises 매핑은 전부 **미적용**(해석 0 원칙). `무릎정지 스내치 hold`는 통째로 운동명 문자열로 남는다.

**기각한 접근:**
- **B (기존 `Program` 모델 역파싱 + program-runner 재사용):** `Program`은 `percentage: number`, `reps: RepScheme`처럼 구조화를 요구 → OCR 노이즈를 스키마에 못 넣으면 파싱이 통째로 실패. "그대로 보여주기"와 정면 충돌.
- **C (IndexedDB 로컬 저장):** 기기 변경 시 유실. 텍스트는 가벼워 Supabase 비용이 사실상 0이라 서버 저장 이점이 큼.

---

## 아키텍처

```
features/program-text/
├── model/
│   ├── parse.ts               # parseProgramText(raw): Bullet[] — 순수함수, 해석 0
│   └── __tests__/parse.test.ts
├── api/
│   └── programs.ts            # Supabase CRUD (training_programs)
└── ui/
    ├── ProgramTextInput.tsx    # textarea 붙여넣기/수정
    ├── ProgramBulletList.tsx   # 불렛 렌더 + 현재 세트 포커스 + 이전/다음
    └── useProgramText.ts       # React Query 훅 (조회/upsert)
```

**미접촉:** `features/notation`, `features/programs`(Program/alias/PR), `features/program-runner`. 개념이 겹치는 화면이 둘 생기지만, dogfooding으로 어느 쪽이 살아남을지 확인 후 통합 판단(V2).

라우트: `app/training/program-text/page.tsx` (신규). 조립만 담당.

---

## 파서 규칙 (`parseProgramText`)

```typescript
interface Bullet {
  movement: string;      // 운동명 (공백 포함 가능, 상속되었을 수 있음)
  prescription: string;  // 나머지 원문 조각 (%·reps·sets 등, 변환 안 함)
}

export function parseProgramText(raw: string): Bullet[];
```

규칙 (위 → 아래 우선순위):

1. 원문을 **줄바꿈으로 분리** → 각 줄을 다시 **쉼표(`,`)로 분리**. 두 구분자 모두 세트 경계.
2. 각 조각에서 **운동명 = 맨 앞 텍스트**(숫자·`%`·`x`/`*`/`×` 가 나오기 전까지, 공백 포함). 나머지 = `prescription`.
   - 예: `back squat 60%` → movement `back squat`, prescription `60%`.
   - modifier 는 분리하지 않는다: `무릎정지 스내치 hold 80% 3x2` → movement `무릎정지 스내치 hold`.
3. **상속 (D8):** 조각에 **문자(한글/영문)가 전혀 없으면** → 바로 앞 불렛의 movement 상속.
   - `squat 60% 3*2, 70% 3*2` → `70% 3*2`에 문자 없음 → `[squat|60% 3*2]`, `[squat|70% 3*2]` ✓
   - `1 PS + 1 HS + 2 OHS 75% 3x1` → 문자 있음 → 상속하지 않고 자체 운동명 ✓
   - 상속할 앞 불렛이 없으면(첫 조각) 상속하지 않는다.
4. **복합 동작 미분리 (D7):** `&`/`+`는 구분자로 쓰지 않는다. `snatch pull & power snatch 60% (3+1)x3` → 불렛 1개, movement `snatch pull & power snatch`.
   - 부수 효과로 reps 안의 `+`(`(3+1)`)와 복합 연결자 `+`를 구분할 필요 자체가 사라진다.
5. 알아먹지 못하는 줄(해시태그·이모지·빈 줄)이고 상속할 앞 운동명도 없으면 → **원문 그대로 한 불렛**(`movement`=원문, `prescription`=""). 정보 손실 0.
6. `x` `*` `×` `X`, `80프로`, 깨진 글자 등은 **변환·정규화하지 않고 그대로** 표시.

빈 조각(연속 쉼표·꼬리 공백)은 버린다.

**렌더 예시:**
```
입력:
  squat 60% 3*2, 70% 3*2
  snatch 80% 2*3

출력:
  • squat 60% 3*2
  • squat 70% 3*2
  • snatch 80% 2*3
```

---

## 데이터 & 저장

```sql
CREATE TABLE training_programs (
  id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date       date NOT NULL,
  raw_text   text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT training_programs_user_date_key UNIQUE (user_id, date)
);
```

- **RLS:** `training_notes`와 동일 — 본인 `user_id` 행만 select/insert/update/delete.
- **저장 단위:** 하루 1개. 붙여넣기·수정 = `upsert` (`onConflict: user_id,date`).
- **파싱은 저장 안 함** — raw_text만 저장, 렌더 시 `parseProgramText` 매번 실행.
- 마이그레이션 파일 1개 추가. `types_db.ts` 재생성 주의(프로젝트 메모의 exercise_sections 이슈) — 신규 테이블 부분만 수기 반영하거나, 재생성 후 diff 확인.

---

## 화면 흐름

한 화면 (`app/training/program-text/page.tsx`):

- **상단:** 날짜 선택 + 원문 `textarea` (붙여넣기 / 오타·운동종목 수정). 편집 시 debounce 후 upsert.
- **하단:** 불렛 리스트. 현재 세트만 강조.
- **이전 / 다음** 버튼으로 현재 세트 이동, `진행 2/7` 표시.
- 현재 인덱스 = **로컬 useState만.** 저장 안 함(그날 훈련 중 임시값).
- 날짜 변경 시 해당 날짜 raw_text 조회 → 없으면 빈 textarea.

---

## 테스트 계획

- **파서 (핵심):** 문자열 → `Bullet[]` 순수함수라 극도로 싸다. OCR 노이즈 케이스를 다수 투입:
  - 쉼표 상속, 줄바꿈 상속, 쉼표+줄바꿈 혼용
  - 운동명 공백 포함(`back squat`)
  - **D8 경계:** `70% 3*2`는 상속하고, `1 PS + 1 HS + 2 OHS 75% 3x1`·`2-Position Power Snatch 70% 3x2`는 상속하지 않는다
  - **D7:** `snatch pull & power snatch 60% (3+1)x3` → 불렛 1개
  - modifier 미분리: `무릎정지 스내치 hold 80% 3x2` → movement 통째로 보존
  - 숫자로 시작하는 첫 조각(상속할 앞줄 없음) → 원문 그대로
  - 해시태그·이모지·빈 줄 → 손실 없이 보존
  - `x`/`*`/`×` 변환 안 함 확인
  - 연속 쉼표·꼬리 공백 제거
- **api:** upsert 충돌(같은 날짜 재붙여넣기), RLS 본인 행만.
- 테스트 이름 = 한글 서술형(프로젝트 규칙).

---

## V1에서 뺀 것 (dogfooding 후 판단)

- 운동명 해석 / alias 매핑 / PR 기준 / kg 환산 (해석 0 원칙)
- `program-runner`와의 화면 통합
- 세트 완료 체크·기록 저장 (현재 인덱스는 로컬 임시값)
- 프로그램 목록/검색 (날짜 이동만)
- reps/sets 구조화 파싱 (`3*2`를 그대로 문자열로 둠)
- 복합 동작 분리 (D7 — 실사용 테스트에서 불편하면 그때 개선)
