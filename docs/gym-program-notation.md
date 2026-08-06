# 체육관 프로그램 노테이션 레퍼런스

우리 역도장 칠판에 적히는 프로그램 표기법의 단일 기준 문서.
OCR 파싱, 노테이션 파서, 종목 어휘를 건드릴 때 이 문서를 먼저 읽는다.

---

## 이 문서의 경계

어휘가 여러 곳에 복제되면 반드시 어긋난다. 진실의 소재지를 이렇게 나눈다.

| 대상                            | 진실의 소재지                                  | 이 문서의 역할                      |
| ------------------------------- | ---------------------------------------------- | ----------------------------------- |
| 종목 정식 명칭, 계층            | `base_exercises` 테이블                        | 요약만. 목록 자체를 복제하지 않는다 |
| 약어 → 정식 명칭 매핑           | `gym_exercises` 테이블 (OCR 자동학습으로 증가) | 요약만                              |
| Modifier 어휘                   | **이 문서**                                    | 유일한 기준                         |
| 세트/렙/% 표기 문법             | **이 문서**                                    | 유일한 기준                         |
| 실제 칠판 원문과 기대 파싱 결과 | **이 문서**                                    | 유일한 기준 (골든 케이스)           |

관련 파일 (2026-08-06 확인):

| 파일 | 역할 | 소재 |
| --- | --- | --- |
| `features/notation/model/types.ts` | 파싱 결과 타입 | ✅ `main` |
| `supabase/migrations/20260518000000_create_gym_exercises.sql` | 종목/약어 시드 | ⚠️ `feat/ocr-program-input` 전용 |
| `app/api/ocr-parse/route.ts` | Gemini 프롬프트 (`buildPrompt`) | ⚠️ `feat/ocr-program-input` 전용 |
| `features/programs/model/ocr-mapper.ts` | OCR 결과 → `Program` 변환 | ⚠️ `feat/ocr-program-input` 전용 |
| `features/notation/model/parser.ts` | 노테이션 파서 (문법 정본) | ❌ `8ef76a4`(2026-04-23)에서 삭제. 문법은 아래 3장에 회수됨 |
| `features/notation/model/tokenizer.ts` | 토크나이저 | ❌ 동일 커밋에서 삭제 |

> ⚠️ 표시된 파일은 **`main`에 없다.** `feat/ocr-program-input` 브랜치(origin/main 대비 62커밋)에만 존재하므로
> main만 보고 판단하면 안 된다. 이 이원화 자체가 「미해결」 항목이다.

> 각 항목의 **검증** 열은 실제 칠판에서 확인된 것과 코드에만 존재하는 추정을 구분한다.
> `확인` = 아래 「실제 칠판 원문」에 근거가 있음, `추정` = 코드/프롬프트에만 있고 실물 근거 없음.

---

## 1. 종목 어휘

정식 명칭은 `base_exercises`, 약어는 `gym_exercises`에 있다. 여기서는 구조만 적는다.

**계층 구조** — root 8개 + variant 23개. PR 기준(%)은 자기 자신 → `parent_id` → root 순으로 올라가며 찾는다.

| Root                    | Variants                                                                                       |
| ----------------------- | ---------------------------------------------------------------------------------------------- |
| Snatch                  | Power / Half / Squat / Hang Snatch, Snatch Pull, Snatch Deadlift, Snatch Balance, Jump Balance |
| Clean                   | Power / Half / Squat Clean, Clean Pull                                                         |
| Jerk                    | Push / Split / Power Jerk                                                                      |
| Press                   | Back / Military / Sots / Push Press                                                            |
| Squat                   | Front / Back / Overhead Squat                                                                  |
| Deadlift                | Slow Deadlift                                                                                  |
| Sumo Deadlift High Pull | —                                                                                              |
| Heavy Support on Chest  | —                                                                                              |

**약어** — 현재 `gym_exercises` 시드에 있는 것:

| 약어                        | 정식 명칭       | 검증 |
| --------------------------- | --------------- | ---- |
| `PS`, `P.S`                 | Power Snatch    | 추정 |
| `HS`                        | Hang Snatch     | 추정 |
| `PC`, `P.C`                 | Power Clean     | 추정 |
| `Slow d.l`, `Slow DeadLift` | Slow Deadlift   | 추정 |
| `Snatch Dead Lift`          | Snatch Deadlift | 추정 |

> ⚠️ **알려진 드리프트** — `route.ts` 프롬프트에 `SDL → Slow Deadlift`, `OHS → Overhead Squat` 가
> 하드코딩돼 있으나 `gym_exercises` 시드에는 없다. 프롬프트의 하드코딩 약어 목록은 제거하고
> DB 주입으로 일원화해야 한다. (아래 「미해결」 참조)

