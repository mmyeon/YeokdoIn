# Quickstart: PR 관리 기능 검증

**Date**: 2026-08-31 | **Plan**: [plan.md](./plan.md)

구현이 명세를 만족하는지 확인하는 실행 가능한 절차다. 구현 코드는 담지 않는다.

---

## 사전 조건

```bash
# 1. Docker Desktop 실행 중이어야 한다
npx supabase status          # "supabase local development setup is running" 확인

# 2. 스키마를 마이그레이션과 동기화
npx supabase db reset        # ⚠️ 로컬 데이터가 지워진다. 살릴 데이터가 있으면 건너뛰고 SQL로 처리
npm run generate-types       # types_db.ts 갱신 — 스키마 변경 후 필수

# 3. 개발 서버
npm run dev                  # http://localhost:3000
```

로그인 계정이 필요하다. Supabase Studio(`http://127.0.0.1:54323`)에서 사용자를 확인한다.

---

## 게이트 1 — 자동 검증 (커밋 전 필수)

헌법의 Non-Negotiable Quality Gates. 하나라도 실패하면 커밋할 수 없다.

```bash
npm run type-check      # tsc --noEmit — any 없이 통과해야 한다
npm test                # jest --coverage
npm run build           # next build
npm run lint
```

**기대 결과**: 전부 통과. 특히 아래 테스트가 존재하고 통과해야 한다.

| 테스트 | 위치 | 검증 대상 |
|---|---|---|
| `validatePRInput` 단위 테스트 | `features/personal-records/model/__tests__/` | contracts의 model 계약 표 전 항목 |
| 서버 액션 테스트 | `features/personal-records/api/__tests__/` | 기존 12개 + 검증 거부 케이스 |

**TDD 순서**: `validatePRInput` 테스트를 먼저 쓰고 **실패를 확인한 뒤** 구현한다. 실패를 보지
않고 넘어가면 헌법 V 위반이다.

---

## 게이트 2 — DB 제약 검증

마이그레이션이 실제로 방어하는지 SQL로 직접 확인한다. UI를 거치지 않는 경로가 핵심이다.

```bash
PGPASSWORD=postgres psql -h 127.0.0.1 -p 54322 -U postgres -d postgres
```

```sql
-- 전부 ERROR: violates check constraint 가 나와야 한다
INSERT INTO pr_history (user_id, exercise_id, new_weight, pr_date, source)
  VALUES ('<uuid>', 1, 0, current_date, 'manual');       -- 무게 0
INSERT INTO pr_history (user_id, exercise_id, new_weight, pr_date, source)
  VALUES ('<uuid>', 1, 52.4, current_date, 'manual');    -- 0.5 단위 아님
INSERT INTO pr_history (user_id, exercise_id, new_weight, pr_date, source)
  VALUES ('<uuid>', 1, 1500, current_date, 'manual');    -- 상한 초과

-- 통과해야 한다
INSERT INTO pr_history (user_id, exercise_id, new_weight, pr_date, source)
  VALUES ('<uuid>', 1, 52.5, current_date, 'manual');
```

미래 날짜는 DB가 막지 않는 것이 **정상**이다 ([research.md R3](./research.md)). 서버 액션에서만
막힌다.

### 원격 배포 전 필수 확인

`db push` 전에 원격에 위반 데이터가 있는지 **읽기 전용으로** 먼저 센다. 위반 행이 있으면
마이그레이션이 실패한다.

```sql
SELECT count(*) FILTER (WHERE new_weight <= 0)                        AS bad_weight,
       count(*) FILTER (WHERE new_weight * 2 <> trunc(new_weight * 2)) AS not_half_kg,
       count(*) FILTER (WHERE new_weight > 1000)                       AS over_limit
FROM pr_history;
```

0이 아니면 **push하지 말고** 정리 방침을 먼저 정한다.

---

## 게이트 3 — 수동 시나리오

