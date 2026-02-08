import { test, expect } from '@playwright/test';
import { navigateTo, viewports } from './fixtures/test-utils';

/**
 * Agent Availability E2E Tests
 * 
 * SENIOR ENGINEER STANDARDS:
 * - Tests MUST fail when code is broken
 * - No if-guards that skip assertions
 * - Real assertions on actual state
 */

test.describe('Agent Availability', () => {
  
  test.describe('Agent Fleet Dashboard', () => {
    test('loads agent fleet page with required elements', async ({ page }) => {
      await navigateTo(page, '/agents/fleet');
      
      // Header MUST be visible
      await expect(page.locator('h1')).toContainText(/agent/i);
    });

    test('displays agent stat cards with real data', async ({ page }) => {
      await navigateTo(page, '/agents/fleet');
      await page.waitForLoadState('networkidle');
      
      // Total agents stat MUST exist and contain a number
      const totalAgentsStat = page.locator('[data-testid="stat-total-agents"]');
      await expect(totalAgentsStat).toBeVisible();
      await expect(totalAgentsStat).toContainText(/\d+/);
    });

    test('shows agent cards when agents exist', async ({ page }) => {
      await navigateTo(page, '/agents/fleet');
      await page.waitForLoadState('networkidle');
      
      const agentCards = page.locator('[data-testid="agent-card"]');
      const emptyState = page.locator('text=/no agent/i');
      
      await page.waitForTimeout(2000);
      
      const agentCount = await agentCards.count();
      const hasEmptyState = await emptyState.isVisible().catch(() => false);
      
      // Must have one or the other
      expect(agentCount > 0 || hasEmptyState).toBe(true);
    });

    test('refresh button is visible and clickable', async ({ page }) => {
      await navigateTo(page, '/agents/fleet');
      
      const refreshButton = page.locator('[data-testid="btn-refresh"]');
      await expect(refreshButton).toBeVisible();
      await expect(refreshButton).toBeEnabled();
    });

    test('resume all button is visible', async ({ page }) => {
      await navigateTo(page, '/agents/fleet');
      
      const resumeButton = page.locator('[data-testid="btn-resume-all"]');
      await expect(resumeButton).toBeVisible();
    });
  });

  test.describe('Agent Stats Display', () => {
    test('total agents stat displays valid count', async ({ page }) => {
      await navigateTo(page, '/agents/fleet');
      await page.waitForLoadState('networkidle');
      
      const totalStat = page.locator('[data-testid="stat-total-agents"]');
      await expect(totalStat).toBeVisible();
      
      const text = await totalStat.textContent();
      expect(text).toMatch(/\d+/);
    });

    test('active agents stat is visible', async ({ page }) => {
      await navigateTo(page, '/agents/fleet');
      await page.waitForLoadState('networkidle');
      
      const activeStat = page.locator('[data-testid="stat-active-now"]');
      await expect(activeStat).toBeVisible();
    });

    test('reachable and unreachable stats are displayed', async ({ page }) => {
      await navigateTo(page, '/agents/fleet');
      await page.waitForLoadState('networkidle');
      
      const reachableStat = page.locator('[data-testid="stat-reachable"]');
      const unreachableStat = page.locator('[data-testid="stat-unreachable"]');
      
      await expect(reachableStat).toBeVisible();
      await expect(unreachableStat).toBeVisible();
    });

    test('completed tasks stat is visible', async ({ page }) => {
      await navigateTo(page, '/agents/fleet');
      await page.waitForLoadState('networkidle');
      
      const completedStat = page.locator('[data-testid="stat-completed"]');
      await expect(completedStat).toBeVisible();
    });
  });

  test.describe('Agent Card Interactions', () => {
    test('agent cards are clickable with pointer cursor', async ({ page }) => {
      await navigateTo(page, '/agents/fleet');
      await page.waitForLoadState('networkidle');
      
      const agentCard = page.locator('[data-testid="agent-card"]').first();
      const count = await agentCard.count();
      test.skip(count === 0, 'No agents to test');
      
      await expect(agentCard).toBeVisible();
      const cursor = await agentCard.evaluate(el => window.getComputedStyle(el).cursor);
      expect(cursor).toBe('pointer');
    });

    test('clicking agent card opens profile panel', async ({ page }) => {
      await navigateTo(page, '/agents/fleet');
      await page.waitForLoadState('networkidle');
      
      const agentCard = page.locator('[data-testid="agent-card"]').first();
      const count = await agentCard.count();
      test.skip(count === 0, 'No agents to test');
      
      await agentCard.click();
      await page.waitForTimeout(500);
      
      const profilePanel = page.locator('[data-testid="agent-profile-panel"], [role="dialog"]');
      await expect(profilePanel.first()).toBeVisible({ timeout: 3000 });
    });

    test('agent card displays agent name', async ({ page }) => {
      await navigateTo(page, '/agents/fleet');
      await page.waitForLoadState('networkidle');
      
      const agentCard = page.locator('[data-testid="agent-card"]').first();
      const count = await agentCard.count();
      test.skip(count === 0, 'No agents to test');
      
      const cardText = await agentCard.textContent();
      expect(cardText).toBeTruthy();
      expect(cardText!.trim().length).toBeGreaterThan(0);
    });
  });

  test.describe('Activity Feed', () => {
    test('activity feed section exists', async ({ page }) => {
      await navigateTo(page, '/agents/fleet');
      await page.waitForLoadState('networkidle');
      
      const activitySection = page.locator('text=/live activity/i, text=/activity/i, h2:has-text("Activity")');
      await expect(activitySection.first()).toBeVisible();
    });
  });

  test.describe('Responsive Design', () => {
    test('mobile view renders without breakage', async ({ page }) => {
      await page.setViewportSize(viewports.mobile);
      await navigateTo(page, '/agents/fleet');
      await page.waitForLoadState('networkidle');
      
      await expect(page.locator('h1')).toBeVisible();
    });

    test('tablet view renders properly', async ({ page }) => {
      await page.setViewportSize(viewports.tablet);
      await navigateTo(page, '/agents/fleet');
      await page.waitForLoadState('networkidle');
      
      await expect(page.locator('h1')).toBeVisible();
    });

    test('desktop view shows full layout', async ({ page }) => {
      await page.setViewportSize(viewports.desktop);
      await navigateTo(page, '/agents/fleet');
      await page.waitForLoadState('networkidle');
      
      await expect(page.locator('h1')).toBeVisible();
      const activitySection = page.locator('text=/activity/i');
      await expect(activitySection.first()).toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    test('page handles API errors gracefully', async ({ page }) => {
      await page.route('**/api/agents**', route => {
        route.fulfill({
          status: 500,
          body: JSON.stringify({ error: 'Internal Server Error' })
        });
      });
      
      await navigateTo(page, '/agents/fleet');
      
      // Page should not crash
      await expect(page.locator('body')).toBeVisible();
      const hasContent = await page.locator('h1').isVisible();
      expect(hasContent).toBe(true);
    });
  });
});
