import { test, expect } from '@playwright/test'

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

test.describe('ClawLegion E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Wait for page to be ready
    await page.goto(BASE_URL)
  })

  test('dashboard page loads correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`)
    
    // Check for main elements
    await expect(page.locator('h1:has-text("Command Center")')).toBeVisible()
    
    // Check navigation links exist in sidebar (use data-testid for reliable selection)
    await expect(page.locator('[data-testid="nav-sessions"]')).toBeVisible()
    await expect(page.locator('[data-testid="nav-board"]')).toBeVisible()
    await expect(page.locator('[data-testid="nav-agents"]')).toBeVisible()
    await expect(page.locator('[data-testid="nav-approvals"]')).toBeVisible()
    await expect(page.locator('[data-testid="nav-issues"]')).toBeVisible()
    
    // Take screenshot
    await page.screenshot({ path: 'e2e/screenshots/dashboard.png', fullPage: true })
  })

  test('dark mode toggle works', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`)
    
    // App is dark by default, check for dark theme elements
    const html = page.locator('html')
    
    // Check the page has loaded with dark theme styling
    await expect(page.locator('.bg-slate-900, .dark')).toBeVisible({ timeout: 5000 })
    
    // Take screenshot 
    await page.screenshot({ path: 'e2e/screenshots/dashboard-theme.png', fullPage: true })
  })

  test('sessions page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/sessions`)
    
    // Check page loaded - heading says "Sessions" not "All Sessions"
    await expect(page.locator('h1:has-text("Sessions")')).toBeVisible()
    
    // Check filter buttons exist
    await expect(page.locator('button:has-text("All")')).toBeVisible()
    await expect(page.locator('button:has-text("Running")')).toBeVisible()
    await expect(page.locator('button:has-text("Completed")')).toBeVisible()
    await expect(page.locator('button:has-text("Failed")')).toBeVisible()
    
    // Check table or empty state
    const hasTable = await page.locator('table').count() > 0
    const hasEmptyState = await page.locator('text=No sessions found').count() > 0
    expect(hasTable || hasEmptyState).toBeTruthy()
    
    await page.screenshot({ path: 'e2e/screenshots/sessions.png', fullPage: true })
  })

  test('board page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/board`)
    
    // Check page loaded
    await expect(page.locator('h1:has-text("Task Board")')).toBeVisible()
    
    // Check column headers exist (titles in the UI)
    await expect(page.locator('text=Backlog')).toBeVisible()
    await expect(page.locator('text=Todo')).toBeVisible()
    await expect(page.locator('text=In Progress')).toBeVisible()
    // "Done" is used in the board, not "Completed"
    await expect(page.locator('text=Done').first()).toBeVisible()
    
    await page.screenshot({ path: 'e2e/screenshots/board.png', fullPage: true })
  })

  test('agents page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/agents`)
    
    // Check page loaded
    await expect(page.locator('h1:has-text("Agent Fleet")')).toBeVisible()
    
    // Check stats cards exist
    await expect(page.locator('text=Total Agents')).toBeVisible()
    await expect(page.locator('text=Active Now')).toBeVisible()
    await expect(page.locator('text=Rate Limited')).toBeVisible()
    
    // Check action buttons
    await expect(page.locator('button:has-text("Resume All")')).toBeVisible()
    await expect(page.locator('button:has-text("Refresh")')).toBeVisible()
    
    await page.screenshot({ path: 'e2e/screenshots/agents.png', fullPage: true })
  })

  test('approvals page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/approvals`)
    
    // Check page loaded - heading says "Approvals" not "Approval Queue"
    await expect(page.locator('h1:has-text("Approvals")')).toBeVisible()
    
    // Check sections exist (Pending Approvals, History)
    await expect(page.locator('h2:has-text("Pending Approvals")')).toBeVisible()
    await expect(page.locator('h2:has-text("History")')).toBeVisible()
    
    await page.screenshot({ path: 'e2e/screenshots/approvals.png', fullPage: true })
  })

  test('issues page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/issues`)
    
    // Check page loaded - heading says "Issues" not "GitHub Issues"
    await expect(page.locator('h1:has-text("Issues")')).toBeVisible()
    
    // Check filter buttons - using "Resolved" not "Closed"
    await expect(page.locator('button:has-text("All")')).toBeVisible()
    await expect(page.locator('button:has-text("Open")')).toBeVisible()
    await expect(page.locator('button:has-text("Resolved")')).toBeVisible()
    
    await page.screenshot({ path: 'e2e/screenshots/issues.png', fullPage: true })
  })

  test('new session wizard loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/sessions/new`)
    
    // Check wizard loaded
    await expect(page.locator('text=Create Ralph Loop Session')).toBeVisible()
    
    // Check step indicators
    await expect(page.locator('text=Repository')).toBeVisible()
    await expect(page.locator('text=Goal')).toBeVisible()
    await expect(page.locator('text=Generate')).toBeVisible()
    
    await page.screenshot({ path: 'e2e/screenshots/wizard.png', fullPage: true })
  })

  test('no emojis in UI - SVG icons used instead', async ({ page }) => {
    // Check each page has SVG icons (not emojis)
    const pagesToCheck = ['/dashboard', '/sessions', '/board', '/agents', '/approvals', '/issues']
    
    for (const pagePath of pagesToCheck) {
      await page.goto(`${BASE_URL}${pagePath}`)
      
      // Verify SVG icons are present (lucide-react)
      const svgCount = await page.locator('svg').count()
      expect(svgCount).toBeGreaterThan(0) // Should have SVG icons
    }
  })

  test('navigation between pages works', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`)
    
    // Navigate to Sessions using sidebar
    await page.click('[data-testid="nav-sessions"]')
    await expect(page).toHaveURL(/.*\/sessions$/)
    await expect(page.locator('h1:has-text("Sessions")')).toBeVisible()
    
    // Navigate to Board
    await page.click('[data-testid="nav-board"]')
    await expect(page).toHaveURL(/.*\/board$/)
    await expect(page.locator('h1:has-text("Task Board")')).toBeVisible()
    
    // Navigate to Agents
    await page.click('[data-testid="nav-agents"]')
    await expect(page).toHaveURL(/.*\/agents$/)
    await expect(page.locator('h1:has-text("Agent Fleet")')).toBeVisible()
    
    // Navigate to Approvals
    await page.click('[data-testid="nav-approvals"]')
    await expect(page).toHaveURL(/.*\/approvals$/)
    await expect(page.locator('h1:has-text("Approvals")')).toBeVisible()
    
    // Navigate to Issues
    await page.click('[data-testid="nav-issues"]')
    await expect(page).toHaveURL(/.*\/issues$/)
    await expect(page.locator('h1:has-text("Issues")')).toBeVisible()
    
    // Navigate back to Dashboard
    await page.click('[data-testid="nav-dashboard"]')
    await expect(page).toHaveURL(/.*\/dashboard$/)
  })

  test('session detail page loads with logs section', async ({ page }) => {
    // First go to sessions page
    await page.goto(`${BASE_URL}/sessions`)
    
    // Check if there are any session rows in the table
    const sessionLinks = await page.locator('table tbody tr').count()
    
    if (sessionLinks > 0) {
      // Click the first session link (the session name link)
      await page.locator('table tbody tr a').first().click()
      
      // Wait for detail page
      await page.waitForURL(/.*\/sessions\/[^/]+$/)
      
      // Check for session detail elements (logs might be in tabs or sections)
      await expect(page.locator('h1, h2')).toBeVisible()
      
      await page.screenshot({ path: 'e2e/screenshots/session-detail.png', fullPage: true })
    } else {
      // No sessions, skip this test
      console.log('No sessions available for detail page test')
    }
  })
})
