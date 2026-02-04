# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

YeokdoIn (역도인) is a Next.js-based weightlifting training assistant application that helps users track their training programs, analyze movements, and manage personal records.

## Development Setup

### Prerequisites

1. **Docker Desktop** - REQUIRED. Must be running for local Supabase
2. **Node.js** - Project uses Next.js 15.2.2 with React 19
3. **Supabase CLI** - Installed via npm (included in devDependencies)

### Starting the Development Environment

**CRITICAL: Docker Desktop must be running, and the local Supabase instance MUST be started before starting the Next.js dev server.**

```bash
# 0. Ensure Docker Desktop is running (check system tray/menu bar)

# 1. Start local Supabase (requires Docker)
npx supabase start

# 2. Start Next.js development server
npm run dev
```

**Common startup error**: If you see `TypeError: Failed to fetch` errors related to Supabase auth, it means:

- Docker Desktop is not running, OR
- Supabase containers are not started (`npx supabase start` was not run)

The application expects Supabase to be available at `http://127.0.0.1:54321` (configured in `.env.local`).

### Environment Configuration

- **Local development**: Uses `.env.local` pointing to local Supabase instance (port 54321)
- **Production**: Uses `.env.production` pointing to hosted Supabase instance
- OAuth providers configured: Google, Kakao (credentials in `.env.local`)

### Key Commands

```bash
# Project-specific commands
npx supabase start            # MUST run before npm run dev
npx supabase status           # Check if Supabase is running
npm run generate-types        # After Supabase schema changes
```

## Architecture

### Application Structure

This project follows a **feature-based architecture** with Next.js App Router:

- **`app/`** - Next.js App Router pages (login, training/_, settings/_)
- **`features/[domain]/`** - Feature modules organized by domain with api/model/ui layers
- **`components/`** - Shared UI components (Radix UI/shadcn/ui)

New features should follow this structure:

```
features/[feature-name]/
├── api/          # API/service layer
├── model/        # State management, business logic
├── ui/           # Feature-specific UI components
└── types/        # TypeScript types (optional)
```

### Key Architectural Patterns

#### 1. Authentication Flow

- **Client-side**: `AuthProvider` wraps entire app via `ClientProvider`
- **Server-side**: Middleware protects routes (`/training/*`, `/settings/*`, `/movement-analysis`)
- **Session management**: Handled by `@supabase/ssr` with automatic token refresh
- Uses React Context (`AuthContext`) for auth state across components

**Authentication initialization**:

- On app mount, `AuthProvider` calls `authService.onAuthStateChange()`
- Supabase client attempts to load session from localStorage
- If token expired, automatically refreshes via `/auth/v1/token` endpoint
- **Common issue**: "Failed to fetch" error occurs when local Supabase isn't running

#### 2. State Management

- **React Query** (`@tanstack/react-query`): Server state, data fetching
- **Jotai**: Client-side atomic state management
- **React Context**: Authentication state only

Provider hierarchy (in `ClientProvider.tsx`):

```
QueryClientProvider (React Query)
  └── AuthProvider (Supabase auth state)
      └── App content
```

#### 3. Supabase Integration

**Client Types**:

- **Browser client** (`features/auth/supabase/BrowserClient.ts`): For client components
- **Server client** (middleware): For route protection

**Configuration**:

- Local: `http://127.0.0.1:54321` (port from `supabase/config.toml`)
- Studio UI: `http://127.0.0.1:54323`
- Database: `postgresql://postgres:postgres@127.0.0.1:54322/postgres`

**OAuth Setup**:

- Google and Kakao OAuth configured in `supabase/config.toml`
- Redirect URI: `http://127.0.0.1:54321/auth/v1/callback`

#### 4. Route Protection

Middleware (`middleware.ts`) protects authenticated routes:

- Checks session via server-side Supabase client
- Redirects unauthenticated users to login
- Protected paths: `/training/*`, `/settings/*`, `/movement-analysis`

### Technology Highlights

**Core Stack**:

- Next.js 15.2.2 (App Router) + React 19 + TypeScript 5
- Supabase (auth, database, storage)
- State: React Query (server) + Jotai (client) + React Context (auth)
- UI: Radix UI primitives with shadcn/ui components

**Special Features**:

- **MediaPipe Tasks Vision** (`@mediapipe/tasks-vision`) - for movement analysis

## Development Guidelines

### Pull Request Guidelines

**IMPORTANT**: When creating pull requests for this project:

- Always use Korean language for PR titles and descriptions
- Follow the commit message convention already used in the project (e.g., `[feat]`, `[fix]`, `[refactor]`)

### Database Type Generation

After schema changes in Supabase:

```bash
npm run generate-types
```

This generates `types_db.ts` from the remote Supabase schema.
