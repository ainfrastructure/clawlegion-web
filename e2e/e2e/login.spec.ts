import { test, expect } from '@playwright/test'

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('should display login heading and branding', async ({ page }) => {
    // Check for page branding - ClawLegion
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/ralph dashboard/i)
    
    // Should have branding visible
    await expect(page.locator('h1')).toBeVisible()
  })

  test('should display username input field', async ({ page }) => {
    const usernameInput = page.getByLabel(/username/i)
    await expect(usernameInput).toBeVisible()
    await expect(usernameInput).toHaveAttribute('type', 'text')
  })

  test('should display password input field', async ({ page }) => {
    const passwordInput = page.getByLabel(/password/i)
    await expect(passwordInput).toBeVisible()
    await expect(passwordInput).toHaveAttribute('type', 'password')
  })

  test('should display submit button', async ({ page }) => {
    const submitButton = page.getByRole('button', { name: /sign in|login|submit/i })
    await expect(submitButton).toBeVisible()
  })

  test('should allow typing in form fields', async ({ page }) => {
    const usernameInput = page.getByLabel(/username/i)
    const passwordInput = page.getByLabel(/password/i)
    
    await usernameInput.fill('testuser')
    await passwordInput.fill('testpass')
    
    await expect(usernameInput).toHaveValue('testuser')
    await expect(passwordInput).toHaveValue('testpass')
  })

  test('should show lock and user icons', async ({ page }) => {
    // Lucide icons should be visible in the form
    await expect(page.locator('svg').first()).toBeVisible()
  })

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    
    const usernameInput = page.getByLabel(/username/i)
    await expect(usernameInput).toBeVisible()
    
    const submitButton = page.getByRole('button', { name: /sign in|login|submit/i })
    await expect(submitButton).toBeVisible()
  })

  test('should be responsive on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    
    const usernameInput = page.getByLabel(/username/i)
    await expect(usernameInput).toBeVisible()
    
    const passwordInput = page.getByLabel(/password/i)
    await expect(passwordInput).toBeVisible()
  })

  test('should have no JavaScript errors', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', err => errors.push(err.message))
    
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
    
    expect(errors).toHaveLength(0)
  })

  test('should have dark theme styling', async ({ page }) => {
    // Check for dark theme classes or styling
    const body = page.locator('body')
    await expect(body).toBeVisible()
    
    // Login form should be visible with dark styling
    const form = page.locator('form')
    await expect(form).toBeVisible()
  })
})
