import { test, expect } from '@playwright/test'

/**
 * Visual Regression Tests
 * 
 * Uses Playwright's built-in toHaveScreenshot() for automatic baseline comparison.
 * 
 * Run with:
 *   npm run test:e2e -- visual-regression.spec.ts
 * 
 * Update baselines:
 *   npm run test:e2e -- visual-regression.spec.ts --update-snapshots
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

// Pages to test for visual regression
const CRITICAL_PAGES = [
  { name: 'home', path: '/' },
  { name: 'dashboard', path: '/dashboard' },
  { name: 'tasks', path: '/tasks' },
  { name: 'agents-fleet', path: '/agents/fleet' },
  { name: 'sessions', path: '/sessions' },
  { name: 'analytics', path: '/analytics' },
  { name: 'chat', path: '/chat' },
]

// Viewports to test
const VIEWPORTS = {
  desktop: { width: 1920, height: 1080 },
  laptop: { width: 1366, height: 768 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 667 },
}

test.describe('Visual Regression Tests', () => {
  // Set a reasonable timeout for screenshots
  test.setTimeout(30000)

  test.describe('Desktop Full Page Snapshots', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop)
    })

    for (const pageInfo of CRITICAL_PAGES) {
      test(`${pageInfo.name} page visual consistency`, async ({ page }) => {
        await page.goto(`${BASE_URL}${pageInfo.path}`)
        await page.waitForLoadState('networkidle')
        
        // Wait for any animations to complete
        await page.waitForTimeout(500)
        
        // Use maxDiffPixels for tolerance (UI may have minor variations)
        await expect(page).toHaveScreenshot(`desktop-${pageInfo.name}.png`, {
          fullPage: true,
          maxDiffPixels: 100,
          animations: 'disabled',
        })
      })
    }
  })

  test.describe('Mobile Responsive Snapshots', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.mobile)
    })

    // Test key pages on mobile
    const mobilePages = ['home', 'dashboard', 'tasks', 'agents-fleet']
    
    for (const pageName of mobilePages) {
      const pageInfo = CRITICAL_PAGES.find(p => p.name === pageName)
      if (!pageInfo) continue
      
      test(`${pageInfo.name} mobile visual consistency`, async ({ page }) => {
        await page.goto(`${BASE_URL}${pageInfo.path}`)
        await page.waitForLoadState('networkidle')
        await page.waitForTimeout(500)
        
        await expect(page).toHaveScreenshot(`mobile-${pageInfo.name}.png`, {
          fullPage: true,
          maxDiffPixels: 100,
          animations: 'disabled',
        })
      })
    }
  })

  test.describe('Tablet Responsive Snapshots', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.tablet)
    })

    const tabletPages = ['home', 'dashboard', 'tasks']
    
    for (const pageName of tabletPages) {
      const pageInfo = CRITICAL_PAGES.find(p => p.name === pageName)
      if (!pageInfo) continue
      
      test(`${pageInfo.name} tablet visual consistency`, async ({ page }) => {
        await page.goto(`${BASE_URL}${pageInfo.path}`)
        await page.waitForLoadState('networkidle')
        await page.waitForTimeout(500)
        
        await expect(page).toHaveScreenshot(`tablet-${pageInfo.name}.png`, {
          fullPage: true,
          maxDiffPixels: 100,
          animations: 'disabled',
        })
      })
    }
  })

  test.describe('Component-Level Snapshots', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop)
    })

    test('sidebar navigation component', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard`)
      await page.waitForLoadState('networkidle')
      
      // Target the sidebar/navigation component
      const sidebar = page.locator('nav, aside, [role="navigation"]').first()
      if (await sidebar.isVisible()) {
        await expect(sidebar).toHaveScreenshot('component-sidebar.png', {
          maxDiffPixels: 50,
          animations: 'disabled',
        })
      }
    })

    test('header component', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard`)
      await page.waitForLoadState('networkidle')
      
      // Target the header component
      const header = page.locator('header, [role="banner"]').first()
      if (await header.isVisible()) {
        await expect(header).toHaveScreenshot('component-header.png', {
          maxDiffPixels: 50,
          animations: 'disabled',
        })
      }
    })

    test('tasks list component', async ({ page }) => {
      await page.goto(`${BASE_URL}/tasks`)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1000) // Wait for data to load
      
      // Target the main content area
      const mainContent = page.locator('main, [role="main"]').first()
      if (await mainContent.isVisible()) {
        await expect(mainContent).toHaveScreenshot('component-tasks-list.png', {
          maxDiffPixels: 200, // Higher tolerance for dynamic content
          animations: 'disabled',
        })
      }
    })
  })

  test.describe('Dark Theme Consistency', () => {
    test('verify dark theme applied consistently', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop)
      await page.goto(`${BASE_URL}/dashboard`)
      await page.waitForLoadState('networkidle')
      
      // The dashboard should use dark theme (slate-900/950 backgrounds)
      const body = page.locator('body')
      const bgColor = await body.evaluate(el => {
        return window.getComputedStyle(el).backgroundColor
      })
      
      // Dark theme should have low RGB values (dark background)
      // rgb(x, y, z) where x, y, z are low numbers for dark theme
      expect(bgColor).toMatch(/rgb\(\d{1,2}, \d{1,2}, \d{1,2}\)|rgb\(1[0-4]\d, 1[0-4]\d, 1[0-4]\d\)/)
      
      await expect(page).toHaveScreenshot('theme-dark-dashboard.png', {
        fullPage: true,
        maxDiffPixels: 100,
        animations: 'disabled',
      })
    })
  })

  test.describe('Interactive States', () => {
    test('button hover states', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop)
      await page.goto(`${BASE_URL}/tasks`)
      await page.waitForLoadState('networkidle')
      
      // Find a primary button
      const button = page.locator('button').first()
      if (await button.isVisible()) {
        // Hover over the button
        await button.hover()
        await page.waitForTimeout(300)
        
        await expect(button).toHaveScreenshot('state-button-hover.png', {
          maxDiffPixels: 20,
          animations: 'disabled',
        })
      }
    })

    test('input focus states', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop)
      await page.goto(`${BASE_URL}/tasks`)
      await page.waitForLoadState('networkidle')
      
      // Find a text input
      const input = page.locator('input[type="text"]').first()
      if (await input.isVisible()) {
        await input.focus()
        await page.waitForTimeout(300)
        
        await expect(input).toHaveScreenshot('state-input-focused.png', {
          maxDiffPixels: 20,
          animations: 'disabled',
        })
      }
    })
  })
})
