# Phase 0 Research: 유저별 PR 관리

**Date**: 2026-08-31 | **Plan**: [plan.md](./plan.md)

명세에는 미해결 `NEEDS CLARIFICATION`이 없다. 따라서 이 문서는 미지의 해소가 아니라
**계획이 전제한 기술적 가정을 실제로 검증한 기록**이다. 헌법 VI(추측 금지)에 따라
추론으로 남기지 않고 로컬 Postgres에서 직접 확인했다.

---

## R1. 정수 kg 검증을 `double precision` 컬럼에서 신뢰할 수 있는가

**Decision**: `weight = trunc(weight)` 를 CHECK 제약으로 쓴다. 컬럼 타입은 바꾸지 않는다.

**Rationale**: 정수는 이진 부동소수점에서 **2^53까지 정확히 표현된다**. PR 무게의 상한이 1000kg이므로
그 경계에서 한참 떨어져 있고, `trunc` 비교는 오차 없이 성립한다. 2026-09-02 로컬 Postgres
(`127.0.0.1:54322`)에 임시 테이블로 제약을 걸고 실제로 INSERT해 확인한 결과:

| 입력 | 결과 |
|---|---|
| 1 / 20 / 100 / 137 / 999 | ✅ 통과 |
| 1000 (상한 경계) | ✅ 통과 |
| 52.5 | ❌ 거부 (의도대로) |
| 52.4 | ❌ 거부 (의도대로) |
| 62.25 | ❌ 거부 (의도대로) |
| 100.5 | ❌ 거부 (의도대로) |
| 0.1 + 0.2 (= 0.30000000000000004) | ❌ 거부 (의도대로) |

경계 확인: `1000::float8 = trunc(1000::float8)` 과 `9007199254740992::float8 = trunc(...)`(2^53)이
모두 `true` 다. 상한 1000kg은 정확 표현 구간 안쪽에 안전하게 들어간다.

**Alternatives considered**:

- `integer`/`numeric(4,0)`로 컬럼 타입 변경 — 의미상 더 정확하지만 `ALTER COLUMN TYPE`은 테이블
  재작성을 유발하고 `types_db.ts` 재생성과 기존 코드의 `number` 가정을 흔든다. CHECK 한 줄로
  같은 보장을 얻으므로 위험을 살 이유가 없다.
- `weight % 1 = 0` — 부동소수점 나머지 연산은 타입에 따라 오차가 나므로 `trunc` 비교보다 불안정하다.
- 0.5kg 단위 허용 — 1.25kg 마이크로플레이트 한 쌍이면 총 중량이 .5로 떨어지므로 훈련 현실에는
  맞지만, 명세(FR-010, 엣지케이스)가 정수 kg으로 확정했다. 헌법 I에 따라 명세를 따른다.
- 검증을 애플리케이션에만 두기 — 헌법 III의 "경계에서 검증"을 만족하지 못한다. 액션을 우회하는
  쓰기를 막지 못한다.

---

## R2. 기존 데이터가 새 제약을 위반하는가

**Decision**: 위반 데이터가 없으므로 데이터 정리(backfill) 없이 CHECK 제약을 바로 추가할 수 있다.

**Rationale**: 2026-09-02 로컬 DB 실측 결과 두 테이블 모두 위반 0건이다.

| 테이블 | 총 행 | weight ≤ 0 | 정수 아님 | 1000 초과 | 미래 날짜 |
|---|---|---|---|---|---|
| `personal-records` | 1 | 0 | 0 | 0 | 0 |
| `pr_history` | 1 | 0 | 0 | 0 | 0 |

**주의**: 이는 **로컬** 데이터 기준이다. 원격 DB에는 dogfooding 중 쌓인 행이 더 있을 수 있다.
`db push` 전에 같은 질의를 원격에 **읽기 전용으로** 돌려 위반 건수를 먼저 확인해야 한다.
위반 행이 있으면 마이그레이션이 실패한다 — 이 경우 제약 추가 전에 정리 방침을 사용자와 정한다.

**Alternatives considered**:

- `NOT VALID`로 제약을 걸고 기존 행을 면제 — 기존 오염 데이터를 영구히 남긴다. 데이터가 1행뿐인
  현 상황에서 택할 이유가 없다.

---

## R3. 미래 날짜를 DB CHECK로 막을 수 있는가

**Decision**: 기술적으로는 가능하지만 **쓰지 않는다.** 미래 날짜는 model + 서버 액션에서만 검증한다.

**Rationale**: 먼저 실측했다. 로컬 Postgres에서

```sql
CREATE TEMP TABLE check_probe (d date, CONSTRAINT no_future CHECK (d <= current_date));
INSERT INTO check_probe VALUES (current_date);      -- INSERT 0 1
INSERT INTO check_probe VALUES (current_date + 1);  -- ERROR: violates check constraint
```

제약 생성도 되고 위반도 정확히 거부된다. 즉 "Postgres가 STABLE 함수를 CHECK에서 금지한다"는
통념은 **사실이 아니다** — 문서가 권장하지 않을 뿐 엔진이 막지 않는다.

