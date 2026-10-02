import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  // Keep local Chrome runs within the memory budget, including screenshot tests.
  workers: 3,
  use: {
    baseURL: "http://127.0.0.1:4173",
    channel: "chrome",
    timezoneId: "Asia/Riyadh",
    headless: true,
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run dev -- --host 127.0.0.1 --port 4173 --strictPort",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: false,
  },
});
