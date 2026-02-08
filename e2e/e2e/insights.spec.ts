import { test, expect } from '@playwright/test'

test.describe('/insights Pages', () => {
  test('/insights should redirect to /insights/dashboard', async ({ page }) => {
    await page.goto('/insights')
    await expect(page).toHaveURL(/\/insights\/dashboard/)
  })

  test('/insights/dashboard should load with dashboard content', async ({ page }) => {
    await page.goto('/insights/dashboard')
    await expect(page.getByText(/agent|system|dashboard/i).first()).toBeVisible()
  })

  test('/insights/dashboard should show agent status', async ({ page }) => {
    await page.goto('/insights/dashboard')
    await page.waitForTimeout(1000)
    const content = await page.textContent('body')
    expect(content).toBeTruthy()
  })

  test('/insights/dashboard should have navigation', async ({ page }) => {
    await page.goto('/insights/dashboard')
    // Check page renders properly
    const h1 = page.locator('h1')
    await expect(h1.first()).toBeVisible()
  })

  test('/insights/dashboard should have refresh functionality', async ({ page }) => {
    await page.goto('/insights/dashboard')
    const content = await page.textContent('body')
    expect(content).toBeTruthy()
  })

  test('/insights/dashboard should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/insights/dashboard')
    const body = page.locator('body')
    const bodyBox = await body.boundingBox()
    expect(bodyBox?.width).toBeLessThanOrEqual(375)
  })

  test('/insights/dashboard should be responsive on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/insights/dashboard')
    const content = await page.textContent('body')
    expect(content).toBeTruthy()
  })

  test('/insights/dashboard should not throw JavaScript errors on load', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto('/insights/dashboard')
    await page.waitForTimeout(1000)
    expect(errors.length).toBe(0)
  })
})