### 채워야 할 것

- [ ] 아래 칠판 원문에서 실제로 쓰이는 약어를 뽑아 `확인`으로 승격
- [ ] 시드에 없는 실사용 약어 추가
- [ ] `Heavy Support on Chest`, `Jump Balance` 가 실제 쓰이는 용어인지 확인 (근거 없음)

---

## 2. Modifier 어휘

동작 이름에 붙어 수행 방식을 바꾸는 수식어. 종목명과 분리해서 저장한다.

`position` = 종목명 기준 앞/뒤 어디에 적히는가 (`before` | `after`).
같은 modifier가 위치를 바꿔 나타날 수 있으므로 위치는 고정값이 아니다.

| type        | 뜻             | 예시                                                 | 위치         | 검증 |
| ----------- | -------------- | ---------------------------------------------------- | ------------ | ---- |
| `tempo`     | 속도·정지      | 무릎정지, 무릎정지 N초, hold, hold Nsec, pause, slow | before/after | 추정 |
| `position`  | 시작 높이·자세 | 행(hang), high hang, low hang, pause midthigh        | before       | 추정 |
| `apparatus` | 기구·보조물    | 박스 1칸, 박스 2칸                                   | before       | 추정 |
| `execution` | 수행 방식      | 발붙(no feet), power, squat                          | before       | 추정 |

### 채워야 할 것

- [ ] 실제 칠판에 나오는 modifier 전수 수집
- [ ] 한글/영문 혼용 실태 (「행」과 「hang」이 둘 다 쓰이는지)
- [ ] 위 4개 type 분류가 실제 어휘를 다 덮는지, 새 type이 필요한지
- [ ] modifier가 %/PR 계산에 영향을 주는가 (예: 발붙 스내치는 스내치 PR의 몇 %로 잡는가)

---

## 3. 표기 문법

### 형식 문법 (EBNF)

삭제된 `features/notation/model/parser.ts`(커밋 `8ef76a4^`)에서 회수한 정본.
아래 산문 규칙은 모두 이 문법의 해설이다.

```ebnf
program    := block ("," block)*
block      := movement ("&" movement)* percentage? reps sets modifier*
movement   := (IDENT | "(" text ")")+
percentage := NUMBER "%"
reps       := "(" NUMBER ("+" NUMBER)* ")" | NUMBER
sets       := "x" NUMBER
```

파서에만 있고 위 문법에 드러나지 않던 규칙 4가지:

1. **쉼표 블록의 종목 상속** — 쉼표 뒤 블록이 종목명 없이 시작하면 **앞 블록의 종목을 물려받는다.**
   `parseProgram()`이 `parseBlock(prev.movements)`로 직전 블록을 넘긴다.
   `Snatch 80% 2×2, 85% 1×3` 에서 두 번째 블록의 종목이 Snatch가 되는 근거.

2. **복합 블록의 %는 두 번째 종목의 PR 기준** — `A & B 70% (2+2)×3` 에서 70%는 **B의 PR**을 가리킨다.
   파서는 퍼센트 숫자만 기록하고 PR 해석은 하위 단계로 넘긴다.
   (원 주석: *"the % refers to the second movement's PR"*)

3. **괄호 중의성 판정** — 괄호가 복합 렙인지 modifier인지는 `isComplexRepsAhead()`가 판단한다.
   **`( NUMBER ("+" NUMBER)* )` 형태이고 바로 뒤에 `x`가 오면 복합 렙, 아니면 modifier.**
   `(2+2)×3` → 복합 렙 / `(Pause midthigh)` → modifier / `(1+2)x3` → 복합 렙.
   아래 「규칙 충돌 주의」보다 이쪽이 실제 판정 기준이다.

4. **접두 modifier 자동 분리** — `low hang`, `hang`, `half`, `slow` 4개는 종목명 앞에 붙으면
   종목명에서 떼어내 modifier로 옮긴다(`PREFIX_MODIFIERS`). 이 4개만 하드코딩돼 있었다.

> ⚠️ **이 문법은 실제 칠판 원문을 파싱하지 못한다.** 토크나이저(`tokenizer.ts`)가 인식하는 문자는
> `%` `&` `,` `(` `)` `+` 숫자 그리고 `[A-Za-z가-힣.]` 뿐이라, 그 외 문자를 만나면
> `Unexpected character` 예외를 던진다. 4장 원문에 실재하는 `×`(U+00D7)와 `~`가 여기에 걸린다.
> 문법을 되살릴 때 반드시 먼저 해결해야 한다. (아래 「채워야 할 것」 참조)

