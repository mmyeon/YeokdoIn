# CLAUDE.md

## Goals

Weightlifting training assistant — track programs, analyze movements, manage PRs.

## Instructions

- Docker Desktop must be running before anything: `npx supabase start` → `npm run dev`
- `npm run generate-types` after Supabase schema changes
- PR titles and descriptions in Korean
- Commit prefix convention: `[feat]`, `[fix]`, `[refactor]`, etc.

## Domain Reference

- 노테이션 파싱, OCR, 종목 어휘(`base_exercises` / `gym_exercises`)를 건드리기 전에 반드시 `docs/gym-program-notation.md` 를 읽을 것. 체육관 표기법·modifier 어휘·표기 문법의 단일 기준이며, 기획·설계 단계에도 동일하게 적용된다.
- 종목 이름과 약어의 진실은 DB(`base_exercises`, `gym_exercises`)에 있다. 문서나 프롬프트에 목록을 복제하지 말 것.
- 과거 설계 문서는 `docs/specs/` 에 있다. **상태 표시를 먼저 확인할 것** — 서로 모순되는 문서가 섞여 있다. 인덱스는 `docs/specs/README.md`.

## Codebase Style

**Stack**: Next.js 15 (App Router) + React 19 + TypeScript 5 + Supabase + React Query + Jotai + shadcn/ui + MediaPipe

**Feature-based architecture** with 3-tier layers:

```text
features/[name]/
├── ui/      # React components, hooks (depends on model/ and api/)
├── model/   # Pure logic, no I/O, no React
├── api/     # Supabase queries, server actions
└── types/   # Optional
```

**State**: React Query (server) | Jotai (client) | React Context (auth only)

**Auth**: `AuthProvider` via `ClientProvider`, middleware protects `/training/*`, `/settings/*`, `/movement-analysis`

**Supabase local**: `127.0.0.1:54321` (API), `:54322` (DB), `:54323` (Studio)

## Database Conventions

- **Exercise names**: `exercises` 테이블의 이름은 영문이어야 한다 (`Snatch`, `Power Clean`). `buildAliasMap`이 이름을 lowercase 키로 쓰기 때문에, 표기가 어긋나면 조용히 매칭에 실패하고 `prescribedKg`가 `null`로 떨어진다.
- **Migration + seed 동기화**: `supabase/migrations/*.sql`로 종목을 추가하면 `supabase/seed.sql`에도 같은 행을 넣을 것. 안 그러면 로컬 `db reset` 결과가 forward-migrate 상태와 어긋난다.
- **Migration 배포**: 로컬 마이그레이션 생성 후 `npx supabase db push`로 원격 DB에 반영.
- **Weight nullability**: `SetRecord.kg`는 `number | null`. `null` = 처방을 아직 모름, `0` = 유효한 값(맨몸 운동). model 레이어에서 `?? 0`으로 기본값을 주지 말고, 렌더 경계까지 `null`을 밀어낼 것.

> ⚠️ 위 규약은 현행 `exercises` 테이블 기준이다. `base_exercises`/`gym_exercises`로 어휘를 통일하려는 미구현 설계가 있다 — `docs/specs/2026-05-19-exercise-vocabulary-unification-design.md`.
