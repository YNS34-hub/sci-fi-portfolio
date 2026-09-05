import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("https://afterglow.example/", {
      headers: {
        accept: "text/html",
        host: "afterglow.example",
        "x-forwarded-host": "afterglow.example",
        "x-forwarded-proto": "https",
      },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the complete afterglow experience", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<html lang="zh-CN">/);
  assert.match(html, /<title>余光协议 \| 互动科幻作品<\/title>/);
  assert.match(
    html,
    /<meta property="og:image" content="https:\/\/afterglow\.example\/og\.png"\/>/,
  );
  assert.match(html, /你愿意保留痛苦吗？/);
  assert.match(html, /留下一句不愿被优化掉的话/);
  assert.match(html, /作品内虚构证言/);
  assert.match(html, /data-direction-contract="6ec365a4"/);
  assert.match(html, /\/film\/shot-01-order\.webp/);
  assert.match(html, /\/film\/shot-02-threshold\.webp/);
  assert.match(html, /\/film\/shot-03-witness\.webp/);
  assert.doesNotMatch(html, /Your site is taking shape|react-loading-skeleton/);
});

test("ships the documented assets and accessibility constraints", async () => {
  const [
    experience,
    css,
    layout,
    product,
    design,
    packageJson,
    filmFiles,
    ogImage,
    favicon,
  ] = await Promise.all([
    readFile(
      new URL("../app/AfterglowExperience.tsx", import.meta.url),
      "utf8",
    ),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../PRODUCT.md", import.meta.url), "utf8"),
    readFile(new URL("../DESIGN.md", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readdir(new URL("../public/film/", import.meta.url)),
    readFile(new URL("../public/og.png", import.meta.url)),
    readFile(new URL("../public/favicon.svg", import.meta.url), "utf8"),
  ]);

  assert.match(layout, /generateMetadata/);
  assert.match(layout, /x-forwarded-host/);
  assert.match(layout, /summary_large_image/);
  assert.match(layout, /seed key 6ec365a4/);
  assert.match(experience, /htmlFor="memory-calibration"/);
  assert.match(experience, /navigator\.clipboard\.writeText/);
  assert.match(experience, /只存在于当前页面，不会上传/);
  assert.match(experience, /作品内虚构证言/g);
  assert.doesNotMatch(experience, /next\/image/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /min-width:\s*320px/);
  assert.match(product, /No login, external data, persistence/);
  assert.match(design, /Creative North Star: "公共余晖观测站"/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);

  for (const asset of [
    "shot-01-order.webp",
    "shot-02-threshold.webp",
    "shot-03-witness.webp",
    "afterglow-triptych.webp",
  ]) {
    assert.ok(filmFiles.includes(asset), `missing film asset: ${asset}`);
  }

  assert.equal(ogImage.readUInt32BE(16), 1200);
  assert.equal(ogImage.readUInt32BE(20), 630);
  assert.match(favicon, /#d66d2f/);
  assert.match(favicon, /<circle/);

  assert.deepEqual(
    await readdir(new URL("../app/_sites-preview", import.meta.url)),
    [],
  );
});
