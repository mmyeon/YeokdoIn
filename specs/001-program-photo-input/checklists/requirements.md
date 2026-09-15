# Specification Quality Checklist: 화이트보드 프로그램 입력

**Purpose**: Validate specification completeness and quality before proceeding to planning
**Created**: 2026-09-02
**Last validated**: 2026-09-08 (원문 개선분 반영 후)
**Feature**: [spec.md](../spec.md)

## Content Quality

- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

## Requirement Completeness

- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Success criteria are technology-agnostic (no implementation details)
- [x] All acceptance scenarios are defined
- [x] Edge cases are identified
- [x] Scope is clearly bounded (Out of Scope 섹션 포함)
- [x] Dependencies and assumptions identified

## Feature Readiness

- [x] All functional requirements have clear acceptance criteria
- [x] User scenarios cover primary flows
- [x] Feature meets measurable outcomes defined in Success Criteria
- [x] No implementation details leak into specification

## Notes

- 확정된 결정 5건은 spec 상단 「결정 사항」과 Out of Scope에 명시했다.
  1. 입력 경로: 텍스트 붙여넣기 단일 경로. 앱 내 OCR 제외.
  2. 입력 흐름: 붙여넣기 → 「다음」 → 확인 2단계. 되돌아가기 없음.
  3. 저장 단위: 텍스트 줄만 저장. 구조화 파싱은 읽는 시점으로 미룸.
  4. 정제: 절차적 정제. 사용자 확정 + 위생 처리만.
  5. 의심 구간: 숫자 자리 문자 혼동만 표시. 규약 적합성 검사는 안 함.
- 표기 규약의 진실은 `docs/gym-program-notation.md`, 종목 어휘의 진실은 DB에 있다. spec은 해석하지 않고 보존만 한다.
- 금지 요구사항 4건 — FR-005(이미지 미처리), FR-013(규약 검사 금지), FR-014(자동 수정 금지),
  FR-029(구조화 저장 금지). 뒤집으려면 spec을 먼저 수정한다(헌법 I, SDD).
- FR-011(분해 단계는 아무것도 버리지 않음)과 FR-027~028(저장은 확정본 + 위생 처리)은
  적용 단계가 다르다. 충돌이 아니며, 각 조항에 적용 범위를 명시했다.
- **SSOT 정리 완료 (2026-09-02)**:
  - `docs/gym-program-notation.md` 재작성. 기록 대상을 「실제 칠판 원문 + 원문으로 확인된 규칙」으로
    한정하고, 근거 없는 항목을 5장 「미확정」에 격리했다. 4장 「오인식 패턴」을 신설해 FR-012의
    단일 출처를 만들었다.
  - `docs/specs/2026-07-24-program-text-paste-design.md` 를 ❌ 대체됨으로 내렸다(상태 표 1줄).
    차이의 상세는 본 명세 Dependencies에 있으며 인덱스에 중복 기술하지 않는다.
  - 명세는 오인식 목록을 복제하지 않고 문서 4장을 참조만 한다(FR-012).
- **원문 개선 반영 (2026-09-08)**: 칠판 원문 전사가 수정되면서 규칙 3건이 확정되고 1건이 해소됐다.
  마침표=줄임말 표시자(3.7), 줄 끝 쉼표=이어짐 신호(3.4), 줄임말 앞 공백의 의미(3.7).
  「한 줄에 두 종목이 붙음」은 전사 오류로 판명돼 5.1에서 해소됐다.
- **미해결 (구현 전 확인 권장)**: 문서 5.1의 「괄호 없는 복합 렙」과 「렙×세트 순서」는 판정 불가 상태다.
  둘 다 표시 대상에서 제외했으므로 구현을 막지는 않는다.
- **별건 보안 사항**: `feat/ocr-program-input` 브랜치 `scripts/ocr-fixture-gen.mjs:16` 에
  Gemini API 키가 하드코딩돼 있다. origin에 push되지 않아 유출은 아니나 키 폐기·재발급 권장.
  본 기능과 무관한 별도 작업.

## 전체 결과

16/16 통과. `/speckit-plan` 진행 가능.
