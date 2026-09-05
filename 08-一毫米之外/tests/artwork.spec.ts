import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { statSync } from "node:fs";
import path from "node:path";

const evidenceDirectory = path.resolve("evidence");

function collectRuntimeProblems(page: Page) {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  const failedRequests: string[] = [];

  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("requestfailed", (request) => {
    failedRequests.push(`${request.method()} ${request.url()} ${request.failure()?.errorText}`);
  });

  return { consoleErrors, pageErrors, failedRequests };
}

test("desktop artwork renders, responds, exports, and remains clean", async ({ page }) => {
  const problems = collectRuntimeProblems(page);
  const responses: Array<{ url: string; status: number }> = [];
  page.on("response", (response) => {
    if (response.url().startsWith("http://127.0.0.1:4401")) {
      responses.push({ url: response.url(), status: response.status() });
    }
  });

  await page.goto("/", { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);

  await expect(page).toHaveTitle(/一毫米之外/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("ONE MILLIMETRE OFF");
  await expect(page.locator(".deviation-field")).toBeVisible();
  await expect(page.getByRole("button", { name: "进入偏差实验" })).toBeVisible();

  const canvas = page.locator(".deviation-field");
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;

  await page.mouse.move(box.x + box.width * 0.2, box.y + box.height * 0.58);
  await page.mouse.down();
  for (let step = 0; step <= 18; step += 1) {
    await page.mouse.move(
      box.x + box.width * (0.2 + step * 0.025),
      box.y + box.height * (0.58 + Math.sin(step * 0.55) * 0.08),
    );
  }
  await page.mouse.up();
  await page.waitForTimeout(350);

  const traceReading = await page.locator(".rail-reading span").nth(1).textContent();
  expect(traceReading).not.toMatch(/^000/);

  await page.screenshot({
    path: path.join(evidenceDirectory, "hero-interaction.png"),
    animations: "disabled",
  });

  await page.getByRole("button", { name: /漂移 DRIFT/ }).click();
  await expect(page.locator(".artwork-shell")).toHaveAttribute("data-mode", "drift");
  await expect(page.locator(".mode-panel[data-active='true']")).toContainText("漂移");

  await page.keyboard.press("Space");
  await page.getByRole("button", { name: "动态 完整" }).click();
  await expect(page.locator(".artwork-shell")).toHaveAttribute(
    "data-reduced-motion",
    "true",
  );
  await page.getByRole("button", { name: "动态 减弱" }).click();

  await page.locator(".observatory").scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: "下一则" }).click();
  await page.getByRole("button", { name: "下一则" }).click();
  await expect(page.locator(".observation-window")).toContainText(/1 次脉冲|2 次脉冲/);

  await page.locator(".archive").scrollIntoViewIfNeeded();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "封存为图像" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^one-millimetre-off-\d+\.png$/);
  const posterPath = path.join(evidenceDirectory, "archived-deviation.png");
  await download.saveAs(posterPath);
  expect(statSync(posterPath).size).toBeGreaterThan(10_000);

  const layout = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    document: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
  }));
  expect(layout.document).toBeLessThanOrEqual(layout.viewport + 1);
  expect(layout.body).toBeLessThanOrEqual(layout.viewport + 1);

  await page.screenshot({
    path: path.join(evidenceDirectory, "desktop-full.png"),
    fullPage: true,
    animations: "disabled",
  });

  expect(responses.length).toBeGreaterThan(3);
  expect(responses.filter((response) => response.status >= 400)).toEqual([]);
  expect(problems.consoleErrors).toEqual([]);
  expect(problems.pageErrors).toEqual([]);
  expect(problems.failedRequests).toEqual([]);
});

test("narrow layout keeps the full interaction usable", async ({ page }) => {
  const problems = collectRuntimeProblems(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("button", { name: "进入偏差实验" })).toBeVisible();
  await page.locator("#laboratory").scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: /回声 ECHO/ }).click();
  await expect(page.locator(".artwork-shell")).toHaveAttribute("data-mode", "echo");
  await expect(page.locator(".mode-panel[data-active='true']")).toContainText(
    "每一次决定",
  );

  await page.screenshot({
    path: path.join(evidenceDirectory, "narrow-laboratory.png"),
    animations: "disabled",
  });

  const widths = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    document: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
  }));
  expect(widths.document).toBeLessThanOrEqual(widths.viewport + 1);
  expect(widths.body).toBeLessThanOrEqual(widths.viewport + 1);

  await page.screenshot({
    path: path.join(evidenceDirectory, "narrow-full.png"),
    fullPage: true,
    animations: "disabled",
  });

  expect(problems.consoleErrors).toEqual([]);
  expect(problems.pageErrors).toEqual([]);
  expect(problems.failedRequests).toEqual([]);
});

test("keyboard entry and WCAG essentials remain intact", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "跳到偏差实验" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#laboratory")).toBeInViewport({ ratio: 0.08 });

  const accessibility = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  const consequentialViolations = accessibility.violations.filter((violation) =>
    ["serious", "critical"].includes(violation.impact ?? ""),
  );
  expect(consequentialViolations).toEqual([]);
});
