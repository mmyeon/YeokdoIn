-- movement_aliases 제거
-- 사유: 파서/resolver와 연결되지 않아 사용자 설정 burden만 발생. v1은 exercises canonical 이름만 사용.
-- 재도입 계획: 사용자 요청 누적 시 시스템 dictionary(exercise_aliases)로 대체 (Phase 2+).

DROP TABLE IF EXISTS "public"."movement_aliases" CASCADE;
