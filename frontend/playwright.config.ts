import { defineConfig, devices } from "@playwright/test";

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./e2e-tests",
  snapshotPathTemplate:
    "{testDir}/__snapshots__/{projectName}/{testFileName}/{arg}{ext}",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: "html",
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.05,
      animations: "disabled",
    },
  },
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    colorScheme: "dark",
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },

    //{
    //  name: "firefox",
    //  use: { ...devices["Desktop Firefox"] },
    //},

    //{
    //  name: "webkit",
    //  use: { ...devices["Desktop Safari"] },
    //},

    ///* Test against mobile viewports. */
    //{
    //  name: "Mobile Chrome",
    //  use: { ...devices["Pixel 5"] },
    //},
    //{
    //  name: "Mobile Safari",
    //  use: { ...devices["iPhone 12"] },
    //},

    ///* Test against branded browsers. */
    //{
    //  name: "Microsoft Edge",
    //  use: { ...devices["Desktop Edge"], channel: "msedge" },
    //},
    //{
    //  name: "Google Chrome",
    //  use: { ...devices["Desktop Chrome"], channel: "chrome" },
    //},
  ],

  webServer: {
    command: "pnpm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
