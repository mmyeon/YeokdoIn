# 데이터 모델: PR 기록 낙관적 반영

**DB 변경 없음.** 스키마·마이그레이션·타입 생성 모두 해당 없음. 다루는 것은 React Query 캐시다.

## 캐시 두 개

| 쿼리 키 | 타입 | 읽는 곳 |
|---|---|---|
| `[PERSONAL_RECORDS]` | `PersonalRecordInfo[]` | 상세 헤더(현재 PR), PR 목록 화면 |
| `[PR_HISTORY, exerciseId]` | `PRHistoryEntry[]` (날짜 내림차순) | 상세 기록 목록, 추이 그래프 |

둘은 서버에서 파생 관계다: `personal-records` 는 `pr_history` 의 최대 무게 캐시다
(`recomputeCache`). 클라이언트 예측도 같은 방향으로만 흐른다 — **이력을 고치고, 현재 PR은
이력에서 계산한다.** 현재 PR을 직접 고치지 않는다.

## 이력 변경 연산 (`model/`, 순수 함수)

```ts
type HistoryChange =
  | { type: "add"; entry: PRHistoryEntry }      // 임시 id(음수) 포함
  | { type: "update"; entry: PRHistoryEntry }   // 같은 id의 행을 통째 교체
  | { type: "remove"; id: number };
```

- `applyHistoryChange(history, change) → PRHistoryEntry[]` — 새 배열 반환, 결과는 항상
  `prDate` 내림차순 → `createdAt` 내림차순(서버 `getPRHistory` 정렬과 동일). 추가·날짜 수정 시
  최종 위치에 바로 들어간다(spec 경계 "정렬 위치").
- `deriveCurrentPR(history) → { weight, prDate } | null` — research R8 규칙.
- `applyCurrentPR(records, base, current) → PersonalRecordInfo[]` — `current` 가 `null` 이면
  `base.exerciseId` 행 제거, 아니면 `base` 에 무게·날짜를 덮어 넣는다(없으면 추가).
  `base` 는 `onMutate` 시점의 레코드 — 0건→복구 시 사라진 id·종목명을 되살리는 데 필요하다.

## 조작별 예측과 역연산

| 조작 | 예측(onMutate) | 역연산(onError) |
|---|---|---|
| 추가 | `add` 임시 행 | `remove` 임시 id |
| 수정 | `update` 수정된 행 | `update` 수정 전 행 |
| 삭제 | `remove` id | `add` 지운 행 |

각 단계 뒤 `deriveCurrentPR` → `applyCurrentPR` 로 헤더 캐시를 맞춘다.
스냅샷 복원을 쓰지 않는 이유는 research R2.

## 입력 폼 상태 (상세 화면)

실패 시 폼을 입력값째 다시 열기 위해(FR-004) 화면이 "다시 열 폼"을 기억한다.

```ts
type RetryForm =
  | { mode: "add"; draft: PRHistoryEntryDraft }
  | { mode: "edit"; id: number; draft: PRHistoryEntryDraft };
```

`draft` 는 mutation `variables` 에서 복원한다(훅의 `onError` 가 variables를 넘긴다).
에디터는 `initial` 을 마운트 때만 읽으므로 다시 열 때 `key` 를 바꿔 재마운트한다.
