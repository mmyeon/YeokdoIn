# CLAUDE.md

## Goals

Weightlifting training assistant — track programs, analyze movements, manage PRs.

## Instructions

- Docker Desktop must be running before anything: `npx supabase start` → `npm run dev`
- `npm run generate-types` after Supabase schema changes
- PR titles and descriptions in Korean
- Commit prefix convention: `[feat]`, `[fix]`, `[refactor]`, etc.

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
