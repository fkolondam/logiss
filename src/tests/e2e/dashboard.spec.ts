import { test, expect } from '@playwright/test';

test.describe('Dashboard Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard and wait for initial load
    await page.goto('http://localhost:5173/', { 
      waitUntil: 'networkidle',
      timeout: 60000 
    });
  });

  test('basic page load', async ({ page }) => {
    // Wait for main content
    const title = await page.waitForSelector('h1', { timeout: 10000 });
    const titleText = await title.textContent();
    expect(titleText).toContain('Dashboard');
  });

  test('loading states', async ({ page }) => {
    // Force reload to see loading state
    await page.reload();
    
    // Wait for any loading indicator
    const loading = await Promise.race([
      page.waitForSelector('[data-testid="skeleton-card"]', { timeout: 5000 }),
      page.waitForSelector('[data-testid="skeleton-list"]', { timeout: 5000 }),
      page.waitForSelector('[data-testid="skeleton-stats"]', { timeout: 5000 })
    ]);
    expect(loading).toBeTruthy();

    // Wait for content to load
    await page.waitForSelector('[data-testid="dashboard-grid"]', {
      state: 'visible',
      timeout: 10000
    });
  });

  test('notifications', async ({ page }) => {
    // Wait for notifications button
    const notifButton = await page.waitForSelector('[data-testid="notifications-button"]', {
      state: 'visible',
      timeout: 10000
    });
    await notifButton.click();
    
    // Check notifications panel
    const panel = await page.waitForSelector('[data-testid="notifications-panel"]', {
      state: 'visible',
      timeout: 5000
    });
    expect(panel).toBeTruthy();
  });

  test('quick actions', async ({ page }) => {
    // Wait for quick actions button
    const actionButton = await page.waitForSelector('[data-testid="quick-actions-button"]', {
      state: 'visible',
      timeout: 10000
    });
    await actionButton.click();
    
    // Check quick actions menu
    const menu = await page.waitForSelector('[data-testid="quick-actions-menu"]', {
      state: 'visible',
      timeout: 5000
    });
    expect(menu).toBeTruthy();
  });

  test('responsive layout', async ({ page }) => {
    // Wait for grid
    const grid = await page.waitForSelector('[data-testid="dashboard-grid"]', {
      state: 'visible',
      timeout: 10000
    });
    
    // Desktop view (default)
    const desktopClass = await grid.getAttribute('class');
    expect(desktopClass).toContain('grid-cols-1');
    expect(desktopClass).toContain('lg:grid-cols-3');
    
    // Tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500); // Wait for resize
    const tabletClass = await grid.getAttribute('class');
    expect(tabletClass).toContain('md:grid-cols-2');
    
    // Mobile view
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(500); // Wait for resize
    const mobileClass = await grid.getAttribute('class');
    expect(mobileClass).toContain('grid-cols-1');
  });

  test('refresh functionality', async ({ page }) => {
    // Wait for refresh button
    const refreshButton = await page.waitForSelector('[data-testid="refresh-button"]', {
      state: 'visible',
      timeout: 10000
    });
    
    // Click refresh
    await refreshButton.click();
    
    // Check loading spinner appears
    const spinner = await page.waitForSelector('[data-testid="loading-spinner"]', {
      state: 'visible',
      timeout: 5000
    });
    expect(spinner).toBeTruthy();
    
    // Wait for loading to complete
    await page.waitForSelector('[data-testid="loading-spinner"]', {
      state: 'hidden',
      timeout: 15000
    }).catch(() => {
      console.log('Loading spinner remained visible');
    });
  });
});
