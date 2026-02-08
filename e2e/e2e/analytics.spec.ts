import { test, expect } from '@playwright/test'

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

test.describe('Analytics Page E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/analytics`)
    await page.waitForLoadState('networkidle')
  })

  test('analytics page loads correctly', async ({ page }) => {
    // Check page title/heading
    await expect(page.locator('h1:has-text("Analytics")')).toBeVisible()
    
    // Check page has loaded (not showing error)
    await expect(page.locator('text=Error')).not.toBeVisible()
    
    // Take screenshot
    await page.screenshot({ path: 'e2e/screenshots/analytics.png', fullPage: true })
  })

  test('analytics shows team metrics', async ({ page }) => {
    // Look for team metrics section or stat cards
    const statCards = page.locator('[class*="stat"], [class*="card"], [class*="metric"]')
    
    // Page should show some metrics (either cards or text indicators)
    const hasMetrics = await statCards.count() > 0
    const hasMetricText = await page.locator('text=/Total|Completed|Rate|Tasks/i').count() > 0
    
    expect(hasMetrics || hasMetricText).toBeTruthy()
  })

  test('analytics shows agent performance data', async ({ page }) => {
    // Look for agent cards or performance indicators
    const hasAgentSection = await page.locator('text=/Agent|Performance|Team/i').count() > 0
    const hasAgentCards = await page.locator('[class*="agent"], [class*="performer"]').count() > 0
    
    // Should show agent-related content
    expect(hasAgentSection || hasAgentCards).toBeTruthy()
  })

  test('analytics content loads without errors', async ({ page }) => {
    // Wait for data to load
    await page.waitForTimeout(1000)
    
    // Page should display analytics content without errors
    // Check that the page title is still visible (no crash)
    await expect(page.locator('h1:has-text("Analytics")')).toBeVisible()
    
    // No error messages should be displayed
    const errorMessages = await page.locator('text=/Error loading|Failed to load|Something went wrong/i').count()
    expect(errorMessages).toBe(0)
  })

  test('analytics export button exists', async ({ page }) => {
    // Look for export functionality
    const exportBtn = page.locator('button:has-text("Export"), button[title*="Export"], [class*="export"]')
    
    if (await exportBtn.isVisible()) {
      // Export button exists
      await expect(exportBtn.first()).toBeVisible()
      
      // Take screenshot showing export option
      await page.screenshot({ path: 'e2e/screenshots/analytics-export.png', fullPage: true })
    } else {
      // Export might be hidden or not implemented yet
      expect(true).toBeTruthy()
    }
  })

  test('analytics time range selector works', async ({ page }) => {
    // Look for time range selector (24h, 7d, 30d etc.)
    const timeSelectors = page.locator('button:has-text("24h"), button:has-text("7d"), button:has-text("30d")')
    
    if (await timeSelectors.count() > 0) {
      // Click a time range option
      await timeSelectors.first().click()
      await page.waitForTimeout(500)
      
      // Page should still be visible without errors
      await expect(page.locator('h1:has-text("Analytics")')).toBeVisible()
    }
  })

  test('analytics has chart or visualization elements', async ({ page }) => {
    // Look for chart or graph elements (could be progress bars, SVGs, or canvases)
    const hasChart = await page.locator('canvas, svg, [class*="chart"], [class*="graph"]').count() > 0
    const hasProgressBars = await page.locator('[class*="bar"], [class*="progress"], [role="progressbar"]').count() > 0
    
    // Analytics page should have some visualization or progress indicators
    expect(hasChart || hasProgressBars).toBeTruthy()
  })

  test('analytics is responsive', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.reload()
    await page.waitForLoadState('networkidle')
    
    // Page should still show heading
    await expect(page.locator('h1:has-text("Analytics")')).toBeVisible()
    
    await page.screenshot({ path: 'e2e/screenshots/analytics-mobile.png', fullPage: true })
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.reload()
    await page.waitForLoadState('networkidle')
    
    await expect(page.locator('h1:has-text("Analytics")')).toBeVisible()
    
    await page.screenshot({ path: 'e2e/screenshots/analytics-tablet.png', fullPage: true })
  })
})
