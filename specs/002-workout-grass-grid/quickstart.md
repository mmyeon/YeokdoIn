# Quickstart: 검증 절차 — 운동 잔디 그리드

spec 의 「검증」 세 줄을 실행 가능한 게이트로 편 것이다. 전부 통과해야 커밋한다
(헌법 Quality Standards).

## 사전 준비

```bash
# Docker Desktop 실행 후
npx supabase start
npm run dev
```

DB 마이그레이션은 없다. 이 기능은 스키마를 건드리지 않는다.

## 게이트 1 — TDD 사이클 (헌법 V)

model 세 모듈은 **테스트를 먼저 쓰고 실패를 눈으로 확인한 뒤** 구현한다.

```bash
npx jest features/workout-grid   # 여기서 RED 를 확인하지 않고 구현에 들어가지 않는다
```

최소 커버 케이스:

| 대상 | 케이스 |
|---|---|
| `localDateKey` | `Asia/Seoul` 에서 `15:30Z` → 다음 날, `14:50Z` → 같은 날 (research R2 표) |
| `localDateKey` | 같은 입력을 `UTC` 로 넣으면 결과가 달라진다 — 타임존이 실제로 쓰인다는 증명 |
| `buildActivityIndex` | 같은 날 3건 → 항목 1개, `count === 3` (FR-001) |
| `buildGridWindow` | 길이 26, 마지막 열이 이번 주 (FR-005) |
| `buildGridWindow` | 이번 주 미래 요일이 `'future'`, `'inactive'` 가 아님 (spec 경계) |
| `buildGridWindow` | 첫 열의 창 밖 자리가 `null` (spec 경계: 잘린 주) |
| `buildGridWindow` | 26주보다 오래된 기록은 어떤 셀도 켜지 않는다 |
| `buildGridWindow` | `isToday` 가 정확히 한 칸에만 참 |

## 게이트 2 — 100건 대조 (spec 검증 1)

임의 시각 100건을 생성해, 켜진 칸의 `dateKey` 집합이 독립 계산과 일치하는지 본다.
독립 계산은 `buildGridWindow` 를 쓰지 않고 테스트 안에서 따로 만든다 — 같은 함수로 기대값을
만들면 아무것도 검증하지 않는다.

시드를 고정해 실패를 재현할 수 있게 한다. 경계 시각(로컬 00:00 직전·직후)을 반드시 표본에 넣는다.

## 게이트 3 — 폭 (spec 검증 2, FR-006)

```bash
npm run dev
```

브라우저 기기 툴바에서 **폭 375px** 로 맞추고 홈에 들어간다.

- [ ] 26열 전체가 보인다. 그리드에 가로 스크롤바가 없고, 좌우 스와이프로 밀리지 않는다.
- [ ] 홈의 세로 스크롤이 그리드 위에서도 정상 동작한다.
- [ ] 개발자도구에서 그리드 컨테이너의 `scrollWidth === clientWidth` 를 확인한다.

## 게이트 4 — 색 비의존 (spec 검증 3, FR-010)

개발자도구 Rendering 패널에서 **Emulate vision deficiencies → Achromatopsia** 를 켠다.

- [ ] 켜진 칸과 꺼진 칸을 구별할 수 있다(채움 vs 테두리).
- [ ] 미래 칸이 꺼진 칸과도 구별된다.
- [ ] 라이트·다크 테마 양쪽에서 확인한다.
- [ ] 임의의 칸에 포커스를 줬을 때 `aria-label` 에 날짜와 활동 여부가 문자로 들어 있다.

## 게이트 5 — 상태 분기 (FR-009)

- [ ] **기록 0건**: 빈 그리드 + 칸을 켜는 방법 안내가 보인다. 오류처럼 보이지 않는다.
- [ ] **조회 실패**: `usePrograms` 가 실패하도록 만든 뒤(네트워크 오프라인) 오류 안내와 재시도
      수단이 보인다. **빈 그리드로 위장하지 않는다.**
- [ ] 문구가 전부 한국어다 (CLAUDE.md).

## 게이트 6 — 프로젝트 게이트

```bash
npx tsc --noEmit
npx jest
npm run build
```

세 개 모두 통과해야 한다.
