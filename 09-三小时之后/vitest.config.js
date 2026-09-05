import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/unit/**/*.test.js"],
    environment: "node",
    coverage: {
      provider: "v8",
      include: ["src/core/**/*.js"],
      reporter: ["text", "json-summary", "html"],
      reportsDirectory: "artifacts/coverage",
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80
      }
    }
  }
});
