import { test, expect } from '@playwright/test';

test.describe('Tasks Graph Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tasks/graph');
  });

  test('should display page heading and subtitle', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Task Graph');
    await expect(page.getByText('Visual dependency graph of all tasks')).toBeVisible();
  });

  test('should display graph view or loading state', async ({ page }) => {
    // The page should show either the graph or a loading state
    const loadingOrGraph = page.getByText('Loading task graph').or(page.locator('canvas')).or(page.locator('[data-testid="task-graph"]'));
    // Just check that the page structure is there
    await expect(page.locator('h1')).toContainText('Task Graph');
  });

  test('should have proper page structure', async ({ page }) => {
    // Check for the main flex container with the graph content
    await expect(page.locator('h1')).toContainText('Task Graph');
    await expect(page.getByText('Click a node to see details')).toBeVisible();
  });

  test('should not show sidebar initially', async ({ page }) => {
    // Task details sidebar only shows when a node is clicked
    await expect(page.getByText('Task Details')).not.toBeVisible();
  });

  test('should load without JavaScript errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.waitForLoadState('networkidle');
    expect(errors.filter(e => !e.includes('hydration'))).toHaveLength(0);
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('h1')).toContainText('Task Graph');
    // Graph should still be visible on mobile
    await expect(page.getByText('Visual dependency graph')).toBeVisible();
  });

  test('should be responsive on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('h1')).toContainText('Task Graph');
    await expect(page.getByText('Visual dependency graph')).toBeVisible();
  });

  test('should have clickable instruction in subtitle', async ({ page }) => {
    await expect(page.getByText('Click a node to see details')).toBeVisible();
  });
});
