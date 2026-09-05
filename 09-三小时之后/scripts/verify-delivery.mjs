import { chromium } from "@playwright/test";
import { mkdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

const url = process.env.AFTER_THREE_HOURS_URL || "http://127.0.0.1:4411/";
const artifactsRoot = path.resolve("artifacts");
const evidenceRoot = path.join(artifactsRoot, "evidence");
mkdirSync(evidenceRoot, { recursive: true });

const browser = await chromium.launch({ channel: "msedge", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, locale: "zh-CN" });
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
  const hostname = new URL(request.url()).hostname;
  if (!['127.0.0.1', 'localhost'].includes(hostname)) remoteRequests.push(request.url());
});

const response = await page.goto(url, { waitUntil: "networkidle" });
if (!response || response.status() !== 200) throw new Error(`delivery returned ${response?.status() ?? "no response"}`);
if (!(await page.title()).includes("三小时之后")) throw new Error("delivery title mismatch");

await page.getByRole("button", { name: "进入这三小时" }).click();
const canvas = page.getByTestId("time-field");
const box = await canvas.boundingBox();
if (!box) throw new Error("time field is not visible");
await page.mouse.move(box.x + box.width * 0.36, box.y + box.height * 0.48);
await page.mouse.down();
for (let step = 0; step < 10; step += 1) {
  await page.mouse.move(box.x + box.width * (0.36 + step * 0.018), box.y + box.height * (0.48 + Math.sin(step) * 0.025));
}
await page.mouse.up();

const traceCount = await page.getByTestId("trace-count").textContent();
if (!traceCount || traceCount === "000") throw new Error("delivered gesture was not recorded");
await page.getByRole("button", { name: /留下/ }).click();
if ((await page.getByTestId("artwork-shell").getAttribute("data-act")) !== "leave") {
  throw new Error("delivered act control did not change state");
}

await page.getByRole("button", { name: /创作记录/ }).click();
if (!(await page.getByRole("dialog", { name: "三小时创作记录" }).isVisible())) {
  throw new Error("delivered creation ledger did not open");
}
if (!(await page.getByText("03:15:27").isVisible())) throw new Error("recorded creation duration is missing");
await page.keyboard.press("Escape");

const downloadPromise = page.waitForEvent("download");
await page.getByRole("button", { name: /保存这一刻/ }).click();
const download = await downloadPromise;
const downloadPath = path.join(artifactsRoot, "delivery-runtime-export.png");
await download.saveAs(downloadPath);
const exportBytes = statSync(downloadPath).size;
if (exportBytes < 30_000) throw new Error(`delivered export is too small: ${exportBytes}`);

await page.screenshot({ path: path.join(evidenceRoot, "delivered-runtime.png"), animations: "disabled" });
const layout = await page.evaluate(() => ({
  viewport: document.documentElement.clientWidth,
  document: document.documentElement.scrollWidth,
  body: document.body.scrollWidth,
}));
if (layout.document > layout.viewport + 1 || layout.body > layout.viewport + 1) {
  throw new Error(`delivered layout overflow: ${JSON.stringify(layout)}`);
}
if (consoleErrors.length || pageErrors.length || failedRequests.length || remoteRequests.length) {
  throw new Error(JSON.stringify({ consoleErrors, pageErrors, failedRequests, remoteRequests }));
}

const result = {
  verifiedAt: new Date().toISOString(),
  url,
  status: response.status(),
  title: await page.title(),
  traceCount,
  act: "leave",
  exportBytes,
  layout,
  consoleErrors,
  pageErrors,
  failedRequests,
  remoteRequests,
};
writeFileSync(path.join(artifactsRoot, "delivery-runtime.json"), `${JSON.stringify(result, null, 2)}\n`, "utf8");
await browser.close();
console.log(`delivered runtime verified: ${url}, traces=${traceCount}, export=${exportBytes} bytes, errors=0`);
