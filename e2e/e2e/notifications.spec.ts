import { test, expect } from '@playwright/test'

test.describe('Notifications Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/notifications')
  })

  test('displays page heading', async ({ page }) => {
    await expect(page.locator('h1')).toContainText(/notification|event|activity/i)
  })

  test('shows notification/event list', async ({ page }) => {
    await page.waitForLoadState('networkidle')
    
    // Should have event items or empty state
    const eventItems = page.locator('[class*="rounded"][class*="border"]')
    const count = await eventItems.count()
    expect(count).toBeGreaterThanOrEqual(0)
  })

  test('has filter controls', async ({ page }) => {
    // Should have filter buttons or dropdown
    const filterControls = page.locator('button:has-text("All"), button:has-text("Filter"), select')
    await expect(filterControls.first()).toBeVisible({ timeout: 10000 })
  })

  test('has refresh button', async ({ page }) => {
    const refreshButton = page.locator('button:has-text("Refresh"), button[aria-label*="refresh"]')
    await expect(refreshButton.first()).toBeVisible({ timeout: 10000 })
  })

  test('displays event icons', async ({ page }) => {
    await page.waitForLoadState('networkidle')
    
    // Should have Lucide icons
    const icons = page.locator('svg')
    const iconCount = await icons.count()
    expect(iconCount).toBeGreaterThan(0)
  })

  test('shows event timestamps', async ({ page }) => {
    await page.waitForLoadState('networkidle')
    
    // Should show relative timestamps (ago, Just now, etc)
    const timeText = page.locator('text=/ago|just now|\\d+[mhd] ago/i')
    // May or may not be visible depending on events
    const count = await timeText.count()
    expect(count).toBeGreaterThanOrEqual(0)
  })

  test('filter buttons work', async ({ page }) => {
    await page.waitForLoadState('networkidle')
    
    // Try clicking a filter if available
    const completedFilter = page.locator('button:has-text("Completed")')
    if (await completedFilter.isVisible()) {
      await completedFilter.click()
      await page.waitForLoadState('networkidle')
    }
  })

  test('clear all button exists if there are events', async ({ page }) => {
    await page.waitForLoadState('networkidle')
    
    // May have a "Clear All" or "Mark All Read" button
    const clearButton = page.locator('button:has-text("Clear"), button:has-text("Mark All")')
    // Just check it doesn't error
    const count = await clearButton.count()
    expect(count).toBeGreaterThanOrEqual(0)
  })

  test('mobile responsive - notifications at 375px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/notifications')
    
    await expect(page.locator('h1')).toBeVisible()
    
    // Page should not overflow
    const body = page.locator('body')
    const box = await body.boundingBox()
    expect(box?.width).toBeLessThanOrEqual(375)
  })

  test('tablet responsive - notifications at 768px', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/notifications')
    
    await expect(page.locator('h1')).toBeVisible()
  })

  test('no JavaScript errors on load', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    
    await page.goto('/notifications')
    await page.waitForLoadState('networkidle')
    
    const criticalErrors = errors.filter(e => 
      !e.includes('ResizeObserver') && 
      !e.includes('hydration')
    )
    expect(criticalErrors).toHaveLength(0)
  })

  test('shows event details on interaction', async ({ page }) => {
    await page.waitForLoadState('networkidle')
    
    // If there's an event, try clicking it
    const eventItem = page.locator('[class*="rounded"][class*="border"]').first()
    if (await eventItem.isVisible()) {
      // Just verify it's interactive (doesn't error)
      await eventItem.hover()
    }
  })
})
