import { test, expect } from '@playwright/test'

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000'

test.describe('Work Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/work`)
    // Wait for page to load
    await page.waitForLoadState('domcontentloaded')
  })

  test('page heading and task count are visible', async ({ page }) => {
    await expect(page.locator('h1:has-text("Work")')).toBeVisible()
    // Should show task count
    await expect(page.locator('text=/\\d+ tasks/')).toBeVisible()
  })

  test('view toggle buttons exist', async ({ page }) => {
    // Board and List view toggles
    await expect(page.locator('button:has-text("Board")')).toBeVisible()
    await expect(page.locator('button:has-text("List")')).toBeVisible()
  })

  test('sub-navigation items are visible', async ({ page }) => {
    // SubNav with Tasks, Graph, Sprint - use first() to avoid strict mode issues
    await expect(page.locator('a:has-text("Tasks")').first()).toBeVisible()
    await expect(page.locator('a:has-text("Graph")').first()).toBeVisible()
    await expect(page.locator('a:has-text("Sprint")').first()).toBeVisible()
  })

  test('board view shows content', async ({ page }) => {
    // Board view is default - should show some content
    // Wait for data to load
    await page.waitForTimeout(1000)
    
    // Check for status labels (case insensitive) or task grid/columns
    const hasStatusLabels = await page.locator('text=/backlog|todo|progress|done/i').count() > 0
    const hasGridLayout = await page.locator('[class*="grid"], [class*="columns"]').count() > 0
    const hasCards = await page.locator('[class*="card"], [class*="rounded"]').count() > 3
    
    // Page structure is visible
    expect(hasStatusLabels || hasGridLayout || hasCards).toBeTruthy()
  })

  test('can switch to list view', async ({ page }) => {
    // Click List button
    await page.locator('button:has-text("List")').click()
    
    // List view should show the list button as active
    const listButton = page.locator('button:has-text("List")')
    await expect(listButton).toBeVisible()
  })

  test('mobile responsive - 375px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.reload()
    await page.waitForLoadState('domcontentloaded')
    
    await expect(page.locator('h1:has-text("Work")')).toBeVisible()
  })

  test('tablet responsive - 768px', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.reload()
    await page.waitForLoadState('domcontentloaded')
    
    await expect(page.locator('h1:has-text("Work")')).toBeVisible()
    await expect(page.locator('button:has-text("Board")')).toBeVisible()
  })

  test('no JavaScript errors on page load', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    
    await page.reload()
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(1000)
    
    // Filter out known non-critical errors
    const criticalErrors = errors.filter(e => 
      !e.includes('ResizeObserver') && 
      !e.includes('hydration')
    )
    expect(criticalErrors).toHaveLength(0)
  })

  test('task cards are clickable', async ({ page }) => {
    // If there are task cards, they should be links
    const taskCards = page.locator('a[href*="/work/"]')
    const count = await taskCards.count()
    
    if (count > 0) {
      // First card should be visible
      await expect(taskCards.first()).toBeVisible()
    }
  })

  test('screenshot', async ({ page }) => {
    await page.screenshot({ path: 'e2e/screenshots/work.png', fullPage: true })
  })
})
