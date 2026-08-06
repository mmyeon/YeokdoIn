<!--
Sync Impact Report
- Version change: (신규 문서) → 1.0.0
- 기존 문서 대체: 이전 constitution(v1.0.0, 2026-08-05)을 폐기하고 새 문서로 재작성
- Core Principles (7):
  I. Specification-Driven Development (SDD)
  II. Type Safety (NON-NEGOTIABLE)
  III. Validated Inputs, Safe Outputs
  IV. Separation of Concerns
  V. Test-Driven Development (TDD)
  VI. Documentation First (NON-NEGOTIABLE)
  VII. No Speculative Features (YAGNI)
- Added sections: Guardrails, Architecture Constraints, Quality Standards, Governance
- 이전 문서에서 제외된 원칙:
  - State Management Separation → CLAUDE.md로 이관 (라이브러리 매핑은 실무 정보)
  - Korean Commit & PR Convention → 코딩규칙으로 이관 (형식 규칙은 자동 강제 대상)
  - Technology Constraints의 포트·명령어 → CLAUDE.md로 이관 (구체 정보는 헌법에서 배제)
- 참조 문서에서 채택하지 않은 원칙:
  - Contract-First API Design → 별도 백엔드 서버가 없어 컴파일러가 이미 계약을 강제하므로 제외
  - Response Result(응답 언어 규정) → 헌법은 개발 원칙만 다루므로 제외
- Follow-up TODOs:
  - 현재 코드 구조와 목표 구조의 차이(레이어 밖 디렉토리, feature 미분리 도메인) 정리는
    헌법 범위 밖의 후속 작업으로 진행
  - .specify/templates/plan-template.md ⚠ Constitution Check 섹션이 본 원칙을 참조하는지 검토 필요
  - .specify/templates/spec-template.md ⚠ 검토 필요
  - .specify/templates/tasks-template.md ⚠ 검토 필요
-->

# YeokdoIn Constitution

## Core Principles

### I. Specification-Driven Development (SDD)

모든 구현은 명세를 기반으로 하며, 명세는 구현보다 우선한다.

- **Why**: 명세 없는 구현은 불확실성을 야기하고 의사결정 근거를 남기지 않는다.
- **원칙**: 명세와 구현이 불일치하면 명세를 먼저 수정한 후 구현을 변경한다.

### II. Type Safety (NON-NEGOTIABLE)

타입 안전성은 협상 불가능한 필수 요구사항이다.

- **Why**: 런타임 에러의 대부분은 타입 문제에서 발생한다. 컴파일 시점에 잡는 것이 비용이 가장 적다.
- **원칙**: TypeScript strict 모드를 유지하며, 프로덕션 코드에서 `any` 타입을 금지한다.
  타입 체크를 통과하지 못한 코드는 커밋할 수 없다.
- **유일한 예외**: 테스트에서 런타임 환경에 존재하지 않는 전역 객체를 목킹하는 경우.
  그 외 목적의 `any`는 테스트에서도 금지한다.
- **스키마 동기화**: 데이터베이스 스키마를 변경하면 타입 생성을 반드시 재실행하고, 생성된
  타입을 마이그레이션과 같은 커밋에 포함한다. 스키마와 타입의 드리프트는 컴파일러가 잡을
  수 없는 유일한 구멍이므로 절차로 막는다.

### III. Validated Inputs, Safe Outputs

신뢰할 수 없는 입력은 검증되고, 모든 출력은 안전해야 한다.

- **Why**: 검증되지 않은 입력은 보안 취약점과 런타임 에러의 주요 원인이다.
- **검증 필수 대상**:
  - 사용자 입력 — 스키마 기반 검증을 거치지 않은 값은 사용할 수 없다.
  - 타입 선언만 존재하고 런타임 보장이 없는 외부 라이브러리의 출력.
- **검증 불필요 대상**: 자체 데이터베이스 스키마에서 생성된 타입이 형태를 보장하는 응답.
  중복 검증 비용을 치르지 않는다.
- **원칙**: 검증은 시스템 경계에서 한 번 수행하고, 내부 코드는 검증된 데이터를 신뢰한다.

### IV. Separation of Concerns

각 계층은 명확한 책임을 갖고, 계층 간 경계를 넘지 않는다.

