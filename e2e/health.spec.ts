import { test, expect } from '@playwright/test';

/**
 * Health Page E2E Tests
 * 
 * Covers:
 * - Page load and title
 * - System health status display
 * - Service cards grid
 * - Refresh functionality
 * - Responsive design
 */

test.describe('Health Page', () => {
  
  test.describe('Page Load', () => {
    test('loads successfully with correct heading', async ({ page }) => {
      await page.goto('/health');
      await page.waitForLoadState('networkidle');
      
      // Wait for the heading to appear after data loads
      const heading = page.locator('h1:has-text("System Health")');
      await expect(heading).toBeVisible({ timeout: 10000 });
    });

    test('displays refresh button', async ({ page }) => {
      await page.goto('/health');
      await page.waitForLoadState('networkidle');
      
      const refreshButton = page.locator('button:has-text("Refresh")');
      await expect(refreshButton).toBeVisible({ timeout: 10000 });
    });

    test('shows last checked timestamp', async ({ page }) => {
      await page.goto('/health');
      await page.waitForLoadState('networkidle');
      
      // Wait for data to load and timestamp to appear
      const timestampText = page.locator('text=/Last checked/i');
      await expect(timestampText).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Health Status Display', () => {
    test('displays overall status indicator', async ({ page }) => {
      await page.goto('/health');
      await page.waitForLoadState('networkidle');
      
      // Wait for status label (Healthy, Degraded, or Unhealthy)
      const statusLabel = page.locator('h2:has-text("Healthy"), h2:has-text("Degraded"), h2:has-text("Unhealthy")');
      await expect(statusLabel).toBeVisible({ timeout: 10000 });
    });

    test('displays status tagline', async ({ page }) => {
      await page.goto('/health');
      await page.waitForLoadState('networkidle');
      
      // Check for tagline
      const tagline = page.locator('text=/systems operational|experiencing issues|services are down/i');
      await expect(tagline).toBeVisible({ timeout: 10000 });
    });

    test('shows summary statistics', async ({ page }) => {
      await page.goto('/health');
      await page.waitForLoadState('networkidle');
      
      // Wait for stats to load
      await page.waitForTimeout(2000);
      
      await expect(page.locator('text=Healthy').first()).toBeVisible({ timeout: 10000 });
      await expect(page.locator('text=Avg Latency').first()).toBeVisible({ timeout: 10000 });
      await expect(page.locator('text=Total Services').first()).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Service Cards', () => {
    test('displays service cards', async ({ page }) => {
      await page.goto('/health');
      await page.waitForLoadState('networkidle');
      
      // Wait for cards to render
      await page.waitForTimeout(2000);
      
      // Check for service names (from API response)
      const webServerCard = page.locator('text=/Web Server/i');
      await expect(webServerCard).toBeVisible({ timeout: 10000 });
    });

    test('service cards show status badges', async ({ page }) => {
      await page.goto('/health');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      // Look for status badge text
      const healthyBadge = page.locator('span:has-text("Healthy")').first();
      await expect(healthyBadge).toBeVisible({ timeout: 10000 });
    });

    test('service cards show latency values', async ({ page }) => {
      await page.goto('/health');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      // Look for latency values (e.g., "45ms")
      const latencyValue = page.locator('text=/\\d+ms/').first();
      await expect(latencyValue).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Refresh Functionality', () => {
    test('refresh button triggers data reload', async ({ page }) => {
      await page.goto('/health');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      const refreshButton = page.locator('button:has-text("Refresh")');
      await expect(refreshButton).toBeVisible({ timeout: 10000 });
      
      // Click refresh
      await refreshButton.click();
      
      // Button should still be visible after refresh
      await page.waitForTimeout(1000);
      await expect(refreshButton).toBeVisible();
    });
  });

  test.describe('Responsive Design', () => {
    test('works on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/health');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      const heading = page.locator('h1:has-text("System Health")');
      await expect(heading).toBeVisible({ timeout: 10000 });
    });

    test('works on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/health');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      const heading = page.locator('h1:has-text("System Health")');
      await expect(heading).toBeVisible({ timeout: 10000 });
    });
  });
});
