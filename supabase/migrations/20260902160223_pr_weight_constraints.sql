-- PR 무게 검증을 DB 경계에서 강제한다.
--
-- 배경: 검증이 클라이언트에만 있어 서버 액션을 우회하는 쓰기(수동 SQL, 향후
-- 자동 감지 경로)를 막지 못했다. 헌법 III(경계에서 검증)의 마지막 방어선.
--
-- 무게는 정수 kg만 허용한다 (FR-010). double precision 컬럼에서 이 비교가
-- 안전한 이유: 정수는 이진 부동소수점에서 2^53까지 정확히 표현되며,
-- 상한 1000kg은 그 구간 안쪽이다.
--
-- pr_date의 미래 방지는 CHECK로 걸지 않는다. CHECK는 pg_restore 등 테이블
-- 재검증 시점에도 평가되므로, 타임존이 다른 서버에서 복원할 때 경계에 걸친
-- 행 때문에 복원 전체가 실패할 수 있다. 미래 날짜는 서버 액션이 막는다.
--
-- @see specs/001-pr-management/research.md (R1, R3)
-- @see specs/001-pr-management/data-model.md

ALTER TABLE public.pr_history
  ADD CONSTRAINT pr_history_new_weight_positive CHECK (new_weight > 0),
  ADD CONSTRAINT pr_history_new_weight_max      CHECK (new_weight <= 1000),
  ADD CONSTRAINT pr_history_new_weight_integer  CHECK (new_weight = trunc(new_weight));

-- previous_weight에는 제약을 걸지 않는다. 파생 스냅샷이고 NULL이 정상 값이다.

ALTER TABLE public."personal-records"
  ADD CONSTRAINT personal_records_weight_positive CHECK (weight > 0),
  ADD CONSTRAINT personal_records_weight_max      CHECK (weight <= 1000),
  ADD CONSTRAINT personal_records_weight_integer  CHECK (weight = trunc(weight));
