import { test, expect } from '@playwright/test'

test.describe('Dashboard Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard and wait for initial load
    await page.goto('http://localhost:5174/', {
      waitUntil: 'networkidle',
      timeout: 60000,
    })

    // Wait for initial loading to complete
    await page.waitForSelector('[data-testid="dashboard-grid"]', {
      state: 'visible',
      timeout: 30000,
    })
  })

  test('basic page load', async ({ page }) => {
    // Wait for main content
    const title = await page.waitForSelector('h1', { timeout: 10000 })
    const titleText = await title.textContent()
    expect(titleText).toContain('Dashboard')
  })

  test('loading states', async ({ page }) => {
    // Force reload to see loading state
    await page.reload()

    // Wait for any loading indicator
    const loading = await Promise.race([
      page.waitForSelector('[data-testid="skeleton-list"]', { timeout: 5000 }),
      page.waitForSelector('[data-testid="skeleton-card"]', { timeout: 5000 }),
      page.waitForSelector('[data-testid="skeleton-stats"]', { timeout: 5000 }),
    ])
    expect(loading).toBeTruthy()

    // Wait for content to load
    await page.waitForSelector('[data-testid="dashboard-grid"]', {
      state: 'visible',
      timeout: 30000,
    })
  })

  test('notifications', async ({ page }) => {
    // Wait for notifications button
    const notifButton = await page.waitForSelector('[data-testid="notifications-button"]', {
      state: 'visible',
      timeout: 10000,
    })
    await notifButton.click()

    // Check notifications panel
    const panel = await page.waitForSelector('[data-testid="notifications-panel"]', {
      state: 'visible',
      timeout: 5000,
    })
    expect(panel).toBeTruthy()
  })

  test('quick actions', async ({ page }) => {
    // Wait for quick actions button
    const actionButton = await page.waitForSelector('[data-testid="quick-actions-button"]', {
      state: 'visible',
      timeout: 10000,
    })
    await actionButton.click()

    // Check quick actions menu
    const menu = await page.waitForSelector('[data-testid="quick-actions-menu"]', {
      state: 'visible',
      timeout: 5000,
    })
    expect(menu).toBeTruthy()
  })

  test('responsive layout', async ({ page }) => {
    // Wait for grid
    const grid = await page.waitForSelector('[data-testid="dashboard-grid"]', {
      state: 'visible',
      timeout: 10000,
    })

    // Desktop view (default)
    const desktopClass = await grid.getAttribute('class')
    expect(desktopClass).toContain('grid-cols-1')
    expect(desktopClass).toContain('lg:grid-cols-3')

    // Tablet view
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.waitForTimeout(500) // Wait for resize
    const tabletClass = await grid.getAttribute('class')
    expect(tabletClass).toContain('md:grid-cols-2')

    // Mobile view
    await page.setViewportSize({ width: 375, height: 812 })
    await page.waitForTimeout(500) // Wait for resize
    const mobileClass = await grid.getAttribute('class')
    expect(mobileClass).toContain('grid-cols-1')
  })

  test('refresh functionality', async ({ page }) => {
    // Wait for initial loading to complete
    await page.waitForSelector('[data-testid="dashboard-grid"]', {
      state: 'visible',
      timeout: 30000,
    })

    // Wait for components to be visible
    await Promise.all([
      page.waitForSelector('[data-testid="recent-deliveries"]', {
        state: 'visible',
        timeout: 30000,
      }),
      page.waitForSelector('[data-testid="expenses-overview"]', {
        state: 'visible',
        timeout: 30000,
      }),
      page.waitForSelector('[data-testid="vehicle-status"]', {
        state: 'visible',
        timeout: 30000,
      }),
    ])

    // Wait for refresh button
    const refreshButton = await page.waitForSelector('[data-testid="refresh-button"]', {
      state: 'visible',
      timeout: 10000,
    })

    // Click refresh
    await refreshButton.click()

    // Wait for loading state
    await Promise.race([
      page.waitForSelector('[data-testid="skeleton-list"]', { timeout: 5000 }),
      page.waitForSelector('[data-testid="skeleton-card"]', { timeout: 5000 }),
      page.waitForSelector('[data-testid="skeleton-stats"]', { timeout: 5000 }),
    ])

    // Wait for components to be visible again
    await Promise.all([
      page.waitForSelector('[data-testid="recent-deliveries"]', {
        state: 'visible',
        timeout: 30000,
      }),
      page.waitForSelector('[data-testid="expenses-overview"]', {
        state: 'visible',
        timeout: 30000,
      }),
      page.waitForSelector('[data-testid="vehicle-status"]', {
        state: 'visible',
        timeout: 30000,
      }),
    ])
  })

  test('dashboard components', async ({ page }) => {
    // Wait for initial loading to complete
    await page.waitForSelector('[data-testid="dashboard-grid"]', {
      state: 'visible',
      timeout: 30000,
    })

    // Wait for all components to load
    await Promise.all([
      // Recent Deliveries
      page.waitForSelector('[data-testid="recent-deliveries"]', {
        state: 'visible',
        timeout: 30000,
      }),

      // Expenses Overview
      page.waitForSelector('[data-testid="expenses-overview"]', {
        state: 'visible',
        timeout: 30000,
      }),

      // Vehicle Status
      page.waitForSelector('[data-testid="vehicle-status"]', {
        state: 'visible',
        timeout: 30000,
      }),
    ])

    // Check Recent Deliveries
    const deliveries = await page.waitForSelector('[data-testid="recent-deliveries"]')
    expect(await deliveries.isVisible()).toBeTruthy()

    // Check Expenses Overview
    const expenses = await page.waitForSelector('[data-testid="expenses-overview"]')
    expect(await expenses.isVisible()).toBeTruthy()

    // Check Vehicle Status
    const vehicles = await page.waitForSelector('[data-testid="vehicle-status"]')
    expect(await vehicles.isVisible()).toBeTruthy()
  })
})
