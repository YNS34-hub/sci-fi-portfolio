import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 45_000,
  fullyParallel: false,
  workers: 1,
  reporter: "line",
  use: {
    baseURL: "http://127.0.0.1:4401",
    channel: "msedge",
    viewport: { width: 1440, height: 900 },
    colorScheme: "light",
    locale: "zh-CN",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run preview -- --host 127.0.0.1 --port 4401 --strictPort",
    url: "http://127.0.0.1:4401",
    reuseExistingServer: true,
    timeout: 30_000,
  },
});