- **Why**: 책임이 혼재된 코드는 테스트, 유지보수, 확장이 어렵다.
- **원칙**: 프레젠테이션 로직은 UI 계층에, 순수 비즈니스 로직은 모델 계층에, 데이터 접근은
  API 계층에 둔다. 구체적인 경계 규칙은 Architecture Constraints를 따른다.

### V. Test-Driven Development (TDD)

테스트는 구현 이후가 아닌 이전에 작성된다.

- **Why**: 사후 테스트는 구현에 맞춰 작성되어 실제 요구사항 검증에 실패한다.
- **원칙**: Red-Green-Refactor 사이클을 엄격히 준수한다. 테스트가 실패하는 것을 먼저 확인한
  뒤 구현에 착수한다.

### VI. Documentation First (NON-NEGOTIABLE)

모든 구현 결정은 공식 문서를 우선 참조한다.

- **Why**: 추측이나 오래된 지식은 잘못된 구현으로 이어지고, 시간 낭비와 재작업을 초래한다.
- **원칙**: 불확실한 사항은 공식 문서를 먼저 확인하고, 문서가 없으면 사용자에게 확인한다.
- **적용**:
  - Claude Code 기능/구조 → https://code.claude.com/docs 필수 참조
  - 프레임워크/라이브러리 → 최신 공식 문서 우선
  - 내부 규칙 → constitution.md → CLAUDE.md 순서로 참조
- **추측 금지**: 확신이 없으면 반드시 문서를 찾아 확인한다.

### VII. No Speculative Features (YAGNI)

기능은 추측이 아니라 확인된 마찰을 근거로 추가한다.

- **Why**: "불편할 것 같다"는 추측으로 추가한 기능은 검증되지 않은 사용자 니즈에 유지보수
  비용만 남긴다. 이 프로젝트에서 실제로 발생했던 문제다.
- **원칙**: 실사용(dogfooding)에서 견딜 수 없는 구체적 마찰이 드러났을 때만 기능을 추가한다.
  미래에 필요할 것 같다는 이유로 추상화나 확장 지점을 미리 만들지 않는다.

## 🚨 Guardrails (절대 준수 사항)

AI 코딩 에이전트가 실수로 위험한 작업을 수행하지 않도록 명시적으로 금지하는 규칙들이다.
이 규칙들은 어떤 상황에서도 위반할 수 없다.

### 데이터베이스 대상 확인 의무

파괴적 데이터베이스 명령을 실행하기 전, **대상이 로컬 인스턴스인지 반드시 확인**한다.
원격 프로젝트를 지정하는 플래그·설정·링크 상태를 확인하지 않은 채 실행하는 것을 금지한다.
"로컬이라고 생각했다"가 사고의 가장 흔한 원인이다.

### 로컬 데이터베이스

- 로컬 인스턴스에 대한 리셋 및 마이그레이션 적용 — 사용자 확인 없이 실행 가능
- 단, 복구 불가능한 작업 데이터가 존재할 수 있으면 리셋 대신 SQL로 해결한다

### 원격 데이터베이스

- 모든 파괴적 명령 — 사용자 승인 없이 절대 금지
- 스키마 변경 및 데이터 변경 자동 실행 — 절대 금지
- `DROP TABLE`, `DROP DATABASE` — 절대 금지
- `TRUNCATE` — 절대 금지
- `DELETE FROM` (WHERE 절 없이) — 절대 금지
- `ALTER TABLE DROP COLUMN` — 사용자 명시적 허가 필요

### Git 금지 명령어

- `git push --force` — 절대 금지
- `git reset --hard` — 절대 금지
- `git clean -fd` — 사용자 확인 필요
- 기본 브랜치에 대한 `git branch -D` — 절대 금지

### 패키지 관리 금지 명령어

- `npm audit fix --force` — 절대 금지
- `node_modules` 삭제 후 재설치 — 사용자 확인 필요
- 메이저 버전 자동 업그레이드 — 절대 금지

### 파일 시스템 금지 명령어

- 루트 경로 삭제 — 절대 금지
- 프로젝트 외부 파일 수정 — 절대 금지
- 환경 변수 파일 삭제 — 사용자 확인 필요
- 소스 디렉토리 전체 삭제 — 절대 금지

### 안전 작업 원칙

