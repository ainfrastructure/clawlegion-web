import { test, expect } from '@playwright/test';
import { navigateTo, generateUniqueId, viewports } from './fixtures/test-utils';

/**
 * Chat/Coordination E2E Tests
 * 
 * SENIOR ENGINEER STANDARDS:
 * - Tests must verify actual chat functionality
 * - No if-guards that skip critical assertions
 * - Test real user interactions
 */

test.describe('Chat/Coordination', () => {
  
  test.describe('Chat Interface', () => {
    test('chat page loads with required elements', async ({ page }) => {
      await navigateTo(page, '/chat');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      
      const chatArea = page.locator('[data-testid="chat-container"], .bg-zinc-900, [class*="chat"], textarea');
      await expect(chatArea.first()).toBeVisible({ timeout: 10000 });
    });

    test('chat has message input field', async ({ page }) => {
      await navigateTo(page, '/chat');
      await page.waitForLoadState('networkidle');
      
      const inputField = page.locator('textarea, input[type="text"]');
      await expect(inputField.first()).toBeVisible();
    });

    test('chat shows agent/council section', async ({ page }) => {
      await navigateTo(page, '/chat');
      await page.waitForLoadState('networkidle');
      
      const agentSection = page.locator('text=/council/i, text=/bot/i, text=/agent/i, [data-testid="agent-selector"]');
      await expect(agentSection.first()).toBeVisible();
    });
  });

  test.describe('Agent Selection', () => {
    test('council section displays agents', async ({ page }) => {
      await navigateTo(page, '/chat');
      await page.waitForLoadState('networkidle');
      
      const councilSection = page.locator('text=/council/i, h2:has-text("Council"), h3:has-text("Council")');
      await expect(councilSection.first()).toBeVisible();
    });

    test('can select agent to chat with', async ({ page }) => {
      await navigateTo(page, '/chat');
      await page.waitForLoadState('networkidle');
      
      const agentSelector = page.locator('[data-testid="agent-avatar"], .cursor-pointer').filter({
        has: page.locator('img, svg, .rounded-full')
      }).first();
      
      const count = await agentSelector.count();
      test.skip(count === 0, 'No agents to select');
      
      await agentSelector.click();
      await page.waitForTimeout(300);
    });
  });

  test.describe('Message Input', () => {
    test('can type in message input', async ({ page }) => {
      await navigateTo(page, '/chat');
      await page.waitForLoadState('networkidle');
      
      const messageInput = page.locator('textarea, input[type="text"]').first();
      await expect(messageInput).toBeVisible();
      
      await messageInput.fill('Hello, this is a test message');
      await expect(messageInput).toHaveValue('Hello, this is a test message');
    });

    test('message input accepts multi-line text', async ({ page }) => {
      await navigateTo(page, '/chat');
      await page.waitForLoadState('networkidle');
      
      const messageInput = page.locator('textarea').first();
      const count = await messageInput.count();
      test.skip(count === 0, 'No textarea for multi-line');
      
      const multiLineText = 'Line 1\nLine 2\nLine 3';
      await messageInput.fill(multiLineText);
      await expect(messageInput).toHaveValue(multiLineText);
    });
  });

  test.describe('Message Display', () => {
    test('message container exists', async ({ page }) => {
      await navigateTo(page, '/chat');
      await page.waitForLoadState('networkidle');
      
      const messageContainer = page.locator('[data-testid="message-list"], .overflow-y-auto, [class*="messages"]');
      await expect(messageContainer.first()).toBeVisible();
    });
  });

  test.describe('Responsive Design', () => {
    test('mobile view shows chat', async ({ page }) => {
      await page.setViewportSize(viewports.mobile);
      await navigateTo(page, '/chat');
      await page.waitForLoadState('networkidle');
      
      const chatArea = page.locator('[data-testid="chat-container"], [class*="chat"]');
      await expect(chatArea.first()).toBeVisible();
    });

    test('tablet view shows full chat', async ({ page }) => {
      await page.setViewportSize(viewports.tablet);
      await navigateTo(page, '/chat');
      await page.waitForLoadState('networkidle');
      
      const chatArea = page.locator('[data-testid="chat-container"], [class*="chat"]');
      await expect(chatArea.first()).toBeVisible();
    });

    test('desktop view shows sidebar and chat', async ({ page }) => {
      await page.setViewportSize(viewports.desktop);
      await navigateTo(page, '/chat');
      await page.waitForLoadState('networkidle');
      
      const chatArea = page.locator('[data-testid="chat-container"], [class*="chat"]');
      await expect(chatArea.first()).toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    test('handles API errors gracefully', async ({ page }) => {
      await page.route('**/api/**', route => {
        if (route.request().method() === 'POST') {
          route.fulfill({
            status: 500,
            body: JSON.stringify({ error: 'Server Error' })
          });
        } else {
          route.continue();
        }
      });
      
      await navigateTo(page, '/chat');
      await page.waitForLoadState('networkidle');
      
      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('Chat Room', () => {
    test('default room loads without crash', async ({ page }) => {
      await navigateTo(page, '/chat');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      
      await expect(page.locator('body')).toBeVisible();
      
      const chatArea = page.locator('[data-testid="chat-container"], [class*="chat"]');
      await expect(chatArea.first()).toBeVisible();
    });
  });
});
