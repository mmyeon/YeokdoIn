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
