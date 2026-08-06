# 설계 문서 인덱스

2026-04~07 사이 여러 브랜치·워크트리에 흩어져 있던 설계 문서를 `main`으로 회수한 것.
**문서마다 상태가 다르고, 일부는 서로 정면으로 모순된다.** 읽기 전에 이 표를 먼저 볼 것.

노테이션 표기법 자체의 정본은 여기가 아니라 [`../gym-program-notation.md`](../gym-program-notation.md) 이다.

## 상태

| 문서 | 날짜 | 상태 | 요지 |
| --- | --- | --- | --- |
| [program-text-paste-design](./2026-07-24-program-text-paste-design.md) | 07-24 | ✅ **확정 · 구현 대기** | 붙여넣은 날것 텍스트를 세트별 불렛으로 렌더. 해석 0, 원문만 저장 |
| [exercise-vocabulary-unification-design](./2026-05-19-exercise-vocabulary-unification-design.md) | 05-19 | ⚠️ **유효 · 미구현** | 수동입력(Catalyst `exercises`)과 OCR(`base_exercises`) 어휘 이원화 해소 |
| [gym-exercise-ocr-parsing-design](./2026-05-18-gym-exercise-ocr-parsing-design.md) | 05-18 | ⚠️ **부분 유효** | `base_exercises`/`gym_exercises` 어휘 설계와 modifier 4분류는 살아있음. OCR 전제만 무효 |
| [gym-exercise-ocr-implementation](./2026-05-19-gym-exercise-ocr-implementation.md) | 05-19 | ⚠️ **구현됨 · main에 없음** | 위 설계의 실행 계획. `feat/ocr-program-input` 브랜치에만 반영 |
| [ocr-program-input-design](./2026-05-15-ocr-program-input-design.md) | 05-15 | ❌ **방향 폐기** | 앱이 Gemini Vision으로 사진을 OCR. 아래 「방향 전환」 참조 |
| [ocr-benchmark-design](./2026-05-19-ocr-benchmark-design.md) | 05-19 | ❌ **방향 폐기** | 앱 내 OCR 파이프라인 속도 측정. 전제가 사라짐 |

## 알려진 모순 2가지

**1. 앱이 OCR을 짓는가 — 뒤집혔다.**

2026-05 문서 5개는 전부 *앱이 사진을 받아 Gemini Vision으로 OCR한다*를 전제한다.
2026-07-24 문서는 정반대다:

> 입력 타이핑 0 — 붙여넣기만. **OS가 OCR을 대신하므로 앱은 OCR을 짓지 않는다.**

2개월 사이 방향이 뒤집혔고, 최신 결정이 우선한다. 다만 05월 문서군의 **어휘·modifier·파싱 규칙**은
OCR 여부와 무관하게 유효하므로 폐기하지 않고 참고용으로 남긴다.

**2. 복합 동작(`&` / `+`)을 쪼개는가 — 정반대다.**

| 문서군 | 처리 | 목적 |
| --- | --- | --- |
| 05월 OCR 문서 | **분리한다** — `A & B` → 항목 2개 | PR 매칭용 구조화 |
| 07-24 문서 (D7) | **붙여둔다** — 한 불렛 | 복합은 한 세트로 수행하므로 "현재 세트" 표시엔 붙어 있어야 함 |

둘 다 각자의 목적에선 옳다. 어느 쪽을 쓸지는 **만들려는 화면이 무엇인가**로 갈린다.

## 회수 출처

| 문서 | 원래 있던 곳 |
| --- | --- |
| program-text-paste-design | `feat/program-text-paste` |
| ocr-program-input-design | `feat/ocr-program-input` |
| gym-exercise-ocr-parsing-design | `feat/ocr-program-input` (`.claude/plans/`) |
| gym-exercise-ocr-implementation | `feat/ocr-program-input` (`.claude/plans/`) |
| exercise-vocabulary-unification-design | `feat/ocr-program-input` (`.claude/plans/`) |
| ocr-benchmark-design | `perf/ocr-benchmark` (`.claude/plans/`) |

`main`의 `.gitignore`에 `docs/` 가 있어 이 문서들이 전부 main에 올라오지 못했다.
같은 커밋에서 규칙을 `docs/*` + 예외 방식으로 고쳤다.
