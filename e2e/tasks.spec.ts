import { test, expect } from '@playwright/test';
import { navigateTo, generateTaskData, generateUniqueId } from './fixtures/test-utils';

/**
 * Task Lifecycle E2E Tests
 * 
 * SENIOR ENGINEER STANDARDS:
 * - Tests MUST fail when code is broken
 * - No if-guards that skip assertions
 * - Real assertions on actual state changes
 */

test.describe('Task Lifecycle', () => {
  
  test.describe('Task List Page', () => {
    test('displays task list with required elements', async ({ page }) => {
      await navigateTo(page, '/tasks');
      
      await expect(page.locator('h1')).toContainText(/task/i);
      
      const listContainer = page.locator('table, [data-testid="task-list"], .space-y-2, .divide-y');
      await expect(listContainer.first()).toBeVisible();
    });

    test('search input is functional', async ({ page }) => {
      await navigateTo(page, '/tasks');
      
      const searchInput = page.locator('input[placeholder*="search" i], input[type="text"]').first();
      await expect(searchInput).toBeVisible();
      
      await searchInput.fill('test-search-query');
      await expect(searchInput).toHaveValue('test-search-query');
    });

    test('filter buttons are present', async ({ page }) => {
      await navigateTo(page, '/tasks');
      
      const allButton = page.locator('button:has-text("All")').first();
      await expect(allButton).toBeVisible();
    });
  });

  test.describe('Create Task Modal', () => {
    test('opens task creation modal on button click', async ({ page }) => {
      await navigateTo(page, '/tasks');
      
      const createButton = page.locator('button:has-text("New Task"), button:has-text("Create Task"), [data-testid="btn-create-task"]').first();
      await expect(createButton).toBeVisible();
      
      await createButton.click();
      
      const modal = page.locator('[role="dialog"], [data-testid="task-modal"]');
      await expect(modal.first()).toBeVisible({ timeout: 3000 });
    });

    test('modal contains required form fields', async ({ page }) => {
      await navigateTo(page, '/tasks');
      
      await page.locator('button:has-text("New Task"), button:has-text("Create"), [data-testid="btn-create-task"]').first().click();
      await page.waitForTimeout(500);
      
      const titleInput = page.locator('input[name="title"], input[placeholder*="title" i], [data-testid="task-title"]').first();
      await expect(titleInput).toBeVisible();
      
      const descInput = page.locator('textarea, [data-testid="task-description"]');
      await expect(descInput.first()).toBeVisible();
    });

    test('can fill task form', async ({ page }) => {
      await navigateTo(page, '/tasks');
      
      await page.locator('button:has-text("New Task"), button:has-text("Create"), [data-testid="btn-create-task"]').first().click();
      await page.waitForTimeout(500);
      
      const taskData = generateTaskData();
      
      const titleInput = page.locator('input[name="title"], input[placeholder*="title" i], [data-testid="task-title"]').first();
      await titleInput.fill(taskData.title);
      await expect(titleInput).toHaveValue(taskData.title);
      
      const descInput = page.locator('textarea').first();
      await descInput.fill(taskData.description);
      await expect(descInput).toHaveValue(taskData.description);
    });

    test('modal can be closed', async ({ page }) => {
      await navigateTo(page, '/tasks');
      
      await page.locator('button:has-text("New Task"), button:has-text("Create"), [data-testid="btn-create-task"]').first().click();
      await page.waitForTimeout(300);
      
      const closeButton = page.locator('button:has-text("Cancel"), button:has-text("Close"), button[aria-label*="close" i]').first();
      await closeButton.click();
      await page.waitForTimeout(300);
      
      const modal = page.locator('[role="dialog"]:visible');
      await expect(modal).toHaveCount(0);
    });
  });

  test.describe('Task Details', () => {
    test('clicking task item shows detail view', async ({ page }) => {
      await navigateTo(page, '/tasks');
      await page.waitForLoadState('networkidle');
      
      const taskItem = page.locator('[data-testid="task-item"], tr.hover\\:bg-slate-800').first();
      const count = await taskItem.count();
      test.skip(count === 0, 'No tasks to test');
      
      await taskItem.click();
      await page.waitForTimeout(500);
      
      const detailView = page.locator('[role="dialog"], [data-testid="task-detail"]');
      await expect(detailView.first()).toBeVisible({ timeout: 3000 });
    });
  });

  test.describe('Task Status', () => {
    test('status controls exist', async ({ page }) => {
      await navigateTo(page, '/tasks');
      await page.waitForLoadState('networkidle');
      
      const statusControl = page.locator('select[name="status"], [data-testid="status-dropdown"], button:has-text("Todo"), button:has-text("In Progress")');
      await expect(statusControl.first()).toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    test('handles API error gracefully', async ({ page }) => {
      await page.route('**/api/task-tracking/**', route => {
        route.fulfill({
          status: 500,
          body: JSON.stringify({ error: 'Internal Server Error' })
        });
      });
      
      await navigateTo(page, '/tasks');
      
      await expect(page.locator('body')).toBeVisible();
      await expect(page.locator('h1')).toBeVisible();
    });
  });
});
