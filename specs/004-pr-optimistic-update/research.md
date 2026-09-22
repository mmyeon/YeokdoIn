# 리서치: PR 기록 낙관적 반영

기준: `@tanstack/react-query` **5.81.5** (설치본), 공식 가이드 "Optimistic Updates".

## R1. 낙관적 반영 방식 — 캐시 방식

- **결정**: `onMutate` 에서 `setQueryData` 로 캐시를 직접 고친다.
- **이유**: FR-002는 목록·헤더 숫자·그래프 세 곳이 동시에 바뀌길 요구한다. 헤더는
  `PERSONAL_RECORDS` 캐시, 목록·그래프는 `PR_HISTORY` 캐시를 읽는다. 캐시를 고치면 세 곳이
  한 번에 따라온다.
- **기각**: UI 방식(`mutation.variables` 를 렌더에 끼워 넣기) — 한 곳에만 그릴 때 쓰는 방식.
  세 곳에 끼워 넣으면 예측 로직이 컴포넌트마다 흩어진다.

## R2. 되돌리기 — 스냅샷 복원이 아니라 역연산

- **결정**: 실패하면 **그 조작만 거꾸로** 적용한다. 추가 실패 → 임시 행 제거, 삭제 실패 →
  지운 행 다시 넣기, 수정 실패 → 수정 전 행으로 교체. 그 뒤 현재 PR을 다시 계산한다.
- **이유**: 공식 예제의 스냅샷 복원은 조작이 겹치면 틀린다. 삭제 A·B를 연달아 하고 A만
  실패하면, A의 스냅샷(B 삭제 전)을 복원하는 순간 B까지 되살아난다(spec 경계 "연속 조작" 위반).
- **기각**: 실패 시 재조회만 하기 — 오프라인 실패에선 재조회도 실패해 화면이 예측값에 멈춘다.

## R3. 오래된 응답이 예측을 덮어쓰는 문제

- **결정**: ① `onMutate` 에서 두 쿼리 모두 `cancelQueries`. ② 세 mutation에 **같은
  `mutationKey`** 를 준다. ③ `onSettled` 에서 `queryClient.isMutating({ mutationKey }) === 1`
  (= 자기 자신만 남음)일 때만 `invalidateQueries`.
- **이유**: 조작 1이 끝나 재조회하는 동안 조작 2가 진행 중이면, 재조회 결과(조작 2 반영 전)가
  조작 2의 예측을 덮어써 깜빡인다. 마지막 조작이 끝났을 때 한 번만 재조회하면 없어진다.
- **기각**: `scope` 로 mutation 직렬화 — 두 번째 삭제가 첫 번째 응답을 기다려 화면 반영도 늦어진다.

## R4. 콜백 시그니처 — 설치본 기준

- 공식 문서 최신 예제는 `onMutate(variables, context)` + `context.client` 를 쓰지만
  5.81.5는 `onMutate(variables)` → 반환값이 `onError(err, variables, context)` 의 세 번째
  인자로 온다. `queryClient` 는 `useQueryClient()` 로 얻는다. **예제를 그대로 옮기지 말 것.**

## R5. 훅 위치와 목록 화면 대화상자

- **결정**: 상세 화면 전용 낙관적 훅 3개를 `features/personal-records/ui/` 에 새로 둔다.
  `hooks/usePersonalRecords.ts` 의 `useUpdatePRHistoryEntry` / `useDeletePRHistoryEntry` 는
  상세 화면만 쓰므로 옮기고 지운다. `useAddPRHistoryEntry` 는 **남긴다** —
  `RecordAddDialog`(목록 화면 신규 등록)가 쓰고, FR-006에 따라 비낙관적으로 유지해야 한다.
- **이유**: 헌법 배치 규칙(한 feature만 쓰면 feature 내부). 추가 훅에 "낙관적 여부" 옵션을
  넣는 안은 두 동작이 한 함수에 얽혀 FR-006을 깨기 쉽다.

## R6. 추가한 행의 임시 id

- **결정**: 임시 id는 음수(`-Date.now()`). 임시 행은 수정·삭제 메뉴를 비활성화한다.
- **이유**: 확정 전 임시 행을 삭제하면 서버가 없는 id를 받고 조용히 성공(`if (!before) return`)
  → 재조회 후 행이 되살아난다. 확정은 보통 1초 이내라 메뉴 비활성화 비용이 작다.

## R7. 삭제 버튼 전역 잠금 제거

- 현재 `isDeleting={deleteMutation.isPending}` 이 삭제 하나가 진행 중이면 **모든 행**의
  삭제를 막는다. 낙관적 반영 후엔 행이 즉시 사라지므로 이 잠금은 연속 삭제(spec 경계)를
  막기만 한다. 제거한다.

## R8. 현재 PR 예측 규칙 — 서버 `recomputeCache` 와 동일

- 남은 기록 중 `new_weight` 최대. 동점이면 먼저 만난 행(서버도 `reduce` 의 `>` 라 동일 성질,
  서버의 행 순서는 불특정 → FR-003 재조회가 바로잡는다).
- 0건이면 `personal-records` 행 자체를 캐시에서 뺀다(서버가 행을 삭제함). 이때 상세 화면은
  지금처럼 "기록을 찾을 수 없습니다"가 된다 — 다만 이제 **즉시**.
- `previousWeight` 는 화면 어디에도 표시되지 않는다. 임시 행에는 현재 PR 무게를 넣는다(서버와 같은 값).
