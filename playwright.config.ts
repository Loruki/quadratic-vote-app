import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  fullyParallel: false,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3211',
    trace: 'retain-on-failure',
    // The app honors prefers-reduced-motion via MotionConfig — emulating it
    // here makes assertions deterministic (no mid-flight animation states).
    contextOptions: { reducedMotion: 'reduce' },
  },
  webServer: {
    command: 'npx next dev -p 3211',
    url: 'http://localhost:3211',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['iPhone 13'] } },
  ],
});
