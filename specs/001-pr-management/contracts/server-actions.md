# Contract: Server Actions & Model API

**Date**: 2026-08-31 | **Plan**: [../plan.md](../plan.md)

이 프로젝트는 별도 백엔드가 없다. 외부 인터페이스는 **Next.js 서버 액션**이며, 이것이 신뢰
경계다. 클라이언트에서 호출 가능한 모든 진입점을 여기에 고정한다.

위치: `actions/personalRecords.ts` (현행 유지 — 이동하지 않는다)

**모든 액션의 공통 전제**

- 인증 필수. 미인증이면 `Error("사용자가 인증되지 않았습니다.")`
- 모든 질의에 `.eq("user_id", userId)`. RLS가 두 번째 방어선
- 실패는 예외로 던진다. 부분 저장을 남기지 않는다 (한계는 research.md R4)

---

## Model 계약 (순수 함수, 신규)

`features/personal-records/model/validate-pr-input.ts`

```ts
export type PRInputDraft = {
  weight: number | null;
  prDate: string;        // "YYYY-MM-DD"
};

export type ValidationError = {
  field: "weight" | "prDate";
  message: string;       // 사용자에게 그대로 보여줄 한국어 문구
};

/** 위반이 없으면 빈 배열. 순수 함수 — I/O 없음, 오늘 날짜는 인자로 주입한다. */
export function validatePRInput(
  draft: PRInputDraft,
  today: string,         // "YYYY-MM-DD" — 주입해야 테스트가 시간에 의존하지 않는다
): ValidationError[];
```

**계약**

| 입력 | 결과 |
|---|---|
| `{ weight: 52.5, prDate: "2026-08-20" }`, today `2026-08-31` | `[]` |
| `{ weight: 0, ... }` | `weight`: "무게는 0보다 커야 합니다." |
| `{ weight: null, ... }` | `weight`: "무게를 입력해주세요." |
| `{ weight: 52.4, ... }` | `weight`: "무게는 0.5kg 단위로 입력해주세요." |
| `{ weight: 1001, ... }` | `weight`: "무게가 너무 큽니다. 다시 확인해주세요." |
| `{ prDate: "2026-09-01" }`, today `2026-08-31` | `prDate`: "미래 날짜는 기록할 수 없습니다." |
| `{ prDate: "" }` | `prDate`: "날짜를 입력해주세요." |
| 위반이 여러 개 | 모두 반환 (첫 건에서 멈추지 않음) |

`today` 주입은 필수다. 함수 안에서 `new Date()`를 부르면 순수성이 깨지고 테스트가 자정 근처에서
깨진다.

---

## 조회 액션 (변경 없음)

```ts
getUserPersonalRecords(): Promise<PersonalRecordInfo[]>
```
현재 사용자의 PR 전체. `pr_date DESC, updated_at DESC` 정렬. 종목명 조인 포함. — FR-012

```ts
getPRHistory(exerciseId: number): Promise<PRHistoryEntry[]>
```
해당 종목의 과거 기록 전체. `pr_date DESC`. — FR-014, FR-015, FR-018

```ts
getExercises(): Promise<ExercisesRow[]>
```
종목 카탈로그 전체. 인증 불요. — FR-002

---

## 쓰기 액션

### `addPRHistoryEntry(input)` — 기록 추가 (주 진입점)

```ts
type AddPRHistoryInput = {
  exerciseId: number;
  newWeight: number;
  prDate: string;
  note: string | null;
};
addPRHistoryEntry(input: AddPRHistoryInput): Promise<void>
```

**★ 신규 요구**: 본문 첫 줄에서 `validatePRInput`을 호출하고, 위반이 있으면 첫 메시지로 throw.
DB 접근 전에 막는다.

동작: 현재 캐시의 `weight`를 `previous_weight`로 스냅샷 → `pr_history` INSERT → `recomputeCache`.
— FR-003, FR-004, FR-008, FR-009, FR-010

### `updatePRHistoryEntry(id, patch)` — 기록 수정

```ts
type UpdatePRHistoryInput = {
  newWeight?: number;
  prDate?: string;
  note?: string | null;
};
updatePRHistoryEntry(id: number, patch: UpdatePRHistoryInput): Promise<void>
```

**★ 신규 요구**: 제공된 필드만 검증한다(부분 수정이므로). 소유자 확인 후 UPDATE, 이어서
`recomputeCache`. 존재하지 않으면 `Error("수정할 기록을 찾을 수 없습니다.")`. — FR-007, FR-011

### `updateRecordWeight(recordId, newWeight, prDate?)` — 현재 PR 수정

```ts
updateRecordWeight(
  recordId: number,
  newWeight: number,
  prDate?: string,      // ★ 신규 인자
): Promise<void>
```

**★ 신규 요구 (FR-007 갭)**: 현재는 `pr_date`를 `new Date()`로 **오늘로 강제**해 사용자가 날짜를
지정할 수 없다. `prDate` 선택 인자를 받아 주어지면 그 값을, 없으면 종전대로 오늘을 쓴다.
검증은 `addPRHistoryEntry`와 동일.

### `addRecord(newRecord)` — 레거시 별칭

```ts
addRecord(
  input: Pick<PersonalRecordInfo, "exerciseId" | "weight"> & {
    prDate?: string;
    note?: string | null;
  },
): Promise<void>
```
`addPRHistoryEntry`로 위임한다. 검증은 위임 대상이 수행하므로 중복 구현하지 않는다.

### `deletePRHistoryEntry(id)` / `deleteRecord(id)` — 삭제

```ts
deletePRHistoryEntry(id: number): Promise<void>   // 이력 1건 삭제 후 재계산
deleteRecord(id: number): Promise<void>           // 캐시 + 해당 종목 이력 전부 삭제
```

검증 대상 없음. `deleteRecord`가 이력을 통째로 지운다는 점은 파괴적이므로 UI에서 확인을 받아야
한다.

---

## UI 계약

| 화면 | 경로 | 책임 |
|---|---|---|
| PR 목록 | `/settings/personal-records` | 등록된 PR 표시 + **★ 미등록 종목 구분 표시(FR-012)** + 추가 진입점 |
| 종목 상세 | `/settings/personal-records/[id]` | 과거 기록 목록 + 추이(`PRSparkline`) — FR-014~017 |

**★ `PRSparkline` 신규 요구 (FR-017)**: 기록이 0~1건이면 추이를 그리지 않고 현재 기록만
표시한다. 빈 그래프나 오류를 내지 않는다.

**입력 컴포넌트**: `PRHistoryEntryEditor`가 무게·날짜·메모를 받는다. `validatePRInput`을 호출해
저장 버튼 활성 여부와 오류 문구를 결정한다 — 현재의 인라인 `canSubmit` 조건을 대체한다.
서버 액션과 같은 함수를 쓰므로 규칙이 갈라질 수 없다.

---

## 변경 요약

| 항목 | 종류 |
|---|---|
| `validatePRInput` | 신규 (model) |
| `addPRHistoryEntry` / `updatePRHistoryEntry` / `updateRecordWeight` | 검증 호출 추가 |
| `updateRecordWeight` | 시그니처 확장 (`prDate?`) |
| `PRHistoryEntryEditor` | 검증을 model에 위임 |
| PR 목록 화면 | 미등록 종목 표시 추가 |
| `PRSparkline` | 0~1건 경계 처리 |
| 조회 액션 3개 · 삭제 액션 2개 | 변경 없음 |
