import { test, expect } from '@playwright/test'

test.describe('Settings Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings')
  })

  test('should display page heading and subtitle', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Settings')
    await expect(page.locator('text=Manage API keys and system configuration')).toBeVisible()
  })

  test('should display API Keys section', async ({ page }) => {
    await expect(page.locator('h2').filter({ hasText: 'API Keys' })).toBeVisible()
    await expect(page.locator('button', { hasText: 'Add Key' })).toBeVisible()
  })

  test('should display API key stats cards', async ({ page }) => {
    await expect(page.locator('text=Total Keys')).toBeVisible()
    await expect(page.locator('text=Active')).toBeVisible()
    await expect(page.locator('text=Rate Limited')).toBeVisible()
    await expect(page.locator('text=Disabled')).toBeVisible()
  })

  test('should display System Configuration section', async ({ page }) => {
    await expect(page.locator('h2').filter({ hasText: 'System Configuration' })).toBeVisible()
    await expect(page.locator('text=System configuration options coming soon')).toBeVisible()
  })

  test('should have refresh button for API keys', async ({ page }) => {
    // Find the refresh button (the one with RefreshCw icon)
    const refreshBtn = page.locator('button').filter({ has: page.locator('svg.lucide-refresh-cw') })
    await expect(refreshBtn).toBeVisible()
    await expect(refreshBtn).toBeEnabled()
  })

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(page.locator('h1')).toContainText('Settings')
    await expect(page.locator('h2').filter({ hasText: 'API Keys' })).toBeVisible()
    await expect(page.locator('button', { hasText: 'Add Key' })).toBeVisible()
  })

  test('should be responsive on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await expect(page.locator('h1')).toContainText('Settings')
    await expect(page.locator('h2').filter({ hasText: 'API Keys' })).toBeVisible()
  })

  test('should have proper styling for stats cards', async ({ page }) => {
    // Check that stats cards have colored left borders
    const statsCards = page.locator('.border-l-4')
    await expect(statsCards).toHaveCount(4)
  })

  test('should have settings icon in heading', async ({ page }) => {
    await expect(page.locator('svg.lucide-settings')).toBeVisible()
  })

  test('should have key icon in API Keys section', async ({ page }) => {
    await expect(page.locator('svg.lucide-key')).toBeVisible()
  })

  test('should have shield icon in System Configuration section', async ({ page }) => {
    await expect(page.locator('svg.lucide-shield')).toBeVisible()
  })

  test('should not have JavaScript errors on load', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (error) => {
      errors.push(error.message)
    })
    await page.goto('/settings')
    await page.waitForLoadState('networkidle')
    expect(errors).toHaveLength(0)
  })
})
