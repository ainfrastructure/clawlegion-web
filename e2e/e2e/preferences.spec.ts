import { test, expect } from '@playwright/test'

test.describe('/preferences Page', () => {
  test('should load page with correct heading', async ({ page }) => {
    await page.goto('/preferences')
    await expect(page.locator('h1')).toContainText(/preferences/i)
  })

  test('should display theme settings', async ({ page }) => {
    await page.goto('/preferences')
    await expect(page.getByText(/theme|appearance/i).first()).toBeVisible()
  })

  test('should display notification settings', async ({ page }) => {
    await page.goto('/preferences')
    await expect(page.getByText(/notification/i).first()).toBeVisible()
  })

  test('should display display settings', async ({ page }) => {
    await page.goto('/preferences')
    await expect(page.getByText(/display/i).first()).toBeVisible()
  })

  test('should have save button', async ({ page }) => {
    await page.goto('/preferences')
    const saveButton = page.getByRole('button', { name: /save|apply/i })
    await expect(saveButton).toBeVisible()
  })

  test('should have theme toggle options', async ({ page }) => {
    await page.goto('/preferences')
    const themeOptions = page.getByText(/dark|light|system/i)
    expect(await themeOptions.count()).toBeGreaterThan(0)
  })

  test('should have interactive preference controls', async ({ page }) => {
    await page.goto('/preferences')
    // Look for any interactive elements (buttons, selects, etc.)
    const buttons = page.locator('button')
    expect(await buttons.count()).toBeGreaterThan(0)
  })

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/preferences')
    await expect(page.locator('h1')).toContainText(/preferences/i)
    const body = page.locator('body')
    const bodyBox = await body.boundingBox()
    expect(bodyBox?.width).toBeLessThanOrEqual(375)
  })

  test('should be responsive on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/preferences')
    await expect(page.locator('h1')).toContainText(/preferences/i)
  })

  test('should not throw JavaScript errors on load', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto('/preferences')
    await page.waitForTimeout(1000)
    expect(errors.length).toBe(0)
  })
})