### 렙 × 세트

`N×M` = **N렙 × M세트**.

```
5×3   → reps 5, sets 3
2×2   → reps 2, sets 2
```

### 복합 렙 (한 세트 안의 연속 동작)

괄호 안의 `+` 는 한 세트 내부의 렙 구성이다. 종목을 나누지 않는다.

```
(3+1)×3   → reps "3+1", sets 3   (한 종목)
```

### 복합 동작 (`&` / `+` 로 이어진 별개 종목)

별개 종목으로 분리하되 세트 수는 공유한다.

```
snatch pull + squat snatch 60% (3+1)×3
  → Snatch Pull   : reps 3, sets 3, 60%
  → Squat Snatch  : reps 1, sets 3, 60%

C. Pull & SQ Clean (2+2)×3
  → Clean Pull : reps 2, sets 3
  → Squat Clean: reps 2, sets 3
```

> 규칙 충돌 주의: `(3+1)×3` 은 종목이 하나면 복합 렙, 종목이 둘이면 종목별 렙 분배다.
> 판단 기준은 괄호가 아니라 **종목이 몇 개인가**.

### 강도(%)

```
80%        → percentage 80, percentage_end null
100~110%   → percentage 100, percentage_end 110
```

한 줄에 강도가 여러 개면 별개 항목으로 분리한다.

```
Snatch 80% 2×2, 85% 1×3
  → Snatch 80%, reps 2, sets 2
  → Snatch 85%, reps 1, sets 3
```

### 원문 대조로 확인된 것 (2026-08-06)

4장 원문 7판을 전수 대조해 답이 나온 항목. 근거는 모두 4장에 있다.

- [x] **곱셈 기호는 `×`와 `x` 혼용** — `*`, `X`는 없음. 같은 줄 안에서도 섞인다:
      `clean 80% 2x2, 85% 2×2, 90% 1x2`. 둘을 동일 토큰으로 정규화해야 한다.
- [x] **구분자는 쉼표만이 아니다** — 마침표도 쓰인다: `S. Pull up 100% 3x2. 105% 3x2`.
      종목명의 `.`(`c.d.l`, `s. balance`)와 충돌하므로 토큰 단독 판정으로는 못 가른다.
- [x] **kg 직접 지정은 없다** — 원문 7판 전부 % 표기. 다만 표본이 7판뿐이라 단정은 이르다.
- [x] **날짜·요일·블록(A/B/C) 구획 없음** — 프로그램 경계는 **빈 줄**로만 구분된다.
- [x] **세트 수를 생략한 표기는 없다** — 원문 7판의 모든 항목이 `xN` / `×N` 으로 세트를 명시한다.
      EBNF가 `sets`를 필수로 요구하는 것과 일치한다. 다만 표본이 7판뿐이다.
- [x] **메모/주석 없음** — 원문에 수행 지시 외 자연어가 섞인 사례 없음.
- [x] **괄호 없는 복합 렙이 존재** — `S. Balance & OHS 70% 2+1×4`.
      EBNF는 `reps := "(" NUMBER ("+" NUMBER)* ")" | NUMBER` 라 괄호를 요구하므로 **문법 위반**이다.
      문법을 넓히거나 원문을 예외 처리해야 한다.
- [x] **`%` 뒤 공백 없는 표기** — `70%(2+2)x2`, `75%(1+2)x1`. 토크나이저는 공백을 건너뛰므로 무해.
- [x] **블록이 줄바꿈을 넘어 이어진다** — `Squat Clean & FSQ 70% (1+2)x3,75%(1+2)x1` 다음 줄이
      `80% (1+2)x1, 85%(1+1)x3`. 종목 상속이 **줄 경계를 넘어** 적용돼야 한다.
      줄 단위로 파싱하면 이 블록은 종목을 잃는다.
- [x] **한 줄에 두 종목이 구분자 없이 붙는다** — `snatch 75% 2x2, 80% 2x2, 85% 1x2 power clean & push jerk 65% (2+2)×2`.
      칠판의 줄바꿈이 옮겨적는 과정에서 유실된 것으로 보인다. 사람도 헷갈리는 지점.
- [x] **OCR 노이즈가 원문에 이미 섞여 있다** — `90% 2xl,95% 1xl` 의 `l`은 숫자 `1`의 오인식.
      원문을 고치지 않는 원칙에 따라 그대로 두되, 파서는 이런 입력에서 죽지 않아야 한다.

