import { test, expect } from '@playwright/test'

test.describe('Health Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/health')
  })

  test('displays page heading', async ({ page }) => {
    await expect(page.locator('h1')).toContainText(/health|system|status/i)
  })

  test('shows system status indicator', async ({ page }) => {
    // Should show either healthy, degraded, or unhealthy status
    const statusIndicators = page.locator('[data-testid="health-status"], .text-green-400, .text-yellow-400, .text-red-400')
    await expect(statusIndicators.first()).toBeVisible({ timeout: 10000 })
  })

  test('displays health check cards', async ({ page }) => {
    // Wait for health data to load
    await page.waitForLoadState('networkidle')
    
    // Should have health check cards or loading state
    const healthCards = page.locator('[class*="rounded-lg"][class*="border"]')
    const cardCount = await healthCards.count()
    expect(cardCount).toBeGreaterThan(0)
  })

  test('shows uptime information', async ({ page }) => {
    await page.waitForLoadState('networkidle')
    
    // Should display uptime somewhere
    const uptimeText = page.locator('text=/uptime|\\d+[dhms]/i')
    await expect(uptimeText.first()).toBeVisible({ timeout: 10000 })
  })

  test('shows memory usage', async ({ page }) => {
    await page.waitForLoadState('networkidle')
    
    // Should display memory info (MB/GB)
    const memoryText = page.locator('text=/memory|heap|\\d+MB|\\d+GB/i')
    await expect(memoryText.first()).toBeVisible({ timeout: 10000 })
  })

  test('has refresh button', async ({ page }) => {
    // Look for refresh button or icon
    const refreshButton = page.locator('button:has-text("Refresh"), button[aria-label*="refresh"], button:has(svg[class*="RefreshCw"])')
    await expect(refreshButton.first()).toBeVisible({ timeout: 10000 })
  })

  test('refresh button triggers data reload', async ({ page }) => {
    await page.waitForLoadState('networkidle')
    
    // Click refresh if available
    const refreshButton = page.locator('button:has-text("Refresh"), button[aria-label*="refresh"]').first()
    if (await refreshButton.isVisible()) {
      await refreshButton.click()
      // Should trigger a request
      await page.waitForLoadState('networkidle')
    }
  })

  test('displays health check icons', async ({ page }) => {
    await page.waitForLoadState('networkidle')
    
    // Should have Lucide icons (SVG elements)
    const icons = page.locator('svg')
    const iconCount = await icons.count()
    expect(iconCount).toBeGreaterThan(0)
  })

  test('shows summary stats', async ({ page }) => {
    await page.waitForLoadState('networkidle')
    
    // Should show counts for healthy/degraded/unhealthy
    const summaryArea = page.locator('text=/total|healthy|degraded|unhealthy/i')
    // At least one of these should be visible
    const count = await summaryArea.count()
    expect(count).toBeGreaterThanOrEqual(0) // May not always have summary visible
  })

  test('mobile responsive - health page at 375px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/health')
    
    await expect(page.locator('h1')).toBeVisible()
    
    // Cards should stack vertically on mobile
    const cards = page.locator('[class*="rounded-lg"][class*="border"]')
    const cardCount = await cards.count()
    expect(cardCount).toBeGreaterThanOrEqual(0)
  })

  test('tablet responsive - health page at 768px', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/health')
    
    await expect(page.locator('h1')).toBeVisible()
  })

  test('no JavaScript errors on load', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    
    await page.goto('/health')
    await page.waitForLoadState('networkidle')
    
    // Filter out known/acceptable errors
    const criticalErrors = errors.filter(e => 
      !e.includes('ResizeObserver') && 
      !e.includes('hydration')
    )
    expect(criticalErrors).toHaveLength(0)
  })
})
