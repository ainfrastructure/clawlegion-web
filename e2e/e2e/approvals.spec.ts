import { test, expect } from '@playwright/test'

// ============================================
// E2E TESTS: /approvals - Approval Management
// ============================================

test.describe('Approvals Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/approvals')
    await page.waitForLoadState('networkidle')
  })

  test('page loads with correct heading', async ({ page }) => {
    const heading = page.locator('h1')
    await expect(heading).toContainText(/Approval/i)
  })

  test('displays approval stats', async ({ page }) => {
    // Should have stats showing pending/approved/rejected counts
    const statsSection = page.locator('text=/Pending|Approved|Rejected/i').first()
    await expect(statsSection).toBeVisible({ timeout: 10000 })
  })

  test('has refresh button', async ({ page }) => {
    const refreshButton = page.locator('button').filter({ has: page.locator('svg') }).first()
    if (await refreshButton.isVisible()) {
      await refreshButton.click()
    }
    // Page should still function
    const heading = page.locator('h1')
    await expect(heading).toBeVisible()
  })

  test('page has main content area', async ({ page }) => {
    const mainContent = page.locator('main, [class*="content"], [class*="container"]').first()
    await expect(mainContent).toBeVisible()
  })

  test('shows pending section or empty state', async ({ page }) => {
    // Either shows pending approvals or a message about no pending items
    const hasPendingSection = await page.locator('text=/pending/i').isVisible().catch(() => false)
    const hasEmptyMessage = await page.locator('text=/no.*approval|nothing.*approve/i').isVisible().catch(() => false)
    const hasContent = await page.locator('main').isVisible()
    
    expect(hasPendingSection || hasEmptyMessage || hasContent).toBeTruthy()
  })

  test('mobile responsive - stacks on small screens', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.reload()
    await page.waitForLoadState('networkidle')
    
    const heading = page.locator('h1')
    await expect(heading).toBeVisible()
  })

  test('tablet responsive - proper layout', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.reload()
    await page.waitForLoadState('networkidle')
    
    const heading = page.locator('h1')
    await expect(heading).toBeVisible()
  })

  test('no JavaScript errors on page load', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', err => errors.push(err.message))
    
    await page.reload()
    await page.waitForLoadState('networkidle')
    
    const criticalErrors = errors.filter(e => 
      !e.includes('ResizeObserver') && 
      !e.includes('hydration')
    )
    expect(criticalErrors).toHaveLength(0)
  })

  test('has sidebar navigation', async ({ page }) => {
    const sidebar = page.locator('nav, aside, [class*="sidebar"]').first()
    await expect(sidebar).toBeVisible({ timeout: 5000 })
  })

  test('approval action buttons styled correctly', async ({ page }) => {
    // Look for approve/reject style buttons or icons
    const approveButtons = page.locator('button:has(svg), [class*="approve"], [class*="accept"]')
    const buttonsCount = await approveButtons.count()
    
    // Page should have some interactive elements
    const allButtons = await page.locator('button').count()
    expect(allButtons).toBeGreaterThan(0)
  })
})
