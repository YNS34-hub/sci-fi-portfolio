import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium } from "@playwright/test";

const browserPath =
  process.env.PLAYWRIGHT_CHROMIUM_PATH ??
  "D:/AI/CodexTools/playwright-browsers/chromium-1228/chrome-win64/chrome.exe";
const resolutions = {
  "desktop-1920": { width: 1920, height: 1080 },
  "desktop-2560": { width: 2560, height: 1440 },
  "desktop-3840": { width: 3840, height: 2160 },
  "mobile-390": { width: 390, height: 844 },
};
const routes = [
  ["/", "gallery", ".gallery"],
  ["/site-01", "site-01", ".vanta"],
  ["/site-02", "site-02", ".grammar"],
  ["/site-03", "site-03", ".tearline"],
  ["/site-04", "site-04", ".pale"],
];
const selected = process.argv[2];
const mode = process.argv[3] ?? "all";
const onlySlug = process.argv[4];

if (!(selected in resolutions)) {
  throw new Error(
    `Pass one of: ${Object.keys(resolutions).join(", ")}. Received: ${selected ?? "nothing"}`,
  );
}

const baseURL = "http://127.0.0.1:4173";
const viewport = resolutions[selected];
const qaDirectory = path.resolve("work", "qa", selected);
await mkdir(qaDirectory, { recursive: true });

const browser = await chromium.launch({
  executablePath: browserPath,
  headless: true,
});
const context = await browser.newContext({
  colorScheme: "dark",
  reducedMotion: "no-preference",
  viewport,
});

