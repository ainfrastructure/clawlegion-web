# CLAUDE.md — Project Context for AI Agents

> This file is read by AI agents at the start of every session.
> Keep it updated as the project evolves.

---

## Overview

**clawlegion-web** is the frontend dashboard for ClawLegion — a command center for monitoring and managing autonomous AI task execution. It provides real-time visibility into agent sessions, task tracking, and inter-agent communication.

The backend API lives in a separate repo: [clawlegion](https://github.com/ainfrastructure/clawlegion).

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15, React 19, TypeScript |
| Styling | Tailwind CSS, shadcn/ui |
| State | Zustand, TanStack React Query |
| Auth | NextAuth.js |
| Real-time | Socket.io Client |
| E2E Testing | Playwright |

---

## Project Structure

```
clawlegion-web/
├── app/                   # Next.js App Router pages
│   ├── api/               # Next.js API routes (auth, coordination)
│   ├── dashboard/         # Dashboard page
│   ├── tasks/             # Task management
│   ├── chat/              # Agent coordination chat
│   ├── sessions/          # Session monitoring
│   └── ...
├── components/            # React components
│   ├── layout/            # Layout components (Sidebar, Header)
│   ├── tasks/             # Task-related components
│   ├── chat/              # Chat components
│   └── ui/                # shadcn/ui primitives
├── lib/                   # Utilities, hooks, stores
├── e2e/                   # Playwright E2E tests
├── skills/                # AI skill definitions
│   └── frontend-design/   # Frontend design skill
└── public/                # Static assets
```

---

## Backend API

The backend runs separately at `localhost:5001`. Next.js proxies API requests via rewrites in `next.config.js`:
- `/api/*` → `localhost:5001/api/*`
- `/socket.io/*` → `localhost:5001/socket.io/*`

Key API endpoints:
- `GET /api/task-tracking/tasks` — List tasks
- `POST /api/task-tracking/tasks` — Create task
- `GET /api/coordination/room-messages` — Chat messages
- `GET /health` — Backend health check

---

## Running Locally

```bash
# Install dependencies
npm install

# Start dev server (port 3000)
npm run dev

# Build for production
npm run build

# Run E2E tests
npm run test:e2e
```

Requires the backend API running on port 5001. See the [clawlegion](https://github.com/ainfrastructure/clawlegion) repo.

---

## Coding Standards

### TypeScript
- Strict mode enabled
- Prefer `type` over `interface` for object types
- Use named exports, not default exports

### React
- Functional components with hooks only
- Keep components under 200 lines
- Extract reusable logic into custom hooks
- Use `use client` directive only when needed

### File Organization
- One component per file
- Colocate tests with source files
- Group by feature, not by type

---

## Pages

- `/dashboard` — Dashboard home (redirected from `/`)
- `/tasks` — Task management (list, kanban, graph views)
- `/chat` — Agent coordination chat
- `/sessions` — Session monitoring
- `/agents/fleet` — Agent fleet overview
- `/agents/org` — Agent org chart
- `/work` — Work items
- `/analytics` — Analytics dashboard
- `/settings` — System settings

---

## Skills

Custom skills are in `skills/` folder:
- `skills/frontend-design/SKILL.md` — Create distinctive, production-grade frontend interfaces.

---

*Last updated: 2026-02-08*
