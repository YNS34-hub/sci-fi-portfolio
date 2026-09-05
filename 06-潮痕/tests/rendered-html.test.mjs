import assert from "node:assert/strict";
import { access, readFile, stat } from "node:fs/promises";
import test from "node:test";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const templateRoot = new URL("../", import.meta.url);

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("https://waterline.example/", {
      headers: {
        accept: "text/html",
        host: "waterline.example",
        "x-forwarded-host": "waterline.example",
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

test("server-renders the complete Waterline archive", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>潮痕 · THE WATERLINE<\/title>/i);
  assert.match(html, /一部被潮水打捞的六章电影档案/);
  assert.match(html, /WL-01\/06/);
  assert.match(html, /WL-06\/06/);
  assert.match(html, /WL-E01/);
  assert.match(html, /WL-E06/);
  assert.match(html, /档案没有说话，材料替它作证/);
  assert.match(html, /馆藏出库单/);
  assert.match(html, /waterline-stills\.zip/);
  assert.match(html, /waterline-evidence\.zip/);
  assert.match(html, /waterline-poster\.jpg/);
  assert.match(
    html,
    /property="og:image" content="https:\/\/waterline\.example\/og\.png"/,
  );
  assert.doesNotMatch(html, /Your site is taking shape|Building your site/);
});

test("ships every cinematic image and download asset at the promised format", async () => {
  const frameNames = [
    "chapter-01-low-water.webp",
    "chapter-02-empty-place.webp",
    "chapter-03-dry-vessel.webp",
    "chapter-04-ingress.webp",
    "chapter-05-diversion.webp",
    "chapter-06-waterline.webp",
  ];
  const evidenceNames = [
    "evidence-01-seal.webp",
    "evidence-02-vacant-chair.webp",
    "evidence-03-dry-ring.webp",
    "evidence-04-inside-cabinet.webp",
    "evidence-05-wedge.webp",
    "evidence-06-unclaimed.webp",
  ];

  for (const frameName of [...frameNames, ...evidenceNames]) {
    const frame = new URL(`../public/art/${frameName}`, import.meta.url);
    await access(frame);
    const metadata = await sharp(fileURLToPath(frame)).metadata();
    assert.equal(metadata.width, 1911);
    assert.equal(metadata.height, 819);
  }

  const poster = new URL("../public/downloads/waterline-poster.jpg", import.meta.url);
  const social = new URL("../public/og.png", import.meta.url);
  const posterMetadata = await sharp(fileURLToPath(poster)).metadata();
  const socialMetadata = await sharp(fileURLToPath(social)).metadata();
  assert.deepEqual(
    [posterMetadata.width, posterMetadata.height],
    [1800, 2400],
  );
  assert.deepEqual(
    [socialMetadata.width, socialMetadata.height],
    [1200, 630],
  );

  for (const assetPath of [
    "../public/downloads/production-bible.md",
    "../public/downloads/evidence-atlas.md",
    "../public/downloads/waterline-stills.zip",
    "../public/downloads/waterline-evidence.zip",
    "../public/downloads/waterline-poster.jpg",
    "../public/favicon.png",
  ]) {
    const asset = new URL(assetPath, import.meta.url);
    const details = await stat(asset);
    assert.ok(details.size > 0, `${assetPath} must not be empty`);
  }

  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(page, /_sites-preview|SkeletonPreview/);
  await access(new URL(".openai/hosting.json", templateRoot));
});
