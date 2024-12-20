import { test, expect } from '@playwright/test'

test.describe('Dashboard Notifications', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('shows notification bell with unread count', async ({ page }) => {
    const notificationButton = page.getByTestId('notifications-button')
    await expect(notificationButton).toBeVisible()

    // Check for unread badge
    const unreadBadge = page.getByTestId('unread-badge')
    await expect(unreadBadge).toBeVisible()
  })

  test('opens notification panel and displays notifications', async ({ page }) => {
    // Open notifications panel
    await page.getByTestId('notifications-button').click()
    const panel = page.getByTestId('notifications-panel')
    await expect(panel).toBeVisible()

    // Check for notification groups
    const notificationCount = await page.locator('[data-testid^="notification-"]').count()
    expect(notificationCount).toBeGreaterThan(0)
  })

  test('marks notifications as read', async ({ page }) => {
    // Open notifications panel
    await page.getByTestId('notifications-button').click()

    // Click "Mark all as read"
    await page.getByTestId('mark-all-read').click()

    // Verify unread badge is gone
    const unreadBadge = page.getByTestId('unread-badge')
    await expect(unreadBadge).not.toBeVisible()
  })

  test('removes individual notifications', async ({ page }) => {
    // Open notifications panel
    await page.getByTestId('notifications-button').click()

    // Get initial notification count
    const initialCount = await page.locator('[data-testid^="notification-"]').count()

    // Remove first notification
    await page.locator('[data-testid^="remove-notification-"]').first().click()

    // Verify count decreased
    const newCount = await page.locator('[data-testid^="notification-"]').count()
    expect(newCount).toBe(initialCount - 1)
  })

  test('navigates to related content when clicking notifications', async ({ page }) => {
    // Open notifications panel
    await page.getByTestId('notifications-button').click()

    // Click first notification
    await page.locator('[data-testid^="notification-"]').first().click()

    // Verify navigation (should be either vehicles or deliveries page)
    await expect(page).toHaveURL(/\/(vehicles|deliveries)/)
  })

  test('shows new notifications in real-time', async ({ page }) => {
    // Open notifications panel
    await page.getByTestId('notifications-button').click()

    // Get initial notification count
    const initialCount = await page.locator('[data-testid^="notification-"]').count()

    // Wait for new notifications (should appear within 30 seconds)
    await page.waitForTimeout(31000)

    // Get new count
    const newCount = await page.locator('[data-testid^="notification-"]').count()

    // Should have new notifications
    expect(newCount).toBeGreaterThan(initialCount)
  })

  test('persists notification state after page reload', async ({ page }) => {
    // Open notifications panel
    await page.getByTestId('notifications-button').click()

    // Mark all as read
    await page.getByTestId('mark-all-read').click()

    // Reload page
    await page.reload()

    // Verify unread badge is still not visible
    const unreadBadge = page.getByTestId('unread-badge')
    await expect(unreadBadge).not.toBeVisible()
  })

  test('displays different notification types with correct styling', async ({ page }) => {
    // Open notifications panel
    await page.getByTestId('notifications-button').click()

    // Check for different notification types
    const lowFuelNotification = page.locator('.text-orange-600').first()
    const maintenanceNotification = page.locator('.text-blue-600').first()
    const deliveryFailedNotification = page.locator('.text-red-600').first()
    const deliverySuccessNotification = page.locator('.text-green-600').first()

    // At least one type should be visible
    const hasNotifications = await Promise.all([
      lowFuelNotification.isVisible(),
      maintenanceNotification.isVisible(),
      deliveryFailedNotification.isVisible(),
      deliverySuccessNotification.isVisible(),
    ]).then((results) => results.some((visible) => visible))

    expect(hasNotifications).toBeTruthy()
  })

  test('groups notifications by date correctly', async ({ page }) => {
    // Open notifications panel
    await page.getByTestId('notifications-button').click()

    // Check for date group headers
    const dateHeaders = page.locator('.bg-gray-50 .text-xs.font-medium')
    const dateHeaderCount = await dateHeaders.count()

    // Should have at least one date group
    expect(dateHeaderCount).toBeGreaterThan(0)

    // First group should be "Today"
    const firstHeader = await dateHeaders.first().textContent()
    expect(firstHeader?.toLowerCase()).toContain('today')
  })
})
