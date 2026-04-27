-- exercises canonical name 한글 → 영문 통일
-- 사유: 노테이션 파서 출력은 영문(snatch, back squat 등)인데 시드는 한글이라
--       buildAliasMap 매칭이 실패해 program-runner에서 처방 kg이 0kg으로 표시됨.
--       v1은 canonical name 만 사용(movement_aliases 제거됨)하므로 canonical을 영문으로 통일.

UPDATE public.exercises SET name = 'Snatch'         WHERE name = '스내치';
UPDATE public.exercises SET name = 'Clean'          WHERE name = '클린';
UPDATE public.exercises SET name = 'Jerk'           WHERE name = '저크';
UPDATE public.exercises SET name = 'Clean and Jerk' WHERE name = '클린앤저크';
UPDATE public.exercises SET name = 'Front Squat'    WHERE name = '프론트 스쿼트';
UPDATE public.exercises SET name = 'Back Squat'     WHERE name = '백 스쿼트';
UPDATE public.exercises SET name = 'Deadlift'       WHERE name = '데드리프트';
UPDATE public.exercises SET name = 'Push Press'     WHERE name = '푸시 프레스';
