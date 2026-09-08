-- 화이트보드 프로그램 입력: programs 테이블에 텍스트 저장 형태를 추가한다.
-- lines IS NOT NULL  → 텍스트 프로그램 (붙여넣기 입력)
-- lines IS NULL      → 레거시 구조화 프로그램 (읽기 전용)
--
-- parsed_data 컬럼은 삭제하지 않는다. 레거시 행의 유일한 내용이다.

ALTER TABLE "public"."programs"
    ADD COLUMN IF NOT EXISTS "lines" text[],
    ADD COLUMN IF NOT EXISTS "source_text" text,
    ADD COLUMN IF NOT EXISTS "updated_at" timestamptz NOT NULL DEFAULT now();

COMMENT ON COLUMN "public"."programs"."lines" IS
    '사용자가 확정한 항목. 배열 순서가 표시 순서다. NULL 이면 레거시 구조화 프로그램.';
COMMENT ON COLUMN "public"."programs"."source_text" IS
    '사용자 편집 이전의 붙여넣기 원문.';
COMMENT ON COLUMN "public"."programs"."updated_at" IS
    '수정 시각. 트리거로 갱신한다.';

ALTER TABLE "public"."programs" ALTER COLUMN "parsed_data" DROP NOT NULL;

ALTER TABLE "public"."programs"
    DROP CONSTRAINT IF EXISTS "programs_content_shape";

ALTER TABLE "public"."programs"
    ADD CONSTRAINT "programs_content_shape" CHECK (
        ("lines" IS NOT NULL AND array_length("lines", 1) >= 1 AND "parsed_data" IS NULL)
        OR ("lines" IS NULL AND "parsed_data" IS NOT NULL)
    );

CREATE OR REPLACE FUNCTION "public"."set_updated_at"()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW."updated_at" = now();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS "programs_set_updated_at" ON "public"."programs";

CREATE TRIGGER "programs_set_updated_at"
    BEFORE UPDATE ON "public"."programs"
    FOR EACH ROW
    EXECUTE FUNCTION "public"."set_updated_at"();