try {
  if (mode !== "interactions") {
    for (const [route, slug, landmark] of routes.filter(
      ([, slug]) => !onlySlug || slug === onlySlug,
    )) {
    const page = await context.newPage();
    const errors = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("pageerror", (error) => errors.push(error.message));

    await page.goto(`${baseURL}${route}`, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(slug === "site-02" ? 5000 : 900);

    assert.equal(await page.locator(landmark).isVisible(), true, `${slug} landmark`);
    const metrics = await page.evaluate(() => ({
      canvas: [...document.querySelectorAll("canvas")].map((canvas) => {
        const rect = canvas.getBoundingClientRect();
        return [Math.round(rect.width), Math.round(rect.height)];
      }),
      innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    assert.ok(
      metrics.scrollWidth <= metrics.innerWidth,
      `${slug} overflows: ${metrics.scrollWidth} > ${metrics.innerWidth}`,
    );
    assert.equal(errors.length, 0, `${slug} console errors:\n${errors.join("\n")}`);
    if (selected === "mobile-390" && ["site-01", "site-04"].includes(slug)) {
      assert.equal(metrics.canvas.length, 0, `${slug} should use its static mobile fallback`);
      assert.equal(
        await page.locator(slug === "site-01" ? ".meridian-fallback" : ".fossil-fallback").isVisible(),
        true,
        `${slug} mobile fallback`,
      );
    }

    await page.screenshot({
      animations: "disabled",
      fullPage: false,
      path: path.join(qaDirectory, `${slug}.png`),
    });
    console.log(
      `PASS ${selected} ${slug} ${viewport.width}x${viewport.height} canvases=${JSON.stringify(metrics.canvas)}`,
    );
      await page.close();
    }
  }

  if (selected === "desktop-1920" && mode !== "visual") {
    const vanta = await context.newPage();
    await vanta.goto(`${baseURL}/site-01`, { waitUntil: "networkidle" });
    const firstMaterial = vanta.locator(".vanta-materials figure").first();
    await vanta.locator(".vanta-materials").scrollIntoViewIfNeeded();
    await vanta.waitForTimeout(3500);
    const materialOpacity = Number(
      await firstMaterial.evaluate((element) => getComputedStyle(element).opacity),
    );
    assert.ok(materialOpacity > 0.98, `material reveal opacity remained ${materialOpacity}`);
    console.log("PASS interaction vanta GSAP material reveal");
    await vanta.close();

    const grammar = await context.newPage();
    await grammar.goto(`${baseURL}/site-02`, { waitUntil: "networkidle" });
    await grammar.getByRole("textbox", { name: "Type a word" }).fill("WIND");
    await grammar.getByRole("button", { name: "Form" }).click();
    await grammar.waitForTimeout(800);
    await grammar.getByRole("button", { name: /Shear/ }).click();
    assert.equal(
      await grammar.getByRole("button", { name: /Shear/ }).getAttribute("aria-pressed"),
      "true",
    );
    await grammar.waitForFunction(
      () => document.querySelector(".grammar-header p")?.textContent?.includes("WIND"),
      null,
      { timeout: 5_000 },
    );
    assert.match(await grammar.locator(".grammar-header p").innerText(), /WIND.*pressure front/i);
    await grammar.getByRole("button", { name: "Return" }).click();
    assert.equal(
      (await grammar.locator(".grammar-history li[data-active='true'] strong").innerText()).trim(),
      "RETURN",
    );
    console.log("PASS interaction grammar form/shear/return");
    await grammar.close();

    const tear = await context.newPage();
    await tear.goto(`${baseURL}/site-03`, { waitUntil: "networkidle" });
    const issue = tear.locator(".tear-issue");
    await issue.hover({ position: { x: 900, y: 500 } });
    await tear.mouse.wheel(0, 320);
    await tear.waitForTimeout(650);
    assert.match(await tear.locator(".tear-header p").innerText(), /Afterimage/i);
    const handle = tear.getByRole("button", { name: /Drag the tear/ });
    const handleBox = await handle.boundingBox();
    assert.ok(handleBox, "tear handle has no bounding box");
    const tearBefore = Number(
      await issue.evaluate((element) =>
        getComputedStyle(element).getPropertyValue("--tear"),
      ),
    );
    await tear.mouse.move(
      handleBox.x + handleBox.width / 2,
      handleBox.y + handleBox.height / 2,
    );
    await tear.mouse.down();
    await tear.mouse.move(handleBox.x - 320, handleBox.y + handleBox.height / 2, {
      steps: 14,
    });
    const fiberWidthWhileDragging = Number.parseFloat(
      await tear.locator(".tear-fiber").evaluate((element) => getComputedStyle(element).width),
    );
    assert.ok(fiberWidthWhileDragging > 22, "tear tension did not widen the fiber");
    assert.equal(await tear.locator(".tearline").getAttribute("data-dragging"), "true");
    await tear.screenshot({
      animations: "disabled",
      fullPage: false,
      path: path.join(qaDirectory, "site-03-tension.png"),
    });
    await tear.mouse.up();
    const tearAfter = Number(
      await issue.evaluate((element) =>
        getComputedStyle(element).getPropertyValue("--tear"),
      ),
    );
    assert.ok(Math.abs(tearAfter - tearBefore) > 8, "tear handle did not move");
    console.log(`PASS interaction tear wheel/drag ${tearBefore.toFixed(1)}→${tearAfter.toFixed(1)}`);
    await tear.close();

    const pale = await context.newPage();
    await pale.goto(`${baseURL}/site-04`, { waitUntil: "networkidle" });
    const fossil = pale.locator(".fossil-scene canvas");
    await pale.screenshot({
      animations: "disabled",
      fullPage: false,
      path: path.join(qaDirectory, "site-04-threshold.png"),
    });
    await fossil.hover({ position: { x: 600, y: 450 } });
    await pale.mouse.wheel(0, 340);
    await pale.waitForTimeout(650);
    assert.equal((await pale.locator(".pale-observation h1").innerText()).trim(), "VEIN");
    await pale.screenshot({
      animations: "disabled",
      fullPage: false,
      path: path.join(qaDirectory, "site-04-vein.png"),
    });
    await pale.mouse.wheel(0, 340);
    await pale.waitForTimeout(650);
    assert.equal((await pale.locator(".pale-observation h1").innerText()).trim(), "CHOIR");
    await pale.screenshot({
      animations: "disabled",
      fullPage: false,
      path: path.join(qaDirectory, "site-04-choir.png"),
    });
    const fossilBox = await fossil.boundingBox();
    assert.ok(fossilBox, "fossil canvas has no bounding box");
    await pale.mouse.move(
      fossilBox.x + fossilBox.width * 0.48,
      fossilBox.y + fossilBox.height * 0.54,
    );
    await pale.mouse.down();
    await pale.mouse.move(
      fossilBox.x + fossilBox.width * 0.7,
      fossilBox.y + fossilBox.height * 0.4,
      { steps: 16 },
    );
    const response = (
      await pale.locator(".pale-observation dl div").nth(1).locator("dd").innerText()
    ).trim();
    assert.match(response, /Present|Rising/i, `fossil resonance remained ${response}`);
    assert.equal(await pale.locator(".fossil-scene").getAttribute("data-probing"), "true");
    await pale.mouse.up();
    console.log(`PASS interaction pale wheel/drag resonance=${response}`);
    await pale.close();
  }
} finally {
  await context.close();
  await browser.close();
}
