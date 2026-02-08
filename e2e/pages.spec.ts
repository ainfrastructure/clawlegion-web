import { test, expect } from '@playwright/test';
import { navigateTo, viewports } from './fixtures/test-utils';

/**
 * Page Coverage Tests
 * 
 * SENIOR ENGINEER STANDARDS:
 * - All pages must load without errors
 * - Required elements must be present
 * - Navigation must work
 */

test.describe('Page Coverage', () => {
  
  test.describe('Home/Landing Page', () => {
    test('loads successfully with title', async ({ page }) => {
      await page.goto('/');
      await expect(page).toHaveTitle(/Ralph|Dashboard/i);
      await expect(page.locator('h1')).toBeVisible();
    });

    test('displays live stats', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const statsContainer = page.locator('.grid');
      await expect(statsContainer.first()).toBeVisible();
    });

    test('dashboard CTA navigates correctly', async ({ page }) => {
      await page.goto('/');
      
      const dashboardLink = page.locator('a[href="/dashboard"]').first();
      await expect(dashboardLink).toBeVisible();
      
      await dashboardLink.click();
      await expect(page).toHaveURL(/\/dashboard/);
    });
  });

  test.describe('Dashboard Page', () => {
    test('loads with main components', async ({ page }) => {
      await navigateTo(page, '/dashboard');
      
      await expect(page.locator('h1, h2').first()).toBeVisible();
    });
  });

  test.describe('Tasks Page', () => {
    test('loads with required elements', async ({ page }) => {
      await navigateTo(page, '/tasks');
      
      await expect(page.locator('h1')).toContainText(/task/i);
      
      const searchInput = page.locator('input[type="text"], input[placeholder*="search" i]');
      await expect(searchInput.first()).toBeVisible();
    });

    test('has create task button', async ({ page }) => {
      await navigateTo(page, '/tasks');
      
      const createButton = page.locator('button:has-text("New Task"), button:has-text("Create"), [data-testid="btn-create-task"]');
      await expect(createButton.first()).toBeVisible();
    });

    test('shows tasks or empty state', async ({ page }) => {
      await navigateTo(page, '/tasks');
      await page.waitForLoadState('networkidle');
      
      const taskItems = page.locator('[data-testid="task-item"], .task-item');
      const emptyState = page.locator('text=/no task/i, text=/empty/i');
      
      await page.waitForTimeout(2000);
      
      const hasTaskItems = await taskItems.count() > 0;
      const hasEmptyState = await emptyState.isVisible().catch(() => false);
      
      expect(hasTaskItems || hasEmptyState).toBe(true);
    });
  });

  test.describe('Agents Page', () => {
    test('loads fleet view with header', async ({ page }) => {
      await navigateTo(page, '/agents/fleet');
      await expect(page.locator('h1')).toContainText(/agent/i);
    });

    test('has refresh button', async ({ page }) => {
      await navigateTo(page, '/agents/fleet');
      
      const refreshButton = page.locator('[data-testid="btn-refresh"], button:has-text("Refresh")');
      await expect(refreshButton.first()).toBeVisible();
    });
  });

  test.describe('Sessions Page', () => {
    test('loads with proper header', async ({ page }) => {
      await navigateTo(page, '/sessions');
      await expect(page.locator('h1')).toContainText(/loop|session/i);
    });

    test('has search input', async ({ page }) => {
      await navigateTo(page, '/sessions');
      
      const searchInput = page.locator('input[placeholder*="search" i]');
      await expect(searchInput.first()).toBeVisible();
    });

    test('has new session button', async ({ page }) => {
      await navigateTo(page, '/sessions');
      
      const newButton = page.locator('a[href="/sessions/new"], button:has-text("New")');
      await expect(newButton.first()).toBeVisible();
    });
  });

  test.describe('Chat Page', () => {
    test('loads chat interface', async ({ page }) => {
      await navigateTo(page, '/chat');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      
      const chatArea = page.locator('[data-testid="chat-container"], .bg-zinc-900, [class*="chat"], textarea');
      await expect(chatArea.first()).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Navigation', () => {
    test('sidebar navigation works between pages', async ({ page }) => {
      await page.goto('/');
      
      await page.locator('a[href="/dashboard"]').first().click();
      await expect(page).toHaveURL(/\/dashboard/);
      
      await page.locator('a[href="/tasks"]').first().click();
      await expect(page).toHaveURL(/\/tasks/);
      
      await page.locator('a[href="/agents"], a[href="/agents/fleet"]').first().click();
      await expect(page).toHaveURL(/\/agents/);
    });

    test('page state survives refresh', async ({ page }) => {
      await navigateTo(page, '/tasks');
      await page.reload();
      await expect(page).toHaveURL(/\/tasks/);
    });
  });

  test.describe('Responsive Design', () => {
    test('mobile viewport renders correctly', async ({ page }) => {
      await page.setViewportSize(viewports.mobile);
      await navigateTo(page, '/tasks');
      await expect(page.locator('h1')).toBeVisible();
    });

    test('tablet viewport renders correctly', async ({ page }) => {
      await page.setViewportSize(viewports.tablet);
      await navigateTo(page, '/agents/fleet');
      await expect(page.locator('h1')).toBeVisible();
    });

    test('desktop viewport renders correctly', async ({ page }) => {
      await page.setViewportSize(viewports.desktop);
      await navigateTo(page, '/dashboard');
      await expect(page.locator('h1, h2').first()).toBeVisible();
    });
  });

  test.describe('Error States', () => {
    test('404 page shows for unknown routes', async ({ page }) => {
      await page.goto('/this-page-does-not-exist-12345');
      
      const has404 = await page.locator('text=/404|not found/i').count() > 0;
      const redirectedToKnownPage = !page.url().includes('does-not-exist');
      
      expect(has404 || redirectedToKnownPage).toBe(true);
    });
  });

  test.describe('Interactive Elements', () => {
    test('buttons are clickable', async ({ page }) => {
      await navigateTo(page, '/tasks');
      
      const button = page.locator('button').first();
      await expect(button).toBeVisible();
      await expect(button).toBeEnabled();
    });

    test('inputs are focusable', async ({ page }) => {
      await navigateTo(page, '/tasks');
      
      const input = page.locator('input[type="text"]').first();
      await expect(input).toBeVisible();
      
      await input.focus();
      await expect(input).toBeFocused();
    });
  });
});
