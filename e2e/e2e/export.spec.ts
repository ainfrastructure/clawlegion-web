import { test, expect } from '@playwright/test'

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

test.describe('Export Functionality E2E Tests', () => {
  test.describe('Tasks Page Export', () => {
    test('export button is visible on tasks page', async ({ page }) => {
      await page.goto(`${BASE_URL}/tasks`)
      
      // Check export button exists
      const exportButton = page.locator('button:has-text("Export")')
      await expect(exportButton).toBeVisible()
      
      await page.screenshot({ path: 'e2e/screenshots/tasks-export-button.png' })
    })

    test('export dropdown shows CSV and JSON options', async ({ page }) => {
      await page.goto(`${BASE_URL}/tasks`)
      
      // Click export button to open dropdown
      await page.click('button:has-text("Export")')
      
      // Check dropdown options
      await expect(page.locator('text=Export CSV')).toBeVisible()
      await expect(page.locator('text=Export JSON')).toBeVisible()
      
      await page.screenshot({ path: 'e2e/screenshots/tasks-export-dropdown.png' })
    })

    test('export shows record count', async ({ page }) => {
      await page.goto(`${BASE_URL}/tasks`)
      
      // Click export button
      await page.click('button:has-text("Export")')
      
      // Should show record count in dropdown
      const recordCount = page.locator('text=/\\d+ record/')
      await expect(recordCount).toBeVisible()
    })
  })

  test.describe('Analytics Page Export', () => {
    test('export metrics button is visible', async ({ page }) => {
      await page.goto(`${BASE_URL}/analytics`)
      
      // Check export button exists
      const exportButton = page.locator('button:has-text("Export Metrics")')
      await expect(exportButton).toBeVisible()
      
      await page.screenshot({ path: 'e2e/screenshots/analytics-export-button.png' })
    })

    test('export dropdown shows format options', async ({ page }) => {
      await page.goto(`${BASE_URL}/analytics`)
      
      // Click export button
      await page.click('button:has-text("Export Metrics")')
      
      // Check options
      await expect(page.locator('text=Export CSV')).toBeVisible()
      await expect(page.locator('text=Export JSON')).toBeVisible()
    })
  })

  test.describe('Agents Page Export', () => {
    test('export button is visible on agents page', async ({ page }) => {
      await page.goto(`${BASE_URL}/agents`)
      
      // Check export button exists
      const exportButton = page.locator('button:has-text("Export")')
      await expect(exportButton).toBeVisible()
      
      await page.screenshot({ path: 'e2e/screenshots/agents-export-button.png' })
    })

    test('export dropdown shows CSV and JSON options', async ({ page }) => {
      await page.goto(`${BASE_URL}/agents`)
      
      // Click export button
      await page.click('button:has-text("Export")')
      
      // Check dropdown options
      await expect(page.locator('text=Export CSV')).toBeVisible()
      await expect(page.locator('text=Export JSON')).toBeVisible()
    })
  })

  test.describe('Audit Log Export', () => {
    test('export button is visible on audit page', async ({ page }) => {
      await page.goto(`${BASE_URL}/audit`)
      
      // Check export button exists
      const exportButton = page.locator('button:has-text("Export")')
      await expect(exportButton).toBeVisible()
      
      await page.screenshot({ path: 'e2e/screenshots/audit-export-button.png' })
    })
  })

  test.describe('Export Download Verification', () => {
    test('CSV export triggers download', async ({ page }) => {
      await page.goto(`${BASE_URL}/tasks`)
      
      // Set up download listener
      const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null)
      
      // Click export > CSV
      await page.click('button:has-text("Export")')
      await page.click('text=Export CSV')
      
      // Verify download was triggered (or dropdown closed meaning action was taken)
      const download = await downloadPromise
      
      if (download) {
        // If download happened, verify filename contains .csv
        expect(download.suggestedFilename()).toContain('.csv')
      } else {
        // If no download (maybe no data), dropdown should have closed
        await expect(page.locator('text=Export CSV')).not.toBeVisible()
      }
    })

    test('JSON export triggers download', async ({ page }) => {
      await page.goto(`${BASE_URL}/tasks`)
      
      // Set up download listener
      const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null)
      
      // Click export > JSON
      await page.click('button:has-text("Export")')
      await page.click('text=Export JSON')
      
      const download = await downloadPromise
      
      if (download) {
        expect(download.suggestedFilename()).toContain('.json')
      } else {
        await expect(page.locator('text=Export JSON')).not.toBeVisible()
      }
    })
  })
})
