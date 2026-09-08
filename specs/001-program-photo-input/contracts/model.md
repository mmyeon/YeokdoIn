# Contract: `features/programs/model` 순수 함수

I/O 없음, React 없음. 전부 동기 함수다(헌법 IV).
분해와 검출이 클라이언트에서 끝나야 FR-003(서버 왕복 없음)과 SC-002(1초 이내)가 성립한다.

---

## `splitIntoItems(text: string): string[]`

`split-items.ts` — 붙여넣은 텍스트를 항목 목록으로 분해한다.

| 규칙 | 근거 |
| --- | --- |
| `\r\n`, `\r`, `\n`을 동일하게 줄 경계로 취급 | FR-010 |
| 각 줄의 앞뒤 공백 제거 | FR-008 |
| 공백 제거 후 빈 줄은 항목으로 만들지 않음 | FR-007 |
| 줄 내부 문자는 원문 그대로 보존 | FR-008, FR-011 |
| 입력 순서 유지 | FR-009 |
| 어떤 문자에도 예외를 던지지 않음 | FR-011 |

**하지 않는 것**: 종목·강도·렙·세트 분해, 줄 병합, 표기 정규화(`×`→`x` 포함).

```text
"back press 5x3\n\n  hang power snatch 65% 3×2  \r\n"
  → ["back press 5x3", "hang power snatch 65% 3×2"]
```

빈 문자열이나 공백뿐인 입력은 `[]`를 반환한다. 진행 차단(FR-004)은 호출부의 책임이다.

---

## `sanitizeItems(items: string[]): string[]`

`sanitize-items.ts` — 저장 직전 위생 처리. FR-028에 열거된 것만 수행한다.

| 처리 | 근거 |
| --- | --- |
| 앞뒤 공백 제거 | FR-028 |
| 줄바꿈·탭·제어문자 제거 | FR-028 |
| 결과가 빈 문자열인 항목 제외 | FR-028 |

**하지 않는 것**: 그 외 모든 내용 변형. 오인식 자동 수정(FR-014), 표기 정규화, 중복 제거.

반환이 `[]`면 호출부가 저장을 거부한다(FR-032).

---

## `findSuspectSpans(line: string): SuspectSpan[]`

`suspect-spans.ts` — 오인식 의심 구간을 찾는다.

**규칙의 단일 출처는 `docs/gym-program-notation.md` 4.2다.** 이 계약은 목록을 복제하지 않고
현재 구현 대상만 적는다. 규칙 변경은 문서를 먼저 고친다.

| `rule` | 대상 |
| --- | --- |
| `digit-slot-letter` | 곱셈 기호(`x`/`×`) 뒤 `l` `I` `O` / `%` 바로 앞 `O` `l` `I` / 숫자 사이에 낀 문자 |
| `period-separator` | 숫자 뒤 마침표 다음에 강도가 이어지는 경우 |

**표시하지 않아야 하는 것** (문서 3장의 정상 표기):
`~`(범위), `×`와 `x` 혼용, `%` 뒤 공백 없음, 괄호 modifier, 줄 끝 쉼표, 종목명의 마침표(`c.d.l`).

**계약**:
- 구간은 겹치지 않으며 `start` 오름차순이다.
- 오프셋은 입력 문자열에 대한 것이며, 호출부가 그대로 하이라이트에 쓸 수 있다.
- 순수 함수다. 편집마다 다시 호출해 갱신한다(FR-016).
- 표기 규약 적합성은 검사하지 않는다(FR-013).

**필수 테스트 — SC-005**: `docs/gym-program-notation.md` 2장 원문 6판 39줄 전체를 입력했을 때,
4.1에 기록된 3건(`2xl`, `1xl`, `3x2. 105%`) 외의 검출이 0건이어야 한다.

---

## `toLibraryItem(row): LibraryItem` (수정)

`library.ts` — 두 저장 형태를 모두 받는다.

| 행 종류 | `lines` 도출 |
| --- | --- |
| `row.lines !== null` | 그대로 사용 |
| 레거시 | 기존대로 `serializeProgram(parsed_data)` |

종목 필터(`snatch` / `cj` / `squat`)는 `movementNames` 대신 **항목 텍스트**에 대해 매칭한다.
그렇게 하지 않으면 텍스트 프로그램이 모든 필터에서 사라진다(research.md R4).
표시용 검색이며 저장 형태나 규약 검사와 무관하다.

`LibraryItem`에 `isRunnable: boolean`을 추가한다 — 레거시 행만 `true`.
러너 진입 링크의 노출 조건이다.
