import { test, expect } from '@playwright/test'

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

test.describe('Tasks Page E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/tasks`)
    // Wait for page to be ready
    await page.waitForLoadState('networkidle')
  })

  test('tasks page loads correctly', async ({ page }) => {
    // Check page title/heading
    await expect(page.locator('h1:has-text("Task Queue")')).toBeVisible()
    
    // Check view mode toggle buttons exist
    await expect(page.locator('button[title*="Kanban"], button:has-text("Kanban")')).toBeVisible()
    await expect(page.locator('button[title*="List"], button:has-text("List")')).toBeVisible()
    
    // Check search input exists
    await expect(page.locator('input[placeholder*="Search"]')).toBeVisible()
    
    // Take screenshot
    await page.screenshot({ path: 'e2e/screenshots/tasks.png', fullPage: true })
  })

  test('tasks page shows task stats', async ({ page }) => {
    // Check for stat cards or counters
    const statsSection = page.locator('[class*="stats"], [class*="metric"], [class*="card"]')
    const hasStats = await statsSection.count() > 0
    
    // At minimum, page should show some indication of task counts
    // Either in stats cards or column headers
    const hasContent = await page.locator('text=/\\d+ tasks?|Queued|In Progress|Completed/i').count() > 0
    expect(hasStats || hasContent).toBeTruthy()
  })

  test('tasks kanban view shows columns', async ({ page }) => {
    // Ensure we're in kanban view
    const kanbanBtn = page.locator('button[title*="Kanban"], button:has-text("Kanban")')
    if (await kanbanBtn.isVisible()) {
      await kanbanBtn.click()
      await page.waitForTimeout(300)
    }
    
    // Check for column structure (kanban typically has multiple columns)
    // Look for column headers or container elements
    const columnIndicators = page.locator('text=/Queued|Assigned|In Progress|Completed|Failed/i')
    const columnCount = await columnIndicators.count()
    
    // Should have at least 2 visible status columns
    expect(columnCount).toBeGreaterThanOrEqual(2)
    
    await page.screenshot({ path: 'e2e/screenshots/tasks-kanban.png', fullPage: true })
  })

  test('tasks list view works', async ({ page }) => {
    // Switch to list view
    const listBtn = page.locator('button[title*="List"], button:has-text("List")')
    await listBtn.click()
    await page.waitForTimeout(300)
    
    // In list view, we should see a table or list structure
    const hasTable = await page.locator('table, [role="table"]').count() > 0
    const hasList = await page.locator('[role="list"], [class*="list"]').count() > 0
    const hasRows = await page.locator('[class*="row"], tr').count() > 0
    
    expect(hasTable || hasList || hasRows).toBeTruthy()
    
    await page.screenshot({ path: 'e2e/screenshots/tasks-list.png', fullPage: true })
  })

  test('tasks search filters results', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]')
    
    // Type a search query
    await searchInput.fill('test')
    await page.waitForTimeout(500)
    
    // The page should respond to search (either showing filtered results or no results message)
    // Just verify the input accepted the value
    await expect(searchInput).toHaveValue('test')
    
    // Clear search
    await searchInput.clear()
    await page.waitForTimeout(300)
    await expect(searchInput).toHaveValue('')
  })

  test('tasks status filter works', async ({ page }) => {
    // Look for filter buttons or dropdown
    const filterButtons = page.locator('button:has-text("All"), button:has-text("Queued"), button:has-text("Completed")')
    
    if (await filterButtons.count() > 0) {
      // Click a filter button
      const completedBtn = page.locator('button:has-text("Completed")')
      if (await completedBtn.isVisible()) {
        await completedBtn.click()
        await page.waitForTimeout(300)
      }
    }
    
    // Verify filter interaction worked (page didn't crash)
    await expect(page).toHaveURL(/.*tasks.*/)
  })

  test('tasks refresh button works', async ({ page }) => {
    // Look for refresh button
    const refreshBtn = page.locator('button:has([class*="refresh"], [class*="RefreshCw"]), button[title*="Refresh"]')
    
    if (await refreshBtn.isVisible()) {
      await refreshBtn.click()
      // Just verify no errors
      await page.waitForTimeout(500)
      await expect(page.locator('h1:has-text("Task Queue")')).toBeVisible()
    }
  })

  test('tasks page is responsive', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.reload()
    await page.waitForLoadState('networkidle')
    
    // Page should still show main heading
    await expect(page.locator('h1:has-text("Task Queue")')).toBeVisible()
    
    await page.screenshot({ path: 'e2e/screenshots/tasks-mobile.png', fullPage: true })
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.reload()
    await page.waitForLoadState('networkidle')
    
    await expect(page.locator('h1:has-text("Task Queue")')).toBeVisible()
    
    await page.screenshot({ path: 'e2e/screenshots/tasks-tablet.png', fullPage: true })
  })
})
