-- Phase 1C-3 follow-up: drop programs.raw_notation
-- 폼 입력 전환 이후 raw_notation 은 더 이상 저장/조회되지 않는다.
-- 표시용 문자열은 parsed_data 에서 serializeProgram() 으로 파생한다.
-- 추후 노테이션 입력 기능을 다시 제공하게 되면 새 마이그레이션으로 컬럼을 복구한다.

ALTER TABLE "public"."programs" DROP COLUMN IF EXISTS "raw_notation";
