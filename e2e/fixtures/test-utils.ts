import { test as base, expect, Page } from '@playwright/test';

/**
 * Custom test fixtures for ClawLegion E2E tests
 */

// Extended test fixture with common utilities
export const test = base.extend<{
  /** Page with navigation helpers */
  dashboardPage: Page;
}>({
  dashboardPage: async ({ page }, use) => {
    // Navigate to dashboard and wait for load
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await use(page);
  },
});

export { expect };

// Helper functions for common operations
export async function waitForApiResponse(page: Page, urlPattern: string | RegExp) {
  return page.waitForResponse((response) => {
    const url = response.url();
    if (typeof urlPattern === 'string') {
      return url.includes(urlPattern);
    }
    return urlPattern.test(url);
  });
}

export async function navigateTo(page: Page, path: string) {
  await page.goto(path);
  await page.waitForLoadState('domcontentloaded');
}

export async function waitForToast(page: Page, text?: string) {
  const toast = page.locator('[role="alert"], [data-testid="toast"]');
  await expect(toast).toBeVisible();
  if (text) {
    await expect(toast).toContainText(text);
  }
  return toast;
}

// Test data generators
export function generateTaskData(overrides = {}) {
  const timestamp = Date.now();
  return {
    title: `E2E Test Task ${timestamp}`,
    description: `Automated test task created at ${new Date().toISOString()}`,
    priority: 'P2' as const,
    ...overrides,
  };
}

export function generateUniqueId() {
  return `e2e-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Selectors for common UI elements
export const selectors = {
  // Navigation
  nav: {
    dashboard: '[data-testid="nav-dashboard"], a[href="/dashboard"]',
    tasks: '[data-testid="nav-tasks"], a[href="/tasks"]',
    agents: '[data-testid="nav-agents"], a[href="/agents"], a[href="/agents/fleet"]',
    sessions: '[data-testid="nav-sessions"], a[href="/sessions"]',
    chat: '[data-testid="nav-chat"], a[href="/chat"]',
  },
  // Tasks page
  tasks: {
    createButton: '[data-testid="btn-create-task"], button:has-text("New Task"), button:has-text("Create")',
    list: '[data-testid="task-list"]',
    item: '[data-testid="task-item"]',
    modal: '[data-testid="task-modal"], [role="dialog"]',
    titleInput: '[data-testid="task-title"], input[name="title"], input[placeholder*="title"]',
    descriptionInput: '[data-testid="task-description"], textarea[name="description"]',
    prioritySelect: '[data-testid="task-priority"], select[name="priority"]',
    submitButton: '[data-testid="btn-submit-task"], button[type="submit"]:has-text("Create")',
    deleteButton: '[data-testid="btn-delete-task"]',
  },
  // Agents page
  agents: {
    card: '[data-testid="agent-card"]',
    statusIndicator: '[data-testid="agent-status"]',
    refreshButton: '[data-testid="btn-refresh"]',
    profilePanel: '[data-testid="agent-profile-panel"]',
  },
  // Chat page
  chat: {
    container: '[data-testid="chat-container"]',
    input: '[data-testid="chat-input"], textarea[placeholder*="message"], input[placeholder*="message"]',
    sendButton: '[data-testid="btn-send"], button[aria-label="Send"]',
    messageList: '[data-testid="message-list"]',
    message: '[data-testid="chat-message"]',
  },
};

// Viewport sizes for responsive testing
export const viewports = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1280, height: 720 },
};
