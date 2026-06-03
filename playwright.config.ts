import { defineConfig } from "@playwright/test"

export default defineConfig({
  testDir: "./tests",
  timeout: 60_000,
  use: {
    baseURL: "http://127.0.0.1:4174",
    browserName: "webkit",
    headless: true,
  },
  webServer: {
    command: "npm run quartz -- build -o public-test && TEST_SERVER_PORT=4174 node tests/serve-public-test.mjs",
    port: 4174,
    reuseExistingServer: false,
    timeout: 120_000,
  },
})