쓰지 않기로 한 진짜 이유는 **덤프·복원 위험**이다. CHECK 제약은 삽입 시점뿐 아니라 테이블을
다시 검증하는 시점(`pg_restore`, `ALTER TABLE VALIDATE`)에도 평가된다. 그런데 이 제약은 시간에
따라 판정이 바뀌지 않는다 — 과거에 넣은 행은 시간이 흘러도 계속 `<= current_date`를 만족한다.
문제는 반대 방향이다. 시계 오차나 타임존 차이로 "오늘"의 경계에 걸친 행이 들어간 뒤, 다른
타임존의 서버에서 복원하면 그 행이 위반으로 판정되어 **복원 전체가 실패**할 수 있다.
DB 전체를 못 살리는 대가로 얻는 것이 날짜 검증 한 겹이라면 수지가 맞지 않는다.

따라서 미래 날짜는 **서버 액션이 마지막 방어선**이다. 무게 검증(R1, 3중 방어)과 달리 2중 방어에
그치는 이유이며, 의도한 차이다.

**Alternatives considered**:

- CHECK 제약 사용 — 위 이유로 기각. 얻는 방어 한 겹보다 복원 실패 위험이 크다.
- BEFORE INSERT 트리거 — 복원 시 재평가 문제가 없어 안전하지만, 검증 로직이 SQL과 TypeScript
  두 곳에 흩어진다. 날짜 하나를 위해 트리거를 도입하는 것은 YAGNI에 어긋난다.
- 클라이언트 `max` 속성 유지로 충분하다고 보기 — HTML `max`는 브라우저 힌트일 뿐 강제력이 없다.
  현재 이 상태이며 명세 FR-009를 만족하지 못한다.

---

## R4. `personal-records`와 `pr_history`의 정합성을 어떻게 지키는가

**Decision**: 현행 `recomputeCache()` 방식(이력에서 MAX를 다시 계산해 캐시를 덮어쓰기)을 유지한다.
원자성 보강은 이번 범위에서 하지 않되, 한계를 문서화한다.

**Rationale**: `pr_history`가 진실이고 `personal-records`는 파생 캐시다. 파생값을 매번 재계산하므로
캐시가 틀려도 다음 쓰기에서 자가 치유된다. 이미 구현되어 있고 서버 액션 테스트가 이 동작을
커버한다(`deletePRHistoryEntry`가 남은 이력의 MAX로 재계산, 이력이 비면 캐시 행 삭제).

**알려진 한계**: `pr_history` INSERT 성공 후 `recomputeCache`가 실패하면 캐시가 한 박자 뒤처진다.
Supabase 클라이언트는 여러 문장을 한 트랜잭션으로 묶지 않기 때문이다. 영향은 "목록의 무게가
잠시 옛 값" 수준이고 다음 쓰기에서 복구된다. 데이터 손실은 없다.

**Alternatives considered**:

- Postgres 함수(RPC)로 감싸 단일 트랜잭션화 — 정합성은 완벽해지나 로직이 SQL로 내려가
  테스트와 타입 안전성을 잃는다. 실사용에서 이 불일치가 실제 마찰을 일으킨 적이 없으므로
  헌법 VII(YAGNI)에 따라 보류한다. 마찰이 확인되면 그때 도입한다.

---

## R5. 소유자 검증이 이미 충분한가

**Decision**: 추가 작업 불필요. 현행 유지. FR-018은 이미 충족된다.

**Rationale**: 두 겹으로 걸려 있다.

- **RLS**: `personal-records`와 `pr_history` 모두 `ENABLE ROW LEVEL SECURITY` 상태이며
  SELECT/INSERT/UPDATE/DELETE 정책이 각각 `auth.uid() = user_id`를 요구한다.
- **애플리케이션**: 모든 서버 액션이 `requireUserId()`로 인증을 확인하고 모든 질의에
  `.eq("user_id", userId)`를 건다.

타인의 `id`를 직접 넣어도 RLS와 `user_id` 필터 양쪽에서 걸린다.

---

## 정리: 갭 목록

| FR | 현행 상태 | 조치 |
|---|---|---|
| FR-001~006 | ✅ 충족 | 없음 |
| FR-007 (무게+날짜 수정) | ⚠️ 부분 — `updateRecordWeight`가 `pr_date`를 오늘로 강제 | 날짜 인자 수용하도록 수정 |
| FR-008 (무게 하한) | ⚠️ 클라이언트만 | model + 서버 액션 + CHECK |
| FR-009 (미래 날짜) | ⚠️ 클라이언트 `max` 속성만 | model + 서버 액션 (R3에 따라 CHECK는 의도적으로 제외) |
| FR-010 (정수 kg) | ❌ 없음 | model + 서버 액션 + CHECK (R1) |
| FR-011 (실패 시 무변경) | ✅ 충족 | 한계만 문서화 (R4) |
| FR-012 (미등록 종목 구분) | ⚠️ 목록이 등록된 것만 렌더 | 목록 UI에 미등록 종목 표시 |
| FR-013~016 | ✅ 충족 | 없음 |
| FR-017 (기록 0~1건) | ⚠️ 미검증 | `PRSparkline` 경계 동작 확인 후 필요시 보강 |
| FR-018 (소유자 검증) | ✅ 충족 | 없음 (R5) |
| Edge: 무게 상한 1000kg | ❌ 없음 | model + 서버 액션 + CHECK |
