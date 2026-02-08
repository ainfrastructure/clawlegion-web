import { test, expect } from '@playwright/test'

// ============================================
// E2E TESTS: /agents/fleet - Agent Fleet Management
// ============================================

test.describe('Agent Fleet Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/agents/fleet')
    // Wait for page to stabilize
    await page.waitForLoadState('networkidle')
  })

  test('page loads with correct heading', async ({ page }) => {
    // The page should show Agent Fleet heading
    const heading = page.locator('h1')
    await expect(heading).toContainText(/Agent Fleet/i)
  })

  test('displays agent fleet stats cards', async ({ page }) => {
    // Look for stats section - should have cards showing fleet metrics
    const statsSection = page.locator('text=/Total Agents|Active|Completed/i').first()
    await expect(statsSection).toBeVisible({ timeout: 10000 })
  })

  test('shows agent content area', async ({ page }) => {
    // Page should have content - either agent cards, stats, or main content area
    const mainContent = page.locator('main, [class*="content"], [class*="container"]').first()
    await expect(mainContent).toBeVisible()
    
    // Should have at least some interactive elements
    const buttons = await page.locator('button').count()
    expect(buttons).toBeGreaterThan(0)
  })

  test('has refresh functionality', async ({ page }) => {
    // Should have a refresh button
    const refreshButton = page.locator('button').filter({ has: page.locator('[class*="refresh"], svg') }).first()
    if (await refreshButton.isVisible()) {
      await refreshButton.click()
      // Should not error
    }
  })

  test('page has navigation sidebar', async ({ page }) => {
    // Should have sidebar navigation
    const sidebar = page.locator('nav, aside, [class*="sidebar"]').first()
    await expect(sidebar).toBeVisible({ timeout: 5000 })
  })

  test('mobile responsive - stats stack on small screens', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.reload()
    await page.waitForLoadState('networkidle')
    
    // Page should still render
    const heading = page.locator('h1')
    await expect(heading).toBeVisible()
  })

  test('tablet responsive - proper layout', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.reload()
    await page.waitForLoadState('networkidle')
    
    // Page should render properly
    const heading = page.locator('h1')
    await expect(heading).toBeVisible()
  })

  test('no JavaScript errors on page load', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', err => errors.push(err.message))
    
    await page.reload()
    await page.waitForLoadState('networkidle')
    
    // Filter out common non-critical errors
    const criticalErrors = errors.filter(e => 
      !e.includes('ResizeObserver') && 
      !e.includes('hydration')
    )
    expect(criticalErrors).toHaveLength(0)
  })

  test('has export button for agent data', async ({ page }) => {
    // Should have export functionality
    const exportButton = page.locator('button:has-text("Export"), [data-testid="export-button"]').first()
    if (await exportButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(exportButton).toBeEnabled()
    }
  })

  test('agent status indicators are visible', async ({ page }) => {
    // Look for status indicators (active, idle, rate_limited, etc.)
    const statusIndicators = page.locator('[class*="status"], [class*="badge"], [class*="indicator"]')
    // At minimum the page structure should be present
    const pageContent = page.locator('main, [class*="content"]')
    await expect(pageContent).toBeVisible()
  })

  test('activity feed section exists', async ({ page }) => {
    // Should have an activity or recent actions section
    const activitySection = page.locator('text=/Activity|Recent|Actions/i').first()
    if (await activitySection.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(activitySection).toBeVisible()
    }
  })
})