- 파괴적 작업(삭제, 초기화) 전 반드시 사용자 확인
- 복구 불가능한 작업은 백업 방법 먼저 안내
- 자동화된 스크립트의 파괴적 명령 실행 금지
- 의심스러운 작업은 실행 전 사용자에게 설명 및 확인

## Architecture Constraints

### Feature의 정의

feature는 **사용자가 앱에서 할 수 있는 일 하나**다.

판별 기준은 **삭제 테스트**다. 해당 폴더를 통째로 삭제했을 때 앱에서 정확히 그 능력 하나만
사라지고 나머지가 멀쩡하다면 feature다. 그렇지 않다면 그것은 feature가 아니라 공유 로직이거나
화면 조합이다.

구조를 위한 구조를 만들지 않는다. 계층을 늘리는 결정은 유지보수 이득을 근거로만 정당화된다.

### 레이어 의존 방향

각 feature는 `ui`(React 컴포넌트·훅), `model`(순수 로직), `api`(데이터 접근) 계층으로 나뉘며,
필요 시 `types`를 둔다. 의존은 단방향이다.

- `ui`는 `model`과 `api`를 참조할 수 있다
- `model`은 `ui`와 `api`를 참조할 수 없다 — I/O도 React도 포함하지 않는 순수 로직이어야 한다
- 역방향 참조는 금지한다

정의된 계층 외에 새로운 계층 이름을 임의로 추가하지 않는다.

### 배치 규칙 (Single Source of Truth)

각 요소는 단 하나의 정의 위치를 갖는다. 위치는 **사용 범위**가 결정한다.

- 하나의 feature에서만 쓰이는 것(타입·상태·서버 액션·훅 포함) → 해당 feature 내부
- 둘 이상의 feature가 쓰는 것 → 공유 디렉토리
- 데이터베이스 스키마에서 생성된 타입 → 단일 생성 산출물 (수동 편집 금지)

### 데이터 접근 경로

`ui`와 `model` 계층은 데이터베이스 클라이언트를 직접 호출할 수 없다.

- **Why**: 보안, 비즈니스 로직 중복, 데이터 접근 지점의 추적 불가능성
- **원칙**: 모든 데이터 접근은 `api` 계층을 경유한다. feature 전용 쿼리는 해당 feature의
  `api`에, 여러 feature가 공유하는 쿼리는 공유 `api`에 둔다.

## Quality Standards

### Non-Negotiable Quality Gates

다음 검증을 통과하지 못하면 커밋할 수 없다.

- TypeScript 타입 체크 통과
- 모든 테스트 통과
- 빌드 성공
- 명세 문서와 일치

### Security Requirements

- 환경 변수에 민감 정보 저장, 코드에 하드코딩 금지
- SQL Injection 방지: 파라미터 바인딩만 사용
- XSS 방지: 모든 사용자 입력 검증 + React 자동 이스케이핑
- 에러 메시지에 내부 구현 상세 노출 금지

## Governance

### Constitution Authority

이 Constitution은 모든 다른 개발 관행, 가이드, 제안보다 우선한다.

### Amendment Process

Constitution 수정은 다음 절차를 따른다.

1. 변경 제안 (이유, 영향 범위, 대안 분석 포함)
2. 검토 및 논의
3. 합의 도출
4. 영향받는 코드의 마이그레이션 계획 수립
5. 문서화 및 승인
6. 버전 업데이트

버전은 유의적 버전 규칙을 따른다. MAJOR는 원칙의 제거·재정의처럼 호환되지 않는 변경,
MINOR는 원칙 추가 또는 실질적 확장, PATCH는 표현 정리와 오탈자 수정에 해당한다.

### Enforcement

- 모든 PR은 Constitution 준수 여부 검증 필수
- 위반 사항 발견 시 즉시 수정
- 예외 허용 시 문서화 및 제한적 범위 명시

### Living Document

- Constitution은 프로젝트 진화에 따라 성장한다
- 하지만 핵심 원칙(Core Principles)은 신중히 변경한다
- 실무 세부사항(스택 구성, 실행 명령, 경로, 라이브러리 선택)은 CLAUDE.md에 위임한다
- 코드·커밋 작성 형식 규칙은 코딩규칙에 위임한다

실무 개발 가이드는 CLAUDE.md를 참조한다.

**Version**: 1.0.0 | **Ratified**: 2026-08-06 | **Last Amended**: 2026-08-06
