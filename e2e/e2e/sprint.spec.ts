import { test, expect } from '@playwright/test'

test.describe('Sprint Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/sprint')
  })

  test('should display page heading', async ({ page }) => {
    await expect(page.locator('h1:has-text("Sprint Dashboard")')).toBeVisible()
  })

  test('should display subtitle', async ({ page }) => {
    await expect(page.locator('text=1-Hour Dashboard Excellence Sprint')).toBeVisible()
  })

  test('should display back arrow link to dashboard', async ({ page }) => {
    const backLink = page.locator('a[href="/dashboard"]')
    await expect(backLink).toBeVisible()
  })

  test('should display refresh button', async ({ page }) => {
    await expect(page.locator('button:has-text("Refresh")')).toBeVisible()
  })

  test('should display Agent Fleet section', async ({ page }) => {
    await expect(page.locator('text=🤖 Agent Fleet')).toBeVisible()
  })

  test('should display Quick Stats section', async ({ page }) => {
    // QuickStats component should render
    await expect(page.locator('[class*="grid"]').first()).toBeVisible()
  })

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(page.locator('h1:has-text("Sprint Dashboard")')).toBeVisible()
  })

  test('should be responsive on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await expect(page.locator('h1:has-text("Sprint Dashboard")')).toBeVisible()
  })

  test('should have no JavaScript errors', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (error) => {
      errors.push(error.message)
    })
    await page.goto('/sprint')
    await page.waitForTimeout(1000)
    expect(errors.filter(e => !e.includes('hydration'))).toHaveLength(0)
  })

  test('should display footer with sprint info', async ({ page }) => {
    await expect(page.locator('text=Sprint started')).toBeVisible()
  })
})
