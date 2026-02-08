import { test, expect } from '@playwright/test';

test('Task Board page loads', async ({ page }) => {
  // Go to board page
  await page.goto('/board');
  
  // Check for Kanban columns
  await expect(page.getByText('Backlog')).toBeVisible({ timeout: 10000 });
  await expect(page.getByText('Todo')).toBeVisible();
  await expect(page.getByText('In Progress')).toBeVisible();
  await expect(page.getByText('Completed')).toBeVisible();
  
  // Check stats bar exists
  await expect(page.locator('text=/Total:/')).toBeVisible();
  
  console.log('✅ Task Board page loads correctly!');
});

test('Dashboard has Task Board link', async ({ page }) => {
  await page.goto('/dashboard');
  
  // Check for Task Board link in navigation
  const taskBoardLink = page.getByRole('link', { name: /Task Board/i });
  await expect(taskBoardLink).toBeVisible({ timeout: 10000 });
  
  // Click and verify navigation
  await taskBoardLink.click();
  await expect(page).toHaveURL(/\/board/);
  
  console.log('✅ Task Board navigation works!');
});
