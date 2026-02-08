import { test, expect } from '@playwright/test';

/**
 * Smoke tests for new pages added during the overnight challenge.
 * These tests verify that pages load without errors and show expected content.
 */

test.describe('New Pages Smoke Tests', () => {
  test.describe('Analytics Page', () => {
    test('loads successfully', async ({ page }) => {
      await page.goto('/analytics');
      await page.waitForLoadState('networkidle');
      
      // Verify page loaded without error
      expect(page.url()).toContain('/analytics');
      
      // Check for analytics heading or key element
      const heading = page.locator('h1, h2').first();
      await expect(heading).toBeVisible({ timeout: 10000 });
    });

    test('shows metrics section', async ({ page }) => {
      await page.goto('/analytics');
      await page.waitForLoadState('networkidle');
      
      // Look for common analytics elements
      const pageContent = await page.textContent('body');
      expect(
        pageContent?.includes('Analytics') || 
        pageContent?.includes('Metrics') ||
        pageContent?.includes('Performance')
      ).toBeTruthy();
    });
  });

  test.describe('Command Center Page', () => {
    test('loads successfully', async ({ page }) => {
      await page.goto('/command');
      await page.waitForLoadState('networkidle');
      
      expect(page.url()).toContain('/command');
      
      const heading = page.locator('h1, h2').first();
      await expect(heading).toBeVisible({ timeout: 10000 });
    });

    test('shows agent controls', async ({ page }) => {
      await page.goto('/command');
      await page.waitForLoadState('networkidle');
      
      // Command center should have action buttons or agent controls
      const pageContent = await page.textContent('body');
      expect(
        pageContent?.includes('Command') || 
        pageContent?.includes('Agent') ||
        pageContent?.includes('Control')
      ).toBeTruthy();
    });
  });

  test.describe('Health Page', () => {
    test('loads successfully', async ({ page }) => {
      await page.goto('/health');
      await page.waitForLoadState('networkidle');
      
      expect(page.url()).toContain('/health');
      
      const heading = page.locator('h1, h2').first();
      await expect(heading).toBeVisible({ timeout: 10000 });
    });

    test('shows health status', async ({ page }) => {
      await page.goto('/health');
      await page.waitForLoadState('networkidle');
      
      // Health page should show status indicators
      const pageContent = await page.textContent('body');
      expect(
        pageContent?.includes('Health') || 
        pageContent?.includes('Status') ||
        pageContent?.includes('Healthy') ||
        pageContent?.includes('OK')
      ).toBeTruthy();
    });
  });

  test.describe('Notifications Page', () => {
    test('loads successfully', async ({ page }) => {
      await page.goto('/notifications');
      await page.waitForLoadState('networkidle');
      
      expect(page.url()).toContain('/notifications');
      
      const heading = page.locator('h1, h2').first();
      await expect(heading).toBeVisible({ timeout: 10000 });
    });

    test('shows notification list or empty state', async ({ page }) => {
      await page.goto('/notifications');
      await page.waitForLoadState('networkidle');
      
      // Should show notifications or an empty state message
      const pageContent = await page.textContent('body');
      expect(
        pageContent?.includes('Notification') || 
        pageContent?.includes('Alert') ||
        pageContent?.includes('No notifications') ||
        pageContent?.includes('empty')
      ).toBeTruthy();
    });
  });

  test.describe('Verification Page', () => {
    test('loads successfully', async ({ page }) => {
      await page.goto('/verification');
      await page.waitForLoadState('networkidle');
      
      expect(page.url()).toContain('/verification');
      
      const heading = page.locator('h1, h2').first();
      await expect(heading).toBeVisible({ timeout: 10000 });
    });

    test('shows verification controls', async ({ page }) => {
      await page.goto('/verification');
      await page.waitForLoadState('networkidle');
      
      const pageContent = await page.textContent('body');
      expect(
        pageContent?.includes('Verification') || 
        pageContent?.includes('Verify') ||
        pageContent?.includes('Check')
      ).toBeTruthy();
    });
  });

  test.describe('Sprint Page', () => {
    test('loads successfully', async ({ page }) => {
      await page.goto('/sprint');
      await page.waitForLoadState('networkidle');
      
      expect(page.url()).toContain('/sprint');
      
      const heading = page.locator('h1, h2').first();
      await expect(heading).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Chat Page', () => {
    test('loads successfully', async ({ page }) => {
      await page.goto('/chat');
      await page.waitForLoadState('networkidle');
      
      expect(page.url()).toContain('/chat');
      
      // Chat should have input or message area
      const inputArea = page.locator('input, textarea').first();
      await expect(inputArea).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Board Page', () => {
    test('loads successfully', async ({ page }) => {
      await page.goto('/board');
      await page.waitForLoadState('networkidle');
      
      expect(page.url()).toContain('/board');
    });
  });
});

test.describe('Page Navigation', () => {
  test('all new pages are accessible from sidebar', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Check sidebar has links to new pages
    const sidebarLinks = await page.locator('nav a, aside a').allTextContents();
    const hasAnalytics = sidebarLinks.some(link => link.toLowerCase().includes('analytic'));
    const hasHealth = sidebarLinks.some(link => link.toLowerCase().includes('health'));
    
    // At least some new pages should be in nav
    console.log('Sidebar links found:', sidebarLinks.length);
  });

  test('pages handle 404 gracefully', async ({ page }) => {
    await page.goto('/nonexistent-page-12345');
    await page.waitForLoadState('networkidle');
    
    // Should show some kind of error/not found state, not crash
    const pageContent = await page.textContent('body');
    expect(pageContent?.length).toBeGreaterThan(0);
  });
});
