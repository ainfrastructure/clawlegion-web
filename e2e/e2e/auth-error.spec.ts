import { test, expect } from '@playwright/test'

test.describe('Auth Error Page', () => {
  test('should display error page heading', async ({ page }) => {
    await page.goto('/auth/error')
    await expect(page.locator('h1:has-text("Authentication Error")')).toBeVisible()
  })

  test('should display default error message', async ({ page }) => {
    await page.goto('/auth/error')
    await expect(page.locator('text=An authentication error occurred')).toBeVisible()
  })

  test('should display back to login link', async ({ page }) => {
    await page.goto('/auth/error')
    await expect(page.locator('a:has-text("Back to Login")')).toBeVisible()
  })

  test('should display error icon', async ({ page }) => {
    await page.goto('/auth/error')
    // AlertCircle icon with red styling
    await expect(page.locator('[class*="text-red"]').first()).toBeVisible()
  })

  test('should display Configuration error', async ({ page }) => {
    await page.goto('/auth/error?error=Configuration')
    await expect(page.locator('text=Server configuration error')).toBeVisible()
  })

  test('should display AccessDenied error', async ({ page }) => {
    await page.goto('/auth/error?error=AccessDenied')
    await expect(page.locator('text=Access denied')).toBeVisible()
  })

  test('should display Verification error', async ({ page }) => {
    await page.goto('/auth/error?error=Verification')
    await expect(page.locator('text=Verification failed')).toBeVisible()
  })

  test('should display CredentialsSignin error', async ({ page }) => {
    await page.goto('/auth/error?error=CredentialsSignin')
    await expect(page.locator('text=Invalid email or password')).toBeVisible()
  })

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/auth/error')
    await expect(page.locator('h1:has-text("Authentication Error")')).toBeVisible()
  })

  test('should navigate to login when back button clicked', async ({ page }) => {
    await page.goto('/auth/error')
    await page.click('a:has-text("Back to Login")')
    await expect(page).toHaveURL(/\/login/)
  })

  test('should have no JavaScript errors', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (error) => {
      errors.push(error.message)
    })
    await page.goto('/auth/error')
    await page.waitForTimeout(1000)
    expect(errors.filter(e => !e.includes('hydration'))).toHaveLength(0)
  })
})
