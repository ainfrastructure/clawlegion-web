# ClawLegion Web

Web dashboard for **ClawLegion** — a command center for monitoring and managing autonomous AI agent task execution.

## Overview

ClawLegion Web provides:
- 📊 **Dashboard** — Real-time overview of agent fleet, active sessions, and task progress
- 🤖 **Agent Management** — Monitor agent status, health, and coordination
- 📋 **Task Board** — Kanban, list, and graph views for task tracking
- 💬 **Agent Chat** — Inter-agent coordination and human-in-the-loop communication
- 📈 **Analytics** — Metrics, trends, and performance insights
- 🔍 **Session Monitor** — Track workflow sessions and approvals
- ⚙️ **Settings** — Configure agents, integrations, and preferences

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15, React 19, TypeScript |
| Styling | Tailwind CSS |
| State | Zustand, TanStack React Query |
| Auth | NextAuth.js |
| Real-time | Socket.io Client |
| Testing | Vitest, Playwright |

## Getting Started

### Prerequisites
- Node.js 18+
- [ClawLegion API](https://github.com/ainfrastructure/clawlegion) running on port 5001

### Installation

```bash
# Clone the repo
git clone https://github.com/ainfrastructure/clawlegion-web.git
cd clawlegion-web

# Install dependencies
npm install

# Copy environment config
cp .env.example .env.local
# Edit .env.local with your settings (NEXTAUTH_SECRET is required)

# Start development server
npm run dev
```

The app runs at [http://localhost:3000](http://localhost:3000).

### Environment Variables

See `.env.example` for all available configuration options. At minimum, set:

```env
NEXTAUTH_SECRET="your-random-secret"
NEXTAUTH_URL="http://localhost:3000"
```

## Project Structure

```
app/                    # Next.js App Router pages & API routes
components/             # React components
  ├── common/           # Reusable UI primitives (36+ components)
  ├── agents/           # Agent management
  ├── chat-v2/          # Chat interface
  ├── dashboard/        # Dashboard widgets
  ├── layout/           # Layout (Sidebar, Header)
  ├── tasks/            # Task management
  └── workflow/         # Workflow visualization
hooks/                  # Custom React hooks
lib/                    # Utilities and stores
e2e/                    # Playwright E2E tests
types/                  # TypeScript type definitions
```

## Scripts

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Lint code
npm test             # Run unit tests
npm run test:e2e     # Run E2E tests
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd+K` | Global search |
| `?` | Show help |
| `g d` | Go to dashboard |
| `g t` | Go to tasks |
| `g a` | Go to agents |
| `n` | New task |

## License

MIT
