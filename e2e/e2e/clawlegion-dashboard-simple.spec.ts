import { test, expect, Page } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

const TEST_DATA = {
  repository: {
    name: 'test-repo',
    path: path.join(__dirname, '../test-repos/sample-project'),
  },
  session: {
    name: 'E2E Test - Auth Feature',
    goal: 'Implement user authentication with JWT tokens',
  },
};

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
  console.log(`📸 ${filename}`);
}

test.describe('ClawLegion - E2E Visual Test', () => {
  test('Complete journey with screenshots', async ({ page }) => {
    console.log('\n🎬 E2E Test - Capturing screenshots at each step...\n');

    // 1. Home
    console.log('Step 1: Home page');
    await page.goto('/');
    await page.waitForTimeout(1000);
    await captureStep(page, '01_home');

    // 2. Dashboard
    console.log('Step 2: Dashboard');
    await page.click('a[href="/dashboard"]');
    await page.waitForURL('/dashboard');
    await page.waitForTimeout(2000);
    await captureStep(page, '02_dashboard');

    // 3. Start Wizard
    console.log('Step 3: Start wizard');
    const newSessionBtn = page.locator('button, a').filter({ hasText: /new session/i }).first();
    await newSessionBtn.click();
    await page.waitForURL('/sessions/new');
    await page.waitForTimeout(2000);
    await captureStep(page, '03_wizard_start');

    // 4. Select Repository
    console.log('Step 4: Repository selection');
    await page.waitForTimeout(2000);

    // Wait for repositories to load - look specifically for button with class structure
    const repoButton = page.locator('button').filter({ hasText: /sample-project/i }).first();
    const repoCount = await repoButton.count();
    console.log(`   Found ${repoCount} repository button(s)`);

    if (repoCount > 0) {
      await repoButton.click();
      console.log('   Clicked repository');
      await page.waitForTimeout(500);
      await captureStep(page, '04_repo_selected');

      // Continue button should now be enabled
      const continueBtn = page.locator('button:has-text("Continue")');
      await expect(continueBtn).toBeEnabled();
      await continueBtn.click();
      await page.waitForTimeout(1500);
    } else {
      console.log('   No repos found');
      await captureStep(page, '04_no_repos');
    }

    // 5. Define Goal
    console.log('Step 5: Define goal');
    const nameInput = page.locator('input[type="text"]').first();
    await nameInput.fill(TEST_DATA.session.name);
    const goalTextarea = page.locator('textarea').first();
    await goalTextarea.fill(TEST_DATA.session.goal);
    await page.waitForTimeout(1000);
    await captureStep(page, '05_goal_defined');

    // Button says "Generate Tasks", not "Next"
    await page.locator('button:has-text("Generate Tasks")').click();
    await page.waitForTimeout(1500);

    // 6. Task Generation
    console.log('Step 6: Task generation page');
    await captureStep(page, '06_generate_page');

    const generateBtn = page.locator('button:has-text("Generate Tasks with Claude")');
    const genCount = await generateBtn.count();
    console.log(`   Generate button found: ${genCount > 0}`);

    if (genCount > 0) {
      await generateBtn.click();
      console.log('   Generating tasks (waiting for completion)...');

      // Wait for success message (can take 30-90 seconds)
      await page.waitForSelector('text=/Tasks Generated Successfully/i', { timeout: 120000 });
      console.log('   ✅ Tasks generated!');
      await captureStep(page, '07_tasks_generated');

      // Page auto-advances to review step after 1 second
      console.log('   Waiting for auto-advance to review step...');
      await page.waitForTimeout(2000);
    }

    // 7. Review Tasks
    console.log('Step 7: Review tasks');
    await captureStep(page, '08_review');
    // Click Continue to proceed to Linear step
    await page.locator('button:has-text("Continue to Configuration")').click();
    await page.waitForTimeout(1000);

    // 8. Linear Integration
    console.log('Step 8: Linear sync (skipping)');
    await captureStep(page, '09_linear');
    await page.locator('button:has-text("Skip")').click();
    await page.waitForTimeout(1000);

    // 9. Configuration
    console.log('Step 9: Configuration');
    await captureStep(page, '10_config');
    await page.locator('button:has-text("Review Summary")').click();
    await page.waitForTimeout(1000);

    // 10. Summary
    console.log('Step 10: Summary and launch');
    await captureStep(page, '11_summary');
    // Don't auto-start, just create the session
    const autoStartCheckbox = page.locator('input[type="checkbox"]').filter({ hasText: /auto/i }).first();
    if (await autoStartCheckbox.count() > 0) {
      await autoStartCheckbox.uncheck().catch(() => {});
    }
    await page.locator('button:has-text("Create Session")').click();
    await page.waitForTimeout(3000);

    // 11. Session Detail Page
    console.log('Step 11: Session detail page');
    await captureStep(page, '12_session_detail');

    console.log('\n✅ Test complete! Check e2e-screenshots/ folder\n');
  });
});
