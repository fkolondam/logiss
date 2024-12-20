import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './src/tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    video: 'on-first-retry',
    // Add viewport size
    viewport: { width: 1280, height: 720 },
    // Add screenshot on failure
    screenshot: 'only-on-failure',
    // Add browser options
    launchOptions: {
      slowMo: 100,
      devtools: true
    }
  },
  // Add webServer configuration
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 120000
  },
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Add additional Chrome flags
        launchOptions: {
          args: ['--disable-web-security', '--allow-insecure-localhost']
        }
      }
    }
  ]
})
