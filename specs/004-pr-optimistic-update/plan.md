# 구현 계획: PR 기록 낙관적 반영

**Branch**: `mmyeon/pr-optimistic-update` | **Date**: 2026-09-22 | **Spec**: [spec.md](./spec.md)

## 요약

PR 상세 화면의 기록 추가·수정·삭제를 React Query **캐시 방식** 낙관적 업데이트로 바꾼다.
이력 캐시를 먼저 고치고 현재 PR 캐시는 이력에서 계산하므로 목록·헤더·그래프가 한 번에 바뀐다.
실패 시 스냅샷이 아니라 **그 조작의 역연산**으로 되돌려 연속 조작을 보호하고, 마지막 조작이
끝날 때만 재조회해 깜빡임을 막는다. 근거는 [research.md](./research.md).

## Technical Context

**Language/Version**: TypeScript 5 (strict), React 19, Next.js 15 App Router
**Primary Dependencies**: `@tanstack/react-query` 5.81.5 — 콜백 시그니처는 설치본 기준(research R4)
**Storage**: 변경 없음 (Supabase `pr_history` / `personal-records` 그대로)
**Testing**: Jest + Testing Library (`renderHook` + 실제 `QueryClient`, 서버 액션 목)
**Target Platform**: 모바일 웹(PWA)
**Project Type**: 웹 앱 단일 프로젝트
**Performance Goals**: 저장 탭 → 세 곳 반영이 서버 왕복과 무관하게 한 프레임 안
**Constraints**: 오프라인 즉시 실패 유지(`FAIL_FAST_WHEN_OFFLINE`), 목록 화면 신규 등록은 비낙관적 유지(FR-006)
**Scale/Scope**: 화면 1개, 훅 3개, 구현 약 250줄 예상(PR 400줄 기준 이내)

미해결(NEEDS CLARIFICATION) 없음.

## Constitution Check

| 원칙 | 판정 | 근거 |
|---|---|---|
| I. SDD | ✅ | spec.md 확정 후 계획. 구현 중 불일치 시 spec부터 수정 |
| II. Type Safety | ✅ | `any` 없음. mutation context·`HistoryChange` 를 타입으로 정의. 스키마 변경 없음 |
| III. 입력 검증 | ✅ | 반영 전에 기존 `validatePRInput` 통과 필수(에디터가 이미 막음, spec 경계). 서버의 `assertValidPRInput` 유지 |
| IV. 관심사 분리 | ✅ | 예측·역연산·현재 PR 계산은 `model/` 순수 함수. 캐시 조작은 `ui/` 훅. 데이터 접근은 기존 `actions/` 경유 |
| V. TDD | ✅ | model 단위 테스트 → 훅 테스트 → 구현 순. quickstart 자동 검증 절 |
| VI. Documentation First | ✅ | TanStack Query 공식 Optimistic Updates 가이드 확인, 설치본 타입 정의로 시그니처 대조 |
| VII. YAGNI | ✅ | undo·오프라인 대기열·목록 화면 낙관적 등록 모두 제외(spec 결정 기록). 범용 낙관적 헬퍼 안 만듦 |
| 품질 게이트 | ✅ | tsc·jest·build 통과 후 커밋 |

**Phase 1 설계 후 재검토**: 위반 없음. Complexity Tracking 해당 없음.

## Project Structure

### Documentation

```text
specs/004-pr-optimistic-update/
├── spec.md
├── plan.md          # 이 문서
├── research.md
├── data-model.md
├── quickstart.md
└── tasks.md         # /speckit-tasks 에서 생성
```

`contracts/` 는 만들지 않는다 — 외부에 노출하는 인터페이스가 없고 서버 액션 시그니처도 바뀌지 않는다.

### Source Code

```text
features/personal-records/
├── model/
│   ├── optimistic-history.ts              # 신규: applyHistoryChange, deriveCurrentPR, applyCurrentPR
│   └── __tests__/optimistic-history.test.ts
└── ui/
    ├── use-pr-history-mutations.ts        # 신규: 낙관적 추가·수정·삭제 훅 3개
    └── __tests__/use-pr-history-mutations.test.tsx   # 오프라인 테스트 이관 포함

hooks/usePersonalRecords.ts                # useUpdate/useDeletePRHistoryEntry 제거. useAddPRHistoryEntry 는 유지(RecordAddDialog)
hooks/__tests__/usePersonalRecords.offline.test.tsx   # 새 훅 테스트로 이관 후 삭제
app/settings/personal-records/[id]/page.tsx           # 새 훅 사용, 성공 토스트 제거, 폼 즉시 닫기·실패 시 재오픈, 임시 행 메뉴 비활성, 삭제 전역 잠금 제거
components/PersonalRecords/RecordAddDialog.tsx        # 변경 없음
```

**Structure Decision**: 새 코드는 feature 내부(`features/personal-records/`)에 둔다 — 상세 화면만
쓰기 때문(헌법 배치 규칙). `actions/personalRecords.ts` 를 feature `api/` 로 옮기는 것은 범위 밖.

## 구현 순서

1. **model** — `optimistic-history.ts` TDD. 정렬 위치, 최대 기록 삭제, 동점, 0건 → 행 제거,
   `add`↔`remove`·`update`↔`update` 역연산이 원상복구되는지.
2. **훅** — `use-pr-history-mutations.ts` TDD.
   - 세 훅 공통: `FAIL_FAST_WHEN_OFFLINE`, 공유 `mutationKey`, `onMutate` 에서 두 쿼리
     `cancelQueries` → 예측 적용 → 역연산에 필요한 값(`base` 레코드, 지운/수정 전 행, 임시 id)을
     context로 반환.
   - `onError(error, variables)` 를 화면에 넘긴다(폼 재오픈용). 성공 콜백은 받지 않는다(FR-005).
   - `onSettled`: `isMutating({ mutationKey }) === 1` 일 때만 두 쿼리 invalidate.
   - 훅은 `exerciseId` 를 인자로 받아 이력 캐시 키를 안다(삭제 variables가 id뿐이라).
3. **화면** — 제출 시 즉시 폼 닫기, 실패 시 `RetryForm` 으로 재오픈(에디터 `key` 교체),
   임시 행(`id < 0`) 메뉴 비활성, `isDeleting` 전역 잠금 제거, 성공 토스트 제거.
4. **정리** — 기존 update/delete 훅과 오프라인 테스트 파일 제거, quickstart 수동 검증.

## 위험

- **0건 삭제 시 즉시 "기록을 찾을 수 없습니다"**: 현재도 응답 후 같은 화면이 되므로 동작 변화는
  시점뿐. 실패하면 `base` 로 레코드가 되살아나 화면이 돌아온다. 뒤로가기 유도는 이번 범위 밖.
- **동점 최대 무게의 날짜**: 예측과 서버가 다른 행을 고를 수 있으나 헤더 무게는 같고 재조회가
  바로잡는다(spec 경계).
