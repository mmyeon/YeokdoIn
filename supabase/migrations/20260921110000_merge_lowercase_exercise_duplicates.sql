-- 원격에만 있는 대소문자 중복(clean/Clean, snatch/Snatch)을 대문자 행으로 합친다.
-- 대문자 행을 남기는 이유: Catalyst 변형 종목의 pr_reference_id 가 이미 대문자 행을 가리킨다.
-- id 가 환경마다 다르므로 이름으로 짝을 짓는다. 소문자 행이 없는 환경(로컬)에서는 아무것도 안 한다.
-- personal-records 의 (user_id, exercise_id) 유니크가 걸리면 마이그레이션 전체가 실패한다 — 의도된 동작.

UPDATE public."personal-records" pr
SET exercise_id = upper_row.id
FROM public.exercises lower_row
JOIN public.exercises upper_row ON upper_row.name = initcap(lower_row.name)
WHERE lower_row.name IN ('clean', 'snatch')
  AND pr.exercise_id = lower_row.id;

UPDATE public.pr_history h
SET exercise_id = upper_row.id
FROM public.exercises lower_row
JOIN public.exercises upper_row ON upper_row.name = initcap(lower_row.name)
WHERE lower_row.name IN ('clean', 'snatch')
  AND h.exercise_id = lower_row.id;

UPDATE public.exercises e
SET pr_reference_id = upper_row.id
FROM public.exercises lower_row
JOIN public.exercises upper_row ON upper_row.name = initcap(lower_row.name)
WHERE lower_row.name IN ('clean', 'snatch')
  AND e.pr_reference_id = lower_row.id;

-- 위에서 참조를 전부 옮겼으므로 FK(RESTRICT)에 걸리지 않는다. 걸리면 놓친 참조가 있다는 뜻이다.
DELETE FROM public.exercises lower_row
USING public.exercises upper_row
WHERE upper_row.name = initcap(lower_row.name)
  AND lower_row.name IN ('clean', 'snatch');
