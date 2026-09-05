import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { statSync } from "node:fs";
import path from "node:path";

const evidenceDirectory = path.resolve("artifacts", "evidence");

function collectProblems(page) {
  const consoleErrors = [];
  const pageErrors = [];
  const failedRequests = [];
  const remoteRequests = [];

  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("requestfailed", (request) => failedRequests.push(`${request.method()} ${request.url()}`));
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (!['127.0.0.1', 'localhost'].includes(url.hostname)) remoteRequests.push(request.url());
  });

  return { consoleErrors, pageErrors, failedRequests, remoteRequests };
}

test("a visitor enters, presses the field, changes acts, and returns to remembered time", async ({ page }) => {
  const problems = collectProblems(page);
  await page.goto("/", { waitUntil: "networkidle" });

  await expect(page).toHaveTitle(/三小时之后/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("三小时之后");
  await expect(page.getByText("180 根分钟纤维")).toBeVisible();
  await page.screenshot({
    path: path.join(evidenceDirectory, "opening.png"),
    animations: "disabled",
  });
  await page.getByRole("button", { name: "进入这三小时" }).click();
  await expect(page.locator("[data-testid='artwork-shell']")).toHaveAttribute("data-entered", "true");

  const canvas = page.getByTestId("time-field");
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;

  await page.mouse.move(box.x + box.width * 0.28, box.y + box.height * 0.52);
  await page.mouse.down();
  for (let step = 0; step < 14; step += 1) {
    await page.mouse.move(
      box.x + box.width * (0.28 + step * 0.018),
      box.y + box.height * (0.52 + Math.sin(step * 0.5) * 0.05),
    );
  }
  await page.mouse.up();

  await expect(page.getByTestId("trace-count")).not.toHaveText("000");
  const firstMark = await page.evaluate(() => window.__AFTER_THREE_HOURS__.getState().memory.marks[0]);
  expect(firstMark.x).toBeGreaterThan(0.14);
  expect(firstMark.x).toBeLessThan(0.2);
  const remembered = await page.evaluate(() => localStorage.getItem("after-three-hours:witness:v1"));
  expect(remembered).toContain("marks");

  await page.getByRole("button", { name: /偏离/ }).click();
  await expect(page.locator("[data-testid='artwork-shell']")).toHaveAttribute("data-act", "drift");
  await page.keyboard.press("3");
  await expect(page.locator("[data-testid='artwork-shell']")).toHaveAttribute("data-act", "leave");

  await page.reload({ waitUntil: "networkidle" });
  await expect(page.getByTestId("trace-count")).not.toHaveText("000");

  await page.screenshot({
    path: path.join(evidenceDirectory, "desktop-field.png"),
    animations: "disabled",
  });

  expect(problems.consoleErrors).toEqual([]);
  expect(problems.pageErrors).toEqual([]);
  expect(problems.failedRequests).toEqual([]);
  expect(problems.remoteRequests).toEqual([]);
});

test("the local work explains itself, exports a substantial image, and stays within the viewport", async ({ page }) => {
  const problems = collectProblems(page);
  await page.goto("/", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "进入这三小时" }).click();
  await page.getByTestId("time-field").click({ position: { x: 720, y: 430 } });

  await page.keyboard.press("l");
  await expect(page.getByRole("dialog", { name: "三小时创作记录" })).toBeVisible();
  await expect(page.getByText("2026 年 8 月 20 日 19:32:52")).toBeVisible();
  await expect(page.getByText("03:15:27")).toBeVisible();
  await expect(page.getByText("完成 · 含验收")).toBeVisible();
  await page.keyboard.press("Escape");

  const downloadPromise = page.waitForEvent("download");
  await page.keyboard.press("e");
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^after-three-hours-[a-z0-9-]+\.png$/);
  const exportPath = path.join(evidenceDirectory, "after-three-hours-export.png");
  await download.saveAs(exportPath);
  expect(statSync(exportPath).size).toBeGreaterThan(30_000);

  const widths = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    document: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
  }));
  expect(widths.document).toBeLessThanOrEqual(widths.viewport + 1);
  expect(widths.body).toBeLessThanOrEqual(widths.viewport + 1);

  expect(problems.consoleErrors).toEqual([]);
  expect(problems.pageErrors).toEqual([]);
  expect(problems.failedRequests).toEqual([]);
  expect(problems.remoteRequests).toEqual([]);
});

test("narrow, keyboard, reduced-motion, and WCAG essentials remain usable", async ({ page }) => {
  const problems = collectProblems(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "networkidle" });

  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "进入这三小时" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("[data-testid='artwork-shell']")).toHaveAttribute("data-reduced-motion", "true");
  await expect(page.getByRole("button", { name: /创作记录/ })).toBeVisible();
  await page.getByRole("button", { name: /创作记录/ }).click();
  await expect(page.getByRole("dialog", { name: "三小时创作记录" })).toBeVisible();
  await page.keyboard.press("Escape");
  await page.keyboard.press("2");
  await expect(page.getByRole("button", { name: /偏离/ })).toHaveAttribute("aria-pressed", "true");

  const accessibility = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  const consequential = accessibility.violations.filter((violation) =>
    ["serious", "critical"].includes(violation.impact ?? ""),
  );
  expect(consequential).toEqual([]);

  const widths = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    document: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
  }));
  expect(widths.document).toBeLessThanOrEqual(widths.viewport + 1);
  expect(widths.body).toBeLessThanOrEqual(widths.viewport + 1);

  await page.screenshot({
    path: path.join(evidenceDirectory, "narrow-reduced-motion.png"),
    animations: "disabled",
  });

  expect(problems.consoleErrors).toEqual([]);
  expect(problems.pageErrors).toEqual([]);
  expect(problems.failedRequests).toEqual([]);
  expect(problems.remoteRequests).toEqual([]);
});
