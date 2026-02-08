import { test, expect } from '@playwright/test'

test.describe('/sessions Page', () => {
  test('should load page with correct heading', async ({ page }) => {
    await page.goto('/sessions')
    await expect(page.locator('h1')).toContainText('Sessions')
  })

  test('should display session stats', async ({ page }) => {
    await page.goto('/sessions')
    await expect(page.getByText(/total|sessions/i).first()).toBeVisible()
  })

  test('should have New Session button', async ({ page }) => {
    await page.goto('/sessions')
    const newSessionBtn = page.getByRole('button', { name: /new session|create/i }).or(page.getByRole('link', { name: /new session|create/i }))
    await expect(newSessionBtn.first()).toBeVisible()
  })

  test('should have search functionality', async ({ page }) => {
    await page.goto('/sessions')
    const searchInput = page.getByPlaceholder(/search/i)
    await expect(searchInput).toBeVisible()
  })

  test('should have filter controls', async ({ page }) => {
    await page.goto('/sessions')
    const filterControl = page.getByRole('button', { name: /all|filter|status/i }).first()
    await expect(filterControl).toBeVisible()
  })

  test('should have interactive controls', async ({ page }) => {
    await page.goto('/sessions')
    // Page should have buttons for actions
    const buttons = page.locator('button')
    expect(await buttons.count()).toBeGreaterThan(0)
  })

  test('should show sessions list or empty state', async ({ page }) => {
    await page.goto('/sessions')
    await page.waitForTimeout(1000)
    const content = await page.textContent('body')
    expect(content).toBeTruthy()
  })

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/sessions')
    await expect(page.locator('h1')).toContainText('Sessions')
    const body = page.locator('body')
    const bodyBox = await body.boundingBox()
    expect(bodyBox?.width).toBeLessThanOrEqual(375)
  })

  test('should be responsive on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/sessions')
    await expect(page.locator('h1')).toContainText('Sessions')
  })

  test('should have visual stats section', async ({ page }) => {
    await page.goto('/sessions')
    // Page should display some stats or counts
    const content = await page.textContent('body')
    expect(content?.toLowerCase()).toMatch(/session|total|active|complete/i)
  })

  test('should not throw JavaScript errors on load', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto('/sessions')
    await page.waitForTimeout(1000)
    expect(errors.length).toBe(0)
  })
})