`/settings/personal-records` 에서 명세의 수용 시나리오를 직접 확인한다.

### US1 — PR 등록 (P1)

| # | 조작 | 기대 |
|---|---|---|
| 1 | Add → 종목 `Snatch`, 무게 `80`, 날짜 어제 → Save | 목록에 `Snatch · 80kg · 어제 날짜` |
| 2 | 종목 드롭다운을 연다 | 카탈로그 전체가 보인다 (7개로 제한되지 않음) |
| 3 | 무게 `0` 입력 | 저장 불가 + "무게는 0보다 커야 합니다." |
| 4 | 무게 `52.4` 입력 | 저장 불가 + "무게는 0.5kg 단위로 입력해주세요." |
| 5 | 날짜를 내일로 입력 | 저장 불가 + "미래 날짜는 기록할 수 없습니다." |
| 6 | 이미 있는 `Snatch`로 다시 추가 | 행이 늘지 않고 기존 PR이 갱신된다 |
| 7 | 로그아웃 후 URL 직접 접근 | 인증 요구, 타인 데이터 미노출 |

### US2 — PR 수정 (P1)

| # | 조작 | 기대 |
|---|---|---|
| 1 | `Back Squat 120kg`을 `130kg` + 지난주 날짜로 수정 | **무게와 날짜가 모두** 반영 (현행 갭 지점) |
| 2 | 무게를 비우고 저장 | 거부, 기존 값 유지 |
| 3 | 저장 중 네트워크 차단 (DevTools Offline) | 실패 토스트, 기존 값 무손상 |

### US3 — 목록 조회 (P2)

| # | 조작 | 기대 |
|---|---|---|
| 1 | 3개 종목만 등록된 상태로 목록 열기 | 등록 3개는 무게·날짜, **미등록 종목은 구분되어 표시** (현행 갭 지점) |
| 2 | PR 0건 계정으로 목록 열기 | 빈 상태 안내 + 첫 등록 경로 |

### US4 — 과거 기록·추이 (P3)

| # | 조작 | 기대 |
|---|---|---|
| 1 | 이력 3건인 종목 선택 | 날짜순 목록 + 추이 그래프 |
| 2 | 이력 1건인 종목 선택 | **오류 없이** 현재 기록만 표시 (현행 갭 지점) |
| 3 | 이력 0건 (직접 URL) | 오류 없이 빈 상태 |
| 4 | PR 수정 후 상세 재진입 | 수정 결과가 이력에 반영 |
| 5 | 타인 record id로 URL 접근 | 조회 거부 |

---

## 게이트 4 — 정합성 확인

캐시가 이력에서 올바로 파생되는지 확인한다.

```sql
-- 결과가 0행이어야 한다. 1행이라도 나오면 캐시가 이력과 어긋난 것이다.
SELECT p.user_id, p.exercise_id, p.weight AS cached, m.max_weight
FROM "personal-records" p
JOIN (
  SELECT user_id, exercise_id, MAX(new_weight) AS max_weight
  FROM pr_history GROUP BY user_id, exercise_id
) m USING (user_id, exercise_id)
WHERE p.weight <> m.max_weight;

-- 이력이 없는데 캐시만 남은 행도 0이어야 한다.
SELECT p.* FROM "personal-records" p
WHERE NOT EXISTS (
  SELECT 1 FROM pr_history h
  WHERE h.user_id = p.user_id AND h.exercise_id = p.exercise_id
);
```

---

## 완료 기준

- [ ] 게이트 1 전부 통과 (type-check / test / build / lint)
- [ ] 게이트 2에서 잘못된 무게가 DB 레벨에서 거부됨
- [ ] 게이트 3의 US1~US4 시나리오 전부 기대대로 동작
- [ ] 게이트 4의 두 질의가 모두 0행
- [ ] `npm run generate-types` 재실행 결과가 커밋에 포함됨
- [ ] 원격 배포 시: push 전 위반 데이터 0건 확인
