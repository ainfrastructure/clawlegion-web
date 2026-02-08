import { test, expect } from '@playwright/test'

test.describe('Agent Organization Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/agents/org')
  })

  test('should display page heading', async ({ page }) => {
    await expect(page.locator('h1:has-text("Agent Organization")')).toBeVisible()
  })

  test('should display subtitle', async ({ page }) => {
    await expect(page.locator('text=Team structure and task workflow')).toBeVisible()
  })

  test('should display The Team section', async ({ page }) => {
    await expect(page.locator('h2:has-text("The Team")')).toBeVisible()
  })

  test('should display agent cards', async ({ page }) => {
    // Should show at least the 4 core agents
    await expect(page.locator('text=Jarvis')).toBeVisible()
    await expect(page.locator('text=Archie')).toBeVisible()
    await expect(page.locator('text=Mason')).toBeVisible()
    await expect(page.locator('text=Vex')).toBeVisible()
  })

  test('should display agent roles', async ({ page }) => {
    await expect(page.locator('text=Orchestrator')).toBeVisible()
    await expect(page.locator('text=Planner')).toBeVisible()
    await expect(page.locator('text=Builder')).toBeVisible()
    await expect(page.locator('text=Verifier')).toBeVisible()
  })

  test('should display task flow diagram', async ({ page }) => {
    await expect(page.locator('[class*="bg-slate-800"]').first()).toBeVisible()
  })

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(page.locator('h1:has-text("Agent Organization")')).toBeVisible()
    // Cards should stack vertically on mobile
    await expect(page.locator('text=Jarvis')).toBeVisible()
  })

  test('should be responsive on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await expect(page.locator('h1:has-text("Agent Organization")')).toBeVisible()
  })

  test('should display Users icon', async ({ page }) => {
    await expect(page.locator('svg').first()).toBeVisible()
  })

  test('should have no JavaScript errors', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (error) => {
      errors.push(error.message)
    })
    await page.goto('/agents/org')
    await page.waitForTimeout(1000)
    expect(errors.filter(e => !e.includes('hydration'))).toHaveLength(0)
  })

  test('should display agent descriptions', async ({ page }) => {
    await expect(page.locator('text=Receives tasks')).toBeVisible()
    await expect(page.locator('text=Creates implementation')).toBeVisible()
  })
})
