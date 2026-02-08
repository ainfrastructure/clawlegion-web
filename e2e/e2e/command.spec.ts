import { test, expect } from '@playwright/test'

test.describe('Command Center Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/command')
  })

  test('should display page heading and subtitle', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Command Center')
    await expect(page.getByText('Real-time agent control and monitoring')).toBeVisible()
  })

  test('should display Emergency Stop button', async ({ page }) => {
    const emergencyButton = page.getByRole('button', { name: /Emergency Stop/i })
    await expect(emergencyButton).toBeVisible()
    // Verify it has red styling (bg-red-600)
    await expect(emergencyButton).toHaveClass(/bg-red-600/)
  })

  test('should display System Status banner', async ({ page }) => {
    // System status section should exist
    await expect(page.getByText(/System Status/i)).toBeVisible()
    // Should show Uptime
    await expect(page.getByText(/Uptime/i)).toBeVisible()
    // Should show Memory percentage
    await expect(page.getByText(/Memory/i).first()).toBeVisible()
  })

  test('should display Agents section', async ({ page }) => {
    // Agents heading
    await expect(page.getByRole('heading', { name: /Agents/i })).toBeVisible()
    // Either shows agent cards or "No agents registered" message
    const noAgents = page.getByText('No agents registered')
    const agentCards = page.locator('.bg-slate-900').filter({ hasText: /IDLE|BUSY|PAUSED|OFFLINE/i })
    
    // One of these should be visible
    const hasAgents = await agentCards.count() > 0
    if (!hasAgents) {
      await expect(noAgents).toBeVisible()
    }
  })

  test('should display Task Queue panel', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Task Queue/i })).toBeVisible()
    // Queue metrics should be visible
    await expect(page.getByText('Queued')).toBeVisible()
    await expect(page.getByText('Assigned')).toBeVisible()
    await expect(page.getByText('Completed').first()).toBeVisible()
    await expect(page.getByText('Total')).toBeVisible()
  })

  test('should display Health Checks panel', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Health Checks/i })).toBeVisible()
    // Health panel should be visible with loading state or data
    await page.waitForTimeout(500)
    // Verify panel exists without checking specific content
    const healthHeading = page.getByRole('heading', { name: /Health Checks/i })
    await expect(healthHeading).toBeVisible()
  })

  test('should have proper responsive layout on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/command')
    
    await expect(page.locator('h1')).toContainText('Command Center')
    await expect(page.getByRole('button', { name: /Emergency Stop/i })).toBeVisible()
    // Grid should stack on mobile
    await expect(page.getByRole('heading', { name: /Agents/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: /Task Queue/i })).toBeVisible()
  })

  test('should have proper responsive layout on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/command')
    
    await expect(page.locator('h1')).toContainText('Command Center')
    await expect(page.getByRole('button', { name: /Emergency Stop/i })).toBeVisible()
  })

  test('should not have JavaScript errors on load', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (err) => errors.push(err.message))
    
    await page.goto('/command')
    await page.waitForLoadState('networkidle')
    
    // Filter out expected fetch errors (API might not return data in test)
    const criticalErrors = errors.filter(e => 
      !e.includes('fetch') && 
      !e.includes('NetworkError') &&
      !e.includes('Failed to fetch')
    )
    expect(criticalErrors).toHaveLength(0)
  })

  test('Emergency Stop button should be clickable', async ({ page }) => {
    const emergencyButton = page.getByRole('button', { name: /Emergency Stop/i })
    await expect(emergencyButton).toBeEnabled()
    // We don't actually click it to avoid side effects, just verify it's interactive
    await emergencyButton.hover()
  })

  test('page should have dark theme styling', async ({ page }) => {
    const mainContainer = page.locator('.min-h-screen.bg-slate-950')
    await expect(mainContainer).toBeVisible()
  })

  test('should show icons in the interface', async ({ page }) => {
    // Terminal icon in header (SVG)
    await expect(page.locator('h1 svg').first()).toBeVisible()
  })
})
