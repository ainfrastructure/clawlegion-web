# E2E Tests for ClawLegion

This directory contains Playwright E2E tests for comprehensive browser-based testing of ClawLegion.

## Setup

```bash
# Install dependencies (already included in package.json)
pnpm install

# Install browsers
npx playwright install chromium
```

## Running Tests

```bash
# Run all tests
pnpm test:e2e

# Run with UI (interactive mode)
pnpm test:e2e:ui

# Run with visible browser
pnpm test:e2e:headed

# Debug mode
pnpm test:e2e:debug

# View last report
pnpm test:e2e:report

# Run specific test file
npx playwright test tasks.spec.ts

# Run tests matching pattern
npx playwright test --grep "creates task"
```

## Test Structure

```
e2e/
├── fixtures/
│   └── test-utils.ts     # Shared utilities, selectors, and fixtures
├── pages.spec.ts         # Page coverage tests (all pages load correctly)
├── tasks.spec.ts         # Task lifecycle tests
├── agents.spec.ts        # Agent availability tests
├── chat.spec.ts          # Chat/coordination tests
└── README.md             # This file
```

## Test Suites

### 1. Task Lifecycle (`tasks.spec.ts`) - 26 tests
- Create new task via form
- View task details
- Update task status
- Delete task
- Verify task appears in list
- Filter and search functionality
- Priority management

### 2. Agent Availability (`agents.spec.ts`) - 30 tests
- Dashboard shows all agents
- Status indicators work (online/offline/busy/rate_limited)
- Agent stats display correctly
- Click agent card shows details
- Activity feed
- Responsive design

### 3. Chat/Coordination (`chat.spec.ts`) - 28 tests
- Send message in coordination room
- Messages appear in chat
- @mentions work
- Message timestamps correct
- Agent selection
- Media attachments
- Responsive design

### 4. Page Coverage (`pages.spec.ts`) - 22 tests
- Home/Dashboard page loads
- Sessions page loads with data
- Tasks page loads with data
- Agents page loads with data
- Navigation works between all pages
- All clickable elements are interactive
- Error states (404)
- Responsive design

## Data Test IDs

Tests use `data-testid` attributes for reliable element selection. Key test IDs:

### Agents
- `data-testid="agent-card"` - Agent card component
- `data-testid="stat-total-agents"` - Total agents stat
- `data-testid="stat-active-now"` - Active agents stat
- `data-testid="stat-reachable"` - Reachable agents stat
- `data-testid="stat-unreachable"` - Unreachable agents stat
- `data-testid="btn-refresh"` - Refresh button
- `data-testid="btn-resume-all"` - Resume all button

### Chat
- `data-testid="chat-container"` - Main chat container
- `data-testid="chat-input"` - Message input textarea
- `data-testid="btn-send"` - Send message button
- `data-testid="message-list"` - Message list container
- `data-testid="chat-message"` - Individual message

### Tasks
- `data-testid="btn-create-task"` - Create task button
- `data-testid="task-list"` - Task list container
- `data-testid="task-item"` - Individual task item
- `data-testid="task-modal"` - Task modal dialog

## Configuration

Configuration is in `playwright.config.ts`:

- **Base URL**: `http://localhost:3000` (or `BASE_URL` env var)
- **Browsers**: Chromium, Mobile Chrome
- **Dev Server**: Auto-starts with `pnpm dev`
- **Retries**: 2 on CI, 0 locally
- **Timeouts**: 30s test, 5s expect, 2min webserver

## CI Integration

Tests are designed to run in CI:

```yaml
- name: Install Playwright Browsers
  run: npx playwright install chromium --with-deps

- name: Run E2E Tests
  run: pnpm test:e2e
  env:
    CI: true
```

## Visual Regression

Screenshots are captured on failure:
- Location: `test-results/`
- Format: PNG
- Video on first retry

## Writing New Tests

```typescript
import { test, expect } from '@playwright/test';
import { navigateTo, selectors } from './fixtures/test-utils';

test.describe('New Feature', () => {
  test('should work', async ({ page }) => {
    await navigateTo(page, '/path');
    await expect(page.locator('[data-testid="my-element"]')).toBeVisible();
  });
});
```

## Test Coverage Summary

| Suite | Tests | Coverage Area |
|-------|-------|---------------|
| Pages | 22 | All main pages, navigation, responsive |
| Tasks | 26 | CRUD operations, filtering, modals |
| Agents | 30 | Fleet dashboard, status, stats, cards |
| Chat | 28 | Messaging, agents, mentions, media |
| **Total** | **106** | **Comprehensive frontend coverage** |

*Note: Tests run on 2 browser configurations (Desktop Chrome, Mobile Chrome), resulting in 212 total test runs.*
