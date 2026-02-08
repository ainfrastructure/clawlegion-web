import { test, expect } from '@playwright/test'

const BASE_URL = process.env.BASE_URL || 'http://localhost:4000'
const API_URL = process.env.API_URL || 'http://localhost:5001'

/**
 * E2E Test: Task Assignment Flow
 * 
 * Tests the complete flow of creating a task with "Start Immediately"
 * and verifying the agent gets notified.
 */

test.describe('Task Assignment Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to tasks page
    await page.goto(`${BASE_URL}/tasks`)
    await page.waitForLoadState('networkidle')
  })

  test('should enhance task with AI and show generated fields', async ({ page }) => {
    // Click new task button
    await page.click('button:has-text("New"), button:has-text("+")')
    
    // Wait for modal
    await expect(page.locator('text=Create Task')).toBeVisible()
    
    // Fill basic fields
    await page.fill('input[placeholder*="What do you want"]', 'Add user avatars')
    await page.fill('textarea[placeholder*="Describe"]', 'Users should be able to upload profile avatars. Support jpg and png.')
    
    // Click "Fill out task with AI"
    await page.click('button:has-text("Fill out task with AI")')
    
    // Wait for AI enhancement (loading state)
    await expect(page.locator('text=Enhancing')).toBeVisible()
    
    // Wait for completion
    await expect(page.locator('text=AI Enhanced Fields')).toBeVisible({ timeout: 10000 })
    
    // Verify enhanced fields are populated
    await page.click('text=AI Enhanced Fields') // Expand if collapsed
    
    // Check success criteria field has content
    const criteriaField = page.locator('textarea').nth(1) // Second textarea after description
    await expect(criteriaField).not.toBeEmpty()
  })

  test('should create task with start immediately and assign to agent', async ({ request }) => {
    // Get repository for task creation
    const reposResponse = await request.get(`${API_URL}/api/task-tracking/repositories`)
    const repos = await reposResponse.json()
    const repoId = repos.repositories?.[0]?.id
    
    if (!repoId) {
      test.skip(true, 'No repositories available for testing')
      return
    }

    // Create task via API with startImmediately
    const taskResponse = await request.post(`${API_URL}/api/task-tracking/tasks`, {
      data: {
        title: 'E2E Test Task - Start Immediately',
        description: 'This is an automated E2E test task to verify the start immediately flow works correctly.',
        repositoryId: repoId,
        priority: 'P2',
        successCriteria: '- [ ] Task created\n- [ ] Agent notified\n- [ ] Status is in_progress',
        startImmediately: true,
        assignee: 'mason',
      },
    })

    expect(taskResponse.ok()).toBeTruthy()
    const taskData = await taskResponse.json()
    
    // Verify task was created
    expect(taskData.task).toBeDefined()
    expect(taskData.task.title).toBe('E2E Test Task - Start Immediately')
    expect(taskData.startedImmediately).toBe(true)
    expect(taskData.assignee).toBe('mason')

    // Verify task status is in_progress
    const getTaskResponse = await request.get(`${API_URL}/api/task-tracking/tasks/${taskData.task.id}`)
    const fetchedTask = await getTaskResponse.json()
    expect(fetchedTask.task.status).toBe('in_progress')

    // Verify activity was logged
    const activitiesResponse = await request.get(`${API_URL}/api/task-tracking/tasks/${taskData.task.id}/activities`)
    const activities = await activitiesResponse.json()
    
    const assignmentActivity = activities.activities?.find(
      (a: any) => a.eventType === 'assigned' || a.details?.assignee
    )
    expect(assignmentActivity).toBeDefined()

    // Cleanup: Delete the test task
    await request.delete(`${API_URL}/api/task-tracking/tasks/${taskData.task.id}`)
  })

  test('should show correct button text when start immediately is checked', async ({ page }) => {
    // Click new task button
    await page.click('button:has-text("New"), button:has-text("+")')
    
    // Wait for modal
    await expect(page.locator('text=Create Task')).toBeVisible()
    
    // Initially button should say "Create Task"
    await expect(page.locator('button:has-text("Create Task")')).toBeVisible()
    
    // Check "Start immediately"
    await page.click('text=Start immediately')
    
    // Button should change to "Create & Start"
    await expect(page.locator('button:has-text("Create & Start")')).toBeVisible()
    
    // Assignee dropdown should be visible
    await expect(page.locator('text=Assign to')).toBeVisible()
  })

  test('should call enhance API and return structured data', async ({ request }) => {
    const response = await request.post(`${API_URL}/api/task-tracking/enhance`, {
      data: {
        title: 'Fix login bug',
        description: 'Users cannot login when password contains special characters. Need to fix the validation.',
      },
    })

    expect(response.ok()).toBeTruthy()
    const data = await response.json()
    
    // Verify structure
    expect(data.enhanced).toBeDefined()
    expect(data.enhanced.title).toBe('Fix login bug')
    expect(data.enhanced.description).toContain('Overview')
    expect(data.enhanced.successCriteria).toBeTruthy()
    expect(data.enhanced.specs).toBeTruthy()
    expect(data.enhanced.approach).toBeTruthy()
    
    // Should detect as bugfix
    expect(data.taskType).toBe('bugfix')
  })

  test('full flow: create enhanced task with start immediately via UI', async ({ page, request }) => {
    // Get repository
    const reposResponse = await request.get(`${API_URL}/api/task-tracking/repositories`)
    const repos = await reposResponse.json()
    
    if (!repos.repositories?.length) {
      test.skip(true, 'No repositories available')
      return
    }

    // Open new task modal
    await page.click('button:has-text("New"), button:has-text("+")')
    await expect(page.locator('text=Create Task')).toBeVisible()

    // Fill title and description
    const testTitle = `E2E UI Test ${Date.now()}`
    await page.fill('input[placeholder*="What do you want"]', testTitle)
    await page.fill('textarea[placeholder*="Describe"]', 'Automated UI test for task creation flow.')

    // Enhance with AI
    await page.click('button:has-text("Fill out task with AI")')
    await expect(page.locator('text=AI Enhanced Fields')).toBeVisible({ timeout: 10000 })

    // Select repository
    await page.selectOption('select', { index: 1 }) // Select first non-empty option

    // Enable start immediately
    await page.click('text=Start immediately')
    await expect(page.locator('text=Assign to')).toBeVisible()

    // Select assignee (Mason is default)
    // Submit
    await page.click('button:has-text("Create & Start")')

    // Wait for modal to close (task created)
    await expect(page.locator('text=Create Task')).not.toBeVisible({ timeout: 10000 })

    // Verify task appears in list
    await page.reload()
    await expect(page.locator(`text=${testTitle}`)).toBeVisible({ timeout: 10000 })
  })
})
