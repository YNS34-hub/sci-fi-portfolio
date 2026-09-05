import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 45_000,
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [
    ["line"],
    ["html", { outputFolder: "artifacts/playwright-report", open: "never" }]
  ],
  outputDir: "artifacts/playwright-results",
  use: {
    baseURL: "http://127.0.0.1:4411",
    channel: "msedge",
    viewport: { width: 1440, height: 900 },
    colorScheme: "light",
    locale: "zh-CN",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure"
  },
  webServer: {
    command: "npm run preview",
    url: "http://127.0.0.1:4411",
    reuseExistingServer: false,
    timeout: 30_000
  }
});
