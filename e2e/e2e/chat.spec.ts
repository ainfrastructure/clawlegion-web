import { test, expect } from '@playwright/test'

test.describe('Chat Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/chat')
    await page.waitForLoadState('networkidle')
  })

  test('should display page heading or chat interface', async ({ page }) => {
    // Chat page should have some identifying element
    const chatContainer = page.locator('[class*="chat"], [class*="message"], main')
    await expect(chatContainer.first()).toBeVisible()
  })

  test('should display room list or sidebar', async ({ page }) => {
    // Should have room list, sidebar, or room navigation
    const roomSection = page.locator('text=/rooms|channels|general|bot-collab/i').first()
    await expect(roomSection).toBeVisible({ timeout: 10000 })
  })

  test('should display message input area', async ({ page }) => {
    // Should have a message input
    const messageInput = page.locator('textarea, input[type="text"]').last()
    await expect(messageInput).toBeVisible()
  })

  test('should have send button or functionality', async ({ page }) => {
    // Should have a send button
    const sendButton = page.locator('button').last()
    await expect(sendButton).toBeVisible()
  })

  test('should display messages area', async ({ page }) => {
    // Messages container should exist
    const messagesArea = page.locator('[class*="message"], [class*="chat"], main').first()
    await expect(messagesArea).toBeVisible()
  })

  test('should load without timeout issues', async ({ page }) => {
    // Page should load within reasonable time
    await expect(page.locator('body')).toBeVisible()
    // Chat interface should be present
    const chatArea = page.locator('main, [class*="chat"]').first()
    await expect(chatArea).toBeVisible()
  })

  test('should allow typing in message input', async ({ page }) => {
    const messageInput = page.locator('textarea, input[type="text"]').last()
    await messageInput.fill('Test message')
    await expect(messageInput).toHaveValue('Test message')
  })

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Main chat area should still be visible
    const messageInput = page.locator('textarea, input[type="text"]').last()
    await expect(messageInput).toBeVisible()
  })

  test('should be responsive on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    
    // Chat interface should be visible
    const chatArea = page.locator('main, [class*="chat"]').first()
    await expect(chatArea).toBeVisible()
  })

  test('should have no JavaScript errors', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', err => errors.push(err.message))
    
    await page.goto('/chat')
    await page.waitForLoadState('networkidle')
    
    expect(errors).toHaveLength(0)
  })

  test('should display navigation back to dashboard', async ({ page }) => {
    // Should have navigation link or back button
    const navLink = page.locator('a[href="/"], a[href="/dashboard"], a[href*="dashboard"]').first()
    await expect(navLink).toBeVisible()
  })
})