### 아직 못 채운 것

- [ ] **렙×세트 순서** — 원문상 `back press 5x3`, `Back Press 10x3`이 각각 5렙3세트 / 10렙3세트로
      읽히지만, 역도 관례상 뒤집어 읽는 표기가 없는지 코치 확인 필요. 표본만으로는 확정 불가.
- [ ] `~`(범위) 처리 — `s. balance & ohs 80~90% (3+2)×3` 이 원문에 실재하는데 토크나이저에 `~`가 없다.
- [ ] 4장 원문 7판에 **날짜가 없다.** 언제 칠판인지 모르면 시기별 표기 변화를 추적할 수 없다.

---

## 4. 실제 칠판 원문

파싱 규칙의 근거이자 골든 케이스. 칠판에 적힌 그대로 옮긴다 —
오타, 줄바꿈, 띄어쓰기, 기호를 고치지 말 것. 고치면 근거로서의 가치가 사라진다.

프로그램 하나(=칠판 한 판)마다 `---` 로 구분한다.

---

<!-- 여기부터 원문. 아래 형식으로 하나씩 추가 -->

<!--
### 2026-MM-DD

```
(칠판 원문 그대로)
```

기대 파싱 결과:
- 종목 / modifier / % / 렙 / 세트
- 애매한 지점이나 사람도 헷갈리는 부분 메모
-->

back press 5x3
hang power snatch 65% 3×2, 70% 3×2, 75% 3×2
hang squat snatch 75% 3×2, 80% 2x2
squat snatch 80% 2x2, 85% 2x2, 90% 1x2
low hangs. pull up 90% 4x4
s. balance & ohs 80~90% (3+2)×3
back squat 80% 5×5

m. press 5x3
hang power clean 65% 3×2, 70% 3×2, 75% 3×2
hang squat clean 75% 3×2, 80% 2×2
clean 80% 2x2, 85% 2×2, 90% 1x2
hsoc & push jerk 70% (2+2)×3
split jerk 75% 2×2, 80% 2×2, 85% 1×2
front squat 80% 3×3

sots press 5×3
power snatch 65% 3×2, 70% 3×2
squat snatch 75% 2x3, 80% 2x2
power clean 65% 3×2, 70% 3×2
squat clean 75% 2x3, 80% 2×2
clean pull up 95% 3×3
back squat 75% 5×4

back press 5×3
power snatch 65% 3x2, 70% 2x2
snatch 75% 2x2, 80% 2x2, 85% 1x2 power clean & push jerk 65% (2+2)×2, 70%(2+2)x2
clean 75% 2×2, 80% 2×2, 85% 1×2
c.d.l 85% 3×3

Back Press 10x3
2-Pause Snatch (under knee, Midthigh) 65% 3x3
Low Hang Power Snatch 70% 3×3
Power Snatch 75% 2x3, Snatch 80% 2x2
S. Pull up 100% 3x2. 105% 3x2
S. Balance & OHS 70% 2+1×4
Back Squat 80% 4x2,85% 3x2,90% 2xl,95% 1xl

M Press 10x3
Squat Clean & FSQ 70% (1+2)x3,75%(1+2)x1
80% (1+2)x1, 85%(1+1)x3
C. Pull up (Pause midthigh) 80% 3×4
Rack Jerk (Pause Dip) 70% 3x2,75% 2x1,80% 2x1
Front Squat (Pause Bottom) 80% 3x3, 85% 2x2

---

## 5. 미해결

- **어휘 이원화** — 수동 입력 피커(`MovementCombobox`)는 아직 `exercises`(Catalyst) 기준,
  OCR 경로는 `base_exercises`(체육관) 기준. 같은 동작이 다른 이름으로 저장돼 PR 매칭이 실패한다.
  설계는 `.claude/plans/2026-05-19-exercise-vocabulary-unification-design.md` (`feat/ocr-program-input`)에 있고 미구현.
- **`exercise_sections` 스키마 드리프트** — main의 `listExercisesGrouped()` 가 존재하지 않는
  테이블을 조인해 종목 피커가 비어 있다. 마이그레이션은 `feat/exercise-db` 브랜치에만 있음.
- **프롬프트 약어 하드코딩** — `route.ts:buildPrompt` 의 약어 목록을 제거하고 `gym_exercises` 주입으로 일원화.
- **Catalyst 624개 데이터** — `feat/exercise-db` 브랜치에 보존. 체육관 용어와 어휘가 달라
  프로그램 연결에는 쓰지 않기로 결정(2026-07-21). 필요해지면 해설/영상 enrichment 용도로만 재검토.
