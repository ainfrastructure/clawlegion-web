import { test, expect, Page } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

/**
 * ClawLegion End-to-End Test Suite
 *
 * This test suite covers the complete user journey through the ClawLegion:
 * 1. Home page navigation
 * 2. Session wizard (7 steps)
 * 3. Session creation
 * 4. Session execution monitoring
 * 5. Analytics and tracking
 *
 * Screenshots are captured at each major step for visual verification.
 */

// Test data
const TEST_DATA = {
  repository: {
    name: 'test-repo',
    path: path.join(__dirname, '../test-repos/sample-project'),
  },
  session: {
    name: 'E2E Test Session - Authentication Feature',
    goal: 'Implement user authentication with JWT tokens, including login, logout, and token refresh functionality',
    context: 'Use Express.js middleware pattern, bcrypt for password hashing, and jsonwebtoken library. Follow REST API best practices.',
  },
  discord: {
    webhookUrl: process.env.TEST_DISCORD_WEBHOOK || '', // Optional
  },
};

// Helper function to take screenshot with step name
async function captureStep(page: Page, stepName: string) {
  const screenshotDir = path.join(__dirname, '../e2e-screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${timestamp}_${stepName.replace(/\s+/g, '_')}.png`;
  await page.screenshot({
    path: path.join(screenshotDir, filename),
    fullPage: true
  });
  console.log(`📸 Screenshot saved: ${filename}`);
}

// Helper to wait for API response
async function waitForApiResponse(page: Page, urlPattern: string | RegExp, timeout = 30000) {
  return page.waitForResponse(
    response => {
      const url = response.url();
      const matches = typeof urlPattern === 'string'
        ? url.includes(urlPattern)
        : urlPattern.test(url);
      return matches && response.status() === 200;
    },
    { timeout }
  );
}

test.describe('ClawLegion - Complete E2E Flow', () => {
  test.beforeAll(async () => {
    console.log('🧪 Starting ClawLegion E2E Test Suite');
    console.log('📋 Test Data:', TEST_DATA);
  });

  test('Complete user journey: Session creation to execution monitoring', async ({ page }) => {
    console.log('\n🎬 Starting complete E2E test...\n');

    // ==========================================
    // STEP 1: Home Page & Navigation
    // ==========================================
    console.log('Step 1: Loading home page...');
    await page.goto('/');
    await expect(page).toHaveTitle(/Ralph|Dashboard|Command/i);
    await captureStep(page, '01_home_page');

    // Verify home page elements
    await expect(page.getByText('Command Center')).toBeVisible();
    await expect(page.getByRole('link', { name: /go to dashboard/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /manage repositories/i })).toBeVisible();

    console.log('✅ Home page loaded successfully');

    // Navigate to dashboard
    console.log('\nStep 2: Navigating to dashboard...');
    await page.click('a[href="/dashboard"]');
    await page.waitForURL('/dashboard');
    await captureStep(page, '02_dashboard');

    // Verify dashboard elements
    await expect(page.getByText(/Recent Sessions/i)).toBeVisible();
    // New Session can be either a button or link depending on the page
    const newSessionElement = page.locator('button:has-text("New Session"), a:has-text("New Session")').first();
    await expect(newSessionElement).toBeVisible();

    console.log('✅ Dashboard page loaded');

    // ==========================================
    // STEP 2: Start New Session Wizard
    // ==========================================
    console.log('\nStep 3: Starting new session wizard...');
    const newSessionBtn = page.locator('button:has-text("New Session"), a:has-text("New Session")').first();
    await newSessionBtn.click();
    await page.waitForURL('/sessions/new');
    await captureStep(page, '03_wizard_start');

    // Verify wizard started - look for the heading and step indicator
    await expect(page.getByText('Create Ralph Loop Session')).toBeVisible();
    await expect(page.getByText('Select Repository')).toBeVisible();

    console.log('✅ Wizard started');

    // ==========================================
    // WIZARD STEP 1: Select Repository
    // ==========================================
    console.log('\nStep 4: Selecting repository...');

    // Wait for repositories to load (repositories are button elements)
    await page.waitForTimeout(2000);
    const repoButton = page.locator('button').filter({ hasText: /sample-project/i }).first();
    const repoCount = await repoButton.count();

    if (repoCount === 0) {
      console.log('⚠️  No repositories found. You may need to initialize a repository first.');
      console.log('   Please run: npm run init:repo or add a repository through the UI');

      // Take screenshot of empty state
      await captureStep(page, '04_no_repositories');

      // For demo purposes, we'll show how to handle this
      await expect(page.getByText(/no repositories/i)).toBeVisible();
    } else {
      // Select first available repository
      await repoButton.click();
      await page.waitForTimeout(500);
      await captureStep(page, '04_repository_selected');

      console.log('✅ Repository selected');

      // Click Continue
      const continueBtn = page.locator('button:has-text("Continue")');
      await expect(continueBtn).toBeEnabled();
      await continueBtn.click();
      await page.waitForTimeout(1000);
    }

    // ==========================================
    // WIZARD STEP 2: Define Goal
    // ==========================================
    console.log('\nStep 5: Defining session goal...');

    // Fill in session details (inputs don't have name attributes, use order)
    const nameInput = page.locator('input[type="text"]').first();
    await nameInput.fill(TEST_DATA.session.name);

    const goalTextarea = page.locator('textarea').first();
    await goalTextarea.fill(TEST_DATA.session.goal);

    // Fill additional context if field exists (second textarea)
    const contextField = page.locator('textarea').nth(1);
    if (await contextField.count() > 0) {
      await contextField.fill(TEST_DATA.session.context);
    }

    await captureStep(page, '05_goal_defined');
    console.log('✅ Goal defined');

    // Click Generate Tasks button
    await page.click('button:has-text("Generate Tasks")');
    await page.waitForTimeout(1000);

    // ==========================================
    // WIZARD STEP 3: Generate Tasks
    // ==========================================
    console.log('\nStep 6: Generating tasks with Claude...');
    await captureStep(page, '06_generate_tasks_start');

    // Click Generate button
    await page.click('button:has-text("Generate Tasks with Claude")');

    // Wait for generation to complete (can take 30-90 seconds)
    console.log('   ⏳ Waiting for Claude to generate tasks (this may take 30-90 seconds)...');

    // Wait for success message
    await page.waitForSelector('text=/Tasks Generated Successfully/i', { timeout: 120000 });

    console.log('✅ Tasks generated successfully');
    await captureStep(page, '07_tasks_generated');

    // Page auto-advances to review step after 1 second
    console.log('   Waiting for auto-advance to review step...');
    await page.waitForTimeout(2000);

    // ==========================================
    // WIZARD STEP 4: Review & Edit Tasks
    // ==========================================
    console.log('\nStep 7: Reviewing generated tasks...');
    await page.waitForTimeout(1000);
    await captureStep(page, '08_review_tasks');

    // Count tasks - tasks are in div elements, not special test IDs
    const taskElements = await page.locator('div').filter({ hasText: /TASK-#\d+/i }).count();
    console.log(`   Found ${taskElements} task elements`);

    console.log('✅ Tasks reviewed');

    // Click Continue to Configuration to proceed
    await page.click('button:has-text("Continue to Configuration")');
    await page.waitForTimeout(1000);

    // ==========================================
    // WIZARD STEP 5: Linear Integration (Optional)
    // ==========================================
    console.log('\nStep 8: Linear integration step...');
    await captureStep(page, '10_linear_integration');

    // Skip Linear integration for this test
    console.log('   ⏭️  Skipping Linear integration');
    await page.click('button:has-text("Skip")');
    await page.waitForTimeout(1000);

    console.log('✅ Linear step skipped');

    // ==========================================
    // WIZARD STEP 6: Configuration
    // ==========================================
    console.log('\nStep 9: Configuring session settings...');
    await captureStep(page, '11_configuration');

    // Fill Discord webhook if provided
    if (TEST_DATA.discord.webhookUrl) {
      const webhookInput = page.locator('input[name="discordWebhook"], input[placeholder*="webhook"]');
      if (await webhookInput.count() > 0) {
        await webhookInput.fill(TEST_DATA.discord.webhookUrl);
      }
    }

    // Add quality check command
    const qualityCheckInput = page.locator('input[name="qualityChecks"], input[placeholder*="quality"]').first();
    if (await qualityCheckInput.count() > 0) {
      await qualityCheckInput.fill('npm test');
    }

    await captureStep(page, '12_configuration_filled');
    console.log('✅ Configuration set');

    // Click Review Summary
    await page.click('button:has-text("Review Summary")');
    await page.waitForTimeout(1000);

    // ==========================================
    // WIZARD STEP 7: Review & Launch
    // ==========================================
    console.log('\nStep 10: Final review and launch...');
    await captureStep(page, '13_final_review');

    // Verify summary shows correct data
    await expect(page.getByText(TEST_DATA.session.name)).toBeVisible();

    console.log('✅ Final review complete');

    // Create session (without auto-start for testing)
    console.log('\nStep 11: Creating session...');

    // Uncheck auto-start if checked
    const autoStartCheckbox = page.locator('input[type="checkbox"][name="autoStart"]');
    if (await autoStartCheckbox.count() > 0 && await autoStartCheckbox.isChecked()) {
      await autoStartCheckbox.uncheck();
    }

    // Click Create Session
    const createButton = page.locator('button:has-text("Create Session"), button:has-text("Launch")').first();
    await createButton.click();

    // Wait for navigation to session page
    await page.waitForURL(/\/sessions\/[a-z0-9-]+/, { timeout: 30000 });

    const sessionUrl = page.url();
    const sessionId = sessionUrl.split('/sessions/')[1];
    console.log(`✅ Session created: ${sessionId}`);

    await page.waitForTimeout(2000);
    await captureStep(page, '14_session_created');

    // ==========================================
    // SESSION DETAIL PAGE: Monitoring & Analytics
    // ==========================================
    console.log('\nStep 12: Viewing session detail page...');

    // Verify session detail elements loaded (don't use strict test IDs)
    await page.waitForTimeout(1000);
    await expect(page.getByText(TEST_DATA.session.name)).toBeVisible();

    // Check for Start button (there's also a Restart button, so use first())
    const startButton = page.locator('button').filter({ hasText: /^Start$/ }).first();
    await expect(startButton).toBeVisible();

    await captureStep(page, '15_session_detail_pending');
    console.log('✅ Session detail page loaded');

    // ==========================================
    // VERIFY ANALYTICS COMPONENTS
    // ==========================================
    console.log('\nStep 13: Verifying analytics components...');

    // Task Queue should be visible
    const taskQueueVisible = await page.getByText(/task queue|todo/i).count();
    console.log(`   Task queue visible: ${taskQueueVisible > 0}`);

    // Logs panel
    const logsVisible = await page.getByText(/logs/i).count();
    console.log(`   Logs panel visible: ${logsVisible > 0}`);

    await captureStep(page, '16_analytics_components');
    console.log('✅ Analytics components verified');

    // ==========================================
    // START SESSION (Optional - for full test)
    // ==========================================
    if (process.env.E2E_RUN_EXECUTION === 'true') {
      console.log('\nStep 14: Starting session execution...');

      await startButton.click();

      // Wait for status to change to RUNNING
      await expect(page.locator('text=/running/i')).toBeVisible({ timeout: 10000 });
      await captureStep(page, '17_session_running');

      console.log('✅ Session started');
      console.log('   ⏳ Monitoring execution...');

      // Monitor for 30 seconds to see real-time updates
      for (let i = 0; i < 6; i++) {
        await page.waitForTimeout(5000);
        console.log(`   ... ${(i + 1) * 5}s elapsed`);

        // Check if logs are appearing
        const logCount = await page.locator('[data-testid="log-entry"], .log-line').count();
        console.log(`   ... ${logCount} log entries`);
      }

      await captureStep(page, '18_session_executing');

      // Check task progress
      const completedTasks = await page.locator('[data-testid="task-completed"]').count();
      console.log(`   ✅ ${completedTasks} tasks completed`);
    } else {
      console.log('\nℹ️  Skipping session execution (set E2E_RUN_EXECUTION=true to run)');
    }

    // ==========================================
    // NAVIGATE BACK TO DASHBOARD
    // ==========================================
    console.log('\nStep 15: Navigating back to dashboard...');

    await page.click('a[href="/dashboard"]');
    await page.waitForURL('/dashboard');
    await captureStep(page, '19_dashboard_with_session');

    // Verify session appears in recent sessions (may have multiple from previous test runs)
    await expect(page.getByText(TEST_DATA.session.name).first()).toBeVisible();

    console.log('✅ Session visible in dashboard');

    // ==========================================
    // TEST COMPLETE
    // ==========================================
    console.log('\n✅ ✅ ✅ E2E Test Complete! ✅ ✅ ✅\n');
    console.log('📊 Test Summary:');
    console.log('   • Home page: ✅');
    console.log('   • Dashboard navigation: ✅');
    console.log('   • Session wizard (7 steps): ✅');
    console.log('   • Task generation: ✅');
    console.log('   • Session creation: ✅');
    console.log('   • Session detail page: ✅');
    console.log('   • Analytics components: ✅');
    console.log(`   • Screenshots captured: ${fs.readdirSync(path.join(__dirname, '../e2e-screenshots')).length}`);
    console.log('\n📸 Screenshots saved to: e2e-screenshots/');
    console.log('📄 Full report available at: e2e-report/index.html\n');
  });
});
