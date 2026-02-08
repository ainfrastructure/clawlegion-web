import { test, expect } from '@playwright/test'

test.describe('Verification Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/verification')
  })

  test('should display page heading and subtitle', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Verification')
    await expect(page.locator('text=API and frontend consistency checks')).toBeVisible()
  })

  test('should display Run Verification button', async ({ page }) => {
    await expect(page.locator('button', { hasText: 'Run Verification' })).toBeVisible()
    await expect(page.locator('button', { hasText: 'Run Verification' })).toBeEnabled()
  })

  test('should display verification stats cards', async ({ page }) => {
    await expect(page.locator('text=Passed')).toBeVisible()
    await expect(page.locator('text=Failed')).toBeVisible()
    await expect(page.locator('text=Total Checks')).toBeVisible()
  })

  test('should display Verification Reports section', async ({ page }) => {
    await expect(page.locator('h2').filter({ hasText: 'Verification Reports' })).toBeVisible()
  })

  test('should have refresh button', async ({ page }) => {
    const refreshBtn = page.locator('button').filter({ has: page.locator('svg.lucide-refresh-cw') })
    await expect(refreshBtn).toBeVisible()
    await expect(refreshBtn).toBeEnabled()
  })

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(page.locator('h1')).toContainText('Verification')
    await expect(page.locator('button', { hasText: 'Run Verification' })).toBeVisible()
  })

  test('should be responsive on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await expect(page.locator('h1')).toContainText('Verification')
    await expect(page.locator('h2').filter({ hasText: 'Verification Reports' })).toBeVisible()
  })

  test('should have proper styling for stats cards', async ({ page }) => {
    // Stats cards have colored left borders
    const statsCards = page.locator('.border-l-4')
    await expect(statsCards).toHaveCount(3)
  })

  test('should have shield icon in heading', async ({ page }) => {
    // Shield icon in header (cyan colored)
    await expect(page.locator('h1 svg.lucide-shield')).toBeVisible()
  })

  test('should have check icons in stats cards', async ({ page }) => {
    // CircleCheck for passed, CircleX for failed
    await expect(page.locator('svg.lucide-circle-check')).toBeVisible()
    await expect(page.locator('svg.lucide-circle-x')).toBeVisible()
  })

  test('should not have JavaScript errors on load', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (error) => {
      errors.push(error.message)
    })
    await page.goto('/verification')
    await page.waitForLoadState('networkidle')
    expect(errors).toHaveLength(0)
  })
})
